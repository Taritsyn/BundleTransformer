/*global ts, VirtualFileManager */
var typeScriptHelper = (function (virtualFileManager, undefined) {
	'use strict';

	var exports = {},
		globals = typeof globalThis !== "undefined" ? globalThis :
			typeof global !== "undefined" ? global :
				typeof self !== "undefined" ? self :
					Function('return this')(),
		defaultOptions = {
			allowArbitraryExtensions: false,
			allowImportingTsExtensions: false,
			allowJs: false,
			allowSyntheticDefaultImports: false,
			allowUmdGlobalAccess: false,
			baseUrl: '',
			composite: false,
			customConditions: null,
			declarationDir: '',
			declarationMap: false,
			emitBOM: false,
			emitDecoratorMetadata: false,
			esModuleInterop: false,
			experimentalDecorators: false,
			importHelpers: false,
			inlineSourceMap: false,
			inlineSources: false,
			jsxFactory: false,
			jsxFragmentFactory: '',
			jsxImportSource: '',
			libReplacement: false,
			mapRoot: '',
			module: 0 /* None */,
			moduleResolution: 1 /* Classic */,
			noUncheckedSideEffectImports: false,
			outDir: '',
			preserveSymlinks: false,
			reactNamespace: '',
			resolveJsonModule: false,
			resolvePackageJsonExports: false,
			resolvePackageJsonImports: false,
			rootDir: '',
			isolatedDeclarations: false,
			isolatedModules: false,
			sourceMap: false,
			sourceRoot: '',
			verbatimModuleSyntax: false
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
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = 'Method \'sys.{0}\' is not implemented.';

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
			var canonicalFileName = this.getCanonicalFileName(fileName);
			if (typeof this._outputFiles[canonicalFileName] !== 'undefined') {
				return this._outputFiles[canonicalFileName];
			}

			var content = virtualFileManager.ReadFile(fileName);

			if (fileName.length > 0 && fileName.charAt(0) === '/'
				&& fileName !== this._defaultLibFileName) {
				this._includedFilePaths.push(fileName);
			}

			return content;
		};

		BtSystem.prototype.writeFile = function (fileName, data) {
			var canonicalFileName = this.getCanonicalFileName(fileName);
			this._outputFiles[canonicalFileName] = data;
		};

		BtSystem.prototype.resolvePath = function(path) {
			return path;
		};

		BtSystem.prototype.fileExists = function (fileName) {
			var canonicalFileName = this.getCanonicalFileName(fileName);
			if (typeof this._outputFiles[canonicalFileName] !== 'undefined') {
				return true;
			}

			var isFileExists = virtualFileManager.FileExists(fileName);

			return isFileExists;
		};

		BtSystem.prototype.deleteFile = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'deleteFile'));
		};

		BtSystem.prototype.getModifiedTime = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'getModifiedTime'));
		};

		BtSystem.prototype.setModifiedTime = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'setModifiedTime'));
		};

		BtSystem.prototype.directoryExists = function() {
			return true;
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

		BtSystem.prototype.getDirectories = null;

		BtSystem.prototype.getEnvironmentVariable = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'getEnvironmentVariable'));
		};

		BtSystem.prototype.readDirectory = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'readDirectory'));
		};

		BtSystem.prototype.exit = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'exit'));
		};

		BtSystem.prototype.realpath = function() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, 'realpath'));
		};

		BtSystem.prototype.getCanonicalFileName = function(fileName) {
			return this.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
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

	//#region createBtCompilerHostWorker function
	function createBtCompilerHostWorker(options, setParentNodes, system) {
		if (system === void 0){
			system = globals.sys;
		}

		var compilerHost,
			newLine = globals.getNewLineCharacter(options, function () { return system.newLine; })
			;

		function getSourceFile(fileName, languageVersionOrOptions, onError) {
			var text;

			try {
				text = system.readFile(fileName);
			}
			catch (e) {
				if (onError) {
					onError(e.message);
				}

				text = '';
			}

			return (typeof text !== 'undefined') ?
				globals.createSourceFile(fileName, text, languageVersionOrOptions, false) : undefined;
		}

		function getDefaultLibLocation() {
			return '';
		}

		function getDefaultLibFileName(options) {
			return globals.getDefaultLibFileName(options);
		}

		function writeFile(fileName, data, writeByteOrderMark, onError) {
			try {
				system.writeFile(fileName, data, writeByteOrderMark);
			}
			catch (e) {
				if (onError) {
					onError(e.message);
				}
			}
		}

		function getCurrentDirectory() {
			return system.getCurrentDirectory();
		}

		function useCaseSensitiveFileNames() {
			return system.useCaseSensitiveFileNames;
		}

		function getCanonicalFileName(fileName) {
			return system.getCanonicalFileName(fileName);
		}

		function getNewLine() {
			return newLine;
		}

		function fileExists(fileName) {
			return system.fileExists(fileName);
		}

		function readFile(fileName) {
			return system.readFile(fileName);
		}

		function trace() { }

		function directoryExists(directoryName) {
			return system.directoryExists(directoryName);
		}

		function getEnvironmentVariable(name) {
			return system.getEnvironmentVariable ? system.getEnvironmentVariable(name) : '';
		}

		compilerHost = {
			getSourceFile: getSourceFile,
			getDefaultLibLocation: getDefaultLibLocation,
			getDefaultLibFileName: getDefaultLibFileName,
			writeFile: writeFile,
			getCurrentDirectory: getCurrentDirectory,
			useCaseSensitiveFileNames: useCaseSensitiveFileNames,
			getCanonicalFileName: getCanonicalFileName,
			getNewLine: getNewLine,
			fileExists: fileExists,
			readFile: readFile,
			trace: trace,
			directoryExists: directoryExists,
			getEnvironmentVariable: getEnvironmentVariable,
			getDirectories: null,
			realpath: null,
			readDirectory: null,
			createDirectory: null,
			createHash: null
		};

		return compilerHost;
	}
	//#endregion

	function innerCompile(fileNames, options, compilerHost) {
		var program,
			diagnostics,
			allowTypeCheckingErrors = !options.suppressTypeCheckingErrors
			;

		program = globals.createProgram(fileNames, options, compilerHost);

		diagnostics = program.getSyntacticDiagnostics();
		if (diagnostics.length === 0) {
			diagnostics = program.getOptionsDiagnostics();
			if (allowTypeCheckingErrors) {
				diagnostics = diagnostics.concat(program.getGlobalDiagnostics());
				if (diagnostics.length === 0) {
					diagnostics = program.getSemanticDiagnostics();
				}
			}
		}

		var emitOutput = program.emit();
		if (allowTypeCheckingErrors) {
			diagnostics = diagnostics.concat(emitOutput.diagnostics);
			diagnostics = globals.sortAndDeduplicateDiagnostics(diagnostics);
		}

		return {
			program: program,
			errors: diagnostics
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
			message = globals.flattenDiagnosticMessageText(diagnostic.messageText, globals.sys.newLine);
			file = diagnostic.file;

			if (file) {
				fileName = file.fileName;
				location = globals.getLineAndCharacterOfPosition(file, diagnostic.start);
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
		if (compilationOptions.transpileOnly) {
			compilationOptions.noLib = true;
			compilationOptions.noResolve = true;
			compilationOptions.suppressTypeCheckingErrors = true;
		}
		defaultLibFileName = globals.getDefaultLibFileName(compilationOptions);

		// Compile code
		globals.sys = new BtSystem(defaultLibFileName);
		defaultCompilerHost = createBtCompilerHostWorker(compilationOptions, null, globals.sys);

		compilationErrors = innerCompile([inputFilePath], compilationOptions, defaultCompilerHost).errors || [];
		if (compilationErrors.length === 0) {
			result.compiledCode = globals.sys.readFile(outputFilePath);
			result.includedFilePaths = globals.sys.getIncludedFilePaths();
		}
		else {
			result.errors = getErrorsFromDiagnostics(compilationErrors);
		}

		globals.sys.dispose();
		globals.sys = null;

		return JSON.stringify(result);
	};

	return exports;
}(VirtualFileManager));