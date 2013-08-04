namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of processing CSS-assets
	/// </summary>
	public sealed class CssSettings : AssetTypeSettingsBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to disable native 
		/// transformation of relative paths to absolute in CSS-files
		/// </summary>
		[ConfigurationProperty("disableNativeCssRelativePathTransformation", DefaultValue = false)]
		public bool DisableNativeCssRelativePathTransformation
		{
			get { return (bool)this["disableNativeCssRelativePathTransformation"]; }
			set { this["disableNativeCssRelativePathTransformation"] = value; }
		}
	}
}