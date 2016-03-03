namespace BundleTransformer.TypeScript.Compilers
{
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.Linq;
	using System.Text;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Helpers;

	/// <summary>
	/// TypeScript-compiler
	/// </summary>
	internal sealed class TypeScriptCompiler : IDisposable
	{
		/// <summary>
		/// Name of file, which contains a TypeScript-library
		/// </summary>
		private const string TYPESCRIPT_LIBRARY_FILE_NAME = "typescript-combined.min.js";

		/// <summary>
		/// Name of file, which contains a TypeScript-compiler helper
		/// </summary>
		private const string TSC_HELPER_FILE_NAME = "tscHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for compilation
		/// </summary>
		private const string COMPILATION_FUNCTION_CALL_TEMPLATE = @"typeScriptHelper.compile({0}, {1});";

		/// <summary>
		/// Name of variable, which contains a virtual file manager
		/// </summary>
		private const string VIRTUAL_FILE_MANAGER_VARIABLE_NAME = "VirtualFileManager";

		/// <summary>
		/// Virtual file manager
		/// </summary>
		private VirtualFileManager _virtualFileManager;

		/// <summary>
		/// String representation of the compilation options
		/// </summary>
		private readonly string _optionsString;

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
		/// Constructs a instance of TypeScript-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="virtualFileManager">Virtual file manager</param>
		public TypeScriptCompiler(Func<IJsEngine> createJsEngineInstance, VirtualFileManager virtualFileManager)
			: this(createJsEngineInstance, virtualFileManager, null)
		{ }

		/// <summary>
		/// Constructs a instance of TypeScript-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="virtualFileManager">Virtual file manager</param>
		/// <param name="options">Compilation options</param>
		public TypeScriptCompiler(Func<IJsEngine> createJsEngineInstance,
			VirtualFileManager virtualFileManager,
			CompilationOptions options)
		{
			_jsEngine = createJsEngineInstance();
			_virtualFileManager = virtualFileManager;
			_optionsString = ConvertCompilationOptionsToJson(options ?? new CompilationOptions()).ToString();
		}


		/// <summary>
		/// Initializes compiler
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				_jsEngine.EmbedHostObject(VIRTUAL_FILE_MANAGER_VARIABLE_NAME, _virtualFileManager);

				Type type = GetType();

				_jsEngine.ExecuteResource(TypeScriptResourceHelpers.GetResourceName(TYPESCRIPT_LIBRARY_FILE_NAME), type);
				_jsEngine.ExecuteResource(TypeScriptResourceHelpers.GetResourceName(TSC_HELPER_FILE_NAME), type);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" a TypeScript-code to JS-code
		/// </summary>
		/// <param name="path">Path to TypeScript-file</param>
		/// <returns>Compilation result</returns>
		public CompilationResult Compile(string path)
		{
			CompilationResult compilationResult;

			lock (_compilationSynchronizer)
			{
				Initialize();

				try
				{
					var result = _jsEngine.Evaluate<string>(string.Format(COMPILATION_FUNCTION_CALL_TEMPLATE,
						JsonConvert.SerializeObject(path),
						_optionsString));
					var json = JObject.Parse(result);

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new TypeScriptCompilingException(FormatErrorDetails(errors[0], path));
					}

					compilationResult = new CompilationResult
					{
						CompiledContent = json.Value<string>("compiledCode"),
						IncludedFilePaths = json.Value<JArray>("includedFilePaths")
							.ToObject<IList<string>>()
							.Distinct(StringComparer.OrdinalIgnoreCase)
							.Where(p => !p.Equals(path, StringComparison.OrdinalIgnoreCase))
							.ToList()
					};
				}
				catch (JsRuntimeException e)
				{
					throw new TypeScriptCompilingException(
						JsRuntimeErrorHelpers.Format(e));
				}
			}

			return compilationResult;
		}

		/// <summary>
		/// Converts a compilation options to JSON
		/// </summary>
		/// <param name="options">Compilation options</param>
		/// <returns>Compilation options in JSON format</returns>
		private static JObject ConvertCompilationOptionsToJson(CompilationOptions options)
		{
			var optionsJson = new JObject(
				new JProperty("allowUnreachableCode", options.AllowUnreachableCode),
				new JProperty("allowUnusedLabels", options.AllowUnusedLabels),
				new JProperty("forceConsistentCasingInFileNames", options.ForceConsistentCasingInFileNames),
				new JProperty("newLine", options.NewLine),
				new JProperty("noEmit", options.NoEmit),
				new JProperty("noEmitHelpers", options.NoEmitHelpers),
				new JProperty("noEmitOnError", options.NoEmitOnError),
				new JProperty("noFallthroughCasesInSwitch", options.NoFallthroughCasesInSwitch),
				new JProperty("noImplicitAny", options.NoImplicitAny),
				new JProperty("noImplicitReturns", options.NoImplicitReturns),
				new JProperty("noLib", options.NoLib),
				new JProperty("preserveConstEnums", options.PreserveConstEnums),
				new JProperty("removeComments", options.RemoveComments),
				new JProperty("skipDefaultLibCheck", options.SkipDefaultLibCheck),
				new JProperty("stripInternal", options.StripInternal),
				new JProperty("suppressExcessPropertyErrors", options.SuppressExcessPropertyErrors),
				new JProperty("suppressImplicitAnyIndexErrors", options.SuppressImplicitAnyIndexErrors),
				new JProperty("target", options.Target)
			);

			return optionsJson;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="currentFilePath">Path to current TypeScript-file</param>
		/// <returns>Detailed error message</returns>
		private string FormatErrorDetails(JToken errorDetails, string currentFilePath)
		{
			var message = errorDetails.Value<string>("message");
			var filePath = errorDetails.Value<string>("fileName");
			if (string.IsNullOrWhiteSpace(filePath))
			{
				filePath = currentFilePath;
			}
			var lineNumber = errorDetails.Value<int>("lineNumber");
			var columnNumber = errorDetails.Value<int>("columnNumber");
			string newSourceCode = _virtualFileManager.ReadFile(filePath);
			string sourceFragment = SourceCodeNavigator.GetSourceFragment(newSourceCode,
				new SourceCodeNodeCoordinates(lineNumber, columnNumber));

			var errorMessage = new StringBuilder();
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
					_jsEngine.RemoveVariable(VIRTUAL_FILE_MANAGER_VARIABLE_NAME);

					_jsEngine.Dispose();
					_jsEngine = null;
				}

				_virtualFileManager = null;
			}
		}
	}
}