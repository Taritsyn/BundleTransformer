namespace BundleTransformer.SassAndScss.Translators
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Text.RegularExpressions;
	using System.Web;

	using SassAndCoffee.Ruby.Sass;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using CoreStrings = Core.Resources.Strings;
	using Core.Resources;
	using Core.Translators;

	using Configuration;
	using SassAndScssStrings = Resources.Strings;

	/// <summary>
	/// Translator that responsible for translation of Sass- or SCSS-code to CSS-code
	/// </summary>
	public sealed class SassAndScssTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// CSS-file extension
		/// </summary>
		private const string CSS_FILE_EXTENSION = ".css";

		/// <summary>
		/// Sass-file extension
		/// </summary>
		private const string SASS_FILE_EXTENSION = ".sass";

		/// <summary>
		/// SCSS-file extension
		/// </summary>
		private const string SCSS_FILE_EXTENSION = ".scss";

		/// <summary>
		/// Regular expression for working with paths of imported Sass-files
		/// </summary>
		private static readonly Regex _importSassFilesRuleRegex =
			new Regex(@"@import\s+(?<urlList>(?<quote>'|"")?([a-zA-Z0-9а-яА-Я-_\s./?%&:;+=~]+)(\k<quote>)?(,\s+?(?<quote>'|"")?(?<url>[a-zA-Z0-9а-яА-Я-_\s./?%&:;+=~]+)(\k<quote>)?)*)",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with paths of imported SCSS-files
		/// </summary>
		private static readonly Regex _importScssFilesRuleRegex =
			new Regex(@"@import\s*(?<urlList>(?<quote>'|"")([a-zA-Z0-9а-яА-Я-_\s./?%&:;+=~]+)(\k<quote>)(,\s*?(?<quote>'|"")(?<url>[a-zA-Z0-9а-яА-Я-_\s./?%&:;+=~]+)(\k<quote>))*)",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Object HttpContext
		/// </summary>
		private readonly HttpContextBase _httpContext;

		/// <summary>
		/// File system wrapper
		/// </summary>
		private readonly IFileSystemWrapper _fileSystemWrapper;

		/// <summary>
		/// CSS relative path resolver
		/// </summary>
		private readonly ICssRelativePathResolver _cssRelativePathResolver;

		/// <summary>
		/// Configuration settings of Sass- and SCSS-translator
		/// </summary>
		private readonly SassAndScssSettings _sassAndScssConfig;

		/// <summary>
		/// Sass- and SCSS-compiler
		/// </summary>
		private readonly SassCompiler _sassCompiler;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of Sass- and SCSS-translator
		/// </summary>
		public SassAndScssTranslator()
			: this(new HttpContextWrapper(HttpContext.Current),
				BundleTransformerContext.Current.GetFileSystemWrapper(),
				BundleTransformerContext.Current.GetCssRelativePathResolver(),
				BundleTransformerContext.Current.GetSassAndScssConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Sass- and SCSS-translator
		/// </summary>
		/// <param name="httpContext">Object HttpContext</param>
		/// <param name="fileSystemWrapper">File system wrapper</param>
		/// <param name="cssRelativePathResolver">CSS relative path resolver</param>
		/// <param name="sassAndScssConfig">Configuration settings of Sass- and SCSS-translator</param>
		public SassAndScssTranslator(HttpContextBase httpContext, IFileSystemWrapper fileSystemWrapper,
			ICssRelativePathResolver cssRelativePathResolver, SassAndScssSettings sassAndScssConfig)
		{
			_httpContext = httpContext;
			_fileSystemWrapper = fileSystemWrapper;
			_cssRelativePathResolver = cssRelativePathResolver;
			_sassAndScssConfig = sassAndScssConfig;
			_sassCompiler = new SassCompiler();

			UseNativeMinification = _sassAndScssConfig.UseNativeMinification;
		}

		/// <summary>
		/// Destructs instance of Sass- and SCSS-translator
		/// </summary>
		~SassAndScssTranslator()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Translates code of asset written on Sass or SCSS to CSS-code
		/// </summary>
		/// <param name="asset">Asset with code written on Sass or SCSS</param>
		/// <returns>Asset with translated code</returns>
		public override IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "asset");
			}

			InnerTranslate(asset, NativeMinificationEnabled);

			return asset;
		}

		/// <summary>
		/// Translates code of assets written on Sass or SCSS to CSS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on Sass or SCSS</param>
		/// <returns>Set of assets with translated code</returns>
		public override IList<IAsset> Translate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			bool enableNativeMinification = NativeMinificationEnabled;

			foreach (var asset in assets.Where(a => a.AssetType == AssetType.Sass
				|| a.AssetType == AssetType.Scss))
			{
				InnerTranslate(asset, enableNativeMinification);
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, bool enableNativeMinification)
		{
			string assetTypeName = (asset.AssetType == AssetType.Scss) ? "SCSS" : "Sass";
			string newContent = string.Empty;
			string assetPath = asset.Path;
			var importedFilePaths = new List<string>();

			try
			{
				newContent = asset.Content;
				FillImportedFilePaths(newContent, asset.Url, importedFilePaths);

				newContent = _sassCompiler.Compile(assetPath, enableNativeMinification, new List<string>());
			}
			catch (FileNotFoundException)
			{
				throw;
			}
			catch (Exception e)
			{
				if (e.Message == "Sass::SyntaxError")
				{
					throw new AssetTranslationException(
						string.Format(SassAndScssStrings.Translators_SassAndScssTranslationSyntaxError,
							assetPath, assetTypeName), e);
				}
				else
				{
					throw new AssetTranslationException(
						string.Format(SassAndScssStrings.Translators_SassAndScssTranslationFailed,
							assetPath, assetTypeName), e);
				}
			}

			asset.Content = newContent;
			asset.Minified = enableNativeMinification;
			asset.RequiredFilePaths = importedFilePaths;
		}

		/// <summary>
		/// Fills the list of Sass- and SCSS-files, that were added to a Sass- or SCSS-asset 
		/// by using the @import directive
		/// </summary>
		/// <param name="assetContent">Text content of Sass- or SCSS-asset</param>
		/// <param name="assetUrl">URL of Sass- or SCSS-asset file</param>
		/// <param name="importedFilePaths">List of Sass- and SCSS-files, that were added to a 
		/// Sass- or SCSS-asset by using the @import directive</param>
		public void FillImportedFilePaths(string assetContent, string assetUrl, IList<string> importedFilePaths)
		{
			string assetExtension = Path.GetExtension(assetUrl);
			if (!string.IsNullOrEmpty(assetExtension))
			{
				assetExtension = assetExtension.ToLowerInvariant();
			}
			else
			{
				assetExtension = SASS_FILE_EXTENSION;
			}

			MatchCollection matches;
			if (string.Equals(assetExtension, SASS_FILE_EXTENSION, StringComparison.InvariantCultureIgnoreCase))
			{
				matches = _importSassFilesRuleRegex.Matches(assetContent);
			}
			else
			{
				matches = _importScssFilesRuleRegex.Matches(assetContent);
			}
			
			foreach (Match match in matches)
			{
				if (match.Groups["urlList"].Success)
				{
					string urlListString = match.Groups["urlList"].Value;
					if (!string.IsNullOrWhiteSpace(urlListString))
					{
						urlListString = urlListString
							.Replace(@"""", string.Empty)
							.Replace("'", string.Empty)
							;

						List<string> urlList = Utils.ConvertToStringCollection(urlListString, ',', true).ToList();
						foreach (string url in urlList)
						{
							string importedAssetUrl = _cssRelativePathResolver.ResolveRelativePath(
								assetUrl, url.Trim());
							string importedAssetExtension = Path.GetExtension(importedAssetUrl);

							if (string.Equals(importedAssetExtension, SASS_FILE_EXTENSION, StringComparison.InvariantCultureIgnoreCase)
								|| string.Equals(importedAssetExtension, SCSS_FILE_EXTENSION, StringComparison.InvariantCultureIgnoreCase))
							{
								string importedAssetPath = _httpContext.Server.MapPath(importedAssetUrl);
								if (_fileSystemWrapper.FileExists(importedAssetPath))
								{
									importedFilePaths.Add(importedAssetPath);

									string importedAssetContent = _fileSystemWrapper.GetFileTextContent(importedAssetPath);
									FillImportedFilePaths(importedAssetContent, importedAssetUrl, importedFilePaths);
								}
								else
								{
									throw new FileNotFoundException(
										string.Format(Strings.Common_FileNotExist, importedAssetPath));
								}
							}
							else if (!string.Equals(importedAssetExtension, CSS_FILE_EXTENSION, 
								StringComparison.InvariantCultureIgnoreCase))
							{
								string importedAssetPath = _httpContext.Server.MapPath(importedAssetUrl);

								string newImportedAssetExtension = assetExtension;
								string newImportedAssetUrl = importedAssetUrl + newImportedAssetExtension;
								string newImportedAssetPath = importedAssetPath + newImportedAssetExtension;
								bool newImportedAssetExists = _fileSystemWrapper.FileExists(newImportedAssetPath);

								if (!newImportedAssetExists)
								{
									newImportedAssetExtension = string.Equals(newImportedAssetExtension, SASS_FILE_EXTENSION,
										StringComparison.InvariantCultureIgnoreCase) ? SCSS_FILE_EXTENSION : SASS_FILE_EXTENSION;
									newImportedAssetUrl = importedAssetUrl + newImportedAssetExtension;
									newImportedAssetPath = importedAssetPath + newImportedAssetExtension;

									newImportedAssetExists = _fileSystemWrapper.FileExists(newImportedAssetPath);
								}

								if (newImportedAssetExists)
								{
									importedFilePaths.Add(newImportedAssetPath);

									string importedAssetContent = _fileSystemWrapper.GetFileTextContent(newImportedAssetPath);
									FillImportedFilePaths(importedAssetContent, newImportedAssetUrl, importedFilePaths);
								}
								else
								{
									throw new FileNotFoundException(
										string.Format(Strings.Common_FileNotExist, newImportedAssetPath));
								}
							}	
						}
					}
				}
			}
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public override void Dispose()
		{
			Dispose(true /* disposing */);
			GC.SuppressFinalize(this);
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		/// <param name="disposing">Flag, allowing destruction of 
		/// managed objects contained in fields of class</param>
		private void Dispose(bool disposing)
		{
			if (!_disposed)
			{
				_disposed = true;

				if (_sassCompiler != null)
				{
					_sassCompiler.Dispose();
				}
			}
		}
	}
}
