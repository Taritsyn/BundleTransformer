namespace BundleTransformer.Yui.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of YUI JS-minifier
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
		/// Gets or sets the type of Encoding.
		/// Eg. ASCII, BigEndianUnicode, Unicode, UTF32, UTF7, UTF8.
		/// </summary>
		[ConfigurationProperty("encoding", DefaultValue = "UTF8")]
		public string Encoding
		{
			get { return (string)this["encoding"]; }
			set { this["encoding"] = value; }
		}

		/// <summary>
		/// Gets or sets the culture you want the thread to run under.
		/// This affects the treatment of numbers etc - e.g. 9.00 could be output as 9,00
		/// (this is mainly for non English OS's).
		/// </summary>
		[ConfigurationProperty("threadCulture", DefaultValue = "InvariantCulture")]
		public string ThreadCulture
		{
			get { return (string)this["threadCulture"]; }
			set { this["threadCulture"] = value; }
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