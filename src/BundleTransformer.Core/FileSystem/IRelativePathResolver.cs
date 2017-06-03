namespace BundleTransformer.Core.FileSystem
{
	/// <summary>
	/// Defines interface of relative path resolver
	/// </summary>
	public interface IRelativePathResolver
	{
		/// <summary>
		/// Transforms relative path to absolute
		/// </summary>
		/// <param name="basePath">The base path</param>
		/// <param name="relativePath">The relative path</param>
		string ResolveRelativePath(string basePath, string relativePath);
	}
}