namespace BundleTransformer.TypeScript
{
	/// <summary>
	/// TypeScript node types
	/// </summary>
	internal enum TsNodeType
	{
		/// <summary>
		/// Unknown node
		/// </summary>
		Unknown = 0,

		/// <summary>
		/// <code>reference</code> comment
		/// </summary>
		ReferenceComment,

		/// <summary>
		/// Multiline comment
		/// </summary>
		MultilineComment
	}
}