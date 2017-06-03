namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of minification JS-assets
	/// </summary>
	public sealed class JsSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets a configuration settings of Local JS-minifier
		/// </summary>
		[ConfigurationProperty("local")]
		public LocalJsMinifierSettings Local
		{
			get { return (LocalJsMinifierSettings)this["local"]; }
		}

		/// <summary>
		/// Gets a configuration settings of Remote JS-minifier
		/// </summary>
		[ConfigurationProperty("remote")]
		public RemoteJsMinifierSettings Remote
		{
			get { return (RemoteJsMinifierSettings)this["remote"]; }
		}

		/// <summary>
		/// Gets a list of registered common JS-externs files
		/// </summary>
		[ConfigurationProperty("commonExternsFiles")]
		public CommonJsExternsFileRegistrationCollection CommonExternsFiles
		{
			get { return (CommonJsExternsFileRegistrationCollection)this["commonExternsFiles"]; }
		}

		/// <summary>
		/// Gets a list of registered JS-externs file mappings
		/// </summary>
		[ConfigurationProperty("externsFileMappings")]
		public JsExternsFileMappingRegistrationCollection ExternMappings
		{
			get { return (JsExternsFileMappingRegistrationCollection)this["externsFileMappings"]; }
		}
	}
}