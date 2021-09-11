using System.Configuration;

using BundleTransformer.Core.Configuration;

namespace BundleTransformer.TypeScript.Configuration
{
	/// <summary>
	/// Configuration settings of TypeScript translator
	/// </summary>
	public sealed class TypeScriptSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a flag for whether to disable error reporting for unreachable code
		/// </summary>
		[ConfigurationProperty("allowUnreachableCode", DefaultValue = false)]
		public bool AllowUnreachableCode
		{
			get { return (bool)this["allowUnreachableCode"]; }
			set { this["allowUnreachableCode"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable error reporting for unused labels
		/// </summary>
		[ConfigurationProperty("allowUnusedLabels", DefaultValue = false)]
		public bool AllowUnusedLabels
		{
			get { return (bool)this["allowUnusedLabels"]; }
			set { this["allowUnusedLabels"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to ensure <c>use strict</c> is always emitted
		/// </summary>
		[ConfigurationProperty("alwaysStrict", DefaultValue = false)]
		public bool AlwaysStrict
		{
			get { return (bool)this["alwaysStrict"]; }
			set { this["alwaysStrict"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to emit more compliant, but verbose and less performant JavaScript for
		/// iteration
		/// </summary>
		[ConfigurationProperty("downlevelIteration", DefaultValue = false)]
		public bool DownlevelIteration
		{
			get { return (bool)this["downlevelIteration"]; }
			set { this["downlevelIteration"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to interpret optional property types as written, rather than adding
		/// <c>undefined</c>
		/// </summary>
		[ConfigurationProperty("exactOptionalPropertyTypes", DefaultValue = false)]
		public bool ExactOptionalPropertyTypes
		{
			get { return (bool)this["exactOptionalPropertyTypes"]; }
			set { this["exactOptionalPropertyTypes"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to ensure that casing is correct in imports
		/// </summary>
		[ConfigurationProperty("forceConsistentCasingInFileNames", DefaultValue = false)]
		public bool ForceConsistentCasingInFileNames
		{
			get { return (bool)this["forceConsistentCasingInFileNames"]; }
			set { this["forceConsistentCasingInFileNames"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to make keyof only return strings instead of string, numbers or symbols.
		/// Legacy option.
		/// </summary>
		[ConfigurationProperty("keyofStringsOnly", DefaultValue = false)]
		public bool KeyofStringsOnly
		{
			get { return (bool)this["keyofStringsOnly"]; }
			set { this["keyofStringsOnly"] = value; }
		}

		/// <summary>
		/// Gets a set of bundled library declaration files that describe the target runtime environment
		/// </summary>
		[ConfigurationProperty("libs", IsRequired = false)]
		public LibraryFileRegistrationCollection Libs
		{
			get { return (LibraryFileRegistrationCollection)this["libs"]; }
		}

		/// <summary>
		/// Gets or sets a newline character for emitting files
		/// </summary>
		[ConfigurationProperty("newLine", DefaultValue = NewLineMode.CrLf)]
		public NewLineMode NewLine
		{
			get { return (NewLineMode)this["newLine"]; }
			set { this["newLine"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting files from a compilation
		/// </summary>
		[ConfigurationProperty("noEmit", DefaultValue = false)]
		public bool NoEmit
		{
			get { return (bool)this["noEmit"]; }
			set { this["noEmit"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable generating custom helper functions like <c>__extends</c> in
		/// compiled output
		/// </summary>
		[ConfigurationProperty("noEmitHelpers", DefaultValue = false)]
		public bool NoEmitHelpers
		{
			get { return (bool)this["noEmitHelpers"]; }
			set { this["noEmitHelpers"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting files if any type checking errors are reported
		/// </summary>
		[ConfigurationProperty("noEmitOnError", DefaultValue = false)]
		public bool NoEmitOnError
		{
			get { return (bool)this["noEmitOnError"]; }
			set { this["noEmitOnError"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable truncating types in error messages
		/// </summary>
		[ConfigurationProperty("noErrorTruncation", DefaultValue = false)]
		public bool NoErrorTruncation
		{
			get { return (bool)this["noErrorTruncation"]; }
			set { this["noErrorTruncation"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting for fallthrough cases in switch statements
		/// </summary>
		[ConfigurationProperty("noFallthroughCasesInSwitch", DefaultValue = false)]
		public bool NoFallthroughCasesInSwitch
		{
			get { return (bool)this["noFallthroughCasesInSwitch"]; }
			set { this["noFallthroughCasesInSwitch"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting for expressions and declarations with an implied
		/// <c>any</c> type
		/// </summary>
		[ConfigurationProperty("noImplicitAny", DefaultValue = false)]
		public bool NoImplicitAny
		{
			get { return (bool)this["noImplicitAny"]; }
			set { this["noImplicitAny"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to ensure overriding members in derived classes are marked with an override
		/// modifier
		/// </summary>
		[ConfigurationProperty("noImplicitOverride", DefaultValue = false)]
		public bool NoImplicitOverride
		{
			get { return (bool)this["noImplicitOverride"]; }
			set { this["noImplicitOverride"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting for codepaths that do not explicitly return in a
		/// function
		/// </summary>
		[ConfigurationProperty("noImplicitReturns", DefaultValue = false)]
		public bool NoImplicitReturns
		{
			get { return (bool)this["noImplicitReturns"]; }
			set { this["noImplicitReturns"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting when <c>this</c> is given the type <c>any</c>
		/// </summary>
		[ConfigurationProperty("noImplicitThis", DefaultValue = false)]
		public bool NoImplicitThis
		{
			get { return (bool)this["noImplicitThis"]; }
			set { this["noImplicitThis"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable including any library files, including the default <c>lib.d.ts</c>
		/// </summary>
		[ConfigurationProperty("noLib", DefaultValue = false)]
		public bool NoLib
		{
			get { return (bool)this["noLib"]; }
			set { this["noLib"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enforce using indexed accessors for keys declared using an indexed type
		/// </summary>
		[ConfigurationProperty("noPropertyAccessFromIndexSignature", DefaultValue = false)]
		public bool NoPropertyAccessFromIndexSignature
		{
			get { return (bool)this["noPropertyAccessFromIndexSignature"]; }
			set { this["noPropertyAccessFromIndexSignature"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow <c>import</c>s, <c>require</c>s or <c>&lt;reference&gt;</c>s
		/// from expanding the number of files TypeScript should add to a project
		/// </summary>
		[ConfigurationProperty("noResolve", DefaultValue = false)]
		public bool NoResolve
		{
			get { return (bool)this["noResolve"]; }
			set { this["noResolve"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable strict checking of generic signatures in function types
		/// </summary>
		[ConfigurationProperty("noStrictGenericChecks", DefaultValue = false)]
		public bool NoStrictGenericChecks
		{
			get { return (bool)this["noStrictGenericChecks"]; }
			set { this["noStrictGenericChecks"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to include <c>undefined</c> in index signature results
		/// </summary>
		[ConfigurationProperty("noUncheckedIndexedAccess", DefaultValue = false)]
		public bool NoUncheckedIndexedAccess
		{
			get { return (bool)this["noUncheckedIndexedAccess"]; }
			set { this["noUncheckedIndexedAccess"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting when a local variables aren't read
		/// </summary>
		[ConfigurationProperty("noUnusedLocals", DefaultValue = false)]
		public bool NoUnusedLocals
		{
			get { return (bool)this["noUnusedLocals"]; }
			set { this["noUnusedLocals"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise an error when a function parameter isn't read
		/// </summary>
		[ConfigurationProperty("noUnusedParameters", DefaultValue = false)]
		public bool NoUnusedParameters
		{
			get { return (bool)this["noUnusedParameters"]; }
			set { this["noUnusedParameters"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable erasing <c>const enum</c> declarations in generated code
		/// </summary>
		[ConfigurationProperty("preserveConstEnums", DefaultValue = false)]
		public bool PreserveConstEnums
		{
			get { return (bool)this["preserveConstEnums"]; }
			set { this["preserveConstEnums"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting comments
		/// </summary>
		[ConfigurationProperty("removeComments", DefaultValue = false)]
		public bool RemoveComments
		{
			get { return (bool)this["removeComments"]; }
			set { this["removeComments"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip type checking <c>.d.ts</c> files that are included with TypeScript
		/// </summary>
		[ConfigurationProperty("skipDefaultLibCheck", DefaultValue = false)]
		public bool SkipDefaultLibCheck
		{
			get { return (bool)this["skipDefaultLibCheck"]; }
			set { this["skipDefaultLibCheck"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip type checking all <c>.d.ts</c> files
		/// </summary>
		[ConfigurationProperty("skipLibCheck", DefaultValue = false)]
		public bool SkipLibCheck
		{
			get { return (bool)this["skipLibCheck"]; }
			set { this["skipLibCheck"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to check that the arguments for <c>bind</c>, <c>call</c>, and <c>apply</c>
		/// methods match the original function
		/// </summary>
		[ConfigurationProperty("strictBindCallApply", DefaultValue = false)]
		public bool StrictBindCallApply
		{
			get { return (bool)this["strictBindCallApply"]; }
			set { this["strictBindCallApply"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to take into account <c>null</c> and <c>undefined</c> when type checking
		/// </summary>
		[ConfigurationProperty("strictNullChecks", DefaultValue = false)]
		public bool StrictNullChecks
		{
			get { return (bool)this["strictNullChecks"]; }
			set { this["strictNullChecks"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to check to ensure parameters and the return values are subtype-compatible
		/// when assigning functions
		/// </summary>
		[ConfigurationProperty("strictFunctionTypes", DefaultValue = false)]
		public bool StrictFunctionTypes
		{
			get { return (bool)this["strictFunctionTypes"]; }
			set { this["strictFunctionTypes"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to check for class properties that are declared but not set in the
		/// constructor
		/// </summary>
		[ConfigurationProperty("strictPropertyInitialization", DefaultValue = false)]
		public bool StrictPropertyInitialization
		{
			get { return (bool)this["strictPropertyInitialization"]; }
			set { this["strictPropertyInitialization"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting declarations that have <c>@internal</c> in their JSDoc
		/// comments
		/// </summary>
		[ConfigurationProperty("stripInternal", DefaultValue = false)]
		public bool StripInternal
		{
			get { return (bool)this["stripInternal"]; }
			set { this["stripInternal"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable reporting of excess property errors during the creation of
		/// object literals
		/// </summary>
		[ConfigurationProperty("suppressExcessPropertyErrors", DefaultValue = false)]
		public bool SuppressExcessPropertyErrors
		{
			get { return (bool)this["suppressExcessPropertyErrors"]; }
			set { this["suppressExcessPropertyErrors"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress <see cref="NoImplicitAny"/> errors when indexing objects that
		/// lack index signatures
		/// </summary>
		[ConfigurationProperty("suppressImplicitAnyIndexErrors", DefaultValue = false)]
		public bool SuppressImplicitAnyIndexErrors
		{
			get { return (bool)this["suppressImplicitAnyIndexErrors"]; }
			set { this["suppressImplicitAnyIndexErrors"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress type checking errors.
		/// Non-standard option.
		/// </summary>
		[ConfigurationProperty("suppressTypeCheckingErrors", DefaultValue = false)]
		public bool SuppressTypeCheckingErrors
		{
			get { return (bool)this["suppressTypeCheckingErrors"]; }
			set { this["suppressTypeCheckingErrors"] = value; }
		}

		/// <summary>
		/// Gets or sets a JavaScript language version for emitted JavaScript and include compatible library
		/// declarations
		/// </summary>
		[ConfigurationProperty("target", DefaultValue = TargetMode.EcmaScript3)]
		public TargetMode Target
		{
			get { return (TargetMode)this["target"]; }
			set { this["target"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to run TypeScript to JS transpilation only (skip other passes).
		/// Non-standard option.
		/// </summary>
		[ConfigurationProperty("transpileOnly", DefaultValue = false)]
		public bool TranspileOnly
		{
			get { return (bool)this["transpileOnly"]; }
			set { this["transpileOnly"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to emit ECMAScript-standard-compliant class fields
		/// </summary>
		[ConfigurationProperty("useDefineForClassFields", DefaultValue = false)]
		public bool UseDefineForClassFields
		{
			get { return (bool)this["useDefineForClassFields"]; }
			set { this["useDefineForClassFields"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to use a type catch clause variables as <c>unknown</c> instead of
		/// <c>any</c>
		/// </summary>
		[ConfigurationProperty("useUnknownInCatchVariables", DefaultValue = false)]
		public bool UseUnknownInCatchVariables
		{
			get { return (bool)this["useUnknownInCatchVariables"]; }
			set { this["useUnknownInCatchVariables"] = value; }
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