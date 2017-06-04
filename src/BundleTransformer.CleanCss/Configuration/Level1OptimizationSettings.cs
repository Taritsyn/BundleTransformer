using System.Configuration;

namespace BundleTransformer.CleanCss.Configuration
{
	/// <summary>
	/// Configuration settings of level 1 optimizations
	/// </summary>
	public sealed class Level1OptimizationSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to move <code>@charset</code> to the front of a stylesheet
		/// </summary>
		[ConfigurationProperty("cleanupCharsets", DefaultValue = true)]
		public bool CleanupCharsets
		{
			get { return (bool)this["cleanupCharsets"]; }
			set { this["cleanupCharsets"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to normalize URL
		/// </summary>
		[ConfigurationProperty("normalizeUrls", DefaultValue = true)]
		public bool NormalizeUrls
		{
			get { return (bool)this["normalizeUrls"]; }
			set { this["normalizeUrls"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>background</code> property
		/// </summary>
		[ConfigurationProperty("optimizeBackground", DefaultValue = true)]
		public bool OptimizeBackground
		{
			get { return (bool)this["optimizeBackground"]; }
			set { this["optimizeBackground"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>border-radius</code> property
		/// </summary>
		[ConfigurationProperty("optimizeBorderRadius", DefaultValue = true)]
		public bool OptimizeBorderRadius
		{
			get { return (bool)this["optimizeBorderRadius"]; }
			set { this["optimizeBorderRadius"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>filter</code> property
		/// </summary>
		[ConfigurationProperty("optimizeFilter", DefaultValue = true)]
		public bool OptimizeFilter
		{
			get { return (bool)this["optimizeFilter"]; }
			set { this["optimizeFilter"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>font</code> property
		/// </summary>
		[ConfigurationProperty("optimizeFont", DefaultValue = true)]
		public bool OptimizeFont
		{
			get { return (bool)this["optimizeFont"]; }
			set { this["optimizeFont"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>font-weight</code> property
		/// </summary>
		[ConfigurationProperty("optimizeFontWeight", DefaultValue = true)]
		public bool OptimizeFontWeight
		{
			get { return (bool)this["optimizeFontWeight"]; }
			set { this["optimizeFontWeight"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>outline</code> property
		/// </summary>
		[ConfigurationProperty("optimizeOutline", DefaultValue = true)]
		public bool OptimizeOutline
		{
			get { return (bool)this["optimizeOutline"]; }
			set { this["optimizeOutline"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove empty rules and nested blocks
		/// </summary>
		[ConfigurationProperty("removeEmpty", DefaultValue = true)]
		public bool RemoveEmpty
		{
			get { return (bool)this["removeEmpty"]; }
			set { this["removeEmpty"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove negative paddings
		/// </summary>
		[ConfigurationProperty("removeNegativePaddings", DefaultValue = true)]
		public bool RemoveNegativePaddings
		{
			get { return (bool)this["removeNegativePaddings"]; }
			set { this["removeNegativePaddings"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove unnecessary quotes
		/// </summary>
		[ConfigurationProperty("removeQuotes", DefaultValue = true)]
		public bool RemoveQuotes
		{
			get { return (bool)this["removeQuotes"]; }
			set { this["removeQuotes"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove unused whitespace
		/// </summary>
		[ConfigurationProperty("removeWhitespace", DefaultValue = true)]
		public bool RemoveWhitespace
		{
			get { return (bool)this["removeWhitespace"]; }
			set { this["removeWhitespace"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove redundant zeros
		/// </summary>
		[ConfigurationProperty("replaceMultipleZeros", DefaultValue = true)]
		public bool ReplaceMultipleZeros
		{
			get { return (bool)this["replaceMultipleZeros"]; }
			set { this["replaceMultipleZeros"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to replace time units with shorter values
		/// </summary>
		[ConfigurationProperty("replaceTimeUnits", DefaultValue = true)]
		public bool ReplaceTimeUnits
		{
			get { return (bool)this["replaceTimeUnits"]; }
			set { this["replaceTimeUnits"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to replace zero values with units
		/// </summary>
		[ConfigurationProperty("replaceZeroUnits", DefaultValue = true)]
		public bool ReplaceZeroUnits
		{
			get { return (bool)this["replaceZeroUnits"]; }
			set { this["replaceZeroUnits"] = value; }
		}

		/// <summary>
		/// Gets or sets a rounding precision:
		///		"off" (default) - all precision changes are disabled;
		///		N - number of decimal places
		/// </summary>
		[ConfigurationProperty("roundingPrecision", DefaultValue = "off")]
		public string RoundingPrecision
		{
			get { return (string)this["roundingPrecision"]; }
			set { this["roundingPrecision"] = value; }
		}

		/// <summary>
		/// Gets or sets a selector sorting method
		/// </summary>
		[ConfigurationProperty("selectorsSortingMethod", DefaultValue = SelectorsSortingMethod.Standard)]
		public SelectorsSortingMethod SelectorsSortingMethod
		{
			get { return (SelectorsSortingMethod)this["selectorsSortingMethod"]; }
			set { this["selectorsSortingMethod"] = value; }
		}

		/// <summary>
		/// Gets or sets a number of <code>/*! ... */</code> comments preserved
		/// </summary>
		[ConfigurationProperty("specialComments", DefaultValue = "all")]
		public string SpecialComments
		{
			get { return (string)this["specialComments"]; }
			set { this["specialComments"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize at-rules (e.g. <code>@charset</code>, <code>@import</code>)
		/// </summary>
		[ConfigurationProperty("tidyAtRules", DefaultValue = true)]
		public bool TidyAtRules
		{
			get { return (bool)this["tidyAtRules"]; }
			set { this["tidyAtRules"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize block scopes (e.g. <code>@media</code>)
		/// </summary>
		[ConfigurationProperty("tidyBlockScopes", DefaultValue = true)]
		public bool TidyBlockScopes
		{
			get { return (bool)this["tidyBlockScopes"]; }
			set { this["tidyBlockScopes"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize selectors
		/// </summary>
		[ConfigurationProperty("tidySelectors", DefaultValue = true)]
		public bool TidySelectors
		{
			get { return (bool)this["tidySelectors"]; }
			set { this["tidySelectors"] = value; }
		}
	}
}