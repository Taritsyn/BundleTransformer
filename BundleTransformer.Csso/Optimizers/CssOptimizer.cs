namespace BundleTransformer.Csso.Optimizers
{
	using System;
	using System.Globalization;
	using System.Text;
	using System.Text.RegularExpressions;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

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
		/// Regular expression for working with the string representation of error
		/// </summary>
		private static readonly Regex _errorStringRegex = new Regex(@" line #(?<lineNumber>\d+)$");

		/// <summary>
		/// Synchronizer of optimization
		/// </summary>
		private readonly object _optimizationSynchronizer = new object();

		/// <summary>
		/// Flag that optimizer is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs a instance of CSS-optimizer
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		public CssOptimizer(Func<IJsEngine> createJsEngineInstance)
		{
			_jsEngine = createJsEngineInstance();
		}


		/// <summary>
		/// Initializes optimizer
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				Type type = GetType();

				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + CSSO_LIBRARY_FILE_NAME, type);
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + CSSO_HELPER_FILE_NAME, type);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Optimizes" a CSS-code by using Sergey Kryzhanovsky's CSSO
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="path">Path to CSS-file</param>
		/// <param name="disableRestructuring">Flag for whether to disable structure minification</param>
		/// <returns>Minified text content of CSS-asset</returns>
		public string Optimize(string content, string path, bool disableRestructuring = false)
		{
			string newContent;

			lock (_optimizationSynchronizer)
			{
				Initialize();

				try
				{
					var result = _jsEngine.Evaluate<string>(
						string.Format(OPTIMIZATION_FUNCTION_CALL_TEMPLATE,
							JsonConvert.SerializeObject(content),
							JsonConvert.SerializeObject(disableRestructuring)));

					var json = JObject.Parse(result);

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new CssOptimizingException(FormatErrorDetails(errors[0].Value<string>(), content, path));
					}

					newContent = json.Value<string>("minifiedCode");

				}
				catch (JsRuntimeException e)
				{
					throw new CssOptimizingException(
						JsRuntimeErrorHelpers.Format(e));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">String representation of error</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current CSS-file</param>
		/// <rereturns>Detailed error message</rereturns>
		private static string FormatErrorDetails(string errorDetails, string sourceCode, string currentFilePath)
		{
			string errorMessage;

			Match errorStringMatch = _errorStringRegex.Match(errorDetails);
			if (errorStringMatch.Success)
			{
				string message = errorDetails;
				string file = currentFilePath;
				int lineNumber = int.Parse(errorStringMatch.Groups["lineNumber"].Value);
				int columnNumber = 0;
				string sourceFragment = SourceCodeNavigator.GetSourceFragment(sourceCode,
					new SourceCodeNodeCoordinates(lineNumber, columnNumber));

				var errorMessageBuilder = new StringBuilder();
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message,
					message);
				if (!string.IsNullOrWhiteSpace(file))
				{
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, file);
				}
				if (lineNumber > 0)
				{
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
						lineNumber.ToString(CultureInfo.InvariantCulture));
				}
				if (columnNumber > 0)
				{
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
						columnNumber.ToString(CultureInfo.InvariantCulture));
				}
				if (!string.IsNullOrWhiteSpace(sourceFragment))
				{
					errorMessageBuilder.AppendFormatLine("{1}:{0}{0}{2}", Environment.NewLine,
						CoreStrings.ErrorDetails_SourceError, sourceFragment);
				}

				errorMessage = errorMessageBuilder.ToString();
			}
			else
			{
				errorMessage = errorDetails;
			}

			return errorMessage;
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