namespace BundleTransformer.Handlebars
{
	/// <summary>
	/// Compilation options
	/// </summary>
	internal sealed class CompilationOptions
	{
		/// <summary>
		/// Gets or sets a template namespace
		/// </summary>
		public string Namespace
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a template root.
		/// Base value that will be stripped from template names.
		/// </summary>
		public string RootPath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of known helpers
		/// </summary>
		public string KnownHelpers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to use only known helpers
		/// </summary>
		public bool KnownHelpersOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to include data when compiling
		/// (<code>@data</code> variables)
		/// </summary>
		public bool Data
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the Handlebars compilation options
		/// </summary>
		public CompilationOptions()
		{
			Namespace = "Handlebars.templates";
			RootPath = string.Empty;
			KnownHelpers = string.Empty;
			KnownHelpersOnly = false;
			Data = true;
		}
	}
}