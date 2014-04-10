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
		public static readonly Regex CStyleMultilineCommentRegex = new Regex(@"(?<![^/]?/)/\*[^*]*\*+(?:[^/][^*]*\*+)*/");

		/// <summary>
		/// Regular expression for working with the CSS multiline comments
		/// </summary>
		public static readonly Regex CssMultilineCommentRegex = new Regex(@"/\*[^*]*\*+(?:[^/][^*]*\*+)*/");

		/// <summary>
		/// Regular expression for working with the CSS string values
		/// </summary>
        public static readonly Regex CssStringValue = new Regex(@"(?:url\(\s*(?<quote>'|"")?(?<value>[\s\S]*?)(\k<quote>)?\s*\))" +
			@"|(?:(?<quote>'|"")(?<value>[\s\S]*?)(\k<quote>))",
			RegexOptions.IgnoreCase);

		/// <summary>
		/// Regular expression for working with CSS <code>@charset</code> rules
		/// </summary>
		public static readonly Regex CssCharsetRuleRegex =
			new Regex(@"@charset\s*(?<quote>'|"")(?<charset>[A-Za-z0-9\-]+)(\k<quote>)\s*;",
				RegexOptions.IgnoreCase);

		/// <summary>
		/// Regular expression for working with CSS <code>url</code> rule
		/// </summary>
		public static readonly Regex CssUrlRuleRegex =
            new Regex(@"url\(\s*(?:(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
                @"|(?<url>[\w\-+.:,;/?&=%~#$@\[\]{}]+))\s*\)",
				RegexOptions.IgnoreCase);
	}
}