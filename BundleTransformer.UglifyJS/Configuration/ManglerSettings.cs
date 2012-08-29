namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of the mangler
	/// </summary>
	public sealed class ManglerSettings : ConfigurationElement
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
		/// Gets or sets a flag for whether to mangle names in 
		/// the toplevel scope (by default we don’t touch them)
		/// </summary>
		[ConfigurationProperty("topLevel", DefaultValue = false)]
		public bool TopLevel
		{
			get { return (bool)this["topLevel"]; }
			set { this["topLevel"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of the object 
		/// (comma-separated list of values of the form SYMBOL[=value]) 
		/// with properties named after symbols to replace 
		/// (except where symbol has properly declared by a var declaration 
		/// or use as function parameter or similar) and the values 
		/// representing the AST replacement value
		/// </summary>
		[ConfigurationProperty("defines", DefaultValue = "")]
		public string Defines
		{
			get { return (string)this["defines"]; }
			set { this["defines"] = value; }
		}

		/// <summary>
		/// Gets or sets a comma-separated list of names to exclude from compression. 
		/// For example, to keep names require and $super intact you’d specify "require,$super".
		/// </summary>
		[ConfigurationProperty("except", DefaultValue = "")]
		public string Except
		{
			get { return (string)this["except"]; }
			set { this["except"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable mangling the names of functions
		/// </summary>
		[ConfigurationProperty("noFunctions", DefaultValue = false)]
		public bool NoFunctions
		{
			get { return (bool)this["noFunctions"]; }
			set { this["noFunctions"] = value; }
		}
	}
}
