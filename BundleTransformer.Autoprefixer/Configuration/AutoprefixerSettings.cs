namespace BundleTransformer.Autoprefixer.Configuration
{
	using System.Configuration;

	using Core.Configuration;

	/// <summary>
	/// Configuration settings of Andrey Sitnik's Autoprefix CSS-postprocessor
	/// </summary>
	public sealed class AutoprefixerSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets a list of browser conditional expressions
		/// </summary>
		[ConfigurationProperty("browsers", IsRequired = false)]
		public BrowserConditionalExpressionCollection Browsers
		{
			get { return (BrowserConditionalExpressionCollection)this["browsers"]; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to create nice visual cascade of prefixes
		/// </summary>
		[ConfigurationProperty("cascade", DefaultValue = true)]
		public bool Cascade
		{
			get { return (bool)this["cascade"]; }
			set { this["cascade"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable the special safe mode to parse broken CSS
		/// </summary>
		[ConfigurationProperty("safe", DefaultValue = false)]
		public bool Safe
		{
			get { return (bool)this["safe"]; }
			set { this["safe"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove outdated prefixes
		/// </summary>
		[ConfigurationProperty("remove", DefaultValue = true)]
		public bool Remove
		{
			get { return (bool)this["remove"]; }
			set { this["remove"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to add new prefixes
		/// </summary>
		[ConfigurationProperty("add", DefaultValue = true)]
		public bool Add
		{
			get { return (bool)this["add"]; }
			set { this["add"] = value; }
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