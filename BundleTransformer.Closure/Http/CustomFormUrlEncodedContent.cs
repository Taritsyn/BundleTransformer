namespace BundleTransformer.Closure.Http
{
	using System;
	using System.Collections.Generic;
	using System.Net.Http;
	using System.Net.Http.Headers;
	using System.Text;

	using Core.Helpers;

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

			var stringBuilder = new StringBuilder();

			foreach (KeyValuePair<string, string> keyValuePair in nameValueCollection)
			{
				if (stringBuilder.Length > 0)
				{
					stringBuilder.Append("&");
				}
				stringBuilder.Append(Encode(keyValuePair.Key));
				stringBuilder.Append("=");
				stringBuilder.Append(Encode(keyValuePair.Value));
			}

			return _defaultHttpEncoding.GetBytes(stringBuilder.ToString());
		}

		private static string Encode(string data)
		{
			string result = (!string.IsNullOrEmpty(data)) ?
				UrlHelpers.EscapeLongDataString(data).Replace("%20", "+") : string.Empty;

			return result;
		}
	}
}