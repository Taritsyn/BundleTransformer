namespace BundleTransformer.CleanCss.Cleaners
{
	using System;
	using System.Text;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using Core;
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
		/// Default cleaning options
		/// </summary>
		private readonly CleaningOptions _defaultOptions;

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
			_defaultOptions = defaultOptions;
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
		/// <param name="path">Path to CSS-file</param>
		/// <param name="options">Cleaning options</param>
		/// <returns>Minified text content of CSS-asset</returns>
		public string Clean(string content, string path, CleaningOptions options = null)
		{
			string newContent;
			CleaningOptions currentOptions;
			string currentOptionsString;

			if (options != null)
			{
				currentOptions = options;
				currentOptionsString = ConvertCleaningOptionsToJson(options).ToString();
			}
			else
			{
				currentOptions = _defaultOptions;
				currentOptionsString = _defaultOptionsString;
			}

			lock (_cleaningSynchronizer)
			{
				Initialize();
				
				try
				{
					var result = _jsEngine.Evaluate<string>(
						string.Format(CLEANING_FUNCTION_CALL_TEMPLATE,
							JsonConvert.SerializeObject(content), currentOptionsString));

					var json = JObject.Parse(result);

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new CssCleaningException(FormatErrorDetails(errors[0].Value<string>(), true, 
							path));
					}

					if (currentOptions.Severity > 0)
					{
						var warnings = json["warnings"] != null ? json["warnings"] as JArray : null;
						if (warnings != null && warnings.Count > 0)
						{
							throw new CssCleaningException(FormatErrorDetails(warnings[0].Value<string>(), 
								false, path));
						}
					}

					newContent = json.Value<string>("minifiedCode");
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
				new JProperty("noAdvanced", options.NoAdvanced),
				new JProperty("compatibility", ConvertCompatibilityModeEnumValueToCode(options.Compatibility))
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
		/// Converts a compatibility mode enum value to the code
		/// </summary>
		/// <param name="compatibilityMode">Compatibility mode enum value</param>
		/// <returns>Compatibility mode code</returns>
		private static string ConvertCompatibilityModeEnumValueToCode(CompatibilityMode compatibilityMode)
		{
			string code;

			switch (compatibilityMode)
			{
				case CompatibilityMode.None:
					code = string.Empty;
					break;
				case CompatibilityMode.Ie8:
					code = "ie8";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						compatibilityMode.ToString(), typeof(CompatibilityMode)));
			}

			return code;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="message">Message</param>
		/// <param name="isError">Flag indicating that this issue is a error</param>
		/// <param name="currentFilePath">Path to current CSS-file</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(string message, bool isError, string currentFilePath)
		{
			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorType,
				isError ? CoreStrings.ErrorType_Error : CoreStrings.ErrorType_Warning);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			if (!string.IsNullOrWhiteSpace(currentFilePath))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, currentFilePath);
			}

			return errorMessage.ToString();
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