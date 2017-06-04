using System.Configuration;

using BundleTransformer.Core.Configuration;

namespace BundleTransformer.TypeScript.Configuration
{
	/// <summary>
	/// Configuration settings of TypeScript-translator
	/// </summary>
	public sealed class TypeScriptSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a flag for whether to do not report errors on unreachable code
		/// </summary>
		[ConfigurationProperty("allowUnreachableCode", DefaultValue = false)]
		public bool AllowUnreachableCode
		{
			get { return (bool)this["allowUnreachableCode"]; }
			set { this["allowUnreachableCode"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not report errors on unused labels
		/// </summary>
		[ConfigurationProperty("allowUnusedLabels", DefaultValue = false)]
		public bool AllowUnusedLabels
		{
			get { return (bool)this["allowUnusedLabels"]; }
			set { this["allowUnusedLabels"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to parse in strict mode and emit
		/// <code>use strict</code> for each source file
		/// </summary>
		[ConfigurationProperty("alwaysStrict", DefaultValue = false)]
		public bool AlwaysStrict
		{
			get { return (bool)this["alwaysStrict"]; }
			set { this["alwaysStrict"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to provide full support for iterables in <code>for-of</code>,
		/// spread, and destructuring when targeting 'ES5' or 'ES3'
		/// </summary>
		[ConfigurationProperty("downlevelIteration", DefaultValue = false)]
		public bool DownlevelIteration
		{
			get { return (bool)this["downlevelIteration"]; }
			set { this["downlevelIteration"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow inconsistently-cased references to the same file
		/// </summary>
		[ConfigurationProperty("forceConsistentCasingInFileNames", DefaultValue = false)]
		public bool ForceConsistentCasingInFileNames
		{
			get { return (bool)this["forceConsistentCasingInFileNames"]; }
			set { this["forceConsistentCasingInFileNames"] = value; }
		}

		/// <summary>
		/// Gets a list of library files to be included in the compilation
		/// </summary>
		[ConfigurationProperty("libs", IsRequired = false)]
		public LibraryFileRegistrationCollection Libs
		{
			get { return (LibraryFileRegistrationCollection)this["libs"]; }
		}

		/// <summary>
		/// Gets or sets a end of line sequence, that used when emitting files:
		/// 'CRLF' (dos) or 'LF' (unix)
		/// </summary>
		[ConfigurationProperty("newLine", DefaultValue = NewLineMode.CrLf)]
		public NewLineMode NewLine
		{
			get { return (NewLineMode)this["newLine"]; }
			set { this["newLine"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit outputs
		/// </summary>
		[ConfigurationProperty("noEmit", DefaultValue = false)]
		public bool NoEmit
		{
			get { return (bool)this["noEmit"]; }
			set { this["noEmit"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit helpers (e.g. <code>__extends</code> function)
		/// </summary>
		[ConfigurationProperty("noEmitHelpers", DefaultValue = false)]
		public bool NoEmitHelpers
		{
			get { return (bool)this["noEmitHelpers"]; }
			set { this["noEmitHelpers"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit outputs if any errors were reported
		/// </summary>
		[ConfigurationProperty("noEmitOnError", DefaultValue = false)]
		public bool NoEmitOnError
		{
			get { return (bool)this["noEmitOnError"]; }
			set { this["noEmitOnError"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not truncate type name in error messages
		/// </summary>
		[ConfigurationProperty("noErrorTruncation", DefaultValue = false)]
		public bool NoErrorTruncation
		{
			get { return (bool)this["noErrorTruncation"]; }
			set { this["noErrorTruncation"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to report errors for fallthrough cases in switch statement
		/// </summary>
		[ConfigurationProperty("noFallthroughCasesInSwitch", DefaultValue = false)]
		public bool NoFallthroughCasesInSwitch
		{
			get { return (bool)this["noFallthroughCasesInSwitch"]; }
			set { this["noFallthroughCasesInSwitch"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise error on expressions and declarations
		/// with an implied <code>any</code> type
		/// </summary>
		[ConfigurationProperty("noImplicitAny", DefaultValue = false)]
		public bool NoImplicitAny
		{
			get { return (bool)this["noImplicitAny"]; }
			set { this["noImplicitAny"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to report error when not all code paths in function return a value
		/// </summary>
		[ConfigurationProperty("noImplicitReturns", DefaultValue = false)]
		public bool NoImplicitReturns
		{
			get { return (bool)this["noImplicitReturns"]; }
			set { this["noImplicitReturns"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise error on <code>this</code> expressions with
		/// an implied <code>any</code> type
		/// </summary>
		[ConfigurationProperty("noImplicitThis", DefaultValue = false)]
		public bool NoImplicitThis
		{
			get { return (bool)this["noImplicitThis"]; }
			set { this["noImplicitThis"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not include a default library (<code>lib.d.ts</code>
		/// or <code>lib.es6.d.ts</code>)
		/// </summary>
		[ConfigurationProperty("noLib", DefaultValue = false)]
		public bool NoLib
		{
			get { return (bool)this["noLib"]; }
			set { this["noLib"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not resolve a script references
		/// </summary>
		[ConfigurationProperty("noResolve", DefaultValue = false)]
		public bool NoResolve
		{
			get { return (bool)this["noResolve"]; }
			set { this["noResolve"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to report errors on unused locals
		/// </summary>
		[ConfigurationProperty("noUnusedLocals", DefaultValue = false)]
		public bool NoUnusedLocals
		{
			get { return (bool)this["noUnusedLocals"]; }
			set { this["noUnusedLocals"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to report errors on unused parameters
		/// </summary>
		[ConfigurationProperty("noUnusedParameters", DefaultValue = false)]
		public bool NoUnusedParameters
		{
			get { return (bool)this["noUnusedParameters"]; }
			set { this["noUnusedParameters"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not erase const enum declarations in generated code
		/// </summary>
		[ConfigurationProperty("preserveConstEnums", DefaultValue = false)]
		public bool PreserveConstEnums
		{
			get { return (bool)this["preserveConstEnums"]; }
			set { this["preserveConstEnums"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit comments to output
		/// </summary>
		[ConfigurationProperty("removeComments", DefaultValue = false)]
		public bool RemoveComments
		{
			get { return (bool)this["removeComments"]; }
			set { this["removeComments"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip a default library checking
		/// </summary>
		[ConfigurationProperty("skipDefaultLibCheck", DefaultValue = false)]
		public bool SkipDefaultLibCheck
		{
			get { return (bool)this["skipDefaultLibCheck"]; }
			set { this["skipDefaultLibCheck"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip type checking of declaration files
		/// </summary>
		[ConfigurationProperty("skipLibCheck", DefaultValue = false)]
		public bool SkipLibCheck
		{
			get { return (bool)this["skipLibCheck"]; }
			set { this["skipLibCheck"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable strict null checks
		/// </summary>
		[ConfigurationProperty("strictNullChecks", DefaultValue = false)]
		public bool StrictNullChecks
		{
			get { return (bool)this["strictNullChecks"]; }
			set { this["strictNullChecks"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit declarations for code that has an
		/// <code>@internal</code> annotation
		/// </summary>
		[ConfigurationProperty("stripInternal", DefaultValue = false)]
		public bool StripInternal
		{
			get { return (bool)this["stripInternal"]; }
			set { this["stripInternal"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress excess property checks for object literals
		/// </summary>
		[ConfigurationProperty("suppressExcessPropertyErrors", DefaultValue = false)]
		public bool SuppressExcessPropertyErrors
		{
			get { return (bool)this["suppressExcessPropertyErrors"]; }
			set { this["suppressExcessPropertyErrors"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress noImplicitAny errors for indexing objects lacking
		/// index signatures
		/// </summary>
		[ConfigurationProperty("suppressImplicitAnyIndexErrors", DefaultValue = false)]
		public bool SuppressImplicitAnyIndexErrors
		{
			get { return (bool)this["suppressImplicitAnyIndexErrors"]; }
			set { this["suppressImplicitAnyIndexErrors"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress type checking errors
		/// </summary>
		[ConfigurationProperty("suppressTypeCheckingErrors", DefaultValue = false)]
		public bool SuppressTypeCheckingErrors
		{
			get { return (bool)this["suppressTypeCheckingErrors"]; }
			set { this["suppressTypeCheckingErrors"] = value; }
		}

		/// <summary>
		/// Gets or sets a ECMAScript target version: `EcmaScript3` (default), `EcmaScript5`,
		/// `EcmaScript2015`, `EcmaScript2016`, `EcmaScript2017`, or `EcmaScriptNext`
		/// </summary>
		[ConfigurationProperty("target", DefaultValue = TargetMode.EcmaScript3)]
		public TargetMode Target
		{
			get { return (TargetMode)this["target"]; }
			set { this["target"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to run TypeScript to JavaScript transpilation
		/// only (skip other passes)
		/// </summary>
		[ConfigurationProperty("transpileOnly", DefaultValue = false)]
		public bool TranspileOnly
		{
			get { return (bool)this["transpileOnly"]; }
			set { this["transpileOnly"] = value; }
		}

		/// <summary>
		/// Gets a configuration settings of JavaScript engine
		/// </summary>
		[ConfigurationProperty("jsEngine")]
		public JsEngineSettings JsEngine
		{
			get { return (JsEngineSettings)this["jsEngine"]; }
		}
	}
}