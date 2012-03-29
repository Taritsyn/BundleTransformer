namespace BundleTransformer.Yui.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Yahoo.Yui.Compressor;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using BtCssCompressionType = CssCompressionType;
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
		private readonly YuiSettings _yuiConfiguration;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;

		/// <summary>
		/// Gets or sets a type of compression CSS-code
		/// </summary>
		public BtCssCompressionType CompressionType
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove all comments 
		/// except "important" comments
		/// </summary>
		public bool RemoveComments
		{
			get;
			set;
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
		/// <param name="yuiConfiguration">Configuration settings of YUI Minifier</param>
		public YuiCssMinifier(YuiSettings yuiConfiguration)
		{
			_yuiConfiguration = yuiConfiguration;
			CssMinifierSettings cssMinifierConfiguration = _yuiConfiguration.CssMinifier;

			CompressionType = cssMinifierConfiguration.CompressionType;
			RemoveComments = cssMinifierConfiguration.RemoveComments;
			LineBreakPosition = cssMinifierConfiguration.LineBreakPosition;
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
				string newContent = String.Empty;
				string assetPath = asset.Path;

				try
				{
					newContent = CssCompressor.Compress(asset.Content, LineBreakPosition,
						EnumConverter.ConvertBtCssCompressionTypeToYuiCssCompressionType(CompressionType),
						RemoveComments);
				}
				catch(Exception e)
				{
					throw new AssetMinificationException(
						String.Format(YuiStrings.Minifiers_YuiMinificationFailed, "CSS", assetPath, e));
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
