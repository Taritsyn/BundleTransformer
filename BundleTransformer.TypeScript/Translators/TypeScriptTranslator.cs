namespace BundleTransformer.TypeScript.Translators
{
	using System;
	using System.Collections;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Text.RegularExpressions;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Translators;
	using CoreStrings = Core.Resources.Strings;

	using Compilers;
	using Configuration;

	/// <summary>
	/// Translator that responsible for translation of TypeScript-code to JS-code
	/// </summary>
	public sealed class TypeScriptTranslator : ITranslator
	{
		/// <summary>
		/// Name of input code type
		/// </summary>
		const string INPUT_CODE_TYPE = "TypeScript";

		/// <summary>
		/// Name of output code type
		/// </summary>
		const string OUTPUT_CODE_TYPE = "JS";

		/// <summary>
		/// Regular expression for working with "reference" comments
		/// </summary>
		private static readonly Regex _referenceCommentsRegex =
			new Regex(@"\/\/\/\s*<reference\s+path=(?<quote1>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote1>)\s*\/>",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Relative path resolver
		/// </summary>
		private readonly IRelativePathResolver _relativePathResolver;

		/// <summary>
		/// Asset content cache
		/// </summary>
		private readonly Hashtable _assetContentCache;

		/// <summary>
		/// Synchronizer of translation
		/// </summary>
		private readonly object _translationSynchronizer = new object();

		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to include a default <code>lib.d.ts</code> with global declarations
		/// </summary>
		public bool UseDefaultLib
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to propagate enum constants to emitted code
		/// </summary>
		public bool PropagateEnumConstants
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not emit comments to output
		/// </summary>
		public bool RemoveComments
		{
			get;
			set;
		}


		/// <summary>
		/// Gets or sets a flag for whether to allow automatic semicolon insertion
		/// </summary>
		public bool AllowAutomaticSemicolonInsertion
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to warn on expressions and declarations 
		/// with an implied 'any' type
		/// </summary>
		public bool NoImplicitAny
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a ECMAScript target version ("EcmaScript3" (default), or "EcmaScript5")
		/// </summary>
		public CodeGenTarget CodeGenTarget
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of TypeScript-translator
		/// </summary>
		public TypeScriptTranslator()
			: this(BundleTransformerContext.Current.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.GetCommonRelativePathResolver(),
				BundleTransformerContext.Current.GetTypeScriptConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of TypeScript-translator
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="relativePathResolver">Relative path resolver</param>
		/// <param name="tsConfig">Configuration settings of TypeScript-translator</param>
		public TypeScriptTranslator(IVirtualFileSystemWrapper virtualFileSystemWrapper,
			IRelativePathResolver relativePathResolver, TypeScriptSettings tsConfig)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_relativePathResolver = relativePathResolver;
			_assetContentCache = new Hashtable();

			UseDefaultLib = tsConfig.UseDefaultLib;
			PropagateEnumConstants = tsConfig.PropagateEnumConstants;
			RemoveComments = tsConfig.RemoveComments;
			AllowAutomaticSemicolonInsertion = tsConfig.AllowAutomaticSemicolonInsertion;
			NoImplicitAny = tsConfig.NoImplicitAny;
			CodeGenTarget = tsConfig.CodeGenTarget;
		}


		/// <summary>
		/// Translates code of asset written on TypeScript to JS-code
		/// </summary>
		/// <param name="asset">Asset with code written on TypeScript</param>
		/// <returns>Asset with translated code</returns>
		public IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			lock (_translationSynchronizer)
			{
				CompilationOptions options = CreateCompilationOptions();
				var typeScriptCompiler = new TypeScriptCompiler(options);

				ClearAssetContentCache();

				try
				{
					InnerTranslate(asset, typeScriptCompiler);
				}
				finally
				{
					typeScriptCompiler.Dispose();
					ClearAssetContentCache();
				}
			}

			return asset;
		}

		/// <summary>
		/// Translates code of assets written on TypeScript to JS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on TypeScript</param>
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

			var assetsToProcessing = assets.Where(a => a.AssetType == AssetType.TypeScript).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			lock (_translationSynchronizer)
			{
				CompilationOptions options = CreateCompilationOptions();
				var typeScriptCompiler = new TypeScriptCompiler(options);

				ClearAssetContentCache();

				try
				{
					foreach (var asset in assetsToProcessing)
					{
						InnerTranslate(asset, typeScriptCompiler);
					}
				}
				finally
				{
					typeScriptCompiler.Dispose();
					ClearAssetContentCache();
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, TypeScriptCompiler typeScriptCompiler)
		{
			string newContent;
			string assetVirtualPath = asset.VirtualPath;
			string assetUrl = asset.Url;
			var dependencies = new List<Dependency>();

			try
			{
				string content = GetAssetFileTextContent(assetUrl);
				FillDependencies(assetUrl, content, assetUrl, dependencies);

				newContent = typeScriptCompiler.Compile(content, assetUrl, dependencies);
				newContent = RemoveReferenceComments(newContent);
			}
			catch (TypeScriptCompilingException e)
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
			asset.VirtualPathDependencies = dependencies
				.Select(d => d.VirtualPath)
				.Distinct()
				.ToList()
				;
		}

		/// <summary>
		/// Creates a compilation options
		/// </summary>
		/// <returns>Compilation options</returns>
		private CompilationOptions CreateCompilationOptions()
		{
			var options = new CompilationOptions
			{
				UseDefaultLib = UseDefaultLib,
				PropagateEnumConstants = PropagateEnumConstants,
				RemoveComments = RemoveComments,
				AllowAutomaticSemicolonInsertion = AllowAutomaticSemicolonInsertion,
				NoImplicitAny = NoImplicitAny,
				CodeGenTarget = CodeGenTarget
			};

			return options;
		}

		/// <summary>
		/// Transforms relative paths of "reference" comments to absolute in TypeScript-code
		/// </summary>
		/// <param name="content">Text content of TypeScript-asset</param>
		/// <param name="path">TypeScript-file path</param>
		/// <returns>Processed text content of TypeScript-asset</returns>
		private string ResolveReferenceCommentsRelativePaths(string content, string path)
		{
			return _referenceCommentsRegex.Replace(content, m =>
			{
				GroupCollection groups = m.Groups;

				string url = groups["url"].Value.Trim();
				string quote = groups["quote"].Success ? groups["quote"].Value : @"""";

				string result = string.Format("///<reference path={0}{1}{0}/>",
					quote,
					_relativePathResolver.ResolveRelativePath(path, url)
				);

				return result;
			});
		}

		/// <summary>
		/// Fills the list of TypeScript-files, references to which have been added to a TypeScript-asset 
		/// by using the "reference" comments
		/// </summary>
		/// <param name="rootAssetUrl">URL of root TypeScript-asset file</param>
		/// <param name="parentAssetContent">Text content of parent TypeScript-asset</param>
		/// <param name="parentAssetUrl">URL of parent TypeScript-asset file</param>
		/// <param name="dependencies">List of TypeScript-files, references to which have been 
		/// added to a TypeScript-asset by using the "reference" comments</param>
		public void FillDependencies(string rootAssetUrl, string parentAssetContent, string parentAssetUrl, 
			IList<Dependency> dependencies)
		{
			var parentDependency = GetDependencyByUrl(dependencies, parentAssetUrl);
			int parentDependencyIndex = parentDependency != null ? dependencies.IndexOf(parentDependency) : 0;
			int dependencyIndex = parentDependencyIndex;

			MatchCollection matches = _referenceCommentsRegex.Matches(parentAssetContent);
			foreach (Match match in matches)
			{
				if (match.Groups["url"].Success)
				{
					string dependencyAssetUrl = match.Groups["url"].Value;
					if (!string.IsNullOrWhiteSpace(dependencyAssetUrl))
					{
						if (string.Equals(dependencyAssetUrl, rootAssetUrl, StringComparison.OrdinalIgnoreCase))
						{
							continue;
						}

						string dependencyAssetExtension = Path.GetExtension(dependencyAssetUrl);

						if (FileExtensionHelper.IsTypeScript(dependencyAssetExtension)
							|| FileExtensionHelper.IsJavaScript(dependencyAssetExtension))
						{
							var duplicateDependency = GetDependencyByUrl(dependencies, dependencyAssetUrl);
							if (duplicateDependency == null)
							{
								string dependencyAssetVirtualPath = dependencyAssetUrl;
								if (AssetFileExists(dependencyAssetUrl))
								{
									string dependencyAssetContent = GetAssetFileTextContent(dependencyAssetUrl);
									var dependency = new Dependency
									{
										VirtualPath = dependencyAssetVirtualPath,
										Url = dependencyAssetUrl,
										Content = dependencyAssetContent
									};
									dependencies.Insert(dependencyIndex, dependency);

									FillDependencies(rootAssetUrl, dependencyAssetContent, dependencyAssetUrl, 
										dependencies);

									dependencyIndex = dependencies.IndexOf(dependency) + 1;
								}
								else
								{
									throw new FileNotFoundException(
										string.Format(CoreStrings.Common_FileNotExist, dependencyAssetVirtualPath));
								}
							}
							else
							{
								if (dependencies.IndexOf(duplicateDependency) > dependencyIndex)
								{
									dependencies.Remove(duplicateDependency);
									dependencies.Insert(dependencyIndex, duplicateDependency);

									dependencyIndex++;
								}
							}
						}
					}
				}
			}
		}

		/// <summary>
		/// Gets a dependency by URL
		/// </summary>
		/// <param name="dependencies">List of dependencies</param>
		/// <param name="url">URL of dependency</param>
		/// <returns>Dependency</returns>
		private static Dependency GetDependencyByUrl(IEnumerable<Dependency> dependencies, string url)
		{
			var urlInUpperCase = url.ToUpperInvariant();
			var dependency = dependencies
				.SingleOrDefault(d => d.Url.ToUpperInvariant() == urlInUpperCase)
				;

			return dependency;
		}

		/// <summary>
		/// Removes "reference" comments
		/// </summary>
		/// <param name="content">Text content</param>
		/// <returns>Text content without "reference" comments</returns>
		private string RemoveReferenceComments(string content)
		{
			string newContent = _referenceCommentsRegex.Replace(content, string.Empty).TrimStart();

			return newContent;
		}

		/// <summary>
		/// Generates asset content cache item key
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <returns>Asset content cache item key</returns>
		private string GenerateAssetContentCacheItemKey(string assetUrl)
		{
			string key = assetUrl.Trim().ToUpperInvariant();

			return key;
		}

		/// <summary>
		/// Gets text content of asset
		/// </summary>
		/// <param name="assetUrl">URL to asset file</param>
		/// <returns>Text content of asset</returns>
		private string GetAssetFileTextContent(string assetUrl)
		{
			string key = GenerateAssetContentCacheItemKey(assetUrl);
			string assetContent;

			if (_assetContentCache.ContainsKey(key))
			{
				assetContent = (string)_assetContentCache[key];
			}
			else
			{
				assetContent = _virtualFileSystemWrapper.GetFileTextContent(assetUrl);
				assetContent = ResolveReferenceCommentsRelativePaths(assetContent, assetUrl);

				_assetContentCache.Add(key, assetContent);
			}

			return assetContent;
		}

		/// <summary>
		/// Determines whether the specified asset file exists
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		private bool AssetFileExists(string assetUrl)
		{
			string key = GenerateAssetContentCacheItemKey(assetUrl);
			bool result;

			if (_assetContentCache.ContainsKey(key))
			{
				result = true;
			}
			else
			{
				result = _virtualFileSystemWrapper.FileExists(assetUrl);
			}

			return result;
		}

		/// <summary>
		/// Clears asset content cache
		/// </summary>
		private void ClearAssetContentCache()
		{
			if (_assetContentCache != null)
			{
				_assetContentCache.Clear();
			}
		}
	}
}