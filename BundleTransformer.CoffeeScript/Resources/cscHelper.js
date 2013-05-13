var coffeeScriptHelper = {};

;(function (coffeeScriptHelper, coffeeScript, undefined) {
	"use strict";

	coffeeScriptHelper.compile = function(code, options) {
		var compiledCode = "",
			result = {},
			parseErrors = []
			;

		try {
			compiledCode = coffeeScript.compile(code, options);
		}
		catch(e) {
			if (e instanceof SyntaxError) {
				var message = e.message;
				var lineNumber = 0;
				var columnNumber = 0;

				if (typeof e["location"] !== "undefined") {
					var location = e.location;
					if (typeof location["first_line"] !== "undefined") {
						lineNumber = location["first_line"] + 1;
					}
					if (typeof location["first_column"] !== "undefined") {
						columnNumber = location["first_column"] + 1;
					}
				}
		
				var parseError = {
					"message": message,
					"lineNumber": lineNumber,
					"columnNumber": columnNumber
				};
				parseErrors.push(parseError);
			}
			else {
				throw(e);
			}
		}

		result.compiledCode = compiledCode;
		if (parseErrors.length > 0) {
			result.errors = parseErrors;
		}
		
		return JSON.stringify(result);
	};
}(coffeeScriptHelper, CoffeeScript));