namespace BundleTransformer.Csso.Internal
{
	using System;
	using System.Globalization;
	using System.Reflection;
	using System.Text;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Csso;
	using CssoStrings = Resources.Strings;

	/// <summary>
	/// CSS-optimizer
	/// </summary>
	internal sealed class CssOptimizer : IDisposable
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.Csso.Resources";

		/// <summary>
		/// Name of file, which contains a Sergey Kryzhanovsky's CSSO-library
		/// </summary>
		private const string CSSO_LIBRARY_FILE_NAME = "csso-combined.min.js";

		/// <summary>
		/// Name of file, which contains a CSSO-minifier helper
		/// </summary>
		private const string CSSO_HELPER_FILE_NAME = "cssoHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for CSS-optimization
		/// </summary>
		private const string OPTIMIZATION_FUNCTION_CALL_TEMPLATE = @"cssoHelper.minify({0}, {1});";

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// String representation of the optimization options
		/// </summary>
		private readonly string _optionsString;

		/// <summary>
		/// Flag that optimizer is initialized
		/// </summary>
		private InterlockedStatedFlag _initializedFlag = new InterlockedStatedFlag();

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private InterlockedStatedFlag _disposedFlag = new InterlockedStatedFlag();


		/// <summary>
		/// Constructs a instance of CSS-optimizer
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="options">Optimization options</param>
		public CssOptimizer(Func<IJsEngine> createJsEngineInstance, OptimizationOptions options)
		{
			_jsEngine = createJsEngineInstance();
			_optionsString = ConvertOptimizationOptionsToJson(options ?? new OptimizationOptions()).ToString();
		}


		/// <summary>
		/// Initializes optimizer
		/// </summary>
		private void Initialize()
		{
			if (_initializedFlag.Set())
			{
				Assembly assembly = GetType().Assembly;

				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + CSSO_LIBRARY_FILE_NAME, assembly);
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + CSSO_HELPER_FILE_NAME, assembly);
			}
		}

		/// <summary>
		/// "Optimizes" a CSS-code by using Sergey Kryzhanovsky's CSSO
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="path">Path to CSS-file</param>
		/// <returns>Minified text content of CSS-asset</returns>
		public string Optimize(string content, string path)
		{
			Initialize();

			string newContent;

			try
			{
				var result = _jsEngine.Evaluate<string>(
					string.Format(OPTIMIZATION_FUNCTION_CALL_TEMPLATE,
						JsonConvert.SerializeObject(content),
						_optionsString));

				var json = JObject.Parse(result);

				var errors = json["errors"] != null ? json["errors"] as JArray : null;
				if (errors != null && errors.Count > 0)
				{
					throw new CssOptimizationException(FormatErrorDetails(errors[0], content, path));
				}

				newContent = json.Value<string>("minifiedCode");

			}
			catch (JsRuntimeException e)
			{
				throw new CssOptimizationException(JsErrorHelpers.Format(e));
			}

			return newContent;
		}

		/// <summary>
		/// Converts a optimization options to JSON
		/// </summary>
		/// <param name="options">Optimization options</param>
		/// <returns>Optimization options in JSON format</returns>
		private static JObject ConvertOptimizationOptionsToJson(OptimizationOptions options)
		{
			var optionsJson = new JObject(
				new JProperty("restructure", options.Restructure),
				new JProperty("comments", ConvertCommentsModeEnumValueToCode(options.Comments))
			);

			return optionsJson;
		}

		/// <summary>
		/// Converts a comments mode enum value to the code
		/// </summary>
		/// <param name="сommentsMode">Сomments mode enum value</param>
		/// <returns>Сomments mode code</returns>
		private static string ConvertCommentsModeEnumValueToCode(CommentsMode сommentsMode)
		{
			string code;

			switch (сommentsMode)
			{
				case CommentsMode.Exclamation:
					code = "exclamation";
					break;
				case CommentsMode.FirstExclamation:
					code = "first-exclamation";
					break;
				case CommentsMode.None:
					code = "none";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						сommentsMode.ToString(), typeof(CommentsMode)));
			}

			return code;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current CSS-file</param>
		/// <rereturns>Detailed error message</rereturns>
		private static string FormatErrorDetails(JToken errorDetails, string sourceCode, string currentFilePath)
		{
			var name = errorDetails.Value<string>("name");
			var message = errorDetails.Value<string>("message");
			string filePath = currentFilePath;
			var lineNumber = errorDetails.Value<int>("lineNumber");
			var columnNumber = errorDetails.Value<int>("columnNumber");
			string sourceFragment = SourceCodeNavigator.GetSourceFragment(sourceCode,
				new SourceCodeNodeCoordinates(lineNumber, columnNumber));

			var errorMessage = new StringBuilder();
			if (!string.IsNullOrWhiteSpace(name))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Name, name);
			}
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			if (!string.IsNullOrWhiteSpace(filePath))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, filePath);
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
			if (_disposedFlag.Set())
			{
				if (_jsEngine != null)
				{
					_jsEngine.Dispose();
					_jsEngine = null;
				}
			}
		}
	}
}