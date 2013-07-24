namespace BundleTransformer.TypeScript.Compilers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Text;

	using MsieJavaScriptEngine;
	using MsieJavaScriptEngine.ActiveScript;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using Core;
	using Core.Assets;
	using Core.SourceCodeHelpers;
	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// TypeScript-compiler
	/// </summary>
	internal sealed class TypeScriptCompiler : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a TypeScript-library
		/// </summary>
		private const string TYPESCRIPT_LIBRARY_RESOURCE_NAME = "BundleTransformer.TypeScript.Resources.typescript.min.js";

		/// <summary>
		/// Name of resource, which contains a TypeScript-compiler helper
		/// </summary>
		private const string TSC_HELPER_RESOURCE_NAME = "BundleTransformer.TypeScript.Resources.tscHelper.min.js";

		/// <summary>
		/// Name of resource, which contains a default <code>lib.d.ts</code> with global declarations
		/// </summary>
		private const string DEFAULT_LIBRARY_RESOURCE_NAME = "BundleTransformer.TypeScript.Resources.lib.d.ts";

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
		/// Common types definitions (contents of the file <code>lib.d.ts</code>)
		/// </summary>
		private readonly string _commonTypesDefinitions;

		/// <summary>
		/// MSIE JS engine
		/// </summary>
		private MsieJsEngine _jsEngine;

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
		/// Constructs instance of TypeScript-compiler
		/// </summary>
		public TypeScriptCompiler() : this(null)
		{ }

		/// <summary>
		/// Constructs instance of TypeScript-compiler
		/// </summary>
		/// <param name="defaultOptions">Default compilation options</param>
		public TypeScriptCompiler(CompilationOptions defaultOptions)
		{
			_defaultOptions = defaultOptions;
			_defaultOptionsString = (defaultOptions != null) ?
				ConvertCompilationOptionsToJson(defaultOptions).ToString() : "null";
			_commonTypesDefinitions = Utils.GetResourceAsString(DEFAULT_LIBRARY_RESOURCE_NAME, GetType());
		}

		/// <summary>
		/// Destructs instance of TypeScript-compiler
		/// </summary>
		~TypeScriptCompiler()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Initializes compiler
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				Type type = GetType();

				_jsEngine = new MsieJsEngine(true, true);
				_jsEngine.ExecuteResource(TYPESCRIPT_LIBRARY_RESOURCE_NAME, type);
				_jsEngine.ExecuteResource(TSC_HELPER_RESOURCE_NAME, type);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" TypeScript-code to JS-code
		/// </summary>
		/// <param name="content">Text content written on TypeScript</param>
		/// <param name="path">Path to TypeScript-file</param>
		/// <param name="dependencies">List of dependencies</param>
		/// <param name="options">Compilation options</param>
		/// <returns>Translated TypeScript-code</returns>
		public string Compile(string content, string path, IList<Dependency> dependencies, 
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

			var newDependencies = new List<Dependency>();
			if (currentOptions.UseDefaultLib)
			{
				var defaultLibDependency = new Dependency
					{
						Url = "lib.d.ts",
						VirtualPath = "lib.d.ts",
						Content = _commonTypesDefinitions
					};
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

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new TypeScriptCompilingException(FormatErrorDetails(errors[0], content, path,
							newDependencies));
					}

					newContent = json.Value<string>("compiledCode");
				}
				catch (ActiveScriptException e)
				{
					throw new TypeScriptCompilingException(
						ActiveScriptErrorFormatter.Format(e));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Converts a list of dependencies to JSON
		/// </summary>
		/// <param name="dependencies">List of dependencies</param>
		/// <returns>List of dependencies in JSON format</returns>
		private static JArray ConvertDependenciesToJson(IEnumerable<Dependency> dependencies)
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
				new JProperty("useDefaultLib", options.UseDefaultLib),
				new JProperty("propagateConstants", options.PropagateConstants),
				new JProperty("minWhitespace", options.EnableNativeMinification),
				new JProperty("emitComments", !options.EnableNativeMinification),
				new JProperty("codeGenTarget", options.CodeGenTarget.ToString()),
				new JProperty("disallowBool", options.DisallowBool),
				new JProperty("allowAutomaticSemicolonInsertion", options.AllowAutomaticSemicolonInsertion)
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
			IEnumerable<Dependency> dependencies)
		{
			var message = errorDetails.Value<string>("message");
			var filePath = errorDetails.Value<string>("fileName");
			var lineNumber = errorDetails.Value<int>("lineNumber");
			var columnNumber = errorDetails.Value<int>("columnNumber");

			string newSourceCode = string.Empty;
			if (string.Equals(filePath, currentFilePath, StringComparison.InvariantCultureIgnoreCase))
			{
				newSourceCode = sourceCode;
			}
			else
			{
				var filePathInUpperCase = filePath.ToUpperInvariant();
				var dependency = dependencies.SingleOrDefault(d => d.Url.ToUpperInvariant() == filePathInUpperCase);

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
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
				lineNumber.ToString());
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
				columnNumber.ToString());
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
			Dispose(true /* disposing */);
			GC.SuppressFinalize(this);
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		/// <param name="disposing">Flag, allowing destruction of 
		/// managed objects contained in fields of class</param>
		private void Dispose(bool disposing)
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