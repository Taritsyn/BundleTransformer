namespace BundleTransformer.Packer.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Packers;
	
	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using Dean Edwards' Packer version 3.0
	/// </summary>
	public sealed class EdwardsJsMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Packer JS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";

		/// <summary>
		/// Gets or sets a flag for whether to shrink variables
		/// </summary>
		public bool ShrinkVariables
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to Base62 encode
		/// </summary>
		public bool Base62Encode
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of Dean Edwards' JS-minifier
		/// </summary>
		public EdwardsJsMinifier()
			: this(BundleTransformerContext.Current.GetPackerConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Dean Edwards' JS-minifier
		/// </summary>
		/// <param name="packerConfig">Configuration settings of Dean Edwards' Minifier</param>
		public EdwardsJsMinifier(PackerSettings packerConfig)
		{
			JsMinifierSettings jsMinifierConfig = packerConfig.JsMinifier;
			ShrinkVariables = jsMinifierConfig.ShrinkVariables;
			Base62Encode = jsMinifierConfig.Base62Encode;
		}


		/// <summary>
		/// Produces code minifiction of JS-assets by using Dean Edwards' Packer
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

			bool shrinkVariables = ShrinkVariables;
			bool base62Encode = Base62Encode;

			using (var jsPacker = new JsPacker())
			{
				foreach (var asset in assetsToProcessing)
				{
					string newContent;
					string assetVirtualPath = asset.VirtualPath;

					try
					{
						newContent = jsPacker.Pack(asset.Content, base62Encode, shrinkVariables);
					}
					catch (JsPackingException e)
					{
						throw new AssetMinificationException(
							string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
								CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message));
					}
					catch (Exception e)
					{
						throw new AssetMinificationException(
							string.Format(CoreStrings.Minifiers_MinificationFailed,
								CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message));
					}

					asset.Content = newContent;
					asset.Minified = true;
				}
			}

			return assets;
		}
	}
}