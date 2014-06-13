namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	using Constants;

	/// <summary>
	/// Configuration settings of processing CSS-assets
	/// </summary>
	public sealed class CssSettings : AssetTypeSettingsBase
	{
		/// <summary>
		/// Gets or sets a ordered comma-separated list of names of default postprocessors
		/// </summary>
		[ConfigurationProperty("defaultPostProcessors", DefaultValue = PostProcessorName.UrlRewritingCssPostProcessor)]
		public override string DefaultPostProcessors
		{
			get { return (string)this["defaultPostProcessors"]; }
			set { this["defaultPostProcessors"] = value; }
		}
	}
}