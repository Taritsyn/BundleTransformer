using System.Configuration;

namespace BundleTransformer.NUglify.Configuration
{
	/// <summary>
	/// Common configuration settings of NUglify Minifier
	/// </summary>
	public sealed class NUglifySettings : ConfigurationSection
	{
		/// <summary>
		/// Gets a configuration settings of NUglify CSS minifier
		/// </summary>
		[ConfigurationProperty("css")]
		public CssMinifierSettings CssMinifier
		{
			get { return (CssMinifierSettings)this["css"]; }
		}

		/// <summary>
		/// Gets a configuration settings of NUglify JS minifier
		/// </summary>
		[ConfigurationProperty("js")]
		public JsMinifierSettings JsMinifier
		{
			get { return (JsMinifierSettings)this["js"]; }
		}
	}
}