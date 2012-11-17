/// <reference path="./ITranslatorBadge.d.ts" />

module TranslatorBadges {
    export interface IColoredTranslatorBadge extends ITranslatorBadge {
        getTextColor(): string;
        setTextColor(color: string): void;
        getBorderColor(): string;
        setBorderColor(color: string);
    }
}