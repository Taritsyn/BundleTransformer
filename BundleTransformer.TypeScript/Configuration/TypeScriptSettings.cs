namespace BundleTransformer.TypeScript.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of TypeScript-translator
	/// </summary>
	public sealed class TypeScriptSettings : ConfigurationSection
	{
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
		/// Gets or sets a flag for whether to include a default <code>lib.d.ts</code> with global declarations
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
		/// Gets or sets a ECMAScript target version ("EcmaScript3" (default), or "EcmaScript5")
		/// </summary>
		[ConfigurationProperty("codeGenTarget", DefaultValue = CodeGenTarget.EcmaScript3)]
		public CodeGenTarget CodeGenTarget
		{
			get { return (CodeGenTarget)this["codeGenTarget"]; }
			set { this["codeGenTarget"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow throw error for use of deprecated "bool" type
		/// </summary>
		[ConfigurationProperty("disallowBool", DefaultValue = false)]
		public bool DisallowBool
		{
			get { return (bool)this["disallowBool"]; }
			set { this["disallowBool"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow automatic semicolon insertion
		/// </summary>
		[ConfigurationProperty("allowAutomaticSemicolonInsertion", DefaultValue = true)]
		public bool AllowAutomaticSemicolonInsertion
		{
			get { return (bool)this["allowAutomaticSemicolonInsertion"]; }
			set { this["allowAutomaticSemicolonInsertion"] = value; }
		}
	}
}