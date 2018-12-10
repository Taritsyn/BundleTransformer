using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

using AdvancedStringBuilder;

using BundleTransformer.Core.Helpers;

namespace BundleTransformer.Closure.Internal
{
	/// <summary>
	/// A container for name/value tuples encoded using application/x-www-form-urlencoded MIME type
	/// </summary>
	internal sealed class CustomFormUrlEncodedContent : ByteArrayContent
	{
		private static readonly Encoding _defaultHttpEncoding = Encoding.GetEncoding(28591);


		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Closure.Http.CustomFormUrlEncodedContent
		/// class with a specific collection of name/value pairs.
		/// </summary>
		/// <param name="nameValueCollection">A collection of name/value pairs</param>
		public CustomFormUrlEncodedContent(IEnumerable<KeyValuePair<string, string>> nameValueCollection)
			: base(GetContentByteArray(nameValueCollection))
		{
			Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");
		}


		private static byte[] GetContentByteArray(IEnumerable<KeyValuePair<string, string>> nameValueCollection)
		{
			if (nameValueCollection == null)
			{
				throw new ArgumentNullException("nameValueCollection");
			}

			var stringBuilderPool = StringBuilderPool.Shared;
			StringBuilder contentBuilder = stringBuilderPool.Rent();

			foreach (KeyValuePair<string, string> keyValuePair in nameValueCollection)
			{
				if (contentBuilder.Length > 0)
				{
					contentBuilder.Append("&");
				}
				contentBuilder.Append(Encode(keyValuePair.Key));
				contentBuilder.Append("=");
				contentBuilder.Append(Encode(keyValuePair.Value));
			}

			string content = contentBuilder.ToString();
			stringBuilderPool.Return(contentBuilder);

			return _defaultHttpEncoding.GetBytes(content);
		}

		private static string Encode(string data)
		{
			string result = !string.IsNullOrEmpty(data) ?
				UrlHelpers.EscapeLongDataString(data).Replace("%20", "+") : string.Empty;

			return result;
		}
	}
}