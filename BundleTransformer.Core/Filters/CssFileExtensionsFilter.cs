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
		private static readonly string[] _debugCssExtensions = new[] { ".css", ".min.css" };

		/// <summary>
		/// Extensions of CSS-files for release mode
		/// </summary>
		private static readonly string[] _releaseCssExtensions = new[] { ".min.css", ".css" };


		/// <summary>
		/// Constructs instance of CSS-file extensions filter
		/// </summary>
		public CssFileExtensionsFilter()
			: this(BundleTransformerContext.Current.GetFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs instance of CSS-file extensions filter
		/// </summary>
		/// <param name="fileSystemWrapper">File system wrapper</param>
		public CssFileExtensionsFilter(IFileSystemWrapper fileSystemWrapper)
			: base(fileSystemWrapper)
		{ }


		/// <summary>
		/// Chooses appropriate versions of CSS-files, depending on 
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

			foreach (var asset in assets.Where(a => a.AssetType == AssetType.Css 
				&& !a.Minified))
			{
				bool isMinified;
				string newAssetPath = GetAppropriateAssetFilePath(asset.Path, out isMinified);

				asset.Path = newAssetPath;
				asset.Minified = isMinified;
			}

			return assets;
		}

		/// <summary>
		/// Gets version of CSS-file path, most appropriate for 
		/// current mode of web application
		/// </summary>
		/// <param name="assetPath">CSS-asset file path</param>
		/// <param name="isMinified">Flag indicating what appropriate 
		/// file path version of CSS-asset is minified</param>
		/// <returns>Path to CSS-file, corresponding current mode 
		/// of web application</returns>
		protected override string GetAppropriateAssetFilePath(string assetPath, out bool isMinified)
		{
			string processedAssetPath = assetPath.Trim();
			string appropriateAssetPath = processedAssetPath;
			isMinified = false;

			if (appropriateAssetPath.Length > 0)
			{
				// Fill list of file extensions, sorted in order 
				// of relevance to current mode of web application
				string[] appropriateFileExtensions = UsageOfPreMinifiedFilesEnabled ?
					_releaseCssExtensions : _debugCssExtensions;

				appropriateAssetPath = ProbeAssetFilePath(
					Asset.RemoveAdditionalCssFileExtension(appropriateAssetPath), appropriateFileExtensions);
				isMinified = Asset.IsCssFileWithMinExtension(appropriateAssetPath);
			}

			return appropriateAssetPath;
		}
	}
}