namespace BundleTransformer.Autoprefixer
{
	/// <summary>
	/// Grid mode
	/// </summary>
	public enum GridMode
	{
		/// <summary>
		/// Prevent Autoprefixer from outputting CSS Grid translations
		/// </summary>
		None = 0,

		/// <summary>
		/// Enable Autoprefixer grid translations and include autoplacement support
		/// </summary>
		Autoplace,

		/// <summary>
		/// Enable Autoprefixer grid translations but exclude autoplacement support
		/// </summary>
		NoAutoplace
	}
}