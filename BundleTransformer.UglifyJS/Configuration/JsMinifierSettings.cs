namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Uglify JS-minifier
	/// </summary>
	public sealed class JsMinifierSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets a configuration settings of parsing
		/// </summary>
		[ConfigurationProperty("parsing")]
		public ParsingSettings Parsing
		{
			get { return (ParsingSettings)this["parsing"]; }
		}

		/// <summary>
		/// Gets a configuration settings of compression
		/// </summary>
		[ConfigurationProperty("compression")]
		public CompressionSettings Compression
		{
			get { return (CompressionSettings)this["compression"]; }
		}

		/// <summary>
		/// Gets a configuration settings of mangling
		/// </summary>
		[ConfigurationProperty("mangling")]
		public ManglingSettings Mangling
		{
			get { return (ManglingSettings)this["mangling"]; }
		}

		/// <summary>
		/// Gets a configuration settings of code generation
		/// </summary>
		[ConfigurationProperty("codeGeneration")]
		public CodeGenerationSettings CodeGeneration
		{
			get { return (CodeGenerationSettings)this["codeGeneration"]; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable full compliance with
		/// Internet Explorer 6-8 quirks
		/// </summary>
		[ConfigurationProperty("screwIe8", DefaultValue = false)]
		public bool ScrewIe8
		{
			get { return (bool)this["screwIe8"]; }
			set { this["screwIe8"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not mangle/drop function names.
		/// Useful for code relying on <code>Function.prototype.name</code>.
		/// </summary>
		[ConfigurationProperty("keepFunctionNames", DefaultValue = false)]
		public bool KeepFunctionNames
		{
			get { return (bool)this["keepFunctionNames"]; }
			set { this["keepFunctionNames"] = value; }
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - only error messages;
		///		1 - only error messages and warnings.
		/// </summary>
		[ConfigurationProperty("severity", DefaultValue = 0)]
		[IntegerValidator(MinValue = 0, MaxValue = 1, ExcludeRange = false)]
		public int Severity
		{
			get { return (int)this["severity"]; }
			set { this["severity"] = value; }
		}
	}
}