var typeScriptHelper = (function (TypeScript) {
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
			codepage: null,
			createFileLog: false
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

	function getCompilationSettings(options) {
		var compilationSettings;

		options = options || {};
		if (typeof options.codeGenTarget === "string") {
			options.codeGenTarget = parseCodeGenTarget(options.codeGenTarget);
		}

		compilationSettings = mix(mix({}, defaultOptions), options);

		return compilationSettings;
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

		IoHost.prototype.appendFile = function (path, content) {
			var key,
				file
				;

			key = generateFileCacheItemKey(path);
			if (typeof this._files[key] !== "undefined") {
				this._files[key].content += content;
			}
			else {
				file = { "path": path, "content": content };
				this._files[key] = file;
			}
		};

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
			fileInfo = new TypeScript.FileInformation(file.content, 0);

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
			this.fileNameToSourceFile = new TypeScript.StringHashTable();
			this.errors = [];
			this.hasErrors = false;
			this.logger = null;
			this.fileExistsCache = TypeScript.createIntrinsicsObject();
			this.resolvePathCache = TypeScript.createIntrinsicsObject();
			this.compilationSettings = TypeScript.ImmutableCompilationSettings.fromCompilationSettings(compilationSettings);
		}

		CustomCompiler.prototype.compile = function (inputFilePath) {
			var that = this,
				compiler,
				resolvedFiles,
				resolvedFileCount,
				resolvedFileIndex,
				resolvedFile,
				sourceFile,
				resolvePath,
				it,
				diagnostics,
				diagnosticCount,
				diagnosticIndex,
				result
				;

			TypeScript.CompilerDiagnostics.diagnosticWriter = {
				Alert: function () { }
			};

			that.inputFiles.push(inputFilePath);
			that.logger = new TypeScript.NullLogger();

			that._resolve();

			compiler = new TypeScript.TypeScriptCompiler(that.logger, that.compilationSettings);

			resolvedFiles = that.resolvedFiles;
			resolvedFileCount = resolvedFiles.length;

			for (resolvedFileIndex = 0; resolvedFileIndex < resolvedFileCount; resolvedFileIndex++) {
				resolvedFile = resolvedFiles[resolvedFileIndex];
				sourceFile = that.getSourceFile(resolvedFile.path);
				compiler.addFile(resolvedFile.path, sourceFile.scriptSnapshot, sourceFile.byteOrderMark, 
					0, false, resolvedFile.referencedFiles);
			}

			resolvePath = function(path) {
				return that.resolvePath(path);
			};

			for (it = compiler.compile(resolvePath); it.moveNext(); ) {
				result = it.current();
				diagnostics = result.diagnostics;
				diagnosticCount = diagnostics.length;

				for (diagnosticIndex = 0; diagnosticIndex < diagnosticCount; diagnosticIndex++) {
					that.addDiagnostic(diagnostics[diagnosticIndex]);
				}

				if (!that.tryWriteOutputFiles(result.outputFiles)) {
					return true;
				}
			}

			return that.hasErrors;
		};

		CustomCompiler.prototype._resolve = function () {
			var includeDefaultLibrary,
				resolvedFiles,
				resolutionResults,
				diagnostics,
				diagnosticCount,
				diagnosticIndex,
				libraryResolvedFile
				;

			resolutionResults = TypeScript.ReferenceResolver.resolve(this.inputFiles, this,
				this.compilationSettings.useCaseSensitiveFileResolution());
			resolvedFiles = resolutionResults.resolvedFiles;
			includeDefaultLibrary = !this.compilationSettings.noLib() && !resolutionResults.seenNoDefaultLibTag;

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

		CustomCompiler.prototype.getSourceFile = function (fileName) {
			var sourceFile,
				fileInformation,
				snapshot
				;

			sourceFile = this.fileNameToSourceFile.lookup(fileName);
			if (!sourceFile) {
				fileInformation = this.ioHost.readFile(fileName, this.compilationSettings.codepage());
				snapshot = TypeScript.ScriptSnapshot.fromString(fileInformation.contents);
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
			var exists = this.fileExistsCache[path];
			if (exists === undefined) {
				exists = this.ioHost.fileExists(path);
				this.fileExistsCache[path] = exists;
			}

			return exists;
		};

		CustomCompiler.prototype.getParentDirectory = function (path) {
			var result = this.ioHost.dirName(path);

			return result;
		};

		CustomCompiler.prototype.addDiagnostic = function (diagnostic) {
			var diagnosticInfo,
				message,
				fileName,
				lineNumber = 0,
				columnNumber = 0
				;

			diagnosticInfo = diagnostic.info();
			message = diagnostic.message();
			fileName = diagnostic.fileName();

			if (fileName) {
				lineNumber = diagnostic.line() + 1;
				columnNumber = diagnostic.character() + 1;
			}

			if (diagnosticInfo.category === 1 /* Error */) {
				this.hasErrors = true;
				this.errors.push({
					"message": message,
					"fileName": fileName,
					"lineNumber": lineNumber,
					"columnNumber": columnNumber
				});
			}
		};

		CustomCompiler.prototype.tryWriteOutputFiles = function (outputFiles) {
			var fileCount = outputFiles.length,
				fileIndex,
				file
				;

			for (fileIndex = 0; fileIndex < fileCount; fileIndex++) {
				file = outputFiles[fileIndex];

				try {
					this.writeFile(file.name, file.text, file.writeByteOrderMark);
				} catch (e) {
					this.addDiagnostic(new TypeScript.Diagnostic(file.name, null, 0, 0, TypeScript.DiagnosticCode.Emit_Error_0, [e.message]));
					return false;
				}
			}

			return true;
		};

		CustomCompiler.prototype.writeFile = function (fileName, contents, writeByteOrderMark) {
			this.ioHost.writeFile(fileName, contents, writeByteOrderMark);
		};

		CustomCompiler.prototype.directoryExists = function (path) {
			var result = this.ioHost.directoryExists(path);

			return result;
		};

		CustomCompiler.prototype.resolvePath = function (path) {
			var cachedValue = this.resolvePathCache[path];
			if (!cachedValue) {
				cachedValue = this.ioHost.resolvePath(path);
				this.resolvePathCache[path] = cachedValue;
			}

			return cachedValue;
		};

		CustomCompiler.prototype.dispose = function () {
			this.ioHost = null;
			this.inputFiles = null;
			this.resolvedFiles = null;
			this.fileNameToSourceFile = null;
			this.errors = null;
			this.hasErrors = false;
			this.logger = null;
			this.fileExistsCache = null;
			this.resolvePathCache = null;
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
} (TypeScript));