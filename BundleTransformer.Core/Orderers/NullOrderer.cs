namespace BundleTransformer.Core.Orderers
{
	using System.Collections.Generic;
	using System.IO;
	using System.Web.Optimization;

	/// <summary>
	/// Orderer that responsible for sorting of the files in declarative order
	/// </summary>
	public sealed class NullOrderer : IBundleOrderer
	{
		/// <summary>
		/// Sort files in declarative order
		/// </summary>
		/// <param name="context">Object BundleContext</param>
		/// <param name="files">List of files</param>
		/// <returns>Sorted list of files</returns>
		public IEnumerable<FileInfo> OrderFiles(BundleContext context, IEnumerable<FileInfo> files)
		{
			return files;
		}
	}
}
