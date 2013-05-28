namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of the mangling
	/// </summary>
	public sealed class ManglingSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to mangle names
		/// </summary>
		[ConfigurationProperty("mangle", DefaultValue = true)]
		public bool Mangle
		{
			get { return (bool)this["mangle"]; }
			set { this["mangle"] = value; }
		}

		/// <summary>
		/// Gets or sets a comma-separated list of names to exclude from mangling. 
		/// For example, to keep names <code>$</code>, <code>require</code> and <code>exports</code> 
		/// intact you’d specify <code>"$,require,exports"</code>.
		/// </summary>
		[ConfigurationProperty("except", DefaultValue = "")]
		public string Except
		{
			get { return (string)this["except"]; }
			set { this["except"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to mangle names visible in scopes 
		/// where <code>eval</code> or <code>when</code> are used
		/// </summary>
		[ConfigurationProperty("eval", DefaultValue = false)]
		public bool Eval
		{
			get { return (bool)this["eval"]; }
			set { this["eval"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to assign shorter names to most 
		/// frequently used variables
		/// </summary>
		[ConfigurationProperty("sort", DefaultValue = false)]
		public bool Sort
		{
			get { return (bool)this["sort"]; }
			set { this["sort"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to mangle names declared in the toplevel scope
		/// </summary>
		[ConfigurationProperty("topLevel", DefaultValue = false)]
		public bool TopLevel
		{
			get { return (bool)this["topLevel"]; }
			set { this["topLevel"] = value; }
		}
	}
}