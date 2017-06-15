using System.Configuration;

namespace BundleTransformer.Yui.Configuration
{
	/// <summary>
	/// Configuration settings of YUI CSS minifier
	/// </summary>
	public sealed class CssMinifierSettings : MinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to remove all comments
		/// except "important" comments
		/// </summary>
		[ConfigurationProperty("removeComments", DefaultValue = true)]
		public bool RemoveComments
		{
			get { return (bool)this["removeComments"]; }
			set { this["removeComments"] = value; }
		}
	}
}