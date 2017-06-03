namespace BundleTransformer.CleanCss.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Clean CSS-minifier
	/// </summary>
	public sealed class CssMinifierSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a compatibility mode:
		///		"*" (default) - Internet Explorer 10+ compatibility mode;
		///		"ie9" - Internet Explorer 9+ compatibility mode;
		///		"ie8" - Internet Explorer 8+ compatibility mode;
		///		"ie7" - Internet Explorer 7+ compatibility mode.
		/// </summary>
		[ConfigurationProperty("compatibility", DefaultValue = "*")]
		public string Compatibility
		{
			get { return (string)this["compatibility"]; }
			set { this["compatibility"] = value; }
		}

		/// <summary>
		/// Gets a configuration settings of output CSS formatting
		/// </summary>
		[ConfigurationProperty("formatting")]
		public FormattingSettings Formatting
		{
			get { return (FormattingSettings)this["formatting"]; }
		}

		/// <summary>
		/// Gets or sets a optimization level
		/// </summary>
		[ConfigurationProperty("level", DefaultValue = OptimizationLevel.One)]
		public OptimizationLevel Level
		{
			get { return (OptimizationLevel)this["level"]; }
			set { this["level"] = value; }
		}

		/// <summary>
		/// Gets a configuration settings of level 1 optimizations
		/// </summary>
		[ConfigurationProperty("level1Optimizations")]
		public Level1OptimizationSettings Level1Optimizations
		{
			get { return (Level1OptimizationSettings)this["level1Optimizations"]; }
		}

		/// <summary>
		/// Gets a configuration settings of level 2 optimizations
		/// </summary>
		[ConfigurationProperty("level2Optimizations")]
		public Level2OptimizationSettings Level2Optimizations
		{
			get { return (Level2OptimizationSettings)this["level2Optimizations"]; }
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