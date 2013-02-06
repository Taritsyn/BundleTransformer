namespace BundleTransformer.Less.Translators
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Text.RegularExpressions;
	using System.Web;

	using dotless.Core;
	using dotless.Core.configuration;
	using LessLogLevel = dotless.Core.Loggers.LogLevel;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Translators;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using BtLessLogger = Loggers.LessLogger;

	/// <summary>
	/// Translator that responsible for translation of LESS-code to CSS-code
	/// </summary>
	public sealed class LessTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// Name of input code type
		/// </summary>
		const string INPUT_CODE_TYPE = "LESS";

		/// <summary>
		/// Name of output code type
		/// </summary>
		const string OUTPUT_CODE_TYPE = "CSS";

		/// <summary>
		/// Regular expression for working with paths of imported LESS-files
		/// </summary>
		private static readonly Regex _importLessFilesRuleRegex =
			new Regex(@"(?<importDirective>@import(?:-once)?)\s(((?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>))" +
				@"|(url\(((?<quote>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote>)" +
				@"|(?<url>[\w\-+.:,;/?&=%~#$@\[\]{}]+))\)))",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Object HttpContext
		/// </summary>
		private readonly HttpContextBase _httpContext;

		/// <summary>
		/// CSS relative path resolver
		/// </summary>
		private readonly ICssRelativePathResolver _cssRelativePathResolver;

		/// <summary>
		/// Gets or sets a severity level of errors
		///		0 - only syntax error messages;
		///		1 - only syntax error messages and warnings.
		/// </summary>
		public int Severity { get; set; }


		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		public LessTranslator()
			: this(new HttpContextWrapper(HttpContext.Current),
				BundleTransformerContext.Current.GetCssRelativePathResolver(),
				BundleTransformerContext.Current.GetLessConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		/// <param name="httpContext">Object HttpContext</param>
		/// <param name="cssRelativePathResolver">CSS relative path resolver</param>
		/// <param name="lessConfig">Configuration settings of LESS-translator</param>
		public LessTranslator(HttpContextBase httpContext, ICssRelativePathResolver cssRelativePathResolver,
			LessSettings lessConfig)
		{
			_httpContext = httpContext;
			_cssRelativePathResolver = cssRelativePathResolver;

			UseNativeMinification = lessConfig.UseNativeMinification;
			Severity = lessConfig.Severity;
		}


		/// <summary>
		/// Creates instance of LESS-engine
		/// </summary>
		/// <param name="enableNativeMinification">Enables native minification</param>
		/// <param name="severity">Severity level</param>
		/// <returns>LESS-engine</returns>
		private ILessEngine CreateLessEngine(bool enableNativeMinification, int severity)
		{
			DotlessConfiguration lessEngineConfig = DotlessConfiguration.GetDefault();
			lessEngineConfig.MapPathsToWeb = false;
			lessEngineConfig.CacheEnabled = false;
			lessEngineConfig.DisableUrlRewriting = false;
			lessEngineConfig.Web = false;
			lessEngineConfig.MinifyOutput = enableNativeMinification;
			lessEngineConfig.LessSource = typeof(VirtualFileReader);
			lessEngineConfig.LogLevel = ConvertSeverityLevelToLessLogLevelEnumValue(severity);
			lessEngineConfig.Logger = typeof(BtLessLogger);

			var lessEngineFactory = new EngineFactory(lessEngineConfig);
			ILessEngine lessEngine = lessEngineFactory.GetEngine();

			return lessEngine;
		}

		/// <summary>
		/// Translates code of asset written on LESS to CSS-code
		/// </summary>
		/// <param name="asset">Asset with code written on LESS</param>
		/// <returns>Asset with translated code</returns>
		public override IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			ILessEngine lessEngine = CreateLessEngine(enableNativeMinification, Severity);

			InnerTranslate(asset, lessEngine, enableNativeMinification);

			return asset;
		}

		/// <summary>
		/// Translates code of assets written on LESS to CSS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on LESS</param>
		/// <returns>Set of assets with translated code</returns>
		public override IList<IAsset> Translate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.AssetType == AssetType.Less).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			bool enableNativeMinification = NativeMinificationEnabled;

			ILessEngine lessEngine = CreateLessEngine(enableNativeMinification, Severity);

			foreach (var asset in assetsToProcessing)
			{
				InnerTranslate(asset, lessEngine, enableNativeMinification);
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, ILessEngine lessEngine, bool enableNativeMinification)
		{
			string newContent;
			string assetPath = asset.Path;
			string assetUrl = asset.Url;
			IList<string> importedFilePaths;

			try
			{
				newContent = ResolveImportsRelativePaths(asset.Content, assetUrl);
				newContent = lessEngine.TransformToCss(newContent, null);
				IEnumerable<string> importedFileUrls = lessEngine.GetImports();

				importedFilePaths = importedFileUrls
					.Select(u => _httpContext.Server.MapPath(u))
					.ToList()
					;
			}
			catch (FileNotFoundException)
			{
				throw;
			}
			catch (LessCompilingException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetPath, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetPath, e.Message), e);
			}

			asset.Content = newContent;
			asset.Minified = enableNativeMinification;
			asset.RequiredFilePaths = importedFilePaths;
		}

		/// <summary>
		/// Transforms relative paths of imported stylesheets to absolute in LESS-code
		/// </summary>
		/// <param name="content">Text content of LESS-asset</param>
		/// <param name="path">LESS-file path</param>
		/// <returns>Processed text content of LESS-asset</returns>
		private string ResolveImportsRelativePaths(string content, string path)
		{
			return _importLessFilesRuleRegex.Replace(content, m =>
			{
				string result = m.Groups[0].Value;
				GroupCollection groups = m.Groups;

				if (groups["url"].Success)
				{
					string importDirectiveValue = groups["importDirective"].Value;
					string urlValue = groups["url"].Value;
					string quoteValue = groups["quote"].Success ? groups["quote"].Value : @"""";

					result = string.Format("{0} {1}{2}{1}",
						importDirectiveValue,
						quoteValue,
						_cssRelativePathResolver.ResolveRelativePath(path, urlValue));
				}

				return result;
			});
		}

		/// <summary>
		/// Convert severity level to LESS log level enum value
		/// </summary>
		/// <param name="severity">Severity level</param>
		/// <returns>LESS log level</returns>
		private static LessLogLevel ConvertSeverityLevelToLessLogLevelEnumValue(int severity)
		{
			LessLogLevel logLevel;

			switch (severity)
			{
				case 0:
					logLevel = LessLogLevel.Error;
					break;
				case 1:
					logLevel = LessLogLevel.Warn;
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_SeverityLevelToEnumValueConversionFailed,
						typeof(LessLogLevel), severity.ToString()));
			}

			return logLevel;
		}
	}
}