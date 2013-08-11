var typeScriptHelper = (function (TypeScript, FileInformation) {
	"use strict";

	var exports = {},
		defaultOptions = {
			propagateEnumConstants: false,
			removeComments: false,
			watch: false,
			noResolve: false,
			allowAutomaticSemicolonInsertion: true,
			noImplicitAny: false,
			noLib: false,
			codeGenTarget: 0 /* EcmaScript3 */,
			moduleGenTarget: 0 /* Unspecified */,
			outFileOption: "",
			outDirOption: "",
			mapSourceFiles: false,
			mapRoot: "",
			sourceRoot: "",
			generateDeclarationFiles: false,
			useCaseSensitiveFileResolution: false,
			gatherDiagnostics: false,
			updateTC: false
		}
		;

	function getCompilationSettings(options) {
		var compilationSettings;

		options = options || {};
		if (typeof options.codeGenTarget === "string") {
			options.codeGenTarget = parseCodeGenTarget(options.codeGenTarget);
		}

		compilationSettings = mix(mix({}, defaultOptions), options);

		return compilationSettings;
	}

	function parseCodeGenTarget(code) {
		var codeGenTarget;

		switch (code) {
			case "EcmaScript3":
				codeGenTarget = 0;
				break;
			case "EcmaScript5":
				codeGenTarget = 1;
				break;
			default:
				throw {
					name: "TypeError",
					message: formatString("ECMAScript target version '{0}' not supported.", code)
				};
		}

		return codeGenTarget;
	}

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

	var NullTextWriter = (function () {
		function NullTextWriter() {
		}

		NullTextWriter.prototype.Write = function () {
		};

		NullTextWriter.prototype.WriteLine = function () {
		};

		NullTextWriter.prototype.Close = function () {
		};

		return NullTextWriter;
	})();

	var IoHost = (function () {
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = "Method 'IoHost.{0}' is not implemented.";

		function IoHost(files) {
			this._files = files;

			this.newLine = "\r\n";
			this.stderr = new NullTextWriter();
			this.stdout = new NullTextWriter();
		}

		IoHost.prototype.readFile = function (path) {
			var key,
				file,
				fileInfo
				;

			key = generateFileCacheItemKey(path);
			if (typeof this._files[key] === "undefined") {
				throw new Error(formatString("File '{0}' does not exist.", path));
			}

			file = this._files[key];
			fileInfo = new FileInformation(file.content, 0);

			return fileInfo;
		};

		IoHost.prototype.writeFile = function (path, contents) {
			var key = generateFileCacheItemKey(path);
			this._files[key] = { path: path, content: contents };
		};

		IoHost.prototype.deleteFile = function (path) {
			var key = generateFileCacheItemKey(path);
			this._files[key] = undefined;
		};

		IoHost.prototype.dir = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "dir"));
		};

		IoHost.prototype.fileExists = function (path) {
			var key,
				isFileExists
				;

			key = generateFileCacheItemKey(path);
			isFileExists = (typeof this._files[key] !== "undefined");

			return isFileExists;
		};

		IoHost.prototype.directoryExists = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "directoryExists"));
		};

		IoHost.prototype.createDirectory = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "createDirectory"));
		};

		IoHost.prototype.resolvePath = function (path) {
			return path;
		};

		IoHost.prototype.dirName = function () {
			return "";
		};

		IoHost.prototype.findFile = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "findFile"));
		};

		IoHost.prototype.print = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "print"));
		};

		IoHost.prototype.printLine = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "printLine"));
		};

		IoHost.prototype.watchFile = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "watchFile"));
		};

		IoHost.prototype.run = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "run"));
		};

		IoHost.prototype.getExecutingFilePath = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "getExecutingFilePath"));
		};

		IoHost.prototype.quit = function () {
			throw new Error(formatString(ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED, "quit"));
		};

		IoHost.prototype.dispose = function () {
			this._files = null;

			this.stderr = null;
			this.stdout = null;
		};

		return IoHost;
	})();

	var SourceFile = (function () {
		function SourceFile(scriptSnapshot, byteOrderMark) {
			this.scriptSnapshot = scriptSnapshot;
			this.byteOrderMark = byteOrderMark;
		}
		return SourceFile;
	})();

	var CustomCompiler = (function () {
		function CustomCompiler(ioHost, compilationSettings) {
			this.ioHost = ioHost;
			this.inputFiles = [];
			this.resolvedFiles = [];
			this.inputFileNameToOutputFileName = new TypeScript.StringHashTable();
			this.fileNameToSourceFile = new TypeScript.StringHashTable();
			this.errors = [];
			this.hasErrors = false;
			this.logger = null;
			this.compilationSettings = compilationSettings;
		}

		CustomCompiler.prototype.compile = function (path) {
			var compiler,
				anySyntacticErrors,
				anySemanticErrors,
				anyEmitErrors
				;

			this.inputFiles.push(path);
			this.logger = new TypeScript.NullLogger();

			this._resolve();

			compiler = new TypeScript.TypeScriptCompiler(this.logger, this.compilationSettings);

			anySyntacticErrors = this._addSourceUnit(compiler);
			if (anySyntacticErrors) {
				return true;
			}

			compiler.pullTypeCheck();

			anySemanticErrors = this._diagnoseSemanticErrors(compiler);
			anyEmitErrors = this._emitAll(compiler);

			if (anyEmitErrors) {
				return true;
			}

			if (anySemanticErrors) {
				return true;
			}

			return false;
		};

		CustomCompiler.prototype._resolve = function () {
			var includeDefaultLibrary,
				resolvedFiles,
				resolutionResults,
				diagnostics,
				diagnosticIndex,
				diagnosticCount,
				libraryResolvedFile
				;

			resolutionResults = TypeScript.ReferenceResolver.resolve(this.inputFiles, this,
				this.compilationSettings);
			resolvedFiles = resolutionResults.resolvedFiles;
			includeDefaultLibrary = !this.compilationSettings.noLib && !resolutionResults.seenNoDefaultLibTag;

			diagnostics = resolutionResults.diagnostics;
			diagnosticCount = diagnostics.length;

			for (diagnosticIndex = 0; diagnosticIndex < diagnosticCount; diagnosticIndex++) {
				this.addDiagnostic(diagnostics[diagnosticIndex]);
			}

			if (includeDefaultLibrary) {
				libraryResolvedFile = {
					path: this.getDefaultLibraryFilePath(),
					referencedFiles: [],
					importedFiles: []
				};

				resolvedFiles = [libraryResolvedFile].concat(resolvedFiles);
			}

			this.resolvedFiles = resolvedFiles;
		};

		CustomCompiler.prototype._addSourceUnit = function (compiler) {
			var anySyntacticErrors = false,
				resolvedFiles,
				resolvedFile,
				resolvedFileIndex,
				resolvedFileCount,
				sourceFile,
				syntacticDiagnostics
				;

			resolvedFiles = this.resolvedFiles;
			resolvedFileCount = resolvedFiles.length;

			for (resolvedFileIndex = 0; resolvedFileIndex < resolvedFileCount; resolvedFileIndex++) {
				resolvedFile = resolvedFiles[resolvedFileIndex];
				sourceFile = this.getSourceFile(resolvedFile.path);
				compiler.addSourceUnit(resolvedFile.path, sourceFile.scriptSnapshot,
					sourceFile.byteOrderMark, 0, false, resolvedFile.referencedFiles);

				syntacticDiagnostics = compiler.getSyntacticDiagnostics(resolvedFile.path);
				compiler.reportDiagnostics(syntacticDiagnostics, this);

				if (syntacticDiagnostics.length > 0) {
					anySyntacticErrors = true;
				}
			}

			return anySyntacticErrors;
		};

		CustomCompiler.prototype._diagnoseSemanticErrors = function (compiler) {
			var anySemanticErrors = false,
				fileNames,
				fileName,
				fileNameIndex,
				fileNameCount,
				semanticDiagnostics
				;

			fileNames = compiler.fileNameToDocument.getAllKeys();
			fileNameCount = fileNames.length;

			for (fileNameIndex = 0; fileNameIndex < fileNameCount; fileNameIndex++) {
				fileName = fileNames[fileNameIndex];
				semanticDiagnostics = compiler.getSemanticDiagnostics(fileName);
				if (semanticDiagnostics.length > 0) {
					anySemanticErrors = true;
					compiler.reportDiagnostics(semanticDiagnostics, this);
				}
			}

			return anySemanticErrors;
		};

		CustomCompiler.prototype._emitAll = function (compiler) {
			var that = this,
				anyEmitErrors,
				mapInputToOutput,
				emitDiagnostics
				;

			mapInputToOutput = function (inputFile, outputFile) {
				that.inputFileNameToOutputFileName.addOrUpdate(inputFile, outputFile);
			};

			emitDiagnostics = compiler.emitAll(this, mapInputToOutput);
			compiler.reportDiagnostics(emitDiagnostics, this);
			anyEmitErrors = (emitDiagnostics.length > 0);

			return anyEmitErrors;
		};

		CustomCompiler.prototype.getSourceFile = function (fileName) {
			var sourceFile = this.fileNameToSourceFile.lookup(fileName);
			if (!sourceFile) {
				var fileInformation = this.ioHost.readFile(fileName);
				var snapshot = TypeScript.ScriptSnapshot.fromString(fileInformation.contents);
				sourceFile = new SourceFile(snapshot, fileInformation.byteOrderMark);

				this.fileNameToSourceFile.add(fileName, sourceFile);
			}

			return sourceFile;
		};

		CustomCompiler.prototype.getDefaultLibraryFilePath = function () {
			return "lib.d.ts";
		};

		CustomCompiler.prototype.getScriptSnapshot = function (fileName) {
			return this.getSourceFile(fileName).scriptSnapshot;
		};

		CustomCompiler.prototype.resolveRelativePath = function (path) {
			return path;
		};

		CustomCompiler.prototype.fileExists = function (path) {
			var result = this.ioHost.fileExists(path);

			return result;
		};

		CustomCompiler.prototype.getParentDirectory = function (path) {
			return this.ioHost.dirName(path);
		};

		CustomCompiler.prototype.addDiagnostic = function (diagnostic) {
			var lineNumber = 0,
				columnNumber = 0
				;

			this.hasErrors = true;

			if (diagnostic.fileName()) {
				var scriptSnapshot = this.getScriptSnapshot(diagnostic.fileName());
				var lineMap = new TypeScript.LineMap(scriptSnapshot.getLineStartPositions(), 
					scriptSnapshot.getLength());
				var lineCol = { line: -1, character: -1 };
				lineMap.fillLineAndCharacterFromPosition(diagnostic.start(), lineCol);

				lineNumber = lineCol.line + 1;
				columnNumber = lineCol.character + 1;
			}

			this.errors.push({
				"message": diagnostic.message(),
				"fileName": diagnostic.fileName(),
				"lineNumber": lineNumber,
				"columnNumber": columnNumber
			});
		};

		CustomCompiler.prototype.writeFile = function (fileName, contents) {
			this.ioHost.writeFile(fileName, contents);
		};

		CustomCompiler.prototype.directoryExists = function (path) {
			var result = this.ioHost.directoryExists(path);

			return result;
		};

		CustomCompiler.prototype.resolvePath = function (path) {
			var result = this.ioHost.resolvePath(path);

			return result;
		};

		CustomCompiler.prototype.dispose = function () {
			this.ioHost = null;
			this.inputFiles = null;
			this.resolvedFiles = null;
			this.inputFileNameToOutputFileName = null;
			this.fileNameToSourceFile = null;
			this.errors = null;
			this.hasErrors = false;
			this.logger = null;
			this.compilationSettings = null;
		};

		return CustomCompiler;
	})();

	exports.compile = function (code, path, dependencies, options) {
		var result = { compiledCode: "" },
			inputFilePath = path,
			inputFileKey,
			outputFilePath = inputFilePath.replace(/\.ts$/i, ".js"),
			outputFileInformation,
			files,
			dependency,
			dependencyIndex,
			dependencyCount,
			dependencyKey,
			ioHost,
			customCompiler,
			anyCompilationErrors
			;

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
		ioHost = new IoHost(files);

		customCompiler = new CustomCompiler(ioHost, getCompilationSettings(options));
		anyCompilationErrors = customCompiler.compile(inputFilePath);

		if (!anyCompilationErrors) {
			outputFileInformation = ioHost.readFile(outputFilePath);
			if (outputFileInformation) {
				result.compiledCode = outputFileInformation.contents;
			}
		}
		else {
			result.errors = customCompiler.errors;
		}

		customCompiler.dispose();
		ioHost.dispose();

		return JSON.stringify(result);
	};

	return exports;
} (TypeScript, FileInformation));