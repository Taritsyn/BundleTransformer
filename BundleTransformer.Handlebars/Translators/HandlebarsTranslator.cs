namespace BundleTransformer.Handlebars.Translators
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.Linq;

	using JavaScriptEngineSwitcher.Core;

	using Core;
	using Core.Assets;
	using Core.Translators;
	using CoreStrings = Core.Resources.Strings;

	using Compilers;
	using Configuration;
	using Resources;

	/// <summary>
	/// Translator that responsible for translation of Handlebars-templates to JS-code
	/// </summary>
	public sealed class HandlebarsTranslator : ITranslator
	{
		/// <summary>
		/// Name of input code type
		/// </summary>
		const string INPUT_CODE_TYPE = "Handlebars";

		/// <summary>
		/// Name of output code type
		/// </summary>
		const string OUTPUT_CODE_TYPE = "JS";

		/// <summary>
		/// Delegate that creates an instance of JavaScript engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a template namespace
		/// </summary>
		public string Namespace
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a template root.
		/// Base value that will be stripped from template names.
		/// </summary>
		public string RootPath
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a comma-separated list of known helpers
		/// </summary>
		public string KnownHelpers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to use only known helpers
		/// </summary>
		public bool KnownHelpersOnly
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to include data when compiling
		/// (<code>@data</code> variables)
		/// </summary>
		public bool Data
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of Handlebars-translator
		/// </summary>
		public HandlebarsTranslator()
			: this(null, BundleTransformerContext.Current.Configuration.GetHandlebarsSettings())
		{ }

		/// <summary>
		/// Constructs instance of Handlebars-translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="handlebarsConfig">Configuration settings of Handlebars-translator</param>
		public HandlebarsTranslator(Func<IJsEngine> createJsEngineInstance,
			HandlebarsSettings handlebarsConfig)
		{
			Namespace = handlebarsConfig.Namespace;
			RootPath = handlebarsConfig.RootPath;
			KnownHelpers = handlebarsConfig.KnownHelpers;
			KnownHelpersOnly = handlebarsConfig.KnownHelpersOnly;
			Data = handlebarsConfig.Data;

			if (string.IsNullOrWhiteSpace(Namespace))
			{
				throw new Core.EmptyValueException(Strings.Translators_TemplateNamespaceNotSpecified);
			}

			if (createJsEngineInstance == null)
			{
				string jsEngineName = handlebarsConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"handlebars",
							@"
  * JavaScriptEngineSwitcher.Msie
  * JavaScriptEngineSwitcher.V8",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = (() =>
					JsEngineSwitcher.Current.CreateJsEngineInstance(jsEngineName));
			}
			_createJsEngineInstance = createJsEngineInstance;
		}

		/// <summary>
		/// Translates code of asset written on Handlebars to JS-code
		/// </summary>
		/// <param name="asset">Asset with code written on Handlebars</param>
		/// <returns>Asset with translated code</returns>
		public IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			CompilationOptions options = CreateCompilationOptions();

			using (var handlebarsCompiler = new HandlebarsCompiler(_createJsEngineInstance, options))
			{
				InnerTranslate(asset, handlebarsCompiler);
			}

			return asset;
		}

		/// <summary>
		/// Translates code of assets written on Handlebars to JS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on Handlebars</param>
		/// <returns>Set of assets with translated code</returns>
		public IList<IAsset> Translate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.AssetTypeCode == Constants.AssetTypeCode.Handlebars).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			CompilationOptions options = CreateCompilationOptions();

			using (var handlebarsCompiler = new HandlebarsCompiler(_createJsEngineInstance, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerTranslate(asset, handlebarsCompiler);
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, HandlebarsCompiler handlebarsCompiler)
		{
			string newContent;
			string assetVirtualPath = asset.VirtualPath;
			
			try
			{
				newContent = handlebarsCompiler.Compile(asset.Content, assetVirtualPath);
			}
			catch (HandlebarsCompilingException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetVirtualPath, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetVirtualPath, e.Message));
			}

			asset.Content = newContent;
		}

		/// <summary>
		/// Creates a compilation options
		/// </summary>
		/// <returns>Compilation options</returns>
		private CompilationOptions CreateCompilationOptions()
		{
			var options = new CompilationOptions
			{
				Namespace = Namespace,
				RootPath = RootPath,
				KnownHelpers = KnownHelpers,
				KnownHelpersOnly = KnownHelpersOnly,
				Data = Data
			};

			return options;
		}
	}
}