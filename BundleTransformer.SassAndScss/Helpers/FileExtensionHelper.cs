namespace BundleTransformer.SassAndScss.Helpers
{
	using System;

	/// <summary>
	/// File extension helpers
	/// </summary>
	public static class FileExtensionHelpers
	{
		/// <summary>
		/// Checks whether specified file extension is the Sass-file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsSass(string fileExtension)
		{
			bool result = string.Equals(fileExtension, Constants.FileExtension.Sass, StringComparison.OrdinalIgnoreCase);

			return result;
		}

		/// <summary>
		/// Checks whether specified file extension is the SCSS-file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsScss(string fileExtension)
		{
			bool result = string.Equals(fileExtension, Constants.FileExtension.Scss, StringComparison.OrdinalIgnoreCase);

			return result;
		}

		/// <summary>
		/// Checks whether specified file extension is the Sass- or SCSS-file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsSassOrScss(string fileExtension)
		{
			bool result = (IsSass(fileExtension) || IsScss(fileExtension));

			return result;
		}

		/// <summary>
		/// Checks whether specified file extension is the Ruby-file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsRuby(string fileExtension)
		{
			bool result = string.Equals(fileExtension, Constants.FileExtension.Ruby, StringComparison.OrdinalIgnoreCase);

			return result;
		}
	}
}