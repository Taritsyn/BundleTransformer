/*global ts */
var typeScriptHelper = (function (ts, undefined) {
	'use strict';

	var exports = {},
		defaultOptions = {
			charset: '',
			emitBOM: false,
			mapRoot: '',
			module: 0 /* None */,
			noEmitOnError: false,
			noImplicitAny: false,
			noLib: false,
			noResolve: false,
			out: '',
			outDir: '',
			preserveConstEnums: false,
			removeComments: false,
			suppressImplicitAnyIndexErrors: false,
			sourceMap: false,
			sourceRoot: '',
			target: 0 /* ES3 */
		},
		BtSystem,
		BtCompilerHost
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

	//#region BtSystem
	BtSystem = (function () {
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = "Method 'ts.sys.{0}' is not implemented.";

		function BtSystem(path, files) {
			this._path = path;
			this._files = files;

			this.args = [];
			this.newLine = '\r\n';
			this.useCaseSensitiveFileNames = false;
		}

		BtSystem.prototype.write = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'write'));
		};

		BtSystem.prototype.readFile = function(fileName) {
			var key,
				content
				;

			key = generateFileCacheItemKey(fileName);

			if (typeof this._files[key] !== 'undefined') {
				content = this._files[key].content;
			}
			else {
				content = undefined;
			}

			return content;
		};

		BtSystem.prototype.writeFile = function(fileName, data) {
			var key = generateFileCacheItemKey(fileName);

			this._files[key] = { path: fileName, content: data };
		};

		BtSystem.prototype.resolvePath = function(path) {
			return path;
		};

		BtSystem.prototype.fileExists = function(path) {
			var key,
				isFileExists
				;

			key = generateFileCacheItemKey(path);
			isFileExists = (typeof this._files[key] !== 'undefined');

			return isFileExists;
		};

		BtSystem.prototype.directoryExists = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'directoryExists'));
		};

		BtSystem.prototype.createDirectory = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'createDirectory'));
		};

		BtSystem.prototype.getExecutingFilePath = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'getExecutingFilePath'));
		};

		BtSystem.prototype.getCurrentDirectory = function () {
			var directoryName = '',
				lastSlashPosition = this._path.lastIndexOf('/')
				;

			if (lastSlashPosition !== -1) {
				directoryName = this._path.substring(0, lastSlashPosition + 1);
			}

			return directoryName;
		};

		BtSystem.prototype.exit = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'exit'));
		};

		BtSystem.prototype.dispose = function () {
			this._files = null;
		};

		return BtSystem;
	})();
	//#endregion

	//#region BtCompilerHost
	BtCompilerHost = (function () {
		function BtCompilerHost(system, options) {
			this._sys = system;
			this._options = options;
		}

		BtCompilerHost.prototype.getSourceFile = function(filename, languageVersion, onError) {
			var text;

			try {
				text = this._sys.readFile(filename);
			}
			catch (e) {
				if (onError) {
					onError(e.message);
				}

				text = '';
			}

			return (typeof text !== 'undefined') ?
				ts.createSourceFile(filename, text, languageVersion, '0') : undefined;
		};

		BtCompilerHost.prototype.getDefaultLibFilename = function (options) {
			var defaultLibFileName = (options.target === 2 /* ES6 */) ? 'lib.es6.d.ts' : 'lib.d.ts';

			return defaultLibFileName;
		};

		BtCompilerHost.prototype.writeFile = function(fileName, data, writeByteOrderMark, onError) {
			try {
				this._sys.writeFile(fileName, data, writeByteOrderMark);
			}
			catch (e) {
				if (onError) {
					onError(e.message);
				}
			}
		};

		BtCompilerHost.prototype.getCurrentDirectory = function() {
			return this._sys.getCurrentDirectory();
		};

		BtCompilerHost.prototype.useCaseSensitiveFileNames = function() {
			return this._sys.useCaseSensitiveFileNames;
		};

		BtCompilerHost.prototype.getCanonicalFileName = function(fileName) {
			return this._sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
		};

		BtCompilerHost.prototype.getNewLine = function getNewLine() {
			return this._sys.newLine;
		};

		BtCompilerHost.prototype.dispose = function () {
			this._sys = null;
			this._options = null;
		};

		return BtCompilerHost;
	})();
	//#endregion

	function innerCompile(fileNames, options, compilerHost) {
		var program,
			errors,
			checker,
			emitErrors
			;

		program = ts.createProgram(fileNames, options, compilerHost);
		errors = program.getDiagnostics();

		if (errors.length === 0) {
			checker = program.getTypeChecker(true);
			errors = checker.getDiagnostics();
			if (!checker.isEmitBlocked()) {
				emitErrors = checker.emitFiles().diagnostics;
				errors = ts.concatenate(errors, emitErrors);
			}
		}

		return {
			program: program,
			errors: errors
		};
	}

	function getErrorsFromDiagnostics(diagnostics) {
		var diagnostic,
			diagnosticIndex,
			diagnosticCount,
			errors = [],
			message,
			file,
			fileName = '',
			location,
			lineNumber = 0,
			columnNumber = 0
			;

		diagnosticCount = diagnostics.length;

		for (diagnosticIndex = 0; diagnosticIndex < diagnosticCount; diagnosticIndex++) {
			diagnostic = diagnostics[diagnosticIndex];
			message = diagnostic.messageText;
			file = diagnostic.file;

			if (file) {
				fileName = file.filename;
				location = file.getLineAndCharacterFromPosition(diagnostic.start);
				lineNumber = location.line;
				columnNumber = location.character;
			}

			if (diagnostic.category === 1 /* Error */) {
				errors.push({
					'message': message,
					'fileName': fileName,
					'lineNumber': lineNumber,
					'columnNumber': columnNumber
				});
			}
		}

		return errors;
	}

	exports.compile = function (code, path, dependencies, options) {
		var result = { compiledCode: '' },
			compilationErrors,
			compilationOptions,
			inputFilePath = path,
			inputFileKey,
			outputFilePath = inputFilePath.replace(/\.ts$/i, '.js'),
			files,
			dependency,
			dependencyIndex,
			dependencyCount,
			dependencyKey,
			defaultCompilerHost
			;

		options = options || {};
		compilationOptions = mix(mix({}, defaultOptions), options);

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
		ts.sys = new BtSystem(path, files);
		defaultCompilerHost = new BtCompilerHost(ts.sys, compilationOptions);

		compilationErrors = innerCompile([inputFilePath], compilationOptions, defaultCompilerHost).errors;
		if (compilationErrors.length === 0) {
			result.compiledCode = ts.sys.readFile(outputFilePath);
		}
		else {
			result.errors = getErrorsFromDiagnostics(compilationErrors);
		}

		defaultCompilerHost.dispose();

		ts.sys.dispose();
		ts.sys = null;

		return JSON.stringify(result);
	};

	return exports;
}(ts));