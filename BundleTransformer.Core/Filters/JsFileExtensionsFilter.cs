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
		/// List of regular expressions of JS-files with Microsoft-style extensions
		/// </summary>
		private readonly List<Regex> _jsFilesWithMsStyleExtensionsRegExps;

		/// <summary>
		/// Extensions of JS-files for debug mode (standard style)
		/// </summary>
		private static readonly string[] _debugJsExtensionsForStandardStyle = new[] { ".js", ".min.js" };

		/// <summary>
		/// Extensions of JS-files for release mode (standard style)
		/// </summary>
		private static readonly string[] _releaseJsExtensionsForStandardStyle = new[] { ".min.js", ".js" };

		/// <summary>
		/// Extensions of JS-files for debug mode (Microsoft style)
		/// </summary>
		private static readonly string[] _debugJsExtensionsForMicrosoftStyle = new[] { ".debug.js", ".js" };

		/// <summary>
		/// Extensions of JS-files for release mode (Microsoft style)
		/// </summary>
		private static readonly string[] _releaseJsExtensionsForMicrosoftStyle = new[] { ".js", ".debug.js" };


		/// <summary>
		/// Constructs instance of JS-file extensions filter
		/// </summary>
		/// <param name="jsFilesWithMsStyleExtensions">JS-files with Microsoft-style extensions list</param>
		public JsFileExtensionsFilter(string[] jsFilesWithMsStyleExtensions)
			: this(jsFilesWithMsStyleExtensions, BundleTransformerContext.Current.GetFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs instance of JS-file extensions filter
		/// </summary>
		/// <param name="jsFilesWithMsStyleExtensions">JS-files with Microsoft-style extensions list</param>
		/// <param name="fileSystemWrapper">File system wrapper</param>
		public JsFileExtensionsFilter(string[] jsFilesWithMsStyleExtensions, 
			IFileSystemWrapper fileSystemWrapper) : base(fileSystemWrapper)
		{
			var jsFileRegExps = new List<Regex>();
			if (jsFilesWithMsStyleExtensions.Length > 0)
			{
				foreach (var jsFileName in jsFilesWithMsStyleExtensions)
				{
					if (!string.IsNullOrWhiteSpace(jsFileName))
					{
						string jsFileNamePattern = jsFileName
							.Trim()
							.Replace(@".", @"\.")
							;

						if (jsFileNamePattern.IndexOf("$version$") != -1)
						{
							jsFileNamePattern = jsFileNamePattern.Replace("$version$", @"((\d+\.)*\d+((alpha|beta|rc)\d{0,1})?)");
						}
						jsFileNamePattern = "^" + jsFileNamePattern + "$";

						jsFileRegExps.Add(new Regex(jsFileNamePattern,
							RegexOptions.IgnoreCase | RegexOptions.Compiled));
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
				string newAssetPath = GetAppropriateAssetFilePath(asset.Path, out isMinified);

				asset.Path = newAssetPath;
				asset.Minified = isMinified;
			}

			return assets;
		}

		/// <summary>
		/// Gets version of JS-file path, most appropriate for 
		/// current mode of web application
		/// </summary>
		/// <param name="assetPath">JS-asset file path</param>
		/// <param name="isMinified">Flag indicating what appropriate 
		/// file path version of JS-asset is minified</param>
		/// <returns>Path to JS-file, corresponding current mode 
		/// of web application</returns>
		protected override string GetAppropriateAssetFilePath(string assetPath, out bool isMinified)
		{
			string processedAssetPath = assetPath.Trim();
			string appropriateAssetPath = processedAssetPath;
			isMinified = false;

			if (appropriateAssetPath.Length > 0)
			{
				appropriateAssetPath = Asset.RemoveAdditionalJsFileExtension(appropriateAssetPath);

				// Fill list of file extensions, sorted in order 
				// of relevance to current mode of web application
				string[] appropriateFileExtensions;
				
				if (IsJsFileWithMicrosoftStyleExtension(appropriateAssetPath))
				{
					appropriateFileExtensions = UsageOfPreMinifiedFilesEnabled ? 
						_releaseJsExtensionsForMicrosoftStyle : _debugJsExtensionsForMicrosoftStyle;
					appropriateAssetPath = ProbeAssetFilePath(appropriateAssetPath, appropriateFileExtensions);
					isMinified = !Asset.IsJsFileWithDebugExtension(appropriateAssetPath);
				}
				else
				{
					appropriateFileExtensions = UsageOfPreMinifiedFilesEnabled ?
						_releaseJsExtensionsForStandardStyle : _debugJsExtensionsForStandardStyle;
					appropriateAssetPath = ProbeAssetFilePath(appropriateAssetPath, appropriateFileExtensions);
					isMinified = Asset.IsJsFileWithMinExtension(appropriateAssetPath);
				}
			}

			return appropriateAssetPath;
		}

		/// <summary>
		/// Checks existance of specified JS-file in list of 
		/// JS-files that have extensions in Microsoft-style
		/// </summary>
		/// <param name="assetPath">JS-asset file path</param>
		/// <returns>Checking result (true – exist; false – not exist)</returns>
		private bool IsJsFileWithMicrosoftStyleExtension(string assetPath)
		{
			string assetName = Path.GetFileName(assetPath);
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
