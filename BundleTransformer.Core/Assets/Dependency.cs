namespace BundleTransformer.Core.Assets
{
	/// <summary>
	/// Asset dependency
	/// </summary>
	public sealed class Dependency
	{
		/// <summary>
		/// Gets or sets virtual path to dependency file
		/// </summary>
		public string VirtualPath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets URL of dependency file
		/// </summary>
		public string Url
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets text content of dependency file 
		/// </summary>
		public string Content
		{
			get;
			set;
		}
	}
}
