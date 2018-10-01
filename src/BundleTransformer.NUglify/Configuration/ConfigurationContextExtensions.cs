using System;
using System.Configuration;

using BundleTransformer.Core.Configuration;

namespace BundleTransformer.NUglify.Configuration
{
	/// <summary>
	/// Configuration context extensions
	/// </summary>
	public static class ConfigurationContextExtensions
	{
		/// <summary>
		/// Configuration settings of NUglify Minifier
		/// </summary>
		private static readonly Lazy<NUglifySettings> _nuglifyConfig =
			new Lazy<NUglifySettings>(() => (NUglifySettings)ConfigurationManager.GetSection("bundleTransformer/nuglify"));

		/// <summary>
		/// Gets a NUglify Minifier configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of NUglify Minifier</returns>
		public static NUglifySettings GetNUglifySettings(this IConfigurationContext context)
		{
			return _nuglifyConfig.Value;
		}
	}
}