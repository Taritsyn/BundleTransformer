namespace BundleTransformer.Closure.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Diagnostics;
	using System.IO;
	using System.Linq;
	using System.Text;
	using System.Web;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Resources;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using Google Closure Compiler Application
	/// </summary>
	public sealed class ClosureLocalJsMinifier : ClosureJsMinifierBase
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Closure Local JS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";

		/// <summary>
		/// Absolute path to directory that contains temporary files
		/// </summary>
		private readonly string _tempFilesDirectoryPath;

		/// <summary>
		/// Gets or sets a path to Java Virtual Machine
		/// </summary>
		public string JavaVirtualMachinePath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a path to Google Closure Compiler Application
		/// </summary>
		public string ClosureCompilerApplicationPath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a language spec that input sources conform
		/// </summary>
		public LanguageSpec LanguageSpec
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to check source validity 
		/// but do not enforce Closure style rules and conventions
		/// </summary>
		public bool ThirdParty
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to process built-ins from 
		/// the jQuery library, such as jQuery.fn and jQuery.extend()
		/// </summary>
		public bool ProcessJqueryPrimitives
		{
			get;
			set; 
		}

		/// <summary>
		/// Gets or sets a flag for whether to process built-ins from 
		/// the Closure library, such as goog.require(), goog.provide() and goog.exportSymbol()
		/// </summary>
		public bool ProcessClosurePrimitives
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of Closure Local JS-minifier
		/// </summary>
		public ClosureLocalJsMinifier()
			: this(BundleTransformerContext.Current.Configuration.GetClosureSettings())
		{ }

		/// <summary>
		/// Constructs instance of Closure Local JS-minifier
		/// </summary>
		/// <param name="closureConfig">Configuration settings of Closure Minifier</param>
		public ClosureLocalJsMinifier(ClosureSettings closureConfig)
			: this(closureConfig, HttpContext.Current.Server.MapPath(Core.Constants.Common.TempFilesDirectoryPath))
		{ }

		/// <summary>
		/// Constructs instance of Closure Local JS-minifier
		/// </summary>
		/// <param name="closureConfig">Configuration settings of Closure Minifier</param>
		/// <param name="tempFilesDirectoryPath">Absolute path to directory that contains temporary files</param>
		public ClosureLocalJsMinifier(ClosureSettings closureConfig, string tempFilesDirectoryPath)
		{
			_tempFilesDirectoryPath = tempFilesDirectoryPath;

			LocalJsMinifierSettings localJsMinifierConfig = closureConfig.Js.Local;
			JavaVirtualMachinePath = localJsMinifierConfig.JavaVirtualMachinePath;
			ClosureCompilerApplicationPath = localJsMinifierConfig.ClosureCompilerApplicationPath;
			CompilationLevel = localJsMinifierConfig.CompilationLevel;
			PrettyPrint = localJsMinifierConfig.PrettyPrint;
			LanguageSpec = localJsMinifierConfig.LanguageSpec;
			ThirdParty = localJsMinifierConfig.ThirdParty;
			ProcessJqueryPrimitives = localJsMinifierConfig.ProcessJqueryPrimitives;
			ProcessClosurePrimitives = localJsMinifierConfig.ProcessClosurePrimitives;
			Severity = localJsMinifierConfig.Severity;
		}


		/// <summary>
		/// Produces code minifiction of JS-assets by using Google Closure Compiler Application
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of JS-assets with minified text content</returns>
		public override IList<IAsset> Minify(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.IsScript && !a.Minified).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			string javaVirtualMachinePath = JavaVirtualMachinePath;
			if (string.IsNullOrWhiteSpace(javaVirtualMachinePath))
			{
				throw new EmptyValueException(Strings.Minifiers_JavaVirtualMachinePathNotSpecified);
			}
			if (!File.Exists(javaVirtualMachinePath))
			{
				throw new FileNotFoundException(
					string.Format(Strings.Minifiers_JavaVirtualMachineNotFound, javaVirtualMachinePath));
			}

			string closureCompilerApplicationPath = ClosureCompilerApplicationPath;
			if (string.IsNullOrWhiteSpace(closureCompilerApplicationPath))
			{
				throw new EmptyValueException(Strings.Minifiers_ClosureCompilerApplicationPathNotSpecified);
			}
			if (!File.Exists(closureCompilerApplicationPath))
			{
				throw new FileNotFoundException(
					string.Format(Strings.Minifiers_ClosureCompilerApplicationNotFound, closureCompilerApplicationPath));
			}

			if (!Directory.Exists(_tempFilesDirectoryPath))
			{
				Directory.CreateDirectory(_tempFilesDirectoryPath);
			}

			foreach (var asset in assetsToProcessing)
			{
				string newContent = Compile(asset.Content, asset.VirtualPath);

				asset.Content = newContent;
				asset.Minified = true;
			}

			return assets;
		}

		/// <summary>
		/// "Compiles" JS-code by using Google Closure Compiler Application
		/// </summary>
		/// <param name="content">Text content of JS-asset</param>
		/// <param name="assetVirtualPath">Virtual path to JS-asset file</param>
		/// <returns>Minified text content of JS-asset</returns>
		private string Compile(string content, string assetVirtualPath)
		{
			string newContent;
			string uniqueId = Guid.NewGuid().ToString();
			string inputFilePath = Path.Combine(_tempFilesDirectoryPath, uniqueId + ".tmp");
			string outputFilePath = Path.Combine(_tempFilesDirectoryPath, uniqueId + "-min.tmp");
			int severity = Severity;

			using (var file = new StreamWriter(inputFilePath))
			{
				file.Write(content);
			}

			var args = new StringBuilder();
			args.AppendFormat(@"-jar ""{0}"" ", ClosureCompilerApplicationPath);
			args.AppendFormat(@"--compilation_level {0} ", ConvertCompilationLevelEnumValueToCode(CompilationLevel));
			if (PrettyPrint)
			{
				args.Append("--formatting PRETTY_PRINT ");
			}
			args.AppendFormat(@"--js ""{0}"" ", inputFilePath);
			args.AppendFormat(@"--js_output_file ""{0}"" ", outputFilePath);
			args.AppendFormat("--language_in={0} ", ConvertLanguageSpecEnumValueToCode(LanguageSpec));
			if (ThirdParty)
			{
				args.AppendFormat("--third_party ");
			}
			if (ProcessJqueryPrimitives)
			{
				args.AppendFormat("--process_jquery_primitives ");
			}
			if (ProcessClosurePrimitives)
			{
				args.AppendFormat("--process_closure_primitives ");
			}
			if (severity > 0)
			{
				if (severity >= 1 && severity <= 3)
				{
					args.Append("--warning_level ");
					if (severity == 1)
					{
						args.Append("QUIET ");
					}
					else if (severity == 2)
					{
						args.Append("DEFAULT ");
					}
					else if (severity == 3)
					{
						args.Append("VERBOSE ");
					}
				}
			}
			else
			{
				args.Append("--warning_level QUIET ");
				args.Append("--jscomp_off=accessControls ");
				args.Append("--jscomp_off=ambiguousFunctionDecl ");
				args.Append("--jscomp_off=checkRegExp ");
				args.Append("--jscomp_off=checkTypes ");
				args.Append("--jscomp_off=checkVars ");
				args.Append("--jscomp_off=constantProperty ");
				args.Append("--jscomp_off=deprecated ");
				args.Append("--jscomp_off=duplicateMessage ");
				args.Append("--jscomp_off=es5Strict ");
				args.Append("--jscomp_off=externsValidation ");
				args.Append("--jscomp_off=fileoverviewTags ");
				args.Append("--jscomp_off=globalThis ");
				args.Append("--jscomp_off=internetExplorerChecks ");
				args.Append("--jscomp_off=invalidCasts ");
				args.Append("--jscomp_off=missingProperties ");
				args.Append("--jscomp_off=nonStandardJsDocs ");
				args.Append("--jscomp_off=strictModuleDepCheck ");
				args.Append("--jscomp_off=typeInvalidation ");
				args.Append("--jscomp_off=undefinedNames ");
				args.Append("--jscomp_off=undefinedVars ");
				args.Append("--jscomp_off=unknownDefines ");
				args.Append("--jscomp_off=uselessCode ");
				args.Append("--jscomp_off=visibility ");
			}

			var processInfo = new ProcessStartInfo
			{
				FileName = JavaVirtualMachinePath,
				Arguments = args.ToString(),
				CreateNoWindow = true,
				WindowStyle = ProcessWindowStyle.Hidden,
				UseShellExecute = false,
				RedirectStandardError = true
			};

			try
			{
				string errorDetails;

				using (var process = Process.Start(processInfo))
				{
					process.WaitForExit();

					using (StreamReader processOutputReader = process.StandardError)
					{
						errorDetails = processOutputReader.ReadToEnd();
					}
				}

				if (!string.IsNullOrWhiteSpace(errorDetails))
				{
					throw new ClosureCompilingException(errorDetails);
				}

				using (var file = new StreamReader(outputFilePath))
				{
					newContent = file.ReadToEnd();
				}
			}
			catch (ClosureCompilingException e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
						CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationFailed,
						CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message));
			}
			finally
			{
				File.Delete(outputFilePath);
				File.Delete(inputFilePath);
			}

			return newContent;
		}

		/// <summary>
		/// Convert language spec enum value to code
		/// </summary>
		/// <param name="languageSpec">Language spec enum value</param>
		/// <returns>Language spec code</returns>
		internal static string ConvertLanguageSpecEnumValueToCode(LanguageSpec languageSpec)
		{
			string code;

			switch (languageSpec)
			{
				case LanguageSpec.EcmaScript3:
					code = "ECMASCRIPT3";
					break;
				case LanguageSpec.EcmaScript5:
					code = "ECMASCRIPT5";
					break;
				case LanguageSpec.EcmaScript5Strict:
					code = "ECMASCRIPT5_STRICT";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						languageSpec.ToString(), typeof(LanguageSpec)));
			}

			return code;
		}
	}
}