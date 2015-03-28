namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// JS-externs file mapping registration
	/// </summary>
	public sealed class JsExternsFileMappingRegistration : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a path to script file
		/// </summary>
		[ConfigurationProperty("scriptFilePath", IsKey = true, IsRequired = true)]
		public string ScriptFilePath
		{
			get { return (string)this["scriptFilePath"]; }
			set { this["scriptFilePath"] = value; }
		}

		/// <summary>
		/// Gets or sets a comma-separated list of the externs file paths
		/// </summary>
		[ConfigurationProperty("externsFilePaths", IsRequired = true)]
		public string ExternsFilePaths
		{
			get { return (string)this["externsFilePaths"]; }
			set { this["externsFilePaths"] = value; }
		}
	}
}