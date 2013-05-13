namespace BundleTransformer.Less
{
	using System.IO;
	using System.Web.Hosting;

	using dotless.Core.Input;

	internal sealed class VirtualFileReader : IFileReader
	{
		public bool DoesFileExist(string fileName)
		{
			var virtualPathProvider = HostingEnvironment.VirtualPathProvider;

			return virtualPathProvider.FileExists(fileName);
		}

		public string GetFileContents(string fileName)
		{
			var virtualPathProvider = HostingEnvironment.VirtualPathProvider;
			var virtualFile = virtualPathProvider.GetFile(fileName);

			using (var streamReader = new StreamReader(virtualFile.Open()))
			{
				return streamReader.ReadToEnd();
			}
		}

		public byte[] GetBinaryFileContents(string fileName)
		{
			var virtualPathProvider = HostingEnvironment.VirtualPathProvider;
			var virtualFile = virtualPathProvider.GetFile(fileName);

			using (var stream = virtualFile.Open())
			{
				var buffer = new byte[stream.Length];
				stream.Read(buffer, 0, (int)stream.Length);

				return buffer;
			}
		}
	}
}