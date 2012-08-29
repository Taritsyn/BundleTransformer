namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Settings of the squeezer
	/// </summary>
	public sealed class SqueezerInstanceSettings
	{
		/// <summary>
		/// Gets or sets a flag for whether to cause consecutive statements 
		/// in a block to be merged using the "sequence" (comma) operator
		/// </summary>
		public bool MakeSequences
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove unreachable code
		/// </summary>
		public bool DeadCode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable other additional 
		/// optimizations that are known to be unsafe in some contrived 
		/// situations, but could still be generally useful
		/// </summary>
		public bool Unsafe
		{
			get;
			set;
		}
	}
}
