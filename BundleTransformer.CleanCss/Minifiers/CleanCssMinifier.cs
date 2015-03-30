namespace BundleTransformer.CleanCss.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.Linq;

	using JavaScriptEngineSwitcher.Core;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Cleaners;

	/// <summary>
	/// Minifier, which produces minifiction of CSS-code
	/// by using Clean-css
	/// </summary>
	public sealed class CleanCssMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Clean CSS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Delegate that creates an instance of JavaScript engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Gets or sets a flag for whether to enable advanced optimizations
		/// (selector and property merging, reduction, etc)
		/// </summary>
		public bool Advanced
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable properties merging based on their order
		/// </summary>
		public bool AggressiveMerging
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a compatibility mode
		/// </summary>
		public CompatibilityMode Compatibility
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to keep line breaks
		/// </summary>
		public bool KeepBreaks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a special comments mode
		/// </summary>
		public SpecialCommentsMode KeepSpecialComments
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable <code>@media</code> merging
		/// </summary>
		public bool MediaMerging
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable restructuring optimizations
		/// </summary>
		public bool Restructuring
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a rounding precision. -1 disables rounding.
		/// </summary>
		public int RoundingPrecision
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable shorthand compacting
		/// </summary>
		public bool ShorthandCompacting
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - only error messages;
		///		1 - only error messages and warnings.
		/// </summary>
		public int Severity
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of Clean CSS-minifier
		/// </summary>
		public CleanCssMinifier()
			: this(null, BundleTransformerContext.Current.Configuration.GetCleanSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Clean CSS-minifier
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="cleanConfig">Configuration settings of Clean-css Minifier</param>
		public CleanCssMinifier(Func<IJsEngine> createJsEngineInstance, CleanSettings cleanConfig)
		{
			CssMinifierSettings cssMinifierConfig = cleanConfig.Css;
			Advanced = cssMinifierConfig.Advanced;
			AggressiveMerging = cssMinifierConfig.AggressiveMerging;
			Compatibility = cssMinifierConfig.Compatibility;
			KeepBreaks = cssMinifierConfig.KeepBreaks;
			KeepSpecialComments = cssMinifierConfig.KeepSpecialComments;
			MediaMerging = cssMinifierConfig.MediaMerging;
			Restructuring = cssMinifierConfig.Restructuring;
			RoundingPrecision = cssMinifierConfig.RoundingPrecision;
			ShorthandCompacting = cssMinifierConfig.ShorthandCompacting;
			Severity = cssMinifierConfig.Severity;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = cleanConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"clean",
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
		/// Produces a code minifiction of CSS-asset by using Clean-css
		/// </summary>
		/// <param name="asset">CSS-asset</param>
		/// <returns>CSS-asset with minified text content</returns>
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

			CleaningOptions options = CreateCleaningOptions();

			using (var cssCleaner = new CssCleaner(_createJsEngineInstance, options))
			{
				InnerMinify(asset, cssCleaner);
			}

			return asset;
		}

		/// <summary>
		/// Produces a code minifiction of CSS-assets by using Clean-css
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

			CleaningOptions options = CreateCleaningOptions();

			using (var cssCleaner = new CssCleaner(_createJsEngineInstance, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerMinify(asset, cssCleaner);
				}
			}

			return assets;
		}

		private void InnerMinify(IAsset asset, CssCleaner cssCleaner)
		{
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = cssCleaner.Clean(asset.Content, assetUrl);
			}
			catch (CssCleaningException e)
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
		/// Creates a cleaning options
		/// </summary>
		/// <returns>Cleaning options</returns>
		private CleaningOptions CreateCleaningOptions()
		{
			var options = new CleaningOptions
			{
				Advanced = Advanced,
				AggressiveMerging = AggressiveMerging,
				Compatibility = Compatibility,
				KeepBreaks = KeepBreaks,
				KeepSpecialComments = KeepSpecialComments,
				MediaMerging = MediaMerging,
				Restructuring = Restructuring,
				RoundingPrecision = RoundingPrecision,
				ShorthandCompacting = ShorthandCompacting,
				Severity = Severity
			};

			return options;
		}
	}
}