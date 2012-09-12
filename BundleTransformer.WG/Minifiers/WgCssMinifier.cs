namespace BundleTransformer.WG.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using WebGrease;

	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// Minifier, which produces minifiction of CSS-code 
	/// by using WebGrease Semantic CSS-minifier
	/// </summary>
	public sealed class WgCssMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "WebGrease Semantic CSS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Produces code minifiction of CSS-assets by using WebGrease Semantic CSS-minifier
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of CSS-assets with minified text content</returns>
		public IList<IAsset> Minify(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.IsStylesheet && !a.Minified).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			var wgCssMinifier = new CssMinifier { ShouldMinify = true };

			foreach (var asset in assetsToProcessing)
			{
				string newContent;
				string assetPath = asset.Path;

				try
				{
					newContent = wgCssMinifier.Minify(asset.Content);
					string errorDetails = string.Join(Environment.NewLine, wgCssMinifier.Errors);

					if (!string.IsNullOrWhiteSpace(errorDetails))
					{
						throw new WgMinifyingException(errorDetails);
					}
				}
				catch (WgMinifyingException e)
				{
					throw new AssetMinificationException(
						string.Format(CoreStrings.Minifiers_MinificationSyntaxError, 
							CODE_TYPE, assetPath, MINIFIER_NAME, e.Message));
				}
				catch (Exception e)
				{
					throw new AssetMinificationException(
						string.Format(CoreStrings.Minifiers_MinificationFailed,
							CODE_TYPE, assetPath, MINIFIER_NAME, e.Message), e);
				}

				asset.Content = newContent;
				asset.Minified = true;
			}

			return assets;
		}
	}
}
