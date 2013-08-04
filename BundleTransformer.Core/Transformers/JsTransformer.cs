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
	using Resources;
	using Translators;
	using Validators;
	using Web;

	/// <summary>
	/// Transformer that responsible for processing JS-assets
	/// </summary>
	public sealed class JsTransformer : TransformerBase
	{
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
			: this(minifier, translators, ignorePatterns, BundleTransformerContext.Current.GetApplicationInfo())
		{ }

		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="applicationInfo">Information about web application</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, string[] ignorePatterns,
			IHttpApplicationInfo applicationInfo)
			: this(minifier, translators, ignorePatterns, applicationInfo, 
				BundleTransformerContext.Current.GetCoreConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="applicationInfo">Information about web application</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators,
			string[] ignorePatterns, IHttpApplicationInfo applicationInfo, CoreSettings coreConfig)
			: base(ignorePatterns, applicationInfo, coreConfig)
		{
			_minifier = minifier ?? CreateDefaultMinifier();
			_translators = translators ?? CreateDefaultTranslators();
		}


		/// <summary>
		/// Creates instance of default JS-minifier
		/// </summary>
		/// <returns>Default JS-minifier</returns>
		private IMinifier CreateDefaultMinifier()
		{
			string defaultMinifierName = _coreConfig.Js.DefaultMinifier;
			if (string.IsNullOrWhiteSpace(defaultMinifierName))
			{
				throw new ConfigurationErrorsException(
					string.Format(Strings.Configuration_DefaultMinifierNotSpecified, "JS"));
			}

			IMinifier defaultMinifier = 
				BundleTransformerContext.Current.GetJsMinifierInstance(defaultMinifierName);

			return defaultMinifier;
		}

		/// <summary>
		/// Creates list of default JS-translators
		/// </summary>
		/// <returns>List of default JS-translators</returns>
		private IList<ITranslator> CreateDefaultTranslators()
		{
			var defaultTranslators = new List<ITranslator>();
			TranslatorRegistrationList translatorRegistrations = _coreConfig.Js.Translators;

			foreach (TranslatorRegistration translatorRegistration in translatorRegistrations)
			{
				if (translatorRegistration.Enabled)
				{
					string defaultTranslatorName = translatorRegistration.Name;
					ITranslator defaultTranslator = 
						BundleTransformerContext.Current.GetJsTranslatorInstance(defaultTranslatorName);

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
		/// <param name="virtualPathProvider">Virtual path provider</param>
		/// <param name="httpContext">Object HttpContext</param>
		protected override void Transform(IList<IAsset> assets, BundleResponse bundleResponse,
			VirtualPathProvider virtualPathProvider, HttpContextBase httpContext)
		{
			ValidateAssetTypes(assets);
			assets = RemoveDuplicateAssets(assets);
			assets = RemoveUnnecessaryAssets(assets);
			assets = ReplaceFileExtensions(assets);
			assets = Translate(assets);
			if (!_applicationInfo.IsDebugMode)
			{
				assets = Minify(assets);
			}

			bundleResponse.Content = Combine(assets, _coreConfig.EnableTracing);
			ConfigureBundleResponse(assets, bundleResponse, virtualPathProvider);
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
				Utils.ConvertToStringCollection(
					_coreConfig.JsFilesWithMicrosoftStyleExtensions.Replace(';', ','), 
					',', true))
			{
			    IsDebugMode = _applicationInfo.IsDebugMode,
				UsePreMinifiedFiles = _coreConfig.Js.UsePreMinifiedFiles
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
				string assetContent = asset.Content.Trim();

				if (enableTracing)
				{
					content.AppendFormatLine("//#region URL: {0}", asset.Url);
				}
				content.Append(assetContent);
				if (assetContent.EndsWith(";"))
				{
					content.AppendLine();
				}
				else
				{
					content.AppendLine(";");
				}
				if (enableTracing)
				{
					content.AppendLine("//#endregion");
				}
				content.AppendLine();
			}

			return content.ToString();
		}
	}
}