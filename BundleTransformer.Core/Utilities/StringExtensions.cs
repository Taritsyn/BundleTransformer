namespace BundleTransformer.Core.Utilities
{
	/// <summary>
	/// Extensions for String
	/// </summary>
	public static class StringExtensions
	{
		/// <summary>
		/// Replaces a tabs by specified number of spaces
		/// </summary>
		/// <param name="source">String value</param>
		/// <param name="tabSize">Number of spaces in tab</param>
		/// <returns>Processed string value</returns>
		public static string TabsToSpaces(this string source, int tabSize)
		{
			string result = source.Replace("\t", "".PadRight(tabSize));

			return result;
		}
	}
}