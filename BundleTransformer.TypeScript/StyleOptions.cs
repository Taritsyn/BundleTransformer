namespace BundleTransformer.TypeScript
{
	/// <summary>
	/// Code stylization options
	/// </summary>
	public sealed class StyleOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow bitwise operations
		/// </summary>
		public bool Bitwise
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow non-block statements 
		/// as bodies of compound statements
		/// </summary>
		public bool BlockInCompoundStatement
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow <code>==</code> and <code>!=</code>
		/// </summary>
		public bool EqEqEq
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to require body of for in loop to start with a filter
		/// </summary>
		public bool ForIn
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit empty blocks
		/// </summary>
		public bool EmptyBlocks
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to require result of new expression 
		/// to be used (no new just for side-effects)
		/// </summary>
		public bool NewMustBeUsed
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to require semicolons to terminate statements
		/// </summary>
		public bool RequireSemicolons
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow top-level assignment in 
		/// conditionals <code>if (a=b) { ...</code>
		/// </summary>
		public bool AssignmentInConditions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow <code>== null</code> or <code>!= null</code>
		/// </summary>
		public bool EqNull
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit <code>eval</code>
		/// </summary>
		public bool EvalOk
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit var use if declaration 
		/// in inner scope as in <code>if (c) { var v=10; } v=11;</code>
		/// </summary>
		public bool InnerScopeDeclarationsEscape
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit functions in loops
		/// </summary>
		public bool FunctionsInLoops
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit re-declaration of local variable
		/// </summary>
		public bool ReDeclareLocal
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit 
		/// <code>obj['x']</code>code> in addition to <code>obj.x</code>
		/// </summary>
		public bool LiteralSubscript
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to implicit 'any'
		/// </summary>
		public bool ImplicitAny
		{
			get;
			set;
		}
	}
}