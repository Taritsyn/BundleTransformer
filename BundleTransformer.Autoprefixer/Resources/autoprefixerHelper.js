var autoprefixerHelper = (function (autoprefixer, undefined) {
	"use strict";

	var exports = {};

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

	exports.process = function (code, options) {
		var browsers,
			autoprefixOptions,
			postProcessor,
			result = {},
			processedCode = "",
			errors = [],
			message,
			lineNumber,
			columnNumber
			;

		options = options || {};
		browsers = options.browsers || [];
		autoprefixOptions = mix({}, options);
		delete autoprefixOptions.browsers;

		try {
			postProcessor = autoprefixer.apply(this, browsers.concat([autoprefixOptions]));
			processedCode = postProcessor.process(code).css;
		}
		catch (e) {
			if (typeof e.line !== "undefined" || typeof e.autoprefixer !== "undefined") {
				message = e.message;
				lineNumber = 0;
				columnNumber = 0;

				if (typeof e.line !== "undefined") {
					lineNumber = e.line;
				}
				if (typeof e.column !== "undefined") {
					columnNumber = e.column;
				}

				errors.push({
					"message": message,
					"lineNumber": lineNumber,
					"columnNumber": columnNumber
				});
			}
			else {
				throw (e);
			}
		}

		result.processedCode = processedCode;
		if (errors.length > 0) {
			result.errors = errors;
		}

		return JSON.stringify(result);
	};

	return exports;
} (Autoprefixer));