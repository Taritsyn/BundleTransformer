namespace BundleTransformer.SassAndScss
{
	using System;

	using Constants;

	/// <summary>
	/// File extension helper
	/// </summary>
	internal static class FileExtensionHelper
	{
		/// <summary>
		/// Checks whether specified file extension is the Sass file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsSass(string fileExtension)
		{
			bool isSass = string.Equals(fileExtension, FileExtension.Sass, StringComparison.OrdinalIgnoreCase);

			return isSass;
		}

		/// <summary>
		/// Checks whether specified file extension is the SCSS file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsScss(string fileExtension)
		{
			bool isScss = string.Equals(fileExtension, FileExtension.Scss, StringComparison.OrdinalIgnoreCase);

			return isScss;
		}

		/// <summary>
		/// Checks whether specified file extension is the Ruby file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsRuby(string fileExtension)
		{
			bool isRuby = string.Equals(fileExtension, FileExtension.Ruby, StringComparison.OrdinalIgnoreCase);

			return isRuby;
		}
	}
}