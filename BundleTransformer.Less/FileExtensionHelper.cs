namespace BundleTransformer.Less
{
	using System;

	using Constants;

	/// <summary>
	/// File extension helper
	/// </summary>
	internal static class FileExtensionHelper
	{
		/// <summary>
		/// Checks whether specified file extension is the CSS file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsCss(string fileExtension)
		{
			bool isCss = string.Equals(fileExtension, FileExtension.Css, StringComparison.OrdinalIgnoreCase);

			return isCss;
		}

		/// <summary>
		/// Checks whether specified file extension is the LESS file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsLess(string fileExtension)
		{
			bool isLess = string.Equals(fileExtension, FileExtension.Less, StringComparison.OrdinalIgnoreCase);

			return isLess;
		}
	}
}