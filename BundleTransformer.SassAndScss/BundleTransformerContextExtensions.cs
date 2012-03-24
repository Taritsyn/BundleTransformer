namespace BundleTransformer.SassAndScss
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
		/// Configuration settings of Sass- and SCSS-translator
		/// </summary>
		private static readonly Lazy<SassAndScssSettings> _sassAndScssConfiguration =
			new Lazy<SassAndScssSettings>(() => (SassAndScssSettings)ConfigurationManager.GetSection("bundleTransformer/sassAndScss"));

		/// <summary>
		/// Gets Sass- and SCSS-translator configuration settings
		/// </summary>
		/// <param name="context">Bundle transformer context</param>
		/// <returns>Configuration settings of Sass- and SCSS-translator</returns>
		public static SassAndScssSettings GetSassAndScssConfiguration(this BundleTransformerContext context)
		{
			return _sassAndScssConfiguration.Value;
		}
	}
}
