namespace BundleTransformer.Yui.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.Linq;
	using System.Text;

	using EcmaScript.NET;
	using Yahoo.Yui.Compressor;
	using YuiCompressionType = Yahoo.Yui.Compressor.CompressionType;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;
	
	using Configuration;
	using BtCompressionType = CompressionType;
	using YuiStrings = Resources.Strings;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using YUI Compressor for .NET
	/// </summary>
	public sealed class YuiJsMinifier : YuiMinifierBase
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "YUI JS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";

		/// <summary>
		/// JS-compressor
		/// </summary>
		private readonly JavaScriptCompressor _jsCompressor;

		/// <summary>
		/// Gets or sets a code compression type
		/// </summary>
		public override BtCompressionType CompressionType
		{
			get
			{
				return Utils.GetEnumFromOtherEnum<YuiCompressionType, BtCompressionType>(_jsCompressor.CompressionType);
			}
			set
			{
				_jsCompressor.CompressionType = Utils.GetEnumFromOtherEnum<BtCompressionType, YuiCompressionType>(value);
			}
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow obfuscation of code
		/// </summary>
		public bool ObfuscateJavascript
		{
			get { return _jsCompressor.ObfuscateJavascript; }
			set { _jsCompressor.ObfuscateJavascript = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to preserve unnecessary 
		/// semicolons (such as right before a '}')
		/// </summary>
		public bool PreserveAllSemicolons
		{
			get { return _jsCompressor.PreserveAllSemicolons; }
			set { _jsCompressor.PreserveAllSemicolons = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable all the built-in micro optimizations
		/// </summary>
		public bool DisableOptimizations
		{
			get { return _jsCompressor.DisableOptimizations; }
			set { _jsCompressor.DisableOptimizations = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to ignore when processing code, that 
		/// executed in eval operator
		/// </summary>
		public bool IgnoreEval
		{
			get { return _jsCompressor.IgnoreEval; }
			set { _jsCompressor.IgnoreEval = value; }
		}

		/// <summary>
		/// Gets or sets a severity level of errors
		///		0 - only syntax error messages;
		///		1 - only syntax error messages and warnings.
		/// </summary>
		public int Severity
		{
			get
			{
				return (_jsCompressor.LoggingType == LoggingType.Debug) ? 1 : 0;
			}
			set
			{
				_jsCompressor.LoggingType = (value == 1) ? LoggingType.Debug : LoggingType.None;
			}
		}

		/// <summary>
		/// Gets or sets a column number, after which must be inserted a line break.
		/// Specify 0 to get a line break after each semi-colon in JavaScript.
		/// </summary>
		public override int LineBreakPosition
		{
			get { return _jsCompressor.LineBreakPosition; }
			set { _jsCompressor.LineBreakPosition = value; }
		}

		/// <summary>
		/// Gets or sets the type of Encoding.
		/// Eg. ASCII, BigEndianUnicode, Unicode, UTF32, UTF7, UTF8.
		/// </summary>
		public Encoding Encoding
		{
			get { return _jsCompressor.Encoding; }
			set { _jsCompressor.Encoding = value; }
		}

		/// <summary>
		/// Gets or sets the culture you want the thread to run under. 
		/// This affects the treatment of numbers etc - e.g. 9.00 could be output as 9,00
		/// (this is mainly for non English OS's)/
		/// </summary>
		public CultureInfo ThreadCulture
		{
			get { return _jsCompressor.ThreadCulture; }
			set { _jsCompressor.ThreadCulture = value; }
		}


		/// <summary>
		/// Constructs instance of YUI JS-minifier
		/// </summary>
		public YuiJsMinifier()
			: this(BundleTransformerContext.Current.GetYuiConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of YUI JS-minifier
		/// </summary>
		/// <param name="yuiConfig">Configuration settings of YUI Minifier</param>
		public YuiJsMinifier(YuiSettings yuiConfig)
		{
			_jsCompressor = new JavaScriptCompressor();

			JsMinifierSettings jsMinifierConfig = yuiConfig.JsMinifier;
			CompressionType = jsMinifierConfig.CompressionType;
			ObfuscateJavascript = jsMinifierConfig.ObfuscateJavascript;
			PreserveAllSemicolons = jsMinifierConfig.PreserveAllSemicolons;
			DisableOptimizations = jsMinifierConfig.DisableOptimizations;
			IgnoreEval = jsMinifierConfig.IgnoreEval;
			LineBreakPosition = jsMinifierConfig.LineBreakPosition;
			Encoding = ParseEncoding(jsMinifierConfig.Encoding);
			ThreadCulture = ParseThreadCulture(jsMinifierConfig.ThreadCulture);
			Severity = jsMinifierConfig.Severity;
		}


		/// <summary>
		/// Produces code minifiction of JS-assets by using YUI Compressor for .NET
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
				string assetVirtualPath = asset.VirtualPath;

				try
				{
					newContent = _jsCompressor.Compress(asset.Content);

					var errorReporter = _jsCompressor.ErrorReporter as CustomErrorReporter;
					if (errorReporter != null && errorReporter.ErrorMessages.Count > 0)
					{
						var errorMessage = new StringBuilder();
						foreach(var errorDetail in errorReporter.ErrorMessages)
						{
							errorMessage.AppendLine(errorDetail);
							errorMessage.AppendLine();
						}

						errorReporter.ErrorMessages.Clear();

						throw new YuiCompressingException(errorMessage.ToString());
					}
				}
				catch (EcmaScriptRuntimeException e)
				{
					throw new AssetMinificationException(
						string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
							CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message), e);
				}
				catch (EcmaScriptException e)
				{
					throw new AssetMinificationException(
						string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
							CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message), e);
				}
				catch (YuiCompressingException e)
				{
					throw new AssetMinificationException(
						string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
							CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message), e);
				}
				catch (Exception e)
				{
					throw new AssetMinificationException(
						string.Format(CoreStrings.Minifiers_MinificationFailed,
							CODE_TYPE, assetVirtualPath, MINIFIER_NAME, e.Message), e);
				}

				asset.Content = newContent;
				asset.Minified = true;
			}

			return assets;
		}

		/// <summary>
		/// Parses a encoding type
		/// </summary>
		/// <param name="encoding">String representation of the encoding type</param>
		/// <returns>Encoding type</returns>
		private static Encoding ParseEncoding(string encoding)
		{
			if (string.IsNullOrWhiteSpace(encoding))
			{
				return Encoding.Default;
			}

			Encoding convertedEncoding;

			switch (encoding.ToLowerInvariant())
			{
				case "ascii":
					convertedEncoding = Encoding.ASCII;
					break;
				case "bigendianunicode":
					convertedEncoding = Encoding.BigEndianUnicode;
					break;
				case "unicode":
					convertedEncoding = Encoding.Unicode;
					break;
				case "utf32":
				case "utf-32":
					convertedEncoding = Encoding.UTF32;
					break;
				case "utf7":
				case "utf-7":
					convertedEncoding = Encoding.UTF7;
					break;
				case "utf8":
				case "utf-8":
					convertedEncoding = Encoding.UTF8;
					break;
				case "default":
					convertedEncoding = Encoding.Default;
					break;
				default:
					throw new ArgumentException(
						string.Format(YuiStrings.Minifiers_InvalidEncoding, encoding), "encoding");
			}

			return convertedEncoding;
		}

		/// <summary>
		/// Parses a thread culture
		/// </summary>
		/// <param name="threadCulture">String representation of the thread culture</param>
		/// <returns>Thread culture</returns>
		private static CultureInfo ParseThreadCulture(string threadCulture)
		{
			if (string.IsNullOrWhiteSpace(threadCulture))
			{
				return CultureInfo.InvariantCulture;
			}

			CultureInfo convertedThreadCulture;

			try
			{
				switch (threadCulture.ToLowerInvariant())
				{
					case "iv":
					case "ivl":
					case "invariantculture":
					case "invariant culture":
					case "invariant language":
					case "invariant language (invariant country)":
					{
						convertedThreadCulture = CultureInfo.InvariantCulture;
						break;
					}
					default:
					{
						convertedThreadCulture = CultureInfo.CreateSpecificCulture(threadCulture);
						break;
					}
				}
			}
			catch
			{
				throw new ArgumentException(
					string.Format(YuiStrings.Minifiers_InvalidThreadCulture, threadCulture), "threadCulture");
			}

			return convertedThreadCulture;
		}
	}
}
