namespace BundleTransformer.Packer.Configuration
{
	using System.Configuration;

	using Core.Configuration;

	/// <summary>
	/// Configuration settings of Dean Edwards' Minifier
	/// </summary>
	public sealed class PackerSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets a configuration settings of Dean Edwards' JS-minifier
		/// </summary>
		[ConfigurationProperty("js")]
		public JsMinifierSettings JsMinifier
		{
			get { return (JsMinifierSettings)this["js"]; }
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