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
		/// Gets or sets a flag for whether to add new prefixes
		/// </summary>
		[ConfigurationProperty("add", DefaultValue = true)]
		public bool Add
		{
			get { return (bool)this["add"]; }
			set { this["add"] = value; }
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
		/// Gets or sets a flag for whether to add prefixes for <code>@supports</code> parameters
		/// </summary>
		[ConfigurationProperty("supports", DefaultValue = true)]
		public bool Supports
		{
			get { return (bool)this["supports"]; }
			set { this["supports"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to add prefixes for flexbox properties.
		/// With "no-2009" value Autoprefixer will add prefixes only for final and IE versions of specification.
		/// </summary>
		[ConfigurationProperty("flexbox", DefaultValue = "true")]
		public string Flexbox
		{
			get { return (string)this["flexbox"]; }
			set { this["flexbox"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to add IE prefixes for Grid Layout properties
		/// </summary>
		[ConfigurationProperty("grid", DefaultValue = true)]
		public bool Grid
		{
			get { return (bool)this["grid"]; }
			set { this["grid"] = value; }
		}

		/// <summary>
		/// Gets or sets a virtual path to file, that contains custom usage statistics for
		/// <code>&gt; 10% in my stats</code> browsers query
		/// </summary>
		[ConfigurationProperty("stats", DefaultValue = "")]
		public string Stats
		{
			get { return (string)this["stats"]; }
			set { this["stats"] = value; }
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