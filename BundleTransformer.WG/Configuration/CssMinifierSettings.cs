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

		/// <summary>
		/// Gets or sets a flag for whether to eject the <code>@charset</code> rules before minification
		/// </summary>
		[ConfigurationProperty("ejectCharset", DefaultValue = true)]
		public bool EjectCharset
		{
			get { return (bool)this["ejectCharset"]; }
			set { this["ejectCharset"] = value; }
		}
	}
}