namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Postprocessor registration
	/// </summary>
	public sealed class PostProcessorRegistration : AssetProcessorRegistrationBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to use postprocessor in the debugging HTTP-handlers
		/// </summary>
		[ConfigurationProperty("useInDebugMode", DefaultValue = false)]
		public bool UseInDebugMode
		{
			get { return (bool)this["useInDebugMode"]; }
			set { this["useInDebugMode"] = value; }
		}
	}
}