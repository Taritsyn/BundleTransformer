namespace BundleTransformer.Core.Filters
{
	using System;
	using System.Collections.Generic;

	using Assets;
	using Resources;

	/// <summary>
	/// Filter that responsible for removal of duplicate style assets
	/// </summary>
	public sealed class StyleDuplicateAssetsFilter : IFilter
	{
		/// <summary>
		/// Removes a duplicate style assets
		/// </summary>
		/// <param name="assets">Set of style assets</param>
		/// <returns>Set of unique style assets</returns>
		public IList<IAsset> Transform(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count <= 1)
			{
				return assets;
			}

			var processedAssets = new List<IAsset>();
			var processedAssetVirtualPaths = new List<string>();

			foreach (var asset in assets)
			{
				string processedAssetVirtualPath = asset.VirtualPath;
				if (asset.AssetTypeCode == Constants.AssetTypeCode.Css)
				{
					processedAssetVirtualPath = Asset.RemoveAdditionalCssFileExtension(processedAssetVirtualPath);
				}
				processedAssetVirtualPath = processedAssetVirtualPath.ToUpperInvariant();

				bool assetExist = processedAssetVirtualPaths.Contains(processedAssetVirtualPath);
				if (!assetExist)
				{
					processedAssets.Add(asset);
					processedAssetVirtualPaths.Add(processedAssetVirtualPath);
				}
			}

			processedAssetVirtualPaths.Clear();

			return processedAssets;
		}
	}
}