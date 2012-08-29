namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of the code generator
	/// </summary>
	public sealed class CodeGeneratorSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a output indented code
		/// </summary>
		[ConfigurationProperty("beautify", DefaultValue = false)]
		public bool Beautify
		{
			get { return (bool)this["beautify"]; }
			set { this["beautify"] = value; }
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
		/// Gets or sets a indentation level, in spaces (pass an even number)
		/// </summary>
		[ConfigurationProperty("indentLevel", DefaultValue = 4)]
		public int IndentLevel
		{
			get { return (int)this["indentLevel"]; }
			set { this["indentLevel"] = value; }
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
		/// Gets or sets a flag for whether to put a space before the colon in object literals
		/// </summary>
		[ConfigurationProperty("spaceColon", DefaultValue = false)]
		public bool SpaceColon
		{
			get { return (bool)this["spaceColon"]; }
			set { this["spaceColon"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to encode non-ASCII characters as \uXXXX
		/// </summary>
		[ConfigurationProperty("asciiOnly", DefaultValue = false)]
		public bool AsciiOnly
		{
			get { return (bool)this["asciiOnly"]; }
			set { this["asciiOnly"] = value; }
		}
	}
}
