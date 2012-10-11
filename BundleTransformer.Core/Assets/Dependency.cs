namespace BundleTransformer.Core.Assets
{
	/// <summary>
	/// Asset dependency
	/// </summary>
	public sealed class Dependency
	{
		/// <summary>
		/// Gets or sets path to dependency file
		/// </summary>
		public string Path
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
