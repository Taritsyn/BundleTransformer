/*global CleanCss */
var cleanCssHelper = (function (CleanCss, undefined) {
	'use strict';

	var exports = {};

	exports.minify = function (code, options) {
		var cleaner,
			data,
			result = {},
			minifiedCode,
			errors,
			warnings
			;

		options = options || {};
		cleaner = new CleanCss(options);

		data = cleaner.minify(code);

		minifiedCode = data.styles;
		errors = data.errors;
		warnings = data.warnings;

		result.minifiedCode = minifiedCode;
		if (errors.length > 0) {
			result.errors = errors;
		}
		if (warnings.length > 0) {
			result.warnings = warnings;
		}

		return JSON.stringify(result);
	};

	return exports;
} (CleanCss));