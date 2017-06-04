using System;

namespace BundleTransformer.Csso.Internal
{
	/// <summary>
	/// The exception that is thrown when a optimizing of asset code by Sergey Kryzhanovsky's CSSO is failed
	/// </summary>
	internal sealed class CssOptimizationException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the <see cref="CssOptimizationException"/> class
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public CssOptimizationException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the <see cref="CssOptimizationException"/> class
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public CssOptimizationException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}