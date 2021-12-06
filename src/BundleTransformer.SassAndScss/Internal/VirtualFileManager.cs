using System;

using DartSassHost;

using BundleTransformer.Core.FileSystem;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.SassAndScss.Internal
{
	/// <summary>
	/// Virtual file manager
	/// </summary>
	public sealed class VirtualFileManager : IFileManager
	{
		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;


		/// <summary>
		/// Constructs an instance of virtual file manager
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public VirtualFileManager(IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
		}


		#region IFileManager implementation

		public bool SupportsVirtualPaths
		{
			get { return true; }
		}


		public string GetCurrentDirectory()
		{
			string currentDirectory = _virtualFileSystemWrapper.ToAbsolutePath("~/");

			return currentDirectory;
		}

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

		public bool IsAppRelativeVirtualPath(string path)
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

		public string ToAbsoluteVirtualPath(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException(
					nameof(path),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(path))
				);
			}

			string absolutePath = _virtualFileSystemWrapper.ToAbsolutePath(path);

			return absolutePath;
		}

		public string ReadFile(string path)
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

		#endregion
	}
}