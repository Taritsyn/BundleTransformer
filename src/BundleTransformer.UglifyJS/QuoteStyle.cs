namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Quote styles
	/// </summary>
	public enum QuoteStyle
	{
		/// <summary>
		/// Prefers double quotes, switches to single quotes when there
		/// are more double quotes in the string itself
		/// </summary>
		Auto = 0,

		/// <summary>
		/// Always use single quotes
		/// </summary>
		Single,

		/// <summary>
		/// Always use double quotes
		/// </summary>
		Double,

		/// <summary>
		/// Always use the original quotes
		/// </summary>
		Original
	}
}