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
		/// Gets a configuration settings of Uglify JS-minifier
		/// </summary>
		[ConfigurationProperty("js")]
		public JsMinifierSettings Js
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