namespace BundleTransformer.SassAndScss.HttpHandlers
{
	using System.Web;
	using System.Web.Caching;

	using Core;
	using Core.Assets;
	using Core.Configuration;
	using Core.FileSystem;
	using Core.HttpHandlers;
	using Core.Translators;
	using Core.Web;

	/// <summary>
	/// HTTP-handler, which is responsible for text output 
	/// of translated Sass- or SCSS-asset
	/// </summary>
	public sealed class SassAndScssAssetHandler : AssetHandlerBase
	{
		/// <summary>
		/// Asset content type
		/// </summary>
		public override string ContentType
		{
			get { return Core.Constants.ContentType.Css; }
		}


		/// <summary>
		/// Constructs instance of Sass and SCSS asset handler
		/// </summary>
		public SassAndScssAssetHandler()
			: this(HttpContext.Current.Cache,
				BundleTransformerContext.Current.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.GetCoreConfiguration().AssetHandler,
				BundleTransformerContext.Current.GetApplicationInfo())
		{ }

		/// <summary>
		/// Constructs instance of Sass and SCSS asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of HTTP-handler that responsible 
		/// for text output of processed asset</param>
		/// <param name="applicationInfo">Information about web application</param>
		public SassAndScssAssetHandler(Cache cache, IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig, IHttpApplicationInfo applicationInfo)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig, applicationInfo)
		{ }


		/// <summary>
		/// Translates code of asset written on Sass or SCSS to CSS-code
		/// </summary>
		/// <param name="asset">Asset with code written on Sass or SCSS</param>
		/// <returns>Asset with translated code</returns>
		protected override IAsset ProcessAsset(IAsset asset)
		{
			ITranslator sassAndScssTranslator = BundleTransformerContext.Current.GetCssTranslatorInstance(
				Core.Constants.TranslatorName.SassAndScssTranslator);
			sassAndScssTranslator.IsDebugMode = _applicationInfo.IsDebugMode;

			IAsset processedAsset = sassAndScssTranslator.Translate(asset);

			return processedAsset;
		}
	}
}
