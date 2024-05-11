using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;

using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Minifiers;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.CleanCss.Configuration;
using BundleTransformer.CleanCss.Internal;

namespace BundleTransformer.CleanCss.Minifiers
{
	/// <summary>
	/// Minifier, which produces minifiction of CSS code
	/// by using Clean-css
	/// </summary>
	public sealed class CleanCssMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Clean CSS minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Delegate that creates an instance of JS engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Gets or sets a compatibility mode:
		///		"*" (default) - Internet Explorer 10+ compatibility mode;
		///		"ie9" - Internet Explorer 9+ compatibility mode;
		///		"ie8" - Internet Explorer 8+ compatibility mode;
		///		"ie7" - Internet Explorer 7+ compatibility mode.
		/// </summary>
		public string Compatibility
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a output CSS formatting
		/// </summary>
		public FormattingOptions FormattingOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a optimization level
		/// </summary>
		public OptimizationLevel Level
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a level 1 optimization options
		/// </summary>
		public Level1OptimizationOptions Level1OptimizationOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a level 2 optimization options
		/// </summary>
		public Level2OptimizationOptions Level2OptimizationOptions
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
		/// Constructs a instance of Clean CSS minifier
		/// </summary>
		public CleanCssMinifier()
			: this(null, BundleTransformerContext.Current.Configuration.GetCleanSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Clean CSS minifier
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="cleanConfig">Configuration settings of Clean-css Minifier</param>
		public CleanCssMinifier(Func<IJsEngine> createJsEngineInstance, CleanSettings cleanConfig)
		{
			CssMinifierSettings cssMinifierConfig = cleanConfig.Css;
			FormattingSettings formattingConfig = cssMinifierConfig.Formatting;
			BreaksInsertingSettings breaksInsertingConfig = formattingConfig.BreaksInserting;
			SpacesInsertingSettings spacesInsertingConfig = formattingConfig.SpacesInserting;
			Level1OptimizationSettings level1OptimizationConfig = cssMinifierConfig.Level1Optimizations;
			Level2OptimizationSettings level2OptimizationConfig = cssMinifierConfig.Level2Optimizations;

			Compatibility = cssMinifierConfig.Compatibility;
			FormattingOptions = new FormattingOptions
			{
				BreaksInsertingOptions = new BreaksInsertingOptions
				{
					AfterAtRule = breaksInsertingConfig.AfterAtRule,
					AfterBlockBegins = breaksInsertingConfig.AfterBlockBegins,
					AfterBlockEnds = breaksInsertingConfig.AfterBlockEnds,
					AfterComment = breaksInsertingConfig.AfterComment,
					AfterProperty = breaksInsertingConfig.AfterProperty,
					AfterRuleBegins = breaksInsertingConfig.AfterRuleBegins,
					AfterRuleEnds = breaksInsertingConfig.AfterRuleEnds,
					BeforeBlockEnds = breaksInsertingConfig.BeforeBlockEnds,
					BetweenSelectors = breaksInsertingConfig.BetweenSelectors
				},
				IndentBy = formattingConfig.IndentBy,
				IndentWith = formattingConfig.IndentWith,
				SpacesInsertingOptions = new SpacesInsertingOptions
				{
					AroundSelectorRelation = spacesInsertingConfig.AroundSelectorRelation,
					BeforeBlockBegins = spacesInsertingConfig.BeforeBlockBegins,
					BeforeValue = spacesInsertingConfig.BeforeValue
				},
				WrapAt = formattingConfig.WrapAt
			};
			Level = cssMinifierConfig.Level;
			Level1OptimizationOptions = new Level1OptimizationOptions
			{
				CleanupCharsets = level1OptimizationConfig.CleanupCharsets,
				NormalizeUrls = level1OptimizationConfig.NormalizeUrls,
				OptimizeBackground = level1OptimizationConfig.OptimizeBackground,
				OptimizeBorderRadius = level1OptimizationConfig.OptimizeBorderRadius,
				OptimizeFilter = level1OptimizationConfig.OptimizeFilter,
				OptimizeFont = level1OptimizationConfig.OptimizeFont,
				OptimizeFontWeight = level1OptimizationConfig.OptimizeFontWeight,
				OptimizeOutline = level1OptimizationConfig.OptimizeOutline,
				RemoveEmpty = level1OptimizationConfig.RemoveEmpty,
				RemoveNegativePaddings = level1OptimizationConfig.RemoveNegativePaddings,
				RemoveQuotes = level1OptimizationConfig.RemoveQuotes,
				RemoveWhitespace = level1OptimizationConfig.RemoveWhitespace,
				ReplaceMultipleZeros = level1OptimizationConfig.ReplaceMultipleZeros,
				ReplaceTimeUnits = level1OptimizationConfig.ReplaceTimeUnits,
				ReplaceZeroUnits = level1OptimizationConfig.ReplaceZeroUnits,
				RoundingPrecision = level1OptimizationConfig.RoundingPrecision,
				SelectorsSortingMethod = level1OptimizationConfig.SelectorsSortingMethod,
				SpecialComments = level1OptimizationConfig.SpecialComments,
				TidyAtRules = level1OptimizationConfig.TidyAtRules,
				TidyBlockScopes = level1OptimizationConfig.TidyBlockScopes,
				TidySelectors = level1OptimizationConfig.TidySelectors
			};
			Level2OptimizationOptions = new Level2OptimizationOptions
			{
				MergeAdjacentRules = level2OptimizationConfig.MergeAdjacentRules,
				MergeIntoShorthands = level2OptimizationConfig.MergeIntoShorthands,
				MergeMedia = level2OptimizationConfig.MergeMedia,
				MergeNonAdjacentRules = level2OptimizationConfig.MergeNonAdjacentRules,
				MergeSemantically = level2OptimizationConfig.MergeSemantically,
				OverrideProperties = level2OptimizationConfig.OverrideProperties,
				RemoveEmpty = level2OptimizationConfig.RemoveEmpty,
				ReduceNonAdjacentRules = level2OptimizationConfig.ReduceNonAdjacentRules,
				RemoveDuplicateFontRules = level2OptimizationConfig.RemoveDuplicateFontRules,
				RemoveDuplicateMediaBlocks = level2OptimizationConfig.RemoveDuplicateMediaBlocks,
				RemoveDuplicateRules = level2OptimizationConfig.RemoveDuplicateRules,
				RemoveUnusedAtRules = level2OptimizationConfig.RemoveUnusedAtRules,
				RestructureRules = level2OptimizationConfig.RestructureRules,
				SkipProperties = level2OptimizationConfig.SkipProperties
			};
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
		/// Produces a code minifiction of CSS asset by using Clean-css
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

			CleaningOptions options = CreateCleaningOptions();

			using (var cssCleaner = new CssCleaner(_createJsEngineInstance, options))
			{
				InnerMinify(asset, cssCleaner);
			}

			return asset;
		}

		/// <summary>
		/// Produces a code minifiction of CSS assets by using Clean-css
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
				Compatibility = Compatibility,
				FormattingOptions = FormattingOptions,
				Level = Level,
				Level1OptimizationOptions = Level1OptimizationOptions,
				Level2OptimizationOptions = Level2OptimizationOptions,
				Severity = Severity
			};

			return options;
		}
	}
}