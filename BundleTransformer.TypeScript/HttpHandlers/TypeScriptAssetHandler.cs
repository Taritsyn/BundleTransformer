namespace BundleTransformer.TypeScript.HttpHandlers
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
	/// of translated TypeScript-asset
	/// </summary>
	public sealed class TypeScriptAssetHandler : AssetHandlerBase
	{
		/// <summary>
		/// Asset content type
		/// </summary>
		public override string ContentType
		{
			get { return Core.Constants.ContentType.Js; }
		}


		/// <summary>
		/// Constructs instance of TypeScript asset handler
		/// </summary>
		public TypeScriptAssetHandler()
			: this(HttpContext.Current.Cache,
				BundleTransformerContext.Current.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.GetCoreConfiguration().AssetHandler,
				BundleTransformerContext.Current.GetApplicationInfo())
		{ }

		/// <summary>
		/// Constructs instance of TypeScript asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of HTTP-handler that responsible 
		/// for text output of processed asset</param>
		/// <param name="applicationInfo">Information about web application</param>
		public TypeScriptAssetHandler(Cache cache, IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig, IHttpApplicationInfo applicationInfo)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig, applicationInfo)
		{ }


		/// <summary>
		/// Translates code of asset written on TypeScript to JS-code
		/// </summary>
		/// <param name="asset">Asset with code written on TypeScript</param>
		/// <returns>Asset with translated code</returns>
		protected override IAsset ProcessAsset(IAsset asset)
		{
			ITranslator typeScriptTranslator = BundleTransformerContext.Current.GetJsTranslatorInstance(
				Core.Constants.TranslatorName.TypeScriptTranslator);
			typeScriptTranslator.IsDebugMode = _applicationInfo.IsDebugMode;

			IAsset processedAsset = typeScriptTranslator.Translate(asset);

			return processedAsset;
		}
	}
}