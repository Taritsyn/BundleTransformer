namespace BundleTransformer.Core.FileSystem
{
	public interface IFileSystemContext
	{
		/// <summary>
		/// Gets a instance of the virtual file system wrapper
		/// </summary>
		/// <returns>Virtual file system wrapper</returns>
		IVirtualFileSystemWrapper GetVirtualFileSystemWrapper();

		/// <summary>
		/// Gets a instance of the common relative path resolver
		/// </summary>
		/// <returns>Common relative path resolver</returns>
		IRelativePathResolver GetCommonRelativePathResolver();
	}
}