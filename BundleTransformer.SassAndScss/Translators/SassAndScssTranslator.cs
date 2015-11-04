namespace BundleTransformer.SassAndScss.Translators
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;

	using LibSassHost;
	using LibSassHost.Helpers;
	using LshIndentType = LibSassHost.IndentType;
	using LshLineFeedType = LibSassHost.LineFeedType;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Helpers;
	using Core.Resources;
	using Core.Translators;
	using Core.Utilities;
	using CoreFileExtensionHelpers = Core.Helpers.FileExtensionHelpers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using BtIndentType = IndentType;
	using BtLineFeedType = LineFeedType;

	/// <summary>
	/// Translator that responsible for translation of Sass- or SCSS-code to CSS-code
	/// </summary>
	public sealed class SassAndScssTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// Name of output code type
		/// </summary>
		const string OUTPUT_CODE_TYPE = "CSS";

		/// <summary>
		/// Sass file manager
		/// </summary>
		private readonly SassFileManager _fileManager;

		/// <summary>
		/// Synchronizer of translation
		/// </summary>
		private readonly object _translationSynchronizer = new object();

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
		/// Gets or sets a precision for fractional numbers
		/// </summary>
		public int Precision
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to emit comments in the generated CSS
		/// indicating the corresponding source line
		/// </summary>
		public bool SourceComments
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of Sass- and SCSS-translator
		/// </summary>
		public SassAndScssTranslator()
			: this(BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetSassAndScssSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Sass- and SCSS-translator
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="sassAndScssConfig">Configuration settings of Sass- and SCSS-translator</param>
		public SassAndScssTranslator(IVirtualFileSystemWrapper virtualFileSystemWrapper,
			SassAndScssSettings sassAndScssConfig)
		{
			_fileManager = new SassFileManager(virtualFileSystemWrapper);

			UseNativeMinification = sassAndScssConfig.UseNativeMinification;
			IndentType = sassAndScssConfig.IndentType;
			IndentWidth = sassAndScssConfig.IndentWidth;
			LineFeedType = sassAndScssConfig.LineFeedType;
			Precision = sassAndScssConfig.Precision;
			SourceComments = sassAndScssConfig.SourceComments;
		}


		/// <summary>
		/// Translates a code of asset written on Sass or SCSS to CSS-code
		/// </summary>
		/// <param name="asset">Asset with code written on Sass or SCSS</param>
		/// <returns>Asset with translated code</returns>
		public override IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "asset");
			}

			lock (_translationSynchronizer)
			{
				bool enableNativeMinification = NativeMinificationEnabled;

				using (var sassCompiler = new SassCompiler(_fileManager))
				{
					InnerTranslate(asset, sassCompiler, enableNativeMinification);
				}
			}

			return asset;
		}

		/// <summary>
		/// Translates a code of assets written on Sass or SCSS to CSS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on Sass or SCSS</param>
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

			var assetsToProcessing = assets.Where(a => a.AssetTypeCode == Constants.AssetTypeCode.Sass
				|| a.AssetTypeCode == Constants.AssetTypeCode.Scss).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			lock (_translationSynchronizer)
			{
				bool enableNativeMinification = NativeMinificationEnabled;

				using (var sassCompiler = new SassCompiler(_fileManager))
				{
					foreach (var asset in assetsToProcessing)
					{
						InnerTranslate(asset, sassCompiler, enableNativeMinification);
					}
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, SassCompiler sassCompiler, bool enableNativeMinification)
		{
			string assetTypeName = (asset.AssetTypeCode == Constants.AssetTypeCode.Sass) ? "Sass" : "SCSS";
			string newContent;
			string assetUrl = asset.Url;
			IList<string> dependencies;
			CompilationOptions options = CreateCompilationOptions(asset.AssetTypeCode, enableNativeMinification);

			_fileManager.CurrentDirectoryName = UrlHelpers.GetDirectoryName(assetUrl);

			try
			{
				CompilationResult result = sassCompiler.Compile(asset.Content, assetUrl, options: options);
				newContent = result.CompiledContent;
				dependencies = result.IncludedFilePaths;
			}
			catch (FileNotFoundException)
			{
				throw;
			}
			catch (SassСompilationException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						assetTypeName, OUTPUT_CODE_TYPE, assetUrl, SassErrorHelpers.Format(e)));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						assetTypeName, OUTPUT_CODE_TYPE, assetUrl, e.Message), e);
			}
			finally
			{
				_fileManager.CurrentDirectoryName = null;
			}

			asset.Content = newContent;
			asset.Minified = enableNativeMinification;
			asset.RelativePathsResolved = false;
			asset.VirtualPathDependencies = dependencies;
		}

		/// <summary>
		/// Creates a compilation options
		/// </summary>
		/// <param name="assetTypeCode">Asset type code</param>
		/// <param name="enableNativeMinification">Flag that indicating to use of native minification</param>
		/// <returns>Compilation options</returns>
		private CompilationOptions CreateCompilationOptions(string assetTypeCode, bool enableNativeMinification)
		{
			var options = new CompilationOptions
			{
				IndentedSyntax = (assetTypeCode == Constants.AssetTypeCode.Sass),
				IndentType = Utils.GetEnumFromOtherEnum<BtIndentType, LshIndentType>(IndentType),
				IndentWidth = IndentWidth,
				LineFeedType = Utils.GetEnumFromOtherEnum<BtLineFeedType, LshLineFeedType>(LineFeedType),
				OutputStyle = enableNativeMinification ? OutputStyle.Compressed : OutputStyle.Expanded,
				Precision = Precision,
				SourceComments = SourceComments
			};

			return options;
		}
	}
}