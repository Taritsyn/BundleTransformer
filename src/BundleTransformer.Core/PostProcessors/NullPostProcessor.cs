using System;
using System.Collections.Generic;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Resources;

namespace BundleTransformer.Core.PostProcessors
{
	/// <summary>
	/// Null postprocessor (used as a placeholder)
	/// </summary>
	public sealed class NullPostProcessor : PostProcessorBase
	{
		/// <summary>
		/// Do not performs operations with asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset</returns>
		public override IAsset PostProcess(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentNullException(
					nameof(asset),
					string.Format(Strings.Common_ArgumentIsNull, nameof(asset))
				);
			}

			return asset;
		}

		/// <summary>
		/// Do not performs operations with assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets</returns>
		public override IList<IAsset> PostProcess(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentNullException(
					nameof(assets),
					string.Format(Strings.Common_ArgumentIsNull, nameof(assets))
				);
			}

			return assets;
		}
	}
}