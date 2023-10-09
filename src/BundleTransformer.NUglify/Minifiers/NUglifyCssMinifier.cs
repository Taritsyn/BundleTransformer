using System;
using System.Collections.Generic;
using System.Linq;

using NUglify;
using NUglify.Css;
using NuCssColor = NUglify.Css.CssColor;
using NuCssComment = NUglify.Css.CssComment;
using NuOutputMode = NUglify.OutputMode;
using NuBlockStart = NUglify.BlockStart;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Minifiers;
using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.NUglify.Configuration;
using BtCssColor = BundleTransformer.NUglify.CssColor;
using BtCssComment = BundleTransformer.NUglify.CssComment;
using BtOutputMode = BundleTransformer.NUglify.OutputMode;
using BtBlockStart = BundleTransformer.NUglify.BlockStart;

namespace BundleTransformer.NUglify.Minifiers
{
	/// <summary>
	/// Minifier, which produces minifiction of CSS code
	/// by using NUglify Minifier
	/// </summary>
	public sealed class NUglifyCssMinifier : NUglifyMinifierBase
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "NUglify CSS minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Configuration settings of CSS parser
		/// </summary>
		private readonly CssSettings _cssParserConfiguration;

		/// <summary>
		/// Gets or sets a value indicating whether to abbreviate hex colors to #rgb(a) format
		/// </summary>
		public bool AbbreviateHexColor
		{
			get
			{
				return _cssParserConfiguration.AbbreviateHexColor;
			}
			set
			{
				_cssParserConfiguration.AbbreviateHexColor = value;
			}
		}

		/// <summary>
		/// Gets or sets whether embedded ASP.NET blocks (<code>&lt;% %gt;</code>)
		/// should be recognized and output as is
		/// </summary>
		public override bool AllowEmbeddedAspNetBlocks
		{
			get
			{
				return _cssParserConfiguration.AllowEmbeddedAspNetBlocks;
			}
			set
			{
				_cssParserConfiguration.AllowEmbeddedAspNetBlocks = value;
			}
		}

		/// <summary>
		/// Gets or sets a value indicating whether the opening curly brace for blocks is
		/// on its own line (<code>NewLine</code>) or on the same line as
		/// the preceding code (<code>SameLine</code>)
		/// or taking a hint from the source code position (<code>UseSource</code>).
		/// Only relevant when OutputMode is set to <code>MultipleLines</code>.
		/// </summary>
		public override BtBlockStart BlocksStartOnSameLine
		{
			get
			{
				return Utils.GetEnumFromOtherEnum<NuBlockStart, BtBlockStart>(_cssParserConfiguration.BlocksStartOnSameLine);
			}
			set
			{
				_cssParserConfiguration.BlocksStartOnSameLine = Utils.GetEnumFromOtherEnum<BtBlockStart, NuBlockStart>(value);
			}
		}

		/// <summary>
		/// Gets or sets a flag for whether to ignore all errors found in the input code
		/// </summary>
		public override bool IgnoreAllErrors
		{
			get
			{
				return _cssParserConfiguration.IgnoreAllErrors;
			}
			set
			{
				_cssParserConfiguration.IgnoreAllErrors = value;
			}
		}

		/// <summary>
		/// Gets or sets a string representation of the list of
		/// debug lookups (comma-separated)
		/// </summary>
		public override string IgnoreErrorList
		{
			get
			{
				return _cssParserConfiguration.IgnoreErrorList;
			}
			set
			{
				_cssParserConfiguration.IgnoreErrorList = value;
			}
		}

		/// <summary>
		/// Gets or sets number of spaces or tabs per indent level when in
		/// <code>MultipleLines</code> output mode
		/// </summary>
		public override int IndentSize
		{
			get
			{
				return _cssParserConfiguration.Indent.Length;
			}
			set
			{
				_cssParserConfiguration.Indent = GenerateIndentString(
					GetIndentType(_cssParserConfiguration.Indent), value);
			}
		}

