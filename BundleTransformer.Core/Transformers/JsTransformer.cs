namespace BundleTransformer.Core.Transformers
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.Text;
	using System.Web;
	using System.Web.Optimization;

	using Assets;
	using Configuration;
	using Filters;
	using Minifiers;
	using Resources;
	using Validators;
	using Translators;

	/// <summary>
	/// Transformer that responsible for processing JS-assets
	/// </summary>
	public sealed class JsTransformer : TransformerBase
	{
		/// <summary>
		/// Pool of minifiers
		/// </summary>
		private static readonly Dictionary<string, IMinifier> _minifiersPool = new Dictionary<string, IMinifier>();

		/// <summary>
		/// Synchronizer of minifiers pool
		/// </summary>
		private static readonly object _minifiersPoolSynchronizer = new object();

		/// <summary>
		/// Pool of translators
		/// </summary>
		private static Dictionary<string, ITranslator> _translatorsPool = new Dictionary<string, ITranslator>();

		/// <summary>
		/// Synchronizer of translators pool
		/// </summary>
		private static readonly object _translatorsPoolSynchronizer = new object();

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;

		/// <summary>
		/// JavaScript content type
		/// </summary>
		internal static string JsContentType = "application/x-javascript";


		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		public JsTransformer()
			: this(null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		public JsTransformer(IMinifier minifier)
			: this(minifier, null, new string[0])
		{ }

		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		public JsTransformer(IList<ITranslator> translators)
			: this(null, translators, new string[0])
		{ }

		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators)
			: this(minifier, translators, new string[0])
		{ }

		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public JsTransformer(string[] ignorePatterns)
			: this(null, null, ignorePatterns)
		{ }

		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, string[] ignorePatterns)
			: this(minifier, translators, ignorePatterns, HttpContext.Current.IsDebuggingEnabled)
		{ }

		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, string[] ignorePatterns, bool isDebugMode)
			: this(minifier, translators, ignorePatterns, isDebugMode, 
				BundleTransformerContext.Current.GetCoreConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <param name="coreConfiguration">Configuration settings of core</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, 
			string[] ignorePatterns, bool isDebugMode, CoreSettings coreConfiguration)
				: base(ignorePatterns, isDebugMode, coreConfiguration)
		{
			_minifier = minifier ?? CreateDefaultMinifier();
			_translators = translators ?? CreateDefaultTranslators();
		}

		/// <summary>
		/// Destructs instance of JS-transformer
		/// </summary>
		~JsTransformer()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Creates instance of default JS-minifier
		/// </summary>
		/// <returns>Default JS-minifier</returns>
		private IMinifier CreateDefaultMinifier()
		{
			string defaultMinifierName = _coreConfiguration.Js.DefaultMinifier;
			if (String.IsNullOrWhiteSpace(defaultMinifierName))
			{
				throw new ConfigurationErrorsException(
					String.Format(Strings.Configuration_DefaultMinifierNotSpecified, "JS"));
			}

			IMinifier defaultMinifier;

			lock (_minifiersPoolSynchronizer)
			{
				if (_minifiersPool.ContainsKey(defaultMinifierName))
				{
					defaultMinifier = _minifiersPool[defaultMinifierName];
				}
				else
				{
					if (defaultMinifierName == Constants.NullMinifierName)
					{
						defaultMinifier = new NullMinifier();
					}
					else
					{
						MinifierRegistration minifierRegistration = _coreConfiguration.Js.Minifiers[defaultMinifierName];
						if (minifierRegistration == null)
						{
							throw new ConfigurationErrorsException(
								String.Format(Strings.Configuration_MinifierNotRegistered, "JS", defaultMinifierName));
						}

						string defaultMinifierFullTypeName = minifierRegistration.Type;
						defaultMinifier = Utils.CreateInstanceByFullTypeName<IMinifier>(defaultMinifierFullTypeName);
					}

					_minifiersPool.Add(defaultMinifierName, defaultMinifier);
				}
			}

			return defaultMinifier;
		}

		/// <summary>
		/// Creates list of default JS-translators
		/// </summary>
		/// <returns>List of default JS-translators</returns>
		private IList<ITranslator> CreateDefaultTranslators()
		{
			var defaultTranslators = new List<ITranslator>();
			TranslatorRegistrationList translatorRegistrations = _coreConfiguration.Js.Translators;

			foreach (TranslatorRegistration translatorRegistration in translatorRegistrations)
			{
				if (translatorRegistration.Enabled)
				{
					string defaultTranslatorName = translatorRegistration.Name;
					string defaultTranslatorFullTypeName = translatorRegistration.Type;

					ITranslator defaultTranslator;

					lock (_translatorsPoolSynchronizer)
					{
						if (_translatorsPool.ContainsKey(defaultTranslatorName))
						{
							defaultTranslator = _translatorsPool[defaultTranslatorName];
						}
						else
						{
							defaultTranslator = Utils.CreateInstanceByFullTypeName<ITranslator>(
								defaultTranslatorFullTypeName);
							_translatorsPool.Add(defaultTranslatorName, defaultTranslator);
						}
					}

					defaultTranslators.Add(defaultTranslator);
				}
			}

			return defaultTranslators;
		}

		/// <summary>
		/// Transforms JS-assets
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <param name="bundleResponse">Object BundleResponse</param>
		/// <param name="httpContext">Object HttpContext</param>
		protected override void Transform(IList<IAsset> assets, BundleResponse bundleResponse, HttpContextBase httpContext)
		{
			ValidateAssetTypes(assets);
			assets = RemoveDuplicateAssets(assets);
			assets = RemoveUnnecessaryAssets(assets);
			assets = ReplaceFileExtensions(assets);
			assets = Translate(assets);
			if (!_isDebugMode)
			{
				assets = Minify(assets);
			}

			bundleResponse.Content = Combine(assets, _coreConfiguration.EnableTracing);
			ConfigureBundleResponse(assets, bundleResponse, httpContext);
			bundleResponse.ContentType = JsContentType;
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
		/// Removes duplicate JS-assets
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
		/// Removes unnecessary JS-assets
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
		/// Replaces file extensions of JS-assets
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of JS-assets with a modified extension</returns>
		protected override IList<IAsset> ReplaceFileExtensions(IList<IAsset> assets)
		{
			var jsFileExtensionsFilter = new JsFileExtensionsFilter(
				Utils.ConvertToStringCollection(_coreConfiguration.JsFilesWithMicrosoftStyleExtensions, ';', true))
			{
			    IsDebugMode = _isDebugMode
			};

			IList<IAsset> processedAssets = jsFileExtensionsFilter.Transform(assets);

			return processedAssets;
		}

		/// <summary>
		/// Combines code of JS-assets
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <param name="enableTracing">Enables tracing</param>
		protected override string Combine(IList<IAsset> assets, bool enableTracing)
		{
			var content = new StringBuilder();

			foreach (var asset in assets)
			{
				if (enableTracing)
				{
					content.AppendFormatLine("//#region URL: {0}", asset.Url);
				}
				content.AppendLine(asset.Content);
				if (enableTracing)
				{
					content.AppendLine("//#endregion");
				}
				content.AppendLine();
			}

			return content.ToString();
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
