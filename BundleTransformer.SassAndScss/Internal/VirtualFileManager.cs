namespace BundleTransformer.SassAndScss.Internal
{
	using System;
	using System.Text.RegularExpressions;

	using LibSassHost;

	using Core.FileSystem;
	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// Virtual file manager
	/// </summary>
	internal sealed class VirtualFileManager : IFileManager
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


		#region IFileManager implementation

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

			bool result = path.StartsWith("/");

			return result;
		}

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