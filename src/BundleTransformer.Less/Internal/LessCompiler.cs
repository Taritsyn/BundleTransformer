using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;

using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Core.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.Less.Resources;

namespace BundleTransformer.Less.Internal
{
	/// <summary>
	/// LESS compiler
	/// </summary>
	internal sealed class LessCompiler : IDisposable
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.Less.Resources";

		/// <summary>
		/// Name of file, which contains a LESS library
		/// </summary>
		private const string LESS_LIBRARY_FILE_NAME = "less-combined.min.js";

		/// <summary>
		/// Name of file, which contains a LESS compiler helper
		/// </summary>
		private const string LESSC_HELPER_FILE_NAME = "lesscHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for compilation
		/// </summary>
		private const string COMPILATION_FUNCTION_CALL_TEMPLATE = @"lessHelper.compile({0}, {1}, {2});";

		/// <summary>
		/// Name of variable, which contains a LESS environment
		/// </summary>
		private const string LESS_ENVIRONMENT_VARIABLE_NAME = "LessEnvironment";

		/// <summary>
		/// Name of variable, which contains a virtual file manager
		/// </summary>
		private const string VIRTUAL_FILE_MANAGER_VARIABLE_NAME = "VirtualFileManager";

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// Virtual file manager
		/// </summary>
		private VirtualFileManager _virtualFileManager;

		/// <summary>
		/// Compilation options
		/// </summary>
		private readonly CompilationOptions _options;

		/// <summary>
		/// String representation of the compilation options
		/// </summary>
		private readonly string _optionsString;

		/// <summary>
		/// Flag that compiler is initialized
		/// </summary>
		private InterlockedStatedFlag _initializedFlag = new InterlockedStatedFlag();

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private InterlockedStatedFlag _disposedFlag = new InterlockedStatedFlag();


		/// <summary>
		/// Constructs a instance of LESS compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="virtualFileManager">Virtual file manager</param>
		/// <param name="options">Compilation options</param>
		public LessCompiler(Func<IJsEngine> createJsEngineInstance,
			VirtualFileManager virtualFileManager,
			CompilationOptions options)
		{
			_jsEngine = createJsEngineInstance();
			_virtualFileManager = virtualFileManager;
			_options = options ?? new CompilationOptions();
			_optionsString = ConvertCompilationOptionsToJson(_options).ToString();
		}


