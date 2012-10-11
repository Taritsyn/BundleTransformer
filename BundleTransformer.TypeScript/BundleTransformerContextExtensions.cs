namespace BundleTransformer.TypeScript
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
		/// Configuration settings of TypeScript-translator
		/// </summary>
		private static readonly Lazy<TypeScriptSettings> _tsConfig =
			new Lazy<TypeScriptSettings>(() => (TypeScriptSettings)ConfigurationManager.GetSection("bundleTransformer/typeScript"));

		/// <summary>
		/// Gets TypeScript-translator configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of TypeScript-translator</returns>
		public static TypeScriptSettings GetTypeScriptConfiguration(this BundleTransformerContext context)
		{
			return _tsConfig.Value;
		}
	}
}
