namespace BundleTransformer.Core.Transformers
{
	using System.Collections.ObjectModel;

	using Minifiers;
	using PostProcessors;
	using Translators;

	/// <summary>
	/// Defines interface of transformer that responsible for processing assets
	/// </summary>
	public interface ITransformer
	{
		/// <summary>
		/// Gets a list of translators
		/// </summary>
		ReadOnlyCollection<ITranslator> Translators
		{
			get;
		}

		/// <summary>
		/// Gets a list of postprocessors
		/// </summary>
		ReadOnlyCollection<IPostProcessor> PostProcessors
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