namespace BundleTransformer.Core
{
	using System.Text.RegularExpressions;

	/// <summary>
	/// CSS node match
	/// </summary>
	public sealed class CssNodeMatch : AssetNodeMatchBase
	{
		/// <summary>
		/// Gets a type of CSS-node
		/// </summary>
		public CssNodeType NodeType
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of CSS node match
		/// </summary>
		/// <param name="position">Position in the original string where 
		/// the first character of the captured substring was found</param>
		/// <param name="length">Length of the captured substring</param>
		/// <param name="nodeType">Type of CSS-node</param>
		/// <param name="match">Single regular expression match</param>
		public CssNodeMatch(int position, int length, CssNodeType nodeType, Match match)
			: base(position, length, match)
		{
			NodeType = nodeType;
		}
	}
}