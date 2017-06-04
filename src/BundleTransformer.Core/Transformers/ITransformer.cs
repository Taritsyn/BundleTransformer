using System.Collections.ObjectModel;

using BundleTransformer.Core.Minifiers;
using BundleTransformer.Core.PostProcessors;
using BundleTransformer.Core.Translators;

namespace BundleTransformer.Core.Transformers
{
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