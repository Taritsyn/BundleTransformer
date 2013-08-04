namespace BundleTransformer.Core.Minifiers
{
	using System;

	/// <summary>
	/// The exception that is thrown when a minification of asset code is failed
	/// </summary>
	public sealed class AssetMinificationException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Core.Minifiers.AssetMinificationException class 
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public AssetMinificationException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Core.Minifiers.AssetMinificationException class 
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public AssetMinificationException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}