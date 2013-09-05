namespace BundleTransformer.TypeScript.Configuration
{
	using System.Configuration;

	using Core.Configuration;

	/// <summary>
	/// Configuration settings of TypeScript-translator
	/// </summary>
	public sealed class TypeScriptSettings : ConfigurationSection
	{
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
		/// Gets or sets a flag for whether to propagate enum constants to emitted code
		/// </summary>
		[ConfigurationProperty("propagateEnumConstants", DefaultValue = false)]
		public bool PropagateEnumConstants
		{
			get { return (bool)this["propagateEnumConstants"]; }
			set { this["propagateEnumConstants"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit comments to output
		/// </summary>
		[ConfigurationProperty("removeComments", DefaultValue = false)]
		public bool RemoveComments
		{
			get { return (bool)this["removeComments"]; }
			set { this["removeComments"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow 'bool' as a synonym for 'boolean'
		/// </summary>
		[ConfigurationProperty("allowBool", DefaultValue = false)]
		public bool AllowBool
		{
			get { return (bool)this["allowBool"]; }
			set { this["allowBool"] = value; }
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

		/// <summary>
		/// Gets or sets a flag for whether to warn on expressions and declarations 
		/// with an implied 'any' type
		/// </summary>
		[ConfigurationProperty("noImplicitAny", DefaultValue = false)]
		public bool NoImplicitAny
		{
			get { return (bool)this["noImplicitAny"]; }
			set { this["noImplicitAny"] = value; }
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
		/// Gets a configuration settings of JavaScript engine
		/// </summary>
		[ConfigurationProperty("jsEngine")]
		public JsEngineSettings JsEngine
		{
			get { return (JsEngineSettings)this["jsEngine"]; }
		}
	}
}