namespace BundleTransformer.SassAndScss.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Sass- and SCSS-translator
	/// </summary>
	public sealed class SassAndScssSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow the use of native minification
		/// </summary>
		[ConfigurationProperty("useNativeMinification", DefaultValue = false)]
		public bool UseNativeMinification
		{
			get { return (bool)this["useNativeMinification"]; }
			set { this["useNativeMinification"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to output the line number and file within comments
		/// </summary>
		[ConfigurationProperty("lineNumbers", DefaultValue = false)]
		public bool LineNumbers
		{
			get { return (bool)this["lineNumbers"]; }
			set { this["lineNumbers"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to output the full trace of imports
		/// and mixins before each selector
		/// </summary>
		[ConfigurationProperty("traceSelectors", DefaultValue = false)]
		public bool TraceSelectors
		{
			get { return (bool)this["traceSelectors"]; }
			set { this["traceSelectors"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to output the line number and file within a fake media query
		/// </summary>
		[ConfigurationProperty("debugInfo", DefaultValue = false)]
		public bool DebugInfo
		{
			get { return (bool)this["debugInfo"]; }
			set { this["debugInfo"] = value; }
		}
	}
}