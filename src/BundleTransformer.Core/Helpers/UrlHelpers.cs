namespace BundleTransformer.Core.Helpers
{
	using System;
	using System.Collections.Generic;
	using System.Text;
	using System.Text.RegularExpressions;

	using Resources;

	/// <summary>
	/// URL helpers
	/// </summary>
	public static class UrlHelpers
	{
		/// <summary>
		/// Regular expression for determine protocol in URL
		/// </summary>
		private static readonly Regex _protocolRegExp = new Regex(@"^(?:(?:https?|ftp)\://)|(?://)",
			RegexOptions.IgnoreCase);

		/// <summary>
		/// Regular expression for working with multiple forward slashes
		/// </summary>
		private static readonly Regex _multipleForwardSlashesRegex = new Regex("/{2,}");


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

		/// <summary>
		/// Converts a back slashes to forward slashes
		/// </summary>
		/// <param name="url">URL with back slashes</param>
		/// <returns>URL with forward slashes</returns>
		public static string ProcessBackSlashes(string url)
		{
			if (url == null)
			{
				throw new ArgumentNullException("url",
					string.Format(Strings.Common_ArgumentIsNull, "url"));
			}

			if (string.IsNullOrWhiteSpace(url))
			{
				return url;
			}

			string result = url.Replace('\\', '/');

			return result;
		}

		/// <summary>
		/// Removes a first slash from URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>URL without the first slash</returns>
		public static string RemoveFirstSlash(string url)
		{
			if (url == null)
			{
				throw new ArgumentNullException("url",
					string.Format(Strings.Common_ArgumentIsNull, "url"));
			}

			if (string.IsNullOrWhiteSpace(url))
			{
				return url;
			}

			if (!url.StartsWith("/"))
			{
				return url;
			}

			string result = url.TrimStart('/');

			return result;
		}

		/// <summary>
		/// Removes a last slash from URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>URL without the last slash</returns>
		public static string RemoveLastSlash(string url)
		{
			if (url == null)
			{
				throw new ArgumentNullException("url",
					string.Format(Strings.Common_ArgumentIsNull, "url"));
			}

			if (string.IsNullOrWhiteSpace(url))
			{
				return url;
			}

			if (!url.EndsWith("/"))
			{
				return url;
			}

			string result = url.TrimEnd('/');

			return result;
		}


		/// <summary>
		/// Finds a last directory seperator
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>Position of last directory seperator</returns>
		private static int FindLastDirectorySeparator(string url)
		{
			if (url == null)
			{
				throw new ArgumentNullException("url",
					string.Format(Strings.Common_ArgumentIsNull, "url"));
			}

			int lastDirectorySeparatorPosition;
			int forwardSlashPosition = url.LastIndexOf('/');
			int backSlashPosition = url.LastIndexOf('\\');

			if (forwardSlashPosition != -1 && backSlashPosition != -1)
			{
				lastDirectorySeparatorPosition = Math.Max(forwardSlashPosition, backSlashPosition);
			}
			else if (forwardSlashPosition != -1)
			{
				lastDirectorySeparatorPosition = forwardSlashPosition;
			}
			else
			{
				lastDirectorySeparatorPosition = backSlashPosition;
			}

			return lastDirectorySeparatorPosition;
		}

		/// <summary>
		/// Gets a directory name for the specified URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>The string containing directory name for URL</returns>
		public static string GetDirectoryName(string url)
		{
			if (url == null)
			{
				throw new ArgumentNullException("url",
					string.Format(Strings.Common_ArgumentIsNull, "url"));
			}

			int lastDirectorySeparatorPosition = FindLastDirectorySeparator(url);
			string directoryName = (lastDirectorySeparatorPosition != -1) ?
				url.Substring(0, lastDirectorySeparatorPosition + 1) : string.Empty;

			return directoryName;
		}

		/// <summary>
		/// Gets a file name and extension of the specified URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>The consisting of the characters after the last directory character in URL</returns>
		public static string GetFileName(string url)
		{
			if (url == null)
			{
				throw new ArgumentNullException("url",
					string.Format(Strings.Common_ArgumentIsNull, "url"));
			}

			int lastDirectorySeparatorPosition = FindLastDirectorySeparator(url);
			string fileName = (lastDirectorySeparatorPosition != -1) ?
				url.Substring(lastDirectorySeparatorPosition + 1) : url;

			return fileName;
		}

		/// <summary>
		/// Normalizes a URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>Normalized URL</returns>
		public static string Normalize(string url)
		{
			if (url == null)
			{
				throw new ArgumentNullException("url",
					string.Format(Strings.Common_ArgumentIsNull, "url"));
			}

			if (string.IsNullOrWhiteSpace(url))
			{
				return url;
			}

			string resultUrl = url;

			if (resultUrl.IndexOf("./", StringComparison.Ordinal) != -1)
			{
				string[] urlParts = resultUrl.Split('/');
				int urlPartCount = urlParts.Length;
				if (urlPartCount == 0)
				{
					return url;
				}

				var resultUrlParts = new List<string>();

				for (int urlPartIndex = 0; urlPartIndex < urlPartCount; urlPartIndex++)
				{
					string urlPart = urlParts[urlPartIndex];

					switch (urlPart)
					{
						case "..":
							int resultUrlPartCount = resultUrlParts.Count;
							int resultUrlPartLastIndex = resultUrlPartCount - 1;

							if (resultUrlPartCount == 0 || resultUrlParts[resultUrlPartLastIndex] == "..")
							{
								resultUrlParts.Add(urlPart);
							}
							else
							{
								resultUrlParts.RemoveAt(resultUrlPartLastIndex);
							}
							break;
						case ".":
							break;
						default:
							resultUrlParts.Add(urlPart);
							break;
					}
				}

				resultUrl = string.Join("/", resultUrlParts);
				resultUrlParts.Clear();
			}

			// Collapse multiple forward slashes into a single one
			resultUrl = _multipleForwardSlashesRegex.Replace(resultUrl, "/");

			return resultUrl;
		}

		/// <summary>
		/// Combines a two URLs
		/// </summary>
		/// <param name="baseUrl">The base URL</param>
		/// <param name="relativeUrl">The relative URL to add to the base URL</param>
		/// <returns>The absolute URL</returns>
		public static string Combine(string baseUrl, string relativeUrl)
		{
			if (baseUrl == null)
			{
				throw new ArgumentNullException("baseUrl",
					string.Format(Strings.Common_ArgumentIsNull, "baseUrl"));
			}

			if (relativeUrl == null)
			{
				throw new ArgumentNullException("relativeUrl",
					string.Format(Strings.Common_ArgumentIsNull, "relativeUrl"));
			}

			// Convert backslashes to forward slashes
			string processedBaseUrl = ProcessBackSlashes(baseUrl);
			string processedRelativeUrl = ProcessBackSlashes(relativeUrl);

			string combinedUrl = processedBaseUrl;

			if (combinedUrl.EndsWith("/"))
			{
				if (processedRelativeUrl.StartsWith("/"))
				{
					processedRelativeUrl = processedRelativeUrl.TrimStart('/');
				}
			}
			else
			{
				if (!processedRelativeUrl.StartsWith("/"))
				{
					combinedUrl += '/';
				}
			}

			combinedUrl += processedRelativeUrl;

			// Normalize URL
			combinedUrl = Normalize(combinedUrl);

			return combinedUrl;
		}

		/// <summary>
		/// Converts a long string (more than 65 519 characters) to its escaped representation
		/// </summary>
		/// <param name="stringToEscape">The long string to escape</param>
		/// <returns>Escaped representation of long string</returns>
		public static string EscapeLongDataString(string stringToEscape)
		{
			string result;
			int length = stringToEscape.Length;
			const int chunkSize = 65519;

			if (length <= chunkSize)
			{
				result = Uri.EscapeDataString(stringToEscape);

				return result;
			}

			var stringBuilder = new StringBuilder();
			int chunkCount = length / chunkSize;

			for (int chunkIndex = 0; chunkIndex <= chunkCount; chunkIndex++)
			{
				int startIndex = chunkSize * chunkIndex;
				string chunk = (chunkIndex < chunkCount) ?
					stringToEscape.Substring(startIndex, chunkSize) : stringToEscape.Substring(startIndex);

				stringBuilder.Append(Uri.EscapeDataString(chunk));
			}

			result = stringBuilder.ToString();

			return result;
		}
	}
}