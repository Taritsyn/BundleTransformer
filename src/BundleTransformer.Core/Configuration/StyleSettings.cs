using System.Configuration;

using BundleTransformer.Core.Constants;

namespace BundleTransformer.Core.Configuration
{
	/// <summary>
	/// Configuration settings of processing style assets
	/// </summary>
	public sealed class StyleSettings : AssetSettingsBase
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