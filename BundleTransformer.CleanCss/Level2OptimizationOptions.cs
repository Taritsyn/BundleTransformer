namespace BundleTransformer.CleanCss
{
	/// <summary>
	/// Level 2 optimization options
	/// </summary>
	public sealed class Level2OptimizationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to merge adjacent rules
		/// </summary>
		public bool MergeAdjacentRules
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to merge properties into shorthands
		/// </summary>
		public bool MergeIntoShorthands
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to merge <code>@media</code>
		/// </summary>
		public bool MergeMedia
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to merge non-adjacent rules
		/// </summary>
		public bool MergeNonAdjacentRules
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to merge semantically
		/// </summary>
		public bool MergeSemantically
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to override properties based on understandability
		/// </summary>
		public bool OverrideProperties
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to reduce non-adjacent rules
		/// </summary>
		public bool ReduceNonAdjacentRules
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove duplicate <code>@font-face</code>
		/// </summary>
		public bool RemoveDuplicateFontRules
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove duplicate <code>@media</code>
		/// </summary>
		public bool RemoveDuplicateMediaBlocks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove duplicate rules
		/// </summary>
		public bool RemoveDuplicateRules
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to restructure rules
		/// </summary>
		public bool RestructureRules
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the level 2 optimization options
		/// </summary>
		public Level2OptimizationOptions()
		{
			MergeAdjacentRules = true;
			MergeIntoShorthands = true;
			MergeMedia = true;
			MergeNonAdjacentRules = true;
			MergeSemantically = false;
			OverrideProperties = true;
			ReduceNonAdjacentRules = true;
			RemoveDuplicateFontRules = true;
			RemoveDuplicateMediaBlocks = true;
			RemoveDuplicateRules = true;
			RestructureRules = false;
		}
	}
}