namespace BundleTransformer.Less.Helpers
{
	using System;

	/// <summary>
	/// File extension helpers
	/// </summary>
	public static class FileExtensionHelpers
	{
		/// <summary>
		/// Checks whether specified file extension is the LESS-file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsLess(string fileExtension)
		{
			bool result = string.Equals(fileExtension, Constants.FileExtension.Less, StringComparison.OrdinalIgnoreCase);

			return result;
		}
	}
}