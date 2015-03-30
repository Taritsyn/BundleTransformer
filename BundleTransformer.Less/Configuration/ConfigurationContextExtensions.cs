namespace BundleTransformer.Less.Configuration
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
		/// Configuration settings of LESS-translator
		/// </summary>
		private static readonly Lazy<LessSettings> _lessConfig =
			new Lazy<LessSettings>(() => (LessSettings)ConfigurationManager.GetSection("bundleTransformer/less"));

		/// <summary>
		/// Gets a LESS-translator configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of LESS-translator</returns>
		public static LessSettings GetLessSettings(this IConfigurationContext context)
		{
			return _lessConfig.Value;
		}
	}
}