using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;

using AdvancedStringBuilder;
using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Core.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.TypeScript.Internal
{
	/// <summary>
	/// TypeScript compiler
	/// </summary>
	internal sealed class TypeScriptCompiler : IDisposable
	{
		/// <summary>
		/// Name of file, which contains a TypeScript library
		/// </summary>
		private const string TYPESCRIPT_LIBRARY_FILE_NAME = "typescript-combined.min.js";

		/// <summary>
		/// Name of file, which contains a TypeScript compiler helper
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
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// Virtual file manager
		/// </summary>
		private VirtualFileManager _virtualFileManager;

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
		/// Constructs a instance of TypeScript compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
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
			if (_initializedFlag.Set())
			{
				_jsEngine.EmbedHostObject(VIRTUAL_FILE_MANAGER_VARIABLE_NAME, _virtualFileManager);

				Assembly assembly = GetType().Assembly;

				_jsEngine.ExecuteResource(ResourceHelpers.GetResourceName(TYPESCRIPT_LIBRARY_FILE_NAME), assembly);
				_jsEngine.ExecuteResource(ResourceHelpers.GetResourceName(TSC_HELPER_FILE_NAME), assembly);
			}
		}

		/// <summary>
		/// "Compiles" a TypeScript code to JS code
		/// </summary>
		/// <param name="path">Path to TypeScript file</param>
		/// <returns>Compilation result</returns>
		public CompilationResult Compile(string path)
		{
			Initialize();

			CompilationResult compilationResult;

			try
			{
				var result = _jsEngine.Evaluate<string>(string.Format(COMPILATION_FUNCTION_CALL_TEMPLATE,
					JsonConvert.SerializeObject(path),
					_optionsString));
				var json = JObject.Parse(result);

				var errors = json["errors"] != null ? json["errors"] as JArray : null;
				if (errors != null && errors.Count > 0)
				{
					throw new TypeScriptCompilationException(FormatErrorDetails(errors[0], path));
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
				throw new TypeScriptCompilationException(JsErrorHelpers.Format(e));
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
				new JProperty("alwaysStrict", options.AlwaysStrict),
				new JProperty("downlevelIteration", options.DownlevelIteration),
				new JProperty("forceConsistentCasingInFileNames", options.ForceConsistentCasingInFileNames),
				new JProperty("keyofStringsOnly", options.KeyofStringsOnly),
				new JProperty("lib", options.Libs.Count > 0 ? new JArray(options.Libs) : null),
				new JProperty("newLine", options.NewLine),
				new JProperty("noEmit", options.NoEmit),
				new JProperty("noEmitHelpers", options.NoEmitHelpers),
				new JProperty("noEmitOnError", options.NoEmitOnError),
				new JProperty("noErrorTruncation", options.NoErrorTruncation),
				new JProperty("noFallthroughCasesInSwitch", options.NoFallthroughCasesInSwitch),
				new JProperty("noImplicitAny", options.NoImplicitAny),
				new JProperty("noImplicitReturns", options.NoImplicitReturns),
				new JProperty("noImplicitThis", options.NoImplicitThis),
				new JProperty("noLib", options.NoLib),
				new JProperty("noResolve", options.NoResolve),
				new JProperty("noStrictGenericChecks", options.NoStrictGenericChecks),
				new JProperty("noUnusedLocals", options.NoUnusedLocals),
				new JProperty("noUnusedParameters", options.NoUnusedParameters),
				new JProperty("preserveConstEnums", options.PreserveConstEnums),
				new JProperty("removeComments", options.RemoveComments),
				new JProperty("skipDefaultLibCheck", options.SkipDefaultLibCheck),
				new JProperty("skipLibCheck", options.SkipLibCheck),
				new JProperty("strictNullChecks", options.StrictNullChecks),
				new JProperty("strictFunctionTypes", options.StrictFunctionTypes),
				new JProperty("strictPropertyInitialization", options.StrictPropertyInitialization),
				new JProperty("stripInternal", options.StripInternal),
				new JProperty("suppressExcessPropertyErrors", options.SuppressExcessPropertyErrors),
				new JProperty("suppressImplicitAnyIndexErrors", options.SuppressImplicitAnyIndexErrors),
				new JProperty("suppressTypeCheckingErrors", options.SuppressTypeCheckingErrors),
				new JProperty("target", options.Target),
				new JProperty("transpileOnly", options.TranspileOnly)
			);

			return optionsJson;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="currentFilePath">Path to current TypeScript file</param>
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

			var stringBuilderPool = StringBuilderPool.Shared;
			StringBuilder errorMessageBuilder = stringBuilderPool.Rent();
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
			stringBuilderPool.Return(errorMessageBuilder);

			return errorMessage;
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
					_jsEngine.RemoveVariable(VIRTUAL_FILE_MANAGER_VARIABLE_NAME);

					_jsEngine.Dispose();
					_jsEngine = null;
				}

				_virtualFileManager = null;
			}
		}
	}
}