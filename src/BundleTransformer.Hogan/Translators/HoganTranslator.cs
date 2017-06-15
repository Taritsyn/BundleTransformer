using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;

using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Translators;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.Hogan.Configuration;
using BundleTransformer.Hogan.Internal;
using BundleTransformer.Hogan.Resources;

namespace BundleTransformer.Hogan.Translators
{
	/// <summary>
	/// Translator that responsible for translation of Mustache templates to JS code
	/// </summary>
	public sealed class HoganTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// Name of input code type
		/// </summary>
		const string INPUT_CODE_TYPE = "Mustache";

		/// <summary>
		/// Name of output code type
		/// </summary>
		const string OUTPUT_CODE_TYPE = "JS";

		/// <summary>
		/// Delegate that creates an instance of JS engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Gets or sets a variable name for wrapper
		/// </summary>
		public string Variable
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a prefix to template names
		/// </summary>
		public string Namespace
		{
			get;
			set;
		}

		/// <summary>
		/// List of custom section tags
		/// </summary>
		public IList<SectionTag> SectionTags
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a string that overrides the default delimiters
		/// (for example, <code>&lt;% %&gt;</code>)
		/// </summary>
		public string Delimiters
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of Hogan translator
		/// </summary>
		public HoganTranslator()
			: this(null, BundleTransformerContext.Current.Configuration.GetHoganSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Hogan translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="hoganConfig">Configuration settings of Hogan translator</param>
		public HoganTranslator(Func<IJsEngine> createJsEngineInstance, HoganSettings hoganConfig)
		{
			UseNativeMinification = hoganConfig.UseNativeMinification;
			Variable = hoganConfig.Variable;
			Namespace = hoganConfig.Namespace;
			SectionTags = hoganConfig.SectionTags
				.Cast<SectionTagRegistration>()
				.Select(s => new SectionTag(s.OpeningTagName, s.ClosingTagName))
				.ToList()
				;
			Delimiters = hoganConfig.Delimiters;

			if (string.IsNullOrWhiteSpace(Variable))
			{
				throw new Core.EmptyValueException(Strings.Translators_TemplateVariableNotSpecified);
			}

			if (createJsEngineInstance == null)
			{
				string jsEngineName = hoganConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"hogan",
							@"
  * JavaScriptEngineSwitcher.Msie
  * JavaScriptEngineSwitcher.V8
  * JavaScriptEngineSwitcher.ChakraCore",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () => JsEngineSwitcher.Instance.CreateEngine(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Translates a code of asset written on Mustache to JS code
		/// </summary>
		/// <param name="asset">Asset with code written on Mustache</param>
		/// <returns>Asset with translated code</returns>
		public override IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			CompilationOptions options = CreateCompilationOptions(enableNativeMinification);

			using (var hoganCompiler = new HoganCompiler(_createJsEngineInstance, options))
			{
				InnerTranslate(asset, hoganCompiler, enableNativeMinification);
			}

			return asset;
		}

		/// <summary>
		/// Translates a code of assets written on Mustache to JS code
		/// </summary>
		/// <param name="assets">Set of assets with code written on Mustache</param>
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

			var assetsToProcessing = assets.Where(a => a.AssetTypeCode == Constants.AssetTypeCode.Mustache
				|| a.AssetTypeCode == Constants.AssetTypeCode.Hogan).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			CompilationOptions options = CreateCompilationOptions(enableNativeMinification);

			using (var hoganCompiler = new HoganCompiler(_createJsEngineInstance, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerTranslate(asset, hoganCompiler, enableNativeMinification);
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, HoganCompiler hoganCompiler, bool enableNativeMinification)
		{
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = hoganCompiler.Compile(asset.Content, assetUrl);
			}
			catch (HoganCompilationException e)
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
			asset.Minified = enableNativeMinification;
		}

		/// <summary>
		/// Creates a compilation options
		/// </summary>
		/// <param name="enableNativeMinification">Flag that indicating to use of native minification</param>
		/// <returns>Compilation options</returns>
		private CompilationOptions CreateCompilationOptions(bool enableNativeMinification)
		{
			var options = new CompilationOptions
			{
				EnableNativeMinification = enableNativeMinification,
				Variable = Variable,
				Namespace = Namespace,
				SectionTags = SectionTags,
				Delimiters = Delimiters
			};

			return options;
		}
	}
}