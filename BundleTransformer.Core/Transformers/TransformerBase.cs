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
	using Resources;
	using Translators;
	using Web;

	/// <summary>
	/// Base class of transformer is responsible for processing assets
	/// </summary>
	public abstract class TransformerBase : IBundleTransform
	{
		/// <summary>
		/// List of patterns of files and directories that 
		/// should be ignored when processing
		/// </summary>
		protected readonly string[] _ignorePatterns;

		/// <summary>
		/// Information about web application
		/// </summary>
		protected readonly IHttpApplicationInfo _applicationInfo;

		/// <summary>
		/// Configuration settings of core
		/// </summary>
		protected readonly CoreSettings _coreConfig;

		/// <summary>
		/// List of translators (LESS, Sass, SCSS, CoffeeScript and TypeScript)
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
		/// <param name="applicationInfo">Information about web application</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		protected TransformerBase(string[] ignorePatterns, IHttpApplicationInfo applicationInfo, CoreSettings coreConfig)
		{
			_ignorePatterns = ignorePatterns;
			_applicationInfo = applicationInfo;
			_coreConfig = coreConfig;
		}


		/// <summary>
		/// Starts a processing of assets
		/// </summary>
		/// <param name="context">Object BundleContext</param>
		/// <param name="response">Object BundleResponse</param>
		public void Process(BundleContext context, BundleResponse response)
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
				IEnumerable<FileInfo> assetFiles = response.Files;

				foreach (var assetFile in assetFiles)
				{
					assets.Add(new Asset(assetFile.FullName));
				}

				Transform(assets, response, context.HttpContext);
			}
		}

		/// <summary>
		/// Transforms assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="httpContext">Object HttpContext</param>
		protected abstract void Transform(IList<IAsset> assets, BundleResponse bundleResponse, HttpContextBase httpContext);

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
				translator.IsDebugMode = _applicationInfo.IsDebugMode;

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
		/// <param name="enableTracing">Enables tracing</param>
		protected abstract string Combine(IList<IAsset> assets,
			bool enableTracing);

		/// <summary>
		/// Configures bundle response
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="httpContext">Object HttpContext</param>
		protected virtual void ConfigureBundleResponse(IList<IAsset> assets, BundleResponse bundleResponse, HttpContextBase httpContext)
		{
			var assetFilePaths = new List<string>();

			foreach (var asset in assets)
			{
				assetFilePaths.Add(asset.Path);
				if (_applicationInfo.IsOptimizationsEnabled && asset.RequiredFilePaths.Count > 0)
				{
					assetFilePaths.AddRange(asset.RequiredFilePaths);
				}
			}

			assetFilePaths = assetFilePaths.Distinct().ToList();

			var assetFiles = assetFilePaths.Select(assetFilePath => new FileInfo(assetFilePath)).ToList();
			bundleResponse.Files = assetFiles;
		}
	}
}
