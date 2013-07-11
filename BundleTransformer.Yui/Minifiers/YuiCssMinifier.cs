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

	/// <summary>
	/// Minifier, which produces minifiction of CSS-code 
	/// by using YUI Compressor for .NET
	/// </summary>
	public sealed class YuiCssMinifier : YuiMinifierBase
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "YUI CSS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// CSS-compressor
		/// </summary>
		private readonly CssCompressor _cssCompressor;

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
			_cssCompressor = new CssCompressor();

			CssMinifierSettings cssMinifierConfig = yuiConfig.CssMinifier;
			CompressionType = cssMinifierConfig.CompressionType;
			RemoveComments = cssMinifierConfig.RemoveComments;
			LineBreakPosition = cssMinifierConfig.LineBreakPosition;
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

			var assetsToProcessing = assets.Where(a => a.IsStylesheet && !a.Minified).ToList();
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
					newContent = _cssCompressor.Compress(asset.Content);
				}
				catch(Exception e)
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
	}
}
