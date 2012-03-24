namespace BundleTransformer.Core.Filters
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Assets;
	using Resources;

	/// <summary>
	/// Filter that responsible for removal of duplicate CSS-assets
	/// </summary>
	public sealed class CssDuplicateAssetsFilter : IFilter
	{
		/// <summary>
		/// Removes duplicate CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of unique CSS-assets</returns>
		public IList<IAsset> Transform(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var processedAssets = new List<IAsset>();

			foreach (var asset in assets)
			{
				string newAssetPath = Asset.RemoveAdditionalCssFileExtension(asset.Path);
				bool assetExist = processedAssets
				    .Where(a => a.Path.ToUpperInvariant() == newAssetPath.ToUpperInvariant())
				    .Count() > 0;

				if (!assetExist)
				{
					asset.Path = newAssetPath;

					processedAssets.Add(asset);
				}
			}

			return processedAssets;
		}
	}
}
