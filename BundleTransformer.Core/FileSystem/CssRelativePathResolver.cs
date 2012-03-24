namespace BundleTransformer.Core.FileSystem
{
	using System;
	using System.Text.RegularExpressions;

	/// <summary>
	/// CSS relative path resolver
	/// </summary>
	public sealed class CssRelativePathResolver : ICssRelativePathResolver
	{
		/// <summary>
		/// Regular expression for working with paths of components in CSS-code
		/// </summary>
		private static readonly Regex _urlStylesheetRuleRegex =
			new Regex(@"url\((?<quote>'?""?)(?<url>[a-zA-Z0-9а-яА-Я-_\s./?%&:;+=~]+)""?'?\)",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with paths of imported stylesheets in CSS-code
		/// </summary>
		private static readonly Regex _importStylesheetRuleRegex =
			new Regex(@"@import\s(?<quote>'?""?)(?<url>[a-zA-Z0-9а-яА-Я-_\s./?%&:;+=~]+)""?'?",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Transforms relative paths of components to absolute in CSS-code
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="path">CSS-file path</param>
		/// <returns>Processed text content of CSS-asset</returns>
		public string ResolveComponentsRelativePaths(string content, string path)
		{
			return _urlStylesheetRuleRegex.Replace(content, m =>
			{
				string result = m.Groups[0].Value;

				if (m.Groups["url"].Success)
				{
					string urlValue = m.Groups["url"].Value;
					string quoteValue = m.Groups["quote"].Success ? m.Groups["quote"].Value : "";

					result = String.Format("url({0}{1}{2})",
						quoteValue,
						Utils.TransformRelativeUrlToAbsolute(path, urlValue),
						quoteValue);
				}

				return result;
			});
		}

		/// <summary>
		/// Transforms relative paths of imported stylesheets to absolute in CSS-code
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="path">CSS-file path</param>
		/// <returns>Processed text content of CSS-asset</returns>
		public string ResolveImportsRelativePaths(string content, string path)
		{
			return _importStylesheetRuleRegex.Replace(content, m =>
			{
				string result = m.Groups[0].Value;

				if (m.Groups["url"].Success)
				{
					string urlValue = m.Groups["url"].Value;
					string quoteValue = m.Groups["quote"].Success ? m.Groups["quote"].Value : "";

					result = String.Format("@import {0}{1}{2}",
						quoteValue,
						Utils.TransformRelativeUrlToAbsolute(path, urlValue),
						quoteValue);
				}

				return result;
			});
		}
	}
}
