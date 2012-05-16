namespace BundleTransformer.Core.FileSystem
{
	/// <summary>
	/// Defines interface of file system wrapper
	/// </summary>
	public interface IFileSystemWrapper
	{
		/// <summary>
		/// Determines whether the given path refers to an existing directory on disk
		/// </summary>
		/// <param name="path">The directory path</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		bool DirectoryExists(string path);

		/// <summary>
		/// Creates all directories and subdirectories in the specified path
		/// </summary>
		/// <param name="path">The directory path to create</param>
		void CreateDirectory(string path);

		/// <summary>
		/// Determines whether the specified file exists
		/// </summary>
		/// <param name="path">The file path</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		bool FileExists(string path);

		/// <summary>
		/// Gets text content of the specified file
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Text content</returns>
		string GetFileTextContent(string path);

		/// <summary>
		/// Write text content to the specified file
		/// </summary>
		/// <param name="path">File path</param>
		/// <param name="content">Text content</param>
		void WriteTextContentToFile(string path, string content);

		/// <summary>
		/// Deletes the specified file
		/// </summary>
		/// <param name="path">File path</param>
		void DeleteFile(string path);
	}
}
