using System;
using System.Text.RegularExpressions;

using BundleTransformer.Core.FileSystem;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.Less.Internal
{
	/// <summary>
	/// Virtual file manager
	/// </summary>
	public sealed class VirtualFileManager
	{
		/// <summary>
		/// Regular expression for working with the application relative paths
		/// </summary>
		private static readonly Regex _appRelativePathRegex = new Regex(@"^\s*~[/\\]");

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;


		/// <summary>
		/// Constructs a instance of virtual file manager
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public VirtualFileManager(IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
		}


		/// <summary>
		/// Converts a relative path to an application absolute path
		/// </summary>
		/// <param name="path">The relative path</param>
		/// <returns>The absolute path representation of the specified relative path</returns>
		public string ToAbsolutePath(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException("path",
					string.Format(CoreStrings.Common_ArgumentIsNull, "path"));
			}

			if (!_appRelativePathRegex.IsMatch(path))
			{
				return path;
			}

			string absolutePath = _virtualFileSystemWrapper.ToAbsolutePath(path);

			return absolutePath;
		}

		/// <summary>
		/// Determines whether the specified file exists
		/// </summary>
		/// <param name="path">The file to check</param>
		/// <returns>true if the caller has the required permissions and path contains
		/// the name of an existing file; otherwise, false</returns>
		public bool FileExists(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException("path",
					string.Format(CoreStrings.Common_ArgumentIsNull, "path"));
			}

			bool result = _virtualFileSystemWrapper.FileExists(path);

			return result;
		}


		/// <summary>
		/// Opens a text file, reads all lines of the file, and then closes the file
		/// </summary>
		/// <param name="path">The file to open for reading</param>
		/// <returns>The string containing all lines of the file</returns>
		public string ReadTextFile(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException("path",
					string.Format(CoreStrings.Common_ArgumentIsNull, "path"));
			}

			string content = _virtualFileSystemWrapper.GetFileTextContent(path);

			return content;
		}

		/// <summary>
		/// Opens a binary file, reads all content of the file, and then closes the file
		/// </summary>
		/// <param name="path">The file to open for reading</param>
		/// <returns>The byte array containing all content of the file</returns>
		public byte[] ReadBinaryFile(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException("path",
					string.Format(CoreStrings.Common_ArgumentIsNull, "path"));
			}

			byte[] bytes = _virtualFileSystemWrapper.GetFileBinaryContent(path);

			return bytes;
		}
	}
}