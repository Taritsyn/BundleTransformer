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
		/// CSS-file extension
		/// </summary>
		private const string CSS_FILE_EXTENSION = ".css";

		/// <summary>
		/// JavaScript-file extension
		/// </summary>
		private const string JS_FILE_EXTENSION = ".js";
	
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
		/// asset is Literate CoffeeScript-file based on its extension
		/// </summary>
		private static readonly Regex _litcoffeeFileExtensionRegex = new Regex(@"\.litcoffee$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether
		/// asset is CoffeeScript Markdown-file based on its extension
		/// </summary>
		private static readonly Regex _coffeeMdFileExtensionRegex = new Regex(@"\.coffee\.md$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether
		/// asset is TypeScript-file based on its extension
		/// </summary>
		private static readonly Regex _tsFileExtensionRegex = new Regex(@"\.ts$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to determine whether
		/// asset is Handlebars template-file based on its extension
		/// </summary>
		private static readonly Regex _handlebarsFileExtensionRegex = new Regex(@"\.handlebars$|\.hbs$",
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
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Text content of asset
		/// </summary>
		private string _content;

		/// <summary>
		/// List of asset transformations
		/// </summary>
		private readonly IList<IItemTransform> _transforms;

		/// <summary>
		/// Included virtual path
		/// </summary>
		private readonly string _includedVirtualPath;

		/// <summary>
		/// Gets or sets a virtual path to asset file
		/// </summary>
		public string VirtualPath
		{
			get;
			set;
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
		/// Gets a asset type
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
					|| assetType == AssetType.LiterateCoffeeScript
					|| assetType == AssetType.CoffeeScriptMarkdown
					|| assetType == AssetType.TypeScript
					|| assetType == AssetType.Handlebars);
			}
		}


		/// <summary>
		/// Constructs instance of Asset
		/// </summary>
		/// <param name="virtualPath">Virtual path to asset file</param>
		public Asset(string virtualPath)
			: this(virtualPath, string.Empty, null, 
				BundleTransformerContext.Current.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs instance of Asset
		/// </summary>
		/// <param name="virtualPath">Virtual path to asset file</param>
		/// <param name="virtualFileSystemWrapper">file system wrapper</param>
		public Asset(string virtualPath, IVirtualFileSystemWrapper virtualFileSystemWrapper)
			: this(virtualPath, string.Empty, null, virtualFileSystemWrapper)
		{ }

		/// <summary>
		/// Constructs instance of Asset
		/// </summary>
		/// <param name="virtualPath">Virtual path to asset file</param>
		/// <param name="includedVirtualPath">Included virtual path</param>
		/// <param name="transforms">List of asset transformations</param>
		public Asset(string virtualPath, string includedVirtualPath, IList<IItemTransform> transforms)
			: this(virtualPath, includedVirtualPath, transforms, 
				BundleTransformerContext.Current.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs instance of Asset
		/// </summary>
		/// <param name="virtualPath">Virtual path to asset file</param>
		/// <param name="includedVirtualPath">Included virtual path</param>
		/// <param name="transforms">List of asset transformations</param>
		/// <param name="virtualFileSystemWrapper">file system wrapper</param>
		public Asset(string virtualPath, string includedVirtualPath, IList<IItemTransform> transforms, 
			IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			_includedVirtualPath = includedVirtualPath;
			_transforms = transforms ?? new List<IItemTransform>();
			_virtualFileSystemWrapper = virtualFileSystemWrapper;

			VirtualPath = virtualPath;
			VirtualPathDependencies = new List<string>();
			AssetType = GetAssetType(virtualPath);
			Minified = false;
			RelativePathsResolved = false;
			Content = null;
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
		/// Determines type of asset
		/// </summary>
		/// <param name="assetVirtualPath">Virtual path to asset file</param>
		/// <returns>Asset type</returns>
		public static AssetType GetAssetType(string assetVirtualPath)
		{
			var assetType = AssetType.Unknown;

			if (_cssFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.Css;
			}
			else if (_jsFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.JavaScript;
			}
			else if (_lessFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.Less;
			}
			else if (_sassFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.Sass;
			}
			else if (_scssFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.Scss;
			}
			else if (_coffeeFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.CoffeeScript;
			}
			else if (_litcoffeeFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.LiterateCoffeeScript;
			}
			else if (_coffeeMdFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.CoffeeScriptMarkdown;
			}
			else if (_tsFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.TypeScript;
			}
			else if (_handlebarsFileExtensionRegex.IsMatch(assetVirtualPath))
			{
				assetType = AssetType.Handlebars;
			}

			return assetType;
		}

		/// <summary>
		/// Checks whether an asset is minified version of CSS-file 
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
		/// Checks whether an asset is debug version of JS-file 
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
		/// Checks whether an asset is minified version of JS-file with *.min.js extension
		/// </summary>
		/// <param name="assetVirtualPath">JS-asset virtual file path</param>
		/// <returns>Checking result (true - with *.min.js extension;
		/// false - without *.min.js extension)</returns>
		public static bool IsJsFileWithMinExtension(string assetVirtualPath)
		{
			return _jsFileWithMinExtensionRegex.IsMatch(assetVirtualPath);
		}

		/// <summary>
		/// Removes additional file extension from path of the specified CSS-file
		/// </summary>
		/// <param name="assetVirtualPath">CSS-asset virtual file path</param>
		/// <returns>CSS-asset virtual file path without additional file extension</returns>
		public static string RemoveAdditionalCssFileExtension(string assetVirtualPath)
		{
			string newAssetVirtualPath = _cssFileWithMinExtensionRegex.Replace(assetVirtualPath, CSS_FILE_EXTENSION);

			return newAssetVirtualPath;
		}

		/// <summary>
		/// Removes additional file extension from path of the specified JS-file
		/// </summary>
		/// <param name="assetVirtualPath">JS-asset virtual file path</param>
		/// <returns>JS-asset virtual file path without additional file extension</returns>
		public static string RemoveAdditionalJsFileExtension(string assetVirtualPath)
		{
			string newAssetVirtualPath = _jsFileWithDebugExtensionRegex.Replace(assetVirtualPath, JS_FILE_EXTENSION);
			newAssetVirtualPath = _jsFileWithMinExtensionRegex.Replace(newAssetVirtualPath, JS_FILE_EXTENSION);

			return newAssetVirtualPath;
		}
	}
}