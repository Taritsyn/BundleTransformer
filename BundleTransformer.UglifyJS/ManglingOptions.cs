namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Mangling options
	/// </summary>
	public sealed class ManglingOptions
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
		/// Gets or sets a comma-separated list of names to exclude from mangling. 
		/// For example, to keep names <code>$</code>, <code>require</code> and <code>exports</code> 
		/// intact you’d specify <code>"$,require,exports"</code>.
		/// </summary>
		public string Except
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to mangle names visible in scopes 
		/// where <code>eval</code> or <code>when</code> are used
		/// </summary>
		public bool Eval
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to assign shorter names to most 
		/// frequently used variables
		/// </summary>
		public bool Sort
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to mangle names declared in the toplevel scope
		/// </summary>
		public bool TopLevel
		{
			get;
			set;
		}
	}
}