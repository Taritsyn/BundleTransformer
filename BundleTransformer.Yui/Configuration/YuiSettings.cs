namespace BundleTransformer.Yui.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of YUI Minifier
	/// </summary>
	public sealed class YuiSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets a configuration settings of YUI CSS-minifier
		/// </summary>
		[ConfigurationProperty("css")]
		public CssMinifierSettings CssMinifier
		{
			get { return (CssMinifierSettings)this["css"]; }
		}

		/// <summary>
		/// Gets a configuration settings of YUI JS-minifier
		/// </summary>
		[ConfigurationProperty("js")]
		public JsMinifierSettings JsMinifier
		{
			get { return (JsMinifierSettings)this["js"]; }
		}
	}
}
