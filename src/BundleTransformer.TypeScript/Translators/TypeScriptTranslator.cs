using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;

using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Translators;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.TypeScript.Configuration;
using BundleTransformer.TypeScript.Internal;

namespace BundleTransformer.TypeScript.Translators
{
	/// <summary>
	/// Translator that responsible for translation of TypeScript code to JS code
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
		/// Delegate that creates an instance of JS engine
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
		/// Gets or sets a flag for whether to parse in strict mode and emit
		/// <code>use strict</code> for each source file
		/// </summary>
		public bool AlwaysStrict
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to provide full support for iterables in <code>for-of</code>,
		/// spread, and destructuring when targeting 'ES5' or 'ES3'
		/// </summary>
		public bool DownlevelIteration
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to interpret optional property types as written, rather than adding
		/// <c>undefined</c>
		/// </summary>
		public bool ExactOptionalPropertyTypes
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
		/// Gets or sets a flag for whether to resolve <code>keyof</code> to string valued property names
		/// only (no numbers or symbols)
		/// </summary>
		public bool KeyofStringsOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a list of library file names to be included in the compilation
		/// </summary>
		public IList<string> Libs
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
		/// Gets or sets a flag for whether to ensure overriding members in derived classes are marked with an
		/// <code>override</code> modifier
		/// </summary>
		public bool NoImplicitOverride
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
		/// Gets or sets a flag for whether to require undeclared properties from index signatures to use
		/// element accesses
		/// </summary>
		public bool NoPropertyAccessFromIndexSignature
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not resolve a script references
		/// </summary>
		public bool NoResolve
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable strict checking of generic signatures
		/// in function types
		/// </summary>
		public bool NoStrictGenericChecks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to include <code>undefined</code> in index signature
		/// results
		/// </summary>
		public bool NoUncheckedIndexedAccess
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
		/// Gets or sets a flag for whether to enable strict <code>bind</code>, <code>call</code>
		/// and <code>apply</code> methods on functions
		/// </summary>
		public bool StrictBindCallApply
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
		/// Gets or sets a flag for whether to enable strict checking of function types
		/// </summary>
		public bool StrictFunctionTypes
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable strict checking of property
		/// initialization in classes
		/// </summary>
		public bool StrictPropertyInitialization
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
		/// Gets or sets a flag for whether to suppress type checking errors
		/// </summary>
		public bool SuppressTypeCheckingErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a ECMAScript target version: `EcmaScript3` (default), `EcmaScript5`,
		/// `EcmaScript2015`, `EcmaScript2016`, `EcmaScript2017`, `EcmaScript2018`, `EcmaScript2019`,
		/// `EcmaScript2020`, `EcmaScript2021` or `EcmaScriptNext`
		/// </summary>
		public TargetMode Target
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to run TypeScript to JS transpilation
		/// only (skip other passes)
		/// </summary>
		public bool TranspileOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to emit class fields with <code>Define</code> instead of <code>Set</code>
		/// </summary>
		public bool UseDefineForClassFields
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to use a type catch clause variables as <c>unknown</c> instead of
		/// <c>any</c>
		/// </summary>
		public bool UseUnknownInCatchVariables
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of TypeScript translator
		/// </summary>
		public TypeScriptTranslator()
			: this(null,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetTypeScriptSettings())
		{ }

