namespace BundleTransformer.Core.Validators
{
	using System;

	/// <summary>
	/// The exception that is thrown when a assets are invalid types
	/// </summary>
	public sealed class InvalidAssetTypesException : Exception
	{
		/// <summary>
		/// Gets or sets a virtual paths of assets with invalid types
		/// </summary>
		public string[] InvalidAssetsVirtualPaths
		{
			get;
			set;
		}


		/// <summary>
		/// Initializes a new instance of the BundleTransformer.Core.Validators.InvalidAssetTypesException class 
		/// with a specified error message and a reference to the inner exception that is the cause of this exception
		/// </summary>
		/// <param name="message">The error message that explains the reason for the exception</param>
		/// <param name="invalidAssetsVirtualPaths">Virtual paths of assets with invalid types</param>
		public InvalidAssetTypesException(string message, string[] invalidAssetsVirtualPaths)
			: base(message)
		{
			InvalidAssetsVirtualPaths = invalidAssetsVirtualPaths;
		}
	}
}
