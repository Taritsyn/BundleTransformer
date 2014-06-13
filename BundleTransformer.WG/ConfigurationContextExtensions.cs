namespace BundleTransformer.WG
{
	using System;
	using System.Configuration;

	using Core;
	using Configuration;

	/// <summary>
	/// Configuration context extensions
	/// </summary>
	public static class ConfigurationContextExtensions
	{
		/// <summary>
		/// Configuration settings of WebGrease Minifier
		/// </summary>
		private static readonly Lazy<WgSettings> _wgConfig =
			new Lazy<WgSettings>(() => (WgSettings)ConfigurationManager.GetSection("bundleTransformer/webGrease"));

		/// <summary>
		/// Gets a WebGrease Minifier configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of WebGrease Minifier</returns>
		public static WgSettings GetWgSettings(this ConfigurationContext context)
		{
			return _wgConfig.Value;
		}
	}
}