using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;

using AdvancedStringBuilder;
using DartSassHost;
using DartSassHost.Helpers;
using DshIndentType = DartSassHost.IndentType;
using DshLineFeedType = DartSassHost.LineFeedType;
using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Resources;
using BundleTransformer.Core.Translators;
using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.SassAndScss.Configuration;
using BundleTransformer.SassAndScss.Internal;
using BtIndentType = BundleTransformer.SassAndScss.IndentType;
using BtLineFeedType = BundleTransformer.SassAndScss.LineFeedType;

namespace BundleTransformer.SassAndScss.Translators
{
	/// <summary>
	/// Translator that responsible for translation of Sass or SCSS code to CSS code
	/// </summary>
	public sealed class SassAndScssTranslator : TranslatorWithNativeMinificationBase
	{
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
		/// Gets or sets a indent type
		/// </summary>
		public BtIndentType IndentType
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a number of spaces or tabs to be used for indentation
		/// </summary>
		public int IndentWidth
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a line feed type
		/// </summary>
		public BtLineFeedType LineFeedType
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs an instance of Sass and SCSS translator
		/// </summary>
		public SassAndScssTranslator()
			: this(null,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetSassAndScssSettings())
		{ }

		/// <summary>
		/// Constructs an instance of Sass and SCSS translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="sassAndScssConfig">Configuration settings of Sass and SCSS translator</param>
		public SassAndScssTranslator(Func<IJsEngine> createJsEngineInstance,
			IVirtualFileSystemWrapper virtualFileSystemWrapper, SassAndScssSettings sassAndScssConfig)
		{
			_virtualFileManager = new VirtualFileManager(virtualFileSystemWrapper);

			UseNativeMinification = sassAndScssConfig.UseNativeMinification;
			IncludePaths = sassAndScssConfig.IncludePaths
				.Cast<IncludedPathRegistration>()
				.Select(p => p.Path)
				.ToList()
				;
			IndentType = sassAndScssConfig.IndentType;
			IndentWidth = sassAndScssConfig.IndentWidth;
			LineFeedType = sassAndScssConfig.LineFeedType;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = sassAndScssConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"sassAndScss",
							@"
  * JavaScriptEngineSwitcher.Msie (only in the Chakra JsRT modes)
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
		/// Translates a code of asset written on Sass or SCSS to CSS code
		/// </summary>
		/// <param name="asset">Asset with code written on Sass or SCSS</param>
		/// <returns>Asset with translated code</returns>
		public override IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentNullException(
					nameof(asset),
					string.Format(Strings.Common_ArgumentIsNull, nameof(asset))
				);
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			CompilationOptions options = CreateCompilationOptions(enableNativeMinification);

			using (var sassCompiler = new SassCompiler(_createJsEngineInstance, _virtualFileManager, options))
			{
				InnerTranslate(asset, sassCompiler, enableNativeMinification);
			}

			return asset;
		}

		/// <summary>
		/// Translates a code of assets written on Sass or SCSS to CSS code
		/// </summary>
		/// <param name="assets">Set of assets with code written on Sass or SCSS</param>
		/// <returns>Set of assets with translated code</returns>
		public override IList<IAsset> Translate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentNullException(
					nameof(assets),
					string.Format(Strings.Common_ArgumentIsNull, nameof(assets))
				);
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.AssetTypeCode == Constants.AssetTypeCode.Sass
				|| a.AssetTypeCode == Constants.AssetTypeCode.Scss).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			CompilationOptions options = CreateCompilationOptions(enableNativeMinification);

			using (var sassCompiler = new SassCompiler(_createJsEngineInstance, _virtualFileManager, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerTranslate(asset, sassCompiler, enableNativeMinification);
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, SassCompiler sassCompiler, bool enableNativeMinification)
		{
			string assetTypeName = asset.AssetTypeCode == Constants.AssetTypeCode.Sass ? "Sass" : "SCSS";
			string newContent;
			string assetUrl = asset.Url;
			IList<string> dependencies;

			try
			{
				CompilationResult result = sassCompiler.Compile(asset.Content, assetUrl);
				newContent = result.CompiledContent;
				dependencies = result.IncludedFilePaths
					.Where(p => p != assetUrl)
					.ToList()
					;
			}
			catch (SassCompilationException e)
			{
				string errorDetails = SassErrorHelpers.GenerateErrorDetails(e, true);

				var stringBuilderPool = StringBuilderPool.Shared;
				StringBuilder errorMessageBuilder = stringBuilderPool.Rent();
				errorMessageBuilder.AppendLine(e.Message);
				errorMessageBuilder.AppendLine();
				errorMessageBuilder.Append(errorDetails);

				string errorMessage = errorMessageBuilder.ToString();
				stringBuilderPool.Return(errorMessageBuilder);

				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						assetTypeName, OUTPUT_CODE_TYPE, assetUrl, errorMessage));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						assetTypeName, OUTPUT_CODE_TYPE, assetUrl, e.Message), e);
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
			IList<string> processedIncludePaths = IncludePaths
				.Select(p => _virtualFileManager.ToAbsoluteVirtualPath(p))
				.ToList()
				;

			var options = new CompilationOptions
			{
				IncludePaths = processedIncludePaths,
				IndentType = Utils.GetEnumFromOtherEnum<BtIndentType, DshIndentType>(IndentType),
				IndentWidth = IndentWidth,
				LineFeedType = Utils.GetEnumFromOtherEnum<BtLineFeedType, DshLineFeedType>(LineFeedType),
				OutputStyle = enableNativeMinification ? OutputStyle.Compressed : OutputStyle.Expanded
			};

			return options;
		}
	}
}