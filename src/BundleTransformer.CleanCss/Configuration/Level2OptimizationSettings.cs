using System.Configuration;

namespace BundleTransformer.CleanCss.Configuration
{
	/// <summary>
	/// Configuration settings of level 2 optimizations
	/// </summary>
	public sealed class Level2OptimizationSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to merge adjacent rules
		/// </summary>
		[ConfigurationProperty("mergeAdjacentRules", DefaultValue = true)]
		public bool MergeAdjacentRules
		{
			get { return (bool)this["mergeAdjacentRules"]; }
			set { this["mergeAdjacentRules"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to merge properties into shorthands
		/// </summary>
		[ConfigurationProperty("mergeIntoShorthands", DefaultValue = true)]
		public bool MergeIntoShorthands
		{
			get { return (bool)this["mergeIntoShorthands"]; }
			set { this["mergeIntoShorthands"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to merge <code>@media</code>
		/// </summary>
		[ConfigurationProperty("mergeMedia", DefaultValue = true)]
		public bool MergeMedia
		{
			get { return (bool)this["mergeMedia"]; }
			set { this["mergeMedia"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to merge non-adjacent rules
		/// </summary>
		[ConfigurationProperty("mergeNonAdjacentRules", DefaultValue = true)]
		public bool MergeNonAdjacentRules
		{
			get { return (bool)this["mergeNonAdjacentRules"]; }
			set { this["mergeNonAdjacentRules"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to merge semantically
		/// </summary>
		[ConfigurationProperty("mergeSemantically", DefaultValue = false)]
		public bool MergeSemantically
		{
			get { return (bool)this["mergeSemantically"]; }
			set { this["mergeSemantically"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to override properties based on understandability
		/// </summary>
		[ConfigurationProperty("overrideProperties", DefaultValue = true)]
		public bool OverrideProperties
		{
			get { return (bool)this["overrideProperties"]; }
			set { this["overrideProperties"] = value; }
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
		/// Gets or sets a flag for whether to reduce non-adjacent rules
		/// </summary>
		[ConfigurationProperty("reduceNonAdjacentRules", DefaultValue = true)]
		public bool ReduceNonAdjacentRules
		{
			get { return (bool)this["reduceNonAdjacentRules"]; }
			set { this["reduceNonAdjacentRules"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove duplicate <code>@font-face</code>
		/// </summary>
		[ConfigurationProperty("removeDuplicateFontRules", DefaultValue = true)]
		public bool RemoveDuplicateFontRules
		{
			get { return (bool)this["removeDuplicateFontRules"]; }
			set { this["removeDuplicateFontRules"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove duplicate <code>@media</code>
		/// </summary>
		[ConfigurationProperty("removeDuplicateMediaBlocks", DefaultValue = true)]
		public bool RemoveDuplicateMediaBlocks
		{
			get { return (bool)this["removeDuplicateMediaBlocks"]; }
			set { this["removeDuplicateMediaBlocks"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove duplicate rules
		/// </summary>
		[ConfigurationProperty("removeDuplicateRules", DefaultValue = true)]
		public bool RemoveDuplicateRules
		{
			get { return (bool)this["removeDuplicateRules"]; }
			set { this["removeDuplicateRules"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove unused at rules
		/// </summary>
		[ConfigurationProperty("removeUnusedAtRules", DefaultValue = false)]
		public bool RemoveUnusedAtRules
		{
			get { return (bool)this["removeUnusedAtRules"]; }
			set { this["removeUnusedAtRules"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to restructure rules
		/// </summary>
		[ConfigurationProperty("restructureRules", DefaultValue = false)]
		public bool RestructureRules
		{
			get { return (bool)this["restructureRules"]; }
			set { this["restructureRules"] = value; }
		}

		/// <summary>
		/// Gets or sets a comma-separated list of properties to skip during optimization
		/// </summary>
		[ConfigurationProperty("skipProperties", DefaultValue = "")]
		public string SkipProperties
		{
			get { return (string)this["skipProperties"]; }
			set { this["skipProperties"] = value; }
		}
	}
}