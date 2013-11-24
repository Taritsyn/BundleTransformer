namespace BundleTransformer.SassAndScss.HttpHandlers
{
	using System.Web.Caching;

	using Core;
	using Core.Assets;
	using Core.Configuration;
	using Core.FileSystem;
	using Core.HttpHandlers;
	using Core.Translators;

	/// <summary>
	/// Base class of the debugging HTTP-handler that responsible for text output 
	/// of translated Sass- or SCSS-asset
	/// </summary>
	public abstract class SassAndScssAssetHandlerBase : AssetHandlerBase
	{
		/// <summary>
		/// Asset content type
		/// </summary>
		public override string ContentType
		{
			get { return Core.Constants.ContentType.Css; }
		}


		/// <summary>
		/// Constructs a instance of base Sass and SCSS asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler,
		/// that responsible for text output of processed asset</param>
		protected SassAndScssAssetHandlerBase(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig)
		{ }


		/// <summary>
		/// Translates a code of asset written on Sass or SCSS to CSS-code
		/// </summary>
		/// <param name="asset">Asset with code written on Sass or SCSS</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Asset with translated code</returns>
		protected override IAsset ProcessAsset(IAsset asset, bool isDebugMode)
		{
			ITranslator sassAndScssTranslator = BundleTransformerContext.Current.GetCssTranslatorInstance(
				Core.Constants.TranslatorName.SassAndScssTranslator);
			sassAndScssTranslator.IsDebugMode = isDebugMode;

			IAsset processedAsset = sassAndScssTranslator.Translate(asset);

			return processedAsset;
		}
	}
}