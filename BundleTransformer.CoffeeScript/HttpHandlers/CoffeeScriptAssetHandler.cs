namespace BundleTransformer.CoffeeScript.HttpHandlers
{
	using System.Web;
	using System.Web.Caching;

	using Core;
	using Core.Configuration;
	using Core.FileSystem;
	
	/// <summary>
	/// Debugging HTTP-handler that responsible for text output 
	/// of translated CoffeeScript-asset
	/// </summary>
	public sealed class CoffeeScriptAssetHandler : CoffeeScriptAssetHandlerBase
	{
		/// <summary>
		/// Constructs a instance of CoffeeScript asset handler
		/// </summary>
		public CoffeeScriptAssetHandler()
			: this(HttpContext.Current.Cache,
				BundleTransformerContext.Current.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.GetCoreConfiguration().AssetHandler)
		{ }

		/// <summary>
		/// Constructs a instance of CoffeeScript asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler,
		/// that responsible for text output of processed asset</param>
		public CoffeeScriptAssetHandler(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig)
		{ }
	}
}