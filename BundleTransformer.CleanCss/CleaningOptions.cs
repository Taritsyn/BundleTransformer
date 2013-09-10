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
		/// Gets or sets a flag for whether to remove empty elements
		/// </summary>
		public bool RemoveEmpty
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
			RemoveEmpty = false;
		}
	}
}