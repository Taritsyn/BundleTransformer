namespace BundleTransformer.Core.Combiners
{
	using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Text;
	using System.Text.RegularExpressions;

	using Assets;
	using Utilities;

	/// <summary>
	/// Style asset combiner
	/// </summary>
	public sealed class StyleCombiner : CombinerBase
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


		protected override string GenerateCombinedAssetVirtualPath(string bundleVirtualPath)
		{
			string combinedAssetVirtualPath = bundleVirtualPath.TrimEnd();
			string combinedAssetExtension = Constants.FileExtension.Css;

			if (!combinedAssetVirtualPath.EndsWith(combinedAssetExtension, StringComparison.OrdinalIgnoreCase))
			{
				combinedAssetVirtualPath += combinedAssetExtension;
			}

			return combinedAssetVirtualPath;
		}

		protected override string CombineAssetContent(IList<IAsset> assets)
		{
			var contentBuilder = new StringBuilder();
			string topCharset = string.Empty;
			var imports = new List<string>();

			int assetCount = assets.Count;
			int lastAssetIndex = assetCount - 1;

			for (int assetIndex = 0; assetIndex < assetCount; assetIndex++)
			{
				IAsset asset = assets[assetIndex];

				if (EnableTracing)
				{
					contentBuilder.AppendFormatLine("/*#region URL: {0} */", asset.Url);
				}
				contentBuilder.Append(EjectCssCharsetAndImports(asset.Content, ref topCharset, imports));
				if (EnableTracing)
				{
					contentBuilder.AppendLine();
					contentBuilder.AppendLine("/*#endregion*/");
				}

				if (assetIndex != lastAssetIndex)
				{
					contentBuilder.AppendLine();
				}
			}

			if (imports.Count > 0)
			{
				string importsTemplate = EnableTracing ?
					"/*#region CSS Imports */{0}{1}{0}/*#endregion*/{0}{0}" : "{1}{0}";

				contentBuilder.Insert(0, string.Format(importsTemplate, Environment.NewLine,
					string.Join(Environment.NewLine, imports)));
			}

			if (!string.IsNullOrWhiteSpace(topCharset))
			{
				contentBuilder.Insert(0, topCharset + Environment.NewLine);
			}

			return contentBuilder.ToString();
		}

		/// <summary>
		/// Eject a <code>@charset</code> and <code>@import</code> rules
		/// </summary>
		/// <param name="content">Text content of style asset</param>
		/// <param name="topCharset">Processed top <code>@charset</code> rule</param>
		/// <param name="imports">List of processed <code>@import</code> rules</param>
		/// <returns>Text content of style asset without <code>@charset</code> and <code>@import</code> rules</returns>
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
		/// <param name="assetContent">Text content of style asset</param>
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