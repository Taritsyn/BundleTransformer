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
		/// Configuration settings of YUI Minifier
		/// </summary>
		private readonly YuiSettings _yuiConfig;

		/// <summary>
		/// JS-compressor
		/// </summary>
		private readonly JavaScriptCompressor _jsCompressor;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;

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
			_yuiConfig = yuiConfig;
			_jsCompressor = new JavaScriptCompressor
			{
				Encoding = Encoding.UTF8,
				ThreadCulture = CultureInfo.InvariantCulture
			};

			JsMinifierSettings jsMinifierConfig = _yuiConfig.JsMinifier;
			CompressionType = jsMinifierConfig.CompressionType;
			ObfuscateJavascript = jsMinifierConfig.ObfuscateJavascript;
			PreserveAllSemicolons = jsMinifierConfig.PreserveAllSemicolons;
			DisableOptimizations = jsMinifierConfig.DisableOptimizations;
			IgnoreEval = jsMinifierConfig.IgnoreEval;
			LineBreakPosition = jsMinifierConfig.LineBreakPosition;
			Severity = jsMinifierConfig.Severity;
		}

		/// <summary>
		/// Destructs instance of YUI JS-minifier
		/// </summary>
		~YuiJsMinifier()
		{
			Dispose(false /* disposing */);
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

			foreach (var asset in assets.Where(a => a.IsScript && !a.Minified))
			{
				string newContent = string.Empty;
				string assetPath = asset.Path;

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
						string.Format(YuiStrings.Minifiers_YuiMinificationSyntaxError, "JS", assetPath, e.Message), e);
				}
				catch (EcmaScriptException e)
				{
					throw new AssetMinificationException(
						string.Format(YuiStrings.Minifiers_YuiMinificationSyntaxError, "JS", assetPath, e.Message), e);
				}
				catch (YuiCompressingException e)
				{
					throw new AssetMinificationException(
						string.Format(YuiStrings.Minifiers_YuiMinificationSyntaxError, "JS", assetPath, e.Message), e);
				}
				catch (Exception e)
				{
					throw new AssetMinificationException(
						string.Format(YuiStrings.Minifiers_YuiMinificationFailed, "JS", assetPath, e));
				}

				asset.Content = newContent;
				asset.Minified = true;
			}

			return assets;
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
			}
		}
	}
}
