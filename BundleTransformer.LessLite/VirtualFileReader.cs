namespace BundleTransformer.LessLite
{
	using dotless.Core.Input;

	using Core;
	using Core.FileSystem;

	internal sealed class VirtualFileReader : IFileReader
	{
		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;


		/// <summary>
		/// Constructs instance of virtual file reader
		/// </summary>
		public VirtualFileReader()
			: this(BundleTransformerContext.Current.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs instance of virtual file reader
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public VirtualFileReader(IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
		}


		/// <summary>
		/// Gets a value that indicates whether a file exists in the virtual file system
		/// </summary>
		/// <param name="virtualPath">The path to the virtual file</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		public bool DoesFileExist(string virtualPath)
		{
			return _virtualFileSystemWrapper.FileExists(virtualPath);
		}

		/// <summary>
		/// Gets text content of the specified file
		/// </summary>
		/// <param name="virtualPath">The path to the virtual file</param>
		/// <returns>Text content</returns>
		public string GetFileContents(string virtualPath)
		{
			return _virtualFileSystemWrapper.GetFileTextContent(virtualPath);
		}

		/// <summary>
		/// Gets binary content of the specified file
		/// </summary>
		/// <param name="virtualPath">The path to the virtual file</param>
		/// <returns>Binary content</returns>
		public byte[] GetBinaryFileContents(string virtualPath)
		{
			return _virtualFileSystemWrapper.GetFileBinaryContent(virtualPath);
		}
	}
}