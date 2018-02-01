using System.Collections.Generic;

namespace BundleTransformer.TypeScript.Internal
{
	/// <summary>
	/// TypeScript compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to do not report errors on unreachable code
		/// </summary>
		public bool AllowUnreachableCode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not report errors on unused labels
		/// </summary>
		public bool AllowUnusedLabels
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to parse in strict mode and emit
		/// <code>use strict</code> for each source file
		/// </summary>
		public bool AlwaysStrict
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to provide full support for iterables in <code>for-of</code>,
		/// spread, and destructuring when targeting 'ES5' or 'ES3'
		/// </summary>
		public bool DownlevelIteration
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow inconsistently-cased references to the same file
		/// </summary>
		public bool ForceConsistentCasingInFileNames
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a list of library file names to be included in the compilation
		/// </summary>
		public IList<string> Libs
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a end of line sequence, that used when emitting files:
		/// 'CRLF' (dos) or 'LF' (unix)
		/// </summary>
		public NewLineMode NewLine
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit outputs
		/// </summary>
		public bool NoEmit
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit helpers (e.g. <code>__extends</code> function)
		/// </summary>
		public bool NoEmitHelpers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit outputs if any errors were reported
		/// </summary>
		public bool NoEmitOnError
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not truncate type name in error messages
		/// </summary>
		public bool NoErrorTruncation
		{
			get;
			set;
		}


		/// <summary>
		/// Gets or sets a flag for whether to report errors for fallthrough cases in switch statement
		/// </summary>
		public bool NoFallthroughCasesInSwitch
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise error on expressions and declarations
		/// with an implied <code>any</code> type
		/// </summary>
		public bool NoImplicitAny
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to report error when not all code paths in function return a value
		/// </summary>
		public bool NoImplicitReturns
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise error on <code>this</code> expressions with
		/// an implied <code>any</code> type
		/// </summary>
		public bool NoImplicitThis
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not include a default library (<code>lib.d.ts</code>
		/// or <code>lib.es6.d.ts</code>)
		/// </summary>
		public bool NoLib
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not resolve a script references
		/// </summary>
		public bool NoResolve
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable strict checking of generic signatures
		/// in function types
		/// </summary>
		public bool NoStrictGenericChecks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to report errors on unused locals
		/// </summary>
		public bool NoUnusedLocals
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to report errors on unused parameters
		/// </summary>
		public bool NoUnusedParameters
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not erase const enum declarations in generated code
		/// </summary>
		public bool PreserveConstEnums
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit comments to output
		/// </summary>
		public bool RemoveComments
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip a default library checking
		/// </summary>
		public bool SkipDefaultLibCheck
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to skip type checking of declaration files
		/// </summary>
		public bool SkipLibCheck
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable strict null checks
		/// </summary>
		public bool StrictNullChecks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable strict checking of function types
		/// </summary>
		public bool StrictFunctionTypes
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable strict checking of property
		/// initialization in classes
		/// </summary>
		public bool StrictPropertyInitialization
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit declarations for code that has an
		/// <code>@internal</code> annotation
		/// </summary>
		public bool StripInternal
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress excess property checks for object literals
		/// </summary>
		public bool SuppressExcessPropertyErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress noImplicitAny errors for indexing objects lacking
		/// index signatures
		/// </summary>
		public bool SuppressImplicitAnyIndexErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress type checking errors
		/// </summary>
		public bool SuppressTypeCheckingErrors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a ECMAScript target version: `EcmaScript3` (default), `EcmaScript5`,
		/// `EcmaScript2015`, `EcmaScript2016`, `EcmaScript2017`, `EcmaScript2018` or `EcmaScriptNext`
		/// </summary>
		public TargetMode Target
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to run TypeScript to JS transpilation
		/// only (skip other passes)
		/// </summary>
		public bool TranspileOnly
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
			ForceConsistentCasingInFileNames = false;
			Libs = new List<string>();
			NewLine = NewLineMode.CrLf;
			NoEmit = false;
			NoEmitHelpers = false;
			NoEmitOnError = false;
			NoErrorTruncation = false;
			NoFallthroughCasesInSwitch = false;
			NoImplicitAny = false;
			NoImplicitReturns = false;
			NoImplicitThis = false;
			NoLib = false;
			NoResolve = false;
			NoStrictGenericChecks = false;
			NoUnusedLocals = false;
			NoUnusedParameters = false;
			PreserveConstEnums = false;
			RemoveComments = false;
			SkipDefaultLibCheck = false;
			SkipLibCheck = false;
			StrictNullChecks = false;
			StrictFunctionTypes = false;
			StrictPropertyInitialization = false;
			StripInternal = false;
			SuppressExcessPropertyErrors = false;
			SuppressImplicitAnyIndexErrors = false;
			SuppressTypeCheckingErrors = false;
			Target = TargetMode.EcmaScript3;
			TranspileOnly = false;
		}
	}
}