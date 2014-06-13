namespace BundleTransformer.Core.HttpHandlers
{
	using System.Web;
	using System.Web.Caching;

	using Assets;
	using Configuration;
	using FileSystem;

	/// <summary>
	/// Debugging HTTP-handler that responsible for text output 
	/// of translated JS-asset
	/// </summary>
	public sealed class JsAssetHandler : ScriptAssetHandlerBase
	{
		/// <summary>
		/// Gets a value indicating whether asset is static
		/// </summary>
		protected override bool IsStaticAsset
		{
			get { return true; }
		}


		/// <summary>
		/// Constructs a instance of the debugging JS HTTP-handler
		/// </summary>
		public JsAssetHandler()
			: this(HttpContext.Current.Cache,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetCoreSettings().AssetHandler)
		{ }

		/// <summary>
		/// Constructs a instance of the debugging JS HTTP-handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler</param>
		public JsAssetHandler(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig)
			: base(cache, virtualFileSystemWrapper, assetHandlerConfig)
		{ }


		/// <summary>
		/// Removes a additional file extension from path of specified JS-asset
		/// </summary>
		/// <param name="assetPath">Path of JS-asset</param>
		/// <returns>Path of JS-asset without additional file extension</returns>
		protected override string RemoveAdditionalFileExtension(string assetPath)
		{
			string processedAssetPath = Asset.RemoveAdditionalJsFileExtension(assetPath);

			return processedAssetPath;
		}
	}
}