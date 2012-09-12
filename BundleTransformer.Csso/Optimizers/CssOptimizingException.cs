namespace BundleTransformer.Csso.Optimizers
{
	using System;

	/// <summary>
	/// The exception that is thrown when a optimizing of asset code by Sergey Kryzhanovsky's CSSO is failed
	/// </summary>
	internal sealed class CssOptimizingException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Csso.Optimizers.CssOptimizingException class 
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public CssOptimizingException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Csso.Optimizers.CssOptimizingException class 
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public CssOptimizingException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}
