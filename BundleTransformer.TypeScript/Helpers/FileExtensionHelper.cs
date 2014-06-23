namespace BundleTransformer.TypeScript.Helpers
{
	using System;

	/// <summary>
	/// File extension helpers
	/// </summary>
	public static class FileExtensionHelpers
	{
		/// <summary>
		/// Checks whether specified file extension is the TypeScript-file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsTypeScript(string fileExtension)
		{
			bool result = string.Equals(fileExtension, Constants.FileExtension.TypeScript, StringComparison.OrdinalIgnoreCase);

			return result;
		}
	}
}