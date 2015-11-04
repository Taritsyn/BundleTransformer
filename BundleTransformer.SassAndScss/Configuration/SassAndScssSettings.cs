namespace BundleTransformer.SassAndScss.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Sass- and SCSS-translator
	/// </summary>
	public sealed class SassAndScssSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow the use of native minification
		/// </summary>
		[ConfigurationProperty("useNativeMinification", DefaultValue = false)]
		public bool UseNativeMinification
		{
			get { return (bool)this["useNativeMinification"]; }
			set { this["useNativeMinification"] = value; }
		}

		/// <summary>
		/// Gets or sets a indent type
		/// </summary>
		[ConfigurationProperty("indentType", DefaultValue = IndentType.Space)]
		public IndentType IndentType
		{
			get { return (IndentType)this["indentType"]; }
			set { this["indentType"] = value; }
		}

		/// <summary>
		/// Gets or sets a number of spaces or tabs to be used for indentation
		/// </summary>
		[ConfigurationProperty("indentWidth", DefaultValue = 2)]
		[IntegerValidator(MinValue = 0, MaxValue = int.MaxValue, ExcludeRange = false)]
		public int IndentWidth
		{
			get { return (int)this["indentWidth"]; }
			set { this["indentWidth"] = value; }
		}

		/// <summary>
		/// Gets or sets a line feed type
		/// </summary>
		[ConfigurationProperty("lineFeedType", DefaultValue = LineFeedType.CrLf)]
		public LineFeedType LineFeedType
		{
			get { return (LineFeedType)this["lineFeedType"]; }
			set { this["lineFeedType"] = value; }
		}

		/// <summary>
		/// Gets or sets a precision for fractional numbers
		/// </summary>
		[ConfigurationProperty("precision", DefaultValue = 5)]
		[IntegerValidator(MinValue = -1, MaxValue = int.MaxValue, ExcludeRange = false)]
		public int Precision
		{
			get { return (int)this["precision"]; }
			set { this["precision"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to emit comments in the generated CSS
		/// indicating the corresponding source line
		/// </summary>
		[ConfigurationProperty("sourceComments", DefaultValue = false)]
		public bool SourceComments
		{
			get { return (bool)this["sourceComments"]; }
			set { this["sourceComments"] = value; }
		}
	}
}