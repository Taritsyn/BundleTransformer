using System.Collections.Generic;

using BundleTransformer.Core.Assets;

namespace BundleTransformer.Core.Minifiers
{
	/// <summary>
	/// Defines a interface of asset minifier
	/// </summary>
	public interface IMinifier
	{
		/// <summary>
		/// Minify a text content of asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset with minified text content</returns>
		IAsset Minify(IAsset asset);

		/// <summary>
		/// Minify a text content of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets with minified text content</returns>
		IList<IAsset> Minify(IList<IAsset> assets);
	}
}