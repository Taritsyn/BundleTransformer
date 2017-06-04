using System.Collections.Generic;

namespace BundleTransformer.Autoprefixer.Internal
{
	/// <summary>
	/// CSS autoprefixing options
	/// </summary>
	internal sealed class AutoprefixingOptions
	{
		/// <summary>
		/// Gets or sets a list of browser conditional expressions
		/// </summary>
		public IList<string> Browsers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to create nice visual cascade of prefixes
		/// </summary>
		public bool Cascade
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add new prefixes
		/// </summary>
		public bool Add
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove outdated prefixes
		/// </summary>
		public bool Remove
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add prefixes for <code>@supports</code> parameters
		/// </summary>
		public bool Supports
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add prefixes for flexbox properties.
		/// With "no-2009" value Autoprefixer will add prefixes only for final and IE versions of specification.
		/// </summary>
		public object Flexbox
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add IE prefixes for Grid Layout properties
		/// </summary>
		public bool Grid
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a virtual path to file, that contains custom usage statistics for
		/// <code>&gt; 10% in my stats</code> browsers query
		/// </summary>
		public string Stats
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the CSS autoprefixing options
		/// </summary>
		public AutoprefixingOptions()
		{
			Browsers = new List<string>();
			Cascade = true;
			Add = true;
			Remove = true;
			Supports = true;
			Flexbox = true;
			Grid = true;
			Stats = string.Empty;
		}
	}
}