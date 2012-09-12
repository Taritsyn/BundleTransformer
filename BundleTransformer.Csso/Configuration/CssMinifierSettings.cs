namespace BundleTransformer.Csso.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Sergey Kryzhanovsky's CSS-minifier
	/// </summary>
	public sealed class CssMinifierSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to disable structure minification
		/// </summary>
		[ConfigurationProperty("disableRestructuring", DefaultValue = false)]
		public bool DisableRestructuring
		{
			get { return (bool)this["disableRestructuring"]; }
			set { this["disableRestructuring"] = value; }
		}
	}
}
