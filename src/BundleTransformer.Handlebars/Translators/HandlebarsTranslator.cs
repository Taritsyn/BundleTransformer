﻿using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;

using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Translators;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.Handlebars.Configuration;
using BundleTransformer.Handlebars.Internal;
using BundleTransformer.Handlebars.Resources;

namespace BundleTransformer.Handlebars.Translators
{
	/// <summary>
	/// Translator that responsible for translation of Handlebars templates to JS code
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
		/// Delegate that creates an instance of JS engine
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
		/// Constructs a instance of Handlebars translator
		/// </summary>
		public HandlebarsTranslator()
			: this(null, BundleTransformerContext.Current.Configuration.GetHandlebarsSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Handlebars translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="handlebarsConfig">Configuration settings of Handlebars translator</param>
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
  * JavaScriptEngineSwitcher.ChakraCore
  * JavaScriptEngineSwitcher.Jint
  * JavaScriptEngineSwitcher.Msie (only in the Chakra JsRT modes)
  * JavaScriptEngineSwitcher.V8",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () => JsEngineSwitcher.Current.CreateEngine(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}

		/// <summary>
		/// Translates a code of asset written on Handlebars to JS code
		/// </summary>
		/// <param name="asset">Asset with code written on Handlebars</param>
		/// <returns>Asset with translated code</returns>
		public IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentNullException(
					nameof(asset),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(asset))
				);
			}

			CompilationOptions options = CreateCompilationOptions();

			using (var handlebarsCompiler = new HandlebarsCompiler(_createJsEngineInstance, options))
			{
				InnerTranslate(asset, handlebarsCompiler);
			}

			return asset;
		}

		/// <summary>
		/// Translates a code of assets written on Handlebars to JS code
		/// </summary>
		/// <param name="assets">Set of assets with code written on Handlebars</param>
		/// <returns>Set of assets with translated code</returns>
		public IList<IAsset> Translate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentNullException(
					nameof(assets),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(assets))
				);
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
			string assetUrl = asset.Url;

			try
			{
				newContent = handlebarsCompiler.Compile(asset.Content, assetUrl);
			}
			catch (HandlebarsCompilationException e)
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