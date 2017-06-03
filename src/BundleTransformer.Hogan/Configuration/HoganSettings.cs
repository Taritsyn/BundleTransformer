namespace BundleTransformer.Hogan.Configuration
{
	using System.Configuration;

	using Core.Configuration;

	/// <summary>
	/// Configuration settings of Hogan-translator
	/// </summary>
	public sealed class HoganSettings : ConfigurationSection
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
		/// Gets or sets a variable name for wrapper
		/// </summary>
		[ConfigurationProperty("variable", DefaultValue = "templates")]
		public string Variable
		{
			get { return (string)this["variable"]; }
			set { this["variable"] = value; }
		}

		/// <summary>
		/// Gets or sets a prefix to template names
		/// </summary>
		[ConfigurationProperty("namespace", DefaultValue = "")]
		public string Namespace
		{
			get { return (string)this["namespace"]; }
			set { this["namespace"] = value; }
		}

		/// <summary>
		/// Gets a list of registered custom section tags
		/// </summary>
		[ConfigurationProperty("sectionTags")]
		public SectionTagRegistrationCollection SectionTags
		{
			get { return (SectionTagRegistrationCollection)this["sectionTags"]; }
		}

		/// <summary>
		/// Gets or sets a string that overrides the default delimiters
		/// (for example, <code>&lt;% %&gt;</code>)
		/// </summary>
		[ConfigurationProperty("delimiters", DefaultValue = "")]
		public string Delimiters
		{
			get { return (string)this["delimiters"]; }
			set { this["delimiters"] = value; }
		}

		/// <summary>
		/// Gets a configuration settings of JavaScript engine
		/// </summary>
		[ConfigurationProperty("jsEngine")]
		public JsEngineSettings JsEngine
		{
			get { return (JsEngineSettings)this["jsEngine"]; }
		}
	}
}