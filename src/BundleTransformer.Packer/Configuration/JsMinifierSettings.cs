namespace BundleTransformer.Packer.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Dean Edwards' JS-minifier
	/// </summary>
	public sealed class JsMinifierSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to shrink variables
		/// </summary>
		[ConfigurationProperty("shrinkVariables", DefaultValue = true)]
		public bool ShrinkVariables
		{
			get { return (bool)this["shrinkVariables"]; }
			set { this["shrinkVariables"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to Base62 encode
		/// </summary>
		[ConfigurationProperty("base62Encode", DefaultValue = false)]
		public bool Base62Encode
		{
			get { return (bool)this["base62Encode"]; }
			set { this["base62Encode"] = value; }
		}
	}
}