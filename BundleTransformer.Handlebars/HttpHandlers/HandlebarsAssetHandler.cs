namespace BundleTransformer.Handlebars.HttpHandlers
{
	using System.Web;
	using System.Web.Caching;

	using Core;
	using Core.Assets;
	using Core.Configuration;
	using Core.FileSystem;
	using Core.HttpHandlers;
	using Core.Transformers;

	using Translators;

	/// <summary>
	/// Debugging HTTP-handler that responsible for text output 
	/// of translated Handlebars-asset
	/// </summary>
	public sealed class HandlebarsAssetHandler : ScriptAssetHandlerBase
	{
		/// <summary>
		/// Gets a value indicating whether asset is static
		/// </summary>
		protected override bool IsStaticAsset
		{
			get { return false; }
		}


		/// <summary>
		/// Constructs a instance of the debugging Handlebars HTTP-handler
		/// </summary>
		public HandlebarsAssetHandler()
			: this(HttpContext.Current.Cache,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetCoreSettings().AssetHandler)
		{ }

		/// <summary>
		/// Constructs a instance of the debugging Handlebars HTTP-handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler</param>
		public HandlebarsAssetHandler(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig)
		{ }


		/// <summary>
		/// Translates a code of asset written on Handlebars to JS-code
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <param name="transformer">Transformer</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Translated asset</returns>
		protected override IAsset TranslateAsset(IAsset asset, ITransformer transformer, bool isDebugMode)
		{
			IAsset processedAsset = InnerTranslateAsset<HandlebarsTranslator>(
				Constants.TranslatorName.HandlebarsTranslator, asset, transformer, isDebugMode);

			return processedAsset;
		}
	}
}