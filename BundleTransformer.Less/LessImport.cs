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
		/// Gets a import options
		/// </summary>
		public LessImportOptions ImportOptions
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of LESS-import
		/// </summary>
		/// <param name="url">URL of imported stylesheet file</param>
		/// <param name="importOptions">Import options</param>
		public LessImport(string url, LessImportOptions importOptions)
		{
			Url = url;
			ImportOptions = importOptions;
		}
	}
}