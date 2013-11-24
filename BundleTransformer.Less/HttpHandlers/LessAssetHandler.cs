namespace BundleTransformer.Less.HttpHandlers
{
	using System.Web;
	using System.Web.Caching;

	using Core;
	using Core.Configuration;
	using Core.FileSystem;

	/// <summary>
	/// Debugging HTTP-handler that responsible for text output 
	/// of translated LESS-asset
	/// </summary>
	public sealed class LessAssetHandler : LessAssetHandlerBase
	{
		/// <summary>
		/// Constructs a instance of LESS asset handler
		/// </summary>
		public LessAssetHandler()
			: this(HttpContext.Current.Cache,
				BundleTransformerContext.Current.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.GetCoreConfiguration().AssetHandler)
		{ }

		/// <summary>
		/// Constructs a instance of LESS asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler,
		/// that responsible for text output of processed asset</param>
		public LessAssetHandler(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig)
		{ }
	}
}