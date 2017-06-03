namespace BundleTransformer.CleanCss.Configuration
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
		/// Configuration settings of Clean-css Minifier
		/// </summary>
		private static readonly Lazy<CleanSettings> _cleanConfig =
			new Lazy<CleanSettings>(() => (CleanSettings)ConfigurationManager.GetSection("bundleTransformer/clean"));

		/// <summary>
		/// Gets a Clean-css Minifier configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of Clean-css Minifier</returns>
		public static CleanSettings GetCleanSettings(this IConfigurationContext context)
		{
			return _cleanConfig.Value;
		}
	}
}