		/// <summary>
		/// Gets or sets a indent type when in <code>MultipleLines</code> output mode
		/// </summary>
		public override IndentType IndentType
		{
			get
			{
				return GetIndentType(_cssParserConfiguration.Indent);
			}
			set
			{
				_cssParserConfiguration.Indent = GenerateIndentString(
					value, _cssParserConfiguration.Indent.Length);
			}
		}

		/// <summary>
		/// Gets or sets a column position at which the line
		/// will be broken at the next available opportunity
		/// </summary>
		public override int LineBreakThreshold
		{
			get
			{
				return _cssParserConfiguration.LineBreakThreshold;
			}
			set
			{
				_cssParserConfiguration.LineBreakThreshold = value;
			}
		}

		/// <summary>
		/// Gets or sets a output mode:
		/// <code>SingleLine</code> - output all code on a single line;
		/// <code>MultipleLines</code> - break the output into multiple lines to be more human-readable
		/// </summary>
		public override BtOutputMode OutputMode
		{
			get
			{
				return Utils.GetEnumFromOtherEnum<NuOutputMode, BtOutputMode>(_cssParserConfiguration.OutputMode);
			}
			set
			{
				_cssParserConfiguration.OutputMode = Utils.GetEnumFromOtherEnum<BtOutputMode, NuOutputMode>(value);
			}
		}

		/// <summary>
		/// Gets or sets string representation of the list
		/// of names defined for the preprocessor (comma-separated)
		/// </summary>
		public override string PreprocessorDefineList
		{
			get
			{
				return _cssParserConfiguration.PreprocessorDefineList;
			}
			set
			{
				_cssParserConfiguration.PreprocessorDefineList = value;
			}
		}

		/// <summary>
		/// Gets or sets a flag for whether to add a semicolon
		/// at the end of the parsed code
		/// </summary>
		public override bool TermSemicolons
		{
			get
			{
				return _cssParserConfiguration.TermSemicolons;
			}
			set
			{
				_cssParserConfiguration.TermSemicolons = value;
			}
		}

		/// <summary>
		/// Gets or sets a <see cref="CssColor"/> setting
		/// </summary>
		public BtCssColor ColorNames
		{
			get
			{
				return Utils.GetEnumFromOtherEnum<NuCssColor, BtCssColor>(_cssParserConfiguration.ColorNames);
			}
			set
			{
				_cssParserConfiguration.ColorNames = Utils.GetEnumFromOtherEnum<BtCssColor, NuCssColor>(value);
			}
		}

		/// <summary>
		/// Gets or sets a <see cref="CssComment"/> setting
		/// </summary>
		public BtCssComment CommentMode
		{
			get
			{
				return Utils.GetEnumFromOtherEnum<NuCssComment, BtCssComment>(_cssParserConfiguration.CommentMode);
			}
			set
			{
				_cssParserConfiguration.CommentMode = Utils.GetEnumFromOtherEnum<BtCssComment, NuCssComment>(value);
			}
		}

