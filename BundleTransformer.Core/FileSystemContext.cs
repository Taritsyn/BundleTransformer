namespace BundleTransformer.Core
{
	using System;

	using FileSystem;

	/// <summary>
	/// File system context
	/// </summary>
	public sealed class FileSystemContext
	{
		/// <summary>
		/// Virtual file system wrapper 
		/// </summary>
		private readonly Lazy<VirtualFileSystemWrapper> _virtualFileSystemWrapper
			= new Lazy<VirtualFileSystemWrapper>();

		/// <summary>
		/// Common relative path resolver
		/// </summary>
		private readonly Lazy<CommonRelativePathResolver> _commonRelativePathResolver
			= new Lazy<CommonRelativePathResolver>();


		/// <summary>
		/// Gets a instance of the virtual file system wrapper
		/// </summary>
		/// <returns>Virtual file system wrapper</returns>
		public VirtualFileSystemWrapper GetVirtualFileSystemWrapper()
		{
			return _virtualFileSystemWrapper.Value;
		}

		/// <summary>
		/// Gets a instance of the common relative path resolver
		/// </summary>
		/// <returns>Common relative path resolver</returns>
		public CommonRelativePathResolver GetCommonRelativePathResolver()
		{
			return _commonRelativePathResolver.Value;
		}
	}
}