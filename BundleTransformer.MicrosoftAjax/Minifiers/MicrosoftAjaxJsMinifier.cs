namespace BundleTransformer.MicrosoftAjax.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.IO;
	using System.Linq;
	using System.Text;

	using Microsoft.Ajax.Utilities;
	using MsOutputMode = Microsoft.Ajax.Utilities.OutputMode;
	using MsEvalTreatment = Microsoft.Ajax.Utilities.EvalTreatment;
	using MsLocalRenaming = Microsoft.Ajax.Utilities.LocalRenaming;
	using MsBlockStart = Microsoft.Ajax.Utilities.BlockStart;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using BtOutputMode = OutputMode;
	using BtEvalTreatment = EvalTreatment;
	using BtLocalRenaming = LocalRenaming;
	using BtBlockStart = BlockStart;
	using Resources;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using Microsoft Ajax Minifier
	/// </summary>
	public sealed class MicrosoftAjaxJsMinifier : MicrosoftAjaxMinifierBase
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Microsoft Ajax JS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";

		/// <summary>
		/// Configuration settings of JS-parser
		/// </summary>
		private readonly CodeSettings _jsParserConfiguration;

		/// <summary>
		/// Gets or sets whether embedded ASP.NET blocks (<code>&lt;% %&gt;</code>) 
		/// should be recognized and output as is
		/// </summary>
		public override bool AllowEmbeddedAspNetBlocks
		{
			get
			{
				return _jsParserConfiguration.AllowEmbeddedAspNetBlocks;
			}
			set
			{
				_jsParserConfiguration.AllowEmbeddedAspNetBlocks = value;
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
				return Utils.GetEnumFromOtherEnum<MsBlockStart, BtBlockStart>(_jsParserConfiguration.BlocksStartOnSameLine);
			}
			set
			{
				_jsParserConfiguration.BlocksStartOnSameLine = Utils.GetEnumFromOtherEnum<BtBlockStart, MsBlockStart>(value);
			}
		}

		/// <summary>
		/// Gets or sets a flag for whether to ignore all errors found in the input code
		/// </summary>
		public override bool IgnoreAllErrors
		{
			get
			{
				return _jsParserConfiguration.IgnoreAllErrors;
			}
			set
			{
				_jsParserConfiguration.IgnoreAllErrors = value;
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
				return _jsParserConfiguration.IgnoreErrorList;
			}
			set
			{
				_jsParserConfiguration.IgnoreErrorList = value;
			}
		}

		/// <summary>
		/// Gets or sets number of spaces per indent level when in 
		/// <code>MultipleLines</code> output mode
		/// </summary>
		public override int IndentSize
		{
			get
			{
				return _jsParserConfiguration.IndentSize;
			}
			set
			{
				_jsParserConfiguration.IndentSize = value;
			}
		}

		/// <summary>
		/// Gets or sets a column position at which the line 
		/// will be broken at the next available opportunity
		/// </summary>
		public override int LineBreakThreshold {
			get
			{
				return _jsParserConfiguration.LineBreakThreshold;
			}
			set
			{
				_jsParserConfiguration.LineBreakThreshold = value;
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
				return Utils.GetEnumFromOtherEnum<MsOutputMode, BtOutputMode>(_jsParserConfiguration.OutputMode);
			}
			set
			{
				_jsParserConfiguration.OutputMode = Utils.GetEnumFromOtherEnum<BtOutputMode, MsOutputMode>(value);
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
				return _jsParserConfiguration.PreprocessorDefineList;
			}
			set
			{
				_jsParserConfiguration.PreprocessorDefineList = value;
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
				return _jsParserConfiguration.TermSemicolons;
			}
			set
			{
				_jsParserConfiguration.TermSemicolons = value;
			}
		}

		/// <summary>
		/// Gets or sets a flag indicating whether to always escape non-ASCII characters as <code>\uXXXX</code>
		/// or to let the output encoding object handle that via the <code>JsEncoderFallback</code> object for the
		/// specified output encoding format
		/// </summary>
		public bool AlwaysEscapeNonAscii
		{
			get
			{
				return _jsParserConfiguration.AlwaysEscapeNonAscii;
			}
			set
			{
				_jsParserConfiguration.AlwaysEscapeNonAscii = value;
			}
		}

		/// <summary>
		/// Gets or sets a flag indicating whether to perform extra tasks on AMD-style defines
		/// </summary>
		public bool AmdSupport
		{
			get
			{
				return _jsParserConfiguration.AmdSupport;
			}
			set
			{
				_jsParserConfiguration.AmdSupport = value;
			}
		}

		/// <summary>
		/// Gets or sets a flag for whether to collapse <code>new Array()</code>
		/// to <code>[]</code> and <code>new Object()</code> to <code>{}</code>
		/// (true) or leave as-is (false)
		/// </summary>
		public bool CollapseToLiteral
		{
			get
			{
				return _jsParserConfiguration.CollapseToLiteral;
			}
			set
			{
				_jsParserConfiguration.CollapseToLiteral = value;
			}
		}

		/// <summary>
		/// Gets or sets a boolean value indicating whether to use old-style 
		/// const statements (just var-statements that define unchangeable fields) 
		/// or new EcmaScript 6 lexical declarations
		/// </summary>
		public bool ConstStatementsMozilla
		{
			get
			{
				return _jsParserConfiguration.ConstStatementsMozilla;
			}
			set
			{
				_jsParserConfiguration.ConstStatementsMozilla = value;
			}
		}

		/// <summary>
		/// Gets or sets a string representation of the list of debug 
		/// lookups (comma-separated)
		/// </summary>
		public string DebugLookupList
		{
			get
			{
				return _jsParserConfiguration.DebugLookupList;
			}
			set
			{
				_jsParserConfiguration.DebugLookupList = value;
			}
		}

		/// <summary>
		/// Gets or sets a flag for whether to throw an error 
		/// if a source string is not safe for inclusion in an 
		/// HTML inline script block
		/// </summary>
		public bool ErrorIfNotInlineSafe
		{
			get { return _jsParserConfiguration.ErrorIfNotInlineSafe; }
			set { _jsParserConfiguration.ErrorIfNotInlineSafe = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to evaluate expressions containing 
		/// only literal bool, string, numeric, or null values (true).
		/// Leave literal expressions alone and do not evaluate them (false).
		/// </summary>
		public bool EvalLiteralExpressions
		{
			get { return _jsParserConfiguration.EvalLiteralExpressions; }
			set { _jsParserConfiguration.EvalLiteralExpressions = value; }
		}

		/// <summary>
		/// EvalTreatment setting
		/// </summary>
		public BtEvalTreatment EvalTreatment
		{
			get
			{
				return Utils.GetEnumFromOtherEnum<MsEvalTreatment, BtEvalTreatment>(_jsParserConfiguration.EvalTreatment);
			}
			set
			{
				_jsParserConfiguration.EvalTreatment = Utils.GetEnumFromOtherEnum<BtEvalTreatment, MsEvalTreatment>(value);
			}
		}

		/// <summary>
		/// Gets or sets a flag for whether or not to ignore conditional-compilation 
		/// comment syntax (true) or to try to retain the comments in the output (false)
		/// </summary>
		public bool IgnoreConditionalCompilation
		{
			get
			{
				return _jsParserConfiguration.IgnoreConditionalCompilation;
			}
			set
			{
				_jsParserConfiguration.IgnoreConditionalCompilation = value;
			}
		}

		/// <summary>
		/// Gets or sets a boolean value indicating whether or not to ignore preprocessor 
		/// defines comment syntax (true) or to evaluate them (false)
		/// </summary>
		public bool IgnorePreprocessorDefines
		{
			get
			{
				return _jsParserConfiguration.IgnorePreprocessorDefines;
			}
			set
			{
				_jsParserConfiguration.IgnorePreprocessorDefines = value;
			}
		}

		/// <summary>
		/// Gets or sets a flag for whether to break up string literals containing
		/// <code>&lt;/script&gt;</code> so inline code won't break (true). 
		/// Leave string literals as-is (false).
		/// </summary>
		public bool InlineSafeStrings
		{
			get
			{
				return _jsParserConfiguration.InlineSafeStrings;
			}
			set
			{
				_jsParserConfiguration.InlineSafeStrings = value;
			}
		}

		/// <summary>
		/// Gets or sets the known global names list as a single comma-separated string
		/// </summary>
		public string KnownGlobalNamesList
		{
			get
			{
				return _jsParserConfiguration.KnownGlobalNamesList;
			}
			set
			{
				_jsParserConfiguration.KnownGlobalNamesList = value;
			}
		}

		/// <summary>
		/// Gets or sets a value indicating whether to how to rename local variables and functions:
		/// <code>KeepAll</code> - do not rename local variables and functions;
		/// <code>CrunchAll</code> - rename all local variables and functions to shorter names;
		/// <code>KeepLocalizationVars</code> - rename all local variables and functions that do NOT start with L_
		/// </summary>
		public BtLocalRenaming LocalRenaming
		{
			get
			{
				return Utils.GetEnumFromOtherEnum<MsLocalRenaming, BtLocalRenaming>(_jsParserConfiguration.LocalRenaming);
			}
			set
			{
				_jsParserConfiguration.LocalRenaming = Utils.GetEnumFromOtherEnum<BtLocalRenaming, MsLocalRenaming>(value);
			}
		}

		/// <summary>
		/// Gets or sets a value indicating whether to add characters to the output 
		/// to make sure Mac Safari bugs are not generated (true).
		/// Disregard potential Mac Safari bugs (false).
		/// </summary>
		public bool MacSafariQuirks
		{
			get
			{
				return _jsParserConfiguration.MacSafariQuirks;
			}
			set
			{
				_jsParserConfiguration.MacSafariQuirks = value;
			}
		}

		/// <summary>
		/// Gets or sets a boolean value indicating whether object property 
		/// names with the specified "from" names will get renamed to 
		/// the corresponding "to" names (true) when using 
		/// the manual-rename feature, or left alone (false)
		/// </summary>
		public bool ManualRenamesProperties
		{
			get
			{
				return _jsParserConfiguration.ManualRenamesProperties;
			}
			set
			{
				_jsParserConfiguration.ManualRenamesProperties = value;
			}
		}

		/// <summary>
		/// Get or sets the no-automatic-renaming list as a single string of 
		/// comma-separated identifiers
		/// </summary>
		public string NoAutoRenameList
		{
			get
			{
				return _jsParserConfiguration.NoAutoRenameList;
			}
			set
			{
				_jsParserConfiguration.NoAutoRenameList = value;
			}
		}

		/// <summary>
		/// Gets or sets a value indicating whether all function names 
		/// must be preserved and remain as-named
		/// </summary>
		public bool PreserveFunctionNames
		{
			get { return _jsParserConfiguration.PreserveFunctionNames; }
			set { _jsParserConfiguration.PreserveFunctionNames = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether to preserve important 
		/// comments in the output
		/// </summary>
		public bool PreserveImportantComments
		{
			get
			{
				return _jsParserConfiguration.PreserveImportantComments;
			}
			set
			{
				_jsParserConfiguration.PreserveImportantComments = value;
			}
		}

		/// <summary>
		/// Gets or sets a value indicating whether to always quote object literal property names
		/// </summary>
		public bool QuoteObjectLiteralProperties
		{
			get { return _jsParserConfiguration.QuoteObjectLiteralProperties; }
			set { _jsParserConfiguration.QuoteObjectLiteralProperties = value; }
		}

		/// <summary>
		/// Gets or sets a value indicating whether or not to remove 
		/// unreferenced function expression names
		/// </summary>
		public bool RemoveFunctionExpressionNames
		{
			get
			{
				return _jsParserConfiguration.RemoveFunctionExpressionNames;
			}
			set
			{
				_jsParserConfiguration.RemoveFunctionExpressionNames = value;
			}
		}

		/// <summary>
		/// Remove unneeded code, like uncalled local functions (true).
		/// Keep all code (false).
		/// </summary>
		public bool RemoveUnneededCode
		{
			get
			{
				return _jsParserConfiguration.RemoveUnneededCode;
			}
			set 
			{
				_jsParserConfiguration.RemoveUnneededCode = value;
			}
		}

		/// <summary>
		/// Gets or sets a string representation of all the indentifier 
		/// replacements as a comma-separated list of "source=target" identifiers.
		/// </summary>
		public string RenamePairs
		{
			get
			{
				return _jsParserConfiguration.RenamePairs;
			}
			set
			{
				_jsParserConfiguration.RenamePairs = value;
			}
		}

		/// <summary>
		/// Gets or sets a value indicating whether or not to reorder function and variable
		/// declarations within scopes (true), or to leave the order as specified in 
		/// the original source
		/// </summary>
		public bool ReorderScopeDeclarations
		{
			get { return _jsParserConfiguration.ReorderScopeDeclarations; }
			set { _jsParserConfiguration.ReorderScopeDeclarations = value; }
		}

		/// <summary>
		/// Gets or sets a boolean value indicating whether or not to force 
		/// the input code into strict mode (can still specify strict-mode in 
		/// the sources if this value is false) 
		/// </summary>
		public bool StrictMode
		{
			get
			{
				return _jsParserConfiguration.StrictMode;
			}
			set
			{
				_jsParserConfiguration.StrictMode = value;
			}
		}

		/// <summary>
		/// Strip debug statements (true).
		/// Leave debug statements (false).
		/// </summary>
		public bool StripDebugStatements
		{
			get
			{
				return _jsParserConfiguration.StripDebugStatements;
			}
			set
			{
				_jsParserConfiguration.StripDebugStatements = value;
			}
		}


		/// <summary>
		/// Constructs instance of Microsoft Ajax JS-minifier
		/// </summary>
		public MicrosoftAjaxJsMinifier() 
			: this(BundleTransformerContext.Current.GetMicrosoftAjaxConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Microsoft Ajax JS-minifier
		/// </summary>
		/// <param name="microsoftAjaxConfig">Configuration settings of Microsoft Ajax Minifier</param>
		public MicrosoftAjaxJsMinifier(MicrosoftAjaxSettings microsoftAjaxConfig)
		{
			_jsParserConfiguration = new CodeSettings();

			JsMinifierSettings jsMinifierConfiguration = microsoftAjaxConfig.JsMinifier;
			MapCommonSettings(this, jsMinifierConfiguration);
			AlwaysEscapeNonAscii = jsMinifierConfiguration.AlwaysEscapeNonAscii;
			AmdSupport = jsMinifierConfiguration.AmdSupport;
			CollapseToLiteral = jsMinifierConfiguration.CollapseToLiteral;
			ConstStatementsMozilla = jsMinifierConfiguration.ConstStatementsMozilla;
			DebugLookupList = jsMinifierConfiguration.DebugLookupList;
			ErrorIfNotInlineSafe = jsMinifierConfiguration.ErrorIfNotInlineSafe;
			EvalLiteralExpressions = jsMinifierConfiguration.EvalLiteralExpressions;
			EvalTreatment = jsMinifierConfiguration.EvalTreatment;
			IgnoreConditionalCompilation = jsMinifierConfiguration.IgnoreConditionalCompilation;
			IgnorePreprocessorDefines = jsMinifierConfiguration.IgnorePreprocessorDefines;
			InlineSafeStrings = jsMinifierConfiguration.InlineSafeStrings;
			KnownGlobalNamesList = jsMinifierConfiguration.KnownGlobalNamesList;
			LocalRenaming = jsMinifierConfiguration.LocalRenaming;
			MacSafariQuirks = jsMinifierConfiguration.MacSafariQuirks;
			ManualRenamesProperties = jsMinifierConfiguration.ManualRenamesProperties;
			NoAutoRenameList = jsMinifierConfiguration.NoAutoRenameList;
			PreserveFunctionNames = jsMinifierConfiguration.PreserveFunctionNames;
			PreserveImportantComments = jsMinifierConfiguration.PreserveImportantComments;
			QuoteObjectLiteralProperties = jsMinifierConfiguration.QuoteObjectLiteralProperties;
			RemoveFunctionExpressionNames = jsMinifierConfiguration.RemoveFunctionExpressionNames;
			RemoveUnneededCode = jsMinifierConfiguration.RemoveUnneededCode;
			RenamePairs = jsMinifierConfiguration.RenamePairs;
			ReorderScopeDeclarations = jsMinifierConfiguration.ReorderScopeDeclarations;
			StrictMode = jsMinifierConfiguration.StrictMode;
			StripDebugStatements = jsMinifierConfiguration.StripDebugStatements;
		}


		/// <summary>
		/// Produces code minifiction of JS-assets by using Microsoft Ajax Minifier
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

			foreach (var asset in assetsToProcessing)
			{
				string newContent;
				string assetUrl = asset.Url;

				var documentContext = new DocumentContext(asset.Content)
				{
					FileContext = assetUrl
				};

				var jsParser = new JSParser
				{
					Settings = _jsParserConfiguration
				};
				jsParser.CompilerError += ParserErrorHandler;

				try
				{
					var stringBuilder = new StringBuilder();

					using (var stringWriter = new StringWriter(stringBuilder, CultureInfo.InvariantCulture))
					{
						Block block = jsParser.Parse(documentContext);
						if (block != null)
						{
							if (_jsParserConfiguration.Format == JavaScriptFormat.JSON)
							{
								// Use a JSON output visitor
								if (!JSONOutputVisitor.Apply(stringWriter, block, _jsParserConfiguration))
								{
									throw new MicrosoftAjaxParsingException(Strings.Minifiers_InvalidJsonOutput);
								}
							}
							else
							{
								// Use normal output visitor
								OutputVisitor.Apply(stringWriter, block, _jsParserConfiguration);
							}
						}
					}

					newContent = stringBuilder.ToString();
				}
				catch (MicrosoftAjaxParsingException e)
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
					jsParser.CompilerError -= ParserErrorHandler;
				}
				
				asset.Content = newContent;
				asset.Minified = true;
			}

			return assets;
		}

		/// <summary>
		/// JS-parser error handler
		/// </summary>
		/// <param name="source">The source of the event</param>
		/// <param name="args">A Microsoft.Ajax.Utilities.ContextErrorEventArgs that
		/// contains the event data</param>
		private void ParserErrorHandler(object source, ContextErrorEventArgs args)
		{
			ContextError error = args.Error;

			if (error.Severity <= Severity)
			{
				throw new MicrosoftAjaxParsingException(FormatContextError(error));
			}
		}
	}
}