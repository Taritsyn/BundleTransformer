namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of processing assets
	/// </summary>
	public abstract class AssetTypeSettingsBase : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets name of default minifier
		/// </summary>
		[ConfigurationProperty("defaultMinifier", DefaultValue = Constants.NullMinifierName)]
		public string DefaultMinifier
		{
			get { return (string)this["defaultMinifier"]; }
			set { this["defaultMinifier"] = value; }
		}

		/// <summary>
		/// Gets list of registered minifiers
		/// </summary>
		[ConfigurationProperty("minifiers", IsRequired = true)]
		public MinifierRegistrationList Minifiers
		{
			get { return (MinifierRegistrationList)this["minifiers"]; }
		}

		/// <summary>
		/// Gets list of registered translators
		/// </summary>
		[ConfigurationProperty("translators", IsRequired = true)]
		public TranslatorRegistrationList Translators
		{
			get { return (TranslatorRegistrationList)this["translators"]; }
		}
	}
}
