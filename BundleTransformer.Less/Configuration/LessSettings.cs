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

		/// <summary>
		/// Gets or sets a flag for whether to enforce IE compatibility (IE8 data-uri)
		/// </summary>
		[ConfigurationProperty("ieCompat", DefaultValue = true)]
		public bool IeCompat
		{
			get { return (bool)this["ieCompat"]; }
			set { this["ieCompat"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether math has to be within parenthesis
		/// </summary>
		[ConfigurationProperty("strictMath", DefaultValue = false)]
		public bool StrictMath
		{
			get { return (bool)this["strictMath"]; }
			set { this["strictMath"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether units need to evaluate correctly
		/// </summary>
		[ConfigurationProperty("strictUnits", DefaultValue = false)]
		public bool StrictUnits
		{
			get { return (bool)this["strictUnits"]; }
			set { this["strictUnits"] = value; }
		}
	}
}