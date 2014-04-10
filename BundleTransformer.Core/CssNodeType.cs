namespace BundleTransformer.Core
{
	/// <summary>
	/// CSS node types
	/// </summary>
	public enum CssNodeType
	{
		/// <summary>
		/// Unknown node
		/// </summary>
		Unknown = 0,

		/// <summary>
		/// <code>@charset</code> rule
		/// </summary>
		CharsetRule,

		/// <summary>
		/// <code>@import</code> rule
		/// </summary>
		ImportRule,

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