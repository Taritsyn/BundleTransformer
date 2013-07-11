namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of HTTP-handler, that responsible 
	/// for text output of processed asset
	/// </summary>
	public sealed class AssetHandlerSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets duration of storage the text content of processed asset in 
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
		/// Gets or sets a flag for whether to enable sliding expiration time of server cache
		/// </summary>
		[ConfigurationProperty("useServerCacheSlidingExpiration", DefaultValue = false)]
		public bool UseServerCacheSlidingExpiration
		{
			get { return (bool)this["useServerCacheSlidingExpiration"]; }
			set { this["useServerCacheSlidingExpiration"] = value; }
		}

		/// <summary>
		/// Gets or sets duration of storage text content of processed 
		/// asset in browser cache (in days)
		/// </summary>
		[ConfigurationProperty("clientCacheDurationInDays", DefaultValue = 365)]
		[IntegerValidator(MinValue = 0, MaxValue = 365, ExcludeRange = false)]
		public int ClientCacheDurationInDays
		{
			get { return (int)this["clientCacheDurationInDays"]; }
			set { this["clientCacheDurationInDays"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable GZIP/Deflate-compression 
		/// of processed asset
		/// </summary>
		[ConfigurationProperty("enableCompression", DefaultValue = true)]
		public bool EnableCompression
		{
			get { return (bool)this["enableCompression"]; }
			set { this["enableCompression"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable storage text content of 
		/// processed asset in browser cache during debugging
		/// </summary>
		[ConfigurationProperty("disableClientCacheInDebugMode", DefaultValue = true)]
		public bool DisableClientCacheInDebugMode
		{
			get { return (bool)this["disableClientCacheInDebugMode"]; }
			set { this["disableClientCacheInDebugMode"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable GZIP/Deflate-compression 
		/// of processed asset during debugging
		/// </summary>
		[ConfigurationProperty("disableCompressionInDebugMode", DefaultValue = true)]
		public bool DisableCompressionInDebugMode
		{
			get { return (bool)this["disableCompressionInDebugMode"]; }
			set { this["disableCompressionInDebugMode"] = value; }
		}
	}
}