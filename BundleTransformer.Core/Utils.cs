namespace BundleTransformer.Core
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Reflection;
	using System.Text.RegularExpressions;
	using System.Web;

	using Resources;

	public static class Utils
	{
		/// <summary>
		/// Regular expression to find first slash
		/// </summary>
		private static readonly Regex _firstSlashRegExp = new Regex(@"^(\/|\\)*",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to find last slash
		/// </summary>
		private static readonly Regex _lastSlashRegExp = new Regex(@"(\/|\\)*$",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for determine protocol in URL
		/// </summary>
		private static readonly Regex _protocolRegExp = new Regex(@"^(https?|ftp)\://",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);


		/// <summary>
		/// Processes back slashes in URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>Processed URL</returns>
		public static string ProcessBackSlashesInUrl(string url)
		{
			if (string.IsNullOrWhiteSpace(url))
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "url");
			}

			string result = url.Trim().Replace(@"\", @"/");

			return result;
		}

		/// <summary>
		/// Removes first slash from URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>URL without the first slash</returns>
		public static string RemoveFirstSlashFromUrl(string url)
		{
			if (string.IsNullOrWhiteSpace(url))
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "url");
			}

			string result = _firstSlashRegExp.Replace(url.Trim(), string.Empty);

			return result;
		}

		/// <summary>
		/// Removes last slash from URL
		/// </summary>
		/// <param name="url">URL</param>
		/// <returns>URL without the last slash</returns>
		public static string RemoveLastSlashFromUrl(string url)
		{
			if (string.IsNullOrWhiteSpace(url))
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "url");
			}

			string result = _lastSlashRegExp.Replace(url.Trim(), string.Empty);

			return result;
		}

		/// <summary>
		/// Combines two URLs
		/// </summary>
		/// <param name="baseUrl">The base URL</param>
		/// <param name="relativeUrl">The relative URL to add to the base URL</param>
		/// <returns>The absolute URL</returns>
		public static string CombineUrls(string baseUrl, string relativeUrl)
		{
			string result = RemoveLastSlashFromUrl(baseUrl) + "/" + RemoveFirstSlashFromUrl(relativeUrl);

			return result;
		}

		/// <summary>
		/// Transforms relative URL to an absolute (relative to web application)
		/// </summary>
		/// <param name="baseUrl">The base URL</param>
		/// <param name="relativeUrl">The relative URL</param>
		/// <returns>The absolute URL</returns>
		internal static string TransformRelativeUrlToAbsolute(string baseUrl, string relativeUrl)
		{
			if (string.IsNullOrWhiteSpace(baseUrl))
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "baseUrl");
			}

			if (string.IsNullOrWhiteSpace(relativeUrl))
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "relativeUrl");
			}

			string newRelativeUrl = ProcessBackSlashesInUrl(relativeUrl);

			if (newRelativeUrl.StartsWith("/") || _protocolRegExp.IsMatch(newRelativeUrl))
			{
				return newRelativeUrl;
			}

			if (newRelativeUrl.StartsWith("~/"))
			{
				return VirtualPathUtility.ToAbsolute(newRelativeUrl);
			}

			string absoluteUrl;
			string newBaseUrl = ProcessBackSlashesInUrl(
				VirtualPathUtility.ToAbsolute(Path.GetDirectoryName(baseUrl)) + @"/");

			if (newRelativeUrl.StartsWith("../"))
			{
				const string fakeSiteUrl = "http://bundletransformer.codeplex.com/";
				var baseUri = new Uri(CombineUrls(fakeSiteUrl, newBaseUrl), UriKind.Absolute);

				var absoluteUri = new Uri(baseUri, newRelativeUrl);
				absoluteUrl = absoluteUri.PathAndQuery;
			}
			else
			{
				absoluteUrl = CombineUrls(newBaseUrl, newRelativeUrl);
			}

			return absoluteUrl;
		}

		/// <summary>
		/// Converts string value to string collection
		/// </summary>
		/// <param name="value">String value</param>
		/// <param name="delimiter">Delimiter</param>
		/// <param name="removeEmptyEntries">Allow removal of empty items from collection</param>
		/// <returns>String collection</returns>
		public static string[] ConvertToStringCollection(string value, char delimiter, 
			bool removeEmptyEntries = false)
		{
			var result = new List<string>();

			if (!string.IsNullOrWhiteSpace(value))
			{
				string[] itemList = value
					.Trim()
					.Split(delimiter)
					;
				int itemCount = itemList.Length;

				for (int itemIndex = 0; itemIndex < itemCount; itemIndex++)
				{
					string item = itemList[itemIndex].Trim();
					if (item.Length > 0 || !removeEmptyEntries)
					{
						result.Add(item);
					}
				}
			}

			return result.ToArray();
		}

		/// <summary>
		/// Creates instance by specified full type name
		/// </summary>
		/// <param name="fullTypeName">Full type name</param>
		/// <typeparam name="T">Target type</typeparam>
		/// <returns>Instance of type</returns>
		internal static T CreateInstanceByFullTypeName<T>(string fullTypeName) where T : class
		{
			if (string.IsNullOrWhiteSpace(fullTypeName))
			{
				throw new ArgumentNullException(Strings.Common_ValueIsEmpty);
			}

			string[] fullTypeNameParts = ConvertToStringCollection(fullTypeName, ',', true);

			if (fullTypeNameParts.Length != 2)
			{
			    throw new ArgumentException(
			        Strings.Common_InvalidFullTypeName, 
			        "fullTypeName");
			}

			string assemblyName = fullTypeNameParts[1].Trim();
			string typeName = fullTypeNameParts[0].Trim();

			Assembly assembly = Assembly.Load(assemblyName);
			object instance = assembly.CreateInstance(typeName);
			if (instance == null)
			{
				throw new NullReferenceException(string.Format(Strings.Common_InstanceCreationFailed, typeName));
			}

			return (T)instance;
		}

		/// <summary>
		/// Converts value of source enumeration type to value of destination enumeration type
		/// </summary>
		/// <typeparam name="TSource">Source enumeration type</typeparam>
		/// <typeparam name="TDest">Destination enumeration type</typeparam>
		/// <param name="value">Value of source enumeration type</param>
		/// <returns>Value of destination enumeration type</returns>
		public static TDest GetEnumFromOtherEnum<TSource, TDest>(TSource value)
		{
			string name = value.ToString();
			var destEnumValues = (TDest[])Enum.GetValues(typeof(TDest));

			foreach (var destEnum in destEnumValues)
			{
				if (string.Equals(destEnum.ToString(), name, StringComparison.OrdinalIgnoreCase))
				{
					return destEnum;
				}
			}

			throw new InvalidCastException(
				string.Format(Strings.Common_EnumValueConversionFailed,
					name, typeof(TSource), typeof(TDest))
			);
		}

		public static string GetResourceAsString(string resourceName, Type type)
		{
			Assembly assembly = type.Assembly;
			using (Stream stream = assembly.GetManifestResourceStream(resourceName))
			{
				using (var reader = new StreamReader(stream))
				{
					return reader.ReadToEnd();
				}
			}
		}
	}
}
