namespace BundleTransformer.MicrosoftAjax.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Microsoft Ajax CSS-minifier
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

		/// <summary>
		/// Gets or sets a value indicating whether empty blocks removes
		/// the corresponding rule or directive
		/// </summary>
		[ConfigurationProperty("removeEmptyBlocks", DefaultValue = true)]
		public bool RemoveEmptyBlocks
		{
			get { return (bool)this["removeEmptyBlocks"]; }
			set { this["removeEmptyBlocks"] = value; }
		}
	}
}