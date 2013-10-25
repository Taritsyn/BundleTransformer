namespace BundleTransformer.Core
{
	using System.Text.RegularExpressions;

	/// <summary>
	/// Common regular expressions
	/// </summary>
	public static class CommonRegExps
	{
		/// <summary>
		/// Regular expression for working with the C-style multiline comments
		/// </summary>
		public static readonly Regex CStyleMultilineCommentRegex = new Regex(@"/\*[\s\S]*?\*/");

		/// <summary>
		/// Regular expression for working with the CSS string values
		/// </summary>
		public static readonly Regex CssStringValue = new Regex(@"(?:url\((?<quote>'|"")?(?<value>[\s\S]*?)(\k<quote>)?\))" +
			@"|(?:(?<quote>'|"")(?<value>[\s\S]*?)(\k<quote>))",
			RegexOptions.IgnoreCase);

		/// <summary>
		/// Regular expression for working with CSS <code>url</code> rule
		/// </summary>
		public static readonly Regex CssUrlRuleRegex =
			new Regex(@"url\((?:(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
				@"|(?<url>[\w\-+.:,;/?&=%~#$@\[\]{}]+))\)",
				RegexOptions.IgnoreCase);
	}
}