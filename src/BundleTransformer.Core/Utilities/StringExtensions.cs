using System;

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
			if (source == null)
			{
				throw new ArgumentNullException("source");
			}

			string result = source.Replace("\t", "".PadRight(tabSize));

			return result;
		}

		/// <summary>
		/// Gets a character at the specified index from the string.
		/// A return value indicates whether the receiving succeeded.
		/// </summary>
		/// <param name="source">The source string</param>
		/// <param name="index">The zero-based index of the character</param>
		/// <param name="result">When this method returns, contains the character from the string,
		/// if the receiving succeeded, or null character if the receiving failed.
		/// The receiving fails if the index out of bounds.</param>
		/// <returns>true if the character was received successfully; otherwise, false</returns>
		public static bool TryGetChar(this string source, int index, out char result)
		{
			if (source == null)
			{
				throw new ArgumentNullException("source");
			}

			bool isSuccess;
			int length = source.Length;

			if (length > 0 && index >= 0 && index < length)
			{
				result = source[index];
				isSuccess = true;
			}
			else
			{
				result = '\0';
				isSuccess = false;
			}

			return isSuccess;
		}
	}
}