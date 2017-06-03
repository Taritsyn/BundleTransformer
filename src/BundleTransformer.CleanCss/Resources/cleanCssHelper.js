/*global CleanCss */
var cleanCssHelper = (function (CleanCss, undefined) {
	'use strict';

	var exports = {};

	exports.minify = function (code, options) {
		var cleaner,
			data,
			result = {},
			minifiedCode,
			errors,
			warnings
			;

		options = options || {};
		cleaner = new CleanCss(options);

		data = cleaner.minify(code);

		minifiedCode = data.styles;
		errors = data.errors;
		warnings = data.warnings;

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
} (CleanCss));

/*!
 * String.prototype.repeat polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
 */
if (!String.prototype.hasOwnProperty('repeat')) {
	String.prototype.repeat = function (count) {
		var value,
			result
			;

		if (this === null) {
			throw new TypeError('String.prototype.repeat: Cannot convert ' + this + ' to object.');
		}

		if (count < 0) {
			throw new RangeError('String.prototype.repeat: Repeat count must be non-negative.');
		}

		if (count == Infinity) {
			throw new RangeError('String.prototype.repeat: Repeat count must be less than infinity.');
		}

		count = Math.floor(count);
		value = '' + this;

		if (value.length === 0 || count === 0) {
			return '';
		}

		if (value.length * count >= 1 << 28) {
			throw new RangeError('String.prototype.repeat: Repeat count must not overflow maximum string size.');
		}

		result = '';
		for (; ;) {
			if ((count & 1) === 1) {
				result += value;
			}
			count >>>= 1;
			if (count === 0) {
				break;
			}
			value += value;
		}

		return result;
	};
}