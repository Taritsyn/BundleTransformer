/*global Hogan */
var hoganHelper = (function (hogan, undefined) {
	'use strict';

	var exports = {},
		defaultOptions = {
			asString: 1,
			sectionTags: [],
			delimiters: '',
			disableLambda: false
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

	exports.precompile = function (code, options) {
		var compilationOptions,
			compiledCode = '',
			result = {},
			errors = []
			;

		options = options || {};
		compilationOptions = mix(mix({}, defaultOptions), options);

		try {
			compiledCode = hogan.compile(code, compilationOptions);
		}
		catch (e) {
			errors.push(e.message);
		}

		result.compiledCode = compiledCode;
		if (errors.length > 0) {
			result.errors = errors;
		}

		return JSON.stringify(result);
	};

	return exports;
} (Hogan));