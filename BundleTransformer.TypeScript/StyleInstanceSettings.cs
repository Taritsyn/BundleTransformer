namespace BundleTransformer.TypeScript
{
	/// <summary>
	/// Settings of code stylization
	/// </summary>
	public sealed class StyleInstanceSettings
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
		/// Gets or sets a flag for whether to disallow == and !=
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
		/// conditionals if (a=b) { ...
		/// </summary>
		public bool AssignmentInConditions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow == null or != null
		/// </summary>
		public bool EqNull
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit eval
		/// </summary>
		public bool EvalOk
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to permit var use if declaration 
		/// in inner scope as in if (c) { var v=10; } v=11;
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
		/// Gets or sets a flag for whether to permit obj['x'] in addition to obj.x
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
