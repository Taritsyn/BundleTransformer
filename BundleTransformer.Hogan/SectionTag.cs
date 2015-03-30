namespace BundleTransformer.Hogan
{
	/// <summary>
	/// Custom section tag
	/// </summary>
	public sealed class SectionTag
	{
		/// <summary>
		/// Gets or sets a name of opening tag
		/// </summary>
		public string OpeningTagName
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets or sets a name of closing tag
		/// </summary>
		public string ClosingTagName
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs a instance of custom section tag
		/// </summary>
		/// <param name="openingTagName">Name of opening tag</param>
		/// <param name="closingTagName">Name of closing tag</param>
		public SectionTag(string openingTagName, string closingTagName)
		{
			OpeningTagName = openingTagName;
			ClosingTagName = closingTagName;
		}
	}
}