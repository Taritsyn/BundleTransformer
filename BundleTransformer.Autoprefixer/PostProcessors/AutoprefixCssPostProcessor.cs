namespace BundleTransformer.Autoprefixer.PostProcessors
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.Linq;

	using JavaScriptEngineSwitcher.Core;

	using Core;
	using Core.Assets;
	using Core.PostProcessors;
	using CoreStrings = Core.Resources.Strings;

	using AutoPrefixers;
	using Configuration;

	/// <summary>
	/// Postprocessor that actualizes a vendor prefixes in CSS-code
	/// by using Andrey Sitnik's Autoprefixer
	/// </summary>
	public sealed class AutoprefixCssPostProcessor : PostProcessorBase
	{
		/// <summary>
		/// Name of postprocessor
		/// </summary>
		const string POSTPROCESSOR_NAME = "Autoprefix CSS-postprocessor";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Delegate that creates an instance of JavaScript engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Gets or sets a list of browser conditional expressions
		/// </summary>
		public IList<string> Browsers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to create nice visual cascade of prefixes
		/// </summary>
		public bool Cascade
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable the special safe mode to parse broken CSS
		/// </summary>
		public bool Safe
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove outdated prefixes
		/// </summary>
		public bool Remove
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add new prefixes
		/// </summary>
		public bool Add
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of Andrey Sitnik's Autoprefix CSS-postprocessor
		/// </summary>
		public AutoprefixCssPostProcessor()
			: this(null, BundleTransformerContext.Current.Configuration.GetAutoprefixerSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Andrey Sitnik's Autoprefix CSS-postprocessor
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="autoprefixerConfig">Configuration settings of Andrey Sitnik's Autoprefix CSS-postprocessor</param>
		public AutoprefixCssPostProcessor(Func<IJsEngine> createJsEngineInstance, AutoprefixerSettings autoprefixerConfig)
		{
			Browsers = autoprefixerConfig.Browsers
				.Cast<BrowserConditionalExpression>()
				.Select(b => b.ConditionalExpression)
				.ToList()
				;
			Cascade = autoprefixerConfig.Cascade;
			Safe = autoprefixerConfig.Safe;
			Remove = autoprefixerConfig.Remove;
			Add = autoprefixerConfig.Add;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = autoprefixerConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"autoprefixer",
							@"
  * JavaScriptEngineSwitcher.V8
  * JavaScriptEngineSwitcher.Msie (only in the `ChakraJsRt` mode)",
							"V8JsEngine")
					);
				}

				createJsEngineInstance = (() =>
					JsEngineSwitcher.Current.CreateJsEngineInstance(jsEngineName));
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Actualizes a vendor prefixes in CSS-asset by using Andrey Sitnik's Autoprefixer
		/// </summary>
		/// <param name="asset">CSS-asset</param>
		/// <returns>Processed CSS-asset</returns>
		public override IAsset PostProcess(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			AutoprefixingOptions options = CreateAutoprefixingOptions();

			using (var cssAutoprefixer = new CssAutoprefixer(_createJsEngineInstance, options))
			{
				InnerPostProcess(asset, cssAutoprefixer);
			}

			return asset;
		}

		/// <summary>
		/// Actualizes a vendor prefixes in CSS-assets by using Andrey Sitnik's Autoprefixer
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of processed CSS-assets</returns>
		public override IList<IAsset> PostProcess(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.IsStylesheet).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			AutoprefixingOptions options = CreateAutoprefixingOptions();

			using (var cssAutoprefixer = new CssAutoprefixer(_createJsEngineInstance, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerPostProcess(asset, cssAutoprefixer);
				}
			}

			return assets;
		}

		private void InnerPostProcess(IAsset asset, CssAutoprefixer cssAutoprefixer)
		{
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = cssAutoprefixer.Process(asset.Content, asset.Url);
			}
			catch (CssAutoprefixingException e)
			{
				throw new AssetPostProcessingException(
					string.Format(CoreStrings.PostProcessors_PostprocessingSyntaxError,
						CODE_TYPE, assetUrl, POSTPROCESSOR_NAME, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetPostProcessingException(
					string.Format(CoreStrings.PostProcessors_PostprocessingFailed,
						CODE_TYPE, assetUrl, POSTPROCESSOR_NAME, e.Message), e);
			}

			asset.Content = newContent;
		}

		/// <summary>
		/// Creates a autoprefixing options
		/// </summary>
		/// <returns>Autoprefixing options</returns>
		private AutoprefixingOptions CreateAutoprefixingOptions()
		{
			var options = new AutoprefixingOptions
			{
				Browsers = Browsers,
				Cascade = Cascade,
				Safe = Safe,
				Remove = Remove,
				Add = Add
			};

			return options;
		}
	}
}