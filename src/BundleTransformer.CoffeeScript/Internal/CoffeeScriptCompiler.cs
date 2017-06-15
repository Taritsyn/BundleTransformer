using System;
using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Core.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.CoffeeScript.Internal
{
	/// <summary>
	/// CoffeeScript compiler
	/// </summary>
	internal sealed class CoffeeScriptCompiler : IDisposable
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.CoffeeScript.Resources";

		/// <summary>
		/// Name of file, which contains a CoffeeScript library
		/// </summary>
		private const string COFFEESCRIPT_LIBRARY_FILE_NAME = "coffeescript-combined.min.js";

		/// <summary>
		/// Name of file, which contains a CoffeeScript compiler helper
		/// </summary>
		private const string CSC_HELPER_FILE_NAME = "cscHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for compilation
		/// </summary>
		private const string COMPILATION_FUNCTION_CALL_TEMPLATE = @"coffeeScriptHelper.compile({0}, {1});";

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// Compilation options
		/// </summary>
		private readonly CompilationOptions _options;

		/// <summary>
		/// Regular expression for working with literal file extensions
		/// </summary>
		private static readonly Regex _literalFileExtensionRegex =
			new Regex(@"\.(litcoffee|coffee\.md)$", RegexOptions.IgnoreCase);

		/// <summary>
		/// Flag that compiler is initialized
		/// </summary>
		private InterlockedStatedFlag _initializedFlag = new InterlockedStatedFlag();

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private InterlockedStatedFlag _disposedFlag = new InterlockedStatedFlag();


		/// <summary>
		/// Constructs a instance of CoffeeScript compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="options">Compilation options</param>
		public CoffeeScriptCompiler(Func<IJsEngine> createJsEngineInstance, CompilationOptions options)
		{
			_jsEngine = createJsEngineInstance();
			_options = options ?? new CompilationOptions();
		}


		/// <summary>
		/// Initializes compiler
		/// </summary>
		private void Initialize()
		{
			if (_initializedFlag.Set())
			{
				Assembly assembly = GetType().Assembly;

				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + COFFEESCRIPT_LIBRARY_FILE_NAME, assembly);
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + CSC_HELPER_FILE_NAME, assembly);
			}
		}

		/// <summary>
		/// "Compiles" CoffeeScript code to JS code
		/// </summary>
		/// <param name="content">Text content written on CoffeeScript</param>
		/// <param name="path">Path to CoffeeScript file</param>
		/// <returns>Translated CoffeeScript code</returns>
		public string Compile(string content, string path)
		{
			Initialize();

			string newContent;
			string optionsString = ConvertCompilationOptionsToJson(path, _options).ToString();

			try
			{
				var result = _jsEngine.Evaluate<string>(
					string.Format(COMPILATION_FUNCTION_CALL_TEMPLATE,
						JsonConvert.SerializeObject(content),
						optionsString));
				var json = JObject.Parse(result);

				var errors = json["errors"] != null ? json["errors"] as JArray : null;
				if (errors != null && errors.Count > 0)
				{
					throw new CoffeeScriptCompilationException(FormatErrorDetails(errors[0], content, path));
				}

				newContent = json.Value<string>("compiledCode");
			}
			catch (JsRuntimeException e)
			{
				throw new CoffeeScriptCompilationException(JsErrorHelpers.Format(e));
			}

			return newContent;
		}

		/// <summary>
		/// Determines whether the file is "literate"
		/// </summary>
		/// <param name="path">Path to CoffeeScript file</param>
		/// <returns>true if the file is "literate"; otherwise, false</returns>
		private static bool IsLiterate(string path)
		{
			bool result = _literalFileExtensionRegex.IsMatch(path);

			return result;
		}

		/// <summary>
		/// Converts a compilation options to JSON
		/// </summary>
		/// <param name="path">Path to CoffeeScript file</param>
		/// <param name="options">Compilation options</param>
		/// <returns>Compilation options in JSON format</returns>
		private static JObject ConvertCompilationOptionsToJson(string path, CompilationOptions options)
		{
			var optionsJson = new JObject(
				new JProperty("bare", options.Bare),
				new JProperty("literate", IsLiterate(path))
			);

			return optionsJson;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current CoffeeScript file</param>
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