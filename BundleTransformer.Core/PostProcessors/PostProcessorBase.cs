namespace BundleTransformer.Core.PostProcessors
{
	using System.Collections.Generic;

	using Assets;

	/// <summary>
	/// Base class of asset postprocessor (runs after translators and before minifiers)
	/// </summary>
	public abstract class PostProcessorBase : IPostProcessor
	{
		/// <summary>
		/// Gets or sets a flag for whether to use postprocessor in the debugging HTTP-handlers
		/// </summary>
		public bool UseInDebugMode
		{
			get;
			set;
		}

		/// <summary>
		/// Postprocess a text content of asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset with processed text content</returns>
		public abstract IAsset PostProcess(Assets.IAsset asset);

		/// <summary>
		/// Postprocess a text content of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets with processed code</returns>
		public abstract IList<Assets.IAsset> PostProcess(IList<Assets.IAsset> assets);
	}
}