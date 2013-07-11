namespace BundleTransformer.Csso.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Optimizers;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using Sergey Kryzhanovsky's CSSO (CSS Optimizer) version 1.2.17
	/// </summary>
	public sealed class KryzhanovskyCssMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "CSSO CSS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Gets or sets a flag for whether to disable structure minification
		/// </summary>
		public bool DisableRestructuring
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of Sergey Kryzhanovsky's CSS-minifier
		/// </summary>
		public KryzhanovskyCssMinifier()
			: this(BundleTransformerContext.Current.GetCssoConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Sergey Kryzhanovsky's CSS-minifier
		/// </summary>
		/// <param name="cssoConfig">Configuration settings of Sergey Kryzhanovsky's Minifier</param>
		public KryzhanovskyCssMinifier(CssoSettings cssoConfig)
		{
			DisableRestructuring = cssoConfig.CssMinifier.DisableRestructuring;
		}


		/// <summary>
		/// Produces code minifiction of CSS-assets by using Sergey Kryzhanovsky's CSSO (CSS Optimizer)
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

			bool disableRestructuring = DisableRestructuring;

			using (var cssOptimizer = new CssOptimizer())
			{
				foreach (var asset in assetsToProcessing)
				{
					string newContent;
					string assetVirtualPath = asset.VirtualPath;

					try
					{	
						newContent = cssOptimizer.Optimize(asset.Content, disableRestructuring);
					}
					catch (CssOptimizingException e)
					{
					    throw new AssetMinificationException(
					        string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
								CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message));
					}
					catch (Exception e)
					{
						throw new AssetMinificationException(
							string.Format(CoreStrings.Minifiers_MinificationFailed,
								CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message), e);
					}

					asset.Content = newContent;
					asset.Minified = true;
				}
			}

			return assets;
		}
	}
}