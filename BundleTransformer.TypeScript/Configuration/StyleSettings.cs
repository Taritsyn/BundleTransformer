namespace BundleTransformer.TypeScript.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of code stylization
	/// </summary>
	public sealed class StyleSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow bitwise operations
		/// </summary>
		[ConfigurationProperty("bitwise", DefaultValue = false)]
		public bool Bitwise
		{
			get { return (bool)this["bitwise"]; }
			set { this["bitwise"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow non-block statements 
		/// as bodies of compound statements
		/// </summary>
		[ConfigurationProperty("blockInCompoundStatement", DefaultValue = false)]
		public bool BlockInCompoundStatement
		{
			get { return (bool)this["blockInCompoundStatement"]; }
			set { this["blockInCompoundStatement"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow <code>==</code> and <code>!=</code>
		/// </summary>
		[ConfigurationProperty("eqEqEq", DefaultValue = false)]
		public bool EqEqEq
		{
			get { return (bool)this["eqEqEq"]; }
			set { this["eqEqEq"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to require body of for in loop to start with a filter
		/// </summary>
		[ConfigurationProperty("forIn", DefaultValue = false)]
		public bool ForIn
		{
			get { return (bool)this["forIn"]; }
			set { this["forIn"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit empty blocks
		/// </summary>
		[ConfigurationProperty("emptyBlocks", DefaultValue = true)]
		public bool EmptyBlocks
		{
			get { return (bool)this["emptyBlocks"]; }
			set { this["emptyBlocks"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to require result of new expression 
		/// to be used (no new just for side-effects)
		/// </summary>
		[ConfigurationProperty("newMustBeUsed", DefaultValue = false)]
		public bool NewMustBeUsed
		{
			get { return (bool)this["newMustBeUsed"]; }
			set { this["newMustBeUsed"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to require semicolons to terminate statements
		/// </summary>
		[ConfigurationProperty("requireSemicolons", DefaultValue = false)]
		public bool RequireSemicolons
		{
			get { return (bool)this["requireSemicolons"]; }
			set { this["requireSemicolons"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow top-level assignment in 
		/// conditionals <code>if (a=b) { ...</code>
		/// </summary>
		[ConfigurationProperty("assignmentInConditions", DefaultValue = false)]
		public bool AssignmentInConditions
		{
			get { return (bool) this["assignmentInConditions"]; }
			set { this["assignmentInConditions"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow <code>== null</code> or <code>!= null</code>
		/// </summary>
		[ConfigurationProperty("eqNull", DefaultValue = false)]
		public bool EqNull
		{
			get { return (bool)this["eqNull"]; }
			set { this["eqNull"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit <code>eval</code>
		/// </summary>
		[ConfigurationProperty("evalOk", DefaultValue = true)]
		public bool EvalOk
		{
			get { return (bool)this["evalOk"]; }
			set { this["evalOk"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit var use if declaration 
		/// in inner scope as in <code>if (c) { var v=10; } v=11;</code>
		/// </summary>
		[ConfigurationProperty("innerScopeDeclarationsEscape", DefaultValue = true)]
		public bool InnerScopeDeclarationsEscape
		{
			get { return (bool)this["innerScopeDeclarationsEscape"]; }
			set { this["innerScopeDeclarationsEscape"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit functions in loops
		/// </summary>
		[ConfigurationProperty("functionsInLoops", DefaultValue = true)]
		public bool FunctionsInLoops
		{
			get { return (bool)this["functionsInLoops"]; }
			set { this["functionsInLoops"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit re-declaration of local variable
		/// </summary>
		[ConfigurationProperty("reDeclareLocal", DefaultValue = true)]
		public bool ReDeclareLocal
		{
			get { return (bool)this["reDeclareLocal"]; }
			set { this["reDeclareLocal"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit 
		/// <code>obj['x']</code> in addition to <code>obj.x</code>
		/// </summary>
		[ConfigurationProperty("literalSubscript", DefaultValue = true)]
		public bool LiteralSubscript
		{
			get { return (bool)this["literalSubscript"]; }
			set { this["literalSubscript"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to implicit 'any'
		/// </summary>
		[ConfigurationProperty("implicitAny", DefaultValue = false)]
		public bool ImplicitAny
		{
			get { return (bool)this["implicitAny"]; }
			set { this["implicitAny"] = value; }
		}
	}
}