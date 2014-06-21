namespace BundleTransformer.Autoprefixer.AutoPrefixers
{
	using System;
	using System.Globalization;
	using System.Text;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// CSS-autoprefixer
	/// </summary>
	internal sealed class CssAutoprefixer : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a Autoprefixer library
		/// </summary>
		const string AUTOPREFIXER_LIBRARY_RESOURCE_NAME
			= "BundleTransformer.Autoprefixer.Resources.autoprefixer-combined.min.js";

		/// <summary>
		/// Name of resource, which contains a Autoprefixer helper
		/// </summary>
		const string AUTOPREFIXER_HELPER_RESOURCE_NAME =
			"BundleTransformer.Autoprefixer.Resources.autoprefixerHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for autoprefixing
		/// </summary>
		const string AUTOPREFIXER_FUNCTION_CALL_TEMPLATE = @"autoprefixerHelper.process({0}, {1});";

		/// <summary>
		/// String representation of the default autoprefixing options
		/// </summary>
		private readonly string _defaultOptionsString;

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// Synchronizer of autoprefixing
		/// </summary>
		private readonly object _autoprefixingSynchronizer = new object();

		/// <summary>
		/// Flag that CSS-autoprefixer is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs a instance of CSS-autoprefixer
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		public CssAutoprefixer(Func<IJsEngine> createJsEngineInstance)
			: this(createJsEngineInstance, null)
		{ }

		/// <summary>
		/// Constructs a instance of CSS-autoprefixer
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="defaultOptions">Default autoprefixing options</param>
		public CssAutoprefixer(Func<IJsEngine> createJsEngineInstance, AutoprefixingOptions defaultOptions)
		{
			_jsEngine = createJsEngineInstance();
			_defaultOptionsString = (defaultOptions != null) ?
				ConvertAutoprefixingOptionsToJson(defaultOptions).ToString() : "null";
		}


		/// <summary>
		/// Initializes CSS-autoprefixer
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				Type type = GetType();

				_jsEngine.ExecuteResource(AUTOPREFIXER_LIBRARY_RESOURCE_NAME, type);
				_jsEngine.ExecuteResource(AUTOPREFIXER_HELPER_RESOURCE_NAME, type);

				_initialized = true;
			}
		}

		/// <summary>
		/// Actualizes a vendor prefixes in CSS-code by using Andrey Sitnik's Autoprefixer
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="path">Path to CSS-asset</param>
		/// <param name="options">Autoprefixing options</param>
		/// <returns>Processed text content of CSS-asset</returns>
		public string Process(string content, string path, AutoprefixingOptions options = null)
		{
			string newContent;
			string currentOptionsString;

			if (options != null)
			{
				currentOptionsString = ConvertAutoprefixingOptionsToJson(options).ToString();
			}
			else
			{
				currentOptionsString = _defaultOptionsString;
			}

			lock (_autoprefixingSynchronizer)
			{
				Initialize();

				try
				{
					var result = _jsEngine.Evaluate<string>(
						string.Format(AUTOPREFIXER_FUNCTION_CALL_TEMPLATE,
							JsonConvert.SerializeObject(content), currentOptionsString));

					var json = JObject.Parse(result);

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new CssAutoprefixingException(FormatErrorDetails(errors[0], content, path));
					}

					newContent = json.Value<string>("processedCode");
				}
				catch (JsRuntimeException e)
				{
					throw new CssAutoprefixingException(JsRuntimeErrorHelpers.Format(e));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Converts a autoprefixing options to JSON
		/// </summary>
		/// <param name="options">Autoprefixing options</param>
		/// <returns>Autoprefixing options in JSON format</returns>
		private static JObject ConvertAutoprefixingOptionsToJson(AutoprefixingOptions options)
		{
			var optionsJson = new JObject(
				new JProperty("browsers", new JArray(options.Browsers)),
				new JProperty("cascade", options.Cascade)
			);

			return optionsJson;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current CSS-file</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(JToken errorDetails, string sourceCode,
			string currentFilePath)
		{
			var message = errorDetails.Value<string>("message");
			string file = currentFilePath;
			var lineNumber = errorDetails.Value<int>("lineNumber");
			var columnNumber = errorDetails.Value<int>("columnNumber");
			string sourceFragment = SourceCodeNavigator.GetSourceFragment(sourceCode,
				new SourceCodeNodeCoordinates(lineNumber, columnNumber));

			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			if (!string.IsNullOrWhiteSpace(file))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, file);
			}
			if (lineNumber > 0)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
					lineNumber.ToString(CultureInfo.InvariantCulture));
			}
			if (columnNumber > 0)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
					columnNumber.ToString(CultureInfo.InvariantCulture));
			}
			if (!string.IsNullOrWhiteSpace(sourceFragment))
			{
				errorMessage.AppendFormatLine("{1}:{0}{0}{2}", Environment.NewLine,
					CoreStrings.ErrorDetails_SourceError, sourceFragment);
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
					_jsEngine = null;
				}
			}
		}
	}
}