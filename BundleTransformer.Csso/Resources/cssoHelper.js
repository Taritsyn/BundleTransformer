/*global CSSO */
var cssoHelper = (function (csso, undefined) {
	'use strict';

	var exports = {},
		defaultOptions = {
			filename: '',
			sourceMap: null,
			restructure: true,
			debug: false
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

	function getErrorFromException(e) {
		var error,
			message = e.message,
			name = e.name || '',
			location = e.parseError,
			lineNumber = 0,
			columnNumber = 0
			;

		if (location) {
			lineNumber = location.line;
			columnNumber = location.column;
		}

		error = {
			'message': message,
			'name': name,
			'lineNumber': lineNumber,
			'columnNumber': columnNumber
		};

		return error;
	}

	exports.minify = function (code, options) {
		var optimizationOptions,
			result = {},
			errors = [],
			minifiedCode = ''
			;

		optimizationOptions = mix(mix({}, defaultOptions), options);

		try {
			minifiedCode = csso.minify(code, optimizationOptions);
		}
		catch (e) {
			if (e.message) {
				errors.push(getErrorFromException(e));
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