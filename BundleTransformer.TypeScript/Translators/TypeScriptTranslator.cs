namespace BundleTransformer.TypeScript.Translators
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.IO;
	using System.Linq;
	using System.Text;
	using System.Text.RegularExpressions;

	using JavaScriptEngineSwitcher.Core;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.Helpers;
	using Core.Translators;
	using CoreFileExtensionHelpers = Core.Helpers.FileExtensionHelpers;
	using CoreStrings = Core.Resources.Strings;
	
	using Compilers;
	using Configuration;
	using TypeScriptFileExtensionHelpers = Helpers.FileExtensionHelpers;

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
		/// Composite format string for <code>reference</code> comment
		/// </summary>
		const string REFERENCE_COMMENT_FORMAT = "///<reference path={0}{1}{0}/>";

		/// <summary>
		/// Regular expression for working with <code>reference</code> comments
		/// </summary>
		private static readonly Regex _referenceCommentsRegex =
			new Regex(@"\/\/\/\s*<reference\s+path=(?<quote1>'|"")(?<url>[\w \-+.:,;/?&=%~#$@()\[\]{}]+)(\k<quote1>)\s*\/>",
				RegexOptions.IgnoreCase);

		/// <summary>
		/// Delegate that creates an instance of JavaScript engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Relative path resolver
		/// </summary>
		private readonly IRelativePathResolver _relativePathResolver;

		/// <summary>
		/// TypeScript-script cache
		/// </summary>
		private readonly Dictionary<string, TsScript> _tsScriptCache;

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
		/// Gets or sets a flag for whether to allow 'bool' as a synonym for 'boolean'
		/// </summary>
		public bool AllowBool
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
			: this(null,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.FileSystem.GetCommonRelativePathResolver(),
				BundleTransformerContext.Current.Configuration.GetTypeScriptSettings())
		{ }

		/// <summary>
		/// Constructs instance of TypeScript-translator
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="relativePathResolver">Relative path resolver</param>
		/// <param name="tsConfig">Configuration settings of TypeScript-translator</param>
		public TypeScriptTranslator(Func<IJsEngine> createJsEngineInstance, 
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			IRelativePathResolver relativePathResolver, TypeScriptSettings tsConfig)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_relativePathResolver = relativePathResolver;
			_tsScriptCache = new Dictionary<string, TsScript>();

			UseDefaultLib = tsConfig.UseDefaultLib;
			PropagateEnumConstants = tsConfig.PropagateEnumConstants;
			RemoveComments = tsConfig.RemoveComments;
			AllowAutomaticSemicolonInsertion = tsConfig.AllowAutomaticSemicolonInsertion;
			NoImplicitAny = tsConfig.NoImplicitAny;
			CodeGenTarget = tsConfig.CodeGenTarget;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = tsConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"typeScript",
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
				var typeScriptCompiler = new TypeScriptCompiler(_createJsEngineInstance, options);

				ClearTsScriptCache();

				try
				{
					InnerTranslate(asset, typeScriptCompiler);
				}
				finally
				{
					typeScriptCompiler.Dispose();
					ClearTsScriptCache();
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

			var assetsToProcessing = assets.Where(a => a.AssetTypeCode == Constants.AssetTypeCode.TypeScript).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			lock (_translationSynchronizer)
			{
				CompilationOptions options = CreateCompilationOptions();
				var typeScriptCompiler = new TypeScriptCompiler(_createJsEngineInstance, options);

				ClearTsScriptCache();

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
					ClearTsScriptCache();
				}
			}

			return assets;
		}

		private void InnerTranslate(IAsset asset, TypeScriptCompiler typeScriptCompiler)
		{
			string newContent;
			string assetUrl = asset.Url;
			var dependencies = new DependencyCollection();

			try
			{
				TsScript script = GetTsScript(asset);
				FillDependencies(assetUrl, script, dependencies);

				newContent = typeScriptCompiler.Compile(script.Content, script.Url, dependencies);
				newContent = RemoveReferenceComments(newContent);
			}
			catch (TypeScriptCompilingException e)
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
			asset.VirtualPathDependencies = dependencies
				.Where(d => d.IsObservable)
				.Select(d => d.Url)
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
		/// Preprocess a script content
		/// </summary>
		/// <param name="assetContent">Text content of TypeScript-asset</param>
		/// <param name="assetUrl">URL of TypeScript-asset file</param>
		/// <returns>Preprocessed text content of TypeScript-asset</returns>
		public TsScript PreprocessScript(string assetContent, string assetUrl)
		{
			var script = new TsScript(assetUrl, assetContent);

			int contentLength = assetContent.Length;
			if (contentLength == 0)
			{
				return script;
			}

			MatchCollection referenceCommentMatches = _referenceCommentsRegex.Matches(assetContent);
			if (referenceCommentMatches.Count == 0)
			{
				return script;
			}

			var nodeMatches = new List<TsNodeMatch>();

			foreach (Match referenceCommentMatch in referenceCommentMatches)
			{
				var nodeMatch = new TsNodeMatch(referenceCommentMatch.Index,
					referenceCommentMatch.Length,
					TsNodeType.ReferenceComment,
					referenceCommentMatch);
				nodeMatches.Add(nodeMatch);
			}

			MatchCollection multilineCommentMatches = CommonRegExps.CStyleMultilineCommentRegex.Matches(assetContent);

			foreach (Match multilineCommentMatch in multilineCommentMatches)
			{
				var nodeMatch = new TsNodeMatch(multilineCommentMatch.Index,
					multilineCommentMatch.Length,
					TsNodeType.MultilineComment,
					multilineCommentMatch);
				nodeMatches.Add(nodeMatch);
			}

			nodeMatches = nodeMatches
				.OrderBy(n => n.Position)
				.ThenByDescending(n => n.Length)
				.ToList()
				;

			var contentBuilder = new StringBuilder();
			int endPosition = contentLength - 1;
			int currentPosition = 0;

			foreach (TsNodeMatch nodeMatch in nodeMatches)
			{
				TsNodeType nodeType = nodeMatch.NodeType;
				int nodePosition = nodeMatch.Position;
				Match match = nodeMatch.Match;

				if (nodePosition < currentPosition)
				{
					continue;
				}

				if (nodeType == TsNodeType.ReferenceComment)
				{
					ProcessOtherContent(contentBuilder, assetContent,
						ref currentPosition, nodePosition);

					GroupCollection referenceCommentGroup = match.Groups;

					string url = referenceCommentGroup["url"].Value.Trim();
					string quote = referenceCommentGroup["quote"].Success ?
						referenceCommentGroup["quote"].Value : @"""";
					string processedReferenceUrl;

					string referenceComment = match.Value;
					string processedReferenceComment = ProcessReferenceComment(assetUrl, url, quote,
						out processedReferenceUrl);

					if (!string.IsNullOrWhiteSpace(processedReferenceUrl))
					{
						var references = script.References;
						string urlInUpperCase = processedReferenceUrl.ToUpperInvariant();

						if (references.Count(r => r.ToUpperInvariant() == urlInUpperCase) == 0)
						{
							references.Add(processedReferenceUrl);
						}
					}

					contentBuilder.Append(processedReferenceComment);
					currentPosition += referenceComment.Length;
				}
				else if (nodeType == TsNodeType.MultilineComment)
				{
					int nextPosition = nodePosition + match.Length;

					ProcessOtherContent(contentBuilder, assetContent,
										ref currentPosition, nextPosition);
				}
			}

			if (currentPosition > 0 && currentPosition <= endPosition)
			{
				ProcessOtherContent(contentBuilder, assetContent,
					ref currentPosition, endPosition + 1);
			}

			script.Content = contentBuilder.ToString();

			return script;
		}

		/// <summary>
		/// Process a <code>reference</code> comment
		/// </summary>
		/// <param name="parentAssetUrl">URL of parent TypeScript-asset file</param>
		/// <param name="assetUrl">URL of TypeScript-asset file</param>
		/// <param name="quote">Quote</param>
		/// <param name="processedReferenceUrl">Processed reference URL</param>
		/// <returns>Processed <code>reference</code> comment</returns>
		private string ProcessReferenceComment(string parentAssetUrl, string assetUrl, string quote,
			out string processedReferenceUrl)
		{
			string result;
			processedReferenceUrl = string.Empty;

			if (UrlHelpers.StartsWithProtocol(assetUrl))
			{
				result = string.Format(REFERENCE_COMMENT_FORMAT, quote, assetUrl);

				return result;
			}

			string absoluteUrl = _relativePathResolver.ResolveRelativePath(parentAssetUrl, assetUrl);

			result = string.Format(REFERENCE_COMMENT_FORMAT, quote, absoluteUrl);
			processedReferenceUrl = absoluteUrl;

			return result;
		}

		/// <summary>
		/// Process a other script content
		/// </summary>
		/// <param name="contentBuilder">Content builder</param>
		/// <param name="assetContent">Text content of TypeScript-asset</param>
		/// <param name="currentPosition">Current position</param>
		/// <param name="nextPosition">Next position</param>
		private static void ProcessOtherContent(StringBuilder contentBuilder, string assetContent,
			ref int currentPosition, int nextPosition)
		{
			if (nextPosition > currentPosition)
			{
				string otherContent = assetContent.Substring(currentPosition,
					nextPosition - currentPosition);

				contentBuilder.Append(otherContent);
				currentPosition = nextPosition;
			}
		}

		/// <summary>
		/// Fills the list of TypeScript-files, references to which have been added to a TypeScript-asset 
		/// by using the "reference" comments
		/// </summary>
		/// <param name="rootAssetUrl">URL of root TypeScript-asset file</param>
		/// <param name="parentScript">Parent TypeScript-script</param>
		/// <param name="dependencies">List of TypeScript-files, references to which have been 
		/// added to a TypeScript-asset by using the "reference" comments</param>
		public void FillDependencies(string rootAssetUrl, TsScript parentScript,
			DependencyCollection dependencies)
		{
			foreach (string referenceUrl in parentScript.References)
			{
				string dependencyUrl = referenceUrl;

				if (string.Equals(dependencyUrl, rootAssetUrl, StringComparison.OrdinalIgnoreCase))
				{
					continue;
				}

				if (!dependencies.ContainsUrl(dependencyUrl))
				{
					string dependencyExtension = Path.GetExtension(dependencyUrl);
					if (TypeScriptFileExtensionHelpers.IsTypeScript(dependencyExtension)
						|| CoreFileExtensionHelpers.IsJavaScript(dependencyExtension))
					{
						if (TsScriptExists(dependencyUrl))
						{
							TsScript script = GetTsScript(dependencyUrl);

							var dependency = new Dependency(dependencyUrl, script.Content);
							dependencies.Add(dependency);

							FillDependencies(rootAssetUrl, script, dependencies);
						}
						else
						{
							throw new FileNotFoundException(
								string.Format(CoreStrings.Common_FileNotExist, dependencyUrl));
						}
					}
				}
			}
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
		/// Generates a TypeScript-script cache item key
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <returns>TypeScript-script cache item key</returns>
		private string GenerateTsScriptCacheItemKey(string assetUrl)
		{
			string key = assetUrl.Trim().ToUpperInvariant();

			return key;
		}

		/// <summary>
		/// Determines whether the specified TypeScript-script exists
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <returns>Result of checking (true – exist; false – not exist)</returns>
		private bool TsScriptExists(string assetUrl)
		{
			string key = GenerateTsScriptCacheItemKey(assetUrl);
			bool result;

			if (_tsScriptCache.ContainsKey(key))
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
		/// Gets a TypeScript-script
		/// </summary>
		/// <param name="asset">Asset with code written on TypeScript</param>
		/// <returns>TypeScript-script</returns>
		private TsScript GetTsScript(IAsset asset)
		{
			string assetUrl = asset.Url;
			string assetContent = asset.Content;
			TsScript script = PreprocessScript(assetContent, assetUrl);

			string key = GenerateTsScriptCacheItemKey(assetUrl);
			_tsScriptCache[key] = script;

			return script;
		}

		/// <summary>
		/// Gets a TypeScript-script by URL
		/// </summary>
		/// <param name="assetUrl">URL to asset file</param>
		/// <returns>TypeScript-script</returns>
		private TsScript GetTsScript(string assetUrl)
		{
			string key = GenerateTsScriptCacheItemKey(assetUrl);
			TsScript script;

			if (_tsScriptCache.ContainsKey(key))
			{
				script = _tsScriptCache[key];
			}
			else
			{
				string assetContent = _virtualFileSystemWrapper.GetFileTextContent(assetUrl);
				script = PreprocessScript(assetContent, assetUrl);

				_tsScriptCache.Add(key, script);
			}

			return script;
		}

		/// <summary>
		/// Clears a TypeScript-script cache
		/// </summary>
		private void ClearTsScriptCache()
		{
			if (_tsScriptCache != null)
			{
				_tsScriptCache.Clear();
			}
		}
	}
}