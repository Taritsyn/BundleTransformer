namespace BundleTransformer.LessLite
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
		/// Configuration settings of LESS-translator
		/// </summary>
		private static readonly Lazy<LessLiteSettings> _lessLiteConfiguration =
			new Lazy<LessLiteSettings>(() => (LessLiteSettings)ConfigurationManager.GetSection("bundleTransformer/less"));

		/// <summary>
		/// Gets LESS-translator configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of LESS-translator</returns>
		public static LessLiteSettings GetLessLiteConfiguration(this BundleTransformerContext context)
		{
			return _lessLiteConfiguration.Value;
		}
	}
}
