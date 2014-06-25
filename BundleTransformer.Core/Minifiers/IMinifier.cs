namespace BundleTransformer.Core.Minifiers
{
	using System.Collections.Generic;

	using Assets;

	/// <summary>
	/// Defines interface of asset minifier
	/// </summary>
	public interface IMinifier
	{
		/// <summary>
		/// Minify text content of asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset with minified text content</returns>
		IAsset Minify(IAsset asset);

		/// <summary>
		/// Minify text content of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets with minified text content</returns>
		IList<IAsset> Minify(IList<IAsset> assets);
	}
}