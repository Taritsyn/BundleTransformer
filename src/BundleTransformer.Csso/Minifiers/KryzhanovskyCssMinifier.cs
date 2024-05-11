using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;

using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Minifiers;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.Csso.Configuration;
using BundleTransformer.Csso.Internal;

namespace BundleTransformer.Csso.Minifiers
{
	/// <summary>
	/// Minifier, which produces minifiction of CSS code
	/// by using Sergey Kryzhanovsky's CSSO (CSS Optimizer)
	/// </summary>
	public sealed class KryzhanovskyCssMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "CSSO CSS minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Delegate that creates an instance of JS engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Gets or sets a flag for whether to disable structure minification
		/// </summary>
		public bool DisableRestructuring
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable unsafe merge of <code>@media</code> rules
		/// </summary>
		public bool ForceMediaMerge
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comments mode
		/// </summary>
		public CommentsMode Comments
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of Sergey Kryzhanovsky's CSS minifier
		/// </summary>
		public KryzhanovskyCssMinifier()
			: this(null, BundleTransformerContext.Current.Configuration.GetCssoSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Sergey Kryzhanovsky's CSS minifier
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="cssoConfig">Configuration settings of Sergey Kryzhanovsky's Minifier</param>
		public KryzhanovskyCssMinifier(Func<IJsEngine> createJsEngineInstance, CssoSettings cssoConfig)
		{
			CssMinifierSettings cssMinifierConfig = cssoConfig.CssMinifier;
			DisableRestructuring = cssMinifierConfig.DisableRestructuring;
			ForceMediaMerge = cssMinifierConfig.ForceMediaMerge;
			Comments = cssMinifierConfig.Comments;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = cssoConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"csso",
							@"
  * JavaScriptEngineSwitcher.ChakraCore
  * JavaScriptEngineSwitcher.Jint
  * JavaScriptEngineSwitcher.Msie (only in the Chakra modes)
  * JavaScriptEngineSwitcher.V8",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () => JsEngineSwitcher.Current.CreateEngine(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Produces a code minifiction of CSS asset by using Sergey Kryzhanovsky's CSSO (CSS Optimizer)
		/// </summary>
		/// <param name="asset">CSS asset</param>
		/// <returns>CSS asset with minified text content</returns>
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

			OptimizationOptions options = CreateOptimizationOptions();

			using (var cssOptimizer = new CssOptimizer(_createJsEngineInstance, options))
			{
				InnerMinify(asset, cssOptimizer);
			}

			return asset;
		}

		/// <summary>
		/// Produces a code minifiction of CSS assets by using Sergey Kryzhanovsky's CSSO (CSS Optimizer)
		/// </summary>
		/// <param name="assets">Set of CSS assets</param>
		/// <returns>Set of CSS assets with minified text content</returns>
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

			var assetsToProcessing = assets.Where(a => a.IsStylesheet && !a.Minified).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			OptimizationOptions options = CreateOptimizationOptions();

			using (var cssOptimizer = new CssOptimizer(_createJsEngineInstance, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerMinify(asset, cssOptimizer);
				}
			}

			return assets;
		}

		private void InnerMinify(IAsset asset, CssOptimizer cssOptimizer)
		{
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = cssOptimizer.Optimize(asset.Content, assetUrl);
			}
			catch (CssOptimizationException e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationFailed,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message), e);
			}

			asset.Content = newContent;
			asset.Minified = true;
		}

		/// <summary>
		/// Creates a optimization options
		/// </summary>
		/// <returns>Optimization options</returns>
		private OptimizationOptions CreateOptimizationOptions()
		{
			var options = new OptimizationOptions
			{
				Restructure = !DisableRestructuring,
				ForceMediaMerge = ForceMediaMerge,
				Comments = Comments
			};

			return options;
		}
	}
}