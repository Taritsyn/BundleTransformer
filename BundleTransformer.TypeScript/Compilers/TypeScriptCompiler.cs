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

	using Core.Assets;
	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// TypeScript-compiler
	/// </summary>
	internal sealed class TypeScriptCompiler : IDisposable
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.TypeScript.Resources";

		/// <summary>
		/// Name of file, which contains a TypeScript-library
		/// </summary>
		private const string TYPESCRIPT_LIBRARY_FILE_NAME = "typescript-combined.min.js";

		/// <summary>
		/// Name of file, which contains a TypeScript-compiler helper
		/// </summary>
		private const string TSC_HELPER_FILE_NAME = "tscHelper.min.js";

		/// <summary>
		/// Name of file, which contains a default <code>lib.d.ts</code> with global declarations
		/// </summary>
		private const string DEFAULT_LIBRARY_FILE_NAME = "lib.d.ts";

		/// <summary>
		/// Name of file, which contains a default <code>lib.es6.d.ts</code> with global declarations
		/// </summary>
		private const string DEFAULT_LIBRARY_ES6_FILE_NAME = "lib.es6.d.ts";

		/// <summary>
		/// Template of function call, which is responsible for compilation
		/// </summary>
		private const string COMPILATION_FUNCTION_CALL_TEMPLATE = @"typeScriptHelper.compile({0}, {1}, {2}, {3});";

		/// <summary>
		/// Default compilation options
		/// </summary>
		private readonly CompilationOptions _defaultOptions;

		/// <summary>
		/// String representation of the default compilation options
		/// </summary>
		private readonly string _defaultOptionsString;

		/// <summary>
		/// Common types definitions
		/// </summary>
		private Dictionary<string, string> _commonTypesDefinitions;

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
		public TypeScriptCompiler(Func<IJsEngine> createJsEngineInstance)
			: this(createJsEngineInstance, null)
		{ }

		/// <summary>
		/// Constructs a instance of TypeScript-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="defaultOptions">Default compilation options</param>
		public TypeScriptCompiler(Func<IJsEngine> createJsEngineInstance, CompilationOptions defaultOptions)
		{
			_jsEngine = createJsEngineInstance();
			_defaultOptions = defaultOptions;
			_defaultOptionsString = (defaultOptions != null) ?
				ConvertCompilationOptionsToJson(defaultOptions).ToString() : "null";

			Type type = GetType();

			_commonTypesDefinitions = new Dictionary<string, string>
			{
				{
					DEFAULT_LIBRARY_FILE_NAME,
					Utils.GetResourceAsString(RESOURCES_NAMESPACE + "." + DEFAULT_LIBRARY_FILE_NAME, type)
				},
				{
					DEFAULT_LIBRARY_ES6_FILE_NAME,
					Utils.GetResourceAsString(RESOURCES_NAMESPACE + "." + DEFAULT_LIBRARY_ES6_FILE_NAME, type)
				}
			};
		}


		/// <summary>
		/// Initializes compiler
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				Type type = GetType();

				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + TYPESCRIPT_LIBRARY_FILE_NAME, type);
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + TSC_HELPER_FILE_NAME, type);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" a TypeScript-code to JS-code
		/// </summary>
		/// <param name="content">Text content written on TypeScript</param>
		/// <param name="path">Path to TypeScript-file</param>
		/// <param name="dependencies">List of dependencies</param>
		/// <param name="options">Compilation options</param>
		/// <returns>Translated TypeScript-code</returns>
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

			var newDependencies = new DependencyCollection();
			if (!currentOptions.NoLib)
			{
				string defaultLibFileName = (currentOptions.Target == TargetMode.EcmaScript6) ?
					DEFAULT_LIBRARY_ES6_FILE_NAME : DEFAULT_LIBRARY_FILE_NAME;
				var defaultLibDependency = new Dependency(defaultLibFileName, _commonTypesDefinitions[defaultLibFileName]);
				newDependencies.Add(defaultLibDependency);
			}
			newDependencies.AddRange(dependencies);

			lock (_compilationSynchronizer)
			{
				Initialize();

				try
				{
					var result = _jsEngine.Evaluate<string>(string.Format(COMPILATION_FUNCTION_CALL_TEMPLATE,
						JsonConvert.SerializeObject(content),
						JsonConvert.SerializeObject(path),
						ConvertDependenciesToJson(newDependencies),
						currentOptionsString));
					var json = JObject.Parse(result);

					var errors = (json["errors"] != null) ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new TypeScriptCompilingException(FormatErrorDetails(errors[0], content, path,
							newDependencies));
					}

					newContent = json.Value<string>("compiledCode");
				}
				catch (JsRuntimeException e)
				{
					throw new TypeScriptCompilingException(
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
				new JProperty("noEmit", options.NoEmit),
				new JProperty("noEmitOnError", options.NoEmitOnError),
				new JProperty("noImplicitAny", options.NoImplicitAny),
				new JProperty("noLib", options.NoLib),
				new JProperty("preserveConstEnums", options.PreserveConstEnums),
				new JProperty("removeComments", options.RemoveComments),
				new JProperty("stripInternal", options.StripInternal),
				new JProperty("suppressImplicitAnyIndexErrors", options.SuppressImplicitAnyIndexErrors),
				new JProperty("target", options.Target)
			);

			return optionsJson;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current TypeScript-file</param>
		/// <param name="dependencies">List of dependencies</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(JToken errorDetails, string sourceCode, string currentFilePath,
			DependencyCollection dependencies)
		{
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

				if (_commonTypesDefinitions != null)
				{
					_commonTypesDefinitions.Clear();
					_commonTypesDefinitions = null;
				}
			}
		}
	}
}