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
		/// Gets or sets a compatibility mode:
		///		"ie7" - Internet Explorer 7 compatibility mode;
		///		"ie8" - Internet Explorer 8 compatibility mode;
		///		"*" - Internet Explorer 9+ compatibility mode.
		/// </summary>
		public string Compatibility
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
		/// Gets or sets a special comments mode
		/// </summary>
		public SpecialCommentsMode KeepSpecialComments
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable <code>@media</code> merging
		/// </summary>
		public bool MediaMerging
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable restructuring optimizations
		/// </summary>
		public bool Restructuring
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
		/// Gets or sets a flag for whether to enable unsafe mode by assuming BEM-like semantic stylesheets
		/// (warning, this may break your styling!)
		/// </summary>
		public bool SemanticMerging
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
		/// Constructs a instance of the cleaning options
		/// </summary>
		public CleaningOptions()
		{
			Advanced = true;
			AggressiveMerging = true;
			Compatibility = "*";
			KeepBreaks = false;
			KeepSpecialComments = SpecialCommentsMode.KeepAll;
			MediaMerging = true;
			Restructuring = true;
			RoundingPrecision = 2;
			SemanticMerging = false;
			ShorthandCompacting = true;
			Severity = 0;
		}
	}
}