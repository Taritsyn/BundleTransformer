namespace BundleTransformer.Packer
{
	using System;
	using System.Configuration;

	using Core;
	using Configuration;

	/// <summary>
	/// Configuration context extensions
	/// </summary>
	public static class ConfigurationContextExtensions
	{
		/// <summary>
		/// Configuration settings of Dean Edwards' Minifier
		/// </summary>
		private static readonly Lazy<PackerSettings> _packerConfig =
			new Lazy<PackerSettings>(() => (PackerSettings)ConfigurationManager.GetSection("bundleTransformer/packer"));

		/// <summary>
		/// Gets Dean Edwards' Minifier configuration settings
		/// </summary>
		/// <param name="context">Configuration context</param>
		/// <returns>Configuration settings of Dean Edwards' Minifier</returns>
		public static PackerSettings GetPackerSettings(this ConfigurationContext context)
		{
			return _packerConfig.Value;
		}
	}
}
