using System.Collections.Generic;

using BundleTransformer.Core.Assets;

namespace BundleTransformer.Core.Validators
{
	/// <summary>
	/// Defines interface of asset validator
	/// </summary>
	interface IValidator
	{
		/// <summary>
		/// Validates a assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		void Validate(IList<IAsset> assets);
	}
}