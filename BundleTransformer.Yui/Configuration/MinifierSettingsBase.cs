namespace BundleTransformer.Yui.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of minifier
	/// </summary>
	public abstract class MinifierSettingsBase : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a code compression type
		/// </summary>
		[ConfigurationProperty("compressionType", DefaultValue = CompressionType.Standard)]
		public CompressionType CompressionType
		{
			get { return (CompressionType)this["compressionType"]; }
			set { this["compressionType"] = value; }
		}

		/// <summary>
		/// Gets or sets a column number, after which must be inserted a line break.
		/// Specify 0 to get a line break after each semi-colon in JavaScript,
		/// and after each rule in CSS.
		/// </summary>
		[ConfigurationProperty("lineBreakPosition", DefaultValue = -1)]
		public int LineBreakPosition
		{
			get { return (int)this["lineBreakPosition"]; }
			set { this["lineBreakPosition"] = value; }
		}
	}
}