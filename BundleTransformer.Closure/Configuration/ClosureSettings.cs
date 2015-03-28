namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Closure Minifier
	/// </summary>
	public sealed class ClosureSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets a configuration settings of minification JS-assets
		/// </summary>
		[ConfigurationProperty("js")]
		public JsSettings Js
		{
			get { return (JsSettings)this["js"]; }
		}
	}
}