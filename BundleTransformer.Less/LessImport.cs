namespace BundleTransformer.Less
{
	/// <summary>
	/// LESS-import
	/// </summary>
	public sealed class LessImport
	{
		/// <summary>
		/// Gets a URL of imported stylesheet file
		/// </summary>
		public string Url
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a type of import
		/// </summary>
		public string ImportType
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of LESS-import
		/// </summary>
		public LessImport() : this(string.Empty)
		{ }

		/// <summary>
		/// Constructs instance of LESS-import
		/// </summary>
		/// <param name="url">URL of imported stylesheet file</param>
		public LessImport(string url) : this(url, string.Empty)
		{ }

		/// <summary>
		/// Constructs instance of LESS-import
		/// </summary>
		/// <param name="url">URL of imported stylesheet file</param>
		/// <param name="importType">Type of import</param>
		public LessImport(string url, string importType)
		{
			Url = url;
			ImportType = importType;
		}
	}
}