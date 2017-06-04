using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;

using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Core.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.Hogan.Internal
{
	/// <summary>
	/// Hogan-compiler
	/// </summary>
	internal sealed class HoganCompiler : IDisposable
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.Hogan.Resources";

		/// <summary>
		/// Name of file, which contains a Hogan-library
		/// </summary>
		private const string HOGAN_LIBRARY_FILE_NAME = "hogan.min.js";

		/// <summary>
		/// Name of file, which contains a Hogan-compiler helper
		/// </summary>
		private const string HOGAN_HELPER_FILE_NAME = "hoganHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for compilation
		/// </summary>
		const string COMPILATION_FUNCTION_CALL_TEMPLATE = "hoganHelper.precompile({0}, {1});";

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

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
		/// Constructs a instance of Hogan-compiler
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="options">Compilation options</param>
		public HoganCompiler(Func<IJsEngine> createJsEngineInstance, CompilationOptions options)
		{
			_jsEngine = createJsEngineInstance();
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
				Assembly assembly = GetType().Assembly;

				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + HOGAN_LIBRARY_FILE_NAME, assembly);
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + HOGAN_HELPER_FILE_NAME, assembly);
			}
		}

		/// <summary>
		/// "Compiles" Mustache-template to JS-code
		/// </summary>
		/// <param name="content">Text content of Mustache-template</param>
		/// <param name="path">Path to Mustache-file</param>
		/// <returns>Translated Mustache-template</returns>
		public string Compile(string content, string path)
		{
			Initialize();

			string newContent;

			try
			{
				var result = _jsEngine.Evaluate<string>(
					string.Format(COMPILATION_FUNCTION_CALL_TEMPLATE,
						JsonConvert.SerializeObject(content),
						_optionsString));
				var json = JObject.Parse(result);

				var errors = json["errors"] != null ? json["errors"] as JArray : null;
				if (errors != null && errors.Count > 0)
				{
					throw new HoganCompilationException(FormatErrorDetails(errors[0].Value<string>(), path));
				}

				var compiledCode = json.Value<string>("compiledCode");
				string templateName = GetTemplateName(path, _options.Namespace);

				newContent = WrapCompiledTemplateCode(compiledCode, _options.Variable, templateName,
					_options.EnableNativeMinification);
			}
			catch (JsRuntimeException e)
			{
				throw new HoganCompilationException(JsErrorHelpers.Format(e));
			}

			return newContent;
		}

		/// <summary>
		/// Gets a template name
		/// </summary>
		/// <param name="path">Template path</param>
		/// <param name="templateNamespace">Prefix to template names</param>
		/// <returns>Template name</returns>
		private static string GetTemplateName(string path, string templateNamespace)
		{
			if (string.IsNullOrWhiteSpace(path))
			{
				throw new ArgumentException(string.Format(CoreStrings.Common_ArgumentIsEmpty, "path"), "path");
			}

			string templateName = (templateNamespace ?? string.Empty) + Path.GetFileNameWithoutExtension(path);

			return templateName;
		}

		/// <summary>
		/// Wraps a compiled code
		/// </summary>
		/// <param name="compiledCode">Compiled code</param>
		/// <param name="variableName">Variable name for wrapper</param>
		/// <param name="templateName">Template name</param>
		/// <param name="enableNativeMinification">Flag that indicating to use of native minification</param>
		/// <returns>Wrapped code</returns>
		private static string WrapCompiledTemplateCode(string compiledCode, string variableName,
			string templateName, bool enableNativeMinification)
		{
			var contentBuilder = new StringBuilder();
			if (!enableNativeMinification)
			{
				contentBuilder.AppendFormatLine("if (!!!{0}) var {0} = {{}};", variableName);
				contentBuilder.AppendFormatLine("{0}['{1}'] = new Hogan.Template({2});",
					variableName, templateName, compiledCode);
			}
			else
			{
				contentBuilder.AppendFormat("if(!!!{0})var {0}={{}};", variableName);
				contentBuilder.AppendFormat("{0}['{1}']=new Hogan.Template({2});",
					variableName, templateName, compiledCode);
			}

			return contentBuilder.ToString();
		}

		/// <summary>
		/// Converts a compilation options to JSON
		/// </summary>
		/// <param name="options">Compilation options</param>
		/// <returns>Compilation options in JSON format</returns>
		private static JObject ConvertCompilationOptionsToJson(CompilationOptions options)
		{
			var optionsJson = new JObject(
				new JProperty("sectionTags", ConvertSectionTagsToJson(options.SectionTags)),
				new JProperty("delimiters", options.Delimiters)
			);

			return optionsJson;
		}

		/// <summary>
		/// Converts a list of custom section tags to JSON
		/// </summary>
		/// <param name="sectionTags">List of custom section tags</param>
		/// <returns>List of custom section tags in JSON format</returns>
		private static JArray ConvertSectionTagsToJson(IList<SectionTag> sectionTags)
		{
			var sectionTagsJson = new JArray();

			foreach (SectionTag sectionTag in sectionTags)
			{
				sectionTagsJson.Add(new JObject(
					new JProperty("o", sectionTag.OpeningTagName),
					new JProperty("c", sectionTag.ClosingTagName)
				));
			}

			return sectionTagsJson;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="message">Error message</param>
		/// <param name="currentFilePath">Path to current Mustache-file</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(string message, string currentFilePath)
		{
			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			if (!string.IsNullOrWhiteSpace(currentFilePath))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, currentFilePath);
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