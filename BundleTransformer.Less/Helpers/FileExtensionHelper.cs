namespace BundleTransformer.Less.Helpers
{
	using System;

	using Constants;

	/// <summary>
	/// File extension helpers
	/// </summary>
	internal static class FileExtensionHelpers
	{
		/// <summary>
		/// Checks whether specified file extension is the CSS file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsCss(string fileExtension)
		{
			bool result = string.Equals(fileExtension, FileExtension.Css, StringComparison.OrdinalIgnoreCase);

			return result;
		}

		/// <summary>
		/// Checks whether specified file extension is the LESS file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsLess(string fileExtension)
		{
			bool result = string.Equals(fileExtension, FileExtension.Less, StringComparison.OrdinalIgnoreCase);

			return result;
		}
	}
}