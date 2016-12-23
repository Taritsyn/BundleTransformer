namespace BundleTransformer.TypeScript.Internal
{
	using System;
	using System.Collections.Generic;
	using System.Reflection;

	using Core.FileSystem;
	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// Virtual file manager
	/// </summary>
	public sealed class VirtualFileManager
	{
		/// <summary>
		/// Name of directory, which contains a TypeScript default libraries
		/// </summary>
		private const string TYPESCRIPT_DEFAULT_LIBRARIES_DIRECTORY_NAME = "DefaultLibraries";

		/// <summary>
		/// Cache of default libraries
		/// </summary>
		private static readonly Dictionary<string, string> _defaultLibraryCache;

		/// <summary>
		/// Synchronizer of default library cache
		/// </summary>
		private static readonly object _defaultLibraryCacheSynchronizer = new object();

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;


		/// <summary>
		/// Static constructor
		/// </summary>
		static VirtualFileManager()
		{
			string[] allResourceNames = Assembly.GetExecutingAssembly().GetManifestResourceNames();
			string defaultLibraryResourcePrefix = ResourceHelpers.ResourcesNamespace + "." +
				TYPESCRIPT_DEFAULT_LIBRARIES_DIRECTORY_NAME + ".";
			int defaultLibraryResourcePrefixLength = defaultLibraryResourcePrefix.Length;
			var defaultLibraryCache = new Dictionary<string, string>();

			foreach (string resourceName in allResourceNames)
			{
				if (resourceName.StartsWith(defaultLibraryResourcePrefix, StringComparison.Ordinal))
				{
					string defaultLibraryFileName = resourceName.Substring(defaultLibraryResourcePrefixLength);
					defaultLibraryCache.Add(defaultLibraryFileName, null);
				}
			}

			_defaultLibraryCache = defaultLibraryCache;
		}

		/// <summary>
		/// Constructs a instance of virtual file manager
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public VirtualFileManager(IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
		}


		/// <summary>
		/// Gets a content of default library
		/// </summary>
		/// <param name="fileName">Default library file name</param>
		/// <returns>Content of default library</returns>
		private static string GetDefaultLibraryContent(string fileName)
		{
			string resourceName = ResourceHelpers.GetResourceName(
				TYPESCRIPT_DEFAULT_LIBRARIES_DIRECTORY_NAME + "." + fileName);
			string content = Utils.GetResourceAsString(resourceName, typeof(VirtualFileManager).Assembly);

			return content;
		}

		/// <summary>
		/// Determines whether the specified default library exists
		/// </summary>
		/// <param name="path">The default library to check</param>
		/// <returns>true - library exists; false - library does not exist</returns>
		private static bool DefaultLibraryExists(string path)
		{
			bool result = _defaultLibraryCache.ContainsKey(path);

			return result;
		}

		/// <summary>
		/// Reads a content from default library
		/// </summary>
		/// <param name="path">Default library file name</param>
		/// <returns>Content of default library</returns>
		private static string ReadDefaultLibrary(string path)
		{
			if (_defaultLibraryCache[path] == null)
			{
				lock (_defaultLibraryCacheSynchronizer)
				{
					if (_defaultLibraryCache[path] == null)
					{
						_defaultLibraryCache[path] = GetDefaultLibraryContent(path);
					}
				}
			}

			string content = _defaultLibraryCache[path];

			return content;
		}

		/// <summary>
		/// Gets a current working directory of the application
		/// </summary>
		/// <returns>The string containing the path of the current working directory</returns>
		public string GetCurrentDirectory()
		{
			string currentDirectoryName = _virtualFileSystemWrapper.ToAbsolutePath("~/");

			return currentDirectoryName;
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

			if (DefaultLibraryExists(path))
			{
				return true;
			}

			bool result = _virtualFileSystemWrapper.FileExists(path);

			return result;
		}

		/// <summary>
		/// Opens a file, reads all lines of the file, and then closes the file
		/// </summary>
		/// <param name="path">The file to open for reading</param>
		/// <returns>The string containing all lines of the file</returns>
		public string ReadFile(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException("path",
					string.Format(CoreStrings.Common_ArgumentIsNull, "path"));
			}

			if (DefaultLibraryExists(path))
			{
				return ReadDefaultLibrary(path);
			}

			string content = _virtualFileSystemWrapper.GetFileTextContent(path);

			return content;
		}
	}
}