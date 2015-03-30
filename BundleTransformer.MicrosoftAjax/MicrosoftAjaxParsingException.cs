namespace BundleTransformer.MicrosoftAjax
{
	using System;

	/// <summary>
	/// The exception that is thrown when a parsing of asset code by Microsoft Ajax Minifier is failed
	/// </summary>
	internal sealed class MicrosoftAjaxParsingException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the BundleTransformer.MicrosoftAjax.MicrosoftAjaxParsingException class
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public MicrosoftAjaxParsingException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the BundleTransformer.MicrosoftAjax.MicrosoftAjaxParsingException class
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public MicrosoftAjaxParsingException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}