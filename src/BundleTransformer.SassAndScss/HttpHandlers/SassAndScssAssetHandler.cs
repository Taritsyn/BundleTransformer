using System.Web;
using System.Web.Caching;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Configuration;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.HttpHandlers;
using BundleTransformer.Core.Transformers;

using BundleTransformer.SassAndScss.Translators;

namespace BundleTransformer.SassAndScss.HttpHandlers
{
	/// <summary>
	/// Debugging HTTP-handler that responsible for text output
	/// of translated Sass- or SCSS-asset
	/// </summary>
	public sealed class SassAndScssAssetHandler : StyleAssetHandlerBase
	{
		/// <summary>
		/// Gets a value indicating whether asset is static
		/// </summary>
		protected override bool IsStaticAsset
		{
			get { return false; }
		}


		/// <summary>
		/// Constructs a instance of the debugging Sass and SCSS HTTP-handler
		/// </summary>
		public SassAndScssAssetHandler()
			: this(HttpContext.Current.Cache,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetCoreSettings().AssetHandler)
		{ }

		/// <summary>
		/// Constructs a instance of the debugging Sass and SCSS HTTP-handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler</param>
		public SassAndScssAssetHandler(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig)
		{ }


		/// <summary>
		/// Translates a code of asset written on Sass or SCSS to CSS-code
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <param name="transformer">Transformer</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Translated asset</returns>
		protected override IAsset TranslateAsset(IAsset asset, ITransformer transformer, bool isDebugMode)
		{
			IAsset processedAsset = InnerTranslateAsset<SassAndScssTranslator>(
				Constants.TranslatorName.SassAndScssTranslator, asset, transformer, isDebugMode);

			return processedAsset;
		}
	}
}