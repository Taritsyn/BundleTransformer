namespace BundleTransformer.Less
{
	using System.Collections.Generic;

	/// <summary>
	/// LESS-stylesheet
	/// </summary>
	public sealed class LessStylesheet
	{
		/// <summary>
		/// Gets a URL of stylesheet file
		/// </summary>
		public string Url
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets or sets a text content of stylesheet
		/// </summary>
		public string Content
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a list of LESS-imports
		/// </summary>
		public List<LessImport> Imports
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a list of asset's URLs from <code>data-uri</code> functions
		/// </summary>
		public List<string> DataUriFunctionAssetUrls
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs a instance of LESS-stylesheet
		/// </summary>
		/// <param name="url">URL of stylesheet file</param>
		public LessStylesheet(string url) : this(url, string.Empty)
		{ }

		/// <summary>
		/// Constructs a instance of LESS-stylesheet
		/// </summary>
		/// <param name="url">URL of stylesheet file</param>
		/// <param name="content">Text content of stylesheet</param>
		public LessStylesheet(string url, string content)
			: this(url, content, new List<LessImport>(), new List<string>())
		{ }

		/// <summary>
		/// Constructs a instance of LESS-stylesheet
		/// </summary>
		/// <param name="url">URL of stylesheet file</param>
		/// <param name="content">Text content of stylesheet</param>
		/// <param name="imports">List of LESS-imports</param>
		/// <param name="dataUriFunctionImageUrls">List of image's URLs from <code>data-uri</code> functions</param>
		public LessStylesheet(string url, string content,
			List<LessImport> imports, List<string> dataUriFunctionImageUrls)
		{
			Url = url;
			Content = content;
			Imports = imports;
			DataUriFunctionAssetUrls = dataUriFunctionImageUrls;
		}
	}
}