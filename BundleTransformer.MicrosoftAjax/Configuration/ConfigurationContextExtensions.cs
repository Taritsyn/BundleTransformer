namespace BundleTransformer.MicrosoftAjax.Configuration
{
	using System;
	using System.Configuration;

	using Core.Configuration;

	/// <summary>
	/// Configuration context extensions
	/// </summary>
	public static class ConfigurationContextExtensions
	{
		/// <summary>
		/// Configuration settings of Microsoft Ajax Minifier
		/// </summary>
		private static readonly Lazy<MicrosoftAjaxSettings> _microsoftAjaxConfig =
			new Lazy<MicrosoftAjaxSettings>(() => (MicrosoftAjaxSettings)ConfigurationManager.GetSection("bundleTransformer/microsoftAjax"));

		/// <summary>
		/// Gets Microsoft Ajax Minifier configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of Microsoft Ajax Minifier</returns>
		public static MicrosoftAjaxSettings GetMicrosoftAjaxSettings(this IConfigurationContext context)
		{
			return _microsoftAjaxConfig.Value;
		}
	}
}