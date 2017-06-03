namespace BundleTransformer.Hogan.Configuration
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
		/// Configuration settings of Hogan-translator
		/// </summary>
		private static readonly Lazy<HoganSettings> _hoganConfig =
			new Lazy<HoganSettings>(() => (HoganSettings)ConfigurationManager.GetSection("bundleTransformer/hogan"));

		/// <summary>
		/// Gets a Hogan-translator configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of Hogan-translator</returns>
		public static HoganSettings GetHoganSettings(this IConfigurationContext context)
		{
			return _hoganConfig.Value;
		}
	}
}