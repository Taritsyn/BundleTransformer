namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of core
	/// </summary>
	public sealed class CoreSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a flag for whether to enable tracing
		/// </summary>
		[ConfigurationProperty("enableTracing", DefaultValue = false)]
		public bool EnableTracing
		{
			get { return (bool)this["enableTracing"]; }
			set { this["enableTracing"] = value; }
		}

		/// <summary>
		/// Gets or sets a list of JS-files with Microsoft-style extensions
		/// </summary>
		[ConfigurationProperty("jsFilesWithMicrosoftStyleExtensions", DefaultValue = "MicrosoftAjax.js,MicrosoftMvcAjax.js,MicrosoftMvcValidation.js,knockout-$version$.js")]
		public string JsFilesWithMicrosoftStyleExtensions
		{
			get { return (string)this["jsFilesWithMicrosoftStyleExtensions"]; }
			set { this["jsFilesWithMicrosoftStyleExtensions"] = value; }
		}

		/// <summary>
		/// Gets a configuration settings of processing style assets
		/// </summary>
		[ConfigurationProperty("css")]
		public StyleSettings Styles
		{
			get { return this["css"] as StyleSettings; }
		}

		/// <summary>
		/// Gets a configuration settings of processing script assets
		/// </summary>
		[ConfigurationProperty("js")]
		public ScriptSettings Scripts
		{
			get { return this["js"] as ScriptSettings; }
		}

		/// <summary>
		/// Gets a configuration settings of the debugging HTTP-handler, that responsible
		/// for text output of processed asset
		/// </summary>
		[ConfigurationProperty("assetHandler")]
		public AssetHandlerSettings AssetHandler
		{
			get { return this["assetHandler"] as AssetHandlerSettings; }
		}
	}
}