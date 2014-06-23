namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;
	
	/// <summary>
	/// Configuration settings of Closure Remote JS-minifier
	/// </summary>
	public sealed class RemoteJsMinifierSettings : JsMinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a URL of Google Google Closure Compiler Service API
		/// </summary>
		[ConfigurationProperty("closureCompilerServiceApiUrl", DefaultValue = "http://closure-compiler.appspot.com/compile")]
		public string ClosureCompilerServiceApiUrl
		{
			get { return (string)this["closureCompilerServiceApiUrl"]; }
			set { this["closureCompilerServiceApiUrl"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to exclude common externs 
		/// such as document and all its methods
		/// </summary>
		[ConfigurationProperty("excludeDefaultExterns", DefaultValue = false)]
		public bool ExcludeDefaultExterns
		{
			get { return (bool)this["excludeDefaultExterns"]; }
			set { this["excludeDefaultExterns"] = value; }
		}
	}
}