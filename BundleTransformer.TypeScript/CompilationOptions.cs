namespace BundleTransformer.TypeScript
{
	/// <summary>
	/// Compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a options of code stylization
		/// </summary>
		public StyleOptions StyleOptions
		{
			get;
			set;
		}

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
		/// Gets or sets a flag for whether to disallow with statements
		/// </summary>
		public bool ErrorOnWith
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to infer class properties 
		/// from top-level assignments to <code>this</code>
		/// </summary>
		public bool InferPropertiesFromThisAssignment
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
	}
}