/*global ts */
var typeScriptHelper = (function (ts, undefined) {
	'use strict';

	var exports = {},
		defaultOptions = {
			charset: '',
			emitBOM: false,
			mapRoot: '',
			module: 0 /* None */,
			noEmit: false,
			noEmitOnError: false,
			noImplicitAny: false,
			noLib: false,
			noResolve: false,
			out: '',
			outDir: '',
			preserveConstEnums: false,
			removeComments: false,
			separateCompilation: false,
			sourceMap: false,
			sourceRoot: '',
			stripInternal: false,
			suppressImplicitAnyIndexErrors: false,
			target: 0 /* ES3 */
		},
		BtSystem
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

	//#region BtSystem class
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

		BtSystem.prototype.readDirectory = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'readDirectory'));
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

	//#region createBtCompilerHost function
	function createBtCompilerHost() {
		function getSourceFile(fileName, languageVersion, onError) {
			var text;

			try {
				text = ts.sys.readFile(fileName);
			}
			catch (e) {
				if (onError) {
					onError(e.message);
				}

				text = '';
			}

			return (typeof text !== 'undefined') ?
				ts.createSourceFile(fileName, text, languageVersion, false) : undefined;
		}

		function getDefaultLibFileName(options) {
			return ts.getDefaultLibFileName(options);
		}

		function writeFile(fileName, data, writeByteOrderMark, onError) {
			try {
				ts.sys.writeFile(fileName, data, writeByteOrderMark);
			}
			catch (e) {
				if (onError) {
					onError(e.message);
				}
			}
		}

		function getCurrentDirectory() {
			return ts.sys.getCurrentDirectory();
		}

		function useCaseSensitiveFileNames() {
			return ts.sys.useCaseSensitiveFileNames;
		}

		function getCanonicalFileName(fileName) {
			return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
		}

		function getNewLine() {
			return ts.sys.newLine;
		}

		return {
			getSourceFile: getSourceFile,
			getDefaultLibFileName: getDefaultLibFileName,
			writeFile: writeFile,
			getCurrentDirectory: getCurrentDirectory,
			useCaseSensitiveFileNames: useCaseSensitiveFileNames,
			getCanonicalFileName: getCanonicalFileName,
			getNewLine: getNewLine
		};
	}
	//#endregion

	function innerCompile(fileNames, options, compilerHost) {
		var program,
			errors,
			emitErrors
			;

		program = ts.createProgram(fileNames, options, compilerHost);
		errors = program.getSyntacticDiagnostics();

		if (errors.length === 0) {
			errors = program.getGlobalDiagnostics();
			if (errors.length === 0) {
				errors = program.getSemanticDiagnostics();
			}
		}

		if (options.noEmit) {
			return errors;
		}

		emitErrors = program.emit().diagnostics;
		errors = ts.concatenate(errors, emitErrors);

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
			message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine);
			file = diagnostic.file;

			if (file) {
				fileName = file.fileName;
				location = ts.getLineAndCharacterOfPosition(file, diagnostic.start);
				lineNumber = location.line + 1;
				columnNumber = location.character + 1;
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
		defaultCompilerHost = createBtCompilerHost();

		compilationErrors = innerCompile([inputFilePath], compilationOptions, defaultCompilerHost).errors || [];
		if (compilationErrors.length === 0) {
			result.compiledCode = ts.sys.readFile(outputFilePath);
		}
		else {
			result.errors = getErrorsFromDiagnostics(compilationErrors);
		}

		ts.sys.dispose();
		ts.sys = null;

		return JSON.stringify(result);
	};

	return exports;
}(ts));