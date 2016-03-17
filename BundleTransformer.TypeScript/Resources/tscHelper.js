/*global ts, VirtualFileManager */
var typeScriptHelper = (function (ts, virtualFileManager, undefined) {
	'use strict';

	var exports = {},
		defaultOptions = {
			allowJs: false,
			allowSyntheticDefaultImports: false,
			allowUnreachableCode: false,
			allowUnusedLabels: false,
			charset: '',
			disableSizeLimit: false,
			emitBOM: false,
			emitDecoratorMetadata: false,
			experimentalDecorators: false,
			forceConsistentCasingInFileNames: false,
			inlineSourceMap: false,
			inlineSources: false,
			mapRoot: '',
			module: 0 /* None */,
			newLine: 0 /* CrLf */,
			noEmit: false,
			noEmitHelpers: false,
			noEmitOnError: false,
			noFallthroughCasesInSwitch: false,
			noImplicitAny: false,
			noImplicitReturns: false,
			noLib: false,
			noResolve: false,
			out: '',
			outDir: '',
			preserveConstEnums: false,
			reactNamespace: '',
			removeComments: false,
			rootDir: '',
			isolatedModules: false,
			sourceMap: false,
			sourceRoot: '',
			skipDefaultLibCheck: false,
			stripInternal: false,
			suppressExcessPropertyErrors: false,
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

	//#region BtSystem class
	BtSystem = (function () {
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = "Method 'ts.sys.{0}' is not implemented.";

		function BtSystem(defaultLibFileName) {
			this.args = [];
			this.newLine = '\r\n';
			this.useCaseSensitiveFileNames = false;

			this._defaultLibFileName = defaultLibFileName;
			this._includedFilePaths = [];
			this._outputFiles = {};
		}

		BtSystem.prototype.write = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'write'));
		};

		BtSystem.prototype.readFile = function (fileName) {
			var canonicalPath = this.getCanonicalPath(fileName);
			if (typeof this._outputFiles[canonicalPath] !== 'undefined') {
				return this._outputFiles[canonicalPath];
			}

			var content = virtualFileManager.ReadFile(fileName);

			if (fileName !== this._defaultLibFileName) {
				this._includedFilePaths.push(fileName);
			}

			return content;
		};

		BtSystem.prototype.writeFile = function (fileName, data) {
			var canonicalPath = this.getCanonicalPath(fileName);
			this._outputFiles[canonicalPath] = data;
		};

		BtSystem.prototype.getCanonicalPath = function(path) {
			return path.toLowerCase();
		};

		BtSystem.prototype.readDirectory = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'readDirectory'));
		};

		BtSystem.prototype.resolvePath = function(path) {
			return path;
		};

		BtSystem.prototype.fileExists = function (path) {
			var canonicalPath = this.getCanonicalPath(path);
			if (typeof this._outputFiles[canonicalPath] !== 'undefined') {
				return true;
			}

			var isFileExists = virtualFileManager.FileExists(path);

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
			var directoryName = virtualFileManager.GetCurrentDirectory();

			return directoryName;
		};

		BtSystem.prototype.exit = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'exit'));
		};

		BtSystem.prototype.getIncludedFilePaths = function () {
			return this._includedFilePaths;
		};

		BtSystem.prototype.dispose = function () {
			this._includedFilePaths = null;
			this._outputFiles = null;
		};

		return BtSystem;
	})();
	//#endregion

	//#region createBtCompilerHost function
	function createBtCompilerHost(options) {
		var newLine = ts.getNewLineCharacter(options);

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
			return newLine;
		}

		function fileExists(fileName) {
			return ts.sys.fileExists(fileName);
		}

		function readFile(fileName) {
			return ts.sys.readFile(fileName);
		}

		function directoryExists(directoryName) {
			return ts.sys.directoryExists(directoryName);
		}

		return {
			getSourceFile: getSourceFile,
			getDefaultLibFileName: getDefaultLibFileName,
			writeFile: writeFile,
			getCurrentDirectory: getCurrentDirectory,
			useCaseSensitiveFileNames: useCaseSensitiveFileNames,
			getCanonicalFileName: getCanonicalFileName,
			getNewLine: getNewLine,
			fileExists: fileExists,
			readFile: readFile,
			directoryExists: directoryExists
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
			errors = program.getOptionsDiagnostics().concat(program.getGlobalDiagnostics());
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

	exports.compile = function (path, options) {
		var result = {
				compiledCode: '',
				includedFilePaths: []
		    },
			compilationErrors,
			compilationOptions,
			inputFilePath = path,
			outputFilePath = inputFilePath.replace(/\.ts$/i, '.js'),
			defaultLibFileName,
			defaultCompilerHost
			;

		options = options || {};
		compilationOptions = mix(mix({}, defaultOptions), options);
		defaultLibFileName = ts.getDefaultLibFileName(compilationOptions);

		// Compile code
		ts.sys = new BtSystem(defaultLibFileName);
		defaultCompilerHost = createBtCompilerHost(compilationOptions);

		compilationErrors = innerCompile([inputFilePath], compilationOptions, defaultCompilerHost).errors || [];
		if (compilationErrors.length === 0) {
			result.compiledCode = ts.sys.readFile(outputFilePath);
			result.includedFilePaths = ts.sys.getIncludedFilePaths();
		}
		else {
			result.errors = getErrorsFromDiagnostics(compilationErrors);
		}

		ts.sys.dispose();
		ts.sys = null;

		return JSON.stringify(result);
	};

	return exports;
}(ts, VirtualFileManager));