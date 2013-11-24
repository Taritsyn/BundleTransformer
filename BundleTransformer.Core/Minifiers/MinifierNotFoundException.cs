namespace BundleTransformer.Core.Minifiers
{
	using System;

	/// <summary>
	/// The exception that is thrown when a minifier is not found
	/// </summary>
	public sealed class MinifierNotFoundException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the <code>BundleTransformer.Core.Minifiers.MinifierNotFoundException</code> class 
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public MinifierNotFoundException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the <code>BundleTransformer.Core.Minifiers.MinifierNotFoundException</code> class 
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public MinifierNotFoundException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}