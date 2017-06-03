namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// File extension registration
	/// </summary>
	public sealed class FileExtensionRegistration : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a file extension
		/// </summary>
		[ConfigurationProperty("fileExtension", IsKey = true, IsRequired = true)]
		public string FileExtension
		{
			get { return (string)this["fileExtension"]; }
			set { this["fileExtension"] = value; }
		}

		/// <summary>
		/// Gets or sets a asset type code
		/// </summary>
		[ConfigurationProperty("assetTypeCode", IsRequired = true)]
		public string AssetTypeCode
		{
			get { return (string)this["assetTypeCode"]; }
			set { this["assetTypeCode"] = value; }
		}
	}
}