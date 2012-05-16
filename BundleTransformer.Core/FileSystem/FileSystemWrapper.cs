namespace BundleTransformer.Core.FileSystem
{
	using System.IO;

	/// <summary>
	/// File system wrapper
	/// </summary>
	public sealed class FileSystemWrapper : IFileSystemWrapper
	{
		/// <summary>
		/// Determines whether the given path refers to an existing directory on disk
		/// </summary>
		/// <param name="path">The directory path</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		public bool DirectoryExists(string path)
		{
			return Directory.Exists(path);
		}

		/// <summary>
		/// Creates all directories and subdirectories in the specified path
		/// </summary>
		/// <param name="path">The directory path to create</param>
		public void CreateDirectory(string path)
		{
			Directory.CreateDirectory(path);
		}

		/// <summary>
		/// Determines whether the specified file exists
		/// </summary>
		/// <param name="path">The file path</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		public bool FileExists(string path)
		{
			return File.Exists(path);
		}

		/// <summary>
		/// Gets text content of the specified file
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Text content</returns>
		public string GetFileTextContent(string path)
		{
			string content;

			using (var file = new StreamReader(path))
			{
				content = file.ReadToEnd();
			}

			return content;
		}

		/// <summary>
		/// Write text content to the specified file
		/// </summary>
		/// <param name="path">File path</param>
		/// <param name="content">Text content</param>
		public void WriteTextContentToFile(string path, string content)
		{
			using (var file = new StreamWriter(path))
			{
				file.Write(content);
			}
		}

		/// <summary>
		/// Deletes the specified file
		/// </summary>
		/// <param name="path">File path</param>
		public void DeleteFile(string path)
		{
			File.Delete(path);
		}
	}
}
