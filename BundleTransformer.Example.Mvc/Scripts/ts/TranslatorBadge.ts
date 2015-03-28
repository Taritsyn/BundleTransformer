/// <reference path="./jquery.d.ts" />
/// <reference path="./ITranslatorBadge.d.ts" />

/** @namespace */
module TranslatorBadges {
	/**
	* Creates badge for translator
	*
	* @class
	* @export
	*/
    export class TranslatorBadge implements ITranslatorBadge {
		$badgeElem: JQuery;
		$linkElem: JQuery;

		/**
		* Constructs instance of translator badge
		*
		* @param {String} elementId - Id of badge DOM-element
		* @constructor
		*/
        constructor (public elementId: string) {
			/**
			* @protected
			* @type {jQuery}
			* @expose
			*/
            this.$badgeElem = jQuery("#" + elementId);

			/**
			* @protected
			* @type {jQuery}
			* @expose
			*/
			this.$linkElem = this.$badgeElem.find("A:first");
        }

		/**
		* Gets a text of badge
		*
		* @returns {String} - Text of badge
		* @expose
		*/
        public getText(): string {
            return this.$linkElem.text();
        }

		/**
		* Sets a text of badge
		*
		* @param {string} text - Text of badge
		* @expose
		*/
        public setText(text: string): void {
            this.$linkElem.text(text);
        }

		/**
		* Shows badge
		*
		* @returns {void}
		* @expose
		*/
        public show(): void {
            this.$badgeElem.show(0);
        }

		/**
		* Hides badge
		*
		* @returns {void}
		* @expose
		*/
        public hide(): void {
            this.$badgeElem.hide(0);
        }

		/**
		* Checks whether the badge is visible
		*
		* @returns {Boolean} Flag for whether the badge is visible
		* @expose
		*/
		public isVisible() : boolean {
			return this.$badgeElem.is(":visible");
		}
    }
}