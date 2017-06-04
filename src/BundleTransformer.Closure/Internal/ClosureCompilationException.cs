using System;

namespace BundleTransformer.Closure.Internal
{
	/// <summary>
	/// The exception that is thrown when a compiling of asset code by Google Closure Compiler is failed
	/// </summary>
	internal sealed class ClosureCompilationException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the <see cref="ClosureCompilationException"/> class
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public ClosureCompilationException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the <see cref="ClosureCompilationException"/> class
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public ClosureCompilationException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}