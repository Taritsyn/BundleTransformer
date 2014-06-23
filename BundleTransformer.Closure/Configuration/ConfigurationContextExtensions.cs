namespace BundleTransformer.Closure.Configuration
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
		/// Configuration settings of Closure Minifier
		/// </summary>
		private static readonly Lazy<ClosureSettings> _closureConfig =
			new Lazy<ClosureSettings>(() => (ClosureSettings)ConfigurationManager.GetSection("bundleTransformer/closure"));

		/// <summary>
		/// Gets Closure Minifier configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of Closure Minifier</returns>
		public static ClosureSettings GetClosureSettings(this IConfigurationContext context)
		{
			return _closureConfig.Value;
		}
	}
}