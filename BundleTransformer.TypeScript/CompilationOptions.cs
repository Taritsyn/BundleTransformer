namespace BundleTransformer.TypeScript
{
	/// <summary>
	/// Compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to do not emit outputs if any type checking errors were reported
		/// </summary>
		public bool NoEmitOnError
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to warn on expressions and declarations
		/// with an implied 'any' type
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
			NoEmitOnError = false;
			NoImplicitAny = false;
			NoLib = false;
			PreserveConstEnums = false;
			RemoveComments = false;
			SuppressImplicitAnyIndexErrors = false;
			Target = TargetMode.EcmaScript3;
		}
	}
}