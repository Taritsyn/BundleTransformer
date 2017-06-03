namespace BundleTransformer.Csso
{
	/// <summary>
	/// Comments mode
	/// </summary>
	public enum CommentsMode
	{
		/// <summary>
		/// Keep all exclamation comments
		/// </summary>
		Exclamation = 0,

		/// <summary>
		/// Keep first one exclamation comment
		/// </summary>
		FirstExclamation,

		/// <summary>
		/// Remove all exclamation comments
		/// </summary>
		None
	}
}