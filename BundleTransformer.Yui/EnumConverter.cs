namespace BundleTransformer.Yui
{
	using System;

	using YuiCssCompressionType = Yahoo.Yui.Compressor.CssCompressionType;
	using YuiJsCompressionType = Yahoo.Yui.Compressor.JavaScriptCompressionType;

	using Core.Resources;

	using BtCssCompressionType = CssCompressionType;
	using BtJsCompressionType = JavaScriptCompressionType;

	internal static class EnumConverter
	{
		internal static YuiCssCompressionType ConvertBtCssCompressionTypeToYuiCssCompressionType(
			BtCssCompressionType btCssCompressionType)
		{
			YuiCssCompressionType yuiCssCompressionType;

			switch (btCssCompressionType)
			{
				case BtCssCompressionType.None:
					yuiCssCompressionType = YuiCssCompressionType.None;
					break;
				case BtCssCompressionType.Hybrid:
					yuiCssCompressionType = YuiCssCompressionType.Hybrid;
					break;
				case BtCssCompressionType.MichaelAshRegexEnhancements:
					yuiCssCompressionType = YuiCssCompressionType.MichaelAshRegexEnhancements;
					break;
				case BtCssCompressionType.StockYuiCompressor:
					yuiCssCompressionType = YuiCssCompressionType.StockYuiCompressor;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							btCssCompressionType, typeof(BtCssCompressionType), typeof(YuiCssCompressionType))
					);
			}

			return yuiCssCompressionType;
		}

		internal static YuiJsCompressionType ConvertBtJsCompressionTypeToYuiJsCompressionType(
			BtJsCompressionType btJsCompressionType)
		{
			YuiJsCompressionType yuiJsCompressionType;

			switch (btJsCompressionType)
			{
				case BtJsCompressionType.None:
					yuiJsCompressionType = YuiJsCompressionType.None;
					break;
				case BtJsCompressionType.YuiStockCompression:
					yuiJsCompressionType = YuiJsCompressionType.YuiStockCompression;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							btJsCompressionType, typeof(BtJsCompressionType), typeof(YuiJsCompressionType))
					);
			}

			return yuiJsCompressionType;
		}
	}
}
