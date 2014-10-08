var typeScriptHelper = (function (ts, sys) {
	"use strict";

	var exports = {},
		defaultOptions = {
			charset: "",
			emitBOM: false,
			mapRoot: "",
			module: 0 /* None */,
			noImplicitAny: false,
			noLib: false,
			noResolve: false,
			out: "",
			outDir: "",
			removeComments: false,
			sourceMap: false,
			sourceRoot: "",
			target: 0 /* ES3 */
		}
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
			regex = new RegExp("\\{" + argumentIndex + "\\}", "gm");
			argument = arguments[argumentIndex + 1];

			result = result.replace(regex, argument);
		}

		return result;
	}

	function generateFileCacheItemKey(path) {
		var key = path.toLocaleUpperCase();

		return key;
	}

	function getBundleTransformerSystem(files) {
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = "Method 'sys.{0}' is not implemented.";

		function write() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "write"));
		}

		function readFile(fileName) {
			var key,
				content
				;

			key = generateFileCacheItemKey(fileName);

			if (typeof files[key] !== "undefined") {
				content = files[key].content;
			}
			else {
				content = undefined;
			}

			return content;
		}

		function writeFile(fileName, data) {
			var key = generateFileCacheItemKey(fileName);
			
			files[key] = { path: fileName, content: data };
		}

		function resolvePath(path) {
			return path;
		}

		function fileExists(path) {
			var key,
				isFileExists
				;

			key = generateFileCacheItemKey(path);
			isFileExists = (typeof files[key] !== "undefined");

			return isFileExists;
		}

		function directoryExists() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "directoryExists"));
		}

		function createDirectory() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "createDirectory"));
		}

		function getExecutingFilePath() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "getExecutingFilePath"));
		}

		function getCurrentDirectory() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "getCurrentDirectory"));
		}

		function exit() {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "exit"));
		}

		return {
			args: [],
			newLine: "\r\n",
			useCaseSensitiveFileNames: false,
			write: write,
			readFile: readFile,
			writeFile: writeFile,
			resolvePath: resolvePath,
			fileExists: fileExists,
			directoryExists: directoryExists,
			createDirectory: createDirectory,
			getExecutingFilePath: getExecutingFilePath,
			getCurrentDirectory: getCurrentDirectory,
			exit: exit
		};
	}

	function createCompilerHost() {
		function getSourceFile(filename, languageVersion, onError) {
			var text;

			try {
				text = sys.readFile(filename);
			}
			catch (e) {
				if (onError) {
					onError(e.message);
				}

				text = "";
			}

			return (typeof text !== "undefined") ? ts.createSourceFile(filename, text, languageVersion, "0") : undefined;
		}

		function getDefaultLibFilename() {
			return "lib.d.ts";
		}

		function writeFile(fileName, data, writeByteOrderMark, onError) {
			try {
				sys.writeFile(fileName, data, writeByteOrderMark);
			}
			catch (e) {
				if (onError) {
					onError(e.message);
				}
			}
		}

		function getCurrentDirectory() {
			return sys.getCurrentDirectory();
		}

		function useCaseSensitiveFileNames() {
			return sys.useCaseSensitiveFileNames;
		}

		function getCanonicalFileName(fileName) {
			return sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
		}

		function getNewLine() {
			return sys.newLine;
		}

		return {
			getSourceFile: getSourceFile,
			getDefaultLibFilename: getDefaultLibFilename,
			writeFile: writeFile,
			getCurrentDirectory: getCurrentDirectory,
			useCaseSensitiveFileNames: useCaseSensitiveFileNames,
			getCanonicalFileName: getCanonicalFileName,
			getNewLine: getNewLine
		};
	}

	function innerCompile(fileNames, options, compilerHost) {
		var program,
			errors,
			checker,
			semanticErrors,
			emitErrors
			;

		program = ts.createProgram(fileNames, options, compilerHost);
		errors = program.getDiagnostics();
		
		if (errors.length === 0) {
			checker = program.getTypeChecker(true);
			semanticErrors = checker.getDiagnostics();
			emitErrors = checker.emitFiles().errors;

			errors = ts.concatenate(semanticErrors, emitErrors);
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
			fileName = "",
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
					"message": message,
					"fileName": fileName,
					"lineNumber": lineNumber,
					"columnNumber": columnNumber
				});
			}
		}

		return errors;
	}

	exports.compile = function (code, path, dependencies, options) {
		var result = { compiledCode: "" },
			compilationErrors,
			compilationOptions,
			inputFilePath = path,
			inputFileKey,
			outputFilePath = inputFilePath.replace(/\.ts$/i, ".js"),
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
		sys = getBundleTransformerSystem(files);
		defaultCompilerHost = createCompilerHost(compilationOptions);

		compilationErrors = innerCompile([inputFilePath], compilationOptions, defaultCompilerHost).errors;
		if (compilationErrors.length === 0) {
			result.compiledCode = sys.readFile(outputFilePath);
		}
		else {
			result.errors = getErrorsFromDiagnostics(compilationErrors);
		}

		sys = null;

		return JSON.stringify(result);
	};

	return exports;
}(ts, sys));