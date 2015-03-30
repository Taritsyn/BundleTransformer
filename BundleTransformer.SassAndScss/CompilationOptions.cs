namespace BundleTransformer.SassAndScss
{
	/// <summary>
	/// Compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a stylesheet syntax types
		/// </summary>
		public SyntaxType SyntaxType
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable native minification
		/// </summary>
		public bool EnableNativeMinification
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to output the line number and file within comments
		/// </summary>
		public bool LineNumbers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to output the full trace of imports
		/// and mixins before each selector
		/// </summary>
		public bool TraceSelectors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to output the line number and file within a fake media query
		/// </summary>
		public bool DebugInfo
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the Sass and SCSS compilation options
		/// </summary>
		public CompilationOptions()
		{
			SyntaxType = SyntaxType.Unknown;
			EnableNativeMinification = false;
			LineNumbers = false;
			TraceSelectors = false;
			DebugInfo = false;
		}
	}
}