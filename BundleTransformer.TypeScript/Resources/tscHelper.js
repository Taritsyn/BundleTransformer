var typeScriptHelper = (function (typeScript) {
	"use strict";

	var exports = {};

	var defaultOptions = {
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
	};

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
			result = result.replace(regex, function () {
				return argument;
			});
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
		var ERROR_MSG_PATTERN_METHOD_NOT_SUPPORTED = "Method 'IoHost.{0}' is not supported.";

		function IoHost(files) {
			this._files = files;

			this.arguments = [];
			this.stderr = new NullTextWriter();
			this.stdout = new NullTextWriter();
		}

		IoHost.prototype.readFile = function (path) {
			var key = generateFileCacheItemKey(path);
			if (typeof this._files[key] === "undefined") {
				throw new Error(formatString("File '{0}' does not exist.", path));
			}

			var file = this._files[key];

			return new FileInformation(file.content, 0);
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
			var key = generateFileCacheItemKey(path);

			return (typeof this._files[key] !== "undefined");
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
				columnNumber = 0
				;

			this.hasErrors = true;

			if (diagnostic.fileName()) {
				var soruceUnit = this.compilationEnvironment.getSourceUnit(diagnostic.fileName());
				if (!soruceUnit) {
					soruceUnit = new typeScript.SourceUnit(diagnostic.fileName(), this.ioHost.readFile(diagnostic.fileName()));
				}
				var lineMap = new typeScript.LineMap(soruceUnit.getLineStartPositions(), soruceUnit.getLength());
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
		function CommandLineHost(compilationSettings, errorReporter) {
			this.compilationSettings = compilationSettings;
			this.errorReporter = errorReporter;
			this.pathMap = {};
			this.resolvedPaths = {};
		}
		CommandLineHost.prototype.getPathIdentifier = function (path) {
			return this.compilationSettings.useCaseSensitiveFileResolution ? path : path.toLocaleUpperCase();
		};

		CommandLineHost.prototype.isResolved = function (path) {
			return this.resolvedPaths[this.getPathIdentifier(this.pathMap[path])] != undefined;
		};

		CommandLineHost.prototype.resolveCompilationEnvironment = function (preEnv, resolver) {
			var _this = this;
			var resolvedEnv = new typeScript.CompilationEnvironment(preEnv.compilationSettings, preEnv.ioHost);

			var nCode = preEnv.code.length;
			var path;

			this.errorReporter.setCompilationEnvironment(resolvedEnv);

			var resolutionDispatcher = {
				errorReporter: this.errorReporter,
				postResolution: function (path, code) {
					var pathId = _this.getPathIdentifier(path);
					if (!_this.resolvedPaths[pathId]) {
						resolvedEnv.code.push(code);
						_this.resolvedPaths[pathId] = true;
					}
				}
			};

			for (var i = 0; i < nCode; i++) {
				path = typeScript.switchToForwardSlashes(preEnv.ioHost.resolvePath(preEnv.code[i].path));
				this.pathMap[preEnv.code[i].path] = path;
				resolver.resolveCode(path, "", false, resolutionDispatcher);
			}

			return resolvedEnv;
		};

		CommandLineHost.prototype.dispose = function () {
			this.compilationSettings = null;
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

	var BatchCompiler = (function () {
		function BatchCompiler(ioHost, compilationSettings) {
			this.ioHost = ioHost;
			this.resolvedEnvironment = null;
			this.hasResolveErrors = false;
			this.compilerVersion = "0.9.0.1";
			this.printedVersion = false;
			this.compilationSettings = compilationSettings;
			this.compilationEnvironment = new typeScript.CompilationEnvironment(this.compilationSettings, this.ioHost);
			this.errorReporter = new ErrorReporter(this.ioHost, this.compilationEnvironment);
		}

		BatchCompiler.prototype.batchCompile = function (path) {
			var code = this.compilationEnvironment.code;

			if (this.compilationSettings.useDefaultLib) {
				code.push(new typeScript.SourceUnit("lib.d.ts", null));
			}
			code.push(new typeScript.SourceUnit(path, null));

			this.resolvedEnvironment = this.compilationSettings.resolve ?
				this.resolve() : this.compilationEnvironment;
			this.compile();
		};

		BatchCompiler.prototype.resolve = function () {
			var resolver = new typeScript.CodeResolver(this.compilationEnvironment);
			var commandLineHost = new CommandLineHost(this.compilationSettings, this.errorReporter);
			var ret = commandLineHost.resolveCompilationEnvironment(this.compilationEnvironment, resolver, true);

			for (var i = 0; i < this.compilationEnvironment.code.length; i++) {
				if (!commandLineHost.isResolved(this.compilationEnvironment.code[i].path)) {
					var path = this.compilationEnvironment.code[i].path;
					if (!typeScript.isTSFile(path) && !typeScript.isDTSFile(path)) {
						this.errorReporter.addDiagnostic(new typeScript.Diagnostic(null, 0, 0, 269 /* Unknown_extension_for_file___0__Only__ts_and_d_ts_extensions_are_allowed */, [path]));
					} else {
						this.errorReporter.addDiagnostic(new typeScript.Diagnostic(null, 0, 0, 268 /* Could_not_find_file___0_ */, [path]));
					}
				}
			}

			commandLineHost.dispose();

			return ret;
		};

		BatchCompiler.prototype.compile = function () {
			var _this = this,
				logger,
				compiler,
				anySyntacticErrors = false,
				anySemanticErrors = false
				;

			logger = new typeScript.NullLogger();
			compiler = new typeScript.TypeScriptCompiler(logger, this.compilationSettings, null);

			for (var iCode = 0; iCode < this.resolvedEnvironment.code.length; iCode++) {
				var code = this.resolvedEnvironment.code[iCode];

				if (!this.compilationSettings.resolve) {
					try {
						code.fileInformation = this.ioHost.readFile(code.path);
					} catch (e) {
						if (e.isUnsupportedEncoding) {
							this.errorReporter.addDiagnostic(new typeScript.Diagnostic(null, 0, 0, 276 /* Unsupported_encoding_for_file__0 */, [code.path]));
						}
					}

					if (this.compilationSettings.generateDeclarationFiles) {
						typeScript.CompilerDiagnostics.assert(code.referencedFiles === null, "With no resolve option, referenced files need to null");
						code.referencedFiles = typeScript.getReferencedFiles(code.path, code);
					}
				}

				if (code.fileInformation != null) {
					compiler.addSourceUnit(code.path,
						typeScript.ScriptSnapshot.fromString(code.fileInformation.contents()),
						code.fileInformation.byteOrderMark(),
						0,
						false,
						code.referencedFiles
					);

					var syntacticDiagnostics = compiler.getSyntacticDiagnostics(code.path);
					compiler.reportDiagnostics(syntacticDiagnostics, this.errorReporter);

					if (syntacticDiagnostics.length > 0) {
						anySyntacticErrors = true;
					}
				}
			}

			if (anySyntacticErrors) {
				return true;
			}

			compiler.pullTypeCheck();

			var fileNames = compiler.fileNameToDocument.getAllKeys();

			for (var i = 0, n = fileNames.length; i < n; i++) {
				var fileName = fileNames[i];
				var semanticDiagnostics = compiler.getSemanticDiagnostics(fileName);
				if (semanticDiagnostics.length > 0) {
					anySemanticErrors = true;
					compiler.reportDiagnostics(semanticDiagnostics, this.errorReporter);
				}
			}

			var emitterIoHost = new EmitterIoHost(this.ioHost);
			var mapInputToOutput = function (inputFile, outputFile) {
				_this.resolvedEnvironment.inputFileNameToOutputFileName.addOrUpdate(inputFile, outputFile);
			};

			var emitDiagnostics = compiler.emitAll(emitterIoHost, mapInputToOutput);
			compiler.reportDiagnostics(emitDiagnostics, this.errorReporter);

			emitterIoHost.dispose();

			if (emitDiagnostics.length > 0) {
				return true;
			}

			if (anySemanticErrors) {
				return true;
			}

			var emitDeclarationsDiagnostics = compiler.emitAllDeclarations();
			compiler.reportDiagnostics(emitDeclarationsDiagnostics, this.errorReporter);
			if (emitDeclarationsDiagnostics.length > 0) {
				return true;
			}

			return false;
		};

		BatchCompiler.prototype.dispose = function () {
			this.ioHost = null;
			this.resolvedEnvironment = null;
			this.compilationSettings = null;
			this.compilationEnvironment = null;

			this.errorReporter.dispose();
			this.errorReporter = null;
		};

		return BatchCompiler;
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
			batchCompiler
			;

		// Fill a file cache
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
		files[inputFileKey] = { content: code, path: inputFilePath };

		ioHost = new IoHost(files);

		batchCompiler = new BatchCompiler(ioHost, getCompilationSettings(options));
		batchCompiler.batchCompile(inputFilePath);

		if (!batchCompiler.errorReporter.hasErrors) {
			outputFileInformation = batchCompiler.ioHost.readFile(outputFilePath);
			if (outputFileInformation) {
				result.compiledCode = outputFileInformation.contents();
			}
		}
		else {
			result.errors = batchCompiler.errorReporter.errors;
		}

		batchCompiler.dispose();
		ioHost.dispose();

		return JSON.stringify(result);
	};

	return exports;
} (TypeScript));