namespace BundleTransformer.Core.PostProcessors
{
	using System.Collections.Generic;

	using Assets;

	/// <summary>
	/// Defines interface of asset postprocessor (runs after translators and before minifier)
	/// </summary>
	public interface IPostProcessor
	{
		/// <summary>
		/// Gets or sets a flag for whether to use postprocessor in the debugging HTTP-handlers
		/// </summary>
		bool UseInDebugMode
		{
			get;
			set;
		}


		/// <summary>
		/// Postprocess a text content of asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset with processed text content</returns>
		IAsset PostProcess(IAsset asset);

		/// <summary>
		/// Postprocess a text content of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets with processed code</returns>
		IList<IAsset> PostProcess(IList<IAsset> assets);
	}
}