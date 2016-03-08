namespace BundleTransformer.Hogan.Internal
{
	using System;

	/// <summary>
	/// The exception that is thrown when a compiling of asset code by Hogan-compiler is failed
	/// </summary>
	internal sealed class HoganCompilationException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the <see cref="HoganCompilationException" /> class
		/// with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public HoganCompilationException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the <see cref="HoganCompilationException" /> class
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public HoganCompilationException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}