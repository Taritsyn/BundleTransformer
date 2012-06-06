namespace BundleTransformer.CoffeeScript.HttpHandlers
{
	using System.Web;
	using System.Web.Caching;

	using Core;
	using Core.Assets;
	using Core.Configuration;
	using Core.FileSystem;
	using Core.HttpHandlers;
	using Core.Translators;

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
				BundleTransformerContext.Current.GetFileSystemWrapper(), 
				BundleTransformerContext.Current.GetCoreConfiguration().AssetHandler,
				BundleTransformerContext.Current.IsDebugMode)
		{ }

		/// <summary>
		/// Constructs instance of CoffeeScript asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="fileSystemWrapper">File system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of HTTP-handler that responsible 
		/// for text output of processed asset</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		public CoffeeScriptAssetHandler(Cache cache, IFileSystemWrapper fileSystemWrapper, 
			AssetHandlerSettings assetHandlerConfig, bool isDebugMode) 
				: base(cache, fileSystemWrapper, assetHandlerConfig, isDebugMode)
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
			coffeeScriptTranslator.IsDebugMode = _isDebugMode;

			IAsset processedAsset = coffeeScriptTranslator.Translate(asset);

			return processedAsset;
		}
	}
}
