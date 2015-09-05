namespace BundleTransformer.Autoprefixer
{
	using System.Collections.Generic;

	/// <summary>
	/// Autoprefixing options
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
		/// Gets or sets a flag for whether to remove outdated prefixes
		/// </summary>
		public bool Remove
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
		/// Constructs a instance of autoprefixing options
		/// </summary>
		public AutoprefixingOptions()
		{
			Browsers = new List<string>();
			Cascade = true;
			Remove = true;
			Add = true;
		}
	}
}