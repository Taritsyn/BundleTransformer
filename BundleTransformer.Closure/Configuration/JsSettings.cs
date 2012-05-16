namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of minification JS-assets
	/// </summary>
	public sealed class JsSettings : ConfigurationElement
	{
		/// <summary>
		/// Get a configuration settings of local JS-minifier
		/// </summary>
		[ConfigurationProperty("local")]
		public LocalJsMinifierSettings Local
		{
			get { return (LocalJsMinifierSettings)this["local"]; }
		}

		/// <summary>
		/// Get a configuration settings of remote JS-minifier
		/// </summary>
		[ConfigurationProperty("remote")]
		public RemoteJsMinifierSettings Remote
		{
			get { return (RemoteJsMinifierSettings)this["remote"]; }
		}
	}
}
