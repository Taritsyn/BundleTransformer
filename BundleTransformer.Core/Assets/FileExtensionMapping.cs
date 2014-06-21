namespace BundleTransformer.Core.Assets
{
	/// <summary>
	/// File extension mapping
	/// </summary>
	public sealed class FileExtensionMapping
	{
		/// <summary>
		/// Gets a file extension
		/// </summary>
		public string FileExtension
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a asset type code
		/// </summary>
		public string AssetTypeCode
		{
			get;
			private set;
		}


		/// <summary>
		/// Constructs a instance of file extension mapping
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <param name="assetTypeCode">Asset type code</param>
		public FileExtensionMapping(string fileExtension, string assetTypeCode)
		{
			FileExtension = fileExtension;
			AssetTypeCode = assetTypeCode;
		}
	}
}