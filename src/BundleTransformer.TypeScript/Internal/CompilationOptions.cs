using System.Collections.Generic;

namespace BundleTransformer.TypeScript.Internal
{
	/// <summary>
	/// TypeScript compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to disable error reporting for unreachable code
		/// </summary>
		public bool AllowUnreachableCode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable error reporting for unused labels
		/// </summary>
		public bool AllowUnusedLabels
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to ensure <c>use strict</c> is always emitted
		/// </summary>
		public bool AlwaysStrict
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to emit more compliant, but verbose and less performant JavaScript for
		/// iteration
		/// </summary>
		public bool DownlevelIteration
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to interpret optional property types as written, rather than adding
		/// <c>undefined</c>
		/// </summary>
		public bool ExactOptionalPropertyTypes
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to ensure that casing is correct in imports
		/// </summary>
		public bool ForceConsistentCasingInFileNames
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a version number of TypeScript for which deprecation warnings should be ignored
		/// </summary>
		public string IgnoreDeprecations
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to make keyof only return strings instead of string, numbers or symbols.
		/// Legacy option.
		/// </summary>
		public bool KeyofStringsOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a set of bundled library declaration files that describe the target runtime environment
		/// </summary>
		public IList<string> Libs
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a newline character for emitting files
		/// </summary>
		public NewLineMode NewLine
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting files from a compilation
		/// </summary>
		public bool NoEmit
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable generating custom helper functions like <c>__extends</c> in
		/// compiled output
		/// </summary>
		public bool NoEmitHelpers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting files if any type checking errors are reported
		/// </summary>
		public bool NoEmitOnError
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable truncating types in error messages
		/// </summary>
		public bool NoErrorTruncation
		{
			get;
			set;
		}


		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting for fallthrough cases in switch statements
		/// </summary>
		public bool NoFallthroughCasesInSwitch
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting for expressions and declarations with an implied
		/// <c>any</c> type
		/// </summary>
		public bool NoImplicitAny
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to ensure overriding members in derived classes are marked with an override
		/// modifier
		/// </summary>
		public bool NoImplicitOverride
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting for codepaths that do not explicitly return in a
		/// function
		/// </summary>
		public bool NoImplicitReturns
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting when <c>this</c> is given the type <c>any</c>
		/// </summary>
		public bool NoImplicitThis
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable including any library files, including the default <c>lib.d.ts</c>
		/// </summary>
		public bool NoLib
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enforce using indexed accessors for keys declared using an indexed type
		/// </summary>
		public bool NoPropertyAccessFromIndexSignature
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow <c>import</c>s, <c>require</c>s or <c>&lt;reference&gt;</c>s
		/// from expanding the number of files TypeScript should add to a project
		/// </summary>
		public bool NoResolve
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable strict checking of generic signatures in function types
		/// </summary>
		public bool NoStrictGenericChecks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add <c>undefined</c> to a type when accessed using an index
		/// </summary>
		public bool NoUncheckedIndexedAccess
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable error reporting when local variables aren't read
		/// </summary>
		public bool NoUnusedLocals
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise an error when a function parameter isn't read
		/// </summary>
		public bool NoUnusedParameters
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable erasing <c>const enum</c> declarations in generated code
		/// </summary>
		public bool PreserveConstEnums
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting comments
		/// </summary>
		public bool RemoveComments
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip type checking <c>.d.ts</c> files that are included with TypeScript
		/// </summary>
		public bool SkipDefaultLibCheck
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip type checking all <c>.d.ts</c> files
		/// </summary>
		public bool SkipLibCheck
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to check that the arguments for <c>bind</c>, <c>call</c>, and <c>apply</c>
		/// methods match the original function
		/// </summary>
		public bool StrictBindCallApply
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to take into account <c>null</c> and <c>undefined</c> when type checking
		/// </summary>
		public bool StrictNullChecks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to check to ensure parameters and the return values are subtype-compatible
		/// when assigning functions
		/// </summary>
		public bool StrictFunctionTypes
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to check for class properties that are declared but not set in the
		/// constructor
		/// </summary>
		public bool StrictPropertyInitialization
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable emitting declarations that have <c>@internal</c> in their JSDoc
		/// comments
		/// </summary>
		public bool StripInternal
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable reporting of excess property errors during the creation of
		/// object literals
		/// </summary>
		public bool SuppressExcessPropertyErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress <see cref="NoImplicitAny"/> errors when indexing objects that
		/// lack index signatures
		/// </summary>
		public bool SuppressImplicitAnyIndexErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress type checking errors.
		/// Non-standard option.
		/// </summary>
		public bool SuppressTypeCheckingErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a JavaScript language version for emitted JavaScript and include compatible library
		/// declarations
		/// </summary>
		public TargetMode Target
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to run TypeScript to JS transpilation only (skip other passes).
		/// Non-standard option.
		/// </summary>
		public bool TranspileOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to emit ECMAScript-standard-compliant class fields
		/// </summary>
		public bool UseDefineForClassFields
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to use a default catch clause variables as <c>unknown</c> instead of
		/// <c>any</c>
		/// </summary>
		public bool UseUnknownInCatchVariables
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the TypeScript compilation options
		/// </summary>
		public CompilationOptions()
		{
			AllowUnreachableCode = false;
			AllowUnusedLabels = false;
			AlwaysStrict = false;
			DownlevelIteration = false;
			ExactOptionalPropertyTypes = false;
			ForceConsistentCasingInFileNames = true;
			IgnoreDeprecations = string.Empty;
			KeyofStringsOnly = false;
			Libs = new List<string>();
			NewLine = NewLineMode.CrLf;
			NoEmit = false;
			NoEmitHelpers = false;
			NoEmitOnError = false;
			NoErrorTruncation = false;
			NoFallthroughCasesInSwitch = false;
			NoImplicitAny = false;
			NoImplicitOverride = false;
			NoImplicitReturns = false;
			NoImplicitThis = false;
			NoLib = false;
			NoPropertyAccessFromIndexSignature = false;
			NoResolve = false;
			NoStrictGenericChecks = false;
			NoUncheckedIndexedAccess = false;
			NoUnusedLocals = false;
			NoUnusedParameters = false;
			PreserveConstEnums = false;
			RemoveComments = false;
			SkipDefaultLibCheck = false;
			SkipLibCheck = false;
			StrictBindCallApply = false;
			StrictNullChecks = false;
			StrictFunctionTypes = false;
			StrictPropertyInitialization = false;
			StripInternal = false;
			SuppressExcessPropertyErrors = false;
			SuppressImplicitAnyIndexErrors = false;
			SuppressTypeCheckingErrors = false;
			Target = TargetMode.EcmaScript5;
			TranspileOnly = false;
			UseDefineForClassFields = false;
			UseUnknownInCatchVariables = false;
		}
	}
}