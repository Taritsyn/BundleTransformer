namespace BundleTransformer.MicrosoftAjax
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
		/// Configuration settings of Microsoft Ajax Minifier
		/// </summary>
		private static readonly Lazy<MicrosoftAjaxSettings> _microsoftAjaxConfiguration =
			new Lazy<MicrosoftAjaxSettings>(() => (MicrosoftAjaxSettings)ConfigurationManager.GetSection("bundleTransformer/microsoftAjax"));

		/// <summary>
		/// Gets Microsoft Ajax Minifier configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of Microsoft Ajax Minifier</returns>
		public static MicrosoftAjaxSettings GetMicrosoftAjaxConfiguration(this BundleTransformerContext context)
		{
			return _microsoftAjaxConfiguration.Value;
		}
	}
}