		/// <summary>
		/// Constructs a instance of TypeScript translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="tsConfig">Configuration settings of TypeScript translator</param>
		public TypeScriptTranslator(Func<IJsEngine> createJsEngineInstance,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			TypeScriptSettings tsConfig)
		{
			_virtualFileManager = new VirtualFileManager(virtualFileSystemWrapper);

			AllowUnreachableCode = tsConfig.AllowUnreachableCode;
			AllowUnusedLabels = tsConfig.AllowUnusedLabels;
			AlwaysStrict = tsConfig.AlwaysStrict;
			DownlevelIteration = tsConfig.DownlevelIteration;
			ExactOptionalPropertyTypes = tsConfig.ExactOptionalPropertyTypes;
			ForceConsistentCasingInFileNames = tsConfig.ForceConsistentCasingInFileNames;
			KeyofStringsOnly = tsConfig.KeyofStringsOnly;
			Libs = tsConfig.Libs
				.Cast<LibraryFileRegistration>()
				.Select(l => l.LibraryFileName)
				.ToList()
				;
			NewLine = tsConfig.NewLine;
			NoEmit = tsConfig.NoEmit;
			NoEmitHelpers = tsConfig.NoEmitHelpers;
			NoEmitOnError = tsConfig.NoEmitOnError;
			NoErrorTruncation = tsConfig.NoErrorTruncation;
			NoFallthroughCasesInSwitch = tsConfig.NoFallthroughCasesInSwitch;
			NoImplicitAny = tsConfig.NoImplicitAny;
			NoImplicitOverride = tsConfig.NoImplicitOverride;
			NoImplicitReturns = tsConfig.NoImplicitReturns;
			NoImplicitThis = tsConfig.NoImplicitThis;
			NoLib = tsConfig.NoLib;
			NoPropertyAccessFromIndexSignature = tsConfig.NoPropertyAccessFromIndexSignature;
			NoResolve = tsConfig.NoResolve;
			NoStrictGenericChecks = tsConfig.NoStrictGenericChecks;
			NoUncheckedIndexedAccess = tsConfig.NoUncheckedIndexedAccess;
			NoUnusedLocals = tsConfig.NoUnusedLocals;
			NoUnusedParameters = tsConfig.NoUnusedParameters;
			PreserveConstEnums = tsConfig.PreserveConstEnums;
			RemoveComments = tsConfig.RemoveComments;
			SkipDefaultLibCheck = tsConfig.SkipDefaultLibCheck;
			SkipLibCheck = tsConfig.SkipLibCheck;
			StrictBindCallApply = tsConfig.StrictBindCallApply;
			StrictNullChecks = tsConfig.StrictNullChecks;
			StrictFunctionTypes = tsConfig.StrictFunctionTypes;
			StrictPropertyInitialization = tsConfig.StrictPropertyInitialization;
			StripInternal = tsConfig.StripInternal;
			SuppressExcessPropertyErrors = tsConfig.SuppressExcessPropertyErrors;
			SuppressImplicitAnyIndexErrors = tsConfig.SuppressImplicitAnyIndexErrors;
			SuppressTypeCheckingErrors = tsConfig.SuppressTypeCheckingErrors;
			Target = tsConfig.Target;
			TranspileOnly = tsConfig.TranspileOnly;
			UseDefineForClassFields = tsConfig.UseDefineForClassFields;
			UseUnknownInCatchVariables = tsConfig.UseUnknownInCatchVariables;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = tsConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"typeScript",
							@"
  * JavaScriptEngineSwitcher.Msie (only in the Chakra “Edge” JsRT mode)
  * JavaScriptEngineSwitcher.V8
  * JavaScriptEngineSwitcher.ChakraCore",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () => JsEngineSwitcher.Current.CreateEngine(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Translates a code of asset written on TypeScript to JS code
		/// </summary>
		/// <param name="asset">Asset with code written on TypeScript</param>
		/// <returns>Asset with translated code</returns>
		public IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentNullException(
					nameof(asset),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(asset))
				);
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
		/// Translates a code of assets written on TypeScript to JS code
		/// </summary>
		/// <param name="assets">Set of assets with code written on TypeScript</param>
		/// <returns>Set of assets with translated code</returns>
		public IList<IAsset> Translate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentNullException(
					nameof(assets),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(assets))
				);
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
				AlwaysStrict = AlwaysStrict,
				DownlevelIteration = DownlevelIteration,
				ExactOptionalPropertyTypes = ExactOptionalPropertyTypes,
				ForceConsistentCasingInFileNames = ForceConsistentCasingInFileNames,
				KeyofStringsOnly = KeyofStringsOnly,
				Libs = Libs,
				NewLine = NewLine,
				NoEmit = NoEmit,
				NoEmitHelpers = NoEmitHelpers,
				NoEmitOnError = NoEmitOnError,
				NoErrorTruncation = NoErrorTruncation,
				NoFallthroughCasesInSwitch = NoFallthroughCasesInSwitch,
				NoImplicitAny = NoImplicitAny,
				NoImplicitOverride = NoImplicitOverride,
				NoImplicitReturns = NoImplicitReturns,
				NoImplicitThis = NoImplicitThis,
				NoLib = NoLib,
				NoPropertyAccessFromIndexSignature = NoPropertyAccessFromIndexSignature,
				NoResolve = NoResolve,
				NoStrictGenericChecks = NoStrictGenericChecks,
				NoUncheckedIndexedAccess = NoUncheckedIndexedAccess,
				NoUnusedLocals = NoUnusedLocals,
				NoUnusedParameters = NoUnusedParameters,
				PreserveConstEnums = PreserveConstEnums,
				RemoveComments = RemoveComments,
				SkipDefaultLibCheck = SkipDefaultLibCheck,
				SkipLibCheck = SkipLibCheck,
				StrictBindCallApply = StrictBindCallApply,
				StrictNullChecks = StrictNullChecks,
				StrictFunctionTypes = StrictFunctionTypes,
				StrictPropertyInitialization = StrictPropertyInitialization,
				StripInternal = StripInternal,
				SuppressExcessPropertyErrors = SuppressExcessPropertyErrors,
				SuppressImplicitAnyIndexErrors = SuppressImplicitAnyIndexErrors,
				SuppressTypeCheckingErrors = SuppressTypeCheckingErrors,
				Target = Target,
				TranspileOnly = TranspileOnly,
				UseDefineForClassFields = UseDefineForClassFields,
				UseUnknownInCatchVariables = UseUnknownInCatchVariables
			};

			return options;
		}
	}
}