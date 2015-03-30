namespace BundleTransformer.Core.Helpers
{
	using System;

	/// <summary>
	/// File extension helpers
	/// </summary>
	public static class FileExtensionHelpers
	{
		/// <summary>
		/// Checks a whether specified file extension is the CSS-file extension
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsCss(string fileExtension)
		{
			bool result = string.Equals(fileExtension, Constants.FileExtension.Css, StringComparison.OrdinalIgnoreCase);

			return result;
		}

		/// <summary>
		/// Checks a whether specified file extension is the JS-file extension
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsJavaScript(string fileExtension)
		{
			bool result = string.Equals(fileExtension, Constants.FileExtension.JavaScript, StringComparison.OrdinalIgnoreCase);

			return result;
		}
	}
}