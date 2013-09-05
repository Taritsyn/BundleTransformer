namespace BundleTransformer.Core.FileSystem
{
	using System;
	using System.IO;
	using System.Text;
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
		/// Gets a text content of the specified file
		/// </summary>
		/// <param name="virtualPath">The path to the virtual file</param>
		/// <returns>Text content</returns>
		public string GetFileTextContent(string virtualPath)
		{
			string content;
			
			try
			{
				VirtualFile virtualFile = BundleTable.VirtualPathProvider.GetFile(virtualPath);
				var stringBuilder = new StringBuilder();

				using (var streamReader = new StreamReader(virtualFile.Open()))
				{
					// Fixes a single CR/LF
					while (streamReader.Peek() >= 0)
					{
						stringBuilder.AppendLine(streamReader.ReadLine());
					}
				}

				content = stringBuilder.ToString();
			}
			catch (FileNotFoundException e)
			{
				throw new FileNotFoundException(
					string.Format(Strings.Common_FileNotExist, virtualPath), virtualPath, e);
			}

			return content;
		}

		/// <summary>
		/// Gets a binary content of the specified file
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
		/// Gets a file stream
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

		/// <summary>
		/// Detect if a file is text and detect the encoding
		/// </summary>
		/// <param name="virtualPath">The path to the virtual file</param>
		/// <param name="sampleSize">Number of characters to use for testing</param>
		/// <param name="encoding">Detected encoding</param>
		/// <returns>Result of check (true - is text; false - is binary)</returns>
		public bool IsTextFile(string virtualPath, int sampleSize, out Encoding encoding)
		{
			bool isTextContent;

			using (Stream fileStream = GetFileStream(virtualPath))
			{
				isTextContent = Utils.IsTextStream(fileStream, sampleSize, out encoding);
			}

			return isTextContent;
		}
	}
}