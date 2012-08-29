namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of the squeezer
	/// </summary>
	public sealed class SqueezerSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to cause consecutive statements 
		/// in a block to be merged using the "sequence" (comma) operator
		/// </summary>
		[ConfigurationProperty("makeSequences", DefaultValue = true)]
		public bool MakeSequences
		{
			get { return (bool)this["makeSequences"]; }
			set { this["makeSequences"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove unreachable code
		/// </summary>
		[ConfigurationProperty("deadCode", DefaultValue = true)]
		public bool DeadCode
		{
			get { return (bool)this["deadCode"]; }
			set { this["deadCode"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable other additional 
		/// optimizations that are known to be unsafe in some contrived 
		/// situations, but could still be generally useful
		/// </summary>
		[ConfigurationProperty("unsafe", DefaultValue = false)]
		public bool Unsafe
		{
			get { return (bool)this["unsafe"]; }
			set { this["unsafe"] = value; }
		}
	}
}
