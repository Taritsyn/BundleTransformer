namespace BundleTransformer.Core.Assets
{
	using System;

	/// <summary>
	/// Defines the interface of asset
	/// </summary>
	public interface IAsset
	{
		/// <summary>
		/// Gets or sets path to asset file
		/// </summary>
		string Path { get; set; }

		/// <summary>
		/// Gets URL of asset file
		/// </summary>
		string Url { get; }

		/// <summary>
		/// Gets asset type
		/// </summary>
		AssetType AssetType { get; }

		/// <summary>
		/// Gets or sets a flag indicating what text content of asset is minified
		/// </summary>
		bool Minified { get; set; }

		/// <summary>
		/// Gets date and time, in coordinated universal time (UTC), of the last modification of asset
		/// </summary>
		DateTime LastModifyDateTimeUtc { get; }

		/// <summary>
		/// Gets or sets text content of asset 
		/// </summary>
		string Content { get; set; }

		/// <summary>
		/// Gets a flag indicating what asset is a stylesheet
		/// </summary>
		bool IsStylesheet { get; }

		/// <summary>
		/// Gets a flag indicating what asset is a script
		/// </summary>
		bool IsScript { get; }

		/// <summary>
		/// Reads text content from asset file
		/// </summary>
		void RefreshContent();
	}
}
