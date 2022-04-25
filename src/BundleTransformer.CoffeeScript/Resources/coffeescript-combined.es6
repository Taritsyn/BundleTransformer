/*!
 * Object.assign polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */
if (!Object.hasOwnProperty('assign')) {
	Object.assign = function (target) {
		var result,
			argIndex,
			argCount,
			nextSource,
			propName,
			methodName = 'Object.assign'
			;

		if (typeof target === 'undefined' || target === null) {
			throw new TypeError(methodName + ': argument is not an Object.');
		}

		result = Object(target);
		argCount = arguments.length;

		for (argIndex = 1; argIndex < argCount; argIndex++) {
			nextSource = arguments[argIndex];

			if (typeof nextSource !== 'undefined' && nextSource !== null) {
				for (propName in nextSource) {
					if (Object.prototype.hasOwnProperty.call(nextSource, propName)) {
						result[propName] = nextSource[propName];
					}
				}
			}
		}

		return result;
	};
}

/*!
 * CoffeeScript Compiler v2.7.0
 * http://coffeescript.org
 *
 * Copyright 2009-2018 Jeremy Ashkenas
 * Released under the MIT License
 */
var CoffeeScript = (function(){
	var modules = {},
		loadedModules = {},
		require = function(name) {
			var result;

			if (typeof loadedModules[name] !== 'undefined') {
				result = loadedModules[name];
			}
			else {
				if (typeof modules[name] !== 'undefined') {
					result = modules[name].call(this);

					loadedModules[name] = (typeof result !== 'undefined') ? result : null;
					modules[name] = undefined;
				}
				else {
					throw new Error("Can't load '" + name + "' module.");
				}
			}

			return result;
		}
		;

	//#region URL: /helpers
	modules['/helpers'] = function() {
		// This file contains the common helper functions that we'd like to share among
		// the **Lexer**, **Rewriter**, and the **Nodes**. Merge objects, flatten
		// arrays, count characters, that sort of thing.
		var exports = {};

		// Peek at the beginning of a given string to see if it matches a sequence.
		var UNICODE_CODE_POINT_ESCAPE, attachCommentsToNode, buildLocationData, buildLocationHash, buildTokenDataDictionary, extend, flatten, isBoolean, isNumber, isString, ref, repeat, syntaxErrorToString, unicodeCodePointToUnicodeEscapes,
			indexOf = [].indexOf;

		exports.starts = function(string, literal, start) {
			return literal === string.substr(start, literal.length);
		};

		// Peek at the end of a given string to see if it matches a sequence.
		exports.ends = function(string, literal, back) {
			var len;
			len = literal.length;
			return literal === string.substr(string.length - len - (back || 0), len);
		};

		// Repeat a string `n` times.
		exports.repeat = repeat = function(str, n) {
			var res;
			// Use clever algorithm to have O(log(n)) string concatenation operations.
			res = '';
			while (n > 0) {
				if (n & 1) {
					res += str;
				}
				n >>>= 1;
				str += str;
			}
			return res;
		};

		// Trim out all falsy values from an array.
		exports.compact = function(array) {
			var i, item, len1, results;
			results = [];
			for (i = 0, len1 = array.length; i < len1; i++) {
				item = array[i];
				if (item) {
					results.push(item);
				}
			}
			return results;
		};

		// Count the number of occurrences of a string in a string.
		exports.count = function(string, substr) {
			var num, pos;
			num = pos = 0;
			if (!substr.length) {
				return 1 / 0;
			}
			while (pos = 1 + string.indexOf(substr, pos)) {
				num++;
			}
			return num;
		};

		// Merge objects, returning a fresh copy with attributes from both sides.
		// Used every time `Base#compile` is called, to allow properties in the
		// options hash to propagate down the tree without polluting other branches.
		exports.merge = function(options, overrides) {
			return extend(extend({}, options), overrides);
		};

		// Extend a source object with the properties of another object (shallow copy).
		extend = exports.extend = function(object, properties) {
			var key, val;
			for (key in properties) {
				val = properties[key];
				object[key] = val;
			}
			return object;
		};

		// Return a flattened version of an array.
		// Handy for getting a list of `children` from the nodes.
		exports.flatten = flatten = function(array) {
			var element, flattened, i, len1;
			flattened = [];
			for (i = 0, len1 = array.length; i < len1; i++) {
				element = array[i];
				if ('[object Array]' === Object.prototype.toString.call(element)) {
					flattened = flattened.concat(flatten(element));
				} else {
					flattened.push(element);
				}
			}
			return flattened;
		};

		// Delete a key from an object, returning the value. Useful when a node is
		// looking for a particular method in an options hash.
		exports.del = function(obj, key) {
			var val;
			val = obj[key];
			delete obj[key];
			return val;
		};

		// Typical Array::some
		exports.some = (ref = Array.prototype.some) != null ? ref : function(fn) {
			var e, i, len1, ref1;
			ref1 = this;
			for (i = 0, len1 = ref1.length; i < len1; i++) {
				e = ref1[i];
				if (fn(e)) {
					return true;
				}
			}
			return false;
		};

		// Helper function for extracting code from Literate CoffeeScript by stripping
		// out all non-code blocks, producing a string of CoffeeScript code that can
		// be compiled “normally.”
		exports.invertLiterate = function(code) {
			var blankLine, i, indented, insideComment, len1, line, listItemStart, out, ref1;
			out = [];
			blankLine = /^\s*$/;
			indented = /^[\t ]/;
			listItemStart = /^(?:\t?| {0,3})(?:[\*\-\+]|[0-9]{1,9}\.)[ \t]/; // Up to one tab, or up to three spaces, or neither;
			// followed by `*`, `-` or `+`;
			// or by an integer up to 9 digits long, followed by a period;
			// followed by a space or a tab.
			insideComment = false;
			ref1 = code.split('\n');
			for (i = 0, len1 = ref1.length; i < len1; i++) {
				line = ref1[i];
				if (blankLine.test(line)) {
					insideComment = false;
					out.push(line);
				} else if (insideComment || listItemStart.test(line)) {
					insideComment = true;
					out.push(`# ${line}`);
				} else if (!insideComment && indented.test(line)) {
					out.push(line);
				} else {
					insideComment = true;
					out.push(`# ${line}`);
				}
			}
			return out.join('\n');
		};

		// Merge two jison-style location data objects together.
		// If `last` is not provided, this will simply return `first`.
		buildLocationData = function(first, last) {
			if (!last) {
				return first;
			} else {
				return {
					first_line: first.first_line,
					first_column: first.first_column,
					last_line: last.last_line,
					last_column: last.last_column,
					last_line_exclusive: last.last_line_exclusive,
					last_column_exclusive: last.last_column_exclusive,
					range: [first.range[0], last.range[1]]
				};
			}
		};

		// Build a list of all comments attached to tokens.
		exports.extractAllCommentTokens = function(tokens) {
			var allCommentsObj, comment, commentKey, i, j, k, key, len1, len2, len3, ref1, results, sortedKeys, token;
			allCommentsObj = {};
			for (i = 0, len1 = tokens.length; i < len1; i++) {
				token = tokens[i];
				if (token.comments) {
					ref1 = token.comments;
					for (j = 0, len2 = ref1.length; j < len2; j++) {
						comment = ref1[j];
						commentKey = comment.locationData.range[0];
						allCommentsObj[commentKey] = comment;
					}
				}
			}
			sortedKeys = Object.keys(allCommentsObj).sort(function(a, b) {
				return a - b;
			});
			results = [];
			for (k = 0, len3 = sortedKeys.length; k < len3; k++) {
				key = sortedKeys[k];
				results.push(allCommentsObj[key]);
			}
			return results;
		};

		// Get a lookup hash for a token based on its location data.
		// Multiple tokens might have the same location hash, but using exclusive
		// location data distinguishes e.g. zero-length generated tokens from
		// actual source tokens.
		buildLocationHash = function(loc) {
			return `${loc.range[0]}-${loc.range[1]}`;
		};

		// Build a dictionary of extra token properties organized by tokens’ locations
		// used as lookup hashes.
		exports.buildTokenDataDictionary = buildTokenDataDictionary = function(tokens) {
			var base1, i, len1, token, tokenData, tokenHash;
			tokenData = {};
			for (i = 0, len1 = tokens.length; i < len1; i++) {
				token = tokens[i];
				if (!token.comments) {
					continue;
				}
				tokenHash = buildLocationHash(token[2]);
				// Multiple tokens might have the same location hash, such as the generated
				// `JS` tokens added at the start or end of the token stream to hold
				// comments that start or end a file.
				if (tokenData[tokenHash] == null) {
					tokenData[tokenHash] = {};
				}
				if (token.comments) { // `comments` is always an array.
					// For “overlapping” tokens, that is tokens with the same location data
					// and therefore matching `tokenHash`es, merge the comments from both/all
					// tokens together into one array, even if there are duplicate comments;
					// they will get sorted out later.
					((base1 = tokenData[tokenHash]).comments != null ? base1.comments : base1.comments = []).push(...token.comments);
				}
			}
			return tokenData;
		};

		// This returns a function which takes an object as a parameter, and if that
		// object is an AST node, updates that object's locationData.
		// The object is returned either way.
		exports.addDataToNode = function(parserState, firstLocationData, firstValue, lastLocationData, lastValue, forceUpdateLocation = true) {
			return function(obj) {
				var locationData, objHash, ref1, ref2, ref3;
				// Add location data.
				locationData = buildLocationData((ref1 = firstValue != null ? firstValue.locationData : void 0) != null ? ref1 : firstLocationData, (ref2 = lastValue != null ? lastValue.locationData : void 0) != null ? ref2 : lastLocationData);
				if (((obj != null ? obj.updateLocationDataIfMissing : void 0) != null) && (firstLocationData != null)) {
					obj.updateLocationDataIfMissing(locationData, forceUpdateLocation);
				} else {
					obj.locationData = locationData;
				}
				// Add comments, building the dictionary of token data if it hasn’t been
				// built yet.
				if (parserState.tokenData == null) {
					parserState.tokenData = buildTokenDataDictionary(parserState.parser.tokens);
				}
				if (obj.locationData != null) {
					objHash = buildLocationHash(obj.locationData);
					if (((ref3 = parserState.tokenData[objHash]) != null ? ref3.comments : void 0) != null) {
						attachCommentsToNode(parserState.tokenData[objHash].comments, obj);
					}
				}
				return obj;
			};
		};

		exports.attachCommentsToNode = attachCommentsToNode = function(comments, node) {
			if ((comments == null) || comments.length === 0) {
				return;
			}
			if (node.comments == null) {
				node.comments = [];
			}
			return node.comments.push(...comments);
		};

		// Convert jison location data to a string.
		// `obj` can be a token, or a locationData.
		exports.locationDataToString = function(obj) {
			var locationData;
			if (("2" in obj) && ("first_line" in obj[2])) {
				locationData = obj[2];
			} else if ("first_line" in obj) {
				locationData = obj;
			}
			if (locationData) {
				return `${locationData.first_line + 1}:${locationData.first_column + 1}-` + `${locationData.last_line + 1}:${locationData.last_column + 1}`;
			} else {
				return "No location data";
			}
		};

		/*BT-
		// Generate a unique anonymous file name so we can distinguish source map cache
		// entries for any number of anonymous scripts.
		exports.anonymousFileName = (function() {
			var n;
			n = 0;
			return function() {
				return `<anonymous-${n++}>`;
			};
		})();
		*/

		// A `.coffee.md` compatible version of `basename`, that returns the file sans-extension.
		exports.baseFileName = function(file, stripExt = false, useWinPathSep = false) {
			var parts, pathSep;
			pathSep = useWinPathSep ? /\\|\// : /\//;
			parts = file.split(pathSep);
			file = parts[parts.length - 1];
			if (!(stripExt && file.indexOf('.') >= 0)) {
				return file;
			}
			parts = file.split('.');
			parts.pop();
			if (parts[parts.length - 1] === 'coffee' && parts.length > 1) {
				parts.pop();
			}
			return parts.join('.');
		};

		// Determine if a filename represents a CoffeeScript file.
		exports.isCoffee = function(file) {
			return /\.((lit)?coffee|coffee\.md)$/.test(file);
		};

		// Determine if a filename represents a Literate CoffeeScript file.
		exports.isLiterate = function(file) {
			return /\.(litcoffee|coffee\.md)$/.test(file);
		};

		// Throws a SyntaxError from a given location.
		// The error's `toString` will return an error message following the "standard"
		// format `<filename>:<line>:<col>: <message>` plus the line with the error and a
		// marker showing where the error is.
		exports.throwSyntaxError = function(message, location) {
			var error;
			error = new SyntaxError(message);
			error.location = location;
			error.toString = syntaxErrorToString;
			// Instead of showing the compiler's stacktrace, show our custom error message
			// (this is useful when the error bubbles up in Node.js applications that
			// compile CoffeeScript for example).
			error.stack = error.toString();
			throw error;
		};

		// Update a compiler SyntaxError with source code information if it didn't have
		// it already.
		exports.updateSyntaxError = function(error, code, filename) {
			// Avoid screwing up the `stack` property of other errors (i.e. possible bugs).
			if (error.toString === syntaxErrorToString) {
				error.code || (error.code = code);
				error.filename || (error.filename = filename);
				error.stack = error.toString();
			}
			return error;
		};

		syntaxErrorToString = function() {
			var codeLine, colorize, colorsEnabled, end, filename, first_column, first_line, last_column, last_line, marker, ref1, ref2, ref3, ref4, start;
			if (!(this.code && this.location)) {
				return Error.prototype.toString.call(this);
			}
			({first_line, first_column, last_line, last_column} = this.location);
			if (last_line == null) {
				last_line = first_line;
			}
			if (last_column == null) {
				last_column = first_column;
			}
			/*BT-
			if ((ref1 = this.filename) != null ? ref1.startsWith('<anonymous') : void 0) {
				filename = '[stdin]';
			} else {
			*/
				filename = this.filename || '[stdin]';
			/*BT-
			}
			*/
			codeLine = this.code.split('\n')[first_line];
			start = first_column;
			// Show only the first line on multi-line errors.
			end = first_line === last_line ? last_column + 1 : codeLine.length;
			marker = codeLine.slice(0, start).replace(/[^\s]/g, ' ') + repeat('^', end - start);
			// Check to see if we're running on a color-enabled TTY.
			if (typeof process !== "undefined" && process !== null) {
				colorsEnabled = ((ref2 = process.stdout) != null ? ref2.isTTY : void 0) && !((ref3 = process.env) != null ? ref3.NODE_DISABLE_COLORS : void 0);
			}
			if ((ref4 = this.colorful) != null ? ref4 : colorsEnabled) {
				colorize = function(str) {
					return `\x1B[1;31m${str}\x1B[0m`;
				};
				codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
				marker = colorize(marker);
			}
			return `${filename}:${first_line + 1}:${first_column + 1}: error: ${this.message}
	${codeLine}
	${marker}`;
		};

		exports.nameWhitespaceCharacter = function(string) {
			switch (string) {
				case ' ':
					return 'space';
				case '\n':
					return 'newline';
				case '\r':
					return 'carriage return';
				case '\t':
					return 'tab';
				default:
					return string;
			}
		};

		exports.parseNumber = function(string) {
			var base;
			if (string == null) {
				return 0/0;
			}
			base = (function() {
				switch (string.charAt(1)) {
					case 'b':
						return 2;
					case 'o':
						return 8;
					case 'x':
						return 16;
					default:
						return null;
				}
			})();
			if (base != null) {
				return parseInt(string.slice(2).replace(/_/g, ''), base);
			} else {
				return parseFloat(string.replace(/_/g, ''));
			}
		};

		exports.isFunction = function(obj) {
			return Object.prototype.toString.call(obj) === '[object Function]';
		};

		exports.isNumber = isNumber = function(obj) {
			return Object.prototype.toString.call(obj) === '[object Number]';
		};

		exports.isString = isString = function(obj) {
			return Object.prototype.toString.call(obj) === '[object String]';
		};

		exports.isBoolean = isBoolean = function(obj) {
			return obj === true || obj === false || Object.prototype.toString.call(obj) === '[object Boolean]';
		};

		exports.isPlainObject = function(obj) {
			return typeof obj === 'object' && !!obj && !Array.isArray(obj) && !isNumber(obj) && !isString(obj) && !isBoolean(obj);
		};

		unicodeCodePointToUnicodeEscapes = function(codePoint) {
			var high, low, toUnicodeEscape;
			toUnicodeEscape = function(val) {
				var str;
				str = val.toString(16);
				return `\\u${repeat('0', 4 - str.length)}${str}`;
			};
			if (codePoint < 0x10000) {
				return toUnicodeEscape(codePoint);
			}
			// surrogate pair
			high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
			low = (codePoint - 0x10000) % 0x400 + 0xDC00;
			return `${toUnicodeEscape(high)}${toUnicodeEscape(low)}`;
		};

		// Replace `\u{...}` with `\uxxxx[\uxxxx]` in regexes without `u` flag
		exports.replaceUnicodeCodePointEscapes = function(str, {flags, error, delimiter = ''} = {}) {
			var shouldReplace;
			shouldReplace = (flags != null) && indexOf.call(flags, 'u') < 0;
			return str.replace(UNICODE_CODE_POINT_ESCAPE, function(match, escapedBackslash, codePointHex, offset) {
				var codePointDecimal;
				if (escapedBackslash) {
					return escapedBackslash;
				}
				codePointDecimal = parseInt(codePointHex, 16);
				if (codePointDecimal > 0x10ffff) {
					error("unicode code point escapes greater than \\u{10ffff} are not allowed", {
						offset: offset + delimiter.length,
						length: codePointHex.length + 4
					});
				}
				if (!shouldReplace) {
					return match;
				}
				return unicodeCodePointToUnicodeEscapes(codePointDecimal);
			});
		};

		UNICODE_CODE_POINT_ESCAPE = /(\\\\)|\\u\{([\da-fA-F]+)\}/g; // Make sure the escape isn’t escaped.

		return exports;
	};
	//#endregion

	//#region URL: /rewriter
	modules['/rewriter'] = function() {
		// The CoffeeScript language has a good deal of optional syntax, implicit syntax,
		// and shorthand syntax. This can greatly complicate a grammar and bloat
		// the resulting parse table. Instead of making the parser handle it all, we take
		// a series of passes over the token stream, using this **Rewriter** to convert
		// shorthand into the unambiguous long form, add implicit indentation and
		// parentheses, and generally clean things up.
		var exports = {};
		var BALANCED_PAIRS, CALL_CLOSERS, CONTROL_IN_IMPLICIT, DISCARDED, EXPRESSION_CLOSE, EXPRESSION_END, EXPRESSION_START, IMPLICIT_CALL, IMPLICIT_END, IMPLICIT_FUNC, IMPLICIT_UNSPACED_CALL, INVERSES, LINEBREAKS, Rewriter, SINGLE_CLOSERS, SINGLE_LINERS, UNFINISHED, extractAllCommentTokens, generate, k, left, len, moveComments, right, throwSyntaxError,
			indexOf = [].indexOf,
			hasProp = {}.hasOwnProperty;

		({throwSyntaxError, extractAllCommentTokens} = require('/helpers'));

		// Move attached comments from one token to another.
		moveComments = function(fromToken, toToken) {
			var comment, k, len, ref, unshiftedComments;
			if (!fromToken.comments) {
				return;
			}
			if (toToken.comments && toToken.comments.length !== 0) {
				unshiftedComments = [];
				ref = fromToken.comments;
				for (k = 0, len = ref.length; k < len; k++) {
					comment = ref[k];
					if (comment.unshift) {
						unshiftedComments.push(comment);
					} else {
						toToken.comments.push(comment);
					}
				}
				toToken.comments = unshiftedComments.concat(toToken.comments);
			} else {
				toToken.comments = fromToken.comments;
			}
			return delete fromToken.comments;
		};

		// Create a generated token: one that exists due to a use of implicit syntax.
		// Optionally have this new token take the attached comments from another token.
		generate = function(tag, value, origin, commentsToken) {
			var token;
			token = [tag, value];
			token.generated = true;
			if (origin) {
				token.origin = origin;
			}
			if (commentsToken) {
				moveComments(commentsToken, token);
			}
			return token;
		};

		// The **Rewriter** class is used by the [Lexer](lexer.html), directly against
		// its internal array of tokens.
		exports.Rewriter = Rewriter = (function() {
			class Rewriter {
				// Rewrite the token stream in multiple passes, one logical filter at
				// a time. This could certainly be changed into a single pass through the
				// stream, with a big ol’ efficient switch, but it’s much nicer to work with
				// like this. The order of these passes matters—indentation must be
				// corrected before implicit parentheses can be wrapped around blocks of code.
				rewrite(tokens1) {
					var ref, ref1, t;
					this.tokens = tokens1;
					// Set environment variable `DEBUG_TOKEN_STREAM` to `true` to output token
					// debugging info. Also set `DEBUG_REWRITTEN_TOKEN_STREAM` to `true` to
					// output the token stream after it has been rewritten by this file.
					if (typeof process !== "undefined" && process !== null ? (ref = process.env) != null ? ref.DEBUG_TOKEN_STREAM : void 0 : void 0) {
						if (process.env.DEBUG_REWRITTEN_TOKEN_STREAM) {
							console.log('Initial token stream:');
						}
						console.log(((function() {
							var k, len, ref1, results;
							ref1 = this.tokens;
							results = [];
							for (k = 0, len = ref1.length; k < len; k++) {
								t = ref1[k];
								results.push(t[0] + '/' + t[1] + (t.comments ? '*' : ''));
							}
							return results;
						}).call(this)).join(' '));
					}
					this.removeLeadingNewlines();
					this.closeOpenCalls();
					this.closeOpenIndexes();
					this.normalizeLines();
					this.tagPostfixConditionals();
					this.addImplicitBracesAndParens();
					this.rescueStowawayComments();
					this.addLocationDataToGeneratedTokens();
					this.enforceValidJSXAttributes();
					this.fixIndentationLocationData();
					this.exposeTokenDataToGrammar();
					if (typeof process !== "undefined" && process !== null ? (ref1 = process.env) != null ? ref1.DEBUG_REWRITTEN_TOKEN_STREAM : void 0 : void 0) {
						if (process.env.DEBUG_TOKEN_STREAM) {
							console.log('Rewritten token stream:');
						}
						console.log(((function() {
							var k, len, ref2, results;
							ref2 = this.tokens;
							results = [];
							for (k = 0, len = ref2.length; k < len; k++) {
								t = ref2[k];
								results.push(t[0] + '/' + t[1] + (t.comments ? '*' : ''));
							}
							return results;
						}).call(this)).join(' '));
					}
					return this.tokens;
				}

				// Rewrite the token stream, looking one token ahead and behind.
				// Allow the return value of the block to tell us how many tokens to move
				// forwards (or backwards) in the stream, to make sure we don’t miss anything
				// as tokens are inserted and removed, and the stream changes length under
				// our feet.
				scanTokens(block) {
					var i, token, tokens;
					({tokens} = this);
					i = 0;
					while (token = tokens[i]) {
						i += block.call(this, token, i, tokens);
					}
					return true;
				}

				detectEnd(i, condition, action, opts = {}) {
					var levels, ref, ref1, token, tokens;
					({tokens} = this);
					levels = 0;
					while (token = tokens[i]) {
						if (levels === 0 && condition.call(this, token, i)) {
							return action.call(this, token, i);
						}
						if (ref = token[0], indexOf.call(EXPRESSION_START, ref) >= 0) {
							levels += 1;
						} else if (ref1 = token[0], indexOf.call(EXPRESSION_END, ref1) >= 0) {
							levels -= 1;
						}
						if (levels < 0) {
							if (opts.returnOnNegativeLevel) {
								return;
							}
							return action.call(this, token, i);
						}
						i += 1;
					}
					return i - 1;
				}

				// Leading newlines would introduce an ambiguity in the grammar, so we
				// dispatch them here.
				removeLeadingNewlines() {
					var i, k, l, leadingNewlineToken, len, len1, ref, ref1, tag;
					ref = this.tokens;
					for (i = k = 0, len = ref.length; k < len; i = ++k) {
						[tag] = ref[i];
						if (tag !== 'TERMINATOR') {
							// Find the index of the first non-`TERMINATOR` token.
							break;
						}
					}
					if (i === 0) {
						return;
					}
					ref1 = this.tokens.slice(0, i);
					// If there are any comments attached to the tokens we’re about to discard,
					// shift them forward to what will become the new first token.
					for (l = 0, len1 = ref1.length; l < len1; l++) {
						leadingNewlineToken = ref1[l];
						moveComments(leadingNewlineToken, this.tokens[i]);
					}
					// Discard all the leading newline tokens.
					return this.tokens.splice(0, i);
				}

				// The lexer has tagged the opening parenthesis of a method call. Match it with
				// its paired close.
				closeOpenCalls() {
					var action, condition;
					condition = function(token, i) {
						var ref;
						return (ref = token[0]) === ')' || ref === 'CALL_END';
					};
					action = function(token, i) {
						return token[0] = 'CALL_END';
					};
					return this.scanTokens(function(token, i) {
						if (token[0] === 'CALL_START') {
							this.detectEnd(i + 1, condition, action);
						}
						return 1;
					});
				}

				// The lexer has tagged the opening bracket of an indexing operation call.
				// Match it with its paired close.
				closeOpenIndexes() {
					var action, condition, startToken;
					startToken = null;
					condition = function(token, i) {
						var ref;
						return (ref = token[0]) === ']' || ref === 'INDEX_END';
					};
					action = function(token, i) {
						if (this.tokens.length >= i && this.tokens[i + 1][0] === ':') {
							startToken[0] = '[';
							return token[0] = ']';
						} else {
							return token[0] = 'INDEX_END';
						}
					};
					return this.scanTokens(function(token, i) {
						if (token[0] === 'INDEX_START') {
							startToken = token;
							this.detectEnd(i + 1, condition, action);
						}
						return 1;
					});
				}

				// Match tags in token stream starting at `i` with `pattern`.
				// `pattern` may consist of strings (equality), an array of strings (one of)
				// or null (wildcard). Returns the index of the match or -1 if no match.
				indexOfTag(i, ...pattern) {
					var fuzz, j, k, ref, ref1;
					fuzz = 0;
					for (j = k = 0, ref = pattern.length; (0 <= ref ? k < ref : k > ref); j = 0 <= ref ? ++k : --k) {
						if (pattern[j] == null) {
							continue;
						}
						if (typeof pattern[j] === 'string') {
							pattern[j] = [pattern[j]];
						}
						if (ref1 = this.tag(i + j + fuzz), indexOf.call(pattern[j], ref1) < 0) {
							return -1;
						}
					}
					return i + j + fuzz - 1;
				}

				// Returns `yes` if standing in front of something looking like
				// `@<x>:`, `<x>:` or `<EXPRESSION_START><x>...<EXPRESSION_END>:`.
				looksObjectish(j) {
					var end, index;
					if (this.indexOfTag(j, '@', null, ':') !== -1 || this.indexOfTag(j, null, ':') !== -1) {
						return true;
					}
					index = this.indexOfTag(j, EXPRESSION_START);
					if (index !== -1) {
						end = null;
						this.detectEnd(index + 1, (function(token) {
							var ref;
							return ref = token[0], indexOf.call(EXPRESSION_END, ref) >= 0;
						}), (function(token, i) {
							return end = i;
						}));
						if (this.tag(end + 1) === ':') {
							return true;
						}
					}
					return false;
				}

				// Returns `yes` if current line of tokens contain an element of tags on same
				// expression level. Stop searching at `LINEBREAKS` or explicit start of
				// containing balanced expression.
				findTagsBackwards(i, tags) {
					var backStack, ref, ref1, ref2, ref3, ref4, ref5;
					backStack = [];
					while (i >= 0 && (backStack.length || (ref2 = this.tag(i), indexOf.call(tags, ref2) < 0) && ((ref3 = this.tag(i), indexOf.call(EXPRESSION_START, ref3) < 0) || this.tokens[i].generated) && (ref4 = this.tag(i), indexOf.call(LINEBREAKS, ref4) < 0))) {
						if (ref = this.tag(i), indexOf.call(EXPRESSION_END, ref) >= 0) {
							backStack.push(this.tag(i));
						}
						if ((ref1 = this.tag(i), indexOf.call(EXPRESSION_START, ref1) >= 0) && backStack.length) {
							backStack.pop();
						}
						i -= 1;
					}
					return ref5 = this.tag(i), indexOf.call(tags, ref5) >= 0;
				}

				// Look for signs of implicit calls and objects in the token stream and
				// add them.
				addImplicitBracesAndParens() {
					var stack, start;
					// Track current balancing depth (both implicit and explicit) on stack.
					stack = [];
					start = null;
					return this.scanTokens(function(token, i, tokens) {
						var endImplicitCall, endImplicitObject, forward, implicitObjectContinues, implicitObjectIndent, inControlFlow, inImplicit, inImplicitCall, inImplicitControl, inImplicitObject, isImplicit, isImplicitCall, isImplicitObject, k, newLine, nextTag, nextToken, offset, preContinuationLineIndent, preObjectToken, prevTag, prevToken, ref, ref1, ref2, ref3, ref4, ref5, s, sameLine, stackIdx, stackItem, stackNext, stackTag, stackTop, startIdx, startImplicitCall, startImplicitObject, startIndex, startTag, startsLine, tag;
						[tag] = token;
						[prevTag] = prevToken = i > 0 ? tokens[i - 1] : [];
						[nextTag] = nextToken = i < tokens.length - 1 ? tokens[i + 1] : [];
						stackTop = function() {
							return stack[stack.length - 1];
						};
						startIdx = i;
						// Helper function, used for keeping track of the number of tokens consumed
						// and spliced, when returning for getting a new token.
						forward = function(n) {
							return i - startIdx + n;
						};
						// Helper functions
						isImplicit = function(stackItem) {
							var ref;
							return stackItem != null ? (ref = stackItem[2]) != null ? ref.ours : void 0 : void 0;
						};
						isImplicitObject = function(stackItem) {
							return isImplicit(stackItem) && (stackItem != null ? stackItem[0] : void 0) === '{';
						};
						isImplicitCall = function(stackItem) {
							return isImplicit(stackItem) && (stackItem != null ? stackItem[0] : void 0) === '(';
						};
						inImplicit = function() {
							return isImplicit(stackTop());
						};
						inImplicitCall = function() {
							return isImplicitCall(stackTop());
						};
						inImplicitObject = function() {
							return isImplicitObject(stackTop());
						};
						// Unclosed control statement inside implicit parens (like
						// class declaration or if-conditionals).
						inImplicitControl = function() {
							var ref;
							return inImplicit() && ((ref = stackTop()) != null ? ref[0] : void 0) === 'CONTROL';
						};
						startImplicitCall = function(idx) {
							stack.push([
								'(',
								idx,
								{
									ours: true
								}
							]);
							return tokens.splice(idx, 0, generate('CALL_START', '(', ['', 'implicit function call', token[2]], prevToken));
						};
						endImplicitCall = function() {
							stack.pop();
							tokens.splice(i, 0, generate('CALL_END', ')', ['', 'end of input', token[2]], prevToken));
							return i += 1;
						};
						startImplicitObject = function(idx, {startsLine = true, continuationLineIndent} = {}) {
							var val;
							stack.push([
								'{',
								idx,
								{
									sameLine: true,
									startsLine: startsLine,
									ours: true,
									continuationLineIndent: continuationLineIndent
								}
							]);
							val = new String('{');
							val.generated = true;
							return tokens.splice(idx, 0, generate('{', val, token, prevToken));
						};
						endImplicitObject = function(j) {
							j = j != null ? j : i;
							stack.pop();
							tokens.splice(j, 0, generate('}', '}', token, prevToken));
							return i += 1;
						};
						implicitObjectContinues = (j) => {
							var nextTerminatorIdx;
							nextTerminatorIdx = null;
							this.detectEnd(j, function(token) {
								return token[0] === 'TERMINATOR';
							}, function(token, i) {
								return nextTerminatorIdx = i;
							}, {
								returnOnNegativeLevel: true
							});
							if (nextTerminatorIdx == null) {
								return false;
							}
							return this.looksObjectish(nextTerminatorIdx + 1);
						};
						// Don’t end an implicit call/object on next indent if any of these are in an argument/value.
						if ((inImplicitCall() || inImplicitObject()) && indexOf.call(CONTROL_IN_IMPLICIT, tag) >= 0 || inImplicitObject() && prevTag === ':' && tag === 'FOR') {
							stack.push([
								'CONTROL',
								i,
								{
									ours: true
								}
							]);
							return forward(1);
						}
						if (tag === 'INDENT' && inImplicit()) {
							// An `INDENT` closes an implicit call unless

							//  1. We have seen a `CONTROL` argument on the line.
							//  2. The last token before the indent is part of the list below.
							if (prevTag !== '=>' && prevTag !== '->' && prevTag !== '[' && prevTag !== '(' && prevTag !== ',' && prevTag !== '{' && prevTag !== 'ELSE' && prevTag !== '=') {
								while (inImplicitCall() || inImplicitObject() && prevTag !== ':') {
									if (inImplicitCall()) {
										endImplicitCall();
									} else {
										endImplicitObject();
									}
								}
							}
							if (inImplicitControl()) {
								stack.pop();
							}
							stack.push([tag, i]);
							return forward(1);
						}
						// Straightforward start of explicit expression.
						if (indexOf.call(EXPRESSION_START, tag) >= 0) {
							stack.push([tag, i]);
							return forward(1);
						}
						// Close all implicit expressions inside of explicitly closed expressions.
						if (indexOf.call(EXPRESSION_END, tag) >= 0) {
							while (inImplicit()) {
								if (inImplicitCall()) {
									endImplicitCall();
								} else if (inImplicitObject()) {
									endImplicitObject();
								} else {
									stack.pop();
								}
							}
							start = stack.pop();
						}
						inControlFlow = () => {
							var controlFlow, isFunc, seenFor, tagCurrentLine;
							seenFor = this.findTagsBackwards(i, ['FOR']) && this.findTagsBackwards(i, ['FORIN', 'FOROF', 'FORFROM']);
							controlFlow = seenFor || this.findTagsBackwards(i, ['WHILE', 'UNTIL', 'LOOP', 'LEADING_WHEN']);
							if (!controlFlow) {
								return false;
							}
							isFunc = false;
							tagCurrentLine = token[2].first_line;
							this.detectEnd(i, function(token, i) {
								var ref;
								return ref = token[0], indexOf.call(LINEBREAKS, ref) >= 0;
							}, function(token, i) {
								var first_line;
								[prevTag, , {first_line}] = tokens[i - 1] || [];
								return isFunc = tagCurrentLine === first_line && (prevTag === '->' || prevTag === '=>');
							}, {
								returnOnNegativeLevel: true
							});
							return isFunc;
						};
						// Recognize standard implicit calls like
						// f a, f() b, f? c, h[0] d etc.
						// Added support for spread dots on the left side: f ...a
						if ((indexOf.call(IMPLICIT_FUNC, tag) >= 0 && token.spaced || tag === '?' && i > 0 && !tokens[i - 1].spaced) && (indexOf.call(IMPLICIT_CALL, nextTag) >= 0 || (nextTag === '...' && (ref = this.tag(i + 2), indexOf.call(IMPLICIT_CALL, ref) >= 0) && !this.findTagsBackwards(i, ['INDEX_START', '['])) || indexOf.call(IMPLICIT_UNSPACED_CALL, nextTag) >= 0 && !nextToken.spaced && !nextToken.newLine) && !inControlFlow()) {
							if (tag === '?') {
								tag = token[0] = 'FUNC_EXIST';
							}
							startImplicitCall(i + 1);
							return forward(2);
						}
						// Implicit call taking an implicit indented object as first argument.

						//     f
						//       a: b
						//       c: d

						// Don’t accept implicit calls of this type, when on the same line
						// as the control structures below as that may misinterpret constructs like:

						//     if f
						//        a: 1
						// as

						//     if f(a: 1)

						// which is probably always unintended.
						// Furthermore don’t allow this in the first line of a literal array
						// or explicit object, as that creates grammatical ambiguities (#5368).
						if (indexOf.call(IMPLICIT_FUNC, tag) >= 0 && this.indexOfTag(i + 1, 'INDENT') > -1 && this.looksObjectish(i + 2) && !this.findTagsBackwards(i, ['CLASS', 'EXTENDS', 'IF', 'CATCH', 'SWITCH', 'LEADING_WHEN', 'FOR', 'WHILE', 'UNTIL']) && !(((ref1 = (s = (ref2 = stackTop()) != null ? ref2[0] : void 0)) === '{' || ref1 === '[') && !isImplicit(stackTop()) && this.findTagsBackwards(i, s))) {
							startImplicitCall(i + 1);
							stack.push(['INDENT', i + 2]);
							return forward(3);
						}
						// Implicit objects start here.
						if (tag === ':') {
							// Go back to the (implicit) start of the object.
							s = (function() {
								var ref3;
								switch (false) {
									case ref3 = this.tag(i - 1), indexOf.call(EXPRESSION_END, ref3) < 0:
										[startTag, startIndex] = start;
										if (startTag === '[' && startIndex > 0 && this.tag(startIndex - 1) === '@' && !tokens[startIndex - 1].spaced) {
											return startIndex - 1;
										} else {
											return startIndex;
										}
										break;
									case this.tag(i - 2) !== '@':
										return i - 2;
									default:
										return i - 1;
								}
							}).call(this);
							startsLine = s <= 0 || (ref3 = this.tag(s - 1), indexOf.call(LINEBREAKS, ref3) >= 0) || tokens[s - 1].newLine;
							// Are we just continuing an already declared object?
							// Including the case where we indent on the line after an explicit '{'.
							if (stackTop()) {
								[stackTag, stackIdx] = stackTop();
								stackNext = stack[stack.length - 2];
								if ((stackTag === '{' || stackTag === 'INDENT' && (stackNext != null ? stackNext[0] : void 0) === '{' && !isImplicit(stackNext) && this.findTagsBackwards(stackIdx - 1, ['{'])) && (startsLine || this.tag(s - 1) === ',' || this.tag(s - 1) === '{') && (ref4 = this.tag(s - 1), indexOf.call(UNFINISHED, ref4) < 0)) {
									return forward(1);
								}
							}
							preObjectToken = i > 1 ? tokens[i - 2] : [];
							startImplicitObject(s, {
								startsLine: !!startsLine,
								continuationLineIndent: preObjectToken.continuationLineIndent
							});
							return forward(2);
						}
						// End implicit calls when chaining method calls
						// like e.g.:

						//     f ->
						//       a
						//     .g b, ->
						//       c
						//     .h a

						// and also

						//     f a
						//     .g b
						//     .h a

						// Mark all enclosing objects as not sameLine
						if (indexOf.call(LINEBREAKS, tag) >= 0) {
							for (k = stack.length - 1; k >= 0; k += -1) {
								stackItem = stack[k];
								if (!isImplicit(stackItem)) {
									break;
								}
								if (isImplicitObject(stackItem)) {
									stackItem[2].sameLine = false;
								}
							}
						}
						// End indented-continuation-line implicit objects once that indentation is over.
						if (tag === 'TERMINATOR' && token.endsContinuationLineIndentation) {
							({preContinuationLineIndent} = token.endsContinuationLineIndentation);
							while (inImplicitObject() && ((implicitObjectIndent = stackTop()[2].continuationLineIndent) != null) && implicitObjectIndent > preContinuationLineIndent) {
								endImplicitObject();
							}
						}
						newLine = prevTag === 'OUTDENT' || prevToken.newLine;
						if (indexOf.call(IMPLICIT_END, tag) >= 0 || (indexOf.call(CALL_CLOSERS, tag) >= 0 && newLine) || ((tag === '..' || tag === '...') && this.findTagsBackwards(i, ["INDEX_START"]))) {
							while (inImplicit()) {
								[stackTag, stackIdx, {sameLine, startsLine}] = stackTop();
								// Close implicit calls when reached end of argument list
								if (inImplicitCall() && prevTag !== ',' || (prevTag === ',' && tag === 'TERMINATOR' && (nextTag == null))) {
									endImplicitCall();
								// Close implicit objects such as:
								// return a: 1, b: 2 unless true
								} else if (inImplicitObject() && sameLine && tag !== 'TERMINATOR' && prevTag !== ':' && !((tag === 'POST_IF' || tag === 'FOR' || tag === 'WHILE' || tag === 'UNTIL') && startsLine && implicitObjectContinues(i + 1))) {
									endImplicitObject();
								// Close implicit objects when at end of line, line didn't end with a comma
								// and the implicit object didn't start the line or the next line doesn’t look like
								// the continuation of an object.
								} else if (inImplicitObject() && tag === 'TERMINATOR' && prevTag !== ',' && !(startsLine && this.looksObjectish(i + 1))) {
									endImplicitObject();
								} else if (inImplicitControl() && tokens[stackTop()[1]][0] === 'CLASS' && tag === 'TERMINATOR') {
									stack.pop();
								} else {
									break;
								}
							}
						}
						// Close implicit object if comma is the last character
						// and what comes after doesn’t look like it belongs.
						// This is used for trailing commas and calls, like:

						//     x =
						//         a: b,
						//         c: d,
						//     e = 2

						// and

						//     f a, b: c, d: e, f, g: h: i, j

						if (tag === ',' && !this.looksObjectish(i + 1) && inImplicitObject() && !((ref5 = this.tag(i + 2)) === 'FOROF' || ref5 === 'FORIN') && (nextTag !== 'TERMINATOR' || !this.looksObjectish(i + 2))) {
							// When nextTag is OUTDENT the comma is insignificant and
							// should just be ignored so embed it in the implicit object.

							// When it isn’t the comma go on to play a role in a call or
							// array further up the stack, so give it a chance.
							offset = nextTag === 'OUTDENT' ? 1 : 0;
							while (inImplicitObject()) {
								endImplicitObject(i + offset);
							}
						}
						return forward(1);
					});
				}

				// Make sure only strings and wrapped expressions are used in JSX attributes.
				enforceValidJSXAttributes() {
					return this.scanTokens(function(token, i, tokens) {
						var next, ref;
						if (token.jsxColon) {
							next = tokens[i + 1];
							if ((ref = next[0]) !== 'STRING_START' && ref !== 'STRING' && ref !== '(') {
								throwSyntaxError('expected wrapped or quoted JSX attribute', next[2]);
							}
						}
						return 1;
					});
				}

				// Not all tokens survive processing by the parser. To avoid comments getting
				// lost into the ether, find comments attached to doomed tokens and move them
				// to a token that will make it to the other side.
				rescueStowawayComments() {
					var dontShiftForward, insertPlaceholder, shiftCommentsBackward, shiftCommentsForward;
					insertPlaceholder = function(token, j, tokens, method) {
						if (tokens[j][0] !== 'TERMINATOR') {
							tokens[method](generate('TERMINATOR', '\n', tokens[j]));
						}
						return tokens[method](generate('JS', '', tokens[j], token));
					};
					dontShiftForward = function(i, tokens) {
						var j, ref;
						j = i + 1;
						while (j !== tokens.length && (ref = tokens[j][0], indexOf.call(DISCARDED, ref) >= 0)) {
							if (tokens[j][0] === 'INTERPOLATION_END') {
								return true;
							}
							j++;
						}
						return false;
					};
					shiftCommentsForward = function(token, i, tokens) {
						var comment, j, k, len, ref, ref1, ref2;
						// Find the next surviving token and attach this token’s comments to it,
						// with a flag that we know to output such comments *before* that
						// token’s own compilation. (Otherwise comments are output following
						// the token they’re attached to.)
						j = i;
						while (j !== tokens.length && (ref = tokens[j][0], indexOf.call(DISCARDED, ref) >= 0)) {
							j++;
						}
						if (!(j === tokens.length || (ref1 = tokens[j][0], indexOf.call(DISCARDED, ref1) >= 0))) {
							ref2 = token.comments;
							for (k = 0, len = ref2.length; k < len; k++) {
								comment = ref2[k];
								comment.unshift = true;
							}
							moveComments(token, tokens[j]);
							return 1; // All following tokens are doomed!
						} else {
							j = tokens.length - 1;
							insertPlaceholder(token, j, tokens, 'push');
							// The generated tokens were added to the end, not inline, so we don’t skip.
							return 1;
						}
					};
					shiftCommentsBackward = function(token, i, tokens) {
						var j, ref, ref1;
						// Find the last surviving token and attach this token’s comments to it.
						j = i;
						while (j !== -1 && (ref = tokens[j][0], indexOf.call(DISCARDED, ref) >= 0)) {
							j--;
						}
						if (!(j === -1 || (ref1 = tokens[j][0], indexOf.call(DISCARDED, ref1) >= 0))) {
							moveComments(token, tokens[j]);
							return 1; // All previous tokens are doomed!
						} else {
							insertPlaceholder(token, 0, tokens, 'unshift');
							// We added two tokens, so shift forward to account for the insertion.
							return 3;
						}
					};
					return this.scanTokens(function(token, i, tokens) {
						var dummyToken, j, ref, ref1, ret;
						if (!token.comments) {
							return 1;
						}
						ret = 1;
						if (ref = token[0], indexOf.call(DISCARDED, ref) >= 0) {
							// This token won’t survive passage through the parser, so we need to
							// rescue its attached tokens and redistribute them to nearby tokens.
							// Comments that don’t start a new line can shift backwards to the last
							// safe token, while other tokens should shift forward.
							dummyToken = {
								comments: []
							};
							j = token.comments.length - 1;
							while (j !== -1) {
								if (token.comments[j].newLine === false && token.comments[j].here === false) {
									dummyToken.comments.unshift(token.comments[j]);
									token.comments.splice(j, 1);
								}
								j--;
							}
							if (dummyToken.comments.length !== 0) {
								ret = shiftCommentsBackward(dummyToken, i - 1, tokens);
							}
							if (token.comments.length !== 0) {
								shiftCommentsForward(token, i, tokens);
							}
						} else if (!dontShiftForward(i, tokens)) {
							// If any of this token’s comments start a line—there’s only
							// whitespace between the preceding newline and the start of the
							// comment—and this isn’t one of the special `JS` tokens, then
							// shift this comment forward to precede the next valid token.
							// `Block.compileComments` also has logic to make sure that
							// “starting new line” comments follow or precede the nearest
							// newline relative to the token that the comment is attached to,
							// but that newline might be inside a `}` or `)` or other generated
							// token that we really want this comment to output after. Therefore
							// we need to shift the comments here, avoiding such generated and
							// discarded tokens.
							dummyToken = {
								comments: []
							};
							j = token.comments.length - 1;
							while (j !== -1) {
								if (token.comments[j].newLine && !token.comments[j].unshift && !(token[0] === 'JS' && token.generated)) {
									dummyToken.comments.unshift(token.comments[j]);
									token.comments.splice(j, 1);
								}
								j--;
							}
							if (dummyToken.comments.length !== 0) {
								ret = shiftCommentsForward(dummyToken, i + 1, tokens);
							}
						}
						if (((ref1 = token.comments) != null ? ref1.length : void 0) === 0) {
							delete token.comments;
						}
						return ret;
					});
				}

				// Add location data to all tokens generated by the rewriter.
				addLocationDataToGeneratedTokens() {
					return this.scanTokens(function(token, i, tokens) {
						var column, line, nextLocation, prevLocation, rangeIndex, ref, ref1;
						if (token[2]) {
							return 1;
						}
						if (!(token.generated || token.explicit)) {
							return 1;
						}
						if (token.fromThen && token[0] === 'INDENT') {
							token[2] = token.origin[2];
							return 1;
						}
						if (token[0] === '{' && (nextLocation = (ref = tokens[i + 1]) != null ? ref[2] : void 0)) {
							({
								first_line: line,
								first_column: column,
								range: [rangeIndex]
							} = nextLocation);
						} else if (prevLocation = (ref1 = tokens[i - 1]) != null ? ref1[2] : void 0) {
							({
								last_line: line,
								last_column: column,
								range: [, rangeIndex]
							} = prevLocation);
							column += 1;
						} else {
							line = column = 0;
							rangeIndex = 0;
						}
						token[2] = {
							first_line: line,
							first_column: column,
							last_line: line,
							last_column: column,
							last_line_exclusive: line,
							last_column_exclusive: column,
							range: [rangeIndex, rangeIndex]
						};
						return 1;
					});
				}

				// `OUTDENT` tokens should always be positioned at the last character of the
				// previous token, so that AST nodes ending in an `OUTDENT` token end up with a
				// location corresponding to the last “real” token under the node.
				fixIndentationLocationData() {
					var findPrecedingComment;
					if (this.allComments == null) {
						this.allComments = extractAllCommentTokens(this.tokens);
					}
					findPrecedingComment = (token, {afterPosition, indentSize, first, indented}) => {
						var comment, k, l, lastMatching, matches, ref, ref1, tokenStart;
						tokenStart = token[2].range[0];
						matches = function(comment) {
							if (comment.outdented) {
								if (!((indentSize != null) && comment.indentSize > indentSize)) {
									return false;
								}
							}
							if (indented && !comment.indented) {
								return false;
							}
							if (!(comment.locationData.range[0] < tokenStart)) {
								return false;
							}
							if (!(comment.locationData.range[0] > afterPosition)) {
								return false;
							}
							return true;
						};
						if (first) {
							lastMatching = null;
							ref = this.allComments;
							for (k = ref.length - 1; k >= 0; k += -1) {
								comment = ref[k];
								if (matches(comment)) {
									lastMatching = comment;
								} else if (lastMatching) {
									return lastMatching;
								}
							}
							return lastMatching;
						}
						ref1 = this.allComments;
						for (l = ref1.length - 1; l >= 0; l += -1) {
							comment = ref1[l];
							if (matches(comment)) {
								return comment;
							}
						}
						return null;
					};
					return this.scanTokens(function(token, i, tokens) {
						var isIndent, nextToken, nextTokenIndex, precedingComment, prevLocationData, prevToken, ref, ref1, ref2, useNextToken;
						if (!(((ref = token[0]) === 'INDENT' || ref === 'OUTDENT') || (token.generated && token[0] === 'CALL_END' && !((ref1 = token.data) != null ? ref1.closingTagNameToken : void 0)) || (token.generated && token[0] === '}'))) {
							return 1;
						}
						isIndent = token[0] === 'INDENT';
						prevToken = (ref2 = token.prevToken) != null ? ref2 : tokens[i - 1];
						prevLocationData = prevToken[2];
						// addLocationDataToGeneratedTokens() set the outdent’s location data
						// to the preceding token’s, but in order to detect comments inside an
						// empty "block" we want to look for comments preceding the next token.
						useNextToken = token.explicit || token.generated;
						if (useNextToken) {
							nextToken = token;
							nextTokenIndex = i;
							while ((nextToken.explicit || nextToken.generated) && nextTokenIndex !== tokens.length - 1) {
								nextToken = tokens[nextTokenIndex++];
							}
						}
						precedingComment = findPrecedingComment(useNextToken ? nextToken : token, {
							afterPosition: prevLocationData.range[0],
							indentSize: token.indentSize,
							first: isIndent,
							indented: useNextToken
						});
						if (isIndent) {
							if (!(precedingComment != null ? precedingComment.newLine : void 0)) {
								return 1;
							}
						}
						if (token.generated && token[0] === 'CALL_END' && (precedingComment != null ? precedingComment.indented : void 0)) {
							// We don’t want e.g. an implicit call at the end of an `if` condition to
							// include a following indented comment.
							return 1;
						}
						if (precedingComment != null) {
							prevLocationData = precedingComment.locationData;
						}
						token[2] = {
							first_line: precedingComment != null ? prevLocationData.first_line : prevLocationData.last_line,
							first_column: precedingComment != null ? isIndent ? 0 : prevLocationData.first_column : prevLocationData.last_column,
							last_line: prevLocationData.last_line,
							last_column: prevLocationData.last_column,
							last_line_exclusive: prevLocationData.last_line_exclusive,
							last_column_exclusive: prevLocationData.last_column_exclusive,
							range: isIndent && (precedingComment != null) ? [prevLocationData.range[0] - precedingComment.indentSize, prevLocationData.range[1]] : prevLocationData.range
						};
						return 1;
					});
				}

				// Because our grammar is LALR(1), it can’t handle some single-line
				// expressions that lack ending delimiters. The **Rewriter** adds the implicit
				// blocks, so it doesn’t need to. To keep the grammar clean and tidy, trailing
				// newlines within expressions are removed and the indentation tokens of empty
				// blocks are added.
				normalizeLines() {
					var action, closeElseTag, condition, ifThens, indent, leading_if_then, leading_switch_when, outdent, starter;
					starter = indent = outdent = null;
					leading_switch_when = null;
					leading_if_then = null;
					// Count `THEN` tags
					ifThens = [];
					condition = function(token, i) {
						var ref, ref1, ref2, ref3;
						return token[1] !== ';' && (ref = token[0], indexOf.call(SINGLE_CLOSERS, ref) >= 0) && !(token[0] === 'TERMINATOR' && (ref1 = this.tag(i + 1), indexOf.call(EXPRESSION_CLOSE, ref1) >= 0)) && !(token[0] === 'ELSE' && (starter !== 'THEN' || (leading_if_then || leading_switch_when))) && !(((ref2 = token[0]) === 'CATCH' || ref2 === 'FINALLY') && (starter === '->' || starter === '=>')) || (ref3 = token[0], indexOf.call(CALL_CLOSERS, ref3) >= 0) && (this.tokens[i - 1].newLine || this.tokens[i - 1][0] === 'OUTDENT');
					};
					action = function(token, i) {
						if (token[0] === 'ELSE' && starter === 'THEN') {
							ifThens.pop();
						}
						return this.tokens.splice((this.tag(i - 1) === ',' ? i - 1 : i), 0, outdent);
					};
					closeElseTag = (tokens, i) => {
						var lastThen, outdentElse, tlen;
						tlen = ifThens.length;
						if (!(tlen > 0)) {
							return i;
						}
						lastThen = ifThens.pop();
						[, outdentElse] = this.indentation(tokens[lastThen]);
						// Insert `OUTDENT` to close inner `IF`.
						outdentElse[1] = tlen * 2;
						tokens.splice(i, 0, outdentElse);
						// Insert `OUTDENT` to close outer `IF`.
						outdentElse[1] = 2;
						tokens.splice(i + 1, 0, outdentElse);
						// Remove outdents from the end.
						this.detectEnd(i + 2, function(token, i) {
							var ref;
							return (ref = token[0]) === 'OUTDENT' || ref === 'TERMINATOR';
						}, function(token, i) {
							if (this.tag(i) === 'OUTDENT' && this.tag(i + 1) === 'OUTDENT') {
								return tokens.splice(i, 2);
							}
						});
						return i + 2;
					};
					return this.scanTokens(function(token, i, tokens) {
						var conditionTag, j, k, ref, ref1, ref2, tag;
						[tag] = token;
						conditionTag = (tag === '->' || tag === '=>') && this.findTagsBackwards(i, ['IF', 'WHILE', 'FOR', 'UNTIL', 'SWITCH', 'WHEN', 'LEADING_WHEN', '[', 'INDEX_START']) && !(this.findTagsBackwards(i, ['THEN', '..', '...']));
						if (tag === 'TERMINATOR') {
							if (this.tag(i + 1) === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
								tokens.splice(i, 1, ...this.indentation());
								return 1;
							}
							if (ref = this.tag(i + 1), indexOf.call(EXPRESSION_CLOSE, ref) >= 0) {
								if (token[1] === ';' && this.tag(i + 1) === 'OUTDENT') {
									tokens[i + 1].prevToken = token;
									moveComments(token, tokens[i + 1]);
								}
								tokens.splice(i, 1);
								return 0;
							}
						}
						if (tag === 'CATCH') {
							for (j = k = 1; k <= 2; j = ++k) {
								if (!((ref1 = this.tag(i + j)) === 'OUTDENT' || ref1 === 'TERMINATOR' || ref1 === 'FINALLY')) {
									continue;
								}
								tokens.splice(i + j, 0, ...this.indentation());
								return 2 + j;
							}
						}
						if ((tag === '->' || tag === '=>') && (((ref2 = this.tag(i + 1)) === ',' || ref2 === ']') || this.tag(i + 1) === '.' && token.newLine)) {
							[indent, outdent] = this.indentation(tokens[i]);
							tokens.splice(i + 1, 0, indent, outdent);
							return 1;
						}
						if (indexOf.call(SINGLE_LINERS, tag) >= 0 && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF') && !conditionTag) {
							starter = tag;
							[indent, outdent] = this.indentation(tokens[i]);
							if (starter === 'THEN') {
								indent.fromThen = true;
							}
							if (tag === 'THEN') {
								leading_switch_when = this.findTagsBackwards(i, ['LEADING_WHEN']) && this.tag(i + 1) === 'IF';
								leading_if_then = this.findTagsBackwards(i, ['IF']) && this.tag(i + 1) === 'IF';
							}
							if (tag === 'THEN' && this.findTagsBackwards(i, ['IF'])) {
								ifThens.push(i);
							}
							// `ELSE` tag is not closed.
							if (tag === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
								i = closeElseTag(tokens, i);
							}
							tokens.splice(i + 1, 0, indent);
							this.detectEnd(i + 2, condition, action);
							if (tag === 'THEN') {
								tokens.splice(i, 1);
							}
							return 1;
						}
						return 1;
					});
				}

				// Tag postfix conditionals as such, so that we can parse them with a
				// different precedence.
				tagPostfixConditionals() {
					var action, condition, original;
					original = null;
					condition = function(token, i) {
						var prevTag, tag;
						[tag] = token;
						[prevTag] = this.tokens[i - 1];
						return tag === 'TERMINATOR' || (tag === 'INDENT' && indexOf.call(SINGLE_LINERS, prevTag) < 0);
					};
					action = function(token, i) {
						if (token[0] !== 'INDENT' || (token.generated && !token.fromThen)) {
							return original[0] = 'POST_' + original[0];
						}
					};
					return this.scanTokens(function(token, i) {
						if (token[0] !== 'IF') {
							return 1;
						}
						original = token;
						this.detectEnd(i + 1, condition, action);
						return 1;
					});
				}

				// For tokens with extra data, we want to make that data visible to the grammar
				// by wrapping the token value as a String() object and setting the data as
				// properties of that object. The grammar should then be responsible for
				// cleaning this up for the node constructor: unwrapping the token value to a
				// primitive string and separately passing any expected token data properties
				exposeTokenDataToGrammar() {
					return this.scanTokens(function(token, i) {
						var key, ref, ref1, val;
						if (token.generated || (token.data && Object.keys(token.data).length !== 0)) {
							token[1] = new String(token[1]);
							ref1 = (ref = token.data) != null ? ref : {};
							for (key in ref1) {
								if (!hasProp.call(ref1, key)) continue;
								val = ref1[key];
								token[1][key] = val;
							}
							if (token.generated) {
								token[1].generated = true;
							}
						}
						return 1;
					});
				}

				// Generate the indentation tokens, based on another token on the same line.
				indentation(origin) {
					var indent, outdent;
					indent = ['INDENT', 2];
					outdent = ['OUTDENT', 2];
					if (origin) {
						indent.generated = outdent.generated = true;
						indent.origin = outdent.origin = origin;
					} else {
						indent.explicit = outdent.explicit = true;
					}
					return [indent, outdent];
				}

				// Look up a tag by token index.
				tag(i) {
					var ref;
					return (ref = this.tokens[i]) != null ? ref[0] : void 0;
				}

			};

			Rewriter.prototype.generate = generate;

			return Rewriter;

		}).call(this);

		// Constants
		// ---------

		// List of the token pairs that must be balanced.
		BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END'], ['STRING_START', 'STRING_END'], ['INTERPOLATION_START', 'INTERPOLATION_END'], ['REGEX_START', 'REGEX_END']];

		// The inverse mappings of `BALANCED_PAIRS` we’re trying to fix up, so we can
		// look things up from either end.
		exports.INVERSES = INVERSES = {};

		// The tokens that signal the start/end of a balanced pair.
		EXPRESSION_START = [];

		EXPRESSION_END = [];

		for (k = 0, len = BALANCED_PAIRS.length; k < len; k++) {
			[left, right] = BALANCED_PAIRS[k];
			EXPRESSION_START.push(INVERSES[right] = left);
			EXPRESSION_END.push(INVERSES[left] = right);
		}

		// Tokens that indicate the close of a clause of an expression.
		EXPRESSION_CLOSE = ['CATCH', 'THEN', 'ELSE', 'FINALLY'].concat(EXPRESSION_END);

		// Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
		IMPLICIT_FUNC = ['IDENTIFIER', 'PROPERTY', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS'];

		// If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
		IMPLICIT_CALL = ['IDENTIFIER', 'JSX_TAG', 'PROPERTY', 'NUMBER', 'INFINITY', 'NAN', 'STRING', 'STRING_START', 'REGEX', 'REGEX_START', 'JS', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'DYNAMIC_IMPORT', 'IMPORT_META', 'NEW_TARGET', 'UNDEFINED', 'NULL', 'BOOL', 'UNARY', 'DO', 'DO_IIFE', 'YIELD', 'AWAIT', 'UNARY_MATH', 'SUPER', 'THROW', '@', '->', '=>', '[', '(', '{', '--', '++'];

		IMPLICIT_UNSPACED_CALL = ['+', '-'];

		// Tokens that always mark the end of an implicit call for single-liners.
		IMPLICIT_END = ['POST_IF', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR'];

		// Single-line flavors of block expressions that have unclosed endings.
		// The grammar can’t disambiguate them, so we insert the implicit indentation.
		SINGLE_LINERS = ['ELSE', '->', '=>', 'TRY', 'FINALLY', 'THEN'];

		SINGLE_CLOSERS = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN'];

		// Tokens that end a line.
		LINEBREAKS = ['TERMINATOR', 'INDENT', 'OUTDENT'];

		// Tokens that close open calls when they follow a newline.
		CALL_CLOSERS = ['.', '?.', '::', '?::'];

		// Tokens that prevent a subsequent indent from ending implicit calls/objects
		CONTROL_IN_IMPLICIT = ['IF', 'TRY', 'FINALLY', 'CATCH', 'CLASS', 'SWITCH'];

		// Tokens that are swallowed up by the parser, never leading to code generation.
		// You can spot these in `grammar.coffee` because the `o` function second
		// argument doesn’t contain a `new` call for these tokens.
		// `STRING_START` isn’t on this list because its `locationData` matches that of
		// the node that becomes `StringWithInterpolations`, and therefore
		// `addDataToNode` attaches `STRING_START`’s tokens to that node.
		DISCARDED = ['(', ')', '[', ']', '{', '}', ':', '.', '..', '...', ',', '=', '++', '--', '?', 'AS', 'AWAIT', 'CALL_START', 'CALL_END', 'DEFAULT', 'DO', 'DO_IIFE', 'ELSE', 'EXTENDS', 'EXPORT', 'FORIN', 'FOROF', 'FORFROM', 'IMPORT', 'INDENT', 'INDEX_SOAK', 'INTERPOLATION_START', 'INTERPOLATION_END', 'LEADING_WHEN', 'OUTDENT', 'PARAM_END', 'REGEX_START', 'REGEX_END', 'RETURN', 'STRING_END', 'THROW', 'UNARY', 'YIELD'].concat(IMPLICIT_UNSPACED_CALL.concat(IMPLICIT_END.concat(CALL_CLOSERS.concat(CONTROL_IN_IMPLICIT))));

		// Tokens that, when appearing at the end of a line, suppress a following TERMINATOR/INDENT token
		exports.UNFINISHED = UNFINISHED = ['\\', '.', '?.', '?::', 'UNARY', 'DO', 'DO_IIFE', 'MATH', 'UNARY_MATH', '+', '-', '**', 'SHIFT', 'RELATION', 'COMPARE', '&', '^', '|', '&&', '||', 'BIN?', 'EXTENDS'];

		return exports;
	};
	//#endregion

	//#region URL: /lexer
	modules['/lexer'] = function () {
		// The CoffeeScript Lexer. Uses a series of token-matching regexes to attempt
		// matches against the beginning of the source code. When a match is found,
		// a token is produced, we consume the match, and start again. Tokens are in the
		// form:

		//     [tag, value, locationData]

		// where locationData is {first_line, first_column, last_line, last_column, last_line_exclusive, last_column_exclusive}, which is a
		// format that can be fed directly into [Jison](https://github.com/zaach/jison).  These
		// are read by jison in the `parser.lexer` function defined in coffeescript.coffee.
		var exports = {};
		var BOM, BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARABLE_LEFT_SIDE, COMPARE, COMPOUND_ASSIGN, HERECOMMENT_ILLEGAL, HEREDOC_DOUBLE, HEREDOC_INDENT, HEREDOC_SINGLE, HEREGEX, HEREGEX_COMMENT, HERE_JSTOKEN, IDENTIFIER, INDENTABLE_CLOSERS, INDEXABLE, INSIDE_JSX, INVERSES, JSTOKEN, JSX_ATTRIBUTE, JSX_FRAGMENT_IDENTIFIER, JSX_IDENTIFIER, JSX_IDENTIFIER_PART, JSX_INTERPOLATION, JS_KEYWORDS, LINE_BREAK, LINE_CONTINUER, Lexer, MATH, MULTI_DENT, NOT_REGEX, NUMBER, OPERATOR, POSSIBLY_DIVISION, REGEX, REGEX_FLAGS, REGEX_ILLEGAL, REGEX_INVALID_ESCAPE, RELATION, RESERVED, Rewriter, SHIFT, STRICT_PROSCRIBED, STRING_DOUBLE, STRING_INVALID_ESCAPE, STRING_SINGLE, STRING_START, TRAILING_SPACES, UNARY, UNARY_MATH, UNFINISHED, VALID_FLAGS, WHITESPACE, addTokenData, attachCommentsToNode, compact, count, flatten, invertLiterate, isForFrom, isUnassignable, key, locationDataToString, merge, parseNumber, repeat, replaceUnicodeCodePointEscapes, starts, throwSyntaxError,
			indexOf = [].indexOf,
			slice = [].slice;

		({Rewriter, INVERSES, UNFINISHED} = require('/rewriter'));

		// Import the helpers we need.
		({count, starts, compact, repeat, invertLiterate, merge, attachCommentsToNode, locationDataToString, throwSyntaxError, replaceUnicodeCodePointEscapes, flatten, parseNumber} = require('/helpers'));

		// The Lexer Class
		// ---------------

		// The Lexer class reads a stream of CoffeeScript and divvies it up into tagged
		// tokens. Some potential ambiguity in the grammar has been avoided by
		// pushing some extra smarts into the Lexer.
		exports.Lexer = Lexer = class Lexer {
			constructor() {
				// Throws an error at either a given offset from the current chunk or at the
				// location of a token (`token[2]`).
				this.error = this.error.bind(this);
			}

			// **tokenize** is the Lexer's main method. Scan by attempting to match tokens
			// one at a time, using a regular expression anchored at the start of the
			// remaining code, or a custom recursive token-matching method
			// (for interpolations). When the next token has been recorded, we move forward
			// within the code past the token, and begin again.

			// Each tokenizing method is responsible for returning the number of characters
			// it has consumed.

			// Before returning the token stream, run it through the [Rewriter](rewriter.html).
			tokenize(code, opts = {}) {
				var consumed, end, i, ref;
				this.literate = opts.literate; // Are we lexing literate CoffeeScript?
				this.indent = 0; // The current indentation level.
				this.baseIndent = 0; // The overall minimum indentation level.
				this.continuationLineAdditionalIndent = 0; // The over-indentation at the current level.
				this.outdebt = 0; // The under-outdentation at the current level.
				this.indents = []; // The stack of all current indentation levels.
				this.indentLiteral = ''; // The indentation.
				this.ends = []; // The stack for pairing up tokens.
				this.tokens = []; // Stream of parsed tokens in the form `['TYPE', value, location data]`.
				this.seenFor = false; // Used to recognize `FORIN`, `FOROF` and `FORFROM` tokens.
				this.seenImport = false; // Used to recognize `IMPORT FROM? AS?` tokens.
				this.seenExport = false; // Used to recognize `EXPORT FROM? AS?` tokens.
				this.importSpecifierList = false; // Used to identify when in an `IMPORT {...} FROM? ...`.
				this.exportSpecifierList = false; // Used to identify when in an `EXPORT {...} FROM? ...`.
				this.jsxDepth = 0; // Used to optimize JSX checks, how deep in JSX we are.
				this.jsxObjAttribute = {}; // Used to detect if JSX attributes is wrapped in {} (<div {props...} />).
				this.chunkLine = opts.line || 0; // The start line for the current @chunk.
				this.chunkColumn = opts.column || 0; // The start column of the current @chunk.
				this.chunkOffset = opts.offset || 0; // The start offset for the current @chunk.
				this.locationDataCompensations = opts.locationDataCompensations || {};
				code = this.clean(code); // The stripped, cleaned original source code.
				
				// At every position, run through this list of attempted matches,
				// short-circuiting if any of them succeed. Their order determines precedence:
				// `@literalToken` is the fallback catch-all.
				i = 0;
				while (this.chunk = code.slice(i)) {
					consumed = this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.stringToken() || this.numberToken() || this.jsxToken() || this.regexToken() || this.jsToken() || this.literalToken();
					// Update position.
					[this.chunkLine, this.chunkColumn, this.chunkOffset] = this.getLineAndColumnFromChunk(consumed);
					i += consumed;
					if (opts.untilBalanced && this.ends.length === 0) {
						return {
							tokens: this.tokens,
							index: i
						};
					}
				}
				this.closeIndentation();
				if (end = this.ends.pop()) {
					this.error(`missing ${end.tag}`, ((ref = end.origin) != null ? ref : end)[2]);
				}
				if (opts.rewrite === false) {
					return this.tokens;
				}
				return (new Rewriter()).rewrite(this.tokens);
			}

			// Preprocess the code to remove leading and trailing whitespace, carriage
			// returns, etc. If we’re lexing literate CoffeeScript, strip external Markdown
			// by removing all lines that aren’t indented by at least four spaces or a tab.
			clean(code) {
				var base, thusFar;
				thusFar = 0;
				if (code.charCodeAt(0) === BOM) {
					code = code.slice(1);
					this.locationDataCompensations[0] = 1;
					thusFar += 1;
				}
				if (WHITESPACE.test(code)) {
					code = `\n${code}`;
					this.chunkLine--;
					if ((base = this.locationDataCompensations)[0] == null) {
						base[0] = 0;
					}
					this.locationDataCompensations[0] -= 1;
				}
				code = code.replace(/\r/g, (match, offset) => {
					this.locationDataCompensations[thusFar + offset] = 1;
					return '';
				}).replace(TRAILING_SPACES, '');
				if (this.literate) {
					code = invertLiterate(code);
				}
				return code;
			}

			// Tokenizers
			// ----------

			// Matches identifying literals: variables, keywords, method names, etc.
			// Check to ensure that JavaScript reserved words aren’t being used as
			// identifiers. Because CoffeeScript reserves a handful of keywords that are
			// allowed in JavaScript, we’re careful not to tag them as keywords when
			// referenced as property names here, so you can still do `jQuery.is()` even
			// though `is` means `===` otherwise.
			identifierToken() {
				var alias, colon, colonOffset, colonToken, id, idLength, inJSXTag, input, match, poppedToken, prev, prevprev, ref, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, regExSuper, regex, sup, tag, tagToken, tokenData;
				inJSXTag = this.atJSXTag();
				regex = inJSXTag ? JSX_ATTRIBUTE : IDENTIFIER;
				if (!(match = regex.exec(this.chunk))) {
					return 0;
				}
				[input, id, colon] = match;
				// Preserve length of id for location data
				idLength = id.length;
				poppedToken = void 0;
				if (id === 'own' && this.tag() === 'FOR') {
					this.token('OWN', id);
					return id.length;
				}
				if (id === 'from' && this.tag() === 'YIELD') {
					this.token('FROM', id);
					return id.length;
				}
				if (id === 'as' && this.seenImport) {
					if (this.value() === '*') {
						this.tokens[this.tokens.length - 1][0] = 'IMPORT_ALL';
					} else if (ref = this.value(true), indexOf.call(COFFEE_KEYWORDS, ref) >= 0) {
						prev = this.prev();
						[prev[0], prev[1]] = ['IDENTIFIER', this.value(true)];
					}
					if ((ref1 = this.tag()) === 'DEFAULT' || ref1 === 'IMPORT_ALL' || ref1 === 'IDENTIFIER') {
						this.token('AS', id);
						return id.length;
					}
				}
				if (id === 'as' && this.seenExport) {
					if ((ref2 = this.tag()) === 'IDENTIFIER' || ref2 === 'DEFAULT') {
						this.token('AS', id);
						return id.length;
					}
					if (ref3 = this.value(true), indexOf.call(COFFEE_KEYWORDS, ref3) >= 0) {
						prev = this.prev();
						[prev[0], prev[1]] = ['IDENTIFIER', this.value(true)];
						this.token('AS', id);
						return id.length;
					}
				}
				if (id === 'default' && this.seenExport && ((ref4 = this.tag()) === 'EXPORT' || ref4 === 'AS')) {
					this.token('DEFAULT', id);
					return id.length;
				}
				if (id === 'assert' && (this.seenImport || this.seenExport) && this.tag() === 'STRING') {
					this.token('ASSERT', id);
					return id.length;
				}
				if (id === 'do' && (regExSuper = /^(\s*super)(?!\(\))/.exec(this.chunk.slice(3)))) {
					this.token('SUPER', 'super');
					this.token('CALL_START', '(');
					this.token('CALL_END', ')');
					[input, sup] = regExSuper;
					return sup.length + 3;
				}
				prev = this.prev();
				tag = colon || (prev != null) && (((ref5 = prev[0]) === '.' || ref5 === '?.' || ref5 === '::' || ref5 === '?::') || !prev.spaced && prev[0] === '@') ? 'PROPERTY' : 'IDENTIFIER';
				tokenData = {};
				if (tag === 'IDENTIFIER' && (indexOf.call(JS_KEYWORDS, id) >= 0 || indexOf.call(COFFEE_KEYWORDS, id) >= 0) && !(this.exportSpecifierList && indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
					tag = id.toUpperCase();
					if (tag === 'WHEN' && (ref6 = this.tag(), indexOf.call(LINE_BREAK, ref6) >= 0)) {
						tag = 'LEADING_WHEN';
					} else if (tag === 'FOR') {
						this.seenFor = {
							endsLength: this.ends.length
						};
					} else if (tag === 'UNLESS') {
						tag = 'IF';
					} else if (tag === 'IMPORT') {
						this.seenImport = true;
					} else if (tag === 'EXPORT') {
						this.seenExport = true;
					} else if (indexOf.call(UNARY, tag) >= 0) {
						tag = 'UNARY';
					} else if (indexOf.call(RELATION, tag) >= 0) {
						if (tag !== 'INSTANCEOF' && this.seenFor) {
							tag = 'FOR' + tag;
							this.seenFor = false;
						} else {
							tag = 'RELATION';
							if (this.value() === '!') {
								poppedToken = this.tokens.pop();
								tokenData.invert = (ref7 = (ref8 = poppedToken.data) != null ? ref8.original : void 0) != null ? ref7 : poppedToken[1];
							}
						}
					}
				} else if (tag === 'IDENTIFIER' && this.seenFor && id === 'from' && isForFrom(prev)) {
					tag = 'FORFROM';
					this.seenFor = false;
				// Throw an error on attempts to use `get` or `set` as keywords, or
				// what CoffeeScript would normally interpret as calls to functions named
				// `get` or `set`, i.e. `get({foo: function () {}})`.
				} else if (tag === 'PROPERTY' && prev) {
					if (prev.spaced && (ref9 = prev[0], indexOf.call(CALLABLE, ref9) >= 0) && /^[gs]et$/.test(prev[1]) && this.tokens.length > 1 && ((ref10 = this.tokens[this.tokens.length - 2][0]) !== '.' && ref10 !== '?.' && ref10 !== '@')) {
						this.error(`'${prev[1]}' cannot be used as a keyword, or as a function call without parentheses`, prev[2]);
					} else if (prev[0] === '.' && this.tokens.length > 1 && (prevprev = this.tokens[this.tokens.length - 2])[0] === 'UNARY' && prevprev[1] === 'new') {
						prevprev[0] = 'NEW_TARGET';
					} else if (prev[0] === '.' && this.tokens.length > 1 && (prevprev = this.tokens[this.tokens.length - 2])[0] === 'IMPORT' && prevprev[1] === 'import') {
						this.seenImport = false;
						prevprev[0] = 'IMPORT_META';
					} else if (this.tokens.length > 2) {
						prevprev = this.tokens[this.tokens.length - 2];
						if (((ref11 = prev[0]) === '@' || ref11 === 'THIS') && prevprev && prevprev.spaced && /^[gs]et$/.test(prevprev[1]) && ((ref12 = this.tokens[this.tokens.length - 3][0]) !== '.' && ref12 !== '?.' && ref12 !== '@')) {
							this.error(`'${prevprev[1]}' cannot be used as a keyword, or as a function call without parentheses`, prevprev[2]);
						}
					}
				}
				if (tag === 'IDENTIFIER' && indexOf.call(RESERVED, id) >= 0 && !inJSXTag) {
					this.error(`reserved word '${id}'`, {
						length: id.length
					});
				}
				if (!(tag === 'PROPERTY' || this.exportSpecifierList || this.importSpecifierList)) {
					if (indexOf.call(COFFEE_ALIASES, id) >= 0) {
						alias = id;
						id = COFFEE_ALIAS_MAP[id];
						tokenData.original = alias;
					}
					tag = (function() {
						switch (id) {
							case '!':
								return 'UNARY';
							case '==':
							case '!=':
								return 'COMPARE';
							case 'true':
							case 'false':
								return 'BOOL';
							case 'break':
							case 'continue':
							case 'debugger':
								return 'STATEMENT';
							case '&&':
							case '||':
								return id;
							default:
								return tag;
						}
					})();
				}
				tagToken = this.token(tag, id, {
					length: idLength,
					data: tokenData
				});
				if (alias) {
					tagToken.origin = [tag, alias, tagToken[2]];
				}
				if (poppedToken) {
					[tagToken[2].first_line, tagToken[2].first_column, tagToken[2].range[0]] = [poppedToken[2].first_line, poppedToken[2].first_column, poppedToken[2].range[0]];
				}
				if (colon) {
					colonOffset = input.lastIndexOf(inJSXTag ? '=' : ':');
					colonToken = this.token(':', ':', {
						offset: colonOffset
					});
					if (inJSXTag) { // used by rewriter
						colonToken.jsxColon = true;
					}
				}
				if (inJSXTag && tag === 'IDENTIFIER' && prev[0] !== ':') {
					this.token(',', ',', {
						length: 0,
						origin: tagToken,
						generated: true
					});
				}
				return input.length;
			}

			// Matches numbers, including decimals, hex, and exponential notation.
			// Be careful not to interfere with ranges in progress.
			numberToken() {
				var lexedLength, match, number, parsedValue, tag, tokenData;
				if (!(match = NUMBER.exec(this.chunk))) {
					return 0;
				}
				number = match[0];
				lexedLength = number.length;
				switch (false) {
					case !/^0[BOX]/.test(number):
						this.error(`radix prefix in '${number}' must be lowercase`, {
							offset: 1
						});
						break;
					case !/^(?!0x).*E/.test(number):
						this.error(`exponential notation in '${number}' must be indicated with a lowercase 'e'`, {
							offset: number.indexOf('E')
						});
						break;
					case !/^0\d*[89]/.test(number):
						this.error(`decimal literal '${number}' must not be prefixed with '0'`, {
							length: lexedLength
						});
						break;
					case !/^0\d+/.test(number):
						this.error(`octal literal '${number}' must be prefixed with '0o'`, {
							length: lexedLength
						});
				}
				parsedValue = parseNumber(number);
				tokenData = {parsedValue};
				tag = parsedValue === 2e308 ? 'INFINITY' : 'NUMBER';
				if (tag === 'INFINITY') {
					tokenData.original = number;
				}
				this.token(tag, number, {
					length: lexedLength,
					data: tokenData
				});
				return lexedLength;
			}

			// Matches strings, including multiline strings, as well as heredocs, with or without
			// interpolation.
			stringToken() {
				var attempt, delimiter, doc, end, heredoc, i, indent, match, prev, quote, ref, regex, token, tokens;
				[quote] = STRING_START.exec(this.chunk) || [];
				if (!quote) {
					return 0;
				}
				// If the preceding token is `from` and this is an import or export statement,
				// properly tag the `from`.
				prev = this.prev();
				if (prev && this.value() === 'from' && (this.seenImport || this.seenExport)) {
					prev[0] = 'FROM';
				}
				regex = (function() {
					switch (quote) {
						case "'":
							return STRING_SINGLE;
						case '"':
							return STRING_DOUBLE;
						case "'''":
							return HEREDOC_SINGLE;
						case '"""':
							return HEREDOC_DOUBLE;
					}
				})();
				({
					tokens,
					index: end
				} = this.matchWithInterpolations(regex, quote));
				heredoc = quote.length === 3;
				if (heredoc) {
					// Find the smallest indentation. It will be removed from all lines later.
					indent = null;
					doc = ((function() {
						var j, len, results;
						results = [];
						for (i = j = 0, len = tokens.length; j < len; i = ++j) {
							token = tokens[i];
							if (token[0] === 'NEOSTRING') {
								results.push(token[1]);
							}
						}
						return results;
					})()).join('#{}');
					while (match = HEREDOC_INDENT.exec(doc)) {
						attempt = match[1];
						if (indent === null || (0 < (ref = attempt.length) && ref < indent.length)) {
							indent = attempt;
						}
					}
				}
				delimiter = quote.charAt(0);
				this.mergeInterpolationTokens(tokens, {
					quote,
					indent,
					endOffset: end
				}, (value) => {
					return this.validateUnicodeCodePointEscapes(value, {
						delimiter: quote
					});
				});
				if (this.atJSXTag()) {
					this.token(',', ',', {
						length: 0,
						origin: this.prev,
						generated: true
					});
				}
				return end;
			}

			// Matches and consumes comments. The comments are taken out of the token
			// stream and saved for later, to be reinserted into the output after
			// everything has been parsed and the JavaScript code generated.
			commentToken(chunk = this.chunk, {heregex, returnCommentTokens = false, offsetInChunk = 0} = {}) {
				var commentAttachment, commentAttachments, commentWithSurroundingWhitespace, content, contents, getIndentSize, hasSeenFirstCommentLine, hereComment, hereLeadingWhitespace, hereTrailingWhitespace, i, indentSize, leadingNewline, leadingNewlineOffset, leadingNewlines, leadingWhitespace, length, lineComment, match, matchIllegal, noIndent, nonInitial, placeholderToken, precededByBlankLine, precedingNonCommentLines, prev;
				if (!(match = chunk.match(COMMENT))) {
					return 0;
				}
				[commentWithSurroundingWhitespace, hereLeadingWhitespace, hereComment, hereTrailingWhitespace, lineComment] = match;
				contents = null;
				// Does this comment follow code on the same line?
				leadingNewline = /^\s*\n+\s*#/.test(commentWithSurroundingWhitespace);
				if (hereComment) {
					matchIllegal = HERECOMMENT_ILLEGAL.exec(hereComment);
					if (matchIllegal) {
						this.error(`block comments cannot contain ${matchIllegal[0]}`, {
							offset: '###'.length + matchIllegal.index,
							length: matchIllegal[0].length
						});
					}
					// Parse indentation or outdentation as if this block comment didn’t exist.
					chunk = chunk.replace(`###${hereComment}###`, '');
					// Remove leading newlines, like `Rewriter::removeLeadingNewlines`, to
					// avoid the creation of unwanted `TERMINATOR` tokens.
					chunk = chunk.replace(/^\n+/, '');
					this.lineToken({chunk});
					// Pull out the ###-style comment’s content, and format it.
					content = hereComment;
					contents = [
						{
							content,
							length: commentWithSurroundingWhitespace.length - hereLeadingWhitespace.length - hereTrailingWhitespace.length,
							leadingWhitespace: hereLeadingWhitespace
						}
					];
				} else {
					// The `COMMENT` regex captures successive line comments as one token.
					// Remove any leading newlines before the first comment, but preserve
					// blank lines between line comments.
					leadingNewlines = '';
					content = lineComment.replace(/^(\n*)/, function(leading) {
						leadingNewlines = leading;
						return '';
					});
					precedingNonCommentLines = '';
					hasSeenFirstCommentLine = false;
					contents = content.split('\n').map(function(line, index) {
						var comment, leadingWhitespace;
						if (!(line.indexOf('#') > -1)) {
							precedingNonCommentLines += `\n${line}`;
							return;
						}
						leadingWhitespace = '';
						content = line.replace(/^([ |\t]*)#/, function(_, whitespace) {
							leadingWhitespace = whitespace;
							return '';
						});
						comment = {
							content,
							length: '#'.length + content.length,
							leadingWhitespace: `${!hasSeenFirstCommentLine ? leadingNewlines : ''}${precedingNonCommentLines}${leadingWhitespace}`,
							precededByBlankLine: !!precedingNonCommentLines
						};
						hasSeenFirstCommentLine = true;
						precedingNonCommentLines = '';
						return comment;
					}).filter(function(comment) {
						return comment;
					});
				}
				getIndentSize = function({leadingWhitespace, nonInitial}) {
					var lastNewlineIndex;
					lastNewlineIndex = leadingWhitespace.lastIndexOf('\n');
					if ((hereComment != null) || !nonInitial) {
						if (!(lastNewlineIndex > -1)) {
							return null;
						}
					} else {
						if (lastNewlineIndex == null) {
							lastNewlineIndex = -1;
						}
					}
					return leadingWhitespace.length - 1 - lastNewlineIndex;
				};
				commentAttachments = (function() {
					var j, len, results;
					results = [];
					for (i = j = 0, len = contents.length; j < len; i = ++j) {
						({content, length, leadingWhitespace, precededByBlankLine} = contents[i]);
						nonInitial = i !== 0;
						leadingNewlineOffset = nonInitial ? 1 : 0;
						offsetInChunk += leadingNewlineOffset + leadingWhitespace.length;
						indentSize = getIndentSize({leadingWhitespace, nonInitial});
						noIndent = (indentSize == null) || indentSize === -1;
						commentAttachment = {
							content,
							here: hereComment != null,
							newLine: leadingNewline || nonInitial, // Line comments after the first one start new lines, by definition.
							locationData: this.makeLocationData({offsetInChunk, length}),
							precededByBlankLine,
							indentSize,
							indented: !noIndent && indentSize > this.indent,
							outdented: !noIndent && indentSize < this.indent
						};
						if (heregex) {
							commentAttachment.heregex = true;
						}
						offsetInChunk += length;
						results.push(commentAttachment);
					}
					return results;
				}).call(this);
				prev = this.prev();
				if (!prev) {
					// If there’s no previous token, create a placeholder token to attach
					// this comment to; and follow with a newline.
					commentAttachments[0].newLine = true;
					this.lineToken({
						chunk: this.chunk.slice(commentWithSurroundingWhitespace.length),
						offset: commentWithSurroundingWhitespace.length // Set the indent.
					});
					placeholderToken = this.makeToken('JS', '', {
						offset: commentWithSurroundingWhitespace.length,
						generated: true
					});
					placeholderToken.comments = commentAttachments;
					this.tokens.push(placeholderToken);
					this.newlineToken(commentWithSurroundingWhitespace.length);
				} else {
					attachCommentsToNode(commentAttachments, prev);
				}
				if (returnCommentTokens) {
					return commentAttachments;
				}
				return commentWithSurroundingWhitespace.length;
			}

			// Matches JavaScript interpolated directly into the source via backticks.
			jsToken() {
				var length, match, matchedHere, script;
				if (!(this.chunk.charAt(0) === '`' && (match = (matchedHere = HERE_JSTOKEN.exec(this.chunk)) || JSTOKEN.exec(this.chunk)))) {
					return 0;
				}
				// Convert escaped backticks to backticks, and escaped backslashes
				// just before escaped backticks to backslashes
				script = match[1];
				({length} = match[0]);
				this.token('JS', script, {
					length,
					data: {
						here: !!matchedHere
					}
				});
				return length;
			}

			// Matches regular expression literals, as well as multiline extended ones.
			// Lexing regular expressions is difficult to distinguish from division, so we
			// borrow some basic heuristics from JavaScript and Ruby.
			regexToken() {
				var body, closed, comment, commentIndex, commentOpts, commentTokens, comments, delimiter, end, flags, fullMatch, index, leadingWhitespace, match, matchedComment, origin, prev, ref, ref1, regex, tokens;
				switch (false) {
					case !(match = REGEX_ILLEGAL.exec(this.chunk)):
						this.error(`regular expressions cannot begin with ${match[2]}`, {
							offset: match.index + match[1].length
						});
						break;
					case !(match = this.matchWithInterpolations(HEREGEX, '///')):
						({tokens, index} = match);
						comments = [];
						while (matchedComment = HEREGEX_COMMENT.exec(this.chunk.slice(0, index))) {
							({
								index: commentIndex
							} = matchedComment);
							[fullMatch, leadingWhitespace, comment] = matchedComment;
							comments.push({
								comment,
								offsetInChunk: commentIndex + leadingWhitespace.length
							});
						}
						commentTokens = flatten((function() {
							var j, len, results;
							results = [];
							for (j = 0, len = comments.length; j < len; j++) {
								commentOpts = comments[j];
								results.push(this.commentToken(commentOpts.comment, Object.assign(commentOpts, {
									heregex: true,
									returnCommentTokens: true
								})));
							}
							return results;
						}).call(this));
						break;
					case !(match = REGEX.exec(this.chunk)):
						[regex, body, closed] = match;
						this.validateEscapes(body, {
							isRegex: true,
							offsetInChunk: 1
						});
						index = regex.length;
						prev = this.prev();
						if (prev) {
							if (prev.spaced && (ref = prev[0], indexOf.call(CALLABLE, ref) >= 0)) {
								if (!closed || POSSIBLY_DIVISION.test(regex)) {
									return 0;
								}
							} else if (ref1 = prev[0], indexOf.call(NOT_REGEX, ref1) >= 0) {
								return 0;
							}
						}
						if (!closed) {
							this.error('missing / (unclosed regex)');
						}
						break;
					default:
						return 0;
				}
				[flags] = REGEX_FLAGS.exec(this.chunk.slice(index));
				end = index + flags.length;
				origin = this.makeToken('REGEX', null, {
					length: end
				});
				switch (false) {
					case !!VALID_FLAGS.test(flags):
						this.error(`invalid regular expression flags ${flags}`, {
							offset: index,
							length: flags.length
						});
						break;
					case !(regex || tokens.length === 1):
						delimiter = body ? '/' : '///';
						if (body == null) {
							body = tokens[0][1];
						}
						this.validateUnicodeCodePointEscapes(body, {delimiter});
						this.token('REGEX', `/${body}/${flags}`, {
							length: end,
							origin,
							data: {delimiter}
						});
						break;
					default:
						this.token('REGEX_START', '(', {
							length: 0,
							origin,
							generated: true
						});
						this.token('IDENTIFIER', 'RegExp', {
							length: 0,
							generated: true
						});
						this.token('CALL_START', '(', {
							length: 0,
							generated: true
						});
						this.mergeInterpolationTokens(tokens, {
							double: true,
							heregex: {flags},
							endOffset: end - flags.length,
							quote: '///'
						}, (str) => {
							return this.validateUnicodeCodePointEscapes(str, {delimiter});
						});
						if (flags) {
							this.token(',', ',', {
								offset: index - 1,
								length: 0,
								generated: true
							});
							this.token('STRING', '"' + flags + '"', {
								offset: index,
								length: flags.length
							});
						}
						this.token(')', ')', {
							offset: end,
							length: 0,
							generated: true
						});
						this.token('REGEX_END', ')', {
							offset: end,
							length: 0,
							generated: true
						});
				}
				// Explicitly attach any heregex comments to the REGEX/REGEX_END token.
				if (commentTokens != null ? commentTokens.length : void 0) {
					addTokenData(this.tokens[this.tokens.length - 1], {
						heregexCommentTokens: commentTokens
					});
				}
				return end;
			}

			// Matches newlines, indents, and outdents, and determines which is which.
			// If we can detect that the current line is continued onto the next line,
			// then the newline is suppressed:

			//     elements
			//       .each( ... )
			//       .map( ... )

			// Keeps track of the level of indentation, because a single outdent token
			// can close multiple indents, so we need to know how far in we happen to be.
			lineToken({chunk = this.chunk, offset = 0} = {}) {
				var backslash, diff, endsContinuationLineIndentation, indent, match, minLiteralLength, newIndentLiteral, noNewlines, prev, ref, size;
				if (!(match = MULTI_DENT.exec(chunk))) {
					return 0;
				}
				indent = match[0];
				prev = this.prev();
				backslash = (prev != null ? prev[0] : void 0) === '\\';
				if (!((backslash || ((ref = this.seenFor) != null ? ref.endsLength : void 0) < this.ends.length) && this.seenFor)) {
					this.seenFor = false;
				}
				if (!((backslash && this.seenImport) || this.importSpecifierList)) {
					this.seenImport = false;
				}
				if (!((backslash && this.seenExport) || this.exportSpecifierList)) {
					this.seenExport = false;
				}
				size = indent.length - 1 - indent.lastIndexOf('\n');
				noNewlines = this.unfinished();
				newIndentLiteral = size > 0 ? indent.slice(-size) : '';
				if (!/^(.?)\1*$/.exec(newIndentLiteral)) {
					this.error('mixed indentation', {
						offset: indent.length
					});
					return indent.length;
				}
				minLiteralLength = Math.min(newIndentLiteral.length, this.indentLiteral.length);
				if (newIndentLiteral.slice(0, minLiteralLength) !== this.indentLiteral.slice(0, minLiteralLength)) {
					this.error('indentation mismatch', {
						offset: indent.length
					});
					return indent.length;
				}
				if (size - this.continuationLineAdditionalIndent === this.indent) {
					if (noNewlines) {
						this.suppressNewlines();
					} else {
						this.newlineToken(offset);
					}
					return indent.length;
				}
				if (size > this.indent) {
					if (noNewlines) {
						if (!backslash) {
							this.continuationLineAdditionalIndent = size - this.indent;
						}
						if (this.continuationLineAdditionalIndent) {
							prev.continuationLineIndent = this.indent + this.continuationLineAdditionalIndent;
						}
						this.suppressNewlines();
						return indent.length;
					}
					if (!this.tokens.length) {
						this.baseIndent = this.indent = size;
						this.indentLiteral = newIndentLiteral;
						return indent.length;
					}
					diff = size - this.indent + this.outdebt;
					this.token('INDENT', diff, {
						offset: offset + indent.length - size,
						length: size
					});
					this.indents.push(diff);
					this.ends.push({
						tag: 'OUTDENT'
					});
					this.outdebt = this.continuationLineAdditionalIndent = 0;
					this.indent = size;
					this.indentLiteral = newIndentLiteral;
				} else if (size < this.baseIndent) {
					this.error('missing indentation', {
						offset: offset + indent.length
					});
				} else {
					endsContinuationLineIndentation = this.continuationLineAdditionalIndent > 0;
					this.continuationLineAdditionalIndent = 0;
					this.outdentToken({
						moveOut: this.indent - size,
						noNewlines,
						outdentLength: indent.length,
						offset,
						indentSize: size,
						endsContinuationLineIndentation
					});
				}
				return indent.length;
			}

			// Record an outdent token or multiple tokens, if we happen to be moving back
			// inwards past several recorded indents. Sets new @indent value.
			outdentToken({moveOut, noNewlines, outdentLength = 0, offset = 0, indentSize, endsContinuationLineIndentation}) {
				var decreasedIndent, dent, lastIndent, ref, terminatorToken;
				decreasedIndent = this.indent - moveOut;
				while (moveOut > 0) {
					lastIndent = this.indents[this.indents.length - 1];
					if (!lastIndent) {
						this.outdebt = moveOut = 0;
					} else if (this.outdebt && moveOut <= this.outdebt) {
						this.outdebt -= moveOut;
						moveOut = 0;
					} else {
						dent = this.indents.pop() + this.outdebt;
						if (outdentLength && (ref = this.chunk[outdentLength], indexOf.call(INDENTABLE_CLOSERS, ref) >= 0)) {
							decreasedIndent -= dent - moveOut;
							moveOut = dent;
						}
						this.outdebt = 0;
						// pair might call outdentToken, so preserve decreasedIndent
						this.pair('OUTDENT');
						this.token('OUTDENT', moveOut, {
							length: outdentLength,
							indentSize: indentSize + moveOut - dent
						});
						moveOut -= dent;
					}
				}
				if (dent) {
					this.outdebt -= moveOut;
				}
				this.suppressSemicolons();
				if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
					terminatorToken = this.token('TERMINATOR', '\n', {
						offset: offset + outdentLength,
						length: 0
					});
					if (endsContinuationLineIndentation) {
						terminatorToken.endsContinuationLineIndentation = {
							preContinuationLineIndent: this.indent
						};
					}
				}
				this.indent = decreasedIndent;
				this.indentLiteral = this.indentLiteral.slice(0, decreasedIndent);
				return this;
			}

			// Matches and consumes non-meaningful whitespace. Tag the previous token
			// as being “spaced”, because there are some cases where it makes a difference.
			whitespaceToken() {
				var match, nline, prev;
				if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === '\n'))) {
					return 0;
				}
				prev = this.prev();
				if (prev) {
					prev[match ? 'spaced' : 'newLine'] = true;
				}
				if (match) {
					return match[0].length;
				} else {
					return 0;
				}
			}

			// Generate a newline token. Consecutive newlines get merged together.
			newlineToken(offset) {
				this.suppressSemicolons();
				if (this.tag() !== 'TERMINATOR') {
					this.token('TERMINATOR', '\n', {
						offset,
						length: 0
					});
				}
				return this;
			}

			// Use a `\` at a line-ending to suppress the newline.
			// The slash is removed here once its job is done.
			suppressNewlines() {
				var prev;
				prev = this.prev();
				if (prev[1] === '\\') {
					if (prev.comments && this.tokens.length > 1) {
						// `@tokens.length` should be at least 2 (some code, then `\`).
						// If something puts a `\` after nothing, they deserve to lose any
						// comments that trail it.
						attachCommentsToNode(prev.comments, this.tokens[this.tokens.length - 2]);
					}
					this.tokens.pop();
				}
				return this;
			}

			jsxToken() {
				var afterTag, end, endToken, firstChar, fullId, fullTagName, id, input, j, jsxTag, len, match, offset, openingTagToken, prev, prevChar, properties, property, ref, tagToken, token, tokens;
				firstChar = this.chunk[0];
				// Check the previous token to detect if attribute is spread.
				prevChar = this.tokens.length > 0 ? this.tokens[this.tokens.length - 1][0] : '';
				if (firstChar === '<') {
					match = JSX_IDENTIFIER.exec(this.chunk.slice(1)) || JSX_FRAGMENT_IDENTIFIER.exec(this.chunk.slice(1));
					// Not the right hand side of an unspaced comparison (i.e. `a<b`).
					if (!(match && (this.jsxDepth > 0 || !(prev = this.prev()) || prev.spaced || (ref = prev[0], indexOf.call(COMPARABLE_LEFT_SIDE, ref) < 0)))) {
						return 0;
					}
					[input, id] = match;
					fullId = id;
					if (indexOf.call(id, '.') >= 0) {
						[id, ...properties] = id.split('.');
					} else {
						properties = [];
					}
					tagToken = this.token('JSX_TAG', id, {
						length: id.length + 1,
						data: {
							openingBracketToken: this.makeToken('<', '<'),
							tagNameToken: this.makeToken('IDENTIFIER', id, {
								offset: 1
							})
						}
					});
					offset = id.length + 1;
					for (j = 0, len = properties.length; j < len; j++) {
						property = properties[j];
						this.token('.', '.', {offset});
						offset += 1;
						this.token('PROPERTY', property, {offset});
						offset += property.length;
					}
					this.token('CALL_START', '(', {
						generated: true
					});
					this.token('[', '[', {
						generated: true
					});
					this.ends.push({
						tag: '/>',
						origin: tagToken,
						name: id,
						properties
					});
					this.jsxDepth++;
					return fullId.length + 1;
				} else if (jsxTag = this.atJSXTag()) {
					if (this.chunk.slice(0, 2) === '/>') { // Self-closing tag.
						this.pair('/>');
						this.token(']', ']', {
							length: 2,
							generated: true
						});
						this.token('CALL_END', ')', {
							length: 2,
							generated: true,
							data: {
								selfClosingSlashToken: this.makeToken('/', '/'),
								closingBracketToken: this.makeToken('>', '>', {
									offset: 1
								})
							}
						});
						this.jsxDepth--;
						return 2;
					} else if (firstChar === '{') {
						if (prevChar === ':') {
							// This token represents the start of a JSX attribute value
							// that’s an expression (e.g. the `{b}` in `<div a={b} />`).
							// Our grammar represents the beginnings of expressions as `(`
							// tokens, so make this into a `(` token that displays as `{`.
							token = this.token('(', '{');
							this.jsxObjAttribute[this.jsxDepth] = false;
							// tag attribute name as JSX
							addTokenData(this.tokens[this.tokens.length - 3], {
								jsx: true
							});
						} else {
							token = this.token('{', '{');
							this.jsxObjAttribute[this.jsxDepth] = true;
						}
						this.ends.push({
							tag: '}',
							origin: token
						});
						return 1;
					} else if (firstChar === '>') { // end of opening tag
						({
							// Ignore terminators inside a tag.
							origin: openingTagToken
						} = this.pair('/>')); // As if the current tag was self-closing.
						this.token(']', ']', {
							generated: true,
							data: {
								closingBracketToken: this.makeToken('>', '>')
							}
						});
						this.token(',', 'JSX_COMMA', {
							generated: true
						});
						({
							tokens,
							index: end
						} = this.matchWithInterpolations(INSIDE_JSX, '>', '</', JSX_INTERPOLATION));
						this.mergeInterpolationTokens(tokens, {
							endOffset: end,
							jsx: true
						}, (value) => {
							return this.validateUnicodeCodePointEscapes(value, {
								delimiter: '>'
							});
						});
						match = JSX_IDENTIFIER.exec(this.chunk.slice(end)) || JSX_FRAGMENT_IDENTIFIER.exec(this.chunk.slice(end));
						if (!match || match[1] !== `${jsxTag.name}${((function() {
							var k, len1, ref1, results;
							ref1 = jsxTag.properties;
							results = [];
							for (k = 0, len1 = ref1.length; k < len1; k++) {
								property = ref1[k];
								results.push(`.${property}`);
							}
							return results;
						})()).join('')}`) {
							this.error(`expected corresponding JSX closing tag for ${jsxTag.name}`, jsxTag.origin.data.tagNameToken[2]);
						}
						[, fullTagName] = match;
						afterTag = end + fullTagName.length;
						if (this.chunk[afterTag] !== '>') {
							this.error("missing closing > after tag name", {
								offset: afterTag,
								length: 1
							});
						}
						// -2/+2 for the opening `</` and +1 for the closing `>`.
						endToken = this.token('CALL_END', ')', {
							offset: end - 2,
							length: fullTagName.length + 3,
							generated: true,
							data: {
								closingTagOpeningBracketToken: this.makeToken('<', '<', {
									offset: end - 2
								}),
								closingTagSlashToken: this.makeToken('/', '/', {
									offset: end - 1
								}),
								// TODO: individual tokens for complex tag name? eg < / A . B >
								closingTagNameToken: this.makeToken('IDENTIFIER', fullTagName, {
									offset: end
								}),
								closingTagClosingBracketToken: this.makeToken('>', '>', {
									offset: end + fullTagName.length
								})
							}
						});
						// make the closing tag location data more easily accessible to the grammar
						addTokenData(openingTagToken, endToken.data);
						this.jsxDepth--;
						return afterTag + 1;
					} else {
						return 0;
					}
				} else if (this.atJSXTag(1)) {
					if (firstChar === '}') {
						this.pair(firstChar);
						if (this.jsxObjAttribute[this.jsxDepth]) {
							this.token('}', '}');
							this.jsxObjAttribute[this.jsxDepth] = false;
						} else {
							this.token(')', '}');
						}
						this.token(',', ',', {
							generated: true
						});
						return 1;
					} else {
						return 0;
					}
				} else {
					return 0;
				}
			}

			atJSXTag(depth = 0) {
				var i, last, ref;
				if (this.jsxDepth === 0) {
					return false;
				}
				i = this.ends.length - 1;
				while (((ref = this.ends[i]) != null ? ref.tag : void 0) === 'OUTDENT' || depth-- > 0) { // Ignore indents.
					i--;
				}
				last = this.ends[i];
				return (last != null ? last.tag : void 0) === '/>' && last;
			}

			// We treat all other single characters as a token. E.g.: `( ) , . !`
			// Multi-character operators are also literal tokens, so that Jison can assign
			// the proper order of operations. There are some symbols that we tag specially
			// here. `;` and newlines are both treated as a `TERMINATOR`, we distinguish
			// parentheses that indicate a method call from regular parentheses, and so on.
			literalToken() {
				var match, message, origin, prev, ref, ref1, ref2, ref3, ref4, ref5, skipToken, tag, token, value;
				if (match = OPERATOR.exec(this.chunk)) {
					[value] = match;
					if (CODE.test(value)) {
						this.tagParameters();
					}
				} else {
					value = this.chunk.charAt(0);
				}
				tag = value;
				prev = this.prev();
				if (prev && indexOf.call(['=', ...COMPOUND_ASSIGN], value) >= 0) {
					skipToken = false;
					if (value === '=' && ((ref = prev[1]) === '||' || ref === '&&') && !prev.spaced) {
						prev[0] = 'COMPOUND_ASSIGN';
						prev[1] += '=';
						if ((ref1 = prev.data) != null ? ref1.original : void 0) {
							prev.data.original += '=';
						}
						prev[2].range = [prev[2].range[0], prev[2].range[1] + 1];
						prev[2].last_column += 1;
						prev[2].last_column_exclusive += 1;
						prev = this.tokens[this.tokens.length - 2];
						skipToken = true;
					}
					if (prev && prev[0] !== 'PROPERTY') {
						origin = (ref2 = prev.origin) != null ? ref2 : prev;
						message = isUnassignable(prev[1], origin[1]);
						if (message) {
							this.error(message, origin[2]);
						}
					}
					if (skipToken) {
						return value.length;
					}
				}
				if (value === '(' && (prev != null ? prev[0] : void 0) === 'IMPORT') {
					prev[0] = 'DYNAMIC_IMPORT';
				}
				if (value === '{' && this.seenImport) {
					this.importSpecifierList = true;
				} else if (this.importSpecifierList && value === '}') {
					this.importSpecifierList = false;
				} else if (value === '{' && (prev != null ? prev[0] : void 0) === 'EXPORT') {
					this.exportSpecifierList = true;
				} else if (this.exportSpecifierList && value === '}') {
					this.exportSpecifierList = false;
				}
				if (value === ';') {
					if (ref3 = prev != null ? prev[0] : void 0, indexOf.call(['=', ...UNFINISHED], ref3) >= 0) {
						this.error('unexpected ;');
					}
					this.seenFor = this.seenImport = this.seenExport = false;
					tag = 'TERMINATOR';
				} else if (value === '*' && (prev != null ? prev[0] : void 0) === 'EXPORT') {
					tag = 'EXPORT_ALL';
				} else if (indexOf.call(MATH, value) >= 0) {
					tag = 'MATH';
				} else if (indexOf.call(COMPARE, value) >= 0) {
					tag = 'COMPARE';
				} else if (indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
					tag = 'COMPOUND_ASSIGN';
				} else if (indexOf.call(UNARY, value) >= 0) {
					tag = 'UNARY';
				} else if (indexOf.call(UNARY_MATH, value) >= 0) {
					tag = 'UNARY_MATH';
				} else if (indexOf.call(SHIFT, value) >= 0) {
					tag = 'SHIFT';
				} else if (value === '?' && (prev != null ? prev.spaced : void 0)) {
					tag = 'BIN?';
				} else if (prev) {
					if (value === '(' && !prev.spaced && (ref4 = prev[0], indexOf.call(CALLABLE, ref4) >= 0)) {
						if (prev[0] === '?') {
							prev[0] = 'FUNC_EXIST';
						}
						tag = 'CALL_START';
					} else if (value === '[' && (((ref5 = prev[0], indexOf.call(INDEXABLE, ref5) >= 0) && !prev.spaced) || (prev[0] === '::'))) { // `.prototype` can’t be a method you can call.
						tag = 'INDEX_START';
						switch (prev[0]) {
							case '?':
								prev[0] = 'INDEX_SOAK';
						}
					}
				}
				token = this.makeToken(tag, value);
				switch (value) {
					case '(':
					case '{':
					case '[':
						this.ends.push({
							tag: INVERSES[value],
							origin: token
						});
						break;
					case ')':
					case '}':
					case ']':
						this.pair(value);
				}
				this.tokens.push(this.makeToken(tag, value));
				return value.length;
			}

			// Token Manipulators
			// ------------------

			// A source of ambiguity in our grammar used to be parameter lists in function
			// definitions versus argument lists in function calls. Walk backwards, tagging
			// parameters specially in order to make things easier for the parser.
			tagParameters() {
				var i, paramEndToken, stack, tok, tokens;
				if (this.tag() !== ')') {
					return this.tagDoIife();
				}
				stack = [];
				({tokens} = this);
				i = tokens.length;
				paramEndToken = tokens[--i];
				paramEndToken[0] = 'PARAM_END';
				while (tok = tokens[--i]) {
					switch (tok[0]) {
						case ')':
							stack.push(tok);
							break;
						case '(':
						case 'CALL_START':
							if (stack.length) {
								stack.pop();
							} else if (tok[0] === '(') {
								tok[0] = 'PARAM_START';
								return this.tagDoIife(i - 1);
							} else {
								paramEndToken[0] = 'CALL_END';
								return this;
							}
					}
				}
				return this;
			}

			// Tag `do` followed by a function differently than `do` followed by eg an
			// identifier to allow for different grammar precedence
			tagDoIife(tokenIndex) {
				var tok;
				tok = this.tokens[tokenIndex != null ? tokenIndex : this.tokens.length - 1];
				if ((tok != null ? tok[0] : void 0) !== 'DO') {
					return this;
				}
				tok[0] = 'DO_IIFE';
				return this;
			}

			// Close up all remaining open blocks at the end of the file.
			closeIndentation() {
				return this.outdentToken({
					moveOut: this.indent,
					indentSize: 0
				});
			}

			// Match the contents of a delimited token and expand variables and expressions
			// inside it using Ruby-like notation for substitution of arbitrary
			// expressions.

			//     "Hello #{name.capitalize()}."

			// If it encounters an interpolation, this method will recursively create a new
			// Lexer and tokenize until the `{` of `#{` is balanced with a `}`.

			//  - `regex` matches the contents of a token (but not `delimiter`, and not
			//    `#{` if interpolations are desired).
			//  - `delimiter` is the delimiter of the token. Examples are `'`, `"`, `'''`,
			//    `"""` and `///`.
			//  - `closingDelimiter` is different from `delimiter` only in JSX
			//  - `interpolators` matches the start of an interpolation, for JSX it's both
			//    `{` and `<` (i.e. nested JSX tag)

			// This method allows us to have strings within interpolations within strings,
			// ad infinitum.
			matchWithInterpolations(regex, delimiter, closingDelimiter = delimiter, interpolators = /^#\{/) {
				var braceInterpolator, close, column, index, interpolationOffset, interpolator, line, match, nested, offset, offsetInChunk, open, ref, ref1, rest, str, strPart, tokens;
				tokens = [];
				offsetInChunk = delimiter.length;
				if (this.chunk.slice(0, offsetInChunk) !== delimiter) {
					return null;
				}
				str = this.chunk.slice(offsetInChunk);
				while (true) {
					[strPart] = regex.exec(str);
					this.validateEscapes(strPart, {
						isRegex: delimiter.charAt(0) === '/',
						offsetInChunk
					});
					// Push a fake `'NEOSTRING'` token, which will get turned into a real string later.
					tokens.push(this.makeToken('NEOSTRING', strPart, {
						offset: offsetInChunk
					}));
					str = str.slice(strPart.length);
					offsetInChunk += strPart.length;
					if (!(match = interpolators.exec(str))) {
						break;
					}
					[interpolator] = match;
					// To remove the `#` in `#{`.
					interpolationOffset = interpolator.length - 1;
					[line, column, offset] = this.getLineAndColumnFromChunk(offsetInChunk + interpolationOffset);
					rest = str.slice(interpolationOffset);
					({
						tokens: nested,
						index
					} = new Lexer().tokenize(rest, {
						line,
						column,
						offset,
						untilBalanced: true,
						locationDataCompensations: this.locationDataCompensations
					}));
					// Account for the `#` in `#{`.
					index += interpolationOffset;
					braceInterpolator = str[index - 1] === '}';
					if (braceInterpolator) {
						// Turn the leading and trailing `{` and `}` into parentheses. Unnecessary
						// parentheses will be removed later.
						[open] = nested, [close] = slice.call(nested, -1);
						open[0] = 'INTERPOLATION_START';
						open[1] = '(';
						open[2].first_column -= interpolationOffset;
						open[2].range = [open[2].range[0] - interpolationOffset, open[2].range[1]];
						close[0] = 'INTERPOLATION_END';
						close[1] = ')';
						close.origin = ['', 'end of interpolation', close[2]];
					}
					if (((ref = nested[1]) != null ? ref[0] : void 0) === 'TERMINATOR') {
						// Remove leading `'TERMINATOR'` (if any).
						nested.splice(1, 1);
					}
					if (((ref1 = nested[nested.length - 3]) != null ? ref1[0] : void 0) === 'INDENT' && nested[nested.length - 2][0] === 'OUTDENT') {
						// Remove trailing `'INDENT'/'OUTDENT'` pair (if any).
						nested.splice(-3, 2);
					}
					if (!braceInterpolator) {
						// We are not using `{` and `}`, so wrap the interpolated tokens instead.
						open = this.makeToken('INTERPOLATION_START', '(', {
							offset: offsetInChunk,
							length: 0,
							generated: true
						});
						close = this.makeToken('INTERPOLATION_END', ')', {
							offset: offsetInChunk + index,
							length: 0,
							generated: true
						});
						nested = [open, ...nested, close];
					}
					// Push a fake `'TOKENS'` token, which will get turned into real tokens later.
					tokens.push(['TOKENS', nested]);
					str = str.slice(index);
					offsetInChunk += index;
				}
				if (str.slice(0, closingDelimiter.length) !== closingDelimiter) {
					this.error(`missing ${closingDelimiter}`, {
						length: delimiter.length
					});
				}
				return {
					tokens,
					index: offsetInChunk + closingDelimiter.length
				};
			}

			// Merge the array `tokens` of the fake token types `'TOKENS'` and `'NEOSTRING'`
			// (as returned by `matchWithInterpolations`) into the token stream. The value
			// of `'NEOSTRING'`s are converted using `fn` and turned into strings using
			// `options` first.
			mergeInterpolationTokens(tokens, options, fn) {
				var $, converted, double, endOffset, firstIndex, heregex, i, indent, j, jsx, k, lastToken, len, len1, locationToken, lparen, placeholderToken, quote, ref, ref1, rparen, tag, token, tokensToPush, val, value;
				({quote, indent, double, heregex, endOffset, jsx} = options);
				if (tokens.length > 1) {
					lparen = this.token('STRING_START', '(', {
						length: (ref = quote != null ? quote.length : void 0) != null ? ref : 0,
						data: {quote},
						generated: !(quote != null ? quote.length : void 0)
					});
				}
				firstIndex = this.tokens.length;
				$ = tokens.length - 1;
				for (i = j = 0, len = tokens.length; j < len; i = ++j) {
					token = tokens[i];
					[tag, value] = token;
					switch (tag) {
						case 'TOKENS':
							// There are comments (and nothing else) in this interpolation.
							if (value.length === 2 && (value[0].comments || value[1].comments)) {
								placeholderToken = this.makeToken('JS', '', {
									generated: true
								});
								// Use the same location data as the first parenthesis.
								placeholderToken[2] = value[0][2];
								for (k = 0, len1 = value.length; k < len1; k++) {
									val = value[k];
									if (!val.comments) {
										continue;
									}
									if (placeholderToken.comments == null) {
										placeholderToken.comments = [];
									}
									placeholderToken.comments.push(...val.comments);
								}
								value.splice(1, 0, placeholderToken);
							}
							// Push all the tokens in the fake `'TOKENS'` token. These already have
							// sane location data.
							locationToken = value[0];
							tokensToPush = value;
							break;
						case 'NEOSTRING':
							// Convert `'NEOSTRING'` into `'STRING'`.
							converted = fn.call(this, token[1], i);
							if (i === 0) {
								addTokenData(token, {
									initialChunk: true
								});
							}
							if (i === $) {
								addTokenData(token, {
									finalChunk: true
								});
							}
							addTokenData(token, {indent, quote, double});
							if (heregex) {
								addTokenData(token, {heregex});
							}
							if (jsx) {
								addTokenData(token, {jsx});
							}
							token[0] = 'STRING';
							token[1] = '"' + converted + '"';
							if (tokens.length === 1 && (quote != null)) {
								token[2].first_column -= quote.length;
								if (token[1].substr(-2, 1) === '\n') {
									token[2].last_line += 1;
									token[2].last_column = quote.length - 1;
								} else {
									token[2].last_column += quote.length;
									if (token[1].length === 2) {
										token[2].last_column -= 1;
									}
								}
								token[2].last_column_exclusive += quote.length;
								token[2].range = [token[2].range[0] - quote.length, token[2].range[1] + quote.length];
							}
							locationToken = token;
							tokensToPush = [token];
					}
					this.tokens.push(...tokensToPush);
				}
				if (lparen) {
					[lastToken] = slice.call(tokens, -1);
					lparen.origin = [
						'STRING',
						null,
						{
							first_line: lparen[2].first_line,
							first_column: lparen[2].first_column,
							last_line: lastToken[2].last_line,
							last_column: lastToken[2].last_column,
							last_line_exclusive: lastToken[2].last_line_exclusive,
							last_column_exclusive: lastToken[2].last_column_exclusive,
							range: [lparen[2].range[0],
						lastToken[2].range[1]]
						}
					];
					if (!(quote != null ? quote.length : void 0)) {
						lparen[2] = lparen.origin[2];
					}
					return rparen = this.token('STRING_END', ')', {
						offset: endOffset - (quote != null ? quote : '').length,
						length: (ref1 = quote != null ? quote.length : void 0) != null ? ref1 : 0,
						generated: !(quote != null ? quote.length : void 0)
					});
				}
			}

			// Pairs up a closing token, ensuring that all listed pairs of tokens are
			// correctly balanced throughout the course of the token stream.
			pair(tag) {
				var lastIndent, prev, ref, ref1, wanted;
				ref = this.ends, [prev] = slice.call(ref, -1);
				if (tag !== (wanted = prev != null ? prev.tag : void 0)) {
					if ('OUTDENT' !== wanted) {
						this.error(`unmatched ${tag}`);
					}
					// Auto-close `INDENT` to support syntax like this:

					//     el.click((event) ->
					//       el.hide())

					ref1 = this.indents, [lastIndent] = slice.call(ref1, -1);
					this.outdentToken({
						moveOut: lastIndent,
						noNewlines: true
					});
					return this.pair(tag);
				}
				return this.ends.pop();
			}

			// Helpers
			// -------

			// Compensate for the things we strip out initially (e.g. carriage returns)
			// so that location data stays accurate with respect to the original source file.
			getLocationDataCompensation(start, end) {
				var compensation, current, initialEnd, totalCompensation;
				totalCompensation = 0;
				initialEnd = end;
				current = start;
				while (current <= end) {
					if (current === end && start !== initialEnd) {
						break;
					}
					compensation = this.locationDataCompensations[current];
					if (compensation != null) {
						totalCompensation += compensation;
						end += compensation;
					}
					current++;
				}
				return totalCompensation;
			}

			// Returns the line and column number from an offset into the current chunk.

			// `offset` is a number of characters into `@chunk`.
			getLineAndColumnFromChunk(offset) {
				var column, columnCompensation, compensation, lastLine, lineCount, previousLinesCompensation, ref, string;
				compensation = this.getLocationDataCompensation(this.chunkOffset, this.chunkOffset + offset);
				if (offset === 0) {
					return [this.chunkLine, this.chunkColumn + compensation, this.chunkOffset + compensation];
				}
				if (offset >= this.chunk.length) {
					string = this.chunk;
				} else {
					string = this.chunk.slice(0, +(offset - 1) + 1 || 9e9);
				}
				lineCount = count(string, '\n');
				column = this.chunkColumn;
				if (lineCount > 0) {
					ref = string.split('\n'), [lastLine] = slice.call(ref, -1);
					column = lastLine.length;
					previousLinesCompensation = this.getLocationDataCompensation(this.chunkOffset, this.chunkOffset + offset - column);
					if (previousLinesCompensation < 0) {
						// Don't recompensate for initially inserted newline.
						previousLinesCompensation = 0;
					}
					columnCompensation = this.getLocationDataCompensation(this.chunkOffset + offset + previousLinesCompensation - column, this.chunkOffset + offset + previousLinesCompensation);
				} else {
					column += string.length;
					columnCompensation = compensation;
				}
				return [this.chunkLine + lineCount, column + columnCompensation, this.chunkOffset + offset + compensation];
			}

			makeLocationData({offsetInChunk, length}) {
				var endOffset, lastCharacter, locationData;
				locationData = {
					range: []
				};
				[locationData.first_line, locationData.first_column, locationData.range[0]] = this.getLineAndColumnFromChunk(offsetInChunk);
				// Use length - 1 for the final offset - we’re supplying the last_line and the last_column,
				// so if last_column == first_column, then we’re looking at a character of length 1.
				lastCharacter = length > 0 ? length - 1 : 0;
				[locationData.last_line, locationData.last_column, endOffset] = this.getLineAndColumnFromChunk(offsetInChunk + lastCharacter);
				[locationData.last_line_exclusive, locationData.last_column_exclusive] = this.getLineAndColumnFromChunk(offsetInChunk + lastCharacter + (length > 0 ? 1 : 0));
				locationData.range[1] = length > 0 ? endOffset + 1 : endOffset;
				return locationData;
			}

			// Same as `token`, except this just returns the token without adding it
			// to the results.
			makeToken(tag, value, {
					offset: offsetInChunk = 0,
					length = value.length,
					origin,
					generated,
					indentSize
				} = {}) {
				var token;
				token = [tag, value, this.makeLocationData({offsetInChunk, length})];
				if (origin) {
					token.origin = origin;
				}
				if (generated) {
					token.generated = true;
				}
				if (indentSize != null) {
					token.indentSize = indentSize;
				}
				return token;
			}

			// Add a token to the results.
			// `offset` is the offset into the current `@chunk` where the token starts.
			// `length` is the length of the token in the `@chunk`, after the offset.  If
			// not specified, the length of `value` will be used.

			// Returns the new token.
			token(tag, value, {offset, length, origin, data, generated, indentSize} = {}) {
				var token;
				token = this.makeToken(tag, value, {offset, length, origin, generated, indentSize});
				if (data) {
					addTokenData(token, data);
				}
				this.tokens.push(token);
				return token;
			}

			// Peek at the last tag in the token stream.
			tag() {
				var ref, token;
				ref = this.tokens, [token] = slice.call(ref, -1);
				return token != null ? token[0] : void 0;
			}

			// Peek at the last value in the token stream.
			value(useOrigin = false) {
				var ref, token;
				ref = this.tokens, [token] = slice.call(ref, -1);
				if (useOrigin && ((token != null ? token.origin : void 0) != null)) {
					return token.origin[1];
				} else {
					return token != null ? token[1] : void 0;
				}
			}

			// Get the previous token in the token stream.
			prev() {
				return this.tokens[this.tokens.length - 1];
			}

			// Are we in the midst of an unfinished expression?
			unfinished() {
				var ref;
				return LINE_CONTINUER.test(this.chunk) || (ref = this.tag(), indexOf.call(UNFINISHED, ref) >= 0);
			}

			validateUnicodeCodePointEscapes(str, options) {
				return replaceUnicodeCodePointEscapes(str, merge(options, {error: this.error}));
			}

			// Validates escapes in strings and regexes.
			validateEscapes(str, options = {}) {
				var before, hex, invalidEscape, invalidEscapeRegex, match, message, octal, ref, unicode, unicodeCodePoint;
				invalidEscapeRegex = options.isRegex ? REGEX_INVALID_ESCAPE : STRING_INVALID_ESCAPE;
				match = invalidEscapeRegex.exec(str);
				if (!match) {
					return;
				}
				match[0], before = match[1], octal = match[2], hex = match[3], unicodeCodePoint = match[4], unicode = match[5];
				message = octal ? "octal escape sequences are not allowed" : "invalid escape sequence";
				invalidEscape = `\\${octal || hex || unicodeCodePoint || unicode}`;
				return this.error(`${message} ${invalidEscape}`, {
					offset: ((ref = options.offsetInChunk) != null ? ref : 0) + match.index + before.length,
					length: invalidEscape.length
				});
			}

			suppressSemicolons() {
				var ref, ref1, results;
				results = [];
				while (this.value() === ';') {
					this.tokens.pop();
					if (ref = (ref1 = this.prev()) != null ? ref1[0] : void 0, indexOf.call(['=', ...UNFINISHED], ref) >= 0) {
						results.push(this.error('unexpected ;'));
					} else {
						results.push(void 0);
					}
				}
				return results;
			}

			error(message, options = {}) {
				var first_column, first_line, location, ref, ref1;
				location = 'first_line' in options ? options : ([first_line, first_column] = this.getLineAndColumnFromChunk((ref = options.offset) != null ? ref : 0), {
					first_line,
					first_column,
					last_column: first_column + ((ref1 = options.length) != null ? ref1 : 1) - 1
				});
				return throwSyntaxError(message, location);
			}

		};

		// Helper functions
		// ----------------
		isUnassignable = function(name, displayName = name) {
			switch (false) {
				case indexOf.call([...JS_KEYWORDS, ...COFFEE_KEYWORDS], name) < 0:
					return `keyword '${displayName}' can't be assigned`;
				case indexOf.call(STRICT_PROSCRIBED, name) < 0:
					return `'${displayName}' can't be assigned`;
				case indexOf.call(RESERVED, name) < 0:
					return `reserved word '${displayName}' can't be assigned`;
				default:
					return false;
			}
		};

		exports.isUnassignable = isUnassignable;

		// `from` isn’t a CoffeeScript keyword, but it behaves like one in `import` and
		// `export` statements (handled above) and in the declaration line of a `for`
		// loop. Try to detect when `from` is a variable identifier and when it is this
		// “sometimes” keyword.
		isForFrom = function(prev) {
			var ref;
			// `for i from iterable`
			if (prev[0] === 'IDENTIFIER') {
				return true;
			// `for from…`
			} else if (prev[0] === 'FOR') {
				return false;
			// `for {from}…`, `for [from]…`, `for {a, from}…`, `for {a: from}…`
			} else if ((ref = prev[1]) === '{' || ref === '[' || ref === ',' || ref === ':') {
				return false;
			} else {
				return true;
			}
		};

		addTokenData = function(token, data) {
			return Object.assign((token.data != null ? token.data : token.data = {}), data);
		};

		// Constants
		// ---------

		// Keywords that CoffeeScript shares in common with JavaScript.
		JS_KEYWORDS = ['true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'yield', 'await', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super', 'import', 'export', 'default'];

		// CoffeeScript-only keywords.
		COFFEE_KEYWORDS = ['undefined', 'Infinity', 'NaN', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];

		COFFEE_ALIAS_MAP = {
			and: '&&',
			or: '||',
			is: '==',
			isnt: '!=',
			not: '!',
			yes: 'true',
			no: 'false',
			on: 'true',
			off: 'false'
		};

		COFFEE_ALIASES = (function() {
			var results;
			results = [];
			for (key in COFFEE_ALIAS_MAP) {
				results.push(key);
			}
			return results;
		})();

		COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

		// The list of keywords that are reserved by JavaScript, but not used, or are
		// used by CoffeeScript internally. We throw an error when these are encountered,
		// to avoid having a JavaScript error at runtime.
		RESERVED = ['case', 'function', 'var', 'void', 'with', 'const', 'let', 'enum', 'native', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static'];

		STRICT_PROSCRIBED = ['arguments', 'eval'];

		// The superset of both JavaScript keywords and reserved words, none of which may
		// be used as identifiers or properties.
		exports.JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);

		// The character code of the nasty Microsoft madness otherwise known as the BOM.
		BOM = 65279;

		// Token matching regexes.
		IDENTIFIER = /^(?!\d)((?:(?!\s)[$\w\x7f-\uffff])+)([^\n\S]*:(?!:))?/; // Is this a property name?

		// Like `IDENTIFIER`, but includes `-`s
		JSX_IDENTIFIER_PART = /(?:(?!\s)[\-$\w\x7f-\uffff])+/.source;

		// In https://facebook.github.io/jsx/ spec, JSXElementName can be
		// JSXIdentifier, JSXNamespacedName (JSXIdentifier : JSXIdentifier), or
		// JSXMemberExpression (two or more JSXIdentifier connected by `.`s).
		JSX_IDENTIFIER = RegExp(`^(?![\\d<])(${JSX_IDENTIFIER_PART // Must not start with `<`.
		// JSXNamespacedName
		// JSXMemberExpression
	}(?:\\s*:\\s*${JSX_IDENTIFIER_PART}|(?:\\s*\\.\\s*${JSX_IDENTIFIER_PART})+)?)`);

		// Fragment: <></>
		JSX_FRAGMENT_IDENTIFIER = /^()>/; // Ends immediately with `>`.

		// In https://facebook.github.io/jsx/ spec, JSXAttributeName can be either
		// JSXIdentifier or JSXNamespacedName which is JSXIdentifier : JSXIdentifier
		JSX_ATTRIBUTE = RegExp(`^(?!\\d)(${JSX_IDENTIFIER_PART // JSXNamespacedName
		// Is this an attribute with a value?
	}(?:\\s*:\\s*${JSX_IDENTIFIER_PART})?)([^\\S]*=(?!=))?`);

		NUMBER = /^0b[01](?:_?[01])*n?|^0o[0-7](?:_?[0-7])*n?|^0x[\da-f](?:_?[\da-f])*n?|^\d+n|^(?:\d(?:_?\d)*)?\.?(?:\d(?:_?\d)*)+(?:e[+-]?(?:\d(?:_?\d)*)+)?/i; // binary
		// octal
		// hex
		// decimal bigint
		// decimal
		// decimal without support for numeric literal separators for reference:
		// \d*\.?\d+ (?:e[+-]?\d+)?

		OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>*\/%])\2=?|\?(\.|::)|\.{2,3})/; // function
		// compound assign / compare
		// zero-fill right shift
		// doubles
		// logic / shift / power / floor division / modulo
		// soak access
		// range or splat

		WHITESPACE = /^[^\n\S]+/;

		COMMENT = /^(\s*)###([^#][\s\S]*?)(?:###([^\n\S]*)|###$)|^((?:\s*#(?!##[^#]).*)+)/;

		CODE = /^[-=]>/;

		MULTI_DENT = /^(?:\n[^\n\S]*)+/;

		JSTOKEN = /^`(?!``)((?:[^`\\]|\\[\s\S])*)`/;

		HERE_JSTOKEN = /^```((?:[^`\\]|\\[\s\S]|`(?!``))*)```/;

		// String-matching-regexes.
		STRING_START = /^(?:'''|"""|'|")/;

		STRING_SINGLE = /^(?:[^\\']|\\[\s\S])*/;

		STRING_DOUBLE = /^(?:[^\\"#]|\\[\s\S]|\#(?!\{))*/;

		HEREDOC_SINGLE = /^(?:[^\\']|\\[\s\S]|'(?!''))*/;

		HEREDOC_DOUBLE = /^(?:[^\\"#]|\\[\s\S]|"(?!"")|\#(?!\{))*/;

		INSIDE_JSX = /^(?:[^\{<])*/; // Start of CoffeeScript interpolation. // Similar to `HEREDOC_DOUBLE` but there is no escaping.
		// Maybe JSX tag (`<` not allowed even if bare).

		JSX_INTERPOLATION = /^(?:\{|<(?!\/))/; // CoffeeScript interpolation.
		// JSX opening tag.

		HEREDOC_INDENT = /\n+([^\n\S]*)(?=\S)/g;

		// Regex-matching-regexes.
		REGEX = /^\/(?!\/)((?:[^[\/\n\\]|\\[^\n]|\[(?:\\[^\n]|[^\]\n\\])*\])*)(\/)?/; // Every other thing.
		// Anything but newlines escaped.
		// Character class.

		REGEX_FLAGS = /^\w*/;

		VALID_FLAGS = /^(?!.*(.).*\1)[gimsuy]*$/;

		HEREGEX = /^(?:[^\\\/#\s]|\\[\s\S]|\/(?!\/\/)|\#(?!\{)|\s+(?:#(?!\{).*)?)*/; // Match any character, except those that need special handling below.
		// Match `\` followed by any character.
		// Match any `/` except `///`.
		// Match `#` which is not part of interpolation, e.g. `#{}`.
		// Comments consume everything until the end of the line, including `///`.

		HEREGEX_COMMENT = /(\s+)(#(?!{).*)/gm;

		REGEX_ILLEGAL = /^(\/|\/{3}\s*)(\*)/;

		POSSIBLY_DIVISION = /^\/=?\s/;

		// Other regexes.
		HERECOMMENT_ILLEGAL = /\*\//;

		LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|\??::)/;

		STRING_INVALID_ESCAPE = /((?:^|[^\\])(?:\\\\)*)\\(?:(0\d|[1-7])|(x(?![\da-fA-F]{2}).{0,2})|(u\{(?![\da-fA-F]{1,}\})[^}]*\}?)|(u(?!\{|[\da-fA-F]{4}).{0,4}))/; // Make sure the escape isn’t escaped.
		// octal escape
		// hex escape
		// unicode code point escape
		// unicode escape

		REGEX_INVALID_ESCAPE = /((?:^|[^\\])(?:\\\\)*)\\(?:(0\d)|(x(?![\da-fA-F]{2}).{0,2})|(u\{(?![\da-fA-F]{1,}\})[^}]*\}?)|(u(?!\{|[\da-fA-F]{4}).{0,4}))/; // Make sure the escape isn’t escaped.
		// octal escape
		// hex escape
		// unicode code point escape
		// unicode escape

		TRAILING_SPACES = /\s+$/;

		// Compound assignment tokens.
		COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=', '**=', '//=', '%%='];

		// Unary tokens.
		UNARY = ['NEW', 'TYPEOF', 'DELETE'];

		UNARY_MATH = ['!', '~'];

		// Bit-shifting tokens.
		SHIFT = ['<<', '>>', '>>>'];

		// Comparison tokens.
		COMPARE = ['==', '!=', '<', '>', '<=', '>='];

		// Mathematical tokens.
		MATH = ['*', '/', '%', '//', '%%'];

		// Relational tokens that are negatable with `not` prefix.
		RELATION = ['IN', 'OF', 'INSTANCEOF'];

		// Boolean tokens.
		BOOL = ['TRUE', 'FALSE'];

		// Tokens which could legitimately be invoked or indexed. An opening
		// parentheses or bracket following these tokens will be recorded as the start
		// of a function invocation or indexing operation.
		CALLABLE = ['IDENTIFIER', 'PROPERTY', ')', ']', '?', '@', 'THIS', 'SUPER', 'DYNAMIC_IMPORT'];

		INDEXABLE = CALLABLE.concat(['NUMBER', 'INFINITY', 'NAN', 'STRING', 'STRING_END', 'REGEX', 'REGEX_END', 'BOOL', 'NULL', 'UNDEFINED', '}', '::']);

		// Tokens which can be the left-hand side of a less-than comparison, i.e. `a<b`.
		COMPARABLE_LEFT_SIDE = ['IDENTIFIER', ')', ']', 'NUMBER'];

		// Tokens which a regular expression will never immediately follow (except spaced
		// CALLABLEs in some cases), but which a division operator can.

		// See: http://www-archive.mozilla.org/js/language/js20-2002-04/rationale/syntax.html#regular-expressions
		NOT_REGEX = INDEXABLE.concat(['++', '--']);

		// Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
		// occurs at the start of a line. We disambiguate these from trailing whens to
		// avoid an ambiguity in the grammar.
		LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

		// Additional indent in front of these is ignored.
		INDENTABLE_CLOSERS = [')', '}', ']'];

		return exports;
	};
	//#endregion

	//#region URL: /parser
	modules['/parser'] = function(){
		/* parser generated by jison 0.4.18 */
		/*
			Returns a Parser object of the following structure:

			Parser: {
				yy: {}
			}

			Parser.prototype: {
				yy: {},
				trace: function(),
				symbols_: {associative list: name ==> number},
				terminals_: {associative list: number ==> name},
				productions_: [...],
				performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
				table: [...],
				defaultActions: {...},
				parseError: function(str, hash),
				parse: function(input),

				lexer: {
						EOF: 1,
						parseError: function(str, hash),
						setInput: function(input),
						input: function(),
						unput: function(str),
						more: function(),
						less: function(n),
						pastInput: function(),
						upcomingInput: function(),
						showPosition: function(),
						test_match: function(regex_match_array, rule_index),
						next: function(),
						lex: function(),
						begin: function(condition),
						popState: function(),
						_currentRules: function(),
						topState: function(),
						pushState: function(condition),

						options: {
								ranges: boolean           (optional: true ==> token location info will include a .range[] member)
								flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
								backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
						},

						performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
						rules: [...],
						conditions: {associative list: name ==> set},
				}
			}


			token location info (@$, _$, etc.): {
				first_line: n,
				last_line: n,
				first_column: n,
				last_column: n,
				range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
			}


			the parseError function receives a 'hash' object with these members for lexer and parser errors: {
				text:        (matched text)
				token:       (the produced terminal token, if any)
				line:        (yylineno)
			}
			while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
				loc:         (yylloc)
				expected:    (string describing the set of expected tokens)
				recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
			}
		*/
		var exports = {};
		var parser = (function(){
		var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,24],$V1=[1,59],$V2=[1,98],$V3=[1,99],$V4=[1,94],$V5=[1,100],$V6=[1,101],$V7=[1,96],$V8=[1,97],$V9=[1,68],$Va=[1,70],$Vb=[1,71],$Vc=[1,72],$Vd=[1,73],$Ve=[1,74],$Vf=[1,76],$Vg=[1,80],$Vh=[1,77],$Vi=[1,78],$Vj=[1,62],$Vk=[1,45],$Vl=[1,38],$Vm=[1,83],$Vn=[1,84],$Vo=[1,81],$Vp=[1,82],$Vq=[1,93],$Vr=[1,57],$Vs=[1,63],$Vt=[1,64],$Vu=[1,79],$Vv=[1,50],$Vw=[1,58],$Vx=[1,75],$Vy=[1,88],$Vz=[1,89],$VA=[1,90],$VB=[1,91],$VC=[1,56],$VD=[1,87],$VE=[1,40],$VF=[1,41],$VG=[1,61],$VH=[1,42],$VI=[1,43],$VJ=[1,44],$VK=[1,46],$VL=[1,47],$VM=[1,102],$VN=[1,6,35,52,155],$VO=[1,6,33,35,52,74,76,96,137,144,155,158,166],$VP=[1,120],$VQ=[1,121],$VR=[1,122],$VS=[1,117],$VT=[1,105],$VU=[1,104],$VV=[1,103],$VW=[1,106],$VX=[1,107],$VY=[1,108],$VZ=[1,109],$V_=[1,110],$V$=[1,111],$V01=[1,112],$V11=[1,113],$V21=[1,114],$V31=[1,115],$V41=[1,116],$V51=[1,124],$V61=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$V71=[2,222],$V81=[1,130],$V91=[1,135],$Va1=[1,131],$Vb1=[1,132],$Vc1=[1,133],$Vd1=[1,136],$Ve1=[1,129],$Vf1=[1,6,33,35,52,74,76,96,137,144,155,157,158,159,165,166,183],$Vg1=[1,6,33,35,46,47,52,74,76,91,96,105,106,107,110,111,112,115,119,135,136,137,144,155,157,158,159,165,166,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$Vh1=[2,129],$Vi1=[2,133],$Vj1=[6,33,91,96],$Vk1=[2,106],$Vl1=[1,148],$Vm1=[1,147],$Vn1=[1,142],$Vo1=[1,151],$Vp1=[1,156],$Vq1=[1,154],$Vr1=[1,160],$Vs1=[1,166],$Vt1=[1,162],$Vu1=[1,163],$Vv1=[1,165],$Vw1=[1,170],$Vx1=[1,6,33,35,46,47,52,66,74,76,91,96,105,106,107,110,111,112,115,119,135,136,137,144,155,157,158,159,165,166,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$Vy1=[2,126],$Vz1=[1,6,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$VA1=[2,31],$VB1=[1,195],$VC1=[1,196],$VD1=[2,93],$VE1=[1,202],$VF1=[1,208],$VG1=[1,223],$VH1=[1,218],$VI1=[1,227],$VJ1=[1,224],$VK1=[1,229],$VL1=[1,230],$VM1=[1,232],$VN1=[2,227],$VO1=[1,234],$VP1=[14,32,33,39,40,44,46,47,54,55,59,60,61,62,63,64,73,75,82,85,87,88,89,93,94,108,109,117,120,122,131,139,149,153,154,157,159,162,165,176,182,185,186,187,188,189,190,191,192],$VQ1=[1,6,33,35,46,47,52,66,74,76,91,96,105,106,107,110,111,112,115,119,121,135,136,137,144,155,157,158,159,165,166,183,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205],$VR1=[1,247],$VS1=[1,248],$VT1=[2,156],$VU1=[1,264],$VV1=[1,265],$VW1=[1,267],$VX1=[1,277],$VY1=[1,278],$VZ1=[1,6,33,35,46,47,52,70,74,76,91,96,105,106,107,110,111,112,115,119,135,136,137,144,155,157,158,159,165,166,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$V_1=[1,6,33,35,36,46,47,52,66,70,74,76,91,96,105,106,107,110,111,112,115,119,121,128,135,136,137,144,155,157,158,159,165,166,173,174,175,183,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205],$V$1=[1,6,33,35,46,47,49,51,52,57,70,74,76,91,96,105,106,107,110,111,112,115,119,123,135,136,137,144,155,157,158,159,165,166,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$V02=[1,283],$V12=[46,47,136],$V22=[1,322],$V32=[1,321],$V42=[6,33],$V52=[2,104],$V62=[1,328],$V72=[6,33,35,91,96],$V82=[6,33,35,66,76,91,96],$V92=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,189,190,194,195,196,197,198,199,200,201,202,203,204],$Va2=[2,377],$Vb2=[2,378],$Vc2=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,189,190,194,196,197,198,199,200,201,202,203,204],$Vd2=[46,47,105,106,110,111,112,115,135,136],$Ve2=[1,357],$Vf2=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183],$Vg2=[2,91],$Vh2=[1,375],$Vi2=[1,377],$Vj2=[1,382],$Vk2=[1,384],$Vl2=[6,33,74,96],$Vm2=[2,247],$Vn2=[2,248],$Vo2=[1,6,33,35,46,47,52,66,74,76,91,96,105,106,107,110,111,112,115,119,135,136,137,144,155,157,158,159,165,166,173,174,175,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$Vp2=[1,398],$Vq2=[14,32,33,35,39,40,44,46,47,54,55,59,60,61,62,63,64,73,74,75,76,82,85,87,88,89,93,94,96,108,109,117,120,122,131,139,149,153,154,157,159,162,165,176,182,185,186,187,188,189,190,191,192],$Vr2=[1,400],$Vs2=[6,33,35,74,96],$Vt2=[6,14,32,33,35,39,40,44,46,47,54,55,59,60,61,62,63,64,73,74,75,76,82,85,87,88,89,93,94,96,108,109,117,120,122,131,139,149,153,154,157,159,162,165,176,182,185,186,187,188,189,190,191,192],$Vu2=[6,33,35,74,96,137],$Vv2=[1,6,33,35,46,47,52,57,74,76,91,96,105,106,107,110,111,112,115,119,135,136,137,144,155,157,158,159,165,166,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$Vw2=[1,411],$Vx2=[1,6,33,35,46,47,52,66,70,74,76,91,96,105,106,107,110,111,112,115,119,121,135,136,137,144,155,157,158,159,165,166,173,174,175,183,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205],$Vy2=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,166,183],$Vz2=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,158,166,183],$VA2=[2,300],$VB2=[173,174,175],$VC2=[96,173,174,175],$VD2=[6,33,119],$VE2=[1,431],$VF2=[6,33,35,96,119],$VG2=[6,33,35,70,96,119],$VH2=[6,33,35,66,70,76,96,105,106,110,111,112,115,119,135,136],$VI2=[6,33,35,76,96,105,106,110,111,112,115,119,135,136],$VJ2=[46,47,49,51],$VK2=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,189,190,196,197,198,199,200,201,202,203,204],$VL2=[2,367],$VM2=[2,366],$VN2=[35,107],$VO2=[14,32,35,39,40,44,46,47,54,55,59,60,61,62,63,64,73,75,82,85,87,88,89,93,94,107,108,109,117,120,122,131,139,149,153,154,157,159,162,165,176,182,185,186,187,188,189,190,191,192],$VP2=[2,233],$VQ2=[6,33,35],$VR2=[2,105],$VS2=[1,470],$VT2=[1,471],$VU2=[1,6,33,35,46,47,52,74,76,91,96,105,106,107,110,111,112,115,119,135,136,137,144,151,152,155,157,158,159,165,166,178,180,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$VV2=[1,337],$VW2=[35,178,180],$VX2=[1,6,35,52,74,76,91,96,107,119,137,144,155,158,166,183],$VY2=[1,509],$VZ2=[1,516],$V_2=[1,6,33,35,52,74,76,96,137,144,155,158,166,183],$V$2=[2,120],$V03=[1,529],$V13=[33,35,74],$V23=[1,537],$V33=[6,33,35,96,137],$V43=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,178,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$V53=[1,6,33,35,52,74,76,96,137,144,155,158,166,178],$V63=[2,314],$V73=[2,315],$V83=[2,330],$V93=[1,557],$Va3=[1,558],$Vb3=[6,33,35,119],$Vc3=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,159,165,166,183],$Vd3=[6,33,35,96],$Ve3=[1,6,33,35,52,74,76,91,96,107,119,137,144,151,155,157,158,159,165,166,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$Vf3=[33,96],$Vg3=[1,611],$Vh3=[1,612],$Vi3=[1,619],$Vj3=[1,620],$Vk3=[1,638],$Vl3=[1,639],$Vm3=[2,285],$Vn3=[2,288],$Vo3=[2,301],$Vp3=[2,316],$Vq3=[2,320],$Vr3=[2,317],$Vs3=[2,321],$Vt3=[2,318],$Vu3=[2,319],$Vv3=[2,331],$Vw3=[2,332],$Vx3=[1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,183],$Vy3=[2,322],$Vz3=[2,324],$VA3=[2,326],$VB3=[2,328],$VC3=[2,323],$VD3=[2,325],$VE3=[2,327],$VF3=[2,329];
		var parser = {trace: function trace () { },
		yy: {},
		symbols_: {"error":2,"Root":3,"Body":4,"Line":5,"TERMINATOR":6,"Expression":7,"ExpressionLine":8,"Statement":9,"FuncDirective":10,"YieldReturn":11,"AwaitReturn":12,"Return":13,"STATEMENT":14,"Import":15,"Export":16,"Value":17,"Code":18,"Operation":19,"Assign":20,"If":21,"Try":22,"While":23,"For":24,"Switch":25,"Class":26,"Throw":27,"Yield":28,"CodeLine":29,"IfLine":30,"OperationLine":31,"YIELD":32,"INDENT":33,"Object":34,"OUTDENT":35,"FROM":36,"Block":37,"Identifier":38,"IDENTIFIER":39,"JSX_TAG":40,"Property":41,"PROPERTY":42,"AlphaNumeric":43,"NUMBER":44,"String":45,"STRING":46,"STRING_START":47,"Interpolations":48,"STRING_END":49,"InterpolationChunk":50,"INTERPOLATION_START":51,"INTERPOLATION_END":52,"Regex":53,"REGEX":54,"REGEX_START":55,"Invocation":56,"REGEX_END":57,"Literal":58,"JS":59,"UNDEFINED":60,"NULL":61,"BOOL":62,"INFINITY":63,"NAN":64,"Assignable":65,"=":66,"AssignObj":67,"ObjAssignable":68,"ObjRestValue":69,":":70,"SimpleObjAssignable":71,"ThisProperty":72,"[":73,"]":74,"@":75,"...":76,"ObjSpreadExpr":77,"ObjSpreadIdentifier":78,"Parenthetical":79,"Super":80,"This":81,"SUPER":82,"OptFuncExist":83,"Arguments":84,"DYNAMIC_IMPORT":85,"Accessor":86,"RETURN":87,"AWAIT":88,"PARAM_START":89,"ParamList":90,"PARAM_END":91,"FuncGlyph":92,"->":93,"=>":94,"OptComma":95,",":96,"Param":97,"ParamVar":98,"Array":99,"Splat":100,"SimpleAssignable":101,"Range":102,"DoIife":103,"MetaProperty":104,".":105,"INDEX_START":106,"INDEX_END":107,"NEW_TARGET":108,"IMPORT_META":109,"?.":110,"::":111,"?::":112,"Index":113,"IndexValue":114,"INDEX_SOAK":115,"Slice":116,"{":117,"AssignList":118,"}":119,"CLASS":120,"EXTENDS":121,"IMPORT":122,"ASSERT":123,"ImportDefaultSpecifier":124,"ImportNamespaceSpecifier":125,"ImportSpecifierList":126,"ImportSpecifier":127,"AS":128,"DEFAULT":129,"IMPORT_ALL":130,"EXPORT":131,"ExportSpecifierList":132,"EXPORT_ALL":133,"ExportSpecifier":134,"FUNC_EXIST":135,"CALL_START":136,"CALL_END":137,"ArgList":138,"THIS":139,"Elisions":140,"ArgElisionList":141,"OptElisions":142,"RangeDots":143,"..":144,"Arg":145,"ArgElision":146,"Elision":147,"SimpleArgs":148,"TRY":149,"Catch":150,"FINALLY":151,"CATCH":152,"THROW":153,"(":154,")":155,"WhileLineSource":156,"WHILE":157,"WHEN":158,"UNTIL":159,"WhileSource":160,"Loop":161,"LOOP":162,"ForBody":163,"ForLineBody":164,"FOR":165,"BY":166,"ForStart":167,"ForSource":168,"ForLineSource":169,"ForVariables":170,"OWN":171,"ForValue":172,"FORIN":173,"FOROF":174,"FORFROM":175,"SWITCH":176,"Whens":177,"ELSE":178,"When":179,"LEADING_WHEN":180,"IfBlock":181,"IF":182,"POST_IF":183,"IfBlockLine":184,"UNARY":185,"DO":186,"DO_IIFE":187,"UNARY_MATH":188,"-":189,"+":190,"--":191,"++":192,"?":193,"MATH":194,"**":195,"SHIFT":196,"COMPARE":197,"&":198,"^":199,"|":200,"&&":201,"||":202,"BIN?":203,"RELATION":204,"COMPOUND_ASSIGN":205,"$accept":0,"$end":1},
		terminals_: {2:"error",6:"TERMINATOR",14:"STATEMENT",32:"YIELD",33:"INDENT",35:"OUTDENT",36:"FROM",39:"IDENTIFIER",40:"JSX_TAG",42:"PROPERTY",44:"NUMBER",46:"STRING",47:"STRING_START",49:"STRING_END",51:"INTERPOLATION_START",52:"INTERPOLATION_END",54:"REGEX",55:"REGEX_START",57:"REGEX_END",59:"JS",60:"UNDEFINED",61:"NULL",62:"BOOL",63:"INFINITY",64:"NAN",66:"=",70:":",73:"[",74:"]",75:"@",76:"...",82:"SUPER",85:"DYNAMIC_IMPORT",87:"RETURN",88:"AWAIT",89:"PARAM_START",91:"PARAM_END",93:"->",94:"=>",96:",",105:".",106:"INDEX_START",107:"INDEX_END",108:"NEW_TARGET",109:"IMPORT_META",110:"?.",111:"::",112:"?::",115:"INDEX_SOAK",117:"{",119:"}",120:"CLASS",121:"EXTENDS",122:"IMPORT",123:"ASSERT",128:"AS",129:"DEFAULT",130:"IMPORT_ALL",131:"EXPORT",133:"EXPORT_ALL",135:"FUNC_EXIST",136:"CALL_START",137:"CALL_END",139:"THIS",144:"..",149:"TRY",151:"FINALLY",152:"CATCH",153:"THROW",154:"(",155:")",157:"WHILE",158:"WHEN",159:"UNTIL",162:"LOOP",165:"FOR",166:"BY",171:"OWN",173:"FORIN",174:"FOROF",175:"FORFROM",176:"SWITCH",178:"ELSE",180:"LEADING_WHEN",182:"IF",183:"POST_IF",185:"UNARY",186:"DO",187:"DO_IIFE",188:"UNARY_MATH",189:"-",190:"+",191:"--",192:"++",193:"?",194:"MATH",195:"**",196:"SHIFT",197:"COMPARE",198:"&",199:"^",200:"|",201:"&&",202:"||",203:"BIN?",204:"RELATION",205:"COMPOUND_ASSIGN"},
		productions_: [0,[3,0],[3,1],[4,1],[4,3],[4,2],[5,1],[5,1],[5,1],[5,1],[10,1],[10,1],[9,1],[9,1],[9,1],[9,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[8,1],[8,1],[8,1],[28,1],[28,2],[28,4],[28,3],[37,2],[37,3],[38,1],[38,1],[41,1],[43,1],[43,1],[45,1],[45,3],[48,1],[48,2],[50,3],[50,5],[50,2],[50,1],[53,1],[53,3],[58,1],[58,1],[58,1],[58,1],[58,1],[58,1],[58,1],[58,1],[20,3],[20,4],[20,5],[67,1],[67,1],[67,3],[67,5],[67,3],[67,5],[71,1],[71,1],[71,1],[68,1],[68,3],[68,4],[68,1],[69,2],[69,2],[69,2],[69,2],[77,1],[77,1],[77,1],[77,1],[77,1],[77,3],[77,2],[77,3],[77,3],[78,2],[78,2],[13,2],[13,4],[13,1],[11,3],[11,2],[12,3],[12,2],[18,5],[18,2],[29,5],[29,2],[92,1],[92,1],[95,0],[95,1],[90,0],[90,1],[90,3],[90,4],[90,6],[97,1],[97,2],[97,2],[97,3],[97,1],[98,1],[98,1],[98,1],[98,1],[100,2],[100,2],[101,1],[101,2],[101,2],[101,1],[65,1],[65,1],[65,1],[17,1],[17,1],[17,1],[17,1],[17,1],[17,1],[17,1],[17,1],[17,1],[80,3],[80,4],[80,6],[104,3],[104,3],[86,2],[86,2],[86,2],[86,2],[86,1],[86,1],[86,1],[113,3],[113,5],[113,2],[114,1],[114,1],[34,4],[118,0],[118,1],[118,3],[118,4],[118,6],[26,1],[26,2],[26,3],[26,4],[26,2],[26,3],[26,4],[26,5],[15,2],[15,4],[15,4],[15,6],[15,4],[15,6],[15,5],[15,7],[15,7],[15,9],[15,6],[15,8],[15,9],[15,11],[126,1],[126,3],[126,4],[126,4],[126,6],[127,1],[127,3],[127,1],[127,3],[124,1],[125,3],[16,3],[16,5],[16,2],[16,4],[16,5],[16,6],[16,3],[16,5],[16,4],[16,6],[16,5],[16,7],[16,7],[16,9],[132,1],[132,3],[132,4],[132,4],[132,6],[134,1],[134,3],[134,3],[134,1],[134,3],[56,3],[56,3],[56,3],[56,2],[83,0],[83,1],[84,2],[84,4],[81,1],[81,1],[72,2],[99,2],[99,3],[99,4],[143,1],[143,1],[102,5],[102,5],[116,3],[116,2],[116,3],[116,2],[116,2],[116,1],[138,1],[138,3],[138,4],[138,4],[138,6],[145,1],[145,1],[145,1],[145,1],[141,1],[141,3],[141,4],[141,4],[141,6],[146,1],[146,2],[142,1],[142,2],[140,1],[140,2],[147,1],[147,2],[148,1],[148,1],[148,3],[148,3],[22,2],[22,3],[22,4],[22,5],[150,3],[150,3],[150,2],[27,2],[27,4],[79,3],[79,5],[156,2],[156,4],[156,2],[156,4],[160,2],[160,4],[160,4],[160,2],[160,4],[160,4],[23,2],[23,2],[23,2],[23,2],[23,1],[161,2],[161,2],[24,2],[24,2],[24,2],[24,2],[163,2],[163,4],[163,2],[164,4],[164,2],[167,2],[167,3],[167,3],[172,1],[172,1],[172,1],[172,1],[170,1],[170,3],[168,2],[168,2],[168,4],[168,4],[168,4],[168,4],[168,4],[168,4],[168,6],[168,6],[168,6],[168,6],[168,6],[168,6],[168,6],[168,6],[168,2],[168,4],[168,4],[169,2],[169,2],[169,4],[169,4],[169,4],[169,4],[169,4],[169,4],[169,6],[169,6],[169,6],[169,6],[169,6],[169,6],[169,6],[169,6],[169,2],[169,4],[169,4],[25,5],[25,5],[25,7],[25,7],[25,4],[25,6],[177,1],[177,2],[179,3],[179,4],[181,3],[181,5],[21,1],[21,3],[21,3],[21,3],[184,3],[184,5],[30,1],[30,3],[30,3],[30,3],[31,2],[31,2],[31,2],[19,2],[19,2],[19,2],[19,2],[19,2],[19,2],[19,4],[19,2],[19,2],[19,2],[19,2],[19,2],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,3],[19,5],[19,4],[103,2]],
		performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
		/* this == yyval */

		var $0 = $$.length - 1;
		switch (yystate) {
		case 1:
		return this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Root(new yy.Block()));
		break;
		case 2:
		return this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Root($$[$0]));
		break;
		case 3:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(yy.Block.wrap([$$[$0]]));
		break;
		case 4:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)($$[$0-2].push($$[$0]));
		break;
		case 5:
		this.$ = $$[$0-1];
		break;
		case 6: case 7: case 8: case 9: case 10: case 11: case 12: case 14: case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 23: case 24: case 25: case 26: case 27: case 28: case 29: case 30: case 41: case 52: case 54: case 64: case 69: case 70: case 71: case 72: case 75: case 80: case 81: case 82: case 83: case 84: case 104: case 105: case 116: case 117: case 118: case 119: case 125: case 126: case 129: case 135: case 149: case 247: case 248: case 249: case 251: case 264: case 265: case 308: case 309: case 364: case 370:
		this.$ = $$[$0];
		break;
		case 13:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.StatementLiteral($$[$0]));
		break;
		case 31:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Op($$[$0],
					new yy.Value(new yy.Literal(''))));
		break;
		case 32: case 374: case 375: case 376: case 378: case 379: case 382: case 405:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Op($$[$0-1],
					$$[$0]));
		break;
		case 33: case 383:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Op($$[$0-3],
					$$[$0-1]));
		break;
		case 34:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Op($$[$0-2].concat($$[$0-1]),
					$$[$0]));
		break;
		case 35:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Block());
		break;
		case 36: case 150:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)($$[$0-1]);
		break;
		case 37:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.IdentifierLiteral($$[$0]));
		break;
		case 38:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)((function() {
						var ref,
					ref1,
					ref2,
					ref3;
						return new yy.JSXTag($$[$0].toString(),
					{
							tagNameLocationData: $$[$0].tagNameToken[2],
							closingTagOpeningBracketLocationData: (ref = $$[$0].closingTagOpeningBracketToken) != null ? ref[2] : void 0,
							closingTagSlashLocationData: (ref1 = $$[$0].closingTagSlashToken) != null ? ref1[2] : void 0,
							closingTagNameLocationData: (ref2 = $$[$0].closingTagNameToken) != null ? ref2[2] : void 0,
							closingTagClosingBracketLocationData: (ref3 = $$[$0].closingTagClosingBracketToken) != null ? ref3[2] : void 0
						});
					}()));
		break;
		case 39:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.PropertyName($$[$0].toString()));
		break;
		case 40:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.NumberLiteral($$[$0].toString(),
					{
							parsedValue: $$[$0].parsedValue
						}));
		break;
		case 42:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.StringLiteral($$[$0].slice(1,
					-1), // strip artificial quotes and unwrap to primitive string
					{
							quote: $$[$0].quote,
							initialChunk: $$[$0].initialChunk,
							finalChunk: $$[$0].finalChunk,
							indent: $$[$0].indent,
							double: $$[$0].double,
							heregex: $$[$0].heregex
						}));
		break;
		case 43:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.StringWithInterpolations(yy.Block.wrap($$[$0-1]),
					{
							quote: $$[$0-2].quote,
							startQuote: yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.Literal($$[$0-2].toString()))
						}));
		break;
		case 44: case 107: case 157: case 183: case 208: case 242: case 256: case 260: case 312: case 358:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)([$$[$0]]);
		break;
		case 45: case 257: case 261: case 359:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)($$[$0-1].concat($$[$0]));
		break;
		case 46:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Interpolation($$[$0-1]));
		break;
		case 47:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Interpolation($$[$0-2]));
		break;
		case 48:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Interpolation());
		break;
		case 49: case 293:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)($$[$0]);
		break;
		case 50:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.RegexLiteral($$[$0].toString(),
					{
							delimiter: $$[$0].delimiter,
							heregexCommentTokens: $$[$0].heregexCommentTokens
						}));
		break;
		case 51:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.RegexWithInterpolations($$[$0-1],
					{
							heregexCommentTokens: $$[$0].heregexCommentTokens
						}));
		break;
		case 53:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.PassthroughLiteral($$[$0].toString(),
					{
							here: $$[$0].here,
							generated: $$[$0].generated
						}));
		break;
		case 55:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.UndefinedLiteral($$[$0]));
		break;
		case 56:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.NullLiteral($$[$0]));
		break;
		case 57:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.BooleanLiteral($$[$0].toString(),
					{
							originalValue: $$[$0].original
						}));
		break;
		case 58:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.InfinityLiteral($$[$0].toString(),
					{
							originalValue: $$[$0].original
						}));
		break;
		case 59:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.NaNLiteral($$[$0]));
		break;
		case 60:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Assign($$[$0-2],
					$$[$0]));
		break;
		case 61:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Assign($$[$0-3],
					$$[$0]));
		break;
		case 62:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Assign($$[$0-4],
					$$[$0-1]));
		break;
		case 63: case 122: case 127: case 128: case 130: case 131: case 132: case 133: case 134: case 136: case 137: case 310: case 311:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Value($$[$0]));
		break;
		case 65:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Assign(yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.Value($$[$0-2])),
					$$[$0],
					'object',
					{
							operatorToken: yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Literal($$[$0-1]))
						}));
		break;
		case 66:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Assign(yy.addDataToNode(yy, _$[$0-4], $$[$0-4], null, null, true)(new yy.Value($$[$0-4])),
					$$[$0-1],
					'object',
					{
							operatorToken: yy.addDataToNode(yy, _$[$0-3], $$[$0-3], null, null, true)(new yy.Literal($$[$0-3]))
						}));
		break;
		case 67:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Assign(yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.Value($$[$0-2])),
					$$[$0],
					null,
					{
							operatorToken: yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Literal($$[$0-1]))
						}));
		break;
		case 68:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Assign(yy.addDataToNode(yy, _$[$0-4], $$[$0-4], null, null, true)(new yy.Value($$[$0-4])),
					$$[$0-1],
					null,
					{
							operatorToken: yy.addDataToNode(yy, _$[$0-3], $$[$0-3], null, null, true)(new yy.Literal($$[$0-3]))
						}));
		break;
		case 73:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Value(new yy.ComputedPropertyName($$[$0-1])));
		break;
		case 74:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Value(yy.addDataToNode(yy, _$[$0-3], $$[$0-3], null, null, true)(new yy.ThisLiteral($$[$0-3])),
					[yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.ComputedPropertyName($$[$0-1]))],
					'this'));
		break;
		case 76:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Splat(new yy.Value($$[$0-1])));
		break;
		case 77:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Splat(new yy.Value($$[$0]),
					{
							postfix: false
						}));
		break;
		case 78: case 120:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Splat($$[$0-1]));
		break;
		case 79: case 121:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Splat($$[$0],
					{
							postfix: false
						}));
		break;
		case 85: case 220:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.SuperCall(yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.Super()),
					$$[$0],
					$$[$0-1].soak,
					$$[$0-2]));
		break;
		case 86: case 221:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.DynamicImportCall(yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.DynamicImport()),
					$$[$0]));
		break;
		case 87:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Call(new yy.Value($$[$0-2]),
					$$[$0],
					$$[$0-1].soak));
		break;
		case 88: case 219:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Call($$[$0-2],
					$$[$0],
					$$[$0-1].soak));
		break;
		case 89: case 90:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)((new yy.Value($$[$0-1])).add($$[$0]));
		break;
		case 91:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Return($$[$0]));
		break;
		case 92:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Return(new yy.Value($$[$0-1])));
		break;
		case 93:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Return());
		break;
		case 94:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.YieldReturn($$[$0],
					{
							returnKeyword: yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Literal($$[$0-1]))
						}));
		break;
		case 95:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.YieldReturn(null,
					{
							returnKeyword: yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.Literal($$[$0]))
						}));
		break;
		case 96:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.AwaitReturn($$[$0],
					{
							returnKeyword: yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Literal($$[$0-1]))
						}));
		break;
		case 97:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.AwaitReturn(null,
					{
							returnKeyword: yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.Literal($$[$0]))
						}));
		break;
		case 98:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Code($$[$0-3],
					$$[$0],
					$$[$0-1],
					yy.addDataToNode(yy, _$[$0-4], $$[$0-4], null, null, true)(new yy.Literal($$[$0-4]))));
		break;
		case 99:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Code([],
					$$[$0],
					$$[$0-1]));
		break;
		case 100:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Code($$[$0-3],
					yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(yy.Block.wrap([$$[$0]])),
					$$[$0-1],
					yy.addDataToNode(yy, _$[$0-4], $$[$0-4], null, null, true)(new yy.Literal($$[$0-4]))));
		break;
		case 101:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Code([],
					yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(yy.Block.wrap([$$[$0]])),
					$$[$0-1]));
		break;
		case 102: case 103:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.FuncGlyph($$[$0]));
		break;
		case 106: case 156: case 258:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)([]);
		break;
		case 108: case 158: case 184: case 209: case 243: case 252:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)($$[$0-2].concat($$[$0]));
		break;
		case 109: case 159: case 185: case 210: case 244: case 253:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)($$[$0-3].concat($$[$0]));
		break;
		case 110: case 160: case 187: case 212: case 246:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)($$[$0-5].concat($$[$0-2]));
		break;
		case 111:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Param($$[$0]));
		break;
		case 112:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Param($$[$0-1],
					null,
					true));
		break;
		case 113:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Param($$[$0],
					null,
					{
							postfix: false
						}));
		break;
		case 114:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Param($$[$0-2],
					$$[$0]));
		break;
		case 115: case 250:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Expansion());
		break;
		case 123:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)($$[$0-1].add($$[$0]));
		break;
		case 124:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Value($$[$0-1]).add($$[$0]));
		break;
		case 138:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Super(yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.Access($$[$0])),
					yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.Literal($$[$0-2]))));
		break;
		case 139:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Super(yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Index($$[$0-1])),
					yy.addDataToNode(yy, _$[$0-3], $$[$0-3], null, null, true)(new yy.Literal($$[$0-3]))));
		break;
		case 140:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)(new yy.Super(yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.Index($$[$0-2])),
					yy.addDataToNode(yy, _$[$0-5], $$[$0-5], null, null, true)(new yy.Literal($$[$0-5]))));
		break;
		case 141: case 142:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.MetaProperty(yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.IdentifierLiteral($$[$0-2])),
					yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.Access($$[$0]))));
		break;
		case 143:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Access($$[$0]));
		break;
		case 144:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Access($$[$0],
					{
							soak: true
						}));
		break;
		case 145:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)([
							yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Access(new yy.PropertyName('prototype'),
							{
								shorthand: true
							})),
							yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.Access($$[$0]))
						]);
		break;
		case 146:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)([
							yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Access(new yy.PropertyName('prototype'),
							{
								shorthand: true,
								soak: true
							})),
							yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.Access($$[$0]))
						]);
		break;
		case 147:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Access(new yy.PropertyName('prototype'),
					{
							shorthand: true
						}));
		break;
		case 148:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Access(new yy.PropertyName('prototype'),
					{
							shorthand: true,
							soak: true
						}));
		break;
		case 151:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)($$[$0-2]);
		break;
		case 152:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(yy.extend($$[$0],
					{
							soak: true
						}));
		break;
		case 153:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Index($$[$0]));
		break;
		case 154:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Slice($$[$0]));
		break;
		case 155:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Obj($$[$0-2],
					$$[$0-3].generated));
		break;
		case 161:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Class());
		break;
		case 162:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Class(null,
					null,
					$$[$0]));
		break;
		case 163:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Class(null,
					$$[$0]));
		break;
		case 164:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Class(null,
					$$[$0-1],
					$$[$0]));
		break;
		case 165:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Class($$[$0]));
		break;
		case 166:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Class($$[$0-1],
					null,
					$$[$0]));
		break;
		case 167:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Class($$[$0-2],
					$$[$0]));
		break;
		case 168:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Class($$[$0-3],
					$$[$0-1],
					$$[$0]));
		break;
		case 169:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.ImportDeclaration(null,
					$$[$0]));
		break;
		case 170:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.ImportDeclaration(null,
					$$[$0-2],
					$$[$0]));
		break;
		case 171:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause($$[$0-2],
					null),
					$$[$0]));
		break;
		case 172:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause($$[$0-4],
					null),
					$$[$0-2],
					$$[$0]));
		break;
		case 173:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause(null,
					$$[$0-2]),
					$$[$0]));
		break;
		case 174:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause(null,
					$$[$0-4]),
					$$[$0-2],
					$$[$0]));
		break;
		case 175:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause(null,
					new yy.ImportSpecifierList([])),
					$$[$0]));
		break;
		case 176:
		this.$ = yy.addDataToNode(yy, _$[$0-6], $$[$0-6], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause(null,
					new yy.ImportSpecifierList([])),
					$$[$0-2],
					$$[$0]));
		break;
		case 177:
		this.$ = yy.addDataToNode(yy, _$[$0-6], $$[$0-6], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause(null,
					new yy.ImportSpecifierList($$[$0-4])),
					$$[$0]));
		break;
		case 178:
		this.$ = yy.addDataToNode(yy, _$[$0-8], $$[$0-8], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause(null,
					new yy.ImportSpecifierList($$[$0-6])),
					$$[$0-2],
					$$[$0]));
		break;
		case 179:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause($$[$0-4],
					$$[$0-2]),
					$$[$0]));
		break;
		case 180:
		this.$ = yy.addDataToNode(yy, _$[$0-7], $$[$0-7], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause($$[$0-6],
					$$[$0-4]),
					$$[$0-2],
					$$[$0]));
		break;
		case 181:
		this.$ = yy.addDataToNode(yy, _$[$0-8], $$[$0-8], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause($$[$0-7],
					new yy.ImportSpecifierList($$[$0-4])),
					$$[$0]));
		break;
		case 182:
		this.$ = yy.addDataToNode(yy, _$[$0-10], $$[$0-10], _$[$0], $$[$0], true)(new yy.ImportDeclaration(new yy.ImportClause($$[$0-9],
					new yy.ImportSpecifierList($$[$0-6])),
					$$[$0-2],
					$$[$0]));
		break;
		case 186: case 211: case 245:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)($$[$0-2]);
		break;
		case 188:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.ImportSpecifier($$[$0]));
		break;
		case 189:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.ImportSpecifier($$[$0-2],
					$$[$0]));
		break;
		case 190:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.ImportSpecifier(yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.DefaultLiteral($$[$0]))));
		break;
		case 191:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.ImportSpecifier(yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.DefaultLiteral($$[$0-2])),
					$$[$0]));
		break;
		case 192:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.ImportDefaultSpecifier($$[$0]));
		break;
		case 193:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.ImportNamespaceSpecifier(new yy.Literal($$[$0-2]),
					$$[$0]));
		break;
		case 194:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration(new yy.ExportSpecifierList([])));
		break;
		case 195:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration(new yy.ExportSpecifierList($$[$0-2])));
		break;
		case 196:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration($$[$0]));
		break;
		case 197:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration(yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Assign($$[$0-2],
					$$[$0],
					null,
					{
							moduleDeclaration: 'export'
						}))));
		break;
		case 198:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration(yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Assign($$[$0-3],
					$$[$0],
					null,
					{
							moduleDeclaration: 'export'
						}))));
		break;
		case 199:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration(yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Assign($$[$0-4],
					$$[$0-1],
					null,
					{
							moduleDeclaration: 'export'
						}))));
		break;
		case 200:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.ExportDefaultDeclaration($$[$0]));
		break;
		case 201:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.ExportDefaultDeclaration(new yy.Value($$[$0-1])));
		break;
		case 202:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.ExportAllDeclaration(new yy.Literal($$[$0-2]),
					$$[$0]));
		break;
		case 203:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)(new yy.ExportAllDeclaration(new yy.Literal($$[$0-4]),
					$$[$0-2],
					$$[$0]));
		break;
		case 204:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration(new yy.ExportSpecifierList([]),
					$$[$0]));
		break;
		case 205:
		this.$ = yy.addDataToNode(yy, _$[$0-6], $$[$0-6], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration(new yy.ExportSpecifierList([]),
					$$[$0-2],
					$$[$0]));
		break;
		case 206:
		this.$ = yy.addDataToNode(yy, _$[$0-6], $$[$0-6], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration(new yy.ExportSpecifierList($$[$0-4]),
					$$[$0]));
		break;
		case 207:
		this.$ = yy.addDataToNode(yy, _$[$0-8], $$[$0-8], _$[$0], $$[$0], true)(new yy.ExportNamedDeclaration(new yy.ExportSpecifierList($$[$0-6]),
					$$[$0-2],
					$$[$0]));
		break;
		case 213:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.ExportSpecifier($$[$0]));
		break;
		case 214:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.ExportSpecifier($$[$0-2],
					$$[$0]));
		break;
		case 215:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.ExportSpecifier($$[$0-2],
					yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.DefaultLiteral($$[$0]))));
		break;
		case 216:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.ExportSpecifier(yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.DefaultLiteral($$[$0]))));
		break;
		case 217:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.ExportSpecifier(yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.DefaultLiteral($$[$0-2])),
					$$[$0]));
		break;
		case 218:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.TaggedTemplateCall($$[$0-2],
					$$[$0],
					$$[$0-1].soak));
		break;
		case 222:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)({
							soak: false
						});
		break;
		case 223:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)({
							soak: true
						});
		break;
		case 224:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)([]);
		break;
		case 225:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)((function() {
						$$[$0-2].implicit = $$[$0-3].generated;
						return $$[$0-2];
					}()));
		break;
		case 226: case 227:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Value(new yy.ThisLiteral($$[$0])));
		break;
		case 228:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Value(yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.ThisLiteral($$[$0-1])),
					[yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.Access($$[$0]))],
					'this'));
		break;
		case 229:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Arr([]));
		break;
		case 230:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Arr($$[$0-1]));
		break;
		case 231:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Arr([].concat($$[$0-2],
					$$[$0-1])));
		break;
		case 232:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)({
							exclusive: false
						});
		break;
		case 233:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)({
							exclusive: true
						});
		break;
		case 234: case 235:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Range($$[$0-3],
					$$[$0-1],
					$$[$0-2].exclusive ? 'exclusive' : 'inclusive'));
		break;
		case 236: case 238:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Range($$[$0-2],
					$$[$0],
					$$[$0-1].exclusive ? 'exclusive' : 'inclusive'));
		break;
		case 237: case 239:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Range($$[$0-1],
					null,
					$$[$0].exclusive ? 'exclusive' : 'inclusive'));
		break;
		case 240:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Range(null,
					$$[$0],
					$$[$0-1].exclusive ? 'exclusive' : 'inclusive'));
		break;
		case 241:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Range(null,
					null,
					$$[$0].exclusive ? 'exclusive' : 'inclusive'));
		break;
		case 254:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)($$[$0-2].concat($$[$0-1]));
		break;
		case 255:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)($$[$0-5].concat($$[$0-4],
					$$[$0-2],
					$$[$0-1]));
		break;
		case 259:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)([].concat($$[$0]));
		break;
		case 262:
		this.$ = yy.addDataToNode(yy, _$[$0], $$[$0], _$[$0], $$[$0], true)(new yy.Elision());
		break;
		case 263:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)($$[$0-1]);
		break;
		case 266: case 267:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)([].concat($$[$0-2],
					$$[$0]));
		break;
		case 268:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Try($$[$0]));
		break;
		case 269:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Try($$[$0-1],
					$$[$0]));
		break;
		case 270:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Try($$[$0-2],
					null,
					$$[$0],
					yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Literal($$[$0-1]))));
		break;
		case 271:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Try($$[$0-3],
					$$[$0-2],
					$$[$0],
					yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Literal($$[$0-1]))));
		break;
		case 272:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Catch($$[$0],
					$$[$0-1]));
		break;
		case 273:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Catch($$[$0],
					yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Value($$[$0-1]))));
		break;
		case 274:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Catch($$[$0]));
		break;
		case 275:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Throw($$[$0]));
		break;
		case 276:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Throw(new yy.Value($$[$0-1])));
		break;
		case 277:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Parens($$[$0-1]));
		break;
		case 278:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Parens($$[$0-2]));
		break;
		case 279: case 283:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.While($$[$0]));
		break;
		case 280: case 284: case 285:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.While($$[$0-2],
					{
							guard: $$[$0]
						}));
		break;
		case 281: case 286:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.While($$[$0],
					{
							invert: true
						}));
		break;
		case 282: case 287: case 288:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.While($$[$0-2],
					{
							invert: true,
							guard: $$[$0]
						}));
		break;
		case 289: case 290: case 298: case 299:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)($$[$0-1].addBody($$[$0]));
		break;
		case 291: case 292:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)((Object.assign($$[$0],
					{
							postfix: true
						})).addBody(yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(yy.Block.wrap([$$[$0-1]]))));
		break;
		case 294:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.While(yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.BooleanLiteral('true')),
					{
							isLoop: true
						}).addBody($$[$0]));
		break;
		case 295:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.While(yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.BooleanLiteral('true')),
					{
							isLoop: true
						}).addBody(yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(yy.Block.wrap([$$[$0]]))));
		break;
		case 296: case 297:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)((function() {
						$$[$0].postfix = true;
						return $$[$0].addBody($$[$0-1]);
					}()));
		break;
		case 300:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.For([],
					{
							source: yy.addDataToNode(yy, _$[$0], $$[$0], null, null, true)(new yy.Value($$[$0]))
						}));
		break;
		case 301: case 303:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.For([],
					{
							source: yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(new yy.Value($$[$0-2])),
							step: $$[$0]
						}));
		break;
		case 302: case 304:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)($$[$0-1].addSource($$[$0]));
		break;
		case 305:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.For([],
					{
							name: $$[$0][0],
							index: $$[$0][1]
						}));
		break;
		case 306:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)((function() {
						var index,
					name;
						[name,
					index] = $$[$0];
						return new yy.For([],
					{
							name,
							index,
							await: true,
							awaitTag: yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Literal($$[$0-1]))
						});
					}()));
		break;
		case 307:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)((function() {
						var index,
					name;
						[name,
					index] = $$[$0];
						return new yy.For([],
					{
							name,
							index,
							own: true,
							ownTag: yy.addDataToNode(yy, _$[$0-1], $$[$0-1], null, null, true)(new yy.Literal($$[$0-1]))
						});
					}()));
		break;
		case 313:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)([$$[$0-2],
					$$[$0]]);
		break;
		case 314: case 333:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)({
							source: $$[$0]
						});
		break;
		case 315: case 334:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)({
							source: $$[$0],
							object: true
						});
		break;
		case 316: case 317: case 335: case 336:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)({
							source: $$[$0-2],
							guard: $$[$0]
						});
		break;
		case 318: case 319: case 337: case 338:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)({
							source: $$[$0-2],
							guard: $$[$0],
							object: true
						});
		break;
		case 320: case 321: case 339: case 340:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)({
							source: $$[$0-2],
							step: $$[$0]
						});
		break;
		case 322: case 323: case 324: case 325: case 341: case 342: case 343: case 344:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)({
							source: $$[$0-4],
							guard: $$[$0-2],
							step: $$[$0]
						});
		break;
		case 326: case 327: case 328: case 329: case 345: case 346: case 347: case 348:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)({
							source: $$[$0-4],
							step: $$[$0-2],
							guard: $$[$0]
						});
		break;
		case 330: case 349:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)({
							source: $$[$0],
							from: true
						});
		break;
		case 331: case 332: case 350: case 351:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)({
							source: $$[$0-2],
							guard: $$[$0],
							from: true
						});
		break;
		case 352: case 353:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Switch($$[$0-3],
					$$[$0-1]));
		break;
		case 354: case 355:
		this.$ = yy.addDataToNode(yy, _$[$0-6], $$[$0-6], _$[$0], $$[$0], true)(new yy.Switch($$[$0-5],
					$$[$0-3],
					yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0-1], $$[$0-1], true)($$[$0-1])));
		break;
		case 356:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Switch(null,
					$$[$0-1]));
		break;
		case 357:
		this.$ = yy.addDataToNode(yy, _$[$0-5], $$[$0-5], _$[$0], $$[$0], true)(new yy.Switch(null,
					$$[$0-3],
					yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0-1], $$[$0-1], true)($$[$0-1])));
		break;
		case 360:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.SwitchWhen($$[$0-1],
					$$[$0]));
		break;
		case 361:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], false)(yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0-1], $$[$0-1], true)(new yy.SwitchWhen($$[$0-2],
					$$[$0-1])));
		break;
		case 362: case 368:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.If($$[$0-1],
					$$[$0],
					{
							type: $$[$0-2]
						}));
		break;
		case 363: case 369:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)($$[$0-4].addElse(yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.If($$[$0-1],
					$$[$0],
					{
							type: $$[$0-2]
						}))));
		break;
		case 365: case 371:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)($$[$0-2].addElse($$[$0]));
		break;
		case 366: case 367: case 372: case 373:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.If($$[$0],
					yy.addDataToNode(yy, _$[$0-2], $$[$0-2], null, null, true)(yy.Block.wrap([$$[$0-2]])),
					{
							type: $$[$0-1],
							postfix: true
						}));
		break;
		case 377:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Op($$[$0-1].toString(),
					$$[$0],
					void 0,
					void 0,
					{
							originalOperator: $$[$0-1].original
						}));
		break;
		case 380:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Op('-',
					$$[$0]));
		break;
		case 381:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Op('+',
					$$[$0]));
		break;
		case 384:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Op('--',
					$$[$0]));
		break;
		case 385:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Op('++',
					$$[$0]));
		break;
		case 386:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Op('--',
					$$[$0-1],
					null,
					true));
		break;
		case 387:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Op('++',
					$$[$0-1],
					null,
					true));
		break;
		case 388:
		this.$ = yy.addDataToNode(yy, _$[$0-1], $$[$0-1], _$[$0], $$[$0], true)(new yy.Existence($$[$0-1]));
		break;
		case 389:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Op('+',
					$$[$0-2],
					$$[$0]));
		break;
		case 390:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Op('-',
					$$[$0-2],
					$$[$0]));
		break;
		case 391: case 392: case 393: case 395: case 396: case 397: case 400:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Op($$[$0-1],
					$$[$0-2],
					$$[$0]));
		break;
		case 394: case 398: case 399:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Op($$[$0-1].toString(),
					$$[$0-2],
					$$[$0],
					void 0,
					{
							originalOperator: $$[$0-1].original
						}));
		break;
		case 401:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)((function() {
						var ref,
					ref1;
						return new yy.Op($$[$0-1].toString(),
					$$[$0-2],
					$$[$0],
					void 0,
					{
							invertOperator: (ref = (ref1 = $$[$0-1].invert) != null ? ref1.original : void 0) != null ? ref : $$[$0-1].invert
						});
					}()));
		break;
		case 402:
		this.$ = yy.addDataToNode(yy, _$[$0-2], $$[$0-2], _$[$0], $$[$0], true)(new yy.Assign($$[$0-2],
					$$[$0],
					$$[$0-1].toString(),
					{
							originalContext: $$[$0-1].original
						}));
		break;
		case 403:
		this.$ = yy.addDataToNode(yy, _$[$0-4], $$[$0-4], _$[$0], $$[$0], true)(new yy.Assign($$[$0-4],
					$$[$0-1],
					$$[$0-3].toString(),
					{
							originalContext: $$[$0-3].original
						}));
		break;
		case 404:
		this.$ = yy.addDataToNode(yy, _$[$0-3], $$[$0-3], _$[$0], $$[$0], true)(new yy.Assign($$[$0-3],
					$$[$0],
					$$[$0-2].toString(),
					{
							originalContext: $$[$0-2].original
						}));
		break;
		}
		},
		table: [{1:[2,1],3:1,4:2,5:3,7:4,8:5,9:6,10:7,11:27,12:28,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$V1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vk,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{1:[3]},{1:[2,2],6:$VM},o($VN,[2,3]),o($VO,[2,6],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($VO,[2,7]),o($VO,[2,8],{167:123,160:125,163:126,157:$VP,159:$VQ,165:$VR,183:$V51}),o($VO,[2,9]),o($V61,[2,16],{83:127,86:128,113:134,46:$V71,47:$V71,136:$V71,105:$V81,106:$V91,110:$Va1,111:$Vb1,112:$Vc1,115:$Vd1,135:$Ve1}),o($V61,[2,17],{113:134,86:137,105:$V81,106:$V91,110:$Va1,111:$Vb1,112:$Vc1,115:$Vd1}),o($V61,[2,18]),o($V61,[2,19]),o($V61,[2,20]),o($V61,[2,21]),o($V61,[2,22]),o($V61,[2,23]),o($V61,[2,24]),o($V61,[2,25]),o($V61,[2,26]),o($V61,[2,27]),o($VO,[2,28]),o($VO,[2,29]),o($VO,[2,30]),o($Vf1,[2,12]),o($Vf1,[2,13]),o($Vf1,[2,14]),o($Vf1,[2,15]),o($VO,[2,10]),o($VO,[2,11]),o($Vg1,$Vh1,{66:[1,138]}),o($Vg1,[2,130]),o($Vg1,[2,131]),o($Vg1,[2,132]),o($Vg1,$Vi1),o($Vg1,[2,134]),o($Vg1,[2,135]),o($Vg1,[2,136]),o($Vg1,[2,137]),o($Vj1,$Vk1,{90:139,97:140,98:141,38:143,72:144,99:145,34:146,39:$V2,40:$V3,73:$Vl1,75:$Vm1,76:$Vn1,117:$Vq}),{5:150,7:4,8:5,9:6,10:7,11:27,12:28,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$V1,33:$Vo1,34:66,37:149,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vk,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:152,8:153,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:157,8:158,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:159,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:167,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:168,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:169,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:$Vw1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:[1,171],88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{17:173,18:174,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:175,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:172,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,139:$Vu,154:$Vx,187:$Vv1},{17:173,18:174,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:175,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:176,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,139:$Vu,154:$Vx,187:$Vv1},o($Vx1,$Vy1,{191:[1,177],192:[1,178],205:[1,179]}),o($V61,[2,364],{178:[1,180]}),{33:$Vo1,37:181},{33:$Vo1,37:182},{33:$Vo1,37:183},o($V61,[2,293]),{33:$Vo1,37:184},{33:$Vo1,37:185},{7:186,8:187,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,33:[1,188],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vz1,[2,161],{58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,99:65,34:66,43:67,53:69,38:85,72:86,45:95,92:161,17:173,18:174,65:175,37:189,101:191,33:$Vo1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,121:[1,190],139:$Vu,154:$Vx,187:$Vv1}),{7:192,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:[1,193],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o([1,6,35,52,74,76,96,137,144,155,157,158,159,165,166,183,193,194,195,196,197,198,199,200,201,202,203,204],$VA1,{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,101:48,181:49,160:51,156:52,161:53,163:54,164:55,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,92:161,9:164,7:194,14:$V0,32:$Vp1,33:$VB1,36:$VC1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:[1,197],88:$Vq1,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,162:$VA,176:$VC,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),o($VO,[2,370],{178:[1,198]}),{18:200,29:199,89:$Vl,92:39,93:$Vm,94:$Vn},o([1,6,35,52,74,76,96,137,144,155,157,158,159,165,166,183],$VD1,{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,101:48,181:49,160:51,156:52,161:53,163:54,164:55,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,92:161,9:164,7:201,14:$V0,32:$Vp1,33:$VE1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,162:$VA,176:$VC,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),{38:207,39:$V2,40:$V3,45:203,46:$V5,47:$V6,117:[1,206],124:204,125:205,130:$VF1},{26:210,38:211,39:$V2,40:$V3,117:[1,209],120:$Vr,129:[1,212],133:[1,213]},o($Vx1,[2,127]),o($Vx1,[2,128]),o($Vg1,[2,52]),o($Vg1,[2,53]),o($Vg1,[2,54]),o($Vg1,[2,55]),o($Vg1,[2,56]),o($Vg1,[2,57]),o($Vg1,[2,58]),o($Vg1,[2,59]),{4:214,5:3,7:4,8:5,9:6,10:7,11:27,12:28,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$V1,33:[1,215],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vk,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:216,8:217,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,33:$VG1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,74:$VH1,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,96:$VJ1,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,140:219,141:220,145:225,146:222,147:221,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{83:228,105:$VK1,106:$VL1,135:$Ve1,136:$V71},{84:231,136:$VM1},o($Vg1,[2,226]),o($Vg1,$VN1,{41:233,42:$VO1}),{105:[1,235]},{105:[1,236]},o($VP1,[2,102]),o($VP1,[2,103]),o($VQ1,[2,122]),o($VQ1,[2,125]),{7:237,8:238,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:239,8:240,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:241,8:242,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:244,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:$Vo1,34:66,37:243,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{34:253,38:250,39:$V2,40:$V3,72:251,73:$Vf,75:$Vm1,88:$VR1,99:252,102:245,117:$Vq,170:246,171:$VS1,172:249},{168:254,169:255,173:[1,256],174:[1,257],175:[1,258]},o([6,33,96,119],$VT1,{45:95,118:259,67:260,68:261,69:262,71:263,43:266,77:268,38:269,41:270,72:271,78:272,34:273,79:274,80:275,81:276,39:$V2,40:$V3,42:$VO1,44:$V4,46:$V5,47:$V6,73:$VU1,75:$VV1,76:$VW1,82:$VX1,85:$VY1,117:$Vq,139:$Vu,154:$Vx}),o($VZ1,[2,40]),o($VZ1,[2,41]),o($Vg1,[2,50]),{17:173,18:174,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:279,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:175,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:280,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,139:$Vu,154:$Vx,187:$Vv1},o($V_1,[2,37]),o($V_1,[2,38]),o($V$1,[2,42]),{45:284,46:$V5,47:$V6,48:281,50:282,51:$V02},o($VN,[2,5],{7:4,8:5,9:6,10:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,13:23,15:25,16:26,11:27,12:28,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,92:39,101:48,181:49,160:51,156:52,161:53,163:54,164:55,184:60,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,5:285,14:$V0,32:$V1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:$Vj,88:$Vk,89:$Vl,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$Vy,159:$Vz,162:$VA,165:$VB,176:$VC,182:$VD,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),o($V61,[2,388]),{7:286,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:287,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:288,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:289,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:290,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:291,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:292,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:293,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:294,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:295,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:296,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:297,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:298,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:299,8:300,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V61,[2,292]),o($V61,[2,297]),{7:239,8:301,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:241,8:302,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{34:253,38:250,39:$V2,40:$V3,72:251,73:$Vf,75:$Vm1,88:$VR1,99:252,102:303,117:$Vq,170:246,171:$VS1,172:249},{168:254,173:[1,304],174:[1,305],175:[1,306]},{7:307,8:308,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V61,[2,291]),o($V61,[2,296]),{45:309,46:$V5,47:$V6,84:310,136:$VM1},o($VQ1,[2,123]),o($V12,[2,223]),{41:311,42:$VO1},{41:312,42:$VO1},o($VQ1,[2,147],{41:313,42:$VO1}),o($VQ1,[2,148],{41:314,42:$VO1}),o($VQ1,[2,149]),{7:317,8:319,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,33:[1,316],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$V22,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,114:315,116:318,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,143:320,144:$V32,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{106:$V91,113:323,115:$Vd1},o($VQ1,[2,124]),{6:[1,325],7:324,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:[1,326],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V42,$V52,{95:329,91:[1,327],96:$V62}),o($V72,[2,107]),o($V72,[2,111],{66:[1,331],76:[1,330]}),o($V72,[2,115],{38:143,72:144,99:145,34:146,98:332,39:$V2,40:$V3,73:$Vl1,75:$Vm1,117:$Vq}),o($V82,[2,116]),o($V82,[2,117]),o($V82,[2,118]),o($V82,[2,119]),{41:233,42:$VO1},{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,33:$VG1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,74:$VH1,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,96:$VJ1,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,140:219,141:220,145:225,146:222,147:221,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vg1,[2,99]),o($VO,[2,101]),{4:336,5:3,7:4,8:5,9:6,10:7,11:27,12:28,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$V1,34:66,35:[1,335],38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vk,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V92,$Va2,{160:118,163:119,167:123,193:$VV}),o($VO,[2,374]),{7:169,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:$Vw1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{157:$VP,159:$VQ,160:125,163:126,165:$VR,167:123,183:$V51},o([1,6,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,193,194,195,196,197,198,199,200,201,202,203,204],$VA1,{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,101:48,181:49,160:51,156:52,161:53,163:54,164:55,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,92:161,9:164,7:194,14:$V0,32:$Vp1,33:$VB1,36:$VC1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,162:$VA,176:$VC,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),o($V92,$Vb2,{160:118,163:119,167:123,193:$VV}),o($VO,[2,375]),o($Vc2,[2,379],{160:118,163:119,167:123,193:$VV,195:$VX}),o($Vj1,$Vk1,{97:140,98:141,38:143,72:144,99:145,34:146,90:338,39:$V2,40:$V3,73:$Vl1,75:$Vm1,76:$Vn1,117:$Vq}),{33:$Vo1,37:149},{7:339,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:340,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{157:$VP,159:$VQ,160:125,163:126,165:$VR,167:123,183:[1,341]},{18:200,89:$Vr1,92:161,93:$Vm,94:$Vn},{7:342,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vc2,[2,380],{160:118,163:119,167:123,193:$VV,195:$VX}),o($Vc2,[2,381],{160:118,163:119,167:123,193:$VV,195:$VX}),o($V92,[2,382],{160:118,163:119,167:123,193:$VV}),{34:343,117:$Vq},o($VO,[2,97],{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,101:48,181:49,160:51,156:52,161:53,163:54,164:55,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,92:161,9:164,7:344,14:$V0,32:$Vp1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$VD1,159:$VD1,165:$VD1,183:$VD1,162:$VA,176:$VC,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),o($V61,[2,384],{46:$Vy1,47:$Vy1,105:$Vy1,106:$Vy1,110:$Vy1,111:$Vy1,112:$Vy1,115:$Vy1,135:$Vy1,136:$Vy1}),o($V12,$V71,{83:127,86:128,113:134,105:$V81,106:$V91,110:$Va1,111:$Vb1,112:$Vc1,115:$Vd1,135:$Ve1}),{86:137,105:$V81,106:$V91,110:$Va1,111:$Vb1,112:$Vc1,113:134,115:$Vd1},o($Vd2,$Vh1),o($V61,[2,385],{46:$Vy1,47:$Vy1,105:$Vy1,106:$Vy1,110:$Vy1,111:$Vy1,112:$Vy1,115:$Vy1,135:$Vy1,136:$Vy1}),o($V61,[2,386]),o($V61,[2,387]),{6:[1,347],7:345,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:[1,346],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{33:$Vo1,37:348,182:[1,349]},o($V61,[2,268],{150:350,151:[1,351],152:[1,352]}),o($V61,[2,289]),o($V61,[2,290]),o($V61,[2,298]),o($V61,[2,299]),{33:[1,353],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[1,354]},{177:355,179:356,180:$Ve2},o($V61,[2,162]),{7:358,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vz1,[2,165],{37:359,33:$Vo1,46:$Vy1,47:$Vy1,105:$Vy1,106:$Vy1,110:$Vy1,111:$Vy1,112:$Vy1,115:$Vy1,135:$Vy1,136:$Vy1,121:[1,360]}),o($Vf2,[2,275],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{34:361,117:$Vq},o($Vf2,[2,32],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{34:362,117:$Vq},{7:363,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o([1,6,35,52,74,76,96,137,144,155,158,166],[2,95],{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,101:48,181:49,160:51,156:52,161:53,163:54,164:55,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,92:161,9:164,7:364,14:$V0,32:$Vp1,33:$VE1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$VD1,159:$VD1,165:$VD1,183:$VD1,162:$VA,176:$VC,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),{33:$Vo1,37:365,182:[1,366]},o($VO,[2,376]),o($Vg1,[2,405]),o($Vf1,$Vg2,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{34:367,117:$Vq},o($Vf1,[2,169],{123:[1,368]}),{36:[1,369],96:[1,370]},{36:[1,371]},{33:$Vh2,38:376,39:$V2,40:$V3,119:[1,372],126:373,127:374,129:$Vi2},o([36,96],[2,192]),{128:[1,378]},{33:$Vj2,38:383,39:$V2,40:$V3,119:[1,379],129:$Vk2,132:380,134:381},o($Vf1,[2,196]),{66:[1,385]},{7:386,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:[1,387],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{36:[1,388]},{6:$VM,155:[1,389]},{4:390,5:3,7:4,8:5,9:6,10:7,11:27,12:28,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$V1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vk,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vl2,$Vm2,{160:118,163:119,167:123,143:391,76:[1,392],144:$V32,157:$VP,159:$VQ,165:$VR,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vl2,$Vn2,{143:393,76:$V22,144:$V32}),o($Vo2,[2,229]),{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,74:[1,394],75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,96:$VJ1,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,145:396,147:395,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o([6,33,74],$V52,{142:397,95:399,96:$Vp2}),o($Vq2,[2,260],{6:$Vr2}),o($Vs2,[2,251]),{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,33:$VG1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,96:$VJ1,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,140:402,141:401,145:225,146:222,147:221,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vt2,[2,262]),o($Vs2,[2,256]),o($Vu2,[2,249]),o($Vu2,[2,250],{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,101:48,181:49,160:51,156:52,161:53,163:54,164:55,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,92:161,9:164,7:403,14:$V0,32:$Vp1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$Vy,159:$Vz,162:$VA,165:$VB,176:$VC,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),{84:404,136:$VM1},{41:405,42:$VO1},{7:406,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:[1,407],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vv2,[2,221]),{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,33:$Vw2,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,137:[1,408],138:409,139:$Vu,145:410,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vx2,[2,228]),o($Vx2,[2,39]),{41:412,42:$VO1},{41:413,42:$VO1},{33:$Vo1,37:414,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:$Vo1,37:415},o($Vy2,[2,283],{160:118,163:119,167:123,157:$VP,158:[1,416],159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{33:[2,279],158:[1,417]},o($Vy2,[2,286],{160:118,163:119,167:123,157:$VP,158:[1,418],159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{33:[2,281],158:[1,419]},o($V61,[2,294]),o($Vz2,[2,295],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{33:$VA2,166:[1,420]},o($VB2,[2,305]),{34:253,38:250,39:$V2,40:$V3,72:251,73:$Vl1,75:$Vm1,99:252,117:$Vq,170:421,172:249},{34:253,38:250,39:$V2,40:$V3,72:251,73:$Vl1,75:$Vm1,99:252,117:$Vq,170:422,172:249},o($VB2,[2,312],{96:[1,423]}),o($VC2,[2,308]),o($VC2,[2,309]),o($VC2,[2,310]),o($VC2,[2,311]),o($V61,[2,302]),{33:[2,304]},{7:424,8:425,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:426,8:427,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:428,8:429,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VD2,$V52,{95:430,96:$VE2}),o($VF2,[2,157]),o($VF2,[2,63],{70:[1,432]}),o($VF2,[2,64]),o($VG2,[2,72],{113:134,83:435,86:436,66:[1,433],76:[1,434],105:$V81,106:$V91,110:$Va1,111:$Vb1,112:$Vc1,115:$Vd1,135:$Ve1,136:$V71}),{7:437,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o([76,105,106,110,111,112,115,135,136],$VN1,{41:233,42:$VO1,73:[1,438]}),o($VG2,[2,75]),{34:273,38:269,39:$V2,40:$V3,41:270,42:$VO1,71:439,72:271,75:$Vg,77:440,78:272,79:274,80:275,81:276,82:$VX1,85:$VY1,117:$Vq,139:$Vu,154:$Vx},{76:[1,441],83:442,86:443,105:$V81,106:$V91,110:$Va1,111:$Vb1,112:$Vc1,113:134,115:$Vd1,135:$Ve1,136:$V71},o($VH2,[2,69]),o($VH2,[2,70]),o($VH2,[2,71]),o($VI2,[2,80]),o($VI2,[2,81]),o($VI2,[2,82]),o($VI2,[2,83]),o($VI2,[2,84]),{83:444,105:$VK1,106:$VL1,135:$Ve1,136:$V71},{84:445,136:$VM1},o($Vd2,$Vi1,{57:[1,446]}),o($Vd2,$Vy1),{45:284,46:$V5,47:$V6,49:[1,447],50:448,51:$V02},o($VJ2,[2,44]),{4:449,5:3,7:4,8:5,9:6,10:7,11:27,12:28,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$V1,33:[1,450],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,52:[1,451],53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vk,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VJ2,[2,49]),o($VN,[2,4]),o($VK2,[2,389],{160:118,163:119,167:123,193:$VV,194:$VW,195:$VX}),o($VK2,[2,390],{160:118,163:119,167:123,193:$VV,194:$VW,195:$VX}),o($Vc2,[2,391],{160:118,163:119,167:123,193:$VV,195:$VX}),o($Vc2,[2,392],{160:118,163:119,167:123,193:$VV,195:$VX}),o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,196,197,198,199,200,201,202,203,204],[2,393],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX}),o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,197,198,199,200,201,202,203],[2,394],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,204:$V41}),o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,198,199,200,201,202,203],[2,395],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,204:$V41}),o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,199,200,201,202,203],[2,396],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,204:$V41}),o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,200,201,202,203],[2,397],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,204:$V41}),o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,201,202,203],[2,398],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,204:$V41}),o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,202,203],[2,399],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,204:$V41}),o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,203],[2,400],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,204:$V41}),o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,166,183,197,198,199,200,201,202,203,204],[2,401],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY}),o($Vz2,$VL2,{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($VO,[2,373]),{158:[1,452]},{158:[1,453]},o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,158,159,165,183,189,190,193,194,195,196,197,198,199,200,201,202,203,204],$VA2,{166:[1,454]}),{7:455,8:456,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:457,8:458,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:459,8:460,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vz2,$VM2,{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($VO,[2,372]),o($Vv2,[2,218]),o($Vv2,[2,219]),o($VQ1,[2,143]),o($VQ1,[2,144]),o($VQ1,[2,145]),o($VQ1,[2,146]),{107:[1,461]},{7:317,8:319,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$V22,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,114:462,116:318,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,143:320,144:$V32,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VN2,[2,153],{160:118,163:119,167:123,143:463,76:$V22,144:$V32,157:$VP,159:$VQ,165:$VR,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($VN2,[2,154]),{76:$V22,143:464,144:$V32},o($VN2,[2,241],{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,101:48,181:49,160:51,156:52,161:53,163:54,164:55,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,92:161,9:164,7:465,14:$V0,32:$Vp1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$Vy,159:$Vz,162:$VA,165:$VB,176:$VC,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),o($VO2,[2,232]),o($VO2,$VP2),o($VQ1,[2,152]),o($Vf2,[2,60],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{7:466,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:467,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{92:468,93:$Vm,94:$Vn},o($VQ2,$VR2,{98:141,38:143,72:144,99:145,34:146,97:469,39:$V2,40:$V3,73:$Vl1,75:$Vm1,76:$Vn1,117:$Vq}),{6:$VS2,33:$VT2},o($V72,[2,112]),{7:472,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V72,[2,113]),o($Vu2,$Vm2,{160:118,163:119,167:123,76:[1,473],157:$VP,159:$VQ,165:$VR,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vu2,$Vn2),o($VU2,[2,35]),{6:$VM,35:[1,474]},{7:475,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V42,$V52,{95:329,91:[1,476],96:$V62}),o($V92,$Va2,{160:118,163:119,167:123,193:$VV}),o($V92,$Vb2,{160:118,163:119,167:123,193:$VV}),{7:477,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{33:$Vo1,37:414,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{35:[1,478]},o($VO,[2,96],{160:118,163:119,167:123,157:$Vg2,159:$Vg2,165:$Vg2,183:$Vg2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,[2,402],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{7:479,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:480,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V61,[2,365]),{7:481,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V61,[2,269],{151:[1,482]}),{33:$Vo1,37:483},{33:$Vo1,34:485,37:486,38:484,39:$V2,40:$V3,117:$Vq},{177:487,179:356,180:$Ve2},{177:488,179:356,180:$Ve2},{35:[1,489],178:[1,490],179:491,180:$Ve2},o($VW2,[2,358]),{7:493,8:494,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,148:492,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VX2,[2,163],{160:118,163:119,167:123,37:495,33:$Vo1,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($V61,[2,166]),{7:496,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{35:[1,497]},{35:[1,498]},o($Vf2,[2,34],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($VO,[2,94],{160:118,163:119,167:123,157:$Vg2,159:$Vg2,165:$Vg2,183:$Vg2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($VO,[2,371]),{7:500,8:499,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{35:[1,501]},{34:502,117:$Vq},{45:503,46:$V5,47:$V6},{117:[1,505],125:504,130:$VF1},{45:506,46:$V5,47:$V6},{36:[1,507]},o($VD2,$V52,{95:508,96:$VY2}),o($VF2,[2,183]),{33:$Vh2,38:376,39:$V2,40:$V3,126:510,127:374,129:$Vi2},o($VF2,[2,188],{128:[1,511]}),o($VF2,[2,190],{128:[1,512]}),{38:513,39:$V2,40:$V3},o($Vf1,[2,194],{36:[1,514]}),o($VD2,$V52,{95:515,96:$VZ2}),o($VF2,[2,208]),{33:$Vj2,38:383,39:$V2,40:$V3,129:$Vk2,132:517,134:381},o($VF2,[2,213],{128:[1,518]}),o($VF2,[2,216],{128:[1,519]}),{6:[1,521],7:520,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:[1,522],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V_2,[2,200],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{34:523,117:$Vq},{45:524,46:$V5,47:$V6},o($Vg1,[2,277]),{6:$VM,35:[1,525]},{7:526,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o([14,32,39,40,44,46,47,54,55,59,60,61,62,63,64,73,75,82,85,87,88,89,93,94,108,109,117,120,122,131,139,149,153,154,157,159,162,165,176,182,185,186,187,188,189,190,191,192],$VP2,{6:$V$2,33:$V$2,74:$V$2,96:$V$2}),{7:527,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vo2,[2,230]),o($Vq2,[2,261],{6:$Vr2}),o($Vs2,[2,257]),{33:$V03,74:[1,528]},o([6,33,35,74],$VR2,{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,92:39,101:48,181:49,160:51,156:52,161:53,163:54,164:55,184:60,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,9:155,147:221,145:225,100:226,7:333,8:334,146:530,140:531,14:$V0,32:$Vp1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,76:$VI1,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,93:$Vm,94:$Vn,96:$VJ1,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$Vy,159:$Vz,162:$VA,165:$VB,176:$VC,182:$VD,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),o($V13,[2,258],{6:[1,532]}),o($Vt2,[2,263]),o($VQ2,$V52,{95:399,142:533,96:$Vp2}),{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,96:$VJ1,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,145:396,147:395,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vu2,[2,121],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vv2,[2,220]),o($Vg1,[2,138]),{107:[1,534],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{7:535,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vv2,[2,224]),o([6,33,137],$V52,{95:536,96:$V23}),o($V33,[2,242]),{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,33:$Vw2,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,138:538,139:$Vu,145:410,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vg1,[2,141]),o($Vg1,[2,142]),o($V43,[2,362]),o($V53,[2,368]),{7:539,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:540,8:541,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:542,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:543,8:544,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:545,8:546,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VB2,[2,306]),o($VB2,[2,307]),{34:253,38:250,39:$V2,40:$V3,72:251,73:$Vl1,75:$Vm1,99:252,117:$Vq,172:547},{33:$V63,157:$VP,158:[1,548],159:$VQ,160:118,163:119,165:$VR,166:[1,549],167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,333],158:[1,550],166:[1,551]},{33:$V73,157:$VP,158:[1,552],159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,334],158:[1,553]},{33:$V83,157:$VP,158:[1,554],159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,349],158:[1,555]},{6:$V93,33:$Va3,119:[1,556]},o($Vb3,$VR2,{45:95,68:261,69:262,71:263,43:266,77:268,38:269,41:270,72:271,78:272,34:273,79:274,80:275,81:276,67:559,39:$V2,40:$V3,42:$VO1,44:$V4,46:$V5,47:$V6,73:$VU1,75:$VV1,76:$VW1,82:$VX1,85:$VY1,117:$Vq,139:$Vu,154:$Vx}),{7:560,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:[1,561],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:562,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,33:[1,563],34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VF2,[2,76]),{84:564,136:$VM1},o($VI2,[2,89]),{74:[1,565],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{7:566,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VF2,[2,77],{113:134,83:435,86:436,105:$V81,106:$V91,110:$Va1,111:$Vb1,112:$Vc1,115:$Vd1,135:$Ve1,136:$V71}),o($VF2,[2,79],{113:134,83:442,86:443,105:$V81,106:$V91,110:$Va1,111:$Vb1,112:$Vc1,115:$Vd1,135:$Ve1,136:$V71}),o($VF2,[2,78]),{84:567,136:$VM1},o($VI2,[2,90]),{84:568,136:$VM1},o($VI2,[2,86]),o($Vg1,[2,51]),o($V$1,[2,43]),o($VJ2,[2,45]),{6:$VM,52:[1,569]},{4:570,5:3,7:4,8:5,9:6,10:7,11:27,12:28,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$V1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vk,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VJ2,[2,48]),{7:571,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:572,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:573,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o([1,6,33,35,52,74,76,91,96,107,119,137,144,155,157,159,165,183],$V63,{160:118,163:119,167:123,158:[1,574],166:[1,575],189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{158:[1,576],166:[1,577]},o($Vc3,$V73,{160:118,163:119,167:123,158:[1,578],189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{158:[1,579]},o($Vc3,$V83,{160:118,163:119,167:123,158:[1,580],189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{158:[1,581]},o($VQ1,[2,150]),{35:[1,582]},o($VN2,[2,237],{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,101:48,181:49,160:51,156:52,161:53,163:54,164:55,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,92:161,9:164,7:583,14:$V0,32:$Vp1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$Vy,159:$Vz,162:$VA,165:$VB,176:$VC,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),o($VN2,[2,239],{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,101:48,181:49,160:51,156:52,161:53,163:54,164:55,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,92:161,9:164,7:584,14:$V0,32:$Vp1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$Vy,159:$Vz,162:$VA,165:$VB,176:$VC,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),o($VN2,[2,240],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,[2,61],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{35:[1,585],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{5:587,7:4,8:5,9:6,10:7,11:27,12:28,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$V1,33:$Vo1,34:66,37:586,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vk,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V72,[2,108]),{34:146,38:143,39:$V2,40:$V3,72:144,73:$Vl1,75:$Vm1,76:$Vn1,97:588,98:141,99:145,117:$Vq},o($Vd3,$Vk1,{97:140,98:141,38:143,72:144,99:145,34:146,90:589,39:$V2,40:$V3,73:$Vl1,75:$Vm1,76:$Vn1,117:$Vq}),o($V72,[2,114],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vu2,$V$2),o($VU2,[2,36]),o($Vz2,$VL2,{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{92:590,93:$Vm,94:$Vn},o($Vz2,$VM2,{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($V61,[2,383]),{35:[1,591],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},o($Vf2,[2,404],{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{33:$Vo1,37:592,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:$Vo1,37:593},o($V61,[2,270]),{33:$Vo1,37:594},{33:$Vo1,37:595},o($Ve3,[2,274]),{35:[1,596],178:[1,597],179:491,180:$Ve2},{35:[1,598],178:[1,599],179:491,180:$Ve2},o($V61,[2,356]),{33:$Vo1,37:600},o($VW2,[2,359]),{33:$Vo1,37:601,96:[1,602]},o($Vf3,[2,264],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf3,[2,265]),o($V61,[2,164]),o($VX2,[2,167],{160:118,163:119,167:123,37:603,33:$Vo1,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($V61,[2,276]),o($V61,[2,33]),{33:$Vo1,37:604},{157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},o($Vf1,[2,92]),o($Vf1,[2,170]),o($Vf1,[2,171],{123:[1,605]}),{36:[1,606]},{33:$Vh2,38:376,39:$V2,40:$V3,126:607,127:374,129:$Vi2},o($Vf1,[2,173],{123:[1,608]}),{45:609,46:$V5,47:$V6},{6:$Vg3,33:$Vh3,119:[1,610]},o($Vb3,$VR2,{38:376,127:613,39:$V2,40:$V3,129:$Vi2}),o($VQ2,$V52,{95:614,96:$VY2}),{38:615,39:$V2,40:$V3},{38:616,39:$V2,40:$V3},{36:[2,193]},{45:617,46:$V5,47:$V6},{6:$Vi3,33:$Vj3,119:[1,618]},o($Vb3,$VR2,{38:383,134:621,39:$V2,40:$V3,129:$Vk2}),o($VQ2,$V52,{95:622,96:$VZ2}),{38:623,39:$V2,40:$V3,129:[1,624]},{38:625,39:$V2,40:$V3},o($V_2,[2,197],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{7:626,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:627,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{35:[1,628]},o($Vf1,[2,202],{123:[1,629]}),{155:[1,630]},{74:[1,631],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{74:[1,632],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},o($Vo2,[2,231]),{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,33:$VG1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,96:$VJ1,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,140:402,141:633,145:225,146:222,147:221,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vs2,[2,252]),o($V13,[2,259],{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,92:39,101:48,181:49,160:51,156:52,161:53,163:54,164:55,184:60,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,9:155,100:226,7:333,8:334,147:395,145:396,14:$V0,32:$Vp1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,76:$VI1,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,93:$Vm,94:$Vn,96:$VJ1,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$Vy,159:$Vz,162:$VA,165:$VB,176:$VC,182:$VD,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,96:$VJ1,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,140:402,145:225,146:634,147:221,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{33:$V03,35:[1,635]},o($Vg1,[2,139]),{35:[1,636],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{6:$Vk3,33:$Vl3,137:[1,637]},o([6,33,35,137],$VR2,{17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,13:23,15:25,16:26,65:29,58:30,79:31,102:32,56:33,103:34,81:35,80:36,104:37,92:39,101:48,181:49,160:51,156:52,161:53,163:54,164:55,184:60,99:65,34:66,43:67,53:69,38:85,72:86,167:92,45:95,9:155,100:226,7:333,8:334,145:640,14:$V0,32:$Vp1,39:$V2,40:$V3,44:$V4,46:$V5,47:$V6,54:$V7,55:$V8,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,73:$Vf,75:$Vg,76:$VI1,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,93:$Vm,94:$Vn,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,157:$Vy,159:$Vz,162:$VA,165:$VB,176:$VC,182:$VD,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL}),o($VQ2,$V52,{95:641,96:$V23}),o($Vz2,[2,284],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{33:$Vm3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,280]},o($Vz2,[2,287],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{33:$Vn3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,282]},{33:$Vo3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,303]},o($VB2,[2,313]),{7:642,8:643,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:644,8:645,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:646,8:647,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:648,8:649,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:650,8:651,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:652,8:653,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:654,8:655,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:656,8:657,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($Vo2,[2,155]),{34:273,38:269,39:$V2,40:$V3,41:270,42:$VO1,43:266,44:$V4,45:95,46:$V5,47:$V6,67:658,68:261,69:262,71:263,72:271,73:$VU1,75:$VV1,76:$VW1,77:268,78:272,79:274,80:275,81:276,82:$VX1,85:$VY1,117:$Vq,139:$Vu,154:$Vx},o($Vd3,$VT1,{45:95,67:260,68:261,69:262,71:263,43:266,77:268,38:269,41:270,72:271,78:272,34:273,79:274,80:275,81:276,118:659,39:$V2,40:$V3,42:$VO1,44:$V4,46:$V5,47:$V6,73:$VU1,75:$VV1,76:$VW1,82:$VX1,85:$VY1,117:$Vq,139:$Vu,154:$Vx}),o($VF2,[2,158]),o($VF2,[2,65],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{7:660,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VF2,[2,67],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{7:661,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($VI2,[2,87]),o($VG2,[2,73]),{74:[1,662],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},o($VI2,[2,88]),o($VI2,[2,85]),o($VJ2,[2,46]),{6:$VM,35:[1,663]},o($Vz2,$Vm3,{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vz2,$Vn3,{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vz2,$Vo3,{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{7:664,8:665,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:666,8:667,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:668,8:669,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:670,8:671,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:672,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:673,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:674,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:675,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{107:[1,676]},o($VN2,[2,236],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($VN2,[2,238],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($V61,[2,62]),o($Vg1,[2,98]),o($VO,[2,100]),o($V72,[2,109]),o($VQ2,$V52,{95:677,96:$V62}),{33:$Vo1,37:586},o($V61,[2,403]),o($V43,[2,363]),o($V61,[2,271]),o($Ve3,[2,272]),o($Ve3,[2,273]),o($V61,[2,352]),{33:$Vo1,37:678},o($V61,[2,353]),{33:$Vo1,37:679},{35:[1,680]},o($VW2,[2,360],{6:[1,681]}),{7:682,8:683,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V61,[2,168]),o($V53,[2,369]),{34:684,117:$Vq},{45:685,46:$V5,47:$V6},o($VD2,$V52,{95:686,96:$VY2}),{34:687,117:$Vq},o($Vf1,[2,175],{123:[1,688]}),{36:[1,689]},{38:376,39:$V2,40:$V3,127:690,129:$Vi2},{33:$Vh2,38:376,39:$V2,40:$V3,126:691,127:374,129:$Vi2},o($VF2,[2,184]),{6:$Vg3,33:$Vh3,35:[1,692]},o($VF2,[2,189]),o($VF2,[2,191]),o($Vf1,[2,204],{123:[1,693]}),o($Vf1,[2,195],{36:[1,694]}),{38:383,39:$V2,40:$V3,129:$Vk2,134:695},{33:$Vj2,38:383,39:$V2,40:$V3,129:$Vk2,132:696,134:381},o($VF2,[2,209]),{6:$Vi3,33:$Vj3,35:[1,697]},o($VF2,[2,214]),o($VF2,[2,215]),o($VF2,[2,217]),o($V_2,[2,198],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{35:[1,698],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},o($Vf1,[2,201]),{34:699,117:$Vq},o($Vg1,[2,278]),o($Vg1,[2,234]),o($Vg1,[2,235]),o($VQ2,$V52,{95:399,142:700,96:$Vp2}),o($Vs2,[2,253]),o($Vs2,[2,254]),{107:[1,701]},o($Vv2,[2,225]),{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,145:702,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:333,8:334,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,33:$Vw2,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,76:$VI1,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,100:226,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,138:703,139:$Vu,145:410,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V33,[2,243]),{6:$Vk3,33:$Vl3,35:[1,704]},{33:$Vp3,157:$VP,159:$VQ,160:118,163:119,165:$VR,166:[1,705],167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,335],166:[1,706]},{33:$Vq3,157:$VP,158:[1,707],159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,339],158:[1,708]},{33:$Vr3,157:$VP,159:$VQ,160:118,163:119,165:$VR,166:[1,709],167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,336],166:[1,710]},{33:$Vs3,157:$VP,158:[1,711],159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,340],158:[1,712]},{33:$Vt3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,337]},{33:$Vu3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,338]},{33:$Vv3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,350]},{33:$Vw3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,351]},o($VF2,[2,159]),o($VQ2,$V52,{95:713,96:$VE2}),{35:[1,714],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{35:[1,715],157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VV2,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},o($VG2,[2,74]),{52:[1,716]},o($Vx3,$Vp3,{160:118,163:119,167:123,166:[1,717],189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{166:[1,718]},o($Vc3,$Vq3,{160:118,163:119,167:123,158:[1,719],189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{158:[1,720]},o($Vx3,$Vr3,{160:118,163:119,167:123,166:[1,721],189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{166:[1,722]},o($Vc3,$Vs3,{160:118,163:119,167:123,158:[1,723],189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),{158:[1,724]},o($Vf2,$Vt3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$Vu3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$Vv3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$Vw3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($VQ1,[2,151]),{6:$VS2,33:$VT2,35:[1,725]},{35:[1,726]},{35:[1,727]},o($V61,[2,357]),o($VW2,[2,361]),o($Vf3,[2,266],{160:118,163:119,167:123,157:$VP,159:$VQ,165:$VR,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf3,[2,267]),o($Vf1,[2,172]),o($Vf1,[2,179],{123:[1,728]}),{6:$Vg3,33:$Vh3,119:[1,729]},o($Vf1,[2,174]),{34:730,117:$Vq},{45:731,46:$V5,47:$V6},o($VF2,[2,185]),o($VQ2,$V52,{95:732,96:$VY2}),o($VF2,[2,186]),{34:733,117:$Vq},{45:734,46:$V5,47:$V6},o($VF2,[2,210]),o($VQ2,$V52,{95:735,96:$VZ2}),o($VF2,[2,211]),o($Vf1,[2,199]),o($Vf1,[2,203]),{33:$V03,35:[1,736]},o($Vg1,[2,140]),o($V33,[2,244]),o($VQ2,$V52,{95:737,96:$V23}),o($V33,[2,245]),{7:738,8:739,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:740,8:741,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:742,8:743,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:744,8:745,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:746,8:747,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:748,8:749,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:750,8:751,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:752,8:753,9:155,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,29:20,30:21,31:22,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vl,92:39,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$VD,184:60,185:$VE,186:$VF,187:$VG,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{6:$V93,33:$Va3,35:[1,754]},o($VF2,[2,66]),o($VF2,[2,68]),o($VJ2,[2,47]),{7:755,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:756,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:757,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:758,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:759,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:760,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:761,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},{7:762,9:164,13:23,14:$V0,15:25,16:26,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:19,32:$Vp1,34:66,38:85,39:$V2,40:$V3,43:67,44:$V4,45:95,46:$V5,47:$V6,53:69,54:$V7,55:$V8,56:33,58:30,59:$V9,60:$Va,61:$Vb,62:$Vc,63:$Vd,64:$Ve,65:29,72:86,73:$Vf,75:$Vg,79:31,80:36,81:35,82:$Vh,85:$Vi,87:$Vj,88:$Vq1,89:$Vr1,92:161,93:$Vm,94:$Vn,99:65,101:48,102:32,103:34,104:37,108:$Vo,109:$Vp,117:$Vq,120:$Vr,122:$Vs,131:$Vt,139:$Vu,149:$Vv,153:$Vw,154:$Vx,156:52,157:$Vy,159:$Vz,160:51,161:53,162:$VA,163:54,164:55,165:$VB,167:92,176:$VC,181:49,182:$Vs1,185:$Vt1,186:$Vu1,187:$Vv1,188:$VH,189:$VI,190:$VJ,191:$VK,192:$VL},o($V72,[2,110]),o($V61,[2,354]),o($V61,[2,355]),{34:763,117:$Vq},{36:[1,764]},o($Vf1,[2,176]),o($Vf1,[2,177],{123:[1,765]}),{6:$Vg3,33:$Vh3,35:[1,766]},o($Vf1,[2,205]),o($Vf1,[2,206],{123:[1,767]}),{6:$Vi3,33:$Vj3,35:[1,768]},o($Vs2,[2,255]),{6:$Vk3,33:$Vl3,35:[1,769]},{33:$Vy3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,341]},{33:$Vz3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,343]},{33:$VA3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,345]},{33:$VB3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,347]},{33:$VC3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,342]},{33:$VD3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,344]},{33:$VE3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,346]},{33:$VF3,157:$VP,159:$VQ,160:118,163:119,165:$VR,167:123,183:$VS,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41},{33:[2,348]},o($VF2,[2,160]),o($Vf2,$Vy3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$Vz3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$VA3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$VB3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$VC3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$VD3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$VE3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf2,$VF3,{160:118,163:119,167:123,189:$VT,190:$VU,193:$VV,194:$VW,195:$VX,196:$VY,197:$VZ,198:$V_,199:$V$,200:$V01,201:$V11,202:$V21,203:$V31,204:$V41}),o($Vf1,[2,180]),{45:770,46:$V5,47:$V6},{34:771,117:$Vq},o($VF2,[2,187]),{34:772,117:$Vq},o($VF2,[2,212]),o($V33,[2,246]),o($Vf1,[2,181],{123:[1,773]}),o($Vf1,[2,178]),o($Vf1,[2,207]),{34:774,117:$Vq},o($Vf1,[2,182])],
		defaultActions: {255:[2,304],513:[2,193],541:[2,280],544:[2,282],546:[2,303],651:[2,337],653:[2,338],655:[2,350],657:[2,351],739:[2,341],741:[2,343],743:[2,345],745:[2,347],747:[2,342],749:[2,344],751:[2,346],753:[2,348]},
		parseError: function parseError (str, hash) {
			if (hash.recoverable) {
				this.trace(str);
			} else {
				var error = new Error(str);
				error.hash = hash;
				throw error;
			}
		},
		parse: function parse(input) {
			var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
			var args = lstack.slice.call(arguments, 1);
			var lexer = Object.create(this.lexer);
			var sharedState = { yy: {} };
			for (var k in this.yy) {
				if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
					sharedState.yy[k] = this.yy[k];
				}
			}
			lexer.setInput(input, sharedState.yy);
			sharedState.yy.lexer = lexer;
			sharedState.yy.parser = this;
			if (typeof lexer.yylloc == 'undefined') {
				lexer.yylloc = {};
			}
			var yyloc = lexer.yylloc;
			lstack.push(yyloc);
			var ranges = lexer.options && lexer.options.ranges;
			if (typeof sharedState.yy.parseError === 'function') {
				this.parseError = sharedState.yy.parseError;
			} else {
				this.parseError = Object.getPrototypeOf(this).parseError;
			}
			function popStack(n) {
				stack.length = stack.length - 2 * n;
				vstack.length = vstack.length - n;
				lstack.length = lstack.length - n;
			}
			_token_stack:
				var lex = function () {
					var token;
					token = lexer.lex() || EOF;
					if (typeof token !== 'number') {
						token = self.symbols_[token] || token;
					}
					return token;
				};
			var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
			while (true) {
				state = stack[stack.length - 1];
				if (this.defaultActions[state]) {
					action = this.defaultActions[state];
				} else {
					if (symbol === null || typeof symbol == 'undefined') {
						symbol = lex();
					}
					action = table[state] && table[state][symbol];
				}
							if (typeof action === 'undefined' || !action.length || !action[0]) {
						var errStr = '';
						expected = [];
						for (p in table[state]) {
							if (this.terminals_[p] && p > TERROR) {
								expected.push('\'' + this.terminals_[p] + '\'');
							}
						}
						if (lexer.showPosition) {
							errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
						} else {
							errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
						}
						this.parseError(errStr, {
							text: lexer.match,
							token: this.terminals_[symbol] || symbol,
							line: lexer.yylineno,
							loc: yyloc,
							expected: expected
						});
					}
				if (action[0] instanceof Array && action.length > 1) {
					throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
				}
				switch (action[0]) {
				case 1:
					stack.push(symbol);
					vstack.push(lexer.yytext);
					lstack.push(lexer.yylloc);
					stack.push(action[1]);
					symbol = null;
					if (!preErrorSymbol) {
						yyleng = lexer.yyleng;
						yytext = lexer.yytext;
						yylineno = lexer.yylineno;
						yyloc = lexer.yylloc;
						if (recovering > 0) {
							recovering--;
						}
					} else {
						symbol = preErrorSymbol;
						preErrorSymbol = null;
					}
					break;
				case 2:
					len = this.productions_[action[1]][1];
					yyval.$ = vstack[vstack.length - len];
					yyval._$ = {
						first_line: lstack[lstack.length - (len || 1)].first_line,
						last_line: lstack[lstack.length - 1].last_line,
						first_column: lstack[lstack.length - (len || 1)].first_column,
						last_column: lstack[lstack.length - 1].last_column
					};
					if (ranges) {
						yyval._$.range = [
							lstack[lstack.length - (len || 1)].range[0],
							lstack[lstack.length - 1].range[1]
						];
					}
					r = this.performAction.apply(yyval, [
						yytext,
						yyleng,
						yylineno,
						sharedState.yy,
						action[1],
						vstack,
						lstack
					].concat(args));
					if (typeof r !== 'undefined') {
						return r;
					}
					if (len) {
						stack = stack.slice(0, -1 * len * 2);
						vstack = vstack.slice(0, -1 * len);
						lstack = lstack.slice(0, -1 * len);
					}
					stack.push(this.productions_[action[1]][0]);
					vstack.push(yyval.$);
					lstack.push(yyval._$);
					newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
					stack.push(newState);
					break;
				case 3:
					return true;
				}
			}
			return true;
		}};

		function Parser () {
			this.yy = {};
		}
		Parser.prototype = parser;parser.Parser = Parser;
		return new Parser;
		})();

		/*BT-
		if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
		*/
		exports.parser = parser;
		exports.Parser = parser.Parser;
		exports.parse = function () { return parser.parse.apply(parser, arguments); };
		/*BT-
		exports.main = function() {};
		if (typeof module !== 'undefined' && require.main === module) {
			exports.main(process.argv.slice(1));
		}
		}
		*/

		return exports;
	};
	//#endregion

	//#region URL: /scope
	modules['/scope'] = function() {
		// The **Scope** class regulates lexical scoping within CoffeeScript. As you
		// generate code, you create a tree of scopes in the same shape as the nested
		// function bodies. Each scope knows about the variables declared within it,
		// and has a reference to its parent enclosing scope. In this way, we know which
		// variables are new and need to be declared with `var`, and which are shared
		// with external scopes.
		var exports = {};
		var Scope,
			indexOf = [].indexOf;

		exports.Scope = Scope = class Scope {
			// Initialize a scope with its parent, for lookups up the chain,
			// as well as a reference to the **Block** node it belongs to, which is
			// where it should declare its variables, a reference to the function that
			// it belongs to, and a list of variables referenced in the source code
			// and therefore should be avoided when generating variables. Also track comments
			// that should be output as part of variable declarations.
			constructor(parent, expressions, method, referencedVars) {
				var ref, ref1;
				this.parent = parent;
				this.expressions = expressions;
				this.method = method;
				this.referencedVars = referencedVars;
				this.variables = [
					{
						name: 'arguments',
						type: 'arguments'
					}
				];
				this.comments = {};
				this.positions = {};
				if (!this.parent) {
					this.utilities = {};
				}
				// The `@root` is the top-level **Scope** object for a given file.
				this.root = (ref = (ref1 = this.parent) != null ? ref1.root : void 0) != null ? ref : this;
			}

			// Adds a new variable or overrides an existing one.
			add(name, type, immediate) {
				if (this.shared && !immediate) {
					return this.parent.add(name, type, immediate);
				}
				if (Object.prototype.hasOwnProperty.call(this.positions, name)) {
					return this.variables[this.positions[name]].type = type;
				} else {
					return this.positions[name] = this.variables.push({name, type}) - 1;
				}
			}

			// When `super` is called, we need to find the name of the current method we're
			// in, so that we know how to invoke the same method of the parent class. This
			// can get complicated if super is being called from an inner function.
			// `namedMethod` will walk up the scope tree until it either finds the first
			// function object that has a name filled in, or bottoms out.
			namedMethod() {
				var ref;
				if (((ref = this.method) != null ? ref.name : void 0) || !this.parent) {
					return this.method;
				}
				return this.parent.namedMethod();
			}

			// Look up a variable name in lexical scope, and declare it if it does not
			// already exist.
			find(name, type = 'var') {
				if (this.check(name)) {
					return true;
				}
				this.add(name, type);
				return false;
			}

			// Reserve a variable name as originating from a function parameter for this
			// scope. No `var` required for internal references.
			parameter(name) {
				if (this.shared && this.parent.check(name, true)) {
					return;
				}
				return this.add(name, 'param');
			}

			// Just check to see if a variable has already been declared, without reserving,
			// walks up to the root scope.
			check(name) {
				var ref;
				return !!(this.type(name) || ((ref = this.parent) != null ? ref.check(name) : void 0));
			}

			// Generate a temporary variable name at the given index.
			temporary(name, index, single = false) {
				var diff, endCode, letter, newCode, num, startCode;
				if (single) {
					startCode = name.charCodeAt(0);
					endCode = 'z'.charCodeAt(0);
					diff = endCode - startCode;
					newCode = startCode + index % (diff + 1);
					letter = String.fromCharCode(newCode);
					num = Math.floor(index / (diff + 1));
					return `${letter}${num || ''}`;
				} else {
					return `${name}${index || ''}`;
				}
			}

			// Gets the type of a variable.
			type(name) {
				var i, len, ref, v;
				ref = this.variables;
				for (i = 0, len = ref.length; i < len; i++) {
					v = ref[i];
					if (v.name === name) {
						return v.type;
					}
				}
				return null;
			}

			// If we need to store an intermediate result, find an available name for a
			// compiler-generated variable. `_var`, `_var2`, and so on...
			freeVariable(name, options = {}) {
				var index, ref, temp;
				index = 0;
				while (true) {
					temp = this.temporary(name, index, options.single);
					if (!(this.check(temp) || indexOf.call(this.root.referencedVars, temp) >= 0)) {
						break;
					}
					index++;
				}
				if ((ref = options.reserve) != null ? ref : true) {
					this.add(temp, 'var', true);
				}
				return temp;
			}

			// Ensure that an assignment is made at the top of this scope
			// (or at the top-level scope, if requested).
			assign(name, value) {
				this.add(name, {
					value,
					assigned: true
				}, true);
				return this.hasAssignments = true;
			}

			// Does this scope have any declared variables?
			hasDeclarations() {
				return !!this.declaredVariables().length;
			}

			// Return the list of variables first declared in this scope.
			declaredVariables() {
				var v;
				return ((function() {
					var i, len, ref, results;
					ref = this.variables;
					results = [];
					for (i = 0, len = ref.length; i < len; i++) {
						v = ref[i];
						if (v.type === 'var') {
							results.push(v.name);
						}
					}
					return results;
				}).call(this)).sort();
			}

			// Return the list of assignments that are supposed to be made at the top
			// of this scope.
			assignedVariables() {
				var i, len, ref, results, v;
				ref = this.variables;
				results = [];
				for (i = 0, len = ref.length; i < len; i++) {
					v = ref[i];
					if (v.type.assigned) {
						results.push(`${v.name} = ${v.type.value}`);
					}
				}
				return results;
			}

		};

		return exports;
	};
	//#endregion

	//#region URL: /nodes
	modules['/nodes'] = function() {
		// `nodes.coffee` contains all of the node classes for the syntax tree. Most
		// nodes are created as the result of actions in the [grammar](grammar.html),
		// but some are created by other nodes as a method of code generation. To convert
		// the syntax tree into a string of JavaScript code, call `compile()` on the root.
		var exports = {};
		var Access, Arr, Assign, AwaitReturn, Base, Block, BooleanLiteral, Call, Catch, Class, ClassProperty, ClassPrototypeProperty, Code, CodeFragment, ComputedPropertyName, DefaultLiteral, Directive, DynamicImport, DynamicImportCall, Elision, EmptyInterpolation, ExecutableClassBody, Existence, Expansion, ExportAllDeclaration, ExportDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, ExportSpecifier, ExportSpecifierList, Extends, For, FuncDirectiveReturn, FuncGlyph, HEREGEX_OMIT, HereComment, HoistTarget, IdentifierLiteral, If, ImportClause, ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier, ImportSpecifierList, In, Index, InfinityLiteral, Interpolation, JSXAttribute, JSXAttributes, JSXElement, JSXEmptyExpression, JSXExpressionContainer, JSXIdentifier, JSXNamespacedName, JSXTag, JSXText, JS_FORBIDDEN, LEADING_BLANK_LINE, LEVEL_ACCESS, LEVEL_COND, LEVEL_LIST, LEVEL_OP, LEVEL_PAREN, LEVEL_TOP, LineComment, Literal, MetaProperty, ModuleDeclaration, ModuleSpecifier, ModuleSpecifierList, NEGATE, NO, NaNLiteral, NullLiteral, NumberLiteral, Obj, ObjectProperty, Op, Param, Parens, PassthroughLiteral, PropertyName, Range, RegexLiteral, RegexWithInterpolations, Return, Root, SIMPLENUM, SIMPLE_STRING_OMIT, STRING_OMIT, Scope, Sequence, Slice, Splat, StatementLiteral, StringLiteral, StringWithInterpolations, Super, SuperCall, Switch, SwitchCase, SwitchWhen, TAB, THIS, TRAILING_BLANK_LINE, TaggedTemplateCall, TemplateElement, ThisLiteral, Throw, Try, UTILITIES, UndefinedLiteral, Value, While, YES, YieldReturn, addDataToNode, astAsBlockIfNeeded, attachCommentsToNode, compact, del, emptyExpressionLocationData, ends, extend, extractSameLineLocationDataFirst, extractSameLineLocationDataLast, flatten, fragmentsToText, greater, hasLineComments, indentInitial, isAstLocGreater, isFunction, isLiteralArguments, isLiteralThis, isLocationDataEndGreater, isLocationDataStartGreater, isNumber, isPlainObject, isUnassignable, jisonLocationDataToAstLocationData, lesser, locationDataToString, makeDelimitedLiteral, merge, mergeAstLocationData, mergeLocationData, moveComments, multident, parseNumber, replaceUnicodeCodePointEscapes, shouldCacheOrIsAssignable, sniffDirectives, some, starts, throwSyntaxError, unfoldSoak, unshiftAfterComments, utility, zeroWidthLocationDataFromEndLocation,
			indexOf = [].indexOf,
			splice = [].splice,
			slice1 = [].slice;

		Error.stackTraceLimit = 2e308;

		({Scope} = require('/scope'));

		({isUnassignable, JS_FORBIDDEN} = require('/lexer'));

		// Import the helpers we plan to use.
		({compact, flatten, extend, merge, del, starts, ends, some, addDataToNode, attachCommentsToNode, locationDataToString, throwSyntaxError, replaceUnicodeCodePointEscapes, isFunction, isPlainObject, isNumber, parseNumber} = require('/helpers'));

		// Functions required by parser.
		exports.extend = extend;

		exports.addDataToNode = addDataToNode;

		// Constant functions for nodes that don’t need customization.
		YES = function() {
			return true;
		};

		NO = function() {
			return false;
		};

		THIS = function() {
			return this;
		};

		NEGATE = function() {
			this.negated = !this.negated;
			return this;
		};

		//### CodeFragment

		// The various nodes defined below all compile to a collection of **CodeFragment** objects.
		// A CodeFragments is a block of generated code, and the location in the source file where the code
		// came from. CodeFragments can be assembled together into working code just by catting together
		// all the CodeFragments' `code` snippets, in order.
		exports.CodeFragment = CodeFragment = class CodeFragment {
			constructor(parent, code) {
				var ref1;
				this.code = `${code}`;
				this.type = (parent != null ? (ref1 = parent.constructor) != null ? ref1.name : void 0 : void 0) || 'unknown';
				this.locationData = parent != null ? parent.locationData : void 0;
				this.comments = parent != null ? parent.comments : void 0;
			}

			toString() {
				// This is only intended for debugging.
				return `${this.code}${this.locationData ? ": " + locationDataToString(this.locationData) : ''}`;
			}

		};

		// Convert an array of CodeFragments into a string.
		fragmentsToText = function(fragments) {
			var fragment;
			return ((function() {
				var j, len1, results1;
				results1 = [];
				for (j = 0, len1 = fragments.length; j < len1; j++) {
					fragment = fragments[j];
					results1.push(fragment.code);
				}
				return results1;
			})()).join('');
		};

		//### Base

		// The **Base** is the abstract base class for all nodes in the syntax tree.
		// Each subclass implements the `compileNode` method, which performs the
		// code generation for that node. To compile a node to JavaScript,
		// call `compile` on it, which wraps `compileNode` in some generic extra smarts,
		// to know when the generated code needs to be wrapped up in a closure.
		// An options hash is passed and cloned throughout, containing information about
		// the environment from higher in the tree (such as if a returned value is
		// being requested by the surrounding function), information about the current
		// scope, and indentation level.
		exports.Base = Base = (function() {
			class Base {
				compile(o, lvl) {
					return fragmentsToText(this.compileToFragments(o, lvl));
				}

				// Occasionally a node is compiled multiple times, for example to get the name
				// of a variable to add to scope tracking. When we know that a “premature”
				// compilation won’t result in comments being output, set those comments aside
				// so that they’re preserved for a later `compile` call that will result in
				// the comments being included in the output.
				compileWithoutComments(o, lvl, method = 'compile') {
					var fragments, unwrapped;
					if (this.comments) {
						this.ignoreTheseCommentsTemporarily = this.comments;
						delete this.comments;
					}
					unwrapped = this.unwrapAll();
					if (unwrapped.comments) {
						unwrapped.ignoreTheseCommentsTemporarily = unwrapped.comments;
						delete unwrapped.comments;
					}
					fragments = this[method](o, lvl);
					if (this.ignoreTheseCommentsTemporarily) {
						this.comments = this.ignoreTheseCommentsTemporarily;
						delete this.ignoreTheseCommentsTemporarily;
					}
					if (unwrapped.ignoreTheseCommentsTemporarily) {
						unwrapped.comments = unwrapped.ignoreTheseCommentsTemporarily;
						delete unwrapped.ignoreTheseCommentsTemporarily;
					}
					return fragments;
				}

				compileNodeWithoutComments(o, lvl) {
					return this.compileWithoutComments(o, lvl, 'compileNode');
				}

				// Common logic for determining whether to wrap this node in a closure before
				// compiling it, or to compile directly. We need to wrap if this node is a
				// *statement*, and it's not a *pureStatement*, and we're not at
				// the top level of a block (which would be unnecessary), and we haven't
				// already been asked to return the result (because statements know how to
				// return results).
				compileToFragments(o, lvl) {
					var fragments, node;
					o = extend({}, o);
					if (lvl) {
						o.level = lvl;
					}
					node = this.unfoldSoak(o) || this;
					node.tab = o.indent;
					fragments = o.level === LEVEL_TOP || !node.isStatement(o) ? node.compileNode(o) : node.compileClosure(o);
					this.compileCommentFragments(o, node, fragments);
					return fragments;
				}

				compileToFragmentsWithoutComments(o, lvl) {
					return this.compileWithoutComments(o, lvl, 'compileToFragments');
				}

				// Statements converted into expressions via closure-wrapping share a scope
				// object with their parent closure, to preserve the expected lexical scope.
				compileClosure(o) {
					var args, argumentsNode, func, meth, parts, ref1, ref2;
					this.checkForPureStatementInExpression();
					o.sharedScope = true;
					func = new Code([], Block.wrap([this]));
					args = [];
					if (this.contains((function(node) {
						return node instanceof SuperCall;
					}))) {
						func.bound = true;
					} else if ((argumentsNode = this.contains(isLiteralArguments)) || this.contains(isLiteralThis)) {
						args = [new ThisLiteral()];
						if (argumentsNode) {
							meth = 'apply';
							args.push(new IdentifierLiteral('arguments'));
						} else {
							meth = 'call';
						}
						func = new Value(func, [new Access(new PropertyName(meth))]);
					}
					parts = (new Call(func, args)).compileNode(o);
					switch (false) {
						case !(func.isGenerator || ((ref1 = func.base) != null ? ref1.isGenerator : void 0)):
							parts.unshift(this.makeCode("(yield* "));
							parts.push(this.makeCode(")"));
							break;
						case !(func.isAsync || ((ref2 = func.base) != null ? ref2.isAsync : void 0)):
							parts.unshift(this.makeCode("(await "));
							parts.push(this.makeCode(")"));
					}
					return parts;
				}

				compileCommentFragments(o, node, fragments) {
					var base1, base2, comment, commentFragment, j, len1, ref1, unshiftCommentFragment;
					if (!node.comments) {
						return fragments;
					}
					// This is where comments, that are attached to nodes as a `comments`
					// property, become `CodeFragment`s. “Inline block comments,” e.g.
					// `/* */`-delimited comments that are interspersed within code on a line,
					// are added to the current `fragments` stream. All other fragments are
					// attached as properties to the nearest preceding or following fragment,
					// to remain stowaways until they get properly output in `compileComments`
					// later on.
					unshiftCommentFragment = function(commentFragment) {
						var precedingFragment;
						if (commentFragment.unshift) {
							// Find the first non-comment fragment and insert `commentFragment`
							// before it.
							return unshiftAfterComments(fragments, commentFragment);
						} else {
							if (fragments.length !== 0) {
								precedingFragment = fragments[fragments.length - 1];
								if (commentFragment.newLine && precedingFragment.code !== '' && !/\n\s*$/.test(precedingFragment.code)) {
									commentFragment.code = `\n${commentFragment.code}`;
								}
							}
							return fragments.push(commentFragment);
						}
					};
					ref1 = node.comments;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						comment = ref1[j];
						if (!(indexOf.call(this.compiledComments, comment) < 0)) {
							continue;
						}
						this.compiledComments.push(comment); // Don’t output this comment twice.
						// For block/here comments, denoted by `###`, that are inline comments
						// like `1 + ### comment ### 2`, create fragments and insert them into
						// the fragments array.
						// Otherwise attach comment fragments to their closest fragment for now,
						// so they can be inserted into the output later after all the newlines
						// have been added.
						if (comment.here) { // Block comment, delimited by `###`.
							commentFragment = new HereComment(comment).compileNode(o); // Line comment, delimited by `#`.
						} else {
							commentFragment = new LineComment(comment).compileNode(o);
						}
						if ((commentFragment.isHereComment && !commentFragment.newLine) || node.includeCommentFragments()) {
							// Inline block comments, like `1 + /* comment */ 2`, or a node whose
							// `compileToFragments` method has logic for outputting comments.
							unshiftCommentFragment(commentFragment);
						} else {
							if (fragments.length === 0) {
								fragments.push(this.makeCode(''));
							}
							if (commentFragment.unshift) {
								if ((base1 = fragments[0]).precedingComments == null) {
									base1.precedingComments = [];
								}
								fragments[0].precedingComments.push(commentFragment);
							} else {
								if ((base2 = fragments[fragments.length - 1]).followingComments == null) {
									base2.followingComments = [];
								}
								fragments[fragments.length - 1].followingComments.push(commentFragment);
							}
						}
					}
					return fragments;
				}

				// If the code generation wishes to use the result of a complex expression
				// in multiple places, ensure that the expression is only ever evaluated once,
				// by assigning it to a temporary variable. Pass a level to precompile.

				// If `level` is passed, then returns `[val, ref]`, where `val` is the compiled value, and `ref`
				// is the compiled reference. If `level` is not passed, this returns `[val, ref]` where
				// the two values are raw nodes which have not been compiled.
				cache(o, level, shouldCache) {
					var complex, ref, sub;
					complex = shouldCache != null ? shouldCache(this) : this.shouldCache();
					if (complex) {
						ref = new IdentifierLiteral(o.scope.freeVariable('ref'));
						sub = new Assign(ref, this);
						if (level) {
							return [sub.compileToFragments(o, level), [this.makeCode(ref.value)]];
						} else {
							return [sub, ref];
						}
					} else {
						ref = level ? this.compileToFragments(o, level) : this;
						return [ref, ref];
					}
				}

				// Occasionally it may be useful to make an expression behave as if it was 'hoisted', whereby the
				// result of the expression is available before its location in the source, but the expression's
				// variable scope corresponds to the source position. This is used extensively to deal with executable
				// class bodies in classes.

				// Calling this method mutates the node, proxying the `compileNode` and `compileToFragments`
				// methods to store their result for later replacing the `target` node, which is returned by the
				// call.
				hoist() {
					var compileNode, compileToFragments, target;
					this.hoisted = true;
					target = new HoistTarget(this);
					compileNode = this.compileNode;
					compileToFragments = this.compileToFragments;
					this.compileNode = function(o) {
						return target.update(compileNode, o);
					};
					this.compileToFragments = function(o) {
						return target.update(compileToFragments, o);
					};
					return target;
				}

				cacheToCodeFragments(cacheValues) {
					return [fragmentsToText(cacheValues[0]), fragmentsToText(cacheValues[1])];
				}

				// Construct a node that returns the current node’s result.
				// Note that this is overridden for smarter behavior for
				// many statement nodes (e.g. `If`, `For`).
				makeReturn(results, mark) {
					var node;
					if (mark) {
						// Mark this node as implicitly returned, so that it can be part of the
						// node metadata returned in the AST.
						this.canBeReturned = true;
						return;
					}
					node = this.unwrapAll();
					if (results) {
						return new Call(new Literal(`${results}.push`), [node]);
					} else {
						return new Return(node);
					}
				}

				// Does this node, or any of its children, contain a node of a certain kind?
				// Recursively traverses down the *children* nodes and returns the first one
				// that verifies `pred`. Otherwise return undefined. `contains` does not cross
				// scope boundaries.
				contains(pred) {
					var node;
					node = void 0;
					this.traverseChildren(false, function(n) {
						if (pred(n)) {
							node = n;
							return false;
						}
					});
					return node;
				}

				// Pull out the last node of a node list.
				lastNode(list) {
					if (list.length === 0) {
						return null;
					} else {
						return list[list.length - 1];
					}
				}

				// Debugging representation of the node, for inspecting the parse tree.
				// This is what `coffee --nodes` prints out.
				toString(idt = '', name = this.constructor.name) {
					var tree;
					tree = '\n' + idt + name;
					if (this.soak) {
						tree += '?';
					}
					this.eachChild(function(node) {
						return tree += node.toString(idt + TAB);
					});
					return tree;
				}

				checkForPureStatementInExpression() {
					var jumpNode;
					if (jumpNode = this.jumps()) {
						return jumpNode.error('cannot use a pure statement in an expression');
					}
				}

				// Plain JavaScript object representation of the node, that can be serialized
				// as JSON. This is what the `ast` option in the Node API returns.
				// We try to follow the [Babel AST spec](https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md)
				// as closely as possible, for improved interoperability with other tools.
				// **WARNING: DO NOT OVERRIDE THIS METHOD IN CHILD CLASSES.**
				// Only override the component `ast*` methods as needed.
				ast(o, level) {
					var astNode;
					// Merge `level` into `o` and perform other universal checks.
					o = this.astInitialize(o, level);
					// Create serializable representation of this node.
					astNode = this.astNode(o);
					// Mark AST nodes that correspond to expressions that (implicitly) return.
					// We can’t do this as part of `astNode` because we need to assemble child
					// nodes first before marking the parent being returned.
					if ((this.astNode != null) && this.canBeReturned) {
						Object.assign(astNode, {
							returns: true
						});
					}
					return astNode;
				}

				astInitialize(o, level) {
					o = Object.assign({}, o);
					if (level != null) {
						o.level = level;
					}
					if (o.level > LEVEL_TOP) {
						this.checkForPureStatementInExpression();
					}
					if (this.isStatement(o) && o.level !== LEVEL_TOP && (o.scope != null)) {
						// `@makeReturn` must be called before `astProperties`, because the latter may call
						// `.ast()` for child nodes and those nodes would need the return logic from `makeReturn`
						// already executed by then.
						this.makeReturn(null, true);
					}
					return o;
				}

				astNode(o) {
					// Every abstract syntax tree node object has four categories of properties:
					// - type, stored in the `type` field and a string like `NumberLiteral`.
					// - location data, stored in the `loc`, `start`, `end` and `range` fields.
					// - properties specific to this node, like `parsedValue`.
					// - properties that are themselves child nodes, like `body`.
					// These fields are all intermixed in the Babel spec; `type` and `start` and
					// `parsedValue` are all top level fields in the AST node object. We have
					// separate methods for returning each category, that we merge together here.
					return Object.assign({}, {
						type: this.astType(o)
					}, this.astProperties(o), this.astLocationData());
				}

				// By default, a node class has no specific properties.
				astProperties() {
					return {};
				}

				// By default, a node class’s AST `type` is its class name.
				astType() {
					return this.constructor.name;
				}

				// The AST location data is a rearranged version of our Jison location data,
				// mutated into the structure that the Babel spec uses.
				astLocationData() {
					return jisonLocationDataToAstLocationData(this.locationData);
				}

				// Determines whether an AST node needs an `ExpressionStatement` wrapper.
				// Typically matches our `isStatement()` logic but this allows overriding.
				isStatementAst(o) {
					return this.isStatement(o);
				}

				// Passes each child to a function, breaking when the function returns `false`.
				eachChild(func) {
					var attr, child, j, k, len1, len2, ref1, ref2;
					if (!this.children) {
						return this;
					}
					ref1 = this.children;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						attr = ref1[j];
						if (this[attr]) {
							ref2 = flatten([this[attr]]);
							for (k = 0, len2 = ref2.length; k < len2; k++) {
								child = ref2[k];
								if (func(child) === false) {
									return this;
								}
							}
						}
					}
					return this;
				}

				traverseChildren(crossScope, func) {
					return this.eachChild(function(child) {
						var recur;
						recur = func(child);
						if (recur !== false) {
							return child.traverseChildren(crossScope, func);
						}
					});
				}

				// `replaceInContext` will traverse children looking for a node for which `match` returns
				// true. Once found, the matching node will be replaced by the result of calling `replacement`.
				replaceInContext(match, replacement) {
					var attr, child, children, i, j, k, len1, len2, ref1, ref2;
					if (!this.children) {
						return false;
					}
					ref1 = this.children;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						attr = ref1[j];
						if (children = this[attr]) {
							if (Array.isArray(children)) {
								for (i = k = 0, len2 = children.length; k < len2; i = ++k) {
									child = children[i];
									if (match(child)) {
										splice.apply(children, [i, i - i + 1].concat(ref2 = replacement(child, this))), ref2;
										return true;
									} else {
										if (child.replaceInContext(match, replacement)) {
											return true;
										}
									}
								}
							} else if (match(children)) {
								this[attr] = replacement(children, this);
								return true;
							} else {
								if (children.replaceInContext(match, replacement)) {
									return true;
								}
							}
						}
					}
				}

				invert() {
					return new Op('!', this);
				}

				unwrapAll() {
					var node;
					node = this;
					while (node !== (node = node.unwrap())) {
						continue;
					}
					return node;
				}

				// For this node and all descendents, set the location data to `locationData`
				// if the location data is not already set.
				updateLocationDataIfMissing(locationData, force) {
					if (force) {
						this.forceUpdateLocation = true;
					}
					if (this.locationData && !this.forceUpdateLocation) {
						return this;
					}
					delete this.forceUpdateLocation;
					this.locationData = locationData;
					return this.eachChild(function(child) {
						return child.updateLocationDataIfMissing(locationData);
					});
				}

				// Add location data from another node
				withLocationDataFrom({locationData}) {
					return this.updateLocationDataIfMissing(locationData);
				}

				// Add location data and comments from another node
				withLocationDataAndCommentsFrom(node) {
					var comments;
					this.withLocationDataFrom(node);
					({comments} = node);
					if (comments != null ? comments.length : void 0) {
						this.comments = comments;
					}
					return this;
				}

				// Throw a SyntaxError associated with this node’s location.
				error(message) {
					return throwSyntaxError(message, this.locationData);
				}

				makeCode(code) {
					return new CodeFragment(this, code);
				}

				wrapInParentheses(fragments) {
					return [this.makeCode('('), ...fragments, this.makeCode(')')];
				}

				wrapInBraces(fragments) {
					return [this.makeCode('{'), ...fragments, this.makeCode('}')];
				}

				// `fragmentsList` is an array of arrays of fragments. Each array in fragmentsList will be
				// concatenated together, with `joinStr` added in between each, to produce a final flat array
				// of fragments.
				joinFragmentArrays(fragmentsList, joinStr) {
					var answer, fragments, i, j, len1;
					answer = [];
					for (i = j = 0, len1 = fragmentsList.length; j < len1; i = ++j) {
						fragments = fragmentsList[i];
						if (i) {
							answer.push(this.makeCode(joinStr));
						}
						answer = answer.concat(fragments);
					}
					return answer;
				}

			};

			// Default implementations of the common node properties and methods. Nodes
			// will override these with custom logic, if needed.

			// `children` are the properties to recurse into when tree walking. The
			// `children` list *is* the structure of the AST. The `parent` pointer, and
			// the pointer to the `children` are how you can traverse the tree.
			Base.prototype.children = [];

			// `isStatement` has to do with “everything is an expression”. A few things
			// can’t be expressions, such as `break`. Things that `isStatement` returns
			// `true` for are things that can’t be used as expressions. There are some
			// error messages that come from `nodes.coffee` due to statements ending up
			// in expression position.
			Base.prototype.isStatement = NO;

			// Track comments that have been compiled into fragments, to avoid outputting
			// them twice.
			Base.prototype.compiledComments = [];

			// `includeCommentFragments` lets `compileCommentFragments` know whether this node
			// has special awareness of how to handle comments within its output.
			Base.prototype.includeCommentFragments = NO;

			// `jumps` tells you if an expression, or an internal part of an expression,
			// has a flow control construct (like `break`, `continue`, or `return`)
			// that jumps out of the normal flow of control and can’t be used as a value.
			// (Note that `throw` is not considered a flow control construct.)
			// This is important because flow control in the middle of an expression
			// makes no sense; we have to disallow it.
			Base.prototype.jumps = NO;

			// If `node.shouldCache() is false`, it is safe to use `node` more than once.
			// Otherwise you need to store the value of `node` in a variable and output
			// that variable several times instead. Kind of like this: `5` need not be
			// cached. `returnFive()`, however, could have side effects as a result of
			// evaluating it more than once, and therefore we need to cache it. The
			// parameter is named `shouldCache` rather than `mustCache` because there are
			// also cases where we might not need to cache but where we want to, for
			// example a long expression that may well be idempotent but we want to cache
			// for brevity.
			Base.prototype.shouldCache = YES;

			Base.prototype.isChainable = NO;

			Base.prototype.isAssignable = NO;

			Base.prototype.isNumber = NO;

			Base.prototype.unwrap = THIS;

			Base.prototype.unfoldSoak = NO;

			// Is this node used to assign a certain variable?
			Base.prototype.assigns = NO;

			return Base;

		}).call(this);

		//### HoistTarget

		// A **HoistTargetNode** represents the output location in the node tree for a hoisted node.
		// See Base#hoist.
		exports.HoistTarget = HoistTarget = class HoistTarget extends Base {
			// Expands hoisted fragments in the given array
			static expand(fragments) {
				var fragment, i, j, ref1;
				for (i = j = fragments.length - 1; j >= 0; i = j += -1) {
					fragment = fragments[i];
					if (fragment.fragments) {
						splice.apply(fragments, [i, i - i + 1].concat(ref1 = this.expand(fragment.fragments))), ref1;
					}
				}
				return fragments;
			}

			constructor(source1) {
				super();
				this.source = source1;
				// Holds presentational options to apply when the source node is compiled.
				this.options = {};
				// Placeholder fragments to be replaced by the source node’s compilation.
				this.targetFragments = {
					fragments: []
				};
			}

			isStatement(o) {
				return this.source.isStatement(o);
			}

			// Update the target fragments with the result of compiling the source.
			// Calls the given compile function with the node and options (overriden with the target
			// presentational options).
			update(compile, o) {
				return this.targetFragments.fragments = compile.call(this.source, merge(o, this.options));
			}

			// Copies the target indent and level, and returns the placeholder fragments
			compileToFragments(o, level) {
				this.options.indent = o.indent;
				this.options.level = level != null ? level : o.level;
				return [this.targetFragments];
			}

			compileNode(o) {
				return this.compileToFragments(o);
			}

			compileClosure(o) {
				return this.compileToFragments(o);
			}

		};

		//### Root

		// The root node of the node tree
		exports.Root = Root = (function() {
			class Root extends Base {
				constructor(body1) {
					super();
					this.body = body1;
					this.isAsync = (new Code([], this.body)).isAsync;
				}

				// Wrap everything in a safety closure, unless requested not to. It would be
				// better not to generate them in the first place, but for now, clean up
				// obvious double-parentheses.
				compileNode(o) {
					var fragments, functionKeyword;
					o.indent = o.bare ? '' : TAB;
					o.level = LEVEL_TOP;
					o.compiling = true;
					this.initializeScope(o);
					fragments = this.body.compileRoot(o);
					if (o.bare) {
						return fragments;
					}
					functionKeyword = `${this.isAsync ? 'async ' : ''}function`;
					return [].concat(this.makeCode(`(${functionKeyword}() {\n`), fragments, this.makeCode("\n}).call(this);\n"));
				}

				initializeScope(o) {
					var j, len1, name, ref1, ref2, results1;
					o.scope = new Scope(null, this.body, null, (ref1 = o.referencedVars) != null ? ref1 : []);
					ref2 = o.locals || [];
					results1 = [];
					for (j = 0, len1 = ref2.length; j < len1; j++) {
						name = ref2[j];
						// Mark given local variables in the root scope as parameters so they don’t
						// end up being declared on the root block.
						results1.push(o.scope.parameter(name));
					}
					return results1;
				}

				commentsAst() {
					var comment, commentToken, j, len1, ref1, results1;
					if (this.allComments == null) {
						this.allComments = (function() {
							var j, len1, ref1, ref2, results1;
							ref2 = (ref1 = this.allCommentTokens) != null ? ref1 : [];
							results1 = [];
							for (j = 0, len1 = ref2.length; j < len1; j++) {
								commentToken = ref2[j];
								if (!commentToken.heregex) {
									if (commentToken.here) {
										results1.push(new HereComment(commentToken));
									} else {
										results1.push(new LineComment(commentToken));
									}
								}
							}
							return results1;
						}).call(this);
					}
					ref1 = this.allComments;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						comment = ref1[j];
						results1.push(comment.ast());
					}
					return results1;
				}

				astNode(o) {
					o.level = LEVEL_TOP;
					this.initializeScope(o);
					return super.astNode(o);
				}

				astType() {
					return 'File';
				}

				astProperties(o) {
					this.body.isRootBlock = true;
					return {
						program: Object.assign(this.body.ast(o), this.astLocationData()),
						comments: this.commentsAst()
					};
				}

			};

			Root.prototype.children = ['body'];

			return Root;

		}).call(this);

		//### Block

		// The block is the list of expressions that forms the body of an
		// indented block of code -- the implementation of a function, a clause in an
		// `if`, `switch`, or `try`, and so on...
		exports.Block = Block = (function() {
			class Block extends Base {
				constructor(nodes) {
					super();
					this.expressions = compact(flatten(nodes || []));
				}

				// Tack an expression on to the end of this expression list.
				push(node) {
					this.expressions.push(node);
					return this;
				}

				// Remove and return the last expression of this expression list.
				pop() {
					return this.expressions.pop();
				}

				// Add an expression at the beginning of this expression list.
				unshift(node) {
					this.expressions.unshift(node);
					return this;
				}

				// If this Block consists of just a single node, unwrap it by pulling
				// it back out.
				unwrap() {
					if (this.expressions.length === 1) {
						return this.expressions[0];
					} else {
						return this;
					}
				}

				// Is this an empty block of code?
				isEmpty() {
					return !this.expressions.length;
				}

				isStatement(o) {
					var exp, j, len1, ref1;
					ref1 = this.expressions;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						exp = ref1[j];
						if (exp.isStatement(o)) {
							return true;
						}
					}
					return false;
				}

				jumps(o) {
					var exp, j, jumpNode, len1, ref1;
					ref1 = this.expressions;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						exp = ref1[j];
						if (jumpNode = exp.jumps(o)) {
							return jumpNode;
						}
					}
				}

				// A Block node does not return its entire body, rather it
				// ensures that the final expression is returned.
				makeReturn(results, mark) {
					var expr, expressions, last, lastExp, len, penult, ref1, ref2;
					len = this.expressions.length;
					ref1 = this.expressions, [lastExp] = slice1.call(ref1, -1);
					lastExp = (lastExp != null ? lastExp.unwrap() : void 0) || false;
					// We also need to check that we’re not returning a JSX tag if there’s an
					// adjacent one at the same level; JSX doesn’t allow that.
					if (lastExp && lastExp instanceof Parens && lastExp.body.expressions.length > 1) {
						({
							body: {expressions}
						} = lastExp);
						[penult, last] = slice1.call(expressions, -2);
						penult = penult.unwrap();
						last = last.unwrap();
						if (penult instanceof JSXElement && last instanceof JSXElement) {
							expressions[expressions.length - 1].error('Adjacent JSX elements must be wrapped in an enclosing tag');
						}
					}
					if (mark) {
						if ((ref2 = this.expressions[len - 1]) != null) {
							ref2.makeReturn(results, mark);
						}
						return;
					}
					while (len--) {
						expr = this.expressions[len];
						this.expressions[len] = expr.makeReturn(results);
						if (expr instanceof Return && !expr.expression) {
							this.expressions.splice(len, 1);
						}
						break;
					}
					return this;
				}

				compile(o, lvl) {
					if (!o.scope) {
						return new Root(this).withLocationDataFrom(this).compile(o, lvl);
					}
					return super.compile(o, lvl);
				}

				// Compile all expressions within the **Block** body. If we need to return
				// the result, and it’s an expression, simply return it. If it’s a statement,
				// ask the statement to do so.
				compileNode(o) {
					var answer, compiledNodes, fragments, index, j, lastFragment, len1, node, ref1, top;
					this.tab = o.indent;
					top = o.level === LEVEL_TOP;
					compiledNodes = [];
					ref1 = this.expressions;
					for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
						node = ref1[index];
						if (node.hoisted) {
							// This is a hoisted expression.
							// We want to compile this and ignore the result.
							node.compileToFragments(o);
							continue;
						}
						node = node.unfoldSoak(o) || node;
						if (node instanceof Block) {
							// This is a nested block. We don’t do anything special here like
							// enclose it in a new scope; we just compile the statements in this
							// block along with our own.
							compiledNodes.push(node.compileNode(o));
						} else if (top) {
							node.front = true;
							fragments = node.compileToFragments(o);
							if (!node.isStatement(o)) {
								fragments = indentInitial(fragments, this);
								[lastFragment] = slice1.call(fragments, -1);
								if (!(lastFragment.code === '' || lastFragment.isComment)) {
									fragments.push(this.makeCode(';'));
								}
							}
							compiledNodes.push(fragments);
						} else {
							compiledNodes.push(node.compileToFragments(o, LEVEL_LIST));
						}
					}
					if (top) {
						if (this.spaced) {
							return [].concat(this.joinFragmentArrays(compiledNodes, '\n\n'), this.makeCode('\n'));
						} else {
							return this.joinFragmentArrays(compiledNodes, '\n');
						}
					}
					if (compiledNodes.length) {
						answer = this.joinFragmentArrays(compiledNodes, ', ');
					} else {
						answer = [this.makeCode('void 0')];
					}
					if (compiledNodes.length > 1 && o.level >= LEVEL_LIST) {
						return this.wrapInParentheses(answer);
					} else {
						return answer;
					}
				}

				compileRoot(o) {
					var fragments;
					this.spaced = true;
					fragments = this.compileWithDeclarations(o);
					HoistTarget.expand(fragments);
					return this.compileComments(fragments);
				}

				// Compile the expressions body for the contents of a function, with
				// declarations of all inner variables pushed up to the top.
				compileWithDeclarations(o) {
					var assigns, declaredVariable, declaredVariables, declaredVariablesIndex, declars, exp, fragments, i, j, k, len1, len2, post, ref1, rest, scope, spaced;
					fragments = [];
					post = [];
					ref1 = this.expressions;
					for (i = j = 0, len1 = ref1.length; j < len1; i = ++j) {
						exp = ref1[i];
						exp = exp.unwrap();
						if (!(exp instanceof Literal)) {
							break;
						}
					}
					o = merge(o, {
						level: LEVEL_TOP
					});
					if (i) {
						rest = this.expressions.splice(i, 9e9);
						[spaced, this.spaced] = [this.spaced, false];
						[fragments, this.spaced] = [this.compileNode(o), spaced];
						this.expressions = rest;
					}
					post = this.compileNode(o);
					({scope} = o);
					if (scope.expressions === this) {
						declars = o.scope.hasDeclarations();
						assigns = scope.hasAssignments;
						if (declars || assigns) {
							if (i) {
								fragments.push(this.makeCode('\n'));
							}
							fragments.push(this.makeCode(`${this.tab}var `));
							if (declars) {
								declaredVariables = scope.declaredVariables();
								for (declaredVariablesIndex = k = 0, len2 = declaredVariables.length; k < len2; declaredVariablesIndex = ++k) {
									declaredVariable = declaredVariables[declaredVariablesIndex];
									fragments.push(this.makeCode(declaredVariable));
									if (Object.prototype.hasOwnProperty.call(o.scope.comments, declaredVariable)) {
										fragments.push(...o.scope.comments[declaredVariable]);
									}
									if (declaredVariablesIndex !== declaredVariables.length - 1) {
										fragments.push(this.makeCode(', '));
									}
								}
							}
							if (assigns) {
								if (declars) {
									fragments.push(this.makeCode(`,\n${this.tab + TAB}`));
								}
								fragments.push(this.makeCode(scope.assignedVariables().join(`,\n${this.tab + TAB}`)));
							}
							fragments.push(this.makeCode(`;\n${this.spaced ? '\n' : ''}`));
						} else if (fragments.length && post.length) {
							fragments.push(this.makeCode("\n"));
						}
					}
					return fragments.concat(post);
				}

				compileComments(fragments) {
					var code, commentFragment, fragment, fragmentIndent, fragmentIndex, indent, j, k, l, len1, len2, len3, newLineIndex, onNextLine, p, pastFragment, pastFragmentIndex, q, ref1, ref2, ref3, ref4, trail, upcomingFragment, upcomingFragmentIndex;
					for (fragmentIndex = j = 0, len1 = fragments.length; j < len1; fragmentIndex = ++j) {
						fragment = fragments[fragmentIndex];
						// Insert comments into the output at the next or previous newline.
						// If there are no newlines at which to place comments, create them.
						if (fragment.precedingComments) {
							// Determine the indentation level of the fragment that we are about
							// to insert comments before, and use that indentation level for our
							// inserted comments. At this point, the fragments’ `code` property
							// is the generated output JavaScript, and CoffeeScript always
							// generates output indented by two spaces; so all we need to do is
							// search for a `code` property that begins with at least two spaces.
							fragmentIndent = '';
							ref1 = fragments.slice(0, (fragmentIndex + 1));
							for (k = ref1.length - 1; k >= 0; k += -1) {
								pastFragment = ref1[k];
								indent = /^ {2,}/m.exec(pastFragment.code);
								if (indent) {
									fragmentIndent = indent[0];
									break;
								} else if (indexOf.call(pastFragment.code, '\n') >= 0) {
									break;
								}
							}
							code = `\n${fragmentIndent}` + ((function() {
								var l, len2, ref2, results1;
								ref2 = fragment.precedingComments;
								results1 = [];
								for (l = 0, len2 = ref2.length; l < len2; l++) {
									commentFragment = ref2[l];
									if (commentFragment.isHereComment && commentFragment.multiline) {
										results1.push(multident(commentFragment.code, fragmentIndent, false));
									} else {
										results1.push(commentFragment.code);
									}
								}
								return results1;
							})()).join(`\n${fragmentIndent}`).replace(/^(\s*)$/gm, '');
							ref2 = fragments.slice(0, (fragmentIndex + 1));
							for (pastFragmentIndex = l = ref2.length - 1; l >= 0; pastFragmentIndex = l += -1) {
								pastFragment = ref2[pastFragmentIndex];
								newLineIndex = pastFragment.code.lastIndexOf('\n');
								if (newLineIndex === -1) {
									// Keep searching previous fragments until we can’t go back any
									// further, either because there are no fragments left or we’ve
									// discovered that we’re in a code block that is interpolated
									// inside a string.
									if (pastFragmentIndex === 0) {
										pastFragment.code = '\n' + pastFragment.code;
										newLineIndex = 0;
									} else if (pastFragment.isStringWithInterpolations && pastFragment.code === '{') {
										code = code.slice(1) + '\n'; // Move newline to end.
										newLineIndex = 1;
									} else {
										continue;
									}
								}
								delete fragment.precedingComments;
								pastFragment.code = pastFragment.code.slice(0, newLineIndex) + code + pastFragment.code.slice(newLineIndex);
								break;
							}
						}
						// Yes, this is awfully similar to the previous `if` block, but if you
						// look closely you’ll find lots of tiny differences that make this
						// confusing if it were abstracted into a function that both blocks share.
						if (fragment.followingComments) {
							// Does the first trailing comment follow at the end of a line of code,
							// like `; // Comment`, or does it start a new line after a line of code?
							trail = fragment.followingComments[0].trail;
							fragmentIndent = '';
							// Find the indent of the next line of code, if we have any non-trailing
							// comments to output. We need to first find the next newline, as these
							// comments will be output after that; and then the indent of the line
							// that follows the next newline.
							if (!(trail && fragment.followingComments.length === 1)) {
								onNextLine = false;
								ref3 = fragments.slice(fragmentIndex);
								for (p = 0, len2 = ref3.length; p < len2; p++) {
									upcomingFragment = ref3[p];
									if (!onNextLine) {
										if (indexOf.call(upcomingFragment.code, '\n') >= 0) {
											onNextLine = true;
										} else {
											continue;
										}
									} else {
										indent = /^ {2,}/m.exec(upcomingFragment.code);
										if (indent) {
											fragmentIndent = indent[0];
											break;
										} else if (indexOf.call(upcomingFragment.code, '\n') >= 0) {
											break;
										}
									}
								}
							}
							// Is this comment following the indent inserted by bare mode?
							// If so, there’s no need to indent this further.
							code = fragmentIndex === 1 && /^\s+$/.test(fragments[0].code) ? '' : trail ? ' ' : `\n${fragmentIndent}`;
							// Assemble properly indented comments.
							code += ((function() {
								var len3, q, ref4, results1;
								ref4 = fragment.followingComments;
								results1 = [];
								for (q = 0, len3 = ref4.length; q < len3; q++) {
									commentFragment = ref4[q];
									if (commentFragment.isHereComment && commentFragment.multiline) {
										results1.push(multident(commentFragment.code, fragmentIndent, false));
									} else {
										results1.push(commentFragment.code);
									}
								}
								return results1;
							})()).join(`\n${fragmentIndent}`).replace(/^(\s*)$/gm, '');
							ref4 = fragments.slice(fragmentIndex);
							for (upcomingFragmentIndex = q = 0, len3 = ref4.length; q < len3; upcomingFragmentIndex = ++q) {
								upcomingFragment = ref4[upcomingFragmentIndex];
								newLineIndex = upcomingFragment.code.indexOf('\n');
								if (newLineIndex === -1) {
									// Keep searching upcoming fragments until we can’t go any
									// further, either because there are no fragments left or we’ve
									// discovered that we’re in a code block that is interpolated
									// inside a string.
									if (upcomingFragmentIndex === fragments.length - 1) {
										upcomingFragment.code = upcomingFragment.code + '\n';
										newLineIndex = upcomingFragment.code.length;
									} else if (upcomingFragment.isStringWithInterpolations && upcomingFragment.code === '}') {
										code = `${code}\n`;
										newLineIndex = 0;
									} else {
										continue;
									}
								}
								delete fragment.followingComments;
								if (upcomingFragment.code === '\n') {
									// Avoid inserting extra blank lines.
									code = code.replace(/^\n/, '');
								}
								upcomingFragment.code = upcomingFragment.code.slice(0, newLineIndex) + code + upcomingFragment.code.slice(newLineIndex);
								break;
							}
						}
					}
					return fragments;
				}

				// Wrap up the given nodes as a **Block**, unless it already happens
				// to be one.
				static wrap(nodes) {
					if (nodes.length === 1 && nodes[0] instanceof Block) {
						return nodes[0];
					}
					return new Block(nodes);
				}

				astNode(o) {
					if (((o.level != null) && o.level !== LEVEL_TOP) && this.expressions.length) {
						return (new Sequence(this.expressions).withLocationDataFrom(this)).ast(o);
					}
					return super.astNode(o);
				}

				astType() {
					if (this.isRootBlock) {
						return 'Program';
					} else if (this.isClassBody) {
						return 'ClassBody';
					} else {
						return 'BlockStatement';
					}
				}

				astProperties(o) {
					var body, checkForDirectives, directives, expression, expressionAst, j, len1, ref1;
					checkForDirectives = del(o, 'checkForDirectives');
					if (this.isRootBlock || checkForDirectives) {
						sniffDirectives(this.expressions, {
							notFinalExpression: checkForDirectives
						});
					}
					directives = [];
					body = [];
					ref1 = this.expressions;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						expression = ref1[j];
						expressionAst = expression.ast(o);
						// Ignore generated PassthroughLiteral
						if (expressionAst == null) {
							continue;
						} else if (expression instanceof Directive) {
							directives.push(expressionAst);
						// If an expression is a statement, it can be added to the body as is.
						} else if (expression.isStatementAst(o)) {
							body.push(expressionAst);
						} else {
							// Otherwise, we need to wrap it in an `ExpressionStatement` AST node.
							body.push(Object.assign({
								type: 'ExpressionStatement',
								expression: expressionAst
							}, expression.astLocationData()));
						}
					}
					// For now, we’re not including `sourceType` on the `Program` AST node.
					// Its value could be either `'script'` or `'module'`, and there’s no way
					// for CoffeeScript to always know which it should be. The presence of an
					// `import` or `export` statement in source code would imply that it should
					// be a `module`, but a project may consist of mostly such files and also
					// an outlier file that lacks `import` or `export` but is still imported
					// into the project and therefore expects to be treated as a `module`.
					// Determining the value of `sourceType` is essentially the same challenge
					// posed by determining the parse goal of a JavaScript file, also `module`
					// or `script`, and so if Node figures out a way to do so for `.js` files
					// then CoffeeScript can copy Node’s algorithm.

						// sourceType: 'module'
					return {body, directives};
				}

				astLocationData() {
					if (this.isRootBlock && (this.locationData == null)) {
						return;
					}
					return super.astLocationData();
				}

			};

			Block.prototype.children = ['expressions'];

			return Block;

		}).call(this);

		// A directive e.g. 'use strict'.
		// Currently only used during AST generation.
		exports.Directive = Directive = class Directive extends Base {
			constructor(value1) {
				super();
				this.value = value1;
			}

			astProperties(o) {
				return {
					value: Object.assign({}, this.value.ast(o), {
						type: 'DirectiveLiteral'
					})
				};
			}

		};

		//### Literal

		// `Literal` is a base class for static values that can be passed through
		// directly into JavaScript without translation, such as: strings, numbers,
		// `true`, `false`, `null`...
		exports.Literal = Literal = (function() {
			class Literal extends Base {
				constructor(value1) {
					super();
					this.value = value1;
				}

				assigns(name) {
					return name === this.value;
				}

				compileNode(o) {
					return [this.makeCode(this.value)];
				}

				astProperties() {
					return {
						value: this.value
					};
				}

				toString() {
					// This is only intended for debugging.
					return ` ${this.isStatement() ? super.toString() : this.constructor.name}: ${this.value}`;
				}

			};

			Literal.prototype.shouldCache = NO;

			return Literal;

		}).call(this);

		exports.NumberLiteral = NumberLiteral = class NumberLiteral extends Literal {
			constructor(value1, {parsedValue} = {}) {
				super();
				this.value = value1;
				this.parsedValue = parsedValue;
				if (this.parsedValue == null) {
					if (isNumber(this.value)) {
						this.parsedValue = this.value;
						this.value = `${this.value}`;
					} else {
						this.parsedValue = parseNumber(this.value);
					}
				}
			}

			isBigInt() {
				return /n$/.test(this.value);
			}

			astType() {
				if (this.isBigInt()) {
					return 'BigIntLiteral';
				} else {
					return 'NumericLiteral';
				}
			}

			astProperties() {
				return {
					value: this.isBigInt() ? this.parsedValue.toString() : this.parsedValue,
					extra: {
						rawValue: this.isBigInt() ? this.parsedValue.toString() : this.parsedValue,
						raw: this.value
					}
				};
			}

		};

		exports.InfinityLiteral = InfinityLiteral = class InfinityLiteral extends NumberLiteral {
			constructor(value1, {originalValue: originalValue = 'Infinity'} = {}) {
				super();
				this.value = value1;
				this.originalValue = originalValue;
			}

			compileNode() {
				return [this.makeCode('2e308')];
			}

			astNode(o) {
				if (this.originalValue !== 'Infinity') {
					return new NumberLiteral(this.value).withLocationDataFrom(this).ast(o);
				}
				return super.astNode(o);
			}

			astType() {
				return 'Identifier';
			}

			astProperties() {
				return {
					name: 'Infinity',
					declaration: false
				};
			}

		};

		exports.NaNLiteral = NaNLiteral = class NaNLiteral extends NumberLiteral {
			constructor() {
				super('NaN');
			}

			compileNode(o) {
				var code;
				code = [this.makeCode('0/0')];
				if (o.level >= LEVEL_OP) {
					return this.wrapInParentheses(code);
				} else {
					return code;
				}
			}

			astType() {
				return 'Identifier';
			}

			astProperties() {
				return {
					name: 'NaN',
					declaration: false
				};
			}

		};

		exports.StringLiteral = StringLiteral = class StringLiteral extends Literal {
			constructor(originalValue, {
					quote,
					initialChunk,
					finalChunk,
					indent: indent1,
					double: double1,
					heregex: heregex1
				} = {}) {
				var heredoc, indentRegex, val;
				super('');
				this.originalValue = originalValue;
				this.quote = quote;
				this.initialChunk = initialChunk;
				this.finalChunk = finalChunk;
				this.indent = indent1;
				this.double = double1;
				this.heregex = heregex1;
				if (this.quote === '///') {
					this.quote = null;
				}
				this.fromSourceString = this.quote != null;
				if (this.quote == null) {
					this.quote = '"';
				}
				heredoc = this.isFromHeredoc();
				val = this.originalValue;
				if (this.heregex) {
					val = val.replace(HEREGEX_OMIT, '$1$2');
					val = replaceUnicodeCodePointEscapes(val, {
						flags: this.heregex.flags
					});
				} else {
					val = val.replace(STRING_OMIT, '$1');
					val = !this.fromSourceString ? val : heredoc ? (this.indent ? indentRegex = RegExp(`\\n${this.indent}`, "g") : void 0, indentRegex ? val = val.replace(indentRegex, '\n') : void 0, this.initialChunk ? val = val.replace(LEADING_BLANK_LINE, '') : void 0, this.finalChunk ? val = val.replace(TRAILING_BLANK_LINE, '') : void 0, val) : val.replace(SIMPLE_STRING_OMIT, (match, offset) => {
						if ((this.initialChunk && offset === 0) || (this.finalChunk && offset + match.length === val.length)) {
							return '';
						} else {
							return ' ';
						}
					});
				}
				this.delimiter = this.quote.charAt(0);
				this.value = makeDelimitedLiteral(val, {delimiter: this.delimiter, double: this.double});
				this.unquotedValueForTemplateLiteral = makeDelimitedLiteral(val, {
					delimiter: '`',
					double: this.double,
					escapeNewlines: false,
					includeDelimiters: false,
					convertTrailingNullEscapes: true
				});
				this.unquotedValueForJSX = makeDelimitedLiteral(val, {
					double: this.double,
					escapeNewlines: false,
					includeDelimiters: false,
					escapeDelimiter: false
				});
			}

			compileNode(o) {
				if (this.shouldGenerateTemplateLiteral()) {
					return StringWithInterpolations.fromStringLiteral(this).compileNode(o);
				}
				if (this.jsx) {
					return [this.makeCode(this.unquotedValueForJSX)];
				}
				return super.compileNode(o);
			}

			// `StringLiteral`s can represent either entire literal strings
			// or pieces of text inside of e.g. an interpolated string.
			// When parsed as the former but needing to be treated as the latter
			// (e.g. the string part of a tagged template literal), this will return
			// a copy of the `StringLiteral` with the quotes trimmed from its location
			// data (like it would have if parsed as part of an interpolated string).
			withoutQuotesInLocationData() {
				var copy, endsWithNewline, locationData;
				endsWithNewline = this.originalValue.slice(-1) === '\n';
				locationData = Object.assign({}, this.locationData);
				locationData.first_column += this.quote.length;
				if (endsWithNewline) {
					locationData.last_line -= 1;
					locationData.last_column = locationData.last_line === locationData.first_line ? locationData.first_column + this.originalValue.length - '\n'.length : this.originalValue.slice(0, -1).length - '\n'.length - this.originalValue.slice(0, -1).lastIndexOf('\n');
				} else {
					locationData.last_column -= this.quote.length;
				}
				locationData.last_column_exclusive -= this.quote.length;
				locationData.range = [locationData.range[0] + this.quote.length, locationData.range[1] - this.quote.length];
				copy = new StringLiteral(this.originalValue, {quote: this.quote, initialChunk: this.initialChunk, finalChunk: this.finalChunk, indent: this.indent, double: this.double, heregex: this.heregex});
				copy.locationData = locationData;
				return copy;
			}

			isFromHeredoc() {
				return this.quote.length === 3;
			}

			shouldGenerateTemplateLiteral() {
				return this.isFromHeredoc();
			}

			astNode(o) {
				if (this.shouldGenerateTemplateLiteral()) {
					return StringWithInterpolations.fromStringLiteral(this).ast(o);
				}
				return super.astNode(o);
			}

			astProperties() {
				return {
					value: this.originalValue,
					extra: {
						raw: `${this.delimiter}${this.originalValue}${this.delimiter}`
					}
				};
			}

		};

		exports.RegexLiteral = RegexLiteral = (function() {
			class RegexLiteral extends Literal {
				constructor(value, {delimiter: delimiter1 = '/', heregexCommentTokens: heregexCommentTokens = []} = {}) {
					var endDelimiterIndex, heregex, val;
					super('');
					this.delimiter = delimiter1;
					this.heregexCommentTokens = heregexCommentTokens;
					heregex = this.delimiter === '///';
					endDelimiterIndex = value.lastIndexOf('/');
					this.flags = value.slice(endDelimiterIndex + 1);
					val = this.originalValue = value.slice(1, endDelimiterIndex);
					if (heregex) {
						val = val.replace(HEREGEX_OMIT, '$1$2');
					}
					val = replaceUnicodeCodePointEscapes(val, {flags: this.flags});
					this.value = `${makeDelimitedLiteral(val, {
						delimiter: '/'
					})}${this.flags}`;
				}

				astType() {
					return 'RegExpLiteral';
				}

				astProperties(o) {
					var heregexCommentToken, pattern;
					[, pattern] = this.REGEX_REGEX.exec(this.value);
					return {
						value: void 0,
						pattern,
						flags: this.flags,
						delimiter: this.delimiter,
						originalPattern: this.originalValue,
						extra: {
							raw: this.value,
							originalRaw: `${this.delimiter}${this.originalValue}${this.delimiter}${this.flags}`,
							rawValue: void 0
						},
						comments: (function() {
							var j, len1, ref1, results1;
							ref1 = this.heregexCommentTokens;
							results1 = [];
							for (j = 0, len1 = ref1.length; j < len1; j++) {
								heregexCommentToken = ref1[j];
								if (heregexCommentToken.here) {
									results1.push(new HereComment(heregexCommentToken).ast(o));
								} else {
									results1.push(new LineComment(heregexCommentToken).ast(o));
								}
							}
							return results1;
						}).call(this)
					};
				}

			};

			RegexLiteral.prototype.REGEX_REGEX = /^\/(.*)\/\w*$/;

			return RegexLiteral;

		}).call(this);

		exports.PassthroughLiteral = PassthroughLiteral = class PassthroughLiteral extends Literal {
			constructor(originalValue, {here, generated} = {}) {
				super('');
				this.originalValue = originalValue;
				this.here = here;
				this.generated = generated;
				this.value = this.originalValue.replace(/\\+(`|$)/g, function(string) {
					// `string` is always a value like '\`', '\\\`', '\\\\\`', etc.
					// By reducing it to its latter half, we turn '\`' to '`', '\\\`' to '\`', etc.
					return string.slice(-Math.ceil(string.length / 2));
				});
			}

			astNode(o) {
				if (this.generated) {
					return null;
				}
				return super.astNode(o);
			}

			astProperties() {
				return {
					value: this.originalValue,
					here: !!this.here
				};
			}

		};

		exports.IdentifierLiteral = IdentifierLiteral = (function() {
			class IdentifierLiteral extends Literal {
				eachName(iterator) {
					return iterator(this);
				}

				astType() {
					if (this.jsx) {
						return 'JSXIdentifier';
					} else {
						return 'Identifier';
					}
				}

				astProperties() {
					return {
						name: this.value,
						declaration: !!this.isDeclaration
					};
				}

			};

			IdentifierLiteral.prototype.isAssignable = YES;

			return IdentifierLiteral;

		}).call(this);

		exports.PropertyName = PropertyName = (function() {
			class PropertyName extends Literal {
				astType() {
					if (this.jsx) {
						return 'JSXIdentifier';
					} else {
						return 'Identifier';
					}
				}

				astProperties() {
					return {
						name: this.value,
						declaration: false
					};
				}

			};

			PropertyName.prototype.isAssignable = YES;

			return PropertyName;

		}).call(this);

		exports.ComputedPropertyName = ComputedPropertyName = class ComputedPropertyName extends PropertyName {
			compileNode(o) {
				return [this.makeCode('['), ...this.value.compileToFragments(o, LEVEL_LIST), this.makeCode(']')];
			}

			astNode(o) {
				return this.value.ast(o);
			}

		};

		exports.StatementLiteral = StatementLiteral = (function() {
			class StatementLiteral extends Literal {
				jumps(o) {
					if (this.value === 'break' && !((o != null ? o.loop : void 0) || (o != null ? o.block : void 0))) {
						return this;
					}
					if (this.value === 'continue' && !(o != null ? o.loop : void 0)) {
						return this;
					}
				}

				compileNode(o) {
					return [this.makeCode(`${this.tab}${this.value};`)];
				}

				astType() {
					switch (this.value) {
						case 'continue':
							return 'ContinueStatement';
						case 'break':
							return 'BreakStatement';
						case 'debugger':
							return 'DebuggerStatement';
					}
				}

			};

			StatementLiteral.prototype.isStatement = YES;

			StatementLiteral.prototype.makeReturn = THIS;

			return StatementLiteral;

		}).call(this);

		exports.ThisLiteral = ThisLiteral = class ThisLiteral extends Literal {
			constructor(value) {
				super('this');
				this.shorthand = value === '@';
			}

			compileNode(o) {
				var code, ref1;
				code = ((ref1 = o.scope.method) != null ? ref1.bound : void 0) ? o.scope.method.context : this.value;
				return [this.makeCode(code)];
			}

			astType() {
				return 'ThisExpression';
			}

			astProperties() {
				return {
					shorthand: this.shorthand
				};
			}

		};

		exports.UndefinedLiteral = UndefinedLiteral = class UndefinedLiteral extends Literal {
			constructor() {
				super('undefined');
			}

			compileNode(o) {
				return [this.makeCode(o.level >= LEVEL_ACCESS ? '(void 0)' : 'void 0')];
			}

			astType() {
				return 'Identifier';
			}

			astProperties() {
				return {
					name: this.value,
					declaration: false
				};
			}

		};

		exports.NullLiteral = NullLiteral = class NullLiteral extends Literal {
			constructor() {
				super('null');
			}

		};

		exports.BooleanLiteral = BooleanLiteral = class BooleanLiteral extends Literal {
			constructor(value, {originalValue} = {}) {
				super(value);
				this.originalValue = originalValue;
				if (this.originalValue == null) {
					this.originalValue = this.value;
				}
			}

			astProperties() {
				return {
					value: this.value === 'true' ? true : false,
					name: this.originalValue
				};
			}

		};

		exports.DefaultLiteral = DefaultLiteral = class DefaultLiteral extends Literal {
			astType() {
				return 'Identifier';
			}

			astProperties() {
				return {
					name: 'default',
					declaration: false
				};
			}

		};

		//### Return

		// A `return` is a *pureStatement*—wrapping it in a closure wouldn’t make sense.
		exports.Return = Return = (function() {
			class Return extends Base {
				constructor(expression1, {belongsToFuncDirectiveReturn} = {}) {
					super();
					this.expression = expression1;
					this.belongsToFuncDirectiveReturn = belongsToFuncDirectiveReturn;
				}

				compileToFragments(o, level) {
					var expr, ref1;
					expr = (ref1 = this.expression) != null ? ref1.makeReturn() : void 0;
					if (expr && !(expr instanceof Return)) {
						return expr.compileToFragments(o, level);
					} else {
						return super.compileToFragments(o, level);
					}
				}

				compileNode(o) {
					var answer, fragment, j, len1;
					answer = [];
					// TODO: If we call `expression.compile()` here twice, we’ll sometimes
					// get back different results!
					if (this.expression) {
						answer = this.expression.compileToFragments(o, LEVEL_PAREN);
						unshiftAfterComments(answer, this.makeCode(`${this.tab}return `));
						// Since the `return` got indented by `@tab`, preceding comments that are
						// multiline need to be indented.
						for (j = 0, len1 = answer.length; j < len1; j++) {
							fragment = answer[j];
							if (fragment.isHereComment && indexOf.call(fragment.code, '\n') >= 0) {
								fragment.code = multident(fragment.code, this.tab);
							} else if (fragment.isLineComment) {
								fragment.code = `${this.tab}${fragment.code}`;
							} else {
								break;
							}
						}
					} else {
						answer.push(this.makeCode(`${this.tab}return`));
					}
					answer.push(this.makeCode(';'));
					return answer;
				}

				checkForPureStatementInExpression() {
					// don’t flag `return` from `await return`/`yield return` as invalid.
					if (this.belongsToFuncDirectiveReturn) {
						return;
					}
					return super.checkForPureStatementInExpression();
				}

				astType() {
					return 'ReturnStatement';
				}

				astProperties(o) {
					var ref1, ref2;
					return {
						argument: (ref1 = (ref2 = this.expression) != null ? ref2.ast(o, LEVEL_PAREN) : void 0) != null ? ref1 : null
					};
				}

			};

			Return.prototype.children = ['expression'];

			Return.prototype.isStatement = YES;

			Return.prototype.makeReturn = THIS;

			Return.prototype.jumps = THIS;

			return Return;

		}).call(this);

		// Parent class for `YieldReturn`/`AwaitReturn`.
		exports.FuncDirectiveReturn = FuncDirectiveReturn = (function() {
			class FuncDirectiveReturn extends Return {
				constructor(expression, {returnKeyword}) {
					super(expression);
					this.returnKeyword = returnKeyword;
				}

				compileNode(o) {
					this.checkScope(o);
					return super.compileNode(o);
				}

				checkScope(o) {
					if (o.scope.parent == null) {
						return this.error(`${this.keyword} can only occur inside functions`);
					}
				}

				astNode(o) {
					this.checkScope(o);
					return new Op(this.keyword, new Return(this.expression, {
						belongsToFuncDirectiveReturn: true
					}).withLocationDataFrom(this.expression != null ? {
						locationData: mergeLocationData(this.returnKeyword.locationData, this.expression.locationData)
					} : this.returnKeyword)).withLocationDataFrom(this).ast(o);
				}

			};

			FuncDirectiveReturn.prototype.isStatementAst = NO;

			return FuncDirectiveReturn;

		}).call(this);

		// `yield return` works exactly like `return`, except that it turns the function
		// into a generator.
		exports.YieldReturn = YieldReturn = (function() {
			class YieldReturn extends FuncDirectiveReturn {};

			YieldReturn.prototype.keyword = 'yield';

			return YieldReturn;

		}).call(this);

		exports.AwaitReturn = AwaitReturn = (function() {
			class AwaitReturn extends FuncDirectiveReturn {};

			AwaitReturn.prototype.keyword = 'await';

			return AwaitReturn;

		}).call(this);

		//### Value

		// A value, variable or literal or parenthesized, indexed or dotted into,
		// or vanilla.
		exports.Value = Value = (function() {
			class Value extends Base {
				constructor(base, props, tag, isDefaultValue = false) {
					var ref1, ref2;
					super();
					if (!props && base instanceof Value) {
						return base;
					}
					this.base = base;
					this.properties = props || [];
					this.tag = tag;
					if (tag) {
						this[tag] = true;
					}
					this.isDefaultValue = isDefaultValue;
					// If this is a `@foo =` assignment, if there are comments on `@` move them
					// to be on `foo`.
					if (((ref1 = this.base) != null ? ref1.comments : void 0) && this.base instanceof ThisLiteral && (((ref2 = this.properties[0]) != null ? ref2.name : void 0) != null)) {
						moveComments(this.base, this.properties[0].name);
					}
				}

				// Add a property (or *properties* ) `Access` to the list.
				add(props) {
					this.properties = this.properties.concat(props);
					this.forceUpdateLocation = true;
					return this;
				}

				hasProperties() {
					return this.properties.length !== 0;
				}

				bareLiteral(type) {
					return !this.properties.length && this.base instanceof type;
				}

				// Some boolean checks for the benefit of other nodes.
				isArray() {
					return this.bareLiteral(Arr);
				}

				isRange() {
					return this.bareLiteral(Range);
				}

				shouldCache() {
					return this.hasProperties() || this.base.shouldCache();
				}

				isAssignable(opts) {
					return this.hasProperties() || this.base.isAssignable(opts);
				}

				isNumber() {
					return this.bareLiteral(NumberLiteral);
				}

				isString() {
					return this.bareLiteral(StringLiteral);
				}

				isRegex() {
					return this.bareLiteral(RegexLiteral);
				}

				isUndefined() {
					return this.bareLiteral(UndefinedLiteral);
				}

				isNull() {
					return this.bareLiteral(NullLiteral);
				}

				isBoolean() {
					return this.bareLiteral(BooleanLiteral);
				}

				isAtomic() {
					var j, len1, node, ref1;
					ref1 = this.properties.concat(this.base);
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						node = ref1[j];
						if (node.soak || node instanceof Call || node instanceof Op && node.operator === 'do') {
							return false;
						}
					}
					return true;
				}

				isNotCallable() {
					return this.isNumber() || this.isString() || this.isRegex() || this.isArray() || this.isRange() || this.isSplice() || this.isObject() || this.isUndefined() || this.isNull() || this.isBoolean();
				}

				isStatement(o) {
					return !this.properties.length && this.base.isStatement(o);
				}

				isJSXTag() {
					return this.base instanceof JSXTag;
				}

				assigns(name) {
					return !this.properties.length && this.base.assigns(name);
				}

				jumps(o) {
					return !this.properties.length && this.base.jumps(o);
				}

				isObject(onlyGenerated) {
					if (this.properties.length) {
						return false;
					}
					return (this.base instanceof Obj) && (!onlyGenerated || this.base.generated);
				}

				isElision() {
					if (!(this.base instanceof Arr)) {
						return false;
					}
					return this.base.hasElision();
				}

				isSplice() {
					var lastProperty, ref1;
					ref1 = this.properties, [lastProperty] = slice1.call(ref1, -1);
					return lastProperty instanceof Slice;
				}

				looksStatic(className) {
					var name, ref1, thisLiteral;
					if (!(((thisLiteral = this.base) instanceof ThisLiteral || (name = this.base).value === className) && this.properties.length === 1 && ((ref1 = this.properties[0].name) != null ? ref1.value : void 0) !== 'prototype')) {
						return false;
					}
					return {
						staticClassName: thisLiteral != null ? thisLiteral : name
					};
				}

				// The value can be unwrapped as its inner node, if there are no attached
				// properties.
				unwrap() {
					if (this.properties.length) {
						return this;
					} else {
						return this.base;
					}
				}

				// A reference has base part (`this` value) and name part.
				// We cache them separately for compiling complex expressions.
				// `a()[b()] ?= c` -> `(_base = a())[_name = b()] ? _base[_name] = c`
				cacheReference(o) {
					var base, bref, name, nref, ref1;
					ref1 = this.properties, [name] = slice1.call(ref1, -1);
					if (this.properties.length < 2 && !this.base.shouldCache() && !(name != null ? name.shouldCache() : void 0)) {
						return [this, this]; // `a` `a.b`
					}
					base = new Value(this.base, this.properties.slice(0, -1));
					if (base.shouldCache()) { // `a().b`
						bref = new IdentifierLiteral(o.scope.freeVariable('base'));
						base = new Value(new Parens(new Assign(bref, base)));
					}
					if (!name) { // `a()`
						return [base, bref];
					}
					if (name.shouldCache()) { // `a[b()]`
						nref = new IdentifierLiteral(o.scope.freeVariable('name'));
						name = new Index(new Assign(nref, name.index));
						nref = new Index(nref);
					}
					return [base.add(name), new Value(bref || base.base, [nref || name])];
				}

				// We compile a value to JavaScript by compiling and joining each property.
				// Things get much more interesting if the chain of properties has *soak*
				// operators `?.` interspersed. Then we have to take care not to accidentally
				// evaluate anything twice when building the soak chain.
				compileNode(o) {
					var fragments, j, len1, prop, props;
					this.base.front = this.front;
					props = this.properties;
					if (props.length && (this.base.cached != null)) {
						// Cached fragments enable correct order of the compilation,
						// and reuse of variables in the scope.
						// Example:
						// `a(x = 5).b(-> x = 6)` should compile in the same order as
						// `a(x = 5); b(-> x = 6)`
						// (see issue #4437, https://github.com/jashkenas/coffeescript/issues/4437)
						fragments = this.base.cached;
					} else {
						fragments = this.base.compileToFragments(o, (props.length ? LEVEL_ACCESS : null));
					}
					if (props.length && SIMPLENUM.test(fragmentsToText(fragments))) {
						fragments.push(this.makeCode('.'));
					}
					for (j = 0, len1 = props.length; j < len1; j++) {
						prop = props[j];
						fragments.push(...(prop.compileToFragments(o)));
					}
					return fragments;
				}

				// Unfold a soak into an `If`: `a?.b` -> `a.b if a?`
				unfoldSoak(o) {
					return this.unfoldedSoak != null ? this.unfoldedSoak : this.unfoldedSoak = (() => {
						var fst, i, ifn, j, len1, prop, ref, ref1, snd;
						ifn = this.base.unfoldSoak(o);
						if (ifn) {
							ifn.body.properties.push(...this.properties);
							return ifn;
						}
						ref1 = this.properties;
						for (i = j = 0, len1 = ref1.length; j < len1; i = ++j) {
							prop = ref1[i];
							if (!prop.soak) {
								continue;
							}
							prop.soak = false;
							fst = new Value(this.base, this.properties.slice(0, i));
							snd = new Value(this.base, this.properties.slice(i));
							if (fst.shouldCache()) {
								ref = new IdentifierLiteral(o.scope.freeVariable('ref'));
								fst = new Parens(new Assign(ref, fst));
								snd.base = ref;
							}
							return new If(new Existence(fst), snd, {
								soak: true
							});
						}
						return false;
					})();
				}

				eachName(iterator, {checkAssignability = true} = {}) {
					if (this.hasProperties()) {
						return iterator(this);
					} else if (!checkAssignability || this.base.isAssignable()) {
						return this.base.eachName(iterator);
					} else {
						return this.error('tried to assign to unassignable value');
					}
				}

				// For AST generation, we need an `object` that’s this `Value` minus its last
				// property, if it has properties.
				object() {
					var initialProperties, object;
					if (!this.hasProperties()) {
						return this;
					}
					// Get all properties except the last one; for a `Value` with only one
					// property, `initialProperties` is an empty array.
					initialProperties = this.properties.slice(0, this.properties.length - 1);
					// Create the `object` that becomes the new “base” for the split-off final
					// property.
					object = new Value(this.base, initialProperties, this.tag, this.isDefaultValue);
					// Add location data to our new node, so that it has correct location data
					// for source maps or later conversion into AST location data.
					// This new `Value` has only one property, so the location data is just
					// that of the parent `Value`’s base.
					// This new `Value` has multiple properties, so the location data spans
					// from the parent `Value`’s base to the last property that’s included
					// in this new node (a.k.a. the second-to-last property of the parent).
					object.locationData = initialProperties.length === 0 ? this.base.locationData : mergeLocationData(this.base.locationData, initialProperties[initialProperties.length - 1].locationData);
					return object;
				}

				containsSoak() {
					var j, len1, property, ref1;
					if (!this.hasProperties()) {
						return false;
					}
					ref1 = this.properties;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						property = ref1[j];
						if (property.soak) {
							return true;
						}
					}
					if (this.base instanceof Call && this.base.soak) {
						return true;
					}
					return false;
				}

				astNode(o) {
					if (!this.hasProperties()) {
						// If the `Value` has no properties, the AST node is just whatever this
						// node’s `base` is.
						return this.base.ast(o);
					}
					// Otherwise, call `Base::ast` which in turn calls the `astType` and
					// `astProperties` methods below.
					return super.astNode(o);
				}

				astType() {
					if (this.isJSXTag()) {
						return 'JSXMemberExpression';
					} else if (this.containsSoak()) {
						return 'OptionalMemberExpression';
					} else {
						return 'MemberExpression';
					}
				}

				// If this `Value` has properties, the *last* property (e.g. `c` in `a.b.c`)
				// becomes the `property`, and the preceding properties (e.g. `a.b`) become
				// a child `Value` node assigned to the `object` property.
				astProperties(o) {
					var computed, property, ref1, ref2;
					ref1 = this.properties, [property] = slice1.call(ref1, -1);
					if (this.isJSXTag()) {
						property.name.jsx = true;
					}
					computed = property instanceof Index || !(((ref2 = property.name) != null ? ref2.unwrap() : void 0) instanceof PropertyName);
					return {
						object: this.object().ast(o, LEVEL_ACCESS),
						property: property.ast(o, (computed ? LEVEL_PAREN : void 0)),
						computed,
						optional: !!property.soak,
						shorthand: !!property.shorthand
					};
				}

				astLocationData() {
					if (!this.isJSXTag()) {
						return super.astLocationData();
					}
					// don't include leading < of JSX tag in location data
					return mergeAstLocationData(jisonLocationDataToAstLocationData(this.base.tagNameLocationData), jisonLocationDataToAstLocationData(this.properties[this.properties.length - 1].locationData));
				}

			};

			Value.prototype.children = ['base', 'properties'];

			return Value;

		}).call(this);

		exports.MetaProperty = MetaProperty = (function() {
			class MetaProperty extends Base {
				constructor(meta, property1) {
					super();
					this.meta = meta;
					this.property = property1;
				}

				checkValid(o) {
					if (this.meta.value === 'new') {
						if (this.property instanceof Access && this.property.name.value === 'target') {
							if (o.scope.parent == null) {
								return this.error("new.target can only occur inside functions");
							}
						} else {
							return this.error("the only valid meta property for new is new.target");
						}
					} else if (this.meta.value === 'import') {
						if (!(this.property instanceof Access && this.property.name.value === 'meta')) {
							return this.error("the only valid meta property for import is import.meta");
						}
					}
				}

				compileNode(o) {
					var fragments;
					this.checkValid(o);
					fragments = [];
					fragments.push(...this.meta.compileToFragments(o, LEVEL_ACCESS));
					fragments.push(...this.property.compileToFragments(o));
					return fragments;
				}

				astProperties(o) {
					this.checkValid(o);
					return {
						meta: this.meta.ast(o, LEVEL_ACCESS),
						property: this.property.ast(o)
					};
				}

			};

			MetaProperty.prototype.children = ['meta', 'property'];

			return MetaProperty;

		}).call(this);

		//### HereComment

		// Comment delimited by `###` (becoming `/* */`).
		exports.HereComment = HereComment = class HereComment extends Base {
			constructor({
					content: content1,
					newLine,
					unshift,
					locationData: locationData1
				}) {
				super();
				this.content = content1;
				this.newLine = newLine;
				this.unshift = unshift;
				this.locationData = locationData1;
			}

			compileNode(o) {
				var fragment, hasLeadingMarks, indent, j, leadingWhitespace, len1, line, multiline, ref1;
				multiline = indexOf.call(this.content, '\n') >= 0;
				// Unindent multiline comments. They will be reindented later.
				if (multiline) {
					indent = null;
					ref1 = this.content.split('\n');
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						line = ref1[j];
						leadingWhitespace = /^\s*/.exec(line)[0];
						if (!indent || leadingWhitespace.length < indent.length) {
							indent = leadingWhitespace;
						}
					}
					if (indent) {
						this.content = this.content.replace(RegExp(`\\n${indent}`, "g"), '\n');
					}
				}
				hasLeadingMarks = /\n\s*[#|\*]/.test(this.content);
				if (hasLeadingMarks) {
					this.content = this.content.replace(/^([ \t]*)#(?=\s)/gm, ' *');
				}
				this.content = `/*${this.content}${hasLeadingMarks ? ' ' : ''}*/`;
				fragment = this.makeCode(this.content);
				fragment.newLine = this.newLine;
				fragment.unshift = this.unshift;
				fragment.multiline = multiline;
				// Don’t rely on `fragment.type`, which can break when the compiler is minified.
				fragment.isComment = fragment.isHereComment = true;
				return fragment;
			}

			astType() {
				return 'CommentBlock';
			}

			astProperties() {
				return {
					value: this.content
				};
			}

		};

		//### LineComment

		// Comment running from `#` to the end of a line (becoming `//`).
		exports.LineComment = LineComment = class LineComment extends Base {
			constructor({
					content: content1,
					newLine,
					unshift,
					locationData: locationData1,
					precededByBlankLine
				}) {
				super();
				this.content = content1;
				this.newLine = newLine;
				this.unshift = unshift;
				this.locationData = locationData1;
				this.precededByBlankLine = precededByBlankLine;
			}

			compileNode(o) {
				var fragment;
				fragment = this.makeCode(/^\s*$/.test(this.content) ? '' : `${this.precededByBlankLine ? `\n${o.indent}` : ''}//${this.content}`);
				fragment.newLine = this.newLine;
				fragment.unshift = this.unshift;
				fragment.trail = !this.newLine && !this.unshift;
				// Don’t rely on `fragment.type`, which can break when the compiler is minified.
				fragment.isComment = fragment.isLineComment = true;
				return fragment;
			}

			astType() {
				return 'CommentLine';
			}

			astProperties() {
				return {
					value: this.content
				};
			}

		};

		//### JSX
		exports.JSXIdentifier = JSXIdentifier = class JSXIdentifier extends IdentifierLiteral {
			astType() {
				return 'JSXIdentifier';
			}

		};

		exports.JSXTag = JSXTag = class JSXTag extends JSXIdentifier {
			constructor(value, {tagNameLocationData, closingTagOpeningBracketLocationData, closingTagSlashLocationData, closingTagNameLocationData, closingTagClosingBracketLocationData}) {
				super(value);
				this.tagNameLocationData = tagNameLocationData;
				this.closingTagOpeningBracketLocationData = closingTagOpeningBracketLocationData;
				this.closingTagSlashLocationData = closingTagSlashLocationData;
				this.closingTagNameLocationData = closingTagNameLocationData;
				this.closingTagClosingBracketLocationData = closingTagClosingBracketLocationData;
			}

			astProperties() {
				return {
					name: this.value
				};
			}

		};

		exports.JSXExpressionContainer = JSXExpressionContainer = (function() {
			class JSXExpressionContainer extends Base {
				constructor(expression1, {locationData} = {}) {
					super();
					this.expression = expression1;
					this.expression.jsxAttribute = true;
					this.locationData = locationData != null ? locationData : this.expression.locationData;
				}

				compileNode(o) {
					return this.expression.compileNode(o);
				}

				astProperties(o) {
					return {
						expression: astAsBlockIfNeeded(this.expression, o)
					};
				}

			};

			JSXExpressionContainer.prototype.children = ['expression'];

			return JSXExpressionContainer;

		}).call(this);

		exports.JSXEmptyExpression = JSXEmptyExpression = class JSXEmptyExpression extends Base {};

		exports.JSXText = JSXText = class JSXText extends Base {
			constructor(stringLiteral) {
				super();
				this.value = stringLiteral.unquotedValueForJSX;
				this.locationData = stringLiteral.locationData;
			}

			astProperties() {
				return {
					value: this.value,
					extra: {
						raw: this.value
					}
				};
			}

		};

		exports.JSXAttribute = JSXAttribute = (function() {
			class JSXAttribute extends Base {
				constructor({
						name: name1,
						value
					}) {
					var ref1;
					super();
					this.name = name1;
					this.value = value != null ? (value = value.base, value instanceof StringLiteral && !value.shouldGenerateTemplateLiteral() ? value : new JSXExpressionContainer(value)) : null;
					if ((ref1 = this.value) != null) {
						ref1.comments = value.comments;
					}
				}

				compileNode(o) {
					var compiledName, val;
					compiledName = this.name.compileToFragments(o, LEVEL_LIST);
					if (this.value == null) {
						return compiledName;
					}
					val = this.value.compileToFragments(o, LEVEL_LIST);
					return compiledName.concat(this.makeCode('='), val);
				}

				astProperties(o) {
					var name, ref1, ref2;
					name = this.name;
					if (indexOf.call(name.value, ':') >= 0) {
						name = new JSXNamespacedName(name);
					}
					return {
						name: name.ast(o),
						value: (ref1 = (ref2 = this.value) != null ? ref2.ast(o) : void 0) != null ? ref1 : null
					};
				}

			};

			JSXAttribute.prototype.children = ['name', 'value'];

			return JSXAttribute;

		}).call(this);

		exports.JSXAttributes = JSXAttributes = (function() {
			class JSXAttributes extends Base {
				constructor(arr) {
					var attribute, base, j, k, len1, len2, object, property, ref1, ref2, value, variable;
					super();
					this.attributes = [];
					ref1 = arr.objects;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						object = ref1[j];
						this.checkValidAttribute(object);
						({base} = object);
						if (base instanceof IdentifierLiteral) {
							// attribute with no value eg disabled
							attribute = new JSXAttribute({
								name: new JSXIdentifier(base.value).withLocationDataAndCommentsFrom(base)
							});
							attribute.locationData = base.locationData;
							this.attributes.push(attribute);
						} else if (!base.generated) {
							// object spread attribute eg {...props}
							attribute = base.properties[0];
							attribute.jsx = true;
							attribute.locationData = base.locationData;
							this.attributes.push(attribute);
						} else {
							ref2 = base.properties;
							// Obj containing attributes with values eg a="b" c={d}
							for (k = 0, len2 = ref2.length; k < len2; k++) {
								property = ref2[k];
								({variable, value} = property);
								attribute = new JSXAttribute({
									name: new JSXIdentifier(variable.base.value).withLocationDataAndCommentsFrom(variable.base),
									value
								});
								attribute.locationData = property.locationData;
								this.attributes.push(attribute);
							}
						}
					}
					this.locationData = arr.locationData;
				}

				// Catch invalid attributes: <div {a:"b", props} {props} "value" />
				checkValidAttribute(object) {
					var attribute, properties;
					({
						base: attribute
					} = object);
					properties = (attribute != null ? attribute.properties : void 0) || [];
					if (!(attribute instanceof Obj || attribute instanceof IdentifierLiteral) || (attribute instanceof Obj && !attribute.generated && (properties.length > 1 || !(properties[0] instanceof Splat)))) {
						return object.error(`Unexpected token. Allowed JSX attributes are: id="val", src={source}, {props...} or attribute.`);
					}
				}

				compileNode(o) {
					var attribute, fragments, j, len1, ref1;
					fragments = [];
					ref1 = this.attributes;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						attribute = ref1[j];
						fragments.push(this.makeCode(' '));
						fragments.push(...attribute.compileToFragments(o, LEVEL_TOP));
					}
					return fragments;
				}

				astNode(o) {
					var attribute, j, len1, ref1, results1;
					ref1 = this.attributes;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						attribute = ref1[j];
						results1.push(attribute.ast(o));
					}
					return results1;
				}

			};

			JSXAttributes.prototype.children = ['attributes'];

			return JSXAttributes;

		}).call(this);

		exports.JSXNamespacedName = JSXNamespacedName = (function() {
			class JSXNamespacedName extends Base {
				constructor(tag) {
					var name, namespace;
					super();
					[namespace, name] = tag.value.split(':');
					this.namespace = new JSXIdentifier(namespace).withLocationDataFrom({
						locationData: extractSameLineLocationDataFirst(namespace.length)(tag.locationData)
					});
					this.name = new JSXIdentifier(name).withLocationDataFrom({
						locationData: extractSameLineLocationDataLast(name.length)(tag.locationData)
					});
					this.locationData = tag.locationData;
				}

				astProperties(o) {
					return {
						namespace: this.namespace.ast(o),
						name: this.name.ast(o)
					};
				}

			};

			JSXNamespacedName.prototype.children = ['namespace', 'name'];

			return JSXNamespacedName;

		}).call(this);

		// Node for a JSX element
		exports.JSXElement = JSXElement = (function() {
			class JSXElement extends Base {
				constructor({
						tagName: tagName1,
						attributes,
						content: content1
					}) {
					super();
					this.tagName = tagName1;
					this.attributes = attributes;
					this.content = content1;
				}

				compileNode(o) {
					var fragments, ref1, tag;
					if ((ref1 = this.content) != null) {
						ref1.base.jsx = true;
					}
					fragments = [this.makeCode('<')];
					fragments.push(...(tag = this.tagName.compileToFragments(o, LEVEL_ACCESS)));
					fragments.push(...this.attributes.compileToFragments(o));
					if (this.content) {
						fragments.push(this.makeCode('>'));
						fragments.push(...this.content.compileNode(o, LEVEL_LIST));
						fragments.push(...[this.makeCode('</'), ...tag, this.makeCode('>')]);
					} else {
						fragments.push(this.makeCode(' />'));
					}
					return fragments;
				}

				isFragment() {
					return !this.tagName.base.value.length;
				}

				astNode(o) {
					var tagName;
					// The location data spanning the opening element < ... > is captured by
					// the generated Arr which contains the element's attributes
					this.openingElementLocationData = jisonLocationDataToAstLocationData(this.attributes.locationData);
					tagName = this.tagName.base;
					tagName.locationData = tagName.tagNameLocationData;
					if (this.content != null) {
						this.closingElementLocationData = mergeAstLocationData(jisonLocationDataToAstLocationData(tagName.closingTagOpeningBracketLocationData), jisonLocationDataToAstLocationData(tagName.closingTagClosingBracketLocationData));
					}
					return super.astNode(o);
				}

				astType() {
					if (this.isFragment()) {
						return 'JSXFragment';
					} else {
						return 'JSXElement';
					}
				}

				elementAstProperties(o) {
					var closingElement, columnDiff, currentExpr, openingElement, rangeDiff, ref1, shiftAstLocationData, tagNameAst;
					tagNameAst = () => {
						var tag;
						tag = this.tagName.unwrap();
						if ((tag != null ? tag.value : void 0) && indexOf.call(tag.value, ':') >= 0) {
							tag = new JSXNamespacedName(tag);
						}
						return tag.ast(o);
					};
					openingElement = Object.assign({
						type: 'JSXOpeningElement',
						name: tagNameAst(),
						selfClosing: this.closingElementLocationData == null,
						attributes: this.attributes.ast(o)
					}, this.openingElementLocationData);
					closingElement = null;
					if (this.closingElementLocationData != null) {
						closingElement = Object.assign({
							type: 'JSXClosingElement',
							name: Object.assign(tagNameAst(), jisonLocationDataToAstLocationData(this.tagName.base.closingTagNameLocationData))
						}, this.closingElementLocationData);
						if ((ref1 = closingElement.name.type) === 'JSXMemberExpression' || ref1 === 'JSXNamespacedName') {
							rangeDiff = closingElement.range[0] - openingElement.range[0] + '/'.length;
							columnDiff = closingElement.loc.start.column - openingElement.loc.start.column + '/'.length;
							shiftAstLocationData = (node) => {
								node.range = [node.range[0] + rangeDiff, node.range[1] + rangeDiff];
								node.start += rangeDiff;
								node.end += rangeDiff;
								node.loc.start = {
									line: this.closingElementLocationData.loc.start.line,
									column: node.loc.start.column + columnDiff
								};
								return node.loc.end = {
									line: this.closingElementLocationData.loc.start.line,
									column: node.loc.end.column + columnDiff
								};
							};
							if (closingElement.name.type === 'JSXMemberExpression') {
								currentExpr = closingElement.name;
								while (currentExpr.type === 'JSXMemberExpression') {
									if (currentExpr !== closingElement.name) {
										shiftAstLocationData(currentExpr);
									}
									shiftAstLocationData(currentExpr.property);
									currentExpr = currentExpr.object;
								}
								shiftAstLocationData(currentExpr); // JSXNamespacedName
							} else {
								shiftAstLocationData(closingElement.name.namespace);
								shiftAstLocationData(closingElement.name.name);
							}
						}
					}
					return {openingElement, closingElement};
				}

				fragmentAstProperties(o) {
					var closingFragment, openingFragment;
					openingFragment = Object.assign({
						type: 'JSXOpeningFragment'
					}, this.openingElementLocationData);
					closingFragment = Object.assign({
						type: 'JSXClosingFragment'
					}, this.closingElementLocationData);
					return {openingFragment, closingFragment};
				}

				contentAst(o) {
					var base1, child, children, content, element, emptyExpression, expression, j, len1, results1, unwrapped;
					if (!(this.content && !(typeof (base1 = this.content.base).isEmpty === "function" ? base1.isEmpty() : void 0))) {
						return [];
					}
					content = this.content.unwrapAll();
					children = (function() {
						var j, len1, ref1, results1;
						if (content instanceof StringLiteral) {
							return [new JSXText(content)]; // StringWithInterpolations
						} else {
							ref1 = this.content.unwrapAll().extractElements(o, {
								includeInterpolationWrappers: true,
								isJsx: true
							});
							results1 = [];
							for (j = 0, len1 = ref1.length; j < len1; j++) {
								element = ref1[j];
								if (element instanceof StringLiteral) {
									results1.push(new JSXText(element)); // Interpolation
								} else {
									({expression} = element);
									if (expression == null) {
										emptyExpression = new JSXEmptyExpression();
										emptyExpression.locationData = emptyExpressionLocationData({
											interpolationNode: element,
											openingBrace: '{',
											closingBrace: '}'
										});
										results1.push(new JSXExpressionContainer(emptyExpression, {
											locationData: element.locationData
										}));
									} else {
										unwrapped = expression.unwrapAll();
										// distinguish `<a><b /></a>` from `<a>{<b />}</a>`
										if (unwrapped instanceof JSXElement && unwrapped.locationData.range[0] === element.locationData.range[0]) {
											results1.push(unwrapped);
										} else {
											results1.push(new JSXExpressionContainer(unwrapped, {
												locationData: element.locationData
											}));
										}
									}
								}
							}
							return results1;
						}
					}).call(this);
					results1 = [];
					for (j = 0, len1 = children.length; j < len1; j++) {
						child = children[j];
						if (!(child instanceof JSXText && child.value.length === 0)) {
							results1.push(child.ast(o));
						}
					}
					return results1;
				}

				astProperties(o) {
					return Object.assign(this.isFragment() ? this.fragmentAstProperties(o) : this.elementAstProperties(o), {
						children: this.contentAst(o)
					});
				}

				astLocationData() {
					if (this.closingElementLocationData != null) {
						return mergeAstLocationData(this.openingElementLocationData, this.closingElementLocationData);
					} else {
						return this.openingElementLocationData;
					}
				}

			};

			JSXElement.prototype.children = ['tagName', 'attributes', 'content'];

			return JSXElement;

		}).call(this);

		//### Call

		// Node for a function invocation.
		exports.Call = Call = (function() {
			class Call extends Base {
				constructor(variable1, args1 = [], soak1, token1) {
					var ref1;
					super();
					this.variable = variable1;
					this.args = args1;
					this.soak = soak1;
					this.token = token1;
					this.implicit = this.args.implicit;
					this.isNew = false;
					if (this.variable instanceof Value && this.variable.isNotCallable()) {
						this.variable.error("literal is not a function");
					}
					if (this.variable.base instanceof JSXTag) {
						return new JSXElement({
							tagName: this.variable,
							attributes: new JSXAttributes(this.args[0].base),
							content: this.args[1]
						});
					}
					// `@variable` never gets output as a result of this node getting created as
					// part of `RegexWithInterpolations`, so for that case move any comments to
					// the `args` property that gets passed into `RegexWithInterpolations` via
					// the grammar.
					if (((ref1 = this.variable.base) != null ? ref1.value : void 0) === 'RegExp' && this.args.length !== 0) {
						moveComments(this.variable, this.args[0]);
					}
				}

				// When setting the location, we sometimes need to update the start location to
				// account for a newly-discovered `new` operator to the left of us. This
				// expands the range on the left, but not the right.
				updateLocationDataIfMissing(locationData) {
					var base, ref1;
					if (this.locationData && this.needsUpdatedStartLocation) {
						this.locationData = Object.assign({}, this.locationData, {
							first_line: locationData.first_line,
							first_column: locationData.first_column,
							range: [locationData.range[0], this.locationData.range[1]]
						});
						base = ((ref1 = this.variable) != null ? ref1.base : void 0) || this.variable;
						if (base.needsUpdatedStartLocation) {
							this.variable.locationData = Object.assign({}, this.variable.locationData, {
								first_line: locationData.first_line,
								first_column: locationData.first_column,
								range: [locationData.range[0], this.variable.locationData.range[1]]
							});
							base.updateLocationDataIfMissing(locationData);
						}
						delete this.needsUpdatedStartLocation;
					}
					return super.updateLocationDataIfMissing(locationData);
				}

				// Tag this invocation as creating a new instance.
				newInstance() {
					var base, ref1;
					base = ((ref1 = this.variable) != null ? ref1.base : void 0) || this.variable;
					if (base instanceof Call && !base.isNew) {
						base.newInstance();
					} else {
						this.isNew = true;
					}
					this.needsUpdatedStartLocation = true;
					return this;
				}

				// Soaked chained invocations unfold into if/else ternary structures.
				unfoldSoak(o) {
					var call, ifn, j, left, len1, list, ref1, rite;
					if (this.soak) {
						if (this.variable instanceof Super) {
							left = new Literal(this.variable.compile(o));
							rite = new Value(left);
							if (this.variable.accessor == null) {
								this.variable.error("Unsupported reference to 'super'");
							}
						} else {
							if (ifn = unfoldSoak(o, this, 'variable')) {
								return ifn;
							}
							[left, rite] = new Value(this.variable).cacheReference(o);
						}
						rite = new Call(rite, this.args);
						rite.isNew = this.isNew;
						left = new Literal(`typeof ${left.compile(o)} === \"function\"`);
						return new If(left, new Value(rite), {
							soak: true
						});
					}
					call = this;
					list = [];
					while (true) {
						if (call.variable instanceof Call) {
							list.push(call);
							call = call.variable;
							continue;
						}
						if (!(call.variable instanceof Value)) {
							break;
						}
						list.push(call);
						if (!((call = call.variable.base) instanceof Call)) {
							break;
						}
					}
					ref1 = list.reverse();
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						call = ref1[j];
						if (ifn) {
							if (call.variable instanceof Call) {
								call.variable = ifn;
							} else {
								call.variable.base = ifn;
							}
						}
						ifn = unfoldSoak(o, call, 'variable');
					}
					return ifn;
				}

				// Compile a vanilla function call.
				compileNode(o) {
					var arg, argCode, argIndex, cache, compiledArgs, fragments, j, len1, ref1, ref2, ref3, ref4, varAccess;
					this.checkForNewSuper();
					if ((ref1 = this.variable) != null) {
						ref1.front = this.front;
					}
					compiledArgs = [];
					// If variable is `Accessor` fragments are cached and used later
					// in `Value::compileNode` to ensure correct order of the compilation,
					// and reuse of variables in the scope.
					// Example:
					// `a(x = 5).b(-> x = 6)` should compile in the same order as
					// `a(x = 5); b(-> x = 6)`
					// (see issue #4437, https://github.com/jashkenas/coffeescript/issues/4437)
					varAccess = ((ref2 = this.variable) != null ? (ref3 = ref2.properties) != null ? ref3[0] : void 0 : void 0) instanceof Access;
					argCode = (function() {
						var j, len1, ref4, results1;
						ref4 = this.args || [];
						results1 = [];
						for (j = 0, len1 = ref4.length; j < len1; j++) {
							arg = ref4[j];
							if (arg instanceof Code) {
								results1.push(arg);
							}
						}
						return results1;
					}).call(this);
					if (argCode.length > 0 && varAccess && !this.variable.base.cached) {
						[cache] = this.variable.base.cache(o, LEVEL_ACCESS, function() {
							return false;
						});
						this.variable.base.cached = cache;
					}
					ref4 = this.args;
					for (argIndex = j = 0, len1 = ref4.length; j < len1; argIndex = ++j) {
						arg = ref4[argIndex];
						if (argIndex) {
							compiledArgs.push(this.makeCode(", "));
						}
						compiledArgs.push(...(arg.compileToFragments(o, LEVEL_LIST)));
					}
					fragments = [];
					if (this.isNew) {
						fragments.push(this.makeCode('new '));
					}
					fragments.push(...this.variable.compileToFragments(o, LEVEL_ACCESS));
					fragments.push(this.makeCode('('), ...compiledArgs, this.makeCode(')'));
					return fragments;
				}

				checkForNewSuper() {
					if (this.isNew) {
						if (this.variable instanceof Super) {
							return this.variable.error("Unsupported reference to 'super'");
						}
					}
				}

				containsSoak() {
					var ref1;
					if (this.soak) {
						return true;
					}
					if ((ref1 = this.variable) != null ? typeof ref1.containsSoak === "function" ? ref1.containsSoak() : void 0 : void 0) {
						return true;
					}
					return false;
				}

				astNode(o) {
					var ref1;
					if (this.soak && this.variable instanceof Super && ((ref1 = o.scope.namedMethod()) != null ? ref1.ctor : void 0)) {
						this.variable.error("Unsupported reference to 'super'");
					}
					this.checkForNewSuper();
					return super.astNode(o);
				}

				astType() {
					if (this.isNew) {
						return 'NewExpression';
					} else if (this.containsSoak()) {
						return 'OptionalCallExpression';
					} else {
						return 'CallExpression';
					}
				}

				astProperties(o) {
					var arg;
					return {
						callee: this.variable.ast(o, LEVEL_ACCESS),
						arguments: (function() {
							var j, len1, ref1, results1;
							ref1 = this.args;
							results1 = [];
							for (j = 0, len1 = ref1.length; j < len1; j++) {
								arg = ref1[j];
								results1.push(arg.ast(o, LEVEL_LIST));
							}
							return results1;
						}).call(this),
						optional: !!this.soak,
						implicit: !!this.implicit
					};
				}

			};

			Call.prototype.children = ['variable', 'args'];

			return Call;

		}).call(this);

		//### Super

		// Takes care of converting `super()` calls into calls against the prototype's
		// function of the same name.
		// When `expressions` are set the call will be compiled in such a way that the
		// expressions are evaluated without altering the return value of the `SuperCall`
		// expression.
		exports.SuperCall = SuperCall = (function() {
			class SuperCall extends Call {
				isStatement(o) {
					var ref1;
					return ((ref1 = this.expressions) != null ? ref1.length : void 0) && o.level === LEVEL_TOP;
				}

				compileNode(o) {
					var ref, ref1, replacement, superCall;
					if (!((ref1 = this.expressions) != null ? ref1.length : void 0)) {
						return super.compileNode(o);
					}
					superCall = new Literal(fragmentsToText(super.compileNode(o)));
					replacement = new Block(this.expressions.slice());
					if (o.level > LEVEL_TOP) {
						// If we might be in an expression we need to cache and return the result
						[superCall, ref] = superCall.cache(o, null, YES);
						replacement.push(ref);
					}
					replacement.unshift(superCall);
					return replacement.compileToFragments(o, o.level === LEVEL_TOP ? o.level : LEVEL_LIST);
				}

			};

			SuperCall.prototype.children = Call.prototype.children.concat(['expressions']);

			return SuperCall;

		}).call(this);

		exports.Super = Super = (function() {
			class Super extends Base {
				constructor(accessor, superLiteral) {
					super();
					this.accessor = accessor;
					this.superLiteral = superLiteral;
				}

				compileNode(o) {
					var fragments, method, name, nref, ref1, ref2, salvagedComments, variable;
					this.checkInInstanceMethod(o);
					method = o.scope.namedMethod();
					if (!((method.ctor != null) || (this.accessor != null))) {
						({name, variable} = method);
						if (name.shouldCache() || (name instanceof Index && name.index.isAssignable())) {
							nref = new IdentifierLiteral(o.scope.parent.freeVariable('name'));
							name.index = new Assign(nref, name.index);
						}
						this.accessor = nref != null ? new Index(nref) : name;
					}
					if ((ref1 = this.accessor) != null ? (ref2 = ref1.name) != null ? ref2.comments : void 0 : void 0) {
						// A `super()` call gets compiled to e.g. `super.method()`, which means
						// the `method` property name gets compiled for the first time here, and
						// again when the `method:` property of the class gets compiled. Since
						// this compilation happens first, comments attached to `method:` would
						// get incorrectly output near `super.method()`, when we want them to
						// get output on the second pass when `method:` is output. So set them
						// aside during this compilation pass, and put them back on the object so
						// that they’re there for the later compilation.
						salvagedComments = this.accessor.name.comments;
						delete this.accessor.name.comments;
					}
					fragments = (new Value(new Literal('super'), this.accessor ? [this.accessor] : [])).compileToFragments(o);
					if (salvagedComments) {
						attachCommentsToNode(salvagedComments, this.accessor.name);
					}
					return fragments;
				}

				checkInInstanceMethod(o) {
					var method;
					method = o.scope.namedMethod();
					if (!(method != null ? method.isMethod : void 0)) {
						return this.error('cannot use super outside of an instance method');
					}
				}

				astNode(o) {
					var ref1;
					this.checkInInstanceMethod(o);
					if (this.accessor != null) {
						return (new Value(new Super().withLocationDataFrom((ref1 = this.superLiteral) != null ? ref1 : this), [this.accessor]).withLocationDataFrom(this)).ast(o);
					}
					return super.astNode(o);
				}

			};

			Super.prototype.children = ['accessor'];

			return Super;

		}).call(this);

		//### RegexWithInterpolations

		// Regexes with interpolations are in fact just a variation of a `Call` (a
		// `RegExp()` call to be precise) with a `StringWithInterpolations` inside.
		exports.RegexWithInterpolations = RegexWithInterpolations = (function() {
			class RegexWithInterpolations extends Base {
				constructor(call1, {heregexCommentTokens: heregexCommentTokens = []} = {}) {
					super();
					this.call = call1;
					this.heregexCommentTokens = heregexCommentTokens;
				}

				compileNode(o) {
					return this.call.compileNode(o);
				}

				astType() {
					return 'InterpolatedRegExpLiteral';
				}

				astProperties(o) {
					var heregexCommentToken, ref1, ref2;
					return {
						interpolatedPattern: this.call.args[0].ast(o),
						flags: (ref1 = (ref2 = this.call.args[1]) != null ? ref2.unwrap().originalValue : void 0) != null ? ref1 : '',
						comments: (function() {
							var j, len1, ref3, results1;
							ref3 = this.heregexCommentTokens;
							results1 = [];
							for (j = 0, len1 = ref3.length; j < len1; j++) {
								heregexCommentToken = ref3[j];
								if (heregexCommentToken.here) {
									results1.push(new HereComment(heregexCommentToken).ast(o));
								} else {
									results1.push(new LineComment(heregexCommentToken).ast(o));
								}
							}
							return results1;
						}).call(this)
					};
				}

			};

			RegexWithInterpolations.prototype.children = ['call'];

			return RegexWithInterpolations;

		}).call(this);

		//### TaggedTemplateCall
		exports.TaggedTemplateCall = TaggedTemplateCall = class TaggedTemplateCall extends Call {
			constructor(variable, arg, soak) {
				if (arg instanceof StringLiteral) {
					arg = StringWithInterpolations.fromStringLiteral(arg);
				}
				super(variable, [arg], soak);
			}

			compileNode(o) {
				return this.variable.compileToFragments(o, LEVEL_ACCESS).concat(this.args[0].compileToFragments(o, LEVEL_LIST));
			}

			astType() {
				return 'TaggedTemplateExpression';
			}

			astProperties(o) {
				return {
					tag: this.variable.ast(o, LEVEL_ACCESS),
					quasi: this.args[0].ast(o, LEVEL_LIST)
				};
			}

		};

		//### Extends

		// Node to extend an object's prototype with an ancestor object.
		// After `goog.inherits` from the
		// [Closure Library](https://github.com/google/closure-library/blob/master/closure/goog/base.js).
		exports.Extends = Extends = (function() {
			class Extends extends Base {
				constructor(child1, parent1) {
					super();
					this.child = child1;
					this.parent = parent1;
				}

				// Hooks one constructor into another's prototype chain.
				compileToFragments(o) {
					return new Call(new Value(new Literal(utility('extend', o))), [this.child, this.parent]).compileToFragments(o);
				}

			};

			Extends.prototype.children = ['child', 'parent'];

			return Extends;

		}).call(this);

		//### Access

		// A `.` access into a property of a value, or the `::` shorthand for
		// an access into the object's prototype.
		exports.Access = Access = (function() {
			class Access extends Base {
				constructor(name1, {
						soak: soak1,
						shorthand
					} = {}) {
					super();
					this.name = name1;
					this.soak = soak1;
					this.shorthand = shorthand;
				}

				compileToFragments(o) {
					var name, node;
					name = this.name.compileToFragments(o);
					node = this.name.unwrap();
					if (node instanceof PropertyName) {
						return [this.makeCode('.'), ...name];
					} else {
						return [this.makeCode('['), ...name, this.makeCode(']')];
					}
				}

				astNode(o) {
					// Babel doesn’t have an AST node for `Access`, but rather just includes
					// this Access node’s child `name` Identifier node as the `property` of
					// the `MemberExpression` node.
					return this.name.ast(o);
				}

			};

			Access.prototype.children = ['name'];

			Access.prototype.shouldCache = NO;

			return Access;

		}).call(this);

		//### Index

		// A `[ ... ]` indexed access into an array or object.
		exports.Index = Index = (function() {
			class Index extends Base {
				constructor(index1) {
					super();
					this.index = index1;
				}

				compileToFragments(o) {
					return [].concat(this.makeCode("["), this.index.compileToFragments(o, LEVEL_PAREN), this.makeCode("]"));
				}

				shouldCache() {
					return this.index.shouldCache();
				}

				astNode(o) {
					// Babel doesn’t have an AST node for `Index`, but rather just includes
					// this Index node’s child `index` Identifier node as the `property` of
					// the `MemberExpression` node. The fact that the `MemberExpression`’s
					// `property` is an Index means that `computed` is `true` for the
					// `MemberExpression`.
					return this.index.ast(o);
				}

			};

			Index.prototype.children = ['index'];

			return Index;

		}).call(this);

		//### Range

		// A range literal. Ranges can be used to extract portions (slices) of arrays,
		// to specify a range for comprehensions, or as a value, to be expanded into the
		// corresponding array of integers at runtime.
		exports.Range = Range = (function() {
			class Range extends Base {
				constructor(from1, to1, tag) {
					super();
					this.from = from1;
					this.to = to1;
					this.exclusive = tag === 'exclusive';
					this.equals = this.exclusive ? '' : '=';
				}

				// Compiles the range's source variables -- where it starts and where it ends.
				// But only if they need to be cached to avoid double evaluation.
				compileVariables(o) {
					var shouldCache, step;
					o = merge(o, {
						top: true
					});
					shouldCache = del(o, 'shouldCache');
					[this.fromC, this.fromVar] = this.cacheToCodeFragments(this.from.cache(o, LEVEL_LIST, shouldCache));
					[this.toC, this.toVar] = this.cacheToCodeFragments(this.to.cache(o, LEVEL_LIST, shouldCache));
					if (step = del(o, 'step')) {
						[this.step, this.stepVar] = this.cacheToCodeFragments(step.cache(o, LEVEL_LIST, shouldCache));
					}
					this.fromNum = this.from.isNumber() ? parseNumber(this.fromVar) : null;
					this.toNum = this.to.isNumber() ? parseNumber(this.toVar) : null;
					return this.stepNum = (step != null ? step.isNumber() : void 0) ? parseNumber(this.stepVar) : null;
				}

				// When compiled normally, the range returns the contents of the *for loop*
				// needed to iterate over the values in the range. Used by comprehensions.
				compileNode(o) {
					var cond, condPart, from, gt, idx, idxName, known, lowerBound, lt, namedIndex, ref1, ref2, stepCond, stepNotZero, stepPart, to, upperBound, varPart;
					if (!this.fromVar) {
						this.compileVariables(o);
					}
					if (!o.index) {
						return this.compileArray(o);
					}
					// Set up endpoints.
					known = (this.fromNum != null) && (this.toNum != null);
					idx = del(o, 'index');
					idxName = del(o, 'name');
					namedIndex = idxName && idxName !== idx;
					varPart = known && !namedIndex ? `var ${idx} = ${this.fromC}` : `${idx} = ${this.fromC}`;
					if (this.toC !== this.toVar) {
						varPart += `, ${this.toC}`;
					}
					if (this.step !== this.stepVar) {
						varPart += `, ${this.step}`;
					}
					[lt, gt] = [`${idx} <${this.equals}`, `${idx} >${this.equals}`];
					// Generate the condition.
					[from, to] = [this.fromNum, this.toNum];
					// Always check if the `step` isn't zero to avoid the infinite loop.
					stepNotZero = `${(ref1 = this.stepNum) != null ? ref1 : this.stepVar} !== 0`;
					stepCond = `${(ref2 = this.stepNum) != null ? ref2 : this.stepVar} > 0`;
					lowerBound = `${lt} ${known ? to : this.toVar}`;
					upperBound = `${gt} ${known ? to : this.toVar}`;
					condPart = this.step != null ? (this.stepNum != null) && this.stepNum !== 0 ? this.stepNum > 0 ? `${lowerBound}` : `${upperBound}` : `${stepNotZero} && (${stepCond} ? ${lowerBound} : ${upperBound})` : known ? `${from <= to ? lt : gt} ${to}` : `(${this.fromVar} <= ${this.toVar} ? ${lowerBound} : ${upperBound})`;
					cond = this.stepVar ? `${this.stepVar} > 0` : `${this.fromVar} <= ${this.toVar}`;
					// Generate the step.
					stepPart = this.stepVar ? `${idx} += ${this.stepVar}` : known ? namedIndex ? from <= to ? `++${idx}` : `--${idx}` : from <= to ? `${idx}++` : `${idx}--` : namedIndex ? `${cond} ? ++${idx} : --${idx}` : `${cond} ? ${idx}++ : ${idx}--`;
					if (namedIndex) {
						varPart = `${idxName} = ${varPart}`;
					}
					if (namedIndex) {
						stepPart = `${idxName} = ${stepPart}`;
					}
					// The final loop body.
					return [this.makeCode(`${varPart}; ${condPart}; ${stepPart}`)];
				}

				// When used as a value, expand the range into the equivalent array.
				compileArray(o) {
					var args, body, cond, hasArgs, i, idt, known, post, pre, range, ref1, ref2, result, vars;
					known = (this.fromNum != null) && (this.toNum != null);
					if (known && Math.abs(this.fromNum - this.toNum) <= 20) {
						range = (function() {
							var results1 = [];
							for (var j = ref1 = this.fromNum, ref2 = this.toNum; ref1 <= ref2 ? j <= ref2 : j >= ref2; ref1 <= ref2 ? j++ : j--){ results1.push(j); }
							return results1;
						}).apply(this);
						if (this.exclusive) {
							range.pop();
						}
						return [this.makeCode(`[${range.join(', ')}]`)];
					}
					idt = this.tab + TAB;
					i = o.scope.freeVariable('i', {
						single: true,
						reserve: false
					});
					result = o.scope.freeVariable('results', {
						reserve: false
					});
					pre = `\n${idt}var ${result} = [];`;
					if (known) {
						o.index = i;
						body = fragmentsToText(this.compileNode(o));
					} else {
						vars = `${i} = ${this.fromC}` + (this.toC !== this.toVar ? `, ${this.toC}` : '');
						cond = `${this.fromVar} <= ${this.toVar}`;
						body = `var ${vars}; ${cond} ? ${i} <${this.equals} ${this.toVar} : ${i} >${this.equals} ${this.toVar}; ${cond} ? ${i}++ : ${i}--`;
					}
					post = `{ ${result}.push(${i}); }\n${idt}return ${result};\n${o.indent}`;
					hasArgs = function(node) {
						return node != null ? node.contains(isLiteralArguments) : void 0;
					};
					if (hasArgs(this.from) || hasArgs(this.to)) {
						args = ', arguments';
					}
					return [this.makeCode(`(function() {${pre}\n${idt}for (${body})${post}}).apply(this${args != null ? args : ''})`)];
				}

				astProperties(o) {
					var ref1, ref2, ref3, ref4;
					return {
						from: (ref1 = (ref2 = this.from) != null ? ref2.ast(o) : void 0) != null ? ref1 : null,
						to: (ref3 = (ref4 = this.to) != null ? ref4.ast(o) : void 0) != null ? ref3 : null,
						exclusive: this.exclusive
					};
				}

			};

			Range.prototype.children = ['from', 'to'];

			return Range;

		}).call(this);

		//### Slice

		// An array slice literal. Unlike JavaScript’s `Array#slice`, the second parameter
		// specifies the index of the end of the slice, just as the first parameter
		// is the index of the beginning.
		exports.Slice = Slice = (function() {
			class Slice extends Base {
				constructor(range1) {
					super();
					this.range = range1;
				}

				// We have to be careful when trying to slice through the end of the array,
				// `9e9` is used because not all implementations respect `undefined` or `1/0`.
				// `9e9` should be safe because `9e9` > `2**32`, the max array length.
				compileNode(o) {
					var compiled, compiledText, from, fromCompiled, to, toStr;
					({to, from} = this.range);
					// Handle an expression in the property access, e.g. `a[!b in c..]`.
					if (from != null ? from.shouldCache() : void 0) {
						from = new Value(new Parens(from));
					}
					if (to != null ? to.shouldCache() : void 0) {
						to = new Value(new Parens(to));
					}
					fromCompiled = (from != null ? from.compileToFragments(o, LEVEL_PAREN) : void 0) || [this.makeCode('0')];
					if (to) {
						compiled = to.compileToFragments(o, LEVEL_PAREN);
						compiledText = fragmentsToText(compiled);
						if (!(!this.range.exclusive && +compiledText === -1)) {
							toStr = ', ' + (this.range.exclusive ? compiledText : to.isNumber() ? `${+compiledText + 1}` : (compiled = to.compileToFragments(o, LEVEL_ACCESS), `+${fragmentsToText(compiled)} + 1 || 9e9`));
						}
					}
					return [this.makeCode(`.slice(${fragmentsToText(fromCompiled)}${toStr || ''})`)];
				}

				astNode(o) {
					return this.range.ast(o);
				}

			};

			Slice.prototype.children = ['range'];

			return Slice;

		}).call(this);

		//### Obj

		// An object literal, nothing fancy.
		exports.Obj = Obj = (function() {
			class Obj extends Base {
				constructor(props, generated = false) {
					super();
					this.generated = generated;
					this.objects = this.properties = props || [];
				}

				isAssignable(opts) {
					var j, len1, message, prop, ref1, ref2;
					ref1 = this.properties;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						prop = ref1[j];
						// Check for reserved words.
						message = isUnassignable(prop.unwrapAll().value);
						if (message) {
							prop.error(message);
						}
						if (prop instanceof Assign && prop.context === 'object' && !(((ref2 = prop.value) != null ? ref2.base : void 0) instanceof Arr)) {
							prop = prop.value;
						}
						if (!prop.isAssignable(opts)) {
							return false;
						}
					}
					return true;
				}

				shouldCache() {
					return !this.isAssignable();
				}

				// Check if object contains splat.
				hasSplat() {
					var j, len1, prop, ref1;
					ref1 = this.properties;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						prop = ref1[j];
						if (prop instanceof Splat) {
							return true;
						}
					}
					return false;
				}

				// Move rest property to the end of the list.
				// `{a, rest..., b} = obj` -> `{a, b, rest...} = obj`
				// `foo = ({a, rest..., b}) ->` -> `foo = {a, b, rest...}) ->`
				reorderProperties() {
					var props, splatProp, splatProps;
					props = this.properties;
					splatProps = this.getAndCheckSplatProps();
					splatProp = props.splice(splatProps[0], 1);
					return this.objects = this.properties = [].concat(props, splatProp);
				}

				compileNode(o) {
					var answer, i, idt, indent, isCompact, j, join, k, key, l, lastNode, len1, len2, len3, node, prop, props, ref1, value;
					if (this.hasSplat() && this.lhs) {
						this.reorderProperties();
					}
					props = this.properties;
					if (this.generated) {
						for (j = 0, len1 = props.length; j < len1; j++) {
							node = props[j];
							if (node instanceof Value) {
								node.error('cannot have an implicit value in an implicit object');
							}
						}
					}
					idt = o.indent += TAB;
					lastNode = this.lastNode(this.properties);
					// If this object is the left-hand side of an assignment, all its children
					// are too.
					this.propagateLhs();
					isCompact = true;
					ref1 = this.properties;
					for (k = 0, len2 = ref1.length; k < len2; k++) {
						prop = ref1[k];
						if (prop instanceof Assign && prop.context === 'object') {
							isCompact = false;
						}
					}
					answer = [];
					answer.push(this.makeCode(isCompact ? '' : '\n'));
					for (i = l = 0, len3 = props.length; l < len3; i = ++l) {
						prop = props[i];
						join = i === props.length - 1 ? '' : isCompact ? ', ' : prop === lastNode ? '\n' : ',\n';
						indent = isCompact ? '' : idt;
						key = prop instanceof Assign && prop.context === 'object' ? prop.variable : prop instanceof Assign ? (!this.lhs ? prop.operatorToken.error(`unexpected ${prop.operatorToken.value}`) : void 0, prop.variable) : prop;
						if (key instanceof Value && key.hasProperties()) {
							if (prop.context === 'object' || !key.this) {
								key.error('invalid object key');
							}
							key = key.properties[0].name;
							prop = new Assign(key, prop, 'object');
						}
						if (key === prop) {
							if (prop.shouldCache()) {
								[key, value] = prop.base.cache(o);
								if (key instanceof IdentifierLiteral) {
									key = new PropertyName(key.value);
								}
								prop = new Assign(key, value, 'object');
							} else if (key instanceof Value && key.base instanceof ComputedPropertyName) {
								// `{ [foo()] }` output as `{ [ref = foo()]: ref }`.
								if (prop.base.value.shouldCache()) {
									[key, value] = prop.base.value.cache(o);
									if (key instanceof IdentifierLiteral) {
										key = new ComputedPropertyName(key.value);
									}
									prop = new Assign(key, value, 'object');
								} else {
									// `{ [expression] }` output as `{ [expression]: expression }`.
									prop = new Assign(key, prop.base.value, 'object');
								}
							} else if (!(typeof prop.bareLiteral === "function" ? prop.bareLiteral(IdentifierLiteral) : void 0) && !(prop instanceof Splat)) {
								prop = new Assign(prop, prop, 'object');
							}
						}
						if (indent) {
							answer.push(this.makeCode(indent));
						}
						answer.push(...prop.compileToFragments(o, LEVEL_TOP));
						if (join) {
							answer.push(this.makeCode(join));
						}
					}
					answer.push(this.makeCode(isCompact ? '' : `\n${this.tab}`));
					answer = this.wrapInBraces(answer);
					if (this.front) {
						return this.wrapInParentheses(answer);
					} else {
						return answer;
					}
				}

				getAndCheckSplatProps() {
					var i, prop, props, splatProps;
					if (!(this.hasSplat() && this.lhs)) {
						return;
					}
					props = this.properties;
					splatProps = (function() {
						var j, len1, results1;
						results1 = [];
						for (i = j = 0, len1 = props.length; j < len1; i = ++j) {
							prop = props[i];
							if (prop instanceof Splat) {
								results1.push(i);
							}
						}
						return results1;
					})();
					if ((splatProps != null ? splatProps.length : void 0) > 1) {
						props[splatProps[1]].error("multiple spread elements are disallowed");
					}
					return splatProps;
				}

				assigns(name) {
					var j, len1, prop, ref1;
					ref1 = this.properties;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						prop = ref1[j];
						if (prop.assigns(name)) {
							return true;
						}
					}
					return false;
				}

				eachName(iterator) {
					var j, len1, prop, ref1, results1;
					ref1 = this.properties;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						prop = ref1[j];
						if (prop instanceof Assign && prop.context === 'object') {
							prop = prop.value;
						}
						prop = prop.unwrapAll();
						if (prop.eachName != null) {
							results1.push(prop.eachName(iterator));
						} else {
							results1.push(void 0);
						}
					}
					return results1;
				}

				// Convert “bare” properties to `ObjectProperty`s (or `Splat`s).
				expandProperty(property) {
					var context, key, operatorToken, variable;
					({variable, context, operatorToken} = property);
					key = property instanceof Assign && context === 'object' ? variable : property instanceof Assign ? (!this.lhs ? operatorToken.error(`unexpected ${operatorToken.value}`) : void 0, variable) : property;
					if (key instanceof Value && key.hasProperties()) {
						if (!(context !== 'object' && key.this)) {
							key.error('invalid object key');
						}
						if (property instanceof Assign) {
							return new ObjectProperty({
								fromAssign: property
							});
						} else {
							return new ObjectProperty({
								key: property
							});
						}
					}
					if (key !== property) {
						return new ObjectProperty({
							fromAssign: property
						});
					}
					if (property instanceof Splat) {
						return property;
					}
					return new ObjectProperty({
						key: property
					});
				}

				expandProperties() {
					var j, len1, property, ref1, results1;
					ref1 = this.properties;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						property = ref1[j];
						results1.push(this.expandProperty(property));
					}
					return results1;
				}

				propagateLhs(setLhs) {
					var j, len1, property, ref1, results1, unwrappedValue, value;
					if (setLhs) {
						this.lhs = true;
					}
					if (!this.lhs) {
						return;
					}
					ref1 = this.properties;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						property = ref1[j];
						if (property instanceof Assign && property.context === 'object') {
							({value} = property);
							unwrappedValue = value.unwrapAll();
							if (unwrappedValue instanceof Arr || unwrappedValue instanceof Obj) {
								results1.push(unwrappedValue.propagateLhs(true));
							} else if (unwrappedValue instanceof Assign) {
								results1.push(unwrappedValue.nestedLhs = true);
							} else {
								results1.push(void 0);
							}
						} else if (property instanceof Assign) {
							// Shorthand property with default, e.g. `{a = 1} = b`.
							results1.push(property.nestedLhs = true);
						} else if (property instanceof Splat) {
							results1.push(property.propagateLhs(true));
						} else {
							results1.push(void 0);
						}
					}
					return results1;
				}

				astNode(o) {
					this.getAndCheckSplatProps();
					return super.astNode(o);
				}

				astType() {
					if (this.lhs) {
						return 'ObjectPattern';
					} else {
						return 'ObjectExpression';
					}
				}

				astProperties(o) {
					var property;
					return {
						implicit: !!this.generated,
						properties: (function() {
							var j, len1, ref1, results1;
							ref1 = this.expandProperties();
							results1 = [];
							for (j = 0, len1 = ref1.length; j < len1; j++) {
								property = ref1[j];
								results1.push(property.ast(o));
							}
							return results1;
						}).call(this)
					};
				}

			};

			Obj.prototype.children = ['properties'];

			return Obj;

		}).call(this);

		exports.ObjectProperty = ObjectProperty = class ObjectProperty extends Base {
			constructor({key, fromAssign}) {
				var context, value;
				super();
				if (fromAssign) {
					({
						variable: this.key,
						value,
						context
					} = fromAssign);
					if (context === 'object') {
						// All non-shorthand properties (i.e. includes `:`).
						this.value = value;
					} else {
						// Left-hand-side shorthand with default e.g. `{a = 1} = b`.
						this.value = fromAssign;
						this.shorthand = true;
					}
					this.locationData = fromAssign.locationData;
				} else {
					// Shorthand without default e.g. `{a}` or `{@a}` or `{[a]}`.
					this.key = key;
					this.shorthand = true;
					this.locationData = key.locationData;
				}
			}

			astProperties(o) {
				var isComputedPropertyName, keyAst, ref1, ref2;
				isComputedPropertyName = (this.key instanceof Value && this.key.base instanceof ComputedPropertyName) || this.key.unwrap() instanceof StringWithInterpolations;
				keyAst = this.key.ast(o, LEVEL_LIST);
				return {
					key: (keyAst != null ? keyAst.declaration : void 0) ? Object.assign({}, keyAst, {
						declaration: false
					}) : keyAst,
					value: (ref1 = (ref2 = this.value) != null ? ref2.ast(o, LEVEL_LIST) : void 0) != null ? ref1 : keyAst,
					shorthand: !!this.shorthand,
					computed: !!isComputedPropertyName,
					method: false
				};
			}

		};

		//### Arr

		// An array literal.
		exports.Arr = Arr = (function() {
			class Arr extends Base {
				constructor(objs, lhs1 = false) {
					super();
					this.lhs = lhs1;
					this.objects = objs || [];
					this.propagateLhs();
				}

				hasElision() {
					var j, len1, obj, ref1;
					ref1 = this.objects;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						obj = ref1[j];
						if (obj instanceof Elision) {
							return true;
						}
					}
					return false;
				}

				isAssignable(opts) {
					var allowEmptyArray, allowExpansion, allowNontrailingSplat, i, j, len1, obj, ref1;
					({allowExpansion, allowNontrailingSplat, allowEmptyArray = false} = opts != null ? opts : {});
					if (!this.objects.length) {
						return allowEmptyArray;
					}
					ref1 = this.objects;
					for (i = j = 0, len1 = ref1.length; j < len1; i = ++j) {
						obj = ref1[i];
						if (!allowNontrailingSplat && obj instanceof Splat && i + 1 !== this.objects.length) {
							return false;
						}
						if (!((allowExpansion && obj instanceof Expansion) || (obj.isAssignable(opts) && (!obj.isAtomic || obj.isAtomic())))) {
							return false;
						}
					}
					return true;
				}

				shouldCache() {
					return !this.isAssignable();
				}

				compileNode(o) {
					var answer, compiledObjs, fragment, fragmentIndex, fragmentIsElision, fragments, includesLineCommentsOnNonFirstElement, index, j, k, l, len1, len2, len3, len4, len5, obj, objIndex, olen, p, passedElision, q, ref1, ref2, unwrappedObj;
					if (!this.objects.length) {
						return [this.makeCode('[]')];
					}
					o.indent += TAB;
					fragmentIsElision = function([fragment]) {
						return fragment.type === 'Elision' && fragment.code.trim() === ',';
					};
					// Detect if `Elision`s at the beginning of the array are processed (e.g. [, , , a]).
					passedElision = false;
					answer = [];
					ref1 = this.objects;
					for (objIndex = j = 0, len1 = ref1.length; j < len1; objIndex = ++j) {
						obj = ref1[objIndex];
						unwrappedObj = obj.unwrapAll();
						// Let `compileCommentFragments` know to intersperse block comments
						// into the fragments created when compiling this array.
						if (unwrappedObj.comments && unwrappedObj.comments.filter(function(comment) {
							return !comment.here;
						}).length === 0) {
							unwrappedObj.includeCommentFragments = YES;
						}
					}
					compiledObjs = (function() {
						var k, len2, ref2, results1;
						ref2 = this.objects;
						results1 = [];
						for (k = 0, len2 = ref2.length; k < len2; k++) {
							obj = ref2[k];
							results1.push(obj.compileToFragments(o, LEVEL_LIST));
						}
						return results1;
					}).call(this);
					olen = compiledObjs.length;
					// If `compiledObjs` includes newlines, we will output this as a multiline
					// array (i.e. with a newline and indentation after the `[`). If an element
					// contains line comments, that should also trigger multiline output since
					// by definition line comments will introduce newlines into our output.
					// The exception is if only the first element has line comments; in that
					// case, output as the compact form if we otherwise would have, so that the
					// first element’s line comments get output before or after the array.
					includesLineCommentsOnNonFirstElement = false;
					for (index = k = 0, len2 = compiledObjs.length; k < len2; index = ++k) {
						fragments = compiledObjs[index];
						for (l = 0, len3 = fragments.length; l < len3; l++) {
							fragment = fragments[l];
							if (fragment.isHereComment) {
								fragment.code = fragment.code.trim();
							} else if (index !== 0 && includesLineCommentsOnNonFirstElement === false && hasLineComments(fragment)) {
								includesLineCommentsOnNonFirstElement = true;
							}
						}
						// Add ', ' if all `Elisions` from the beginning of the array are processed (e.g. [, , , a]) and
						// element isn't `Elision` or last element is `Elision` (e.g. [a,,b,,])
						if (index !== 0 && passedElision && (!fragmentIsElision(fragments) || index === olen - 1)) {
							answer.push(this.makeCode(', '));
						}
						passedElision = passedElision || !fragmentIsElision(fragments);
						answer.push(...fragments);
					}
					if (includesLineCommentsOnNonFirstElement || indexOf.call(fragmentsToText(answer), '\n') >= 0) {
						for (fragmentIndex = p = 0, len4 = answer.length; p < len4; fragmentIndex = ++p) {
							fragment = answer[fragmentIndex];
							if (fragment.isHereComment) {
								fragment.code = `${multident(fragment.code, o.indent, false)}\n${o.indent}`;
							} else if (fragment.code === ', ' && !(fragment != null ? fragment.isElision : void 0) && ((ref2 = fragment.type) !== 'StringLiteral' && ref2 !== 'StringWithInterpolations')) {
								fragment.code = `,\n${o.indent}`;
							}
						}
						answer.unshift(this.makeCode(`[\n${o.indent}`));
						answer.push(this.makeCode(`\n${this.tab}]`));
					} else {
						for (q = 0, len5 = answer.length; q < len5; q++) {
							fragment = answer[q];
							if (fragment.isHereComment) {
								fragment.code = `${fragment.code} `;
							}
						}
						answer.unshift(this.makeCode('['));
						answer.push(this.makeCode(']'));
					}
					return answer;
				}

				assigns(name) {
					var j, len1, obj, ref1;
					ref1 = this.objects;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						obj = ref1[j];
						if (obj.assigns(name)) {
							return true;
						}
					}
					return false;
				}

				eachName(iterator) {
					var j, len1, obj, ref1, results1;
					ref1 = this.objects;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						obj = ref1[j];
						obj = obj.unwrapAll();
						results1.push(obj.eachName(iterator));
					}
					return results1;
				}

				// If this array is the left-hand side of an assignment, all its children
				// are too.
				propagateLhs(setLhs) {
					var j, len1, object, ref1, results1, unwrappedObject;
					if (setLhs) {
						this.lhs = true;
					}
					if (!this.lhs) {
						return;
					}
					ref1 = this.objects;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						object = ref1[j];
						if (object instanceof Splat || object instanceof Expansion) {
							object.lhs = true;
						}
						unwrappedObject = object.unwrapAll();
						if (unwrappedObject instanceof Arr || unwrappedObject instanceof Obj) {
							results1.push(unwrappedObject.propagateLhs(true));
						} else if (unwrappedObject instanceof Assign) {
							results1.push(unwrappedObject.nestedLhs = true);
						} else {
							results1.push(void 0);
						}
					}
					return results1;
				}

				astType() {
					if (this.lhs) {
						return 'ArrayPattern';
					} else {
						return 'ArrayExpression';
					}
				}

				astProperties(o) {
					var object;
					return {
						elements: (function() {
							var j, len1, ref1, results1;
							ref1 = this.objects;
							results1 = [];
							for (j = 0, len1 = ref1.length; j < len1; j++) {
								object = ref1[j];
								results1.push(object.ast(o, LEVEL_LIST));
							}
							return results1;
						}).call(this)
					};
				}

			};

			Arr.prototype.children = ['objects'];

			return Arr;

		}).call(this);

		//### Class

		// The CoffeeScript class definition.
		// Initialize a **Class** with its name, an optional superclass, and a body.
		exports.Class = Class = (function() {
			class Class extends Base {
				constructor(variable1, parent1, body1) {
					super();
					this.variable = variable1;
					this.parent = parent1;
					this.body = body1;
					if (this.body == null) {
						this.body = new Block();
						this.hasGeneratedBody = true;
					}
				}

				compileNode(o) {
					var executableBody, node, parentName;
					this.name = this.determineName();
					executableBody = this.walkBody(o);
					if (this.parent instanceof Value && !this.parent.hasProperties()) {
						// Special handling to allow `class expr.A extends A` declarations
						parentName = this.parent.base.value;
					}
					this.hasNameClash = (this.name != null) && this.name === parentName;
					node = this;
					if (executableBody || this.hasNameClash) {
						node = new ExecutableClassBody(node, executableBody);
					} else if ((this.name == null) && o.level === LEVEL_TOP) {
						// Anonymous classes are only valid in expressions
						node = new Parens(node);
					}
					if (this.boundMethods.length && this.parent) {
						if (this.variable == null) {
							this.variable = new IdentifierLiteral(o.scope.freeVariable('_class'));
						}
						if (this.variableRef == null) {
							[this.variable, this.variableRef] = this.variable.cache(o);
						}
					}
					if (this.variable) {
						node = new Assign(this.variable, node, null, {moduleDeclaration: this.moduleDeclaration});
					}
					this.compileNode = this.compileClassDeclaration;
					try {
						return node.compileToFragments(o);
					} finally {
						delete this.compileNode;
					}
				}

				compileClassDeclaration(o) {
					var ref1, ref2, result;
					if (this.externalCtor || this.boundMethods.length) {
						if (this.ctor == null) {
							this.ctor = this.makeDefaultConstructor();
						}
					}
					if ((ref1 = this.ctor) != null) {
						ref1.noReturn = true;
					}
					if (this.boundMethods.length) {
						this.proxyBoundMethods();
					}
					o.indent += TAB;
					result = [];
					result.push(this.makeCode("class "));
					if (this.name) {
						result.push(this.makeCode(this.name));
					}
					if (((ref2 = this.variable) != null ? ref2.comments : void 0) != null) {
						this.compileCommentFragments(o, this.variable, result);
					}
					if (this.name) {
						result.push(this.makeCode(' '));
					}
					if (this.parent) {
						result.push(this.makeCode('extends '), ...this.parent.compileToFragments(o), this.makeCode(' '));
					}
					result.push(this.makeCode('{'));
					if (!this.body.isEmpty()) {
						this.body.spaced = true;
						result.push(this.makeCode('\n'));
						result.push(...this.body.compileToFragments(o, LEVEL_TOP));
						result.push(this.makeCode(`\n${this.tab}`));
					}
					result.push(this.makeCode('}'));
					return result;
				}

				// Figure out the appropriate name for this class
				determineName() {
					var message, name, node, ref1, tail;
					if (!this.variable) {
						return null;
					}
					ref1 = this.variable.properties, [tail] = slice1.call(ref1, -1);
					node = tail ? tail instanceof Access && tail.name : this.variable.base;
					if (!(node instanceof IdentifierLiteral || node instanceof PropertyName)) {
						return null;
					}
					name = node.value;
					if (!tail) {
						message = isUnassignable(name);
						if (message) {
							this.variable.error(message);
						}
					}
					if (indexOf.call(JS_FORBIDDEN, name) >= 0) {
						return `_${name}`;
					} else {
						return name;
					}
				}

				walkBody(o) {
					var assign, end, executableBody, expression, expressions, exprs, i, initializer, initializerExpression, j, k, len1, len2, method, properties, pushSlice, ref1, start;
					this.ctor = null;
					this.boundMethods = [];
					executableBody = null;
					initializer = [];
					({expressions} = this.body);
					i = 0;
					ref1 = expressions.slice();
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						expression = ref1[j];
						if (expression instanceof Value && expression.isObject(true)) {
							({properties} = expression.base);
							exprs = [];
							end = 0;
							start = 0;
							pushSlice = function() {
								if (end > start) {
									return exprs.push(new Value(new Obj(properties.slice(start, end), true)));
								}
							};
							while (assign = properties[end]) {
								if (initializerExpression = this.addInitializerExpression(assign, o)) {
									pushSlice();
									exprs.push(initializerExpression);
									initializer.push(initializerExpression);
									start = end + 1;
								}
								end++;
							}
							pushSlice();
							splice.apply(expressions, [i, i - i + 1].concat(exprs)), exprs;
							i += exprs.length;
						} else {
							if (initializerExpression = this.addInitializerExpression(expression, o)) {
								initializer.push(initializerExpression);
								expressions[i] = initializerExpression;
							}
							i += 1;
						}
					}
					for (k = 0, len2 = initializer.length; k < len2; k++) {
						method = initializer[k];
						if (method instanceof Code) {
							if (method.ctor) {
								if (this.ctor) {
									method.error('Cannot define more than one constructor in a class');
								}
								this.ctor = method;
							} else if (method.isStatic && method.bound) {
								method.context = this.name;
							} else if (method.bound) {
								this.boundMethods.push(method);
							}
						}
					}
					if (!o.compiling) {
						return;
					}
					if (initializer.length !== expressions.length) {
						this.body.expressions = (function() {
							var l, len3, results1;
							results1 = [];
							for (l = 0, len3 = initializer.length; l < len3; l++) {
								expression = initializer[l];
								results1.push(expression.hoist());
							}
							return results1;
						})();
						return new Block(expressions);
					}
				}

				// Add an expression to the class initializer

				// This is the key method for determining whether an expression in a class
				// body should appear in the initializer or the executable body. If the given
				// `node` is valid in a class body the method will return a (new, modified,
				// or identical) node for inclusion in the class initializer, otherwise
				// nothing will be returned and the node will appear in the executable body.

				// At time of writing, only methods (instance and static) are valid in ES
				// class initializers. As new ES class features (such as class fields) reach
				// Stage 4, this method will need to be updated to support them. We
				// additionally allow `PassthroughLiteral`s (backticked expressions) in the
				// initializer as an escape hatch for ES features that are not implemented
				// (e.g. getters and setters defined via the `get` and `set` keywords as
				// opposed to the `Object.defineProperty` method).
				addInitializerExpression(node, o) {
					if (node.unwrapAll() instanceof PassthroughLiteral) {
						return node;
					} else if (this.validInitializerMethod(node)) {
						return this.addInitializerMethod(node);
					} else if (!o.compiling && this.validClassProperty(node)) {
						return this.addClassProperty(node);
					} else if (!o.compiling && this.validClassPrototypeProperty(node)) {
						return this.addClassPrototypeProperty(node);
					} else {
						return null;
					}
				}

				// Checks if the given node is a valid ES class initializer method.
				validInitializerMethod(node) {
					if (!(node instanceof Assign && node.value instanceof Code)) {
						return false;
					}
					if (node.context === 'object' && !node.variable.hasProperties()) {
						return true;
					}
					return node.variable.looksStatic(this.name) && (this.name || !node.value.bound);
				}

				// Returns a configured class initializer method
				addInitializerMethod(assign) {
					var isConstructor, method, methodName, operatorToken, variable;
					({
						variable,
						value: method,
						operatorToken
					} = assign);
					method.isMethod = true;
					method.isStatic = variable.looksStatic(this.name);
					if (method.isStatic) {
						method.name = variable.properties[0];
					} else {
						methodName = variable.base;
						method.name = new (methodName.shouldCache() ? Index : Access)(methodName);
						method.name.updateLocationDataIfMissing(methodName.locationData);
						isConstructor = methodName instanceof StringLiteral ? methodName.originalValue === 'constructor' : methodName.value === 'constructor';
						if (isConstructor) {
							method.ctor = (this.parent ? 'derived' : 'base');
						}
						if (method.bound && method.ctor) {
							method.error('Cannot define a constructor as a bound (fat arrow) function');
						}
					}
					method.operatorToken = operatorToken;
					return method;
				}

				validClassProperty(node) {
					if (!(node instanceof Assign)) {
						return false;
					}
					return node.variable.looksStatic(this.name);
				}

				addClassProperty(assign) {
					var operatorToken, staticClassName, value, variable;
					({variable, value, operatorToken} = assign);
					({staticClassName} = variable.looksStatic(this.name));
					return new ClassProperty({
						name: variable.properties[0],
						isStatic: true,
						staticClassName,
						value,
						operatorToken
					}).withLocationDataFrom(assign);
				}

				validClassPrototypeProperty(node) {
					if (!(node instanceof Assign)) {
						return false;
					}
					return node.context === 'object' && !node.variable.hasProperties();
				}

				addClassPrototypeProperty(assign) {
					var value, variable;
					({variable, value} = assign);
					return new ClassPrototypeProperty({
						name: variable.base,
						value
					}).withLocationDataFrom(assign);
				}

				makeDefaultConstructor() {
					var applyArgs, applyCtor, ctor;
					ctor = this.addInitializerMethod(new Assign(new Value(new PropertyName('constructor')), new Code()));
					this.body.unshift(ctor);
					if (this.parent) {
						ctor.body.push(new SuperCall(new Super(), [new Splat(new IdentifierLiteral('arguments'))]));
					}
					if (this.externalCtor) {
						applyCtor = new Value(this.externalCtor, [new Access(new PropertyName('apply'))]);
						applyArgs = [new ThisLiteral(), new IdentifierLiteral('arguments')];
						ctor.body.push(new Call(applyCtor, applyArgs));
						ctor.body.makeReturn();
					}
					return ctor;
				}

				proxyBoundMethods() {
					var method, name;
					this.ctor.thisAssignments = (function() {
						var j, len1, ref1, results1;
						ref1 = this.boundMethods;
						results1 = [];
						for (j = 0, len1 = ref1.length; j < len1; j++) {
							method = ref1[j];
							if (this.parent) {
								method.classVariable = this.variableRef;
							}
							name = new Value(new ThisLiteral(), [method.name]);
							results1.push(new Assign(name, new Call(new Value(name, [new Access(new PropertyName('bind'))]), [new ThisLiteral()])));
						}
						return results1;
					}).call(this);
					return null;
				}

				declareName(o) {
					var alreadyDeclared, name, ref1;
					if (!((name = (ref1 = this.variable) != null ? ref1.unwrap() : void 0) instanceof IdentifierLiteral)) {
						return;
					}
					alreadyDeclared = o.scope.find(name.value);
					return name.isDeclaration = !alreadyDeclared;
				}

				isStatementAst() {
					return true;
				}

				astNode(o) {
					var argumentsNode, jumpNode, ref1;
					if (jumpNode = this.body.jumps()) {
						jumpNode.error('Class bodies cannot contain pure statements');
					}
					if (argumentsNode = this.body.contains(isLiteralArguments)) {
						argumentsNode.error("Class bodies shouldn't reference arguments");
					}
					this.declareName(o);
					this.name = this.determineName();
					this.body.isClassBody = true;
					if (this.hasGeneratedBody) {
						this.body.locationData = zeroWidthLocationDataFromEndLocation(this.locationData);
					}
					this.walkBody(o);
					sniffDirectives(this.body.expressions);
					if ((ref1 = this.ctor) != null) {
						ref1.noReturn = true;
					}
					return super.astNode(o);
				}

				astType(o) {
					if (o.level === LEVEL_TOP) {
						return 'ClassDeclaration';
					} else {
						return 'ClassExpression';
					}
				}

				astProperties(o) {
					var ref1, ref2, ref3, ref4;
					return {
						id: (ref1 = (ref2 = this.variable) != null ? ref2.ast(o) : void 0) != null ? ref1 : null,
						superClass: (ref3 = (ref4 = this.parent) != null ? ref4.ast(o, LEVEL_PAREN) : void 0) != null ? ref3 : null,
						body: this.body.ast(o, LEVEL_TOP)
					};
				}

			};

			Class.prototype.children = ['variable', 'parent', 'body'];

			return Class;

		}).call(this);

		exports.ExecutableClassBody = ExecutableClassBody = (function() {
			class ExecutableClassBody extends Base {
				constructor(_class, body1 = new Block()) {
					super();
					this.class = _class;
					this.body = body1;
				}

				compileNode(o) {
					var args, argumentsNode, directives, externalCtor, ident, jumpNode, klass, params, parent, ref1, wrapper;
					if (jumpNode = this.body.jumps()) {
						jumpNode.error('Class bodies cannot contain pure statements');
					}
					if (argumentsNode = this.body.contains(isLiteralArguments)) {
						argumentsNode.error("Class bodies shouldn't reference arguments");
					}
					params = [];
					args = [new ThisLiteral()];
					wrapper = new Code(params, this.body);
					klass = new Parens(new Call(new Value(wrapper, [new Access(new PropertyName('call'))]), args));
					this.body.spaced = true;
					o.classScope = wrapper.makeScope(o.scope);
					this.name = (ref1 = this.class.name) != null ? ref1 : o.classScope.freeVariable(this.defaultClassVariableName);
					ident = new IdentifierLiteral(this.name);
					directives = this.walkBody();
					this.setContext();
					if (this.class.hasNameClash) {
						parent = new IdentifierLiteral(o.classScope.freeVariable('superClass'));
						wrapper.params.push(new Param(parent));
						args.push(this.class.parent);
						this.class.parent = parent;
					}
					if (this.externalCtor) {
						externalCtor = new IdentifierLiteral(o.classScope.freeVariable('ctor', {
							reserve: false
						}));
						this.class.externalCtor = externalCtor;
						this.externalCtor.variable.base = externalCtor;
					}
					if (this.name !== this.class.name) {
						this.body.expressions.unshift(new Assign(new IdentifierLiteral(this.name), this.class));
					} else {
						this.body.expressions.unshift(this.class);
					}
					this.body.expressions.unshift(...directives);
					this.body.push(ident);
					return klass.compileToFragments(o);
				}

				// Traverse the class's children and:
				// - Hoist valid ES properties into `@properties`
				// - Hoist static assignments into `@properties`
				// - Convert invalid ES properties into class or prototype assignments
				walkBody() {
					var directives, expr, index;
					directives = [];
					index = 0;
					while (expr = this.body.expressions[index]) {
						if (!(expr instanceof Value && expr.isString())) {
							break;
						}
						if (expr.hoisted) {
							index++;
						} else {
							directives.push(...this.body.expressions.splice(index, 1));
						}
					}
					this.traverseChildren(false, (child) => {
						var cont, i, j, len1, node, ref1;
						if (child instanceof Class || child instanceof HoistTarget) {
							return false;
						}
						cont = true;
						if (child instanceof Block) {
							ref1 = child.expressions;
							for (i = j = 0, len1 = ref1.length; j < len1; i = ++j) {
								node = ref1[i];
								if (node instanceof Value && node.isObject(true)) {
									cont = false;
									child.expressions[i] = this.addProperties(node.base.properties);
								} else if (node instanceof Assign && node.variable.looksStatic(this.name)) {
									node.value.isStatic = true;
								}
							}
							child.expressions = flatten(child.expressions);
						}
						return cont;
					});
					return directives;
				}

				setContext() {
					return this.body.traverseChildren(false, (node) => {
						if (node instanceof ThisLiteral) {
							return node.value = this.name;
						} else if (node instanceof Code && node.bound && (node.isStatic || !node.name)) {
							return node.context = this.name;
						}
					});
				}

				// Make class/prototype assignments for invalid ES properties
				addProperties(assigns) {
					var assign, base, name, prototype, result, value, variable;
					result = (function() {
						var j, len1, results1;
						results1 = [];
						for (j = 0, len1 = assigns.length; j < len1; j++) {
							assign = assigns[j];
							variable = assign.variable;
							base = variable != null ? variable.base : void 0;
							value = assign.value;
							delete assign.context;
							if (base.value === 'constructor') {
								if (value instanceof Code) {
									base.error('constructors must be defined at the top level of a class body');
								}
								// The class scope is not available yet, so return the assignment to update later
								assign = this.externalCtor = new Assign(new Value(), value);
							} else if (!assign.variable.this) {
								name = base instanceof ComputedPropertyName ? new Index(base.value) : new (base.shouldCache() ? Index : Access)(base);
								prototype = new Access(new PropertyName('prototype'));
								variable = new Value(new ThisLiteral(), [prototype, name]);
								assign.variable = variable;
							} else if (assign.value instanceof Code) {
								assign.value.isStatic = true;
							}
							results1.push(assign);
						}
						return results1;
					}).call(this);
					return compact(result);
				}

			};

			ExecutableClassBody.prototype.children = ['class', 'body'];

			ExecutableClassBody.prototype.defaultClassVariableName = '_Class';

			return ExecutableClassBody;

		}).call(this);

		exports.ClassProperty = ClassProperty = (function() {
			class ClassProperty extends Base {
				constructor({
						name: name1,
						isStatic,
						staticClassName: staticClassName1,
						value: value1,
						operatorToken: operatorToken1
					}) {
					super();
					this.name = name1;
					this.isStatic = isStatic;
					this.staticClassName = staticClassName1;
					this.value = value1;
					this.operatorToken = operatorToken1;
				}

				astProperties(o) {
					var ref1, ref2, ref3, ref4;
					return {
						key: this.name.ast(o, LEVEL_LIST),
						value: this.value.ast(o, LEVEL_LIST),
						static: !!this.isStatic,
						computed: this.name instanceof Index || this.name instanceof ComputedPropertyName,
						operator: (ref1 = (ref2 = this.operatorToken) != null ? ref2.value : void 0) != null ? ref1 : '=',
						staticClassName: (ref3 = (ref4 = this.staticClassName) != null ? ref4.ast(o) : void 0) != null ? ref3 : null
					};
				}

			};

			ClassProperty.prototype.children = ['name', 'value', 'staticClassName'];

			ClassProperty.prototype.isStatement = YES;

			return ClassProperty;

		}).call(this);

		exports.ClassPrototypeProperty = ClassPrototypeProperty = (function() {
			class ClassPrototypeProperty extends Base {
				constructor({
						name: name1,
						value: value1
					}) {
					super();
					this.name = name1;
					this.value = value1;
				}

				astProperties(o) {
					return {
						key: this.name.ast(o, LEVEL_LIST),
						value: this.value.ast(o, LEVEL_LIST),
						computed: this.name instanceof ComputedPropertyName || this.name instanceof StringWithInterpolations
					};
				}

			};

			ClassPrototypeProperty.prototype.children = ['name', 'value'];

			ClassPrototypeProperty.prototype.isStatement = YES;

			return ClassPrototypeProperty;

		}).call(this);

		//### Import and Export
		exports.ModuleDeclaration = ModuleDeclaration = (function() {
			class ModuleDeclaration extends Base {
				constructor(clause, source1, assertions) {
					super();
					this.clause = clause;
					this.source = source1;
					this.assertions = assertions;
					this.checkSource();
				}

				checkSource() {
					if ((this.source != null) && this.source instanceof StringWithInterpolations) {
						return this.source.error('the name of the module to be imported from must be an uninterpolated string');
					}
				}

				checkScope(o, moduleDeclarationType) {
					// TODO: would be appropriate to flag this error during AST generation (as
					// well as when compiling to JS). But `o.indent` isn’t tracked during AST
					// generation, and there doesn’t seem to be a current alternative way to track
					// whether we’re at the “program top-level”.
					if (o.indent.length !== 0) {
						return this.error(`${moduleDeclarationType} statements must be at top-level scope`);
					}
				}

				astAssertions(o) {
					var ref1;
					if (((ref1 = this.assertions) != null ? ref1.properties : void 0) != null) {
						return this.assertions.properties.map((assertion) => {
							var end, left, loc, right, start;
							({start, end, loc, left, right} = assertion.ast(o));
							return {
								type: 'ImportAttribute',
								start,
								end,
								loc,
								key: left,
								value: right
							};
						});
					} else {
						return [];
					}
				}

			};

			ModuleDeclaration.prototype.children = ['clause', 'source', 'assertions'];

			ModuleDeclaration.prototype.isStatement = YES;

			ModuleDeclaration.prototype.jumps = THIS;

			ModuleDeclaration.prototype.makeReturn = THIS;

			return ModuleDeclaration;

		}).call(this);

		exports.ImportDeclaration = ImportDeclaration = class ImportDeclaration extends ModuleDeclaration {
			compileNode(o) {
				var code, ref1;
				this.checkScope(o, 'import');
				o.importedSymbols = [];
				code = [];
				code.push(this.makeCode(`${this.tab}import `));
				if (this.clause != null) {
					code.push(...this.clause.compileNode(o));
				}
				if (((ref1 = this.source) != null ? ref1.value : void 0) != null) {
					if (this.clause !== null) {
						code.push(this.makeCode(' from '));
					}
					code.push(this.makeCode(this.source.value));
					if (this.assertions != null) {
						code.push(this.makeCode(' assert '));
						code.push(...this.assertions.compileToFragments(o));
					}
				}
				code.push(this.makeCode(';'));
				return code;
			}

			astNode(o) {
				o.importedSymbols = [];
				return super.astNode(o);
			}

			astProperties(o) {
				var ref1, ref2, ret;
				ret = {
					specifiers: (ref1 = (ref2 = this.clause) != null ? ref2.ast(o) : void 0) != null ? ref1 : [],
					source: this.source.ast(o),
					assertions: this.astAssertions(o)
				};
				if (this.clause) {
					ret.importKind = 'value';
				}
				return ret;
			}

		};

		exports.ImportClause = ImportClause = (function() {
			class ImportClause extends Base {
				constructor(defaultBinding, namedImports) {
					super();
					this.defaultBinding = defaultBinding;
					this.namedImports = namedImports;
				}

				compileNode(o) {
					var code;
					code = [];
					if (this.defaultBinding != null) {
						code.push(...this.defaultBinding.compileNode(o));
						if (this.namedImports != null) {
							code.push(this.makeCode(', '));
						}
					}
					if (this.namedImports != null) {
						code.push(...this.namedImports.compileNode(o));
					}
					return code;
				}

				astNode(o) {
					var ref1, ref2;
					// The AST for `ImportClause` is the non-nested list of import specifiers
					// that will be the `specifiers` property of an `ImportDeclaration` AST
					return compact(flatten([(ref1 = this.defaultBinding) != null ? ref1.ast(o) : void 0, (ref2 = this.namedImports) != null ? ref2.ast(o) : void 0]));
				}

			};

			ImportClause.prototype.children = ['defaultBinding', 'namedImports'];

			return ImportClause;

		}).call(this);

		exports.ExportDeclaration = ExportDeclaration = class ExportDeclaration extends ModuleDeclaration {
			compileNode(o) {
				var code, ref1;
				this.checkScope(o, 'export');
				this.checkForAnonymousClassExport();
				code = [];
				code.push(this.makeCode(`${this.tab}export `));
				if (this instanceof ExportDefaultDeclaration) {
					code.push(this.makeCode('default '));
				}
				if (!(this instanceof ExportDefaultDeclaration) && (this.clause instanceof Assign || this.clause instanceof Class)) {
					code.push(this.makeCode('var '));
					this.clause.moduleDeclaration = 'export';
				}
				if ((this.clause.body != null) && this.clause.body instanceof Block) {
					code = code.concat(this.clause.compileToFragments(o, LEVEL_TOP));
				} else {
					code = code.concat(this.clause.compileNode(o));
				}
				if (((ref1 = this.source) != null ? ref1.value : void 0) != null) {
					code.push(this.makeCode(` from ${this.source.value}`));
					if (this.assertions != null) {
						code.push(this.makeCode(' assert '));
						code.push(...this.assertions.compileToFragments(o));
					}
				}
				code.push(this.makeCode(';'));
				return code;
			}

			// Prevent exporting an anonymous class; all exported members must be named
			checkForAnonymousClassExport() {
				if (!(this instanceof ExportDefaultDeclaration) && this.clause instanceof Class && !this.clause.variable) {
					return this.clause.error('anonymous classes cannot be exported');
				}
			}

			astNode(o) {
				this.checkForAnonymousClassExport();
				return super.astNode(o);
			}

		};

		exports.ExportNamedDeclaration = ExportNamedDeclaration = class ExportNamedDeclaration extends ExportDeclaration {
			astProperties(o) {
				var clauseAst, ref1, ref2, ret;
				ret = {
					source: (ref1 = (ref2 = this.source) != null ? ref2.ast(o) : void 0) != null ? ref1 : null,
					assertions: this.astAssertions(o),
					exportKind: 'value'
				};
				clauseAst = this.clause.ast(o);
				if (this.clause instanceof ExportSpecifierList) {
					ret.specifiers = clauseAst;
					ret.declaration = null;
				} else {
					ret.specifiers = [];
					ret.declaration = clauseAst;
				}
				return ret;
			}

		};

		exports.ExportDefaultDeclaration = ExportDefaultDeclaration = class ExportDefaultDeclaration extends ExportDeclaration {
			astProperties(o) {
				return {
					declaration: this.clause.ast(o),
					assertions: this.astAssertions(o)
				};
			}

		};

		exports.ExportAllDeclaration = ExportAllDeclaration = class ExportAllDeclaration extends ExportDeclaration {
			astProperties(o) {
				return {
					source: this.source.ast(o),
					assertions: this.astAssertions(o),
					exportKind: 'value'
				};
			}

		};

		exports.ModuleSpecifierList = ModuleSpecifierList = (function() {
			class ModuleSpecifierList extends Base {
				constructor(specifiers) {
					super();
					this.specifiers = specifiers;
				}

				compileNode(o) {
					var code, compiledList, fragments, index, j, len1, specifier;
					code = [];
					o.indent += TAB;
					compiledList = (function() {
						var j, len1, ref1, results1;
						ref1 = this.specifiers;
						results1 = [];
						for (j = 0, len1 = ref1.length; j < len1; j++) {
							specifier = ref1[j];
							results1.push(specifier.compileToFragments(o, LEVEL_LIST));
						}
						return results1;
					}).call(this);
					if (this.specifiers.length !== 0) {
						code.push(this.makeCode(`{\n${o.indent}`));
						for (index = j = 0, len1 = compiledList.length; j < len1; index = ++j) {
							fragments = compiledList[index];
							if (index) {
								code.push(this.makeCode(`,\n${o.indent}`));
							}
							code.push(...fragments);
						}
						code.push(this.makeCode("\n}"));
					} else {
						code.push(this.makeCode('{}'));
					}
					return code;
				}

				astNode(o) {
					var j, len1, ref1, results1, specifier;
					ref1 = this.specifiers;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						specifier = ref1[j];
						results1.push(specifier.ast(o));
					}
					return results1;
				}

			};

			ModuleSpecifierList.prototype.children = ['specifiers'];

			return ModuleSpecifierList;

		}).call(this);

		exports.ImportSpecifierList = ImportSpecifierList = class ImportSpecifierList extends ModuleSpecifierList {};

		exports.ExportSpecifierList = ExportSpecifierList = class ExportSpecifierList extends ModuleSpecifierList {};

		exports.ModuleSpecifier = ModuleSpecifier = (function() {
			class ModuleSpecifier extends Base {
				constructor(original, alias, moduleDeclarationType1) {
					var ref1, ref2;
					super();
					this.original = original;
					this.alias = alias;
					this.moduleDeclarationType = moduleDeclarationType1;
					if (this.original.comments || ((ref1 = this.alias) != null ? ref1.comments : void 0)) {
						this.comments = [];
						if (this.original.comments) {
							this.comments.push(...this.original.comments);
						}
						if ((ref2 = this.alias) != null ? ref2.comments : void 0) {
							this.comments.push(...this.alias.comments);
						}
					}
					// The name of the variable entering the local scope
					this.identifier = this.alias != null ? this.alias.value : this.original.value;
				}

				compileNode(o) {
					var code;
					this.addIdentifierToScope(o);
					code = [];
					code.push(this.makeCode(this.original.value));
					if (this.alias != null) {
						code.push(this.makeCode(` as ${this.alias.value}`));
					}
					return code;
				}

				addIdentifierToScope(o) {
					return o.scope.find(this.identifier, this.moduleDeclarationType);
				}

				astNode(o) {
					this.addIdentifierToScope(o);
					return super.astNode(o);
				}

			};

			ModuleSpecifier.prototype.children = ['original', 'alias'];

			return ModuleSpecifier;

		}).call(this);

		exports.ImportSpecifier = ImportSpecifier = class ImportSpecifier extends ModuleSpecifier {
			constructor(imported, local) {
				super(imported, local, 'import');
			}

			addIdentifierToScope(o) {
				var ref1;
				// Per the spec, symbols can’t be imported multiple times
				// (e.g. `import { foo, foo } from 'lib'` is invalid)
				if ((ref1 = this.identifier, indexOf.call(o.importedSymbols, ref1) >= 0) || o.scope.check(this.identifier)) {
					this.error(`'${this.identifier}' has already been declared`);
				} else {
					o.importedSymbols.push(this.identifier);
				}
				return super.addIdentifierToScope(o);
			}

			astProperties(o) {
				var originalAst, ref1, ref2;
				originalAst = this.original.ast(o);
				return {
					imported: originalAst,
					local: (ref1 = (ref2 = this.alias) != null ? ref2.ast(o) : void 0) != null ? ref1 : originalAst,
					importKind: null
				};
			}

		};

		exports.ImportDefaultSpecifier = ImportDefaultSpecifier = class ImportDefaultSpecifier extends ImportSpecifier {
			astProperties(o) {
				return {
					local: this.original.ast(o)
				};
			}

		};

		exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier = class ImportNamespaceSpecifier extends ImportSpecifier {
			astProperties(o) {
				return {
					local: this.alias.ast(o)
				};
			}

		};

		exports.ExportSpecifier = ExportSpecifier = class ExportSpecifier extends ModuleSpecifier {
			constructor(local, exported) {
				super(local, exported, 'export');
			}

			astProperties(o) {
				var originalAst, ref1, ref2;
				originalAst = this.original.ast(o);
				return {
					local: originalAst,
					exported: (ref1 = (ref2 = this.alias) != null ? ref2.ast(o) : void 0) != null ? ref1 : originalAst
				};
			}

		};

		exports.DynamicImport = DynamicImport = class DynamicImport extends Base {
			compileNode() {
				return [this.makeCode('import')];
			}

			astType() {
				return 'Import';
			}

		};

		exports.DynamicImportCall = DynamicImportCall = class DynamicImportCall extends Call {
			compileNode(o) {
				this.checkArguments();
				return super.compileNode(o);
			}

			checkArguments() {
				var ref1;
				if (!((1 <= (ref1 = this.args.length) && ref1 <= 2))) {
					return this.error('import() accepts either one or two arguments');
				}
			}

			astNode(o) {
				this.checkArguments();
				return super.astNode(o);
			}

		};

		//### Assign

		// The **Assign** is used to assign a local variable to value, or to set the
		// property of an object -- including within object literals.
		exports.Assign = Assign = (function() {
			class Assign extends Base {
				constructor(variable1, value1, context1, options = {}) {
					super();
					this.variable = variable1;
					this.value = value1;
					this.context = context1;
					({param: this.param, subpattern: this.subpattern, operatorToken: this.operatorToken, moduleDeclaration: this.moduleDeclaration, originalContext: this.originalContext = this.context} = options);
					this.propagateLhs();
				}

				isStatement(o) {
					return (o != null ? o.level : void 0) === LEVEL_TOP && (this.context != null) && (this.moduleDeclaration || indexOf.call(this.context, "?") >= 0);
				}

				checkNameAssignability(o, varBase) {
					if (o.scope.type(varBase.value) === 'import') {
						return varBase.error(`'${varBase.value}' is read-only`);
					}
				}

				assigns(name) {
					return this[this.context === 'object' ? 'value' : 'variable'].assigns(name);
				}

				unfoldSoak(o) {
					return unfoldSoak(o, this, 'variable');
				}

				// During AST generation, we need to allow assignment to these constructs
				// that are considered “unassignable” during compile-to-JS, while still
				// flagging things like `[null] = b`.
				addScopeVariables(o, {allowAssignmentToExpansion = false, allowAssignmentToNontrailingSplat = false, allowAssignmentToEmptyArray = false, allowAssignmentToComplexSplat = false} = {}) {
					var varBase;
					if (!(!this.context || this.context === '**=')) {
						return;
					}
					varBase = this.variable.unwrapAll();
					if (!varBase.isAssignable({
						allowExpansion: allowAssignmentToExpansion,
						allowNontrailingSplat: allowAssignmentToNontrailingSplat,
						allowEmptyArray: allowAssignmentToEmptyArray,
						allowComplexSplat: allowAssignmentToComplexSplat
					})) {
						this.variable.error(`'${this.variable.compile(o)}' can't be assigned`);
					}
					return varBase.eachName((name) => {
						var alreadyDeclared, commentFragments, commentsNode, message;
						if (typeof name.hasProperties === "function" ? name.hasProperties() : void 0) {
							return;
						}
						message = isUnassignable(name.value);
						if (message) {
							name.error(message);
						}
						// `moduleDeclaration` can be `'import'` or `'export'`.
						this.checkNameAssignability(o, name);
						if (this.moduleDeclaration) {
							o.scope.add(name.value, this.moduleDeclaration);
							return name.isDeclaration = true;
						} else if (this.param) {
							return o.scope.add(name.value, this.param === 'alwaysDeclare' ? 'var' : 'param');
						} else {
							alreadyDeclared = o.scope.find(name.value);
							if (name.isDeclaration == null) {
								name.isDeclaration = !alreadyDeclared;
							}
							// If this assignment identifier has one or more herecomments
							// attached, output them as part of the declarations line (unless
							// other herecomments are already staged there) for compatibility
							// with Flow typing. Don’t do this if this assignment is for a
							// class, e.g. `ClassName = class ClassName {`, as Flow requires
							// the comment to be between the class name and the `{`.
							if (name.comments && !o.scope.comments[name.value] && !(this.value instanceof Class) && name.comments.every(function(comment) {
								return comment.here && !comment.multiline;
							})) {
								commentsNode = new IdentifierLiteral(name.value);
								commentsNode.comments = name.comments;
								commentFragments = [];
								this.compileCommentFragments(o, commentsNode, commentFragments);
								return o.scope.comments[name.value] = commentFragments;
							}
						}
					});
				}

				// Compile an assignment, delegating to `compileDestructuring` or
				// `compileSplice` if appropriate. Keep track of the name of the base object
				// we've been assigned to, for correct internal references. If the variable
				// has not been seen yet within the current scope, declare it.
				compileNode(o) {
					var answer, compiledName, isValue, name, properties, prototype, ref1, ref2, ref3, ref4, val;
					isValue = this.variable instanceof Value;
					if (isValue) {
						// If `@variable` is an array or an object, we’re destructuring;
						// if it’s also `isAssignable()`, the destructuring syntax is supported
						// in ES and we can output it as is; otherwise we `@compileDestructuring`
						// and convert this ES-unsupported destructuring into acceptable output.
						if (this.variable.isArray() || this.variable.isObject()) {
							if (!this.variable.isAssignable()) {
								if (this.variable.isObject() && this.variable.base.hasSplat()) {
									return this.compileObjectDestruct(o);
								} else {
									return this.compileDestructuring(o);
								}
							}
						}
						if (this.variable.isSplice()) {
							return this.compileSplice(o);
						}
						if (this.isConditional()) {
							return this.compileConditional(o);
						}
						if ((ref1 = this.context) === '//=' || ref1 === '%%=') {
							return this.compileSpecialMath(o);
						}
					}
					this.addScopeVariables(o);
					if (this.value instanceof Code) {
						if (this.value.isStatic) {
							this.value.name = this.variable.properties[0];
						} else if (((ref2 = this.variable.properties) != null ? ref2.length : void 0) >= 2) {
							ref3 = this.variable.properties, [...properties] = ref3, [prototype, name] = splice.call(properties, -2);
							if (((ref4 = prototype.name) != null ? ref4.value : void 0) === 'prototype') {
								this.value.name = name;
							}
						}
					}
					val = this.value.compileToFragments(o, LEVEL_LIST);
					compiledName = this.variable.compileToFragments(o, LEVEL_LIST);
					if (this.context === 'object') {
						if (this.variable.shouldCache()) {
							compiledName.unshift(this.makeCode('['));
							compiledName.push(this.makeCode(']'));
						}
						return compiledName.concat(this.makeCode(': '), val);
					}
					answer = compiledName.concat(this.makeCode(` ${this.context || '='} `), val);
					// Per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Assignment_without_declaration,
					// if we’re destructuring without declaring, the destructuring assignment must be wrapped in parentheses.
					// The assignment is wrapped in parentheses if 'o.level' has lower precedence than LEVEL_LIST (3)
					// (i.e. LEVEL_COND (4), LEVEL_OP (5) or LEVEL_ACCESS (6)), or if we're destructuring object, e.g. {a,b} = obj.
					if (o.level > LEVEL_LIST || isValue && this.variable.base instanceof Obj && !this.nestedLhs && !(this.param === true)) {
						return this.wrapInParentheses(answer);
					} else {
						return answer;
					}
				}

				// Object rest property is not assignable: `{{a}...}`
				compileObjectDestruct(o) {
					var assigns, props, refVal, splat, splatProp;
					this.variable.base.reorderProperties();
					({
						properties: props
					} = this.variable.base);
					[splat] = slice1.call(props, -1);
					splatProp = splat.name;
					assigns = [];
					refVal = new Value(new IdentifierLiteral(o.scope.freeVariable('ref')));
					props.splice(-1, 1, new Splat(refVal));
					assigns.push(new Assign(new Value(new Obj(props)), this.value).compileToFragments(o, LEVEL_LIST));
					assigns.push(new Assign(new Value(splatProp), refVal).compileToFragments(o, LEVEL_LIST));
					return this.joinFragmentArrays(assigns, ', ');
				}

				// Brief implementation of recursive pattern matching, when assigning array or
				// object literals to a value. Peeks at their properties to assign inner names.
				compileDestructuring(o) {
					var assignObjects, assigns, code, compSlice, compSplice, complexObjects, expIdx, expans, fragments, hasObjAssigns, isExpans, isSplat, leftObjs, loopObjects, obj, objIsUnassignable, objects, olen, processObjects, pushAssign, ref, refExp, restVar, rightObjs, slicer, splatVar, splatVarAssign, splatVarRef, splats, splatsAndExpans, top, value, vvar, vvarText;
					top = o.level === LEVEL_TOP;
					({value} = this);
					({objects} = this.variable.base);
					olen = objects.length;
					// Special-case for `{} = a` and `[] = a` (empty patterns).
					// Compile to simply `a`.
					if (olen === 0) {
						code = value.compileToFragments(o);
						if (o.level >= LEVEL_OP) {
							return this.wrapInParentheses(code);
						} else {
							return code;
						}
					}
					[obj] = objects;
					this.disallowLoneExpansion();
					({splats, expans, splatsAndExpans} = this.getAndCheckSplatsAndExpansions());
					isSplat = (splats != null ? splats.length : void 0) > 0;
					isExpans = (expans != null ? expans.length : void 0) > 0;
					vvar = value.compileToFragments(o, LEVEL_LIST);
					vvarText = fragmentsToText(vvar);
					assigns = [];
					pushAssign = (variable, val) => {
						return assigns.push(new Assign(variable, val, null, {
							param: this.param,
							subpattern: true
						}).compileToFragments(o, LEVEL_LIST));
					};
					if (isSplat) {
						splatVar = objects[splats[0]].name.unwrap();
						if (splatVar instanceof Arr || splatVar instanceof Obj) {
							splatVarRef = new IdentifierLiteral(o.scope.freeVariable('ref'));
							objects[splats[0]].name = splatVarRef;
							splatVarAssign = function() {
								return pushAssign(new Value(splatVar), splatVarRef);
							};
						}
					}
					// At this point, there are several things to destructure. So the `fn()` in
					// `{a, b} = fn()` must be cached, for example. Make vvar into a simple
					// variable if it isn’t already.
					if (!(value.unwrap() instanceof IdentifierLiteral) || this.variable.assigns(vvarText)) {
						ref = o.scope.freeVariable('ref');
						assigns.push([this.makeCode(ref + ' = '), ...vvar]);
						vvar = [this.makeCode(ref)];
						vvarText = ref;
					}
					slicer = function(type) {
						return function(vvar, start, end = false) {
							var args, slice;
							if (!(vvar instanceof Value)) {
								vvar = new IdentifierLiteral(vvar);
							}
							args = [vvar, new NumberLiteral(start)];
							if (end) {
								args.push(new NumberLiteral(end));
							}
							slice = new Value(new IdentifierLiteral(utility(type, o)), [new Access(new PropertyName('call'))]);
							return new Value(new Call(slice, args));
						};
					};
					// Helper which outputs `[].slice` code.
					compSlice = slicer("slice");
					// Helper which outputs `[].splice` code.
					compSplice = slicer("splice");
					// Check if `objects` array contains any instance of `Assign`, e.g. {a:1}.
					hasObjAssigns = function(objs) {
						var i, j, len1, results1;
						results1 = [];
						for (i = j = 0, len1 = objs.length; j < len1; i = ++j) {
							obj = objs[i];
							if (obj instanceof Assign && obj.context === 'object') {
								results1.push(i);
							}
						}
						return results1;
					};
					// Check if `objects` array contains any unassignable object.
					objIsUnassignable = function(objs) {
						var j, len1;
						for (j = 0, len1 = objs.length; j < len1; j++) {
							obj = objs[j];
							if (!obj.isAssignable()) {
								return true;
							}
						}
						return false;
					};
					// `objects` are complex when there is object assign ({a:1}),
					// unassignable object, or just a single node.
					complexObjects = function(objs) {
						return hasObjAssigns(objs).length || objIsUnassignable(objs) || olen === 1;
					};
					// "Complex" `objects` are processed in a loop.
					// Examples: [a, b, {c, r...}, d], [a, ..., {b, r...}, c, d]
					loopObjects = (objs, vvar, vvarTxt) => {
						var acc, i, idx, j, len1, message, results1, vval;
						results1 = [];
						for (i = j = 0, len1 = objs.length; j < len1; i = ++j) {
							obj = objs[i];
							if (obj instanceof Elision) {
								// `Elision` can be skipped.
								continue;
							}
							// If `obj` is {a: 1}
							if (obj instanceof Assign && obj.context === 'object') {
								({
									variable: {
										base: idx
									},
									value: vvar
								} = obj);
								if (vvar instanceof Assign) {
									({
										variable: vvar
									} = vvar);
								}
								idx = vvar.this ? vvar.properties[0].name : new PropertyName(vvar.unwrap().value);
								acc = idx.unwrap() instanceof PropertyName;
								vval = new Value(value, [new (acc ? Access : Index)(idx)]);
							} else {
								// `obj` is [a...], {a...} or a
								vvar = (function() {
									switch (false) {
										case !(obj instanceof Splat):
											return new Value(obj.name);
										default:
											return obj;
									}
								})();
								vval = (function() {
									switch (false) {
										case !(obj instanceof Splat):
											return compSlice(vvarTxt, i);
										default:
											return new Value(new Literal(vvarTxt), [new Index(new NumberLiteral(i))]);
									}
								})();
							}
							message = isUnassignable(vvar.unwrap().value);
							if (message) {
								vvar.error(message);
							}
							results1.push(pushAssign(vvar, vval));
						}
						return results1;
					};
					// "Simple" `objects` can be split and compiled to arrays, [a, b, c] = arr, [a, b, c...] = arr
					assignObjects = (objs, vvar, vvarTxt) => {
						var vval;
						vvar = new Value(new Arr(objs, true));
						vval = vvarTxt instanceof Value ? vvarTxt : new Value(new Literal(vvarTxt));
						return pushAssign(vvar, vval);
					};
					processObjects = function(objs, vvar, vvarTxt) {
						if (complexObjects(objs)) {
							return loopObjects(objs, vvar, vvarTxt);
						} else {
							return assignObjects(objs, vvar, vvarTxt);
						}
					};
					// In case there is `Splat` or `Expansion` in `objects`,
					// we can split array in two simple subarrays.
					// `Splat` [a, b, c..., d, e] can be split into  [a, b, c...] and [d, e].
					// `Expansion` [a, b, ..., c, d] can be split into [a, b] and [c, d].
					// Examples:
					// a) `Splat`
					//   CS: [a, b, c..., d, e] = arr
					//   JS: [a, b, ...c] = arr, [d, e] = splice.call(c, -2)
					// b) `Expansion`
					//   CS: [a, b, ..., d, e] = arr
					//   JS: [a, b] = arr, [d, e] = slice.call(arr, -2)
					if (splatsAndExpans.length) {
						expIdx = splatsAndExpans[0];
						leftObjs = objects.slice(0, expIdx + (isSplat ? 1 : 0));
						rightObjs = objects.slice(expIdx + 1);
						if (leftObjs.length !== 0) {
							processObjects(leftObjs, vvar, vvarText);
						}
						if (rightObjs.length !== 0) {
							// Slice or splice `objects`.
							refExp = (function() {
								switch (false) {
									case !isSplat:
										return compSplice(new Value(objects[expIdx].name), rightObjs.length * -1);
									case !isExpans:
										return compSlice(vvarText, rightObjs.length * -1);
								}
							})();
							if (complexObjects(rightObjs)) {
								restVar = refExp;
								refExp = o.scope.freeVariable('ref');
								assigns.push([this.makeCode(refExp + ' = '), ...restVar.compileToFragments(o, LEVEL_LIST)]);
							}
							processObjects(rightObjs, vvar, refExp);
						}
					} else {
						// There is no `Splat` or `Expansion` in `objects`.
						processObjects(objects, vvar, vvarText);
					}
					if (typeof splatVarAssign === "function") {
						splatVarAssign();
					}
					if (!(top || this.subpattern)) {
						assigns.push(vvar);
					}
					fragments = this.joinFragmentArrays(assigns, ', ');
					if (o.level < LEVEL_LIST) {
						return fragments;
					} else {
						return this.wrapInParentheses(fragments);
					}
				}

				// Disallow `[...] = a` for some reason. (Could be equivalent to `[] = a`?)
				disallowLoneExpansion() {
					var loneObject, objects;
					if (!(this.variable.base instanceof Arr)) {
						return;
					}
					({objects} = this.variable.base);
					if ((objects != null ? objects.length : void 0) !== 1) {
						return;
					}
					[loneObject] = objects;
					if (loneObject instanceof Expansion) {
						return loneObject.error('Destructuring assignment has no target');
					}
				}

				// Show error if there is more than one `Splat`, or `Expansion`.
				// Examples: [a, b, c..., d, e, f...], [a, b, ..., c, d, ...], [a, b, ..., c, d, e...]
				getAndCheckSplatsAndExpansions() {
					var expans, i, obj, objects, splats, splatsAndExpans;
					if (!(this.variable.base instanceof Arr)) {
						return {
							splats: [],
							expans: [],
							splatsAndExpans: []
						};
					}
					({objects} = this.variable.base);
					// Count all `Splats`: [a, b, c..., d, e]
					splats = (function() {
						var j, len1, results1;
						results1 = [];
						for (i = j = 0, len1 = objects.length; j < len1; i = ++j) {
							obj = objects[i];
							if (obj instanceof Splat) {
								results1.push(i);
							}
						}
						return results1;
					})();
					// Count all `Expansions`: [a, b, ..., c, d]
					expans = (function() {
						var j, len1, results1;
						results1 = [];
						for (i = j = 0, len1 = objects.length; j < len1; i = ++j) {
							obj = objects[i];
							if (obj instanceof Expansion) {
								results1.push(i);
							}
						}
						return results1;
					})();
					// Combine splats and expansions.
					splatsAndExpans = [...splats, ...expans];
					if (splatsAndExpans.length > 1) {
						// Sort 'splatsAndExpans' so we can show error at first disallowed token.
						objects[splatsAndExpans.sort()[1]].error("multiple splats/expansions are disallowed in an assignment");
					}
					return {splats, expans, splatsAndExpans};
				}

				// When compiling a conditional assignment, take care to ensure that the
				// operands are only evaluated once, even though we have to reference them
				// more than once.
				compileConditional(o) {
					var fragments, left, right;
					[left, right] = this.variable.cacheReference(o);
					// Disallow conditional assignment of undefined variables.
					if (!left.properties.length && left.base instanceof Literal && !(left.base instanceof ThisLiteral) && !o.scope.check(left.base.value)) {
						this.throwUnassignableConditionalError(left.base.value);
					}
					if (indexOf.call(this.context, "?") >= 0) {
						o.isExistentialEquals = true;
						return new If(new Existence(left), right, {
							type: 'if'
						}).addElse(new Assign(right, this.value, '=')).compileToFragments(o);
					} else {
						fragments = new Op(this.context.slice(0, -1), left, new Assign(right, this.value, '=')).compileToFragments(o);
						if (o.level <= LEVEL_LIST) {
							return fragments;
						} else {
							return this.wrapInParentheses(fragments);
						}
					}
				}

				// Convert special math assignment operators like `a //= b` to the equivalent
				// extended form `a = a ** b` and then compiles that.
				compileSpecialMath(o) {
					var left, right;
					[left, right] = this.variable.cacheReference(o);
					return new Assign(left, new Op(this.context.slice(0, -1), right, this.value)).compileToFragments(o);
				}

				// Compile the assignment from an array splice literal, using JavaScript's
				// `Array#splice` method.
				compileSplice(o) {
					var answer, exclusive, from, fromDecl, fromRef, name, to, unwrappedVar, valDef, valRef;
					({
						range: {from, to, exclusive}
					} = this.variable.properties.pop());
					unwrappedVar = this.variable.unwrapAll();
					if (unwrappedVar.comments) {
						moveComments(unwrappedVar, this);
						delete this.variable.comments;
					}
					name = this.variable.compile(o);
					if (from) {
						[fromDecl, fromRef] = this.cacheToCodeFragments(from.cache(o, LEVEL_OP));
					} else {
						fromDecl = fromRef = '0';
					}
					if (to) {
						if ((from != null ? from.isNumber() : void 0) && to.isNumber()) {
							to = to.compile(o) - fromRef;
							if (!exclusive) {
								to += 1;
							}
						} else {
							to = to.compile(o, LEVEL_ACCESS) + ' - ' + fromRef;
							if (!exclusive) {
								to += ' + 1';
							}
						}
					} else {
						to = "9e9";
					}
					[valDef, valRef] = this.value.cache(o, LEVEL_LIST);
					answer = [].concat(this.makeCode(`${utility('splice', o)}.apply(${name}, [${fromDecl}, ${to}].concat(`), valDef, this.makeCode(")), "), valRef);
					if (o.level > LEVEL_TOP) {
						return this.wrapInParentheses(answer);
					} else {
						return answer;
					}
				}

				eachName(iterator) {
					return this.variable.unwrapAll().eachName(iterator);
				}

				isDefaultAssignment() {
					return this.param || this.nestedLhs;
				}

				propagateLhs() {
					var ref1, ref2;
					if (!(((ref1 = this.variable) != null ? typeof ref1.isArray === "function" ? ref1.isArray() : void 0 : void 0) || ((ref2 = this.variable) != null ? typeof ref2.isObject === "function" ? ref2.isObject() : void 0 : void 0))) {
						return;
					}
					// This is the left-hand side of an assignment; let `Arr` and `Obj`
					// know that, so that those nodes know that they’re assignable as
					// destructured variables.
					return this.variable.base.propagateLhs(true);
				}

				throwUnassignableConditionalError(name) {
					return this.variable.error(`the variable \"${name}\" can't be assigned with ${this.context} because it has not been declared before`);
				}

				isConditional() {
					var ref1;
					return (ref1 = this.context) === '||=' || ref1 === '&&=' || ref1 === '?=';
				}

				astNode(o) {
					var variable;
					this.disallowLoneExpansion();
					this.getAndCheckSplatsAndExpansions();
					if (this.isConditional()) {
						variable = this.variable.unwrap();
						if (variable instanceof IdentifierLiteral && !o.scope.check(variable.value)) {
							this.throwUnassignableConditionalError(variable.value);
						}
					}
					this.addScopeVariables(o, {
						allowAssignmentToExpansion: true,
						allowAssignmentToNontrailingSplat: true,
						allowAssignmentToEmptyArray: true,
						allowAssignmentToComplexSplat: true
					});
					return super.astNode(o);
				}

				astType() {
					if (this.isDefaultAssignment()) {
						return 'AssignmentPattern';
					} else {
						return 'AssignmentExpression';
					}
				}

				astProperties(o) {
					var ref1, ret;
					ret = {
						right: this.value.ast(o, LEVEL_LIST),
						left: this.variable.ast(o, LEVEL_LIST)
					};
					if (!this.isDefaultAssignment()) {
						ret.operator = (ref1 = this.originalContext) != null ? ref1 : '=';
					}
					return ret;
				}

			};

			Assign.prototype.children = ['variable', 'value'];

			Assign.prototype.isAssignable = YES;

			Assign.prototype.isStatementAst = NO;

			return Assign;

		}).call(this);

		//### FuncGlyph
		exports.FuncGlyph = FuncGlyph = class FuncGlyph extends Base {
			constructor(glyph) {
				super();
				this.glyph = glyph;
			}

		};

		//### Code

		// A function definition. This is the only node that creates a new Scope.
		// When for the purposes of walking the contents of a function body, the Code
		// has no *children* -- they're within the inner scope.
		exports.Code = Code = (function() {
			class Code extends Base {
				constructor(params, body, funcGlyph, paramStart) {
					var ref1;
					super();
					this.funcGlyph = funcGlyph;
					this.paramStart = paramStart;
					this.params = params || [];
					this.body = body || new Block();
					this.bound = ((ref1 = this.funcGlyph) != null ? ref1.glyph : void 0) === '=>';
					this.isGenerator = false;
					this.isAsync = false;
					this.isMethod = false;
					this.body.traverseChildren(false, (node) => {
						if ((node instanceof Op && node.isYield()) || node instanceof YieldReturn) {
							this.isGenerator = true;
						}
						if ((node instanceof Op && node.isAwait()) || node instanceof AwaitReturn) {
							this.isAsync = true;
						}
						if (node instanceof For && node.isAwait()) {
							return this.isAsync = true;
						}
					});
					this.propagateLhs();
				}

				isStatement() {
					return this.isMethod;
				}

				makeScope(parentScope) {
					return new Scope(parentScope, this.body, this);
				}

				// Compilation creates a new scope unless explicitly asked to share with the
				// outer scope. Handles splat parameters in the parameter list by setting
				// such parameters to be the final parameter in the function definition, as
				// required per the ES2015 spec. If the CoffeeScript function definition had
				// parameters after the splat, they are declared via expressions in the
				// function body.
				compileNode(o) {
					var answer, body, boundMethodCheck, comment, condition, exprs, generatedVariables, haveBodyParam, haveSplatParam, i, ifTrue, j, k, l, len1, len2, len3, m, methodScope, modifiers, name, param, paramToAddToScope, params, paramsAfterSplat, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, scopeVariablesCount, signature, splatParamName, thisAssignments, wasEmpty, yieldNode;
					this.checkForAsyncOrGeneratorConstructor();
					if (this.bound) {
						if ((ref1 = o.scope.method) != null ? ref1.bound : void 0) {
							this.context = o.scope.method.context;
						}
						if (!this.context) {
							this.context = 'this';
						}
					}
					this.updateOptions(o);
					params = [];
					exprs = [];
					thisAssignments = (ref2 = (ref3 = this.thisAssignments) != null ? ref3.slice() : void 0) != null ? ref2 : [];
					paramsAfterSplat = [];
					haveSplatParam = false;
					haveBodyParam = false;
					this.checkForDuplicateParams();
					this.disallowLoneExpansionAndMultipleSplats();
					// Separate `this` assignments.
					this.eachParamName(function(name, node, param, obj) {
						var replacement, target;
						if (node.this) {
							name = node.properties[0].name.value;
							if (indexOf.call(JS_FORBIDDEN, name) >= 0) {
								name = `_${name}`;
							}
							target = new IdentifierLiteral(o.scope.freeVariable(name, {
								reserve: false
							}));
							// `Param` is object destructuring with a default value: ({@prop = 1}) ->
							// In a case when the variable name is already reserved, we have to assign
							// a new variable name to the destructured variable: ({prop:prop1 = 1}) ->
							replacement = param.name instanceof Obj && obj instanceof Assign && obj.operatorToken.value === '=' ? new Assign(new IdentifierLiteral(name), target, 'object') : target; //, operatorToken: new Literal ':'
							param.renameParam(node, replacement);
							return thisAssignments.push(new Assign(node, target));
						}
					});
					ref4 = this.params;
					// Parse the parameters, adding them to the list of parameters to put in the
					// function definition; and dealing with splats or expansions, including
					// adding expressions to the function body to declare all parameter
					// variables that would have been after the splat/expansion parameter.
					// If we encounter a parameter that needs to be declared in the function
					// body for any reason, for example it’s destructured with `this`, also
					// declare and assign all subsequent parameters in the function body so that
					// any non-idempotent parameters are evaluated in the correct order.
					for (i = j = 0, len1 = ref4.length; j < len1; i = ++j) {
						param = ref4[i];
						// Was `...` used with this parameter? Splat/expansion parameters cannot
						// have default values, so we need not worry about that.
						if (param.splat || param instanceof Expansion) {
							haveSplatParam = true;
							if (param.splat) {
								if (param.name instanceof Arr || param.name instanceof Obj) {
									// Splat arrays are treated oddly by ES; deal with them the legacy
									// way in the function body. TODO: Should this be handled in the
									// function parameter list, and if so, how?
									splatParamName = o.scope.freeVariable('arg');
									params.push(ref = new Value(new IdentifierLiteral(splatParamName)));
									exprs.push(new Assign(new Value(param.name), ref));
								} else {
									params.push(ref = param.asReference(o));
									splatParamName = fragmentsToText(ref.compileNodeWithoutComments(o));
								}
								if (param.shouldCache()) {
									exprs.push(new Assign(new Value(param.name), ref)); // `param` is an Expansion
								}
							} else {
								splatParamName = o.scope.freeVariable('args');
								params.push(new Value(new IdentifierLiteral(splatParamName)));
							}
							o.scope.parameter(splatParamName);
						} else {
							// Parse all other parameters; if a splat paramater has not yet been
							// encountered, add these other parameters to the list to be output in
							// the function definition.
							if (param.shouldCache() || haveBodyParam) {
								param.assignedInBody = true;
								haveBodyParam = true;
								// This parameter cannot be declared or assigned in the parameter
								// list. So put a reference in the parameter list and add a statement
								// to the function body assigning it, e.g.
								// `(arg) => { var a = arg.a; }`, with a default value if it has one.
								if (param.value != null) {
									condition = new Op('===', param, new UndefinedLiteral());
									ifTrue = new Assign(new Value(param.name), param.value);
									exprs.push(new If(condition, ifTrue));
								} else {
									exprs.push(new Assign(new Value(param.name), param.asReference(o), null, {
										param: 'alwaysDeclare'
									}));
								}
							}
							// If this parameter comes before the splat or expansion, it will go
							// in the function definition parameter list.
							if (!haveSplatParam) {
								// If this parameter has a default value, and it hasn’t already been
								// set by the `shouldCache()` block above, define it as a statement in
								// the function body. This parameter comes after the splat parameter,
								// so we can’t define its default value in the parameter list.
								if (param.shouldCache()) {
									ref = param.asReference(o);
								} else {
									if ((param.value != null) && !param.assignedInBody) {
										ref = new Assign(new Value(param.name), param.value, null, {
											param: true
										});
									} else {
										ref = param;
									}
								}
								// Add this parameter’s reference(s) to the function scope.
								if (param.name instanceof Arr || param.name instanceof Obj) {
									// This parameter is destructured.
									param.name.lhs = true;
									if (!param.shouldCache()) {
										param.name.eachName(function(prop) {
											return o.scope.parameter(prop.value);
										});
									}
								} else {
									// This compilation of the parameter is only to get its name to add
									// to the scope name tracking; since the compilation output here
									// isn’t kept for eventual output, don’t include comments in this
									// compilation, so that they get output the “real” time this param
									// is compiled.
									paramToAddToScope = param.value != null ? param : ref;
									o.scope.parameter(fragmentsToText(paramToAddToScope.compileToFragmentsWithoutComments(o)));
								}
								params.push(ref);
							} else {
								paramsAfterSplat.push(param);
								// If this parameter had a default value, since it’s no longer in the
								// function parameter list we need to assign its default value
								// (if necessary) as an expression in the body.
								if ((param.value != null) && !param.shouldCache()) {
									condition = new Op('===', param, new UndefinedLiteral());
									ifTrue = new Assign(new Value(param.name), param.value);
									exprs.push(new If(condition, ifTrue));
								}
								if (((ref5 = param.name) != null ? ref5.value : void 0) != null) {
									// Add this parameter to the scope, since it wouldn’t have been added
									// yet since it was skipped earlier.
									o.scope.add(param.name.value, 'var', true);
								}
							}
						}
					}
					// If there were parameters after the splat or expansion parameter, those
					// parameters need to be assigned in the body of the function.
					if (paramsAfterSplat.length !== 0) {
						// Create a destructured assignment, e.g. `[a, b, c] = [args..., b, c]`
						exprs.unshift(new Assign(new Value(new Arr([
							new Splat(new IdentifierLiteral(splatParamName)),
							...((function() {
								var k,
							len2,
							results1;
								results1 = [];
								for (k = 0, len2 = paramsAfterSplat.length; k < len2; k++) {
									param = paramsAfterSplat[k];
									results1.push(param.asReference(o));
								}
								return results1;
							})())
						])), new Value(new IdentifierLiteral(splatParamName))));
					}
					// Add new expressions to the function body
					wasEmpty = this.body.isEmpty();
					this.disallowSuperInParamDefaults();
					this.checkSuperCallsInConstructorBody();
					if (!this.expandCtorSuper(thisAssignments)) {
						this.body.expressions.unshift(...thisAssignments);
					}
					this.body.expressions.unshift(...exprs);
					if (this.isMethod && this.bound && !this.isStatic && this.classVariable) {
						boundMethodCheck = new Value(new Literal(utility('boundMethodCheck', o)));
						this.body.expressions.unshift(new Call(boundMethodCheck, [new Value(new ThisLiteral()), this.classVariable]));
					}
					if (!(wasEmpty || this.noReturn)) {
						this.body.makeReturn();
					}
					// JavaScript doesn’t allow bound (`=>`) functions to also be generators.
					// This is usually caught via `Op::compileContinuation`, but double-check:
					if (this.bound && this.isGenerator) {
						yieldNode = this.body.contains(function(node) {
							return node instanceof Op && node.operator === 'yield';
						});
						(yieldNode || this).error('yield cannot occur inside bound (fat arrow) functions');
					}
					// Assemble the output
					modifiers = [];
					if (this.isMethod && this.isStatic) {
						modifiers.push('static');
					}
					if (this.isAsync) {
						modifiers.push('async');
					}
					if (!(this.isMethod || this.bound)) {
						modifiers.push(`function${this.isGenerator ? '*' : ''}`);
					} else if (this.isGenerator) {
						modifiers.push('*');
					}
					signature = [this.makeCode('(')];
					// Block comments between a function name and `(` get output between
					// `function` and `(`.
					if (((ref6 = this.paramStart) != null ? ref6.comments : void 0) != null) {
						this.compileCommentFragments(o, this.paramStart, signature);
					}
					for (i = k = 0, len2 = params.length; k < len2; i = ++k) {
						param = params[i];
						if (i !== 0) {
							signature.push(this.makeCode(', '));
						}
						if (haveSplatParam && i === params.length - 1) {
							signature.push(this.makeCode('...'));
						}
						// Compile this parameter, but if any generated variables get created
						// (e.g. `ref`), shift those into the parent scope since we can’t put a
						// `var` line inside a function parameter list.
						scopeVariablesCount = o.scope.variables.length;
						signature.push(...param.compileToFragments(o, LEVEL_PAREN));
						if (scopeVariablesCount !== o.scope.variables.length) {
							generatedVariables = o.scope.variables.splice(scopeVariablesCount);
							o.scope.parent.variables.push(...generatedVariables);
						}
					}
					signature.push(this.makeCode(')'));
					// Block comments between `)` and `->`/`=>` get output between `)` and `{`.
					if (((ref7 = this.funcGlyph) != null ? ref7.comments : void 0) != null) {
						ref8 = this.funcGlyph.comments;
						for (l = 0, len3 = ref8.length; l < len3; l++) {
							comment = ref8[l];
							comment.unshift = false;
						}
						this.compileCommentFragments(o, this.funcGlyph, signature);
					}
					if (!this.body.isEmpty()) {
						body = this.body.compileWithDeclarations(o);
					}
					// We need to compile the body before method names to ensure `super`
					// references are handled.
					if (this.isMethod) {
						[methodScope, o.scope] = [o.scope, o.scope.parent];
						name = this.name.compileToFragments(o);
						if (name[0].code === '.') {
							name.shift();
						}
						o.scope = methodScope;
					}
					answer = this.joinFragmentArrays((function() {
						var len4, p, results1;
						results1 = [];
						for (p = 0, len4 = modifiers.length; p < len4; p++) {
							m = modifiers[p];
							results1.push(this.makeCode(m));
						}
						return results1;
					}).call(this), ' ');
					if (modifiers.length && name) {
						answer.push(this.makeCode(' '));
					}
					if (name) {
						answer.push(...name);
					}
					answer.push(...signature);
					if (this.bound && !this.isMethod) {
						answer.push(this.makeCode(' =>'));
					}
					answer.push(this.makeCode(' {'));
					if (body != null ? body.length : void 0) {
						answer.push(this.makeCode('\n'), ...body, this.makeCode(`\n${this.tab}`));
					}
					answer.push(this.makeCode('}'));
					if (this.isMethod) {
						return indentInitial(answer, this);
					}
					if (this.front || (o.level >= LEVEL_ACCESS)) {
						return this.wrapInParentheses(answer);
					} else {
						return answer;
					}
				}

				updateOptions(o) {
					o.scope = del(o, 'classScope') || this.makeScope(o.scope);
					o.scope.shared = del(o, 'sharedScope');
					o.indent += TAB;
					delete o.bare;
					return delete o.isExistentialEquals;
				}

				checkForDuplicateParams() {
					var paramNames;
					paramNames = [];
					return this.eachParamName(function(name, node, param) {
						if (indexOf.call(paramNames, name) >= 0) {
							node.error(`multiple parameters named '${name}'`);
						}
						return paramNames.push(name);
					});
				}

				eachParamName(iterator) {
					var j, len1, param, ref1, results1;
					ref1 = this.params;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						param = ref1[j];
						results1.push(param.eachName(iterator));
					}
					return results1;
				}

				// Short-circuit `traverseChildren` method to prevent it from crossing scope
				// boundaries unless `crossScope` is `true`.
				traverseChildren(crossScope, func) {
					if (crossScope) {
						return super.traverseChildren(crossScope, func);
					}
				}

				// Short-circuit `replaceInContext` method to prevent it from crossing context boundaries. Bound
				// functions have the same context.
				replaceInContext(child, replacement) {
					if (this.bound) {
						return super.replaceInContext(child, replacement);
					} else {
						return false;
					}
				}

				disallowSuperInParamDefaults({forAst} = {}) {
					if (!this.ctor) {
						return false;
					}
					return this.eachSuperCall(Block.wrap(this.params), function(superCall) {
						return superCall.error("'super' is not allowed in constructor parameter defaults");
					}, {
						checkForThisBeforeSuper: !forAst
					});
				}

				checkSuperCallsInConstructorBody() {
					var seenSuper;
					if (!this.ctor) {
						return false;
					}
					seenSuper = this.eachSuperCall(this.body, (superCall) => {
						if (this.ctor === 'base') {
							return superCall.error("'super' is only allowed in derived class constructors");
						}
					});
					return seenSuper;
				}

				flagThisParamInDerivedClassConstructorWithoutCallingSuper(param) {
					return param.error("Can't use @params in derived class constructors without calling super");
				}

				checkForAsyncOrGeneratorConstructor() {
					if (this.ctor) {
						if (this.isAsync) {
							this.name.error('Class constructor may not be async');
						}
						if (this.isGenerator) {
							return this.name.error('Class constructor may not be a generator');
						}
					}
				}

				disallowLoneExpansionAndMultipleSplats() {
					var j, len1, param, ref1, results1, seenSplatParam;
					seenSplatParam = false;
					ref1 = this.params;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						param = ref1[j];
						// Was `...` used with this parameter? (Only one such parameter is allowed
						// per function.)
						if (param.splat || param instanceof Expansion) {
							if (seenSplatParam) {
								param.error('only one splat or expansion parameter is allowed per function definition');
							} else if (param instanceof Expansion && this.params.length === 1) {
								param.error('an expansion parameter cannot be the only parameter in a function definition');
							}
							results1.push(seenSplatParam = true);
						} else {
							results1.push(void 0);
						}
					}
					return results1;
				}

				expandCtorSuper(thisAssignments) {
					var haveThisParam, param, ref1, seenSuper;
					if (!this.ctor) {
						return false;
					}
					seenSuper = this.eachSuperCall(this.body, (superCall) => {
						return superCall.expressions = thisAssignments;
					});
					haveThisParam = thisAssignments.length && thisAssignments.length !== ((ref1 = this.thisAssignments) != null ? ref1.length : void 0);
					if (this.ctor === 'derived' && !seenSuper && haveThisParam) {
						param = thisAssignments[0].variable;
						this.flagThisParamInDerivedClassConstructorWithoutCallingSuper(param);
					}
					return seenSuper;
				}

				// Find all super calls in the given context node;
				// returns `true` if `iterator` is called.
				eachSuperCall(context, iterator, {checkForThisBeforeSuper = true} = {}) {
					var seenSuper;
					seenSuper = false;
					context.traverseChildren(true, (child) => {
						var childArgs;
						if (child instanceof SuperCall) {
							// `super` in a constructor (the only `super` without an accessor)
							// cannot be given an argument with a reference to `this`, as that would
							// be referencing `this` before calling `super`.
							if (!child.variable.accessor) {
								childArgs = child.args.filter(function(arg) {
									return !(arg instanceof Class) && (!(arg instanceof Code) || arg.bound);
								});
								Block.wrap(childArgs).traverseChildren(true, (node) => {
									if (node.this) {
										return node.error("Can't call super with @params in derived class constructors");
									}
								});
							}
							seenSuper = true;
							iterator(child);
						} else if (checkForThisBeforeSuper && child instanceof ThisLiteral && this.ctor === 'derived' && !seenSuper) {
							child.error("Can't reference 'this' before calling super in derived class constructors");
						}
						// `super` has the same target in bound (arrow) functions, so check them too
						return !(child instanceof SuperCall) && (!(child instanceof Code) || child.bound);
					});
					return seenSuper;
				}

				propagateLhs() {
					var j, len1, name, param, ref1, results1;
					ref1 = this.params;
					results1 = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						param = ref1[j];
						({name} = param);
						if (name instanceof Arr || name instanceof Obj) {
							results1.push(name.propagateLhs(true));
						} else if (param instanceof Expansion) {
							results1.push(param.lhs = true);
						} else {
							results1.push(void 0);
						}
					}
					return results1;
				}

				astAddParamsToScope(o) {
					return this.eachParamName(function(name) {
						return o.scope.add(name, 'param');
					});
				}

				astNode(o) {
					var seenSuper;
					this.updateOptions(o);
					this.checkForAsyncOrGeneratorConstructor();
					this.checkForDuplicateParams();
					this.disallowSuperInParamDefaults({
						forAst: true
					});
					this.disallowLoneExpansionAndMultipleSplats();
					seenSuper = this.checkSuperCallsInConstructorBody();
					if (this.ctor === 'derived' && !seenSuper) {
						this.eachParamName((name, node) => {
							if (node.this) {
								return this.flagThisParamInDerivedClassConstructorWithoutCallingSuper(node);
							}
						});
					}
					this.astAddParamsToScope(o);
					if (!(this.body.isEmpty() || this.noReturn)) {
						this.body.makeReturn(null, true);
					}
					return super.astNode(o);
				}

				astType() {
					if (this.isMethod) {
						return 'ClassMethod';
					} else if (this.bound) {
						return 'ArrowFunctionExpression';
					} else {
						return 'FunctionExpression';
					}
				}

				paramForAst(param) {
					var name, splat, value;
					if (param instanceof Expansion) {
						return param;
					}
					({name, value, splat} = param);
					if (splat) {
						return new Splat(name, {
							lhs: true,
							postfix: splat.postfix
						}).withLocationDataFrom(param);
					} else if (value != null) {
						return new Assign(name, value, null, {
							param: true
						}).withLocationDataFrom({
							locationData: mergeLocationData(name.locationData, value.locationData)
						});
					} else {
						return name;
					}
				}

				methodAstProperties(o) {
					var getIsComputed, ref1, ref2, ref3, ref4;
					getIsComputed = () => {
						if (this.name instanceof Index) {
							return true;
						}
						if (this.name instanceof ComputedPropertyName) {
							return true;
						}
						if (this.name.name instanceof ComputedPropertyName) {
							return true;
						}
						return false;
					};
					return {
						static: !!this.isStatic,
						key: this.name.ast(o),
						computed: getIsComputed(),
						kind: this.ctor ? 'constructor' : 'method',
						operator: (ref1 = (ref2 = this.operatorToken) != null ? ref2.value : void 0) != null ? ref1 : '=',
						staticClassName: (ref3 = (ref4 = this.isStatic.staticClassName) != null ? ref4.ast(o) : void 0) != null ? ref3 : null,
						bound: !!this.bound
					};
				}

				astProperties(o) {
					var param, ref1;
					return Object.assign({
						params: (function() {
							var j, len1, ref1, results1;
							ref1 = this.params;
							results1 = [];
							for (j = 0, len1 = ref1.length; j < len1; j++) {
								param = ref1[j];
								results1.push(this.paramForAst(param).ast(o));
							}
							return results1;
						}).call(this),
						body: this.body.ast(Object.assign({}, o, {
							checkForDirectives: true
						}), LEVEL_TOP),
						generator: !!this.isGenerator,
						async: !!this.isAsync,
						// We never generate named functions, so specify `id` as `null`, which
						// matches the Babel AST for anonymous function expressions/arrow functions
						id: null,
						hasIndentedBody: this.body.locationData.first_line > ((ref1 = this.funcGlyph) != null ? ref1.locationData.first_line : void 0)
					}, this.isMethod ? this.methodAstProperties(o) : {});
				}

				astLocationData() {
					var astLocationData, functionLocationData;
					functionLocationData = super.astLocationData();
					if (!this.isMethod) {
						return functionLocationData;
					}
					astLocationData = mergeAstLocationData(this.name.astLocationData(), functionLocationData);
					if (this.isStatic.staticClassName != null) {
						astLocationData = mergeAstLocationData(this.isStatic.staticClassName.astLocationData(), astLocationData);
					}
					return astLocationData;
				}

			};

			Code.prototype.children = ['params', 'body'];

			Code.prototype.jumps = NO;

			return Code;

		}).call(this);

		//### Param

		// A parameter in a function definition. Beyond a typical JavaScript parameter,
		// these parameters can also attach themselves to the context of the function,
		// as well as be a splat, gathering up a group of parameters into an array.
		exports.Param = Param = (function() {
			class Param extends Base {
				constructor(name1, value1, splat1) {
					var message, token;
					super();
					this.name = name1;
					this.value = value1;
					this.splat = splat1;
					message = isUnassignable(this.name.unwrapAll().value);
					if (message) {
						this.name.error(message);
					}
					if (this.name instanceof Obj && this.name.generated) {
						token = this.name.objects[0].operatorToken;
						token.error(`unexpected ${token.value}`);
					}
				}

				compileToFragments(o) {
					return this.name.compileToFragments(o, LEVEL_LIST);
				}

				compileToFragmentsWithoutComments(o) {
					return this.name.compileToFragmentsWithoutComments(o, LEVEL_LIST);
				}

				asReference(o) {
					var name, node;
					if (this.reference) {
						return this.reference;
					}
					node = this.name;
					if (node.this) {
						name = node.properties[0].name.value;
						if (indexOf.call(JS_FORBIDDEN, name) >= 0) {
							name = `_${name}`;
						}
						node = new IdentifierLiteral(o.scope.freeVariable(name));
					} else if (node.shouldCache()) {
						node = new IdentifierLiteral(o.scope.freeVariable('arg'));
					}
					node = new Value(node);
					node.updateLocationDataIfMissing(this.locationData);
					return this.reference = node;
				}

				shouldCache() {
					return this.name.shouldCache();
				}

				// Iterates the name or names of a `Param`.
				// In a sense, a destructured parameter represents multiple JS parameters. This
				// method allows to iterate them all.
				// The `iterator` function will be called as `iterator(name, node)` where
				// `name` is the name of the parameter and `node` is the AST node corresponding
				// to that name.
				eachName(iterator, name = this.name) {
					var atParam, checkAssignabilityOfLiteral, j, len1, nObj, node, obj, ref1, ref2;
					checkAssignabilityOfLiteral = function(literal) {
						var message;
						message = isUnassignable(literal.value);
						if (message) {
							literal.error(message);
						}
						if (!literal.isAssignable()) {
							return literal.error(`'${literal.value}' can't be assigned`);
						}
					};
					atParam = (obj, originalObj = null) => {
						return iterator(`@${obj.properties[0].name.value}`, obj, this, originalObj);
					};
					if (name instanceof Call) {
						name.error("Function invocation can't be assigned");
					}
					// * simple literals `foo`
					if (name instanceof Literal) {
						checkAssignabilityOfLiteral(name);
						return iterator(name.value, name, this);
					}
					if (name instanceof Value) {
						// * at-params `@foo`
						return atParam(name);
					}
					ref2 = (ref1 = name.objects) != null ? ref1 : [];
					for (j = 0, len1 = ref2.length; j < len1; j++) {
						obj = ref2[j];
						// Save original obj.
						nObj = obj;
						// * destructured parameter with default value
						if (obj instanceof Assign && (obj.context == null)) {
							obj = obj.variable;
						}
						// * assignments within destructured parameters `{foo:bar}`
						if (obj instanceof Assign) {
							// ... possibly with a default value
							if (obj.value instanceof Assign) {
								obj = obj.value.variable;
							} else {
								obj = obj.value;
							}
							this.eachName(iterator, obj.unwrap());
						// * splats within destructured parameters `[xs...]`
						} else if (obj instanceof Splat) {
							node = obj.name.unwrap();
							iterator(node.value, node, this);
						} else if (obj instanceof Value) {
							// * destructured parameters within destructured parameters `[{a}]`
							if (obj.isArray() || obj.isObject()) {
								this.eachName(iterator, obj.base);
							// * at-params within destructured parameters `{@foo}`
							} else if (obj.this) {
								atParam(obj, nObj);
							} else {
								// * simple destructured parameters {foo}
								checkAssignabilityOfLiteral(obj.base);
								iterator(obj.base.value, obj.base, this);
							}
						} else if (obj instanceof Elision) {
							obj;
						} else if (!(obj instanceof Expansion)) {
							obj.error(`illegal parameter ${obj.compile()}`);
						}
					}
				}

				// Rename a param by replacing the given AST node for a name with a new node.
				// This needs to ensure that the the source for object destructuring does not change.
				renameParam(node, newNode) {
					var isNode, replacement;
					isNode = function(candidate) {
						return candidate === node;
					};
					replacement = (node, parent) => {
						var key;
						if (parent instanceof Obj) {
							key = node;
							if (node.this) {
								key = node.properties[0].name;
							}
							// No need to assign a new variable for the destructured variable if the variable isn't reserved.
							// Examples:
							// `({@foo}) ->`  should compile to `({foo}) { this.foo = foo}`
							// `foo = 1; ({@foo}) ->` should compile to `foo = 1; ({foo:foo1}) { this.foo = foo1 }`
							if (node.this && key.value === newNode.value) {
								return new Value(newNode);
							} else {
								return new Assign(new Value(key), newNode, 'object');
							}
						} else {
							return newNode;
						}
					};
					return this.replaceInContext(isNode, replacement);
				}

			};

			Param.prototype.children = ['name', 'value'];

			return Param;

		}).call(this);

		//### Splat

		// A splat, either as a parameter to a function, an argument to a call,
		// or as part of a destructuring assignment.
		exports.Splat = Splat = (function() {
			class Splat extends Base {
				constructor(name, {
						lhs: lhs1,
						postfix: postfix = true
					} = {}) {
					super();
					this.lhs = lhs1;
					this.postfix = postfix;
					this.name = name.compile ? name : new Literal(name);
				}

				shouldCache() {
					return false;
				}

				isAssignable({allowComplexSplat = false} = {}) {
					if (this.name instanceof Obj || this.name instanceof Parens) {
						return allowComplexSplat;
					}
					return this.name.isAssignable() && (!this.name.isAtomic || this.name.isAtomic());
				}

				assigns(name) {
					return this.name.assigns(name);
				}

				compileNode(o) {
					var compiledSplat;
					compiledSplat = [this.makeCode('...'), ...this.name.compileToFragments(o, LEVEL_OP)];
					if (!this.jsx) {
						return compiledSplat;
					}
					return [this.makeCode('{'), ...compiledSplat, this.makeCode('}')];
				}

				unwrap() {
					return this.name;
				}

				propagateLhs(setLhs) {
					var base1;
					if (setLhs) {
						this.lhs = true;
					}
					if (!this.lhs) {
						return;
					}
					return typeof (base1 = this.name).propagateLhs === "function" ? base1.propagateLhs(true) : void 0;
				}

				astType() {
					if (this.jsx) {
						return 'JSXSpreadAttribute';
					} else if (this.lhs) {
						return 'RestElement';
					} else {
						return 'SpreadElement';
					}
				}

				astProperties(o) {
					return {
						argument: this.name.ast(o, LEVEL_OP),
						postfix: this.postfix
					};
				}

			};

			Splat.prototype.children = ['name'];

			return Splat;

		}).call(this);

		//### Expansion

		// Used to skip values inside an array destructuring (pattern matching) or
		// parameter list.
		exports.Expansion = Expansion = (function() {
			class Expansion extends Base {
				compileNode(o) {
					return this.throwLhsError();
				}

				asReference(o) {
					return this;
				}

				eachName(iterator) {}

				throwLhsError() {
					return this.error('Expansion must be used inside a destructuring assignment or parameter list');
				}

				astNode(o) {
					if (!this.lhs) {
						this.throwLhsError();
					}
					return super.astNode(o);
				}

				astType() {
					return 'RestElement';
				}

				astProperties() {
					return {
						argument: null
					};
				}

			};

			Expansion.prototype.shouldCache = NO;

			return Expansion;

		}).call(this);

		//### Elision

		// Array elision element (for example, [,a, , , b, , c, ,]).
		exports.Elision = Elision = (function() {
			class Elision extends Base {
				compileToFragments(o, level) {
					var fragment;
					fragment = super.compileToFragments(o, level);
					fragment.isElision = true;
					return fragment;
				}

				compileNode(o) {
					return [this.makeCode(', ')];
				}

				asReference(o) {
					return this;
				}

				eachName(iterator) {}

				astNode() {
					return null;
				}

			};

			Elision.prototype.isAssignable = YES;

			Elision.prototype.shouldCache = NO;

			return Elision;

		}).call(this);

		//### While

		// A while loop, the only sort of low-level loop exposed by CoffeeScript. From
		// it, all other loops can be manufactured. Useful in cases where you need more
		// flexibility or more speed than a comprehension can provide.
		exports.While = While = (function() {
			class While extends Base {
				constructor(condition1, {
						invert: inverted,
						guard,
						isLoop
					} = {}) {
					super();
					this.condition = condition1;
					this.inverted = inverted;
					this.guard = guard;
					this.isLoop = isLoop;
				}

				makeReturn(results, mark) {
					if (results) {
						return super.makeReturn(results, mark);
					}
					this.returns = !this.jumps();
					if (mark) {
						if (this.returns) {
							this.body.makeReturn(results, mark);
						}
						return;
					}
					return this;
				}

				addBody(body1) {
					this.body = body1;
					return this;
				}

				jumps() {
					var expressions, j, jumpNode, len1, node;
					({expressions} = this.body);
					if (!expressions.length) {
						return false;
					}
					for (j = 0, len1 = expressions.length; j < len1; j++) {
						node = expressions[j];
						if (jumpNode = node.jumps({
							loop: true
						})) {
							return jumpNode;
						}
					}
					return false;
				}

				// The main difference from a JavaScript *while* is that the CoffeeScript
				// *while* can be used as a part of a larger expression -- while loops may
				// return an array containing the computed result of each iteration.
				compileNode(o) {
					var answer, body, rvar, set;
					o.indent += TAB;
					set = '';
					({body} = this);
					if (body.isEmpty()) {
						body = this.makeCode('');
					} else {
						if (this.returns) {
							body.makeReturn(rvar = o.scope.freeVariable('results'));
							set = `${this.tab}${rvar} = [];\n`;
						}
						if (this.guard) {
							if (body.expressions.length > 1) {
								body.expressions.unshift(new If((new Parens(this.guard)).invert(), new StatementLiteral("continue")));
							} else {
								if (this.guard) {
									body = Block.wrap([new If(this.guard, body)]);
								}
							}
						}
						body = [].concat(this.makeCode("\n"), body.compileToFragments(o, LEVEL_TOP), this.makeCode(`\n${this.tab}`));
					}
					answer = [].concat(this.makeCode(set + this.tab + "while ("), this.processedCondition().compileToFragments(o, LEVEL_PAREN), this.makeCode(") {"), body, this.makeCode("}"));
					if (this.returns) {
						answer.push(this.makeCode(`\n${this.tab}return ${rvar};`));
					}
					return answer;
				}

				processedCondition() {
					return this.processedConditionCache != null ? this.processedConditionCache : this.processedConditionCache = this.inverted ? this.condition.invert() : this.condition;
				}

				astType() {
					return 'WhileStatement';
				}

				astProperties(o) {
					var ref1, ref2;
					return {
						test: this.condition.ast(o, LEVEL_PAREN),
						body: this.body.ast(o, LEVEL_TOP),
						guard: (ref1 = (ref2 = this.guard) != null ? ref2.ast(o) : void 0) != null ? ref1 : null,
						inverted: !!this.inverted,
						postfix: !!this.postfix,
						loop: !!this.isLoop
					};
				}

			};

			While.prototype.children = ['condition', 'guard', 'body'];

			While.prototype.isStatement = YES;

			return While;

		}).call(this);

		//### Op

		// Simple Arithmetic and logical operations. Performs some conversion from
		// CoffeeScript operations into their JavaScript equivalents.
		exports.Op = Op = (function() {
			var CONVERSIONS, INVERSIONS;

			class Op extends Base {
				constructor(op, first, second, flip, {invertOperator, originalOperator: originalOperator = op} = {}) {
					var call, firstCall, message, ref1, unwrapped;
					super();
					this.invertOperator = invertOperator;
					this.originalOperator = originalOperator;
					if (op === 'new') {
						if (((firstCall = unwrapped = first.unwrap()) instanceof Call || (firstCall = unwrapped.base) instanceof Call) && !firstCall.do && !firstCall.isNew) {
							return new Value(firstCall.newInstance(), firstCall === unwrapped ? [] : unwrapped.properties);
						}
						if (!(first instanceof Parens || first.unwrap() instanceof IdentifierLiteral || (typeof first.hasProperties === "function" ? first.hasProperties() : void 0))) {
							first = new Parens(first);
						}
						call = new Call(first, []);
						call.locationData = this.locationData;
						call.isNew = true;
						return call;
					}
					this.operator = CONVERSIONS[op] || op;
					this.first = first;
					this.second = second;
					this.flip = !!flip;
					if ((ref1 = this.operator) === '--' || ref1 === '++') {
						message = isUnassignable(this.first.unwrapAll().value);
						if (message) {
							this.first.error(message);
						}
					}
					return this;
				}

				isNumber() {
					var ref1;
					return this.isUnary() && ((ref1 = this.operator) === '+' || ref1 === '-') && this.first instanceof Value && this.first.isNumber();
				}

				isAwait() {
					return this.operator === 'await';
				}

				isYield() {
					var ref1;
					return (ref1 = this.operator) === 'yield' || ref1 === 'yield*';
				}

				isUnary() {
					return !this.second;
				}

				shouldCache() {
					return !this.isNumber();
				}

				// Am I capable of
				// [Python-style comparison chaining](https://docs.python.org/3/reference/expressions.html#not-in)?
				isChainable() {
					var ref1;
					return (ref1 = this.operator) === '<' || ref1 === '>' || ref1 === '>=' || ref1 === '<=' || ref1 === '===' || ref1 === '!==';
				}

				isChain() {
					return this.isChainable() && this.first.isChainable();
				}

				invert() {
					var allInvertable, curr, fst, op, ref1;
					if (this.isInOperator()) {
						this.invertOperator = '!';
						return this;
					}
					if (this.isChain()) {
						allInvertable = true;
						curr = this;
						while (curr && curr.operator) {
							allInvertable && (allInvertable = curr.operator in INVERSIONS);
							curr = curr.first;
						}
						if (!allInvertable) {
							return new Parens(this).invert();
						}
						curr = this;
						while (curr && curr.operator) {
							curr.invert = !curr.invert;
							curr.operator = INVERSIONS[curr.operator];
							curr = curr.first;
						}
						return this;
					} else if (op = INVERSIONS[this.operator]) {
						this.operator = op;
						if (this.first.unwrap() instanceof Op) {
							this.first.invert();
						}
						return this;
					} else if (this.second) {
						return new Parens(this).invert();
					} else if (this.operator === '!' && (fst = this.first.unwrap()) instanceof Op && ((ref1 = fst.operator) === '!' || ref1 === 'in' || ref1 === 'instanceof')) {
						return fst;
					} else {
						return new Op('!', this);
					}
				}

				unfoldSoak(o) {
					var ref1;
					return ((ref1 = this.operator) === '++' || ref1 === '--' || ref1 === 'delete') && unfoldSoak(o, this, 'first');
				}

				generateDo(exp) {
					var call, func, j, len1, param, passedParams, ref, ref1;
					passedParams = [];
					func = exp instanceof Assign && (ref = exp.value.unwrap()) instanceof Code ? ref : exp;
					ref1 = func.params || [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						param = ref1[j];
						if (param.value) {
							passedParams.push(param.value);
							delete param.value;
						} else {
							passedParams.push(param);
						}
					}
					call = new Call(exp, passedParams);
					call.do = true;
					return call;
				}

				isInOperator() {
					return this.originalOperator === 'in';
				}

				compileNode(o) {
					var answer, inNode, isChain, lhs, rhs;
					if (this.isInOperator()) {
						inNode = new In(this.first, this.second);
						return (this.invertOperator ? inNode.invert() : inNode).compileNode(o);
					}
					if (this.invertOperator) {
						this.invertOperator = null;
						return this.invert().compileNode(o);
					}
					if (this.operator === 'do') {
						return Op.prototype.generateDo(this.first).compileNode(o);
					}
					isChain = this.isChain();
					if (!isChain) {
						// In chains, there's no need to wrap bare obj literals in parens,
						// as the chained expression is wrapped.
						this.first.front = this.front;
					}
					this.checkDeleteOperand(o);
					if (this.isYield() || this.isAwait()) {
						return this.compileContinuation(o);
					}
					if (this.isUnary()) {
						return this.compileUnary(o);
					}
					if (isChain) {
						return this.compileChain(o);
					}
					switch (this.operator) {
						case '?':
							return this.compileExistence(o, this.second.isDefaultValue);
						case '//':
							return this.compileFloorDivision(o);
						case '%%':
							return this.compileModulo(o);
						default:
							lhs = this.first.compileToFragments(o, LEVEL_OP);
							rhs = this.second.compileToFragments(o, LEVEL_OP);
							answer = [].concat(lhs, this.makeCode(` ${this.operator} `), rhs);
							if (o.level <= LEVEL_OP) {
								return answer;
							} else {
								return this.wrapInParentheses(answer);
							}
					}
				}

				// Mimic Python's chained comparisons when multiple comparison operators are
				// used sequentially. For example:

				//     bin/coffee -e 'console.log 50 < 65 > 10'
				//     true
				compileChain(o) {
					var fragments, fst, shared;
					[this.first.second, shared] = this.first.second.cache(o);
					fst = this.first.compileToFragments(o, LEVEL_OP);
					fragments = fst.concat(this.makeCode(` ${this.invert ? '&&' : '||'} `), shared.compileToFragments(o), this.makeCode(` ${this.operator} `), this.second.compileToFragments(o, LEVEL_OP));
					return this.wrapInParentheses(fragments);
				}

				// Keep reference to the left expression, unless this an existential assignment
				compileExistence(o, checkOnlyUndefined) {
					var fst, ref;
					if (this.first.shouldCache()) {
						ref = new IdentifierLiteral(o.scope.freeVariable('ref'));
						fst = new Parens(new Assign(ref, this.first));
					} else {
						fst = this.first;
						ref = fst;
					}
					return new If(new Existence(fst, checkOnlyUndefined), ref, {
						type: 'if'
					}).addElse(this.second).compileToFragments(o);
				}

				// Compile a unary **Op**.
				compileUnary(o) {
					var op, parts, plusMinus;
					parts = [];
					op = this.operator;
					parts.push([this.makeCode(op)]);
					if (op === '!' && this.first instanceof Existence) {
						this.first.negated = !this.first.negated;
						return this.first.compileToFragments(o);
					}
					if (o.level >= LEVEL_ACCESS) {
						return (new Parens(this)).compileToFragments(o);
					}
					plusMinus = op === '+' || op === '-';
					if ((op === 'typeof' || op === 'delete') || plusMinus && this.first instanceof Op && this.first.operator === op) {
						parts.push([this.makeCode(' ')]);
					}
					if (plusMinus && this.first instanceof Op) {
						this.first = new Parens(this.first);
					}
					parts.push(this.first.compileToFragments(o, LEVEL_OP));
					if (this.flip) {
						parts.reverse();
					}
					return this.joinFragmentArrays(parts, '');
				}

				compileContinuation(o) {
					var op, parts, ref1;
					parts = [];
					op = this.operator;
					if (!this.isAwait()) {
						this.checkContinuation(o);
					}
					if (indexOf.call(Object.keys(this.first), 'expression') >= 0 && !(this.first instanceof Throw)) {
						if (this.first.expression != null) {
							parts.push(this.first.expression.compileToFragments(o, LEVEL_OP));
						}
					} else {
						if (o.level >= LEVEL_PAREN) {
							parts.push([this.makeCode("(")]);
						}
						parts.push([this.makeCode(op)]);
						if (((ref1 = this.first.base) != null ? ref1.value : void 0) !== '') {
							parts.push([this.makeCode(" ")]);
						}
						parts.push(this.first.compileToFragments(o, LEVEL_OP));
						if (o.level >= LEVEL_PAREN) {
							parts.push([this.makeCode(")")]);
						}
					}
					return this.joinFragmentArrays(parts, '');
				}

				checkContinuation(o) {
					var ref1;
					if (o.scope.parent == null) {
						this.error(`${this.operator} can only occur inside functions`);
					}
					if (((ref1 = o.scope.method) != null ? ref1.bound : void 0) && o.scope.method.isGenerator) {
						return this.error('yield cannot occur inside bound (fat arrow) functions');
					}
				}

				compileFloorDivision(o) {
					var div, floor, second;
					floor = new Value(new IdentifierLiteral('Math'), [new Access(new PropertyName('floor'))]);
					second = this.second.shouldCache() ? new Parens(this.second) : this.second;
					div = new Op('/', this.first, second);
					return new Call(floor, [div]).compileToFragments(o);
				}

				compileModulo(o) {
					var mod;
					mod = new Value(new Literal(utility('modulo', o)));
					return new Call(mod, [this.first, this.second]).compileToFragments(o);
				}

				toString(idt) {
					return super.toString(idt, this.constructor.name + ' ' + this.operator);
				}

				checkDeleteOperand(o) {
					if (this.operator === 'delete' && o.scope.check(this.first.unwrapAll().value)) {
						return this.error('delete operand may not be argument or var');
					}
				}

				astNode(o) {
					if (this.isYield()) {
						this.checkContinuation(o);
					}
					this.checkDeleteOperand(o);
					return super.astNode(o);
				}

				astType() {
					if (this.isAwait()) {
						return 'AwaitExpression';
					}
					if (this.isYield()) {
						return 'YieldExpression';
					}
					if (this.isChain()) {
						return 'ChainedComparison';
					}
					switch (this.operator) {
						case '||':
						case '&&':
						case '?':
							return 'LogicalExpression';
						case '++':
						case '--':
							return 'UpdateExpression';
						default:
							if (this.isUnary()) {
								return 'UnaryExpression';
							} else {
								return 'BinaryExpression';
							}
					}
				}

				operatorAst() {
					return `${this.invertOperator ? `${this.invertOperator} ` : ''}${this.originalOperator}`;
				}

				chainAstProperties(o) {
					var currentOp, operand, operands, operators;
					operators = [this.operatorAst()];
					operands = [this.second];
					currentOp = this.first;
					while (true) {
						operators.unshift(currentOp.operatorAst());
						operands.unshift(currentOp.second);
						currentOp = currentOp.first;
						if (!currentOp.isChainable()) {
							operands.unshift(currentOp);
							break;
						}
					}
					return {
						operators,
						operands: (function() {
							var j, len1, results1;
							results1 = [];
							for (j = 0, len1 = operands.length; j < len1; j++) {
								operand = operands[j];
								results1.push(operand.ast(o, LEVEL_OP));
							}
							return results1;
						})()
					};
				}

				astProperties(o) {
					var argument, firstAst, operatorAst, ref1, secondAst;
					if (this.isChain()) {
						return this.chainAstProperties(o);
					}
					firstAst = this.first.ast(o, LEVEL_OP);
					secondAst = (ref1 = this.second) != null ? ref1.ast(o, LEVEL_OP) : void 0;
					operatorAst = this.operatorAst();
					switch (false) {
						case !this.isUnary():
							argument = this.isYield() && this.first.unwrap().value === '' ? null : firstAst;
							if (this.isAwait()) {
								return {argument};
							}
							if (this.isYield()) {
								return {
									argument,
									delegate: this.operator === 'yield*'
								};
							}
							return {
								argument,
								operator: operatorAst,
								prefix: !this.flip
							};
						default:
							return {
								left: firstAst,
								right: secondAst,
								operator: operatorAst
							};
					}
				}

			};

			// The map of conversions from CoffeeScript to JavaScript symbols.
			CONVERSIONS = {
				'==': '===',
				'!=': '!==',
				'of': 'in',
				'yieldfrom': 'yield*'
			};

			// The map of invertible operators.
			INVERSIONS = {
				'!==': '===',
				'===': '!=='
			};

			Op.prototype.children = ['first', 'second'];

			return Op;

		}).call(this);

		//### In
		exports.In = In = (function() {
			class In extends Base {
				constructor(object1, array) {
					super();
					this.object = object1;
					this.array = array;
				}

				compileNode(o) {
					var hasSplat, j, len1, obj, ref1;
					if (this.array instanceof Value && this.array.isArray() && this.array.base.objects.length) {
						ref1 = this.array.base.objects;
						for (j = 0, len1 = ref1.length; j < len1; j++) {
							obj = ref1[j];
							if (!(obj instanceof Splat)) {
								continue;
							}
							hasSplat = true;
							break;
						}
						if (!hasSplat) {
							// `compileOrTest` only if we have an array literal with no splats
							return this.compileOrTest(o);
						}
					}
					return this.compileLoopTest(o);
				}

				compileOrTest(o) {
					var cmp, cnj, i, item, j, len1, ref, ref1, sub, tests;
					[sub, ref] = this.object.cache(o, LEVEL_OP);
					[cmp, cnj] = this.negated ? [' !== ', ' && '] : [' === ', ' || '];
					tests = [];
					ref1 = this.array.base.objects;
					for (i = j = 0, len1 = ref1.length; j < len1; i = ++j) {
						item = ref1[i];
						if (i) {
							tests.push(this.makeCode(cnj));
						}
						tests = tests.concat((i ? ref : sub), this.makeCode(cmp), item.compileToFragments(o, LEVEL_ACCESS));
					}
					if (o.level < LEVEL_OP) {
						return tests;
					} else {
						return this.wrapInParentheses(tests);
					}
				}

				compileLoopTest(o) {
					var fragments, ref, sub;
					[sub, ref] = this.object.cache(o, LEVEL_LIST);
					fragments = [].concat(this.makeCode(utility('indexOf', o) + ".call("), this.array.compileToFragments(o, LEVEL_LIST), this.makeCode(", "), ref, this.makeCode(") " + (this.negated ? '< 0' : '>= 0')));
					if (fragmentsToText(sub) === fragmentsToText(ref)) {
						return fragments;
					}
					fragments = sub.concat(this.makeCode(', '), fragments);
					if (o.level < LEVEL_LIST) {
						return fragments;
					} else {
						return this.wrapInParentheses(fragments);
					}
				}

				toString(idt) {
					return super.toString(idt, this.constructor.name + (this.negated ? '!' : ''));
				}

			};

			In.prototype.children = ['object', 'array'];

			In.prototype.invert = NEGATE;

			return In;

		}).call(this);

		//### Try

		// A classic *try/catch/finally* block.
		exports.Try = Try = (function() {
			class Try extends Base {
				constructor(attempt, _catch, ensure, finallyTag) {
					super();
					this.attempt = attempt;
					this.catch = _catch;
					this.ensure = ensure;
					this.finallyTag = finallyTag;
				}

				jumps(o) {
					var ref1;
					return this.attempt.jumps(o) || ((ref1 = this.catch) != null ? ref1.jumps(o) : void 0);
				}

				makeReturn(results, mark) {
					var ref1, ref2;
					if (mark) {
						if ((ref1 = this.attempt) != null) {
							ref1.makeReturn(results, mark);
						}
						if ((ref2 = this.catch) != null) {
							ref2.makeReturn(results, mark);
						}
						return;
					}
					if (this.attempt) {
						this.attempt = this.attempt.makeReturn(results);
					}
					if (this.catch) {
						this.catch = this.catch.makeReturn(results);
					}
					return this;
				}

				// Compilation is more or less as you would expect -- the *finally* clause
				// is optional, the *catch* is not.
				compileNode(o) {
					var catchPart, ensurePart, generatedErrorVariableName, originalIndent, tryPart;
					originalIndent = o.indent;
					o.indent += TAB;
					tryPart = this.attempt.compileToFragments(o, LEVEL_TOP);
					catchPart = this.catch ? this.catch.compileToFragments(merge(o, {
						indent: originalIndent
					}), LEVEL_TOP) : !(this.ensure || this.catch) ? (generatedErrorVariableName = o.scope.freeVariable('error', {
						reserve: false
					}), [this.makeCode(` catch (${generatedErrorVariableName}) {}`)]) : [];
					ensurePart = this.ensure ? [].concat(this.makeCode(" finally {\n"), this.ensure.compileToFragments(o, LEVEL_TOP), this.makeCode(`\n${this.tab}}`)) : [];
					return [].concat(this.makeCode(`${this.tab}try {\n`), tryPart, this.makeCode(`\n${this.tab}}`), catchPart, ensurePart);
				}

				astType() {
					return 'TryStatement';
				}

				astProperties(o) {
					var ref1, ref2;
					return {
						block: this.attempt.ast(o, LEVEL_TOP),
						handler: (ref1 = (ref2 = this.catch) != null ? ref2.ast(o) : void 0) != null ? ref1 : null,
						// Include `finally` keyword in location data.
						finalizer: this.ensure != null ? Object.assign(this.ensure.ast(o, LEVEL_TOP), mergeAstLocationData(jisonLocationDataToAstLocationData(this.finallyTag.locationData), this.ensure.astLocationData())) : null
					};
				}

			};

			Try.prototype.children = ['attempt', 'catch', 'ensure'];

			Try.prototype.isStatement = YES;

			return Try;

		}).call(this);

		exports.Catch = Catch = (function() {
			class Catch extends Base {
				constructor(recovery, errorVariable) {
					var base1, ref1;
					super();
					this.recovery = recovery;
					this.errorVariable = errorVariable;
					if ((ref1 = this.errorVariable) != null) {
						if (typeof (base1 = ref1.unwrap()).propagateLhs === "function") {
							base1.propagateLhs(true);
						}
					}
				}

				jumps(o) {
					return this.recovery.jumps(o);
				}

				makeReturn(results, mark) {
					var ret;
					ret = this.recovery.makeReturn(results, mark);
					if (mark) {
						return;
					}
					this.recovery = ret;
					return this;
				}

				compileNode(o) {
					var generatedErrorVariableName, placeholder;
					o.indent += TAB;
					generatedErrorVariableName = o.scope.freeVariable('error', {
						reserve: false
					});
					placeholder = new IdentifierLiteral(generatedErrorVariableName);
					this.checkUnassignable();
					if (this.errorVariable) {
						this.recovery.unshift(new Assign(this.errorVariable, placeholder));
					}
					return [].concat(this.makeCode(" catch ("), placeholder.compileToFragments(o), this.makeCode(") {\n"), this.recovery.compileToFragments(o, LEVEL_TOP), this.makeCode(`\n${this.tab}}`));
				}

				checkUnassignable() {
					var message;
					if (this.errorVariable) {
						message = isUnassignable(this.errorVariable.unwrapAll().value);
						if (message) {
							return this.errorVariable.error(message);
						}
					}
				}

				astNode(o) {
					var ref1;
					this.checkUnassignable();
					if ((ref1 = this.errorVariable) != null) {
						ref1.eachName(function(name) {
							var alreadyDeclared;
							alreadyDeclared = o.scope.find(name.value);
							return name.isDeclaration = !alreadyDeclared;
						});
					}
					return super.astNode(o);
				}

				astType() {
					return 'CatchClause';
				}

				astProperties(o) {
					var ref1, ref2;
					return {
						param: (ref1 = (ref2 = this.errorVariable) != null ? ref2.ast(o) : void 0) != null ? ref1 : null,
						body: this.recovery.ast(o, LEVEL_TOP)
					};
				}

			};

			Catch.prototype.children = ['recovery', 'errorVariable'];

			Catch.prototype.isStatement = YES;

			return Catch;

		}).call(this);

		//### Throw

		// Simple node to throw an exception.
		exports.Throw = Throw = (function() {
			class Throw extends Base {
				constructor(expression1) {
					super();
					this.expression = expression1;
				}

				compileNode(o) {
					var fragments;
					fragments = this.expression.compileToFragments(o, LEVEL_LIST);
					unshiftAfterComments(fragments, this.makeCode('throw '));
					fragments.unshift(this.makeCode(this.tab));
					fragments.push(this.makeCode(';'));
					return fragments;
				}

				astType() {
					return 'ThrowStatement';
				}

				astProperties(o) {
					return {
						argument: this.expression.ast(o, LEVEL_LIST)
					};
				}

			};

			Throw.prototype.children = ['expression'];

			Throw.prototype.isStatement = YES;

			Throw.prototype.jumps = NO;

			// A **Throw** is already a return, of sorts...
			Throw.prototype.makeReturn = THIS;

			return Throw;

		}).call(this);

		//### Existence

		// Checks a variable for existence -- not `null` and not `undefined`. This is
		// similar to `.nil?` in Ruby, and avoids having to consult a JavaScript truth
		// table. Optionally only check if a variable is not `undefined`.
		exports.Existence = Existence = (function() {
			class Existence extends Base {
				constructor(expression1, onlyNotUndefined = false) {
					var salvagedComments;
					super();
					this.expression = expression1;
					this.comparisonTarget = onlyNotUndefined ? 'undefined' : 'null';
					salvagedComments = [];
					this.expression.traverseChildren(true, function(child) {
						var comment, j, len1, ref1;
						if (child.comments) {
							ref1 = child.comments;
							for (j = 0, len1 = ref1.length; j < len1; j++) {
								comment = ref1[j];
								if (indexOf.call(salvagedComments, comment) < 0) {
									salvagedComments.push(comment);
								}
							}
							return delete child.comments;
						}
					});
					attachCommentsToNode(salvagedComments, this);
					moveComments(this.expression, this);
				}

				compileNode(o) {
					var cmp, cnj, code;
					this.expression.front = this.front;
					code = this.expression.compile(o, LEVEL_OP);
					if (this.expression.unwrap() instanceof IdentifierLiteral && !o.scope.check(code)) {
						[cmp, cnj] = this.negated ? ['===', '||'] : ['!==', '&&'];
						code = `typeof ${code} ${cmp} \"undefined\"` + (this.comparisonTarget !== 'undefined' ? ` ${cnj} ${code} ${cmp} ${this.comparisonTarget}` : '');
					} else {
						// We explicity want to use loose equality (`==`) when comparing against `null`,
						// so that an existence check roughly corresponds to a check for truthiness.
						// Do *not* change this to `===` for `null`, as this will break mountains of
						// existing code. When comparing only against `undefined`, however, we want to
						// use `===` because this use case is for parity with ES2015+ default values,
						// which only get assigned when the variable is `undefined` (but not `null`).
						cmp = this.comparisonTarget === 'null' ? this.negated ? '==' : '!=' : this.negated ? '===' : '!=='; // `undefined`
						code = `${code} ${cmp} ${this.comparisonTarget}`;
					}
					return [this.makeCode(o.level <= LEVEL_COND ? code : `(${code})`)];
				}

				astType() {
					return 'UnaryExpression';
				}

				astProperties(o) {
					return {
						argument: this.expression.ast(o),
						operator: '?',
						prefix: false
					};
				}

			};

			Existence.prototype.children = ['expression'];

			Existence.prototype.invert = NEGATE;

			return Existence;

		}).call(this);

		//### Parens

		// An extra set of parentheses, specified explicitly in the source. At one time
		// we tried to clean up the results by detecting and removing redundant
		// parentheses, but no longer -- you can put in as many as you please.

		// Parentheses are a good way to force any statement to become an expression.
		exports.Parens = Parens = (function() {
			class Parens extends Base {
				constructor(body1) {
					super();
					this.body = body1;
				}

				unwrap() {
					return this.body;
				}

				shouldCache() {
					return this.body.shouldCache();
				}

				compileNode(o) {
					var bare, expr, fragments, ref1, shouldWrapComment;
					expr = this.body.unwrap();
					// If these parentheses are wrapping an `IdentifierLiteral` followed by a
					// block comment, output the parentheses (or put another way, don’t optimize
					// away these redundant parentheses). This is because Flow requires
					// parentheses in certain circumstances to distinguish identifiers followed
					// by comment-based type annotations from JavaScript labels.
					shouldWrapComment = (ref1 = expr.comments) != null ? ref1.some(function(comment) {
						return comment.here && !comment.unshift && !comment.newLine;
					}) : void 0;
					if (expr instanceof Value && expr.isAtomic() && !this.jsxAttribute && !shouldWrapComment) {
						expr.front = this.front;
						return expr.compileToFragments(o);
					}
					fragments = expr.compileToFragments(o, LEVEL_PAREN);
					bare = o.level < LEVEL_OP && !shouldWrapComment && (expr instanceof Op && !expr.isInOperator() || expr.unwrap() instanceof Call || (expr instanceof For && expr.returns)) && (o.level < LEVEL_COND || fragments.length <= 3);
					if (this.jsxAttribute) {
						return this.wrapInBraces(fragments);
					}
					if (bare) {
						return fragments;
					} else {
						return this.wrapInParentheses(fragments);
					}
				}

				astNode(o) {
					return this.body.unwrap().ast(o, LEVEL_PAREN);
				}

			};

			Parens.prototype.children = ['body'];

			return Parens;

		}).call(this);

		//### StringWithInterpolations
		exports.StringWithInterpolations = StringWithInterpolations = (function() {
			class StringWithInterpolations extends Base {
				constructor(body1, {quote, startQuote, jsxAttribute} = {}) {
					super();
					this.body = body1;
					this.quote = quote;
					this.startQuote = startQuote;
					this.jsxAttribute = jsxAttribute;
				}

				static fromStringLiteral(stringLiteral) {
					var updatedString, updatedStringValue;
					updatedString = stringLiteral.withoutQuotesInLocationData();
					updatedStringValue = new Value(updatedString).withLocationDataFrom(updatedString);
					return new StringWithInterpolations(Block.wrap([updatedStringValue]), {
						quote: stringLiteral.quote,
						jsxAttribute: stringLiteral.jsxAttribute
					}).withLocationDataFrom(stringLiteral);
				}

				// `unwrap` returns `this` to stop ancestor nodes reaching in to grab @body,
				// and using @body.compileNode. `StringWithInterpolations.compileNode` is
				// _the_ custom logic to output interpolated strings as code.
				unwrap() {
					return this;
				}

				shouldCache() {
					return this.body.shouldCache();
				}

				extractElements(o, {includeInterpolationWrappers, isJsx} = {}) {
					var elements, expr, salvagedComments;
					// Assumes that `expr` is `Block`
					expr = this.body.unwrap();
					elements = [];
					salvagedComments = [];
					expr.traverseChildren(false, (node) => {
						var comment, commentPlaceholder, empty, j, k, len1, len2, ref1, ref2, ref3, unwrapped;
						if (node instanceof StringLiteral) {
							if (node.comments) {
								salvagedComments.push(...node.comments);
								delete node.comments;
							}
							elements.push(node);
							return true;
						} else if (node instanceof Interpolation) {
							if (salvagedComments.length !== 0) {
								for (j = 0, len1 = salvagedComments.length; j < len1; j++) {
									comment = salvagedComments[j];
									comment.unshift = true;
									comment.newLine = true;
								}
								attachCommentsToNode(salvagedComments, node);
							}
							if ((unwrapped = (ref1 = node.expression) != null ? ref1.unwrapAll() : void 0) instanceof PassthroughLiteral && unwrapped.generated && !(isJsx && o.compiling)) {
								if (o.compiling) {
									commentPlaceholder = new StringLiteral('').withLocationDataFrom(node);
									commentPlaceholder.comments = unwrapped.comments;
									if (node.comments) {
										(commentPlaceholder.comments != null ? commentPlaceholder.comments : commentPlaceholder.comments = []).push(...node.comments);
									}
									elements.push(new Value(commentPlaceholder));
								} else {
									empty = new Interpolation().withLocationDataFrom(node);
									empty.comments = node.comments;
									elements.push(empty);
								}
							} else if (node.expression || includeInterpolationWrappers) {
								if (node.comments) {
									((ref2 = node.expression) != null ? ref2.comments != null ? ref2.comments : ref2.comments = [] : void 0).push(...node.comments);
								}
								elements.push(includeInterpolationWrappers ? node : node.expression);
							}
							return false;
						} else if (node.comments) {
							// This node is getting discarded, but salvage its comments.
							if (elements.length !== 0 && !(elements[elements.length - 1] instanceof StringLiteral)) {
								ref3 = node.comments;
								for (k = 0, len2 = ref3.length; k < len2; k++) {
									comment = ref3[k];
									comment.unshift = false;
									comment.newLine = true;
								}
								attachCommentsToNode(node.comments, elements[elements.length - 1]);
							} else {
								salvagedComments.push(...node.comments);
							}
							delete node.comments;
						}
						return true;
					});
					return elements;
				}

				compileNode(o) {
					var code, element, elements, fragments, j, len1, ref1, unquotedElementValue, wrapped;
					if (this.comments == null) {
						this.comments = (ref1 = this.startQuote) != null ? ref1.comments : void 0;
					}
					if (this.jsxAttribute) {
						wrapped = new Parens(new StringWithInterpolations(this.body));
						wrapped.jsxAttribute = true;
						return wrapped.compileNode(o);
					}
					elements = this.extractElements(o, {
						isJsx: this.jsx
					});
					fragments = [];
					if (!this.jsx) {
						fragments.push(this.makeCode('`'));
					}
					for (j = 0, len1 = elements.length; j < len1; j++) {
						element = elements[j];
						if (element instanceof StringLiteral) {
							unquotedElementValue = this.jsx ? element.unquotedValueForJSX : element.unquotedValueForTemplateLiteral;
							fragments.push(this.makeCode(unquotedElementValue));
						} else {
							if (!this.jsx) {
								fragments.push(this.makeCode('$'));
							}
							code = element.compileToFragments(o, LEVEL_PAREN);
							if (!this.isNestedTag(element) || code.some(function(fragment) {
								var ref2;
								return (ref2 = fragment.comments) != null ? ref2.some(function(comment) {
									return comment.here === false;
								}) : void 0;
							})) {
								code = this.wrapInBraces(code);
								// Flag the `{` and `}` fragments as having been generated by this
								// `StringWithInterpolations` node, so that `compileComments` knows
								// to treat them as bounds. But the braces are unnecessary if all of
								// the enclosed comments are `/* */` comments. Don’t trust
								// `fragment.type`, which can report minified variable names when
								// this compiler is minified.
								code[0].isStringWithInterpolations = true;
								code[code.length - 1].isStringWithInterpolations = true;
							}
							fragments.push(...code);
						}
					}
					if (!this.jsx) {
						fragments.push(this.makeCode('`'));
					}
					return fragments;
				}

				isNestedTag(element) {
					var call;
					call = typeof element.unwrapAll === "function" ? element.unwrapAll() : void 0;
					return this.jsx && call instanceof JSXElement;
				}

				astType() {
					return 'TemplateLiteral';
				}

				astProperties(o) {
					var element, elements, emptyInterpolation, expression, expressions, index, j, last, len1, node, quasis;
					elements = this.extractElements(o, {
						includeInterpolationWrappers: true
					});
					[last] = slice1.call(elements, -1);
					quasis = [];
					expressions = [];
					for (index = j = 0, len1 = elements.length; j < len1; index = ++j) {
						element = elements[index];
						if (element instanceof StringLiteral) {
							quasis.push(new TemplateElement(element.originalValue, {
								tail: element === last
							}).withLocationDataFrom(element).ast(o)); // Interpolation
						} else {
							({expression} = element);
							node = expression == null ? (emptyInterpolation = new EmptyInterpolation(), emptyInterpolation.locationData = emptyExpressionLocationData({
								interpolationNode: element,
								openingBrace: '#{',
								closingBrace: '}'
							}), emptyInterpolation) : expression.unwrapAll();
							expressions.push(astAsBlockIfNeeded(node, o));
						}
					}
					return {expressions, quasis, quote: this.quote};
				}

			};

			StringWithInterpolations.prototype.children = ['body'];

			return StringWithInterpolations;

		}).call(this);

		exports.TemplateElement = TemplateElement = class TemplateElement extends Base {
			constructor(value1, {
					tail: tail1
				} = {}) {
				super();
				this.value = value1;
				this.tail = tail1;
			}

			astProperties() {
				return {
					value: {
						raw: this.value
					},
					tail: !!this.tail
				};
			}

		};

		exports.Interpolation = Interpolation = (function() {
			class Interpolation extends Base {
				constructor(expression1) {
					super();
					this.expression = expression1;
				}

			};

			Interpolation.prototype.children = ['expression'];

			return Interpolation;

		}).call(this);

		// Represents the contents of an empty interpolation (e.g. `#{}`).
		// Only used during AST generation.
		exports.EmptyInterpolation = EmptyInterpolation = class EmptyInterpolation extends Base {
			constructor() {
				super();
			}

		};

		//### For

		// CoffeeScript's replacement for the *for* loop is our array and object
		// comprehensions, that compile into *for* loops here. They also act as an
		// expression, able to return the result of each filtered iteration.

		// Unlike Python array comprehensions, they can be multi-line, and you can pass
		// the current index of the loop as a second parameter. Unlike Ruby blocks,
		// you can map and filter in a single pass.
		exports.For = For = (function() {
			class For extends While {
				constructor(body, source) {
					super();
					this.addBody(body);
					this.addSource(source);
				}

				isAwait() {
					var ref1;
					return (ref1 = this.await) != null ? ref1 : false;
				}

				addBody(body) {
					var base1, expressions;
					this.body = Block.wrap([body]);
					({expressions} = this.body);
					if (expressions.length) {
						if ((base1 = this.body).locationData == null) {
							base1.locationData = mergeLocationData(expressions[0].locationData, expressions[expressions.length - 1].locationData);
						}
					}
					return this;
				}

				addSource(source) {
					var attr, attribs, attribute, base1, j, k, len1, len2, ref1, ref2, ref3, ref4;
					({source: this.source = false} = source);
					attribs = ["name", "index", "guard", "step", "own", "ownTag", "await", "awaitTag", "object", "from"];
					for (j = 0, len1 = attribs.length; j < len1; j++) {
						attr = attribs[j];
						this[attr] = (ref1 = source[attr]) != null ? ref1 : this[attr];
					}
					if (!this.source) {
						return this;
					}
					if (this.from && this.index) {
						this.index.error('cannot use index with for-from');
					}
					if (this.own && !this.object) {
						this.ownTag.error(`cannot use own with for-${this.from ? 'from' : 'in'}`);
					}
					if (this.object) {
						[this.name, this.index] = [this.index, this.name];
					}
					if (((ref2 = this.index) != null ? typeof ref2.isArray === "function" ? ref2.isArray() : void 0 : void 0) || ((ref3 = this.index) != null ? typeof ref3.isObject === "function" ? ref3.isObject() : void 0 : void 0)) {
						this.index.error('index cannot be a pattern matching expression');
					}
					if (this.await && !this.from) {
						this.awaitTag.error('await must be used with for-from');
					}
					this.range = this.source instanceof Value && this.source.base instanceof Range && !this.source.properties.length && !this.from;
					this.pattern = this.name instanceof Value;
					if (this.pattern) {
						if (typeof (base1 = this.name.unwrap()).propagateLhs === "function") {
							base1.propagateLhs(true);
						}
					}
					if (this.range && this.index) {
						this.index.error('indexes do not apply to range loops');
					}
					if (this.range && this.pattern) {
						this.name.error('cannot pattern match over range loops');
					}
					this.returns = false;
					ref4 = ['source', 'guard', 'step', 'name', 'index'];
					// Move up any comments in the “`for` line”, i.e. the line of code with `for`,
					// from any child nodes of that line up to the `for` node itself so that these
					// comments get output, and get output above the `for` loop.
					for (k = 0, len2 = ref4.length; k < len2; k++) {
						attribute = ref4[k];
						if (!this[attribute]) {
							continue;
						}
						this[attribute].traverseChildren(true, (node) => {
							var comment, l, len3, ref5;
							if (node.comments) {
								ref5 = node.comments;
								for (l = 0, len3 = ref5.length; l < len3; l++) {
									comment = ref5[l];
									// These comments are buried pretty deeply, so if they happen to be
									// trailing comments the line they trail will be unrecognizable when
									// we’re done compiling this `for` loop; so just shift them up to
									// output above the `for` line.
									comment.newLine = comment.unshift = true;
								}
								return moveComments(node, this[attribute]);
							}
						});
						moveComments(this[attribute], this);
					}
					return this;
				}

				// Welcome to the hairiest method in all of CoffeeScript. Handles the inner
				// loop, filtering, stepping, and result saving for array, object, and range
				// comprehensions. Some of the generated code can be shared in common, and
				// some cannot.
				compileNode(o) {
					var body, bodyFragments, compare, compareDown, declare, declareDown, defPart, down, forClose, forCode, forPartFragments, fragments, guardPart, idt1, increment, index, ivar, kvar, kvarAssign, last, lvar, name, namePart, ref, ref1, resultPart, returnResult, rvar, scope, source, step, stepNum, stepVar, svar, varPart;
					body = Block.wrap([this.body]);
					ref1 = body.expressions, [last] = slice1.call(ref1, -1);
					if ((last != null ? last.jumps() : void 0) instanceof Return) {
						this.returns = false;
					}
					source = this.range ? this.source.base : this.source;
					scope = o.scope;
					if (!this.pattern) {
						name = this.name && (this.name.compile(o, LEVEL_LIST));
					}
					index = this.index && (this.index.compile(o, LEVEL_LIST));
					if (name && !this.pattern) {
						scope.find(name);
					}
					if (index && !(this.index instanceof Value)) {
						scope.find(index);
					}
					if (this.returns) {
						rvar = scope.freeVariable('results');
					}
					if (this.from) {
						if (this.pattern) {
							ivar = scope.freeVariable('x', {
								single: true
							});
						}
					} else {
						ivar = (this.object && index) || scope.freeVariable('i', {
							single: true
						});
					}
					kvar = ((this.range || this.from) && name) || index || ivar;
					kvarAssign = kvar !== ivar ? `${kvar} = ` : "";
					if (this.step && !this.range) {
						[step, stepVar] = this.cacheToCodeFragments(this.step.cache(o, LEVEL_LIST, shouldCacheOrIsAssignable));
						if (this.step.isNumber()) {
							stepNum = parseNumber(stepVar);
						}
					}
					if (this.pattern) {
						name = ivar;
					}
					varPart = '';
					guardPart = '';
					defPart = '';
					idt1 = this.tab + TAB;
					if (this.range) {
						forPartFragments = source.compileToFragments(merge(o, {
							index: ivar,
							name,
							step: this.step,
							shouldCache: shouldCacheOrIsAssignable
						}));
					} else {
						svar = this.source.compile(o, LEVEL_LIST);
						if ((name || this.own) && !(this.source.unwrap() instanceof IdentifierLiteral)) {
							defPart += `${this.tab}${ref = scope.freeVariable('ref')} = ${svar};\n`;
							svar = ref;
						}
						if (name && !this.pattern && !this.from) {
							namePart = `${name} = ${svar}[${kvar}]`;
						}
						if (!this.object && !this.from) {
							if (step !== stepVar) {
								defPart += `${this.tab}${step};\n`;
							}
							down = stepNum < 0;
							if (!(this.step && (stepNum != null) && down)) {
								lvar = scope.freeVariable('len');
							}
							declare = `${kvarAssign}${ivar} = 0, ${lvar} = ${svar}.length`;
							declareDown = `${kvarAssign}${ivar} = ${svar}.length - 1`;
							compare = `${ivar} < ${lvar}`;
							compareDown = `${ivar} >= 0`;
							if (this.step) {
								if (stepNum != null) {
									if (down) {
										compare = compareDown;
										declare = declareDown;
									}
								} else {
									compare = `${stepVar} > 0 ? ${compare} : ${compareDown}`;
									declare = `(${stepVar} > 0 ? (${declare}) : ${declareDown})`;
								}
								increment = `${ivar} += ${stepVar}`;
							} else {
								increment = `${kvar !== ivar ? `++${ivar}` : `${ivar}++`}`;
							}
							forPartFragments = [this.makeCode(`${declare}; ${compare}; ${kvarAssign}${increment}`)];
						}
					}
					if (this.returns) {
						resultPart = `${this.tab}${rvar} = [];\n`;
						returnResult = `\n${this.tab}return ${rvar};`;
						body.makeReturn(rvar);
					}
					if (this.guard) {
						if (body.expressions.length > 1) {
							body.expressions.unshift(new If((new Parens(this.guard)).invert(), new StatementLiteral("continue")));
						} else {
							if (this.guard) {
								body = Block.wrap([new If(this.guard, body)]);
							}
						}
					}
					if (this.pattern) {
						body.expressions.unshift(new Assign(this.name, this.from ? new IdentifierLiteral(kvar) : new Literal(`${svar}[${kvar}]`)));
					}
					if (namePart) {
						varPart = `\n${idt1}${namePart};`;
					}
					if (this.object) {
						forPartFragments = [this.makeCode(`${kvar} in ${svar}`)];
						if (this.own) {
							guardPart = `\n${idt1}if (!${utility('hasProp', o)}.call(${svar}, ${kvar})) continue;`;
						}
					} else if (this.from) {
						if (this.await) {
							forPartFragments = new Op('await', new Parens(new Literal(`${kvar} of ${svar}`)));
							forPartFragments = forPartFragments.compileToFragments(o, LEVEL_TOP);
						} else {
							forPartFragments = [this.makeCode(`${kvar} of ${svar}`)];
						}
					}
					bodyFragments = body.compileToFragments(merge(o, {
						indent: idt1
					}), LEVEL_TOP);
					if (bodyFragments && bodyFragments.length > 0) {
						bodyFragments = [].concat(this.makeCode('\n'), bodyFragments, this.makeCode('\n'));
					}
					fragments = [this.makeCode(defPart)];
					if (resultPart) {
						fragments.push(this.makeCode(resultPart));
					}
					forCode = this.await ? 'for ' : 'for (';
					forClose = this.await ? '' : ')';
					fragments = fragments.concat(this.makeCode(this.tab), this.makeCode(forCode), forPartFragments, this.makeCode(`${forClose} {${guardPart}${varPart}`), bodyFragments, this.makeCode(this.tab), this.makeCode('}'));
					if (returnResult) {
						fragments.push(this.makeCode(returnResult));
					}
					return fragments;
				}

				astNode(o) {
					var addToScope, ref1, ref2;
					addToScope = function(name) {
						var alreadyDeclared;
						alreadyDeclared = o.scope.find(name.value);
						return name.isDeclaration = !alreadyDeclared;
					};
					if ((ref1 = this.name) != null) {
						ref1.eachName(addToScope, {
							checkAssignability: false
						});
					}
					if ((ref2 = this.index) != null) {
						ref2.eachName(addToScope, {
							checkAssignability: false
						});
					}
					return super.astNode(o);
				}

				astType() {
					return 'For';
				}

				astProperties(o) {
					var ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
					return {
						source: (ref1 = this.source) != null ? ref1.ast(o) : void 0,
						body: this.body.ast(o, LEVEL_TOP),
						guard: (ref2 = (ref3 = this.guard) != null ? ref3.ast(o) : void 0) != null ? ref2 : null,
						name: (ref4 = (ref5 = this.name) != null ? ref5.ast(o) : void 0) != null ? ref4 : null,
						index: (ref6 = (ref7 = this.index) != null ? ref7.ast(o) : void 0) != null ? ref6 : null,
						step: (ref8 = (ref9 = this.step) != null ? ref9.ast(o) : void 0) != null ? ref8 : null,
						postfix: !!this.postfix,
						own: !!this.own,
						await: !!this.await,
						style: (function() {
							switch (false) {
								case !this.from:
									return 'from';
								case !this.object:
									return 'of';
								case !this.name:
									return 'in';
								default:
									return 'range';
							}
						}).call(this)
					};
				}

			};

			For.prototype.children = ['body', 'source', 'guard', 'step'];

			return For;

		}).call(this);

		//### Switch

		// A JavaScript *switch* statement. Converts into a returnable expression on-demand.
		exports.Switch = Switch = (function() {
			class Switch extends Base {
				constructor(subject, cases1, otherwise) {
					super();
					this.subject = subject;
					this.cases = cases1;
					this.otherwise = otherwise;
				}

				jumps(o = {
						block: true
					}) {
					var block, j, jumpNode, len1, ref1, ref2;
					ref1 = this.cases;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						({block} = ref1[j]);
						if (jumpNode = block.jumps(o)) {
							return jumpNode;
						}
					}
					return (ref2 = this.otherwise) != null ? ref2.jumps(o) : void 0;
				}

				makeReturn(results, mark) {
					var block, j, len1, ref1, ref2;
					ref1 = this.cases;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						({block} = ref1[j]);
						block.makeReturn(results, mark);
					}
					if (results) {
						this.otherwise || (this.otherwise = new Block([new Literal('void 0')]));
					}
					if ((ref2 = this.otherwise) != null) {
						ref2.makeReturn(results, mark);
					}
					return this;
				}

				compileNode(o) {
					var block, body, cond, conditions, expr, fragments, i, idt1, idt2, j, k, len1, len2, ref1, ref2;
					idt1 = o.indent + TAB;
					idt2 = o.indent = idt1 + TAB;
					fragments = [].concat(this.makeCode(this.tab + "switch ("), (this.subject ? this.subject.compileToFragments(o, LEVEL_PAREN) : this.makeCode("false")), this.makeCode(") {\n"));
					ref1 = this.cases;
					for (i = j = 0, len1 = ref1.length; j < len1; i = ++j) {
						({conditions, block} = ref1[i]);
						ref2 = flatten([conditions]);
						for (k = 0, len2 = ref2.length; k < len2; k++) {
							cond = ref2[k];
							if (!this.subject) {
								cond = cond.invert();
							}
							fragments = fragments.concat(this.makeCode(idt1 + "case "), cond.compileToFragments(o, LEVEL_PAREN), this.makeCode(":\n"));
						}
						if ((body = block.compileToFragments(o, LEVEL_TOP)).length > 0) {
							fragments = fragments.concat(body, this.makeCode('\n'));
						}
						if (i === this.cases.length - 1 && !this.otherwise) {
							break;
						}
						expr = this.lastNode(block.expressions);
						if (expr instanceof Return || expr instanceof Throw || (expr instanceof Literal && expr.jumps() && expr.value !== 'debugger')) {
							continue;
						}
						fragments.push(cond.makeCode(idt2 + 'break;\n'));
					}
					if (this.otherwise && this.otherwise.expressions.length) {
						fragments.push(this.makeCode(idt1 + "default:\n"), ...(this.otherwise.compileToFragments(o, LEVEL_TOP)), this.makeCode("\n"));
					}
					fragments.push(this.makeCode(this.tab + '}'));
					return fragments;
				}

				astType() {
					return 'SwitchStatement';
				}

				casesAst(o) {
					var caseIndex, caseLocationData, cases, consequent, j, k, kase, l, lastTestIndex, len1, len2, len3, ref1, ref2, results1, test, testConsequent, testIndex, tests;
					cases = [];
					ref1 = this.cases;
					for (caseIndex = j = 0, len1 = ref1.length; j < len1; caseIndex = ++j) {
						kase = ref1[caseIndex];
						({
							conditions: tests,
							block: consequent
						} = kase);
						tests = flatten([tests]);
						lastTestIndex = tests.length - 1;
						for (testIndex = k = 0, len2 = tests.length; k < len2; testIndex = ++k) {
							test = tests[testIndex];
							testConsequent = testIndex === lastTestIndex ? consequent : null;
							caseLocationData = test.locationData;
							if (testConsequent != null ? testConsequent.expressions.length : void 0) {
								caseLocationData = mergeLocationData(caseLocationData, testConsequent.expressions[testConsequent.expressions.length - 1].locationData);
							}
							if (testIndex === 0) {
								caseLocationData = mergeLocationData(caseLocationData, kase.locationData, {
									justLeading: true
								});
							}
							if (testIndex === lastTestIndex) {
								caseLocationData = mergeLocationData(caseLocationData, kase.locationData, {
									justEnding: true
								});
							}
							cases.push(new SwitchCase(test, testConsequent, {
								trailing: testIndex === lastTestIndex
							}).withLocationDataFrom({
								locationData: caseLocationData
							}));
						}
					}
					if ((ref2 = this.otherwise) != null ? ref2.expressions.length : void 0) {
						cases.push(new SwitchCase(null, this.otherwise).withLocationDataFrom(this.otherwise));
					}
					results1 = [];
					for (l = 0, len3 = cases.length; l < len3; l++) {
						kase = cases[l];
						results1.push(kase.ast(o));
					}
					return results1;
				}

				astProperties(o) {
					var ref1, ref2;
					return {
						discriminant: (ref1 = (ref2 = this.subject) != null ? ref2.ast(o, LEVEL_PAREN) : void 0) != null ? ref1 : null,
						cases: this.casesAst(o)
					};
				}

			};

			Switch.prototype.children = ['subject', 'cases', 'otherwise'];

			Switch.prototype.isStatement = YES;

			return Switch;

		}).call(this);

		SwitchCase = (function() {
			class SwitchCase extends Base {
				constructor(test1, block1, {trailing} = {}) {
					super();
					this.test = test1;
					this.block = block1;
					this.trailing = trailing;
				}

				astProperties(o) {
					var ref1, ref2, ref3, ref4;
					return {
						test: (ref1 = (ref2 = this.test) != null ? ref2.ast(o, LEVEL_PAREN) : void 0) != null ? ref1 : null,
						consequent: (ref3 = (ref4 = this.block) != null ? ref4.ast(o, LEVEL_TOP).body : void 0) != null ? ref3 : [],
						trailing: !!this.trailing
					};
				}

			};

			SwitchCase.prototype.children = ['test', 'block'];

			return SwitchCase;

		}).call(this);

		exports.SwitchWhen = SwitchWhen = (function() {
			class SwitchWhen extends Base {
				constructor(conditions1, block1) {
					super();
					this.conditions = conditions1;
					this.block = block1;
				}

			};

			SwitchWhen.prototype.children = ['conditions', 'block'];

			return SwitchWhen;

		}).call(this);

		//### If

		// *If/else* statements. Acts as an expression by pushing down requested returns
		// to the last line of each clause.

		// Single-expression **Ifs** are compiled into conditional operators if possible,
		// because ternaries are already proper expressions, and don’t need conversion.
		exports.If = If = (function() {
			class If extends Base {
				constructor(condition1, body1, options = {}) {
					super();
					this.condition = condition1;
					this.body = body1;
					this.elseBody = null;
					this.isChain = false;
					({soak: this.soak, postfix: this.postfix, type: this.type} = options);
					if (this.condition.comments) {
						moveComments(this.condition, this);
					}
				}

				bodyNode() {
					var ref1;
					return (ref1 = this.body) != null ? ref1.unwrap() : void 0;
				}

				elseBodyNode() {
					var ref1;
					return (ref1 = this.elseBody) != null ? ref1.unwrap() : void 0;
				}

				// Rewrite a chain of **Ifs** to add a default case as the final *else*.
				addElse(elseBody) {
					if (this.isChain) {
						this.elseBodyNode().addElse(elseBody);
						this.locationData = mergeLocationData(this.locationData, this.elseBodyNode().locationData);
					} else {
						this.isChain = elseBody instanceof If;
						this.elseBody = this.ensureBlock(elseBody);
						this.elseBody.updateLocationDataIfMissing(elseBody.locationData);
						if ((this.locationData != null) && (this.elseBody.locationData != null)) {
							this.locationData = mergeLocationData(this.locationData, this.elseBody.locationData);
						}
					}
					return this;
				}

				// The **If** only compiles into a statement if either of its bodies needs
				// to be a statement. Otherwise a conditional operator is safe.
				isStatement(o) {
					var ref1;
					return (o != null ? o.level : void 0) === LEVEL_TOP || this.bodyNode().isStatement(o) || ((ref1 = this.elseBodyNode()) != null ? ref1.isStatement(o) : void 0);
				}

				jumps(o) {
					var ref1;
					return this.body.jumps(o) || ((ref1 = this.elseBody) != null ? ref1.jumps(o) : void 0);
				}

				compileNode(o) {
					if (this.isStatement(o)) {
						return this.compileStatement(o);
					} else {
						return this.compileExpression(o);
					}
				}

				makeReturn(results, mark) {
					var ref1, ref2;
					if (mark) {
						if ((ref1 = this.body) != null) {
							ref1.makeReturn(results, mark);
						}
						if ((ref2 = this.elseBody) != null) {
							ref2.makeReturn(results, mark);
						}
						return;
					}
					if (results) {
						this.elseBody || (this.elseBody = new Block([new Literal('void 0')]));
					}
					this.body && (this.body = new Block([this.body.makeReturn(results)]));
					this.elseBody && (this.elseBody = new Block([this.elseBody.makeReturn(results)]));
					return this;
				}

				ensureBlock(node) {
					if (node instanceof Block) {
						return node;
					} else {
						return new Block([node]);
					}
				}

				// Compile the `If` as a regular *if-else* statement. Flattened chains
				// force inner *else* bodies into statement form.
				compileStatement(o) {
					var answer, body, child, cond, exeq, ifPart, indent;
					child = del(o, 'chainChild');
					exeq = del(o, 'isExistentialEquals');
					if (exeq) {
						return new If(this.processedCondition().invert(), this.elseBodyNode(), {
							type: 'if'
						}).compileToFragments(o);
					}
					indent = o.indent + TAB;
					cond = this.processedCondition().compileToFragments(o, LEVEL_PAREN);
					body = this.ensureBlock(this.body).compileToFragments(merge(o, {indent}));
					ifPart = [].concat(this.makeCode("if ("), cond, this.makeCode(") {\n"), body, this.makeCode(`\n${this.tab}}`));
					if (!child) {
						ifPart.unshift(this.makeCode(this.tab));
					}
					if (!this.elseBody) {
						return ifPart;
					}
					answer = ifPart.concat(this.makeCode(' else '));
					if (this.isChain) {
						o.chainChild = true;
						answer = answer.concat(this.elseBody.unwrap().compileToFragments(o, LEVEL_TOP));
					} else {
						answer = answer.concat(this.makeCode("{\n"), this.elseBody.compileToFragments(merge(o, {indent}), LEVEL_TOP), this.makeCode(`\n${this.tab}}`));
					}
					return answer;
				}

				// Compile the `If` as a conditional operator.
				compileExpression(o) {
					var alt, body, cond, fragments;
					cond = this.processedCondition().compileToFragments(o, LEVEL_COND);
					body = this.bodyNode().compileToFragments(o, LEVEL_LIST);
					alt = this.elseBodyNode() ? this.elseBodyNode().compileToFragments(o, LEVEL_LIST) : [this.makeCode('void 0')];
					fragments = cond.concat(this.makeCode(" ? "), body, this.makeCode(" : "), alt);
					if (o.level >= LEVEL_COND) {
						return this.wrapInParentheses(fragments);
					} else {
						return fragments;
					}
				}

				unfoldSoak() {
					return this.soak && this;
				}

				processedCondition() {
					return this.processedConditionCache != null ? this.processedConditionCache : this.processedConditionCache = this.type === 'unless' ? this.condition.invert() : this.condition;
				}

				isStatementAst(o) {
					return o.level === LEVEL_TOP;
				}

				astType(o) {
					if (this.isStatementAst(o)) {
						return 'IfStatement';
					} else {
						return 'ConditionalExpression';
					}
				}

				astProperties(o) {
					var isStatement, ref1, ref2, ref3, ref4;
					isStatement = this.isStatementAst(o);
					return {
						test: this.condition.ast(o, isStatement ? LEVEL_PAREN : LEVEL_COND),
						consequent: isStatement ? this.body.ast(o, LEVEL_TOP) : this.bodyNode().ast(o, LEVEL_TOP),
						alternate: this.isChain ? this.elseBody.unwrap().ast(o, isStatement ? LEVEL_TOP : LEVEL_COND) : !isStatement && ((ref1 = this.elseBody) != null ? (ref2 = ref1.expressions) != null ? ref2.length : void 0 : void 0) === 1 ? this.elseBody.expressions[0].ast(o, LEVEL_TOP) : (ref3 = (ref4 = this.elseBody) != null ? ref4.ast(o, LEVEL_TOP) : void 0) != null ? ref3 : null,
						postfix: !!this.postfix,
						inverted: this.type === 'unless'
					};
				}

			};

			If.prototype.children = ['condition', 'body', 'elseBody'];

			return If;

		}).call(this);

		// A sequence expression e.g. `(a; b)`.
		// Currently only used during AST generation.
		exports.Sequence = Sequence = (function() {
			class Sequence extends Base {
				constructor(expressions1) {
					super();
					this.expressions = expressions1;
				}

				astNode(o) {
					if (this.expressions.length === 1) {
						return this.expressions[0].ast(o);
					}
					return super.astNode(o);
				}

				astType() {
					return 'SequenceExpression';
				}

				astProperties(o) {
					var expression;
					return {
						expressions: (function() {
							var j, len1, ref1, results1;
							ref1 = this.expressions;
							results1 = [];
							for (j = 0, len1 = ref1.length; j < len1; j++) {
								expression = ref1[j];
								results1.push(expression.ast(o));
							}
							return results1;
						}).call(this)
					};
				}

			};

			Sequence.prototype.children = ['expressions'];

			return Sequence;

		}).call(this);

		// Constants
		// ---------
		UTILITIES = {
			modulo: function() {
				return 'function(a, b) { return (+a % (b = +b) + b) % b; }';
			},
			boundMethodCheck: function() {
				return "function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } }";
			},
			// Shortcuts to speed up the lookup time for native functions.
			hasProp: function() {
				return '{}.hasOwnProperty';
			},
			indexOf: function() {
				return '[].indexOf';
			},
			slice: function() {
				return '[].slice';
			},
			splice: function() {
				return '[].splice';
			}
		};

		// Levels indicate a node's position in the AST. Useful for knowing if
		// parens are necessary or superfluous.
		LEVEL_TOP = 1; // ...;

		LEVEL_PAREN = 2; // (...)

		LEVEL_LIST = 3; // [...]

		LEVEL_COND = 4; // ... ? x : y

		LEVEL_OP = 5; // !...

		LEVEL_ACCESS = 6; // ...[0]

		
		// Tabs are two spaces for pretty printing.
		TAB = '  ';

		SIMPLENUM = /^[+-]?\d+$/;

		SIMPLE_STRING_OMIT = /\s*\n\s*/g;

		LEADING_BLANK_LINE = /^[^\n\S]*\n/;

		TRAILING_BLANK_LINE = /\n[^\n\S]*$/;

		STRING_OMIT = /((?:\\\\)+)|\\[^\S\n]*\n\s*/g; // Consume (and preserve) an even number of backslashes.
		// Remove escaped newlines.

		HEREGEX_OMIT = /((?:\\\\)+)|\\(\s)|\s+(?:#.*)?/g; // Consume (and preserve) an even number of backslashes.
		// Preserve escaped whitespace.
		// Remove whitespace and comments.

		// Helper Functions
		// ----------------

		// Helper for ensuring that utility functions are assigned at the top level.
		utility = function(name, o) {
			var ref, root;
			({root} = o.scope);
			if (name in root.utilities) {
				return root.utilities[name];
			} else {
				ref = root.freeVariable(name);
				root.assign(ref, UTILITIES[name](o));
				return root.utilities[name] = ref;
			}
		};

		multident = function(code, tab, includingFirstLine = true) {
			var endsWithNewLine;
			endsWithNewLine = code[code.length - 1] === '\n';
			code = (includingFirstLine ? tab : '') + code.replace(/\n/g, `$&${tab}`);
			code = code.replace(/\s+$/, '');
			if (endsWithNewLine) {
				code = code + '\n';
			}
			return code;
		};

		// Wherever in CoffeeScript 1 we might’ve inserted a `makeCode "#{@tab}"` to
		// indent a line of code, now we must account for the possibility of comments
		// preceding that line of code. If there are such comments, indent each line of
		// such comments, and _then_ indent the first following line of code.
		indentInitial = function(fragments, node) {
			var fragment, fragmentIndex, j, len1;
			for (fragmentIndex = j = 0, len1 = fragments.length; j < len1; fragmentIndex = ++j) {
				fragment = fragments[fragmentIndex];
				if (fragment.isHereComment) {
					fragment.code = multident(fragment.code, node.tab);
				} else {
					fragments.splice(fragmentIndex, 0, node.makeCode(`${node.tab}`));
					break;
				}
			}
			return fragments;
		};

		hasLineComments = function(node) {
			var comment, j, len1, ref1;
			if (!node.comments) {
				return false;
			}
			ref1 = node.comments;
			for (j = 0, len1 = ref1.length; j < len1; j++) {
				comment = ref1[j];
				if (comment.here === false) {
					return true;
				}
			}
			return false;
		};

		// Move the `comments` property from one object to another, deleting it from
		// the first object.
		moveComments = function(from, to) {
			if (!(from != null ? from.comments : void 0)) {
				return;
			}
			attachCommentsToNode(from.comments, to);
			return delete from.comments;
		};

		// Sometimes when compiling a node, we want to insert a fragment at the start
		// of an array of fragments; but if the start has one or more comment fragments,
		// we want to insert this fragment after those but before any non-comments.
		unshiftAfterComments = function(fragments, fragmentToInsert) {
			var fragment, fragmentIndex, inserted, j, len1;
			inserted = false;
			for (fragmentIndex = j = 0, len1 = fragments.length; j < len1; fragmentIndex = ++j) {
				fragment = fragments[fragmentIndex];
				if (!(!fragment.isComment)) {
					continue;
				}
				fragments.splice(fragmentIndex, 0, fragmentToInsert);
				inserted = true;
				break;
			}
			if (!inserted) {
				fragments.push(fragmentToInsert);
			}
			return fragments;
		};

		isLiteralArguments = function(node) {
			return node instanceof IdentifierLiteral && node.value === 'arguments';
		};

		isLiteralThis = function(node) {
			return node instanceof ThisLiteral || (node instanceof Code && node.bound);
		};

		shouldCacheOrIsAssignable = function(node) {
			return node.shouldCache() || (typeof node.isAssignable === "function" ? node.isAssignable() : void 0);
		};

		// Unfold a node's child if soak, then tuck the node under created `If`
		unfoldSoak = function(o, parent, name) {
			var ifn;
			if (!(ifn = parent[name].unfoldSoak(o))) {
				return;
			}
			parent[name] = ifn.body;
			ifn.body = new Value(parent);
			return ifn;
		};

		// Constructs a string or regex by escaping certain characters.
		makeDelimitedLiteral = function(body, {
				delimiter: delimiterOption,
				escapeNewlines,
				double,
				includeDelimiters = true,
				escapeDelimiter = true,
				convertTrailingNullEscapes
			} = {}) {
			var escapeTemplateLiteralCurlies, printedDelimiter, regex;
			if (body === '' && delimiterOption === '/') {
				body = '(?:)';
			}
			escapeTemplateLiteralCurlies = delimiterOption === '`';
			regex = RegExp(`(\\\\\\\\)|(\\\\0(?=\\d))${convertTrailingNullEscapes ? /|(\\0)$/.source : '' // Escaped backslash. // Trailing null character that could be mistaken as octal escape.
			// Null character mistaken as octal escape.
			// Trailing null character that could be mistaken as octal escape.
			// (Possibly escaped) delimiter.
			// `${` inside template literals must be escaped.
			// (Possibly escaped) newlines.
			// Other escapes.
	}${escapeDelimiter ? RegExp(`|\\\\?(${delimiterOption})`).source : '' // (Possibly escaped) delimiter.
	}${escapeTemplateLiteralCurlies ? /|\\?(\$\{)/.source : '' // `${` inside template literals must be escaped.
	}|\\\\?(?:${escapeNewlines ? '(\n)|' : ''}(\\r)|(\\u2028)|(\\u2029))|(\\\\.)`, "g");
			body = body.replace(regex, function(match, backslash, nul, ...args) {
				var cr, delimiter, lf, ls, other, ps, templateLiteralCurly, trailingNullEscape;
				trailingNullEscape = convertTrailingNullEscapes ? args.shift() : void 0;
				delimiter = escapeDelimiter ? args.shift() : void 0;
				templateLiteralCurly = escapeTemplateLiteralCurlies ? args.shift() : void 0;
				lf = escapeNewlines ? args.shift() : void 0;
				[cr, ls, ps, other] = args;
				switch (false) {
					// Ignore escaped backslashes.
					case !backslash:
						if (double) {
							return backslash + backslash;
						} else {
							return backslash;
						}
					case !nul:
						return '\\x00';
					case !trailingNullEscape:
						return "\\x00";
					case !delimiter:
						return `\\${delimiter}`;
					case !templateLiteralCurly:
						return "\\${";
					case !lf:
						return '\\n';
					case !cr:
						return '\\r';
					case !ls:
						return '\\u2028';
					case !ps:
						return '\\u2029';
					case !other:
						if (double) {
							return `\\${other}`;
						} else {
							return other;
						}
				}
			});
			printedDelimiter = includeDelimiters ? delimiterOption : '';
			return `${printedDelimiter}${body}${printedDelimiter}`;
		};

		sniffDirectives = function(expressions, {notFinalExpression} = {}) {
			var expression, index, lastIndex, results1, unwrapped;
			index = 0;
			lastIndex = expressions.length - 1;
			results1 = [];
			while (index <= lastIndex) {
				if (index === lastIndex && notFinalExpression) {
					break;
				}
				expression = expressions[index];
				if ((unwrapped = expression != null ? typeof expression.unwrap === "function" ? expression.unwrap() : void 0 : void 0) instanceof PassthroughLiteral && unwrapped.generated) {
					index++;
					continue;
				}
				if (!(expression instanceof Value && expression.isString() && !expression.unwrap().shouldGenerateTemplateLiteral())) {
					break;
				}
				expressions[index] = new Directive(expression).withLocationDataFrom(expression);
				results1.push(index++);
			}
			return results1;
		};

		astAsBlockIfNeeded = function(node, o) {
			var unwrapped;
			unwrapped = node.unwrap();
			if (unwrapped instanceof Block && unwrapped.expressions.length > 1) {
				unwrapped.makeReturn(null, true);
				return unwrapped.ast(o, LEVEL_TOP);
			} else {
				return node.ast(o, LEVEL_PAREN);
			}
		};

		// Helpers for `mergeLocationData` and `mergeAstLocationData` below.
		lesser = function(a, b) {
			if (a < b) {
				return a;
			} else {
				return b;
			}
		};

		greater = function(a, b) {
			if (a > b) {
				return a;
			} else {
				return b;
			}
		};

		isAstLocGreater = function(a, b) {
			if (a.line > b.line) {
				return true;
			}
			if (a.line !== b.line) {
				return false;
			}
			return a.column > b.column;
		};

		isLocationDataStartGreater = function(a, b) {
			if (a.first_line > b.first_line) {
				return true;
			}
			if (a.first_line !== b.first_line) {
				return false;
			}
			return a.first_column > b.first_column;
		};

		isLocationDataEndGreater = function(a, b) {
			if (a.last_line > b.last_line) {
				return true;
			}
			if (a.last_line !== b.last_line) {
				return false;
			}
			return a.last_column > b.last_column;
		};

		// Take two nodes’ location data and return a new `locationData` object that
		// encompasses the location data of both nodes. So the new `first_line` value
		// will be the earlier of the two nodes’ `first_line` values, the new
		// `last_column` the later of the two nodes’ `last_column` values, etc.

		// If you only want to extend the first node’s location data with the start or
		// end location data of the second node, pass the `justLeading` or `justEnding`
		// options. So e.g. if `first`’s range is [4, 5] and `second`’s range is [1, 10],
		// you’d get:
		// ```
		// mergeLocationData(first, second).range                   # [1, 10]
		// mergeLocationData(first, second, justLeading: yes).range # [1, 5]
		// mergeLocationData(first, second, justEnding:  yes).range # [4, 10]
		// ```
		exports.mergeLocationData = mergeLocationData = function(locationDataA, locationDataB, {justLeading, justEnding} = {}) {
			return Object.assign(justEnding ? {
				first_line: locationDataA.first_line,
				first_column: locationDataA.first_column
			} : isLocationDataStartGreater(locationDataA, locationDataB) ? {
				first_line: locationDataB.first_line,
				first_column: locationDataB.first_column
			} : {
				first_line: locationDataA.first_line,
				first_column: locationDataA.first_column
			}, justLeading ? {
				last_line: locationDataA.last_line,
				last_column: locationDataA.last_column,
				last_line_exclusive: locationDataA.last_line_exclusive,
				last_column_exclusive: locationDataA.last_column_exclusive
			} : isLocationDataEndGreater(locationDataA, locationDataB) ? {
				last_line: locationDataA.last_line,
				last_column: locationDataA.last_column,
				last_line_exclusive: locationDataA.last_line_exclusive,
				last_column_exclusive: locationDataA.last_column_exclusive
			} : {
				last_line: locationDataB.last_line,
				last_column: locationDataB.last_column,
				last_line_exclusive: locationDataB.last_line_exclusive,
				last_column_exclusive: locationDataB.last_column_exclusive
			}, {
				range: [justEnding ? locationDataA.range[0] : lesser(locationDataA.range[0], locationDataB.range[0]), justLeading ? locationDataA.range[1] : greater(locationDataA.range[1], locationDataB.range[1])]
			});
		};

		// Take two AST nodes, or two AST nodes’ location data objects, and return a new
		// location data object that encompasses the location data of both nodes. So the
		// new `start` value will be the earlier of the two nodes’ `start` values, the
		// new `end` value will be the later of the two nodes’ `end` values, etc.

		// If you only want to extend the first node’s location data with the start or
		// end location data of the second node, pass the `justLeading` or `justEnding`
		// options. So e.g. if `first`’s range is [4, 5] and `second`’s range is [1, 10],
		// you’d get:
		// ```
		// mergeAstLocationData(first, second).range                   # [1, 10]
		// mergeAstLocationData(first, second, justLeading: yes).range # [1, 5]
		// mergeAstLocationData(first, second, justEnding:  yes).range # [4, 10]
		// ```
		exports.mergeAstLocationData = mergeAstLocationData = function(nodeA, nodeB, {justLeading, justEnding} = {}) {
			return {
				loc: {
					start: justEnding ? nodeA.loc.start : isAstLocGreater(nodeA.loc.start, nodeB.loc.start) ? nodeB.loc.start : nodeA.loc.start,
					end: justLeading ? nodeA.loc.end : isAstLocGreater(nodeA.loc.end, nodeB.loc.end) ? nodeA.loc.end : nodeB.loc.end
				},
				range: [justEnding ? nodeA.range[0] : lesser(nodeA.range[0], nodeB.range[0]), justLeading ? nodeA.range[1] : greater(nodeA.range[1], nodeB.range[1])],
				start: justEnding ? nodeA.start : lesser(nodeA.start, nodeB.start),
				end: justLeading ? nodeA.end : greater(nodeA.end, nodeB.end)
			};
		};

		// Convert Jison-style node class location data to Babel-style location data
		exports.jisonLocationDataToAstLocationData = jisonLocationDataToAstLocationData = function({first_line, first_column, last_line_exclusive, last_column_exclusive, range}) {
			return {
				loc: {
					start: {
						line: first_line + 1,
						column: first_column
					},
					end: {
						line: last_line_exclusive + 1,
						column: last_column_exclusive
					}
				},
				range: [range[0], range[1]],
				start: range[0],
				end: range[1]
			};
		};

		// Generate a zero-width location data that corresponds to the end of another node’s location.
		zeroWidthLocationDataFromEndLocation = function({
				range: [, endRange],
				last_line_exclusive,
				last_column_exclusive
			}) {
			return {
				first_line: last_line_exclusive,
				first_column: last_column_exclusive,
				last_line: last_line_exclusive,
				last_column: last_column_exclusive,
				last_line_exclusive,
				last_column_exclusive,
				range: [endRange, endRange]
			};
		};

		extractSameLineLocationDataFirst = function(numChars) {
			return function({
					range: [startRange],
					first_line,
					first_column
				}) {
				return {
					first_line,
					first_column,
					last_line: first_line,
					last_column: first_column + numChars - 1,
					last_line_exclusive: first_line,
					last_column_exclusive: first_column + numChars,
					range: [startRange, startRange + numChars]
				};
			};
		};

		extractSameLineLocationDataLast = function(numChars) {
			return function({
					range: [, endRange],
					last_line,
					last_column,
					last_line_exclusive,
					last_column_exclusive
				}) {
				return {
					first_line: last_line,
					first_column: last_column - (numChars - 1),
					last_line: last_line,
					last_column: last_column,
					last_line_exclusive,
					last_column_exclusive,
					range: [endRange - numChars, endRange]
				};
			};
		};

		// We don’t currently have a token corresponding to the empty space
		// between interpolation/JSX expression braces, so piece together the location
		// data by trimming the braces from the Interpolation’s location data.
		// Technically the last_line/last_column calculation here could be
		// incorrect if the ending brace is preceded by a newline, but
		// last_line/last_column aren’t used for AST generation anyway.
		emptyExpressionLocationData = function({
				interpolationNode: element,
				openingBrace,
				closingBrace
			}) {
			return {
				first_line: element.locationData.first_line,
				first_column: element.locationData.first_column + openingBrace.length,
				last_line: element.locationData.last_line,
				last_column: element.locationData.last_column - closingBrace.length,
				last_line_exclusive: element.locationData.last_line,
				last_column_exclusive: element.locationData.last_column,
				range: [element.locationData.range[0] + openingBrace.length, element.locationData.range[1] - closingBrace.length]
			};
		};

		return exports;
	};
	//#endregion

	//#region URL: /coffeescript
	modules['/coffeescript'] = function () {
		// CoffeeScript can be used both on the server, as a command-line compiler based
		// on Node.js/V8, or to run CoffeeScript directly in the browser. This module
		// contains the main entry functions for tokenizing, parsing, and compiling
		// source CoffeeScript into JavaScript.
		var exports = {};
		var FILE_EXTENSIONS, Lexer, SourceMap, base64encode, checkShebangLine, compile, getSourceMap, helpers, lexer, packageJson, parser, registerCompiled, withPrettyErrors;

		({Lexer} = require('/lexer'));

		({parser} = require('/parser'));

		helpers = require('/helpers');

		/*BT-
		SourceMap = require('/sourcemap');

		// Require `package.json`, which is two levels above this file, as this file is
		// evaluated from `lib/coffeescript`.
		packageJson = require('../../package.json');
		*/

		// The current CoffeeScript version number.
		exports.VERSION = /*BT- packageJson.version*/'2.7.0';

		/*BT-
		exports.FILE_EXTENSIONS = FILE_EXTENSIONS = ['.coffee', '.litcoffee', '.coffee.md'];
		*/

		// Expose helpers for testing.
		exports.helpers = helpers;

		/*BT-
		({getSourceMap, registerCompiled} = SourceMap);

		// This is exported to enable an external module to implement caching of
		// sourcemaps. This is used only when `patchStackTrace` has been called to adjust
		// stack traces for files with cached source maps.
		exports.registerCompiled = registerCompiled;

		// Function that allows for btoa in both nodejs and the browser.
		base64encode = function(src) {
			switch (false) {
				case typeof Buffer !== 'function':
					return Buffer.from(src).toString('base64');
				case typeof btoa !== 'function':
					// The contents of a `<script>` block are encoded via UTF-16, so if any extended
					// characters are used in the block, btoa will fail as it maxes out at UTF-8.
					// See https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
					// for the gory details, and for the solution implemented here.
					return btoa(encodeURIComponent(src).replace(/%([0-9A-F]{2})/g, function(match, p1) {
						return String.fromCharCode('0x' + p1);
					}));
				default:
					throw new Error('Unable to base64 encode inline sourcemap.');
			}
		};
		*/

		// Function wrapper to add source file information to SyntaxErrors thrown by the
		// lexer/parser/compiler.
		withPrettyErrors = function(fn) {
			return function(code, options = {}) {
				var err;
				try {
					return fn.call(this, code, options);
				} catch (error) {
					err = error;
					if (typeof code !== 'string') { // Support `CoffeeScript.nodes(tokens)`.
						throw err;
					}
					throw helpers.updateSyntaxError(err, code, options.filename);
				}
			};
		};

		// Compile CoffeeScript code to JavaScript, using the Coffee/Jison compiler.

		// If `options.sourceMap` is specified, then `options.filename` must also be
		// specified. All options that can be passed to `SourceMap#generate` may also
		// be passed here.

		// This returns a javascript string, unless `options.sourceMap` is passed,
		// in which case this returns a `{js, v3SourceMap, sourceMap}`
		// object, where sourceMap is a sourcemap.coffee#SourceMap object, handy for
		// doing programmatic lookups.
		exports.compile = compile = withPrettyErrors(function(code, options = {}) {
			var ast, currentColumn, currentLine, encoded, filename, fragment, fragments, generateSourceMap, header, i, j, js, len, len1, map, newLines, nodes, range, ref, sourceCodeLastLine, sourceCodeNumberOfLines, sourceMapDataURI, sourceURL, token, tokens, transpiler, transpilerOptions, transpilerOutput, v3SourceMap;
			// Clone `options`, to avoid mutating the `options` object passed in.
			options = Object.assign({}, options);
			/*BT-
			generateSourceMap = options.sourceMap || options.inlineMap || (options.filename == null);
			filename = options.filename || helpers.anonymousFileName();
			checkShebangLine(filename, code);
			if (generateSourceMap) {
				map = new SourceMap();
			}
			*/
			tokens = lexer.tokenize(code, options);
			// Pass a list of referenced variables, so that generated variables won’t get
			// the same name.
			options.referencedVars = (function() {
				var i, len, results;
				results = [];
				for (i = 0, len = tokens.length; i < len; i++) {
					token = tokens[i];
					if (token[0] === 'IDENTIFIER') {
						results.push(token[1]);
					}
				}
				return results;
			})();
			// Check for import or export; if found, force bare mode.
			if (!((options.bare != null) && options.bare === true)) {
				for (i = 0, len = tokens.length; i < len; i++) {
					token = tokens[i];
					if ((ref = token[0]) === 'IMPORT' || ref === 'EXPORT') {
						options.bare = true;
						break;
					}
				}
			}
			nodes = parser.parse(tokens);
			/*BT-
			// If all that was requested was a POJO representation of the nodes, e.g.
			// the abstract syntax tree (AST), we can stop now and just return that
			// (after fixing the location data for the root/`File`»`Program` node,
			// which might’ve gotten misaligned from the original source due to the
			// `clean` function in the lexer).
			if (options.ast) {
				nodes.allCommentTokens = helpers.extractAllCommentTokens(tokens);
				sourceCodeNumberOfLines = (code.match(/\r?\n/g) || '').length + 1;
				sourceCodeLastLine = /.*$/.exec(code)[0];
				ast = nodes.ast(options);
				range = [0, code.length];
				ast.start = ast.program.start = range[0];
				ast.end = ast.program.end = range[1];
				ast.range = ast.program.range = range;
				ast.loc.start = ast.program.loc.start = {
					line: 1,
					column: 0
				};
				ast.loc.end.line = ast.program.loc.end.line = sourceCodeNumberOfLines;
				ast.loc.end.column = ast.program.loc.end.column = sourceCodeLastLine.length;
				ast.tokens = tokens;
				return ast;
			}
			*/
			fragments = nodes.compileToFragments(options);
			currentLine = 0;
			/*BT-
			if (options.header) {
				currentLine += 1;
			}
			if (options.shiftLine) {
				currentLine += 1;
			}
			*/
			currentColumn = 0;
			js = "";
			for (j = 0, len1 = fragments.length; j < len1; j++) {
				fragment = fragments[j];
				/*BT-
				// Update the sourcemap with data from each fragment.
				if (generateSourceMap) {
					// Do not include empty, whitespace, or semicolon-only fragments.
					if (fragment.locationData && !/^[;\s]*$/.test(fragment.code)) {
						map.add([fragment.locationData.first_line, fragment.locationData.first_column], [currentLine, currentColumn], {
							noReplace: true
						});
					}
					newLines = helpers.count(fragment.code, "\n");
					currentLine += newLines;
					if (newLines) {
						currentColumn = fragment.code.length - (fragment.code.lastIndexOf("\n") + 1);
					} else {
						currentColumn += fragment.code.length;
					}
				}
				*/
				// Copy the code from each fragment into the final JavaScript.
				js += fragment.code;
			}
			/*BT-
			if (options.header) {
				header = `Generated by CoffeeScript ${this.VERSION}`;
				js = `// ${header}\n${js}`;
			}
			if (generateSourceMap) {
				v3SourceMap = map.generate(options, code);
			}
			if (options.transpile) {
				if (typeof options.transpile !== 'object') {
					// This only happens if run via the Node API and `transpile` is set to
					// something other than an object.
					throw new Error('The transpile option must be given an object with options to pass to Babel');
				}
				// Get the reference to Babel that we have been passed if this compiler
				// is run via the CLI or Node API.
				transpiler = options.transpile.transpile;
				delete options.transpile.transpile;
				transpilerOptions = Object.assign({}, options.transpile);
				// See https://github.com/babel/babel/issues/827#issuecomment-77573107:
				// Babel can take a v3 source map object as input in `inputSourceMap`
				// and it will return an *updated* v3 source map object in its output.
				if (v3SourceMap && (transpilerOptions.inputSourceMap == null)) {
					transpilerOptions.inputSourceMap = v3SourceMap;
				}
				transpilerOutput = transpiler(js, transpilerOptions);
				js = transpilerOutput.code;
				if (v3SourceMap && transpilerOutput.map) {
					v3SourceMap = transpilerOutput.map;
				}
			}
			if (options.inlineMap) {
				encoded = base64encode(JSON.stringify(v3SourceMap));
				sourceMapDataURI = `//# sourceMappingURL=data:application/json;base64,${encoded}`;
				sourceURL = `//# sourceURL=${filename}`;
				js = `${js}\n${sourceMapDataURI}\n${sourceURL}`;
			}
			registerCompiled(filename, code, map);
			if (options.sourceMap) {
				return {
					js,
					sourceMap: map,
					v3SourceMap: JSON.stringify(v3SourceMap, null, 2)
				};
			} else {
			*/
				return js;
			/*BT-
			}
			*/
		});

		/*BT-
		// Tokenize a string of CoffeeScript code, and return the array of tokens.
		exports.tokens = withPrettyErrors(function(code, options) {
			return lexer.tokenize(code, options);
		});

		// Parse a string of CoffeeScript code or an array of lexed tokens, and
		// return the AST. You can then compile it by calling `.compile()` on the root,
		// or traverse it by using `.traverseChildren()` with a callback.
		exports.nodes = withPrettyErrors(function(source, options) {
			if (typeof source === 'string') {
				source = lexer.tokenize(source, options);
			}
			return parser.parse(source);
		});

		// This file used to export these methods; leave stubs that throw warnings
		// instead. These methods have been moved into `index.coffee` to provide
		// separate entrypoints for Node and non-Node environments, so that static
		// analysis tools don’t choke on Node packages when compiling for a non-Node
		// environment.
		exports.run = exports.eval = exports.register = function() {
			throw new Error('require index.coffee, not this file');
		};
		*/

		// Instantiate a Lexer for our use here.
		lexer = new Lexer();

		// The real Lexer produces a generic stream of tokens. This object provides a
		// thin wrapper around it, compatible with the Jison API. We can then pass it
		// directly as a “Jison lexer.”
		parser.lexer = {
			yylloc: {
				range: []
			},
			options: {
				ranges: true
			},
			lex: function() {
				var tag, token;
				token = parser.tokens[this.pos++];
				if (token) {
					[tag, this.yytext, this.yylloc] = token;
					parser.errorToken = token.origin || token;
					this.yylineno = this.yylloc.first_line;
				} else {
					tag = '';
				}
				return tag;
			},
			setInput: function(tokens) {
				parser.tokens = tokens;
				return this.pos = 0;
			},
			upcomingInput: function() {
				return '';
			}
		};

		// Make all the AST nodes visible to the parser.
		parser.yy = require('/nodes');

		// Override Jison's default error handling function.
		parser.yy.parseError = function(message, {token}) {
			var errorLoc, errorTag, errorText, errorToken, tokens;
			// Disregard Jison's message, it contains redundant line number information.
			// Disregard the token, we take its value directly from the lexer in case
			// the error is caused by a generated token which might refer to its origin.
			({errorToken, tokens} = parser);
			[errorTag, errorText, errorLoc] = errorToken;
			errorText = (function() {
				switch (false) {
					case errorToken !== tokens[tokens.length - 1]:
						return 'end of input';
					case errorTag !== 'INDENT' && errorTag !== 'OUTDENT':
						return 'indentation';
					case errorTag !== 'IDENTIFIER' && errorTag !== 'NUMBER' && errorTag !== 'INFINITY' && errorTag !== 'STRING' && errorTag !== 'STRING_START' && errorTag !== 'REGEX' && errorTag !== 'REGEX_START':
						return errorTag.replace(/_START$/, '').toLowerCase();
					default:
						return helpers.nameWhitespaceCharacter(errorText);
				}
			})();
			// The second argument has a `loc` property, which should have the location
			// data for this token. Unfortunately, Jison seems to send an outdated `loc`
			// (from the previous token), so we take the location information directly
			// from the lexer.
			return helpers.throwSyntaxError(`unexpected ${errorText}`, errorLoc);
		};

		/*BT-
		exports.patchStackTrace = function() {
			var formatSourcePosition, getSourceMapping;
			// Based on http://v8.googlecode.com/svn/branches/bleeding_edge/src/messages.js
			// Modified to handle sourceMap
			formatSourcePosition = function(frame, getSourceMapping) {
				var as, column, fileLocation, filename, functionName, isConstructor, isMethodCall, line, methodName, source, tp, typeName;
				filename = void 0;
				fileLocation = '';
				if (frame.isNative()) {
					fileLocation = "native";
				} else {
					if (frame.isEval()) {
						filename = frame.getScriptNameOrSourceURL();
						if (!filename) {
							fileLocation = `${frame.getEvalOrigin()}, `;
						}
					} else {
						filename = frame.getFileName();
					}
					filename || (filename = "<anonymous>");
					line = frame.getLineNumber();
					column = frame.getColumnNumber();
					// Check for a sourceMap position
					source = getSourceMapping(filename, line, column);
					fileLocation = source ? `${filename}:${source[0]}:${source[1]}` : `${filename}:${line}:${column}`;
				}
				functionName = frame.getFunctionName();
				isConstructor = frame.isConstructor();
				isMethodCall = !(frame.isToplevel() || isConstructor);
				if (isMethodCall) {
					methodName = frame.getMethodName();
					typeName = frame.getTypeName();
					if (functionName) {
						tp = as = '';
						if (typeName && functionName.indexOf(typeName)) {
							tp = `${typeName}.`;
						}
						if (methodName && functionName.indexOf(`.${methodName}`) !== functionName.length - methodName.length - 1) {
							as = ` [as ${methodName}]`;
						}
						return `${tp}${functionName}${as} (${fileLocation})`;
					} else {
						return `${typeName}.${methodName || '<anonymous>'} (${fileLocation})`;
					}
				} else if (isConstructor) {
					return `new ${functionName || '<anonymous>'} (${fileLocation})`;
				} else if (functionName) {
					return `${functionName} (${fileLocation})`;
				} else {
					return fileLocation;
				}
			};
			getSourceMapping = function(filename, line, column) {
				var answer, sourceMap;
				sourceMap = getSourceMap(filename, line, column);
				if (sourceMap != null) {
					answer = sourceMap.sourceLocation([line - 1, column - 1]);
				}
				if (answer != null) {
					return [answer[0] + 1, answer[1] + 1];
				} else {
					return null;
				}
			};
			// Based on [michaelficarra/CoffeeScriptRedux](http://goo.gl/ZTx1p)
			// NodeJS / V8 have no support for transforming positions in stack traces using
			// sourceMap, so we must monkey-patch Error to display CoffeeScript source
			// positions.
			return Error.prepareStackTrace = function(err, stack) {
				var frame, frames;
				frames = (function() {
					var i, len, results;
					results = [];
					for (i = 0, len = stack.length; i < len; i++) {
						frame = stack[i];
						if (frame.getFunction() === exports.run) {
							// Don’t display stack frames deeper than `CoffeeScript.run`.
							break;
						}
						results.push(`    at ${formatSourcePosition(frame, getSourceMapping)}`);
					}
					return results;
				})();
				return `${err.toString()}\n${frames.join('\n')}\n`;
			};
		};

		checkShebangLine = function(file, input) {
			var args, firstLine, ref, rest;
			firstLine = input.split(/$/m)[0];
			rest = firstLine != null ? firstLine.match(/^#!\s*([^\s]+\s*)(.*)/) : void 0;
			args = rest != null ? (ref = rest[2]) != null ? ref.split(/\s/).filter(function(s) {
				return s !== '';
			}) : void 0 : void 0;
			if ((args != null ? args.length : void 0) > 1) {
				console.error(`The script to be run begins with a shebang line with more than one
	argument. This script will fail on platforms such as Linux which only
	allow a single argument.`);
				console.error(`The shebang line was: '${firstLine}' in file '${file}'`);
				return console.error(`The arguments were: ${JSON.stringify(args)}`);
			}
		};
		*/

		return exports;
	};
	//#endregion

	return require('/coffeescript');
 })();