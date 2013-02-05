namespace BundleTransformer.TypeScript.Translators
{
	using System;
	using System.Collections;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Text.RegularExpressions;
	using System.Web;

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
	public sealed class TypeScriptTranslator : TranslatorWithNativeMinificationBase
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
		/// TypeScript-file extension
		/// </summary>
		private const string TS_FILE_EXTENSION = ".ts";

		/// <summary>
		/// JS-file extension
		/// </summary>
		private const string JS_FILE_EXTENSION = ".js";

		/// <summary>
		/// Regular expression for working with "reference" comments
		/// </summary>
		private static readonly Regex _referenceCommentsRegex =
			new Regex(@"\/\/\/\s*<reference\s+path=(?<quote1>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote1>)\s*\/>",
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Object HttpContext
		/// </summary>
		private readonly HttpContextBase _httpContext;

		/// <summary>
		/// File system wrapper
		/// </summary>
		private readonly IFileSystemWrapper _fileSystemWrapper;

		/// <summary>
		/// JS relative path resolver
		/// </summary>
		private readonly IJsRelativePathResolver _jsRelativePathResolver;

		/// <summary>
		/// Asset content cache
		/// </summary>
		private readonly Hashtable _assetContentCache;

		/// <summary>
		/// Gets or sets settings of code stylization
		/// </summary>
		public StyleInstanceSettings StyleSettings
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to include a default lib.d.ts with global declarations
		/// </summary>
		public bool UseDefaultLib
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to propagate constants to emitted code
		/// </summary>
		public bool PropagateConstants
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disallow with statements
		/// </summary>
		public bool ErrorOnWith
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to infer class properties from top-level assignments to 'this'
		/// </summary>
		public bool InferPropertiesFromThisAssignment
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
			: this(new HttpContextWrapper(HttpContext.Current),
				BundleTransformerContext.Current.GetFileSystemWrapper(),
				BundleTransformerContext.Current.GetJsRelativePathResolver(),
				BundleTransformerContext.Current.GetTypeScriptConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of TypeScript-translator
		/// </summary>
		/// <param name="httpContext">Object HttpContext</param>
		/// <param name="fileSystemWrapper">File system wrapper</param>
		/// <param name="jsRelativePathResolver">JS relative path resolver</param>
		/// <param name="tsConfig">Configuration settings of TypeScript-translator</param>
		public TypeScriptTranslator(HttpContextBase httpContext, IFileSystemWrapper fileSystemWrapper,
			IJsRelativePathResolver jsRelativePathResolver, TypeScriptSettings tsConfig)
		{
			_httpContext = httpContext;
			_fileSystemWrapper = fileSystemWrapper;
			_jsRelativePathResolver = jsRelativePathResolver;
			_assetContentCache = new Hashtable();

			StyleSettings styleConfig = tsConfig.Style;

			StyleSettings = new StyleInstanceSettings
			{
				Bitwise = styleConfig.Bitwise,
				BlockInCompoundStatement = styleConfig.BlockInCompoundStatement,
				EqEqEq = styleConfig.EqEqEq,
				ForIn = styleConfig.ForIn,
				EmptyBlocks = styleConfig.EmptyBlocks,
				NewMustBeUsed = styleConfig.NewMustBeUsed,
				RequireSemicolons = styleConfig.RequireSemicolons,
				AssignmentInConditions = styleConfig.AssignmentInConditions,
				EqNull = styleConfig.EqNull,
				EvalOk = styleConfig.EvalOk,
				InnerScopeDeclarationsEscape = styleConfig.InnerScopeDeclarationsEscape,
				FunctionsInLoops = styleConfig.FunctionsInLoops,
				ReDeclareLocal = styleConfig.ReDeclareLocal,
				LiteralSubscript = styleConfig.LiteralSubscript,
				ImplicitAny = styleConfig.ImplicitAny
			};
			UseNativeMinification = tsConfig.UseNativeMinification;
			UseDefaultLib = tsConfig.UseDefaultLib;
			PropagateConstants = tsConfig.PropagateConstants;
			ErrorOnWith = tsConfig.ErrorOnWith;
			InferPropertiesFromThisAssignment = tsConfig.InferPropertiesFromThisAssignment;
			CodeGenTarget = tsConfig.CodeGenTarget;
		}


		/// <summary>
		/// Translates code of asset written on TypeScript to JS-code
		/// </summary>
		/// <param name="asset">Asset with code written on TypeScript</param>
		/// <returns>Asset with translated code</returns>
		public override IAsset Translate(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			var options = GenerateTypeScriptCompilationOptions(enableNativeMinification);
			var typeScriptCompiler = new TypeScriptCompiler(UseDefaultLib, options);

			try
			{
				InnerTranslate(asset, typeScriptCompiler, enableNativeMinification);
			}
			finally
			{
				typeScriptCompiler.Dispose();
				ClearAssetContentCache();
			}

			return asset;
		}

		/// <summary>
		/// Translates code of assets written on TypeScript to JS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on TypeScript</param>
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

			var assetsToProcessing = assets.Where(a => a.AssetType == AssetType.TypeScript).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			bool enableNativeMinification = NativeMinificationEnabled;
			var options = GenerateTypeScriptCompilationOptions(enableNativeMinification);
			var typeScriptCompiler = new TypeScriptCompiler(UseDefaultLib, options);

			try
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerTranslate(asset, typeScriptCompiler, enableNativeMinification);
				}
			}
			finally
			{
				typeScriptCompiler.Dispose();
				ClearAssetContentCache();
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, TypeScriptCompiler typeScriptCompiler, bool enableNativeMinification)
		{
			string newContent;
			string assetUrl = asset.Url;
			string assetPath = asset.Path;
			var dependencies = new List<Dependency>();

			try
			{
				string content = GetAssetFileTextContent(assetPath);
				FillDependencies(assetUrl, content, assetUrl, dependencies);

				newContent = typeScriptCompiler.Compile(content, dependencies);
				newContent = RemoveReferenceComments(newContent);
			}
			catch (TypeScriptCompilingException e)
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
			asset.Minified = enableNativeMinification;
			asset.RequiredFilePaths = dependencies
				.Select(d => d.Path)
				.Distinct()
				.ToList()
				;
		}

		/// <summary>
		/// Generates a TypeScript compilation options
		/// </summary>
		/// <param name="enableNativeMinification">Flag that indicating to use of native minification</param>
		/// <returns>TypeScript compilation options</returns>
		private object GenerateTypeScriptCompilationOptions(bool enableNativeMinification)
		{
			var options = new
			{
			    styleSettings = new
			    {
					bitwise = StyleSettings.Bitwise,
					blockInCompoundStmt = StyleSettings.BlockInCompoundStatement,
					eqeqeq = StyleSettings.EqEqEq,
					forin = StyleSettings.ForIn,
					emptyBlocks = StyleSettings.EmptyBlocks,
					newMustBeUsed = StyleSettings.NewMustBeUsed,
					requireSemi = StyleSettings.RequireSemicolons,
					assignmentInCond = StyleSettings.AssignmentInConditions,
					eqnull = StyleSettings.EqNull,
					evalOK = StyleSettings.EvalOk,
					innerScopeDeclEscape = StyleSettings.InnerScopeDeclarationsEscape,
					funcInLoop = StyleSettings.FunctionsInLoops,
					reDeclareLocal = StyleSettings.ReDeclareLocal,
					literalSubscript = StyleSettings.LiteralSubscript,
					implicitAny = StyleSettings.ImplicitAny
			    },
			    propagateConstants = PropagateConstants,
			    minWhitespace = enableNativeMinification,
			    emitComments = !enableNativeMinification,
				errorOnWith = ErrorOnWith,
				inferPropertiesFromThisAssignment = InferPropertiesFromThisAssignment,
				codeGenTarget = CodeGenTarget.ToString()
			};

			return options;
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
						dependencyAssetUrl = _jsRelativePathResolver.ResolveRelativePath(
							parentAssetUrl, dependencyAssetUrl.Trim());
						if (string.Equals(dependencyAssetUrl, rootAssetUrl, StringComparison.InvariantCultureIgnoreCase))
						{
							continue;
						}

						string dependencyAssetExtension = Path.GetExtension(dependencyAssetUrl);
						if (string.Equals(dependencyAssetExtension, TS_FILE_EXTENSION, StringComparison.InvariantCultureIgnoreCase)
							|| string.Equals(dependencyAssetExtension, JS_FILE_EXTENSION, StringComparison.InvariantCultureIgnoreCase))
						{
							var duplicateDependency = GetDependencyByUrl(dependencies, dependencyAssetUrl);
							if (duplicateDependency == null)
							{
								string dependencyAssetPath = _httpContext.Server.MapPath(dependencyAssetUrl);
								if (AssetFileExists(dependencyAssetPath))
								{
									string dependencyAssetContent = GetAssetFileTextContent(dependencyAssetPath);
									var dependency = new Dependency
									{
										Url = dependencyAssetUrl,
										Path = dependencyAssetPath,
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
										string.Format(CoreStrings.Common_FileNotExist, dependencyAssetPath));
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
				.Where(d => d.Url.ToUpperInvariant() == urlInUpperCase)
				.SingleOrDefault()
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
			string newContent = _referenceCommentsRegex.Replace(content, string.Empty).Trim();

			return newContent;
		}

		/// <summary>
		/// Generates asset content cache item key
		/// </summary>
		/// <param name="assetPath">Path to asset file</param>
		/// <returns>Asset content cache item key</returns>
		private string GenerateAssetContentCacheItemKey(string assetPath)
		{
			string key = assetPath.Trim().ToUpperInvariant();

			return key;
		}

		/// <summary>
		/// Gets text content of asset
		/// </summary>
		/// <param name="assetPath">Path to asset file</param>
		/// <returns>Text content of asset</returns>
		private string GetAssetFileTextContent(string assetPath)
		{
			string key = GenerateAssetContentCacheItemKey(assetPath);
			string assetContent;

			if (_assetContentCache.ContainsKey(key))
			{
				assetContent = (string)_assetContentCache[key];
			}
			else
			{
				assetContent = _fileSystemWrapper.GetFileTextContent(assetPath);
				_assetContentCache.Add(key, assetContent);
			}

			return assetContent;
		}

		/// <summary>
		/// Determines whether the specified asset file exists
		/// </summary>
		/// <param name="assetPath">Path to asset file</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		private bool AssetFileExists(string assetPath)
		{
			string key = GenerateAssetContentCacheItemKey(assetPath);
			bool result;

			if (_assetContentCache.ContainsKey(key))
			{
				result = true;
			}
			else
			{
				result = _fileSystemWrapper.FileExists(assetPath);
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