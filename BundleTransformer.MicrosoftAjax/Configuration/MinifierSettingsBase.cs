namespace BundleTransformer.MicrosoftAjax.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of minifier
	/// </summary>
	public abstract class MinifierSettingsBase : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets whether embedded ASP.NET blocks (<code>&lt;% %&gt;</code>) 
		/// should be recognized and output as is
		/// </summary>
		[ConfigurationProperty("allowEmbeddedAspNetBlocks", DefaultValue = false)]
		public bool AllowEmbeddedAspNetBlocks
		{
			get { return (bool)this["allowEmbeddedAspNetBlocks"]; }
			set { this["allowEmbeddedAspNetBlocks"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether the opening curly brace for blocks is
		/// on its own line (<code>NewLine</code>) or on the same line as 
		/// the preceding code (<code>SameLine</code>)
		/// or taking a hint from the source code position (<code>UseSource</code>).
		/// Only relevant when OutputMode is set to <code>MultipleLines</code>.
		/// </summary>
		[ConfigurationProperty("blocksStartOnSameLine", DefaultValue = BlockStart.NewLine)]
		public BlockStart BlocksStartOnSameLine
		{
			get { return (BlockStart)this["blocksStartOnSameLine"]; }
			set { this["blocksStartOnSameLine"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to ignore all errors found in the input code
		/// </summary>
		[ConfigurationProperty("ignoreAllErrors", DefaultValue = false)]
		public bool IgnoreAllErrors
		{
			get { return (bool) this["ignoreAllErrors"]; }
			set { this["ignoreAllErrors"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of the list of 
		/// debug lookups (comma-separated)
		/// </summary>
		[ConfigurationProperty("ignoreErrorList", DefaultValue = "")]
		public string IgnoreErrorList
		{
			get { return (string)this["ignoreErrorList"]; }
			set { this["ignoreErrorList"] = value; }
		}

		/// <summary>
		/// Gets or sets a number of spaces per indent level when in 
		/// <code>MultipleLines</code> output mode
		/// </summary>
		[ConfigurationProperty("indentSize", DefaultValue = 4)]
		public int IndentSize
		{
			get { return (int)this["indentSize"]; }
			set { this["indentSize"] = value; }
		}

		/// <summary>
		/// Gets or sets a column position at which the line 
		/// will be broken at the next available opportunity
		/// </summary>
		[ConfigurationProperty("lineBreakThreshold", DefaultValue = 2147482647)]
		public int LineBreakThreshold
		{
			get { return (int)this["lineBreakThreshold"]; }
			set { this["lineBreakThreshold"] = value; }
		}

		/// <summary>
		/// Gets or sets a output mode:
		/// <code>SingleLine</code> - output all code on a single line;
		/// <code>MultipleLines</code> - break the output into multiple lines to be more human-readable
		/// </summary>
		[ConfigurationProperty("outputMode", DefaultValue = OutputMode.SingleLine)]
		public OutputMode OutputMode
		{
			get { return (OutputMode)this["outputMode"]; }
			set { this["outputMode"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of the list 
		/// of names defined for the preprocessor (comma-separated)
		/// </summary>
		[ConfigurationProperty("preprocessorDefineList", DefaultValue = "")]
		public string PreprocessorDefineList
		{
			get { return (string)this["preprocessorDefineList"]; }
			set { this["preprocessorDefineList"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to add a semicolon 
		/// at the end of the parsed code
		/// </summary>
		[ConfigurationProperty("termSemicolons", DefaultValue = false)]
		public bool TermSemicolons
		{
			get { return (bool)this["termSemicolons"]; }
			set { this["termSemicolons"] = value; }
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - syntax error;
		///		1 - the programmer probably did not intend to do this;
		///		2 - this can lead to problems in the future;
		///		3 - this can lead to performance problems;
		///		4 - this is just not right
		/// </summary>
		[ConfigurationProperty("severity", DefaultValue = 0)]
		[IntegerValidator(MinValue = 0, MaxValue = 4, ExcludeRange = false)]
		public int Severity
		{
			get { return (int)this["severity"]; }
			set { this["severity"] = value; }
		}
	}
}