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
		/// Gets or sets a flag for whether to disable error reporting for unreachable code
		/// </summary>
		public bool AllowUnreachableCode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable error reporting for unused labels
		/// </summary>
		public bool AllowUnusedLabels
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to ensure <c>use strict</c> is always emitted
		/// </summary>
		public bool AlwaysStrict
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to emit more compliant, but verbose and less performant JavaScript for
		/// iteration
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
		/// Gets or sets a flag for whether to ensure that casing is correct in imports
		/// </summary>
		public bool ForceConsistentCasingInFileNames
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a version number of TypeScript for which deprecation warnings should be ignored
		/// </summary>
		public string IgnoreDeprecations
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to make keyof only return strings instead of string, numbers or symbols.
		/// Legacy option.
		/// </summary>
		[Obsolete]
		public bool KeyofStringsOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a set of bundled library declaration files that describe the target runtime environment
		/// </summary>
		public IList<string> Libs
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a newline character for emitting files
		/// </summary>
		public NewLineMode NewLine
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable full type checking (only critical parse and emit errors will be
		/// reported)
		/// </summary>
		public bool NoCheck
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting files from a compilation
		/// </summary>
		public bool NoEmit
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable generating custom helper functions like <c>__extends</c> in
		/// compiled output
		/// </summary>
		public bool NoEmitHelpers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting files if any type checking errors are reported
		/// </summary>
		public bool NoEmitOnError
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable truncating types in error messages
		/// </summary>
		public bool NoErrorTruncation
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting for fallthrough cases in switch statements
		/// </summary>
		public bool NoFallthroughCasesInSwitch
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting for expressions and declarations with an implied
		/// <c>any</c> type
		/// </summary>
		public bool NoImplicitAny
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to ensure overriding members in derived classes are marked with an override
		/// modifier
		/// </summary>
		public bool NoImplicitOverride
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting for codepaths that do not explicitly return in a
		/// function
		/// </summary>
		public bool NoImplicitReturns
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting when <c>this</c> is given the type <c>any</c>
		/// </summary>
		public bool NoImplicitThis
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable including any library files, including the default <c>lib.d.ts</c>
		/// </summary>
		public bool NoLib
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enforce using indexed accessors for keys declared using an indexed type
		/// </summary>
		public bool NoPropertyAccessFromIndexSignature
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow <c>import</c>s, <c>require</c>s or <c>&lt;reference&gt;</c>s
		/// from expanding the number of files TypeScript should add to a project
		/// </summary>
		public bool NoResolve
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable strict checking of generic signatures in function types
		/// </summary>
		[Obsolete]
		public bool NoStrictGenericChecks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add <c>undefined</c> to a type when accessed using an index
		/// </summary>
		public bool NoUncheckedIndexedAccess
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting when local variables aren't read
		/// </summary>
		public bool NoUnusedLocals
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise an error when a function parameter isn't read
		/// </summary>
		public bool NoUnusedParameters
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable erasing <c>const enum</c> declarations in generated code
		/// </summary>
		public bool PreserveConstEnums
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting comments
		/// </summary>
		public bool RemoveComments
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip type checking <c>.d.ts</c> files that are included with TypeScript
		/// </summary>
		public bool SkipDefaultLibCheck
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip type checking all <c>.d.ts</c> files
		/// </summary>
		public bool SkipLibCheck
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to check that the arguments for <c>bind</c>, <c>call</c>, and <c>apply</c>
		/// methods match the original function
		/// </summary>
		public bool StrictBindCallApply
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to take into account <c>null</c> and <c>undefined</c> when type checking
		/// </summary>
		public bool StrictNullChecks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to check to ensure parameters and the return values are subtype-compatible
		/// when assigning functions
		/// </summary>
		public bool StrictFunctionTypes
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to check for class properties that are declared but not set in the
		/// constructor
		/// </summary>
		public bool StrictPropertyInitialization
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting declarations that have <c>@internal</c> in their JSDoc
		/// comments
		/// </summary>
		public bool StripInternal
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable reporting of excess property errors during the creation of
		/// object literals
		/// </summary>
		[Obsolete]
		public bool SuppressExcessPropertyErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress <see cref="NoImplicitAny"/> errors when indexing objects that
		/// lack index signatures
		/// </summary>
		[Obsolete]
		public bool SuppressImplicitAnyIndexErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress type checking errors.
		/// Non-standard option.
		/// </summary>
		public bool SuppressTypeCheckingErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a JavaScript language version for emitted JavaScript and include compatible library
		/// declarations
		/// </summary>
		public TargetMode Target
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to run TypeScript to JS transpilation only (skip other passes).
		/// Non-standard option.
		/// </summary>
		public bool TranspileOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to emit ECMAScript-standard-compliant class fields
		/// </summary>
		public bool UseDefineForClassFields
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to use a default catch clause variables as <c>unknown</c> instead of
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
			IgnoreDeprecations = tsConfig.IgnoreDeprecations;
			#pragma warning disable CS0612
			KeyofStringsOnly = tsConfig.KeyofStringsOnly;
			#pragma warning restore CS0612
			Libs = tsConfig.Libs
				.Cast<LibraryFileRegistration>()
				.Select(l => l.LibraryFileName)
				.ToList()
				;
			NewLine = tsConfig.NewLine;
			NoCheck = tsConfig.NoCheck;
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
			#pragma warning disable CS0612
			NoStrictGenericChecks = tsConfig.NoStrictGenericChecks;
			#pragma warning restore CS0612
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
			#pragma warning disable CS0612
			SuppressExcessPropertyErrors = tsConfig.SuppressExcessPropertyErrors;
			SuppressImplicitAnyIndexErrors = tsConfig.SuppressImplicitAnyIndexErrors;
			#pragma warning restore CS0612
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
  * JavaScriptEngineSwitcher.ChakraCore
  * JavaScriptEngineSwitcher.Jint
  * JavaScriptEngineSwitcher.Msie (only in the Chakra modes)
  * JavaScriptEngineSwitcher.V8",
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
				IgnoreDeprecations = IgnoreDeprecations,
				#pragma warning disable CS0612
				KeyofStringsOnly = KeyofStringsOnly,
				#pragma warning restore CS0612
				Libs = Libs,
				NewLine = NewLine,
				NoCheck = NoCheck,
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
				#pragma warning disable CS0612
				NoStrictGenericChecks = NoStrictGenericChecks,
				#pragma warning restore CS0612
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
				#pragma warning disable CS0612
				SuppressExcessPropertyErrors = SuppressExcessPropertyErrors,
				SuppressImplicitAnyIndexErrors = SuppressImplicitAnyIndexErrors,
				#pragma warning restore CS0612
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