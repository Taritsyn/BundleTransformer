using System.Collections.Generic;

namespace BundleTransformer.Autoprefixer.Internal
{
	/// <summary>
	/// Autoprefixing result
	/// </summary>
	internal sealed class AutoprefixingResult
	{
		/// <summary>
		/// Gets or sets a processed CSS code
		/// </summary>
		public string ProcessedContent
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a list of included files
		/// </summary>
		public IList<string> IncludedFilePaths
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the autoprefixing result
		/// </summary>
		public AutoprefixingResult()
		{
			ProcessedContent = string.Empty;
			IncludedFilePaths = new List<string>();
		}
	}
}