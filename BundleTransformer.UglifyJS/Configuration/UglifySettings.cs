namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

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
	}
}
