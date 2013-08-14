namespace BundleTransformer.Closure.Http
{
	using System;
	using System.Collections.Generic;
	using System.Net.Http;
	using System.Net.Http.Headers;
	using System.Text;

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
				EscapeLongDataString(data).Replace("%20", "+") : string.Empty;

			return result;
		}

		private static string EscapeLongDataString(string stringToEscape)
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