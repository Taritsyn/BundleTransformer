namespace BundleTransformer.Core.Transformers
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.IO;
	using System.Text;
	using System.Web;
	using System.Web.Optimization;

	using Assets;
	using Configuration;
	using Filters;
	using Minifiers;
	using Resources;
	using Translators;
	using Validators;

	/// <summary>
	/// Transformer that responsible for processing CSS-assets
	/// </summary>
	public sealed class CssTransformer : TransformerBase
	{
		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		public CssTransformer()
			: this(null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		public CssTransformer(IMinifier minifier)
			: this(minifier, null, new string[0])
		{ }

		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		public CssTransformer(IList<ITranslator> translators)
			: this(null, translators, new string[0])
		{ }

		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators)
			: this(minifier, translators, new string[0])
		{ }

		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public CssTransformer(string[] ignorePatterns)
			: this(null, null, ignorePatterns)
		{ }

		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators, string[] ignorePatterns)
			: this(minifier, translators, ignorePatterns, 
				HttpContext.Current.IsDebuggingEnabled)
		{ }

		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators, string[] ignorePatterns, bool isDebugMode) 
			: this(minifier, translators, ignorePatterns, isDebugMode, 
				BundleTransformerContext.Current.GetCoreConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <param name="coreConfiguration">Configuration settings of core</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators, 
			string[] ignorePatterns, bool isDebugMode, CoreSettings coreConfiguration)
				: base(ignorePatterns, isDebugMode, coreConfiguration)
		{
			_minifier = minifier ?? CreateDefaultMinifier();
			_translators = translators ?? CreateDefaultTranslators();
		}

		/// <summary>
		/// Destructs instance of CSS-transformer
		/// </summary>
		~CssTransformer()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Creates instance of default CSS-minifier
		/// </summary>
		/// <returns>Default CSS-minifier</returns>
		private IMinifier CreateDefaultMinifier()
		{
			string defaultMinifierName = _coreConfiguration.Css.DefaultMinifier;
			if (String.IsNullOrWhiteSpace(defaultMinifierName))
			{
				throw new ConfigurationErrorsException(
					String.Format(Strings.Configuration_DefaultMinifierNotSpecified, "CSS"));
			}

			MinifierRegistration minifierRegistration = _coreConfiguration.Css.Minifiers[defaultMinifierName];
			if (minifierRegistration == null)
			{
				throw new ConfigurationErrorsException(
					String.Format(Strings.Configuration_MinifierNotRegistered, "CSS", defaultMinifierName));
			}

			string defaultMinifierFullTypeName = minifierRegistration.Type;
			IMinifier defaultMinifier = Utils.CreateInstanceByFullTypeName<IMinifier>(defaultMinifierFullTypeName);

			return defaultMinifier;
		}

		/// <summary>
		/// Creates list of default CSS-translators
		/// </summary>
		/// <returns>List of default CSS-translators</returns>
		private IList<ITranslator> CreateDefaultTranslators()
		{
			var defaultTranslators = new List<ITranslator>();
			TranslatorRegistrationList translatorRegistrations = _coreConfiguration.Css.Translators;

			foreach (TranslatorRegistration translatorRegistration in translatorRegistrations)
			{
				if (translatorRegistration.Enabled)
				{
					string defaultTranslatorFullTypeName = translatorRegistration.Type;

					var defaultTranslator = Utils.CreateInstanceByFullTypeName<ITranslator>(
						defaultTranslatorFullTypeName);

					defaultTranslators.Add(defaultTranslator);
				}
			}

			return defaultTranslators;
		}
		
		/// <summary>
		/// Transforms CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <param name="bundle">Object Bundle</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="httpContext">Object HttpContext</param>
		protected override void Transform(IList<IAsset> assets, Bundle bundle, 
			BundleResponse bundleResponse, HttpContextBase httpContext)
		{
			ValidateAssetTypes(assets);
			assets = RemoveDuplicateAssets(assets);
			assets = RemoveUnnecessaryAssets(assets);
			if (bundle.EnableFileExtensionReplacements)
			{
				assets = ReplaceFileExtensions(assets);
			}
			assets = Translate(assets);
			if (!_isDebugMode)
			{
				assets = Minify(assets);
			}
			assets = ResolveRelativePaths(assets);
			Combine(assets, bundleResponse, _coreConfiguration.EnableTracing);

			bundleResponse.ContentType = @"text/css";
		}

		/// <summary>
		/// Validates whether the specified assets are CSS-asset
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		protected override void ValidateAssetTypes(IList<IAsset> assets)
		{
			var cssAssetTypesValidator = new CssAssetTypesValidator();
			cssAssetTypesValidator.Validate(assets);
		}

		/// <summary>
		/// Removes duplicate CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of unique CSS-assets</returns>
		protected override IList<IAsset> RemoveDuplicateAssets(IList<IAsset> assets)
		{
			var cssDuplicateFilter = new CssDuplicateAssetsFilter();
			IList<IAsset> processedAssets = cssDuplicateFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Removes unnecessary CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of necessary CSS-assets</returns>
		protected override IList<IAsset> RemoveUnnecessaryAssets(IList<IAsset> assets)
		{
			var cssUnnecessaryAssetsFilter = new CssUnnecessaryAssetsFilter(_ignorePatterns);
			IList<IAsset> processedAssets = cssUnnecessaryAssetsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Replaces file extensions of CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of CSS-assets with a modified extension</returns>
		protected override IList<IAsset> ReplaceFileExtensions(IList<IAsset> assets)
		{
			var cssFileExtensionsFilter = new CssFileExtensionsFilter
			{
			    IsDebugMode = _isDebugMode
			};

			IList<IAsset> processedAssets = cssFileExtensionsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Resolves relative paths in CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of CSS-assets with a fixed relative paths</returns>
		private IList<IAsset> ResolveRelativePaths(IList<IAsset> assets)
		{
			var cssRelativePathProcessor = new CssRelativePathFilter();
			IList<IAsset> processedAssets = cssRelativePathProcessor.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Combines code of CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="enableTracing">Enables tracing</param>
		protected override void Combine(IList<IAsset> assets, BundleResponse bundleResponse,
			bool enableTracing)
		{
			var assetFiles = new List<FileInfo>();
			var content = new StringBuilder();

			foreach (var asset in assets)
			{
				if (enableTracing)
				{
					content.AppendFormatLine("/*#region URL: {0} */", asset.Url);
				}
				content.AppendLine(asset.Content);
				if (enableTracing)
				{
					content.AppendLine("/*#endregion*/");
				}
				content.AppendLine();

				assetFiles.Add(new FileInfo(asset.Path));
			}

			bundleResponse.Content = content.ToString();
			bundleResponse.Files = assetFiles;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public override void Dispose()
		{
			Dispose(true /* disposing */);
			GC.SuppressFinalize(this);
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		/// <param name="disposing">Flag, allowing destruction of 
		/// managed objects contained in fields of class</param>
		private void Dispose(bool disposing)
		{
			if (!_disposed)
			{
				_disposed = true;

				if (_translators != null)
				{
					_translators.Clear();
					_translators = null;
				}

				_minifier = null;
			}
		}
	}
}
