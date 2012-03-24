namespace BundleTransformer.Core.FileSystem
{
	using System.IO;

	/// <summary>
	/// File system wrapper
	/// </summary>
	public sealed class FileSystemWrapper : IFileSystemWrapper
	{
		/// <summary>
		/// Determines whether the specified file exists
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		public bool FileExist(string path)
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
	}
}
