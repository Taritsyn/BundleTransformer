namespace BundleTransformer.SassAndScss.Compilers
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Reflection;
	using System.Text;

	using IronRuby;
	using Microsoft.Scripting;
	using Microsoft.Scripting.Hosting;

	using Core;
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
		const string SASS_LIBRARY_FILE_NAME = "sass_in_one.rb";

		/// <summary>
		/// Name of folder, which contains a IronRuby library
		/// </summary>
		const string IRONRUBY_FOLDER_NAME = "ironruby";

		/// <summary>
		/// Name of folder, which contains a Ruby library
		/// </summary>
		const string RUBY_FOLDER_NAME = @"ruby\1.9.1";

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
		/// Sass-compilation options
		/// </summary>
		private dynamic _sassOptions;

		/// <summary>
		/// Sass-compilation options with minification
		/// </summary>
		private dynamic _sassOptionsWithMinification;

		/// <summary>
		/// SCSS-compilation options
		/// </summary>
		private dynamic _scssOptions;

		/// <summary>
		/// SCSS-compilation options with minification
		/// </summary>
		private dynamic _scssOptionsWithMinification;

		/// <summary>
		/// Synchronizer of compilation
		/// </summary>
		private readonly object _compilationSynchronizer = new object();

		/// <summary>
		/// Flag that compiler is initialized
		/// </summary>
		private bool _initialized;


		/// <summary>
		/// Initializes compiler
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				_platformAdaptationLayer = new ResourceRedirectionPlatformAdaptationLayer(
					RESOURCES_NAMESPACE);

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
				_sassOptions = _scriptEngine.Execute("{:cache => false, :syntax => :sass}");
				_sassOptionsWithMinification = _scriptEngine.Execute(
					"{:cache => false, :syntax => :sass, :style => :compressed}");
				_scssOptions = _scriptEngine.Execute("{:cache => false, :syntax => :scss}");
				_scssOptionsWithMinification = _scriptEngine.Execute(
					"{:cache => false, :syntax => :scss, :style => :compressed}");

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" Sass- or SCSS-code to CSS-code
		/// </summary>
		/// <param name="content">Text content written on Sass or SCSS</param>
		/// <param name="filePath">Path to Sass- or SCSS-file</param>
		/// <param name="minifyOutput">Flag for whether to enable minification of output</param>
		/// <param name="dependentFilePaths">Paths to dependent files</param>
		/// <returns>Translated Sass- or SCSS-code</returns>
		public string Compile(string content, string filePath, bool minifyOutput, 
			IList<string> dependentFilePaths = null)
		{
			if (string.IsNullOrWhiteSpace(filePath))
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "filePath");
			}

			if (!File.Exists(filePath))
			{
				throw new FileNotFoundException(
					string.Format(CoreStrings.Common_FileNotExist, filePath), filePath);
			}

			lock (_compilationSynchronizer)
			{
				Initialize();

				dynamic compilerOptions;
				string fileExtension = Path.GetExtension(filePath);

				if (FileExtensionHelper.IsSass(fileExtension))
				{
					compilerOptions = minifyOutput ? _sassOptionsWithMinification : _sassOptions;
				}
				else if (FileExtensionHelper.IsScss(fileExtension))
				{
					compilerOptions = minifyOutput ? _scssOptionsWithMinification : _scssOptions;
				}
				else
				{
					throw new FormatException();
				}

				string directoryPath = Path.GetDirectoryName(filePath);
				if (string.IsNullOrWhiteSpace(directoryPath))
				{
					throw new EmptyValueException(CoreStrings.Common_ValueIsEmpty);
				}

				if (!directoryPath.Contains("\'"))
				{
					var statement = string.Format("Dir.chdir '{0}'", directoryPath);
					_scriptEngine.Execute(statement, _scriptScope);
				}

				if (dependentFilePaths != null)
				{
					dependentFilePaths.Add(filePath);
					_platformAdaptationLayer.OnOpenInputFileStream = accessedFile =>
					{
						if (!accessedFile.Contains(".sass-cache"))
						{
							dependentFilePaths.Add(accessedFile);
						}
					};
				}

				string newContent;
				
				try
				{
					newContent = (string)_sassEngine.compile(content, compilerOptions);
				}
				catch (Exception e)
				{
					if (e.Message == "Sass::SyntaxError") {
						throw new SassAndScssCompilingException(FormatErrorDetails(e, filePath), e);
					}
					else
					{
						throw;
					}
				}
				finally
				{
					_platformAdaptationLayer.OnOpenInputFileStream = null;
				}

				return newContent;
			}
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="filePath">File path</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(dynamic errorDetails, string filePath)
		{
			var message = (string)errorDetails.to_s();
			var path = (string)errorDetails.sass_filename() ?? filePath;
			var lineNumber = (int)errorDetails.sass_line();

			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, path);
			if (lineNumber > 0)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
					lineNumber.ToString());
			}

			return errorMessage.ToString();
		}
	}
}