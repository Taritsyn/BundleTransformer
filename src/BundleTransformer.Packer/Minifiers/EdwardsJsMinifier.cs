using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;

using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Minifiers;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.Packer.Configuration;
using BundleTransformer.Packer.Internal;

namespace BundleTransformer.Packer.Minifiers
{
	/// <summary>
	/// Minifier, which produces minifiction of JS code
	/// by using Dean Edwards' Packer version 3.0
	/// </summary>
	public sealed class EdwardsJsMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Packer JS minifier";

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
		/// Delegate that creates an instance of JS engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;


		/// <summary>
		/// Constructs a instance of Dean Edwards' JS minifier
		/// </summary>
		public EdwardsJsMinifier()
			: this(null, BundleTransformerContext.Current.Configuration.GetPackerSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Dean Edwards' JS minifier
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="packerConfig">Configuration settings of Dean Edwards' Minifier</param>
		public EdwardsJsMinifier(Func<IJsEngine> createJsEngineInstance, PackerSettings packerConfig)
		{
			JsMinifierSettings jsMinifierConfig = packerConfig.JsMinifier;
			ShrinkVariables = jsMinifierConfig.ShrinkVariables;
			Base62Encode = jsMinifierConfig.Base62Encode;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = packerConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"packer",
							@"
  * JavaScriptEngineSwitcher.ChakraCore
  * JavaScriptEngineSwitcher.Jint
  * JavaScriptEngineSwitcher.Msie
  * JavaScriptEngineSwitcher.V8",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () => JsEngineSwitcher.Current.CreateEngine(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Produces a code minifiction of JS asset by using Dean Edwards' Packer
		/// </summary>
		/// <param name="asset">JS asset</param>
		/// <returns>JS asset with minified text content</returns>
		public IAsset Minify(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentNullException(
					nameof(asset),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(asset))
				);
			}

			if (asset.Minified)
			{
				return asset;
			}

			PackingOptions options = CreatePackingOptions();

			using (var jsPacker = new JsPacker(_createJsEngineInstance, options))
			{
				InnerMinify(asset, jsPacker);
			}

			return asset;
		}

		/// <summary>
		/// Produces a code minifiction of JS assets by using Dean Edwards' Packer
		/// </summary>
		/// <param name="assets">Set of JS assets</param>
		/// <returns>Set of JS assets with minified text content</returns>
		public IList<IAsset> Minify(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentNullException(
					nameof(assets),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(assets))
				);
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

			PackingOptions options = CreatePackingOptions();

			using (var jsPacker = new JsPacker(_createJsEngineInstance, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerMinify(asset, jsPacker);
				}
			}

			return assets;
		}

		private void InnerMinify(IAsset asset, JsPacker jsPacker)
		{
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = jsPacker.Pack(asset.Content);
			}
			catch (JsPackingException e)
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

		/// <summary>
		/// Creates a packing options
		/// </summary>
		/// <returns>Packing options</returns>
		private PackingOptions CreatePackingOptions()
		{
			var options = new PackingOptions
			{
				ShrinkVariables = ShrinkVariables,
				Base62Encode = Base62Encode
			};

			return options;
		}
	}
}