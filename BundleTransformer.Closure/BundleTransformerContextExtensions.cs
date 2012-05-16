namespace BundleTransformer.Closure
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
		/// Configuration settings of Closure Minifier
		/// </summary>
		private static readonly Lazy<ClosureSettings> _closureConfiguration =
			new Lazy<ClosureSettings>(() => (ClosureSettings)ConfigurationManager.GetSection("bundleTransformer/closure"));

		/// <summary>
		/// Gets Closure Minifier configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of Closure Minifier</returns>
		public static ClosureSettings GetClosureConfiguration(this BundleTransformerContext context)
		{
			return _closureConfiguration.Value;
		}
	}
}