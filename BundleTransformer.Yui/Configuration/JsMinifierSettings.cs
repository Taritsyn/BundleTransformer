namespace BundleTransformer.Yui.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of YUI JS-Minifier
	/// </summary>
	public sealed class JsMinifierSettings : MinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow obfuscation of code
		/// </summary>
		[ConfigurationProperty("obfuscateJavascript", DefaultValue = true)]
		public bool ObfuscateJavascript
		{
			get { return (bool)this["obfuscateJavascript"]; }
			set { this["obfuscateJavascript"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to preserve unnecessary 
		/// semicolons (such as right before a '}')
		/// </summary>
		[ConfigurationProperty("preserveAllSemicolons", DefaultValue = false)]
		public bool PreserveAllSemicolons
		{
			get { return (bool)this["preserveAllSemicolons"]; }
			set { this["preserveAllSemicolons"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable all the built-in micro optimizations
		/// </summary>
		[ConfigurationProperty("disableOptimizations", DefaultValue = false)]
		public bool DisableOptimizations
		{
			get { return (bool)this["disableOptimizations"]; }
			set { this["disableOptimizations"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to ignore when processing code, that 
		/// executed in eval operator
		/// </summary>
		[ConfigurationProperty("ignoreEval", DefaultValue = false)]
		public bool IgnoreEval
		{
			get { return (bool)this["ignoreEval"]; }
			set { this["ignoreEval"] = value; }
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - only syntax error messages;
		///		1 - only syntax error messages and warnings.
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
