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
		public BrowserConditionalExpressionList Browsers
		{
			get { return (BrowserConditionalExpressionList)this["browsers"]; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to create nice visual cascade of prefixes
		/// </summary>
		[ConfigurationProperty("cascade", DefaultValue = false)]
		public bool Cascade
		{
			get { return (bool)this["cascade"]; }
			set { this["cascade"] = value; }
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