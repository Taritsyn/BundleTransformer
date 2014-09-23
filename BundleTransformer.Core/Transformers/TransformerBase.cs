namespace BundleTransformer.Core.Transformers
{
	using System;
	using System.Collections.Generic;
	using System.Collections.ObjectModel;
	using System.Linq;
	using System.Web.Hosting;
	using System.Web.Optimization;

	using Assets;
	using Configuration;
	using Minifiers;
	using PostProcessors;
	using Resources;
	using Translators;

	/// <summary>
	/// Base class of transformer that responsible for processing assets
	/// </summary>
	public abstract class TransformerBase : ITransformer, IBundleTransform
	{
		/// <summary>
		/// List of patterns of files and directories that 
		/// should be ignored when processing
		/// </summary>
		protected readonly string[] _ignorePatterns;

		/// <summary>
		/// List of translators
		/// </summary>
		protected ReadOnlyCollection<ITranslator> _translators;

		/// <summary>
		/// List of postprocessors
		/// </summary>
		protected ReadOnlyCollection<IPostProcessor> _postProcessors;

		/// <summary>
		/// Minifier
		/// </summary>
		protected IMinifier _minifier;

		/// <summary>
		/// Gets a asset content type
		/// </summary>
		protected abstract string ContentType
		{
			get;
		}

		/// <summary>
		/// Gets a list of translators (LESS, Sass, SCSS, CoffeeScript and TypeScript)
		/// </summary>
		public ReadOnlyCollection<ITranslator> Translators
		{
			get { return _translators; }
		}

		/// <summary>
		/// Gets a list of postprocessors
		/// </summary>
		public ReadOnlyCollection<IPostProcessor> PostProcessors
		{
			get { return _postProcessors; }
		}

		/// <summary>
		/// Gets a minifier
		/// </summary>
		public IMinifier Minifier
		{
			get { return _minifier; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to enable tracing
		/// </summary>
		public bool EnableTracing
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow usage of pre-minified files
		/// </summary>
		public bool UsePreMinifiedFiles
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow combine files before minification
		/// </summary>
		public bool CombineFilesBeforeMinification
		{
			get;
			set;
		}



		/// <summary>
		/// Constructs a instance of transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		protected TransformerBase(string[] ignorePatterns, CoreSettings coreConfig)
		{
			_ignorePatterns = ignorePatterns;
			EnableTracing = coreConfig.EnableTracing;
		}


		/// <summary>
		/// Starts a processing of assets
		/// </summary>
		/// <param name="bundleContext">Object BundleContext</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		public void Process(BundleContext bundleContext, BundleResponse bundleResponse)
		{
			Process(bundleContext, bundleResponse, BundleTransformerContext.Current.IsDebugMode);
		}

		/// <summary>
		/// Starts a processing of assets
		/// </summary>
		/// <param name="bundleContext">Object BundleContext</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		public void Process(BundleContext bundleContext, BundleResponse bundleResponse, bool isDebugMode)
		{
			if (bundleContext == null)
			{
				throw new ArgumentNullException("bundleContext", Strings.Common_ValueIsNull);
			}

			if (bundleResponse == null)
			{
				throw new ArgumentNullException("bundleResponse", Strings.Common_ValueIsNull);
			}

			if (!bundleContext.EnableInstrumentation)
			{
				var assets = new List<IAsset>();
				IEnumerable<BundleFile> bundleFiles = bundleResponse.Files;

				foreach (var bundleFile in bundleFiles)
				{
					assets.Add(new Asset(bundleFile.VirtualFile.VirtualPath, bundleFile));
				}

				if (assets.Count > 0)
				{
					Transform(assets, bundleContext, bundleResponse, BundleTable.VirtualPathProvider, isDebugMode);
				}
			}
		}

		/// <summary>
		/// Transforms a assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundleContext">Object BundleContext</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="virtualPathProvider">Virtual path provider</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		protected virtual void Transform(IList<IAsset> assets, BundleContext bundleContext,
			BundleResponse bundleResponse, VirtualPathProvider virtualPathProvider, bool isDebugMode)
		{
			ValidateAssetTypes(assets);
			assets = RemoveDuplicateAssets(assets);
			assets = RemoveUnnecessaryAssets(assets);
			assets = ReplaceFileExtensions(assets, isDebugMode);
			assets = Translate(assets, isDebugMode);
			assets = PostProcess(assets, isDebugMode);

			IAsset combinedAsset;
			if (CombineFilesBeforeMinification)
			{
				combinedAsset = Combine(assets, bundleContext.BundleVirtualPath, isDebugMode);
				if (!isDebugMode)
				{
					combinedAsset = Minify(combinedAsset);
				}
			}
			else
			{
				if (!isDebugMode)
				{
					assets = Minify(assets);
				}
				combinedAsset = Combine(assets, bundleContext.BundleVirtualPath, isDebugMode);
			}

			ConfigureBundleResponse(combinedAsset, bundleResponse, virtualPathProvider);
		}

		/// <summary>
		/// Validates a assets for compliance with a valid types
		/// </summary>
		/// <param name="assets">Set of assets</param>
		protected abstract void ValidateAssetTypes(IList<IAsset> assets);

		/// <summary>
		/// Removes a duplicate assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of unique assets</returns>
		protected abstract IList<IAsset> RemoveDuplicateAssets(IList<IAsset> assets);

		/// <summary>
		/// Removes a unnecessary assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of necessary assets</returns>
		protected abstract IList<IAsset> RemoveUnnecessaryAssets(IList<IAsset> assets);

		/// <summary>
		/// Translates a code of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Set of assets with translated code</returns>
		protected virtual IList<IAsset> Translate(IList<IAsset> assets, bool isDebugMode)
		{
			IList<IAsset> processedAssets = assets;

			foreach (var translator in _translators)
			{
				translator.IsDebugMode = isDebugMode;

				processedAssets = translator.Translate(processedAssets);
			}

			return processedAssets;
		}

		/// <summary>
		/// Replaces a file extensions of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Set of assets with a modified extension</returns>
		protected abstract IList<IAsset> ReplaceFileExtensions(IList<IAsset> assets, bool isDebugMode);

		/// <summary>
		/// Process a text content of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Set of assets with processed code</returns>
		protected virtual IList<IAsset> PostProcess(IList<IAsset> assets, bool isDebugMode)
		{
			IList<IAsset> processedAssets = assets;

			foreach (var postProcessor in _postProcessors)
			{
				if (!isDebugMode || postProcessor.UseInDebugMode)
				{
					processedAssets = postProcessor.PostProcess(processedAssets);
				}
			}

			return processedAssets;
		}

		/// <summary>
		/// Minify a text content of asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset with minified code</returns>
		protected virtual IAsset Minify(IAsset asset)
		{
			IAsset processedAsset = _minifier.Minify(asset);

			return processedAsset;
		}

		/// <summary>
		/// Minify a text content of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets with minified code</returns>
		protected virtual IList<IAsset> Minify(IList<IAsset> assets)
		{
			IList<IAsset> processedAssets = _minifier.Minify(assets);

			return processedAssets;
		}

		/// <summary>
		/// Combines a code of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundleVirtualPath">Virtual path of bundle</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Combined asset</returns>
		protected abstract IAsset Combine(IList<IAsset> assets, string bundleVirtualPath, bool isDebugMode);

		/// <summary>
		/// Configures a bundle bundleResponse
		/// </summary>
		/// <param name="combinedAsset">Combined asset</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="virtualPathProvider">Virtual path provider</param>
		protected virtual void ConfigureBundleResponse(IAsset combinedAsset, BundleResponse bundleResponse,
			VirtualPathProvider virtualPathProvider)
		{
			var bundleFiles = combinedAsset.VirtualPathDependencies.Select(assetVirtualPath => 
				new BundleFile(assetVirtualPath, virtualPathProvider.GetFile(assetVirtualPath))).ToList();

			bundleResponse.Content = combinedAsset.Content;
			bundleResponse.Files = bundleFiles;
			bundleResponse.ContentType = ContentType;
		}
	}
}