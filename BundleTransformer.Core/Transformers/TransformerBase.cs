namespace BundleTransformer.Core.Transformers
{
	using System;
	using System.Collections.Generic;
	using System.Collections.ObjectModel;
	using System.Linq;
	using System.Web;
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
		/// Configuration settings of core
		/// </summary>
		protected readonly CoreSettings _coreConfig;

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
		/// Constructs a instance of transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		protected TransformerBase(string[] ignorePatterns, CoreSettings coreConfig)
		{
			_ignorePatterns = ignorePatterns;
			_coreConfig = coreConfig;
		}


		/// <summary>
		/// Starts a processing of assets
		/// </summary>
		/// <param name="context">Object BundleContext</param>
		/// <param name="response">Object BundleResponse</param>
		public void Process(BundleContext context, BundleResponse response)
		{
			Process(context, response, BundleTransformerContext.Current.IsDebugMode);
		}

		/// <summary>
		/// Starts a processing of assets
		/// </summary>
		/// <param name="context">Object BundleContext</param>
		/// <param name="response">Object BundleResponse</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		public void Process(BundleContext context, BundleResponse response, bool isDebugMode)
		{
			if (context == null)
			{
				throw new ArgumentNullException("context", Strings.Common_ValueIsNull);
			}

			if (response == null)
			{
				throw new ArgumentNullException("response", Strings.Common_ValueIsNull);
			}

			if (!context.EnableInstrumentation)
			{
				var assets = new List<IAsset>();
				IEnumerable<BundleFile> bundleFiles = response.Files;

				foreach (var bundleFile in bundleFiles)
				{
					assets.Add(new Asset(bundleFile.VirtualFile.VirtualPath, bundleFile));
				}

				Transform(assets, response, BundleTable.VirtualPathProvider, context.HttpContext, isDebugMode);
			}
		}

		/// <summary>
		/// Transforms a assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="virtualPathProvider">Virtual path provider</param>
		/// <param name="httpContext">Object HttpContext</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		protected abstract void Transform(IList<IAsset> assets, BundleResponse bundleResponse,
			VirtualPathProvider virtualPathProvider, HttpContextBase httpContext, bool isDebugMode);

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
		/// <param name="enableTracing">Enables tracing</param>
		protected abstract string Combine(IList<IAsset> assets, bool enableTracing);

		/// <summary>
		/// Configures a bundle response
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="virtualPathProvider">Virtual path provider</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		protected virtual void ConfigureBundleResponse(IList<IAsset> assets, BundleResponse bundleResponse,
			VirtualPathProvider virtualPathProvider, bool isDebugMode)
		{
			var assetVirtualPaths = new List<string>();

			foreach (var asset in assets)
			{
				assetVirtualPaths.Add(asset.VirtualPath);
				if (!isDebugMode && asset.VirtualPathDependencies.Count > 0)
				{
					assetVirtualPaths.AddRange(asset.VirtualPathDependencies);
				}
			}

			assetVirtualPaths = assetVirtualPaths.Distinct().ToList();

			var bundleFiles = assetVirtualPaths.Select(assetVirtualPath => new BundleFile(assetVirtualPath,
				virtualPathProvider.GetFile(assetVirtualPath))).ToList();
			bundleResponse.Files = bundleFiles;
		}
	}
}