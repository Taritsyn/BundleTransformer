namespace BundleTransformer.Hogan
{
	using System.Collections.Generic;

	/// <summary>
	/// Compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable native minification
		/// </summary>
		public bool EnableNativeMinification
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a variable name for wrapper
		/// </summary>
		public string Variable
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a prefix to template names
		/// </summary>
		public string Namespace
		{
			get;
			set;
		}

		/// <summary>
		/// List of custom section tags
		/// </summary>
		public IList<SectionTag> SectionTags
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a string that overrides the default delimiters
		/// (for example, <code>&lt;% %&gt;</code>)
		/// </summary>
		public string Delimiters
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the Hogan compilation options
		/// </summary>
		public CompilationOptions()
		{
			EnableNativeMinification = false;
			Variable = "templates";
			Namespace = string.Empty;
			SectionTags = new List<SectionTag>();
			Delimiters = string.Empty;
		}
	}
}