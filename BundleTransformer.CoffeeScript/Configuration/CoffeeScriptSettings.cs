namespace BundleTransformer.CoffeeScript.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of CoffeeScript-translator
	/// </summary>
	public sealed class CoffeeScriptSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow compilation to JavaScript 
		/// without the top-level function safety wrapper
		/// </summary>
		[ConfigurationProperty("bare", DefaultValue = true)]
		public bool Bare
		{
			get { return (bool)this["bare"]; }
			set { this["bare"] = value; }
		}
	}
}
