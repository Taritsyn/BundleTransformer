using System.Configuration;

namespace BundleTransformer.WG.Configuration
{
	/// <summary>
	/// Configuration settings of WebGrease Minifier
	/// </summary>
	public sealed class WgSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets a configuration settings of WebGrease Semantic CSS minifier
		/// </summary>
		[ConfigurationProperty("css")]
		public CssMinifierSettings CssMinifier
		{
			get { return (CssMinifierSettings)this["css"]; }
		}
	}
}