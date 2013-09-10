if (typeof console === 'undefined') {
	var console = {};
}

var cssoHelper = (function (srcToCSSP, CSSOCompressor, cleanInfo, CSSOTranslator, undefined) {
	"use strict";

	var exports = {};

	exports.minify = function (code, disableRestructuring) {
		var result = {},
			errors = [],
			originalConsoleErrorMethod,
			compressor,
			translator,
			parsedCode,
			compressedCode,
			cleanedCode,
			translatedCode = ""
			;

		if (typeof console.error !== 'undefined') {
			originalConsoleErrorMethod = console.error;
		}

		console.error = function (message) {
			errors.push(message);
		};

		compressor = new CSSOCompressor();
		translator = new CSSOTranslator();

		try {
			parsedCode = srcToCSSP(code, 'stylesheet', true);
			compressedCode = compressor.compress(parsedCode, disableRestructuring);
			cleanedCode = cleanInfo(compressedCode);
			translatedCode = translator.translate(cleanedCode);
		}
		catch (e) {
			if (e.message) {
				errors.push(e.message);
			}
		}

		if (originalConsoleErrorMethod) {
			console.error = originalConsoleErrorMethod;
		}

		result.minifiedCode = translatedCode;
		if (errors.length > 0) {
			result.errors = errors;
		}

		return JSON.stringify(result);
	};

	return exports;
} (srcToCSSP, CSSOCompressor, cleanInfo, CSSOTranslator));