namespace BundleTransformer.Less.Compilers
{
	using System;
	using System.Globalization;
	using System.Linq;
	using System.Text;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using Core.Assets;
	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Resources;

	/// <summary>
	/// LESS-compiler
	/// </summary>
	internal sealed class LessCompiler : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a LESS-library
		/// </summary>
		private const string LESS_LIBRARY_RESOURCE_NAME = "BundleTransformer.Less.Resources.less-combined.min.js";

		/// <summary>
		/// Name of resource, which contains a LESS-compiler helper
		/// </summary>
		private const string LESSC_HELPER_RESOURCE_NAME = "BundleTransformer.Less.Resources.lesscHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for compilation
		/// </summary>
		private const string COMPILATION_FUNCTION_CALL_TEMPLATE = @"lessHelper.compile({0}, {1}, {2}, {3});";

		/// <summary>
		/// Default compilation options
		/// </summary>
		private readonly CompilationOptions _defaultOptions;

		/// <summary>
		/// String representation of the default compilation options
		/// </summary>
		private readonly string _defaultOptionsString;

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// Synchronizer of compilation
		/// </summary>
		private readonly object _compilationSynchronizer = new object();

		/// <summary>
		/// Flag that compiler is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of LESS-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		public LessCompiler(Func<IJsEngine> createJsEngineInstance)
			: this(createJsEngineInstance, null)
		{ }

		/// <summary>
		/// Constructs instance of LESS-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="defaultOptions">Default compilation options</param>
		public LessCompiler(Func<IJsEngine> createJsEngineInstance, CompilationOptions defaultOptions)
		{
			_jsEngine = createJsEngineInstance();
			_defaultOptions = defaultOptions ?? new CompilationOptions();
			_defaultOptionsString = (defaultOptions != null) ?
				ConvertCompilationOptionsToJson(defaultOptions).ToString() : "null";
		}


		/// <summary>
		/// Initializes compiler
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				Type type = GetType();

				_jsEngine.ExecuteResource(LESS_LIBRARY_RESOURCE_NAME, type);
				_jsEngine.ExecuteResource(LESSC_HELPER_RESOURCE_NAME, type);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" LESS-code to CSS-code
		/// </summary>
		/// <param name="content">Text content written on LESS</param>
		/// <param name="path">Path to LESS-file</param>
		/// <param name="dependencies">List of dependencies</param>
		/// <param name="options">Compilation options</param>
		/// <returns>Translated LESS-code</returns>
		public string Compile(string content, string path, DependencyCollection dependencies,
			CompilationOptions options = null)
		{
			string newContent;
			CompilationOptions currentOptions;
			string currentOptionsString;

			if (options != null)
			{
				currentOptions = options;
				currentOptionsString = ConvertCompilationOptionsToJson(options).ToString();
			}
			else
			{
				currentOptions = _defaultOptions;
				currentOptionsString = _defaultOptionsString;
			}

			string processedContent = content;
			string globalVariables = currentOptions.GlobalVariables;
			string modifyVariables = currentOptions.ModifyVariables;

			if (!string.IsNullOrWhiteSpace(globalVariables)
				|| !string.IsNullOrWhiteSpace(modifyVariables))
			{
				var contentBuilder = new StringBuilder();
				if (!string.IsNullOrWhiteSpace(globalVariables))
				{
					contentBuilder.Append(ParseVariables(globalVariables, "GlobalVariables"));
				}
				contentBuilder.Append(content);
				if (!string.IsNullOrWhiteSpace(modifyVariables))
				{
					contentBuilder.AppendLine();
					contentBuilder.Append(ParseVariables(modifyVariables, "ModifyVariables"));
				}

				processedContent = contentBuilder.ToString();
			}

			lock (_compilationSynchronizer)
			{
				Initialize();

				try
				{
					var result = _jsEngine.Evaluate<string>(string.Format(COMPILATION_FUNCTION_CALL_TEMPLATE,
						JsonConvert.SerializeObject(processedContent),
						JsonConvert.SerializeObject(path),
						ConvertDependenciesToJson(dependencies),
						currentOptionsString));
					var json = JObject.Parse(result);

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new LessCompilingException(FormatErrorDetails(errors[0], processedContent, path, 
							dependencies));
					}

					newContent = json.Value<string>("compiledCode");
				}
				catch (JsRuntimeException e)
				{
					throw new LessCompilingException(
						JsRuntimeErrorHelpers.Format(e));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Converts a list of dependencies to JSON
		/// </summary>
		/// <param name="dependencies">List of dependencies</param>
		/// <returns>List of dependencies in JSON format</returns>
		private static JArray ConvertDependenciesToJson(DependencyCollection dependencies)
		{
			var dependenciesJson = new JArray(
				dependencies.Select(d => new JObject(
					new JProperty("path", d.Url),
					new JProperty("content", d.Content))
				)
			);

			return dependenciesJson;
		}

		/// <summary>
		/// Converts a compilation options to JSON
		/// </summary>
		/// <param name="options">Compilation options</param>
		/// <returns>Compilation options in JSON format</returns>
		private static JObject ConvertCompilationOptionsToJson(CompilationOptions options)
		{
			var optionsJson = new JObject(
				new JProperty("compress", options.EnableNativeMinification),
				new JProperty("ieCompat", options.IeCompat),
				new JProperty("strictMath", options.StrictMath),
				new JProperty("strictUnits", options.StrictUnits),
				new JProperty("dumpLineNumbers", ConvertLineNumbersModeEnumValueToCode(options.DumpLineNumbers)),
				new JProperty("javascriptEnabled", options.JavascriptEnabled)
			);

			return optionsJson;
		}

		/// <summary>
		/// Converts a line numbers mode enum value to the code
		/// </summary>
		/// <param name="lineNumbersMode">Line numbers mode enum value</param>
		/// <returns>Line numbers mode code</returns>
		private static string ConvertLineNumbersModeEnumValueToCode(LineNumbersMode lineNumbersMode)
		{
			string code;

			switch (lineNumbersMode)
			{
				case LineNumbersMode.None:
					code = string.Empty;
					break;
				case LineNumbersMode.Comments:
					code = "comments";
					break;
				case LineNumbersMode.MediaQuery:
					code = "mediaquery";
					break;
				case LineNumbersMode.All:
					code = "all";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						lineNumbersMode.ToString(), typeof(LineNumbersMode)));
			}

			return code;
		}

