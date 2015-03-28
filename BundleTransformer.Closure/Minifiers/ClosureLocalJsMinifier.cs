namespace BundleTransformer.Closure.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Web;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Compilers;
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
		/// Gets or sets a flag for whether to allow usage of const keyword
		/// </summary>
		public bool AcceptConstKeyword
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow ES6 language output for compiling ES6 to ES6
		/// as well as transpiling to ES6 from lower versions
		/// </summary>
		public bool AllowEs6Output
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to generate <code>$inject</code> properties for
		/// AngularJS for functions annotated with <code>@ngInject</code>
		/// </summary>
		public bool AngularPass
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
		/// Gets or sets a string representation of variable list, that overrides the values of
		/// a variables annotated <code>@define</code> (semicolon-separated list of values of
		/// the form &lt;name&gt;[=&lt;val&gt;]). Where &lt;name&gt; is the name of a <code>@define</code>
		/// variable and &lt;val&gt; is a boolean, number, or a single-quoted string that contains no single quotes.
		/// If [=&lt;val&gt;] is omitted, the variable is marked true.
		/// </summary>
		public string DefinitionList
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the named classes of warnings, that
		/// need to make an errors
		/// </summary>
		public string ErrorList
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to generate export code for local properties
		/// marked with <code>@export</code>
		/// </summary>
		public bool ExportLocalPropertyDefinitions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated whitelist of tag names in JSDoc
		/// </summary>
		public string ExtraAnnotationNameList
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to generate export code for those marked with <code>@export</code>
		/// </summary>
		public bool GenerateExports
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a path to Java Virtual Machine
		/// </summary>
		public string JavaVirtualMachinePath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a language spec that input sources conform
		/// </summary>
		public ExperimentalLanguageSpec LanguageInput
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a language spec the output should conform to.
		/// If omitted, defaults to the value of <code>LanguageInput</code>.
		/// </summary>
		public ExperimentalLanguageSpec LanguageOutput
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to process built-ins from
		/// the Closure library, such as <code>goog.require()</code>, <code>goog.provide()</code>
		/// and <code>goog.exportSymbol()</code>
		/// </summary>
		public bool ProcessClosurePrimitives
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to process built-ins from
		/// the jQuery library, such as <code>jQuery.fn</code> and <code>jQuery.extend()</code>
		/// </summary>
		public bool ProcessJqueryPrimitives
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to output code with single quotes
		/// </summary>
		public bool SingleQuotes
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
		/// Gets or sets a flag for whether to run ES6 to ES3 transpilation only, skip other passes
		/// </summary>
		public bool TranspileOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the named classes of warnings, that
		/// need to turn off
		/// </summary>
		public string TurnOffWarningClassList
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to exclude the default externs
		/// </summary>
		public bool UseOnlyCustomExterns
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the named classes of warnings, that
		/// need to make a normal warning
		/// </summary>
		public string WarningList
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of Closure Local JS-minifier
		/// </summary>
		public ClosureLocalJsMinifier()
			: this(BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetClosureSettings(),
				HttpContext.Current.Server.MapPath(Core.Constants.Common.TempFilesDirectoryPath))
		{ }


		/// <summary>
		/// Constructs a instance of Closure Local JS-minifier
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="closureConfig">Configuration settings of Closure Minifier</param>
		/// <param name="tempFilesDirectoryPath">Absolute path to directory that contains temporary files</param>
		public ClosureLocalJsMinifier(IVirtualFileSystemWrapper virtualFileSystemWrapper,
			ClosureSettings closureConfig,
			string tempFilesDirectoryPath)
			: base(virtualFileSystemWrapper, closureConfig)
		{
			_tempFilesDirectoryPath = tempFilesDirectoryPath;

			LocalJsMinifierSettings localJsMinifierConfig = closureConfig.Js.Local;
			MapCommonSettings(this, localJsMinifierConfig);
			AcceptConstKeyword = localJsMinifierConfig.AcceptConstKeyword;
			AllowEs6Output = localJsMinifierConfig.AllowEs6Output;
			AngularPass = localJsMinifierConfig.AngularPass;
			ClosureCompilerApplicationPath = localJsMinifierConfig.ClosureCompilerApplicationPath;
			DefinitionList = localJsMinifierConfig.DefinitionList;
			ErrorList = localJsMinifierConfig.ErrorList;
			ExportLocalPropertyDefinitions = localJsMinifierConfig.ExportLocalPropertyDefinitions;
			ExtraAnnotationNameList = localJsMinifierConfig.ExtraAnnotationNameList;
			GenerateExports = localJsMinifierConfig.GenerateExports;
			JavaVirtualMachinePath = localJsMinifierConfig.JavaVirtualMachinePath;
			LanguageInput = localJsMinifierConfig.LanguageInput;
			LanguageOutput = localJsMinifierConfig.LanguageOutput;
			ProcessClosurePrimitives = localJsMinifierConfig.ProcessClosurePrimitives;
			ProcessJqueryPrimitives = localJsMinifierConfig.ProcessJqueryPrimitives;
			SingleQuotes = localJsMinifierConfig.SingleQuotes;
			ThirdParty = localJsMinifierConfig.ThirdParty;
			TranspileOnly = localJsMinifierConfig.TranspileOnly;
			TurnOffWarningClassList = localJsMinifierConfig.TurnOffWarningClassList;
			UseOnlyCustomExterns = localJsMinifierConfig.UseOnlyCustomExterns;
			WarningList = localJsMinifierConfig.WarningList;

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
		}


		/// <summary>
		/// Produces a code minifiction of JS-asset by using Google Closure Compiler Application
		/// </summary>
		/// <param name="asset">JS-asset</param>
		/// <returns>JS-asset with minified text content</returns>
		public override IAsset Minify(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			if (asset.Minified)
			{
				return asset;
			}

			DependencyCollection commonExternsDependencies = GetCommonExternsDependencies();

			using (var closureCompiler = new ClosureLocalJsCompiler(JavaVirtualMachinePath,
				ClosureCompilerApplicationPath, _tempFilesDirectoryPath,
				commonExternsDependencies, CreateCompilationOptions()))
			{
				InnerMinify(asset, commonExternsDependencies, closureCompiler);
			}

			return asset;
		}

		/// <summary>
		/// Produces a code minifiction of JS-assets by using Google Closure Compiler Application
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

			DependencyCollection commonExternsDependencies = GetCommonExternsDependencies();

			using (var closureCompiler = new ClosureLocalJsCompiler(JavaVirtualMachinePath,
				ClosureCompilerApplicationPath, _tempFilesDirectoryPath,
				commonExternsDependencies, CreateCompilationOptions()))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerMinify(asset, commonExternsDependencies, closureCompiler);
				}
			}

			return assets;
		}

		private void InnerMinify(IAsset asset, DependencyCollection commonExternsDependencies,
			ClosureLocalJsCompiler closureCompiler)
		{
			string newContent;
			string assetUrl = asset.Url;
			DependencyCollection assetExternsDependencies = GetAssetExternsDependencies(asset);

			try
			{
				newContent = closureCompiler.Compile(asset.Content, assetUrl, assetExternsDependencies);
			}
			catch (ClosureCompilingException e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationFailed,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message));
			}

			asset.Content = newContent;
			asset.Minified = true;
			FillAssetVirtualPathDependencies(asset, commonExternsDependencies, assetExternsDependencies);
		}

		/// <summary>
		/// Creates a compilation options
		/// </summary>
		/// <returns>Compilation options</returns>
		private LocalJsCompilationOptions CreateCompilationOptions()
		{
			var options = new LocalJsCompilationOptions
			{
				AcceptConstKeyword = AcceptConstKeyword,
				AllowEs6Output = AllowEs6Output,
				AngularPass = AngularPass,
				DefinitionList = DefinitionList,
				ErrorList = ErrorList,
				ExportLocalPropertyDefinitions = ExportLocalPropertyDefinitions,
				ExtraAnnotationNameList = ExtraAnnotationNameList,
				GenerateExports = GenerateExports,
				LanguageInput = LanguageInput,
				LanguageOutput = LanguageOutput,
				ProcessClosurePrimitives = ProcessClosurePrimitives,
				ProcessJqueryPrimitives = ProcessJqueryPrimitives,
				SingleQuotes = SingleQuotes,
				ThirdParty = ThirdParty,
				TranspileOnly = TranspileOnly,
				TurnOffWarningClassList = TurnOffWarningClassList,
				UseOnlyCustomExterns = UseOnlyCustomExterns,
				WarningList = WarningList
			};
			FillJsCompilationOptions(options);

			return options;
		}
	}
}