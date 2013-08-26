namespace BundleTransformer.Less
{
	using System.Text.RegularExpressions;

	using Core;

	/// <summary>
	/// LESS node match
	/// </summary>
	internal sealed class LessNodeMatch : AssetNodeMatchBase
	{
		/// <summary>
		/// Gets a type of LESS-node
		/// </summary>
		public LessNodeType NodeType
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of LESS node match
		/// </summary>
		/// <param name="position">Position in the original string where 
		/// the first character of the captured substring was found</param>
		/// <param name="nodeType">Type of LESS-node</param>
		/// <param name="match">Single regular expression match</param>
		public LessNodeMatch(int position, LessNodeType nodeType, Match match)
			: base(position, match)
		{
			NodeType = nodeType;
		}
	}
}