namespace BundleTransformer.MicrosoftAjax.Minifiers
{
	using System.Collections.Generic;
	using System.Text;

	using Microsoft.Ajax.Utilities;

	using Core.Assets;
	using Core.Minifiers;
	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using BtOutputMode = OutputMode;
	using BtBlockStart = BlockStart;

	/// <summary>
	/// Base class of minifier, which produces minifiction of code 
	/// by using Microsoft Ajax Minifier
	/// </summary>
	public abstract class MicrosoftAjaxMinifierBase : IMinifier
	{
		/// <summary>
		/// Gets or sets whether embedded ASP.NET blocks (<code>&lt;% %&gt;</code>) 
		/// should be recognized and output as is
		/// </summary>
		public abstract bool AllowEmbeddedAspNetBlocks { get; set; }

		/// <summary>
		/// Gets or sets a value indicating whether the opening curly brace for blocks is
		/// on its own line (<code>NewLine</code>) or on the same line as 
		/// the preceding code (<code>SameLine</code>)
		/// or taking a hint from the source code position (UseSource).
		/// Only relevant when OutputMode is set to MultipleLines.
		/// </summary>
		public abstract BtBlockStart BlocksStartOnSameLine { get; set; }

		/// <summary>
		/// Gets or sets a flag for whether to ignore all errors found in the input code
		/// </summary>
		public abstract bool IgnoreAllErrors { get; set; }

		/// <summary>
		/// Gets or sets a string representation of the list of 
		/// debug lookups (comma-separated)
		/// </summary>
		public abstract string IgnoreErrorList { get; set; }

		/// <summary>
		/// Gets or sets a number of spaces per indent level when in 
		/// <code>MultipleLines</code> output mode
		/// </summary>
		public abstract int IndentSize { get; set; }

		/// <summary>
		/// Gets or sets the column position at which the line 
		/// will be broken at the next available opportunity
		/// </summary>
		public abstract int LineBreakThreshold { get; set; }

		/// <summary>
		/// Gets or sets a output mode:
		/// <code>SingleLine</code> - output all code on a single line;
		/// <code>MultipleLines</code> - break the output into multiple lines to be more human-readable
		/// </summary>
		public abstract BtOutputMode OutputMode { get; set; }

		/// <summary>
		/// Gets or sets a string representation of the list 
		/// of names defined for the preprocessor (comma-separated)
		/// </summary>
		public abstract string PreprocessorDefineList { get; set; }

		/// <summary>
		/// Gets or sets a flag for whether to add a semicolon 
		/// at the end of the parsed code
		/// </summary>
		public abstract bool TermSemicolons { get; set; }

		/// <summary>
		/// Gets or sets a severity level of errors
		///		0 - syntax error;
		///		1 - the programmer probably did not intend to do this;
		///		2 - this can lead to problems in the future;
		///		3 - this can lead to performance problems;
		///		4 - this is just not right
		/// </summary>
		public int Severity { get; set; }


		/// <summary>
		/// Produces code minifiction of asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset with minified text content</returns>
		public abstract IAsset Minify(IAsset asset);

		/// <summary>
		/// Produces code minifiction of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets with minified text content</returns>
		public abstract IList<IAsset> Minify(IList<IAsset> assets);

		/// <summary>
		/// Generates a detailed error message based on object ContextError
		/// </summary>
		/// <param name="error">Object ContextError</param>
		/// <returns>Detailed error message</returns>
		internal static string FormatContextError(ContextError error)
		{
			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, error.Message);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorCode, error.ErrorCode);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Severity, error.Severity);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Subcategory, error.Subcategory);
			if (!string.IsNullOrWhiteSpace(error.HelpKeyword))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_HelpKeyword, error.HelpKeyword);
			}
			if (!string.IsNullOrWhiteSpace(error.File))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, error.File);
			}
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_StartLine, error.StartLine);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_StartColumn, error.StartColumn);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_EndLine, error.EndLine);
			errorMessage.AppendFormat("{0}: {1}", CoreStrings.ErrorDetails_EndColumn, error.EndColumn);

			return errorMessage.ToString();
		}

		/// <summary>
		/// Maps a common settings
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="commonMinifierSettings">Common configuration settings of Microsoft Ajax Minifier</param>
		protected static void MapCommonSettings(MicrosoftAjaxMinifierBase minifier, 
			MinifierSettingsBase commonMinifierSettings)
		{
			minifier.AllowEmbeddedAspNetBlocks = commonMinifierSettings.AllowEmbeddedAspNetBlocks;
			minifier.BlocksStartOnSameLine = commonMinifierSettings.BlocksStartOnSameLine;
			minifier.IgnoreAllErrors = commonMinifierSettings.IgnoreAllErrors;
			minifier.IgnoreErrorList = commonMinifierSettings.IgnoreErrorList;
			minifier.IndentSize = commonMinifierSettings.IndentSize;
			minifier.LineBreakThreshold = commonMinifierSettings.LineBreakThreshold;
			minifier.OutputMode = commonMinifierSettings.OutputMode;
			minifier.PreprocessorDefineList = commonMinifierSettings.PreprocessorDefineList;
			minifier.TermSemicolons = commonMinifierSettings.TermSemicolons;
			minifier.Severity = commonMinifierSettings.Severity;
		}
	}
}