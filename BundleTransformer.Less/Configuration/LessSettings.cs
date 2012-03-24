namespace BundleTransformer.Less.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of LESS-translator
	/// </summary>
	public sealed class LessSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow the use of native minification
		/// </summary>
		[ConfigurationProperty("useNativeMinification", DefaultValue = false)]
		public bool UseNativeMinification
		{
			get { return (bool)this["useNativeMinification"]; }
			set { this["useNativeMinification"] = value; }
		}
	}
}
