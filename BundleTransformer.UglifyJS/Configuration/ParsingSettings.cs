namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of parsing
	/// </summary>
	public sealed class ParsingSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to disable automatic semicolon 
		/// insertion and support for trailing comma in arrays and objects
		/// </summary>
		[ConfigurationProperty("strict", DefaultValue = false)]
		public bool Strict
		{
			get { return (bool)this["strict"]; }
			set { this["strict"] = value; }
		}
	}
}
