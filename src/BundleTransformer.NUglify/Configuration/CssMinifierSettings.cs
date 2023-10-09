using System.Configuration;

namespace BundleTransformer.NUglify.Configuration
{
	/// <summary>
	/// Configuration settings of NUglify CSS minifier
	/// </summary>
	public sealed class CssMinifierSettings : MinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a value indicating whether to abbreviate hex colors to #rgb(a) format
		/// </summary>
		[ConfigurationProperty("abbreviateHexColor", DefaultValue = true)]
		public bool AbbreviateHexColor
		{
			get { return (bool)this["abbreviateHexColor"]; }
			set { this["abbreviateHexColor"] = value; }
		}

		/// <summary>
		/// Gets or sets a <see cref="CssColor"/> setting
		/// </summary>
		[ConfigurationProperty("colorNames", DefaultValue = CssColor.Hex)]
		public CssColor ColorNames
		{
			get { return (CssColor)this["colorNames"]; }
			set { this["colorNames"] = value; }
		}

		/// <summary>
		/// Gets or sets a <see cref="CssComment"/> setting
		/// </summary>
		[ConfigurationProperty("commentMode", DefaultValue = CssComment.Important)]
		public CssComment CommentMode
		{
			get { return (CssComment) this["commentMode"]; }
			set { this["commentMode"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether unicode escape strings (e.g. <code>\ff0e</code>)
		/// would be replaced by it's actual character or not
		/// </summary>
		[ConfigurationProperty("decodeEscapes", DefaultValue = true)]
		public bool DecodeEscapes
		{
			get { return (bool)this["decodeEscapes"]; }
			set { this["decodeEscapes"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether IE8 .EOT fonts should get a question-mark
		/// appended to the URL (if not there already) to prevent the browser from generating
		/// invalid HTTP requests to the server
		/// </summary>
		[ConfigurationProperty("fixIE8Fonts", DefaultValue = true)]
		public bool FixIE8Fonts
		{
			get { return (bool)this["fixIE8Fonts"]; }
			set { this["fixIE8Fonts"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether to minify the
		/// JS within expression functions
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