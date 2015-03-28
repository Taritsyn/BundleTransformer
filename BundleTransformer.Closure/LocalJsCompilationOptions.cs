namespace BundleTransformer.Closure
{
	/// <summary>
	/// Local JavaScript compilation options
	/// </summary>
	internal sealed class LocalJsCompilationOptions : JsCompilationOptionsBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow usage of const keyword
		/// </summary>
		public bool AcceptConstKeyword
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow ES6 language output for compiling ES6 to ES6
		/// as well as transpiling to ES6 from lower versions
		/// </summary>
		public bool AllowEs6Output
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to generate <code>$inject</code> properties for
		/// AngularJS for functions annotated with <code>@ngInject</code>
		/// </summary>
		public bool AngularPass
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a string representation of variable list, that overrides the values of
		/// a variables annotated <code>@define</code> (semicolon-separated list of values of
		/// the form &lt;name&gt;[=&lt;val&gt;]). Where &lt;name&gt; is the name of a <code>@define</code>
		/// variable and &lt;val&gt; is a boolean, number, or a single-quoted string that contains no single quotes.
		/// If [=&lt;val&gt;] is omitted, the variable is marked true.
		/// </summary>
		public string DefinitionList
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the named classes of warnings, that
		/// need to make an errors
		/// </summary>
		public string ErrorList
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to generate export code for local properties
		/// marked with <code>@export</code>
		/// </summary>
		public bool ExportLocalPropertyDefinitions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated whitelist of tag names in JSDoc
		/// </summary>
		public string ExtraAnnotationNameList
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to generate export code for those marked with <code>@export</code>
		/// </summary>
		public bool GenerateExports
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a language spec that input sources conform
		/// </summary>
		public ExperimentalLanguageSpec LanguageInput
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a language spec the output should conform to.
		/// If omitted, defaults to the value of <code>LanguageInput</code>.
		/// </summary>
		public ExperimentalLanguageSpec LanguageOutput
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to process built-ins from
		/// the Closure library, such as <code>goog.require()</code>, <code>goog.provide()</code>
		/// and <code>goog.exportSymbol()</code>
		/// </summary>
		public bool ProcessClosurePrimitives
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to process built-ins from
		/// the jQuery library, such as <code>jQuery.fn</code> and <code>jQuery.extend()</code>
		/// </summary>
		public bool ProcessJqueryPrimitives
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to output code with single quotes
		/// </summary>
		public bool SingleQuotes
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to check source validity
		/// but do not enforce Closure style rules and conventions
		/// </summary>
		public bool ThirdParty
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to run ES6 to ES3 transpilation only, skip other passes
		/// </summary>
		public bool TranspileOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the named classes of warnings, that
		/// need to turn off
		/// </summary>
		public string TurnOffWarningClassList
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to exclude the default externs
		/// </summary>
		public bool UseOnlyCustomExterns
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the named classes of warnings, that
		/// need to make a normal warning
		/// </summary>
		public string WarningList
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the local JavaScript compilation options
		/// </summary>
		public LocalJsCompilationOptions()
		{
			AcceptConstKeyword = false;
			AllowEs6Output = false;
			AngularPass = false;
			DefinitionList = string.Empty;
			ErrorList = string.Empty;
			ExportLocalPropertyDefinitions = false;
			ExtraAnnotationNameList = string.Empty;
			GenerateExports = false;
			LanguageInput = ExperimentalLanguageSpec.EcmaScript3;
			LanguageOutput = ExperimentalLanguageSpec.None;
			ProcessClosurePrimitives = false;
			ProcessJqueryPrimitives = false;
			SingleQuotes = false;
			ThirdParty = true;
			TranspileOnly = false;
			TurnOffWarningClassList = string.Empty;
			UseOnlyCustomExterns = false;
			WarningList = string.Empty;
		}
	}
}