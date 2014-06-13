namespace BundleTransformer.Core
{
	using System.Collections.Generic;

	using Minifiers;
	using PostProcessors;
	using Translators;

	/// <summary>
	/// Asset context
	/// </summary>
	public abstract class AssetTypeContextBase
	{
		/// <summary>
		/// Gets a instance of translator
		/// </summary>
		/// <param name="translatorName">Translator name</param>
		/// <returns>Instance of translator</returns>
		public abstract ITranslator GetTranslatorInstance(string translatorName);

		/// <summary>
		/// Gets a instance of postprocessor
		/// </summary>
		/// <param name="postProcessorName">Postprocessor name</param>
		/// <returns>Instance of postprocessor</returns>
		public abstract IPostProcessor GetPostProcessorInstance(string postProcessorName);

		/// <summary>
		/// Gets a instance of minifier
		/// </summary>
		/// <param name="minifierName">Minifier name</param>
		/// <returns>Instance of minifier</returns>
		public abstract IMinifier GetMinifierInstance(string minifierName);

		/// <summary>
		/// Gets a list of default translator instances
		/// </summary>
		/// <returns>List of default translator instances</returns>
		public abstract IList<ITranslator> GetDefaultTranslatorInstances();

		/// <summary>
		/// Gets a list of default postprocessor instances
		/// </summary>
		/// <returns>List of default postprocessor instances</returns>
		public abstract IList<IPostProcessor> GetDefaultPostProcessorInstances();

		/// <summary>
		/// Gets a instance of default minifier
		/// </summary>
		/// <returns>Instance of default minifier</returns>
		public abstract IMinifier GetDefaultMinifierInstance();
	}
}