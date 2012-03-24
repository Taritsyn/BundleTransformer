namespace BundleTransformer.Core.Validators
{
	using System.Collections.Generic;

	using Assets;

	/// <summary>
	/// Defines interface of asset validator
	/// </summary>
	interface IValidator
	{
		/// <summary>
		/// Validates assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		void Validate(IList<IAsset> assets);
	}
}
