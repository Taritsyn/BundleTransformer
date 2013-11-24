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
		/// Gets or sets a special comments mode
		/// </summary>
		public SpecialCommentsMode KeepSpecialComments
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
		/// Gets or sets a flag for whether to disable advanced optimizations
		/// (selector and property merging, reduction, etc)
		/// </summary>
		public bool NoAdvanced
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a selectors merge mode
		/// </summary>
		public SelectorsMergeMode SelectorsMergeMode
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
		/// Constructs instance of Clean CSS-minifier
		/// </summary>
		public CleanCssMinifier()
			: this(null, BundleTransformerContext.Current.GetCleanConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Clean CSS-minifier
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="cleanConfig">Configuration settings of Clean-css Minifier</param>
		public CleanCssMinifier(Func<IJsEngine> createJsEngineInstance, CleanSettings cleanConfig)
		{
			CssMinifierSettings cssMinifierConfig = cleanConfig.Css;
			KeepSpecialComments = cssMinifierConfig.KeepSpecialComments;
			KeepBreaks = cssMinifierConfig.KeepBreaks;
			NoAdvanced = cssMinifierConfig.NoAdvanced;
			SelectorsMergeMode = cssMinifierConfig.SelectorsMergeMode;
			Severity = cssMinifierConfig.Severity;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = cleanConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"clean",
							"JavaScriptEngineSwitcher.V8",
							"V8JsEngine")
					);
				}

				createJsEngineInstance = (() =>
					JsEngineSwitcher.Current.CreateJsEngineInstance(jsEngineName));
			}
			_createJsEngineInstance = createJsEngineInstance;
		}

		/// <summary>
		/// Produces code minifiction of CSS-assets by using Clean-css
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

			using (var cssCleaner = new CssCleaner(_createJsEngineInstance))
			{
				foreach (var asset in assetsToProcessing)
				{
					string newContent;
					string assetUrl = asset.Url;

					try
					{
						newContent = cssCleaner.Clean(asset.Content, options);
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
			}

			return assets;
		}

		/// <summary>
		/// Creates a cleaning options
		/// </summary>
		/// <returns>Cleaning options</returns>
		private CleaningOptions CreateCleaningOptions()
		{
			var options = new CleaningOptions
			{
				KeepSpecialComments = KeepSpecialComments,
				KeepBreaks = KeepBreaks,
				NoAdvanced = NoAdvanced,
				SelectorsMergeMode = SelectorsMergeMode,
				Severity = Severity
			};

			return options;
		}
	}
}