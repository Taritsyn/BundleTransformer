namespace BundleTransformer.Less.Translators
{
	using System;
	using System.Collections;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Text.RegularExpressions;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Translators;
	using CoreStrings = Core.Resources.Strings;

	using Compilers;
	using Configuration;
	using Constants;

	/// <summary>
	/// Translator that responsible for translation of LESS-code to CSS-code
	/// </summary>
	public sealed class LessTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// Name of input code type
		/// </summary>
		const string INPUT_CODE_TYPE = "LESS";

		/// <summary>
		/// Name of output code type
		/// </summary>
		const string OUTPUT_CODE_TYPE = "CSS";

		/// <summary>
		/// Regular expression for working with paths of imported LESS-files
		/// </summary>
		private static readonly Regex _importLessFilesRuleRegex =
			new Regex(@"@import\s+(?:\((?<type>(less|css))\)\s*)?" +
				@"(?:(?:(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>))" +
				@"|(?:url\(((?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
				@"|(?<url>[\w\-+.:,;/?&=%~#$@\[\]{}]+))\)))",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Relative path resolver
		/// </summary>
		private readonly IRelativePathResolver _relativePathResolver;

		/// <summary>
		/// Asset content cache
		/// </summary>
		private readonly Hashtable _assetContentCache;

		/// <summary>
		/// Synchronizer of translation
		/// </summary>
		private readonly object _translationSynchronizer = new object();


		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		public LessTranslator()
			: this(BundleTransformerContext.Current.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.GetCommonRelativePathResolver(),
				BundleTransformerContext.Current.GetLessConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="relativePathResolver">Relative path resolver</param>
		/// <param name="lessConfig">Configuration settings of LESS-translator</param>
		public LessTranslator(IVirtualFileSystemWrapper virtualFileSystemWrapper,
			IRelativePathResolver relativePathResolver,
			LessSettings lessConfig)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_relativePathResolver = relativePathResolver;
			_assetContentCache = new Hashtable();

			UseNativeMinification = lessConfig.UseNativeMinification;
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
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			lock (_translationSynchronizer)
			{
				bool enableNativeMinification = NativeMinificationEnabled;
				CompilationOptions options = CreateCompilationOptions(enableNativeMinification);
				var lessCompiler = new LessCompiler(options);

				ClearAssetContentCache();

				try
				{
					InnerTranslate(asset, lessCompiler, enableNativeMinification);
				}
				finally
				{
					lessCompiler.Dispose();
					ClearAssetContentCache();
				}
			}

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

			var assetsToProcessing = assets.Where(a => a.AssetType == AssetType.Less).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			lock (_translationSynchronizer)
			{
				bool enableNativeMinification = NativeMinificationEnabled;
				CompilationOptions options = CreateCompilationOptions(enableNativeMinification);
				var lessCompiler = new LessCompiler(options);

				ClearAssetContentCache();

				try
				{
					foreach (var asset in assetsToProcessing)
					{
						InnerTranslate(asset, lessCompiler, enableNativeMinification);
					}
				}
				finally
				{
					lessCompiler.Dispose();
					ClearAssetContentCache();
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, LessCompiler lessCompiler, bool enableNativeMinification)
		{
			string newContent;
			string assetVirtualPath = asset.VirtualPath;
			string assetUrl = asset.Url;
			var dependencies = new List<Dependency>();

			try
			{
				newContent = GetAssetFileTextContent(assetUrl);
				FillDependencies(assetUrl, newContent, assetUrl, dependencies);

				newContent = lessCompiler.Compile(newContent, assetUrl, dependencies);
			}
			catch (FileNotFoundException)
			{
				throw;
			}
			catch (LessCompilingException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetVirtualPath, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetVirtualPath, e.Message), e);
			}

			asset.Content = newContent;
			asset.Minified = enableNativeMinification;
			asset.VirtualPathDependencies = dependencies
				.Select(d => d.VirtualPath)
				.Distinct()
				.ToList()
				;
		}

		/// <summary>
		/// Creates a compilation options
		/// </summary>
		/// <param name="enableNativeMinification">Flag that indicating to use of native minification</param>
		/// <returns>Compilation options</returns>
		private CompilationOptions CreateCompilationOptions(bool enableNativeMinification)
		{
			var options = new CompilationOptions
			{
				EnableNativeMinification = enableNativeMinification
			};

			return options;
		}

		/// <summary>
		/// Transforms relative paths of imported stylesheets to absolute in LESS-code
		/// </summary>
		/// <param name="content">Text content of LESS-asset</param>
		/// <param name="path">LESS-file path</param>
		/// <returns>Processed text content of LESS-asset</returns>
		private string ResolveImportsRelativePaths(string content, string path)
		{
			return _importLessFilesRuleRegex.Replace(content, m =>
			{
				string result = m.Groups[0].Value;
				GroupCollection groups = m.Groups;

				if (groups["url"].Success)
				{
					string typeValue = groups["type"].Value;
					string urlValue = groups["url"].Value;
					string quoteValue = groups["quote"].Success ? groups["quote"].Value : @"""";

					string typeOption = (typeValue == "less") ? "(less) " : string.Empty;
					string absoluteUrl = _relativePathResolver.ResolveRelativePath(path, urlValue);
					string extension = Path.GetExtension(absoluteUrl);
					
					if (!FileExtensionHelper.IsLess(extension) && !FileExtensionHelper.IsCss(extension))
					{
						string newExtension = (typeValue == "css") ? FileExtension.Css : FileExtension.Less;
						absoluteUrl += newExtension;
					}

					result = string.Format("@import {0}{1}{2}{1}",
						typeOption,
						quoteValue,
						absoluteUrl
					);
				}

				return result;
			});
		}

		/// <summary>
		/// Fills the list of LESS-files, that were added to a LESS-asset 
		/// by using the @import directive
		/// </summary>
		/// <param name="rootAssetUrl">URL of root LESS-asset file</param>
		/// <param name="parentAssetContent">Text content of parent LESS-asset</param>
		/// <param name="parentAssetUrl">URL of parent LESS-asset file</param>
		/// <param name="dependencies">List of LESS-files, that were added to a 
		/// LESS-asset by using the @import directive</param>
		public void FillDependencies(string rootAssetUrl, string parentAssetContent, string parentAssetUrl, 
			IList<Dependency> dependencies)
		{
			if (parentAssetContent.Length == 0)
			{
				return;
			}

			MatchCollection matches = _importLessFilesRuleRegex.Matches(parentAssetContent);

			foreach (Match match in matches)
			{
				GroupCollection groups = match.Groups;

				if (groups["url"].Success)
				{
					string dependencyUrl = groups["url"].Value;
					string dependencyType = groups["type"].Value;

					if (!string.IsNullOrWhiteSpace(dependencyUrl))
					{
						if (string.Equals(dependencyUrl, rootAssetUrl, StringComparison.OrdinalIgnoreCase))
						{
							continue;
						}

						var duplicateDependency = GetDependencyByUrl(dependencies, dependencyUrl);
						bool isDuplicateDependency = (duplicateDependency != null);
						bool isEmptyDependency = isDuplicateDependency && (duplicateDependency.Content.Length == 0);

						if (!isDuplicateDependency || isEmptyDependency)
						{
							if (AssetFileExists(dependencyUrl))
							{
								string dependencyExtension = Path.GetExtension(dependencyUrl);
								string dependencyContent = string.Empty;

								if (FileExtensionHelper.IsLess(dependencyExtension)
									|| (FileExtensionHelper.IsCss(dependencyExtension) && dependencyType == "less"))
								{
									dependencyContent = GetAssetFileTextContent(dependencyUrl);
								}

								if (isEmptyDependency && dependencyContent.Length > 0)
								{
									duplicateDependency.Content = dependencyContent;
								}
								else
								{
									var dependency = new Dependency
									{
										VirtualPath = dependencyUrl,
										Url = dependencyUrl,
										Content = dependencyContent
									};
									dependencies.Add(dependency);
								}

								FillDependencies(rootAssetUrl, dependencyContent, dependencyUrl, dependencies);
							}
							else
							{
								throw new FileNotFoundException(
									string.Format(CoreStrings.Common_FileNotExist, dependencyUrl));
							}
						}
					}
				}
			}
		}

		/// <summary>
		/// Gets a dependency by URL
		/// </summary>
		/// <param name="dependencies">List of dependencies</param>
		/// <param name="url">URL of dependency</param>
		/// <returns>Dependency</returns>
		private static Dependency GetDependencyByUrl(IEnumerable<Dependency> dependencies, string url)
		{
			var urlInUpperCase = url.ToUpperInvariant();
			var dependency = dependencies
				.SingleOrDefault(d => d.Url.ToUpperInvariant() == urlInUpperCase)
				;

			return dependency;
		}

		/// <summary>
		/// Generates asset content cache item key
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <returns>Asset content cache item key</returns>
		private string GenerateAssetContentCacheItemKey(string assetUrl)
		{
			string key = assetUrl.Trim().ToUpperInvariant();

			return key;
		}

		/// <summary>
		/// Gets text content of asset
		/// </summary>
		/// <param name="assetUrl">URL to asset file</param>
		/// <returns>Text content of asset</returns>
		private string GetAssetFileTextContent(string assetUrl)
		{
			string key = GenerateAssetContentCacheItemKey(assetUrl);
			string assetContent;

			if (_assetContentCache.ContainsKey(key))
			{
				assetContent = (string)_assetContentCache[key];
			}
			else
			{
				assetContent = _virtualFileSystemWrapper.GetFileTextContent(assetUrl);
				assetContent = ResolveImportsRelativePaths(assetContent, assetUrl);

				_assetContentCache.Add(key, assetContent);
			}

			return assetContent;
		}

		/// <summary>
		/// Determines whether the specified asset file exists
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		private bool AssetFileExists(string assetUrl)
		{
			string key = GenerateAssetContentCacheItemKey(assetUrl);
			bool result;

			if (_assetContentCache.ContainsKey(key))
			{
				result = true;
			}
			else
			{
				result = _virtualFileSystemWrapper.FileExists(assetUrl);
			}

			return result;
		}

		/// <summary>
		/// Clears asset content cache
		/// </summary>
		private void ClearAssetContentCache()
		{
			if (_assetContentCache != null)
			{
				_assetContentCache.Clear();
			}
		}
	}
}