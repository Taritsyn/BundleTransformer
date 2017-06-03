namespace BundleTransformer.Core.FileSystem
{
	using System;

	using Core;
	using Helpers;
	using Resources;

	/// <summary>
	/// Common relative path resolver
	/// </summary>
	public class CommonRelativePathResolver : IRelativePathResolver
	{
		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;


		/// <summary>
		/// Constructs a instance of common relative path resolver
		/// </summary>
		public CommonRelativePathResolver()
			: this(BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs a instance of common relative path resolver
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public CommonRelativePathResolver(IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
		}


		/// <summary>
		/// Transforms a relative path to absolute
		/// </summary>
		/// <param name="basePath">The base path</param>
		/// <param name="relativePath">The relative path</param>
		public string ResolveRelativePath(string basePath, string relativePath)
		{
			if (basePath == null)
			{
				throw new ArgumentNullException("basePath",
					string.Format(Strings.Common_ArgumentIsNull, "basePath"));
			}

			if (relativePath == null)
			{
				throw new ArgumentNullException("relativePath",
					string.Format(Strings.Common_ArgumentIsNull, "relativePath"));
			}

			// Convert backslashes to forward slashes
			string processedBasePath = UrlHelpers.ProcessBackSlashes(basePath);
			string processedRelativePath = UrlHelpers.ProcessBackSlashes(relativePath);

			// Trying to convert paths to absolute paths
			string absoluteRelativePath;
			if (TryConvertToAbsolutePath(processedRelativePath, out absoluteRelativePath))
			{
				return UrlHelpers.Normalize(absoluteRelativePath);
			}

			string absoluteBasePath;
			if (TryConvertToAbsolutePath(processedBasePath, out absoluteBasePath))
			{
				processedBasePath = absoluteBasePath;
			}

			if (string.IsNullOrWhiteSpace(processedBasePath))
			{
				return UrlHelpers.Normalize(processedRelativePath);
			}

			if (string.IsNullOrWhiteSpace(processedRelativePath))
			{
				return UrlHelpers.Normalize(processedBasePath);
			}

			string baseDirectoryName = UrlHelpers.GetDirectoryName(processedBasePath);
			string absolutePath = UrlHelpers.Combine(baseDirectoryName, processedRelativePath);

			return absolutePath;
		}

		/// <summary>
		/// Converts a relative path to an absolute path.
		/// A return value indicates whether the conversion succeeded.
		/// </summary>
		/// <param name="relativePath">The relative path</param>
		/// <param name="absolutePath">The absolute path</param>
		/// <returns>true if path was converted successfully; otherwise, false</returns>
		private bool TryConvertToAbsolutePath(string relativePath, out string absolutePath)
		{
			absolutePath = null;

			if (relativePath.StartsWith("/") || UrlHelpers.StartsWithProtocol(relativePath))
			{
				absolutePath = relativePath;
				return true;
			}

			if (relativePath.StartsWith("~/"))
			{
				absolutePath = _virtualFileSystemWrapper.ToAbsolutePath(relativePath);
				return true;
			}

			return false;
		}
	}
}