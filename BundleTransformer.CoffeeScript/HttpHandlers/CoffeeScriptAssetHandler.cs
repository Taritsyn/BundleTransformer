namespace BundleTransformer.CoffeeScript.HttpHandlers
{
	using System.Web;
	using System.Web.Caching;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.HttpHandlers;
	using Core.Translators;
	using Core.Web;

	/// <summary>
	/// HTTP-handler, which is responsible for text output 
	/// of translated CoffeeScript-asset
	/// </summary>
	public sealed class CoffeeScriptAssetHandler : AssetHandlerBase
	{
		/// <summary>
		/// Asset content type
		/// </summary>
		public override string ContentType
		{
			get { return Core.Constants.ContentType.Js; }
		}


		/// <summary>
		/// Constructs instance of CoffeeScript asset handler
		/// </summary>
		public CoffeeScriptAssetHandler()
			: this(HttpContext.Current.Cache, 
				BundleTransformerContext.Current.GetVirtualFileSystemWrapper(), 
				BundleTransformerContext.Current.GetApplicationInfo())
		{ }

		/// <summary>
		/// Constructs instance of CoffeeScript asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="applicationInfo">Information about web application</param>
		public CoffeeScriptAssetHandler(Cache cache, IVirtualFileSystemWrapper virtualFileSystemWrapper,
			IHttpApplicationInfo applicationInfo)
				: base(cache, virtualFileSystemWrapper, applicationInfo)
		{ }


		/// <summary>
		/// Translates code of asset written on CoffeeScript to JS-code
		/// </summary>
		/// <param name="asset">Asset with code written on CoffeeScript</param>
		/// <returns>Asset with translated code</returns>
		protected override IAsset ProcessAsset(IAsset asset)
		{
			ITranslator coffeeScriptTranslator = BundleTransformerContext.Current.GetJsTranslatorInstance(
				Core.Constants.TranslatorName.CoffeeScriptTranslator);
			coffeeScriptTranslator.IsDebugMode = _applicationInfo.IsDebugMode;

			IAsset processedAsset = coffeeScriptTranslator.Translate(asset);

			return processedAsset;
		}
	}
}