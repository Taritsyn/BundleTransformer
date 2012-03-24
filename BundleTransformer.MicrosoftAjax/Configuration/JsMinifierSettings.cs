namespace BundleTransformer.MicrosoftAjax.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Microsoft Ajax JS-Minifier
	/// </summary>
	public sealed class JsMinifierSettings : MinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to collapse new Array() to []
		/// and new Object() to {} [true] or leave as-is [false]
		/// </summary>
		[ConfigurationProperty("collapseToLiteral", DefaultValue = true)]
		public bool CollapseToLiteral
		{
			get { return (bool)this["collapseToLiteral"]; }
			set { this["collapseToLiteral"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to combine duplicate literals 
		/// within function scopes to local variables [true] or leave them as-is [false]
		/// </summary>
		[ConfigurationProperty("combineDuplicateLiterals", DefaultValue = false)]
		public bool CombineDuplicateLiterals
		{
			get { return (bool)this["combineDuplicateLiterals"]; }
			set { this["combineDuplicateLiterals"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of the list of debug 
		/// lookups, comma-separated
		/// </summary>
		[ConfigurationProperty("debugLookupList", DefaultValue = "Debug,$Debug,WAssert,Msn.Debug,Web.Debug")]
		public string DebugLookupList
		{
			get { return (string)this["debugLookupList"]; }
			set { this["debugLookupList"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether EvalsAreSafe.
		/// Deprecated in favor of EvalTreatment, which is an enumeration
		/// allowing for more options than just true or false.
		/// True for this property is the equivalent of EvalTreament.Ignore;
		/// False is the equivalent to EvalTreament.MakeAllSafe
		/// </summary>
		[ConfigurationProperty("evalTreatment", DefaultValue = EvalTreatment.Ignore)]
		public EvalTreatment EvalTreatment
		{
			get { return (EvalTreatment)this["evalTreatment"]; }
			set { this["evalTreatment"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether or not to ignore conditional-compilation 
		/// comment syntax (true) or to try to retain the comments in the output (false; default)
		/// </summary>
		[ConfigurationProperty("ignoreConditionalCompilation", DefaultValue = false)]
		public bool IgnoreConditionalCompilation
		{
			get { return (bool)this["ignoreConditionalCompilation"]; }
			set { this["ignoreConditionalCompilation"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to break up string literals containing &lt;/script&gt; 
		/// so inline code won't break [true]. 
		/// Leave string literals as-is [false].
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
		/// KeepAll - do not rename local variables and functions
		/// CrunchAll - rename all local variables and functions to shorter names
		/// KeepLocalizationVars - rename all local variables and functions that do NOT start with L_
		/// </summary>
		[ConfigurationProperty("localRenaming", DefaultValue = LocalRenaming.CrunchAll)]
		public LocalRenaming LocalRenaming
		{
			get { return (LocalRenaming)this["localRenaming"]; }
			set { this["localRenaming"] = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether to add characters to the output 
		/// to make sure Mac Safari bugs are not generated [true].
		/// Disregard potential Mac Safari bugs [false].
		/// </summary>
		[ConfigurationProperty("macSafariQuirks", DefaultValue = true)]
		public bool MacSafariQuirks
		{
			get { return (bool)this["macSafariQuirks"]; }
			set { this["macSafariQuirks"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to modify the source code's syntax tree 
		/// to provide the smallest equivalent output [true].
		/// Do not modify the syntax tree [false].
		/// </summary>
		[ConfigurationProperty("minifyCode", DefaultValue = true)]
		public bool MinifyCode
		{
			get { return (bool) this["minifyCode"]; }
			set { this["minifyCode"] = value; }
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
		/// comments in the output.
		/// Default is true.
		/// </summary>
		[ConfigurationProperty("preserveImportantComments", DefaultValue = true)]
		public bool PreserveImportantComments
		{
			get { return (bool)this["preserveImportantComments"]; }
			set { this["preserveImportantComments"] = value; }
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
		/// Remove unneeded code, like uncalled local functions [true].
		/// Keep all code [false].
		/// </summary>
		[ConfigurationProperty("removeUnneededCode", DefaultValue = true)]
		public bool RemoveUnneededCode
		{
			get { return (bool)this["removeUnneededCode"]; }
			set { this["removeUnneededCode"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of all the indentifier 
		/// replacements as a comma-separated list of "source=target" identifiers.
		/// </summary>
		[ConfigurationProperty("renamePairs", DefaultValue = "")]
		public string RenamePairs
		{
			get { return (string)this["renamePairs"]; }
			set { this["renamePairs"] = value; }
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
		/// Strip debug statements [true].
		/// Leave debug statements [false].
		/// </summary>
		[ConfigurationProperty("stripDebugStatements", DefaultValue = true)]
		public bool StripDebugStatements
		{
			get { return (bool)this["stripDebugStatements"]; }
			set { this["stripDebugStatements"] = value; }
		}
	}
}
