using System.Collections.Generic;

namespace BundleTransformer.TypeScript.Internal
{
	internal sealed class CompilationResult
	{
		/// <summary>
		/// Gets or sets a compilated TypeScript-code
		/// </summary>
		public string CompiledContent
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
		/// Constructs a instance of the compilation result
		/// </summary>
		public CompilationResult()
		{
			CompiledContent = string.Empty;
			IncludedFilePaths = new List<string>();
		}
	}
}