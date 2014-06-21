namespace BundleTransformer.SassAndScss
{
	using System;
	using System.Configuration;

	using Core.Configuration;

	using Configuration;

	/// <summary>
	/// Configuration context extensions
	/// </summary>
	public static class ConfigurationContextExtensions
	{
		/// <summary>
		/// Configuration settings of Sass- and SCSS-translator
		/// </summary>
		private static readonly Lazy<SassAndScssSettings> _sassAndScssConfig =
			new Lazy<SassAndScssSettings>(() => (SassAndScssSettings)ConfigurationManager.GetSection("bundleTransformer/sassAndScss"));

		/// <summary>
		/// Gets Sass- and SCSS-translator configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of Sass- and SCSS-translator</returns>
		public static SassAndScssSettings GetSassAndScssSettings(this IConfigurationContext context)
		{
			return _sassAndScssConfig.Value;
		}
	}
}