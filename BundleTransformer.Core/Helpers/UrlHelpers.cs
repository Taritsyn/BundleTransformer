namespace BundleTransformer.Core.Helpers
{
	using System;
	using System.Text.RegularExpressions;

	using Resources;

	/// <summary>
	/// URL helpers
	/// </summary>
	public static class UrlHelpers
	{
		/// <summary>
		/// Regular expression to find first slash
		/// </summary>
		private static readonly Regex _firstSlashRegExp = new Regex(@"^(?:/|\\)");

		/// <summary>
		/// Regular expression to find last slash
		/// </summary>
		private static readonly Regex _lastSlashRegExp = new Regex(@"(?:/|\\)$");

		/// <summary>
		/// Regular expression for determine protocol in URL
		/// </summary>
		private static readonly Regex _protocolRegExp = new Regex(@"^(?:(?:https?|ftp)\://)|(?://)",
			RegexOptions.IgnoreCase);


		/// <summary>
		/// Process a back slashes in URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>Processed URL</returns>
		public static string ProcessBackSlashes(string url)
		{
			if (string.IsNullOrWhiteSpace(url))
			{
				throw new ArgumentException(string.Format(Strings.Common_ArgumentIsEmpty, "url"), "url");
			}

			string result = url.Replace(@"\", @"/");

			return result;
		}

		/// <summary>
		/// Removes a first slash from URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>URL without the first slash</returns>
		public static string RemoveFirstSlash(string url)
		{
			if (string.IsNullOrWhiteSpace(url))
			{
				throw new ArgumentException(string.Format(Strings.Common_ArgumentIsEmpty, "url"), "url");
			}

			string result = _firstSlashRegExp.Replace(url, string.Empty);

			return result;
		}

		/// <summary>
		/// Removes a last slash from URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>URL without the last slash</returns>
		public static string RemoveLastSlash(string url)
		{
			if (string.IsNullOrWhiteSpace(url))
			{
				throw new ArgumentException(string.Format(Strings.Common_ArgumentIsEmpty, "url"), "url");
			}

			string result = _lastSlashRegExp.Replace(url, string.Empty);

			return result;
		}

		/// <summary>
		/// Combines a two URLs
		/// </summary>
		/// <param name="baseUrl">The base URL</param>
		/// <param name="relativeUrl">The relative URL to add to the base URL</param>
		/// <returns>The absolute URL</returns>
		public static string Combine(string baseUrl, string relativeUrl)
		{
			string result = RemoveLastSlash(baseUrl) + "/" + RemoveFirstSlash(relativeUrl);

			return result;
		}

		/// <summary>
		/// Determines whether the beginning of this url matches the protocol
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>Result of check (true - is starts with the protocol;
		/// false - is not starts with the protocol)</returns>
		public static bool StartsWithProtocol(string url)
		{
			return _protocolRegExp.IsMatch(url);
		}

		/// <summary>
		/// Determines whether the beginning of this url matches the data URI scheme
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>Result of check (true - is starts with the data URI scheme;
		/// false - is not starts with the data URI scheme)</returns>
		public static bool StartsWithDataUriScheme(string url)
		{
			return url.StartsWith("data:", StringComparison.OrdinalIgnoreCase);
		}
	}
}