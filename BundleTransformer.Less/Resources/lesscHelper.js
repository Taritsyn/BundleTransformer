/*global Less, LessEnvironment, VirtualFileManager  */
var lessHelper = (function (less, lessEnvironment, virtualFileManager, undefined) {
	'use strict';

	var exports = {},
		defaultOptions = {
			compress: false,
			paths: [],
			strictImports: false,
			insecure: false,
			filename: '',
			rootpath: '',
			relativeUrls: false,
			ieCompat: true,
			strictMath: false,
			strictUnits: false,
			urlArgs: '',
			plugins: [],
			javascriptEnabled: false,
			dumpLineNumbers: '',
			sourceMap: false,
			syncImport: true,
			chunkInput: false,
			processImports: true
		},
		btEnvironment,
		BtFileManager,
		BtLogger
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

	function formatString() {
		var pattern = arguments[0],
			result = pattern,
			regex,
			argument,
			argumentIndex,
			argumentCount = arguments.length
			;

		for (argumentIndex = 0; argumentIndex < argumentCount - 1; argumentIndex++) {
			regex = new RegExp('\\{' + argumentIndex + '\\}', 'gm');
			argument = arguments[argumentIndex + 1];

			result = result.replace(regex, argument);
		}

		return result;
	}

	//#region btEnvironment object
	btEnvironment = (function () {
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = "Method 'btEnvironment.{0}' is not implemented.";

		function encodeBase64(value) {
			return lessEnvironment.EncodeToBase64(value);
		}

		function mimeLookup(filename) {
			return lessEnvironment.GetMimeType(filename);
		}

		function charsetLookup(mimeType) {
			// Assume text types are utf8
			return (/^text\//).test(mimeType) ? 'UTF-8' : null;
		}

		function getSourceMapGenerator() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'getSourceMapGenerator'));
		}

		return {
			encodeBase64: encodeBase64,
			mimeLookup: mimeLookup,
			charsetLookup: charsetLookup,
			getSourceMapGenerator: getSourceMapGenerator
		};
	}());
	//#endregion

	//#region BtFileManager class
	BtFileManager = (function (AbstractFileManager) {
		function BtFileManager() {
			this._includedFilePaths = [];
		}

		BtFileManager.prototype = new AbstractFileManager();


		BtFileManager.prototype.supports = function () {
			return true;
		};

		BtFileManager.prototype.supportsSync = function () {
			return true;
		};

		BtFileManager.prototype.loadFile = function (filename, currentDirectory, options, environment, callback) {
			var result = this.loadFileSync(filename, currentDirectory, options, environment, 'utf-8');
			callback(result.error, result);
		};

		BtFileManager.prototype.loadFileSync = function (filename, currentDirectory, options, environment, encoding) {
			var result,
				processedFilename,
				processedCurrentDirectory,
				fullFilename,
				isAbsoluteFilename,
				isFileExists,
				data,
				err,
				utils = less.utils
				;

			processedFilename = filename;
			if (utils.isAppRelativePath(filename)) {
				processedFilename = virtualFileManager.ToAbsolutePath(filename);
			}

			processedCurrentDirectory = currentDirectory;
			if (utils.isAppRelativePath(currentDirectory)) {
				processedCurrentDirectory = virtualFileManager.ToAbsolutePath(currentDirectory);
			}

			isAbsoluteFilename = this.isPathAbsolute(processedFilename);
			fullFilename = isAbsoluteFilename ?
				processedFilename : this.extractUrlParts(this.join(processedCurrentDirectory, processedFilename)).fileUrl;
			isFileExists = virtualFileManager.FileExists(fullFilename);

			if (isFileExists) {
				if (encoding) {
					data = virtualFileManager.ReadTextFile(fullFilename);
				}
				else {
					data = virtualFileManager.ReadBinaryFile(fullFilename);
				}

				result = { contents: data, filename: fullFilename };
			}
			else {
				err = { type: 'File', message: "'" + fullFilename + "' wasn't found." };
				result = { error: err };
			}

			this._includedFilePaths.push(fullFilename);

			return result;
		};

		BtFileManager.prototype.getIncludedFilePaths = function () {
			return this._includedFilePaths;
		};

		BtFileManager.prototype.dispose = function () {
			this._includedFilePaths = null;
		};

		return BtFileManager;
	})(less.AbstractFileManager);
	//#endregion

	//#region BtLogger class
	BtLogger = (function () {
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = "Method 'BtLogger.{0}' is not implemented.";

		function BtLogger() {
			this._warnings = [];
		}


		BtLogger.prototype.error = function () {};

		BtLogger.prototype.warn = function (msg) {
			this._warnings.push(msg);
		};

		BtLogger.prototype.info = function () {};

		BtLogger.prototype.debug = function () {};

		BtLogger.prototype.addListener = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'addListener'));
		};

		BtLogger.prototype.removeListener = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'removeListener'));
		};

		BtLogger.prototype.getWarnings = function () {
			return this._warnings;
		};

		BtLogger.prototype.dispose = function () {
			this._warnings = null;
		};

		return BtLogger;
	})();
	//#endregion

	exports.compile = function (code, path, options) {
		var result = {
				compiledCode: '',
				includedFilePaths: []
			},
			compilationOptions,
			fileManager,
			logger,
			lessCompiler,
			errors = [],
			warnings
			;

		code = code.replace(/^\uFEFF/, '');
		options = options || {};

		// Compile code
		fileManager = new BtFileManager();
		logger = new BtLogger();

		compilationOptions = mix(mix({}, defaultOptions), options);
		compilationOptions.filename = path;
		compilationOptions.rootpath = '';
		compilationOptions.relativeUrls = true;

		lessCompiler = less.createFromEnvironment(btEnvironment, [fileManager]);
		less.logger = logger;

		try {
			lessCompiler.render(code, compilationOptions,
				function(err, stylesheet){
					if (err) {
						errors.push({
							type: err.type,
							message: err.message,
							fileName: err.filename,
							lineNumber: (err.line || 0),
							columnNumber: (err.column ? err.column + 1 : 0)
					});

						return;
					}

					result.compiledCode = stylesheet.css;
					result.includedFilePaths = fileManager.getIncludedFilePaths();
				}
			);
		}
		catch (e) {
			if (typeof e.line !== 'undefined') {
				errors.push({
					type: e.type,
					message: e.message,
					fileName: e.filename,
					lineNumber: (e.line || 0),
					columnNumber: (e.column ? e.column + 1 : 0)
				});
			}
			else {
				throw (e);
			}
		}

		if (errors.length > 0) {
			result.errors = errors;
		}

		warnings = logger.getWarnings();
		if (warnings.length > 0) {
			result.warnings = warnings;
		}

		fileManager.dispose();
		logger.dispose();

		less.logger = null;

		return JSON.stringify(result);
	};

	return exports;
}(Less, LessEnvironment, VirtualFileManager));