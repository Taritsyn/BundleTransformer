namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Parsing options
	/// </summary>
	public sealed class ParsingOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to disable automatic semicolon 
		/// insertion and support for trailing comma in arrays and objects
		/// </summary>
		public bool Strict
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow return outside of functions.
		/// Useful when minifying CommonJS modules.
		/// </summary>
		public bool BareReturns
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of the parsing options
		/// </summary>
		public ParsingOptions()
		{
			Strict = false;
			BareReturns = false;
		}
	}
}