namespace BundleTransformer.Less.Translators
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using dotless.Core;
	using dotless.Core.configuration;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using CoreStrings = Core.Resources.Strings;
	using Core.Translators;

	using Configuration;
	using LessStrings = Resources.Strings;

	/// <summary>
	/// Translator that responsible for translation of LESS-code to CSS-code
	/// </summary>
	public sealed class LessTranslator : TranslatorWithNativeMinificationBase
	{
		/// <summary>
		/// CSS relative path resolver
		/// </summary>
		private readonly ICssRelativePathResolver _cssRelativePathResolver;

		/// <summary>
		/// Configuration settings of LESS-translator
		/// </summary>
		private readonly LessSettings _lessConfiguration;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		public LessTranslator()
			: this(BundleTransformerContext.Current.GetCssRelativePathResolver(), 
				BundleTransformerContext.Current.GetLessConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		/// <param name="cssRelativePathResolver">CSS relative path resolver</param>
		public LessTranslator(ICssRelativePathResolver cssRelativePathResolver)
			: this(cssRelativePathResolver, BundleTransformerContext.Current.GetLessConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		/// <param name="lessConfiguration">Configuration settings of LESS-translator</param>
		public LessTranslator(LessSettings lessConfiguration)
			: this(BundleTransformerContext.Current.GetCssRelativePathResolver(), lessConfiguration)
		{ }

		/// <summary>
		/// Constructs instance of LESS-translator
		/// </summary>
		/// <param name="cssRelativePathResolver">CSS relative path resolver</param>
		/// <param name="lessConfiguration">Configuration settings of LESS-translator</param>
		public LessTranslator(ICssRelativePathResolver cssRelativePathResolver, LessSettings lessConfiguration)
		{
			_cssRelativePathResolver = cssRelativePathResolver;
			_lessConfiguration = lessConfiguration;

			UseNativeMinification = _lessConfiguration.UseNativeMinification;
		}

		/// <summary>
		/// Destructs instance of LESS-translator
		/// </summary>
		~LessTranslator()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Creates instance of LESS-engine
		/// </summary>
		/// <param name="enableNativeMinification">Enables native minification</param>
		/// <returns>LESS-engine</returns>
		private ILessEngine CreateLessEngine(bool enableNativeMinification)
		{
			DotlessConfiguration lessEngineConfig = DotlessConfiguration.GetDefault();
			lessEngineConfig.MapPathsToWeb = true;
			lessEngineConfig.CacheEnabled = false;
			lessEngineConfig.DisableUrlRewriting = true;
			lessEngineConfig.Web = true;
			lessEngineConfig.MinifyOutput = enableNativeMinification;

			var lessEngineFactory = new EngineFactory(lessEngineConfig);
			ILessEngine lessEngine = lessEngineFactory.GetEngine();

			return lessEngine;
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

			bool enableNativeMinification = NativeMinificationEnabled;
			ILessEngine lessEngine = CreateLessEngine(enableNativeMinification);

			foreach (var asset in assets.Where(a => a.AssetType == AssetType.Less))
			{
				string newContent = String.Empty;

				try
				{
					newContent = lessEngine.TransformToCss(
						_cssRelativePathResolver.ResolveImportsRelativePaths(asset.Content, asset.Url), 
						null);
				}
				catch (Exception e)
				{
					throw new AssetTranslationException(
						String.Format(LessStrings.Translators_LessTranslationFailed, asset.Path), e);
				}

				asset.Content = newContent;
				asset.Minified = enableNativeMinification;
			}

			return assets;
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
			}
		}
	}
}