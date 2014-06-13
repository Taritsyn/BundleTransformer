namespace BundleTransformer.Core.Transformers
{
	using System.Collections.Generic;

	using Minifiers;
	using PostProcessors;
	using Translators;

	/// <summary>
	/// Defines interface of transformer that responsible for processing assets
	/// </summary>
	public interface ITransformer
	{
		/// <summary>
		/// Gets a list of translators (LESS, Sass, SCSS, CoffeeScript and TypeScript)
		/// </summary>
		IList<ITranslator> Translators
		{
			get;
		}

		/// <summary>
		/// Gets a list of postprocessors
		/// </summary>
		IList<IPostProcessor> PostProcessors
		{
			get;
		}

		/// <summary>
		/// Gets a minifier
		/// </summary>
		IMinifier Minifier
		{
			get;
		}
	}
}