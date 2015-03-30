namespace BundleTransformer.Core.Filters
{
	using System;
	using System.Collections.Generic;

	using Assets;
	using Resources;

	/// <summary>
	/// Filter that responsible for removal of unnecessary style assets
	/// </summary>
	public sealed class StyleUnnecessaryAssetsFilter : UnnecessaryAssetsFilterBase
	{
		/// <summary>
		/// Constructs a instance of unnecessary style assets filter
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that
		/// should be ignored when processing</param>
		public StyleUnnecessaryAssetsFilter(string[] ignorePatterns) : base(ignorePatterns)
		{ }


		/// <summary>
		/// Removes a unnecessary style assets
		/// </summary>
		/// <param name="assets">Set of style assets</param>
		/// <returns>Set of necessary style assets</returns>
		public override IList<IAsset> Transform(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			if (_ignoreRegExps == null || _ignoreRegExps.Count == 0)
			{
				return assets;
			}

			var processedAssets = new List<IAsset>();

			foreach (var asset in assets)
			{
				string processedAssetVirtualPath = Asset.RemoveAdditionalCssFileExtension(asset.VirtualPath);
				if (!IsUnnecessaryAsset(processedAssetVirtualPath))
				{
					processedAssets.Add(asset);
				}
			}

			return processedAssets;
		}
	}
}