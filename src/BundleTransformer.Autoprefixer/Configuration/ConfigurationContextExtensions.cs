namespace BundleTransformer.Autoprefixer.Configuration
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
		/// Configuration settings of Andrey Sitnik's Autoprefix CSS-postprocessor
		/// </summary>
		private static readonly Lazy<AutoprefixerSettings> _autoprefixerConfig =
			new Lazy<AutoprefixerSettings>(() => (AutoprefixerSettings)ConfigurationManager.GetSection("bundleTransformer/autoprefixer"));

		/// <summary>
		/// Gets a Andrey Sitnik's Autoprefix CSS-postprocessor configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of Andrey Sitnik's Autoprefix CSS-postprocessor</returns>
		public static AutoprefixerSettings GetAutoprefixerSettings(this IConfigurationContext context)
		{
			return _autoprefixerConfig.Value;
		}
	}
}