namespace BundleTransformer.UglifyJs.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Uglifiers;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using Uglify JS-minifier
	/// </summary>
	public sealed class UglifyJsMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Uglify JS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";

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
		/// Constructs instance of Uglify JS-minifier
		/// </summary>
		public UglifyJsMinifier() 
			: this(BundleTransformerContext.Current.GetUglifyJsConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Uglify JS-minifier
		/// </summary>
		/// <param name="uglifyConfig">Configuration settings of Uglify Minifier</param>
		public UglifyJsMinifier(UglifySettings uglifyConfig)
		{
			JsSettings jsConfig = uglifyConfig.Js;
			ParsingSettings parsing = jsConfig.Parsing;
			CompressionSettings compressionConfig = jsConfig.Compression;
			ManglingSettings manglingConfig = jsConfig.Mangling;
			CodeGenerationSettings codeGenerationConfig = jsConfig.CodeGeneration;

			ParsingOptions = new ParsingOptions
			{
				Strict = parsing.Strict
			};

			CompressionOptions = new CompressionOptions
			{
				Compress = compressionConfig.Compress,
				Sequences = compressionConfig.Sequences,
				PropertiesDotNotation = compressionConfig.PropertiesDotNotation,
				DeadCode = compressionConfig.DeadCode,
				DropDebugger = compressionConfig.DropDebugger,
				Unsafe = compressionConfig.Unsafe,
				Conditionals = compressionConfig.Conditionals,
				Comparisons = compressionConfig.Comparisons,
				Evaluate = compressionConfig.Evaluate,
				Booleans = compressionConfig.Booleans,
				Loops = compressionConfig.Loops,
				Unused = compressionConfig.Unused,
				HoistFunctions = compressionConfig.HoistFunctions,
				HoistVars = compressionConfig.HoistVars,
				IfReturn = compressionConfig.IfReturn,
				JoinVars = compressionConfig.JoinVars,
				Cascade = compressionConfig.Cascade,
				GlobalDefinitions = compressionConfig.GlobalDefinitions
			};

			ManglingOptions = new ManglingOptions
			{
				Mangle = manglingConfig.Mangle,
				Except = manglingConfig.Except,
				Eval = manglingConfig.Eval,
				Sort = manglingConfig.Sort,
				TopLevel = manglingConfig.TopLevel,
			};

			CodeGenerationOptions = new CodeGenerationOptions
			{
				Beautify = codeGenerationConfig.Beautify,
				IndentLevel = codeGenerationConfig.IndentLevel,
				IndentStart = codeGenerationConfig.IndentStart,
				QuoteKeys = codeGenerationConfig.QuoteKeys,
				SpaceColon = codeGenerationConfig.SpaceColon,
				AsciiOnly = codeGenerationConfig.AsciiOnly,
				InlineScript = codeGenerationConfig.InlineScript,
				Width = codeGenerationConfig.Width,
				MaxLineLength = codeGenerationConfig.MaxLineLength,
				IeProof = codeGenerationConfig.IeProof,
				Bracketize = codeGenerationConfig.Bracketize,
				Semicolons = codeGenerationConfig.Semicolons,
				Comments = codeGenerationConfig.Comments,
				PreserveLine = codeGenerationConfig.PreserveLine
			};

			ScrewIe8 = jsConfig.ScrewIe8;
			Severity = jsConfig.Severity;
		}


		/// <summary>
		/// Produces code minifiction of JS-assets by using Uglify JS-minifier
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of JS-assets with minified text content</returns>
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

			UglificationOptions options = CreateUglificationOptions();

			var assetsToProcessing = assets.Where(a => a.IsScript && !a.Minified).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			using (var jsUglifier = new JsUglifier(options))
			{
				foreach (var asset in assetsToProcessing)
				{
					string content = asset.Content;
					string newContent;
					string assetVirtualPath = asset.VirtualPath;

					try
					{
						newContent = jsUglifier.Uglify(content);
					}
					catch (JsUglifyingException e)
					{
						throw new AssetMinificationException(
							string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
								CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message));
					}
					catch (Exception e)
					{
						throw new AssetMinificationException(
							string.Format(CoreStrings.Minifiers_MinificationFailed,
								CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message));
					}

					asset.Content = newContent;
					asset.Minified = true;
				}
			}

			return assets;
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
				ScrewIe8 = ScrewIe8,
				Severity = Severity
			};

			return options;
		}
	}
}