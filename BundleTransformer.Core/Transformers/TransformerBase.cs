namespace BundleTransformer.Core.Transformers
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Web;
	using System.Web.Optimization;

	using Assets;
	using Configuration;
	using Minifiers;
	using Translators;

	/// <summary>
	/// Base class of transformer is responsible for processing assets
	/// </summary>
	public abstract class TransformerBase : IBundleTransform, IDisposable
	{
		/// <summary>
		/// List of patterns of files and directories that 
		/// should be ignored when processing
		/// </summary>
		protected string[] _ignorePatterns;

		/// <summary>
		/// Flag that web application is in debug mode
		/// </summary>
		protected bool _isDebugMode;

		/// <summary>
		/// Configuration settings of core
		/// </summary>
		protected CoreSettings _coreConfiguration;

		/// <summary>
		/// List of translators (LESS, Sass, SCSS and CoffeeScript)
		/// </summary>
		protected IList<ITranslator> _translators;

		/// <summary>
		/// Minifier
		/// </summary>
		protected IMinifier _minifier;


		/// <summary>
		/// Constructs instance of transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <param name="coreConfiguration">Configuration settings of core</param>
		protected TransformerBase(string[] ignorePatterns, bool isDebugMode, CoreSettings coreConfiguration)
		{
			_ignorePatterns = ignorePatterns;
			_isDebugMode = isDebugMode;
			_coreConfiguration = coreConfiguration;
		}


		/// <summary>
		/// Starts a processing of assets
		/// </summary>
		/// <param name="context">Object BundleContext</param>
		/// <param name="response">Object BundleResponse</param>
		public void Process(BundleContext context, BundleResponse response)
		{
			string currentBundlePath = context.BundleVirtualPath;
			Bundle currentBundle = context.BundleCollection.SingleOrDefault(b => b.Path == currentBundlePath);
			if (currentBundle != null)
			{
				var assets = new List<IAsset>();
				IEnumerable<FileInfo> assetFiles = currentBundle.EnumerateFiles(context);
				IBundleOrderer currentBundleOrderer = currentBundle.Orderer;
				if (currentBundleOrderer != null)
				{
					assetFiles = currentBundleOrderer.OrderFiles(context, assetFiles);
				}

				foreach (var assetFile in assetFiles)
				{
					assets.Add(new Asset(assetFile.FullName));
				}

				Transform(assets, currentBundle, response, context.HttpContext);
			}
		}

		/// <summary>
		/// Transforms assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundle">Object Bundle</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="httpContext">Object HttpContext</param>
		protected abstract void Transform(IList<IAsset> assets, Bundle bundle, BundleResponse bundleResponse, HttpContextBase httpContext);

		/// <summary>
		/// Validates assets for compliance with a valid types
		/// </summary>
		/// <param name="assets">Set of assets</param>
		protected abstract void ValidateAssetTypes(IList<IAsset> assets);

		/// <summary>
		/// Removes duplicate assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of unique assets</returns>
		protected abstract IList<IAsset> RemoveDuplicateAssets(IList<IAsset> assets);

		/// <summary>
		/// Removes unnecessary assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of necessary assets</returns>
		protected abstract IList<IAsset> RemoveUnnecessaryAssets(IList<IAsset> assets);

		protected virtual IList<IAsset> Translate(IList<IAsset> assets)
		{
			IList<IAsset> processedAssets = assets;

			foreach (var translator in _translators)
			{
				translator.IsDebugMode = _isDebugMode;

				processedAssets = translator.Translate(processedAssets);
			}

			return processedAssets;
		}

		/// <summary>
		/// Replaces file extensions of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets with a modified extension</returns>
		protected abstract IList<IAsset> ReplaceFileExtensions(IList<IAsset> assets);

		/// <summary>
		/// Minify text content of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets with minified text content</returns>
		protected virtual IList<IAsset> Minify(IList<IAsset> assets)
		{
			IList<IAsset> processedAssets = _minifier.Minify(assets);

			return processedAssets;
		}

		/// <summary>
		/// Combines code of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="enableTracing">Enables tracing</param>
		protected abstract void Combine(IList<IAsset> assets, BundleResponse bundleResponse,
			bool enableTracing);

		/// <summary>
		/// Switchs transformer into debug mode
		/// </summary>
		public void ForceDebugMode()
		{
			_isDebugMode = true;
		}

		/// <summary>
		/// Switchs transformer into release mode
		/// </summary>
		public void ForceReleaseMode()
		{
			_isDebugMode = false;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public abstract void Dispose();
	}
}
