namespace BundleTransformer.CleanCss.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Clean CSS-minifier
	/// </summary>
	public sealed class CssMinifierSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable advanced optimizations
		/// (selector and property merging, reduction, etc)
		/// </summary>
		[ConfigurationProperty("advanced", DefaultValue = true)]
		public bool Advanced
		{
			get { return (bool)this["advanced"]; }
			set { this["advanced"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable properties merging based on their order
		/// </summary>
		[ConfigurationProperty("aggressiveMerging", DefaultValue = true)]
		public bool AggressiveMerging
		{
			get { return (bool)this["aggressiveMerging"]; }
			set { this["aggressiveMerging"] = value; }
		}

		/// <summary>
		/// Gets or sets a compatibility mode
		/// </summary>
		[ConfigurationProperty("compatibility", DefaultValue = CompatibilityMode.Ie7)]
		public CompatibilityMode Compatibility
		{
			get { return (CompatibilityMode)this["compatibility"]; }
			set { this["compatibility"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to keep line breaks
		/// </summary>
		[ConfigurationProperty("keepBreaks", DefaultValue = false)]
		public bool KeepBreaks
		{
			get { return (bool)this["keepBreaks"]; }
			set { this["keepBreaks"] = value; }
		}

		/// <summary>
		/// Gets or sets a special comments mode
		/// </summary>
		[ConfigurationProperty("keepSpecialComments", DefaultValue = SpecialCommentsMode.KeepAll)]
		public SpecialCommentsMode KeepSpecialComments
		{
			get { return (SpecialCommentsMode)this["keepSpecialComments"]; }
			set { this["keepSpecialComments"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable <code>@media</code> merging
		/// </summary>
		[ConfigurationProperty("mediaMerging", DefaultValue = true)]
		public bool MediaMerging
		{
			get { return (bool)this["mediaMerging"]; }
			set { this["mediaMerging"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable restructuring optimizations
		/// </summary>
		[ConfigurationProperty("restructuring", DefaultValue = true)]
		public bool Restructuring
		{
			get { return (bool)this["restructuring"]; }
			set { this["restructuring"] = value; }
		}

		/// <summary>
		/// Gets or sets a rounding precision. -1 disables rounding.
		/// </summary>
		[ConfigurationProperty("roundingPrecision", DefaultValue = 2)]
		[IntegerValidator(MinValue = -1, MaxValue = int.MaxValue, ExcludeRange = false)]
		public int RoundingPrecision
		{
			get { return (int)this["roundingPrecision"]; }
			set { this["roundingPrecision"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable shorthand compacting
		/// </summary>
		[ConfigurationProperty("shorthandCompacting", DefaultValue = true)]
		public bool ShorthandCompacting
		{
			get { return (bool)this["shorthandCompacting"]; }
			set { this["shorthandCompacting"] = value; }
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - only error messages;
		///		1 - only error messages and warnings.
		/// </summary>
		[ConfigurationProperty("severity", DefaultValue = 0)]
		[IntegerValidator(MinValue = 0, MaxValue = 1, ExcludeRange = false)]
		public int Severity
		{
			get { return (int)this["severity"]; }
			set { this["severity"] = value; }
		}
	}
}