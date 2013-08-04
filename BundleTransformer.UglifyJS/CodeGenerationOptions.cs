namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Options of code generation
	/// </summary>
	public sealed class CodeGenerationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to beautify the output
		/// </summary>
		public bool Beautify
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
		/// Gets or sets a flag for whether to quote all keys in literal objects
		/// </summary>
		public bool QuoteKeys
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
		/// Gets or sets a flag for whether to escape Unicode characters in strings and regexps
		/// </summary>
		public bool AsciiOnly
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
		/// Gets or sets a orientative line width that the beautifier will try to obey
		/// </summary>
		public int Width
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
		/// Gets or sets a flag for whether to generate “IE-proof” code 
		/// (for now this means add brackets around the do/while in 
		/// code like this: <code>if (foo) do something(); while (bar); else ....</code>)
		/// </summary>
		public bool IeProof
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
		/// Gets or sets a flag for whether to separate statements with semicolons
		/// </summary>
		public bool Semicolons
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to preserve comments
		/// </summary>
		public bool Comments
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
		/// Constructs instance of the options of code generation
		/// </summary>
		public CodeGenerationOptions()
		{
			Beautify = false;
			IndentLevel = 4;
			IndentStart = 0;
			QuoteKeys = false;
			SpaceColon = true;
			AsciiOnly = false;
			InlineScript = false;
			Width = 80;
			MaxLineLength = 32000;
			IeProof = true;
			Bracketize = false;
			Semicolons = true;
			Comments = false;
			PreserveLine = false;
		}
	}
}