namespace BundleTransformer.CleanCss.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Clean CSS-minifier
	/// </summary>
	public sealed class CssMinifierSettings : ConfigurationElement
	{
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
		/// Gets or sets a flag for whether to keep line breaks
		/// </summary>
		[ConfigurationProperty("keepBreaks", DefaultValue = false)]
		public bool KeepBreaks
		{
			get { return (bool)this["keepBreaks"]; }
			set { this["keepBreaks"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable advanced optimizations
		/// (selector and property merging, reduction, etc)
		/// </summary>
		[ConfigurationProperty("noAdvanced", DefaultValue = false)]
		public bool NoAdvanced
		{
			get { return (bool)this["noAdvanced"]; }
			set { this["noAdvanced"] = value; }
		}

		/// <summary>
		/// Gets or sets a compatibility mode
		/// </summary>
		[ConfigurationProperty("compatibility", DefaultValue = CompatibilityMode.Ie8)]
		public CompatibilityMode Compatibility
		{
			get { return (CompatibilityMode)this["compatibility"]; }
			set { this["compatibility"] = value; }
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