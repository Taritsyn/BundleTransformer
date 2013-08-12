namespace BundleTransformer.Less
{
	public enum LineNumbersMode
	{
		/// <summary>
		/// No output the debug information
		/// </summary>
		None = 0,

		/// <summary>
		/// Output the debug information within comments
		/// </summary>
		Comments,

		/// <summary>
		/// Output the debug information within a fake media query
		/// which is compatible with the SASS format
		/// </summary>
		MediaQuery,

		/// <summary>
		/// Output the debug information within comments and fake media query
		/// </summary>
		All
	}
}