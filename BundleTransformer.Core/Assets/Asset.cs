namespace BundleTransformer.Core.Assets
{
	using System;
	using System.Collections.Generic;
	using System.Text.RegularExpressions;

	using FileSystem;
	using Web;

	/// <summary>
	/// Asset
	/// </summary>
	public sealed class Asset : IAsset
	{
		/// <summary>
		/// CSS-file extension
		/// </summary>
		private const string CSS_FILE_EXTENSION = ".css";

		/// <summary>
		/// JavaScript-file extension
		/// </summary>
		private const string JS_FILE_EXTENSION = ".js";
	
		/// <summary>
		/// Regular expression for web application root path
		/// </summary>
		private readonly Regex _applicationRootPathRegex;

		/// <summary>
		/// URL of web application root
		/// </summary>
		private readonly string _applicationRootUrl;

		/// <summary>
		/// File system wrapper
		/// </summary>
		private readonly IFileSystemWrapper _fileSystemWrapper;

		/// <summary>
		/// Regular expression to determine whether
		/// asset is CSS-file based on its extension
		/// </summary>
		private static readonly Regex _cssFileExtensionRegex = new Regex(@"\.css$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether 
		/// asset is JS-file based on its extension
		/// </summary>
		private static readonly Regex _jsFileExtensionRegex = new Regex(@"\.js$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether
		/// asset is LESS-file based on its extension
		/// </summary>
		private static readonly Regex _lessFileExtensionRegex = new Regex(@"\.less$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether
		/// asset is Sass-file based on its extension
		/// </summary>
		private static readonly Regex _sassFileExtensionRegex = new Regex(@"\.sass$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether
		/// asset is SCSS-file based on its extension
		/// </summary>
		private static readonly Regex _scssFileExtensionRegex = new Regex(@"\.scss$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled); 

		/// <summary>
		/// Regular expression to determine whether
		/// asset is CoffeeScript-file based on its extension
		/// </summary>
		private static readonly Regex _coffeeFileExtensionRegex = new Regex(@"\.coffee$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether
		/// asset is TypeScript-file based on its extension
		/// </summary>
		private static readonly Regex _tsFileExtensionRegex = new Regex(@"\.ts$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether asset is 
		/// minified version of CSS-file with *.min.css extension
		/// </summary>
		private static readonly Regex _cssFileWithMinExtensionRegex = new Regex(@"\.min\.css$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether asset is 
		/// debug version of JS-file with *.debug.js extension
		/// </summary>
		private static readonly Regex _jsFileWithDebugExtensionRegex = new Regex(@"\.debug\.js$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether asset is 
		/// minified version of JS-file with *.min.js extension
		/// </summary>
		private static readonly Regex _jsFileWithMinExtensionRegex = new Regex(@"\.min\.js$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Gets or sets path to asset file
		/// </summary>
		public string Path
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets paths to the required asset files
		/// </summary>
		public IList<string> RequiredFilePaths
		{
			get;
			set;
		}

		/// <summary>
		/// Gets URL of asset file
		/// </summary>
		public string Url
		{
			get
			{
				string url = _applicationRootPathRegex
					.Replace(Path, _applicationRootUrl)
					.Replace(@"\", @"/")
					;

				return url;
			}
		}

		/// <summary>
		/// Gets asset type
		/// </summary>
		public AssetType AssetType
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets or sets a flag indicating what text content of asset is minified
		/// </summary>
		public bool Minified
		{
			get;
			set;
		}

		private DateTime _lastModifyDateTimeUtc;
		/// <summary>
		/// Gets date and time, in coordinated universal time (UTC), of the last modification of asset
		/// </summary>
		public DateTime LastModifyDateTimeUtc
		{
			get { return _lastModifyDateTimeUtc; }
		}

		private string _content;
		/// <summary>
		/// Gets or sets text content of asset 
		/// </summary>
		public string Content
		{
			get
			{
				if (_content == null)
				{
					RefreshContent();
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
			get
			{
				AssetType assetType = AssetType;

				return (assetType == AssetType.Css 
					|| assetType == AssetType.Less
					|| assetType == AssetType.Sass
					|| assetType == AssetType.Scss);
			}
		}

		/// <summary>
		/// Gets a flag indicating what asset is a script
		/// </summary>
		public bool IsScript
		{
			get
			{
				AssetType assetType = AssetType;

				return (assetType == AssetType.JavaScript
					|| assetType == AssetType.CoffeeScript
					|| assetType == AssetType.TypeScript);
			}
		}


		/// <summary>
		/// Constructs instance of Asset
		/// </summary>
		/// <param name="path">Path to asset file</param>
		public Asset(string path) : this(path, BundleTransformerContext.Current.GetApplicationInfo(),
			BundleTransformerContext.Current.GetFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs instance of Asset
		/// </summary>
		/// <param name="path">Path to asset file</param>
		/// <param name="applicationInfo">Information about web application</param>
		/// <param name="fileSystemWrapper">File system wrapper</param>
		public Asset(string path, IHttpApplicationInfo applicationInfo, IFileSystemWrapper fileSystemWrapper)
		{
			_applicationRootPathRegex = new Regex("^" + Regex.Escape(applicationInfo.RootPath), 
				RegexOptions.IgnoreCase | RegexOptions.Compiled);
			_applicationRootUrl = applicationInfo.RootUrl;
			_fileSystemWrapper = fileSystemWrapper;

			Path = path;
			RequiredFilePaths = new List<string>();
			Minified = false;
			Content = null;
			AssetType = GetAssetType(Path);
		}


		/// <summary>
		/// Reads text content from asset file
		/// </summary>
		public void RefreshContent()
		{
			_lastModifyDateTimeUtc = _fileSystemWrapper.GetFileLastWriteTimeUtc(Path);
			_content = _fileSystemWrapper.GetFileTextContent(Path);
		}

		/// <summary>
		/// Determines type of asset
		/// </summary>
		/// <param name="assetPath">Path to asset file</param>
		/// <returns>Asset type</returns>
		public static AssetType GetAssetType(string assetPath)
		{
			AssetType assetType = AssetType.Unknown;

			if (_cssFileExtensionRegex.IsMatch(assetPath))
			{
				assetType = AssetType.Css;
			}
			else if (_jsFileExtensionRegex.IsMatch(assetPath))
			{
				assetType = AssetType.JavaScript;
			}
			else if (_lessFileExtensionRegex.IsMatch(assetPath))
			{
				assetType = AssetType.Less;
			}
			else if (_sassFileExtensionRegex.IsMatch(assetPath))
			{
				assetType = AssetType.Sass;
			}
			else if (_scssFileExtensionRegex.IsMatch(assetPath))
			{
				assetType = AssetType.Scss;
			}
			else if (_coffeeFileExtensionRegex.IsMatch(assetPath))
			{
				assetType = AssetType.CoffeeScript;
			}
			else if (_tsFileExtensionRegex.IsMatch(assetPath))
			{
				assetType = AssetType.TypeScript;
			}

			return assetType;
		}

		/// <summary>
		/// Checks whether an asset is minified version of CSS-file 
		/// with *.min.css extension
		/// </summary>
		/// <param name="assetPath">CSS-asset file path</param>
		/// <returns>Checking result (true - with *.min.css extension; 
		/// false - without *.min.css extension)</returns>
		public static bool IsCssFileWithMinExtension(string assetPath)
		{
			return _cssFileWithMinExtensionRegex.IsMatch(assetPath);
		}

		/// <summary>
		/// Checks whether an asset is debug version of JS-file 
		/// with *.debug.js extension
		/// </summary>
		/// <param name="assetPath">JS-asset file path</param>
		/// <returns>Checking result (true - with *.debug.js extension;
		/// false - without *.debug.js extension)</returns>
		public static bool IsJsFileWithDebugExtension(string assetPath)
		{
			return _jsFileWithDebugExtensionRegex.IsMatch(assetPath);
		}

		/// <summary>
		/// Checks whether an asset is minified version of JS-file with *.min.js extension
		/// </summary>
		/// <param name="assetPath">JS-asset file path</param>
		/// <returns>Checking result (true - with *.min.js extension;
		/// false - without *.min.js extension)</returns>
		public static bool IsJsFileWithMinExtension(string assetPath)
		{
			return _jsFileWithMinExtensionRegex.IsMatch(assetPath);
		}

		/// <summary>
		/// Removes additional file extension from path of the specified CSS-file
		/// </summary>
		/// <param name="assetPath">CSS-asset file path</param>
		/// <returns>CSS-asset file path without additional file extension</returns>
		public static string RemoveAdditionalCssFileExtension(string assetPath)
		{
			string newAssetPath = _cssFileWithMinExtensionRegex.Replace(assetPath, CSS_FILE_EXTENSION);

			return newAssetPath;
		}

		/// <summary>
		/// Removes additional file extension from path of the specified JS-file
		/// </summary>
		/// <param name="assetPath">JS-asset file path</param>
		/// <returns>JS-asset file path without additional file extension</returns>
		public static string RemoveAdditionalJsFileExtension(string assetPath)
		{
			string newAssetPath = _jsFileWithDebugExtensionRegex.Replace(assetPath, JS_FILE_EXTENSION);
			newAssetPath = _jsFileWithMinExtensionRegex.Replace(newAssetPath, JS_FILE_EXTENSION);

			return newAssetPath;
		}
	}
}