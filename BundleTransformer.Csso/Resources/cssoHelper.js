/*global CSSO */
var cssoHelper = (function (csso, undefined) {
	'use strict';

	var exports = {};

	exports.minify = function (code, disableRestructuring) {
		var result = {},
			errors = [],
			minifiedCode = '',
			options = {
				restructuring: !disableRestructuring,
				debug: false
			}
			;

		try {
			minifiedCode = csso.minify(code, options);
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