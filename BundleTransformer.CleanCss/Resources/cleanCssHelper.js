if (typeof process === 'undefined') {
	var process = {
		platform: 'win32'
	};
}

var cleanCssHelper = (function (CleanCss, undefined) {
	"use strict";

	var exports = {},
		defaultOptions = {
			target: null,
			keepBreaks: false,
			keepSpecialComments: '*',
			root: '',
			relativeTo: '',
			processImport: false,
			benchmark: false,
			noRebase: true,
			noAdvanced: false,
			noAggressiveMerging: false,
			roundingPrecision: 2,
			compatibility: 'ie8',
			debug: false
		}
		;

	function mix(destination, source) {
		var propertyName;

		destination = destination || {};

		for (propertyName in source) {
			if (source.hasOwnProperty(propertyName)) {
				destination[propertyName] = source[propertyName];
			}
		}

		return destination;
	}

	exports.minify = function (code, options) {
		var cleanOptions,
			cleaner,
			result = {},
			minifiedCode,
			errors,
			warnings
			;

		cleanOptions = mix(mix({}, defaultOptions), options);
		cleaner = new CleanCss(cleanOptions);

		minifiedCode = cleaner.minify(code);
		errors = cleaner.errors;
		warnings = cleaner.warnings;

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