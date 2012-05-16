namespace BundleTransformer.MicrosoftAjax.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Microsoft.Ajax.Utilities;
	using MsOutputMode = Microsoft.Ajax.Utilities.OutputMode;
	using MsEvalTreatment = Microsoft.Ajax.Utilities.EvalTreatment;
	using MsLocalRenaming = Microsoft.Ajax.Utilities.LocalRenaming;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using BtOutputMode = OutputMode;
	using BtEvalTreatment = EvalTreatment;
	using BtLocalRenaming = LocalRenaming;
	using MicrosoftAjaxStrings = Resources.Strings;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using Microsoft Ajax Minifier
	/// </summary>
	public sealed class MicrosoftAjaxJsMinifier : MicrosoftAjaxMinifierBase
	{
		/// <summary>
		/// Configuration settings of Microsoft Ajax Minifier
		/// </summary>
		private MicrosoftAjaxSettings _microsoftAjaxConfiguration;

		/// <summary>
		/// Configuration settings of JS-parser
		/// </summary>
		private CodeSettings _jsParserConfiguration;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;

		/// <summary>
		/// Gets or sets whether embedded ASP.NET blocks (&lt;% %&gt;) 
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
		/// Gets or sets a flag for whether to collapse new Array() to []
		/// and new Object() to {} [true] or leave as-is [false]
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
		/// Gets or sets a flag for whether to combine duplicate literals 
		/// within function scopes to local variables [true] or leave them as-is [false]
		/// </summary>
		public bool CombineDuplicateLiterals
		{
			get
			{
				return _jsParserConfiguration.CombineDuplicateLiterals;
			}
			set
			{
				_jsParserConfiguration.CombineDuplicateLiterals = value;
			}
		}

		/// <summary>
		/// Gets or sets a string representation of the list of debug 
		/// lookups, comma-separated
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
		/// comment syntax (true) or to try to retain the comments in the output (false; default)
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
		/// Gets or sets a string representation of the list of 
		/// debug lookups, comma-separated
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
		/// MultipleLines output mode
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
		/// Gets or sets a flag for whether to break up string literals containing &lt;/script&gt; 
		/// so inline code won't break [true]. 
		/// Leave string literals as-is [false].
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
		/// KeepAll - do not rename local variables and functions;
		/// CrunchAll - rename all local variables and functions to shorter names;
		/// KeepLocalizationVars - rename all local variables and functions that do NOT start with L_
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
		/// to make sure Mac Safari bugs are not generated [true].
		/// Disregard potential Mac Safari bugs [false].
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
		/// Gets or sets a flag for whether to modify the source code's syntax tree 
		/// to provide the smallest equivalent output [true].
		/// Do not modify the syntax tree [false].
		/// </summary>
		public bool MinifyCode
		{
			get
			{
				return _jsParserConfiguration.MinifyCode;
			}
			set
			{
				_jsParserConfiguration.MinifyCode = value;
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
		/// Gets or sets a output mode:
		/// SingleLine - output all code on a single line;
		/// MultipleLines - break the output into multiple lines to be more human-readable
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
		/// of names defined for the preprocessor, comma-separated
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
		/// comments in the output.
		/// Default is true.
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
		/// Remove unneeded code, like uncalled local functions [true].
		/// Keep all code [false].
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
		/// Strip debug statements [true].
		/// Leave debug statements [false].
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
		/// Constructs instance of Microsoft Ajax JS-minifier
		/// </summary>
		public MicrosoftAjaxJsMinifier() 
			: this(BundleTransformerContext.Current.GetMicrosoftAjaxConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Microsoft Ajax JS-minifier
		/// </summary>
		/// <param name="microsoftAjaxConfiguration">Configuration settings of Microsoft Ajax Minifier</param>
		public MicrosoftAjaxJsMinifier(MicrosoftAjaxSettings microsoftAjaxConfiguration)
		{
			_microsoftAjaxConfiguration = microsoftAjaxConfiguration;
			_jsParserConfiguration = new CodeSettings();

			JsMinifierSettings jsMinifierConfiguration = _microsoftAjaxConfiguration.JsMinifier;
			AllowEmbeddedAspNetBlocks = jsMinifierConfiguration.AllowEmbeddedAspNetBlocks;
			CollapseToLiteral = jsMinifierConfiguration.CollapseToLiteral;
			CombineDuplicateLiterals = jsMinifierConfiguration.CombineDuplicateLiterals;
			DebugLookupList = jsMinifierConfiguration.DebugLookupList;
			EvalTreatment = jsMinifierConfiguration.EvalTreatment;
			IgnoreConditionalCompilation = jsMinifierConfiguration.IgnoreConditionalCompilation;
			IgnoreErrorList = jsMinifierConfiguration.IgnoreErrorList;
			IndentSize = jsMinifierConfiguration.IndentSize;
			InlineSafeStrings = jsMinifierConfiguration.InlineSafeStrings;
			KnownGlobalNamesList = jsMinifierConfiguration.KnownGlobalNamesList;
			LocalRenaming = jsMinifierConfiguration.LocalRenaming;
			MacSafariQuirks = jsMinifierConfiguration.MacSafariQuirks;
			MinifyCode = jsMinifierConfiguration.MinifyCode;
			NoAutoRenameList = jsMinifierConfiguration.NoAutoRenameList;
			OutputMode = jsMinifierConfiguration.OutputMode;
			PreprocessorDefineList = jsMinifierConfiguration.PreprocessorDefineList;
			PreserveFunctionNames = jsMinifierConfiguration.PreserveFunctionNames;
			PreserveImportantComments = jsMinifierConfiguration.PreserveImportantComments;
			RemoveFunctionExpressionNames = jsMinifierConfiguration.RemoveFunctionExpressionNames;
			RemoveUnneededCode = jsMinifierConfiguration.RemoveUnneededCode;
			RenamePairs = jsMinifierConfiguration.RenamePairs;
			StrictMode = jsMinifierConfiguration.StrictMode;
			StripDebugStatements = jsMinifierConfiguration.StripDebugStatements;
			TermSemicolons = jsMinifierConfiguration.TermSemicolons;
			Severity = jsMinifierConfiguration.Severity;
		}

		/// <summary>
		/// Destructs instance of Microsoft Ajax JS-minifier
		/// </summary>
		~MicrosoftAjaxJsMinifier()
		{
			Dispose(false /* disposing */);
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

			foreach (var asset in assets.Where(a => a.IsScript && !a.Minified))
			{
				string newContent = String.Empty;
				string assetPath = asset.Path;

				var jsParser = new JSParser(asset.Content)
				{
				    FileContext = assetPath
				};
				jsParser.CompilerError += ParserErrorHandler;

				try
				{
					Block block = jsParser.Parse(_jsParserConfiguration);
					if (block != null)
					{
						newContent = block.ToCode();
					}
				}
				catch (Exception e)
				{
				    throw new AssetMinificationException(
				        String.Format(MicrosoftAjaxStrings.Minifiers_MicrosoftAjaxMinificationFailed, 
							"JS", assetPath), e);
				}
				finally
				{
					jsParser.CompilerError -= ParserErrorHandler;
					jsParser.FileContext = null;
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
		/// <param name="args">A Microsoft.Ajax.Utilities.JScriptExceptionEventArgs that
		/// contains the event data</param>
		private void ParserErrorHandler(object source, JScriptExceptionEventArgs args)
		{
			ContextError error = args.Error;

			if (error.Severity <= Severity)
			{
				throw new MicrosoftAjaxParsingException(
					String.Format(MicrosoftAjaxStrings.Minifiers_MicrosoftAjaxMinificationSyntaxError,
						"JS", error.File, FormatContextError(error)), args.Exception);
			}
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

				_microsoftAjaxConfiguration = null;
				_jsParserConfiguration = null;
			}
		}
	}
}
