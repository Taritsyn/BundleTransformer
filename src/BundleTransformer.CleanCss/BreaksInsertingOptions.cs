namespace BundleTransformer.CleanCss
{
	/// <summary>
	/// Breaks inserting options
	/// </summary>
	public sealed class BreaksInsertingOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after at-rule (e.g. <code>@charset</code>)
		/// </summary>
		public bool AfterAtRule
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a beginning of block (e.g. <code>@media</code>)
		/// </summary>
		public bool AfterBlockBegins
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a ending of block
		/// </summary>
		public bool AfterBlockEnds
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a comment
		/// </summary>
		public bool AfterComment
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a property
		/// </summary>
		public bool AfterProperty
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a rule begins
		/// </summary>
		public bool AfterRuleBegins
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a rule ends
		/// </summary>
		public bool AfterRuleEnds
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break before a block ends
		/// </summary>
		public bool BeforeBlockEnds
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break between selectors
		/// </summary>
		public bool BetweenSelectors
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the breaks inserting options
		/// </summary>
		public BreaksInsertingOptions()
		{
			AfterAtRule = false;
			AfterBlockBegins = false;
			AfterBlockEnds = false;
			AfterComment = false;
			AfterRuleBegins = false;
			AfterRuleEnds = false;
			BeforeBlockEnds = false;
			BetweenSelectors = false;
		}
	}
}