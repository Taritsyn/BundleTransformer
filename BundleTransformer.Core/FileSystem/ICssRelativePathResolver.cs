namespace BundleTransformer.Core.FileSystem
{
	/// <summary>
	/// Defines interface of CSS relative path resolver
	/// </summary>
	public interface ICssRelativePathResolver : IRelativePathResolver
	{
		/// <summary>
		/// Transforms all relative paths to absolute in CSS-code
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="path">CSS-file path</param>
		/// <returns>Processed text content of CSS-asset</returns>
		string ResolveAllRelativePaths(string content, string path);
	}
}