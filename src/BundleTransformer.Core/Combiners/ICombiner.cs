namespace BundleTransformer.Core.Combiners
{
	using System.Collections.Generic;

	using Assets;

	/// <summary>
	/// Defines interface of asset combiner
	/// </summary>
	public interface ICombiner
	{
		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		bool IsDebugMode { get; set; }

		/// <summary>
		/// Gets or sets a flag for whether to enable tracing
		/// </summary>
		bool EnableTracing { get; set; }


		/// <summary>
		/// Combines a text content of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundleVirtualPath">Virtual path of bundle</param>
		/// <returns>Combined asset</returns>
		IAsset Combine(IList<IAsset> assets, string bundleVirtualPath);
	}
}