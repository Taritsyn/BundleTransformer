namespace BundleTransformer.CoffeeScript
{
	using System;
	using System.Configuration;

	using Core.Configuration;

	using Configuration;

	/// <summary>
	/// Configuration context extensions
	/// </summary>
	public static class ConfigurationContextExtensions
	{
		/// <summary>
		/// Configuration settings of CoffeeScript-translator
		/// </summary>
		private static readonly Lazy<CoffeeScriptSettings> _coffeeConfig =
			new Lazy<CoffeeScriptSettings>(() => (CoffeeScriptSettings)ConfigurationManager.GetSection("bundleTransformer/coffeeScript"));

		/// <summary>
		/// Gets CoffeeScript-translator configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of CoffeeScript-translator</returns>
		public static CoffeeScriptSettings GetCoffeeScriptSettings(this IConfigurationContext context)
		{
			return _coffeeConfig.Value;
		}
	}
}