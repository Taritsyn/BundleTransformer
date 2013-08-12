var lessHelper = (function (Less) {
	"use strict";

	var exports = {};

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

	var IoHost = (function () {
		function IoHost(files) {
			this._files = files;
		}

		function removeLastSlash(path) {
			var newPath = path.replace(/[\/]+$/g, "");

			return newPath;
		}

		function buildAbsolutePath(absolutePathParts, path) {
			var pathParts,
				pathPart,
				pathPartIndex,
				pathPartCount
				;

			pathParts = path.split("/");
			pathPartCount = pathParts.length;

			for (pathPartIndex = 0; pathPartIndex < pathPartCount; pathPartIndex++) {
				pathPart = pathParts[pathPartIndex];

				if (pathPart === "..") {
					absolutePathParts.pop();
				}
				else if (pathPart === ".") {
					continue;
				}
				else {
					absolutePathParts.push(pathPart);
				}
			}
		}

		IoHost.prototype.readFile = function (path) {
			var key,
				file
				;

			key = generateFileCacheItemKey(path);
			if (typeof this._files[key] === "undefined") {
				throw new Error(formatString("File '{0}' does not exist.", path));
			}

			file = this._files[key];

			return file.content;
		};

		IoHost.prototype.dirName = function (path) {
			var directoryName = "",
				lastSlashPosition = path.lastIndexOf("/")
				;

			if (lastSlashPosition !== -1) {
				directoryName = path.substring(0, lastSlashPosition + 1);
			}

			return directoryName;
		};

		IoHost.prototype.resolveRelativePath = function (basePath, relativePath) {
			var absolutePathParts = [],
				absolutePath,
				baseDirectoryPath
				;

			if (relativePath.indexOf("/") === 0) {
				return relativePath;
			}

			baseDirectoryPath = this.dirName(basePath);

			buildAbsolutePath(absolutePathParts, removeLastSlash(baseDirectoryPath));
			buildAbsolutePath(absolutePathParts, relativePath);

			absolutePath = absolutePathParts.join("/");

			return absolutePath;
		};

		IoHost.prototype.dispose = function () {
			this._files = null;
		};

		return IoHost;
	})();

	exports.compile = function (code, path, dependencies, options) {
		var result = {
				compiledCode: "",
				errors: []
			},
			inputFilePath = path,
			inputFileKey,
			files,
			dependency,
			dependencyIndex,
			dependencyCount,
			dependencyKey,
			ioHost,
			currentDirectoryPath,
			relativeUrls,
			env,
			errors = []
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

		currentDirectoryPath = ioHost.dirName(path);
		relativeUrls = true;
		env = {
			rootpath: currentDirectoryPath,
			relativeUrls: relativeUrls,
			currentFileInfo: {
				filename: path,
				relativeUrls: relativeUrls,
				rootpath: currentDirectoryPath,
				currentDirectory: currentDirectoryPath,
				entryPath: currentDirectoryPath,
				rootFilename: path
			}
		};
		mix(env, options);

		var parser = new Less.Parser(env);
		Less.ioHost = ioHost;

		try {
			parser.parse(code, function (err, tree) {
				if (err) {
					errors.push({
						type: err.type,
						message: err.message,
						fileName: err.filename,
						lineNumber: (err.line || 0),
						columnNumber: (err.column || 0)
					});

					return;
				}

				result.compiledCode = tree.toCSS(options);
			});
		}
		catch (e) {
			if (typeof e.line !== "undefined") {
				errors.push({
					type: e.type,
					message: e.message,
					fileName: e.filename,
					lineNumber: (e.line || 0),
					columnNumber: (e.column || 0)
				});
			}
			else {
				throw (e);
			}
		}

		if (errors.length > 0) {
			result.errors = errors;
		}

		Less.ioHost = undefined;
		ioHost.dispose();

		return JSON.stringify(result);
	};

	return exports;
} (Less));