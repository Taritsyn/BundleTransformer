namespace BundleTransformer.Core.Translators
{
	using System;

	/// <summary>
	/// The exception that is thrown when a translation of asset code, written 
	/// on intermediate language, is failed
	/// </summary>
	public sealed class AssetTranslationException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Core.Translators.AssetTranslationException class 
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public AssetTranslationException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Core.Translators.AssetTranslationException class 
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public AssetTranslationException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}