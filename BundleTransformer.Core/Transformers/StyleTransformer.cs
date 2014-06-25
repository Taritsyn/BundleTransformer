namespace BundleTransformer.Core.Transformers
{
	using System.Collections.Generic;
	using System.Linq;

	using Assets;
	using Combiners;
	using Configuration;
	using Filters;
	using Minifiers;
	using PostProcessors;
	using Translators;
	using Validators;

	/// <summary>
	/// Transformer that responsible for processing of style assets
	/// </summary>
	public sealed class StyleTransformer : TransformerBase
	{
		/// <summary>
		/// Gets a asset content type
		/// </summary>
		protected override string ContentType
		{
			get { return Constants.ContentType.Css; }
		}


		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		public StyleTransformer()
			: this(null, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		public StyleTransformer(IMinifier minifier)
			: this(minifier, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		public StyleTransformer(IList<ITranslator> translators)
			: this(null, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="postProcessors">List of postprocessors</param>
		public StyleTransformer(IList<IPostProcessor> postProcessors)
			: this(null, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		public StyleTransformer(IMinifier minifier, IList<ITranslator> translators)
			: this(minifier, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public StyleTransformer(IMinifier minifier, IList<IPostProcessor> postProcessors)
			: this(minifier, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public StyleTransformer(IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(null, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public StyleTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(minifier, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public StyleTransformer(string[] ignorePatterns)
			: this(null, null, null, ignorePatterns)
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public StyleTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns)
			: this(minifier, translators, postProcessors, ignorePatterns,
				BundleTransformerContext.Current.Configuration.GetCoreSettings())
		{ }

		/// <summary>
		/// Constructs a instance of style transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		public StyleTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns, CoreSettings coreConfig)
			: base(ignorePatterns, coreConfig)
		{
			StyleSettings styleConfig = coreConfig.Styles;
			_usePreMinifiedFiles = styleConfig.UsePreMinifiedFiles;
			_combineFilesBeforeMinification = styleConfig.CombineFilesBeforeMinification;

			IAssetContext styleContext = BundleTransformerContext.Current.Styles;

			_minifier = minifier ?? styleContext.GetDefaultMinifierInstance();
			_translators = (translators ?? styleContext.GetDefaultTranslatorInstances())
				.ToList()
				.AsReadOnly()
				;
			_postProcessors = (postProcessors ?? styleContext.GetDefaultPostProcessorInstances())
				.ToList()
				.AsReadOnly()
				;
		}


		/// <summary>
		/// Validates whether the specified assets are style asset
		/// </summary>
		/// <param name="assets">Set of style assets</param>
		protected override void ValidateAssetTypes(IList<IAsset> assets)
		{
			var styleAssetTypesValidator = new StyleAssetTypesValidator();
			styleAssetTypesValidator.Validate(assets);
		}

		/// <summary>
		/// Removes a duplicate style assets
		/// </summary>
		/// <param name="assets">Set of style assets</param>
		/// <returns>Set of unique style assets</returns>
		protected override IList<IAsset> RemoveDuplicateAssets(IList<IAsset> assets)
		{
			var styleDuplicateFilter = new StyleDuplicateAssetsFilter();
			IList<IAsset> processedAssets = styleDuplicateFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Removes a unnecessary style assets
		/// </summary>
		/// <param name="assets">Set of style assets</param>
		/// <returns>Set of necessary style assets</returns>
		protected override IList<IAsset> RemoveUnnecessaryAssets(IList<IAsset> assets)
		{
			var styleUnnecessaryAssetsFilter = new StyleUnnecessaryAssetsFilter(_ignorePatterns);
			IList<IAsset> processedAssets = styleUnnecessaryAssetsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Replaces a file extensions of style assets
		/// </summary>
		/// <param name="assets">Set of style assets</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Set of style assets with a modified extension</returns>
		protected override IList<IAsset> ReplaceFileExtensions(IList<IAsset> assets, bool isDebugMode)
		{
			var cssFileExtensionsFilter = new CssFileExtensionsFilter
			{
			    IsDebugMode = isDebugMode,
				UsePreMinifiedFiles = _usePreMinifiedFiles
			};

			IList<IAsset> processedAssets = cssFileExtensionsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Combines a code of style assets
		/// </summary>
		/// <param name="assets">Set of style assets</param>
		/// <param name="bundleVirtualPath">Virtual path of bundle</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		protected override IAsset Combine(IList<IAsset> assets, string bundleVirtualPath, bool isDebugMode)
		{
			var styleCombiner = new StyleCombiner
			{
				IsDebugMode = isDebugMode,
				EnableTracing = _enableTracing
			};

			IAsset combinedAsset = styleCombiner.Combine(assets, bundleVirtualPath);

			return combinedAsset;
		}
	}
}