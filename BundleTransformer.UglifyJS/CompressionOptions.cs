namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Compression options
	/// </summary>
	public sealed class CompressionOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to compress code
		/// </summary>
		public bool Compress
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to join consecutive simple 
		/// statements using the comma operator
		/// </summary>
		public bool Sequences
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to rewrite property access using 
		/// the dot notation (for example, <code>foo["bar"] → foo.bar</code>)
		/// </summary>
		public bool PropertiesDotNotation
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove unreachable code
		/// </summary>
		public bool DeadCode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove <code>debugger;</code> statements
		/// </summary>
		public bool DropDebugger
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to apply "unsafe" transformations
		/// </summary>
		public bool Unsafe
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to apply optimizations 
		/// for <code>if</code>-s and conditional expressions
		/// </summary>
		public bool Conditionals
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to apply certain optimizations 
		/// to binary nodes, attempts to negate binary nodes, etc.
		/// </summary>
		public bool Comparisons
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to attempt to evaluate constant expressions
		/// </summary>
		public bool Evaluate
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable various optimizations for boolean 
		/// context (for example, <code>!!a ? b : c → a ? b : c</code>)
		/// </summary>
		public bool Booleans
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable optimizations for <code>do</code>, <code>while</code> 
		/// and <code>for</code> loops when we can statically determine the condition
		/// </summary>
		public bool Loops
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to drop unreferenced functions and variables
		/// </summary>
		public bool Unused
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to hoist function declarations
		/// </summary>
		public bool HoistFunctions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to hoist <code>var</code> declarations
		/// </summary>
		public bool HoistVars
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable optimizations for if/return 
		/// and if/continue
		/// </summary>
		public bool IfReturn
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to join consecutive <code>var</code> statements
		/// </summary>
		public bool JoinVars
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to small optimization for sequences 
		/// (for example: transform <code>x, x</code> into <code>x</code>
		/// and <code>x = something(), x</code> into <code>x = something()</code>)
		/// </summary>
		public bool Cascade
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a string representation of the object 
		/// (comma-separated list of values of the form SYMBOL[=value]) 
		/// with properties named after symbols to replace 
		/// (except where symbol has properly declared by a var declaration 
		/// or use as function parameter or similar) and the values 
		/// representing the AST replacement value
		/// </summary>
		public string GlobalDefinitions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to UglifyJS will assume 
		/// that object property access (e.g. <code>foo.bar</code> or <code>foo["bar"]</code>) 
		/// doesn't have any side effects
		/// </summary>
		public bool PureGetters
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a string representation of the function names list, 
		/// which UglifyJS will assume that those functions do not produce side effects
		/// </summary>
		public string PureFunctions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to discard calls to <code>console.*</code> functions
		/// </summary>
		public bool DropConsole
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable support of <code>@ngInject</code> annotations
		/// </summary>
		public bool Angular
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of the compression options
		/// </summary>
		public CompressionOptions()
		{
			Compress = true;
			Sequences = true;
			PropertiesDotNotation = true;
			DeadCode = true;
			DropDebugger = true;
			Unsafe = false;
			Conditionals = true;
			Comparisons = true;
			Evaluate = true;
			Booleans = true;
			Loops = true;
			Unused = true;
			HoistFunctions = true;
			HoistVars = false;
			IfReturn = true;
			JoinVars = true;
			Cascade = true;
			GlobalDefinitions = string.Empty;
			PureGetters = false;
			PureFunctions = string.Empty;
			DropConsole = false;
			Angular = false;
		}
	}
}