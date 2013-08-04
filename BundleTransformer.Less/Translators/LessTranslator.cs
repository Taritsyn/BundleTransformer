namespace BundleTransformer.Less.Translators
{
	using System;
	using System.Collections;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Text;
	using System.Text.RegularExpressions;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Helpers;
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
		/// Max size of data-uri in IE8 (in kilobytes)
		/// </summary>
		const int DATA_URI_MAX_SIZE_IN_KBYTES = 32;

		/// <summary>
		/// Regular expression for working with paths of imported LESS-files
		/// </summary>
		private static readonly Regex _lessImportRuleRegex =
			new Regex(@"@import\s*(?:\((?<type>(less|css))\)\s*)?" +
				@"(?:(?:(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>))" +
				@"|(?:url\(((?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
				@"|(?<url>[\w\-+.:,;/?&=%~#$@\[\]{}]+))\)))",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with the <code>data-uri</code> functions of LESS
		/// </summary>
		private static readonly Regex _dataUriFunctionRegex =
			new Regex(@"data-uri\(\s*(?:(?<quote1>'|"")(?<mimeType>[\w\-+.;\/]+)(\k<quote1>)\s*,\s*)?" +
				@"(?<quote2>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote2>)\s*\)",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with the base64 option of data-uri
		/// </summary>
		private static readonly Regex _base64OptionRegex = new Regex(@";base64$", RegexOptions.Compiled);

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
		/// Gets or sets a flag for whether to enforce IE compatibility (IE8 data-uri)
		/// </summary>
		public bool IeCompat
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether math has to be within parenthesis
		/// </summary>
		public bool StrictMath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether units need to evaluate correctly
		/// </summary>
		public bool StrictUnits
		{
			get;
			set;
		}


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
			IeCompat = lessConfig.IeCompat;
			StrictMath = lessConfig.StrictMath;
			StrictUnits = lessConfig.StrictUnits;
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
			asset.RelativePathsResolved = true;
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
				EnableNativeMinification = enableNativeMinification,
				IeCompat = IeCompat,
				StrictMath = StrictMath,
				StrictUnits = StrictUnits
			};

			return options;
		}

		/// <summary>
		/// Preprocess a stylesheet content
		/// </summary>
		/// <param name="assetContent">Text content of LESS-asset</param>
		/// <param name="assetUrl">URL of LESS-asset file</param>
		/// <returns>Preprocessed text content of LESS-asset</returns>
		private string PreprocessStylesheet(string assetContent, string assetUrl)
		{
			int contentLength = assetContent.Length;
			if (contentLength == 0)
			{
				return assetContent;
			}

			MatchCollection importRuleMatches = _lessImportRuleRegex.Matches(assetContent);
			MatchCollection dataUriFunctionMatches = _dataUriFunctionRegex.Matches(assetContent);

			Match importRuleMatch = null;
			if (importRuleMatches.Count > 0)
			{
				importRuleMatch = importRuleMatches[0];
			}

			Match dataUriFunctionMatch = null;
			if (dataUriFunctionMatches.Count > 0)
			{
				dataUriFunctionMatch = dataUriFunctionMatches[0];
			}

			if (importRuleMatch == null && dataUriFunctionMatch == null)
			{
				return assetContent;
			}

			var contentBuilder = new StringBuilder();
			int endPosition = contentLength - 1;
			int currentPosition = 0;

			while (currentPosition <= endPosition)
			{
				bool isOtherContent = true;

				bool importRuleSuccess = (importRuleMatch != null && importRuleMatch.Success);
				int importRulePosition = importRuleSuccess ? importRuleMatch.Index : -1;

				bool dataUriFunctionSuccess = (dataUriFunctionMatch != null && dataUriFunctionMatch.Success);
				int dataUriFunctionPosition = dataUriFunctionSuccess ? dataUriFunctionMatch.Index : -1;

				if (importRuleSuccess && importRulePosition != -1 
					&& (dataUriFunctionPosition == -1 || importRulePosition < dataUriFunctionPosition))
				{
					string importRule = importRuleMatch.Value;

					ProcessOtherContent(contentBuilder, assetContent,
						ref currentPosition, importRulePosition);

					GroupCollection importRuleGroups = importRuleMatch.Groups;

					string type = importRuleGroups["type"].Value;
					string url = importRuleGroups["url"].Value.Trim();
					string quote = importRuleGroups["quote"].Success ?
						importRuleGroups["quote"].Value : @"""";

					string processedImportRule = ProcessImportRule(assetUrl, url, type, quote);

					contentBuilder.Append(processedImportRule);
					currentPosition += importRule.Length;
					isOtherContent = false;
					importRuleMatch = importRuleMatch.NextMatch();
				}
				else if (dataUriFunctionSuccess && dataUriFunctionPosition != -1)
				{
					string dataUriFunction = dataUriFunctionMatch.Value;

					ProcessOtherContent(contentBuilder, assetContent,
						ref currentPosition, dataUriFunctionPosition);

					GroupCollection dataUriFunctionGroups = dataUriFunctionMatch.Groups;

					string url = dataUriFunctionGroups["url"].Value.Trim();
					string mimeType = dataUriFunctionGroups["mimeType"].Value;

					string processedDataUriFunction = ProcessDataUriFunction(assetUrl, url, mimeType);

					contentBuilder.Append(processedDataUriFunction);
					currentPosition += dataUriFunction.Length;
					isOtherContent = false;
					dataUriFunctionMatch = dataUriFunctionMatch.NextMatch();
				}

				if (isOtherContent)
				{
					if (currentPosition > 0)
					{
						ProcessOtherContent(contentBuilder, assetContent, 
							ref currentPosition, endPosition + 1);
					}
					else
					{
						return assetContent;
					}
				}
			}

			return contentBuilder.ToString();
		}

		/// <summary>
		/// Process a LESS <code>@import</code> rule
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent LESS-asset file</param>
		/// <param name="assetUrl">URL of CSS-component</param>
		/// <param name="type">Stylesheet type</param>
		/// <param name="quote">Quote</param>
		/// <returns>Processed LESS <code>@import</code> rule</returns>
		private string ProcessImportRule(string parentAssetUrl, string assetUrl, string type, string quote)
		{
			string typeOption = (type == "less") ? "(less) " : string.Empty;
			string absoluteUrl = _relativePathResolver.ResolveRelativePath(parentAssetUrl, assetUrl);
			string extension = Path.GetExtension(absoluteUrl);

			if (!FileExtensionHelper.IsLess(extension) && !FileExtensionHelper.IsCss(extension))
			{
				string newExtension = (type == "css") ? FileExtension.Css : FileExtension.Less;
				absoluteUrl += newExtension;
			}

			string result = string.Format("@import {0}{1}{2}{1}",
				typeOption,
				quote,
				absoluteUrl
			);

			return result;
		}

		/// <summary>
		/// Process a <code>data-uri</code> function
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent LESS-asset file</param>
		/// <param name="assetUrl">URL of CSS-component</param>
		/// <param name="mimeType">MIME-type</param>
		/// <returns><code>data-uri</code> function result</returns>
		private string ProcessDataUriFunction(string parentAssetUrl, string assetUrl, string mimeType)
		{
			string absoluteUrl = _relativePathResolver.ResolveRelativePath(parentAssetUrl, assetUrl);

			if (!_virtualFileSystemWrapper.FileExists(absoluteUrl))
			{
				throw new FileNotFoundException(
					string.Format(CoreStrings.Common_FileNotExist, absoluteUrl));
			}

			bool useBase64;
			Encoding encoding;
			bool isTextContent;

			using (Stream fileStream = _virtualFileSystemWrapper.GetFileStream(absoluteUrl))
			{
				isTextContent = Utils.IsTextStream(fileStream, 256, out encoding);
			}

			if (!string.IsNullOrWhiteSpace(mimeType))
			{
				useBase64 = _base64OptionRegex.IsMatch(mimeType);
				if (!useBase64 && !isTextContent)
				{
					useBase64 = true;
					mimeType += ";base64";
				}
			}
			else
			{
				string fileExtension = Path.GetExtension(absoluteUrl);
				mimeType = MimeTypeHelpers.GetMimeType(fileExtension);
				if (string.IsNullOrWhiteSpace(mimeType))
				{
					throw new UnknownMimeTypeException(
						string.Format(CoreStrings.Common_UnknownMimeType, absoluteUrl));
				}

				useBase64 = !isTextContent;
				if (useBase64)
				{
					mimeType += ";base64";
				}
			}

			byte[] buffer = _virtualFileSystemWrapper.GetFileBinaryContent(absoluteUrl);
			int fileSizeInKb = buffer.Length / 1024;

			if (IeCompat && fileSizeInKb >= DATA_URI_MAX_SIZE_IN_KBYTES)
			{
				// IE8 cannot handle a data-uri larger than 32KB
				return string.Format(@"url(""{0}"")", absoluteUrl);
			}

			string fileContent;

			if (useBase64)
			{
				fileContent = Convert.ToBase64String(buffer);
			}
			else
			{
				fileContent = encoding.GetString(buffer);
				fileContent = Uri.EscapeUriString(fileContent);
			}

			string result = string.Format(@"url(""data:{0},{1}"")", mimeType, fileContent);

			return result;
		}


		/// <summary>
		/// Process a other stylesheet content
		/// </summary>
		/// <param name="contentBuilder">Content builder</param>
		/// <param name="assetContent">Text content of LESS-asset</param>
		/// <param name="currentPosition">Current position</param>
		/// <param name="nextPosition">Next position</param>
		private static void ProcessOtherContent(StringBuilder contentBuilder, string assetContent,
			ref int currentPosition, int nextPosition)
		{
			if (nextPosition > currentPosition)
			{
				string otherContent = assetContent.Substring(currentPosition,
					nextPosition - currentPosition);

				contentBuilder.Append(otherContent);
				currentPosition = nextPosition;
			}
		}

		/// <summary>
		/// Fills the list of LESS-files, that were added to a LESS-asset 
		/// by using the LESS <code>@import</code> rules
		/// </summary>
		/// <param name="rootAssetUrl">URL of root LESS-asset file</param>
		/// <param name="parentAssetContent">Text content of parent LESS-asset</param>
		/// <param name="parentAssetUrl">URL of parent LESS-asset file</param>
		/// <param name="dependencies">List of LESS-files, that were added to a 
		/// LESS-asset by using the LESS <code>@import</code> rules</param>
		public void FillDependencies(string rootAssetUrl, string parentAssetContent, string parentAssetUrl, 
			IList<Dependency> dependencies)
		{
			if (parentAssetContent.Length == 0)
			{
				return;
			}

			MatchCollection matches = _lessImportRuleRegex.Matches(parentAssetContent);

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
				assetContent = PreprocessStylesheet(assetContent, assetUrl);

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