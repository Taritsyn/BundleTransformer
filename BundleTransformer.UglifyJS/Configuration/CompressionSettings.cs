namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of compression
	/// </summary>
	public sealed class CompressionSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to compress code
		/// </summary>
		[ConfigurationProperty("compress", DefaultValue = true)]
		public bool Compress
		{
			get { return (bool) this["compress"]; }
			set { this["compress"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to join consecutive simple 
		/// statements using the comma operator
		/// </summary>
		[ConfigurationProperty("sequences", DefaultValue = true)]
		public bool Sequences
		{
			get { return (bool) this["sequences"]; }
			set { this["sequences"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to rewrite property access using 
		/// the dot notation (for example, <code>foo["bar"] → foo.bar</code>)
		/// </summary>
		[ConfigurationProperty("propertiesDotNotation", DefaultValue = true)]
		public bool PropertiesDotNotation
		{
			get { return (bool) this["propertiesDotNotation"]; }
			set { this["propertiesDotNotation"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove unreachable code
		/// </summary>
		[ConfigurationProperty("deadCode", DefaultValue = true)]
		public bool DeadCode
		{
			get { return (bool) this["deadCode"]; }
			set { this["deadCode"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove <code>debugger;</code> statements
		/// </summary>
		[ConfigurationProperty("dropDebugger", DefaultValue = true)]
		public bool DropDebugger
		{
			get { return (bool) this["dropDebugger"]; }
			set { this["dropDebugger"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to apply "unsafe" transformations
		/// </summary>
		[ConfigurationProperty("unsafe", DefaultValue = false)]
		public bool Unsafe
		{
			get { return (bool) this["unsafe"]; }
			set { this["unsafe"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to apply optimizations 
		/// for <code>if</code>-s and conditional expressions
		/// </summary>
		[ConfigurationProperty("conditionals", DefaultValue = true)]
		public bool Conditionals
		{
			get { return (bool) this["conditionals"]; }
			set { this["conditionals"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to apply certain optimizations 
		/// to binary nodes, attempts to negate binary nodes, etc.
		/// </summary>
		[ConfigurationProperty("comparisons", DefaultValue = true)]
		public bool Comparisons
		{
			get { return (bool) this["comparisons"]; }
			set { this["comparisons"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to attempt to evaluate constant expressions
		/// </summary>
		[ConfigurationProperty("evaluate", DefaultValue = true)]
		public bool Evaluate
		{
			get { return (bool)this["evaluate"]; }
			set { this["evaluate"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable various optimizations for boolean 
		/// context (for example, <code>!!a ? b : c → a ? b : c</code>)
		/// </summary>
		[ConfigurationProperty("booleans", DefaultValue = true)]
		public bool Booleans
		{
			get { return (bool)this["booleans"]; }
			set { this["booleans"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable optimizations for <code>do</code>, <code>while</code> 
		/// and <code>for</code> loops when we can statically determine the condition
		/// </summary>
		[ConfigurationProperty("loops", DefaultValue = true)]
		public bool Loops
		{
			get { return (bool)this["loops"]; }
			set { this["loops"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to drop unreferenced functions and variables
		/// </summary>
		[ConfigurationProperty("unused", DefaultValue = true)]
		public bool Unused
		{
			get { return (bool)this["unused"]; }
			set { this["unused"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to hoist function declarations
		/// </summary>
		[ConfigurationProperty("hoistFunctions", DefaultValue = true)]
		public bool HoistFunctions
		{
			get { return (bool)this["hoistFunctions"]; }
			set { this["hoistFunctions"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to prevent the compressor from discarding
		/// unused function arguments
		/// </summary>
		[ConfigurationProperty("keepFunctionArgs", DefaultValue = false)]
		public bool KeepFunctionArgs
		{
			get { return (bool)this["keepFunctionArgs"]; }
			set { this["keepFunctionArgs"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to hoist <code>var</code> declarations
		/// </summary>
		[ConfigurationProperty("hoistVars", DefaultValue = false)]
		public bool HoistVars
		{
			get { return (bool)this["hoistVars"]; }
			set { this["hoistVars"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable optimizations for if/return 
		/// and if/continue
		/// </summary>
		[ConfigurationProperty("ifReturn", DefaultValue = true)]
		public bool IfReturn
		{
			get { return (bool)this["ifReturn"]; }
			set { this["ifReturn"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to join consecutive <code>var</code> statements
		/// </summary>
		[ConfigurationProperty("joinVars", DefaultValue = true)]
		public bool JoinVars
		{
			get { return (bool)this["joinVars"]; }
			set { this["joinVars"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to small optimization for sequences 
		/// (for example: transform <code>x, x</code> into <code>x</code>
		/// and <code>x = something(), x</code> into <code>x = something()</code>)
		/// </summary>
		[ConfigurationProperty("cascade", DefaultValue = true)]
		public bool Cascade
		{
			get { return (bool)this["cascade"]; }
			set { this["cascade"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of the object 
		/// (comma-separated list of values of the form SYMBOL[=value]) 
		/// with properties named after symbols to replace 
		/// (except where symbol has properly declared by a <code>var</code> 
		/// declaration or use as function parameter or similar) and the values 
		/// representing the AST replacement value
		/// </summary>
		[ConfigurationProperty("globalDefinitions", DefaultValue = "")]
		public string GlobalDefinitions
		{
			get { return (string)this["globalDefinitions"]; }
			set { this["globalDefinitions"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to UglifyJS will assume 
		/// that object property access (e.g. <code>foo.bar</code> or <code>foo["bar"]</code>) 
		/// doesn't have any side effects
		/// </summary>
		[ConfigurationProperty("pureGetters", DefaultValue = false)]
		public bool PureGetters
		{
			get { return (bool)this["pureGetters"]; }
			set { this["pureGetters"] = value; }
		}

		/// <summary>
		/// Gets or sets a string representation of the function names list, 
		/// which UglifyJS will assume that those functions do not produce side effects
		/// </summary>
		[ConfigurationProperty("pureFunctions", DefaultValue = "")]
		public string PureFunctions
		{
			get { return (string)this["pureFunctions"]; }
			set { this["pureFunctions"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to discard calls to <code>console.*</code> functions
		/// </summary>
		[ConfigurationProperty("dropConsole", DefaultValue = false)]
		public bool DropConsole
		{
			get { return (bool)this["dropConsole"]; }
			set { this["dropConsole"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable support of <code>@ngInject</code> annotations
		/// </summary>
		[ConfigurationProperty("angular", DefaultValue = false)]
		public bool Angular
		{
			get { return (bool)this["angular"]; }
			set { this["angular"] = value; }
		}
	}
}