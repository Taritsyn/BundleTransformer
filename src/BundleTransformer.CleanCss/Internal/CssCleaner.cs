using System;
using System.Linq;
using System.Reflection;
using System.Text;

using AdvancedStringBuilder;
using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Core.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.CleanCss.Internal
{
	/// <summary>
	/// CSS cleaner
	/// </summary>
	internal sealed class CssCleaner : IDisposable
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.CleanCss.Resources";

		/// <summary>
		/// Name of file, which contains a Clean-css library
		/// </summary>
		private const string CLEAN_CSS_LIBRARY_FILE_NAME = "clean-css-combined.min.js";

		/// <summary>
		/// Name of file, which contains a Clean-css minifier helper
		/// </summary>
		private const string CLEAN_CSS_HELPER_FILE_NAME = "cleanCssHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for cleaning
		/// </summary>
		private const string CLEANING_FUNCTION_CALL_TEMPLATE = @"cleanCssHelper.minify({0}, {1});";

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// Cleaning options
		/// </summary>
		private readonly CleaningOptions _options;

		/// <summary>
		/// String representation of the cleaning options
		/// </summary>
		private readonly string _optionsString;

		/// <summary>
		/// Flag that CSS cleaner is initialized
		/// </summary>
		private InterlockedStatedFlag _initializedFlag = new InterlockedStatedFlag();

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private InterlockedStatedFlag _disposedFlag = new InterlockedStatedFlag();


		/// <summary>
		/// Constructs a instance of CSS cleaner
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="options">Cleaning options</param>
		public CssCleaner(Func<IJsEngine> createJsEngineInstance, CleaningOptions options)
		{
			_jsEngine = createJsEngineInstance();
			_options = options ?? new CleaningOptions();
			_optionsString = ConvertCleaningOptionsToJson(_options).ToString();
		}


		/// <summary>
		/// Initializes CSS cleaner
		/// </summary>
		private void Initialize()
		{
			if (_initializedFlag.Set())
			{
				Assembly assembly = GetType().Assembly;

				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + CLEAN_CSS_LIBRARY_FILE_NAME, assembly);
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + CLEAN_CSS_HELPER_FILE_NAME, assembly);
			}
		}

		/// <summary>
		/// "Cleans" CSS code by using Clean-css
		/// </summary>
		/// <param name="content">Text content of CSS asset</param>
		/// <param name="path">Path to CSS file</param>
		/// <returns>Minified text content of CSS asset</returns>
		public string Clean(string content, string path)
		{
			Initialize();

			string newContent;

			try
			{
				var result = _jsEngine.Evaluate<string>(
					string.Format(CLEANING_FUNCTION_CALL_TEMPLATE,
						JsonConvert.SerializeObject(content), _optionsString));

				var json = JObject.Parse(result);

				var errors = json["errors"] != null ? json["errors"] as JArray : null;
				if (errors != null && errors.Count > 0)
				{
					throw new CssCleaningException(FormatErrorDetails(errors[0].Value<string>(), true,
						path));
				}

				if (_options.Severity > 0)
				{
					var warnings = json["warnings"] != null ? json["warnings"] as JArray : null;
					if (warnings != null && warnings.Count > 0)
					{
						throw new CssCleaningException(FormatErrorDetails(warnings[0].Value<string>(),
							false, path));
					}
				}

				newContent = json.Value<string>("minifiedCode");
			}
			catch (JsRuntimeException e)
			{
				throw new CssCleaningException(JsErrorHelpers.Format(e));
			}

			return newContent;
		}

		/// <summary>
		/// Converts a cleaning options to JSON
		/// </summary>
		/// <param name="options">Cleaning options</param>
		/// <returns>Cleaning options in JSON format</returns>
		private static JObject ConvertCleaningOptionsToJson(CleaningOptions options)
		{
			FormattingOptions formattingOptions = options.FormattingOptions;
			BreaksInsertingOptions breaksInsertingOptions = formattingOptions.BreaksInsertingOptions;
			SpacesInsertingOptions spacesInsertingOptions = formattingOptions.SpacesInsertingOptions;
			Level1OptimizationOptions level1OptimizationOptions = options.Level1OptimizationOptions;
			Level2OptimizationOptions level2OptimizationOptions = options.Level2OptimizationOptions;

			var optionsJson = new JObject(
				new JProperty("compatibility", options.Compatibility),
				new JProperty("format", new JObject(
					new JProperty("breaks", new JObject(
						new JProperty("afterAtRule", breaksInsertingOptions.AfterAtRule),
						new JProperty("afterBlockBegins", breaksInsertingOptions.AfterBlockBegins),
						new JProperty("afterBlockEnds", breaksInsertingOptions.AfterBlockEnds),
						new JProperty("afterComment", breaksInsertingOptions.AfterComment),
						new JProperty("afterProperty", breaksInsertingOptions.AfterProperty),
						new JProperty("afterRuleBegins", breaksInsertingOptions.AfterRuleBegins),
						new JProperty("afterRuleEnds", breaksInsertingOptions.AfterRuleEnds),
						new JProperty("beforeBlockEnds", breaksInsertingOptions.BeforeBlockEnds),
						new JProperty("betweenSelectors", breaksInsertingOptions.BetweenSelectors)
					)),
					new JProperty("indentBy", formattingOptions.IndentBy),
					new JProperty("indentWith", ConvertIndentTypeEnumValueToCode(formattingOptions.IndentWith)),
					new JProperty("spaces", new JObject(
						new JProperty("aroundSelectorRelation", spacesInsertingOptions.AroundSelectorRelation),
						new JProperty("beforeBlockBegins", spacesInsertingOptions.BeforeBlockBegins),
						new JProperty("beforeValue", spacesInsertingOptions.BeforeValue)
					)),
					new JProperty("wrapAt", formattingOptions.WrapAt)
				)),
				new JProperty("level", ConvertOptimizationLevelEnumValueToJson(options.Level,
					level1OptimizationOptions, level2OptimizationOptions))
			);

			return optionsJson;
		}

		/// <summary>
		/// Converts a indent type enum value to the code
		/// </summary>
		/// <param name="indentType">Indent type enum value</param>
		/// <returns>Indent type code</returns>
		private static string ConvertIndentTypeEnumValueToCode(IndentType indentType)
		{
			string code;

			switch (indentType)
			{
				case IndentType.Space:
					code = "space";
					break;
				case IndentType.Tab:
					code = "tab";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						indentType.ToString(), typeof(IndentType)));
			}

			return code;
		}

		/// <summary>
		/// Converts a optimization level enum value to JSON
		/// </summary>
		/// <param name="optimizationLevel">Optimization level enum value</param>
		/// <param name="level1OptimizationOptions">Level 1 optimization options</param>
		/// <param name="level2OptimizationOptions">Level 2 optimization options</param>
		/// <returns>Optimization level in JSON format</returns>
		internal static JToken ConvertOptimizationLevelEnumValueToJson(OptimizationLevel optimizationLevel,
			Level1OptimizationOptions level1OptimizationOptions, Level2OptimizationOptions level2OptimizationOptions)
		{
			JToken optimizationLevelJson;

			if (optimizationLevel == OptimizationLevel.Zero)
			{
				optimizationLevelJson = new JValue("0");
			}
			else if (optimizationLevel == OptimizationLevel.One || optimizationLevel == OptimizationLevel.Two)
			{
				var jObj = new JObject();
				jObj.Add("1", new JObject(
					new JProperty("cleanupCharsets", level1OptimizationOptions.CleanupCharsets),
					new JProperty("normalizeUrls", level1OptimizationOptions.NormalizeUrls),
					new JProperty("optimizeBackground", level1OptimizationOptions.OptimizeBackground),
					new JProperty("optimizeBorderRadius", level1OptimizationOptions.OptimizeBorderRadius),
					new JProperty("optimizeFilter", level1OptimizationOptions.OptimizeFilter),
					new JProperty("optimizeFont", level1OptimizationOptions.OptimizeFont),
					new JProperty("optimizeFontWeight", level1OptimizationOptions.OptimizeFontWeight),
					new JProperty("optimizeOutline", level1OptimizationOptions.OptimizeOutline),
					new JProperty("removeEmpty", level1OptimizationOptions.RemoveEmpty),
					new JProperty("removeNegativePaddings", level1OptimizationOptions.RemoveNegativePaddings),
					new JProperty("removeQuotes", level1OptimizationOptions.RemoveQuotes),
					new JProperty("removeWhitespace", level1OptimizationOptions.RemoveWhitespace),
					new JProperty("replaceMultipleZeros", level1OptimizationOptions.ReplaceMultipleZeros),
					new JProperty("replaceTimeUnits", level1OptimizationOptions.ReplaceTimeUnits),
					new JProperty("replaceZeroUnits", level1OptimizationOptions.ReplaceZeroUnits),
					new JProperty("roundingPrecision",
						ParseRoundingPrecision(level1OptimizationOptions.RoundingPrecision)),
					new JProperty("selectorsSortingMethod", ConvertSelectorsSortingMethodEnumValueToCode(
						level1OptimizationOptions.SelectorsSortingMethod)),
					new JProperty("specialComments", level1OptimizationOptions.SpecialComments),
					new JProperty("tidyAtRules", level1OptimizationOptions.TidyAtRules),
					new JProperty("tidyBlockScopes", level1OptimizationOptions.TidyBlockScopes),
					new JProperty("tidySelectors", level1OptimizationOptions.TidySelectors)
				));

				if (optimizationLevel == OptimizationLevel.Two)
				{
					jObj.Add("2", new JObject(
						new JProperty("mergeAdjacentRules", level2OptimizationOptions.MergeAdjacentRules),
						new JProperty("mergeIntoShorthands", level2OptimizationOptions.MergeIntoShorthands),
						new JProperty("mergeMedia", level2OptimizationOptions.MergeMedia),
						new JProperty("mergeNonAdjacentRules", level2OptimizationOptions.MergeNonAdjacentRules),
						new JProperty("mergeSemantically", level2OptimizationOptions.MergeSemantically),
						new JProperty("overrideProperties", level2OptimizationOptions.OverrideProperties),
						new JProperty("removeEmpty", level2OptimizationOptions.RemoveEmpty),
						new JProperty("reduceNonAdjacentRules", level2OptimizationOptions.ReduceNonAdjacentRules),
						new JProperty("removeDuplicateFontRules", level2OptimizationOptions.RemoveDuplicateFontRules),
						new JProperty("removeDuplicateMediaBlocks", level2OptimizationOptions.RemoveDuplicateMediaBlocks),
						new JProperty("removeDuplicateRules", level2OptimizationOptions.RemoveDuplicateRules),
						new JProperty("removeUnusedAtRules", level2OptimizationOptions.RemoveUnusedAtRules),
						new JProperty("restructureRules", level2OptimizationOptions.RestructureRules),
						new JProperty("skipProperties", ParseSkippingProperties(level2OptimizationOptions.SkipProperties))
					));
				}

				optimizationLevelJson = jObj;
			}
			else
			{
				throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
					optimizationLevel.ToString(), typeof(OptimizationLevel)));
			}

			return optimizationLevelJson;
		}

		/// <summary>
		/// Parses a string representation of rounding precision
		/// </summary>
		/// <param name="roundingPrecisionString">String representation of rounding precision</param>
		/// <returns>Rounding precision in JSON format</returns>
		private static JValue ParseRoundingPrecision(string roundingPrecisionString)
		{
			JValue result;
			int roundingPrecision;

			if (int.TryParse(roundingPrecisionString, out roundingPrecision))
			{
				result = new JValue(roundingPrecision);
			}
			else
			{
				result = new JValue(roundingPrecisionString);
			}

			return result;
		}

		/// <summary>
		/// Converts a selector sorting method enum value to the code
		/// </summary>
		/// <param name="method">Selector sorting method enum value</param>
		/// <returns>Selector sorting method code</returns>
		private static string ConvertSelectorsSortingMethodEnumValueToCode(SelectorsSortingMethod method)
		{
			string code;

			switch (method)
			{
				case SelectorsSortingMethod.None:
					code = "none";
					break;
				case SelectorsSortingMethod.Standard:
					code = "standard";
					break;
				case SelectorsSortingMethod.Natural:
					code = "natural";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						method.ToString(), typeof(SelectorsSortingMethod)));
			}

			return code;
		}

		/// <summary>
		/// Parses a string representation of the skipping properties to list
		/// </summary>
		/// <param name="skippingPropertiesString">String representation of the skipping properties</param>
		/// <returns>Skipping properties list in JSON format</returns>
		private static JArray ParseSkippingProperties(string skippingPropertiesString)
		{
			var skippingProperties = Utils.ConvertToStringCollection(skippingPropertiesString, ',',
				trimItemValues: true, removeEmptyItems: true);

			return new JArray(skippingProperties.Select(p => new JValue(p)));
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="message">Message</param>
		/// <param name="isError">Flag indicating that this issue is a error</param>
		/// <param name="currentFilePath">Path to current CSS file</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(string message, bool isError, string currentFilePath)
		{
			var stringBuilderPool = StringBuilderPool.Shared;
			StringBuilder errorMessageBuilder = stringBuilderPool.Rent();
			errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorType,
				isError ? CoreStrings.ErrorType_Error : CoreStrings.ErrorType_Warning);
			errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			if (!string.IsNullOrWhiteSpace(currentFilePath))
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, currentFilePath);
			}

			string errorMessage = errorMessageBuilder.ToString();
			stringBuilderPool.Return(errorMessageBuilder);

			return errorMessage;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public void Dispose()
		{
			if (_disposedFlag.Set())
			{
				if (_jsEngine != null)
				{
					_jsEngine.Dispose();
					_jsEngine = null;
				}
			}
		}
	}
}