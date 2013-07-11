namespace BundleTransformer.Core.Filters
{
	using System.Collections.Generic;

	using Assets;

	/// <summary>
	/// Defines interface of asset filter
	/// </summary>
	public interface IFilter
	{
		/// <summary>
		/// Performs processing of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of processed assets</returns>
		IList<IAsset> Transform(IList<IAsset> assets);
	}
}
