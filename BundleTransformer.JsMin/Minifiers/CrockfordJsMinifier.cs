namespace BundleTransformer.JsMin.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using DouglasCrockford;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code
	/// by using C# port of Douglas Crockford's JSMin
	/// </summary>
	public sealed class CrockfordJsMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "JSMin Minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";


		/// <summary>
		/// Produces a code minifiction of JS-asset by using C# port of
		/// Douglas Crockford's JSMin
		/// </summary>
		/// <param name="asset">JS-asset</param>
		/// <returns>JS-asset with minified text content</returns>
		public IAsset Minify(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			if (asset.Minified)
			{
				return asset;
			}

			var jsMin = new JsMinifier();

			InnerMinify(asset, jsMin);

			return asset;
		}

		/// <summary>
		/// Produces a code minifiction of JS-assets by using C# port of
		/// Douglas Crockford's JSMin
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of JS-assets with minified text content</returns>
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

			var assetsToProcessing = assets.Where(a => a.IsScript && !a.Minified).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			var jsMin = new JsMinifier();

			foreach (var asset in assetsToProcessing)
			{
				InnerMinify(asset, jsMin);
			}

			return assets;
		}

		private void InnerMinify(IAsset asset, JsMinifier jsMin)
		{
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = jsMin.Minify(asset.Content);
			}
			catch (JsMinificationException e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationFailed,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message));
			}

			asset.Content = newContent;
			asset.Minified = true;
		}
	}
}