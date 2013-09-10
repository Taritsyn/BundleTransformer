namespace BundleTransformer.WG
{
	using System;

	/// <summary>
	/// The exception that is thrown when a minification of asset code by WebGrease Minifier is failed
	/// </summary>
	internal sealed class WgMinificationException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the BundleTransformer.WG.WgMinificationException class 
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public WgMinificationException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the BundleTransformer.WG.WgMinificationException class 
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public WgMinificationException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}