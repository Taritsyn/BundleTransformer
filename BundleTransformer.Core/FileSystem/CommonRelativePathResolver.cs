namespace BundleTransformer.Core.FileSystem
{
	using System;
	using System.IO;

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
		/// Transforms relative path to absolute
		/// </summary>
		/// <param name="basePath">The base path</param>
		/// <param name="relativePath">The relative path</param>
		public string ResolveRelativePath(string basePath, string relativePath)
		{
			if (string.IsNullOrWhiteSpace(basePath))
			{
				throw new ArgumentException(string.Format(Strings.Common_ArgumentIsEmpty, "basePath"), "basePath");
			}

			if (string.IsNullOrWhiteSpace(relativePath))
			{
				throw new ArgumentException(string.Format(Strings.Common_ArgumentIsEmpty, "relativePath"), "relativePath");
			}

			string processedRelativePath = UrlHelpers.ProcessBackSlashes(relativePath);

			if (processedRelativePath.StartsWith("/") || UrlHelpers.StartsWithProtocol(processedRelativePath))
			{
				return processedRelativePath;
			}

			if (processedRelativePath.StartsWith("~/"))
			{
				return _virtualFileSystemWrapper.ToAbsolutePath(processedRelativePath);
			}

			string processedBasePath = UrlHelpers.ProcessBackSlashes(Path.GetDirectoryName(basePath));

			string absolutePath = UrlHelpers.Combine(processedBasePath, processedRelativePath);
			if (absolutePath.IndexOf("./", StringComparison.Ordinal) != -1)
			{
				absolutePath = UrlHelpers.Normalize(absolutePath);
			}
			absolutePath = _virtualFileSystemWrapper.ToAbsolutePath(absolutePath);

			return absolutePath;
		}
	}
}