namespace BundleTransformer.SassAndScss.Internal
{
	using System;

	using LibSassHost;

	using Core.FileSystem;
	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// Virtual file manager
	/// </summary>
	internal sealed class VirtualFileManager : IFileManager
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
				throw new ArgumentNullException("path",
					string.Format(CoreStrings.Common_ArgumentIsNull, "path"));
			}

			bool result = path.Length >= 2 && path[0] == '~' && (path[1] == '/' || path[1] == '\\');

			return result;
		}

		#region IFileManager implementation

		public bool SupportsConversionToAbsolutePath
		{
			get { return true; }
		}


		public string GetCurrentDirectory()
		{
			string currentDirectoryName = _virtualFileSystemWrapper.ToAbsolutePath("~/");

			return currentDirectoryName;
		}

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

		public bool IsAbsolutePath(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException("path",
					string.Format(CoreStrings.Common_ArgumentIsNull, "path"));
			}

			bool result = path.Length > 0 && path[0] == '/';

			return result;
		}

		public string ToAbsolutePath(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException("path",
					string.Format(CoreStrings.Common_ArgumentIsNull, "path"));
			}

			if (!IsAppRelativePath(path))
			{
				return path;
			}

			string absolutePath = _virtualFileSystemWrapper.ToAbsolutePath(path);

			return absolutePath;
		}

		public string ReadFile(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException("path",
					string.Format(CoreStrings.Common_ArgumentIsNull, "path"));
			}

			string content = _virtualFileSystemWrapper.GetFileTextContent(path);

			return content;
		}

		#endregion
	}
}