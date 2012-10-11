namespace BundleTransformer.TypeScript.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of TypeScript-translator
	/// </summary>
	public sealed class TypeScriptSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets a configuration settings of code stylization
		/// </summary>
		[ConfigurationProperty("style")]
		public StyleSettings Style
		{
			get { return (StyleSettings)this["style"]; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow the use of native minification
		/// </summary>
		[ConfigurationProperty("useNativeMinification", DefaultValue = false)]
		public bool UseNativeMinification
		{
			get { return (bool)this["useNativeMinification"]; }
			set { this["useNativeMinification"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to include a default lib.d.ts with global declarations
		/// </summary>
		[ConfigurationProperty("useDefaultLib", DefaultValue = true)]
		public bool UseDefaultLib
		{
			get { return (bool)this["useDefaultLib"]; }
			set { this["useDefaultLib"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to propagate constants to emitted code
		/// </summary>
		[ConfigurationProperty("propagateConstants", DefaultValue = false)]
		public bool PropagateConstants
		{
			get { return (bool)this["propagateConstants"]; }
			set { this["propagateConstants"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow with statements
		/// </summary>
		[ConfigurationProperty("errorOnWith", DefaultValue = true)]
		public bool ErrorOnWith
		{
			get { return (bool)this["errorOnWith"]; }
			set { this["errorOnWith"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to infer class properties from top-level assignments to 'this'
		/// </summary>
		[ConfigurationProperty("inferPropertiesFromThisAssignment", DefaultValue = false)]
		public bool InferPropertiesFromThisAssignment
		{
			get { return (bool)this["inferPropertiesFromThisAssignment"]; }
			set { this["inferPropertiesFromThisAssignment"] = value; }
		}

		/// <summary>
		/// Gets or sets a ECMAScript target version ("EcmaScript3" (default), or "EcmaScript5")
		/// </summary>
		[ConfigurationProperty("codeGenTarget", DefaultValue = CodeGenTarget.EcmaScript3)]
		public CodeGenTarget CodeGenTarget
		{
			get { return (CodeGenTarget)this["codeGenTarget"]; }
			set { this["codeGenTarget"] = value; }
		}
	}
}
