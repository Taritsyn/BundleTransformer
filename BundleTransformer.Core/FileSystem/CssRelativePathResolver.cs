namespace BundleTransformer.Core.FileSystem
{
	using System.Collections.Generic;
	using System.Linq;
	using System.Text;
	using System.Text.RegularExpressions;

	using Helpers;

	/// <summary>
	/// CSS relative path resolver
	/// </summary>
	public sealed class CssRelativePathResolver : CommonRelativePathResolver, ICssRelativePathResolver
	{
		/// <summary>
		/// Regular expression for working with CSS <code>@import</code> rules
		/// </summary>
		private static readonly Regex _cssImportRuleRegex =
			new Regex(@"@import\s*(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)",
				RegexOptions.IgnoreCase);


		/// <summary>
		/// Constructs instance of CSS relative path resolver
		/// </summary>
		public CssRelativePathResolver()
			: this(BundleTransformerContext.Current.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs instance of CSS relative path resolver
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public CssRelativePathResolver(IVirtualFileSystemWrapper virtualFileSystemWrapper)
			: base(virtualFileSystemWrapper)
		{}

	
		/// <summary>
		/// Transforms all relative paths to absolute in CSS-code
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="path">CSS-file path</param>
		/// <returns>Processed text content of CSS-asset</returns>
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

			MatchCollection multilineCommentMatches = CommonRegExps.CStyleMultilineCommentRegex.Matches(content);

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

				if (nodeType == CssNodeType.UrlRule || nodeType == CssNodeType.ImportRule)
				{
					ProcessOtherContent(contentBuilder, content,
						ref currentPosition, nodePosition);

					if (nodeType == CssNodeType.UrlRule)
					{
						GroupCollection urlRuleGroups = match.Groups;

						string url = urlRuleGroups["url"].Value.Trim();
						string quote = urlRuleGroups["quote"].Success ? 
							urlRuleGroups["quote"].Value : string.Empty;

						string urlRule = match.Value;
						string processedUrlRule = ProcessUrlRule(path, url, quote);

						contentBuilder.Append(processedUrlRule);
						currentPosition += urlRule.Length;
					}
					else if (nodeType == CssNodeType.ImportRule)
					{
						GroupCollection importRuleGroups = match.Groups;

						string url = importRuleGroups["url"].Value.Trim();

						string importRule = match.Value;
						string processedImportRule = ProcessImportRule(path, url);

						contentBuilder.Append(processedImportRule);
						currentPosition += importRule.Length;
					}
				}
				else if (nodeType == CssNodeType.MultilineComment)
				{
					int nextPosition = nodePosition + match.Length;

					ProcessOtherContent(contentBuilder, content,
						ref currentPosition, nextPosition);
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
		/// Process a CSS <code>@import</code> rule
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent CSS-asset file</param>
		/// <param name="assetUrl">URL of CSS-asset file</param>
		/// <returns>Processed CSS <code>@import</code> rule</returns>
		private string ProcessImportRule(string parentAssetUrl, string assetUrl)
		{
			string processedAssetUrl = assetUrl;
			if (!UrlHelpers.StartsWithProtocol(assetUrl) && !UrlHelpers.StartsWithDataUriScheme(assetUrl))
			{
				processedAssetUrl = ResolveRelativePath(parentAssetUrl, assetUrl);
			}

			string result = string.Format(@"@import ""{0}""", processedAssetUrl);

			return result;
		}

		/// <summary>
		/// Process a CSS <code>url</code> rule
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent CSS-asset file</param>
		/// <param name="assetUrl">URL of CSS-asset file</param>
		/// <param name="quote">Quote</param>
		/// <returns>Processed CSS <code>url</code> rule</returns>
		private string ProcessUrlRule(string parentAssetUrl, string assetUrl, string quote)
		{
			string processedAssetUrl = assetUrl;
			if (!UrlHelpers.StartsWithProtocol(assetUrl) && !UrlHelpers.StartsWithDataUriScheme(assetUrl))
			{
				processedAssetUrl = ResolveRelativePath(parentAssetUrl, assetUrl);
			}

			string result = string.Format("url({0}{1}{0})", quote, processedAssetUrl);

			return result;
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