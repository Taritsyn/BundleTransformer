/// <reference path="./jquery.d.ts" />
/// <reference path="./ITranslatorBadge.d.ts" />

module TranslatorBadges {
    /// <summary>
    /// Creates badge for translator
    /// </summary>
    export class TranslatorBadge implements ITranslatorBadge {
        public $badgeElem: any;
        public $linkElem: any;

        constructor (public elementId: string) {
            /// <summary>
            /// Constructs instance of translator badge
            /// </summary>
            /// <param name="elementId" type="String">
            /// Id of badge DOM-element
            /// </param>
            this.$badgeElem = jQuery("#" + elementId);
            this.$linkElem = this.$badgeElem.find("A:first");
        }

        public getText(): string {
            /// <summary>
            /// Gets a text of badge
            /// </summary>
            /// <returns type="String">
            /// Text of badge
            /// </returns>
            return this.$linkElem.text();
        }

        public setText(text: string): void {
            /// <summary>
            /// Sets a text of badge
            /// </summary>
            /// <param name="text" type="String">
            /// Text of badge
            /// </param>
            this.$linkElem.text(text);
        }

        public show(): void {
            /// <summary>
            /// Shows badge
            /// </summary>
            this.$badgeElem.show(0);
        }

        public hide(): void {
            /// <summary>
            /// Hides badge
            /// </summary>
            this.$badgeElem.hide(0);
        }
    }
}