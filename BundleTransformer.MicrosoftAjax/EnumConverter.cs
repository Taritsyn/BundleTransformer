namespace BundleTransformer.MicrosoftAjax
{
	using System;

	using MsCssColor = Microsoft.Ajax.Utilities.CssColor;
	using MsCssComment = Microsoft.Ajax.Utilities.CssComment;
	using MsOutputMode = Microsoft.Ajax.Utilities.OutputMode;
	using MsEvalTreatment = Microsoft.Ajax.Utilities.EvalTreatment;
	using MsLocalRenaming = Microsoft.Ajax.Utilities.LocalRenaming;

	using Core.Resources;

	using BtCssColor = CssColor;
	using BtCssComment = CssComment;
	using BtOutputMode = OutputMode;
	using BtEvalTreatment = EvalTreatment;
	using BtLocalRenaming = LocalRenaming;

	internal static class EnumConverter
	{
		internal static MsCssColor ConvertBtCssColorToMsCssColor(BtCssColor btCssColor)
		{
			MsCssColor msCssColor;

			switch(btCssColor)
			{
				case BtCssColor.Hex:
					msCssColor = MsCssColor.Hex;
					break;
				case BtCssColor.Major:
					msCssColor = MsCssColor.Major;
					break;
				case BtCssColor.Strict:
					msCssColor = MsCssColor.Strict;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							btCssColor, typeof(BtCssColor), typeof(MsCssColor))
					);
			}

			return msCssColor;
		}

		internal static BtCssColor ConvertMsCssColorToBtCssColor(MsCssColor msCssColor)
		{
			BtCssColor btCssColor;

			switch(msCssColor)
			{
				case MsCssColor.Hex:
					btCssColor = BtCssColor.Hex;
					break;
				case MsCssColor.Major:
					btCssColor = BtCssColor.Major;
					break;
				case MsCssColor.Strict:
					btCssColor = BtCssColor.Strict;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							msCssColor, typeof(MsCssColor), typeof(BtCssColor))
					);
			}

			return btCssColor;
		}

		internal static MsCssComment ConvertBtCssCommentToMsCssComment(BtCssComment btCssComment)
		{
			MsCssComment msCssComment;

			switch(btCssComment)
			{
				case BtCssComment.All:
					msCssComment = MsCssComment.All;
					break;
				case BtCssComment.Hacks:
					msCssComment = MsCssComment.Hacks;
					break;
				case BtCssComment.Important:
					msCssComment = MsCssComment.Important;
					break;
				case BtCssComment.None:
					msCssComment = MsCssComment.None;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							btCssComment, typeof(BtCssComment), typeof(MsCssComment))
					);
			}

			return msCssComment;
		}

		internal static BtCssComment ConvertMsCssCommentToBtCssComment(MsCssComment msCssComment)
		{
			BtCssComment btCssComment;

			switch(msCssComment)
			{
				case MsCssComment.All:
					btCssComment = BtCssComment.All;
					break;
				case MsCssComment.Hacks:
					btCssComment = BtCssComment.Hacks;
					break;
				case MsCssComment.Important:
					btCssComment = BtCssComment.Important;
					break;
				case MsCssComment.None:
					btCssComment = BtCssComment.None;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							msCssComment, typeof(MsCssComment), typeof(BtCssComment))
					);
			}

			return btCssComment;
		}

		internal static MsOutputMode ConvertBtOutputModeToMsOutputMode(BtOutputMode btOutputMode)
		{
			MsOutputMode msOutputMode;

			switch(btOutputMode)
			{
				case BtOutputMode.MultipleLines:
					msOutputMode = MsOutputMode.MultipleLines;
					break;
				case BtOutputMode.SingleLine:
					msOutputMode = MsOutputMode.SingleLine;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							btOutputMode, typeof(BtOutputMode), typeof(MsOutputMode))
					);
			}

			return msOutputMode;
		}

		internal static BtOutputMode ConvertMsOutputModeToBtOutputMode(MsOutputMode msOutputMode)
		{
			BtOutputMode btOutputMode;

			switch(msOutputMode)
			{
				case MsOutputMode.MultipleLines:
					btOutputMode = BtOutputMode.MultipleLines;
					break;
				case MsOutputMode.SingleLine:
					btOutputMode = BtOutputMode.SingleLine;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							msOutputMode, typeof(MsOutputMode), typeof(BtOutputMode))
					);
			}

			return btOutputMode;
		}

		internal static MsEvalTreatment ConvertBtEvalTreatmentToMsEvalTreatment(BtEvalTreatment btEvalTreatment)
		{
			MsEvalTreatment msEvalTreatment;

			switch(btEvalTreatment)
			{
				case BtEvalTreatment.Ignore:
					msEvalTreatment = MsEvalTreatment.Ignore;
					break;
				case BtEvalTreatment.MakeAllSafe:
					msEvalTreatment = MsEvalTreatment.MakeAllSafe;
					break;
				case BtEvalTreatment.MakeImmediateSafe:
					msEvalTreatment = MsEvalTreatment.MakeImmediateSafe;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							btEvalTreatment, typeof(BtEvalTreatment), typeof(MsEvalTreatment))
					);
			}

			return msEvalTreatment;
		}

		internal static BtEvalTreatment ConvertMsEvalTreatmentToBtEvalTreatment(MsEvalTreatment msEvalTreatment)
		{
			BtEvalTreatment btEvalTreatment;

			switch(msEvalTreatment)
			{
				case MsEvalTreatment.Ignore:
					btEvalTreatment = BtEvalTreatment.Ignore;
					break;
				case MsEvalTreatment.MakeAllSafe:
					btEvalTreatment = BtEvalTreatment.MakeAllSafe;
					break;
				case MsEvalTreatment.MakeImmediateSafe:
					btEvalTreatment = BtEvalTreatment.MakeImmediateSafe;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							msEvalTreatment, typeof(MsEvalTreatment), typeof(BtEvalTreatment))
					);
			}

			return btEvalTreatment;
		}

		internal static BtLocalRenaming ConvertMsLocalRenamingToBtLocalRenaming(MsLocalRenaming msLocalRenaming)
		{
			BtLocalRenaming btLocalRenaming;

			switch(msLocalRenaming)
			{
				case MsLocalRenaming.CrunchAll:
					btLocalRenaming = BtLocalRenaming.CrunchAll;
					break;
				case MsLocalRenaming.KeepAll:
					btLocalRenaming = BtLocalRenaming.KeepAll;
					break;
				case MsLocalRenaming.KeepLocalizationVars:
					btLocalRenaming = BtLocalRenaming.KeepLocalizationVars;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							msLocalRenaming, typeof(MsLocalRenaming), typeof(BtLocalRenaming))
					);
			}

			return btLocalRenaming;
		}

		internal static MsLocalRenaming ConvertBtLocalRenamingToMsLocalRenaming(BtLocalRenaming btLocalRenaming)
		{
			MsLocalRenaming msLocalRenaming;

			switch(btLocalRenaming)
			{
				case BtLocalRenaming.CrunchAll:
					msLocalRenaming = MsLocalRenaming.CrunchAll;
					break;
				case BtLocalRenaming.KeepAll:
					msLocalRenaming = MsLocalRenaming.KeepAll;
					break;
				case BtLocalRenaming.KeepLocalizationVars:
					msLocalRenaming = MsLocalRenaming.KeepLocalizationVars;
					break;
				default:
					throw new InvalidCastException(
						String.Format(Strings.Common_EnumValueConversionFailed,
							btLocalRenaming, typeof(BtLocalRenaming), typeof(MsLocalRenaming))
					);
			}

			return msLocalRenaming;
		}
	}
}