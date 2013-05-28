var typeScriptHelper = (function(typeScript, json2, undefined) {
	"use strict";

	var exports = {},
		CUTTING_LINE_BEGIN_TOKEN = '"bundle_transformer_begin_unneeded_code_cut";',
		CUTTING_LINE_END_TOKEN = '"bundle_transformer_end_unneeded_code_cut";',
		StringBuilder,
		defaultOptions
		;
	
	StringBuilder = (function () {
		function StringBuilder() {
			this._buffer = [];
		}

		StringBuilder.prototype.Write = function (s) {
			this._buffer.push(s);
		};

		StringBuilder.prototype.WriteLine = function (s) {
			this._buffer.push(s + "\n");
		};

		StringBuilder.prototype.Clear = function () {
			this._buffer = [];
		};

		StringBuilder.prototype.ToString = function () {
			return this._buffer.join("");
		};
		
		StringBuilder.prototype.Dispose = function () {
			this._buffer = null;
		};

		StringBuilder.prototype.Close = function () {
		};

		return StringBuilder;
	})();

	defaultOptions = {
		styleSettings: {
			bitwise: false,
			blockInCompoundStmt: false,
			eqeqeq: false,
			forin: false,
			emptyBlocks: true,
			newMustBeUsed: false,
			requireSemi: false,
			assignmentInCond: false,
			eqnull: false,
			evalOK: true,
			innerScopeDeclEscape: true,
			funcInLoop: true,
			reDeclareLocal: true,
			literalSubscript: true,
			implicitAny: false
		},
		propagateConstants: false,
		minWhitespace: false,
		parseOnly: false,
		errorRecovery: true,
		emitComments: true,
		watch: false,
		exec: false,
		resolve: false,
		controlFlow: false,
		printControlFlow: false,
		controlFlowUseDef: false,
		errorOnWith: true,
		preprocess: false,
		canCallDefinitionSignature: false,
		inferPropertiesFromThisAssignment: false,
		useDefaultLib: false,
		codeGenTarget: typeScript.CodeGenTarget.ES3,
        moduleGenTarget: typeScript.ModuleGenTarget.Synchronous,
        outputOption: "",
        errorFileName: "",
        mapSourceFiles: false,
        generateDeclarationFiles: false,
        useCaseSensitiveFileResolution: false
	};
	
	function getCompilationSettings(options) {
		var compilationSettings;
		
		options = options || {};
		if (typeof options.codeGenTarget === "string") {
			options.codeGenTarget = parseCodeGenTarget(options.codeGenTarget);
		}
		
		compilationSettings = extendDeep(options, extendDeep(defaultOptions, {}));

		return compilationSettings;
	}
	
	function parseCodeGenTarget(code) {
		var codeGenTarget;
		
		switch (code) {
			case "EcmaScript3":
				codeGenTarget = typeScript.CodeGenTarget.ES3;
				break;
			case "EcmaScript5":
				codeGenTarget = typeScript.CodeGenTarget.ES5;
				break;
			default:
				throw {
					name: "TypeError",
					message: "ECMAScript target version '" + code + "' not supported."
				};
		}

		return codeGenTarget;
	}
	
	function getDependenciesCode(dependencies) {
		var dependencyCount,
			dependenciesCodeBuilder,
			dependencyIndex,
			dependency,
			dependencyContent,
			dependenciesCode
			;

		dependenciesCode = "";
		
		if (dependencies) {
			dependencyCount = dependencies.length;

			if (dependencyCount > 0) {
				dependenciesCodeBuilder = new StringBuilder();
				dependenciesCodeBuilder.WriteLine(CUTTING_LINE_BEGIN_TOKEN);

				for (dependencyIndex = 0; dependencyIndex < dependencyCount; dependencyIndex++) {
					dependency = dependencies[dependencyIndex];
					dependencyContent = dependency.content.trim();

					dependenciesCodeBuilder.Write(dependencyContent);
					if (/;\s*$/.test(dependencyContent)) {
						dependenciesCodeBuilder.WriteLine("");
					}
					else {
						dependenciesCodeBuilder.WriteLine(";");
					}
				}

				dependenciesCodeBuilder.WriteLine(CUTTING_LINE_END_TOKEN);

				dependenciesCode = dependenciesCodeBuilder.ToString();
				dependenciesCodeBuilder.Dispose();
			}
		}

		return dependenciesCode;
	}
	
	function getTargetCompiledCode(code, minWhitespace) {
		var targetCode,
			cuttingLineBeginPosition,
			cuttingLineEndPosition,
			targetBeginCode,
			targetEndCodePosition,
			targetEndCode
			;

		targetCode = "";
		cuttingLineBeginPosition = code.indexOf(CUTTING_LINE_BEGIN_TOKEN);
		cuttingLineEndPosition = code.indexOf(CUTTING_LINE_END_TOKEN);
		
		if (cuttingLineBeginPosition !== -1 && cuttingLineEndPosition !== -1) {
			targetBeginCode = code.substring(0, cuttingLineBeginPosition);
			targetEndCodePosition = cuttingLineEndPosition + CUTTING_LINE_END_TOKEN.length + 1;
			targetEndCode = code.substring(targetEndCodePosition);

			targetCode = targetBeginCode.trim() + (minWhitespace ? "" : "\n") + targetEndCode.trim();
			targetCode = targetCode.replace(/;(\s*;)+/gm , ";");
		}
		
		return targetCode;
	}
	
	function extendDeep(parent, child) {
		var propertyName, 
			toStr = Object.prototype.toString
			;

		child = child || {};
		
		for (propertyName in parent) {
			if (parent.hasOwnProperty(propertyName)) {
				if (typeof parent[propertyName] === "object") {
					child[propertyName] = (toStr.call(parent[propertyName]) === "[object Array]") ? [] : {};
					extendDeep(parent[propertyName], child[propertyName]);
				}
				else {
					child[propertyName] = parent[propertyName];
				}
			}
		}

		return child;
	}

	exports.compile = function (code, dependencies, options) {
		var codeBuilder,
			errorBuilder,
			logger,
			compilationSettings,
			parseErrors,
			compiler,
			dependenciesCode,
			result
			;

		codeBuilder = new StringBuilder();
		logger = new typeScript.NullLogger();
		errorBuilder = {
			Write: function() { },
			WriteLine: function() { },
			Dispose: function() { },
			Close: function() { }
		};
		compilationSettings = getCompilationSettings(options);
		parseErrors = [];
		dependenciesCode = getDependenciesCode(dependencies);

		compiler = new typeScript.TypeScriptCompiler(errorBuilder, logger, compilationSettings);
		compiler.setErrorCallback(function(minChar, charLen, message) {
			parseErrors.push({
				startIndex: minChar,
				expressionLength: charLen,
				message: message
			});
		});
		compiler.parser.errorRecovery = compilationSettings.errorRecovery;
		if (dependenciesCode) {
			compiler.addUnit(dependenciesCode, "dependencies.ts", false);
		}
		compiler.typeCheck();
		compiler.addUnit(code, "output.ts");

		parseErrors = [];
		compiler.reTypeCheck();
		compiler.emit({
			createFile: function() { return codeBuilder; },
			fileExists: function () { return false; },
			directoryExists: function () { return false; },
			resolvePath: function (path) { return path; }
		});

		result = {};
		result.compiledCode = getTargetCompiledCode(codeBuilder.ToString(), 
			compilationSettings.minWhitespace);
		if (parseErrors.length > 0) {
			result.errors = parseErrors;
		}

		codeBuilder.Dispose();
		errorBuilder.Dispose();

		return json2.stringify(result);
	};

	return exports;
}(TypeScript, JSON2));