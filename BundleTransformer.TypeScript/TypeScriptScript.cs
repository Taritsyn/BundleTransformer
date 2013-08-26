namespace BundleTransformer.TypeScript
{
	using System.Collections.Generic;

	/// <summary>
	/// TypeScript-script
	/// </summary>
	public sealed class TypeScriptScript
	{
		/// <summary>
		/// Gets a URL of script file
		/// </summary>
		public string Url
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets or sets a text content of script
		/// </summary>
		public string Content
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a list of references
		/// </summary>
		public List<string> References
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of TypeScript-script
		/// </summary>
		/// <param name="url">URL of script file</param>
		public TypeScriptScript(string url) : this(url, string.Empty)
		{ }

		/// <summary>
		/// Constructs instance of TypeScript-script
		/// </summary>
		/// <param name="url">URL of script file</param>
		/// <param name="content">Text content of script</param>
		public TypeScriptScript(string url, string content)
			: this(url, content, new List<string>())
		{ }

		/// <summary>
		/// Constructs instance of TypeScript-script
		/// </summary>
		/// <param name="url">URL of script file</param>
		/// <param name="content">Text content of script</param>
		/// <param name="references">List of references</param>
		public TypeScriptScript(string url, string content, List<string> references)
		{
			Url = url;
			Content = content;
			References = references;
		}
	}
}