		/// <summary>
		/// Gets or sets a value indicating whether unicode escape strings (e.g. <code>\ff0e</code>)
		/// would be replaced by it's actual character or not
		/// </summary>
		public bool DecodeEscapes
		{
			get { return _cssParserConfiguration.DecodeEscapes; }
			set { _cssParserConfiguration.DecodeEscapes = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether IE8 .EOT fonts should get a question-mark
		/// appended to the URL (if not there already) to prevent the browser from generating
		/// invalid HTTP requests to the server
		/// </summary>
		public bool FixIE8Fonts
		{
			get { return _cssParserConfiguration.FixIE8Fonts; }
			set { _cssParserConfiguration.FixIE8Fonts = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether to minify the
		/// JS within expression functions
		/// </summary>
		public bool MinifyExpressions
		{
			get
			{
				return _cssParserConfiguration.MinifyExpressions;
			}
			set
			{
				_cssParserConfiguration.MinifyExpressions = value;
			}
		}

		/// <summary>
		/// Gets or sets a value indicating whether empty blocks removes
		/// the corresponding rule or directive
		/// </summary>
		public bool RemoveEmptyBlocks
		{
			get { return _cssParserConfiguration.RemoveEmptyBlocks; }
			set { _cssParserConfiguration.RemoveEmptyBlocks = value; }
		}


		/// <summary>
		/// Constructs a instance of NUglify CSS minifier
		/// </summary>
		public NUglifyCssMinifier()
			: this(BundleTransformerContext.Current.Configuration.GetNUglifySettings())
		{ }

		/// <summary>
		/// Constructs a instance of NUglify CSS minifier
		/// </summary>
		/// <param name="nuglifyConfig">Configuration settings of NUglify Minifier</param>
		public NUglifyCssMinifier(NUglifySettings nuglifyConfig)
		{
			_cssParserConfiguration = new CssSettings();

			CssMinifierSettings cssMinifierConfig = nuglifyConfig.CssMinifier;
			MapCommonSettings(this, cssMinifierConfig);
			AbbreviateHexColor = cssMinifierConfig.AbbreviateHexColor;
			ColorNames = cssMinifierConfig.ColorNames;
			CommentMode = cssMinifierConfig.CommentMode;
			DecodeEscapes = cssMinifierConfig.DecodeEscapes;
			FixIE8Fonts = cssMinifierConfig.FixIE8Fonts;
			MinifyExpressions = cssMinifierConfig.MinifyExpressions;
			RemoveEmptyBlocks = cssMinifierConfig.RemoveEmptyBlocks;
		}


		/// <summary>
		/// Produces a code minifiction of CSS asset by using NUglify Minifier
		/// </summary>
		/// <param name="asset">CSS asset</param>
		/// <returns>CSS asset with minified text content</returns>
		public override IAsset Minify(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentNullException(
					nameof(asset),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(asset))
				);
			}

			if (asset.Minified)
			{
				return asset;
			}

			var cssParser = new CssParser
			{
				Settings = _cssParserConfiguration
			};

			InnerMinify(asset, cssParser);

			return asset;
		}

		/// <summary>
		/// Produces a code minifiction of CSS assets by using NUglify Minifier
		/// </summary>
		/// <param name="assets">Set of CSS assets</param>
		/// <returns>Set of CSS assets with minified text content</returns>
		public override IList<IAsset> Minify(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentNullException(
					nameof(assets),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(assets))
				);
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.IsStylesheet && !a.Minified).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			var cssParser = new CssParser
			{
				Settings = _cssParserConfiguration
			};

			foreach (var asset in assetsToProcessing)
			{
				InnerMinify(asset, cssParser);
			}

			return assets;
		}

		private void InnerMinify(IAsset asset, CssParser cssParser)
		{
			string newContent;
			string assetUrl = asset.Url;

			cssParser.FileContext = assetUrl;
			cssParser.CssError += ParserErrorHandler;

			try
			{
				// Parse the input
				newContent = cssParser.Parse(asset.Content);
			}
			catch (NUglifyParsingException e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message), e);
			}
			catch (Exception e)
			{
				throw new AssetMinificationException(
					string.Format(CoreStrings.Minifiers_MinificationFailed,
						CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message), e);
			}
			finally
			{
				cssParser.CssError -= ParserErrorHandler;
				cssParser.FileContext = null;
			}

			asset.Content = newContent;
			asset.Minified = true;
		}

		/// <summary>
		/// CSS parser error handler
		/// </summary>
		/// <param name="source">The source of the event</param>
		/// <param name="args">A NUglify.ContextErrorEventArgs
		/// that contains the event data</param>
		private void ParserErrorHandler(object source, ContextErrorEventArgs args)
		{
			UglifyError error = args.Error;

			if (error.Severity <= Severity)
			{
				throw new NUglifyParsingException(FormatContextError(error));
			}
		}
	}
}