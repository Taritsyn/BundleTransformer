namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Translator registration
	/// </summary>
	public sealed class TranslatorRegistration : AssetProcessorRegistrationBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable translator
		/// </summary>
		[ConfigurationProperty("enabled", DefaultValue = true)]
		public bool Enabled
		{
			get { return (bool)this["enabled"]; }
			set { this["enabled"] = value; }
		}
	}
}
