namespace BundleTransformer.Core.FileSystem
{
	using System;

	/// <summary>
	/// Defines interface of file system wrapper
	/// </summary>
	public interface IFileSystemWrapper
	{
		/// <summary>
		/// Determines whether the given path refers to an existing directory on disk
		/// </summary>
		/// <param name="path">Directory path</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		bool DirectoryExists(string path);

		/// <summary>
		/// Creates all directories and subdirectories in the specified path
		/// </summary>
		/// <param name="path">Directory path to create</param>
		void CreateDirectory(string path);

		/// <summary>
		/// Determines whether the specified file exists
		/// </summary>
		/// <param name="path">File path</param>
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
		/// Gets the date and time the specified file was last written to
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Date and time the specified file was last written to</returns>
		DateTime GetFileLastWriteTime(string path);

		/// <summary>
		/// Gets the date and time, in coordinated universal time (UTC), that the specified file was last written to
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Date and time, in coordinated universal time (UTC), that the specified file was last written to</returns>
		DateTime GetFileLastWriteTimeUtc(string path);

		/// <summary>
		/// Deletes the specified file
		/// </summary>
		/// <param name="path">File path</param>
		void DeleteFile(string path);
	}
}
