namespace BundleTransformer.CleanCss
{
	/// <summary>
	/// Level 1 optimization options
	/// </summary>
	public sealed class Level1OptimizationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to move <code>@charset</code> to the front of a stylesheet
		/// </summary>
		public bool CleanupCharsets
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to normalize URL
		/// </summary>
		public bool NormalizeUrls
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>background</code> property
		/// </summary>
		public bool OptimizeBackground
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>border-radius</code> property
		/// </summary>
		public bool OptimizeBorderRadius
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>filter</code> property
		/// </summary>
		public bool OptimizeFilter
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>font</code> property
		/// </summary>
		public bool OptimizeFont
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>font-weight</code> property
		/// </summary>
		public bool OptimizeFontWeight
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize <code>outline</code> property
		/// </summary>
		public bool OptimizeOutline
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove negative paddings
		/// </summary>
		public bool RemoveNegativePaddings
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove unnecessary quotes
		/// </summary>
		public bool RemoveQuotes
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove unused whitespace
		/// </summary>
		public bool RemoveWhitespace
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove redundant zeros
		/// </summary>
		public bool ReplaceMultipleZeros
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to replace time units with shorter values
		/// </summary>
		public bool ReplaceTimeUnits
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to replace zero values with units
		/// </summary>
		public bool ReplaceZeroUnits
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a rounding precision:
		///		"off" (default) - all precision changes are disabled;
		///		N - number of decimal places
		/// </summary>
		public string RoundingPrecision
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a selector sorting method
		/// </summary>
		public SelectorsSortingMethod SelectorsSortingMethod
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a number of <code>/*! ... */</code> comments preserved
		/// </summary>
		public string SpecialComments
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize at-rules (e.g. <code>@charset</code>, <code>@import</code>)
		/// </summary>
		public bool TidyAtRules
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize block scopes (e.g. <code>@media</code>)
		/// </summary>
		public bool TidyBlockScopes
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize selectors
		/// </summary>
		public bool TidySelectors
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the level 1 optimization options
		/// </summary>
		public Level1OptimizationOptions()
		{
			CleanupCharsets = true;
			NormalizeUrls = true;
			OptimizeBackground = true;
			OptimizeBorderRadius = true;
			OptimizeFilter = true;
			OptimizeFont = true;
			OptimizeFontWeight = true;
			OptimizeOutline = true;
			RemoveNegativePaddings = true;
			RemoveQuotes = true;
			RemoveWhitespace = true;
			ReplaceMultipleZeros = true;
			ReplaceTimeUnits = true;
			ReplaceZeroUnits = true;
			RoundingPrecision = "off";
			SelectorsSortingMethod = SelectorsSortingMethod.Standard;
			SpecialComments = "all";
			TidyAtRules = true;
			TidyBlockScopes = true;
			TidySelectors = true;
		}
	}
}