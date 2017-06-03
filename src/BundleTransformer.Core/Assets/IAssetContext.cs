namespace BundleTransformer.Core.Assets
{
	using System.Collections.Generic;
	using System.Web.Optimization;

	using Minifiers;
	using PostProcessors;
	using Translators;

	/// <summary>
	/// Defines interface of asset context
	/// </summary>
	public interface IAssetContext
	{
		/// <summary>
		/// Gets a file extension mappings
		/// </summary>
		FileExtensionMappingCollection FileExtensionMappings
		{
			get;
		}


		/// <summary>
		/// Gets a instance of default transform
		/// </summary>
		/// <returns>Instance of transformer</returns>
		IBundleTransform GetDefaultTransformInstance();

		/// <summary>
		/// Gets a instance of translator
		/// </summary>
		/// <param name="translatorName">Translator name</param>
		/// <returns>Instance of translator</returns>
		ITranslator GetTranslatorInstance(string translatorName);

		/// <summary>
		/// Gets a instance of postprocessor
		/// </summary>
		/// <param name="postProcessorName">Postprocessor name</param>
		/// <returns>Instance of postprocessor</returns>
		IPostProcessor GetPostProcessorInstance(string postProcessorName);

		/// <summary>
		/// Gets a instance of minifier
		/// </summary>
		/// <param name="minifierName">Minifier name</param>
		/// <returns>Instance of minifier</returns>
		IMinifier GetMinifierInstance(string minifierName);

		/// <summary>
		/// Gets a list of default translator instances
		/// </summary>
		/// <returns>List of default translator instances</returns>
		IList<ITranslator> GetDefaultTranslatorInstances();

		/// <summary>
		/// Gets a list of default postprocessor instances
		/// </summary>
		/// <returns>List of default postprocessor instances</returns>
		IList<IPostProcessor> GetDefaultPostProcessorInstances();

		/// <summary>
		/// Gets a instance of default minifier
		/// </summary>
		/// <returns>Instance of default minifier</returns>
		IMinifier GetDefaultMinifierInstance();
	}
}