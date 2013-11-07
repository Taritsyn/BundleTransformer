namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of the debugging HTTP-handler, that responsible 
	/// for text output of processed asset
	/// </summary>
	public sealed class AssetHandlerSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to disable storage text content of 
		/// processed asset in server cache
		/// </summary>
		[ConfigurationProperty("disableServerCache", DefaultValue = false)]
		public bool DisableServerCache
		{
			get { return (bool) this["disableServerCache"]; }
			set { this["disableServerCache"] = value; }
		}

		/// <summary>
		/// Gets or sets a duration of storage the text content of processed asset in 
		/// server cache (in minutes)
		/// </summary>
		[ConfigurationProperty("serverCacheDurationInMinutes", DefaultValue = 15)]
		[IntegerValidator(MinValue = 1, MaxValue = 1440, ExcludeRange = false)]
		public int ServerCacheDurationInMinutes
		{
			get { return (int)this["serverCacheDurationInMinutes"]; }
			set { this["serverCacheDurationInMinutes"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable storage text content of 
		/// processed asset in browser cache
		/// </summary>
		[ConfigurationProperty("disableClientCache", DefaultValue = false)]
		public bool DisableClientCache
		{
			get { return (bool)this["disableClientCache"]; }
			set { this["disableClientCache"] = value; }
		}
	}
}