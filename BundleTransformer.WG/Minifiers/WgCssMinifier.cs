namespace BundleTransformer.WG.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Reflection;
	using System.Text;
	using System.Text.RegularExpressions;

	using WebGrease;
	using WebGrease.Configuration;

	using Core;
	using Core.Assets;
	using Core.Helpers;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;

	/// <summary>
	/// Minifier, which produces minifiction of CSS-code 
	/// by using WebGrease Semantic CSS-minifier
	/// </summary>
	public sealed class WgCssMinifier : IMinifier
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "WebGrease Semantic CSS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Information about the constructor of 
		/// <code>WebGrease.Configuration.WebGreaseConfiguration</code> class
		/// </summary>
		private static readonly ConstructorInfo _wgConfigurationConstructorInfo;

		/// <summary>
		/// Instance of <code>WebGrease.Configuration.WebGreaseConfiguration</code> class
		/// </summary>
		private readonly WebGreaseConfiguration _wgConfiguration;

		/// <summary>
		/// Regular expression for working with the string representation of error
		/// </summary>
		private static readonly Regex _errorStringRegex =
			new Regex(@"^\((?<lineNumber>\d+),\s*(?<columnNumber>\d+)\):\s*" +
				@"(?<subcategory>.*?)\s*(?<errorCode>[A-Za-z]+\d+):\s*(?<message>.*?)$", RegexOptions.Compiled);

		/// <summary>
		/// Gets or sets a flag for whether to enable usual minification
		/// </summary>
		public bool ShouldMinify
		{
			get;
			set;
		}

		
		/// <summary>
		/// Loads a information about <code>WebGrease.Configuration.WebGreaseConfiguration</code> type
		/// </summary>
		static WgCssMinifier()
		{
			Type wgConfigurationType = typeof(WebGreaseConfiguration);
			_wgConfigurationConstructorInfo = wgConfigurationType.GetConstructor(
				BindingFlags.NonPublic | BindingFlags.Instance,
				null, new Type[0], null);
		}

		/// <summary>
		/// Constructs instance of WebGrease Semantic CSS-minifier
		/// </summary>
		public WgCssMinifier()
			: this(BundleTransformerContext.Current.GetWgConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of WebGrease Semantic CSS-minifier
		/// </summary>
		/// <param name="wgConfig">Configuration settings of WebGrease Minifier</param>
		public WgCssMinifier(WgSettings wgConfig)
		{
			ShouldMinify = wgConfig.CssMinifier.ShouldMinify;

			_wgConfiguration = CreateWebGreaseConfiguration();
		}


		/// <summary>
		/// Produces code minifiction of CSS-assets by using WebGrease Semantic CSS-minifier
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of CSS-assets with minified text content</returns>
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

			var assetsToProcessing = assets.Where(a => a.IsStylesheet && !a.Minified).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			var wgCssMinifier = new CssMinifier(new WebGreaseContext(_wgConfiguration))
			{
				ShouldMinify = ShouldMinify
			};

			foreach (var asset in assetsToProcessing)
			{
				string content = asset.Content;
				string newContent;
				string assetUrl = asset.Url;

				try
				{
					newContent = wgCssMinifier.Minify(content);

					IList<string> errors = wgCssMinifier.Errors;
					if (errors.Count > 0)
					{
						throw new WgMinificationException(FormatErrorDetails(errors[0], content, assetUrl));
					}
				}
				catch (WgMinificationException e)
				{
					throw new AssetMinificationException(
						string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
							CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message));
				}
				catch (Exception e)
				{
					throw new AssetMinificationException(
						string.Format(CoreStrings.Minifiers_MinificationFailed,
							CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message), e);
				}

				asset.Content = newContent;
				asset.Minified = true;
			}

			return assets;
		}

		/// <summary>
		/// Creates a instance of <code>WebGrease.Configuration.WebGreaseConfiguration</code> class
		/// </summary>
		/// <returns>Instance of <code>WebGrease.Configuration.WebGreaseConfiguration</code> class</returns>
		private static WebGreaseConfiguration CreateWebGreaseConfiguration()
		{
			object wgConfigurationObj = _wgConfigurationConstructorInfo.Invoke(null);

			return (WebGreaseConfiguration)wgConfigurationObj;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">String representation of error</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current CSS-file</param>
		/// <rereturns>Detailed error message</rereturns>
		private static string FormatErrorDetails(string errorDetails, string sourceCode, string currentFilePath)
		{
			string errorMessage;

			Match errorStringMatch = _errorStringRegex.Match(errorDetails);
			if (errorStringMatch.Success)
			{
				GroupCollection errorStringGroups = errorStringMatch.Groups;

				string message = errorStringGroups["message"].Value;
				string errorCode = errorStringGroups["errorCode"].Value;
				const int severity = 0;
				string subcategory = errorStringGroups["subcategory"].Value;
				string file = currentFilePath;
				int lineNumber = int.Parse(errorStringGroups["lineNumber"].Value);
				int columnNumber = int.Parse(errorStringGroups["columnNumber"].Value) + 1;
				string sourceFragment = SourceCodeNavigator.GetSourceFragment(sourceCode,
					new SourceCodeNodeCoordinates(lineNumber, columnNumber));

				var errorMessageBuilder = new StringBuilder();
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, 
					message);
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorCode, 
					errorCode);
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Severity, 
					severity.ToString());
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Subcategory, 
					subcategory);
				if (!string.IsNullOrWhiteSpace(file))
				{
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, file);
				}
				if (lineNumber > 0)
				{
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
						lineNumber.ToString());
				}
				if (columnNumber > 0)
				{
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
						columnNumber.ToString());
				}
				if (!string.IsNullOrWhiteSpace(sourceFragment))
				{
					errorMessageBuilder.AppendFormatLine("{1}:{0}{0}{2}", Environment.NewLine,
						CoreStrings.ErrorDetails_SourceError, sourceFragment);
				}

				errorMessage = errorMessageBuilder.ToString();
			}
			else
			{
				errorMessage = errorDetails;
			}

			return errorMessage;
		}
	}
}