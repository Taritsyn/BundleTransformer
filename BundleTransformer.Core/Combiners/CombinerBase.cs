namespace BundleTransformer.Core.Combiners
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Assets;
	using Resources;

	/// <summary>
	/// Base class of asset combiner
	/// </summary>
	public abstract class CombinerBase : ICombiner
	{
		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable tracing
		/// </summary>
		public bool EnableTracing
		{
			get;
			set;
		}


		/// <summary>
		/// Combines a text content of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundleVirtualPath">Virtual path of bundle</param>
		/// <returns>Combined asset</returns>
		public IAsset Combine(IList<IAsset> assets, string bundleVirtualPath)
		{
			int assetCount = assets.Count;
			if (assetCount == 0)
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "assets"), "assets");
			}

			bool isMinified;
			bool isRelativePathsResolved;

			if (assetCount == 1)
			{
				IAsset firstAsset = assets[0];
				isMinified = firstAsset.Minified;
				isRelativePathsResolved = firstAsset.RelativePathsResolved;
			}
			else
			{
				int minifiedAssetCount = assets.Count(a => a.Minified);
				int relativePathsResolvedAssetCount = assets.Count(a => a.RelativePathsResolved);

				isMinified = (minifiedAssetCount == assetCount);
				isRelativePathsResolved = (relativePathsResolvedAssetCount == assetCount);
			}

			IAsset combinedAsset = new Asset(GenerateCombinedAssetVirtualPath(bundleVirtualPath));
			combinedAsset.Content = CombineAssetContent(assets);
			combinedAsset.Minified = isMinified;
			combinedAsset.RelativePathsResolved = isRelativePathsResolved;
			combinedAsset.VirtualPathDependencies = CombineAssetVirtualPathDependencies(assets);

			return combinedAsset;
		}

		protected abstract string GenerateCombinedAssetVirtualPath(string bundleVirtualPath);

		protected abstract string CombineAssetContent(IList<IAsset> assets);

		protected IList<string> CombineAssetVirtualPathDependencies(IList<IAsset> assets)
		{
			var assetVirtualPaths = new List<string>();
			bool isDebugMode = IsDebugMode;

			foreach (var asset in assets)
			{
				assetVirtualPaths.Add(asset.VirtualPath);
				if (!isDebugMode && asset.VirtualPathDependencies.Count > 0)
				{
					assetVirtualPaths.AddRange(asset.VirtualPathDependencies);
				}
			}

			return assetVirtualPaths;
		}
	}
}