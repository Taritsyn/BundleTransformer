namespace BundleTransformer.Core.Filters
{
	using System;
	using System.Collections.Generic;

	using Assets;
	using Resources;

	/// <summary>
	/// Filter that responsible for removal of unnecessary JS-assets
	/// </summary>
	public sealed class JsUnnecessaryAssetsFilter : UnnecessaryAssetsFilterBase
	{
		/// <summary>
		/// Constructs instance of unnecessary JS-assets filter
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public JsUnnecessaryAssetsFilter(string[] ignorePatterns) : base(ignorePatterns)
		{ }


		/// <summary>
		/// Removes unnecessary JS-assets
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of necessary JS-assets</returns>
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
				string processedAssetPath = Asset.RemoveAdditionalJsFileExtension(asset.Path);
				if (!IsUnnecessaryAsset(processedAssetPath))
				{
					processedAssets.Add(asset);
				}
			}

			return processedAssets;
		}
	}
}