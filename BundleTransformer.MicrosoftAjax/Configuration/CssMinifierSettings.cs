namespace BundleTransformer.MicrosoftAjax.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Microsoft Ajax CSS-Minifier
	/// </summary>
	public sealed class CssMinifierSettings : MinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets ColorNames setting
		/// </summary>
		[ConfigurationProperty("colorNames", DefaultValue = CssColor.Strict)]
		public CssColor ColorNames
		{
			get { return (CssColor)this["colorNames"]; }
			set { this["colorNames"] = value; }
		}

		/// <summary>
		/// Gets or sets CommentMode setting
		/// </summary>
		[ConfigurationProperty("commentMode", DefaultValue = CssComment.Important)]
		public CssComment CommentMode
		{
			get { return (CssComment) this["commentMode"]; }
			set { this["commentMode"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether to minify the 
		/// JavaScript within expression functions
		/// </summary>
		[ConfigurationProperty("minifyExpressions", DefaultValue = true)]
		public bool MinifyExpressions
		{
			get { return (bool)this["minifyExpressions"]; }
			set { this["minifyExpressions"] = value; }
		}
	}
}
