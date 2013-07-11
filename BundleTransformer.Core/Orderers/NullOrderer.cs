namespace BundleTransformer.Core.Orderers
{
	using System.Collections.Generic;
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
		public IEnumerable<BundleFile> OrderFiles(BundleContext context, IEnumerable<BundleFile> files)
		{
			return files;
		}
	}
}
