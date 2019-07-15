namespace BundleTransformer.Autoprefixer
{
	/// <summary>
	/// Flexbox mode
	/// </summary>
	public enum FlexboxMode
	{
		/// <summary>
		/// Add prefixes for flexbox properties for all browsers
		/// </summary>
		All = 0,

		/// <summary>
		/// Prevent adding prefixes for flexbox properties
		/// </summary>
		None,

		/// <summary>
		/// Add prefixes for flexbox properties only for final and IE 10 versions of specification
		/// </summary>
		No2009
	}
}