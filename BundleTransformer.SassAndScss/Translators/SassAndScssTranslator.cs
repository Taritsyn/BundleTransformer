namespace BundleTransformer.SassAndScss.Translators
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using SassAndCoffee.Ruby.Sass;

	using Core;
	using Core.Assets;
	using CoreStrings = Core.Resources.Strings;
	using Core.Resources;
	using Core.Translators;

	using Configuration;
	using SassAndScssStrings = Resources.Strings;

	/// <summary>
	/// Translator that responsible for translation of Sass- or SCSS-code to CSS-code
	/// </summary>
	public sealed class SassAndScssTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// Configuration settings of Sass- and SCSS-translator
		/// </summary>
		private SassAndScssSettings _sassAndScssConfig;

		/// <summary>
		/// Sass- and SCSS-compiler
		/// </summary>
		private SassCompiler _sassCompiler;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of Sass- and SCSS-translator
		/// </summary>
		public SassAndScssTranslator() : this(BundleTransformerContext.Current.GetSassAndScssConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Sass- and SCSS-translator
		/// </summary>
		/// <param name="sassAndScssConfig">Configuration settings of Sass- and SCSS-translator</param>
		public SassAndScssTranslator(SassAndScssSettings sassAndScssConfig)
		{
			_sassAndScssConfig = sassAndScssConfig;
			_sassCompiler = new SassCompiler();

			UseNativeMinification = _sassAndScssConfig.UseNativeMinification;
		}

		/// <summary>
		/// Destructs instance of Sass- and SCSS-translator
		/// </summary>
		~SassAndScssTranslator()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Translates code of asset written on Sass or SCSS to CSS-code
		/// </summary>
		/// <param name="asset">Asset with code written on Sass or SCSS</param>
		/// <returns>Asset with translated code</returns>
		public override IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "asset");
			}

			InnerTranslate(asset, NativeMinificationEnabled);

			return asset;
		}

		/// <summary>
		/// Translates code of assets written on Sass or SCSS to CSS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on Sass or SCSS</param>
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

			bool enableNativeMinification = NativeMinificationEnabled;

			foreach (var asset in assets.Where(a => a.AssetType == AssetType.Sass
				|| a.AssetType == AssetType.Scss))
			{
				InnerTranslate(asset, enableNativeMinification);
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, bool enableNativeMinification)
		{
			string assetTypeName = (asset.AssetType == AssetType.Scss) ? "SCSS" : "Sass";
			string newContent = string.Empty;

			try
			{
				newContent = _sassCompiler.Compile(asset.Path, enableNativeMinification, new List<string>());
			}
			catch (Exception e)
			{
				if (e.Message == "Sass::SyntaxError")
				{
					throw new AssetTranslationException(
						string.Format(SassAndScssStrings.Translators_SassAndScssTranslationSyntaxError,
							asset.Path, assetTypeName), e);
				}
				else
				{
					throw new AssetTranslationException(
						string.Format(SassAndScssStrings.Translators_SassAndScssTranslationFailed,
							asset.Path, assetTypeName), e);
				}
			}

			asset.Content = newContent;
			asset.Minified = enableNativeMinification;
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

				_sassAndScssConfig = null;

				if (_sassCompiler != null)
				{
					_sassCompiler.Dispose();
					_sassCompiler = null;
				}
			}
		}
	}
}
