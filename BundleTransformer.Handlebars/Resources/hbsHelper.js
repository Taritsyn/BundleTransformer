var handlebarsHelper = (function (handlebars, undefined) {
	"use strict";

	var exports = {},
		parseErrorMessageRegex = /^Parse error on line (\d+):/
		;

	exports.precompile = function (code, options) {

		var compiledCode = "",
			result = {},
			errors = [],
			message,
			lineNumber,
			columnNumber,
			isSyntaxError
			;

		try {
			compiledCode = handlebars.precompile(code, options);
		}
		catch (e) {
			message = e.message;
			lineNumber = 0;
			columnNumber = 0;
			isSyntaxError = false;

			if (e instanceof handlebars.Exception) {
				if (typeof e.lineNumber !== "undefined") {
					lineNumber = e.lineNumber;
				}
				if (typeof e.column !== "undefined") {
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
					"message": message,
					"lineNumber": lineNumber,
					"columnNumber": columnNumber
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