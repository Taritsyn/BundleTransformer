namespace BundleTransformer.Yui.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.Linq;
	using System.Text;

	using Yahoo.Yui.Compressor;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;
	
	using Configuration;
	using BtJsCompressionType = JavaScriptCompressionType;
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
		private readonly YuiSettings _yuiConfiguration;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;

		/// <summary>
		/// Gets or sets a type of compression JavaScript-code
		/// </summary>
		public BtJsCompressionType CompressionType
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow display informational messages and warnings
		/// </summary>
		public bool IsVerboseLogging
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow obfuscation of code
		/// </summary>
		public bool IsObfuscateJavascript
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to preserve unnecessary 
		/// semicolons (such as right before a '}')
		/// </summary>
		public bool PreserveAllSemicolons
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to disable all the built-in micro optimizations
		/// </summary>
		public bool DisableOptimizations
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to ignore when processing code, that 
		/// executed in eval operator
		/// </summary>
		public bool IsEvalIgnored
		{
			get;
			set;
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
		/// <param name="yuiConfiguration">Configuration settings of YUI Minifier</param>
		public YuiJsMinifier(YuiSettings yuiConfiguration)
		{
			_yuiConfiguration = yuiConfiguration;
			JsMinifierSettings jsMinifierConfiguration = _yuiConfiguration.JsMinifier;

			CompressionType = jsMinifierConfiguration.CompressionType;
			IsVerboseLogging = jsMinifierConfiguration.IsVerboseLogging;
			IsObfuscateJavascript = jsMinifierConfiguration.IsObfuscateJavascript;
			PreserveAllSemicolons = jsMinifierConfiguration.PreserveAllSemicolons;
			DisableOptimizations = jsMinifierConfiguration.DisableOptimizations;
			IsEvalIgnored = jsMinifierConfiguration.IsEvalIgnored;
			LineBreakPosition = jsMinifierConfiguration.LineBreakPosition;
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
				string newContent = String.Empty;
				string assetPath = asset.Path;

				try
				{
					newContent = JavaScriptCompressor.Compress(asset.Content, IsVerboseLogging, IsObfuscateJavascript,
					    PreserveAllSemicolons, DisableOptimizations, LineBreakPosition,
					    Encoding.UTF8, CultureInfo.InvariantCulture,
					    IsEvalIgnored,
					    EnumConverter.ConvertBtJsCompressionTypeToYuiJsCompressionType(CompressionType));
				}
				catch(Exception e)
				{
					throw new AssetMinificationException(
						String.Format(YuiStrings.Minifiers_YuiMinificationFailed, "JS", assetPath, e));
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
