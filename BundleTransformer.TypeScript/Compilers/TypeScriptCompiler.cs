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
		private const string COMPILATION_FUNCTION_CALL_TEMPLATE = @"typeScriptHelper.compile({0}, {1}, {2});";

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
			_defaultOptionsString = ConvertCompilationOptionsToJson(defaultOptions).ToString();
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

				_jsEngine = new MsieJsEngine(true, false);
				_jsEngine.ExecuteResource(TYPESCRIPT_LIBRARY_RESOURCE_NAME, type);
				_jsEngine.ExecuteResource(TSC_HELPER_RESOURCE_NAME, type);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" TypeScript-code to JS-code
		/// </summary>
		/// <param name="content">Text content written on TypeScript</param>
		/// <param name="dependencies">List of dependencies</param>
		/// <param name="options">Compilation options</param>
		/// <returns>Translated TypeScript-code</returns>
		public string Compile(string content, IList<Dependency> dependencies, CompilationOptions options = null)
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
					Path = "lib.d.ts",
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
						ConvertDependenciesToJson(newDependencies),
						currentOptionsString));
					var json = JObject.Parse(result);

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new TypeScriptCompilingException(FormatErrorDetails(errors[0], content));
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
				dependencies.Select(d => new JObject(new JProperty("content", d.Content)))
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
			StyleOptions styleOptions = options.StyleOptions;

			var optionsJson = new JObject(
				new JProperty("styleSettings", new JObject(
					new JProperty("bitwise", styleOptions.Bitwise),
					new JProperty("blockInCompoundStmt", styleOptions.BlockInCompoundStatement),
					new JProperty("eqeqeq", styleOptions.EqEqEq),
					new JProperty("forin", styleOptions.ForIn),
					new JProperty("emptyBlocks", styleOptions.EmptyBlocks),
					new JProperty("newMustBeUsed", styleOptions.NewMustBeUsed),
					new JProperty("requireSemi", styleOptions.RequireSemicolons),
					new JProperty("assignmentInCond", styleOptions.AssignmentInConditions),
					new JProperty("eqnull", styleOptions.EqNull),
					new JProperty("evalOK", styleOptions.EvalOk),
					new JProperty("innerScopeDeclEscape", styleOptions.InnerScopeDeclarationsEscape),
					new JProperty("funcInLoop", styleOptions.FunctionsInLoops),
					new JProperty("reDeclareLocal", styleOptions.ReDeclareLocal),
					new JProperty("literalSubscript", styleOptions.LiteralSubscript),
					new JProperty("implicitAny", styleOptions.ImplicitAny)
				)),
				new JProperty("propagateConstants", options.PropagateConstants),
				new JProperty("minWhitespace", options.EnableNativeMinification),
				new JProperty("emitComments", !options.EnableNativeMinification),
				new JProperty("errorOnWith", options.ErrorOnWith),
				new JProperty("inferPropertiesFromThisAssignment", options.InferPropertiesFromThisAssignment),
				new JProperty("codeGenTarget", options.CodeGenTarget.ToString())
			);

			return optionsJson;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="sourceCode">Source code</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(JToken errorDetails, string sourceCode)
		{
			var startIndex = errorDetails.Value<int>("startIndex");
			var message = errorDetails.Value<string>("message");
			var nodeCoordinates = SourceCodeNavigator.CalculateNodeCoordinates(sourceCode, startIndex);
			string sourceFragment = SourceCodeNavigator.GetSourceFragment(sourceCode, nodeCoordinates);

			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
				nodeCoordinates.LineNumber.ToString());
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
				nodeCoordinates.ColumnNumber.ToString());
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