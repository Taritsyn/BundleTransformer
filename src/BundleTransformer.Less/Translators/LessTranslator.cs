using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;

using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Translators;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.Less.Configuration;
using BundleTransformer.Less.Internal;

namespace BundleTransformer.Less.Translators
{
	/// <summary>
	/// Translator that responsible for translation of LESS code to CSS code
	/// </summary>
	public sealed class LessTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// Name of input code type
		/// </summary>
		const string INPUT_CODE_TYPE = "LESS";

		/// <summary>
		/// Name of output code type
		/// </summary>
		const string OUTPUT_CODE_TYPE = "CSS";

		/// <summary>
		/// Delegate that creates an instance of JS engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Virtual file manager
		/// </summary>
		private readonly VirtualFileManager _virtualFileManager;

		/// <summary>
		/// Gets or sets a list of include paths
		/// </summary>
		public IList<string> IncludePaths
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enforce IE compatibility (IE8 data-uri)
		/// </summary>
		public bool IeCompat
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a math mode
		/// </summary>
		public MathMode Math
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether units need to evaluate correctly
		/// </summary>
		public bool StrictUnits
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a output mode of the debug information
		/// </summary>
		public LineNumbersMode DumpLineNumbers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable JS in less files
		/// </summary>
		public bool JavascriptEnabled
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a string representation of variable list, that can be referenced by the file
		/// (semicolon-separated list of values of the form VAR=VALUE)
		/// </summary>
		public string GlobalVariables
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a string representation of variable list, that modifies a variables
		/// already declared in the file (semicolon-separated list of values of the form VAR=VALUE)
		/// </summary>
		public string ModifyVariables
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - only error messages;
		///		1 - only error messages and warnings.
		/// </summary>
		public int Severity
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of LESS translator
		/// </summary>
		public LessTranslator()
			: this(null,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetLessSettings())
		{ }

		/// <summary>
		/// Constructs a instance of LESS translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="lessConfig">Configuration settings of LESS translator</param>
		public LessTranslator(Func<IJsEngine> createJsEngineInstance,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			LessSettings lessConfig)
		{
			_virtualFileManager = new VirtualFileManager(virtualFileSystemWrapper);

			UseNativeMinification = lessConfig.UseNativeMinification;
			IncludePaths = lessConfig.IncludePaths
				.Cast<IncludedPathRegistration>()
				.Select(p => p.Path)
				.ToList()
				;
			IeCompat = lessConfig.IeCompat;
			Math = lessConfig.Math;
			StrictUnits = lessConfig.StrictUnits;
			DumpLineNumbers = lessConfig.DumpLineNumbers;
			JavascriptEnabled = lessConfig.JavascriptEnabled;
			GlobalVariables = lessConfig.GlobalVariables;
			ModifyVariables = lessConfig.ModifyVariables;
			Severity = lessConfig.Severity;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = lessConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"less",
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
		/// Translates a code of asset written on LESS to CSS code
		/// </summary>
		/// <param name="asset">Asset with code written on LESS</param>
		/// <returns>Asset with translated code</returns>
		public override IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			CompilationOptions options = CreateCompilationOptions(enableNativeMinification);

			using (var lessCompiler = new LessCompiler(_createJsEngineInstance, _virtualFileManager, options))
			{
				InnerTranslate(asset, lessCompiler, enableNativeMinification);
			}

			return asset;
		}

		/// <summary>
		/// Translates a code of assets written on LESS to CSS code
		/// </summary>
		/// <param name="assets">Set of assets with code written on LESS</param>
		/// <returns>Set of assets with translated code</returns>
		public override IList<IAsset> Translate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.AssetTypeCode == Constants.AssetTypeCode.Less).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			CompilationOptions options = CreateCompilationOptions(enableNativeMinification);

			using (var lessCompiler = new LessCompiler(_createJsEngineInstance, _virtualFileManager, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerTranslate(asset, lessCompiler, enableNativeMinification);
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, LessCompiler lessCompiler, bool enableNativeMinification)
		{
			string newContent;
			string assetUrl = asset.Url;
			IList<string> dependencies;

			try
			{
				CompilationResult result = lessCompiler.Compile(asset.Content, assetUrl);
				newContent = result.CompiledContent;
				dependencies = result.IncludedFilePaths;
			}
			catch (FileNotFoundException)
			{
				throw;
			}
			catch (LessCompilationException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetUrl, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetUrl, e.Message), e);
			}

			asset.Content = newContent;
			asset.Minified = enableNativeMinification;
			asset.RelativePathsResolved = false;
			asset.VirtualPathDependencies = dependencies;
		}

		/// <summary>
		/// Creates a compilation options
		/// </summary>
		/// <param name="enableNativeMinification">Flag that indicating to use of native minification</param>
		/// <returns>Compilation options</returns>
		private CompilationOptions CreateCompilationOptions(bool enableNativeMinification)
		{
			var options = new CompilationOptions
			{
				EnableNativeMinification = enableNativeMinification,
				IncludePaths = IncludePaths,
				IeCompat = IeCompat,
				Math = Math,
				StrictUnits = StrictUnits,
				DumpLineNumbers = DumpLineNumbers,
				JavascriptEnabled = JavascriptEnabled,
				GlobalVariables = GlobalVariables,
				ModifyVariables = ModifyVariables,
				Severity = Severity
			};

			return options;
		}
	}
}