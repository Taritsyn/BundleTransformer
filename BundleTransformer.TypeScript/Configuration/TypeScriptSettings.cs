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
		/// Gets or sets a flag for whether to do not emit outputs
		/// </summary>
		[ConfigurationProperty("noEmit", DefaultValue = false)]
		public bool NoEmit
		{
			get { return (bool)this["noEmit"]; }
			set { this["noEmit"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit outputs if any type checking errors were reported
		/// </summary>
		[ConfigurationProperty("noEmitOnError", DefaultValue = false)]
		public bool NoEmitOnError
		{
			get { return (bool)this["noEmitOnError"]; }
			set { this["noEmitOnError"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to raise error on expressions and declarations
		/// with an implied <code>any</code> type
		/// </summary>
		[ConfigurationProperty("noImplicitAny", DefaultValue = false)]
		public bool NoImplicitAny
		{
			get { return (bool)this["noImplicitAny"]; }
			set { this["noImplicitAny"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not include a default library (<code>lib.d.ts</code>
		/// or <code>lib.es6.d.ts</code>)
		/// </summary>
		[ConfigurationProperty("noLib", DefaultValue = false)]
		public bool NoLib
		{
			get { return (bool)this["noLib"]; }
			set { this["noLib"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not erase const enum declarations in generated code
		/// </summary>
		[ConfigurationProperty("preserveConstEnums", DefaultValue = false)]
		public bool PreserveConstEnums
		{
			get { return (bool)this["preserveConstEnums"]; }
			set { this["preserveConstEnums"] = value; }
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
		/// Gets or sets a flag for whether to do not emit declarations for code that has an
		/// <code>@internal</code> annotation
		/// </summary>
		[ConfigurationProperty("stripInternal", DefaultValue = false)]
		public bool StripInternal
		{
			get { return (bool)this["stripInternal"]; }
			set { this["stripInternal"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to suppress noImplicitAny errors for indexing objects lacking
		/// index signatures
		/// </summary>
		[ConfigurationProperty("suppressImplicitAnyIndexErrors", DefaultValue = false)]
		public bool SuppressImplicitAnyIndexErrors
		{
			get { return (bool)this["suppressImplicitAnyIndexErrors"]; }
			set { this["suppressImplicitAnyIndexErrors"] = value; }
		}

		/// <summary>
		/// Gets or sets a ECMAScript target version: `EcmaScript3` (default), `EcmaScript5`,
		/// or `EcmaScript6` (experimental)
		/// </summary>
		[ConfigurationProperty("target", DefaultValue = TargetMode.EcmaScript3)]
		public TargetMode Target
		{
			get { return (TargetMode)this["target"]; }
			set { this["target"] = value; }
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