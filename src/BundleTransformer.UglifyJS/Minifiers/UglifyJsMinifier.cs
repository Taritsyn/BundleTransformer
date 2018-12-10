using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;

using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Minifiers;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.UglifyJs.Configuration;
using BundleTransformer.UglifyJs.Internal;

namespace BundleTransformer.UglifyJs.Minifiers
{
	/// <summary>
	/// Minifier, which produces minifiction of JS code
	/// by using Uglify JS minifier
	/// </summary>
	public sealed class UglifyJsMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Uglify JS minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";

		/// <summary>
		/// Delegate that creates an instance of JS engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Gets or sets a options of parsing
		/// </summary>
		public ParsingOptions ParsingOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a options of compression
		/// </summary>
		public CompressionOptions CompressionOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a options of mangling
		/// </summary>
		public ManglingOptions ManglingOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a options of codeGeneration
		/// </summary>
		public CodeGenerationOptions CodeGenerationOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not mangle/drop function names.
		/// Useful for code relying on <code>Function.prototype.name</code>.
		/// </summary>
		public bool KeepFunctionNames
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable full compliance with
		/// Internet Explorer 6-8 quirks
		/// </summary>
		public bool ScrewIe8
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - only error messages;
		///		1 - only error messages and warnings.
		/// </summary>
		public int Severity
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of Uglify JS minifier
		/// </summary>
		public UglifyJsMinifier()
			: this(null, BundleTransformerContext.Current.Configuration.GetUglifySettings())
		{ }

