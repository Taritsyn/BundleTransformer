namespace BundleTransformer.CoffeeScript.Compilers
{
	using System;
	using System.Text;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using Core;
	using Core.Helpers;
	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// CoffeeScript-compiler
	/// </summary>
	internal sealed class CoffeeScriptCompiler : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a CoffeeScript-library
		/// </summary>
		const string COFFEESCRIPT_LIBRARY_RESOURCE_NAME 
			= "BundleTransformer.CoffeeScript.Resources.coffeescript-combined.min.js";

		/// <summary>
		/// Name of resource, which contains a CoffeeScript-compiler helper
		/// </summary>
		const string CSC_HELPER_RESOURCE_NAME = "BundleTransformer.CoffeeScript.Resources.cscHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for compilation
		/// </summary>
		const string COMPILATION_FUNCTION_CALL_TEMPLATE = @"coffeeScriptHelper.compile({0}, {1});";

		/// <summary>
		/// String representation of the default compilation options
		/// </summary>
		private readonly string _defaultOptionsString;

		/// <summary>
		/// JS engine
		/// </summary>
		private readonly IJsEngine _jsEngine;

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
		/// Constructs instance of CoffeeScript-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		public CoffeeScriptCompiler(Func<IJsEngine> createJsEngineInstance)
			: this(createJsEngineInstance, null)
		{ }

		/// <summary>
		/// Constructs instance of CoffeeScript-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="defaultOptions">Default compilation options</param>
		public CoffeeScriptCompiler(Func<IJsEngine> createJsEngineInstance, CompilationOptions defaultOptions)
		{
			_jsEngine = createJsEngineInstance();
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

				_jsEngine.ExecuteResource(COFFEESCRIPT_LIBRARY_RESOURCE_NAME, type);
				_jsEngine.ExecuteResource(CSC_HELPER_RESOURCE_NAME, type);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" CoffeeScript-code to JS-code
		/// </summary>
		/// <param name="content">Text content written on CoffeeScript</param>
		/// <param name="options">Compilation options</param>
		/// <returns>Translated CoffeeScript-code</returns>
		public string Compile(string content, CompilationOptions options = null)
		{
			string newContent;
			string currentOptionsString = (options != null) ? 
				ConvertCompilationOptionsToJson(options).ToString() : _defaultOptionsString;

			lock (_compilationSynchronizer)
			{
				Initialize();

				try
				{
					var result = _jsEngine.Evaluate<string>(
						string.Format(COMPILATION_FUNCTION_CALL_TEMPLATE,
							JsonConvert.SerializeObject(content),
							currentOptionsString));
					var json = JObject.Parse(result);

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new CoffeeScriptCompilingException(FormatErrorDetails(errors[0], content));
					}

					newContent = json.Value<string>("compiledCode");
				}
				catch (JsRuntimeException e)
				{
					throw new CoffeeScriptCompilingException(
						JsRuntimeErrorHelpers.Format(e));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Converts a compilation options to JSON
		/// </summary>
		/// <param name="options">Compilation options</param>
		/// <returns>Compilation options in JSON format</returns>
		private static JObject ConvertCompilationOptionsToJson(CompilationOptions options)
		{
			var optionsJson = new JObject(
				new JProperty("bare", options.Bare),
				new JProperty("literate", options.Literate)
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
			var message = errorDetails.Value<string>("message");
			var lineNumber = errorDetails.Value<int>("lineNumber");
			var columnNumber = errorDetails.Value<int>("columnNumber");
			string sourceFragment = SourceCodeNavigator.GetSourceFragment(sourceCode, 
				new SourceCodeNodeCoordinates(lineNumber, columnNumber));

			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			if (lineNumber > 0)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
					lineNumber.ToString());
			}
			if (columnNumber > 0)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
					columnNumber.ToString());
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
				}
			}
		}
	}
}