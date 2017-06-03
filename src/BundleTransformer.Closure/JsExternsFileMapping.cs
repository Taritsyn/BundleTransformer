namespace BundleTransformer.Closure
{
	using System.Collections.Generic;

	/// <summary>
	/// JS-externs file mapping
	/// </summary>
	public sealed class JsExternsFileMapping
	{
		/// <summary>
		/// Gets or sets a path to script file
		/// </summary>
		public string ScriptFilePath
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets or sets a list of the externs file paths
		/// </summary>
		public IList<string> ExternsFilePaths
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs a instance of JS-externs file mapping
		/// </summary>
		/// <param name="scriptFilePath">Path to script file</param>
		/// <param name="externsFilePaths">List of the externs file paths</param>
		public JsExternsFileMapping(string scriptFilePath, IList<string> externsFilePaths)
		{
			ScriptFilePath = scriptFilePath;
			ExternsFilePaths = externsFilePaths;
		}
	}
}