namespace BundleTransformer.TypeScript.Translators
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.Linq;

	using JavaScriptEngineSwitcher.Core;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Translators;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Internal;

	/// <summary>
	/// Translator that responsible for translation of TypeScript-code to JS-code
	/// </summary>
	public sealed class TypeScriptTranslator : ITranslator
	{
		/// <summary>
		/// Name of input code type
		/// </summary>
		const string INPUT_CODE_TYPE = "TypeScript";

		/// <summary>
		/// Name of output code type
		/// </summary>
		const string OUTPUT_CODE_TYPE = "JS";

		/// <summary>
		/// Delegate that creates an instance of JavaScript engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Virtual file manager
		/// </summary>
		private readonly VirtualFileManager _virtualFileManager;

		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not report errors on unreachable code
		/// </summary>
		public bool AllowUnreachableCode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not report errors on unused labels
		/// </summary>
		public bool AllowUnusedLabels
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow inconsistently-cased references to the same file
		/// </summary>
		public bool ForceConsistentCasingInFileNames
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a end of line sequence, that used when emitting files:
		/// 'CRLF' (dos) or 'LF' (unix)
		/// </summary>
		public NewLineMode NewLine
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit outputs
		/// </summary>
		public bool NoEmit
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit helpers (e.g. <code>__extends</code> function)
		/// </summary>
		public bool NoEmitHelpers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit outputs if any errors were reported
		/// </summary>
		public bool NoEmitOnError
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not truncate type name in error messages
		/// </summary>
		public bool NoErrorTruncation
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to report errors for fallthrough cases in switch statement
		/// </summary>
		public bool NoFallthroughCasesInSwitch
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise error on expressions and declarations
		/// with an implied <code>any</code> type
		/// </summary>
		public bool NoImplicitAny
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to report error when not all code paths in function return a value
		/// </summary>
		public bool NoImplicitReturns
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise error on <code>this</code> expressions with
		/// an implied <code>any</code> type
		/// </summary>
		public bool NoImplicitThis
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not include a default library (<code>lib.d.ts</code>
		/// or <code>lib.es6.d.ts</code>)
		/// </summary>
		public bool NoLib
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to report errors on unused locals
		/// </summary>
		public bool NoUnusedLocals
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to report errors on unused parameters
		/// </summary>
		public bool NoUnusedParameters
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not erase const enum declarations in generated code
		/// </summary>
		public bool PreserveConstEnums
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit comments to output
		/// </summary>
		public bool RemoveComments
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip a default library checking
		/// </summary>
		public bool SkipDefaultLibCheck
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip type checking of declaration files
		/// </summary>
		public bool SkipLibCheck
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable strict null checks
		/// </summary>
		public bool StrictNullChecks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit declarations for code that has an
		/// <code>@internal</code> annotation
		/// </summary>
		public bool StripInternal
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress excess property checks for object literals
		/// </summary>
		public bool SuppressExcessPropertyErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress noImplicitAny errors for indexing objects lacking
		/// index signatures
		/// </summary>
		public bool SuppressImplicitAnyIndexErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a ECMAScript target version: `EcmaScript3` (default), `EcmaScript5`,
		/// or `EcmaScript2015` (experimental)
		/// </summary>
		public TargetMode Target
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of TypeScript-translator
		/// </summary>
		public TypeScriptTranslator()
			: this(null,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetTypeScriptSettings())
		{ }

		/// <summary>
		/// Constructs a instance of TypeScript-translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="tsConfig">Configuration settings of TypeScript-translator</param>
		public TypeScriptTranslator(Func<IJsEngine> createJsEngineInstance,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			TypeScriptSettings tsConfig)
		{
			_virtualFileManager = new VirtualFileManager(virtualFileSystemWrapper);

			AllowUnreachableCode = tsConfig.AllowUnreachableCode;
			AllowUnusedLabels = tsConfig.AllowUnusedLabels;
			ForceConsistentCasingInFileNames = tsConfig.ForceConsistentCasingInFileNames;
			NewLine = tsConfig.NewLine;
			NoEmit = tsConfig.NoEmit;
			NoEmitHelpers = tsConfig.NoEmitHelpers;
			NoEmitOnError = tsConfig.NoEmitOnError;
			NoErrorTruncation = tsConfig.NoErrorTruncation;
			NoFallthroughCasesInSwitch = tsConfig.NoFallthroughCasesInSwitch;
			NoImplicitAny = tsConfig.NoImplicitAny;
			NoImplicitReturns = tsConfig.NoImplicitReturns;
			NoImplicitThis = tsConfig.NoImplicitThis;
			NoLib = tsConfig.NoLib;
			NoUnusedLocals = tsConfig.NoUnusedLocals;
			NoUnusedParameters = tsConfig.NoUnusedParameters;
			PreserveConstEnums = tsConfig.PreserveConstEnums;
			RemoveComments = tsConfig.RemoveComments;
			SkipDefaultLibCheck = tsConfig.SkipDefaultLibCheck;
			SkipLibCheck = tsConfig.SkipLibCheck;
			StrictNullChecks = tsConfig.StrictNullChecks;
			StripInternal = tsConfig.StripInternal;
			SuppressExcessPropertyErrors = tsConfig.SuppressExcessPropertyErrors;
			SuppressImplicitAnyIndexErrors = tsConfig.SuppressImplicitAnyIndexErrors;
			Target = tsConfig.Target;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = tsConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"typeScript",
							@"
  * JavaScriptEngineSwitcher.Msie
  * JavaScriptEngineSwitcher.V8
  * JavaScriptEngineSwitcher.ChakraCore",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () => JsEngineSwitcher.Instance.CreateEngine(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Translates a code of asset written on TypeScript to JS-code
		/// </summary>
		/// <param name="asset">Asset with code written on TypeScript</param>
		/// <returns>Asset with translated code</returns>
		public IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			CompilationOptions options = CreateCompilationOptions();

			using (var typeScriptCompiler = new TypeScriptCompiler(_createJsEngineInstance,
				_virtualFileManager, options))
			{
				InnerTranslate(asset, typeScriptCompiler);
			}

			return asset;
		}

		/// <summary>
		/// Translates a code of assets written on TypeScript to JS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on TypeScript</param>
		/// <returns>Set of assets with translated code</returns>
		public IList<IAsset> Translate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.AssetTypeCode == Constants.AssetTypeCode.TypeScript).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			CompilationOptions options = CreateCompilationOptions();

			using (var typeScriptCompiler = new TypeScriptCompiler(_createJsEngineInstance,
				_virtualFileManager, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerTranslate(asset, typeScriptCompiler);
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, TypeScriptCompiler typeScriptCompiler)
		{
			string newContent;
			string assetUrl = asset.Url;
			IList<string> dependencies;

			try
			{
				CompilationResult result = typeScriptCompiler.Compile(assetUrl);
				newContent = result.CompiledContent;
				dependencies = result.IncludedFilePaths;
			}
			catch (TypeScriptCompilationException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetUrl, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetUrl, e.Message));
			}

			asset.Content = newContent;
			asset.VirtualPathDependencies = dependencies;
		}

		/// <summary>
		/// Creates a compilation options
		/// </summary>
		/// <returns>Compilation options</returns>
		private CompilationOptions CreateCompilationOptions()
		{
			var options = new CompilationOptions
			{
				AllowUnreachableCode = AllowUnreachableCode,
				AllowUnusedLabels = AllowUnusedLabels,
				ForceConsistentCasingInFileNames = ForceConsistentCasingInFileNames,
				NewLine = NewLine,
				NoEmit = NoEmit,
				NoEmitHelpers = NoEmitHelpers,
				NoEmitOnError = NoEmitOnError,
				NoErrorTruncation = NoErrorTruncation,
				NoFallthroughCasesInSwitch = NoFallthroughCasesInSwitch,
				NoImplicitAny = NoImplicitAny,
				NoImplicitReturns = NoImplicitReturns,
				NoImplicitThis = NoImplicitThis,
				NoLib = NoLib,
				NoUnusedLocals = NoUnusedLocals,
				NoUnusedParameters = NoUnusedParameters,
				PreserveConstEnums = PreserveConstEnums,
				RemoveComments = RemoveComments,
				SkipDefaultLibCheck = SkipDefaultLibCheck,
				SkipLibCheck = SkipLibCheck,
				StrictNullChecks = StrictNullChecks,
				StripInternal = StripInternal,
				SuppressExcessPropertyErrors = SuppressExcessPropertyErrors,
				SuppressImplicitAnyIndexErrors = SuppressImplicitAnyIndexErrors,
				Target = Target
			};

			return options;
		}
	}
}