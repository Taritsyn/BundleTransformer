namespace BundleTransformer.Core.Assets
{
	/// <summary>
	/// Asset dependency
	/// </summary>
	public sealed class Dependency
	{
		/// <summary>
		/// Gets a URL of dependency file
		/// </summary>
		public string Url
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets or sets text content of dependency file 
		/// </summary>
		public string Content
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag indicating what this dependency file is observable
		/// </summary>
		public bool IsObservable
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of the asset dependency
		/// </summary>
		public Dependency() : this(string.Empty)
		{ }

		/// <summary>
		/// Constructs instance of the asset dependency
		/// </summary>
		/// <param name="url">URL of dependency file</param>
		public Dependency(string url)
			: this(url, string.Empty)
		{ }

		/// <summary>
		/// Constructs instance of the asset dependency
		/// </summary>
		/// <param name="url">URL of dependency file</param>
		/// <param name="content">Text content of dependency file</param>
		public Dependency(string url, string content)
			: this(url, content, true)
		{ }

		/// <summary>
		/// Constructs instance of the asset dependency
		/// </summary>
		/// <param name="url">URL of dependency file</param>
		/// <param name="content">Text content of dependency file</param>
		/// <param name="isObservable">Flag indicating what this dependency file is observable</param>
		public Dependency(string url, string content, bool isObservable)
		{
			Url = url;
			Content = content;
			IsObservable = isObservable;
		}
	}
}