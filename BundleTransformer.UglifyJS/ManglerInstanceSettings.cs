namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Settings of the mangler
	/// </summary>
	public sealed class ManglerInstanceSettings
	{
		/// <summary>
		/// Gets or sets a flag for whether to mangle names
		/// </summary>
		public bool Mangle
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to mangle names in 
		/// the toplevel scope (by default we don’t touch them)
		/// </summary>
		public bool TopLevel
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a string representation of the object 
		/// (comma-separated list of values of the form SYMBOL[=value]) 
		/// with properties named after symbols to replace 
		/// (except where symbol has properly declared by a var declaration 
		/// or use as function parameter or similar) and the values 
		/// representing the AST replacement value
		/// </summary>
		public string Defines
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of names to exclude from compression. 
		/// For example, to keep names require and $super intact you’d specify "require,$super".
		/// </summary>
		public string Except
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable mangling the names of functions
		/// </summary>
		public bool NoFunctions
		{
			get;
			set;
		}
	}
}
