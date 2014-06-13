namespace BundleTransformer.Core.HttpHandlers
{
	using System.Linq;
	using System.Web.Caching;
	using System.Web.Optimization;

	using Configuration;
	using FileSystem;
	using Transformers;
	using Translators;

	/// <summary>
	/// Base class of the debugging HTTP-handler that responsible for text output 
	/// of processed style asset
	/// </summary>
	public abstract class StyleAssetHandlerBase : AssetHandlerBase
	{
		/// <summary>
		/// Gets a asset content type
		/// </summary>
		protected override string ContentType
		{
			get { return Constants.ContentType.Css; }
		}


		/// <summary>
		/// Constructs a instance of the debugging style HTTP-handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler</param>
		protected StyleAssetHandlerBase(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper, 
			AssetHandlerSettings assetHandlerConfig)
				: base(cache, virtualFileSystemWrapper, assetHandlerConfig)
		{ }


		/// <summary>
		/// Gets a CSS-transformer from bundle
		/// </summary>
		/// <param name="bundle">Bundle</param>
		/// <returns>CSS-transformer</returns>
		protected override ITransformer GetTransformer(Bundle bundle)
		{
			IBundleTransform transformer = null;
			if (bundle != null)
			{
				transformer = bundle.Transforms.FirstOrDefault(t => t is CssTransformer);
			}

			return (ITransformer)transformer;
		}

		/// <summary>
		/// Gets a translator by name
		/// </summary>
		/// <typeparam name="T">Type of translator</typeparam>
		/// <param name="translatorName">Name of translator</param>
		/// <returns>Translator</returns>
		protected override T GetTranslatorByName<T>(string translatorName)
		{
			ITranslator translator = BundleTransformerContext.Current.Css.GetTranslatorInstance(translatorName);

			return (T)translator;
		}
	}
}