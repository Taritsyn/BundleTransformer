namespace BundleTransformer.SassAndScss.Translators
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using LibSassHost;
	using LibSassHost.Helpers;
	using LshIndentType = LibSassHost.IndentType;
	using LshLineFeedType = LibSassHost.LineFeedType;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Resources;
	using Core.Translators;
	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Internal;
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
		/// Value that indicates if the virtual file system wrapper is set
		/// </summary>
		private static InterlockedStatedFlag _virtualFileSystemWrapperSetFlag = new InterlockedStatedFlag();

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
			: this(BundleTransformerContext.Current.Configuration.GetSassAndScssSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Sass- and SCSS-translator
		/// </summary>
		/// <param name="sassAndScssConfig">Configuration settings of Sass- and SCSS-translator</param>
		public SassAndScssTranslator(SassAndScssSettings sassAndScssConfig)
		{
			UseNativeMinification = sassAndScssConfig.UseNativeMinification;
			IncludePaths = sassAndScssConfig.IncludePaths
				.Cast<IncludedPathRegistration>()
				.Select(p => p.Path)
				.ToList()
				;
			IndentType = sassAndScssConfig.IndentType;
			IndentWidth = sassAndScssConfig.IndentWidth;
			LineFeedType = sassAndScssConfig.LineFeedType;
			Precision = sassAndScssConfig.Precision;
			SourceComments = sassAndScssConfig.SourceComments;
		}


		/// <summary>
		/// Sets a virtual file system wrapper
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public static void SetVirtualFileSystemWrapper(IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			if (virtualFileSystemWrapper == null)
			{
				throw new ArgumentNullException("virtualFileSystemWrapper",
					string.Format(CoreStrings.Common_ArgumentIsNull, "virtualFileSystemWrapper"));
			}

			_virtualFileSystemWrapperSetFlag.Set();
			SassCompiler.FileManager = new VirtualFileManager(virtualFileSystemWrapper);
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

			InnerTranslate(asset, NativeMinificationEnabled);

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

			bool enableNativeMinification = NativeMinificationEnabled;

			foreach (var asset in assetsToProcessing)
			{
				InnerTranslate(asset, enableNativeMinification);
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, bool enableNativeMinification)
		{
			if (_virtualFileSystemWrapperSetFlag.Set())
			{
				IVirtualFileSystemWrapper virtualFileSystemWrapper =
					BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper();
				SassCompiler.FileManager = new VirtualFileManager(virtualFileSystemWrapper);
			}

			string assetTypeName = asset.AssetTypeCode == Constants.AssetTypeCode.Sass ? "Sass" : "SCSS";
			string newContent;
			string assetUrl = asset.Url;
			IList<string> dependencies;
			CompilationOptions options = CreateCompilationOptions(enableNativeMinification);

			try
			{
				CompilationResult result = SassCompiler.Compile(asset.Content, assetUrl, options: options);
				newContent = result.CompiledContent;
				dependencies = result.IncludedFilePaths;
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
		private CompilationOptions CreateCompilationOptions(bool enableNativeMinification)
		{
			var options = new CompilationOptions
			{
				IncludePaths = IncludePaths,
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