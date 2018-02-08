using System.Configuration;

using BundleTransformer.Core.Configuration;

namespace BundleTransformer.Less.Configuration
{
	/// <summary>
	/// Configuration settings of LESS translator
	/// </summary>
	public sealed class LessSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow the use of native minification
		/// </summary>
		[ConfigurationProperty("useNativeMinification", DefaultValue = false)]
		public bool UseNativeMinification
		{
			get { return (bool)this["useNativeMinification"]; }
			set { this["useNativeMinification"] = value; }
		}

		/// <summary>
		/// Gets a list of include paths
		/// </summary>
		[ConfigurationProperty("includePaths", IsRequired = false)]
		public IncludedPathRegistrationCollection IncludePaths
		{
			get { return (IncludedPathRegistrationCollection)this["includePaths"]; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enforce IE compatibility (IE8 data-uri)
		/// </summary>
		[ConfigurationProperty("ieCompat", DefaultValue = true)]
		public bool IeCompat
		{
			get { return (bool)this["ieCompat"]; }
			set { this["ieCompat"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether math has to be within parenthesis
		/// </summary>
		[ConfigurationProperty("strictMath", DefaultValue = false)]
		public bool StrictMath
		{
			get { return (bool)this["strictMath"]; }
			set { this["strictMath"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether units need to evaluate correctly
		/// </summary>
		[ConfigurationProperty("strictUnits", DefaultValue = false)]
		public bool StrictUnits
		{
			get { return (bool)this["strictUnits"]; }
			set { this["strictUnits"] = value; }
		}

		/// <summary>
		/// Gets or sets a output mode of the debug information
		/// </summary>
		[ConfigurationProperty("dumpLineNumbers", DefaultValue = LineNumbersMode.None)]
		public LineNumbersMode DumpLineNumbers
		{
			get { return (LineNumbersMode)this["dumpLineNumbers"]; }
			set { this["dumpLineNumbers"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable JS in less files
		/// </summary>
		[ConfigurationProperty("javascriptEnabled", DefaultValue = true)]
		public bool JavascriptEnabled
		{
			get { return (bool)this["javascriptEnabled"]; }
			set { this["javascriptEnabled"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of variable list, that can be referenced by the file
		/// (semicolon-separated list of values of the form VAR=VALUE)
		/// </summary>
		[ConfigurationProperty("globalVariables", DefaultValue = "")]
		public string GlobalVariables
		{
			get { return (string)this["globalVariables"]; }
			set { this["globalVariables"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of variable list, that modifies a variables
		/// already declared in the file (semicolon-separated list of values of the form VAR=VALUE)
		/// </summary>
		[ConfigurationProperty("modifyVariables", DefaultValue = "")]
		public string ModifyVariables
		{
			get { return (string)this["modifyVariables"]; }
			set { this["modifyVariables"] = value; }
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

		/// <summary>
		/// Gets a configuration settings of JS engine
		/// </summary>
		[ConfigurationProperty("jsEngine")]
		public JsEngineSettings JsEngine
		{
			get { return (JsEngineSettings)this["jsEngine"]; }
		}
	}
}