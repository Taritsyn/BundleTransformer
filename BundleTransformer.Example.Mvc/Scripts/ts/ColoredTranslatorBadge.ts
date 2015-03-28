/// <reference path="./jquery.d.ts" />
/// <reference path="./IColoredTranslatorBadge.d.ts" />
/// <reference path="./TranslatorBadge.ts" />

/** @namespace */
module TranslatorBadges {
	/**
	* Creates colored badge for translator
	*
	* @class
	* @export
	*/
    export class ColoredTranslatorBadge 
        extends TranslatorBadge 
        implements IColoredTranslatorBadge
    {
		/**
		* Gets a text color of badge
		*
		* @returns {String} - Text color of badge
		* @expose
		*/
        public getTextColor(): string {
            return this.$linkElem.css("color");
        }

		/**
		* Sets a text color of badge
		*
		* @param {String} color - Text color of badge
		* @returns {void}
		* @expose
		*/
        public setTextColor(color: string): void {
            this.$linkElem.css("color", color);
        }

		/**
		* Gets a border color of badge
		*
		* @returns {String} - Border color of badge
		* @expose
		*/
        public getBorderColor(): string {
            return this.$badgeElem.css("border-color");
        }

		/**
		* Sets a border color of badge
		*
		* @param {String} color - Border color of badge
		* @returns {void}
		* @expose
		*/
        public setBorderColor(color: string): void {
            this.$badgeElem.css("border-color", color);
        }
    }
}