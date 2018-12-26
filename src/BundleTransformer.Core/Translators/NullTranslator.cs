using System;
using System.Collections.Generic;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Resources;

namespace BundleTransformer.Core.Translators
{
	/// <summary>
	/// Null translator (used as a placeholder)
	/// </summary>
	public sealed class NullTranslator : ITranslator
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
		/// Do not performs operations with asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset</returns>
		public IAsset Translate(IAsset asset)
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
		public IList<IAsset> Translate(IList<IAsset> assets)
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