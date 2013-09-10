namespace BundleTransformer.CleanCss.Cleaners
{
	using System;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// CSS-cleaner
	/// </summary>
	internal sealed class CssCleaner : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a Clean-css library
		/// </summary>
		const string CLEAN_CSS_LIBRARY_RESOURCE_NAME
			= "BundleTransformer.CleanCss.Resources.clean-css-combined.min.js";

		/// <summary>
		/// Name of resource, which contains a Clean-css-minifier helper
		/// </summary>
		const string CLEAN_CSS_HELPER_RESOURCE_NAME = "BundleTransformer.CleanCss.Resources.cleanCssHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for cleaning
		/// </summary>
		const string CLEANING_FUNCTION_CALL_TEMPLATE = @"cleanCssHelper.minify({0}, {1});";

		/// <summary>
		/// String representation of the default cleaning options
		/// </summary>
		private readonly string _defaultOptionsString;

		/// <summary>
		/// JS engine
		/// </summary>
		private readonly IJsEngine _jsEngine;

		/// <summary>
		/// Synchronizer of cleaning
		/// </summary>
		private readonly object _cleaningSynchronizer = new object();

		/// <summary>
		/// Flag that CSS-cleaner is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of CSS-cleaner
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		public CssCleaner(Func<IJsEngine> createJsEngineInstance)
			: this(createJsEngineInstance, null)
		{ }

		/// <summary>
		/// Constructs instance of CSS-cleaner
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="defaultOptions">Default cleaning options</param>
		public CssCleaner(Func<IJsEngine> createJsEngineInstance, CleaningOptions defaultOptions)
		{
			_jsEngine = createJsEngineInstance();
			_defaultOptionsString = (defaultOptions != null) ?
				ConvertCleaningOptionsToJson(defaultOptions).ToString() : "null";
		}


		/// <summary>
		/// Initializes CSS-cleaner
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				Type type = GetType();

				_jsEngine.ExecuteResource(CLEAN_CSS_LIBRARY_RESOURCE_NAME, type);
				_jsEngine.ExecuteResource(CLEAN_CSS_HELPER_RESOURCE_NAME, type);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Cleans" CSS-code by using Clean-css
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="options">Cleaning options</param>
		/// <returns>Minified text content of CSS-asset</returns>
		public string Clean(string content, CleaningOptions options = null)
		{
			string newContent;
			string currentOptionsString;

			currentOptionsString = (options != null) ?
				ConvertCleaningOptionsToJson(options).ToString() : _defaultOptionsString;

			lock (_cleaningSynchronizer)
			{
				Initialize();
				
				try
				{
					newContent = _jsEngine.Evaluate<string>(
						string.Format(CLEANING_FUNCTION_CALL_TEMPLATE,
							JsonConvert.SerializeObject(content), currentOptionsString));
				}
				catch (JsRuntimeException e)
				{
					throw new CssCleaningException(JsRuntimeErrorHelpers.Format(e));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Converts a cleaning options to JSON
		/// </summary>
		/// <param name="options">Cleaning options</param>
		/// <returns>Cleaning options in JSON format</returns>
		private static JObject ConvertCleaningOptionsToJson(CleaningOptions options)
		{
			var optionsJson = new JObject(
				new JProperty("keepSpecialComments", 
					ConvertSpecialCommentsModeEnumValueToCode(options.KeepSpecialComments)),
				new JProperty("keepBreaks", options.KeepBreaks),
				new JProperty("removeEmpty", options.RemoveEmpty)
			);

			return optionsJson;
		}

		/// <summary>
		/// Converts a special comments mode enum value to the code
		/// </summary>
		/// <param name="specialCommentsMode">Special comments mode enum value</param>
		/// <returns>Special comments mode code</returns>
		private static object ConvertSpecialCommentsModeEnumValueToCode(SpecialCommentsMode specialCommentsMode)
		{
			object code;

			switch (specialCommentsMode)
			{
				case SpecialCommentsMode.KeepAll:
					code = "*";
					break;
				case SpecialCommentsMode.KeepFirstOne:
					code = 1;
					break;
				case SpecialCommentsMode.RemoveAll:
					code = 0;
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						specialCommentsMode.ToString(), typeof(SpecialCommentsMode)));
			}

			return code;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public void Dispose()
		{
			if (!_disposed)
			{
				_disposed = true;

				if (_jsEngine != null)
				{
					_jsEngine.Dispose();
				}
			}
		}
	}
}