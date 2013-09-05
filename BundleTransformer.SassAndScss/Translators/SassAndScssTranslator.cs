namespace BundleTransformer.SassAndScss.Translators
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Text;
	using System.Text.RegularExpressions;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Helpers;
	using CoreStrings = Core.Resources.Strings;
	using Core.Resources;
	using Core.Translators;

	using Compilers;
	using Configuration;
	using Constants;
	using Helpers;
	
	/// <summary>
	/// Translator that responsible for translation of Sass- or SCSS-code to CSS-code
	/// </summary>
	public sealed class SassAndScssTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// Name of output code type
		/// </summary>
		const string OUTPUT_CODE_TYPE = "CSS";

		/// <summary>
		/// Regular expression for working with Sass <code>@import</code> rules
		/// </summary>
		private static readonly Regex _sassImportRuleRegex =
			new Regex(@"@import\s*" +
				@"(?<urlList>(?<quote>'|"")(?:[\w \-+.:,;/?&=%~#$@()]+)(\k<quote>)" +
				@"(?:,\s*(?<quote>'|"")(?:[\w \-+.:,;/?&=%~#$@()]+)(\k<quote>))*)",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with SCSS <code>@import</code> rules
		/// </summary>
		private static readonly Regex _scssImportRuleRegex =
			new Regex(@"@import\s*" +
				@"(?<urlList>(?<quote>'|"")([\w \-+.:,;/?&=%~#$@()]+)(\k<quote>)" + 
				@"(?:,\s*(?<quote>'|"")([\w \-+.:,;/?&=%~#$@()]+)(\k<quote>))*)",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with CSS <code>@import</code> rules
		/// </summary>
		private static readonly Regex _cssImportRuleRegex =
			new Regex(@"@import\s*" +
				@"(?:(?:url\((?:(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
				@"|(?<url>[\w\-+.:,;/?&=%~#$@\[\]{}]+))\))" +
				@"|(?:(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
				@"\s*(?<media>all|braille|embossed|handheld|print|projection|screen|speech|aural|tty|tv)))",
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
		/// Sass- and SCSS-compiler
		/// </summary>
		private readonly SassAndScssCompiler _sassAndScssCompiler;

		/// <summary>
		/// Asset content cache
		/// </summary>
		private readonly Dictionary<string, SassAndScssStylesheet> _assetContentCache;

		/// <summary>
		/// Synchronizer of translation
		/// </summary>
		private readonly object _translationSynchronizer = new object();

		/// <summary>
		/// Gets or sets a flag for whether to output the line number and file within comments
		/// </summary>
		public bool LineNumbers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to output the full trace of imports 
		/// and mixins before each selector
		/// </summary>
		public bool TraceSelectors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to output the line number and file within a fake media query
		/// </summary>
		public bool DebugInfo
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of Sass- and SCSS-translator
		/// </summary>
		public SassAndScssTranslator()
			: this(BundleTransformerContext.Current.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.GetCommonRelativePathResolver(),
				BundleTransformerContext.Current.GetSassAndScssConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Sass- and SCSS-translator
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="relativePathResolver">Relative path resolver</param>
		/// <param name="sassAndScssConfig">Configuration settings of Sass- and SCSS-translator</param>
		public SassAndScssTranslator(IVirtualFileSystemWrapper virtualFileSystemWrapper, 
			IRelativePathResolver relativePathResolver, 
			SassAndScssSettings sassAndScssConfig)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_relativePathResolver = relativePathResolver;
			_sassAndScssCompiler = new SassAndScssCompiler();
			_assetContentCache = new Dictionary<string, SassAndScssStylesheet>();

			UseNativeMinification = sassAndScssConfig.UseNativeMinification;
			LineNumbers = sassAndScssConfig.LineNumbers;
			TraceSelectors = sassAndScssConfig.TraceSelectors;
			DebugInfo = sassAndScssConfig.DebugInfo;
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

			lock (_translationSynchronizer)
			{
				bool enableNativeMinification = NativeMinificationEnabled;

				ClearAssetContentCache();

				try
				{
					InnerTranslate(asset, enableNativeMinification);
				}
				finally
				{
					//lessCompiler.Dispose();
					ClearAssetContentCache();
				}
			}

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

			var assetsToProcessing = assets.Where(a => a.AssetType == AssetType.Sass 
				|| a.AssetType == AssetType.Scss).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			lock (_translationSynchronizer)
			{
				bool enableNativeMinification = NativeMinificationEnabled;

				ClearAssetContentCache();

				try
				{
					foreach (var asset in assetsToProcessing)
					{
						InnerTranslate(asset, enableNativeMinification);
					}
				}
				finally
				{
					//lessCompiler.Dispose();
					ClearAssetContentCache();
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, bool enableNativeMinification)
		{
			string assetTypeName = (asset.AssetType == AssetType.Scss) ? "SCSS" : "Sass";
			string newContent;
			string assetVirtualPath = asset.VirtualPath;
			string assetUrl = asset.Url;
			var dependencies = new DependencyCollection();
			CompilationOptions options = CreateCompilationOptions(
				(asset.AssetType == AssetType.Scss) ? SyntaxType.Scss : SyntaxType.Sass,
				enableNativeMinification);

			try
			{
				SassAndScssStylesheet stylesheet = GetAssetFileTextContent(assetUrl);
				FillDependencies(assetUrl, stylesheet, dependencies);

				newContent = _sassAndScssCompiler.Compile(stylesheet.Content, stylesheet.Url,
					dependencies, options);
			}
			catch (FileNotFoundException)
			{
				throw;
			}
			catch (SassAndScssCompilingException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						assetTypeName, OUTPUT_CODE_TYPE, assetVirtualPath, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						assetTypeName, OUTPUT_CODE_TYPE, assetVirtualPath, e.Message), e);
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
		/// <param name="syntaxType">Stylesheet syntax types</param>
		/// <param name="enableNativeMinification">Flag that indicating to use of native minification</param>
		/// <returns>Compilation options</returns>
		private CompilationOptions CreateCompilationOptions(SyntaxType syntaxType, bool enableNativeMinification)
		{
			var options = new CompilationOptions
			{
				SyntaxType = syntaxType,
				EnableNativeMinification = enableNativeMinification,
				LineNumbers = LineNumbers,
				TraceSelectors = TraceSelectors,
				DebugInfo = DebugInfo
			};

			return options;
		}

		/// <summary>
		/// Preprocess a stylesheet content
		/// </summary>
		/// <param name="assetContent">Text content of Sass- or SCSS-asset</param>
		/// <param name="assetUrl">URL of Sass- or SCSS-asset file</param>
		/// <returns>Preprocessed text content of Sass- or SCSS-asset</returns>
		public SassAndScssStylesheet PreprocessStylesheet(string assetContent, string assetUrl)
		{
			var stylesheet = new SassAndScssStylesheet(assetUrl, assetContent);

			int contentLength = assetContent.Length;
			if (contentLength == 0)
			{
				return stylesheet;
			}

			MatchCollection serverImportRuleMatches;
			string assetFileExtension = Path.GetExtension(assetUrl);

			if (FileExtensionHelpers.IsSass(assetFileExtension))
			{
				serverImportRuleMatches = _sassImportRuleRegex.Matches(assetContent);
			}
			else if (FileExtensionHelpers.IsScss(assetFileExtension))
			{
				serverImportRuleMatches = _scssImportRuleRegex.Matches(assetContent);
			}
			else
			{
				throw new FormatException();
			}

			MatchCollection clientImportRuleMatches = _cssImportRuleRegex.Matches(assetContent); 
			MatchCollection urlRuleMatches = CommonRegExps.CssUrlRuleRegex.Matches(assetContent);

			if (serverImportRuleMatches.Count == 0 && clientImportRuleMatches.Count == 0 
				&& urlRuleMatches.Count == 0)
			{
				return stylesheet;
			}

			var nodeMatches = new List<SassAndScssNodeMatch>();

			foreach (Match serverImportRuleMatch in serverImportRuleMatches)
			{
				var nodeMatch = new SassAndScssNodeMatch(serverImportRuleMatch.Index,
					SassAndScssNodeType.ServerImportRule,
					serverImportRuleMatch);
				nodeMatches.Add(nodeMatch);
			}

			foreach (Match clientImportRuleMatch in clientImportRuleMatches)
			{
				var nodeMatch = new SassAndScssNodeMatch(clientImportRuleMatch.Index,
					SassAndScssNodeType.ClientImportRule,
					clientImportRuleMatch);
				nodeMatches.Add(nodeMatch);
			}

			foreach (Match urlRuleMatch in urlRuleMatches)
			{
				var nodeMatch = new SassAndScssNodeMatch(urlRuleMatch.Index,
					SassAndScssNodeType.UrlRule,
					urlRuleMatch);
				nodeMatches.Add(nodeMatch);
			}

			MatchCollection multilineCommentMatches = CommonRegExps.CStyleMultilineCommentRegex.Matches(assetContent);

			foreach (Match multilineCommentMatch in multilineCommentMatches)
			{
				var nodeMatch = new SassAndScssNodeMatch(multilineCommentMatch.Index,
					SassAndScssNodeType.MultilineComment,
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

			foreach (SassAndScssNodeMatch nodeMatch in nodeMatches)
			{
				SassAndScssNodeType nodeType = nodeMatch.NodeType;
				int nodePosition = nodeMatch.Position;
				Match match = nodeMatch.Match;

				if (nodePosition < currentPosition)
				{
					continue;
				}

				if (nodeType == SassAndScssNodeType.ServerImportRule || nodeType == SassAndScssNodeType.ClientImportRule
					|| nodeType == SassAndScssNodeType.UrlRule)
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

					if (nodeType == SassAndScssNodeType.ServerImportRule)
					{
						string urlListString = match.Groups["urlList"].Value;
						MatchCollection urlMatches = CommonRegExps.CssStringValue.Matches(urlListString);

						var urlList = new List<string>();

						foreach (Match urlMatch in urlMatches)
						{
							string url = urlMatch.Groups["value"].Value;
							if (!string.IsNullOrWhiteSpace(url))
							{
								urlList.Add(url);
							}
						}

						List<string> processedServerImportUrls;

						string serverImportRule = match.Value;
						string processedServerImportRule = ProcessServerImportRule(assetUrl, assetFileExtension, urlList,
							out processedServerImportUrls);

						if (processedServerImportUrls.Count > 0)
						{
							var imports = stylesheet.Imports;

							foreach (string processedServerImportUrl in processedServerImportUrls)
							{
								string urlInUpperCase = processedServerImportUrl.ToUpperInvariant();

								if (imports.Count(i => i.ToUpperInvariant() == urlInUpperCase) == 0)
								{
									imports.Add(processedServerImportUrl);
								}
							}
						}

						contentBuilder.Append(processedServerImportRule);
						currentPosition += serverImportRule.Length;
					}
					else if (nodeType == SassAndScssNodeType.ClientImportRule)
					{
						GroupCollection clientImportRuleGroups = match.Groups;

						string url = clientImportRuleGroups["url"].Value;
						string quote = clientImportRuleGroups["quote"].Success ?
							clientImportRuleGroups["quote"].Value : @"""";
						string media = clientImportRuleGroups["media"].Value;

						string clientImportRule = match.Value;
						string processedClientImportRule = ProcessClientImportRule(assetUrl, url, quote, media);

						contentBuilder.Append(processedClientImportRule);
						currentPosition += clientImportRule.Length;
					}
					else if (nodeType == SassAndScssNodeType.UrlRule)
					{
						GroupCollection urlRuleGroups = match.Groups;

						string url = urlRuleGroups["url"].Value.Trim();
						string quote = urlRuleGroups["quote"].Success ? urlRuleGroups["quote"].Value : string.Empty;

						string urlRule = match.Value;
						string processedUrlRule = ProcessUrlRule(assetUrl, url, quote);

						contentBuilder.Append(processedUrlRule);
						currentPosition += urlRule.Length;
					}
				}
				else if (nodeType == SassAndScssNodeType.MultilineComment)
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
		/// Process a Sass or SCSS <code>@import</code> rule
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent Sass- or SCSS-asset file</param>
		/// <param name="parentAssetFileExtension">Extension of parent Sass- or SCSS-asset file</param>
		/// <param name="assetUrls">List of Sass- or SCSS-asset URLs</param>
		/// <param name="processedImportUrls">List of processed URLs from Sass- and SCSS-imports</param>
		/// <returns>Processed Sass or SCSS <code>@import</code> rule</returns>
		private string ProcessServerImportRule(string parentAssetUrl, string parentAssetFileExtension, 
			IEnumerable<string> assetUrls, out List<string> processedImportUrls)
		{
			processedImportUrls = new List<string>();
			var importUrls = new List<string>();

			foreach (string assetUrl in assetUrls)
			{
				if (!UrlHelpers.StartsWithProtocol(assetUrl))
				{
					string importUrl = _relativePathResolver.ResolveRelativePath(parentAssetUrl, assetUrl);
					string importExtension = Path.GetExtension(importUrl);

					string partialImportUrl;
					bool partialImportExists;

					if (FileExtensionHelpers.IsSass(importExtension)
						|| FileExtensionHelpers.IsScss(importExtension))
					{
						bool importExists = AssetFileExists(importUrl);

						partialImportUrl = string.Empty;
						partialImportExists = false;

						if (!importExists)
						{
							partialImportUrl = GetPartialAssetUrl(importUrl);
							partialImportExists = AssetFileExists(partialImportUrl);

							importExists = partialImportExists;
						}

						if (importExists)
						{
							string processedImportUrl = partialImportExists ? partialImportUrl : importUrl;

							processedImportUrls.Add(processedImportUrl);
							importUrls.Add(importUrl);
						}
						else
						{
							throw new FileNotFoundException(
								string.Format(Strings.Common_FileNotExist, importUrl));
						}
					}
					else if (FileExtensionHelpers.IsCss(importExtension))
					{
						importUrls.Add(importUrl);
					}
					else
					{
						string newImportExtension = parentAssetFileExtension;
						string newImportUrl = importUrl + newImportExtension;
						bool newImportExists = AssetFileExists(newImportUrl);

						partialImportUrl = string.Empty;
						partialImportExists = false;

						if (!newImportExists)
						{
							partialImportUrl = GetPartialAssetUrl(newImportUrl);
							partialImportExists = AssetFileExists(partialImportUrl);

							newImportExists = partialImportExists;
						}

						if (!newImportExists)
						{
							newImportExtension = FileExtensionHelpers.IsSass(newImportExtension) ?
								FileExtension.Scss : FileExtension.Sass;
							newImportUrl = importUrl + newImportExtension;

							newImportExists = AssetFileExists(newImportUrl);
						}

						if (!newImportExists)
						{
							partialImportUrl = GetPartialAssetUrl(newImportUrl);
							partialImportExists = AssetFileExists(partialImportUrl);

							newImportExists = partialImportExists;
						}

						if (newImportExists)
						{
							string processedImportUrl = partialImportExists ? partialImportUrl : newImportUrl;

							processedImportUrls.Add(processedImportUrl);
							importUrls.Add(newImportUrl);
						}
						else
						{
							newImportExtension = FileExtension.Css;
							newImportUrl = importUrl + newImportExtension;

							newImportExists = AssetFileExists(newImportUrl);
							if (newImportExists)
							{
								importUrls.Add(newImportUrl);
							}
							else
							{
								throw new FileNotFoundException(
									string.Format(Strings.Common_FileNotExist, importUrl));
							}
						}
					}
				}
				else
				{
					importUrls.Add(assetUrl);
				}
			}

			string result = string.Format(@"@import ""{0}""", string.Join(@""", """, importUrls));

			return result;
		}

		/// <summary>
		/// Process a CSS <code>@import</code> rule
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent asset file</param>
		/// <param name="assetUrl">URL of CSS-asset file</param>
		/// <param name="quote">Quote</param>
		/// <param name="media">Media type</param>
		/// <returns>Processed CSS <code>@import</code> rule</returns>
		private string ProcessClientImportRule(string parentAssetUrl, string assetUrl, string quote, string media)
		{
			string processedAssetUrl = assetUrl;
			if (!UrlHelpers.StartsWithProtocol(assetUrl) && !UrlHelpers.StartsWithDataUriScheme(assetUrl))
			{
				processedAssetUrl = _relativePathResolver.ResolveRelativePath(parentAssetUrl, assetUrl);
			}
			string mediaOption = !string.IsNullOrWhiteSpace(media) ? (" " + media) : string.Empty;

			string result = string.Format("@import {0}{1}{0}{2}", quote, processedAssetUrl, mediaOption);

			return result;
		}

		/// <summary>
		/// Process a CSS <code>url</code> rule
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent asset file</param>
		/// <param name="assetUrl">URL of CSS-asset file</param>
		/// <param name="quote">Quote</param>
		/// <returns>Processed CSS <code>url</code> rule</returns>
		private string ProcessUrlRule(string parentAssetUrl, string assetUrl, string quote)
		{
			string processedAssetUrl = assetUrl;
			if (!UrlHelpers.StartsWithProtocol(assetUrl) && !UrlHelpers.StartsWithDataUriScheme(assetUrl))
			{
				processedAssetUrl = _relativePathResolver.ResolveRelativePath(parentAssetUrl, assetUrl);
			}

			string result = string.Format("url({0}{1}{0})", quote, processedAssetUrl);

			return result;
		}

		/// <summary>
		/// Process a other stylesheet content
		/// </summary>
		/// <param name="contentBuilder">Content builder</param>
		/// <param name="assetContent">Text content of Sass- or SCSS-asset</param>
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
		/// Fills the list of Sass- and SCSS-files, that were added to a Sass- or SCSS-asset 
		/// by using the<code>@import</code> rules
		/// </summary>
		/// <param name="rootAssetUrl">URL of root Sass- or SCSS-asset file</param>
		/// <param name="parentStylesheet">Parent Sass- and SCSS-stylesheet</param>
		/// <param name="dependencies">List of LESS-files, that were added to a 
		/// Sass- or SCSS-asset by using the <code>@import</code> rules</param>
		public void FillDependencies(string rootAssetUrl, SassAndScssStylesheet parentStylesheet,
			DependencyCollection dependencies)
		{
			foreach (string importUrl in parentStylesheet.Imports)
			{
				string dependencyUrl = importUrl;


				if (string.Equals(dependencyUrl, rootAssetUrl, StringComparison.OrdinalIgnoreCase))
				{
					continue;
				}

				if (!dependencies.ContainsUrl(dependencyUrl))
				{
					if (AssetFileExists(dependencyUrl))
					{
						SassAndScssStylesheet stylesheet = GetAssetFileTextContent(dependencyUrl);
						
						var dependency = new Dependency(dependencyUrl, stylesheet.Content);
						dependencies.Add(dependency);

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
		/// Gets a partial asset URL
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <returns>URL of partial asset file</returns>
		private static string GetPartialAssetUrl(string assetUrl)
		{
			string partialAssetUrl = UrlHelpers.Combine(
				UrlHelpers.ProcessBackSlashes(Path.GetDirectoryName(assetUrl)),
				"_" + Path.GetFileName(assetUrl)
			);

			return partialAssetUrl;
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
		/// Gets Sass- and SCSS-stylesheet by URL
		/// </summary>
		/// <param name="assetUrl">URL to asset file</param>
		/// <returns>Sass- and SCSS-stylesheet</returns>
		private SassAndScssStylesheet GetAssetFileTextContent(string assetUrl)
		{
			string key = GenerateAssetContentCacheItemKey(assetUrl);
			SassAndScssStylesheet stylesheet;

			if (_assetContentCache.ContainsKey(key))
			{
				stylesheet = _assetContentCache[key];
			}
			else
			{
				string assetContent = _virtualFileSystemWrapper.GetFileTextContent(assetUrl);
				stylesheet = PreprocessStylesheet(assetContent, assetUrl);

				_assetContentCache.Add(key, stylesheet);
			}

			return stylesheet;
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