namespace BundleTransformer.Core.Assets
{
	using System.Collections.Generic;

	/// <summary>
	/// Defines the interface of asset
	/// </summary>
	public interface IAsset
	{
		/// <summary>
		/// Gets or sets a virtual path to asset file
		/// </summary>
		string VirtualPath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a URL of asset file
		/// </summary>
		string Url
		{
			get;
		}

		/// <summary>
		/// Gets or sets a list of original assets
		/// </summary>
		IList<IAsset> OriginalAssets
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a list of virtual paths to other files required by the primary asset
		/// </summary>
		IList<string> VirtualPathDependencies
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a asset type code
		/// </summary>
		string AssetTypeCode { get; }

		/// <summary>
		/// Gets or sets a flag indicating what text content of asset was obtained by
		/// combining the contents of other assets
		/// </summary>
		bool Combined { get; set; }

		/// <summary>
		/// Gets or sets a flag indicating what text content of asset is minified
		/// </summary>
		bool Minified { get; set; }

		/// <summary>
		/// Gets or sets a flag indicating what all relative paths in
		/// text content of asset is transformed to absolute
		/// </summary>
		bool RelativePathsResolved { get; set; }

		/// <summary>
		/// Gets or sets a text content of asset
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
	}
}