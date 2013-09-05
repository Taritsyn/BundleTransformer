namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	using Core.Configuration;

	/// <summary>
	/// Configuration settings of Uglify Minifier
	/// </summary>
	public sealed class UglifySettings : ConfigurationSection
	{
		/// <summary>
		/// Get a configuration settings of minification JS-assets
		/// </summary>
		[ConfigurationProperty("js")]
		public JsSettings Js
		{
			get { return (JsSettings)this["js"]; }
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