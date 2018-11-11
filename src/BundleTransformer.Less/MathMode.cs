namespace BundleTransformer.Less
{
	public enum MathMode
	{
		/// <summary>
		/// Eagerly try to solve all operations
		/// </summary>
		Always = 0,

		/// <summary>
		/// Require parens for division `/`
		/// </summary>
		ParensDivision = 1,

		/// <summary>
		/// Require parens for all operations
		/// </summary>
		Parens = 2,

		/// <summary>
		/// Legacy strict behavior (super-strict)
		/// </summary>
		StrictLegacy = 3
	}
}