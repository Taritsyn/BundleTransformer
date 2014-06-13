namespace BundleTransformer.Core.Constants
{
	/// <summary>
	/// Common constants
	/// </summary>
	public static class Common
	{
		/// <summary>
		/// Relative path to directory that contains temporary files
		/// </summary>
		public const string TempFilesDirectoryPath = "~/App_Data/BundleTransformer/Temp/";

		/// <summary>
		/// Pattern of cache item key, which stores text content of the processed asset
		/// </summary>
		internal const string ProcessedAssetContentCacheItemKeyPattern = "BT:ProcessedAssetContent_{0}";

		/// <summary>
		/// Name of QueryString-parameter that contains the virtual path of the bundle
		/// </summary>
		internal const string BundleVirtualPathQueryStringParameterName = "bundleVirtualPath";
	}
}