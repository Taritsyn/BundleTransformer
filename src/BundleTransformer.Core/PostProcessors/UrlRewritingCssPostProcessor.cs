﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

using AdvancedStringBuilder;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Helpers;
using BundleTransformer.Core.Resources;

namespace BundleTransformer.Core.PostProcessors
{
	/// <summary>
	/// Postprocessor that responsible for transformation of relative
	/// paths in CSS files to absolute
	/// </summary>
	public sealed class UrlRewritingCssPostProcessor : PostProcessorBase
	{
		/// <summary>
		/// Relative path resolver
		/// </summary>
		private readonly IRelativePathResolver _relativePathResolver;

		/// <summary>
		/// Regular expression for working with CSS <code>@import</code> rules
		/// </summary>
		private static readonly Regex _cssImportRuleRegex =
			new Regex(@"@import\s*(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)",
				RegexOptions.IgnoreCase);


		/// <summary>
		/// Constructs a instance of URL rewriting CSS postprocessor
		/// </summary>
		public UrlRewritingCssPostProcessor()
			: this(BundleTransformerContext.Current.FileSystem.GetCommonRelativePathResolver())
		{ }

		/// <summary>
		/// Constructs a instance of URL rewriting CSS postprocessor
		/// </summary>
		/// <param name="relativePathResolver">Relative path resolver</param>
		public UrlRewritingCssPostProcessor(IRelativePathResolver relativePathResolver)
		{
			_relativePathResolver = relativePathResolver;
		}


		/// <summary>
		/// Transforms relative paths to absolute in CSS file
		/// </summary>
		/// <param name="asset">CSS asset</param>
		/// <returns>Processed CSS asset</returns>
		public override IAsset PostProcess(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentNullException(
					nameof(asset),
					string.Format(Strings.Common_ArgumentIsNull, nameof(asset))
				);
			}

			InnerPostProcess(asset);

			return asset;
		}

		/// <summary>
		/// Transforms relative paths to absolute in CSS files
		/// </summary>
		/// <param name="assets">Set of CSS assets</param>
		/// <returns>Set of processed CSS assets</returns>
		public override IList<IAsset> PostProcess(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentNullException(
					nameof(assets),
					string.Format(Strings.Common_ArgumentIsNull, nameof(assets))
				);
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.IsStylesheet && !a.RelativePathsResolved).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			foreach (var asset in assetsToProcessing)
			{
				InnerPostProcess(asset);
			}

			return assets;
		}

		private void InnerPostProcess(IAsset asset)
		{
			string url = asset.Url;
			string content = ResolveAllRelativePaths(asset.Content, url);

			asset.Content = content;
			asset.RelativePathsResolved = true;
		}

		/// <summary>
		/// Transforms all relative paths to absolute in CSS code
		/// </summary>
		/// <param name="content">Text content of CSS asset</param>
		/// <param name="path">CSS file path</param>
		/// <returns>Processed text content of CSS asset</returns>
		public string ResolveAllRelativePaths(string content, string path)
		{
			int contentLength = content.Length;
			if (contentLength == 0)
			{
				return content;
			}

			MatchCollection urlRuleMatches = CommonRegExps.CssUrlRuleRegex.Matches(content);
			MatchCollection importRuleMatches = _cssImportRuleRegex.Matches(content);

			if (urlRuleMatches.Count == 0 && importRuleMatches.Count == 0)
			{
				return content;
			}

			var nodeMatches = new List<CssNodeMatch>();

			foreach (Match urlRuleMatch in urlRuleMatches)
			{
				var nodeMatch = new CssNodeMatch(urlRuleMatch.Index,
					urlRuleMatch.Length,
					CssNodeType.UrlRule,
					urlRuleMatch);
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

			var stringBuilderPool = StringBuilderPool.Shared;
			StringBuilder resultBuilder = stringBuilderPool.Rent();
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

				if (nodeType == CssNodeType.UrlRule || nodeType == CssNodeType.ImportRule)
				{
					ProcessOtherContent(resultBuilder, content,
						ref currentPosition, nodePosition);

					if (nodeType == CssNodeType.UrlRule)
					{
						GroupCollection urlRuleGroups = match.Groups;

						string url = urlRuleGroups["url"].Value.Trim();
						string quote = urlRuleGroups["quote"].Success ?
							urlRuleGroups["quote"].Value : string.Empty;

						string urlRule = match.Value;
						string processedUrlRule = ProcessUrlRule(path, url, quote);

						resultBuilder.Append(processedUrlRule);
						currentPosition += urlRule.Length;
					}
					else if (nodeType == CssNodeType.ImportRule)
					{
						GroupCollection importRuleGroups = match.Groups;

						string url = importRuleGroups["url"].Value.Trim();

						string importRule = match.Value;
						string processedImportRule = ProcessImportRule(path, url);

						resultBuilder.Append(processedImportRule);
						currentPosition += importRule.Length;
					}
				}
				else if (nodeType == CssNodeType.MultilineComment)
				{
					int nextPosition = nodePosition + match.Length;

					ProcessOtherContent(resultBuilder, content,
						ref currentPosition, nextPosition);
				}
			}

			if (currentPosition > 0 && currentPosition <= endPosition)
			{
				ProcessOtherContent(resultBuilder, content,
					ref currentPosition, endPosition + 1);
			}

			string result = resultBuilder.ToString();
			stringBuilderPool.Return(resultBuilder);

			return result;
		}

		/// <summary>
		/// Process a CSS <code>@import</code> rule
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent CSS asset file</param>
		/// <param name="assetUrl">URL of CSS asset file</param>
		/// <returns>Processed CSS <code>@import</code> rule</returns>
		private string ProcessImportRule(string parentAssetUrl, string assetUrl)
		{
			string processedAssetUrl = assetUrl;
			if (!UrlHelpers.StartsWithProtocol(assetUrl) && !UrlHelpers.StartsWithDataUriScheme(assetUrl))
			{
				processedAssetUrl = _relativePathResolver.ResolveRelativePath(parentAssetUrl, assetUrl);
			}

			string result = string.Format(@"@import ""{0}""", processedAssetUrl);

			return result;
		}

		/// <summary>
		/// Process a CSS <code>url</code> rule
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent CSS asset file</param>
		/// <param name="assetUrl">URL of CSS asset file</param>
		/// <param name="quote">Quote</param>
		/// <returns>Processed CSS <code>url</code> rule</returns>
		private string ProcessUrlRule(string parentAssetUrl, string assetUrl, string quote)
		{
			string processedAssetUrl = assetUrl;

			if (!UrlHelpers.StartsWithProtocol(assetUrl)
				&& !UrlHelpers.StartsWithDataUriScheme(assetUrl)
				&& !UrlHelpers.StartsWithHashMark(assetUrl))
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
		/// <param name="assetContent">Text content of CSS asset</param>
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
