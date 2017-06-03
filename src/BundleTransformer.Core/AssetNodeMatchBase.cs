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
		/// Gets a length of the captured substring
		/// </summary>
		public int Length
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
		/// Constructs a instance of asset node match
		/// </summary>
		/// <param name="position">Position in the original string where
		/// the first character of the captured substring was found</param>
		/// <param name="length">Length of the captured substring</param>
		/// <param name="match">Single regular expression match</param>
		protected AssetNodeMatchBase(int position, int length, Match match)
		{
			Position = position;
			Length = length;
			Match = match;
		}
	}
}