namespace BundleTransformer.Less.Translators
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Text.RegularExpressions;
	using System.Web;

	using dotless.Core;
	using dotless.Core.configuration;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Resources;
	using Core.Translators;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using LessStrings = Resources.Strings;

	/// <summary>
	/// Translator that responsible for translation of LESS-code to CSS-code
	/// </summary>
	public sealed class LessTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// CSS-file extension
		/// </summary>
		private const string CSS_FILE_EXTENSION = ".css";

		/// <summary>
		/// LESS-file extension
		/// </summary>
		private const string LESS_FILE_EXTENSION = ".less";

		/// <summary>
		/// Regular expression for working with paths of imported LESS-files
		/// </summary>
		private static readonly Regex _importLessFilesRuleRegex =
			new Regex(@"@import\s(?<quote>'|"")(?<url>[a-zA-Z0-9а-яА-Я-_\s./?%&:;+=~]+)(\k<quote>)",
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
		/// Constructs instance of LESS-translator
		/// </summary>
		public LessTranslator()
			: this(new HttpContextWrapper(HttpContext.Current), 
				BundleTransformerContext.Current.GetFileSystemWrapper(),
				BundleTransformerContext.Current.GetCssRelativePathResolver(), 
				BundleTransformerContext.Current.GetLessConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		/// <param name="httpContext">Object HttpContext</param>
		/// <param name="fileSystemWrapper">File system wrapper</param>
		/// <param name="cssRelativePathResolver">CSS relative path resolver</param>
		/// <param name="lessConfig">Configuration settings of LESS-translator</param>
		public LessTranslator(HttpContextBase httpContext, IFileSystemWrapper fileSystemWrapper, 
			ICssRelativePathResolver cssRelativePathResolver, LessSettings lessConfig)
		{
			_httpContext = httpContext;
			_fileSystemWrapper = fileSystemWrapper;
			_cssRelativePathResolver = cssRelativePathResolver;

			UseNativeMinification = lessConfig.UseNativeMinification;
		}


		/// <summary>
		/// Creates instance of LESS-engine
		/// </summary>
		/// <param name="enableNativeMinification">Enables native minification</param>
		/// <returns>LESS-engine</returns>
		private ILessEngine CreateLessEngine(bool enableNativeMinification)
		{
			DotlessConfiguration lessEngineConfig = DotlessConfiguration.GetDefault();
			lessEngineConfig.MapPathsToWeb = false;
			lessEngineConfig.CacheEnabled = false;
			lessEngineConfig.DisableUrlRewriting = true;
			lessEngineConfig.Web = false;
			lessEngineConfig.MinifyOutput = enableNativeMinification;
			lessEngineConfig.LessSource = typeof(VirtualFileReader);

			var lessEngineFactory = new EngineFactory(lessEngineConfig);
			ILessEngine lessEngine = lessEngineFactory.GetEngine();

			return lessEngine;
		}

		/// <summary>
		/// Translates code of asset written on LESS to CSS-code
		/// </summary>
		/// <param name="asset">Asset with code written on LESS</param>
		/// <returns>Asset with translated code</returns>
		public override IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "asset");
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			ILessEngine lessEngine = CreateLessEngine(enableNativeMinification);

			InnerTranslate(asset, lessEngine, enableNativeMinification);

			return asset;
		}

		/// <summary>
		/// Translates code of assets written on LESS to CSS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on LESS</param>
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
			ILessEngine lessEngine = CreateLessEngine(enableNativeMinification);

			foreach (var asset in assets.Where(a => a.AssetType == AssetType.Less))
			{
				InnerTranslate(asset, lessEngine, enableNativeMinification);
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, ILessEngine lessEngine, bool enableNativeMinification)
		{
			string newContent;
			string assetPath = asset.Path;
			var importedFilePaths = new List<string>();

			try
			{
				newContent = _cssRelativePathResolver.ResolveImportsRelativePaths(asset.Content, asset.Url);
				FillImportedFilePaths(newContent, null, importedFilePaths);

				newContent = lessEngine.TransformToCss(newContent, null);
			}
			catch (FileNotFoundException)
			{
				throw;
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(LessStrings.Translators_LessTranslationFailed, assetPath), e);
			}

			if (string.IsNullOrEmpty(newContent))
			{
				throw new AssetTranslationException(
					string.Format(LessStrings.Translators_LessTranslationFailed, assetPath));
			}

			asset.Content = newContent;
			asset.Minified = enableNativeMinification;
			asset.RequiredFilePaths = importedFilePaths;
		}

		/// <summary>
		/// Fills the list of LESS-files, that were added to a LESS-asset 
		/// by using the @import directive
		/// </summary>
		/// <param name="assetContent">Text content of LESS-asset</param>
		/// <param name="assetUrl">URL of LESS-asset file</param>
		/// <param name="importedFilePaths">List of LESS-files, that were added to a 
		/// LESS-asset by using the @import directive</param>
		public void FillImportedFilePaths(string assetContent, string assetUrl, IList<string> importedFilePaths)
		{
			MatchCollection matches = _importLessFilesRuleRegex.Matches(assetContent);
			foreach (Match match in matches)
			{
				if (match.Groups["url"].Success)
				{
					string importedAssetUrl = match.Groups["url"].Value;
					if (!string.IsNullOrWhiteSpace(importedAssetUrl))
					{
						if (assetUrl != null)
						{
							importedAssetUrl = _cssRelativePathResolver.ResolveRelativePath(
								assetUrl, importedAssetUrl.Trim());
						}
						string importedAssetExtension = Path.GetExtension(importedAssetUrl);

						if (string.Equals(importedAssetExtension, LESS_FILE_EXTENSION, 
							StringComparison.InvariantCultureIgnoreCase))
						{
							string importedAssetPath = _httpContext.Server.MapPath(importedAssetUrl);
							if (_fileSystemWrapper.FileExists(importedAssetPath))
							{
								importedFilePaths.Add(importedAssetPath);

								string importedAssetContent = _fileSystemWrapper.GetFileTextContent(
									importedAssetPath);
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
							importedAssetUrl += LESS_FILE_EXTENSION;

							string importedAssetPath = _httpContext.Server.MapPath(importedAssetUrl);
							if (_fileSystemWrapper.FileExists(importedAssetPath))
							{
								importedFilePaths.Add(importedAssetPath);

								string importedAssetContent = _fileSystemWrapper.GetFileTextContent(
									importedAssetPath);
								FillImportedFilePaths(importedAssetContent, importedAssetUrl, importedFilePaths);
							}
							else
							{
								throw new FileNotFoundException(
									string.Format(Strings.Common_FileNotExist, importedAssetPath));
							}
						}
					}
				}
			}
		}
	}
}