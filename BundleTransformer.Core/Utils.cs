namespace BundleTransformer.Core
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Reflection;
	using System.Text;
	using System.Text.RegularExpressions;

	using Resources;

	public static class Utils
	{
		/// <summary>
		/// Regular expression to find first slash
		/// </summary>
		private static readonly Regex _firstSlashRegExp = new Regex(@"^(?:\/|\\)*",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression to find last slash
		/// </summary>
		private static readonly Regex _lastSlashRegExp = new Regex(@"(?:\/|\\)*$",
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

			string typeName;
			string assemblyName;
			Assembly assembly;
			int commaPosition = fullTypeName.IndexOf(',');

			if (commaPosition != -1)
			{
				typeName = fullTypeName.Substring(0, commaPosition).Trim();
				if (string.IsNullOrEmpty(typeName))
				{
					throw new EmptyValueException(Strings.Common_TypeNameIsEmpty);
				}

				assemblyName = fullTypeName.Substring(commaPosition + 1,
					fullTypeName.Length - (commaPosition + 1)).Trim();
				if (string.IsNullOrEmpty(assemblyName))
				{
					throw new EmptyValueException(Strings.Common_AssemblyNameIsEmpty);
				}

				assembly = Assembly.Load(assemblyName);
			}
			else
			{
				typeName = fullTypeName;
				assembly = typeof(Utils).Assembly;
				assemblyName = assembly.FullName;
			}

			object instance = assembly.CreateInstance(typeName);
			if (instance == null)
			{
				throw new NullReferenceException(string.Format(Strings.Common_InstanceCreationFailed, 
					typeName, assemblyName));
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

		/// <summary>
		/// Gets a content of the embedded resource as string
		/// </summary>
		/// <param name="resourceName">Resource name</param>
		/// <param name="type">Type from assembly that containing an embedded resource</param>
		/// <returns>Сontent of the embedded resource as string</returns>
		public static string GetResourceAsString(string resourceName, Type type)
		{
			Assembly assembly = type.Assembly;

			return GetResourceAsString(resourceName, assembly);
		}

		/// <summary>
		/// Gets a content of the embedded resource as string
		/// </summary>
		/// <param name="resourceName">Resource name</param>
		/// <param name="assembly">Assembly that containing an embedded resource</param>
		/// <returns>Сontent of the embedded resource as string</returns>
		public static string GetResourceAsString(string resourceName, Assembly assembly)
		{
			using (Stream stream = assembly.GetManifestResourceStream(resourceName))
			{
				if (stream == null)
				{
					throw new NullReferenceException(
						string.Format(Strings.Resources_ResourceIsNull, resourceName));
				}

				using (var reader = new StreamReader(stream))
				{
					return reader.ReadToEnd();
				}
			}
		}

		/// <summary>
		/// Detect if a stream is text and detect the encoding
		/// </summary>
		/// <param name="stream">Stream</param>
		/// <param name="sampleSize">Number of characters to use for testing</param>
		/// <param name="encoding">Detected encoding</param>
		/// <returns>Result of check (true - is text; false - is binary)</returns>
		public static bool IsTextStream(Stream stream, int sampleSize, out Encoding encoding)
		{
			var rawData = new byte[sampleSize];
			var text = new char[sampleSize];
			bool isText = true;

			// Read raw bytes
			int rawDataCount = stream.Read(rawData, 0, rawData.Length);
			stream.Seek(0, SeekOrigin.Begin);

			// Detect encoding correctly (from Rick Strahl's blog)
			// http://www.west-wind.com/weblog/posts/2007/Nov/28/Detecting-Text-Encoding-for-StreamReader
			if (rawData[0] == 0xef && rawData[1] == 0xbb && rawData[2] == 0xbf)
			{
				encoding = Encoding.UTF8;
			}
			else if (rawData[0] == 0xfe && rawData[1] == 0xff)
			{
				encoding = Encoding.Unicode;
			}
			else if (rawData[0] == 0 && rawData[1] == 0 && rawData[2] == 0xfe && rawData[3] == 0xff)
			{
				encoding = Encoding.UTF32;
			}
			else if (rawData[0] == 0x2b && rawData[1] == 0x2f && rawData[2] == 0x76)
			{
				encoding = Encoding.UTF7;
			}
			else
			{
				encoding = Encoding.Default;
			}

			// Read text and detect the encoding
			using (var streamReader = new StreamReader(stream))
			{
				streamReader.Read(text, 0, text.Length);
			}

			using (var memoryStream = new MemoryStream())
			{
				using (var streamWriter = new StreamWriter(memoryStream, encoding))
				{
					// Write the text to a buffer
					streamWriter.Write(text);
					streamWriter.Flush();

					// Get the buffer from the memory stream for comparision
					var memoryBuffer = memoryStream.GetBuffer();

					// Compare only bytes read
					for (var rawDataIndex = 0; rawDataIndex < rawDataCount && isText; rawDataIndex++)
					{
						isText = rawData[rawDataIndex] == memoryBuffer[rawDataIndex];
					}
				}
			}

			return isText;
		}
	}
}