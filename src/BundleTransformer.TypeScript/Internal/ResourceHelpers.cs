namespace BundleTransformer.TypeScript.Internal
{
	/// <summary>
	/// TypeScript resource helpers
	/// </summary>
	internal static class ResourceHelpers
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.TypeScript.Resources";

		/// <summary>
		/// Gets a namespace for resources
		/// </summary>
		public static string ResourcesNamespace
		{
			get { return RESOURCES_NAMESPACE; }
		}


		/// <summary>
		/// Gets a resource name
		/// </summary>
		/// <param name="fileName">File name</param>
		/// <returns>Resource name</returns>
		public static string GetResourceName(string fileName)
		{
			string resourceName = RESOURCES_NAMESPACE + "." + fileName;

			return resourceName;
		}
	}
}