namespace BundleTransformer.SassAndScss
{
	using System.Collections.Generic;

	/// <summary>
	/// Sass- and SCSS-stylesheet
	/// </summary>
	public sealed class SassAndScssStylesheet
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
		/// Gets a list of Sass- and SCSS-imports
		/// </summary>
		public List<string> Imports
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of Sass- and SCSS-stylesheet
		/// </summary>
		/// <param name="url">URL of stylesheet file</param>
		public SassAndScssStylesheet(string url) : this(url, string.Empty)
		{ }

		/// <summary>
		/// Constructs instance of Sass- and SCSS-stylesheet
		/// </summary>
		/// <param name="url">URL of stylesheet file</param>
		/// <param name="content">Text content of stylesheet</param>
		public SassAndScssStylesheet(string url, string content)
			: this(url, content, new List<string>())
		{ }

		/// <summary>
		/// Constructs instance of Sass- and SCSS-stylesheet
		/// </summary>
		/// <param name="url">URL of stylesheet file</param>
		/// <param name="content">Text content of stylesheet</param>
		/// <param name="imports">List of Sass-imports</param>
		public SassAndScssStylesheet(string url, string content, List<string> imports)
		{
			Url = url;
			Content = content;
			Imports = imports;
		}
	}
}