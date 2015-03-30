namespace BundleTransformer.Core.Assets
{
	using System.Collections.Generic;
	using System.Text.RegularExpressions;
	using System.Web.Optimization;

	using FileSystem;

	/// <summary>
	/// Asset
	/// </summary>
	public sealed class Asset : IAsset
	{
		/// <summary>
		/// Regular expression to determine whether asset is
		/// minified version of CSS-file with *.min.css extension
		/// </summary>
		private static readonly Regex _cssFileWithMinExtensionRegex = new Regex(@"\.min\.css$",
			RegexOptions.IgnoreCase);

		/// <summary>
		/// Regular expression to determine whether asset is
		/// debug version of JS-file with *.debug.js extension
		/// </summary>
		private static readonly Regex _jsFileWithDebugExtensionRegex = new Regex(@"\.debug\.js$",
			RegexOptions.IgnoreCase);

		/// <summary>
		/// Regular expression to determine whether asset is
		/// minified version of JS-file with *.min.js extension
		/// </summary>
		private static readonly Regex _jsFileWithMinExtensionRegex = new Regex(@"\.min\.js$",
			RegexOptions.IgnoreCase);

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Style file extension mappings
		/// </summary>
		private readonly FileExtensionMappingCollection _styleFileExtensionMappings;

		/// <summary>
		/// Script file extension mappings
		/// </summary>
		private readonly FileExtensionMappingCollection _scriptFileExtensionMappings;

		/// <summary>
		/// Virtual path to asset file
		/// </summary>
		private string _virtualPath;

		/// <summary>
		/// Asset type code
		/// </summary>
		private string _assetTypeCode;

		/// <summary>
		/// Flag indicating what asset is a stylesheet
		/// </summary>
		private bool _isStylesheet;

		/// <summary>
		/// Flag indicating what asset is a script
		/// </summary>
		private bool _isScript;

		/// <summary>
		/// Text content of asset
		/// </summary>
		private string _content;

		/// <summary>
		/// Included virtual path
		/// </summary>
		private readonly string _includedVirtualPath;

		/// <summary>
		/// List of asset transformations
		/// </summary>
		private readonly IList<IItemTransform> _transforms;

		/// <summary>
		/// Gets or sets a virtual path to asset file
		/// </summary>
		public string VirtualPath
		{
			get { return _virtualPath; }
			set
			{
				string virtualPath = value;
				string assetTypeCode = Constants.AssetTypeCode.Unknown;
				bool isStylesheet = false;
				bool isScript = false;

				if (!string.IsNullOrWhiteSpace(virtualPath))
				{
					assetTypeCode = _styleFileExtensionMappings.GetAssetTypeCodeByFilePath(virtualPath);
					if (assetTypeCode != Constants.AssetTypeCode.Unknown)
					{
						isStylesheet = true;
					}
					else
					{
						assetTypeCode = _scriptFileExtensionMappings.GetAssetTypeCodeByFilePath(virtualPath);
						if (assetTypeCode != Constants.AssetTypeCode.Unknown)
						{
							isScript = true;
						}
					}
				}

				_virtualPath = virtualPath;
				_assetTypeCode = assetTypeCode;
				_isStylesheet = isStylesheet;
				_isScript = isScript;
			}
		}

		/// <summary>
		/// Gets a URL of asset file
		/// </summary>
		public string Url
		{
			get { return _virtualFileSystemWrapper.ToAbsolutePath(VirtualPath); }
		}

		/// <summary>
		/// Gets or sets a list of virtual paths to other files required by the primary asset
		/// </summary>
		public IList<string> VirtualPathDependencies
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a list of original assets
		/// </summary>
		public IList<IAsset> OriginalAssets
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a asset type code
		/// </summary>
		public string AssetTypeCode
		{
			get { return _assetTypeCode; }
		}

		/// <summary>
		/// Gets or sets a flag indicating what text content of asset was obtained by
		/// combining the contents of other assets
		/// </summary>
		public bool Combined
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag indicating what text content of asset is minified
		/// </summary>
		public bool Minified
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag indicating what all relative paths in
		/// text content of asset is transformed to absolute
		/// </summary>
		public bool RelativePathsResolved
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a text content of asset
		/// </summary>
		public string Content
		{
			get
			{
				if (_content == null)
				{
					string content = _virtualFileSystemWrapper.GetFileTextContent(VirtualPath);
					content = ApplyTransformsToContent(content);

					_content = content;
				}

				return _content;
			}
			set { _content = value; }
		}

		/// <summary>
		/// Gets a flag indicating what asset is a stylesheet
		/// </summary>
		public bool IsStylesheet
		{
			get { return _isStylesheet; }
		}

		/// <summary>
		/// Gets a flag indicating what asset is a script
		/// </summary>
		public bool IsScript
		{
			get { return _isScript; }
		}


		/// <summary>
		/// Constructs a instance of Asset
		/// </summary>
		/// <param name="virtualPath">Virtual path to asset file</param>
		public Asset(string virtualPath)
			: this(virtualPath, null, BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs a instance of Asset
		/// </summary>
		/// <param name="virtualPath">Virtual path to asset file</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public Asset(string virtualPath, IVirtualFileSystemWrapper virtualFileSystemWrapper)
			: this(virtualPath, null, virtualFileSystemWrapper)
		{ }

		/// <summary>
		/// Constructs a instance of Asset
		/// </summary>
		/// <param name="virtualPath">Virtual path to asset file</param>
		/// <param name="bundleFile">Bundle file</param>
		public Asset(string virtualPath, BundleFile bundleFile)
			: this(virtualPath, bundleFile, BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs a instance of Asset
		/// </summary>
		/// <param name="virtualPath">Virtual path to asset file</param>
		/// <param name="bundleFile">Bundle file</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public Asset(string virtualPath, BundleFile bundleFile,
			IVirtualFileSystemWrapper virtualFileSystemWrapper)
			: this(virtualPath, bundleFile, virtualFileSystemWrapper,
				BundleTransformerContext.Current.Styles.FileExtensionMappings,
				BundleTransformerContext.Current.Scripts.FileExtensionMappings)
		{ }

		/// <summary>
		/// Constructs a instance of Asset
		/// </summary>
		/// <param name="virtualPath">Virtual path to asset file</param>
		/// <param name="bundleFile">Bundle file</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="styleFileExtensionMappings">Style file extension mappings</param>
		/// <param name="scriptFileExtensionMappings">Script file extension mappings</param>
		public Asset(string virtualPath, BundleFile bundleFile,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			FileExtensionMappingCollection styleFileExtensionMappings,
			FileExtensionMappingCollection scriptFileExtensionMappings)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_styleFileExtensionMappings = styleFileExtensionMappings;
			_scriptFileExtensionMappings = scriptFileExtensionMappings;
			if (bundleFile != null)
			{
				_includedVirtualPath = bundleFile.IncludedVirtualPath;
				_transforms = bundleFile.Transforms;
			}
			else
			{
				_includedVirtualPath = string.Empty;
				_transforms = new List<IItemTransform>();
			}
			_assetTypeCode = Constants.AssetTypeCode.Unknown;
			_isStylesheet = false;
			_isScript = false;
			_content = null;

			VirtualPath = virtualPath;
			VirtualPathDependencies = new List<string>();
			OriginalAssets = new List<IAsset>();
			Combined = false;
			Minified = false;
			RelativePathsResolved = false;
		}

		/// <summary>
		/// Applies a transformations to asset content
		/// </summary>
		/// <param name="content">Asset content</param>
		/// <returns>Processed asset content </returns>
		private string ApplyTransformsToContent(string content)
		{
			string newContent = content;

			if (_transforms.Count > 0)
			{
				foreach (IItemTransform transform in _transforms)
				{
					newContent = transform.Process(_includedVirtualPath, newContent);
				}
			}

			return newContent;
		}

		/// <summary>
		/// Checks a whether an asset is minified version of CSS-file
		/// with *.min.css extension
		/// </summary>
		/// <param name="assetVirtualPath">CSS-asset virtual file path</param>
		/// <returns>Checking result (true - with *.min.css extension;
		/// false - without *.min.css extension)</returns>
		public static bool IsCssFileWithMinExtension(string assetVirtualPath)
		{
			return _cssFileWithMinExtensionRegex.IsMatch(assetVirtualPath);
		}

		/// <summary>
		/// Checks a whether an asset is debug version of JS-file
		/// with *.debug.js extension
		/// </summary>
		/// <param name="assetVirtualPath">JS-asset virtual file path</param>
		/// <returns>Checking result (true - with *.debug.js extension;
		/// false - without *.debug.js extension)</returns>
		public static bool IsJsFileWithDebugExtension(string assetVirtualPath)
		{
			return _jsFileWithDebugExtensionRegex.IsMatch(assetVirtualPath);
		}

		/// <summary>
		/// Checks a whether an asset is minified version of JS-file with *.min.js extension
		/// </summary>
		/// <param name="assetVirtualPath">JS-asset virtual file path</param>
		/// <returns>Checking result (true - with *.min.js extension;
		/// false - without *.min.js extension)</returns>
		public static bool IsJsFileWithMinExtension(string assetVirtualPath)
		{
			return _jsFileWithMinExtensionRegex.IsMatch(assetVirtualPath);
		}

		/// <summary>
		/// Removes a additional file extension from path of the specified CSS-file
		/// </summary>
		/// <param name="assetVirtualPath">CSS-asset virtual file path</param>
		/// <returns>CSS-asset virtual file path without additional file extension</returns>
		public static string RemoveAdditionalCssFileExtension(string assetVirtualPath)
		{
			string newAssetVirtualPath = _cssFileWithMinExtensionRegex.Replace(assetVirtualPath,
				Constants.FileExtension.Css);

			return newAssetVirtualPath;
		}

		/// <summary>
		/// Removes a additional file extension from path of the specified JS-file
		/// </summary>
		/// <param name="assetVirtualPath">JS-asset virtual file path</param>
		/// <returns>JS-asset virtual file path without additional file extension</returns>
		public static string RemoveAdditionalJsFileExtension(string assetVirtualPath)
		{
			string newAssetVirtualPath = _jsFileWithDebugExtensionRegex.Replace(assetVirtualPath,
				Constants.FileExtension.JavaScript);
			newAssetVirtualPath = _jsFileWithMinExtensionRegex.Replace(newAssetVirtualPath,
				Constants.FileExtension.JavaScript);

			return newAssetVirtualPath;
		}
	}
}