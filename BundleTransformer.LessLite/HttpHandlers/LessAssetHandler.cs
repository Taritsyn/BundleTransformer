namespace BundleTransformer.LessLite.HttpHandlers
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
	/// of translated LESS-asset
	/// </summary>
	public sealed class LessAssetHandler : AssetHandlerBase
	{
		/// <summary>
		/// Asset content type
		/// </summary>
		public override string ContentType
		{
			get { return Core.Constants.ContentType.Css; }
		}


		/// <summary>
		/// Constructs instance of LESS asset handler
		/// </summary>
		public LessAssetHandler()
			: this(HttpContext.Current.Cache,
				BundleTransformerContext.Current.GetFileSystemWrapper(),
				BundleTransformerContext.Current.GetCoreConfiguration().AssetHandler,
				BundleTransformerContext.Current.GetApplicationInfo())
		{ }

		/// <summary>
		/// Constructs instance of LESS asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="fileSystemWrapper">File system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of HTTP-handler that responsible 
		/// for text output of processed asset</param>
		/// <param name="applicationInfo">Information about web application</param>
		public LessAssetHandler(Cache cache, IFileSystemWrapper fileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig, IHttpApplicationInfo applicationInfo)
			: base(cache, fileSystemWrapper, assetHandlerConfig, applicationInfo)
		{ }


		/// <summary>
		/// Translates code of asset written on LESS to CSS-code
		/// </summary>
		/// <param name="asset">Asset with code written on LESS</param>
		/// <returns>Asset with translated code</returns>
		protected override IAsset ProcessAsset(IAsset asset)
		{
			ITranslator lessTranslator = BundleTransformerContext.Current.GetCssTranslatorInstance(
				Core.Constants.TranslatorName.LessTranslator);
			lessTranslator.IsDebugMode = _applicationInfo.IsDebugMode;

			IAsset processedAsset = lessTranslator.Translate(asset);

			return processedAsset;
		}
	}
}
