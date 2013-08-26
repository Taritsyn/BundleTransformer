namespace BundleTransformer.Less
{
	/// <summary>
	/// LESS node types
	/// </summary>
	internal enum LessNodeType
	{
		/// <summary>
		/// Unknown node
		/// </summary>
		Unknown = 0,

		/// <summary>
		/// <code>@import</code> rule
		/// </summary>
		ImportRule,

		/// <summary>
		/// <code>data-uri</code> function
		/// </summary>
		DataUriFunction,

		/// <summary>
		/// Multiline comment
		/// </summary>
		MultilineComment
	}
}