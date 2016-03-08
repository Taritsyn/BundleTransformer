namespace BundleTransformer.CoffeeScript.Translators
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

	using Configuration;
	using Internal;

	/// <summary>
	/// Translator that responsible for translation of CoffeeScript-code to JS-code
	/// </summary>
	public sealed class CoffeeScriptTranslator : ITranslator
	{
		/// <summary>
		/// Name of input code type
		/// </summary>
		const string INPUT_CODE_TYPE = "CoffeeScript";

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
		/// Gets or sets a flag for whether to allow compilation to JavaScript
		/// without the top-level function safety wrapper
		/// </summary>
		public bool Bare
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of CoffeeScript-translator
		/// </summary>
		public CoffeeScriptTranslator()
			: this(null, BundleTransformerContext.Current.Configuration.GetCoffeeScriptSettings())
		{ }

		/// <summary>
		/// Constructs a instance of CoffeeScript-translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="coffeeConfig">Configuration settings of CoffeeScript-translator</param>
		public CoffeeScriptTranslator(Func<IJsEngine> createJsEngineInstance,
			CoffeeScriptSettings coffeeConfig)
		{
			Bare = coffeeConfig.Bare;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = coffeeConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"coffeeScript",
							@"
  * JavaScriptEngineSwitcher.Msie
  * JavaScriptEngineSwitcher.V8
  * JavaScriptEngineSwitcher.ChakraCore",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () => JsEngineSwitcher.Current.CreateJsEngineInstance(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Translates a code of asset written on CoffeeScript to JS-code
		/// </summary>
		/// <param name="asset">Asset with code written on CoffeeScript</param>
		/// <returns>Asset with translated code</returns>
		public IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			CompilationOptions options = CreateCompilationOptions();

			using (var coffeeScriptCompiler = new CoffeeScriptCompiler(_createJsEngineInstance, options))
			{
				InnerTranslate(asset, coffeeScriptCompiler);
			}

			return asset;
		}

		/// <summary>
		/// Translates a code of assets written on CoffeeScript to JS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on CoffeeScript</param>
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

			var assetsToProcessing = assets.Where(a => a.AssetTypeCode == Constants.AssetTypeCode.CoffeeScript
				|| a.AssetTypeCode == Constants.AssetTypeCode.LiterateCoffeeScript).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			CompilationOptions options = CreateCompilationOptions();

			using (var coffeeScriptCompiler = new CoffeeScriptCompiler(_createJsEngineInstance, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerTranslate(asset, coffeeScriptCompiler);
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, CoffeeScriptCompiler coffeeScriptCompiler)
		{
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = coffeeScriptCompiler.Compile(asset.Content, assetUrl);
			}
			catch (CoffeeScriptCompilationException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetUrl, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetUrl, e.Message));
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
				Bare = Bare
			};

			return options;
		}
	}
}