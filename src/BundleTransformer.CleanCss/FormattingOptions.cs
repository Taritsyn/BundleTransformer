namespace BundleTransformer.CleanCss
{
	/// <summary>
	/// Output CSS formatting options
	/// </summary>
	public sealed class FormattingOptions
	{
		/// <summary>
		/// Gets or sets a breaks inserting options
		/// </summary>
		public BreaksInsertingOptions BreaksInsertingOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a number of characters to indent with
		/// </summary>
		public int IndentBy
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a character to indent with
		/// </summary>
		public IndentType IndentWith
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a spaces inserting options
		/// </summary>
		public SpacesInsertingOptions SpacesInsertingOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a maximum line length
		/// </summary>
		public int WrapAt
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the output CSS formatting options
		/// </summary>
		public FormattingOptions()
		{
			BreaksInsertingOptions = new BreaksInsertingOptions();
			IndentBy = 0;
			IndentWith = IndentType.Space;
			SpacesInsertingOptions = new SpacesInsertingOptions();
			WrapAt = 0;
		}
	}
}