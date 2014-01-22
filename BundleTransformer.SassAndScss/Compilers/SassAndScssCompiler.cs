namespace BundleTransformer.SassAndScss.Compilers
{
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.IO;
	using System.Reflection;
	using System.Text;

	using IronRuby;
	using Microsoft.Scripting;
	using Microsoft.Scripting.Hosting;

	using Core;
	using Core.Assets;
	using CoreStrings = Core.Resources.Strings;

	/* This compiler based on code of the SassAndCoffee.Ruby library
	 * (http://github.com/xpaulbettsx/SassAndCoffee) version 2.0.2.0.
	 */

	/// <summary>
	/// Sass- and SCSS-compiler
	/// </summary>
	internal sealed class SassAndScssCompiler
	{
		/// <summary>
		/// Resources namespace
		/// </summary>
		const string RESOURCES_NAMESPACE = "BundleTransformer.SassAndScss.Resources";

		/// <summary>
		/// Name of file, which contains a Sass library
		/// </summary>
		const string SASS_LIBRARY_FILE_NAME = "sass-combined.rb";

		/// <summary>
		/// Name of folder, which contains a IronRuby library
		/// </summary>
		const string IRONRUBY_FOLDER_NAME = "ironruby";

		/// <summary>
		/// Name of folder, which contains a Ruby library
		/// </summary>
		const string RUBY_FOLDER_NAME = @"ruby\1.9.1";

		/// <summary>
		/// String representation of the default compilation options
		/// </summary>
		private readonly string _defaultOptionsString;

		/// <summary>
		/// Script engine
		/// </summary>
		private ScriptEngine _scriptEngine;

		/// <summary>
		/// Script scope
		/// </summary>
		private ScriptScope _scriptScope;

		/// <summary>
		/// Resource redirection platform adaptation layer
		/// </summary>
		private ResourceRedirectionPlatformAdaptationLayer _platformAdaptationLayer;

		/// <summary>
		/// Sass-engine
		/// </summary>
		private dynamic _sassEngine;

		/// <summary>
		/// Synchronizer of compilation
		/// </summary>
		private readonly object _compilationSynchronizer = new object();

		/// <summary>
		/// Flag that compiler is initialized
		/// </summary>
		private bool _initialized;


		/// <summary>
		/// Constructs instance of Sass- and SCSS-compiler
		/// </summary>
		public SassAndScssCompiler() : this(null)
		{ }

		/// <summary>
		/// Constructs instance of Sass- and SCSS-compiler
		/// </summary>
		/// <param name="defaultOptions">Default compilation options</param>
		public SassAndScssCompiler(CompilationOptions defaultOptions)
		{
			_defaultOptionsString = (defaultOptions != null) ?
				ConvertCompilationOptionsToString("an unknown file", defaultOptions) : "null";
		}


		/// <summary>
		/// Initializes compiler
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				_platformAdaptationLayer = new ResourceRedirectionPlatformAdaptationLayer(RESOURCES_NAMESPACE);

				var scriptRuntimeSetup = new ScriptRuntimeSetup
				{
					HostType = typeof(SassAndScssCompilerScriptHost),
					HostArguments = new List<object> { _platformAdaptationLayer },
				};
				scriptRuntimeSetup.AddRubySetup();

				var scriptRuntime = Ruby.CreateRuntime(scriptRuntimeSetup);

				_scriptEngine = scriptRuntime.GetRubyEngine();
				_scriptEngine.SetSearchPaths(new List<string>
				{ 
					Path.Combine(@"R:\", IRONRUBY_FOLDER_NAME),
					Path.Combine(@"R:\", RUBY_FOLDER_NAME)
				});

				var sassLibrary = _scriptEngine.CreateScriptSourceFromString(
					Utils.GetResourceAsString(RESOURCES_NAMESPACE + "." + SASS_LIBRARY_FILE_NAME,
						Assembly.GetExecutingAssembly()),
					SourceCodeKind.File);

				_scriptScope = _scriptEngine.CreateScope();
				sassLibrary.Execute(_scriptScope);
				_sassEngine = _scriptScope.Engine.Runtime.Globals.GetVariable("Sass");

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" Sass- or SCSS-code to CSS-code
		/// </summary>
		/// <param name="content">Text content written on Sass or SCSS</param>
		/// <param name="path">Path to Sass- or SCSS-file</param>
		/// <param name="dependencies">List of dependencies</param>
		/// <param name="options">Compilation options</param>
		/// <returns>Translated Sass- or SCSS-code</returns>
		public string Compile(string content, string path, DependencyCollection dependencies, 
			CompilationOptions options = null)
		{
			string currentOptionsString = (options != null) ?
				ConvertCompilationOptionsToString(path, options) : _defaultOptionsString;

			lock (_compilationSynchronizer)
			{
				Initialize();

				_platformAdaptationLayer.Dependencies = dependencies;
				
				string newContent;
				try
				{
					newContent = (string)_sassEngine.compile(content, _scriptEngine.Execute(currentOptionsString));
				}
				catch (Exception e)
				{
					if (e.Message == "Sass::SyntaxError") {
						throw new SassAndScssCompilingException(FormatErrorDetails(e, path), e);
					}
					else
					{
						throw;
					}
				}
				finally
				{
					_platformAdaptationLayer.Dependencies = null;
					_platformAdaptationLayer.OnOpenInputFileStream = null;
				}

				return newContent;
			}
		}

		/// <summary>
		/// Converts a compilation options to string
		/// </summary>
		/// <param name="path">Path to Sass- or SCSS-file</param>
		/// <param name="options">Compilation options</param>
		/// <returns>String representation of the compilation options</returns>
		private static string ConvertCompilationOptionsToString(string path, CompilationOptions options)
		{
			var stringBuilder = new StringBuilder();
			stringBuilder.Append("{");
			stringBuilder.AppendFormat(":cache => {0}, ", "false");
			stringBuilder.AppendFormat(":filename => '{0}',", path);
			stringBuilder.AppendFormat(":syntax => :{0}, ", 
				(options.SyntaxType == SyntaxType.Sass) ? "sass" : "scss");
			stringBuilder.AppendFormat(":style => :{0}, ",
				options.EnableNativeMinification ? "compressed" : "expanded");
			stringBuilder.AppendFormat(":line_numbers => {0}, ", 
				options.LineNumbers.ToString().ToLowerInvariant());
			stringBuilder.AppendFormat(":trace_selectors => {0}, ", 
				options.TraceSelectors.ToString().ToLowerInvariant());
			stringBuilder.AppendFormat(":debug_info => {0}", 
				options.DebugInfo.ToString().ToLowerInvariant());
			stringBuilder.Append("}");

			return stringBuilder.ToString();
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="currentFilePath">File path</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(dynamic errorDetails, string currentFilePath)
		{
			var message = (string)errorDetails.to_s();
			var filePath = (string)errorDetails.sass_filename();
			if (string.IsNullOrWhiteSpace(filePath))
			{
				filePath = currentFilePath;
			}
			var lineNumber = (int)errorDetails.sass_line();

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

			return errorMessage.ToString();
		}
	}
}