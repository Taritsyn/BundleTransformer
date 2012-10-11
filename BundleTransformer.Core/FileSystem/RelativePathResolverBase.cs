namespace BundleTransformer.Core.FileSystem
{
	/// <summary>
	/// Relative path resolver
	/// </summary>
	public abstract class RelativePathResolverBase : IRelativePathResolver
	{
		/// <summary>
		/// Transforms relative path to absolute
		/// </summary>
		/// <param name="basePath">The base path</param>
		/// <param name="relativePath">The relative path</param>
		public string ResolveRelativePath(string basePath, string relativePath)
		{
			return Utils.TransformRelativeUrlToAbsolute(basePath, relativePath);
		}
	}
}