		/// <summary>
		/// Constructs a instance of Uglify JS minifier
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="uglifyConfig">Configuration settings of Uglify Minifier</param>
		public UglifyJsMinifier(Func<IJsEngine> createJsEngineInstance, UglifySettings uglifyConfig)
		{
			JsMinifierSettings jsMinifierConfig = uglifyConfig.Js;
			ParsingSettings parsingConfig = jsMinifierConfig.Parsing;
			CompressionSettings compressionConfig = jsMinifierConfig.Compression;
			ManglingSettings manglingConfig = jsMinifierConfig.Mangling;
			CodeGenerationSettings codeGenerationConfig = jsMinifierConfig.CodeGeneration;

			ParsingOptions = new ParsingOptions
			{
				BareReturns = parsingConfig.BareReturns,
				Strict = parsingConfig.Strict
			};

			CompressionOptions = new CompressionOptions
			{
				Angular = compressionConfig.Angular,
				Booleans = compressionConfig.Booleans,
				Cascade = compressionConfig.Cascade,
				CollapseVars = compressionConfig.CollapseVars,
				Comparisons = compressionConfig.Comparisons,
				Compress = compressionConfig.Compress,
				Conditionals = compressionConfig.Conditionals,
				DeadCode = compressionConfig.DeadCode,
				DropConsole = compressionConfig.DropConsole,
				DropDebugger = compressionConfig.DropDebugger,
				Evaluate = compressionConfig.Evaluate,
				GlobalDefinitions = compressionConfig.GlobalDefinitions,
				HoistFunctions = compressionConfig.HoistFunctions,
				HoistVars = compressionConfig.HoistVars,
				IfReturn = compressionConfig.IfReturn,
				JoinVars = compressionConfig.JoinVars,
				KeepFunctionArgs = compressionConfig.KeepFunctionArgs,
				KeepInfinity = compressionConfig.KeepInfinity,
				Loops = compressionConfig.Loops,
				NegateIife = compressionConfig.NegateIife,
				Passes = compressionConfig.Passes,
				PropertiesDotNotation = compressionConfig.PropertiesDotNotation,
				PureGetters = compressionConfig.PureGetters,
				PureFunctions = compressionConfig.PureFunctions,
				ReduceVars = compressionConfig.ReduceVars,
				Sequences = compressionConfig.Sequences,
				TopLevel = compressionConfig.TopLevel,
				TopRetain = compressionConfig.TopRetain,
				Unsafe = compressionConfig.Unsafe,
				UnsafeMath = compressionConfig.UnsafeMath,
				UnsafeProto = compressionConfig.UnsafeProto,
				UnsafeRegExp = compressionConfig.UnsafeRegExp,
				Unused = compressionConfig.Unused
			};

			ManglingOptions = new ManglingOptions
			{
				Eval = manglingConfig.Eval,
				Except = manglingConfig.Except,
				Mangle = manglingConfig.Mangle,
				TopLevel = manglingConfig.TopLevel,
			};

			CodeGenerationOptions = new CodeGenerationOptions
			{
				AsciiOnly = codeGenerationConfig.AsciiOnly,
				Beautify = codeGenerationConfig.Beautify,
				Bracketize = codeGenerationConfig.Bracketize,
				Comments = codeGenerationConfig.Comments,
				IndentLevel = codeGenerationConfig.IndentLevel,
				IndentStart = codeGenerationConfig.IndentStart,
				InlineScript = codeGenerationConfig.InlineScript,
				KeepQuotedProperties = codeGenerationConfig.KeepQuotedProperties,
				MaxLineLength = codeGenerationConfig.MaxLineLength,
				PreserveLine = codeGenerationConfig.PreserveLine,
				QuoteKeys = codeGenerationConfig.QuoteKeys,
				QuoteStyle = codeGenerationConfig.QuoteStyle,
				Semicolons = codeGenerationConfig.Semicolons,
				SpaceColon = codeGenerationConfig.SpaceColon,
				UnescapeRegexps = codeGenerationConfig.UnescapeRegexps,
				Width = codeGenerationConfig.Width,
				WrapIife = codeGenerationConfig.WrapIife
			};

			KeepFunctionNames = jsMinifierConfig.KeepFunctionNames;
			ScrewIe8 = jsMinifierConfig.ScrewIe8;
			Severity = jsMinifierConfig.Severity;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = uglifyConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"uglify",
							@"
  * JavaScriptEngineSwitcher.Msie
  * JavaScriptEngineSwitcher.V8
  * JavaScriptEngineSwitcher.ChakraCore",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () => JsEngineSwitcher.Current.CreateEngine(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Produces a code minifiction of JS asset by using Uglify JS minifier
		/// </summary>
		/// <param name="asset">JS asset</param>
		/// <returns>JS asset with minified text content</returns>
		public IAsset Minify(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			if (asset.Minified)
			{
				return asset;
			}

			UglificationOptions options = CreateUglificationOptions();

			using (var jsUglifier = new JsUglifier(_createJsEngineInstance, options))
			{
				InnerMinify(asset, jsUglifier);
			}

			return asset;
		}

		/// <summary>
		/// Produces a code minifiction of JS assets by using Uglify JS minifier
		/// </summary>
		/// <param name="assets">Set of JS assets</param>
		/// <returns>Set of JS assets with minified text content</returns>
		public IList<IAsset> Minify(IList<IAsset> assets)
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

			UglificationOptions options = CreateUglificationOptions();

			using (var jsUglifier = new JsUglifier(_createJsEngineInstance, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerMinify(asset, jsUglifier);
				}
			}

			return assets;
		}

		private void InnerMinify(IAsset asset, JsUglifier jsUglifier)
		{
			string content = asset.Content;
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = jsUglifier.Uglify(content, assetUrl);
			}
			catch (JsUglificationException e)
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
		}

		/// <summary>
		/// Creates a uglification options
		/// </summary>
		/// <returns>Uglification options</returns>
		private UglificationOptions CreateUglificationOptions()
		{
			var options = new UglificationOptions
			{
				ParsingOptions = ParsingOptions,
				CompressionOptions = CompressionOptions,
				ManglingOptions = ManglingOptions,
				CodeGenerationOptions = CodeGenerationOptions,
				KeepFunctionNames = KeepFunctionNames,
				ScrewIe8 = ScrewIe8,
				Severity = Severity
			};

			return options;
		}
	}
}