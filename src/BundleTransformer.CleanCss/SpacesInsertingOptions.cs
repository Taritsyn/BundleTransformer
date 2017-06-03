namespace BundleTransformer.CleanCss
{
	/// <summary>
	/// Spaces inserting options
	/// </summary>
	public sealed class SpacesInsertingOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to insert a spaces around selector relations (e.g. <code>div > a</code>)
		/// </summary>
		public bool AroundSelectorRelation
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a space before a block begins (e.g. <code>.block {</code>)
		/// </summary>
		public bool BeforeBlockBegins
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a space before a value (e.g. <code>width: 1rem</code>)
		/// </summary>
		public bool BeforeValue
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the spaces inserting options
		/// </summary>
		public SpacesInsertingOptions()
		{
			AroundSelectorRelation = false;
			BeforeBlockBegins = false;
			BeforeValue = false;
		}
	}
}