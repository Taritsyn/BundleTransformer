namespace BundleTransformer.TypeScript.HttpHandlers
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
	/// of translated TypeScript-asset
	/// </summary>
	public abstract class TypeScriptAssetHandlerBase : AssetHandlerBase
	{
		/// <summary>
		/// Asset content type
		/// </summary>
		public override string ContentType
		{
			get { return Core.Constants.ContentType.Js; }
		}


		/// <summary>
		/// Constructs a instance of base TypeScript asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler,
		/// that responsible for text output of processed asset</param>
		protected TypeScriptAssetHandlerBase(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig)
		{ }


		/// <summary>
		/// Translates a code of asset written on TypeScript to JS-code
		/// </summary>
		/// <param name="asset">Asset with code written on TypeScript</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Asset with translated code</returns>
		protected override IAsset ProcessAsset(IAsset asset, bool isDebugMode)
		{
			ITranslator typeScriptTranslator = BundleTransformerContext.Current.GetJsTranslatorInstance(
				Core.Constants.TranslatorName.TypeScriptTranslator);
			typeScriptTranslator.IsDebugMode = isDebugMode;

			IAsset processedAsset = typeScriptTranslator.Translate(asset);

			return processedAsset;
		}
	}
}