namespace BundleTransformer.Yui
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
		/// Configuration settings of YUI Minifier
		/// </summary>
		private static readonly Lazy<YuiSettings> _yuiConfiguration =
			new Lazy<YuiSettings>(() => (YuiSettings)ConfigurationManager.GetSection("bundleTransformer/yui"));

		/// <summary>
		/// Gets YUI Minifier configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of YUI Minifier</returns>
		public static YuiSettings GetYuiConfiguration(this BundleTransformerContext context)
		{
			return _yuiConfiguration.Value;
		}
	}
}
