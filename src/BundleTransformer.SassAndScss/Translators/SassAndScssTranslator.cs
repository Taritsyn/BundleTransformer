using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using AdvancedStringBuilder;
using LibSassHost;
using LibSassHost.Helpers;
using LshIndentType = LibSassHost.IndentType;
using LshLineFeedType = LibSassHost.LineFeedType;

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
		/// Synchronizer of Sass compiler's initialization
		/// </summary>
		private static readonly object _initializationSynchronizer = new object();

		/// <summary>
		/// Flag that indicates if the Sass compiler is initialized
		/// </summary>
		private static bool _initialized;

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
		/// Constructs an instance of Sass and SCSS translator
		/// </summary>
		public SassAndScssTranslator()
			: this(BundleTransformerContext.Current.Configuration.GetSassAndScssSettings())
		{ }

		/// <summary>
		/// Constructs an instance of Sass and SCSS translator
		/// </summary>
		/// <param name="sassAndScssConfig">Configuration settings of Sass and SCSS translator</param>
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
				throw new ArgumentNullException(
					nameof(virtualFileSystemWrapper),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(virtualFileSystemWrapper))
				);
			}

			IFileManager virtualFileManager = new VirtualFileManager(virtualFileSystemWrapper);

			lock (_initializationSynchronizer)
			{
				SassCompiler.FileManager = virtualFileManager;
				_initialized = true;
			}
		}

		/// <summary>
		/// Initializes a Sass compiler
		/// </summary>
		private static void Initialize()
		{
			if (!_initialized)
			{
				lock (_initializationSynchronizer)
				{
					if (!_initialized)
					{
						IVirtualFileSystemWrapper virtualFileSystemWrapper =
							BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper();
						IFileManager virtualFileManager = new VirtualFileManager(virtualFileSystemWrapper);

						SassCompiler.FileManager = virtualFileManager;
						_initialized = true;
					}
				}
			}
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

			Initialize();

			bool enableNativeMinification = NativeMinificationEnabled;
			CompilationOptions options = CreateCompilationOptions(enableNativeMinification);

			InnerTranslate(asset, options, enableNativeMinification);

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

			Initialize();

			bool enableNativeMinification = NativeMinificationEnabled;
			CompilationOptions options = CreateCompilationOptions(enableNativeMinification);

			foreach (var asset in assetsToProcessing)
			{
				InnerTranslate(asset, options, enableNativeMinification);
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, CompilationOptions sassOptions, bool enableNativeMinification)
		{
			string assetTypeName = asset.AssetTypeCode == Constants.AssetTypeCode.Sass ? "Sass" : "SCSS";
			string newContent;
			string assetUrl = asset.Url;
			IList<string> dependencies;

			try
			{
				CompilationResult result = SassCompiler.Compile(asset.Content, assetUrl, options: sassOptions);
				newContent = result.CompiledContent;
				dependencies = result.IncludedFilePaths;
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
					.Select(p => SassCompiler.FileManager.ToAbsolutePath(p))
					.ToList()
					;

			var options = new CompilationOptions
			{
				IncludePaths = processedIncludePaths,
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