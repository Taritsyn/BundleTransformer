namespace BundleTransformer.TypeScript
{
	using System.Text.RegularExpressions;

	using Core;

	/// <summary>
	/// TypeScript node match
	/// </summary>
	internal sealed class TsNodeMatch : AssetNodeMatchBase
	{
		/// <summary>
		/// Gets a type of TypeScript-node
		/// </summary>
		public TsNodeType NodeType
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of TypeScript node match
		/// </summary>
		/// <param name="position">Position in the original string where 
		/// the first character of the captured substring was found</param>
		/// <param name="length">Length of the captured substring</param>
		/// <param name="nodeType">Type of TypeScript-node</param>
		/// <param name="match">Single regular expression match</param>
		public TsNodeMatch(int position, int length, TsNodeType nodeType, Match match)
			: base(position, length, match)
		{
			NodeType = nodeType;
		}
	}
}