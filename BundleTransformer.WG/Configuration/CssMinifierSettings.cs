namespace BundleTransformer.WG.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of WebGrease Semantic CSS-minifier
	/// </summary>
	public sealed class CssMinifierSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable usual minification
		/// </summary>
		[ConfigurationProperty("shouldMinify", DefaultValue = true)]
		public bool ShouldMinify
		{
			get { return (bool)this["shouldMinify"]; }
			set { this["shouldMinify"] = value; }
		}
	}
}