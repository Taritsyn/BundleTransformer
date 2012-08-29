namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of the parser
	/// </summary>
	public sealed class ParserSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a processing mode of semicolons. 
		/// If you pass true then the parser will throw an error when 
		/// it expects a semicolon and it doesn’t find it. 
		/// For most JS code you don’t want that, but it’s useful if 
		/// you want to strictly sanitize your code.
		/// </summary>
		[ConfigurationProperty("strictSemicolons", DefaultValue = false)]
		public bool StrictSemicolons
		{
			get { return (bool)this["strictSemicolons"]; }
			set { this["strictSemicolons"] = value; }
		}
	}
}
