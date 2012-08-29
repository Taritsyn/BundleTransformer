namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Settings of the code generator
	/// </summary>
	public sealed class CodeGeneratorInstanceSettings
	{
		/// <summary>
		/// Gets or sets a output indented code
		/// </summary>
		public bool Beautify
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
		/// Gets or sets a indentation level, in spaces (pass an even number)
		/// </summary>
		public int IndentLevel
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
		/// Gets or sets a flag for whether to put a space before the colon in object literals
		/// </summary>
		public bool SpaceColon
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to encode non-ASCII characters as \uXXXX
		/// </summary>
		public bool AsciiOnly
		{
			get;
			set;
		}
	}
}
