namespace BundleTransformer.Csso.Configuration
{
	using System.Configuration;

	using Core.Configuration;

	/// <summary>
	/// Configuration settings of Sergey Kryzhanovsky's Minifier
	/// </summary>
	public sealed class CssoSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets a configuration settings of Sergey Kryzhanovsky's CSS-minifier
		/// </summary>
		[ConfigurationProperty("css")]
		public CssMinifierSettings CssMinifier
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