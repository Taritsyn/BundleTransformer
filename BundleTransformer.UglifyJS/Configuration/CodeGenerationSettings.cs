namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of code generation
	/// </summary>
	public sealed class CodeGenerationSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to beautify the output
		/// </summary>
		[ConfigurationProperty("beautify", DefaultValue = false)]
		public bool Beautify
		{
			get { return (bool)this["beautify"]; }
			set { this["beautify"] = value; }
		}

		/// <summary>
		/// Gets or sets a indentation level, in spaces (pass an even number)
		/// </summary>
		[ConfigurationProperty("indentLevel", DefaultValue = 4)]
		public int IndentLevel
		{
			get { return (int)this["indentLevel"]; }
			set { this["indentLevel"] = value; }
		}

		/// <summary>
		/// Gets or sets a initial indentation in spaces
		/// </summary>
		[ConfigurationProperty("indentStart", DefaultValue = 0)]
		public int IndentStart
		{
			get { return (int)this["indentStart"]; }
			set { this["indentStart"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to quote all keys in literal objects
		/// </summary>
		[ConfigurationProperty("quoteKeys", DefaultValue = false)]
		public bool QuoteKeys
		{
			get { return (bool)this["quoteKeys"]; }
			set { this["quoteKeys"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a space after the colon signs
		/// </summary>
		[ConfigurationProperty("spaceColon", DefaultValue = true)]
		public bool SpaceColon
		{
			get { return (bool)this["spaceColon"]; }
			set { this["spaceColon"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to escape Unicode characters in strings and regexps
		/// </summary>
		[ConfigurationProperty("asciiOnly", DefaultValue = false)]
		public bool AsciiOnly
		{
			get { return (bool)this["asciiOnly"]; }
			set { this["asciiOnly"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to escape the slash in
		/// occurrences of <code>&lt;/script</code> in strings
		/// </summary>
		[ConfigurationProperty("inlineScript", DefaultValue = false)]
		public bool InlineScript
		{
			get { return (bool)this["inlineScript"]; }
			set { this["inlineScript"] = value; }
		}

		/// <summary>
		/// Gets or sets a orientative line width that the beautifier will try to obey
		/// </summary>
		[ConfigurationProperty("width", DefaultValue = 80)]
		public int Width
		{
			get { return (int)this["width"]; }
			set { this["width"] = value; }
		}

		/// <summary>
		/// Gets or sets a maximum line length (for uglified code)
		/// </summary>
		[ConfigurationProperty("maxLineLength", DefaultValue = 32000)]
		public int MaxLineLength
		{
			get { return (int)this["maxLineLength"]; }
			set { this["maxLineLength"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert brackets in <code>if</code>,
		/// <code>for</code>, <code>do</code>, <code>while</code> or <code>with</code>
		/// statements, even if their body is a single statement
		/// </summary>
		[ConfigurationProperty("bracketize", DefaultValue = false)]
		public bool Bracketize
		{
			get { return (bool)this["bracketize"]; }
			set { this["bracketize"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to separate statements with semicolons
		/// </summary>
		[ConfigurationProperty("semicolons", DefaultValue = true)]
		public bool Semicolons
		{
			get { return (bool)this["semicolons"]; }
			set { this["semicolons"] = value; }
		}

		/// <summary>
		/// Gets or sets a value that determines what kind of comments need to preserve:
		///		"all" - keep all comments;
		///		"copyright" - keep JSDoc-style comments that contain <code>@license</code> or <code>@preserve</code>;
		///		valid JS regexp (needs to start with a slash) - keep only comments that match;
		///		empty string - remove all comments.
		/// </summary>
		[ConfigurationProperty("comments", DefaultValue = "")]
		public string Comments
		{
			get { return (string)this["comments"]; }
			set { this["comments"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to preserve line breaks
		/// </summary>
		[ConfigurationProperty("preserveLine", DefaultValue = false)]
		public bool PreserveLine
		{
			get { return (bool)this["preserveLine"]; }
			set { this["preserveLine"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to unescape regular expressions
		/// </summary>
		[ConfigurationProperty("unescapeRegexps", DefaultValue = false)]
		public bool UnescapeRegexps
		{
			get { return (bool)this["unescapeRegexps"]; }
			set { this["unescapeRegexps"] = value; }
		}

		/// <summary>
		/// Gets or sets a preferred quote style for strings
		/// </summary>
		[ConfigurationProperty("quoteStyle", DefaultValue = QuoteStyle.Auto)]
		public QuoteStyle QuoteStyle
		{
			get { return (QuoteStyle)this["quoteStyle"]; }
			set { this["quoteStyle"] = value; }
		}
	}
}