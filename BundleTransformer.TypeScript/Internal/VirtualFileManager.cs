namespace BundleTransformer.TypeScript.Internal
{
	using System;
	using System.Collections.Generic;

	using Core.FileSystem;
	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Helpers;

	/// <summary>
	/// Virtual file manager
	/// </summary>
	public sealed class VirtualFileManager
	{
		/// <summary>
		/// Name of file, which contains a default <code>lib.d.ts</code> with global declarations
		/// </summary>
		private const string DEFAULT_LIBRARY_FILE_NAME = "lib.d.ts";

		/// <summary>
		/// Name of file, which contains a default <code>lib.es6.d.ts</code> with global declarations
		/// </summary>
		private const string DEFAULT_LIBRARY_ES6_FILE_NAME = "lib.es6.d.ts";

		/// <summary>
		/// List of default library file names
		/// </summary>
		private static readonly HashSet<string> _defaultLibraryFileNames = new HashSet<string>
		{
			DEFAULT_LIBRARY_FILE_NAME,
			DEFAULT_LIBRARY_ES6_FILE_NAME
		};

		/// <summary>
		/// Content of <code>lib.d.ts</code> file
		/// </summary>
		private static readonly Lazy<string> _defaultLibraryContent =
			new Lazy<string>(() => GetDefaultLibraryContent(DEFAULT_LIBRARY_FILE_NAME));

		/// <summary>
		/// Content of <code>lib.es6.d.ts</code> file
		/// </summary>
		private static readonly Lazy<string> _defaultLibraryEs6Content =
			new Lazy<string>(() => GetDefaultLibraryContent(DEFAULT_LIBRARY_ES6_FILE_NAME));

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
		/// Gets a content of default library
		/// </summary>
		/// <param name="fileName">Default library file name</param>
		/// <returns>Content of default library</returns>
		private static string GetDefaultLibraryContent(string fileName)
		{
			string content = Utils.GetResourceAsString(
				TypeScriptResourceHelpers.GetResourceName(fileName),
				typeof(VirtualFileManager).Assembly
			);

			return content;
		}

		/// <summary>
		/// Determines whether the specified default library exists
		/// </summary>
		/// <param name="path">The default library to check</param>
		/// <returns>true - library exists; false - library does not exist</returns>
		private static bool DefaultLibraryExists(string path)
		{
			bool result = _defaultLibraryFileNames.Contains(path);

			return result;
		}

		/// <summary>
		/// Reads a content from default library
		/// </summary>
		/// <param name="path">Default library file name</param>
		/// <returns>Content of default library</returns>
		private static string ReadDefaultLibrary(string path)
		{
			string content;

			switch (path)
			{
				case DEFAULT_LIBRARY_FILE_NAME:
					content = _defaultLibraryContent.Value;
					break;
				case DEFAULT_LIBRARY_ES6_FILE_NAME:
					content = _defaultLibraryEs6Content.Value;
					break;
				default:
					content = string.Empty;
					break;
			}

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