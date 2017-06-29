namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Compression options
	/// </summary>
	public sealed class CompressionOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable support of <code>@ngInject</code> annotations
		/// </summary>
		public bool Angular
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
		/// Gets or sets a flag for whether to collapse single-use <code>var</code> and
		/// <code>const</code> definitions when possible
		/// </summary>
		public bool CollapseVars
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
		/// Gets or sets a flag for whether to compress code
		/// </summary>
		public bool Compress
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
		/// Gets or sets a flag for whether to remove unreachable code
		/// </summary>
		public bool DeadCode
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
		/// Gets or sets a flag for whether to remove <code>debugger;</code> statements
		/// </summary>
		public bool DropDebugger
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
		/// Gets or sets a flag for whether to prevent the compressor from discarding
		/// unused function arguments
		/// </summary>
		public bool KeepFunctionArgs
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to prevent <code>Infinity</code> from being compressed
		/// into <code>1/0</code>, which may cause performance issues on Chrome
		/// </summary>
		public bool KeepInfinity
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
		/// Gets or sets a flag for whether to negate IIFEs
		/// </summary>
		public bool NegateIife
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a number of times to run compress
		/// </summary>
		public int Passes
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
		/// Gets or sets a string representation of the functions list,
		/// that can be safely removed if their return value is not used
		/// </summary>
		public string PureFunctions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to improve optimization on variables assigned
		/// with and used as constant values
		/// </summary>
		public bool ReduceVars
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
		/// Gets or sets a flag for whether to drop unreferenced functions and variables in
		/// the toplevel scope
		/// </summary>
		public bool TopLevel
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of toplevel functions and variables to exclude
		/// from <code>unused</code> removal
		/// </summary>
		public string TopRetain
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
		/// Gets or sets a flag for whether to optimize numerical expressions like <code>2 * x * 3</code>
		/// into <code>6 * x</code>, which may give imprecise floating point results
		/// </summary>
		public bool UnsafeMath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to optimize expressions like
		/// <code>Array.prototype.slice.call(a)</code> into <code>[].slice.call(a)</code>
		/// </summary>
		public bool UnsafeProto
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable substitutions of variables with <code>RegExp</code>
		/// values the same way as if they are constants
		/// </summary>
		public bool UnsafeRegExp
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
		/// Constructs a instance of the compression options
		/// </summary>
		public CompressionOptions()
		{
			Angular = false;
			Booleans = true;
			Cascade = true;
			CollapseVars = true;
			Comparisons = true;
			Compress = true;
			Conditionals = true;
			DeadCode = true;
			DropConsole = false;
			DropDebugger = true;
			Evaluate = true;
			GlobalDefinitions = string.Empty;
			HoistFunctions = true;
			HoistVars = false;
			IfReturn = true;
			JoinVars = true;
			KeepFunctionArgs = true;
			KeepInfinity = false;
			Loops = true;
			NegateIife = true;
			Passes = 1;
			PropertiesDotNotation = true;
			PureGetters = false;
			PureFunctions = string.Empty;
			ReduceVars = true;
			Sequences = true;
			TopLevel = false;
			TopRetain = string.Empty;
			Unsafe = false;
			UnsafeMath = false;
			UnsafeProto = false;
			UnsafeRegExp = false;
			Unused = true;
		}
	}
}