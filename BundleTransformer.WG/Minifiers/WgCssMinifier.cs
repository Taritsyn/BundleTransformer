namespace BundleTransformer.WG.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.Linq;
	using System.Reflection;
	using System.Text;
	using System.Text.RegularExpressions;

	using WebGrease;
	using WebGrease.Configuration;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using Core.Utilities;
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
				@"(?<subcategory>.*?)\s*(?<errorCode>[A-Za-z]+\d+):\s*(?<message>.*?)$");

		/// <summary>
		/// Gets or sets a flag for whether to enable usual minification
		/// </summary>
		public bool ShouldMinify
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to eject the <code>@charset</code> rules before minification
		/// </summary>
		public bool EjectCharset
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
			: this(BundleTransformerContext.Current.Configuration.GetWgSettings())
		{ }

		/// <summary>
		/// Constructs instance of WebGrease Semantic CSS-minifier
		/// </summary>
		/// <param name="wgConfig">Configuration settings of WebGrease Minifier</param>
		public WgCssMinifier(WgSettings wgConfig)
		{
			CssMinifierSettings cssMinifierConfig = wgConfig.CssMinifier;
			ShouldMinify = cssMinifierConfig.ShouldMinify;
			EjectCharset = cssMinifierConfig.EjectCharset;

			_wgConfiguration = CreateWebGreaseConfiguration();
		}


		/// <summary>
		/// Produces code minifiction of CSS-asset by using WebGrease Semantic CSS-minifier
		/// </summary>
		/// <param name="asset">CSS-asset</param>
		/// <returns>CSS-asset with minified text content</returns>
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

			var wgCssMinifier = new CssMinifier(new WebGreaseContext(_wgConfiguration))
			{
				ShouldMinify = ShouldMinify
			};

			InnerMinify(asset, wgCssMinifier);

			return asset;
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
				InnerMinify(asset, wgCssMinifier);
			}

			return assets;
		}

		private void InnerMinify(IAsset asset, CssMinifier wgCssMinifier)
		{
			string content = asset.Content;
			string topCharset = string.Empty;
			string preprocessedContent = content;
			if (EjectCharset)
			{
				preprocessedContent = EjectCssCharset(preprocessedContent, ref topCharset);
			}
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = wgCssMinifier.Minify(preprocessedContent);
				if (EjectCharset && !string.IsNullOrWhiteSpace(topCharset))
				{
					string separator = ShouldMinify ? string.Empty : Environment.NewLine;
					newContent = topCharset + separator + newContent;
				}

				IList<string> errors = wgCssMinifier.Errors;
				if (errors.Count > 0)
				{
					throw new WgMinificationException(FormatErrorDetails(errors[0], preprocessedContent, assetUrl));
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
		/// Ejects a <code>@charset</code> rules
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="topCharset">Processed top <code>@charset</code> rule</param>
		/// <returns>Text content of CSS-asset without <code>@charset</code> rules</returns>
		private static string EjectCssCharset(string content, ref string topCharset)
		{
			int contentLength = content.Length;
			if (contentLength == 0)
			{
				return content;
			}

			MatchCollection charsetRuleMatches = CommonRegExps.CssCharsetRuleRegex.Matches(content);
			if (charsetRuleMatches.Count == 0)
			{
				return content;
			}

			var nodeMatches = new List<CssNodeMatch>();

			foreach (Match charsetRuleMatch in charsetRuleMatches)
			{
				var nodeMatch = new CssNodeMatch(charsetRuleMatch.Index,
					charsetRuleMatch.Length,
					CssNodeType.CharsetRule,
					charsetRuleMatch);
				nodeMatches.Add(nodeMatch);
			}

			MatchCollection multilineCommentMatches = CommonRegExps.CssMultilineCommentRegex.Matches(content);

			foreach (Match multilineCommentMatch in multilineCommentMatches)
			{
				var nodeMatch = new CssNodeMatch(multilineCommentMatch.Index,
					multilineCommentMatch.Length,
					CssNodeType.MultilineComment,
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

			foreach (CssNodeMatch nodeMatch in nodeMatches)
			{
				CssNodeType nodeType = nodeMatch.NodeType;
				int nodePosition = nodeMatch.Position;
				Match match = nodeMatch.Match;

				if (nodePosition < currentPosition)
				{
					continue;
				}

				if (nodeType == CssNodeType.MultilineComment)
				{
					int nextPosition = nodePosition + match.Length;

					ProcessOtherContent(contentBuilder, content,
						ref currentPosition, nextPosition);
				}
				else if (nodeType == CssNodeType.CharsetRule)
				{
					ProcessOtherContent(contentBuilder, content,
						ref currentPosition, nodePosition);

					string charset = match.Groups["charset"].Value;

					string charsetRule = match.Value;
					if (string.IsNullOrWhiteSpace(topCharset))
					{
						topCharset = string.Format(@"@charset ""{0}"";", charset);
					}

					currentPosition += charsetRule.Length;
				}
			}

			if (currentPosition > 0 && currentPosition <= endPosition)
			{
				ProcessOtherContent(contentBuilder, content,
					ref currentPosition, endPosition + 1);
			}

			return contentBuilder.ToString();
		}

		/// <summary>
		/// Process a other stylesheet content
		/// </summary>
		/// <param name="contentBuilder">Content builder</param>
		/// <param name="assetContent">Text content of CSS-asset</param>
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
					severity.ToString(CultureInfo.InvariantCulture));
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Subcategory, 
					subcategory);
				if (!string.IsNullOrWhiteSpace(file))
				{
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, file);
				}
				if (lineNumber > 0)
				{
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
						lineNumber.ToString(CultureInfo.InvariantCulture));
				}
				if (columnNumber > 0)
				{
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
						columnNumber.ToString(CultureInfo.InvariantCulture));
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