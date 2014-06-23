namespace BundleTransformer.Core.Configuration
{
	public interface IConfigurationContext
	{
		/// <summary>
		/// Gets a core configuration settings
		/// </summary>
		/// <returns>Configuration settings of core</returns>
		CoreSettings GetCoreSettings();
	}
}