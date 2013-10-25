namespace BundleTransformer.SassAndScss
{
	using System.Text.RegularExpressions;

	using Core;

	/// <summary>
	/// Sass and SCSS node match
	/// </summary>
	internal sealed class SassAndScssNodeMatch : AssetNodeMatchBase
	{
		/// <summary>
		/// Gets a type of Sass and SCSS-node
		/// </summary>
		public SassAndScssNodeType NodeType
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of Sass and SCSS node match
		/// </summary>
		/// <param name="position">Position in the original string where 
		/// the first character of the captured substring was found</param>
		/// <param name="length">Length of the captured substring</param>
		/// <param name="nodeType">Type of Sass- and SCSS-node</param>
		/// <param name="match">Single regular expression match</param>
		public SassAndScssNodeMatch(int position, int length, SassAndScssNodeType nodeType, Match match)
			: base(position, length, match)
		{
			NodeType = nodeType;
		}
	}
}