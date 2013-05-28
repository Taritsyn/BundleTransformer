namespace BundleTransformer.MicrosoftAjax.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Microsoft Ajax JS-minifier
	/// </summary>
	public sealed class JsMinifierSettings : MinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to collapse <code>new Array()</code>
		/// to <code>[]</code> and <code>new Object()</code> to <code>{}</code>
		/// (true) or leave as-is (false)
		/// </summary>
		[ConfigurationProperty("collapseToLiteral", DefaultValue = true)]
		public bool CollapseToLiteral
		{
			get { return (bool)this["collapseToLiteral"]; }
			set { this["collapseToLiteral"] = value; }
		}

		/// <summary>
		/// Gets or sets a boolean value indicating whether to use old-style 
		/// const statements (just var-statements that define unchangeable fields) 
		/// or new EcmaScript 6 lexical declarations
		/// </summary>
		[ConfigurationProperty("constStatementsMozilla", DefaultValue = false)]
		public bool ConstStatementsMozilla
		{
			get { return (bool) this["constStatementsMozilla"]; }
			set { this["constStatementsMozilla"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of the list of debug 
		/// lookups (comma-separated)
		/// </summary>
		[ConfigurationProperty("debugLookupList", DefaultValue = "Debug,$Debug,WAssert,Msn.Debug,Web.Debug")]
		public string DebugLookupList
		{
			get { return (string)this["debugLookupList"]; }
			set { this["debugLookupList"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to throw an error 
		/// if a source string is not safe for inclusion in an 
		/// HTML inline script block
		/// </summary>
		[ConfigurationProperty("errorIfNotInlineSafe", DefaultValue = false)]
		public bool ErrorIfNotInlineSafe
		{
			get { return (bool)this["errorIfNotInlineSafe"]; }
			set { this["errorIfNotInlineSafe"] = value; }
		}


		/// <summary>
		/// Gets or sets a flag for whether to evaluate expressions containing 
		/// only literal bool, string, numeric, or null values (true).
		/// Leave literal expressions alone and do not evaluate them (false).
		/// </summary>
		[ConfigurationProperty("evalLiteralExpressions", DefaultValue = true)]
		public bool EvalLiteralExpressions
		{
			get { return (bool)this["evalLiteralExpressions"]; }
			set { this["evalLiteralExpressions"] = value; }
		}

		/// <summary>
		/// EvalTreatment setting
		/// </summary>
		[ConfigurationProperty("evalTreatment", DefaultValue = EvalTreatment.Ignore)]
		public EvalTreatment EvalTreatment
		{
			get { return (EvalTreatment)this["evalTreatment"]; }
			set { this["evalTreatment"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether or not to ignore conditional-compilation 
		/// comment syntax (true) or to try to retain the comments in the output (false)
		/// </summary>
		[ConfigurationProperty("ignoreConditionalCompilation", DefaultValue = false)]
		public bool IgnoreConditionalCompilation
		{
			get { return (bool)this["ignoreConditionalCompilation"]; }
			set { this["ignoreConditionalCompilation"] = value; }
		}

		/// <summary>
		/// Gets or sets a boolean value indicating whether or not to ignore preprocessor 
		/// defines comment syntax (true) or to evaluate them (false)
		/// </summary>
		[ConfigurationProperty("ignorePreprocessorDefines", DefaultValue = false)]
		public bool IgnorePreprocessorDefines
		{
			get { return (bool) this["ignorePreprocessorDefines"]; }
			set { this["ignorePreprocessorDefines"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to break up string literals containing
		/// <code>&lt;/script&gt;</code> so inline code won't break (true). 
		/// Leave string literals as-is (false).
		/// </summary>
		[ConfigurationProperty("inlineSafeStrings", DefaultValue = true)]
		public bool InlineSafeStrings
		{
			get { return (bool)this["inlineSafeStrings"]; }
			set { this["inlineSafeStrings"] = value; }
		}

		/// <summary>
		/// Gets or sets the known global names list as a single comma-separated string
		/// </summary>
		[ConfigurationProperty("knownGlobalNamesList", DefaultValue = "")]
		public string KnownGlobalNamesList
		{
			get { return (string)this["knownGlobalNamesList"]; }
			set { this["knownGlobalNamesList"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether to how to rename local variables and functions:
		/// <code>KeepAll</code> - do not rename local variables and functions;
		/// <code>CrunchAll</code> - rename all local variables and functions to shorter names;
		/// <code>KeepLocalizationVars</code> - rename all local variables and functions that do NOT start with L_
		/// </summary>
		[ConfigurationProperty("localRenaming", DefaultValue = LocalRenaming.CrunchAll)]
		public LocalRenaming LocalRenaming
		{
			get { return (LocalRenaming)this["localRenaming"]; }
			set { this["localRenaming"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether to add characters to the output 
		/// to make sure Mac Safari bugs are not generated (true).
		/// Disregard potential Mac Safari bugs (false).
		/// </summary>
		[ConfigurationProperty("macSafariQuirks", DefaultValue = true)]
		public bool MacSafariQuirks
		{
			get { return (bool)this["macSafariQuirks"]; }
			set { this["macSafariQuirks"] = value; }
		}

		/// <summary>
		/// Gets or sets a boolean value indicating whether object property 
		/// names with the specified "from" names will get renamed to 
		/// the corresponding "to" names (true) when using 
		/// the manual-rename feature, or left alone (false)
		/// </summary>
		[ConfigurationProperty("manualRenamesProperties", DefaultValue = true)]
		public bool ManualRenamesProperties
		{
			get { return (bool)this["manualRenamesProperties"]; }
			set { this["manualRenamesProperties"] = value; }
		}

		/// <summary>
		/// Get or sets the no-automatic-renaming list as a single string of 
		/// comma-separated identifiers
		/// </summary>
		[ConfigurationProperty("noAutoRenameList", DefaultValue = "$super")]
		public string NoAutoRenameList
		{
			get { return (string)this["noAutoRenameList"]; }
			set { this["noAutoRenameList"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether all function names 
		/// must be preserved and remain as-named
		/// </summary>
		[ConfigurationProperty("preserveFunctionNames", DefaultValue = false)]
		public bool PreserveFunctionNames
		{
			get { return (bool)this["preserveFunctionNames"]; }
			set { this["preserveFunctionNames"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether to preserve important 
		/// comments in the output
		/// </summary>
		[ConfigurationProperty("preserveImportantComments", DefaultValue = true)]
		public bool PreserveImportantComments
		{
			get { return (bool)this["preserveImportantComments"]; }
			set { this["preserveImportantComments"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether to always quote object literal property names
		/// </summary>
		[ConfigurationProperty("quoteObjectLiteralProperties", DefaultValue = false)]
		public bool QuoteObjectLiteralProperties
		{
			get { return (bool)this["quoteObjectLiteralProperties"]; }
			set { this["quoteObjectLiteralProperties"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether or not to remove 
		/// unreferenced function expression names
		/// </summary>
		[ConfigurationProperty("removeFunctionExpressionNames", DefaultValue = true)]
		public bool RemoveFunctionExpressionNames
		{
			get { return (bool)this["removeFunctionExpressionNames"]; }
			set { this["removeFunctionExpressionNames"] = value; }
		}

		/// <summary>
		/// Remove unneeded code, like uncalled local functions (true).
		/// Keep all code (false).
		/// </summary>
		[ConfigurationProperty("removeUnneededCode", DefaultValue = true)]
		public bool RemoveUnneededCode
		{
			get { return (bool)this["removeUnneededCode"]; }
			set { this["removeUnneededCode"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of all the indentifier 
		/// replacements as a comma-separated list of "source=target" identifiers
		/// </summary>
		[ConfigurationProperty("renamePairs", DefaultValue = "")]
		public string RenamePairs
		{
			get { return (string)this["renamePairs"]; }
			set { this["renamePairs"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether or not to reorder function and variable
		/// declarations within scopes (true), or to leave the order as specified in 
		/// the original source
		/// </summary>
		[ConfigurationProperty("reorderScopeDeclarations", DefaultValue = true)]
		public bool ReorderScopeDeclarations
		{
			get { return (bool)this["reorderScopeDeclarations"]; }
			set { this["reorderScopeDeclarations"] = value; }
		}

		/// <summary>
		/// Gets or sets a boolean value indicating whether or not to force 
		/// the input code into strict mode (can still specify strict-mode in 
		/// the sources if this value is false) 
		/// </summary>
		[ConfigurationProperty("strictMode", DefaultValue = false)]
		public bool StrictMode
		{
			get { return (bool)this["strictMode"]; }
			set { this["strictMode"] = value; }
		}

		/// <summary>
		/// Strip debug statements (true).
		/// Leave debug statements (false).
		/// </summary>
		[ConfigurationProperty("stripDebugStatements", DefaultValue = true)]
		public bool StripDebugStatements
		{
			get { return (bool)this["stripDebugStatements"]; }
			set { this["stripDebugStatements"] = value; }
		}
	}
}