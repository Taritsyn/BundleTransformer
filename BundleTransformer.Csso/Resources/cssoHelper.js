/*global CSSO */
var cssoHelper = (function (csso, undefined) {
	'use strict';

	var exports = {};

	exports.minify = function (code, disableRestructuring) {
		var result = {},
			errors = [],
			minifiedCode = ''
			;

		try {
			minifiedCode = csso.justDoIt(code, disableRestructuring, true);
		}
		catch (e) {
			if (e.message) {
				errors.push(e.message);
			}
		}

		result.minifiedCode = minifiedCode;
		if (errors.length > 0) {
			result.errors = errors;
		}

		return JSON.stringify(result);
	};

	return exports;
} (CSSO));