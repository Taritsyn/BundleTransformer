namespace BundleTransformer.MicrosoftAjax
{
	/// <summary>
	/// Describes how to output the opening curly-brace for blocks when the OutputMode
	/// is set to MultipleLines
	/// </summary>
	public enum BlockStart
	{
		/// <summary>
		/// Output the opening curly-brace block-start character on its own new line. 
		/// Example:
		/// if (condition)
		/// {
		///     ...
		/// }
		/// </summary>
		NewLine = 0,

		/// <summary>
		/// Output the opening curly-brace block-start character at the end of the previous line. 
		/// Example:
		/// if (condition) {
		///     ...
		/// }
		/// </summary>
		SameLine,

		/// <summary>
		/// Output the opening curly-brace block-start character on the same line or a new line
		/// depending on how it was specified in the sources
		/// </summary>
		UseSource
	}
}
