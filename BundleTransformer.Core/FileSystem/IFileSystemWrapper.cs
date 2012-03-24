namespace BundleTransformer.Core.FileSystem
{
	/// <summary>
	/// Defines interface of file system wrapper
	/// </summary>
	public interface IFileSystemWrapper
	{
		/// <summary>
		/// Determines whether the specified file exists
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		bool FileExist(string path);

		/// <summary>
		/// Gets text content of the specified file
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Text content</returns>
		string GetFileTextContent(string path);
	}
}
