namespace BundleTransformer.Core.Configuration
{
	using System;
	using System.Configuration;

	/// <summary>
	/// Defines interface of configuration context
	/// </summary>
	public sealed class ConfigurationContext : IConfigurationContext
	{
		/// <summary>
		/// Configuration settings of core
		/// </summary>
		private readonly Lazy<CoreSettings> _coreConfig =
			new Lazy<CoreSettings>(() =>
				(CoreSettings)ConfigurationManager.GetSection("bundleTransformer/core"));


		/// <summary>
		/// Gets a core configuration settings
		/// </summary>
		/// <returns>Configuration settings of core</returns>
		public CoreSettings GetCoreSettings()
		{
			return _coreConfig.Value;
		}
	}
}