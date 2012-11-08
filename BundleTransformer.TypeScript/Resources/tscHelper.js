var typeScriptHelper = {};

;(function (typeScriptHelper, undefined) {
	var CUTTING_LINE_BEGIN_TOKEN = '"bundle_transformer_begin_unneeded_code_cut";';
	var CUTTING_LINE_END_TOKEN = '"bundle_transformer_end_unneeded_code_cut";';
	
	var StringBuilder = (function () {
		var _buffer = [];

		function StringBuilder() { };

		StringBuilder.prototype.Write = function (s) {
			_buffer.push(s);
		};

		StringBuilder.prototype.WriteLine = function (s) {
			_buffer.push(s + "\n");
		};

		StringBuilder.prototype.Clear = function () {
			_buffer = [];
		};

		StringBuilder.prototype.ToString = function () {
			return _buffer.join("");
		};

		StringBuilder.prototype.Close = function () {
			_buffer = [];
		};

		return StringBuilder;
	})();

	var defaultOptions = {
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
		outputMany: true,
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
		codeGenTarget: TypeScript.CodeGenTarget.ES3,
        moduleGenTarget: TypeScript.ModuleGenTarget.Synchronous,
        outputFileName: "",
        errorFileName: "",
        mapSourceFiles: false,
        generateDeclarationFiles: false,
        useCaseSensitiveFileResolution: false
	};
	
	function getCompilationSettings(options) {
		options = options || {};
		if (typeof options.codeGenTarget === "string") {
			options.codeGenTarget = parseCodeGenTarget(options.codeGenTarget);
		}
		
		var compilationSettings = extendDeep(options, extendDeep(defaultOptions, {}));

		return compilationSettings;
	};
	
	function parseCodeGenTarget(code) {
		var codeGenTarget;
		switch (code) {
			case "EcmaScript3":
				codeGenTarget = TypeScript.CodeGenTarget.ES3;
				break;
			case "EcmaScript5":
				codeGenTarget = TypeScript.CodeGenTarget.ES5;
				break;
			default:
				throw {
					name: "TypeError",
					message: "ECMAScript target version '" + code + "' not supported."
				};
		}

		return codeGenTarget;
	}
	
	function getTargetCompiledCode(code, minWhitespace) {
		var targetCode = "";
		var cuttingLineBeginPosition = code.indexOf(CUTTING_LINE_BEGIN_TOKEN);
		var cuttingLineEndPosition = code.indexOf(CUTTING_LINE_END_TOKEN);
		
		if (cuttingLineBeginPosition !== -1 && cuttingLineEndPosition !== -1) {
			var targetBeginCode = code.substring(0, cuttingLineBeginPosition);
			var targetEndCodePosition = cuttingLineEndPosition + CUTTING_LINE_END_TOKEN.length + 1;
			var targetEndCode = code.substring(targetEndCodePosition);

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
	};

	typeScriptHelper.compile = function(code, dependencies, options) {
		var codeBuilder = new StringBuilder();
		var errorBuilder = {
			Write: function(s) { },
			WriteLine: function(s) { },
			Close: function() { }
		};
		var logger = new TypeScript.NullLogger();
		var compilationSettings = getCompilationSettings(options);
		var parseErrors = [];

		var compiler = new TypeScript.TypeScriptCompiler(codeBuilder, errorBuilder, logger, compilationSettings);
		compiler.setErrorCallback(function(minChar, charLen, message) {
			parseErrors.push({
				startIndex: minChar,
				expressionLength: charLen,
				message: message
			});
		});
		compiler.parser.errorRecovery = compilationSettings.errorRecovery;
		if (dependencies) {
			var dependencyCount = dependencies.length;

			if (dependencyCount > 0) {
				var dependenciesCodeBuilder = new StringBuilder();
				dependenciesCodeBuilder.WriteLine(CUTTING_LINE_BEGIN_TOKEN);

				for (var dependencyIndex = 0; dependencyIndex < dependencyCount; dependencyIndex++) {
					var dependency = dependencies[dependencyIndex];
					dependenciesCodeBuilder.WriteLine(dependency.content);
				}

				dependenciesCodeBuilder.WriteLine(CUTTING_LINE_END_TOKEN);

				var dependenciesCode = dependenciesCodeBuilder.ToString();
				dependenciesCodeBuilder.Close();

				compiler.addUnit(dependenciesCode, "dependencies.ts", false);
			}
		}
		compiler.typeCheck();
		compiler.addUnit(code, "output.ts");

		parseErrors = [];
		compiler.reTypeCheck();
		compiler.emit(false, function createFile(fileName) {
			return codeBuilder;
		});

		var result = {};
		result.compiledCode = getTargetCompiledCode(codeBuilder.ToString(), 
			compilationSettings.minWhitespace);
		if (parseErrors.length > 0) {
			result.errors = parseErrors;
		}

		codeBuilder.Close();
		errorBuilder.Close();

		return JSON.stringify(result);
	};
}(typeScriptHelper));