namespace BundleTransformer.Closure.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Compilers;
	using Configuration;
	using Resources;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code
	/// by using Google Closure Compiler Service API
	/// </summary>
	public sealed class ClosureRemoteJsMinifier : ClosureJsMinifierBase
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Closure Remote JS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";

		/// <summary>
		/// Gets or sets a URL of Google Closure Compiler Service API
		/// </summary>
		public string ClosureCompilerServiceApiUrl
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to exclude common externs
		/// such as <code>document</code> and all its methods
		/// </summary>
		public bool ExcludeDefaultExterns
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a language spec that input sources conform
		/// </summary>
		public LanguageSpec Language
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of Closure Remote JS-minifier
		/// </summary>
		public ClosureRemoteJsMinifier()
			: this(BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetClosureSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Closure Remote JS-minifier
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="closureConfig">Configuration settings of Closure Minifier</param>
		public ClosureRemoteJsMinifier(IVirtualFileSystemWrapper virtualFileSystemWrapper,
			ClosureSettings closureConfig)
			: base(virtualFileSystemWrapper, closureConfig)
		{
			RemoteJsMinifierSettings remoteJsMinifierConfig = closureConfig.Js.Remote;
			MapCommonSettings(this, remoteJsMinifierConfig);
			ClosureCompilerServiceApiUrl = remoteJsMinifierConfig.ClosureCompilerServiceApiUrl;
			ExcludeDefaultExterns = remoteJsMinifierConfig.ExcludeDefaultExterns;
			Language = remoteJsMinifierConfig.Language;
		}


		/// <summary>
		/// Produces a code minifiction of JS-asset by using Google Closure Compiler Service API
		/// </summary>
		/// <param name="asset">JS-asset</param>
		/// <returns>JS-asset with minified text content</returns>
		public override IAsset Minify(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			if (asset.Minified)
			{
				return asset;
			}

			DependencyCollection commonExternsDependencies = GetCommonExternsDependencies();
			var closureCompiler = new ClosureRemoteJsCompiler(ClosureCompilerServiceApiUrl,
				commonExternsDependencies, CreateCompilationOptions());

			InnerMinify(asset, commonExternsDependencies, closureCompiler);

			return asset;
		}

		/// <summary>
		/// Produces a code minifiction of JS-assets by using Google Closure Compiler Service API
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of JS-assets with minified text content</returns>
		public override IList<IAsset> Minify(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.IsScript && !a.Minified).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			if (string.IsNullOrWhiteSpace(ClosureCompilerServiceApiUrl))
			{
				throw new EmptyValueException(Strings.Minifiers_ClosureCompilerServiceApiUrlNotSpecified);
			}

			DependencyCollection commonExternsDependencies = GetCommonExternsDependencies();
			var closureCompiler = new ClosureRemoteJsCompiler(ClosureCompilerServiceApiUrl,
				commonExternsDependencies, CreateCompilationOptions());

			foreach (var asset in assetsToProcessing)
			{
				InnerMinify(asset, commonExternsDependencies, closureCompiler);
			}

			return assets;
		}

		private void InnerMinify(IAsset asset, DependencyCollection commonExternsDependencies,
			ClosureRemoteJsCompiler closureCompiler)
		{
			string newContent;
			string assetUrl = asset.Url;
			DependencyCollection assetExternsDependencies = GetAssetExternsDependencies(asset);

			try
			{
				newContent = closureCompiler.Compile(asset.Content, assetUrl, assetExternsDependencies);
			}
			catch (ClosureCompilingException e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationFailed,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message));
			}

			asset.Content = newContent;
			asset.Minified = true;
			FillAssetVirtualPathDependencies(asset, commonExternsDependencies, assetExternsDependencies);
		}

		/// <summary>
		/// Creates a compilation options
		/// </summary>
		/// <returns>Compilation options</returns>
		private RemoteJsCompilationOptions CreateCompilationOptions()
		{
			var options = new RemoteJsCompilationOptions
			{
				ExcludeDefaultExterns = ExcludeDefaultExterns,
				Language = Language
			};
			FillJsCompilationOptions(options);

			return options;
		}
	}
}