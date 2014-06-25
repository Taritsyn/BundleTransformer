namespace BundleTransformer.Handlebars.Compilers
{
	using System;
	using System.Globalization;
	using System.IO;
	using System.Text;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

	using Core.Helpers;
	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// Handlebars-compiler
	/// </summary>
	internal sealed class HandlebarsCompiler : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a Handlebars-library
		/// </summary>
		const string HANDLEBARS_LIBRARY_RESOURCE_NAME
			= "BundleTransformer.Handlebars.Resources.handlebars.min.js";

		/// <summary>
		/// Name of resource, which contains a Handlebars-compiler helper
		/// </summary>
		const string HBS_HELPER_RESOURCE_NAME = "BundleTransformer.Handlebars.Resources.hbsHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for compilation
		/// </summary>
		const string COMPILATION_FUNCTION_CALL_TEMPLATE = @"handlebarsHelper.precompile({0}, {1});";

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
		/// Constructs instance of Handlebars-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		public HandlebarsCompiler(Func<IJsEngine> createJsEngineInstance)
			: this(createJsEngineInstance, null)
		{ }

		/// <summary>
		/// Constructs instance of Handlebars-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="defaultOptions">Default compilation options</param>
		public HandlebarsCompiler(Func<IJsEngine> createJsEngineInstance, CompilationOptions defaultOptions)
		{
			_jsEngine = createJsEngineInstance();
			_defaultOptions = defaultOptions;
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

				_jsEngine.ExecuteResource(HANDLEBARS_LIBRARY_RESOURCE_NAME, type);
				_jsEngine.ExecuteResource(HBS_HELPER_RESOURCE_NAME, type);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" Handlebars-template to JS-code
		/// </summary>
		/// <param name="content">Text content of Handlebars-template</param>
		/// <param name="path">Path to Handlebars-file</param>
		/// <param name="options">Compilation options</param>
		/// <returns>Translated Handlebars-template</returns>
		public string Compile(string content, string path, CompilationOptions options = null)
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
						throw new HandlebarsCompilingException(FormatErrorDetails(errors[0], content, path));
					}

					var compiledCode = json.Value<string>("compiledCode");
					string templateNamespace = (options != null) ? options.Namespace : string.Empty;
					string templateName = GetTemplateName(path, currentOptions.RootPath);

					newContent = WrapCompiledTemplateCode(compiledCode, templateNamespace, templateName);
				}
				catch (JsRuntimeException e)
				{
					throw new HandlebarsCompilingException(
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
				new JProperty("knownHelpers", ParseKnownHelpers(options.KnownHelpers)),
				new JProperty("knownHelpersOnly", options.KnownHelpersOnly)
			);

			return optionsJson;
		}

		/// <summary>
		/// Parses a string representation of the known helpers list to object
		/// </summary>
		/// <param name="knownHelpersString">String representation of the known helpers list</param>
		/// <returns>Known helpers list in JSON format</returns>
		private static JObject ParseKnownHelpers(string knownHelpersString)
		{
			var knownHelpers = new JObject();
			string[] knownHelperNames = Utils.ConvertToStringCollection(knownHelpersString, ',',
				trimItemValues: true, removeEmptyItems: true);

			foreach (string knownHelperName in knownHelperNames)
			{
				knownHelpers.Add(knownHelperName, true);
			}

			if (knownHelpers.Count == 0)
			{
				knownHelpers = null;
			}

			return knownHelpers;
		}

		/// <summary>
		/// Gets a template name
		/// </summary>
		/// <param name="path">Template path</param>
		/// <param name="rootPath">Template root path</param>
		/// <returns>Template name</returns>
		private static string GetTemplateName(string path, string rootPath)
		{
			string templateName = path;

			if (string.IsNullOrWhiteSpace(rootPath))
			{
				templateName = Path.GetFileNameWithoutExtension(templateName);
			}
			else if (templateName.IndexOf(rootPath, StringComparison.OrdinalIgnoreCase) == 0)
			{
				string processedRootPath = UrlHelpers.RemoveLastSlash(rootPath);
				string fileExtension = Path.GetExtension(path);

				int rootPathLength = processedRootPath.Length;
				int fileExtensionLength = fileExtension != null ? fileExtension.Length : 0;

				int templateNameStartPosition = rootPathLength + 1;
				int templateNameLength = templateName.Length - (rootPathLength + 1) - fileExtensionLength;

				templateName = templateName.Substring(templateNameStartPosition, templateNameLength);
			}

			return templateName;
		}

		/// <summary>
		/// Wraps a compiled code
		/// </summary>
		/// <param name="compiledCode">Compiled code</param>
		/// <param name="templateNamespace">Template namespace</param>
		/// <param name="templateName">Template name</param>
		/// <returns>Wrapped code</returns>
		private static string WrapCompiledTemplateCode(string compiledCode, string templateNamespace,
			string templateName)
		{
			var contentBuilder = new StringBuilder();
			contentBuilder.AppendLine("(function(handlebars, templates) {");
			contentBuilder.AppendFormatLine("	templates['{0}'] = handlebars.template({1});", templateName, compiledCode);
			contentBuilder.AppendFormatLine("}})(Handlebars, {0} = {0} || {{}});", templateNamespace);

			return contentBuilder.ToString();
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current Handlebars-file</param>
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