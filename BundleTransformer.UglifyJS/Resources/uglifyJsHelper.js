var uglifyJsHelper = (function(uglifyJs, undefined) {
	"use strict";

	var exports = {};

	exports.minify = function (code, options) {
		var minifiedCode = "",
			result = {},
			errors = [],
			warnings = []
			;

		uglifyJs.AST_Node.warn_function = function (message) {
			warnings.push({ "message": message });
		};

		try {
			minifiedCode = uglifyJs.minify(code, options).code;
		}
		catch (e) {
			if (e instanceof uglifyJs.JS_Parse_Error) {
				errors.push({
					"message": e.message,
					"lineNumber": e.line,
					"columnNumber": e.col
				});
			}
			else if (e instanceof uglifyJs.DefaultsError) {
				errors.push({
					"message": e.msg,
					"lineNumber": 0,
					"columnNumber": 0
				});
			}
			else {
				throw (e);
			}
		}

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
} (UglifyJS));