namespace BundleTransformer.Core.Validators
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Assets;
	using Resources;

	/// <summary>
	/// Validator that checks whether the specified assets are style assets
	/// </summary>
	public sealed class StyleAssetTypesValidator : IValidator
	{
		/// <summary>
		/// Validates whether the specified assets are style assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		public void Validate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return;
			}

			IList<IAsset> invalidAssets = assets.Where(a => !a.IsStylesheet).ToList();

			if (invalidAssets.Count > 0)
			{
				string[] invalidAssetsVirtualPaths = invalidAssets
					.Select(a => a.VirtualPath)
					.ToArray()
					;

				throw new InvalidAssetTypesException(
					string.Format(Strings.Assets_StyleAssetsContainAssetsWithInvalidTypes,
					string.Join(", ", invalidAssetsVirtualPaths)),
					invalidAssetsVirtualPaths);
			}
		}
	}
}