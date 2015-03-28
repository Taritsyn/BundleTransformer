namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Closure Local JS-minifier
	/// </summary>
	public sealed class LocalJsMinifierSettings : JsMinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow usage of const keyword
		/// </summary>
		[ConfigurationProperty("acceptConstKeyword", DefaultValue = false)]
		public bool AcceptConstKeyword
		{
			get { return (bool)this["acceptConstKeyword"]; }
			set { this["acceptConstKeyword"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow ES6 language output for compiling ES6 to ES6
		/// as well as transpiling to ES6 from lower versions
		/// </summary>
		[ConfigurationProperty("allowEs6Output", DefaultValue = false)]
		public bool AllowEs6Output
		{
			get { return (bool)this["allowEs6Output"]; }
			set { this["allowEs6Output"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to generate <code>$inject</code> properties for
		/// AngularJS for functions annotated with <code>@ngInject</code>
		/// </summary>
		[ConfigurationProperty("angularPass", DefaultValue = false)]
		public bool AngularPass
		{
			get { return (bool)this["angularPass"]; }
			set { this["angularPass"] = value; }
		}

		/// <summary>
		/// Gets or sets a path to Google Closure Compiler Application
		/// </summary>
		[ConfigurationProperty("closureCompilerApplicationPath", DefaultValue = "")]
		public string ClosureCompilerApplicationPath
		{
			get { return (string)this["closureCompilerApplicationPath"]; }
			set { this["closureCompilerApplicationPath"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of variable list, that overrides the values of
		/// a variables annotated <code>@define</code> (semicolon-separated list of values of
		/// the form &lt;name&gt;[=&lt;val&gt;]). Where &lt;name&gt; is the name of a <code>@define</code>
		/// variable and &lt;val&gt; is a boolean, number, or a single-quoted string that contains no single quotes.
		/// If [=&lt;val&gt;] is omitted, the variable is marked true.
		/// </summary>
		[ConfigurationProperty("definitionList", DefaultValue = "")]
		public string DefinitionList
		{
			get { return (string)this["definitionList"]; }
			set { this["definitionList"] = value; }
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the named classes of warnings, that
		/// need to make an errors
		/// </summary>
		[ConfigurationProperty("errorList", DefaultValue = "")]
		public string ErrorList
		{
			get { return (string)this["errorList"]; }
			set { this["errorList"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to generate export code for local properties
		/// marked with <code>@export</code>
		/// </summary>
		[ConfigurationProperty("exportLocalPropertyDefinitions", DefaultValue = false)]
		public bool ExportLocalPropertyDefinitions
		{
			get { return (bool)this["exportLocalPropertyDefinitions"]; }
			set { this["exportLocalPropertyDefinitions"] = value; }
		}

		/// <summary>
		/// Gets or sets a comma-separated whitelist of tag names in JSDoc
		/// </summary>
		[ConfigurationProperty("extraAnnotationNameList", DefaultValue = "")]
		public string ExtraAnnotationNameList
		{
			get { return (string)this["extraAnnotationNameList"]; }
			set { this["extraAnnotationNameList"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to generate export code for those marked with <code>@export</code>
		/// </summary>
		[ConfigurationProperty("generateExports", DefaultValue = false)]
		public bool GenerateExports
		{
			get { return (bool)this["generateExports"]; }
			set { this["generateExports"] = value; }
		}

		/// <summary>
		/// Gets or sets a path to Java Virtual Machine
		/// </summary>
		[ConfigurationProperty("javaVirtualMachinePath", DefaultValue = "")]
		public string JavaVirtualMachinePath
		{
			get { return (string)this["javaVirtualMachinePath"]; }
			set { this["javaVirtualMachinePath"] = value; }
		}

		/// <summary>
		/// Gets or sets a language spec that input sources conform
		/// </summary>
		[ConfigurationProperty("languageInput", DefaultValue = ExperimentalLanguageSpec.EcmaScript3)]
		public ExperimentalLanguageSpec LanguageInput
		{
			get { return (ExperimentalLanguageSpec)this["languageInput"]; }
			set { this["languageInput"] = value; }
		}

		/// <summary>
		/// Gets or sets a language spec the output should conform to.
		/// If omitted, defaults to the value of <code>LanguageInput</code>.
		/// </summary>
		[ConfigurationProperty("languageOutput", DefaultValue = ExperimentalLanguageSpec.None)]
		public ExperimentalLanguageSpec LanguageOutput
		{
			get { return (ExperimentalLanguageSpec)this["languageOutput"]; }
			set { this["languageOutput"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to process built-ins from
		/// the Closure library, such as <code>goog.require()</code>, <code>goog.provide()</code>
		/// and <code>goog.exportSymbol()</code>
		/// </summary>
		[ConfigurationProperty("processClosurePrimitives", DefaultValue = false)]
		public bool ProcessClosurePrimitives
		{
			get { return (bool)this["processClosurePrimitives"]; }
			set { this["processClosurePrimitives"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to process built-ins from
		/// the jQuery library, such as <code>jQuery.fn</code> and <code>jQuery.extend()</code>
		/// </summary>
		[ConfigurationProperty("processJqueryPrimitives", DefaultValue = false)]
		public bool ProcessJqueryPrimitives
		{
			get { return (bool)this["processJqueryPrimitives"]; }
			set { this["processJqueryPrimitives"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to output code with single quotes
		/// </summary>
		[ConfigurationProperty("singleQuotes", DefaultValue = false)]
		public bool SingleQuotes
		{
			get { return (bool)this["singleQuotes"]; }
			set { this["singleQuotes"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to check source validity
		/// but do not enforce Closure style rules and conventions
		/// </summary>
		[ConfigurationProperty("thirdParty", DefaultValue = true)]
		public bool ThirdParty
		{
			get { return (bool)this["thirdParty"]; }
			set { this["thirdParty"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to run ES6 to ES3 transpilation only, skip other passes
		/// </summary>
		[ConfigurationProperty("transpileOnly", DefaultValue = false)]
		public bool TranspileOnly
		{
			get { return (bool)this["transpileOnly"]; }
			set { this["transpileOnly"] = value; }
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the named classes of warnings, that
		/// need to turn off
		/// </summary>
		[ConfigurationProperty("turnOffWarningClassList", DefaultValue = "")]
		public string TurnOffWarningClassList
		{
			get { return (string)this["turnOffWarningClassList"]; }
			set { this["turnOffWarningClassList"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to exclude the default externs
		/// </summary>
		[ConfigurationProperty("useOnlyCustomExterns", DefaultValue = false)]
		public bool UseOnlyCustomExterns
		{
			get { return (bool)this["useOnlyCustomExterns"]; }
			set { this["useOnlyCustomExterns"] = value; }
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the named classes of warnings, that
		/// need to make a normal warning
		/// </summary>
		[ConfigurationProperty("warningList", DefaultValue = "")]
		public string WarningList
		{
			get { return (string)this["warningList"]; }
			set { this["warningList"] = value; }
		}
	}
}