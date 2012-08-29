namespace BundleTransformer.UglifyJs
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
		/// Configuration settings of Uglify Minifier
		/// </summary>
		private static readonly Lazy<UglifySettings> _uglifyConfig =
			new Lazy<UglifySettings>(() => (UglifySettings)ConfigurationManager.GetSection("bundleTransformer/uglify"));

		/// <summary>
		/// Gets Uglify Minifier configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of Uglify Minifier</returns>
		public static UglifySettings GetUglifyJsConfiguration(this BundleTransformerContext context)
		{
			return _uglifyConfig.Value;
		}
	}
}
