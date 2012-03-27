namespace BundleTransformer.Core.FileSystem
{
	using System;

	/// <summary>
	/// Information about web application
	/// </summary>
	public sealed class HttpApplicationInfo
	{
		/// <summary>
		/// URL of web application root
		/// </summary>
		public string RootUrl { get; set; }

		/// <summary>
		/// Path to directory in which is located web application
		/// </summary>
		public string RootPath { get; set; }


		/// <summary>
		/// Constructs instance of HttpApplicationInfo
		/// </summary>
		public HttpApplicationInfo() : this(String.Empty, String.Empty)
		{ }

		/// <summary>
		/// Constructs instance of HttpApplicationInfo
		/// </summary>
		/// <param name="rootUrl">URL of web application root</param>
		/// <param name="rootPath">Path to directory in which is located web application</param>
		public HttpApplicationInfo(string rootUrl, string rootPath)
		{
			RootUrl = rootUrl;
			RootPath = rootPath;
		}
	}
}
