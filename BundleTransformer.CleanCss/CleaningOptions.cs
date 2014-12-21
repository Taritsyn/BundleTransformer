namespace BundleTransformer.CleanCss
{
	/// <summary>
	/// Cleaning options
	/// </summary>
	internal sealed class CleaningOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable advanced optimizations
		/// (selector and property merging, reduction, etc)
		/// </summary>
		public bool Advanced
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable properties merging based on their order
		/// </summary>
		public bool AggressiveMerging
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
		/// Gets or sets a compatibility mode
		/// </summary>
		public CompatibilityMode Compatibility
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a special comments mode
		/// </summary>
		public SpecialCommentsMode KeepSpecialComments
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a rounding precision. -1 disables rounding.
		/// </summary>
		public int RoundingPrecision
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable shorthand compacting
		/// </summary>
		public bool ShorthandCompacting
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
			Advanced = true;
			AggressiveMerging = true;
			Compatibility = CompatibilityMode.Ie7;
			KeepSpecialComments = SpecialCommentsMode.KeepAll;
			KeepBreaks = false;
			RoundingPrecision = 2;
			ShorthandCompacting = true;
			Severity = 0;
		}
	}
}