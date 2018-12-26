using System;

using LibSassHost;

using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.SassAndScss.Internal
{
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
		/// Constructs an instance of virtual file manager
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
				throw new ArgumentNullException(
					nameof(path),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(path))
				);
			}

			bool result = _virtualFileSystemWrapper.FileExists(path);

			return result;
		}

		public bool IsAbsolutePath(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException(
					nameof(path),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(path))
				);
			}

			bool result = false;

			if (path.Length > 0)
			{
				int charPosition = 0;
				char charValue;

				if (path.Length >= 2)
				{
					// check if we have a protocol
					if (path.TryGetChar(charPosition, out charValue) && charValue.IsAlpha())
					{
						charPosition++;

						// skip over all alphanumeric characters
						while (path.TryGetChar(charPosition, out charValue) && charValue.IsAlphaNumeric())
						{
							charPosition++;
						}

						charPosition = charValue == ':' ? charPosition + 1 : 0;
					}
				}

				path.TryGetChar(charPosition, out charValue);
				result = charValue == '/';
			}

			return result;
		}

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