		/// <summary>
		/// Parses a string representation of the variable list
		/// </summary>
		/// <param name="variablesString">String representation of the variable list</param>
		/// <param name="propertyName">Name of property</param>
		/// <returns>LESS representation of the variable list</returns>
		private static string ParseVariables(string variablesString, string propertyName)
		{
			string variables = string.Empty;
			var nameValueList = Utils.ConvertToStringCollection(variablesString, ';',
				trimItemValues: true, removeEmptyItems: true);

			if (nameValueList.Length > 0)
			{
				var variablesBuilder = new StringBuilder();

				foreach (string nameValue in nameValueList)
				{
					int equalSignPosition = nameValue.IndexOf("=", StringComparison.Ordinal);
					if (equalSignPosition == -1)
					{
						throw new FormatException(
							string.Format(Strings.VariablesParsing_InvalidNameValueFormat, 
								propertyName, variablesString));
					}

					string name = nameValue.Substring(0, equalSignPosition);
					string value = nameValue.Substring(equalSignPosition + 1);

					variablesBuilder.AppendFormatLine("@{0}: {1};", name, value);
				}

				variables = variablesBuilder.ToString();
			}

			return variables;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current LESS-file</param>
		/// <param name="dependencies">List of dependencies</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(JToken errorDetails, string sourceCode, string currentFilePath,
			DependencyCollection dependencies)
		{
			var type = errorDetails.Value<string>("type");
			var message = errorDetails.Value<string>("message");
			var filePath = errorDetails.Value<string>("fileName");
			if (string.IsNullOrWhiteSpace(filePath))
			{
				filePath = currentFilePath;
			}
			var lineNumber = errorDetails.Value<int>("lineNumber");
			var columnNumber = errorDetails.Value<int>("columnNumber");

			string newSourceCode = string.Empty;
			if (string.Equals(filePath, currentFilePath, StringComparison.OrdinalIgnoreCase))
			{
				newSourceCode = sourceCode;
			}
			else
			{
				var dependency = dependencies.GetByUrl(filePath);
				if (dependency != null)
				{
					newSourceCode = dependency.Content;
				}
			}

			string sourceFragment = SourceCodeNavigator.GetSourceFragment(newSourceCode,
				new SourceCodeNodeCoordinates(lineNumber, columnNumber));

			var errorMessage = new StringBuilder();
			if (!string.IsNullOrWhiteSpace(type))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorType, type);
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