namespace BundleTransformer.Core.ErrorMessageHelpers
{
	using System.Text;

	/// <summary>
	/// Error source information
	/// </summary>
	public sealed class ErrorSourceInfo
	{
		/// <summary>
		/// Line number
		/// </summary>
		public int LineNumber
		{
			get;
			private set;
		}

		/// <summary>
		/// Column number
		/// </summary>
		public int ColumnNumber
		{
			get;
			private set;
		}

		/// <summary>
		/// Line content
		/// </summary>
		public string LineContent
		{
			get;
			private set;
		}

		/// <summary>
		/// Source error
		/// </summary>
		public string SourceError
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of error source information
		/// </summary>
		private ErrorSourceInfo()
		{
			LineNumber = 0;
			ColumnNumber = 0;
			LineContent = string.Empty;
			SourceError = string.Empty;
		}


		/// <summary>
		/// Extracts the error source information from the source code
		/// </summary>
		/// <param name="sourceCode">Source code</param>
		/// <param name="startIndex">Start character index</param>
		/// <param name="tabSize">Number of spaces in tab</param>
		/// <returns>Error source information</returns>
		public static ErrorSourceInfo Create(string sourceCode, int startIndex, int tabSize = 4)
		{
			var errorSourceInfo = new ErrorSourceInfo();

			string[] lines = sourceCode.Split('\n');
			int lineCount = lines.Length;
			int charCount = 0;

			for (int lineIndex = 0; lineIndex < lineCount; lineIndex++)
			{
				string line = lines[lineIndex];
				int lineLength = line.Length;
				int beginCharIndex = charCount - 1;
				int endCharIndex = charCount + lineLength;

				if (startIndex >= beginCharIndex && startIndex <= endCharIndex)
				{
					int lineNumber = lineIndex + 1;
					int columnNumber = startIndex - beginCharIndex;
					int lineNumberSize = (lineNumber + 1).ToString().Length;
					if (lineNumber == lineCount)
					{
						lineNumberSize = lineNumber.ToString().Length;
					}
					const int leftPaddingSize = 7;

					var sourceError = new StringBuilder();
					if (lineIndex > 0)
					{
						sourceError.AppendFormatLine("Line {0}: {1}",
							(lineNumber - 1).ToString().PadLeft(lineNumberSize),
							lines[lineIndex - 1].TabsToSpaces(tabSize));
					}
					sourceError.AppendFormatLine("Line {0}: {1}",
						lineNumber.ToString().PadLeft(lineNumberSize),
						line.TabsToSpaces(tabSize));
					sourceError.AppendLine("".PadRight(line.Substring(0, columnNumber - 1)
						.TabsToSpaces(tabSize).Length + lineNumberSize + leftPaddingSize).Replace(" ", "-")
						+ "^");
					if (lineIndex < lineCount - 1)
					{
						sourceError.AppendFormatLine("Line {0}: {1}",
							(lineNumber + 1).ToString().PadLeft(lineNumberSize),
							lines[lineIndex + 1].TabsToSpaces(tabSize));
					}

					errorSourceInfo.LineNumber = lineNumber;
					errorSourceInfo.ColumnNumber = columnNumber;
					errorSourceInfo.LineContent = line;
					errorSourceInfo.SourceError = sourceError.ToString();

					break;
				}

				charCount += lineLength + 1;
			}

			return errorSourceInfo;
		}
	}
}