		/// <summary>
		/// Initializes compiler
		/// </summary>
		private void Initialize()
		{
			if (_initializedFlag.Set())
			{
				_jsEngine.EmbedHostObject(LESS_ENVIRONMENT_VARIABLE_NAME, LessEnvironment.Instance);
				_jsEngine.EmbedHostObject(VIRTUAL_FILE_MANAGER_VARIABLE_NAME, _virtualFileManager);

				Assembly assembly = GetType().Assembly;

				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + LESS_LIBRARY_FILE_NAME, assembly);
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + LESSC_HELPER_FILE_NAME, assembly);
			}
		}

		/// <summary>
		/// "Compiles" a LESS code to CSS code
		/// </summary>
		/// <param name="content">Text content written on LESS</param>
		/// <param name="path">Path to LESS file</param>
		/// <returns>Compilation result</returns>
		public CompilationResult Compile(string content, string path)
		{
			Initialize();

			CompilationResult compilationResult;
			string processedContent = content;
			string globalVariables = _options.GlobalVariables;
			string modifyVariables = _options.ModifyVariables;

			if (!string.IsNullOrWhiteSpace(globalVariables)
				|| !string.IsNullOrWhiteSpace(modifyVariables))
			{
				StringBuilder contentBuilder = StringBuilderPool.GetBuilder();
				if (!string.IsNullOrWhiteSpace(globalVariables))
				{
					contentBuilder.AppendLine(ParseVariables(globalVariables, "GlobalVariables"));
				}
				contentBuilder.Append(content);
				if (!string.IsNullOrWhiteSpace(modifyVariables))
				{
					contentBuilder.AppendLine();
					contentBuilder.Append(ParseVariables(modifyVariables, "ModifyVariables"));
				}

				processedContent = contentBuilder.ToString();
				StringBuilderPool.ReleaseBuilder(contentBuilder);
			}

			try
			{
				var result = _jsEngine.Evaluate<string>(string.Format(COMPILATION_FUNCTION_CALL_TEMPLATE,
					JsonConvert.SerializeObject(processedContent),
					JsonConvert.SerializeObject(path),
					_optionsString));
				var json = JObject.Parse(result);

				var errors = json["errors"] != null ? json["errors"] as JArray : null;
				if (errors != null && errors.Count > 0)
				{
					throw new LessCompilationException(FormatErrorDetails(errors[0], processedContent, path));
				}

				if (_options.Severity > 0)
				{
					var warnings = json["warnings"] != null ? json["warnings"] as JArray : null;
					if (warnings != null && warnings.Count > 0)
					{
						throw new LessCompilationException(FormatWarningList(warnings));
					}
				}

				compilationResult = new CompilationResult
				{
					CompiledContent = json.Value<string>("compiledCode"),
					IncludedFilePaths = json.Value<JArray>("includedFilePaths")
						.ToObject<IList<string>>()
						.Distinct(StringComparer.OrdinalIgnoreCase)
						.ToList()
				};
			}
			catch (JsRuntimeException e)
			{
				throw new LessCompilationException(JsErrorHelpers.Format(e));
			}

			return compilationResult;
		}

		/// <summary>
		/// Converts a compilation options to JSON
		/// </summary>
		/// <param name="options">Compilation options</param>
		/// <returns>Compilation options in JSON format</returns>
		private JObject ConvertCompilationOptionsToJson(CompilationOptions options)
		{
			IList<string> processedIncludePaths = options.IncludePaths
				.Select(p => _virtualFileManager.ToAbsolutePath(p))
				.ToList()
				;

			var optionsJson = new JObject(
				new JProperty("compress", options.EnableNativeMinification),
				new JProperty("paths", new JArray(processedIncludePaths)),
				new JProperty("ieCompat", options.IeCompat),
				new JProperty("math", (int)options.Math),
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
				StringBuilder variablesBuilder = StringBuilderPool.GetBuilder();

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

					if (!name.StartsWith("@"))
					{
						variablesBuilder.Append("@");
					}

					variablesBuilder.Append(name);
					variablesBuilder.Append(": ");
					variablesBuilder.Append(value);

					if (!value.EndsWith(";"))
					{
						variablesBuilder.Append(";");
					}
				}

				variables = variablesBuilder.ToString();
				StringBuilderPool.ReleaseBuilder(variablesBuilder);
			}

			return variables;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current LESS file</param>
		/// <returns>Detailed error message</returns>
		private string FormatErrorDetails(JToken errorDetails, string sourceCode, string currentFilePath)
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

			string newSourceCode;
			if (string.Equals(filePath, currentFilePath, StringComparison.OrdinalIgnoreCase))
			{
				newSourceCode = sourceCode;
			}
			else
			{
				newSourceCode = _virtualFileManager.ReadTextFile(filePath);
			}

			string sourceFragment = SourceCodeNavigator.GetSourceFragment(newSourceCode,
				new SourceCodeNodeCoordinates(lineNumber, columnNumber));

			StringBuilder errorMessageBuilder = StringBuilderPool.GetBuilder();
			if (!string.IsNullOrWhiteSpace(type))
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorType, type);
			}
			errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			if (!string.IsNullOrWhiteSpace(filePath))
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, filePath);
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

			string errorMessage = errorMessageBuilder.ToString();
			StringBuilderPool.ReleaseBuilder(errorMessageBuilder);

			return errorMessage;
		}

		/// <summary>
		/// Generates a warning message
		/// </summary>
		/// <param name="warningList">List of warnings</param>
		/// <returns>Warning message</returns>
		private string FormatWarningList(JArray warningList)
		{
			StringBuilder warningMessageBuilder = StringBuilderPool.GetBuilder();

			warningMessageBuilder.AppendLine(Strings.WarningList_Header);
			warningMessageBuilder.AppendLine();

			foreach (string warning in warningList)
			{
				warningMessageBuilder.AppendFormatLine(" * {0}", warning);
				warningMessageBuilder.AppendLine();
			}

			string warningMessage = warningMessageBuilder.ToString();
			StringBuilderPool.ReleaseBuilder(warningMessageBuilder);

			return warningMessage;
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
					_jsEngine.RemoveVariable(LESS_ENVIRONMENT_VARIABLE_NAME);
					_jsEngine.RemoveVariable(VIRTUAL_FILE_MANAGER_VARIABLE_NAME);

					_jsEngine.Dispose();
					_jsEngine = null;
				}

				_virtualFileManager = null;
			}
		}
	}
}