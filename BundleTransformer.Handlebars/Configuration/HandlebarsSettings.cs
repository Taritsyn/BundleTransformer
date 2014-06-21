namespace BundleTransformer.Handlebars.Configuration
{
	using System.Configuration;

	using Core.Configuration;

	/// <summary>
	/// Configuration settings of Handlebars-translator
	/// </summary>
	public sealed class HandlebarsSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a template namespace
		/// </summary>
		[ConfigurationProperty("namespace", DefaultValue = "Handlebars.templates")]
		public string Namespace
		{
			get { return (string)this["namespace"]; }
			set { this["namespace"] = value; }
		}

		/// <summary>
		/// Gets or sets a template root.
		/// Base value that will be stripped from template names.
		/// </summary>
		[ConfigurationProperty("rootPath", DefaultValue = "")]
		public string RootPath
		{
			get { return (string)this["rootPath"]; }
			set { this["rootPath"] = value; }
		}

		/// <summary>
		/// Gets or sets a comma-separated list of known helpers
		/// </summary>
		[ConfigurationProperty("knownHelpers", DefaultValue = "")]
		public string KnownHelpers
		{
			get { return (string)this["knownHelpers"]; }
			set { this["knownHelpers"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to use only known helpers
		/// </summary>
		[ConfigurationProperty("knownHelpersOnly", DefaultValue = false)]
		public bool KnownHelpersOnly
		{
			get { return (bool)this["knownHelpersOnly"]; }
			set { this["knownHelpersOnly"] = value; }
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