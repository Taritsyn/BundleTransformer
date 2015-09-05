namespace BundleTransformer.TypeScript
{
	/// <summary>
	/// Compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable experimental support for ES7 async functions
		/// </summary>
		public bool ExperimentalAsyncFunctions
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
		/// Gets or sets a flag for whether to raise error on expressions and declarations
		/// with an implied <code>any</code> type
		/// </summary>
		public bool NoImplicitAny
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
		/// Gets or sets a ECMAScript target version: `EcmaScript3` (default), `EcmaScript5`,
		/// or `EcmaScript6` (experimental)
		/// </summary>
		public TargetMode Target
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the TypeScript compilation options
		/// </summary>
		public CompilationOptions()
		{
			ExperimentalAsyncFunctions = false;
			NewLine = NewLineMode.CrLf;
			NoEmit = false;
			NoEmitHelpers = false;
			NoEmitOnError = false;
			NoImplicitAny = false;
			NoLib = false;
			PreserveConstEnums = false;
			RemoveComments = false;
			SkipDefaultLibCheck = false;
			StripInternal = false;
			SuppressExcessPropertyErrors = false;
			SuppressImplicitAnyIndexErrors = false;
			Target = TargetMode.EcmaScript3;
		}
	}
}