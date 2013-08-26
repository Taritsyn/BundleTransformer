namespace BundleTransformer.SassAndScss
{
	/// <summary>
	/// Sass and SCSS node types
	/// </summary>
	internal enum SassAndScssNodeType
	{
		/// <summary>
		/// Unknown node
		/// </summary>
		Unknown = 0,

		/// <summary>
		/// Server <code>@import</code> rule
		/// </summary>
		ServerImportRule,

		/// <summary>
		/// Client <code>@import</code> rule
		/// </summary>
		ClientImportRule,

		/// <summary>
		/// <code>url</code> rule
		/// </summary>
		UrlRule,

		/// <summary>
		/// Multiline comment
		/// </summary>
		MultilineComment
	}
}