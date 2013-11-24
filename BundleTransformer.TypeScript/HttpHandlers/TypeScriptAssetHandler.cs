namespace BundleTransformer.TypeScript.HttpHandlers
{
	using System.Web;
	using System.Web.Caching;

	using Core;
	using Core.Configuration;
	using Core.FileSystem;

	/// <summary>
	/// Debugging HTTP-handler that responsible for text output 
	/// of translated TypeScript-asset
	/// </summary>
	public sealed class TypeScriptAssetHandler : TypeScriptAssetHandlerBase
	{
		/// <summary>
		/// Constructs a instance of TypeScript asset handler
		/// </summary>
		public TypeScriptAssetHandler()
			: this(HttpContext.Current.Cache,
				BundleTransformerContext.Current.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.GetCoreConfiguration().AssetHandler)
		{ }

		/// <summary>
		/// Constructs a instance of TypeScript asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler,
		/// that responsible for text output of processed asset</param>
		public TypeScriptAssetHandler(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig)
		{ }
	}
}