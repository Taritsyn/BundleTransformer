namespace BundleTransformer.Core
{
	using System;
	using System.Configuration;

	using Configuration;

	/// <summary>
	/// Configuration context
	/// </summary>
	public sealed class ConfigurationContext
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