namespace BundleTransformer.CoffeeScript.Translators
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Core.Assets;
	using Core.Translators;
	using CoreStrings = Core.Resources.Strings;

	using Compilers;

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
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get;
			set;
		}


		/// <summary>
		/// Translates code of asset written on CoffeeScript to JS-code
		/// </summary>
		/// <param name="asset">Asset with code written on CoffeeScript</param>
		/// <returns>Asset with translated code</returns>
		public IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			using (var coffeeScriptCompiler = new CoffeeScriptCompiler())
			{
				InnerTranslate(asset, coffeeScriptCompiler);
			}

			return asset;
		}

		/// <summary>
		/// Translates code of assets written on CoffeeScript to JS-code
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

			var assetsToProcessing = assets.Where(a => a.AssetType == AssetType.CoffeeScript).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			using (var coffeeScriptCompiler = new CoffeeScriptCompiler())
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
			string assetPath = asset.Path;

			try
			{
				newContent = coffeeScriptCompiler.Compile(asset.Content, assetPath);
			}
			catch (CoffeeScriptCompilingException e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationSyntaxError, 
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetPath, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetTranslationException(
					string.Format(CoreStrings.Translators_TranslationFailed,
						INPUT_CODE_TYPE, OUTPUT_CODE_TYPE, assetPath, e.Message));
			}

			asset.Content = newContent;
		}
	}
}