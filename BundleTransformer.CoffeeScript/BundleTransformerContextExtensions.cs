namespace BundleTransformer.CoffeeScript
{
	using System;
	using System.Configuration;

	using Core;
	using Configuration;

	/// <summary>
	/// Bundle transformer context extensions
	/// </summary>
	public static class BundleTransformerContextExtensions
	{
		/// <summary>
		/// Configuration settings of CoffeeScript-translator
		/// </summary>
		private static readonly Lazy<CoffeeScriptSettings> _coffeeConfig =
			new Lazy<CoffeeScriptSettings>(() => (CoffeeScriptSettings)ConfigurationManager.GetSection("bundleTransformer/coffeeScript"));

		/// <summary>
		/// Gets CoffeeScript-translator configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of CoffeeScript-translator</returns>
		public static CoffeeScriptSettings GetCoffeeScriptConfiguration(this BundleTransformerContext context)
		{
			return _coffeeConfig.Value;
		}
	}
}
