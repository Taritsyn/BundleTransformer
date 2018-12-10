using System;
using System.Collections.Generic;
using System.Text;

using AdvancedStringBuilder;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Utilities;

namespace BundleTransformer.Core.Combiners
{
	/// <summary>
	/// Script asset combiner
	/// </summary>
	public sealed class ScriptCombiner : CombinerBase
	{
		protected override string GenerateCombinedAssetVirtualPath(string bundleVirtualPath)
		{
			string combinedAssetVirtualPath = bundleVirtualPath.TrimEnd();
			string combinedAssetExtension = Constants.FileExtension.JavaScript;

			if (!combinedAssetVirtualPath.EndsWith(combinedAssetExtension, StringComparison.OrdinalIgnoreCase))
			{
				combinedAssetVirtualPath += combinedAssetExtension;
			}

			return combinedAssetVirtualPath;
		}

		protected override string CombineAssetContent(IList<IAsset> assets)
		{
			var stringBuilderPool = StringBuilderPool.Shared;
			StringBuilder contentBuilder = stringBuilderPool.Rent();
			int assetCount = assets.Count;
			int lastAssetIndex = assetCount - 1;

			for (int assetIndex = 0; assetIndex < assetCount; assetIndex++)
			{
				IAsset asset = assets[assetIndex];
				string assetContent = asset.Content.TrimEnd();

				if (EnableTracing)
				{
					contentBuilder.AppendFormatLine("//#region URL: {0}", asset.Url);
				}
				contentBuilder.Append(assetContent);
				if (!assetContent.EndsWith(";"))
				{
					contentBuilder.Append(";");
				}
				if (EnableTracing)
				{
					contentBuilder.AppendLine();
					contentBuilder.AppendLine("//#endregion");
				}

				if (assetIndex != lastAssetIndex)
				{
					contentBuilder.AppendLine();
				}
			}

			string content = contentBuilder.ToString();
			stringBuilderPool.Return(contentBuilder);

			return content;
		}
	}
}