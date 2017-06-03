namespace BundleTransformer.Core.Filters
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Assets;
	using FileSystem;
	using Resources;

	/// <summary>
	/// Filter that responsible for choosing appropriate version
	/// of CSS-file, depending on current mode of
	/// web application (debug mode - debug versions of CSS-asset files;
	/// release mode - minified versions)
	/// </summary>
	public sealed class CssFileExtensionsFilter : FileExtensionsFilterBase
	{
		/// <summary>
		/// Extensions of CSS-files for debug mode
		/// </summary>
		private static readonly string[] _debugCssExtensions = { ".css", ".min.css" };

		/// <summary>
		/// Extensions of CSS-files for release mode
		/// </summary>
		private static readonly string[] _releaseCssExtensions = { ".min.css", ".css" };


		/// <summary>
		/// Constructs a instance of CSS-file extensions filter
		/// </summary>
		public CssFileExtensionsFilter()
			: this(BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs a instance of CSS-file extensions filter
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public CssFileExtensionsFilter(IVirtualFileSystemWrapper virtualFileSystemWrapper)
			: base(virtualFileSystemWrapper)
		{ }


		/// <summary>
		/// Chooses a appropriate versions of CSS-files, depending on
		/// current mode of web application
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of CSS-assets adapted for current mode of web application</returns>
		public override IList<IAsset> Transform(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			foreach (var asset in assets.Where(a => a.AssetTypeCode == Constants.AssetTypeCode.Css
				&& !a.Minified))
			{
				bool isMinified;
				string newAssetVirtualPath = GetAppropriateAssetFilePath(asset.VirtualPath, out isMinified);

				asset.VirtualPath = newAssetVirtualPath;
				asset.Minified = isMinified;
			}

			return assets;
		}

		/// <summary>
		/// Gets a version of CSS-file virtual path, most appropriate for
		/// current mode of web application
		/// </summary>
		/// <param name="assetVirtualPath">CSS-asset virtual file path</param>
		/// <param name="isMinified">Flag indicating what appropriate
		/// virtual file path version of CSS-asset is minified</param>
		/// <returns>Virtual path to CSS-file, corresponding current mode
		/// of web application</returns>
		protected override string GetAppropriateAssetFilePath(string assetVirtualPath, out bool isMinified)
		{
			string processedAssetVirtualPath = assetVirtualPath.Trim();
			string appropriateAssetVirtualPath = processedAssetVirtualPath;
			isMinified = false;

			if (appropriateAssetVirtualPath.Length > 0)
			{
				// Fill list of file extensions, sorted in order
				// of relevance to current mode of web application
				string[] appropriateFileExtensions = UsageOfPreMinifiedFilesEnabled ?
					_releaseCssExtensions : _debugCssExtensions;

				appropriateAssetVirtualPath = ProbeAssetFilePath(
					Asset.RemoveAdditionalCssFileExtension(appropriateAssetVirtualPath), appropriateFileExtensions);
				isMinified = Asset.IsCssFileWithMinExtension(appropriateAssetVirtualPath);
			}

			return appropriateAssetVirtualPath;
		}
	}
}