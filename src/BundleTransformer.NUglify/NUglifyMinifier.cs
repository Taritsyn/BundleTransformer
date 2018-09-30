using System;
using System.Collections.Generic;
using System.Linq;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Minifiers;
using BundleTransformer.Core.Resources;
using NUglify;

namespace BundleTransformer.NUglify
{
	/// <summary>
	/// Javascript minifier based on NUglify
	/// </summary>
	public class NUglifyMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Uglify JS minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";

		/// <summary>
		/// Minifies JS asset using NUglify minifier.
		/// </summary>
		/// <param name="asset">The asset.</param>
		/// <returns>Asset with minified js content.</returns>
		public IAsset Minify(IAsset asset)
		{
			var uglifyResult = Uglify.Js(asset.Content);

			if (uglifyResult.HasErrors)
			{
				throw new AssetMinificationException(
					string.Format(Strings.Minifiers_MinificationSyntaxError, CODE_TYPE, asset.Url, MINIFIER_NAME,
						string.Join(Environment.NewLine, uglifyResult.Errors.Select(x => x.ToString()))));
			}

			asset.Content = uglifyResult.Code;
			asset.Minified = true;

			return asset;
		}

		/// <summary>
		/// Minifies JS assets using NUglify minifier.
		/// </summary>
		/// <param name="assets">The assets.</param>
		/// <returns>Set of assets with minified js content.</returns>
		public IList<IAsset> Minify(IList<IAsset> assets)
		{
			foreach (var asset in assets)
			{
				Minify(asset);
			}

			return assets;
		}
	}
}