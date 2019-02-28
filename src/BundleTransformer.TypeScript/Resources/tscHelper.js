/*global ts, VirtualFileManager */
var typeScriptHelper = (function (ts, virtualFileManager, undefined) {
	'use strict';

	var exports = {},
		defaultOptions = {
			allowJs: false,
			allowSyntheticDefaultImports: false,
			allowUnreachableCode: false,
			allowUnusedLabels: false,
			alwaysStrict: false,
			baseUrl: '',
			charset: '',
			composite: false,
			declarationDir: '',
			declarationMap: false,
			disableSizeLimit: false,
			downlevelIteration: false,
			emitBOM: false,
			emitDecoratorMetadata: false,
			esModuleInterop: false,
			experimentalDecorators: false,
			forceConsistentCasingInFileNames: false,
			importHelpers: false,
			inlineSourceMap: false,
			inlineSources: false,
			jsxFactory: false,
			keyofStringsOnly: false,
			lib: null,
			mapRoot: '',
			module: ts.ModuleKind.None,
			newLine: 0 /* CrLf */,
			noEmit: false,
			noEmitHelpers: false,
			noEmitOnError: false,
			noErrorTruncation: false,
			noFallthroughCasesInSwitch: false,
			noImplicitAny: false,
			noImplicitReturns: false,
			noImplicitThis: false,
			noImplicitUseStrict: false,
			noLib: false,
			noResolve: false,
			noStrictGenericChecks: false,
			noUnusedLocals: false,
			noUnusedParameters: false,
			out: '',
			outDir: '',
			preserveConstEnums: false,
			preserveSymlinks: false,
			reactNamespace: '',
			removeComments: false,
			resolveJsonModule: false,
			rootDir: '',
			isolatedModules: false,
			sourceMap: false,
			sourceRoot: '',
			skipDefaultLibCheck: false,
			skipLibCheck: false,
			strictBindCallApply: false,
			strictNullChecks: false,
			strictFunctionTypes: false,
			strictPropertyInitialization: false,
			stripInternal: false,
			suppressExcessPropertyErrors: false,
			suppressImplicitAnyIndexErrors: false,
			suppressTypeCheckingErrors: false,
			target: 0 /* ES3 */,
			transpileOnly: false
		},
		libEntries = [
			['es5', 'lib.es5.d.ts'],
			['es6', 'lib.es2015.d.ts'],
			['es2015', 'lib.es2015.d.ts'],
			['es7', 'lib.es2016.d.ts'],
			['es2016', 'lib.es2016.d.ts'],
			['es2017', 'lib.es2017.d.ts'],
			['es2018', 'lib.es2018.d.ts'],
			['esnext', 'lib.esnext.d.ts'],
			['dom', 'lib.dom.d.ts'],
			['dom.iterable', 'lib.dom.iterable.d.ts'],
			['webworker', 'lib.webworker.d.ts'],
			['webworker.importscripts', 'lib.webworker.importscripts.d.ts'],
			['scripthost', 'lib.scripthost.d.ts'],
			['es2015.core', 'lib.es2015.core.d.ts'],
			['es2015.collection', 'lib.es2015.collection.d.ts'],
			['es2015.generator', 'lib.es2015.generator.d.ts'],
			['es2015.iterable', 'lib.es2015.iterable.d.ts'],
			['es2015.promise', 'lib.es2015.promise.d.ts'],
			['es2015.proxy', 'lib.es2015.proxy.d.ts'],
			['es2015.reflect', 'lib.es2015.reflect.d.ts'],
			['es2015.symbol', 'lib.es2015.symbol.d.ts'],
			['es2015.symbol.wellknown', 'lib.es2015.symbol.wellknown.d.ts'],
			['es2016.array.include', 'lib.es2016.array.include.d.ts'],
			['es2017.object', 'lib.es2017.object.d.ts'],
			['es2017.sharedmemory', 'lib.es2017.sharedmemory.d.ts'],
			['es2017.string', 'lib.es2017.string.d.ts'],
			['es2017.intl', 'lib.es2017.intl.d.ts'],
			['es2017.typedarrays', 'lib.es2017.typedarrays.d.ts'],
			['es2018.intl', 'lib.es2018.intl.d.ts'],
			['es2018.promise', 'lib.es2018.promise.d.ts'],
			['es2018.regexp', 'lib.es2018.regexp.d.ts'],
			['esnext.array', 'lib.esnext.array.d.ts'],
			['esnext.symbol', 'lib.esnext.symbol.d.ts'],
			['esnext.asynciterable', 'lib.esnext.asynciterable.d.ts'],
			['esnext.intl', 'lib.esnext.intl.d.ts'],
			['esnext.bigint', 'lib.esnext.bigint.d.ts']
		],
		BtSystem
		;

	ts.libs = libEntries.map(function (entry) { return entry[0]; });
	ts.libMap = ts.createMapFromEntries(libEntries);

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
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = 'Method \'ts.sys.{0}\' is not implemented.';

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
			system = ts.sys;
		}

		var compilerHost,
			newLine = ts.getNewLineCharacter(options, function () { return system.newLine; })
			;

		function getSourceFile(fileName, languageVersion, onError) {
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
				ts.createSourceFile(fileName, text, languageVersion, false) : undefined;
		}

		function getDefaultLibLocation() {
			return '';
		}

		function getDefaultLibFileName(options) {
			return ts.getDefaultLibFileName(options);
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
			createDirectory: null
		};

		return compilerHost;
	}
	//#endregion

	function innerCompile(fileNames, options, compilerHost) {
		var program,
			diagnostics,
			allowTypeCheckingErrors = !options.suppressTypeCheckingErrors
			;

		program = ts.createProgram(fileNames, options, compilerHost);

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
			diagnostics = ts.sortAndDeduplicateDiagnostics(diagnostics);
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
		if (compilationOptions.transpileOnly) {
			compilationOptions.noLib = true;
			compilationOptions.noResolve = true;
			compilationOptions.suppressTypeCheckingErrors = true;
		}
		defaultLibFileName = ts.getDefaultLibFileName(compilationOptions);

		// Compile code
		ts.sys = new BtSystem(defaultLibFileName);
		defaultCompilerHost = createBtCompilerHostWorker(compilationOptions, null, ts.sys);

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