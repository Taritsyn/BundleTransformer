namespace BundleTransformer.CleanCss.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Clean CSS-minifier
	/// </summary>
	public sealed class CssMinifierSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a special comments mode
		/// </summary>
		[ConfigurationProperty("keepSpecialComments", DefaultValue = SpecialCommentsMode.KeepAll)]
		public SpecialCommentsMode KeepSpecialComments
		{
			get { return (SpecialCommentsMode)this["keepSpecialComments"]; }
			set { this["keepSpecialComments"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to keep line breaks
		/// </summary>
		[ConfigurationProperty("keepBreaks", DefaultValue = false)]
		public bool KeepBreaks
		{
			get { return (bool)this["keepBreaks"]; }
			set { this["keepBreaks"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove empty elements
		/// </summary>
		[ConfigurationProperty("removeEmpty", DefaultValue = false)]
		public bool RemoveEmpty
		{
			get { return (bool)this["removeEmpty"]; }
			set { this["removeEmpty"] = value; }
		}
	}
}