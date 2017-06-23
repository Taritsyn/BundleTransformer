namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Options of code generation
	/// </summary>
	public sealed class CodeGenerationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to escape Unicode characters in strings and regexps
		/// </summary>
		public bool AsciiOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to beautify the output
		/// </summary>
		public bool Beautify
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert brackets in <code>if</code>,
		/// <code>for</code>, <code>do</code>, <code>while</code> or <code>with</code>
		/// statements, even if their body is a single statement
		/// </summary>
		public bool Bracketize
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a value that determines what kind of comments need to preserve:
		///		"all" - keep all comments;
		///		"some" - keep JSDoc-style (e.g. <code>@license</code> or <code>@preserve</code>) and conditional compilation comments;
		///		valid JS RegExp like `/foo/`or `/^!/` - keep only comments that match;
		///		empty string - remove all comments.
		/// </summary>
		public string Comments
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a indentation level, in spaces (pass an even number)
		/// </summary>
		public int IndentLevel
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a initial indentation in spaces
		/// </summary>
		public int IndentStart
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to escape the slash in
		/// occurrences of <code>&lt;/script</code> in strings
		/// </summary>
		public bool InlineScript
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to prevent stripping quotes
		/// from property names in object literals
		/// </summary>
		public bool KeepQuotedProperties
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a maximum line length (for uglified code)
		/// </summary>
		public int MaxLineLength
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to preserve line breaks
		/// </summary>
		public bool PreserveLine
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to quote all keys in literal objects
		/// </summary>
		public bool QuoteKeys
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a preferred quote style for strings
		/// </summary>
		public QuoteStyle QuoteStyle
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to separate statements with semicolons
		/// </summary>
		public bool Semicolons
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a space after the colon signs
		/// </summary>
		public bool SpaceColon
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to unescape regular expressions
		/// </summary>
		public bool UnescapeRegexps
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a orientative line width that the beautifier will try to obey
		/// </summary>
		public int Width
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to wrap IIFEs in parenthesis
		/// </summary>
		public bool WrapIife
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the options of code generation
		/// </summary>
		public CodeGenerationOptions()
		{
			AsciiOnly = false;
			Beautify = false;
			Bracketize = false;
			Comments = "some";
			IndentLevel = 4;
			IndentStart = 0;
			InlineScript = true;
			KeepQuotedProperties = false;
			MaxLineLength = 32000;
			PreserveLine = false;
			QuoteKeys = false;
			QuoteStyle = QuoteStyle.Auto;
			Semicolons = true;
			SpaceColon = true;
			UnescapeRegexps = false;
			Width = 80;
			WrapIife = false;
		}
	}
}