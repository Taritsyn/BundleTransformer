namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of asset processor
	/// </summary>
	public abstract class AssetProcessorRegistrationBase : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets processor name
		/// </summary>
		[ConfigurationProperty("name", IsKey = true, IsRequired = true)]
		public string Name
		{
			get { return (string)this["name"]; }
			set { this["name"] = value; }
		}

		/// <summary>
		/// Gets or sets processor .NET-type name
		/// </summary>
		[ConfigurationProperty("type", IsRequired = true)]
		public string Type
		{
			get { return (string)this["type"]; }
			set { this["type"] = value; }
		}
	}
}