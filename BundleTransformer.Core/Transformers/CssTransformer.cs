namespace BundleTransformer.Core.Transformers
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.Text;
	using System.Text.RegularExpressions;
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
	/// Transformer that responsible for processing CSS-assets
	/// </summary>
	public sealed class CssTransformer : TransformerBase
	{
		/// <summary>
		/// Regular expression for working with <code>@import</code> directives
		/// </summary>
		private static readonly Regex _cssImportRegex =
			new Regex(@"@import\s+" +
				@"(?:(?:(?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>))" +
				@"|(?:url\(((?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
				@"|(?<url>[\w\-+.:,;/?&=%~#$@\[\]{}]+))\)))" +
				@"(?:\s+(?<media>[^;]+))?" +
				@"\s*;",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

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
				BundleTransformerContext.Current.GetApplicationInfo())
		{ }

		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="applicationInfo">Information about web application</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators, string[] ignorePatterns, 
			IHttpApplicationInfo applicationInfo)
			: this(minifier, translators, ignorePatterns, applicationInfo, 
				BundleTransformerContext.Current.GetCoreConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of CSS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="applicationInfo">Information about web application</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		public CssTransformer(IMinifier minifier, IList<ITranslator> translators,
			string[] ignorePatterns, IHttpApplicationInfo applicationInfo, CoreSettings coreConfig)
			: base(ignorePatterns, applicationInfo, coreConfig)
		{
			_minifier = minifier ?? CreateDefaultMinifier();
			_translators = translators ?? CreateDefaultTranslators();
		}


		/// <summary>
		/// Creates instance of default CSS-minifier
		/// </summary>
		/// <returns>Default CSS-minifier</returns>
		private IMinifier CreateDefaultMinifier()
		{
			string defaultMinifierName = _coreConfig.Css.DefaultMinifier;
			if (string.IsNullOrWhiteSpace(defaultMinifierName))
			{
				throw new ConfigurationErrorsException(
					string.Format(Strings.Configuration_DefaultMinifierNotSpecified, "CSS"));
			}

			IMinifier defaultMinifier = 
				BundleTransformerContext.Current.GetCssMinifierInstance(defaultMinifierName);

			return defaultMinifier;
		}

		/// <summary>
		/// Creates list of default CSS-translators
		/// </summary>
		/// <returns>List of default CSS-translators</returns>
		private IList<ITranslator> CreateDefaultTranslators()
		{
			var defaultTranslators = new List<ITranslator>();
			TranslatorRegistrationList translatorRegistrations = _coreConfig.Css.Translators;

			foreach (TranslatorRegistration translatorRegistration in translatorRegistrations)
			{
				if (translatorRegistration.Enabled)
				{
					string defaultTranslatorName = translatorRegistration.Name;
					ITranslator defaultTranslator = 
						BundleTransformerContext.Current.GetCssTranslatorInstance(defaultTranslatorName);

					defaultTranslators.Add(defaultTranslator);
				}
			}

			return defaultTranslators;
		}
		
		/// <summary>
		/// Transforms CSS-assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
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
			if (!_coreConfig.Css.DisableNativeCssRelativePathTransformation)
			{
				assets = ResolveRelativePaths(assets);
			}

			bundleResponse.Content = Combine(assets, _coreConfig.EnableTracing);
			ConfigureBundleResponse(assets, bundleResponse, virtualPathProvider);
			bundleResponse.ContentType = Constants.ContentType.Css;
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
			    IsDebugMode = _applicationInfo.IsDebugMode,
				UsePreMinifiedFiles = _coreConfig.Css.UsePreMinifiedFiles
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
		/// <param name="enableTracing">Enables tracing</param>
		protected override string Combine(IList<IAsset> assets, bool enableTracing)
		{
			var content = new StringBuilder();
			var imports = new List<string>();

			foreach (var asset in assets)
			{
				if (enableTracing)
				{
					content.AppendFormatLine("/*#region URL: {0} */", asset.Url);
				}
				content.AppendLine(EjectCssImports(asset.Content, imports));
				if (enableTracing)
				{
					content.AppendLine("/*#endregion*/");
				}
				content.AppendLine();
			}

			if (imports.Count > 0)
			{
				string pattern = enableTracing ? "/*#region CSS Imports */{0}{1}{0}/*#endregion*/{0}{0}" : "{1}{0}";

				content.Insert(0, 
					string.Format(pattern, Environment.NewLine, string.Join(Environment.NewLine, imports))
				);
			}

			return content.ToString();
		}

		/// <summary>
		/// Eject a CSS imports
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="imports">List of CSS imports</param>
		/// <returns>Text content of CSS-asset without <code>@import</code> directives</returns>
		private static string EjectCssImports(string content, IList<string> imports)
		{
			return _cssImportRegex.Replace(content, m =>
			{
				GroupCollection groups = m.Groups;

				string urlValue = groups["url"].Value;
				string quoteValue = groups["quote"].Success ? groups["quote"].Value : @"""";
				string media = groups["media"].Success ? (" " + groups["media"].Value) : string.Empty;
				
				string import = string.Format("@import {0}{1}{0}{2};",
					quoteValue,
					urlValue,
					media
				);
				imports.Add(import);

				return string.Empty;
			});	
		}
	}
}
