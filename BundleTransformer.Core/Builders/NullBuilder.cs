namespace BundleTransformer.Core.Builders
{
	using System.Collections.Generic;
	using System.IO;
	using System.Web.Optimization;

	/// <summary>
	/// Builder that responsible for prevention of early applying of 
	/// the item transformations and combining of code 
	/// </summary>
	public sealed class NullBuilder : IBundleBuilder
	{
		/// <summary>
		/// Prevents a early applying of the item transformations and combining of code 
		/// </summary>
		/// <param name="bundle">Bundle</param>
		/// <param name="context">Object BundleContext</param>
		/// <param name="files">List of files</param>
		/// <returns>Empty string</returns>
		public string BuildBundleContent(Bundle bundle, BundleContext context, IEnumerable<FileInfo> files)
		{
			return string.Empty;
		}
	}
}