namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Uglification options
	/// </summary>
	internal sealed class UglificationOptions
	{
		/// <summary>
		/// Gets or sets a options of parsing
		/// </summary>
		public ParsingOptions ParsingOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a options of compression
		/// </summary>
		public CompressionOptions CompressionOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a options of mangling
		/// </summary>
		public ManglingOptions ManglingOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a options of code generation
		/// </summary>
		public CodeGenerationOptions CodeGenerationOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable full compliance with
		/// Internet Explorer 6-8 quirks
		/// </summary>
		public bool ScrewIe8
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not mangle/drop function names.
		/// Useful for code relying on <code>Function.prototype.name</code>.
		/// </summary>
		public bool KeepFunctionNames
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - only error messages;
		///		1 - only error messages and warnings.
		/// </summary>
		public int Severity
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the uglification options
		/// </summary>
		public UglificationOptions()
		{
			ParsingOptions = new ParsingOptions();
			CompressionOptions = new CompressionOptions();
			ManglingOptions = new ManglingOptions();
			CodeGenerationOptions = new CodeGenerationOptions();
			ScrewIe8 = false;
			KeepFunctionNames = false;
			Severity = 0;
		}
	}
}