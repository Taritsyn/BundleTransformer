namespace BundleTransformer.Core.Minifiers
{
	using System;
	using System.Collections.Generic;

	using Assets;
	using Resources;

	/// <summary>
	/// Null minifier (used as a placeholder)
	/// </summary>
	public sealed class NullMinifier : IMinifier
	{
		/// <summary>
		/// Do not performs operations with asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset</returns>
		public IAsset Minify(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "asset");
			}

			return asset;
		}

		/// <summary>
		/// Do not performs operations with assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets</returns>
		public IList<IAsset> Minify(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "assets");
			}

			return assets;
		}
	}
}