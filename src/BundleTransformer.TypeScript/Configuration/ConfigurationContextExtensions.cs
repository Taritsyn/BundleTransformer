namespace BundleTransformer.TypeScript.Configuration
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
		/// Configuration settings of TypeScript-translator
		/// </summary>
		private static readonly Lazy<TypeScriptSettings> _tsConfig =
			new Lazy<TypeScriptSettings>(() => (TypeScriptSettings)ConfigurationManager.GetSection("bundleTransformer/typeScript"));

		/// <summary>
		/// Gets a TypeScript-translator configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of TypeScript-translator</returns>
		public static TypeScriptSettings GetTypeScriptSettings(this IConfigurationContext context)
		{
			return _tsConfig.Value;
		}
	}
}