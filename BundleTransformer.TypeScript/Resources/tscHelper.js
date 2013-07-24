var typeScriptHelper = (function (TypeScript, FileInformation) {
	"use strict";

	var exports = {},
		defaultOptions = {
			propagateConstants: false,
			minWhitespace: false,
			emitComments: true,
			watch: false,
			exec: false,
			resolve: true,
			disallowBool: false,
			allowAutomaticSemicolonInsertion: true,
			allowModuleKeywordInExternalModuleReference: true,
			useDefaultLib: true,
			codeGenTarget: 0 /* EcmaScript3 */,
			moduleGenTarget: 0 /* Synchronous */,
			outputOption: "",
			mapSourceFiles: false,
			emitFullSourceMapPath: false,
			generateDeclarationFiles: false,
			useCaseSensitiveFileResolution: false,
			gatherDiagnostics: false,
			updateTC: false,
			implicitAny: false
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

			this.arguments = [];
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

			this.arguments = null;
			this.stderr = null;
			this.stdout = null;
		};

		return IoHost;
	})();

	var ErrorReporter = (function () {
		function ErrorReporter(ioHost, compilationEnvironment) {
			this.ioHost = ioHost;
			this.setCompilationEnvironment(compilationEnvironment);
			this.errors = [];
			this.hasErrors = false;
		}

		ErrorReporter.prototype.addDiagnostic = function (diagnostic) {
			var lineNumber = 0,
				columnNumber = 0,
				soruceUnit,
				lineMap,
				lineCol
				;

			this.hasErrors = true;

			if (diagnostic.fileName()) {
				soruceUnit = this.compilationEnvironment.getSourceUnit(diagnostic.fileName());
				if (!soruceUnit) {
					soruceUnit = new TypeScript.SourceUnit(diagnostic.fileName(),
						this.ioHost.readFile(diagnostic.fileName()));
				}
				lineMap = new TypeScript.LineMap(soruceUnit.getLineStartPositions(), soruceUnit.getLength());
				lineCol = { line: -1, character: -1 };
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

		ErrorReporter.prototype.setCompilationEnvironment = function (compilationEnvironment) {
			this.compilationEnvironment = compilationEnvironment;
		};

		ErrorReporter.prototype.reset = function () {
			this.errors = [];
			this.hasErrors = false;
		};

		ErrorReporter.prototype.dispose = function () {
			this.ioHost = null;
			this.setCompilationEnvironment(null);
			this.errors = null;
			this.hasErrors = false;
		};

		return ErrorReporter;
	})();

	var CommandLineHost = (function () {
		function CommandLineHost(errorReporter) {
			this.errorReporter = errorReporter;
			this.pathMap = {};
			this.resolvedPaths = {};
		}

		CommandLineHost.prototype.getPathIdentifier = function (path) {
			return path.toLocaleUpperCase();
		};

		CommandLineHost.prototype.isResolved = function (path) {
			return this.resolvedPaths[this.getPathIdentifier(this.pathMap[path])] !== undefined;
		};

		CommandLineHost.prototype.resolveCompilationEnvironment = function (preEnv, resolver) {
			var that = this,
				path,
				resolvedEnv,
				resolvedCodeList,
				preCodeList,
				preCodeIndex,
				preCodeCount,
				resolutionDispatcher
				;

			resolvedEnv = new TypeScript.CompilationEnvironment(preEnv.compilationSettings, preEnv.ioHost);

			preCodeList = preEnv.code;
			preCodeCount = preCodeList.length;

			this.errorReporter.setCompilationEnvironment(resolvedEnv);

			resolvedCodeList = resolvedEnv.code;

			resolutionDispatcher = {
				errorReporter: this.errorReporter,
				postResolution: function (path, code) {
					var pathId = that.getPathIdentifier(path);
					if (!that.resolvedPaths[pathId]) {
						resolvedCodeList.push(code);
						that.resolvedPaths[pathId] = true;
					}
				}
			};

			for (preCodeIndex = 0; preCodeIndex < preCodeCount; preCodeIndex++) {
				path = TypeScript.switchToForwardSlashes(preEnv.ioHost.resolvePath(preCodeList[preCodeIndex].path));
				this.pathMap[preCodeList[preCodeIndex].path] = path;
				resolver.resolveCode(path, "", false, resolutionDispatcher);
			}

			return resolvedEnv;
		};

		CommandLineHost.prototype.dispose = function () {
			this.errorReporter = null;
			this.pathMap = null;
			this.resolvedPaths = null;
		};

		return CommandLineHost;
	})();

	var EmitterIoHost = (function () {
		function EmitterIoHost(ioHost) {
			this._ioHost = ioHost;
		}

		EmitterIoHost.prototype.writeFile = function (fileName, contents, writeByteOrderMark) {
			this._ioHost.writeFile(fileName, contents, writeByteOrderMark);
		};

		EmitterIoHost.prototype.directoryExists = function (path) {
			return this._ioHost.directoryExists(path);
		};

		EmitterIoHost.prototype.fileExists = function (path) {
			return this._ioHost.fileExists(path);
		};

		EmitterIoHost.prototype.resolvePath = function (path) {
			return path;
		};

		EmitterIoHost.prototype.dispose = function () {
			this._ioHost = null;
		};

		return EmitterIoHost;
	})();

	var CustomCompiler = (function () {
		function CustomCompiler(ioHost, compilationSettings) {
			this.ioHost = ioHost;
			this.resolvedEnvironment = null;
			this.compilationSettings = compilationSettings;
			this.compilationEnvironment = new TypeScript.CompilationEnvironment(this.compilationSettings, this.ioHost);
			this.errorReporter = new ErrorReporter(this.ioHost, this.compilationEnvironment);
		}

		CustomCompiler.prototype._resolve = function () {
			var resolver,
				compilationEnvironment,
				errorReporter,
				commandLineHost,
				ret,
				codeList,
				codeIndex,
				codeCount,
				path
				;

			compilationEnvironment = this.compilationEnvironment;
			errorReporter = this.errorReporter;
			resolver = new TypeScript.CodeResolver(compilationEnvironment);
			commandLineHost = new CommandLineHost(errorReporter);
			ret = commandLineHost.resolveCompilationEnvironment(compilationEnvironment, resolver, true);

			codeList = compilationEnvironment.code;
			codeCount = codeList.length;

			for (codeIndex = 0; codeIndex < codeCount; codeIndex++) {
				path = codeList[codeIndex].path;

				if (!commandLineHost.isResolved(path)) {
					if (!TypeScript.isTSFile(path) && !TypeScript.isDTSFile(path)) {
						errorReporter.addDiagnostic(new TypeScript.Diagnostic(null, 0, 0, 269 /* Unknown_extension_for_file___0__Only__ts_and_d_ts_extensions_are_allowed */, [path]));
					}
					else {
						errorReporter.addDiagnostic(new TypeScript.Diagnostic(null, 0, 0, 268 /* Could_not_find_file___0_ */, [path]));
					}
				}
			}

			commandLineHost.dispose();

			return ret;
		};

		CustomCompiler.prototype._addSourceUnit = function (compiler) {
			var anySyntacticErrors = false,
				codeList,
				codeCount,
				codeIndex,
				code,
				path,
				fileInfo,
				syntacticDiagnostics
				;

			codeList = this.resolvedEnvironment.code;
			codeCount = codeList.length;

			for (codeIndex = 0; codeIndex < codeCount; codeIndex++) {
				code = codeList[codeIndex];
				path = code.path;
				fileInfo = code.fileInformation;

				if (code.fileInformation !== null) {
					compiler.addSourceUnit(path,
						TypeScript.ScriptSnapshot.fromString(fileInfo.contents()),
						fileInfo.byteOrderMark(),
						0,
						false,
						code.referencedFiles
					);

					syntacticDiagnostics = compiler.getSyntacticDiagnostics(path);
					compiler.reportDiagnostics(syntacticDiagnostics, this.errorReporter);

					if (syntacticDiagnostics.length > 0) {
						anySyntacticErrors = true;
					}
				}
			}

			return anySyntacticErrors;
		};

		CustomCompiler.prototype._diagnoseSemanticErrors = function (compiler) {
			var anySemanticErrors = false,
				fileNames,
				fileNameCount,
				fileNameIndex,
				fileName,
				semanticDiagnostics
				;

			fileNames = compiler.fileNameToDocument.getAllKeys();
			fileNameCount = fileNames.length;

			for (fileNameIndex = 0; fileNameIndex < fileNameCount; fileNameIndex++) {
				fileName = fileNames[fileNameIndex];
				semanticDiagnostics = compiler.getSemanticDiagnostics(fileName);

				if (semanticDiagnostics.length > 0) {
					anySemanticErrors = true;
					compiler.reportDiagnostics(semanticDiagnostics, this.errorReporter);
				}
			}

			return anySemanticErrors;
		};

		CustomCompiler.prototype._emitAll = function (compiler) {
			var that = this,
				anyEmitErrors,
				emitterIoHost,
				mapInputToOutput,
				emitDiagnostics
				;

			emitterIoHost = new EmitterIoHost(this.ioHost);
			mapInputToOutput = function (inputFile, outputFile) {
				that.resolvedEnvironment.inputFileNameToOutputFileName.addOrUpdate(inputFile, outputFile);
			};

			emitDiagnostics = compiler.emitAll(emitterIoHost, mapInputToOutput);
			compiler.reportDiagnostics(emitDiagnostics, this.errorReporter);

			anyEmitErrors = (emitDiagnostics.length > 0);

			emitterIoHost.dispose();

			return anyEmitErrors;
		};

		CustomCompiler.prototype.compile = function (path) {
			var codeList,
				logger,
				compiler,
				anySyntacticErrors,
				anySemanticErrors,
				anyEmitErrors
				;

			codeList = this.compilationEnvironment.code;
			if (this.compilationSettings.useDefaultLib) {
				codeList.push(new TypeScript.SourceUnit("lib.d.ts", null));
			}
			codeList.push(new TypeScript.SourceUnit(path, null));

			this.resolvedEnvironment = this._resolve();

			logger = new TypeScript.NullLogger();
			compiler = new TypeScript.TypeScriptCompiler(logger, this.compilationSettings, null);

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

		CustomCompiler.prototype.dispose = function () {
			this.ioHost = null;
			this.resolvedEnvironment = null;
			this.compilationSettings = null;
			this.compilationEnvironment = null;

			this.errorReporter.dispose();
			this.errorReporter = null;
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
				result.compiledCode = outputFileInformation.contents();
			}
		}
		else {
			result.errors = customCompiler.errorReporter.errors;
		}

		customCompiler.dispose();
		ioHost.dispose();

		return JSON.stringify(result);
	};

	return exports;
} (TypeScript, FileInformation));