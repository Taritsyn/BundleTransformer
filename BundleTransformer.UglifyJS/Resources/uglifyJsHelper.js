/*global UglifyJS */
var uglifyJsHelper = (function (uglifyJs, undefined) {
	'use strict';

	var exports = {};

	function preprocessOptions(options) {
		var uglificationOptions = options || {},
			codeGenerationOptions = uglificationOptions.output,
			comments,
			processedComments,
			regexPosition
			;

		if (codeGenerationOptions) {
			comments = codeGenerationOptions.comments;
			processedComments = false;

			if (comments) {
				if (comments === 'all') {
					processedComments = true;
				}
				else if (comments === 'copyright') {
					processedComments = function (node, comment) {
						var text = comment.value,
							type = comment.type
							;

						if (type === 'comment2') {
							// multiline comment
							return /@preserve|@license|@cc_on/i.test(text);
						}
					};
				}
				else if (/^\/.*\/[a-zA-Z]*$/.test(comments)) {
					regexPosition = comments.lastIndexOf('/');

					try {
						processedComments = new RegExp(comments.substr(1, regexPosition - 1),
							comments.substr(regexPosition + 1));
					}
					catch (e) {
						throw new Error('Invalid value in the `output.comments` option.');
					}
				}
			}

			codeGenerationOptions.comments = processedComments;
		}

		return uglificationOptions;
	}

	exports.minify = function (code, options) {
		var minifiedCode = '',
			result = {},
			errors = [],
			warnings = [],
			uglificationOptions = preprocessOptions(options)
			;

		uglifyJs.AST_Node.warn_function = function (message) {
			warnings.push({ 'message': message });
		};

		try {
			minifiedCode = uglifyJs.minify(code, uglificationOptions).code;
		}
		catch (e) {
			if (e instanceof uglifyJs.JS_Parse_Error) {
				errors.push({
					'message': e.message,
					'lineNumber': e.line,
					'columnNumber': e.col
				});
			}
			else if (e instanceof uglifyJs.DefaultsError) {
				errors.push({
					'message': e.msg,
					'lineNumber': 0,
					'columnNumber': 0
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