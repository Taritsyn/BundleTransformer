/*global Handlebars */
var handlebarsHelper = (function (handlebars, undefined) {
	'use strict';

	var exports = {},
		defaultOptions = {
			knownHelpers: null,
			knownHelpersOnly: false,
			data: true
		},
		parseErrorMessageRegex = /^Parse error on line (\d+):/
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
			errors = [],
			message,
			lineNumber,
			columnNumber,
			isSyntaxError
			;

		options = options || {};
		compilationOptions = mix(mix({}, defaultOptions), options);

		try {
			compiledCode = handlebars.precompile(code, compilationOptions);
		}
		catch (e) {
			message = e.message;
			lineNumber = 0;
			columnNumber = 0;
			isSyntaxError = false;

			if (e instanceof handlebars.Exception) {
				if (typeof e.lineNumber !== 'undefined') {
					lineNumber = e.lineNumber;
				}
				if (typeof e.column !== 'undefined') {
					columnNumber = e.column;
				}

				isSyntaxError = true;
			}
			else if (parseErrorMessageRegex.test(message)) {
				var matches = parseErrorMessageRegex.exec(message);
				if (matches.length > 1) {
					lineNumber = matches[1];
				}

				isSyntaxError = true;
			}

			if (isSyntaxError) {
				errors.push({
					'message': message,
					'lineNumber': lineNumber,
					'columnNumber': columnNumber
				});
			}
			else {
				throw (e);
			}
		}

		result.compiledCode = compiledCode;
		if (errors.length > 0) {
			result.errors = errors;
		}

		return JSON.stringify(result);
	};

	return exports;
} (Handlebars));