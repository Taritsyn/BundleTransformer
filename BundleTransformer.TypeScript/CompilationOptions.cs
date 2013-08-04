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
		/// Gets or sets a flag for whether to propagate constants to emitted code
		/// </summary>
		public bool PropagateConstants
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable native minification
		/// </summary>
		public bool EnableNativeMinification
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
		/// Gets or sets a flag for whether to allow throw error for use of deprecated "bool" type
		/// </summary>
		public bool DisallowBool
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
		/// Constructs instance of the TypeScript compilation options
		/// </summary>
		public CompilationOptions()
		{
			UseDefaultLib = true;
			PropagateConstants = false;
			EnableNativeMinification = false;
			CodeGenTarget = CodeGenTarget.EcmaScript3;
			DisallowBool = false;
			AllowAutomaticSemicolonInsertion = true;
		}
	}
}