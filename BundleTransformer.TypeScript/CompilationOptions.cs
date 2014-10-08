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
		/// Gets or sets a flag for whether to do not emit comments to output
		/// </summary>
		public bool RemoveComments
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
			RemoveComments = false;
			NoImplicitAny = false;
			CodeGenTarget = CodeGenTarget.EcmaScript3;
		}
	}
}