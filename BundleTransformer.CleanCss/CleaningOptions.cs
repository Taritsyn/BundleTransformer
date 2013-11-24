namespace BundleTransformer.CleanCss
{
	/// <summary>
	/// Cleaning options
	/// </summary>
	internal sealed class CleaningOptions
	{
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
		/// Constructs instance of the cleaning options
		/// </summary>
		public CleaningOptions()
		{
			KeepSpecialComments = SpecialCommentsMode.KeepAll;
			KeepBreaks = false;
			NoAdvanced = false;
			SelectorsMergeMode = SelectorsMergeMode.Ie8Compatible;
			Severity = 0;
		}
	}
}