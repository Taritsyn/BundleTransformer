namespace BundleTransformer.Core.Transformers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Text;
	using System.Text.RegularExpressions;
	using System.Web;
	using System.Web.Hosting;
	using System.Web.Optimization;

	using Assets;
	using Configuration;
	using Filters;
	using Minifiers;
	using PostProcessors;
	using Translators;
	using Validators;

	/// <summary>
	/// Transformer that responsible for processing CSS-assets
	/// </summary>
	public sealed class CssTransformer : TransformerBase
	{
		/// <summary>
		/// Regular expression for working with CSS <code>@import</code> rules
		/// </summary>
		private static readonly Regex _cssImportRuleRegex =
			new Regex(@"@import\s*" +
				@"(?:(?:(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>))" +
                @"|(?:url\(\s*(?:(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
                @"|(?<url>[\w\-+.:,;/?&=%~#$@\[\]{}]+))\s*\)))" +
				@"(?:\s*(?<media>(?:[A-Za-z]+|\([A-Za-z][^,;()""']+?\))(?:\s*and\s+\([A-Za-z][^,;()""']+?\))*" +
				@"(?:\s*,\s*(?:[A-Za-z]+|\([A-Za-z][^,;()""']+?\))(?:\s*and\s+\([A-Za-z][^,;()""']+?\))*\s*)*?))?" +
				@"\s*;",
				RegexOptions.IgnoreCase);

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		public CssTransformer()
			: this(null, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		public CssTransformer(IMinifier minifier)
			: this(minifier, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		public CssTransformer(IList<ITranslator> translators)
			: this(null, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="postProcessors">List of postprocessors</param>
		public CssTransformer(IList<IPostProcessor> postProcessors)
			: this(null, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators)
			: this(minifier, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public CssTransformer(IMinifier minifier, IList<IPostProcessor> postProcessors)
			: this(minifier, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public CssTransformer(IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(null, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(minifier, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public CssTransformer(string[] ignorePatterns)
			: this(null, null, null, ignorePatterns)
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns)
			: this(minifier, translators, postProcessors, ignorePatterns,
				BundleTransformerContext.Current.Configuration.GetCoreSettings())
		{ }

		/// <summary>
		/// Constructs a instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns, CoreSettings coreConfig)
			: base(ignorePatterns, coreConfig)
		{
			CssContext cssContext = BundleTransformerContext.Current.Css;

			_minifier = minifier ?? cssContext.GetDefaultMinifierInstance();
			_translators = translators ?? cssContext.GetDefaultTranslatorInstances();
			_postProcessors = postProcessors ?? cssContext.GetDefaultPostProcessorInstances();
		}

		/// <summary>
		/// Transforms CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="virtualPathProvider">Virtual path provider</param>
		/// <param name="httpContext">Object HttpContext</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		protected override void Transform(IList<IAsset> assets, BundleResponse bundleResponse,
			VirtualPathProvider virtualPathProvider, HttpContextBase httpContext, bool isDebugMode)
		{
			ValidateAssetTypes(assets);
			assets = RemoveDuplicateAssets(assets);
			assets = RemoveUnnecessaryAssets(assets);
			assets = ReplaceFileExtensions(assets, isDebugMode);
			assets = Translate(assets, isDebugMode);
			assets = PostProcess(assets);
			if (!isDebugMode)
			{
				assets = Minify(assets);
			}

			bundleResponse.Content = Combine(assets, _coreConfig.EnableTracing);
			ConfigureBundleResponse(assets, bundleResponse, virtualPathProvider, isDebugMode);
			bundleResponse.ContentType = Constants.ContentType.Css;
		}

		/// <summary>
		/// Validates whether the specified assets are CSS-asset
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		protected override void ValidateAssetTypes(IList<IAsset> assets)
		{
			var cssAssetTypesValidator = new CssAssetTypesValidator();
			cssAssetTypesValidator.Validate(assets);
		}

		/// <summary>
		/// Removes a duplicate CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of unique CSS-assets</returns>
		protected override IList<IAsset> RemoveDuplicateAssets(IList<IAsset> assets)
		{
			var cssDuplicateFilter = new CssDuplicateAssetsFilter();
			IList<IAsset> processedAssets = cssDuplicateFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Removes a unnecessary CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of necessary CSS-assets</returns>
		protected override IList<IAsset> RemoveUnnecessaryAssets(IList<IAsset> assets)
		{
			var cssUnnecessaryAssetsFilter = new CssUnnecessaryAssetsFilter(_ignorePatterns);
			IList<IAsset> processedAssets = cssUnnecessaryAssetsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Replaces a file extensions of CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Set of CSS-assets with a modified extension</returns>
		protected override IList<IAsset> ReplaceFileExtensions(IList<IAsset> assets, bool isDebugMode)
		{
			var cssFileExtensionsFilter = new CssFileExtensionsFilter
			{
			    IsDebugMode = isDebugMode,
				UsePreMinifiedFiles = _coreConfig.Css.UsePreMinifiedFiles
			};

			IList<IAsset> processedAssets = cssFileExtensionsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Combines code of CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <param name="enableTracing">Enables tracing</param>
		protected override string Combine(IList<IAsset> assets, bool enableTracing)
		{
			var content = new StringBuilder();
			string topCharset = string.Empty;
			var imports = new List<string>();

			int assetCount = assets.Count;
			int lastAssetIndex = assetCount - 1;

			for (int assetIndex = 0; assetIndex < assetCount; assetIndex++)
			{
				IAsset asset = assets[assetIndex];

				if (enableTracing)
				{
					content.AppendFormatLine("/*#region URL: {0} */", asset.Url);
				}
				content.Append(EjectCssCharsetAndImports(asset.Content, ref topCharset, imports));
				if (enableTracing)
				{
					content.AppendLine();
					content.AppendLine("/*#endregion*/");
				}

				if (assetIndex != lastAssetIndex)
				{
					content.AppendLine();
				}
			}

			if (imports.Count > 0)
			{
				string importsTemplate = enableTracing ? 
					"/*#region CSS Imports */{0}{1}{0}/*#endregion*/{0}{0}" : "{1}{0}";

				content.Insert(0, string.Format(importsTemplate, Environment.NewLine, 
					string.Join(Environment.NewLine, imports)));
			}

			if (!string.IsNullOrWhiteSpace(topCharset))
			{
				content.Insert(0, topCharset + Environment.NewLine);
			}

			return content.ToString();
		}

		/// <summary>
		/// Eject a <code>@charset</code> and <code>@import</code> rules
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="topCharset">Processed top <code>@charset</code> rule</param>
		/// <param name="imports">List of processed <code>@import</code> rules</param>
		/// <returns>Text content of CSS-asset without <code>@charset</code> and <code>@import</code> rules</returns>
		private static string EjectCssCharsetAndImports(string content, ref string topCharset, 
			IList<string> imports)
		{
			int contentLength = content.Length;
			if (contentLength == 0)
			{
				return content;
			}

			MatchCollection charsetRuleMatches = CommonRegExps.CssCharsetRuleRegex.Matches(content);
			MatchCollection importRuleMatches = _cssImportRuleRegex.Matches(content);

			if (charsetRuleMatches.Count == 0 && importRuleMatches.Count == 0)
			{
				return content;
			}

			var nodeMatches = new List<CssNodeMatch>();

			foreach (Match charsetRuleMatch in charsetRuleMatches)
			{
				var nodeMatch = new CssNodeMatch(charsetRuleMatch.Index,
					charsetRuleMatch.Length,
					CssNodeType.CharsetRule,
					charsetRuleMatch);
				nodeMatches.Add(nodeMatch);
			}

			foreach (Match importRuleMatch in importRuleMatches)
			{
				var nodeMatch = new CssNodeMatch(importRuleMatch.Index,
					importRuleMatch.Length,
					CssNodeType.ImportRule,
					importRuleMatch);
				nodeMatches.Add(nodeMatch);
			}

			MatchCollection multilineCommentMatches = CommonRegExps.CssMultilineCommentRegex.Matches(content);

			foreach (Match multilineCommentMatch in multilineCommentMatches)
			{
				var nodeMatch = new CssNodeMatch(multilineCommentMatch.Index,
					multilineCommentMatch.Length,
					CssNodeType.MultilineComment,
					multilineCommentMatch);
				nodeMatches.Add(nodeMatch);
			}

			nodeMatches = nodeMatches
				.OrderBy(n => n.Position)
				.ThenByDescending(n => n.Length)
				.ToList()
				;

			var contentBuilder = new StringBuilder();
			int endPosition = contentLength - 1;
			int currentPosition = 0;

			foreach (CssNodeMatch nodeMatch in nodeMatches)
			{
				CssNodeType nodeType = nodeMatch.NodeType;
				int nodePosition = nodeMatch.Position;
				Match match = nodeMatch.Match;

				if (nodePosition < currentPosition)
				{
					continue;
				}

				if (nodeType == CssNodeType.MultilineComment)
				{
					int nextPosition = nodePosition + match.Length;

					ProcessOtherContent(contentBuilder, content,
						ref currentPosition, nextPosition);
				}
				else if (nodeType == CssNodeType.CharsetRule || nodeType == CssNodeType.ImportRule)
				{
					ProcessOtherContent(contentBuilder, content,
						ref currentPosition, nodePosition);

					if (nodeType == CssNodeType.CharsetRule)
					{
						string charset = match.Groups["charset"].Value;

						string charsetRule = match.Value;
						if (string.IsNullOrWhiteSpace(topCharset))
						{
							topCharset = string.Format(@"@charset ""{0}"";", charset);
						}

						currentPosition += charsetRule.Length;
					}
					else if (nodeType == CssNodeType.ImportRule)
					{
						GroupCollection importRuleGroups = match.Groups;

						string url = importRuleGroups["url"].Value;
						string media = importRuleGroups["media"].Success ?
							(" " + importRuleGroups["media"].Value) : string.Empty;

						string importRule = match.Value;
						string processedImportRule = string.Format(@"@import ""{0}""{1};", url, media);
						imports.Add(processedImportRule);

						currentPosition += importRule.Length;	
					}
				}
			}

			if (currentPosition > 0 && currentPosition <= endPosition)
			{
				ProcessOtherContent(contentBuilder, content,
					ref currentPosition, endPosition + 1);
			}

			return contentBuilder.ToString();
		}

		/// <summary>
		/// Process a other stylesheet content
		/// </summary>
		/// <param name="contentBuilder">Content builder</param>
		/// <param name="assetContent">Text content of CSS-asset</param>
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
	}
}