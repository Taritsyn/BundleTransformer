namespace BundleTransformer.Yui.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of YUI CSS-Minifier
	/// </summary>
	public sealed class CssMinifierSettings : MinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a type of compression CSS-code
		/// </summary>
		[ConfigurationProperty("compressionType", DefaultValue = CssCompressionType.StockYuiCompressor)]
		public CssCompressionType CompressionType
		{
			get { return (CssCompressionType)this["compressionType"]; }
			set { this["compressionType"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove all comments 
		/// except "important" comments
		/// </summary>
		[ConfigurationProperty("removeComments", DefaultValue = true)]
		public bool RemoveComments
		{
			get { return (bool)this["removeComments"]; }
			set { this["removeComments"] = value; }
		}
	}
}
