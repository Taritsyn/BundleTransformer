namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of processing JS-assets
	/// </summary>
	public sealed class JsSettings : AssetTypeSettingsBase
	{
		/// <summary>
		/// Gets or sets a ordered comma-separated list of names of default postprocessors
		/// </summary>
		[ConfigurationProperty("defaultPostProcessors", DefaultValue = "")]
		public override string DefaultPostProcessors
		{
			get { return (string)this["defaultPostProcessors"]; }
			set { this["defaultPostProcessors"] = value; }
		}
	}
}