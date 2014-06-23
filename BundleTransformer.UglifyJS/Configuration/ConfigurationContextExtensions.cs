namespace BundleTransformer.UglifyJs.Configuration
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
		/// Configuration settings of Uglify Minifier
		/// </summary>
		private static readonly Lazy<UglifySettings> _uglifyConfig =
			new Lazy<UglifySettings>(() => (UglifySettings)ConfigurationManager.GetSection("bundleTransformer/uglify"));

		/// <summary>
		/// Gets Uglify Minifier configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of Uglify Minifier</returns>
		public static UglifySettings GetUglifySettings(this IConfigurationContext context)
		{
			return _uglifyConfig.Value;
		}
	}
}