namespace BundleTransformer.Core.Filters
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Text.RegularExpressions;

	using Assets;
	using FileSystem;
	using Resources;

	/// <summary>
	/// Filter that responsible for choosing appropriate version 
	/// of JS-file, depending on current mode of 
	/// web application (debug mode - debug versions of JS-asset files; 
	/// release mode - minified versions)
	/// </summary>
	public sealed class JsFileExtensionsFilter : FileExtensionsFilterBase
	{
		/// <summary>
		/// Version number placeholder
		/// </summary>
		private const string VERSION_NUMBER_PLACEHOLDER = @"$version$";

		/// <summary>
		/// List of regular expressions of JS-files with Microsoft-style extensions
		/// </summary>
		private readonly List<Regex> _jsFilesWithMsStyleExtensionsRegExps;

		/// <summary>
		/// Extensions of JS-files for debug mode (standard style)
		/// </summary>
		private static readonly string[] _debugJsExtensionsForStandardStyle = { ".js", ".min.js" };

		/// <summary>
		/// Extensions of JS-files for release mode (standard style)
		/// </summary>
		private static readonly string[] _releaseJsExtensionsForStandardStyle = { ".min.js", ".js" };

		/// <summary>
		/// Extensions of JS-files for debug mode (Microsoft style)
		/// </summary>
		private static readonly string[] _debugJsExtensionsForMicrosoftStyle = { ".debug.js", ".js" };

		/// <summary>
		/// Extensions of JS-files for release mode (Microsoft style)
		/// </summary>
		private static readonly string[] _releaseJsExtensionsForMicrosoftStyle = { ".js", ".debug.js" };


		/// <summary>
		/// Constructs instance of JS-file extensions filter
		/// </summary>
		/// <param name="jsFilesWithMsStyleExtensions">JS-files with Microsoft-style extensions list</param>
		public JsFileExtensionsFilter(string[] jsFilesWithMsStyleExtensions)
			: this(jsFilesWithMsStyleExtensions, BundleTransformerContext.Current.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs instance of JS-file extensions filter
		/// </summary>
		/// <param name="jsFilesWithMsStyleExtensions">JS-files with Microsoft-style extensions list</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public JsFileExtensionsFilter(string[] jsFilesWithMsStyleExtensions, 
			IVirtualFileSystemWrapper virtualFileSystemWrapper) : base(virtualFileSystemWrapper)
		{
			var jsFileRegExps = new List<Regex>();
			if (jsFilesWithMsStyleExtensions.Length > 0)
			{
				string versionNumberPlaceholder = VERSION_NUMBER_PLACEHOLDER.Replace("$", @"\$");

				foreach (var jsFileName in jsFilesWithMsStyleExtensions)
				{
					if (!string.IsNullOrWhiteSpace(jsFileName))
					{
						string jsFileNamePattern = Regex.Escape(jsFileName.Trim());

						if (jsFileNamePattern.IndexOf(versionNumberPlaceholder, 
							StringComparison.OrdinalIgnoreCase) != -1)
						{
							jsFileNamePattern = jsFileNamePattern.Replace(versionNumberPlaceholder, 
								@"(?:\d+\.)*\d+(?:(?:alpha|beta|rc)\d{0,1})?");
						}
						jsFileNamePattern = "^" + jsFileNamePattern + "$";

						jsFileRegExps.Add(new Regex(jsFileNamePattern, RegexOptions.IgnoreCase));
					}
				}
			}

			_jsFilesWithMsStyleExtensionsRegExps = jsFileRegExps;
		}


		/// <summary>
		/// Chooses appropriate versions of JS-files, depending on 
		/// current mode of web application
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of JS-assets adapted for current mode of web application</returns>
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

			foreach (var asset in assets.Where(a => a.AssetType == AssetType.JavaScript && !a.Minified))
			{
				bool isMinified;
				string newAssetVirtualPath = GetAppropriateAssetFilePath(asset.VirtualPath, out isMinified);

				asset.VirtualPath = newAssetVirtualPath;
				asset.Minified = isMinified;
			}

			return assets;
		}

		/// <summary>
		/// Gets version of JS-file virtual path, most appropriate for 
		/// current mode of web application
		/// </summary>
		/// <param name="assetVirtualPath">JS-asset file virtual path</param>
		/// <param name="isMinified">Flag indicating what appropriate 
		/// virtual file path version of JS-asset is minified</param>
		/// <returns>Virtual path to JS-file, corresponding current mode 
		/// of web application</returns>
		protected override string GetAppropriateAssetFilePath(string assetVirtualPath, out bool isMinified)
		{
			string processedAssetVirtualPath = assetVirtualPath.Trim();
			string appropriateAssetVirtualPath = processedAssetVirtualPath;
			isMinified = false;

			if (appropriateAssetVirtualPath.Length > 0)
			{
				appropriateAssetVirtualPath = Asset.RemoveAdditionalJsFileExtension(appropriateAssetVirtualPath);

				// Fill list of file extensions, sorted in order 
				// of relevance to current mode of web application
				string[] appropriateFileExtensions;

				if (IsJsFileWithMicrosoftStyleExtension(appropriateAssetVirtualPath))
				{
					appropriateFileExtensions = UsageOfPreMinifiedFilesEnabled ? 
						_releaseJsExtensionsForMicrosoftStyle : _debugJsExtensionsForMicrosoftStyle;
					appropriateAssetVirtualPath = ProbeAssetFilePath(appropriateAssetVirtualPath, appropriateFileExtensions);
					isMinified = !Asset.IsJsFileWithDebugExtension(appropriateAssetVirtualPath);
				}
				else
				{
					appropriateFileExtensions = UsageOfPreMinifiedFilesEnabled ?
						_releaseJsExtensionsForStandardStyle : _debugJsExtensionsForStandardStyle;
					appropriateAssetVirtualPath = ProbeAssetFilePath(appropriateAssetVirtualPath, appropriateFileExtensions);
					isMinified = Asset.IsJsFileWithMinExtension(appropriateAssetVirtualPath);
				}
			}

			return appropriateAssetVirtualPath;
		}

		/// <summary>
		/// Checks existance of specified JS-file in list of 
		/// JS-files that have extensions in Microsoft-style
		/// </summary>
		/// <param name="assetVirtualPath">JS-asset virtual file path</param>
		/// <returns>Checking result (true – exist; false – not exist)</returns>
		private bool IsJsFileWithMicrosoftStyleExtension(string assetVirtualPath)
		{
			string assetName = Path.GetFileName(assetVirtualPath);
			string newAssetName = Asset.RemoveAdditionalJsFileExtension(assetName);
			bool isJsFileWithMsStyleExtension = false;

			foreach (var jsFileWithMsStyleExtensionRegExp in _jsFilesWithMsStyleExtensionsRegExps)
			{
				if (jsFileWithMsStyleExtensionRegExp.IsMatch(newAssetName))
				{
					isJsFileWithMsStyleExtension = true;
					break;
				}
			}

			return isJsFileWithMsStyleExtension;
		}
	}
}