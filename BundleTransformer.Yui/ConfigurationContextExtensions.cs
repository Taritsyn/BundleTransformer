namespace BundleTransformer.Yui
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
		/// Configuration settings of YUI Minifier
		/// </summary>
		private static readonly Lazy<YuiSettings> _yuiConfiguration =
			new Lazy<YuiSettings>(() => (YuiSettings)ConfigurationManager.GetSection("bundleTransformer/yui"));

		/// <summary>
		/// Gets YUI Minifier configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of YUI Minifier</returns>
		public static YuiSettings GetYuiSettings(this IConfigurationContext context)
		{
			return _yuiConfiguration.Value;
		}
	}
}
