namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Closure Remote JS-minifier
	/// </summary>
	public sealed class RemoteJsMinifierSettings : JsMinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a URL of Google Closure Compiler Service API
		/// </summary>
		[ConfigurationProperty("closureCompilerServiceApiUrl", DefaultValue = "http://closure-compiler.appspot.com/compile")]
		public string ClosureCompilerServiceApiUrl
		{
			get { return (string)this["closureCompilerServiceApiUrl"]; }
			set { this["closureCompilerServiceApiUrl"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to exclude common externs
		/// such as <code>document</code> and all its methods
		/// </summary>
		[ConfigurationProperty("excludeDefaultExterns", DefaultValue = false)]
		public bool ExcludeDefaultExterns
		{
			get { return (bool)this["excludeDefaultExterns"]; }
			set { this["excludeDefaultExterns"] = value; }
		}

		/// <summary>
		/// Gets or sets a language spec that input sources conform
		/// </summary>
		[ConfigurationProperty("language", DefaultValue = LanguageSpec.EcmaScript3)]
		public LanguageSpec Language
		{
			get { return (LanguageSpec)this["language"]; }
			set { this["language"] = value; }
		}
	}
}