namespace BundleTransformer.WG
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
		/// Configuration settings of WebGrease Minifier
		/// </summary>
		private static readonly Lazy<WgSettings> _wgConfig =
			new Lazy<WgSettings>(() => (WgSettings)ConfigurationManager.GetSection("bundleTransformer/webGrease"));

		/// <summary>
		/// Gets a WebGrease Minifier configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of WebGrease Minifier</returns>
		public static WgSettings GetWgConfiguration(this BundleTransformerContext context)
		{
			return _wgConfig.Value;
		}
	}
}