namespace BundleTransformer.Csso.Internal
{
	/// <summary>
	/// CSS optimization options
	/// </summary>
	internal sealed class OptimizationOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable structure minification
		/// </summary>
		public bool Restructure
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable unsafe merge of <code>@media</code> rules
		/// </summary>
		public bool ForceMediaMerge
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comments mode
		/// </summary>
		public CommentsMode Comments
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the CSS optimization options
		/// </summary>
		public OptimizationOptions()
		{
			Restructure = true;
			ForceMediaMerge = false;
			Comments = CommentsMode.Exclamation;
		}
	}
}