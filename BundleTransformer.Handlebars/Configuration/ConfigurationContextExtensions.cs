namespace BundleTransformer.Handlebars.Configuration
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
		/// Configuration settings of Handlebars-translator
		/// </summary>
		private static readonly Lazy<HandlebarsSettings> _handlebarsConfig =
			new Lazy<HandlebarsSettings>(() => (HandlebarsSettings)ConfigurationManager.GetSection("bundleTransformer/handlebars"));

		/// <summary>
		/// Gets a Handlebars-translator configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of Handlebars-translator</returns>
		public static HandlebarsSettings GetHandlebarsSettings(this IConfigurationContext context)
		{
			return _handlebarsConfig.Value;
		}
	}
}