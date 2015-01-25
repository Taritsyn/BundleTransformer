/// <reference path="./ColoredTranslatorBadge.ts" />

module TranslatorBadges {
	var TS_BADGE_TEXT: string = "TypeScript";
	var TS_BADGE_COLOR: string = "#0074C1";

	export function createTsTranslatorBadge() {
		var tsBadge: IColoredTranslatorBadge = new ColoredTranslatorBadge("ts");
		tsBadge.setText(TS_BADGE_TEXT);
		tsBadge.setTextColor(TS_BADGE_COLOR);
		tsBadge.setBorderColor(TS_BADGE_COLOR);
		tsBadge.show();
	}
}

TranslatorBadges.createTsTranslatorBadge();