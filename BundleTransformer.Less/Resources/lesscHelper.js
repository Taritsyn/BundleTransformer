/*global Less */
var lessHelper = (function (less, undefined) {
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
		environment,
		FileManager
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

	function generateFileCacheItemKey(path) {
		var key = path.toLocaleUpperCase();

		return key;
	}

	//#region environment
	environment = (function () {
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = "Method 'environment.{0}' is not implemented.",
			symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
			;

		//#region Internal Methods
		function encodeUtf8(value) {
			var result,
				processedValue,
				charIndex,
				charCount,
				charCode,
				strFromCharCode = String.fromCharCode
				;

			result = '';
			processedValue = value.replace(/\r\n/g, '\n');
			charCount = processedValue.length;

			for (charIndex = 0; charIndex < charCount; charIndex++) {
				charCode = processedValue.charCodeAt(charIndex);

				if (charCode < 128) {
					result += strFromCharCode(charCode);
				}
				else if ((charCode > 127) && (charCode < 2048)) {
					result += strFromCharCode((charCode >> 6) | 192);
					result += strFromCharCode((charCode & 63) | 128);
				}
				else {
					result += strFromCharCode((charCode >> 12) | 224);
					result += strFromCharCode(((charCode >> 6) & 63) | 128);
					result += strFromCharCode((charCode & 63) | 128);
				}
			}

			return result;
		}
		//#endregion

		function encodeBase64(value) {
			var result,
				processedValue,
				charIndex,
				charCount,
				charCode1,
				charCode2,
				charCode3,
				encodedCharCode1,
				encodedCharCode2,
				encodedCharCode3,
				encodedCharCode4
				;

			result = '';
			processedValue = encodeUtf8(value);
			charCount = processedValue.length;

			for (charIndex = 0; charIndex < charCount;) {
				charCode1 = processedValue.charCodeAt(charIndex++);
				charCode2 = processedValue.charCodeAt(charIndex++);
				charCode3 = processedValue.charCodeAt(charIndex++);

				encodedCharCode1 = charCode1 >> 2;
				encodedCharCode2 = ((charCode1 & 3) << 4) | (charCode2 >> 4);
				encodedCharCode3 = ((charCode2 & 15) << 2) | (charCode3 >> 6);
				encodedCharCode4 = charCode3 & 63;

				if (isNaN(charCode2)) {
					encodedCharCode3 = encodedCharCode4 = 64;
				} else if (isNaN(charCode3)) {
					encodedCharCode4 = 64;
				}

				result += symbols.charAt(encodedCharCode1);
				result += symbols.charAt(encodedCharCode2);
				result += symbols.charAt(encodedCharCode3);
				result += symbols.charAt(encodedCharCode4);
			}

			return result;
		}

		function mimeLookup() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'mimeLookup'));
		}

		function charsetLookup() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'charsetLookup'));
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

	//#region FileManager
	FileManager = (function(AbstractFileManager) {
		var ERROR_MSG_PATTERN_FILE_NOT_FOUND = "File '{0}' does not exist.";

		function FileManager(files) {
			this._files = files;
		}

		FileManager.prototype = new AbstractFileManager();

		//#region Internal Methods
		FileManager.prototype._readFile = function(path) {
			var key,
				file
				;

			key = generateFileCacheItemKey(path);
			if (typeof this._files[key] === 'undefined') {
				throw new Error(formatString(ERROR_MSG_PATTERN_FILE_NOT_FOUND, path));
			}

			file = this._files[key];

			return file.content;
		};

		FileManager.prototype._fileExists = function(path) {
			var key,
				isFileExists
				;

			key = generateFileCacheItemKey(path);
			isFileExists = (typeof this._files[key] !== 'undefined');

			return isFileExists;
		};
		//#endregion

		FileManager.prototype.supports = function () {
			return true;
		};

		FileManager.prototype.supportsSync = function () {
			return true;
		};

		FileManager.prototype.loadFile = function (filename, currentDirectory, options, environment, callback) {
			var data,
				result = null,
				err = null
				;

			if (this._fileExists(filename)) {
				data = this._readFile(filename);
				result = {
					contents: data,
					filename: filename
				};
			}
			else {
				err = {
					type: 'File',
					message: formatString(ERROR_MSG_PATTERN_FILE_NOT_FOUND, filename)
				};
			}

			callback(err, result);
		};

		FileManager.prototype.loadFileSync = function (filename) {
			return {
				contents: this._readFile(filename),
				filename: filename
			};
		};

		FileManager.prototype.dispose = function () {
			this._files = null;
		};

		return FileManager;
	})(less.AbstractFileManager);
	//#endregion

	exports.compile = function (code, path, dependencies, options) {
		var result = {
				compiledCode: '',
				errors: []
			},
			compilationOptions,
			inputFilePath = path,
			inputFileKey,
			files,
			dependency,
			dependencyIndex,
			dependencyCount,
			dependencyKey,
			errors = [],
			fileManager,
			lessCompiler
			;

		options = options || {};

		// Fill file cache
		files = {};

		if (dependencies) {
			dependencyCount = dependencies.length;

			for (dependencyIndex = 0; dependencyIndex < dependencyCount; dependencyIndex++) {
				dependency = dependencies[dependencyIndex];
				dependencyKey = generateFileCacheItemKey(dependency.path);

				files[dependencyKey] = dependency;
			}
		}

		inputFileKey = generateFileCacheItemKey(inputFilePath);
		files[inputFileKey] = { path: inputFilePath, content: code };

		// Compile code
		fileManager = new FileManager(files);

		compilationOptions = mix(mix(defaultOptions), options);
		compilationOptions.filename = inputFilePath;
		compilationOptions.rootpath = fileManager.getPath(inputFilePath);
		compilationOptions.relativeUrls = true;

		lessCompiler = less.createFromEnvironment(environment, [fileManager]);
		
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

		fileManager.dispose();

		return JSON.stringify(result);
	};

	return exports;
} (Less));