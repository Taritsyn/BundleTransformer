namespace BundleTransformer.Core.Translators
{
	using System;

	/// <summary>
	/// The exception that is thrown when a translator is not found
	/// </summary>
	public sealed class TranslatorNotFoundException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Core.Translators.TranslatorNotFoundException class 
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public TranslatorNotFoundException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Core.Translators.TranslatorNotFoundException class 
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public TranslatorNotFoundException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}
