namespace BundleTransformer.Core.FileSystem
{
	using System;
	using System.IO;
	using System.Web.Caching;
	using System.Web.Hosting;
	using System.Web.Optimization;

	using Resources;

	/// <summary>
	/// Virtual file system wrapper
	/// </summary>
	public sealed class VirtualFileSystemWrapper : IVirtualFileSystemWrapper
	{
		/// <summary>
		/// Gets a value that indicates whether a file exists in the virtual file system
		/// </summary>
		/// <param name="virtualPath">The path to the virtual file</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		public bool FileExists(string virtualPath)
		{
			return BundleTable.VirtualPathProvider.FileExists(virtualPath);
		}

		/// <summary>
		/// Gets text content of the specified file
		/// </summary>
		/// <param name="virtualPath">The path to the virtual file</param>
		/// <returns>Text content</returns>
		public string GetFileTextContent(string virtualPath)
		{
			string content;

			try
			{
				VirtualFile virtualFile = BundleTable.VirtualPathProvider.GetFile(virtualPath);

				using (var streamReader = new StreamReader(virtualFile.Open()))
				{
					content = streamReader.ReadToEnd();
				}
			}
			catch (FileNotFoundException e)
			{
				throw new FileNotFoundException(
					string.Format(Strings.Common_FileNotExist, virtualPath), virtualPath, e);
			}

			return content;
		}

		/// <summary>
		/// Gets binary content of the specified file
		/// </summary>
		/// <param name="virtualPath">The path to the virtual file</param>
		/// <returns>Binary content</returns>
		public byte[] GetFileBinaryContent(string virtualPath)
		{
			byte[] bytes;

			try
			{
				VirtualFile virtualFile = BundleTable.VirtualPathProvider.GetFile(virtualPath);

				using (var stream = virtualFile.Open())
				{
					bytes = new byte[stream.Length];
					stream.Read(bytes, 0, (int) stream.Length);
				}
			}
			catch (FileNotFoundException e)
			{
				throw new FileNotFoundException(
					string.Format(Strings.Common_FileNotExist, virtualPath), virtualPath, e);	
			}

			return bytes;
		}

		/// <summary>
		/// Gets file stream
		/// </summary>
		/// <param name="virtualPath">The path to the virtual file</param>
		/// <returns>File stream</returns>
		public Stream GetFileStream(string virtualPath)
		{
			Stream stream;

			try
			{
				VirtualFile virtualFile = BundleTable.VirtualPathProvider.GetFile(virtualPath);
				stream = virtualFile.Open();
			}
			catch (FileNotFoundException e)
			{
				throw new FileNotFoundException(
					string.Format(Strings.Common_FileNotExist, virtualPath), virtualPath, e);	
			}

			return stream;
		}

		/// <summary>
		/// Converts a virtual path to an application absolute path
		/// </summary>
		/// <param name="virtualPath">The virtual path to convert to an application-relative path</param>
		/// <returns>The absolute path representation of the specified virtual path</returns>
		public string ToAbsolutePath(string virtualPath)
		{
			VirtualFile virtualFile = BundleTable.VirtualPathProvider.GetFile(virtualPath);

			return virtualFile.VirtualPath;
		}

		/// <summary>
		/// Creates a cache dependency based on the specified virtual paths
		/// </summary>
		/// <param name="virtualPath">The path to the primary virtual resource</param>
		/// <param name="virtualPathDependencies">An array of paths to other resources required by the primary virtual resource</param>
		/// <param name="utcStart">The UTC time at which the virtual resources were read</param>
		/// <returns>A System.Web.Caching.CacheDependency object for the specified virtual resources</returns>
		public CacheDependency GetCacheDependency(string virtualPath, string[] virtualPathDependencies, 
			DateTime utcStart)
		{
			return BundleTable.VirtualPathProvider.GetCacheDependency(virtualPath, virtualPathDependencies, 
				utcStart);
		}
	}
}