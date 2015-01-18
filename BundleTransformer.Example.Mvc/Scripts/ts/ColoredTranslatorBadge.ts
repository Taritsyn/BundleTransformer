/// <reference path="./jquery.d.ts" />
/// <reference path="./IColoredTranslatorBadge.d.ts" />
/// <reference path="./TranslatorBadge.ts" />

module TranslatorBadges {
    /// <summary>
    /// Creates colored badge for translator
    /// </summary>
    export class ColoredTranslatorBadge 
        extends TranslatorBadge 
        implements IColoredTranslatorBadge
    {
        public getTextColor(): string {
            /// <summary>
            /// Gets a text color of badge
            /// </summary>
            /// <returns type="String">
            /// Text color of badge
            /// </returns>
            return this.$linkElem.css("color");
        }

        public setTextColor(color: string): void {
            /// <summary>
            /// Sets a text color of badge
            /// </summary>
            /// <param name="color" type="String">
            /// Text color of badge
            /// </param>
            this.$linkElem.css("color", color);
        }

        public getBorderColor(): string {
            /// <summary>
            /// Gets a border color of badge
            /// </summary>
            /// <returns type="String">
            /// Border color of badge
            /// </returns>
            return this.$badgeElem.css("border-color");
        }

        public setBorderColor(color: string): void {
            /// <summary>
            /// Sets a border color of badge
            /// </summary>
            /// <param name="color" type="String">
            /// Border color of badge
            /// </param>
            this.$badgeElem.css("border-color", color);
        }
    }
}