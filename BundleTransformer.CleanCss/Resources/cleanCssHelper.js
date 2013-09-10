if (typeof process === 'undefined') {
	var process = {
		platform: 'win32'
	};
}

var cleanCssHelper = (function (cleanCss, undefined) {
	"use strict";

	var exports = {},
		defaultOptions = {
			target: null,
			removeEmpty: false,
			keepBreaks: false,
			keepSpecialComments: '*',
			root: '',
			relativeTo: '',
			processImport: false,
			benchmark: false
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
		var minifiedCode,
			cleanOptions
			;

		cleanOptions = mix(mix({}, defaultOptions), options);
		minifiedCode = cleanCss.process(code, cleanOptions);

		return minifiedCode;
	};

	return exports;
} (CleanCss));