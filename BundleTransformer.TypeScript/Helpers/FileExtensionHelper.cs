namespace BundleTransformer.TypeScript.Helpers
{
	using System;

	using Constants;

	/// <summary>
	/// File extension helpers
	/// </summary>
	internal static class FileExtensionHelpers
	{
		/// <summary>
		/// Checks whether specified file extension is the JavaScript file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsJavaScript(string fileExtension)
		{
			bool result = string.Equals(fileExtension, FileExtension.JavaScript, StringComparison.OrdinalIgnoreCase);

			return result;
		}

		/// <summary>
		/// Checks whether specified file extension is the TypeScript file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsTypeScript(string fileExtension)
		{
			bool result = string.Equals(fileExtension, FileExtension.TypeScript, StringComparison.OrdinalIgnoreCase);

			return result;
		}
	}
}