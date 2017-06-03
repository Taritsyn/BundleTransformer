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
	using Utilities;
	using Validators;

	/// <summary>
	/// Transformer that responsible for processing of script assets
	/// </summary>
	public sealed class ScriptTransformer : TransformerBase
	{
		/// <summary>
		/// List of JS-files with Microsoft-style extensions
		/// </summary>
		private readonly string[] _jsFilesWithMsStyleExtensions;

		/// <summary>
		/// Gets a asset content type
		/// </summary>
		protected override string ContentType
		{
			get { return Constants.ContentType.Js; }
		}

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		public ScriptTransformer()
			: this(null, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		public ScriptTransformer(IMinifier minifier)
			: this(minifier, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		public ScriptTransformer(IList<ITranslator> translators)
			: this(null, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="postProcessors">List of postprocessors</param>
		public ScriptTransformer(IList<IPostProcessor> postProcessors)
			: this(null, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		public ScriptTransformer(IMinifier minifier, IList<ITranslator> translators)
			: this(minifier, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public ScriptTransformer(IMinifier minifier, IList<IPostProcessor> postProcessors)
			: this(minifier, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public ScriptTransformer(IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(null, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public ScriptTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(minifier, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that
		/// should be ignored when processing</param>
		public ScriptTransformer(string[] ignorePatterns)
			: this(null, null, null, ignorePatterns)
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that
		/// should be ignored when processing</param>
		public ScriptTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns)
			: this(minifier, translators, postProcessors, ignorePatterns,
				BundleTransformerContext.Current.Configuration.GetCoreSettings())
		{ }

		/// <summary>
		/// Constructs a instance of script transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that
		/// should be ignored when processing</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		public ScriptTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns, CoreSettings coreConfig)
			: base(ignorePatterns, coreConfig)
		{
			ScriptSettings scriptConfig = coreConfig.Scripts;
			UsePreMinifiedFiles = scriptConfig.UsePreMinifiedFiles;
			CombineFilesBeforeMinification = scriptConfig.CombineFilesBeforeMinification;

			_jsFilesWithMsStyleExtensions = Utils.ConvertToStringCollection(
				coreConfig.JsFilesWithMicrosoftStyleExtensions.Replace(';', ','),
				',', true, true);

			IAssetContext scriptContext = BundleTransformerContext.Current.Scripts;

			_minifier = minifier ?? scriptContext.GetDefaultMinifierInstance();
			_translators = (translators ?? scriptContext.GetDefaultTranslatorInstances())
				.ToList()
				.AsReadOnly()
				;
			_postProcessors = (postProcessors ?? scriptContext.GetDefaultPostProcessorInstances())
				.ToList()
				.AsReadOnly()
				;
		}


		/// <summary>
		/// Validates whether the specified assets are script asset
		/// </summary>
		/// <param name="assets">Set of script assets</param>
		protected override void ValidateAssetTypes(IList<IAsset> assets)
		{
			var scriptAssetTypesValidator = new ScriptAssetTypesValidator();
			scriptAssetTypesValidator.Validate(assets);
		}

		/// <summary>
		/// Removes a duplicate script assets
		/// </summary>
		/// <param name="assets">Set of script assets</param>
		/// <returns>Set of unique script assets</returns>
		protected override IList<IAsset> RemoveDuplicateAssets(IList<IAsset> assets)
		{
			var scriptDuplicateFilter = new ScriptDuplicateAssetsFilter();
			IList<IAsset> processedAssets = scriptDuplicateFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Removes a unnecessary script assets
		/// </summary>
		/// <param name="assets">Set of script assets</param>
		/// <returns>Set of necessary script assets</returns>
		protected override IList<IAsset> RemoveUnnecessaryAssets(IList<IAsset> assets)
		{
			var scriptUnnecessaryAssetsFilter = new ScriptUnnecessaryAssetsFilter(_ignorePatterns);
			IList<IAsset> processedAssets = scriptUnnecessaryAssetsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Replaces a file extensions of script assets
		/// </summary>
		/// <param name="assets">Set of script assets</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Set of script assets with a modified extension</returns>
		protected override IList<IAsset> ReplaceFileExtensions(IList<IAsset> assets, bool isDebugMode)
		{
			var jsFileExtensionsFilter = new JsFileExtensionsFilter(_jsFilesWithMsStyleExtensions)
			{
			    IsDebugMode = isDebugMode,
				UsePreMinifiedFiles = UsePreMinifiedFiles
			};

			IList<IAsset> processedAssets = jsFileExtensionsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Combines a code of script assets
		/// </summary>
		/// <param name="assets">Set of script assets</param>
		/// <param name="bundleVirtualPath">Virtual path of bundle</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// /// <returns>Combined asset</returns>
		protected override IAsset Combine(IList<IAsset> assets, string bundleVirtualPath, bool isDebugMode)
		{
			var scriptCombiner = new ScriptCombiner
			{
				IsDebugMode = isDebugMode,
				EnableTracing = EnableTracing
			};

			IAsset combinedAsset = scriptCombiner.Combine(assets, bundleVirtualPath);

			return combinedAsset;
		}
	}
}