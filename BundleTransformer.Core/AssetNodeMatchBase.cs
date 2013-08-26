namespace BundleTransformer.Core
{
	using System.Text.RegularExpressions;

	/// <summary>
	/// Asset node match
	/// </summary>
	public abstract class AssetNodeMatchBase
	{
		/// <summary>
		/// Gets a position in the original string where 
		/// the first character of the captured substring was found
		/// </summary>
		public int Position
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a single regular expression match
		/// </summary>
		public Match Match
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs instance of asset node match
		/// </summary>
		/// <param name="position">Position in the original string where 
		/// the first character of the captured substring was found</param>
		/// <param name="match">Single regular expression match</param>
		protected AssetNodeMatchBase(int position, Match match)
		{
			Position = position;
			Match = match;
		}
	}
}