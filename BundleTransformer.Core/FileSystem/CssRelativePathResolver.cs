namespace BundleTransformer.Core.FileSystem
{
	using System;
	using System.Text.RegularExpressions;

	/// <summary>
	/// CSS relative path resolver
	/// </summary>
	public sealed class CssRelativePathResolver : CommonRelativePathResolver, ICssRelativePathResolver
	{
		/// <summary>
		/// Regular expression for working with paths of components in CSS-code
		/// </summary>
		private static readonly Regex _urlStylesheetRuleRegex =
			new Regex(@"url\(((?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
				@"|(?<url>[\w\-+.:,;/?&=%~#$@\[\]{}]+))\)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with paths of imported stylesheets in CSS-code
		/// </summary>
		private static readonly Regex _importStylesheetRuleRegex =
			new Regex(@"@import\s*(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#\$@()\[\]{}]+)(\k<quote>)",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);


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
		/// Transforms relative paths of components to absolute in CSS-code
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="path">CSS-file path</param>
		/// <returns>Processed text content of CSS-asset</returns>
		public string ResolveComponentsRelativePaths(string content, string path)
		{
			return _urlStylesheetRuleRegex.Replace(content, m =>
			{
				GroupCollection groups = m.Groups;
				string result = groups[0].Value;

				if (groups["url"].Success)
				{
					string urlValue = groups["url"].Value.Trim();
					string quoteValue = groups["quote"].Success ? groups["quote"].Value : string.Empty;

					string newUrl = urlValue;
					if (urlValue.IndexOf("data:", StringComparison.OrdinalIgnoreCase) != 0)
					{
						newUrl = ResolveRelativePath(path, urlValue);
					}

					result = string.Format("url({0}{1}{0})", quoteValue, newUrl);
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
				GroupCollection groups = m.Groups;
				string result = groups[0].Value;

				if (groups["url"].Success)
				{
					string urlValue = groups["url"].Value.Trim();
					string quoteValue = groups["quote"].Success ? groups["quote"].Value : @"""";

					result = string.Format("@import {0}{1}{0}",
						quoteValue,
						ResolveRelativePath(path, urlValue));
				}

				return result;
			});
		}

		/// <summary>
		/// Transforms all relative paths to absolute in CSS-code
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="path">CSS-file path</param>
		/// <returns>Processed text content of CSS-asset</returns>
		public string ResolveAllRelativePaths(string content, string path)
		{
			string result = ResolveImportsRelativePaths(content, path);
			result = ResolveComponentsRelativePaths(result, path);

			return result;
		}
	}
}
