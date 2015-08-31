/*global CleanCss */
var cleanCssHelper = (function (CleanCss, undefined) {
	'use strict';

	var exports = {},
		defaultOptions = {
			advanced: true,
			aggressiveMerging: true,
			benchmark: false,
			compatibility: '*',
			debug: false,
			inliner: undefined,
			keepBreaks: false,
			keepSpecialComments: '*',
			mediaMerging: true,
			processImport: false,
			processImportFrom: false,
			rebase: false,
			restructuring: true,
			root: '',
			relativeTo: '',
			roundingPrecision: 2,
			semanticMerging: false,
			shorthandCompacting: true,
			sourceMap: false,
			target: null
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
			data,
			result = {},
			minifiedCode,
			errors,
			warnings
			;

		cleanOptions = mix(mix({}, defaultOptions), options);
		cleaner = new CleanCss(cleanOptions);

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