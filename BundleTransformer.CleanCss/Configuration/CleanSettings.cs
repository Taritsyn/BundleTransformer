namespace BundleTransformer.CleanCss.Configuration
{
	using System.Configuration;

	using Core.Configuration;

	/// <summary>
	/// Configuration settings of Clean-css Minifier
	/// </summary>
	public sealed class CleanSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets a configuration settings of Clean CSS-minifier
		/// </summary>
		[ConfigurationProperty("css")]
		public CssMinifierSettings Css
		{
			get { return (CssMinifierSettings)this["css"]; }
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