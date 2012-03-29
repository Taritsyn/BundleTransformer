namespace BundleTransformer.Yui.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of YUI JS-Minifier
	/// </summary>
	public sealed class JsMinifierSettings : MinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a type of compression JavaScript-code
		/// </summary>
		[ConfigurationProperty("compressionType", DefaultValue = JavaScriptCompressionType.YuiStockCompression)]
		public JavaScriptCompressionType CompressionType
		{
			get { return (JavaScriptCompressionType)this["compressionType"]; }
			set { this["compressionType"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow display informational messages and warnings
		/// </summary>
		[ConfigurationProperty("isVerboseLogging", DefaultValue = true)]
		public bool IsVerboseLogging
		{
			get { return (bool) this["isVerboseLogging"]; }
			set { this["isVerboseLogging"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow obfuscation of code
		/// </summary>
		[ConfigurationProperty("isObfuscateJavascript", DefaultValue = true)]
		public bool IsObfuscateJavascript
		{
			get { return (bool)this["isObfuscateJavascript"]; }
			set { this["isObfuscateJavascript"] = value; }
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
		[ConfigurationProperty("isEvalIgnored", DefaultValue = false)]
		public bool IsEvalIgnored
		{
			get { return (bool)this["isEvalIgnored"]; }
			set { this["isEvalIgnored"] = value; }
		}
	}
}
