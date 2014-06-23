namespace BundleTransformer.UglifyJs.Uglifiers
{
	using System;

	/// <summary>
	/// The exception that is thrown when a uglifying of asset code by JS-uglifier is failed
	/// </summary>
	internal sealed class JsUglifyingException : Exception
	{
		/// <summary>
		/// Initializes a new instance of the <code>BundleTransformer.UglifyJs.Uglifiers.JsUglifyingException</code>
		/// class with a specified error message
		/// </summary>
		/// <param name="message">The message that describes the error</param>
		public JsUglifyingException(string message)
			: base(message)
		{ }

		/// <summary>
		/// Initializes a new instance of the <code>BundleTransformer.UglifyJs.Uglifiers.JsUglifyingException</code>
		/// class with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="innerException">The exception that is the cause of the current exception</param>
		public JsUglifyingException(string message, Exception innerException)
			: base(message, innerException)
		{ }
	}
}