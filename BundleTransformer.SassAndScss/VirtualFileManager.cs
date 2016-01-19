namespace BundleTransformer.SassAndScss
{
	using System;

	using LibSassHost;

	using Core.FileSystem;
	using Core.Helpers;
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
		/// Default working directory of the application
		/// </summary>
		private readonly string _defaultDirectoryName;

		/// <summary>
		/// Current working directory of the application
		/// </summary>
		private string _currentDirectoryName;

		/// <summary>
		/// Gets or sets a current working directory of the application
		/// </summary>
		public string CurrentDirectoryName
		{
			get
			{
				return _currentDirectoryName;
			}
			set
			{
				string сurrentDirectoryName = value;
				if (!string.IsNullOrWhiteSpace(сurrentDirectoryName))
				{
					сurrentDirectoryName = UrlHelpers.ProcessBackSlashes(сurrentDirectoryName);
					if (!сurrentDirectoryName.EndsWith("/"))
					{
						сurrentDirectoryName += "/";
					}
				}

				_currentDirectoryName = сurrentDirectoryName;
			}
		}


		/// <summary>
		/// Constructs a instance of virtual file manager
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public VirtualFileManager(IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_defaultDirectoryName = GetDefaultDirectory();
			_currentDirectoryName = null;
		}


		/// <summary>
		/// Gets a default working directory of the application
		/// </summary>
		/// <returns>The string containing the path of the default working directory</returns>
		private string GetDefaultDirectory()
		{
			string defaultDirectoryName = _virtualFileSystemWrapper.ToAbsolutePath("~/");

			return defaultDirectoryName;
		}

		#region IFileManager implementation

		public string GetCurrentDirectory()
		{
			string currentDirectoryName = !string.IsNullOrWhiteSpace(_currentDirectoryName) ?
				_currentDirectoryName : _defaultDirectoryName;

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

			bool result = path.StartsWith(_currentDirectoryName, StringComparison.OrdinalIgnoreCase);

			return result;
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