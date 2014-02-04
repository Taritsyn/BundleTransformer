namespace BundleTransformer.Core.Helpers
{
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.IO;
	using System.Text.RegularExpressions;

	/// <summary>
	/// Stylesheet helpers
	/// </summary>
	public static class StylesheetHelpers
	{
		/// <summary>
		/// Singleline comment pattern
		/// </summary>
		const string SINGLELINE_COMMENT = "//";

		/// <summary>
		/// Singleline comment length
		/// </summary>
		const int SINGLELINE_COMMENT_LENGTH = 2;

		/// <summary>
		/// Regular expression for working with the non-ASCII characters
		/// </summary>
		private static readonly Regex _nonAsciiCharactersRegex = new Regex("[^\x00-\x7F]");

		/// <summary>
		/// Regular expression for working with the encoded non-ASCII characters
		/// </summary>
		private static readonly Regex _encodedNonAsciiCharactersRegex = new Regex(@"\\(?<value>[0-9a-fA-F]{6})");


		/// <summary>
		/// Checks whether a position is included in the singleline comment
		/// </summary>
		/// <param name="currentLine">Content of current line</param>
		/// <param name="currentPosition">Current position</param>
		/// <returns>Result of check (true - is included; false - is not included)</returns>
		public static bool IncludedInSinglelineComment(string currentLine, int currentPosition)
		{
			if (string.IsNullOrWhiteSpace(currentLine))
			{
				return false;
			}

			int currentLineLength = currentLine.Length;
			if (currentPosition >= currentLineLength)
			{
				throw new ArgumentException(string.Empty, "currentPosition");
			}

			int endPosition = currentLineLength - 1;
			int singlelineCommentPosition = currentLine.IndexOf(SINGLELINE_COMMENT, 0, currentPosition,
				StringComparison.Ordinal);
			if (singlelineCommentPosition != -1)
			{
				int commentTextPosition = singlelineCommentPosition + SINGLELINE_COMMENT_LENGTH;
				if (commentTextPosition >= endPosition)
				{
					return true;
				}

				string commentText = currentLine.Substring(commentTextPosition, 
					currentPosition - commentTextPosition);
				if (string.IsNullOrWhiteSpace(commentText))
				{
					return true;
				}

				MatchCollection stringValueMatches = CommonRegExps.CssStringValue.Matches(currentLine);
				var intervals = new List<Interval>();

				foreach (Match stringValueMatch in stringValueMatches)
				{
					Group valueGroup = stringValueMatch.Groups["value"];
					int stringValueStartPosition = valueGroup.Index;
					if (stringValueStartPosition < currentPosition)
					{
						int stringValueEndPosition = stringValueStartPosition + valueGroup.Length - 1;

						var interval = new Interval(stringValueStartPosition, stringValueEndPosition);
						intervals.Add(interval);
					}
					else
					{
						break;
					}
				}

				int intervalCount = intervals.Count;
				if (intervalCount > 0)
				{
					bool commentIsIncludedInInterval = false;

					while (singlelineCommentPosition != -1)
					{
						foreach (var interval in intervals)
						{
							commentIsIncludedInInterval = interval.IsIncluded(singlelineCommentPosition);
							if (commentIsIncludedInInterval)
							{
								break;
							}
						}

						if (commentIsIncludedInInterval)
						{
							singlelineCommentPosition = currentLine.IndexOf(SINGLELINE_COMMENT,
								commentTextPosition,
								currentPosition - commentTextPosition,
								StringComparison.Ordinal);
							commentTextPosition = singlelineCommentPosition + SINGLELINE_COMMENT_LENGTH;
							if (commentTextPosition >= endPosition)
							{
								return true;
							}
						}
						else
						{
							return true;
						}
					}
				}
				else
				{
					return true;
				}
			}

			return false;
		}

		/// <summary>
		/// Escapes a non-ASCII characters
		/// </summary>
		/// <param name="value">String value</param>
		/// <returns>Processed value</returns>
		public static string EscapeNonAsciiCharacters(string value)
		{
			if (string.IsNullOrWhiteSpace(value))
			{
				return value;
			}

			if (!_nonAsciiCharactersRegex.IsMatch(value))
			{
				return value;
			}

			string result;

			using (var writer = new StringWriter())
			{
				int charCount = value.Length;

				for (int charIndex = 0; charIndex < charCount; charIndex++)
				{
					char charValue = value[charIndex];
					if (charValue > 127)
					{
						// This character is too big for ASCII
						string escapedValue = "\\" + ((int)charValue).ToString("X6");
						writer.Write(escapedValue);
					}
					else
					{
						writer.Write(charValue);
					}
				}

				writer.Flush();

				result = writer.ToString();
			}

			return result;
		}

		/// <summary>
		/// Unescapes a escaped non-ASCII characters
		/// </summary>
		/// <param name="value">String value</param>
		/// <returns>Processed value</returns>
		public static string UnescapeEscapedNonAsciiCharacters(string value)
		{
			string result = _encodedNonAsciiCharactersRegex.Replace(value, m =>
			{
				var charValue = (char)int.Parse(m.Groups["value"].Value, NumberStyles.HexNumber);
				return charValue.ToString(CultureInfo.InvariantCulture);
			});

			return result;
		}
	}
}