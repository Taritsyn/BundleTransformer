namespace BundleTransformer.Less
{
	/// <summary>
	/// Compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable native minification
		/// </summary>
		public bool EnableNativeMinification
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enforce IE compatibility (IE8 data-uri)
		/// </summary>
		public bool IeCompat
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether math has to be within parenthesis
		/// </summary>
		public bool StrictMath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether units need to evaluate correctly
		/// </summary>
		public bool StrictUnits
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a output mode of the debug information
		/// </summary>
		public LineNumbersMode DumpLineNumbers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable JavaScript in less files
		/// </summary>
		public bool JavascriptEnabled
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of the LESS compilation options
		/// </summary>
		public CompilationOptions()
		{
			EnableNativeMinification = false;
			IeCompat = true;
			StrictMath = false;
			StrictUnits = false;
			DumpLineNumbers = LineNumbersMode.None;
			JavascriptEnabled = true;
		}
	}
}