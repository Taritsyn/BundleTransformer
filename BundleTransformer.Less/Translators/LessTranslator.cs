namespace BundleTransformer.Less.Translators
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.IO;
	using System.Linq;
	using System.Text;
	using System.Text.RegularExpressions;

	using JavaScriptEngineSwitcher.Core;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Helpers;
	using Core.Translators;
	using CoreStrings = Core.Resources.Strings;

	using Compilers;
	using Configuration;
	using Constants;
	using Helpers;

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
		/// Composite format string for <code>@import</code> rule
		/// </summary>
		const string IMPORT_RULE_FORMAT = "@import {0}{1}{2}{1}";

		/// <summary>
		/// Composite format string for <code>url</code> rule
		/// </summary>
		const string URL_RULE_FORMAT = @"url(""{0}"")";

		/// <summary>
		/// Composite format string for <code>url</code> rule with data URI scheme
		/// </summary>
		const string URL_RULE_WITH_DATA_URI_SCHEME_FORMAT = @"url(""data:{0},{1}"")";

		/// <summary>
		/// Regular expression for working with paths of imported LESS-files
		/// </summary>
		private static readonly Regex _lessImportRuleRegex =
			new Regex(@"@import\s*(?:\((?<type>(less|css|multiple|once))\)\s*)?" +
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
		/// Delegate that creates an instance of JavaScript engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Relative path resolver
		/// </summary>
		private readonly IRelativePathResolver _relativePathResolver;

		/// <summary>
		/// LESS-stylesheet cache
		/// </summary>
		private readonly Dictionary<string, LessStylesheet> _lessStylesheetCache;

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
		/// Gets or sets a output mode of the debug information
		/// </summary>
		public LineNumbersMode DumpLineNumbers
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		public LessTranslator()
			: this(null,
				BundleTransformerContext.Current.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.GetCommonRelativePathResolver(),
				BundleTransformerContext.Current.GetLessConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="relativePathResolver">Relative path resolver</param>
		/// <param name="lessConfig">Configuration settings of LESS-translator</param>
		public LessTranslator(Func<IJsEngine> createJsEngineInstance,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			IRelativePathResolver relativePathResolver,
			LessSettings lessConfig)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_relativePathResolver = relativePathResolver;
			_lessStylesheetCache = new Dictionary<string, LessStylesheet>();

			UseNativeMinification = lessConfig.UseNativeMinification;
			IeCompat = lessConfig.IeCompat;
			StrictMath = lessConfig.StrictMath;
			StrictUnits = lessConfig.StrictUnits;
			DumpLineNumbers = lessConfig.DumpLineNumbers;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = lessConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"less",
							@"
  * JavaScriptEngineSwitcher.Msie
  * JavaScriptEngineSwitcher.V8",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = (() =>
					JsEngineSwitcher.Current.CreateJsEngineInstance(jsEngineName));
			}
			_createJsEngineInstance = createJsEngineInstance;
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
				var lessCompiler = new LessCompiler(_createJsEngineInstance, options);

				ClearLessStylesheetCache();

				try
				{
					InnerTranslate(asset, lessCompiler, enableNativeMinification);
				}
				finally
				{
					lessCompiler.Dispose();
					ClearLessStylesheetCache();
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
				var lessCompiler = new LessCompiler(_createJsEngineInstance, options);

				ClearLessStylesheetCache();

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
					ClearLessStylesheetCache();
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, LessCompiler lessCompiler, bool enableNativeMinification)
		{
			string newContent;
			string assetUrl = asset.Url;
			var dependencies = new DependencyCollection();

			try
			{
				LessStylesheet stylesheet = GetLessStylesheet(asset);
				FillDependencies(assetUrl, stylesheet, dependencies);

				newContent = lessCompiler.Compile(stylesheet.Content, stylesheet.Url, dependencies);
			}
			catch (FileNotFoundException)
			{
				throw;
			}
			catch (LessCompilingException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetUrl, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetUrl, e.Message), e);
			}

			asset.Content = newContent;
			asset.Minified = enableNativeMinification;
			asset.RelativePathsResolved = true;
			asset.VirtualPathDependencies = dependencies
				.Where(d => d.IsObservable)
				.Select(d => d.Url)
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
				StrictUnits = StrictUnits,
				DumpLineNumbers = DumpLineNumbers
			};

			return options;
		}

		/// <summary>
		/// Preprocess a stylesheet content
		/// </summary>
		/// <param name="assetContent">Text content of LESS-asset</param>
		/// <param name="assetUrl">URL of LESS-asset file</param>
		/// <returns>Preprocessed text content of LESS-asset</returns>
		public LessStylesheet PreprocessStylesheet(string assetContent, string assetUrl)
		{
			var stylesheet = new LessStylesheet(assetUrl, assetContent);

			int contentLength = assetContent.Length;
			if (contentLength == 0)
			{
				return stylesheet;
			}

			MatchCollection importRuleMatches = _lessImportRuleRegex.Matches(assetContent);
			MatchCollection dataUriFunctionMatches = _dataUriFunctionRegex.Matches(assetContent);

			if (importRuleMatches.Count == 0 && dataUriFunctionMatches.Count == 0)
			{
				return stylesheet;
			}

			var nodeMatches = new List<LessNodeMatch>();

			foreach (Match importRuleMatch in importRuleMatches)
			{
				var nodeMatch = new LessNodeMatch(importRuleMatch.Index, 
					LessNodeType.ImportRule, 
					importRuleMatch);
				nodeMatches.Add(nodeMatch);
			}
		
			foreach (Match dataUriFunctionMatch in dataUriFunctionMatches)
			{
				var nodeMatch = new LessNodeMatch(dataUriFunctionMatch.Index,
					LessNodeType.DataUriFunction,
					dataUriFunctionMatch);
				nodeMatches.Add(nodeMatch);
			}

			MatchCollection multilineCommentMatches = CommonRegExps.CStyleMultilineCommentRegex.Matches(assetContent);

			foreach (Match multilineCommentMatch in multilineCommentMatches)
			{
				var nodeMatch = new LessNodeMatch(multilineCommentMatch.Index, 
					LessNodeType.MultilineComment, 
					multilineCommentMatch);
				nodeMatches.Add(nodeMatch);
			}

			nodeMatches = nodeMatches
				.OrderBy(n => n.Position)
				.ToList()
				;

			var contentBuilder = new StringBuilder();
			int endPosition = contentLength - 1;
			int currentPosition = 0;

			foreach (LessNodeMatch nodeMatch in nodeMatches)
			{
				LessNodeType nodeType = nodeMatch.NodeType;
				int nodePosition = nodeMatch.Position;
				Match match = nodeMatch.Match;

				if (nodePosition < currentPosition)
				{
					continue;
				}

				if (nodeType == LessNodeType.ImportRule || nodeType == LessNodeType.DataUriFunction)
				{
					ProcessOtherContent(contentBuilder, assetContent,
						ref currentPosition, nodePosition);

					int startLinePosition;
					int endLinePosition;
					string currentLine = SourceCodeNavigator.GetCurrentLine(assetContent, nodePosition,
						out startLinePosition, out endLinePosition);
					int localNodePosition = nodePosition - startLinePosition;

					if (StylesheetHelpers.IncludedInSinglelineComment(currentLine, localNodePosition))
					{
						int nextPosition = (endLinePosition < endPosition) ? endLinePosition + 1 : endPosition;

						ProcessOtherContent(contentBuilder, assetContent,
							ref currentPosition, nextPosition);
						continue;
					}

					if (nodeType == LessNodeType.ImportRule)
					{
						GroupCollection importRuleGroups = match.Groups;

						string type = importRuleGroups["type"].Value;
						string url = importRuleGroups["url"].Value.Trim();
						string quote = importRuleGroups["quote"].Success ?
							importRuleGroups["quote"].Value : @"""";
						LessImport processedImport;

						string importRule = match.Value;
						string processedImportRule = ProcessImportRule(assetUrl, url, type, quote,
							out processedImport);

						if (processedImport != null)
						{
							var imports = stylesheet.Imports;
							string importType = processedImport.ImportType;
							string urlInUpperCase = processedImport.Url.ToUpperInvariant();

							if (imports.Count(i => i.Url.ToUpperInvariant() == urlInUpperCase
								&& i.ImportType == importType) == 0)
							{
								imports.Add(processedImport);
							}
						}

						contentBuilder.Append(processedImportRule);
						currentPosition += importRule.Length;
					}
					else if (nodeType == LessNodeType.DataUriFunction)
					{
						GroupCollection dataUriFunctionGroups = match.Groups;

						string url = dataUriFunctionGroups["url"].Value.Trim();
						string mimeType = dataUriFunctionGroups["mimeType"].Value;
						string processedDataUriFunctionAssetUrl;

						string dataUriFunction = match.Value;
						string processedDataUriFunction = ProcessDataUriFunction(assetUrl, url, mimeType,
							out processedDataUriFunctionAssetUrl);

						if (!string.IsNullOrWhiteSpace(processedDataUriFunctionAssetUrl))
						{
							var dataUriFunctionAssetUrls = stylesheet.DataUriFunctionAssetUrls;
							string urlInUpperCase = processedDataUriFunctionAssetUrl.ToUpperInvariant();

							if (dataUriFunctionAssetUrls.Count(u => u.ToUpperInvariant() == urlInUpperCase) == 0)
							{
								dataUriFunctionAssetUrls.Add(processedDataUriFunctionAssetUrl);
							}
						}

						contentBuilder.Append(processedDataUriFunction);
						currentPosition += dataUriFunction.Length;
					}
				}
				else if (nodeType == LessNodeType.MultilineComment)
				{
					int nextPosition = nodePosition + match.Length;

					ProcessOtherContent(contentBuilder, assetContent,
						ref currentPosition, nextPosition);
				}
			}

			if (currentPosition > 0 && currentPosition <= endPosition)
			{
				ProcessOtherContent(contentBuilder, assetContent,
					ref currentPosition, endPosition + 1);
			}

			stylesheet.Content = contentBuilder.ToString();

			return stylesheet;
		}

		/// <summary>
		/// Process a LESS <code>@import</code> rule
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent LESS-asset file</param>
		/// <param name="assetUrl">URL of LESS-asset file</param>
		/// <param name="type">Stylesheet type</param>
		/// <param name="quote">Quote</param>
		/// <param name="processedImport">Processed LESS-import</param>
		/// <returns>Processed LESS <code>@import</code> rule</returns>
		private string ProcessImportRule(string parentAssetUrl, string assetUrl, string type, string quote,
			out LessImport processedImport)
		{
			string result;
			processedImport = null;

			if (UrlHelpers.StartsWithDataUriScheme(assetUrl))
			{
				result = string.Format(IMPORT_RULE_FORMAT, string.Empty, quote, assetUrl);

				return result;
			}

			if (UrlHelpers.StartsWithProtocol(assetUrl))
			{
				result = string.Format(IMPORT_RULE_FORMAT, string.Empty, quote, assetUrl);
				processedImport = new LessImport(assetUrl);

				return result;
			}

			string typeOption = (!string.IsNullOrWhiteSpace(type) && type != "css") ? 
				string.Format("({0}) ", type) : string.Empty;
			string absoluteUrl = _relativePathResolver.ResolveRelativePath(parentAssetUrl, assetUrl);
			string extension = Path.GetExtension(absoluteUrl);

			if (!FileExtensionHelpers.IsLess(extension) && !FileExtensionHelpers.IsCss(extension))
			{
				string newExtension = (type == "css") ? FileExtension.Css : FileExtension.Less;
				absoluteUrl += newExtension;
			}

			result = string.Format(IMPORT_RULE_FORMAT, typeOption, quote, absoluteUrl);
			processedImport = new LessImport(absoluteUrl, type);

			return result;
		}

		/// <summary>
		/// Process a <code>data-uri</code> function
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent LESS-asset file</param>
		/// <param name="assetUrl">URL of CSS-component</param>
		/// <param name="mimeType">MIME-type</param>
		/// <param name="processedDataUriFunctionAssetUrl">Processed asset URL 
		/// from <code>data-uri</code> function</param>
		/// <returns><code>data-uri</code> function result</returns>
		private string ProcessDataUriFunction(string parentAssetUrl, string assetUrl, string mimeType,
			out string processedDataUriFunctionAssetUrl)
		{
			string result;
			processedDataUriFunctionAssetUrl = string.Empty;

			if (UrlHelpers.StartsWithProtocol(assetUrl) || UrlHelpers.StartsWithDataUriScheme(assetUrl))
			{
				return string.Format(URL_RULE_FORMAT, assetUrl);
			}

			string absoluteUrl = _relativePathResolver.ResolveRelativePath(parentAssetUrl, assetUrl);

			if (!_virtualFileSystemWrapper.FileExists(absoluteUrl))
			{
				throw new FileNotFoundException(
					string.Format(CoreStrings.Common_FileNotExist, absoluteUrl));
			}

			bool useBase64;
			Encoding encoding;
			bool isTextContent = _virtualFileSystemWrapper.IsTextFile(absoluteUrl, 256, out encoding);

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
				result = string.Format(URL_RULE_FORMAT, absoluteUrl);
				processedDataUriFunctionAssetUrl = absoluteUrl;

				return result;
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

			result = string.Format(URL_RULE_WITH_DATA_URI_SCHEME_FORMAT, mimeType, fileContent);
			processedDataUriFunctionAssetUrl = absoluteUrl;

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
		/// <param name="parentStylesheet">Parent LESS-stylesheet</param>
		/// <param name="dependencies">List of LESS-files, that were added to a 
		/// LESS-asset by using the LESS <code>@import</code> rules</param>
		public void FillDependencies(string rootAssetUrl, LessStylesheet parentStylesheet, DependencyCollection dependencies)
		{
			foreach (string dataUriFunctionImageUrl in parentStylesheet.DataUriFunctionAssetUrls)
			{
				var dependency = new Dependency(dataUriFunctionImageUrl, string.Empty);
				dependencies.Add(dependency);
			}

			foreach (LessImport import in parentStylesheet.Imports)
			{
				string dependencyUrl = import.Url;
				string dependencyType = import.ImportType;

				if (UrlHelpers.StartsWithProtocol(dependencyUrl))
				{
					if (!dependencies.ContainsUrl(dependencyUrl))
					{
						var dependency = new Dependency(dependencyUrl, string.Empty, false);
						dependencies.Add(dependency);
					}

					continue;
				}

				if (string.Equals(dependencyUrl, rootAssetUrl, StringComparison.OrdinalIgnoreCase))
				{
					continue;
				}

				var duplicateDependency = dependencies.GetByUrl(dependencyUrl);
				bool isDuplicateDependency = (duplicateDependency != null);
				bool isEmptyDependency = isDuplicateDependency && (duplicateDependency.Content.Length == 0);

				if (!isDuplicateDependency || isEmptyDependency)
				{
					if (LessStylesheetExists(dependencyUrl))
					{
						string dependencyExtension = Path.GetExtension(dependencyUrl);
						var stylesheet = new LessStylesheet(dependencyUrl, string.Empty);

						if (FileExtensionHelpers.IsLess(dependencyExtension)
							|| (FileExtensionHelpers.IsCss(dependencyExtension) && dependencyType == "less"))
						{
							stylesheet = GetLessStylesheet(dependencyUrl);

							if (isEmptyDependency && stylesheet.Content.Length > 0)
							{
								duplicateDependency.Content = stylesheet.Content;
								duplicateDependency.IsObservable = true;
							}
							else
							{
								var dependency = new Dependency(dependencyUrl, stylesheet.Content);
								dependencies.Add(dependency);
							}
						}
						else
						{
							if (!isDuplicateDependency)
							{
								var dependency = new Dependency(dependencyUrl, string.Empty, false);
								dependencies.Add(dependency);	
							}
						}

						FillDependencies(rootAssetUrl, stylesheet, dependencies);
					}
					else
					{
						throw new FileNotFoundException(
							string.Format(CoreStrings.Common_FileNotExist, dependencyUrl));
					}
				}
			}
		}

		/// <summary>
		/// Generates a LESS-stylesheet cache item key
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <returns>LESS-stylesheet cache item key</returns>
		private string GenerateLessStylesheetCacheItemKey(string assetUrl)
		{
			string key = assetUrl.Trim().ToUpperInvariant();

			return key;
		}

		/// <summary>
		/// Determines whether the specified LESS-stylesheet exists
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		private bool LessStylesheetExists(string assetUrl)
		{
			string key = GenerateLessStylesheetCacheItemKey(assetUrl);
			bool result;

			if (_lessStylesheetCache.ContainsKey(key))
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
		/// Gets a LESS-stylesheet
		/// </summary>
		/// <param name="asset">Asset with code written on LESS</param>
		/// <returns>LESS-stylesheet</returns>
		private LessStylesheet GetLessStylesheet(IAsset asset)
		{
			string assetUrl = asset.Url;
			string assetContent = asset.Content;
			LessStylesheet stylesheet = PreprocessStylesheet(assetContent, assetUrl);

			string key = GenerateLessStylesheetCacheItemKey(assetUrl);
			_lessStylesheetCache[key] = stylesheet;

			return stylesheet;
		}

		/// <summary>
		/// Gets a LESS-stylesheet by URL
		/// </summary>
		/// <param name="assetUrl">URL to asset file</param>
		/// <returns>LESS-stylesheet</returns>
		private LessStylesheet GetLessStylesheet(string assetUrl)
		{
			string key = GenerateLessStylesheetCacheItemKey(assetUrl);
			LessStylesheet stylesheet;

			if (_lessStylesheetCache.ContainsKey(key))
			{
				stylesheet = _lessStylesheetCache[key];
			}
			else
			{
				string assetContent = _virtualFileSystemWrapper.GetFileTextContent(assetUrl);
				stylesheet = PreprocessStylesheet(assetContent, assetUrl);

				_lessStylesheetCache.Add(key, stylesheet);
			}

			return stylesheet;
		}

		/// <summary>
		/// Clears a LESS-stylesheet cache
		/// </summary>
		private void ClearLessStylesheetCache()
		{
			if (_lessStylesheetCache != null)
			{
				_lessStylesheetCache.Clear();
			}
		}
	}
}