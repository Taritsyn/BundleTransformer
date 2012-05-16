namespace BundleTransformer.Less
{
	using System.IO;
	using System.Web;

	using dotless.Core.Input;

	internal sealed class VirtualFileReader : IFileReader
	{
		public string GetFileContents(string fileName)
		{
			fileName = GetFullPath(fileName);

			return File.ReadAllText(fileName);
		}

		public bool DoesFileExist(string fileName)
		{
			fileName = GetFullPath(fileName);

			return File.Exists(fileName);
		}

		private static string GetFullPath(string path)
		{
			return HttpContext.Current.Server.MapPath(path);
		}
	}
}