namespace BundleTransformer.CleanCss
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
		/// Configuration settings of Clean-css Minifier
		/// </summary>
		private static readonly Lazy<CleanSettings> _cleanConfig =
			new Lazy<CleanSettings>(() => (CleanSettings)ConfigurationManager.GetSection("bundleTransformer/clean"));

		/// <summary>
		/// Gets a Clean-css Minifier configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of Clean-css Minifier</returns>
		public static CleanSettings GetCleanConfiguration(this BundleTransformerContext context)
		{
			return _cleanConfig.Value;
		}
	}
}