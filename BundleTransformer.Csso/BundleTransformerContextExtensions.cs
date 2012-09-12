namespace BundleTransformer.Csso
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
		/// Configuration settings of Sergey Kryzhanovsky's Minifier
		/// </summary>
		private static readonly Lazy<CssoSettings> _cssoConfig =
			new Lazy<CssoSettings>(() => (CssoSettings)ConfigurationManager.GetSection("bundleTransformer/csso"));

		/// <summary>
		/// Gets Sergey Kryzhanovsky's Minifier configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of Sergey Kryzhanovsky's Minifier</returns>
		public static CssoSettings GetCssoConfiguration(this BundleTransformerContext context)
		{
			return _cssoConfig.Value;
		}
	}
}
