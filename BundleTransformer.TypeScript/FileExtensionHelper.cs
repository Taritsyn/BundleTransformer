namespace BundleTransformer.TypeScript
{
	using System;

	using Constants;

	/// <summary>
	/// File extension helper
	/// </summary>
	internal static class FileExtensionHelper
	{
		/// <summary>
		/// Checks whether specified file extension is the JavaScript file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsJavaScript(string fileExtension)
		{
			bool isJavaScript = string.Equals(fileExtension, FileExtension.JavaScript, StringComparison.OrdinalIgnoreCase);

			return isJavaScript;
		}

		/// <summary>
		/// Checks whether specified file extension is the TypeScript file extension 
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check</returns>
		public static bool IsTypeScript(string fileExtension)
		{
			bool isTypeScript = string.Equals(fileExtension, FileExtension.TypeScript, StringComparison.OrdinalIgnoreCase);

			return isTypeScript;
		}
	}
}