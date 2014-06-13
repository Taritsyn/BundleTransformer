namespace BundleTransformer.Core.Transformers
{
	using System.Collections.Generic;
	using System.Configuration;
	using System.Text;
	using System.Web;
	using System.Web.Hosting;
	using System.Web.Optimization;

	using Assets;
	using Configuration;
	using Filters;
	using Minifiers;
	using PostProcessors;
	using Resources;
	using Translators;
	using Validators;

	/// <summary>
	/// Transformer that responsible for processing JS-assets
	/// </summary>
	public sealed class JsTransformer : TransformerBase
	{
		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		public JsTransformer()
			: this(null, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		public JsTransformer(IMinifier minifier)
			: this(minifier, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		public JsTransformer(IList<ITranslator> translators)
			: this(null, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="postProcessors">List of postprocessors</param>
		public JsTransformer(IList<IPostProcessor> postProcessors)
			: this(null, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators)
			: this(minifier, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public JsTransformer(IMinifier minifier, IList<IPostProcessor> postProcessors)
			: this(minifier, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public JsTransformer(IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(null, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(minifier, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public JsTransformer(string[] ignorePatterns)
			: this(null, null, null, ignorePatterns)
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns)
			: this(minifier, translators, postProcessors, ignorePatterns,
				BundleTransformerContext.Current.Configuration.GetCoreSettings())
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns, CoreSettings coreConfig)
			: base(ignorePatterns, coreConfig)
		{
			JsContext jsContext = BundleTransformerContext.Current.Js;

			_minifier = minifier ?? jsContext.GetDefaultMinifierInstance();
			_translators = translators ?? jsContext.GetDefaultTranslatorInstances();
			_postProcessors = postProcessors ?? jsContext.GetDefaultPostProcessorInstances();
		}

		/// <summary>
		/// Transforms a JS-assets
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="virtualPathProvider">Virtual path provider</param>
		/// <param name="httpContext">Object HttpContext</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		protected override void Transform(IList<IAsset> assets, BundleResponse bundleResponse,
			VirtualPathProvider virtualPathProvider, HttpContextBase httpContext, bool isDebugMode)
		{
			ValidateAssetTypes(assets);
			assets = RemoveDuplicateAssets(assets);
			assets = RemoveUnnecessaryAssets(assets);
			assets = ReplaceFileExtensions(assets, isDebugMode);
			assets = Translate(assets, isDebugMode);
			assets = PostProcess(assets);
			if (!isDebugMode)
			{
				assets = Minify(assets);
			}

			bundleResponse.Content = Combine(assets, _coreConfig.EnableTracing);
			ConfigureBundleResponse(assets, bundleResponse, virtualPathProvider, isDebugMode);
			bundleResponse.ContentType = Constants.ContentType.Js;
		}

		/// <summary>
		/// Validates whether the specified assets are JS-asset
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		protected override void ValidateAssetTypes(IList<IAsset> assets)
		{
			var jsAssetTypesValidator = new JsAssetTypesValidator();
			jsAssetTypesValidator.Validate(assets);
		}

		/// <summary>
		/// Removes a duplicate JS-assets
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of unique JS-assets</returns>
		protected override IList<IAsset> RemoveDuplicateAssets(IList<IAsset> assets)
		{
			var jsDuplicateFilter = new JsDuplicateAssetsFilter();
			IList<IAsset> processedAssets = jsDuplicateFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Removes a unnecessary JS-assets
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of necessary JS-assets</returns>
		protected override IList<IAsset> RemoveUnnecessaryAssets(IList<IAsset> assets)
		{
			var jsUnnecessaryAssetsFilter = new JsUnnecessaryAssetsFilter(_ignorePatterns);
			IList<IAsset> processedAssets = jsUnnecessaryAssetsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Replaces a file extensions of JS-assets
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Set of JS-assets with a modified extension</returns>
		protected override IList<IAsset> ReplaceFileExtensions(IList<IAsset> assets, bool isDebugMode)
		{
			var jsFileExtensionsFilter = new JsFileExtensionsFilter(
				Utils.ConvertToStringCollection(
					_coreConfig.JsFilesWithMicrosoftStyleExtensions.Replace(';', ','), 
					',', true, true))
			{
			    IsDebugMode = isDebugMode,
				UsePreMinifiedFiles = _coreConfig.Js.UsePreMinifiedFiles
			};

			IList<IAsset> processedAssets = jsFileExtensionsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Combines a code of JS-assets
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <param name="enableTracing">Enables tracing</param>
		protected override string Combine(IList<IAsset> assets, bool enableTracing)
		{
			var content = new StringBuilder();

			int assetCount = assets.Count;
			int lastAssetIndex = assetCount - 1;

			for (int assetIndex = 0; assetIndex < assetCount; assetIndex++)
			{
				IAsset asset = assets[assetIndex];
				string assetContent = asset.Content.TrimEnd();

				if (enableTracing)
				{
					content.AppendFormatLine("//#region URL: {0}", asset.Url);
				}
				content.Append(assetContent);
				if (!assetContent.EndsWith(";"))
				{
					content.Append(";");
				}
				if (enableTracing)
				{
					content.AppendLine();
					content.AppendLine("//#endregion");
				}

				if (assetIndex != lastAssetIndex)
				{
					content.AppendLine();
				}
			}

			return content.ToString();
		}
	}
}