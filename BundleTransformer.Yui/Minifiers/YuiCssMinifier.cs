namespace BundleTransformer.Yui.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

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
	/// Minifier, which produces minifiction of CSS-code 
	/// by using YUI Compressor for .NET
	/// </summary>
	public sealed class YuiCssMinifier : YuiMinifierBase
	{
		/// <summary>
		/// Configuration settings of YUI Minifier
		/// </summary>
		private readonly YuiSettings _yuiConfig;

		/// <summary>
		/// CSS-compressor
		/// </summary>
		private readonly CssCompressor _cssCompressor;

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
				return Utils.GetEnumFromOtherEnum<YuiCompressionType, BtCompressionType>(_cssCompressor.CompressionType);
			}
			set
			{
				_cssCompressor.CompressionType = Utils.GetEnumFromOtherEnum<BtCompressionType, YuiCompressionType>(value);
			}
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove all comments 
		/// except "important" comments
		/// </summary>
		public bool RemoveComments
		{
			get { return _cssCompressor.RemoveComments; }
			set { _cssCompressor.RemoveComments = value; }
		}

		/// <summary>
		/// Gets or sets a column number, after which must be inserted a line break.
		/// Specify 0 to get a line break after each rule in CSS.
		/// </summary>
		public override int LineBreakPosition
		{
			get { return _cssCompressor.LineBreakPosition; }
			set { _cssCompressor.LineBreakPosition = value; }
		}


		/// <summary>
		/// Constructs instance of YUI CSS-minifier
		/// </summary>
		public YuiCssMinifier() 
			: this(BundleTransformerContext.Current.GetYuiConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of YUI CSS-minifier
		/// </summary>
		/// <param name="yuiConfig">Configuration settings of YUI Minifier</param>
		public YuiCssMinifier(YuiSettings yuiConfig)
		{
			_yuiConfig = yuiConfig;
			_cssCompressor = new CssCompressor();

			CssMinifierSettings cssMinifierConfig = _yuiConfig.CssMinifier;
			CompressionType = cssMinifierConfig.CompressionType;
			RemoveComments = cssMinifierConfig.RemoveComments;
			LineBreakPosition = cssMinifierConfig.LineBreakPosition;
		}

		/// <summary>
		/// Destructs instance of YUI CSS-minifier
		/// </summary>
		~YuiCssMinifier()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Produces code minifiction of CSS-assets by using YUI Compressor for .NET
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of CSS-assets with minified text content</returns>
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
			
			foreach (var asset in assets.Where(a => a.IsStylesheet && !a.Minified))
			{
				string newContent = string.Empty;
				string assetPath = asset.Path;

				try
				{
					newContent = _cssCompressor.Compress(asset.Content);
				}
				catch(Exception e)
				{
					throw new AssetMinificationException(
						string.Format(YuiStrings.Minifiers_YuiMinificationFailed, "CSS", assetPath, e));
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
