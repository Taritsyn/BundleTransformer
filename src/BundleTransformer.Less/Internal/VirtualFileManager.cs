using System;

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
		/// Determines whether the beginning of specified path matches the '~/'
		/// </summary>
		/// <param name="path">The path</param>
		/// <returns>true if path starts with the '~/'; otherwise, false</returns>
		private static bool IsAppRelativePath(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException(
					nameof(path),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(path))
				);
			}

			bool result = path.Length >= 2 && path[0] == '~' && (path[1] == '/' || path[1] == '\\');

			return result;
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
				throw new ArgumentNullException(
					nameof(path),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(path))
				);
			}

			if (!IsAppRelativePath(path))
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
				throw new ArgumentNullException(
					nameof(path),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(path))
				);
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
				throw new ArgumentNullException(
					nameof(path),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(path))
				);
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
				throw new ArgumentNullException(
					nameof(path),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(path))
				);
			}

			byte[] bytes = _virtualFileSystemWrapper.GetFileBinaryContent(path);

			return bytes;
		}
	}
}