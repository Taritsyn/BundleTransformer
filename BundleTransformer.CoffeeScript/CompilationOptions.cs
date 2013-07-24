namespace BundleTransformer.CoffeeScript
{
	/// <summary>
	/// Compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow compilation to JavaScript 
		/// without the top-level function safety wrapper
		/// </summary>
		public bool Bare
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable "literate" mode
		/// </summary>
		public bool Literate
		{
			get;
			set;
		}
	}
}
