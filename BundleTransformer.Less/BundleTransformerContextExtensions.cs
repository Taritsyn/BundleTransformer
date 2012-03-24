namespace BundleTransformer.Less
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
		/// Configuration settings of LESS-translator
		/// </summary>
		private static readonly Lazy<LessSettings> _lessConfiguration =
			new Lazy<LessSettings>(() => (LessSettings)ConfigurationManager.GetSection("bundleTransformer/less"));

		/// <summary>
		/// Gets LESS-translator configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of LESS-translator</returns>
		public static LessSettings GetLessConfiguration(this BundleTransformerContext context)
		{
			return _lessConfiguration.Value;
		}
	}
}
