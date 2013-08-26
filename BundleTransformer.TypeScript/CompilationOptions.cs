namespace BundleTransformer.TypeScript
{
	/// <summary>
	/// Compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to include a default <code>lib.d.ts</code> with global declarations
		/// </summary>
		public bool UseDefaultLib
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to propagate enum constants to emitted code
		/// </summary>
		public bool PropagateEnumConstants
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
		/// Gets or sets a flag for whether to allow 'bool' as a synonym for 'boolean'
		/// </summary>
		public bool AllowBool
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow automatic semicolon insertion
		/// </summary>
		public bool AllowAutomaticSemicolonInsertion
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
		/// Gets or sets a ECMAScript target version ("EcmaScript3" (default), or "EcmaScript5")
		/// </summary>
		public CodeGenTarget CodeGenTarget
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of the TypeScript compilation options
		/// </summary>
		public CompilationOptions()
		{
			UseDefaultLib = true;
			PropagateEnumConstants = false;
			RemoveComments = false;
			AllowBool = false;
			AllowAutomaticSemicolonInsertion = true;
			NoImplicitAny = false;
			CodeGenTarget = CodeGenTarget.EcmaScript3;
		}
	}
}