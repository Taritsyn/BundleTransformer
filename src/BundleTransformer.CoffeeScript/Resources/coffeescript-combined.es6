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
 * CoffeeScript Compiler v2.1.0
 * http://coffeescript.org
 *
 * Copyright 2009-2017 Jeremy Ashkenas
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
		var exports = {};
		// This file contains the common helper functions that we'd like to share among
		// the **Lexer**, **Rewriter**, and the **Nodes**. Merge objects, flatten
		// arrays, count characters, that sort of thing.

		// Peek at the beginning of a given string to see if it matches a sequence.
		var attachCommentsToNode, buildLocationData, buildLocationHash, extend, flatten, ref, repeat, syntaxErrorToString;

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
					last_column: last.last_column
				};
			}
		};

		buildLocationHash = function(loc) {
			return `${loc.first_line}x${loc.first_column}-${loc.last_line}x${loc.last_column}`;
		};

		// This returns a function which takes an object as a parameter, and if that
		// object is an AST node, updates that object's locationData.
		// The object is returned either way.
		exports.addDataToNode = function(parserState, first, last) {
			return function(obj) {
				var i, len1, objHash, ref1, token, tokenHash;
				// Add location data
				if (((obj != null ? obj.updateLocationDataIfMissing : void 0) != null) && (first != null)) {
					obj.updateLocationDataIfMissing(buildLocationData(first, last));
				}
				// Add comments data
				if (!parserState.tokenComments) {
					parserState.tokenComments = {};
					ref1 = parserState.parser.tokens;
					for (i = 0, len1 = ref1.length; i < len1; i++) {
						token = ref1[i];
						if (!token.comments) {
							continue;
						}
						tokenHash = buildLocationHash(token[2]);
						if (parserState.tokenComments[tokenHash] == null) {
							parserState.tokenComments[tokenHash] = token.comments;
						} else {
							parserState.tokenComments[tokenHash].push(...token.comments);
						}
					}
				}
				if (obj.locationData != null) {
					objHash = buildLocationHash(obj.locationData);
					if (parserState.tokenComments[objHash] != null) {
						attachCommentsToNode(parserState.tokenComments[objHash], obj);
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
			var codeLine, colorize, colorsEnabled, end, filename, first_column, first_line, last_column, last_line, marker, ref1, ref2, ref3, start;
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
			filename = this.filename || '[stdin]';
			codeLine = this.code.split('\n')[first_line];
			start = first_column;
			// Show only the first line on multi-line errors.
			end = first_line === last_line ? last_column + 1 : codeLine.length;
			marker = codeLine.slice(0, start).replace(/[^\s]/g, ' ') + repeat('^', end - start);
			// Check to see if we're running on a color-enabled TTY.
			if (typeof process !== "undefined" && process !== null) {
				colorsEnabled = ((ref1 = process.stdout) != null ? ref1.isTTY : void 0) && !((ref2 = process.env) != null ? ref2.NODE_DISABLE_COLORS : void 0);
			}
			if ((ref3 = this.colorful) != null ? ref3 : colorsEnabled) {
				colorize = function(str) {
					return `\x1B[1;31m${str}\x1B[0m`;
				};
				codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
				marker = colorize(marker);
			}
			return `${filename}:${first_line + 1}:${first_column + 1}: error: ${this.message}\n${codeLine}\n${marker}`;
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

		return exports;
	};
	//#endregion

	//#region URL: /rewriter
	modules['/rewriter'] = function() {
		var exports = {};
		// The CoffeeScript language has a good deal of optional syntax, implicit syntax,
		// and shorthand syntax. This can greatly complicate a grammar and bloat
		// the resulting parse table. Instead of making the parser handle it all, we take
		// a series of passes over the token stream, using this **Rewriter** to convert
		// shorthand into the unambiguous long form, add implicit indentation and
		// parentheses, and generally clean things up.
		var BALANCED_PAIRS, CALL_CLOSERS, CONTROL_IN_IMPLICIT, DISCARDED, EXPRESSION_CLOSE, EXPRESSION_END, EXPRESSION_START, IMPLICIT_CALL, IMPLICIT_END, IMPLICIT_FUNC, IMPLICIT_UNSPACED_CALL, INVERSES, LINEBREAKS, Rewriter, SINGLE_CLOSERS, SINGLE_LINERS, generate, k, left, len, moveComments, right, throwSyntaxError,
			indexOf = [].indexOf;

		({throwSyntaxError} = require('/helpers'));

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
					this.addParensToChainedDoIife();
					this.rescueStowawayComments();
					this.addLocationDataToGeneratedTokens();
					this.enforceValidCSXAttributes();
					this.fixOutdentLocationData();
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
					var action, condition;
					condition = function(token, i) {
						var ref;
						return (ref = token[0]) === ']' || ref === 'INDEX_END';
					};
					action = function(token, i) {
						return token[0] = 'INDEX_END';
					};
					return this.scanTokens(function(token, i) {
						if (token[0] === 'INDEX_START') {
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
					for (j = k = 0, ref = pattern.length; 0 <= ref ? k < ref : k > ref; j = 0 <= ref ? ++k : --k) {
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
						var endImplicitCall, endImplicitObject, forward, implicitObjectContinues, inImplicit, inImplicitCall, inImplicitControl, inImplicitObject, isImplicit, isImplicitCall, isImplicitObject, k, newLine, nextTag, nextToken, offset, prevTag, prevToken, ref, ref1, ref2, s, sameLine, stackIdx, stackItem, stackTag, stackTop, startIdx, startImplicitCall, startImplicitObject, startsLine, tag;
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
						startImplicitObject = function(idx, startsLine = true) {
							var val;
							stack.push([
								'{',
								idx,
								{
									sameLine: true,
									startsLine: startsLine,
									ours: true
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
						// Recognize standard implicit calls like
						// f a, f() b, f? c, h[0] d etc.
						// Added support for spread dots on the left side: f ...a
						if ((indexOf.call(IMPLICIT_FUNC, tag) >= 0 && token.spaced || tag === '?' && i > 0 && !tokens[i - 1].spaced) && (indexOf.call(IMPLICIT_CALL, nextTag) >= 0 || (nextTag === '...' && (ref = this.tag(i + 2), indexOf.call(IMPLICIT_CALL, ref) >= 0) && !this.findTagsBackwards(i, ['INDEX_START', '['])) || indexOf.call(IMPLICIT_UNSPACED_CALL, nextTag) >= 0 && !nextToken.spaced && !nextToken.newLine)) {
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
						// Furthermore don’t allow this in literal arrays, as
						// that creates grammatical ambiguities.
						if (indexOf.call(IMPLICIT_FUNC, tag) >= 0 && this.indexOfTag(i + 1, 'INDENT') > -1 && this.looksObjectish(i + 2) && !this.findTagsBackwards(i, ['CLASS', 'EXTENDS', 'IF', 'CATCH', 'SWITCH', 'LEADING_WHEN', 'FOR', 'WHILE', 'UNTIL'])) {
							startImplicitCall(i + 1);
							stack.push(['INDENT', i + 2]);
							return forward(3);
						}
						// Implicit objects start here.
						if (tag === ':') {
							// Go back to the (implicit) start of the object.
							s = (function() {
								var ref1;
								switch (false) {
									case ref1 = this.tag(i - 1), indexOf.call(EXPRESSION_END, ref1) < 0:
										return start[1];
									case this.tag(i - 2) !== '@':
										return i - 2;
									default:
										return i - 1;
								}
							}).call(this);
							startsLine = s <= 0 || (ref1 = this.tag(s - 1), indexOf.call(LINEBREAKS, ref1) >= 0) || tokens[s - 1].newLine;
							// Are we just continuing an already declared object?
							if (stackTop()) {
								[stackTag, stackIdx] = stackTop();
								if ((stackTag === '{' || stackTag === 'INDENT' && this.tag(stackIdx - 1) === '{') && (startsLine || this.tag(s - 1) === ',' || this.tag(s - 1) === '{')) {
									return forward(1);
								}
							}
							startImplicitObject(s, !!startsLine);
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
						newLine = prevTag === 'OUTDENT' || prevToken.newLine;
						if (indexOf.call(IMPLICIT_END, tag) >= 0 || indexOf.call(CALL_CLOSERS, tag) >= 0 && newLine) {
							while (inImplicit()) {
								[stackTag, stackIdx, {sameLine, startsLine}] = stackTop();
								// Close implicit calls when reached end of argument list
								if (inImplicitCall() && prevTag !== ',') {
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

						if (tag === ',' && !this.looksObjectish(i + 1) && inImplicitObject() && !((ref2 = this.tag(i + 2)) === 'FOROF' || ref2 === 'FORIN') && (nextTag !== 'TERMINATOR' || !this.looksObjectish(i + 2))) {
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

				// Make sure only strings and wrapped expressions are used in CSX attributes.
				enforceValidCSXAttributes() {
					return this.scanTokens(function(token, i, tokens) {
						var next, ref;
						if (token.csxColon) {
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
					var insertPlaceholder, shiftCommentsBackward, shiftCommentsForward;
					insertPlaceholder = function(token, j, tokens, method) {
						if (tokens[j][0] !== 'TERMINATOR') {
							tokens[method](generate('TERMINATOR', '\n', tokens[j]));
						}
						return tokens[method](generate('JS', '', tokens[j], token));
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
						} else {
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
						var column, line, nextLocation, prevLocation, ref, ref1;
						if (token[2]) {
							return 1;
						}
						if (!(token.generated || token.explicit)) {
							return 1;
						}
						if (token[0] === '{' && (nextLocation = (ref = tokens[i + 1]) != null ? ref[2] : void 0)) {
							({
								first_line: line,
								first_column: column
							} = nextLocation);
						} else if (prevLocation = (ref1 = tokens[i - 1]) != null ? ref1[2] : void 0) {
							({
								last_line: line,
								last_column: column
							} = prevLocation);
						} else {
							line = column = 0;
						}
						token[2] = {
							first_line: line,
							first_column: column,
							last_line: line,
							last_column: column
						};
						return 1;
					});
				}

				// `OUTDENT` tokens should always be positioned at the last character of the
				// previous token, so that AST nodes ending in an `OUTDENT` token end up with a
				// location corresponding to the last “real” token under the node.
				fixOutdentLocationData() {
					return this.scanTokens(function(token, i, tokens) {
						var prevLocationData;
						if (!(token[0] === 'OUTDENT' || (token.generated && token[0] === 'CALL_END') || (token.generated && token[0] === '}'))) {
							return 1;
						}
						prevLocationData = tokens[i - 1][2];
						token[2] = {
							first_line: prevLocationData.last_line,
							first_column: prevLocationData.last_column,
							last_line: prevLocationData.last_line,
							last_column: prevLocationData.last_column
						};
						return 1;
					});
				}

				// Add parens around a `do` IIFE followed by a chained `.` so that the
				// chaining applies to the executed function rather than the function
				// object (see #3736)
				addParensToChainedDoIife() {
					var action, condition, doIndex;
					condition = function(token, i) {
						return this.tag(i - 1) === 'OUTDENT';
					};
					action = function(token, i) {
						var ref;
						if (ref = token[0], indexOf.call(CALL_CLOSERS, ref) < 0) {
							return;
						}
						this.tokens.splice(doIndex, 0, generate('(', '(', this.tokens[doIndex]));
						return this.tokens.splice(i + 1, 0, generate(')', ')', this.tokens[i]));
					};
					doIndex = null;
					return this.scanTokens(function(token, i, tokens) {
						var glyphIndex, ref;
						if (token[1] !== 'do') {
							return 1;
						}
						doIndex = i;
						glyphIndex = i + 1;
						if (this.tag(i + 1) === 'PARAM_START') {
							glyphIndex = null;
							this.detectEnd(i + 1, function(token, i) {
								return this.tag(i - 1) === 'PARAM_END';
							}, function(token, i) {
								return glyphIndex = i;
							});
						}
						if (!((glyphIndex != null) && ((ref = this.tag(glyphIndex)) === '->' || ref === '=>') && this.tag(glyphIndex + 1) === 'INDENT')) {
							return 1;
						}
						this.detectEnd(glyphIndex + 1, condition, action);
						return 2;
					});
				}

				// Because our grammar is LALR(1), it can’t handle some single-line
				// expressions that lack ending delimiters. The **Rewriter** adds the implicit
				// blocks, so it doesn’t need to. To keep the grammar clean and tidy, trailing
				// newlines within expressions are removed and the indentation tokens of empty
				// blocks are added.
				normalizeLines() {
					var action, condition, indent, outdent, starter;
					starter = indent = outdent = null;
					condition = function(token, i) {
						var ref, ref1, ref2, ref3;
						return token[1] !== ';' && (ref = token[0], indexOf.call(SINGLE_CLOSERS, ref) >= 0) && !(token[0] === 'TERMINATOR' && (ref1 = this.tag(i + 1), indexOf.call(EXPRESSION_CLOSE, ref1) >= 0)) && !(token[0] === 'ELSE' && starter !== 'THEN') && !(((ref2 = token[0]) === 'CATCH' || ref2 === 'FINALLY') && (starter === '->' || starter === '=>')) || (ref3 = token[0], indexOf.call(CALL_CLOSERS, ref3) >= 0) && (this.tokens[i - 1].newLine || this.tokens[i - 1][0] === 'OUTDENT');
					};
					action = function(token, i) {
						return this.tokens.splice((this.tag(i - 1) === ',' ? i - 1 : i), 0, outdent);
					};
					return this.scanTokens(function(token, i, tokens) {
						var j, k, ref, ref1, tag;
						[tag] = token;
						if (tag === 'TERMINATOR') {
							if (this.tag(i + 1) === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
								tokens.splice(i, 1, ...this.indentation());
								return 1;
							}
							if (ref = this.tag(i + 1), indexOf.call(EXPRESSION_CLOSE, ref) >= 0) {
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
						if ((tag === '->' || tag === '=>') && (this.tag(i + 1) === ',' || this.tag(i + 1) === '.' && token.newLine)) {
							[indent, outdent] = this.indentation(tokens[i]);
							tokens.splice(i + 1, 0, indent, outdent);
							return 1;
						}
						if (indexOf.call(SINGLE_LINERS, tag) >= 0 && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF')) {
							starter = tag;
							[indent, outdent] = this.indentation(tokens[i]);
							if (starter === 'THEN') {
								indent.fromThen = true;
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

		})();

		// Constants
		// ---------

		// List of the token pairs that must be balanced.
		BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END'], ['STRING_START', 'STRING_END'], ['REGEX_START', 'REGEX_END']];

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
		IMPLICIT_CALL = ['IDENTIFIER', 'CSX_TAG', 'PROPERTY', 'NUMBER', 'INFINITY', 'NAN', 'STRING', 'STRING_START', 'REGEX', 'REGEX_START', 'JS', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'UNDEFINED', 'NULL', 'BOOL', 'UNARY', 'YIELD', 'AWAIT', 'UNARY_MATH', 'SUPER', 'THROW', '@', '->', '=>', '[', '(', '{', '--', '++'];

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
		DISCARDED = ['(', ')', '[', ']', '{', '}', '.', '..', '...', ',', '=', '++', '--', '?', 'AS', 'AWAIT', 'CALL_START', 'CALL_END', 'DEFAULT', 'ELSE', 'EXTENDS', 'EXPORT', 'FORIN', 'FOROF', 'FORFROM', 'IMPORT', 'INDENT', 'INDEX_SOAK', 'LEADING_WHEN', 'OUTDENT', 'PARAM_END', 'REGEX_START', 'REGEX_END', 'RETURN', 'STRING_END', 'THROW', 'UNARY', 'YIELD'].concat(IMPLICIT_UNSPACED_CALL.concat(IMPLICIT_END.concat(CALL_CLOSERS.concat(CONTROL_IN_IMPLICIT))));

		return exports;
	};
	//#endregion

	//#region URL: /lexer
	modules['/lexer'] = function () {
		var exports = {};
		// The CoffeeScript Lexer. Uses a series of token-matching regexes to attempt
		// matches against the beginning of the source code. When a match is found,
		// a token is produced, we consume the match, and start again. Tokens are in the
		// form:

		//     [tag, value, locationData]

		// where locationData is {first_line, first_column, last_line, last_column}, which is a
		// format that can be fed directly into [Jison](https://github.com/zaach/jison).  These
		// are read by jison in the `parser.lexer` function defined in coffeescript.coffee.
		var BOM, BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARABLE_LEFT_SIDE, COMPARE, COMPOUND_ASSIGN, CSX_ATTRIBUTE, CSX_FRAGMENT_IDENTIFIER, CSX_IDENTIFIER, CSX_INTERPOLATION, HERECOMMENT_ILLEGAL, HEREDOC_DOUBLE, HEREDOC_INDENT, HEREDOC_SINGLE, HEREGEX, HEREGEX_OMIT, HERE_JSTOKEN, IDENTIFIER, INDENTABLE_CLOSERS, INDEXABLE, INSIDE_CSX, INVERSES, JSTOKEN, JS_KEYWORDS, LEADING_BLANK_LINE, LINE_BREAK, LINE_CONTINUER, Lexer, MATH, MULTI_DENT, NOT_REGEX, NUMBER, OPERATOR, POSSIBLY_DIVISION, REGEX, REGEX_FLAGS, REGEX_ILLEGAL, REGEX_INVALID_ESCAPE, RELATION, RESERVED, Rewriter, SHIFT, SIMPLE_STRING_OMIT, STRICT_PROSCRIBED, STRING_DOUBLE, STRING_INVALID_ESCAPE, STRING_OMIT, STRING_SINGLE, STRING_START, TRAILING_BLANK_LINE, TRAILING_SPACES, UNARY, UNARY_MATH, UNFINISHED, UNICODE_CODE_POINT_ESCAPE, VALID_FLAGS, WHITESPACE, attachCommentsToNode, compact, count, invertLiterate, isForFrom, isUnassignable, key, locationDataToString, merge, repeat, starts, throwSyntaxError,
			indexOf = [].indexOf;

		({Rewriter, INVERSES} = require('/rewriter'));

		// Import the helpers we need.
		({count, starts, compact, repeat, invertLiterate, merge, attachCommentsToNode, locationDataToString, throwSyntaxError} = require('/helpers'));

		// The Lexer Class
		// ---------------

		// The Lexer class reads a stream of CoffeeScript and divvies it up into tagged
		// tokens. Some potential ambiguity in the grammar has been avoided by
		// pushing some extra smarts into the Lexer.
		exports.Lexer = Lexer = class Lexer {
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
				this.indebt = 0; // The over-indentation at the current level.
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
				this.csxDepth = 0; // Used to optimize CSX checks, how deep in CSX we are.
				this.csxObjAttribute = {}; // Used to detect if CSX attributes is wrapped in {} (<div {props...} />).
				this.chunkLine = opts.line || 0; // The start line for the current @chunk.
				this.chunkColumn = opts.column || 0; // The start column of the current @chunk.
				code = this.clean(code); // The stripped, cleaned original source code.
				
				// At every position, run through this list of attempted matches,
				// short-circuiting if any of them succeed. Their order determines precedence:
				// `@literalToken` is the fallback catch-all.
				i = 0;
				while (this.chunk = code.slice(i)) {
					consumed = this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.stringToken() || this.numberToken() || this.csxToken() || this.regexToken() || this.jsToken() || this.literalToken();
					// Update position.
					[this.chunkLine, this.chunkColumn] = this.getLineAndColumnFromChunk(consumed);
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
				return (new Rewriter).rewrite(this.tokens);
			}

			// Preprocess the code to remove leading and trailing whitespace, carriage
			// returns, etc. If we’re lexing literate CoffeeScript, strip external Markdown
			// by removing all lines that aren’t indented by at least four spaces or a tab.
			clean(code) {
				if (code.charCodeAt(0) === BOM) {
					code = code.slice(1);
				}
				code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
				if (WHITESPACE.test(code)) {
					code = `\n${code}`;
					this.chunkLine--;
				}
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
				var alias, colon, colonOffset, colonToken, id, idLength, inCSXTag, input, match, poppedToken, prev, prevprev, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, regExSuper, regex, sup, tag, tagToken;
				inCSXTag = this.atCSXTag();
				regex = inCSXTag ? CSX_ATTRIBUTE : IDENTIFIER;
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
				if (id === 'do' && (regExSuper = /^(\s*super)(?!\(\))/.exec(this.chunk.slice(3)))) {
					this.token('SUPER', 'super');
					this.token('CALL_START', '(');
					this.token('CALL_END', ')');
					[input, sup] = regExSuper;
					return sup.length + 3;
				}
				prev = this.prev();
				tag = colon || (prev != null) && (((ref5 = prev[0]) === '.' || ref5 === '?.' || ref5 === '::' || ref5 === '?::') || !prev.spaced && prev[0] === '@') ? 'PROPERTY' : 'IDENTIFIER';
				if (tag === 'IDENTIFIER' && (indexOf.call(JS_KEYWORDS, id) >= 0 || indexOf.call(COFFEE_KEYWORDS, id) >= 0) && !(this.exportSpecifierList && indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
					tag = id.toUpperCase();
					if (tag === 'WHEN' && (ref6 = this.tag(), indexOf.call(LINE_BREAK, ref6) >= 0)) {
						tag = 'LEADING_WHEN';
					} else if (tag === 'FOR') {
						this.seenFor = true;
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
								id = '!' + id;
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
					if (prev.spaced && (ref7 = prev[0], indexOf.call(CALLABLE, ref7) >= 0) && /^[gs]et$/.test(prev[1]) && this.tokens[this.tokens.length - 2][0] !== '.') {
						this.error(`'${prev[1]}' cannot be used as a keyword, or as a function call without parentheses`, prev[2]);
					} else {
						prevprev = this.tokens[this.tokens.length - 2];
						if (((ref8 = prev[0]) === '@' || ref8 === 'THIS') && prevprev && prevprev.spaced && /^[gs]et$/.test(prevprev[1]) && this.tokens[this.tokens.length - 3][0] !== '.') {
							this.error(`'${prevprev[1]}' cannot be used as a keyword, or as a function call without parentheses`, prevprev[2]);
						}
					}
				}
				if (tag === 'IDENTIFIER' && indexOf.call(RESERVED, id) >= 0) {
					this.error(`reserved word '${id}'`, {
						length: id.length
					});
				}
				if (!(tag === 'PROPERTY' || this.exportSpecifierList)) {
					if (indexOf.call(COFFEE_ALIASES, id) >= 0) {
						alias = id;
						id = COFFEE_ALIAS_MAP[id];
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
				tagToken = this.token(tag, id, 0, idLength);
				if (alias) {
					tagToken.origin = [tag, alias, tagToken[2]];
				}
				if (poppedToken) {
					[tagToken[2].first_line, tagToken[2].first_column] = [poppedToken[2].first_line, poppedToken[2].first_column];
				}
				if (colon) {
					colonOffset = input.lastIndexOf(inCSXTag ? '=' : ':');
					colonToken = this.token(':', ':', colonOffset, colon.length);
					if (inCSXTag) { // used by rewriter
						colonToken.csxColon = true;
					}
				}
				if (inCSXTag && tag === 'IDENTIFIER' && prev[0] !== ':') {
					this.token(',', ',', 0, 0, tagToken);
				}
				return input.length;
			}

			// Matches numbers, including decimals, hex, and exponential notation.
			// Be careful not to interfere with ranges in progress.
			numberToken() {
				var base, lexedLength, match, number, numberValue, tag;
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
				base = (function() {
					switch (number.charAt(1)) {
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
				numberValue = base != null ? parseInt(number.slice(2), base) : parseFloat(number);
				tag = numberValue === 2e308 ? 'INFINITY' : 'NUMBER';
				this.token(tag, number, 0, lexedLength);
				return lexedLength;
			}

			// Matches strings, including multiline strings, as well as heredocs, with or without
			// interpolation.
			stringToken() {
				var $, attempt, delimiter, doc, end, heredoc, i, indent, indentRegex, match, prev, quote, ref, regex, token, tokens;
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
				heredoc = quote.length === 3;
				({
					tokens,
					index: end
				} = this.matchWithInterpolations(regex, quote));
				$ = tokens.length - 1;
				delimiter = quote.charAt(0);
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
					if (indent) {
						indentRegex = RegExp(`\\n${indent}`, "g");
					}
					this.mergeInterpolationTokens(tokens, {delimiter}, (value, i) => {
						value = this.formatString(value, {
							delimiter: quote
						});
						if (indentRegex) {
							value = value.replace(indentRegex, '\n');
						}
						if (i === 0) {
							value = value.replace(LEADING_BLANK_LINE, '');
						}
						if (i === $) {
							value = value.replace(TRAILING_BLANK_LINE, '');
						}
						return value;
					});
				} else {
					this.mergeInterpolationTokens(tokens, {delimiter}, (value, i) => {
						value = this.formatString(value, {
							delimiter: quote
						});
						value = value.replace(SIMPLE_STRING_OMIT, function(match, offset) {
							if ((i === 0 && offset === 0) || (i === $ && offset + match.length === value.length)) {
								return '';
							} else {
								return ' ';
							}
						});
						return value;
					});
				}
				if (this.atCSXTag()) {
					this.token(',', ',', 0, 0, this.prev);
				}
				return end;
			}

			// Matches and consumes comments. The comments are taken out of the token
			// stream and saved for later, to be reinserted into the output after
			// everything has been parsed and the JavaScript code generated.
			commentToken(chunk = this.chunk) {
				var comment, commentAttachments, content, contents, here, i, match, matchIllegal, newLine, placeholderToken, prev;
				if (!(match = chunk.match(COMMENT))) {
					return 0;
				}
				[comment, here] = match;
				contents = null;
				// Does this comment follow code on the same line?
				newLine = /^\s*\n+\s*#/.test(comment);
				if (here) {
					matchIllegal = HERECOMMENT_ILLEGAL.exec(comment);
					if (matchIllegal) {
						this.error(`block comments cannot contain ${matchIllegal[0]}`, {
							offset: matchIllegal.index,
							length: matchIllegal[0].length
						});
					}
					// Parse indentation or outdentation as if this block comment didn’t exist.
					chunk = chunk.replace(`###${here}###`, '');
					// Remove leading newlines, like `Rewriter::removeLeadingNewlines`, to
					// avoid the creation of unwanted `TERMINATOR` tokens.
					chunk = chunk.replace(/^\n+/, '');
					this.lineToken(chunk);
					// Pull out the ###-style comment’s content, and format it.
					content = here;
					if (indexOf.call(content, '\n') >= 0) {
						content = content.replace(RegExp(`\\n${repeat(' ', this.indent)}`, "g"), '\n');
					}
					contents = [content];
				} else {
					// The `COMMENT` regex captures successive line comments as one token.
					// Remove any leading newlines before the first comment, but preserve
					// blank lines between line comments.
					content = comment.replace(/^(\n*)/, '');
					content = content.replace(/^([ |\t]*)#/gm, '');
					contents = content.split('\n');
				}
				commentAttachments = (function() {
					var j, len, results;
					results = [];
					for (i = j = 0, len = contents.length; j < len; i = ++j) {
						content = contents[i];
						results.push({
							content: content,
							here: here != null,
							newLine: newLine || i !== 0 // Line comments after the first one start new lines, by definition.
						});
					}
					return results;
				})();
				prev = this.prev();
				if (!prev) {
					// If there’s no previous token, create a placeholder token to attach
					// this comment to; and follow with a newline.
					commentAttachments[0].newLine = true;
					this.lineToken(this.chunk.slice(comment.length));
					placeholderToken = this.makeToken('JS', '');
					placeholderToken.generated = true;
					placeholderToken.comments = commentAttachments;
					this.tokens.push(placeholderToken);
					this.newlineToken(0);
				} else {
					attachCommentsToNode(commentAttachments, prev);
				}
				return comment.length;
			}

			// Matches JavaScript interpolated directly into the source via backticks.
			jsToken() {
				var match, script;
				if (!(this.chunk.charAt(0) === '`' && (match = HERE_JSTOKEN.exec(this.chunk) || JSTOKEN.exec(this.chunk)))) {
					return 0;
				}
				// Convert escaped backticks to backticks, and escaped backslashes
				// just before escaped backticks to backslashes
				script = match[1].replace(/\\+(`|$)/g, function(string) {
					// `string` is always a value like '\`', '\\\`', '\\\\\`', etc.
					// By reducing it to its latter half, we turn '\`' to '`', '\\\`' to '\`', etc.
					return string.slice(-Math.ceil(string.length / 2));
				});
				this.token('JS', script, 0, match[0].length);
				return match[0].length;
			}

			// Matches regular expression literals, as well as multiline extended ones.
			// Lexing regular expressions is difficult to distinguish from division, so we
			// borrow some basic heuristics from JavaScript and Ruby.
			regexToken() {
				var body, closed, comment, comments, end, flags, index, j, len, match, origin, prev, ref, ref1, regex, tokens;
				switch (false) {
					case !(match = REGEX_ILLEGAL.exec(this.chunk)):
						this.error(`regular expressions cannot begin with ${match[2]}`, {
							offset: match.index + match[1].length
						});
						break;
					case !(match = this.matchWithInterpolations(HEREGEX, '///')):
						({tokens, index} = match);
						comments = this.chunk.slice(0, index).match(/\s+(#(?!{).*)/g);
						if (comments) {
							for (j = 0, len = comments.length; j < len; j++) {
								comment = comments[j];
								this.commentToken(comment);
							}
						}
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
				origin = this.makeToken('REGEX', null, 0, end);
				switch (false) {
					case !!VALID_FLAGS.test(flags):
						this.error(`invalid regular expression flags ${flags}`, {
							offset: index,
							length: flags.length
						});
						break;
					case !(regex || tokens.length === 1):
						if (body) {
							body = this.formatRegex(body, {
								flags,
								delimiter: '/'
							});
						} else {
							body = this.formatHeregex(tokens[0][1], {flags});
						}
						this.token('REGEX', `${this.makeDelimitedLiteral(body, {
							delimiter: '/'
						})}${flags}`, 0, end, origin);
						break;
					default:
						this.token('REGEX_START', '(', 0, 0, origin);
						this.token('IDENTIFIER', 'RegExp', 0, 0);
						this.token('CALL_START', '(', 0, 0);
						this.mergeInterpolationTokens(tokens, {
							delimiter: '"',
							double: true
						}, (str) => {
							return this.formatHeregex(str, {flags});
						});
						if (flags) {
							this.token(',', ',', index - 1, 0);
							this.token('STRING', '"' + flags + '"', index - 1, flags.length);
						}
						this.token(')', ')', end - 1, 0);
						this.token('REGEX_END', ')', end - 1, 0);
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
			lineToken(chunk = this.chunk) {
				var diff, indent, match, minLiteralLength, newIndentLiteral, noNewlines, size;
				if (!(match = MULTI_DENT.exec(chunk))) {
					return 0;
				}
				indent = match[0];
				this.seenFor = false;
				if (!this.importSpecifierList) {
					this.seenImport = false;
				}
				if (!this.exportSpecifierList) {
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
				if (size - this.indebt === this.indent) {
					if (noNewlines) {
						this.suppressNewlines();
					} else {
						this.newlineToken(0);
					}
					return indent.length;
				}
				if (size > this.indent) {
					if (noNewlines) {
						this.indebt = size - this.indent;
						this.suppressNewlines();
						return indent.length;
					}
					if (!this.tokens.length) {
						this.baseIndent = this.indent = size;
						this.indentLiteral = newIndentLiteral;
						return indent.length;
					}
					diff = size - this.indent + this.outdebt;
					this.token('INDENT', diff, indent.length - size, size);
					this.indents.push(diff);
					this.ends.push({
						tag: 'OUTDENT'
					});
					this.outdebt = this.indebt = 0;
					this.indent = size;
					this.indentLiteral = newIndentLiteral;
				} else if (size < this.baseIndent) {
					this.error('missing indentation', {
						offset: indent.length
					});
				} else {
					this.indebt = 0;
					this.outdentToken(this.indent - size, noNewlines, indent.length);
				}
				return indent.length;
			}

			// Record an outdent token or multiple tokens, if we happen to be moving back
			// inwards past several recorded indents. Sets new @indent value.
			outdentToken(moveOut, noNewlines, outdentLength) {
				var decreasedIndent, dent, lastIndent, ref;
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
						this.token('OUTDENT', moveOut, 0, outdentLength);
						moveOut -= dent;
					}
				}
				if (dent) {
					this.outdebt -= moveOut;
				}
				this.suppressSemicolons();
				if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
					this.token('TERMINATOR', '\n', outdentLength, 0);
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
					this.token('TERMINATOR', '\n', offset, 0);
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

			// CSX is like JSX but for CoffeeScript.
			csxToken() {
				var afterTag, colon, csxTag, end, firstChar, id, input, match, origin, prev, prevChar, ref, token, tokens;
				firstChar = this.chunk[0];
				// Check the previous token to detect if attribute is spread.
				prevChar = this.tokens.length > 0 ? this.tokens[this.tokens.length - 1][0] : '';
				if (firstChar === '<') {
					match = CSX_IDENTIFIER.exec(this.chunk.slice(1)) || CSX_FRAGMENT_IDENTIFIER.exec(this.chunk.slice(1));
					// Not the right hand side of an unspaced comparison (i.e. `a<b`).
					if (!(match && (this.csxDepth > 0 || !(prev = this.prev()) || prev.spaced || (ref = prev[0], indexOf.call(COMPARABLE_LEFT_SIDE, ref) < 0)))) {
						return 0;
					}
					[input, id, colon] = match;
					origin = this.token('CSX_TAG', id, 1, id.length);
					this.token('CALL_START', '(');
					this.token('[', '[');
					this.ends.push({
						tag: '/>',
						origin: origin,
						name: id
					});
					this.csxDepth++;
					return id.length + 1;
				} else if (csxTag = this.atCSXTag()) {
					if (this.chunk.slice(0, 2) === '/>') {
						this.pair('/>');
						this.token(']', ']', 0, 2);
						this.token('CALL_END', ')', 0, 2);
						this.csxDepth--;
						return 2;
					} else if (firstChar === '{') {
						if (prevChar === ':') {
							token = this.token('(', '(');
							this.csxObjAttribute[this.csxDepth] = false;
						} else {
							token = this.token('{', '{');
							this.csxObjAttribute[this.csxDepth] = true;
						}
						this.ends.push({
							tag: '}',
							origin: token
						});
						return 1;
					} else if (firstChar === '>') {
						// Ignore terminators inside a tag.
						this.pair('/>'); // As if the current tag was self-closing.
						origin = this.token(']', ']');
						this.token(',', ',');
						({
							tokens,
							index: end
						} = this.matchWithInterpolations(INSIDE_CSX, '>', '</', CSX_INTERPOLATION));
						this.mergeInterpolationTokens(tokens, {
							delimiter: '"'
						}, (value, i) => {
							return this.formatString(value, {
								delimiter: '>'
							});
						});
						match = CSX_IDENTIFIER.exec(this.chunk.slice(end)) || CSX_FRAGMENT_IDENTIFIER.exec(this.chunk.slice(end));
						if (!match || match[1] !== csxTag.name) {
							this.error(`expected corresponding CSX closing tag for ${csxTag.name}`, csxTag.origin[2]);
						}
						afterTag = end + csxTag.name.length;
						if (this.chunk[afterTag] !== '>') {
							this.error("missing closing > after tag name", {
								offset: afterTag,
								length: 1
							});
						}
						// +1 for the closing `>`.
						this.token('CALL_END', ')', end, csxTag.name.length + 1);
						this.csxDepth--;
						return afterTag + 1;
					} else {
						return 0;
					}
				} else if (this.atCSXTag(1)) {
					if (firstChar === '}') {
						this.pair(firstChar);
						if (this.csxObjAttribute[this.csxDepth]) {
							this.token('}', '}');
							this.csxObjAttribute[this.csxDepth] = false;
						} else {
							this.token(')', ')');
						}
						this.token(',', ',');
						return 1;
					} else {
						return 0;
					}
				} else {
					return 0;
				}
			}

			atCSXTag(depth = 0) {
				var i, last, ref;
				if (this.csxDepth === 0) {
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
				var match, message, origin, prev, ref, ref1, ref2, ref3, ref4, skipToken, tag, token, value;
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
						prev = this.tokens[this.tokens.length - 2];
						skipToken = true;
					}
					if (prev && prev[0] !== 'PROPERTY') {
						origin = (ref1 = prev.origin) != null ? ref1 : prev;
						message = isUnassignable(prev[1], origin[1]);
						if (message) {
							this.error(message, origin[2]);
						}
					}
					if (skipToken) {
						return value.length;
					}
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
					if (ref2 = prev != null ? prev[0] : void 0, indexOf.call(['=', ...UNFINISHED], ref2) >= 0) {
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
					if (value === '(' && !prev.spaced && (ref3 = prev[0], indexOf.call(CALLABLE, ref3) >= 0)) {
						if (prev[0] === '?') {
							prev[0] = 'FUNC_EXIST';
						}
						tag = 'CALL_START';
					} else if (value === '[' && (((ref4 = prev[0], indexOf.call(INDEXABLE, ref4) >= 0) && !prev.spaced) || (prev[0] === '::'))) { // `.prototype` can’t be a method you can call.
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
					return this;
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
								return this;
							} else {
								paramEndToken[0] = 'CALL_END';
								return this;
							}
					}
				}
				return this;
			}

			// Close up all remaining open blocks at the end of the file.
			closeIndentation() {
				return this.outdentToken(this.indent);
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
			//  - `closingDelimiter` is different from `delimiter` only in CSX
			//  - `interpolators` matches the start of an interpolation, for CSX it's both
			//    `{` and `<` (i.e. nested CSX tag)

			// This method allows us to have strings within interpolations within strings,
			// ad infinitum.
			matchWithInterpolations(regex, delimiter, closingDelimiter, interpolators) {
				var braceInterpolator, close, column, firstToken, index, interpolationOffset, interpolator, lastToken, line, match, nested, offsetInChunk, open, ref, rest, str, strPart, tokens;
				if (closingDelimiter == null) {
					closingDelimiter = delimiter;
				}
				if (interpolators == null) {
					interpolators = /^#\{/;
				}
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
					tokens.push(this.makeToken('NEOSTRING', strPart, offsetInChunk));
					str = str.slice(strPart.length);
					offsetInChunk += strPart.length;
					if (!(match = interpolators.exec(str))) {
						break;
					}
					[interpolator] = match;
					// To remove the `#` in `#{`.
					interpolationOffset = interpolator.length - 1;
					[line, column] = this.getLineAndColumnFromChunk(offsetInChunk + interpolationOffset);
					rest = str.slice(interpolationOffset);
					({
						tokens: nested,
						index
					} = new Lexer().tokenize(rest, {
						line: line,
						column: column,
						untilBalanced: true
					}));
					// Account for the `#` in `#{`
					index += interpolationOffset;
					braceInterpolator = str[index - 1] === '}';
					if (braceInterpolator) {
						// Turn the leading and trailing `{` and `}` into parentheses. Unnecessary
						// parentheses will be removed later.
						open = nested[0], close = nested[nested.length - 1];
						open[0] = open[1] = '(';
						close[0] = close[1] = ')';
						close.origin = ['', 'end of interpolation', close[2]];
					}
					if (((ref = nested[1]) != null ? ref[0] : void 0) === 'TERMINATOR') {
						// Remove leading `'TERMINATOR'` (if any).
						nested.splice(1, 1);
					}
					if (!braceInterpolator) {
						// We are not using `{` and `}`, so wrap the interpolated tokens instead.
						open = this.makeToken('(', '(', offsetInChunk, 0);
						close = this.makeToken(')', ')', offsetInChunk + index, 0);
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
				firstToken = tokens[0], lastToken = tokens[tokens.length - 1];
				firstToken[2].first_column -= delimiter.length;
				if (lastToken[1].substr(-1) === '\n') {
					lastToken[2].last_line += 1;
					lastToken[2].last_column = closingDelimiter.length - 1;
				} else {
					lastToken[2].last_column += closingDelimiter.length;
				}
				if (lastToken[1].length === 0) {
					lastToken[2].last_column -= 1;
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
				var converted, firstEmptyStringIndex, firstIndex, i, j, k, lastToken, len, len1, locationToken, lparen, placeholderToken, plusToken, rparen, tag, token, tokensToPush, val, value;
				if (tokens.length > 1) {
					lparen = this.token('STRING_START', '(', 0, 0);
				}
				firstIndex = this.tokens.length;
				for (i = j = 0, len = tokens.length; j < len; i = ++j) {
					token = tokens[i];
					[tag, value] = token;
					switch (tag) {
						case 'TOKENS':
							if (value.length === 2) {
								if (!(value[0].comments || value[1].comments)) {
									// Optimize out empty interpolations (an empty pair of parentheses).
									continue;
								}
								// There are comments (and nothing else) in this interpolation.
								if (this.csxDepth === 0) {
									// This is an interpolated string, not a CSX tag; and for whatever
									// reason `` `a${/*test*/}b` `` is invalid JS. So compile to
									// `` `a${/*test*/''}b` `` instead.
									placeholderToken = this.makeToken('STRING', "''");
								} else {
									placeholderToken = this.makeToken('JS', '');
								}
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
							// Optimize out empty strings. We ensure that the tokens stream always
							// starts with a string token, though, to make sure that the result
							// really is a string.
							if (converted.length === 0) {
								if (i === 0) {
									firstEmptyStringIndex = this.tokens.length;
								} else {
									continue;
								}
							}
							// However, there is one case where we can optimize away a starting
							// empty string.
							if (i === 2 && (firstEmptyStringIndex != null)) {
								this.tokens.splice(firstEmptyStringIndex, 2); // Remove empty string and the plus.
							}
							token[0] = 'STRING';
							token[1] = this.makeDelimitedLiteral(converted, options);
							locationToken = token;
							tokensToPush = [token];
					}
					if (this.tokens.length > firstIndex) {
						// Create a 0-length "+" token.
						plusToken = this.token('+', '+');
						plusToken[2] = {
							first_line: locationToken[2].first_line,
							first_column: locationToken[2].first_column,
							last_line: locationToken[2].first_line,
							last_column: locationToken[2].first_column
						};
					}
					this.tokens.push(...tokensToPush);
				}
				if (lparen) {
					lastToken = tokens[tokens.length - 1];
					lparen.origin = [
						'STRING',
						null,
						{
							first_line: lparen[2].first_line,
							first_column: lparen[2].first_column,
							last_line: lastToken[2].last_line,
							last_column: lastToken[2].last_column
						}
					];
					lparen[2] = lparen.origin[2];
					rparen = this.token('STRING_END', ')');
					return rparen[2] = {
						first_line: lastToken[2].last_line,
						first_column: lastToken[2].last_column,
						last_line: lastToken[2].last_line,
						last_column: lastToken[2].last_column
					};
				}
			}

			// Pairs up a closing token, ensuring that all listed pairs of tokens are
			// correctly balanced throughout the course of the token stream.
			pair(tag) {
				var lastIndent, prev, ref, ref1, wanted;
				ref = this.ends, prev = ref[ref.length - 1];
				if (tag !== (wanted = prev != null ? prev.tag : void 0)) {
					if ('OUTDENT' !== wanted) {
						this.error(`unmatched ${tag}`);
					}
					// Auto-close `INDENT` to support syntax like this:

					//     el.click((event) ->
					//       el.hide())

					ref1 = this.indents, lastIndent = ref1[ref1.length - 1];
					this.outdentToken(lastIndent, true);
					return this.pair(tag);
				}
				return this.ends.pop();
			}

			// Helpers
			// -------

			// Returns the line and column number from an offset into the current chunk.

			// `offset` is a number of characters into `@chunk`.
			getLineAndColumnFromChunk(offset) {
				var column, lastLine, lineCount, ref, string;
				if (offset === 0) {
					return [this.chunkLine, this.chunkColumn];
				}
				if (offset >= this.chunk.length) {
					string = this.chunk;
				} else {
					string = this.chunk.slice(0, +(offset - 1) + 1 || 9e9);
				}
				lineCount = count(string, '\n');
				column = this.chunkColumn;
				if (lineCount > 0) {
					ref = string.split('\n'), lastLine = ref[ref.length - 1];
					column = lastLine.length;
				} else {
					column += string.length;
				}
				return [this.chunkLine + lineCount, column];
			}

			// Same as `token`, except this just returns the token without adding it
			// to the results.
			makeToken(tag, value, offsetInChunk = 0, length = value.length) {
				var lastCharacter, locationData, token;
				locationData = {};
				[locationData.first_line, locationData.first_column] = this.getLineAndColumnFromChunk(offsetInChunk);
				// Use length - 1 for the final offset - we're supplying the last_line and the last_column,
				// so if last_column == first_column, then we're looking at a character of length 1.
				lastCharacter = length > 0 ? length - 1 : 0;
				[locationData.last_line, locationData.last_column] = this.getLineAndColumnFromChunk(offsetInChunk + lastCharacter);
				token = [tag, value, locationData];
				return token;
			}

			// Add a token to the results.
			// `offset` is the offset into the current `@chunk` where the token starts.
			// `length` is the length of the token in the `@chunk`, after the offset.  If
			// not specified, the length of `value` will be used.

			// Returns the new token.
			token(tag, value, offsetInChunk, length, origin) {
				var token;
				token = this.makeToken(tag, value, offsetInChunk, length);
				if (origin) {
					token.origin = origin;
				}
				this.tokens.push(token);
				return token;
			}

			// Peek at the last tag in the token stream.
			tag() {
				var ref, token;
				ref = this.tokens, token = ref[ref.length - 1];
				return token != null ? token[0] : void 0;
			}

			// Peek at the last value in the token stream.
			value(useOrigin = false) {
				var ref, ref1, token;
				ref = this.tokens, token = ref[ref.length - 1];
				if (useOrigin && ((token != null ? token.origin : void 0) != null)) {
					return (ref1 = token.origin) != null ? ref1[1] : void 0;
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

			formatString(str, options) {
				return this.replaceUnicodeCodePointEscapes(str.replace(STRING_OMIT, '$1'), options);
			}

			formatHeregex(str, options) {
				return this.formatRegex(str.replace(HEREGEX_OMIT, '$1$2'), merge(options, {
					delimiter: '///'
				}));
			}

			formatRegex(str, options) {
				return this.replaceUnicodeCodePointEscapes(str, options);
			}

			unicodeCodePointToUnicodeEscapes(codePoint) {
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
			}

			// Replace `\u{...}` with `\uxxxx[\uxxxx]` in regexes without `u` flag
			replaceUnicodeCodePointEscapes(str, options) {
				var shouldReplace;
				shouldReplace = (options.flags != null) && indexOf.call(options.flags, 'u') < 0;
				return str.replace(UNICODE_CODE_POINT_ESCAPE, (match, escapedBackslash, codePointHex, offset) => {
					var codePointDecimal;
					if (escapedBackslash) {
						return escapedBackslash;
					}
					codePointDecimal = parseInt(codePointHex, 16);
					if (codePointDecimal > 0x10ffff) {
						this.error("unicode code point escapes greater than \\u{10ffff} are not allowed", {
							offset: offset + options.delimiter.length,
							length: codePointHex.length + 4
						});
					}
					if (!shouldReplace) {
						return match;
					}
					return this.unicodeCodePointToUnicodeEscapes(codePointDecimal);
				});
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

			// Constructs a string or regex by escaping certain characters.
			makeDelimitedLiteral(body, options = {}) {
				var regex;
				if (body === '' && options.delimiter === '/') {
					body = '(?:)';
				}
				regex = RegExp(`(\\\\\\\\)|(\\\\0(?=[1-7]))|\\\\?(${options.delimiter // Escaped backslash.
				// Null character mistaken as octal escape.
				// (Possibly escaped) delimiter.
				// (Possibly escaped) newlines.
				// Other escapes.
	})|\\\\?(?:(\\n)|(\\r)|(\\u2028)|(\\u2029))|(\\\\.)`, "g");
				body = body.replace(regex, function(match, backslash, nul, delimiter, lf, cr, ls, ps, other) {
					switch (false) {
						// Ignore escaped backslashes.
						case !backslash:
							if (options.double) {
								return backslash + backslash;
							} else {
								return backslash;
							}
						case !nul:
							return '\\x00';
						case !delimiter:
							return `\\${delimiter}`;
						case !lf:
							return '\\n';
						case !cr:
							return '\\r';
						case !ls:
							return '\\u2028';
						case !ps:
							return '\\u2029';
						case !other:
							if (options.double) {
								return `\\${other}`;
							} else {
								return other;
							}
					}
				});
				return `${options.delimiter}${body}${options.delimiter}`;
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

			// Throws an error at either a given offset from the current chunk or at the
			// location of a token (`token[2]`).
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
			if (prev[0] === 'IDENTIFIER') {
				// `for i from from`, `for from from iterable`
				if (prev[1] === 'from') {
					prev[1][0] = 'IDENTIFIER';
					true;
				}
				// `for i from iterable`
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

		CSX_IDENTIFIER = /^(?![\d<])((?:(?!\s)[\.\-$\w\x7f-\uffff])+)/; // Must not start with `<`.
		// Like `IDENTIFIER`, but includes `-`s and `.`s.

		// Fragment: <></>
		CSX_FRAGMENT_IDENTIFIER = /^()>/; // Ends immediately with `>`.

		CSX_ATTRIBUTE = /^(?!\d)((?:(?!\s)[\-$\w\x7f-\uffff])+)([^\S]*=(?!=))?/; // Like `IDENTIFIER`, but includes `-`s.
		// Is this an attribute with a value?

		NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i; // binary
		// octal
		// hex
		// decimal

		OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>*\/%])\2=?|\?(\.|::)|\.{2,3})/; // function
		// compound assign / compare
		// zero-fill right shift
		// doubles
		// logic / shift / power / floor division / modulo
		// soak access
		// range or splat

		WHITESPACE = /^[^\n\S]+/;

		COMMENT = /^\s*###([^#][\s\S]*?)(?:###[^\n\S]*|###$)|^(?:\s*#(?!##[^#]).*)+/;

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

		INSIDE_CSX = /^(?:[^\{<])*/; // Start of CoffeeScript interpolation. // Similar to `HEREDOC_DOUBLE` but there is no escaping.
		// Maybe CSX tag (`<` not allowed even if bare).

		CSX_INTERPOLATION = /^(?:\{|<(?!\/))/; // CoffeeScript interpolation.
		// CSX opening tag.

		STRING_OMIT = /((?:\\\\)+)|\\[^\S\n]*\n\s*/g; // Consume (and preserve) an even number of backslashes.
		// Remove escaped newlines.

		SIMPLE_STRING_OMIT = /\s*\n\s*/g;

		HEREDOC_INDENT = /\n+([^\n\S]*)(?=\S)/g;

		// Regex-matching-regexes.
		REGEX = /^\/(?!\/)((?:[^[\/\n\\]|\\[^\n]|\[(?:\\[^\n]|[^\]\n\\])*\])*)(\/)?/; // Every other thing.
		// Anything but newlines escaped.
		// Character class.

		REGEX_FLAGS = /^\w*/;

		VALID_FLAGS = /^(?!.*(.).*\1)[imguy]*$/;

		// Match any character, except those that need special handling below.
		// Match `\` followed by any character.
		// Match any `/` except `///`.
		// Match `#` which is not part of interpolation, e.g. `#{}`.
		// Comments consume everything until the end of the line, including `///`.
		HEREGEX = /^(?:[^\\\/#\s]|\\[\s\S]|\/(?!\/\/)|\#(?!\{)|\s+(?:#(?!\{).*)?)*/;

		HEREGEX_OMIT = /((?:\\\\)+)|\\(\s)|\s+(?:#.*)?/g; // Consume (and preserve) an even number of backslashes.
		// Preserve escaped whitespace.
		// Remove whitespace and comments.

		REGEX_ILLEGAL = /^(\/|\/{3}\s*)(\*)/;

		POSSIBLY_DIVISION = /^\/=?\s/;

		// Other regexes.
		HERECOMMENT_ILLEGAL = /\*\//;

		LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;

		STRING_INVALID_ESCAPE = /((?:^|[^\\])(?:\\\\)*)\\(?:(0[0-7]|[1-7])|(x(?![\da-fA-F]{2}).{0,2})|(u\{(?![\da-fA-F]{1,}\})[^}]*\}?)|(u(?!\{|[\da-fA-F]{4}).{0,4}))/; // Make sure the escape isn’t escaped.
		// octal escape
		// hex escape
		// unicode code point escape
		// unicode escape

		REGEX_INVALID_ESCAPE = /((?:^|[^\\])(?:\\\\)*)\\(?:(0[0-7])|(x(?![\da-fA-F]{2}).{0,2})|(u\{(?![\da-fA-F]{1,}\})[^}]*\}?)|(u(?!\{|[\da-fA-F]{4}).{0,4}))/; // Make sure the escape isn’t escaped.
		// octal escape
		// hex escape
		// unicode code point escape
		// unicode escape

		UNICODE_CODE_POINT_ESCAPE = /(\\\\)|\\u\{([\da-fA-F]+)\}/g; // Make sure the escape isn’t escaped.

		LEADING_BLANK_LINE = /^[^\n\S]*\n/;

		TRAILING_BLANK_LINE = /\n[^\n\S]*$/;

		TRAILING_SPACES = /\s+$/;

		// Compound assignment tokens.
		COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=', '**=', '//=', '%%='];

		// Unary tokens.
		UNARY = ['NEW', 'TYPEOF', 'DELETE', 'DO'];

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
		CALLABLE = ['IDENTIFIER', 'PROPERTY', ')', ']', '?', '@', 'THIS', 'SUPER'];

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

		// Tokens that, when appearing at the end of a line, suppress a following TERMINATOR/INDENT token
		UNFINISHED = ['\\', '.', '?.', '?::', 'UNARY', 'MATH', 'UNARY_MATH', '+', '-', '**', 'SHIFT', 'RELATION', 'COMPARE', '&', '^', '|', '&&', '||', 'BIN?', 'EXTENDS'];

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
		var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,20],$V1=[1,50],$V2=[1,84],$V3=[1,85],$V4=[1,80],$V5=[1,86],$V6=[1,87],$V7=[1,82],$V8=[1,83],$V9=[1,57],$Va=[1,59],$Vb=[1,60],$Vc=[1,61],$Vd=[1,62],$Ve=[1,63],$Vf=[1,65],$Vg=[1,66],$Vh=[1,51],$Vi=[1,38],$Vj=[1,32],$Vk=[1,69],$Vl=[1,70],$Vm=[1,79],$Vn=[1,48],$Vo=[1,52],$Vp=[1,53],$Vq=[1,67],$Vr=[1,68],$Vs=[1,43],$Vt=[1,49],$Vu=[1,64],$Vv=[1,74],$Vw=[1,75],$Vx=[1,76],$Vy=[1,77],$Vz=[1,47],$VA=[1,73],$VB=[1,34],$VC=[1,35],$VD=[1,36],$VE=[1,37],$VF=[1,39],$VG=[1,40],$VH=[1,88],$VI=[1,6,32,43,142],$VJ=[1,103],$VK=[1,91],$VL=[1,90],$VM=[1,89],$VN=[1,92],$VO=[1,93],$VP=[1,94],$VQ=[1,95],$VR=[1,96],$VS=[1,97],$VT=[1,98],$VU=[1,99],$VV=[1,100],$VW=[1,101],$VX=[1,102],$VY=[1,106],$VZ=[1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$V_=[2,190],$V$=[1,112],$V01=[1,117],$V11=[1,113],$V21=[1,114],$V31=[1,115],$V41=[1,118],$V51=[1,111],$V61=[1,6,32,43,142,144,146,150,167],$V71=[1,6,31,32,41,42,43,65,66,76,77,79,84,89,97,98,99,101,105,121,122,123,131,142,144,145,146,150,151,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$V81=[2,116],$V91=[2,120],$Va1=[2,93],$Vb1=[1,130],$Vc1=[1,124],$Vd1=[1,129],$Ve1=[1,132],$Vf1=[1,136],$Vg1=[1,134],$Vh1=[1,6,31,32,41,42,43,57,65,66,76,77,79,84,89,97,98,99,101,105,121,122,123,131,142,144,145,146,150,151,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$Vi1=[2,113],$Vj1=[1,6,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$Vk1=[2,27],$Vl1=[1,162],$Vm1=[2,82],$Vn1=[1,165],$Vo1=[1,171],$Vp1=[1,185],$Vq1=[1,180],$Vr1=[1,189],$Vs1=[1,186],$Vt1=[1,191],$Vu1=[1,192],$Vv1=[1,194],$Vw1=[1,6,31,32,41,42,43,57,65,66,76,77,79,84,89,97,98,99,101,105,107,121,122,123,131,142,144,145,146,150,151,167,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186],$Vx1=[2,136],$Vy1=[1,223],$Vz1=[1,218],$VA1=[1,229],$VB1=[1,6,31,32,41,42,43,61,65,66,76,77,79,84,89,97,98,99,101,105,121,122,123,131,142,144,145,146,150,151,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$VC1=[1,6,29,31,32,41,42,43,57,61,65,66,76,77,79,84,89,97,98,99,101,105,107,113,121,122,123,131,142,144,145,146,150,151,157,158,159,167,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186],$VD1=[1,6,31,32,41,42,43,48,61,65,66,76,77,79,84,89,97,98,99,101,105,121,122,123,131,142,144,145,146,150,151,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$VE1=[1,251],$VF1=[41,42,122],$VG1=[1,261],$VH1=[1,260],$VI1=[2,91],$VJ1=[1,267],$VK1=[6,31,32,84,89],$VL1=[6,31,32,57,66,84,89],$VM1=[1,6,31,32,43,65,66,76,77,79,84,89,97,98,99,101,105,123,131,142,144,145,146,150,151,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$VN1=[1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,170,171,175,176,177,178,179,180,181,182,183,184,185],$VO1=[1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,170,171,175,177,178,179,180,181,182,183,184,185],$VP1=[41,42,76,77,97,98,99,101,121,122],$VQ1=[1,287],$VR1=[1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167],$VS1=[2,80],$VT1=[1,301],$VU1=[1,303],$VV1=[1,308],$VW1=[1,310],$VX1=[2,212],$VY1=[1,6,31,32,41,42,43,57,65,66,76,77,79,84,89,97,98,99,101,105,121,122,123,131,142,144,145,146,150,151,157,158,159,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$VZ1=[1,323],$V_1=[6,13,28,31,32,34,35,39,41,42,45,46,50,51,52,53,54,55,64,65,66,73,80,81,82,86,87,89,103,106,108,116,125,126,136,140,141,144,146,148,150,160,166,168,169,170,171,172,173],$V$1=[6,31,32,65,89],$V02=[6,31,32,65,89,123],$V12=[1,6,31,32,41,42,43,57,61,65,66,76,77,79,84,89,97,98,99,101,105,107,121,122,123,131,142,144,145,146,150,151,157,158,159,167,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186],$V22=[1,6,31,32,43,65,66,79,84,89,105,123,131,142,151,167],$V32=[1,6,31,32,43,65,66,79,84,89,105,123,131,142,145,151,167],$V42=[157,158,159],$V52=[89,157,158,159],$V62=[6,31,105],$V72=[1,341],$V82=[6,31,32,89,105],$V92=[6,31,32,61,89,105],$Va2=[1,347],$Vb2=[1,348],$Vc2=[6,31,32,57,61,66,76,77,89,105,122],$Vd2=[6,31,32,66,76,77,89,105,122],$Ve2=[1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,170,171,177,178,179,180,181,182,183,184,185],$Vf2=[1,6,31,32,41,42,43,48,65,66,76,77,79,84,89,97,98,99,101,105,121,122,123,131,142,144,145,146,150,151,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$Vg2=[1,361],$Vh2=[13,28,34,35,39,41,42,45,46,50,51,52,53,54,55,64,73,79,80,81,82,86,87,103,106,108,116,125,126,136,140,141,144,146,148,150,160,166,168,169,170,171,172,173],$Vi2=[2,201],$Vj2=[6,31,32],$Vk2=[2,92],$Vl2=[1,369],$Vm2=[1,370],$Vn2=[1,6,31,32,43,65,66,76,77,79,84,89,97,98,99,101,105,123,131,138,139,142,144,145,146,150,151,162,164,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$Vo2=[32,162,164],$Vp2=[1,6,32,43,65,66,79,84,89,105,123,131,142,145,151,167],$Vq2=[1,398],$Vr2=[1,404],$Vs2=[1,6,32,43,142,167],$Vt2=[2,107],$Vu2=[1,416],$Vv2=[1,417],$Vw2=[6,31,32,65],$Vx2=[1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,162,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$Vy2=[1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,146,150,151,167],$Vz2=[1,431],$VA2=[1,432],$VB2=[6,31,32,105],$VC2=[1,442],$VD2=[6,31,32,89,123],$VE2=[6,31,32,89],$VF2=[1,6,31,32,43,65,66,79,84,89,105,123,131,138,142,144,145,146,150,151,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],$VG2=[31,89],$VH2=[1,464],$VI2=[1,465],$VJ2=[1,471],$VK2=[1,472],$VL2=[1,496],$VM2=[1,497];
		var parser = {trace: function trace() { },
		yy: {},
		symbols_: {"error":2,"Root":3,"Body":4,"Line":5,"TERMINATOR":6,"Expression":7,"Statement":8,"FuncDirective":9,"YieldReturn":10,"AwaitReturn":11,"Return":12,"STATEMENT":13,"Import":14,"Export":15,"Value":16,"Code":17,"Operation":18,"Assign":19,"If":20,"Try":21,"While":22,"For":23,"Switch":24,"Class":25,"Throw":26,"Yield":27,"YIELD":28,"FROM":29,"Block":30,"INDENT":31,"OUTDENT":32,"Identifier":33,"IDENTIFIER":34,"CSX_TAG":35,"Property":36,"PROPERTY":37,"AlphaNumeric":38,"NUMBER":39,"String":40,"STRING":41,"STRING_START":42,"STRING_END":43,"Regex":44,"REGEX":45,"REGEX_START":46,"Invocation":47,"REGEX_END":48,"Literal":49,"JS":50,"UNDEFINED":51,"NULL":52,"BOOL":53,"INFINITY":54,"NAN":55,"Assignable":56,"=":57,"AssignObj":58,"ObjAssignable":59,"ObjRestValue":60,":":61,"SimpleObjAssignable":62,"ThisProperty":63,"[":64,"]":65,"...":66,"ObjSpreadExpr":67,"ObjSpreadIdentifier":68,"Object":69,"Parenthetical":70,"Super":71,"This":72,"SUPER":73,"Arguments":74,"ObjSpreadAccessor":75,".":76,"INDEX_START":77,"IndexValue":78,"INDEX_END":79,"RETURN":80,"AWAIT":81,"PARAM_START":82,"ParamList":83,"PARAM_END":84,"FuncGlyph":85,"->":86,"=>":87,"OptComma":88,",":89,"Param":90,"ParamVar":91,"Array":92,"Splat":93,"SimpleAssignable":94,"Accessor":95,"Range":96,"?.":97,"::":98,"?::":99,"Index":100,"INDEX_SOAK":101,"Slice":102,"{":103,"AssignList":104,"}":105,"CLASS":106,"EXTENDS":107,"IMPORT":108,"ImportDefaultSpecifier":109,"ImportNamespaceSpecifier":110,"ImportSpecifierList":111,"ImportSpecifier":112,"AS":113,"DEFAULT":114,"IMPORT_ALL":115,"EXPORT":116,"ExportSpecifierList":117,"EXPORT_ALL":118,"ExportSpecifier":119,"OptFuncExist":120,"FUNC_EXIST":121,"CALL_START":122,"CALL_END":123,"ArgList":124,"THIS":125,"@":126,"Elisions":127,"ArgElisionList":128,"OptElisions":129,"RangeDots":130,"..":131,"Arg":132,"ArgElision":133,"Elision":134,"SimpleArgs":135,"TRY":136,"Catch":137,"FINALLY":138,"CATCH":139,"THROW":140,"(":141,")":142,"WhileSource":143,"WHILE":144,"WHEN":145,"UNTIL":146,"Loop":147,"LOOP":148,"ForBody":149,"FOR":150,"BY":151,"ForStart":152,"ForSource":153,"ForVariables":154,"OWN":155,"ForValue":156,"FORIN":157,"FOROF":158,"FORFROM":159,"SWITCH":160,"Whens":161,"ELSE":162,"When":163,"LEADING_WHEN":164,"IfBlock":165,"IF":166,"POST_IF":167,"UNARY":168,"UNARY_MATH":169,"-":170,"+":171,"--":172,"++":173,"?":174,"MATH":175,"**":176,"SHIFT":177,"COMPARE":178,"&":179,"^":180,"|":181,"&&":182,"||":183,"BIN?":184,"RELATION":185,"COMPOUND_ASSIGN":186,"$accept":0,"$end":1},
		terminals_: {2:"error",6:"TERMINATOR",13:"STATEMENT",28:"YIELD",29:"FROM",31:"INDENT",32:"OUTDENT",34:"IDENTIFIER",35:"CSX_TAG",37:"PROPERTY",39:"NUMBER",41:"STRING",42:"STRING_START",43:"STRING_END",45:"REGEX",46:"REGEX_START",48:"REGEX_END",50:"JS",51:"UNDEFINED",52:"NULL",53:"BOOL",54:"INFINITY",55:"NAN",57:"=",61:":",64:"[",65:"]",66:"...",73:"SUPER",76:".",77:"INDEX_START",79:"INDEX_END",80:"RETURN",81:"AWAIT",82:"PARAM_START",84:"PARAM_END",86:"->",87:"=>",89:",",97:"?.",98:"::",99:"?::",101:"INDEX_SOAK",103:"{",105:"}",106:"CLASS",107:"EXTENDS",108:"IMPORT",113:"AS",114:"DEFAULT",115:"IMPORT_ALL",116:"EXPORT",118:"EXPORT_ALL",121:"FUNC_EXIST",122:"CALL_START",123:"CALL_END",125:"THIS",126:"@",131:"..",136:"TRY",138:"FINALLY",139:"CATCH",140:"THROW",141:"(",142:")",144:"WHILE",145:"WHEN",146:"UNTIL",148:"LOOP",150:"FOR",151:"BY",155:"OWN",157:"FORIN",158:"FOROF",159:"FORFROM",160:"SWITCH",162:"ELSE",164:"LEADING_WHEN",166:"IF",167:"POST_IF",168:"UNARY",169:"UNARY_MATH",170:"-",171:"+",172:"--",173:"++",174:"?",175:"MATH",176:"**",177:"SHIFT",178:"COMPARE",179:"&",180:"^",181:"|",182:"&&",183:"||",184:"BIN?",185:"RELATION",186:"COMPOUND_ASSIGN"},
		productions_: [0,[3,0],[3,1],[4,1],[4,3],[4,2],[5,1],[5,1],[5,1],[9,1],[9,1],[8,1],[8,1],[8,1],[8,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[27,1],[27,2],[27,3],[30,2],[30,3],[33,1],[33,1],[36,1],[38,1],[38,1],[40,1],[40,3],[44,1],[44,3],[49,1],[49,1],[49,1],[49,1],[49,1],[49,1],[49,1],[49,1],[19,3],[19,4],[19,5],[58,1],[58,1],[58,3],[58,5],[58,3],[58,5],[62,1],[62,1],[62,1],[62,3],[59,1],[59,1],[60,2],[60,2],[60,2],[60,2],[67,1],[67,1],[67,1],[67,1],[67,1],[67,2],[67,2],[67,2],[68,2],[68,2],[75,2],[75,3],[12,2],[12,4],[12,1],[10,3],[10,2],[11,3],[11,2],[17,5],[17,2],[85,1],[85,1],[88,0],[88,1],[83,0],[83,1],[83,3],[83,4],[83,6],[90,1],[90,2],[90,2],[90,3],[90,1],[91,1],[91,1],[91,1],[91,1],[93,2],[93,2],[94,1],[94,2],[94,2],[94,1],[56,1],[56,1],[56,1],[16,1],[16,1],[16,1],[16,1],[16,1],[16,1],[16,1],[71,3],[71,4],[95,2],[95,2],[95,2],[95,2],[95,1],[95,1],[100,3],[100,2],[78,1],[78,1],[69,4],[104,0],[104,1],[104,3],[104,4],[104,6],[25,1],[25,2],[25,3],[25,4],[25,2],[25,3],[25,4],[25,5],[14,2],[14,4],[14,4],[14,5],[14,7],[14,6],[14,9],[111,1],[111,3],[111,4],[111,4],[111,6],[112,1],[112,3],[112,1],[112,3],[109,1],[110,3],[15,3],[15,5],[15,2],[15,4],[15,5],[15,6],[15,3],[15,5],[15,4],[15,7],[117,1],[117,3],[117,4],[117,4],[117,6],[119,1],[119,3],[119,3],[119,1],[119,3],[47,3],[47,3],[47,3],[120,0],[120,1],[74,2],[74,4],[72,1],[72,1],[63,2],[92,2],[92,3],[92,4],[130,1],[130,1],[96,5],[102,3],[102,2],[102,2],[102,1],[124,1],[124,3],[124,4],[124,4],[124,6],[132,1],[132,1],[132,1],[128,1],[128,3],[128,4],[128,4],[128,6],[133,1],[133,2],[129,1],[129,2],[127,1],[127,2],[134,1],[135,1],[135,3],[21,2],[21,3],[21,4],[21,5],[137,3],[137,3],[137,2],[26,2],[26,4],[70,3],[70,5],[143,2],[143,4],[143,2],[143,4],[22,2],[22,2],[22,2],[22,1],[147,2],[147,2],[23,2],[23,2],[23,2],[149,2],[149,4],[149,2],[152,2],[152,3],[156,1],[156,1],[156,1],[156,1],[154,1],[154,3],[153,2],[153,2],[153,4],[153,4],[153,4],[153,6],[153,6],[153,2],[153,4],[24,5],[24,7],[24,4],[24,6],[161,1],[161,2],[163,3],[163,4],[165,3],[165,5],[20,1],[20,3],[20,3],[20,3],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,5],[18,4]],
		performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
		/* this == yyval */

		var $0 = $$.length - 1;
		switch (yystate) {
		case 1:
		return this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Block);
		break;
		case 2:
		return this.$ = $$[$0];
		break;
		case 3:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(yy.Block.wrap([$$[$0]]));
		break;
		case 4:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])($$[$0-2].push($$[$0]));
		break;
		case 5:
		this.$ = $$[$0-1];
		break;
		case 6: case 7: case 8: case 9: case 10: case 11: case 13: case 14: case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 23: case 24: case 25: case 26: case 36: case 41: case 43: case 53: case 58: case 59: case 60: case 62: case 63: case 68: case 69: case 70: case 71: case 72: case 91: case 92: case 103: case 104: case 105: case 106: case 112: case 113: case 116: case 121: case 130: case 212: case 213: case 215: case 227: case 258: case 259: case 277: case 283:
		this.$ = $$[$0];
		break;
		case 12:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.StatementLiteral($$[$0]));
		break;
		case 27:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Op($$[$0],
					new yy.Value(new yy.Literal(''))));
		break;
		case 28: case 287: case 288: case 291:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Op($$[$0-1],
					$$[$0]));
		break;
		case 29:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Op($$[$0-2].concat($$[$0-1]),
					$$[$0]));
		break;
		case 30:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Block);
		break;
		case 31: case 79: case 131:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])($$[$0-1]);
		break;
		case 32:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.IdentifierLiteral($$[$0]));
		break;
		case 33:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.CSXTag($$[$0]));
		break;
		case 34:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.PropertyName($$[$0]));
		break;
		case 35:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.NumberLiteral($$[$0]));
		break;
		case 37:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.StringLiteral($$[$0]));
		break;
		case 38:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.StringWithInterpolations($$[$0-1]));
		break;
		case 39:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.RegexLiteral($$[$0]));
		break;
		case 40:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.RegexWithInterpolations($$[$0-1].args));
		break;
		case 42:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.PassthroughLiteral($$[$0]));
		break;
		case 44:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.UndefinedLiteral($$[$0]));
		break;
		case 45:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.NullLiteral($$[$0]));
		break;
		case 46:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.BooleanLiteral($$[$0]));
		break;
		case 47:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.InfinityLiteral($$[$0]));
		break;
		case 48:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.NaNLiteral($$[$0]));
		break;
		case 49:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Assign($$[$0-2],
					$$[$0]));
		break;
		case 50:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Assign($$[$0-3],
					$$[$0]));
		break;
		case 51:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Assign($$[$0-4],
					$$[$0-1]));
		break;
		case 52: case 109: case 114: case 115: case 117: case 118: case 119: case 120: case 122: case 260: case 261:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 54:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Assign(yy.addDataToNode(yy, _$[$0-2])(new yy.Value($$[$0-2])),
					$$[$0],
					'object',
					{
							operatorToken: yy.addDataToNode(yy, _$[$0-1])(new yy.Literal($$[$0-1]))
						}));
		break;
		case 55:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Assign(yy.addDataToNode(yy, _$[$0-4])(new yy.Value($$[$0-4])),
					$$[$0-1],
					'object',
					{
							operatorToken: yy.addDataToNode(yy, _$[$0-3])(new yy.Literal($$[$0-3]))
						}));
		break;
		case 56:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Assign(yy.addDataToNode(yy, _$[$0-2])(new yy.Value($$[$0-2])),
					$$[$0],
					null,
					{
							operatorToken: yy.addDataToNode(yy, _$[$0-1])(new yy.Literal($$[$0-1]))
						}));
		break;
		case 57:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Assign(yy.addDataToNode(yy, _$[$0-4])(new yy.Value($$[$0-4])),
					$$[$0-1],
					null,
					{
							operatorToken: yy.addDataToNode(yy, _$[$0-3])(new yy.Literal($$[$0-3]))
						}));
		break;
		case 61:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Value(new yy.ComputedPropertyName($$[$0-1])));
		break;
		case 64:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Splat(new yy.Value($$[$0-1])));
		break;
		case 65:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Splat(new yy.Value($$[$0])));
		break;
		case 66: case 107:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Splat($$[$0-1]));
		break;
		case 67: case 108:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Splat($$[$0]));
		break;
		case 73:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.SuperCall(yy.addDataToNode(yy, _$[$0-1])(new yy.Super),
					$$[$0],
					false,
					$$[$0-1]));
		break;
		case 74:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Call(new yy.Value($$[$0-1]),
					$$[$0]));
		break;
		case 75:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Call($$[$0-1],
					$$[$0]));
		break;
		case 76: case 77:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])((new yy.Value($$[$0-1])).add($$[$0]));
		break;
		case 78: case 125:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Access($$[$0]));
		break;
		case 80:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Return($$[$0]));
		break;
		case 81:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Return(new yy.Value($$[$0-1])));
		break;
		case 82:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Return);
		break;
		case 83:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.YieldReturn($$[$0]));
		break;
		case 84:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.YieldReturn);
		break;
		case 85:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.AwaitReturn($$[$0]));
		break;
		case 86:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.AwaitReturn);
		break;
		case 87:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Code($$[$0-3],
					$$[$0],
					$$[$0-1],
					yy.addDataToNode(yy, _$[$0-4])(new yy.Literal($$[$0-4]))));
		break;
		case 88:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Code([],
					$$[$0],
					$$[$0-1]));
		break;
		case 89: case 90:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.FuncGlyph($$[$0]));
		break;
		case 93: case 136: case 222:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])([]);
		break;
		case 94: case 137: case 156: case 177: case 207: case 220: case 224: case 262:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])([$$[$0]]);
		break;
		case 95: case 138: case 157: case 178: case 208: case 216:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])($$[$0-2].concat($$[$0]));
		break;
		case 96: case 139: case 158: case 179: case 209:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])($$[$0-3].concat($$[$0]));
		break;
		case 97: case 140: case 160: case 181: case 211:
		this.$ = yy.addDataToNode(yy, _$[$0-5], _$[$0])($$[$0-5].concat($$[$0-2]));
		break;
		case 98:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Param($$[$0]));
		break;
		case 99:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Param($$[$0-1],
					null,
					true));
		break;
		case 100:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Param($$[$0],
					null,
					true));
		break;
		case 101:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Param($$[$0-2],
					$$[$0]));
		break;
		case 102: case 214:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Expansion);
		break;
		case 110:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])($$[$0-1].add($$[$0]));
		break;
		case 111:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Value($$[$0-1]).add($$[$0]));
		break;
		case 123:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Super(yy.addDataToNode(yy, _$[$0])(new yy.Access($$[$0])),
					[],
					false,
					$$[$0-2]));
		break;
		case 124:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Super(yy.addDataToNode(yy, _$[$0-1])(new yy.Index($$[$0-1])),
					[],
					false,
					$$[$0-3]));
		break;
		case 126:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Access($$[$0],
					'soak'));
		break;
		case 127:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])([yy.addDataToNode(yy, _$[$0-1])(new yy.Access(new yy.PropertyName('prototype'))),
					yy.addDataToNode(yy, _$[$0])(new yy.Access($$[$0]))]);
		break;
		case 128:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])([yy.addDataToNode(yy, _$[$0-1])(new yy.Access(new yy.PropertyName('prototype'),
					'soak')),
					yy.addDataToNode(yy, _$[$0])(new yy.Access($$[$0]))]);
		break;
		case 129:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Access(new yy.PropertyName('prototype')));
		break;
		case 132:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(yy.extend($$[$0],
					{
							soak: true
						}));
		break;
		case 133:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Index($$[$0]));
		break;
		case 134:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Slice($$[$0]));
		break;
		case 135:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Obj($$[$0-2],
					$$[$0-3].generated));
		break;
		case 141:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Class);
		break;
		case 142:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Class(null,
					null,
					$$[$0]));
		break;
		case 143:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Class(null,
					$$[$0]));
		break;
		case 144:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Class(null,
					$$[$0-1],
					$$[$0]));
		break;
		case 145:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Class($$[$0]));
		break;
		case 146:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Class($$[$0-1],
					null,
					$$[$0]));
		break;
		case 147:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Class($$[$0-2],
					$$[$0]));
		break;
		case 148:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Class($$[$0-3],
					$$[$0-1],
					$$[$0]));
		break;
		case 149:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.ImportDeclaration(null,
					$$[$0]));
		break;
		case 150:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.ImportDeclaration(new yy.ImportClause($$[$0-2],
					null),
					$$[$0]));
		break;
		case 151:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.ImportDeclaration(new yy.ImportClause(null,
					$$[$0-2]),
					$$[$0]));
		break;
		case 152:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.ImportDeclaration(new yy.ImportClause(null,
					new yy.ImportSpecifierList([])),
					$$[$0]));
		break;
		case 153:
		this.$ = yy.addDataToNode(yy, _$[$0-6], _$[$0])(new yy.ImportDeclaration(new yy.ImportClause(null,
					new yy.ImportSpecifierList($$[$0-4])),
					$$[$0]));
		break;
		case 154:
		this.$ = yy.addDataToNode(yy, _$[$0-5], _$[$0])(new yy.ImportDeclaration(new yy.ImportClause($$[$0-4],
					$$[$0-2]),
					$$[$0]));
		break;
		case 155:
		this.$ = yy.addDataToNode(yy, _$[$0-8], _$[$0])(new yy.ImportDeclaration(new yy.ImportClause($$[$0-7],
					new yy.ImportSpecifierList($$[$0-4])),
					$$[$0]));
		break;
		case 159: case 180: case 193: case 210:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])($$[$0-2]);
		break;
		case 161:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.ImportSpecifier($$[$0]));
		break;
		case 162:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.ImportSpecifier($$[$0-2],
					$$[$0]));
		break;
		case 163:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.ImportSpecifier(new yy.Literal($$[$0])));
		break;
		case 164:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.ImportSpecifier(new yy.Literal($$[$0-2]),
					$$[$0]));
		break;
		case 165:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.ImportDefaultSpecifier($$[$0]));
		break;
		case 166:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.ImportNamespaceSpecifier(new yy.Literal($$[$0-2]),
					$$[$0]));
		break;
		case 167:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.ExportNamedDeclaration(new yy.ExportSpecifierList([])));
		break;
		case 168:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.ExportNamedDeclaration(new yy.ExportSpecifierList($$[$0-2])));
		break;
		case 169:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.ExportNamedDeclaration($$[$0]));
		break;
		case 170:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.ExportNamedDeclaration(new yy.Assign($$[$0-2],
					$$[$0],
					null,
					{
							moduleDeclaration: 'export'
						})));
		break;
		case 171:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.ExportNamedDeclaration(new yy.Assign($$[$0-3],
					$$[$0],
					null,
					{
							moduleDeclaration: 'export'
						})));
		break;
		case 172:
		this.$ = yy.addDataToNode(yy, _$[$0-5], _$[$0])(new yy.ExportNamedDeclaration(new yy.Assign($$[$0-4],
					$$[$0-1],
					null,
					{
							moduleDeclaration: 'export'
						})));
		break;
		case 173:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.ExportDefaultDeclaration($$[$0]));
		break;
		case 174:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.ExportDefaultDeclaration(new yy.Value($$[$0-1])));
		break;
		case 175:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.ExportAllDeclaration(new yy.Literal($$[$0-2]),
					$$[$0]));
		break;
		case 176:
		this.$ = yy.addDataToNode(yy, _$[$0-6], _$[$0])(new yy.ExportNamedDeclaration(new yy.ExportSpecifierList($$[$0-4]),
					$$[$0]));
		break;
		case 182:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.ExportSpecifier($$[$0]));
		break;
		case 183:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.ExportSpecifier($$[$0-2],
					$$[$0]));
		break;
		case 184:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.ExportSpecifier($$[$0-2],
					new yy.Literal($$[$0])));
		break;
		case 185:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.ExportSpecifier(new yy.Literal($$[$0])));
		break;
		case 186:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.ExportSpecifier(new yy.Literal($$[$0-2]),
					$$[$0]));
		break;
		case 187:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.TaggedTemplateCall($$[$0-2],
					$$[$0],
					$$[$0-1]));
		break;
		case 188:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Call($$[$0-2],
					$$[$0],
					$$[$0-1]));
		break;
		case 189:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.SuperCall(yy.addDataToNode(yy, _$[$0-2])(new yy.Super),
					$$[$0],
					$$[$0-1],
					$$[$0-2]));
		break;
		case 190:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(false);
		break;
		case 191:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(true);
		break;
		case 192:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])([]);
		break;
		case 194: case 195:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Value(new yy.ThisLiteral($$[$0])));
		break;
		case 196:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Value(yy.addDataToNode(yy, _$[$0-1])(new yy.ThisLiteral($$[$0-1])),
					[yy.addDataToNode(yy, _$[$0])(new yy.Access($$[$0]))],
					'this'));
		break;
		case 197:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Arr([]));
		break;
		case 198:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Arr($$[$0-1]));
		break;
		case 199:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Arr([].concat($$[$0-2],
					$$[$0-1])));
		break;
		case 200:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])('inclusive');
		break;
		case 201:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])('exclusive');
		break;
		case 202:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Range($$[$0-3],
					$$[$0-1],
					$$[$0-2]));
		break;
		case 203:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Range($$[$0-2],
					$$[$0],
					$$[$0-1]));
		break;
		case 204:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Range($$[$0-1],
					null,
					$$[$0]));
		break;
		case 205:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Range(null,
					$$[$0],
					$$[$0-1]));
		break;
		case 206:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Range(null,
					null,
					$$[$0]));
		break;
		case 217:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])($$[$0-3].concat($$[$0-2],
					$$[$0]));
		break;
		case 218:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])($$[$0-2].concat($$[$0-1]));
		break;
		case 219:
		this.$ = yy.addDataToNode(yy, _$[$0-5], _$[$0])($$[$0-5].concat($$[$0-4],
					$$[$0-2],
					$$[$0-1]));
		break;
		case 221: case 225: case 278:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])($$[$0-1].concat($$[$0]));
		break;
		case 223:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])([].concat($$[$0]));
		break;
		case 226:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])(new yy.Elision);
		break;
		case 228:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])([].concat($$[$0-2],
					$$[$0]));
		break;
		case 229:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Try($$[$0]));
		break;
		case 230:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Try($$[$0-1],
					$$[$0][0],
					$$[$0][1]));
		break;
		case 231:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Try($$[$0-2],
					null,
					null,
					$$[$0]));
		break;
		case 232:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Try($$[$0-3],
					$$[$0-2][0],
					$$[$0-2][1],
					$$[$0]));
		break;
		case 233:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])([$$[$0-1],
					$$[$0]]);
		break;
		case 234:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])([yy.addDataToNode(yy, _$[$0-1])(new yy.Value($$[$0-1])),
					$$[$0]]);
		break;
		case 235:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])([null,
					$$[$0]]);
		break;
		case 236:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Throw($$[$0]));
		break;
		case 237:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Throw(new yy.Value($$[$0-1])));
		break;
		case 238:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Parens($$[$0-1]));
		break;
		case 239:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Parens($$[$0-2]));
		break;
		case 240:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.While($$[$0]));
		break;
		case 241:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.While($$[$0-2],
					{
							guard: $$[$0]
						}));
		break;
		case 242:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.While($$[$0],
					{
							invert: true
						}));
		break;
		case 243:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.While($$[$0-2],
					{
							invert: true,
							guard: $$[$0]
						}));
		break;
		case 244:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])($$[$0-1].addBody($$[$0]));
		break;
		case 245: case 246:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])($$[$0].addBody(yy.addDataToNode(yy, _$[$0-1])(yy.Block.wrap([$$[$0-1]]))));
		break;
		case 247:
		this.$ = yy.addDataToNode(yy, _$[$0], _$[$0])($$[$0]);
		break;
		case 248:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.While(yy.addDataToNode(yy, _$[$0-1])(new yy.BooleanLiteral('true'))).addBody($$[$0]));
		break;
		case 249:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.While(yy.addDataToNode(yy, _$[$0-1])(new yy.BooleanLiteral('true'))).addBody(yy.addDataToNode(yy, _$[$0])(yy.Block.wrap([$$[$0]]))));
		break;
		case 250: case 251:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.For($$[$0-1],
					$$[$0]));
		break;
		case 252:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.For($$[$0],
					$$[$0-1]));
		break;
		case 253:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])({
							source: yy.addDataToNode(yy, _$[$0])(new yy.Value($$[$0]))
						});
		break;
		case 254:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])({
							source: yy.addDataToNode(yy, _$[$0-2])(new yy.Value($$[$0-2])),
							step: $$[$0]
						});
		break;
		case 255:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])((function () {
						$$[$0].own = $$[$0-1].own;
						$$[$0].ownTag = $$[$0-1].ownTag;
						$$[$0].name = $$[$0-1][0];
						$$[$0].index = $$[$0-1][1];
						return $$[$0];
					}()));
		break;
		case 256:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])($$[$0]);
		break;
		case 257:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])((function () {
						$$[$0].own = true;
						$$[$0].ownTag = yy.addDataToNode(yy, _$[$0-1])(new yy.Literal($$[$0-1]));
						return $$[$0];
					}()));
		break;
		case 263:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])([$$[$0-2],
					$$[$0]]);
		break;
		case 264:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])({
							source: $$[$0]
						});
		break;
		case 265:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])({
							source: $$[$0],
							object: true
						});
		break;
		case 266:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])({
							source: $$[$0-2],
							guard: $$[$0]
						});
		break;
		case 267:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])({
							source: $$[$0-2],
							guard: $$[$0],
							object: true
						});
		break;
		case 268:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])({
							source: $$[$0-2],
							step: $$[$0]
						});
		break;
		case 269:
		this.$ = yy.addDataToNode(yy, _$[$0-5], _$[$0])({
							source: $$[$0-4],
							guard: $$[$0-2],
							step: $$[$0]
						});
		break;
		case 270:
		this.$ = yy.addDataToNode(yy, _$[$0-5], _$[$0])({
							source: $$[$0-4],
							step: $$[$0-2],
							guard: $$[$0]
						});
		break;
		case 271:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])({
							source: $$[$0],
							from: true
						});
		break;
		case 272:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])({
							source: $$[$0-2],
							guard: $$[$0],
							from: true
						});
		break;
		case 273:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Switch($$[$0-3],
					$$[$0-1]));
		break;
		case 274:
		this.$ = yy.addDataToNode(yy, _$[$0-6], _$[$0])(new yy.Switch($$[$0-5],
					$$[$0-3],
					$$[$0-1]));
		break;
		case 275:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Switch(null,
					$$[$0-1]));
		break;
		case 276:
		this.$ = yy.addDataToNode(yy, _$[$0-5], _$[$0])(new yy.Switch(null,
					$$[$0-3],
					$$[$0-1]));
		break;
		case 279:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])([[$$[$0-1],
					$$[$0]]]);
		break;
		case 280:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])([[$$[$0-2],
					$$[$0-1]]]);
		break;
		case 281:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.If($$[$0-1],
					$$[$0],
					{
							type: $$[$0-2]
						}));
		break;
		case 282:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])($$[$0-4].addElse(yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.If($$[$0-1],
					$$[$0],
					{
							type: $$[$0-2]
						}))));
		break;
		case 284:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])($$[$0-2].addElse($$[$0]));
		break;
		case 285: case 286:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.If($$[$0],
					yy.addDataToNode(yy, _$[$0-2])(yy.Block.wrap([$$[$0-2]])),
					{
							type: $$[$0-1],
							statement: true
						}));
		break;
		case 289:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Op('-',
					$$[$0]));
		break;
		case 290:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Op('+',
					$$[$0]));
		break;
		case 292:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Op('--',
					$$[$0]));
		break;
		case 293:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Op('++',
					$$[$0]));
		break;
		case 294:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Op('--',
					$$[$0-1],
					null,
					true));
		break;
		case 295:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Op('++',
					$$[$0-1],
					null,
					true));
		break;
		case 296:
		this.$ = yy.addDataToNode(yy, _$[$0-1], _$[$0])(new yy.Existence($$[$0-1]));
		break;
		case 297:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Op('+',
					$$[$0-2],
					$$[$0]));
		break;
		case 298:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Op('-',
					$$[$0-2],
					$$[$0]));
		break;
		case 299: case 300: case 301: case 302: case 303: case 304: case 305: case 306: case 307: case 308:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Op($$[$0-1],
					$$[$0-2],
					$$[$0]));
		break;
		case 309:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])((function () {
						if ($$[$0-1].charAt(0) === '!') {
							return new yy.Op($$[$0-1].slice(1),
					$$[$0-2],
					$$[$0]).invert();
						} else {
							return new yy.Op($$[$0-1],
					$$[$0-2],
					$$[$0]);
						}
					}()));
		break;
		case 310:
		this.$ = yy.addDataToNode(yy, _$[$0-2], _$[$0])(new yy.Assign($$[$0-2],
					$$[$0],
					$$[$0-1]));
		break;
		case 311:
		this.$ = yy.addDataToNode(yy, _$[$0-4], _$[$0])(new yy.Assign($$[$0-4],
					$$[$0-1],
					$$[$0-3]));
		break;
		case 312:
		this.$ = yy.addDataToNode(yy, _$[$0-3], _$[$0])(new yy.Assign($$[$0-3],
					$$[$0],
					$$[$0-2]));
		break;
		}
		},
		table: [{1:[2,1],3:1,4:2,5:3,7:4,8:5,9:6,10:23,11:24,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$V1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vi,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{1:[3]},{1:[2,2],6:$VH},o($VI,[2,3]),o($VI,[2,6],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VI,[2,7],{152:78,143:107,149:108,144:$Vv,146:$Vw,150:$Vy,167:$VY}),o($VI,[2,8]),o($VZ,[2,15],{120:109,95:110,100:116,41:$V_,42:$V_,122:$V_,76:$V$,77:$V01,97:$V11,98:$V21,99:$V31,101:$V41,121:$V51}),o($VZ,[2,16],{100:116,95:119,76:$V$,77:$V01,97:$V11,98:$V21,99:$V31,101:$V41}),o($VZ,[2,17]),o($VZ,[2,18]),o($VZ,[2,19]),o($VZ,[2,20]),o($VZ,[2,21]),o($VZ,[2,22]),o($VZ,[2,23]),o($VZ,[2,24]),o($VZ,[2,25]),o($VZ,[2,26]),o($V61,[2,11]),o($V61,[2,12]),o($V61,[2,13]),o($V61,[2,14]),o($VI,[2,9]),o($VI,[2,10]),o($V71,$V81,{57:[1,120]}),o($V71,[2,117]),o($V71,[2,118]),o($V71,[2,119]),o($V71,$V91),o($V71,[2,121]),o($V71,[2,122]),o([6,31,84,89],$Va1,{83:121,90:122,91:123,33:125,63:126,92:127,69:128,34:$V2,35:$V3,64:$Vb1,66:$Vc1,103:$Vm,126:$Vd1}),{30:131,31:$Ve1},{7:133,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:137,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:138,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:139,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:140,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:[1,141],81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{16:143,17:144,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:145,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:142,96:28,103:$Vm,125:$Vq,126:$Vr,141:$Vu},{16:143,17:144,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:145,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:146,96:28,103:$Vm,125:$Vq,126:$Vr,141:$Vu},o($Vh1,$Vi1,{172:[1,147],173:[1,148],186:[1,149]}),o($VZ,[2,283],{162:[1,150]}),{30:151,31:$Ve1},{30:152,31:$Ve1},o($VZ,[2,247]),{30:153,31:$Ve1},{7:154,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:[1,155],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($Vj1,[2,141],{49:26,70:27,96:28,47:29,72:30,71:31,85:33,92:54,69:55,38:56,44:58,33:71,63:72,40:81,16:143,17:144,56:145,30:156,94:158,31:$Ve1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,73:$Vg,82:$Vj,86:$Vk,87:$Vl,103:$Vm,107:[1,157],125:$Vq,126:$Vr,141:$Vu}),{7:159,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:[1,160],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o([1,6,32,43,142,144,146,150,167,174,175,176,177,178,179,180,181,182,183,184,185],$Vk1,{16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,8:135,7:161,13:$V0,28:$Vf1,29:$Vl1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,73:$Vg,80:[1,163],81:$Vg1,82:$Vj,86:$Vk,87:$Vl,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,148:$Vx,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),o($V61,$Vm1,{16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,8:135,7:164,13:$V0,28:$Vf1,31:$Vn1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,86:$Vk,87:$Vl,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,148:$Vx,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),{33:170,34:$V2,35:$V3,40:166,41:$V5,42:$V6,103:[1,169],109:167,110:168,115:$Vo1},{25:173,33:174,34:$V2,35:$V3,103:[1,172],106:$Vn,114:[1,175],118:[1,176]},o($Vh1,[2,114]),o($Vh1,[2,115]),o($V71,[2,41]),o($V71,[2,42]),o($V71,[2,43]),o($V71,[2,44]),o($V71,[2,45]),o($V71,[2,46]),o($V71,[2,47]),o($V71,[2,48]),{4:177,5:3,7:4,8:5,9:6,10:23,11:24,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$V1,31:[1,178],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vi,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:179,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:$Vp1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,65:$Vq1,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,89:$Vs1,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,127:181,128:182,132:187,133:184,134:183,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{76:$Vt1,77:$Vu1,120:190,121:$V51,122:$V_},o($V71,[2,194]),o($V71,[2,195],{36:193,37:$Vv1}),{31:[2,89]},{31:[2,90]},o($Vw1,[2,109]),o($Vw1,[2,112]),{7:195,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:196,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:197,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:199,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,30:198,31:$Ve1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{33:204,34:$V2,35:$V3,63:205,64:$Vf,69:207,92:206,96:200,103:$Vm,126:$Vd1,154:201,155:[1,202],156:203},{153:208,157:[1,209],158:[1,210],159:[1,211]},o([6,31,89,105],$Vx1,{40:81,104:212,58:213,59:214,60:215,62:216,38:217,67:219,33:220,36:221,63:222,68:224,69:225,70:226,71:227,72:228,34:$V2,35:$V3,37:$Vv1,39:$V4,41:$V5,42:$V6,64:$Vy1,66:$Vz1,73:$VA1,103:$Vm,125:$Vq,126:$Vr,141:$Vu}),o($VB1,[2,35]),o($VB1,[2,36]),o($V71,[2,39]),{16:143,17:144,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:230,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:145,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:231,96:28,103:$Vm,125:$Vq,126:$Vr,141:$Vu},o($VC1,[2,32]),o($VC1,[2,33]),o($VD1,[2,37]),{4:232,5:3,7:4,8:5,9:6,10:23,11:24,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$V1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vi,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VI,[2,5],{7:4,8:5,9:6,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,10:23,11:24,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,5:233,13:$V0,28:$V1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,73:$Vg,80:$Vh,81:$Vi,82:$Vj,86:$Vk,87:$Vl,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,144:$Vv,146:$Vw,148:$Vx,150:$Vy,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),o($VZ,[2,296]),{7:234,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:235,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:236,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:237,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:238,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:239,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:240,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:241,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:242,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:243,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:244,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:245,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:246,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:247,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VZ,[2,246]),o($VZ,[2,251]),{7:248,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VZ,[2,245]),o($VZ,[2,250]),{40:249,41:$V5,42:$V6,74:250,122:$VE1},o($Vw1,[2,110]),o($VF1,[2,191]),{36:252,37:$Vv1},{36:253,37:$Vv1},o($Vw1,[2,129],{36:254,37:$Vv1}),{36:255,37:$Vv1},o($Vw1,[2,130]),{7:257,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$VG1,69:55,70:27,71:31,72:30,73:$Vg,78:256,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,102:258,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,130:259,131:$VH1,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{77:$V01,100:262,101:$V41},o($Vw1,[2,111]),{6:[1,264],7:263,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:[1,265],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o([6,31],$VI1,{88:268,84:[1,266],89:$VJ1}),o($VK1,[2,94]),o($VK1,[2,98],{57:[1,270],66:[1,269]}),o($VK1,[2,102],{33:125,63:126,92:127,69:128,91:271,34:$V2,35:$V3,64:$Vb1,103:$Vm,126:$Vd1}),o($VL1,[2,103]),o($VL1,[2,104]),o($VL1,[2,105]),o($VL1,[2,106]),{36:193,37:$Vv1},{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:$Vp1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,65:$Vq1,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,89:$Vs1,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,127:181,128:182,132:187,133:184,134:183,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VM1,[2,88]),{4:274,5:3,7:4,8:5,9:6,10:23,11:24,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$V1,32:[1,273],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vi,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VN1,[2,287],{152:78,143:104,149:105,174:$VM}),{7:140,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{143:107,144:$Vv,146:$Vw,149:108,150:$Vy,152:78,167:$VY},o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,174,175,176,177,178,179,180,181,182,183,184,185],$Vk1,{16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,8:135,7:161,13:$V0,28:$Vf1,29:$Vl1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,86:$Vk,87:$Vl,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,148:$Vx,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),o($VO1,[2,288],{152:78,143:104,149:105,174:$VM,176:$VO}),o($VO1,[2,289],{152:78,143:104,149:105,174:$VM,176:$VO}),o($VO1,[2,290],{152:78,143:104,149:105,174:$VM,176:$VO}),o($VN1,[2,291],{152:78,143:104,149:105,174:$VM}),o($VI,[2,86],{16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,8:135,7:275,13:$V0,28:$Vf1,31:$Vn1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,86:$Vk,87:$Vl,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,144:$Vm1,146:$Vm1,150:$Vm1,167:$Vm1,148:$Vx,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),o($VZ,[2,292],{41:$Vi1,42:$Vi1,76:$Vi1,77:$Vi1,97:$Vi1,98:$Vi1,99:$Vi1,101:$Vi1,121:$Vi1,122:$Vi1}),o($VF1,$V_,{120:109,95:110,100:116,76:$V$,77:$V01,97:$V11,98:$V21,99:$V31,101:$V41,121:$V51}),{76:$V$,77:$V01,95:119,97:$V11,98:$V21,99:$V31,100:116,101:$V41},o($VP1,$V81),o($VZ,[2,293],{41:$Vi1,42:$Vi1,76:$Vi1,77:$Vi1,97:$Vi1,98:$Vi1,99:$Vi1,101:$Vi1,121:$Vi1,122:$Vi1}),o($VZ,[2,294]),o($VZ,[2,295]),{6:[1,278],7:276,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:[1,277],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{30:279,31:$Ve1,166:[1,280]},o($VZ,[2,229],{137:281,138:[1,282],139:[1,283]}),o($VZ,[2,244]),o($VZ,[2,252]),{31:[1,284],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},{161:285,163:286,164:$VQ1},o($VZ,[2,142]),{7:288,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($Vj1,[2,145],{30:289,31:$Ve1,41:$Vi1,42:$Vi1,76:$Vi1,77:$Vi1,97:$Vi1,98:$Vi1,99:$Vi1,101:$Vi1,121:$Vi1,122:$Vi1,107:[1,290]}),o($VR1,[2,236],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{69:291,103:$Vm},o($VR1,[2,28],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{7:292,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VI,[2,84],{16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,8:135,7:293,13:$V0,28:$Vf1,31:$Vn1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,86:$Vk,87:$Vl,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,144:$Vm1,146:$Vm1,150:$Vm1,167:$Vm1,148:$Vx,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),o($V61,$VS1,{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{69:294,103:$Vm},o($V61,[2,149]),{29:[1,295],89:[1,296]},{29:[1,297]},{31:$VT1,33:302,34:$V2,35:$V3,105:[1,298],111:299,112:300,114:$VU1},o([29,89],[2,165]),{113:[1,304]},{31:$VV1,33:309,34:$V2,35:$V3,105:[1,305],114:$VW1,117:306,119:307},o($V61,[2,169]),{57:[1,311]},{7:312,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:[1,313],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{29:[1,314]},{6:$VH,142:[1,315]},{4:316,5:3,7:4,8:5,9:6,10:23,11:24,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$V1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vi,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o([6,31,65,89],$VX1,{152:78,143:104,149:105,130:317,66:[1,318],131:$VH1,144:$Vv,146:$Vw,150:$Vy,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VY1,[2,197]),{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,65:[1,319],66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,89:$Vs1,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,132:321,134:320,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o([6,31,65],$VI1,{129:322,88:324,89:$VZ1}),o($V_1,[2,224]),o($V$1,[2,215]),{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:$Vp1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,89:$Vs1,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,127:326,128:325,132:187,133:184,134:183,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($V_1,[2,226]),o($V$1,[2,220]),o($V02,[2,213]),o($V02,[2,214],{16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,8:135,7:327,13:$V0,28:$Vf1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,86:$Vk,87:$Vl,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,144:$Vv,146:$Vw,148:$Vx,150:$Vy,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),{74:328,122:$VE1},{36:329,37:$Vv1},{7:330,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($V12,[2,196]),o($V12,[2,34]),{30:331,31:$Ve1,143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},o($V22,[2,240],{152:78,143:104,149:105,144:$Vv,145:[1,332],146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($V22,[2,242],{152:78,143:104,149:105,144:$Vv,145:[1,333],146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VZ,[2,248]),o($V32,[2,249],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,167,170,171,174,175,176,177,178,179,180,181,182,183,184,185],[2,253],{151:[1,334]}),o($V42,[2,256]),{33:204,34:$V2,35:$V3,63:205,64:$Vb1,69:207,92:206,103:$Vm,126:$Vd1,154:335,156:203},o($V42,[2,262],{89:[1,336]}),o($V52,[2,258]),o($V52,[2,259]),o($V52,[2,260]),o($V52,[2,261]),o($VZ,[2,255]),{7:337,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:338,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:339,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($V62,$VI1,{88:340,89:$V72}),o($V82,[2,137]),o($V82,[2,52],{61:[1,342]}),o($V82,[2,53]),o($V92,[2,62],{74:345,75:346,57:[1,343],66:[1,344],76:$Va2,77:$Vb2,122:$VE1}),o($V92,[2,63]),{33:220,34:$V2,35:$V3,36:221,37:$Vv1,62:349,63:222,64:$Vy1,67:350,68:224,69:225,70:226,71:227,72:228,73:$VA1,103:$Vm,125:$Vq,126:$Vr,141:$Vu},{66:[1,351],74:352,75:353,76:$Va2,77:$Vb2,122:$VE1},o($Vc2,[2,58]),o($Vc2,[2,59]),o($Vc2,[2,60]),{7:354,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($Vd2,[2,68]),o($Vd2,[2,69]),o($Vd2,[2,70]),o($Vd2,[2,71]),o($Vd2,[2,72]),{74:355,76:$Vt1,77:$Vu1,122:$VE1},o($VP1,$V91,{48:[1,356]}),o($VP1,$Vi1),{6:$VH,43:[1,357]},o($VI,[2,4]),o($Ve2,[2,297],{152:78,143:104,149:105,174:$VM,175:$VN,176:$VO}),o($Ve2,[2,298],{152:78,143:104,149:105,174:$VM,175:$VN,176:$VO}),o($VO1,[2,299],{152:78,143:104,149:105,174:$VM,176:$VO}),o($VO1,[2,300],{152:78,143:104,149:105,174:$VM,176:$VO}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,177,178,179,180,181,182,183,184,185],[2,301],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,178,179,180,181,182,183,184],[2,302],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,185:$VX}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,179,180,181,182,183,184],[2,303],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,185:$VX}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,180,181,182,183,184],[2,304],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,185:$VX}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,181,182,183,184],[2,305],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,185:$VX}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,182,183,184],[2,306],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,185:$VX}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,183,184],[2,307],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,185:$VX}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,184],[2,308],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,185:$VX}),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,151,167,178,179,180,181,182,183,184,185],[2,309],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP}),o($V32,[2,286],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($V32,[2,285],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($Vf2,[2,187]),o($Vf2,[2,188]),{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:$Vg2,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,123:[1,358],124:359,125:$Vq,126:$Vr,132:360,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($Vw1,[2,125]),o($Vw1,[2,126]),o($Vw1,[2,127]),o($Vw1,[2,128]),{79:[1,362]},{66:$VG1,79:[2,133],130:363,131:$VH1,143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},{79:[2,134]},{7:364,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,79:[2,206],80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($Vh2,[2,200]),o($Vh2,$Vi2),o($Vw1,[2,132]),o($VR1,[2,49],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{7:365,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:366,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{85:367,86:$Vk,87:$Vl},o($Vj2,$Vk2,{91:123,33:125,63:126,92:127,69:128,90:368,34:$V2,35:$V3,64:$Vb1,66:$Vc1,103:$Vm,126:$Vd1}),{6:$Vl2,31:$Vm2},o($VK1,[2,99]),{7:371,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VK1,[2,100]),o($V02,$VX1,{152:78,143:104,149:105,66:[1,372],144:$Vv,146:$Vw,150:$Vy,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($Vn2,[2,30]),{6:$VH,32:[1,373]},o($VI,[2,85],{152:78,143:104,149:105,144:$VS1,146:$VS1,150:$VS1,167:$VS1,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VR1,[2,310],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{7:374,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:375,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VZ,[2,284]),{7:376,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VZ,[2,230],{138:[1,377]}),{30:378,31:$Ve1},{30:381,31:$Ve1,33:379,34:$V2,35:$V3,69:380,103:$Vm},{161:382,163:286,164:$VQ1},{32:[1,383],162:[1,384],163:385,164:$VQ1},o($Vo2,[2,277]),{7:387,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,135:386,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($Vp2,[2,143],{152:78,143:104,149:105,30:388,31:$Ve1,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VZ,[2,146]),{7:389,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{32:[1,390]},o($VR1,[2,29],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VI,[2,83],{152:78,143:104,149:105,144:$VS1,146:$VS1,150:$VS1,167:$VS1,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{32:[1,391]},{40:392,41:$V5,42:$V6},{103:[1,394],110:393,115:$Vo1},{40:395,41:$V5,42:$V6},{29:[1,396]},o($V62,$VI1,{88:397,89:$Vq2}),o($V82,[2,156]),{31:$VT1,33:302,34:$V2,35:$V3,111:399,112:300,114:$VU1},o($V82,[2,161],{113:[1,400]}),o($V82,[2,163],{113:[1,401]}),{33:402,34:$V2,35:$V3},o($V61,[2,167]),o($V62,$VI1,{88:403,89:$Vr2}),o($V82,[2,177]),{31:$VV1,33:309,34:$V2,35:$V3,114:$VW1,117:405,119:307},o($V82,[2,182],{113:[1,406]}),o($V82,[2,185],{113:[1,407]}),{6:[1,409],7:408,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:[1,410],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($Vs2,[2,173],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{69:411,103:$Vm},{40:412,41:$V5,42:$V6},o($V71,[2,238]),{6:$VH,32:[1,413]},{7:414,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o([13,28,34,35,39,41,42,45,46,50,51,52,53,54,55,64,73,80,81,82,86,87,103,106,108,116,125,126,136,140,141,144,146,148,150,160,166,168,169,170,171,172,173],$Vi2,{6:$Vt2,31:$Vt2,65:$Vt2,89:$Vt2}),o($VY1,[2,198]),o($V_1,[2,225]),o($V$1,[2,221]),{6:$Vu2,31:$Vv2,65:[1,415]},o($Vw2,$Vk2,{16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,8:135,134:183,132:187,93:188,7:272,133:418,127:419,13:$V0,28:$Vf1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,66:$Vr1,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,86:$Vk,87:$Vl,89:$Vs1,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,144:$Vv,146:$Vw,148:$Vx,150:$Vy,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),o($Vw2,[2,222]),o($Vj2,$VI1,{88:324,129:420,89:$VZ1}),{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,89:$Vs1,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,132:321,134:320,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($V02,[2,108],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($Vf2,[2,189]),o($V71,[2,123]),{79:[1,421],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},o($Vx2,[2,281]),{7:422,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:423,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:424,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($V42,[2,257]),{33:204,34:$V2,35:$V3,63:205,64:$Vb1,69:207,92:206,103:$Vm,126:$Vd1,156:425},o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,146,150,167],[2,264],{152:78,143:104,149:105,145:[1,426],151:[1,427],170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($Vy2,[2,265],{152:78,143:104,149:105,145:[1,428],170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($Vy2,[2,271],{152:78,143:104,149:105,145:[1,429],170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{6:$Vz2,31:$VA2,105:[1,430]},o($VB2,$Vk2,{40:81,59:214,60:215,62:216,38:217,67:219,33:220,36:221,63:222,68:224,69:225,70:226,71:227,72:228,58:433,34:$V2,35:$V3,37:$Vv1,39:$V4,41:$V5,42:$V6,64:$Vy1,66:$Vz1,73:$VA1,103:$Vm,125:$Vq,126:$Vr,141:$Vu}),{7:434,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:[1,435],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:436,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:[1,437],33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($V82,[2,64]),o($Vd2,[2,74]),o($Vd2,[2,76]),{36:438,37:$Vv1},{7:257,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$VG1,69:55,70:27,71:31,72:30,73:$Vg,78:439,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,102:258,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,130:259,131:$VH1,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($V82,[2,65],{74:345,75:346,76:$Va2,77:$Vb2,122:$VE1}),o($V82,[2,67],{74:352,75:353,76:$Va2,77:$Vb2,122:$VE1}),o($V82,[2,66]),o($Vd2,[2,75]),o($Vd2,[2,77]),{65:[1,440],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},o($Vd2,[2,73]),o($V71,[2,40]),o($VD1,[2,38]),o($Vf2,[2,192]),o([6,31,123],$VI1,{88:441,89:$VC2}),o($VD2,[2,207]),{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:$Vg2,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,124:443,125:$Vq,126:$Vr,132:360,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($Vw1,[2,131]),{7:444,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,79:[2,204],80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{79:[2,205],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},o($VR1,[2,50],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{32:[1,445],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},{30:446,31:$Ve1},o($VK1,[2,95]),{33:125,34:$V2,35:$V3,63:126,64:$Vb1,66:$Vc1,69:128,90:447,91:123,92:127,103:$Vm,126:$Vd1},o($VE2,$Va1,{90:122,91:123,33:125,63:126,92:127,69:128,83:448,34:$V2,35:$V3,64:$Vb1,66:$Vc1,103:$Vm,126:$Vd1}),o($VK1,[2,101],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($V02,$Vt2),o($Vn2,[2,31]),{32:[1,449],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},o($VR1,[2,312],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{30:450,31:$Ve1,143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},{30:451,31:$Ve1},o($VZ,[2,231]),{30:452,31:$Ve1},{30:453,31:$Ve1},o($VF2,[2,235]),{32:[1,454],162:[1,455],163:385,164:$VQ1},o($VZ,[2,275]),{30:456,31:$Ve1},o($Vo2,[2,278]),{30:457,31:$Ve1,89:[1,458]},o($VG2,[2,227],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VZ,[2,144]),o($Vp2,[2,147],{152:78,143:104,149:105,30:459,31:$Ve1,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VZ,[2,237]),o($V61,[2,81]),o($V61,[2,150]),{29:[1,460]},{31:$VT1,33:302,34:$V2,35:$V3,111:461,112:300,114:$VU1},o($V61,[2,151]),{40:462,41:$V5,42:$V6},{6:$VH2,31:$VI2,105:[1,463]},o($VB2,$Vk2,{33:302,112:466,34:$V2,35:$V3,114:$VU1}),o($Vj2,$VI1,{88:467,89:$Vq2}),{33:468,34:$V2,35:$V3},{33:469,34:$V2,35:$V3},{29:[2,166]},{6:$VJ2,31:$VK2,105:[1,470]},o($VB2,$Vk2,{33:309,119:473,34:$V2,35:$V3,114:$VW1}),o($Vj2,$VI1,{88:474,89:$Vr2}),{33:475,34:$V2,35:$V3,114:[1,476]},{33:477,34:$V2,35:$V3},o($Vs2,[2,170],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{7:478,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:479,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{32:[1,480]},o($V61,[2,175]),{142:[1,481]},{65:[1,482],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},o($VY1,[2,199]),{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,89:$Vs1,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,127:326,132:187,133:483,134:183,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:$Vp1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,89:$Vs1,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,127:326,128:484,132:187,133:184,134:183,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($V$1,[2,216]),o($Vw2,[2,223],{16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,8:135,93:188,7:272,134:320,132:321,13:$V0,28:$Vf1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,66:$Vr1,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,86:$Vk,87:$Vl,89:$Vs1,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,144:$Vv,146:$Vw,148:$Vx,150:$Vy,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),{6:$Vu2,31:$Vv2,32:[1,485]},o($V71,[2,124]),o($V32,[2,241],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($V32,[2,243],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($V32,[2,254],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($V42,[2,263]),{7:486,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:487,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:488,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:489,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VY1,[2,135]),{33:220,34:$V2,35:$V3,36:221,37:$Vv1,38:217,39:$V4,40:81,41:$V5,42:$V6,58:490,59:214,60:215,62:216,63:222,64:$Vy1,66:$Vz1,67:219,68:224,69:225,70:226,71:227,72:228,73:$VA1,103:$Vm,125:$Vq,126:$Vr,141:$Vu},o($VE2,$Vx1,{40:81,58:213,59:214,60:215,62:216,38:217,67:219,33:220,36:221,63:222,68:224,69:225,70:226,71:227,72:228,104:491,34:$V2,35:$V3,37:$Vv1,39:$V4,41:$V5,42:$V6,64:$Vy1,66:$Vz1,73:$VA1,103:$Vm,125:$Vq,126:$Vr,141:$Vu}),o($V82,[2,138]),o($V82,[2,54],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{7:492,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($V82,[2,56],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{7:493,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($Vd2,[2,78]),{79:[1,494]},o($Vc2,[2,61]),{6:$VL2,31:$VM2,123:[1,495]},o([6,31,32,123],$Vk2,{16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,12:19,14:21,15:22,56:25,49:26,70:27,96:28,47:29,72:30,71:31,85:33,94:41,165:42,143:44,147:45,149:46,92:54,69:55,38:56,44:58,33:71,63:72,152:78,40:81,8:135,93:188,7:272,132:498,13:$V0,28:$Vf1,34:$V2,35:$V3,39:$V4,41:$V5,42:$V6,45:$V7,46:$V8,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,64:$Vf,66:$Vr1,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,86:$Vk,87:$Vl,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,144:$Vv,146:$Vw,148:$Vx,150:$Vy,160:$Vz,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG}),o($Vj2,$VI1,{88:499,89:$VC2}),{79:[2,203],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},o($VZ,[2,51]),o($VM1,[2,87]),o($VK1,[2,96]),o($Vj2,$VI1,{88:500,89:$VJ1}),o($VZ,[2,311]),o($Vx2,[2,282]),o($VZ,[2,232]),o($VF2,[2,233]),o($VF2,[2,234]),o($VZ,[2,273]),{30:501,31:$Ve1},{32:[1,502]},o($Vo2,[2,279],{6:[1,503]}),{7:504,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VZ,[2,148]),{40:505,41:$V5,42:$V6},o($V62,$VI1,{88:506,89:$Vq2}),o($V61,[2,152]),{29:[1,507]},{33:302,34:$V2,35:$V3,112:508,114:$VU1},{31:$VT1,33:302,34:$V2,35:$V3,111:509,112:300,114:$VU1},o($V82,[2,157]),{6:$VH2,31:$VI2,32:[1,510]},o($V82,[2,162]),o($V82,[2,164]),o($V61,[2,168],{29:[1,511]}),{33:309,34:$V2,35:$V3,114:$VW1,119:512},{31:$VV1,33:309,34:$V2,35:$V3,114:$VW1,117:513,119:307},o($V82,[2,178]),{6:$VJ2,31:$VK2,32:[1,514]},o($V82,[2,183]),o($V82,[2,184]),o($V82,[2,186]),o($Vs2,[2,171],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),{32:[1,515],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},o($V61,[2,174]),o($V71,[2,239]),o($V71,[2,202]),o($V$1,[2,217]),o($Vj2,$VI1,{88:324,129:516,89:$VZ1}),o($V$1,[2,218]),o([1,6,31,32,43,65,66,79,84,89,105,123,131,142,144,145,146,150,167],[2,266],{152:78,143:104,149:105,151:[1,517],170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($Vy2,[2,268],{152:78,143:104,149:105,145:[1,518],170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VR1,[2,267],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VR1,[2,272],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($V82,[2,139]),o($Vj2,$VI1,{88:519,89:$V72}),{32:[1,520],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},{32:[1,521],143:104,144:$Vv,146:$Vw,149:105,150:$Vy,152:78,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX},o($Vd2,[2,79]),o($Vf2,[2,193]),{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,132:522,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:272,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,31:$Vg2,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,66:$Vr1,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,93:188,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,124:523,125:$Vq,126:$Vr,132:360,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},o($VD2,[2,208]),{6:$VL2,31:$VM2,32:[1,524]},{6:$Vl2,31:$Vm2,32:[1,525]},{32:[1,526]},o($VZ,[2,276]),o($Vo2,[2,280]),o($VG2,[2,228],{152:78,143:104,149:105,144:$Vv,146:$Vw,150:$Vy,167:$VJ,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($V61,[2,154]),{6:$VH2,31:$VI2,105:[1,527]},{40:528,41:$V5,42:$V6},o($V82,[2,158]),o($Vj2,$VI1,{88:529,89:$Vq2}),o($V82,[2,159]),{40:530,41:$V5,42:$V6},o($V82,[2,179]),o($Vj2,$VI1,{88:531,89:$Vr2}),o($V82,[2,180]),o($V61,[2,172]),{6:$Vu2,31:$Vv2,32:[1,532]},{7:533,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{7:534,8:135,12:19,13:$V0,14:21,15:22,16:7,17:8,18:9,19:10,20:11,21:12,22:13,23:14,24:15,25:16,26:17,27:18,28:$Vf1,33:71,34:$V2,35:$V3,38:56,39:$V4,40:81,41:$V5,42:$V6,44:58,45:$V7,46:$V8,47:29,49:26,50:$V9,51:$Va,52:$Vb,53:$Vc,54:$Vd,55:$Ve,56:25,63:72,64:$Vf,69:55,70:27,71:31,72:30,73:$Vg,80:$Vh,81:$Vg1,82:$Vj,85:33,86:$Vk,87:$Vl,92:54,94:41,96:28,103:$Vm,106:$Vn,108:$Vo,116:$Vp,125:$Vq,126:$Vr,136:$Vs,140:$Vt,141:$Vu,143:44,144:$Vv,146:$Vw,147:45,148:$Vx,149:46,150:$Vy,152:78,160:$Vz,165:42,166:$VA,168:$VB,169:$VC,170:$VD,171:$VE,172:$VF,173:$VG},{6:$Vz2,31:$VA2,32:[1,535]},o($V82,[2,55]),o($V82,[2,57]),o($VD2,[2,209]),o($Vj2,$VI1,{88:536,89:$VC2}),o($VD2,[2,210]),o($VK1,[2,97]),o($VZ,[2,274]),{29:[1,537]},o($V61,[2,153]),{6:$VH2,31:$VI2,32:[1,538]},o($V61,[2,176]),{6:$VJ2,31:$VK2,32:[1,539]},o($V$1,[2,219]),o($VR1,[2,269],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($VR1,[2,270],{152:78,143:104,149:105,170:$VK,171:$VL,174:$VM,175:$VN,176:$VO,177:$VP,178:$VQ,179:$VR,180:$VS,181:$VT,182:$VU,183:$VV,184:$VW,185:$VX}),o($V82,[2,140]),{6:$VL2,31:$VM2,32:[1,540]},{40:541,41:$V5,42:$V6},o($V82,[2,160]),o($V82,[2,181]),o($VD2,[2,211]),o($V61,[2,155])],
		defaultActions: {69:[2,89],70:[2,90],258:[2,134],402:[2,166]},
		parseError: function parseError(str, hash) {
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
		exports.main = function () {};
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
		var exports = {};
		// The **Scope** class regulates lexical scoping within CoffeeScript. As you
		// generate code, you create a tree of scopes in the same shape as the nested
		// function bodies. Each scope knows about the variables declared within it,
		// and has a reference to its parent enclosing scope. In this way, we know which
		// variables are new and need to be declared with `var`, and which are shared
		// with external scopes.
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
		var exports = {};
		// `nodes.coffee` contains all of the node classes for the syntax tree. Most
		// nodes are created as the result of actions in the [grammar](grammar.html),
		// but some are created by other nodes as a method of code generation. To convert
		// the syntax tree into a string of JavaScript code, call `compile()` on the root.
		var Access, Arr, Assign, AwaitReturn, Base, Block, BooleanLiteral, CSXTag, Call, Class, Code, CodeFragment, ComputedPropertyName, Elision, ExecutableClassBody, Existence, Expansion, ExportAllDeclaration, ExportDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, ExportSpecifier, ExportSpecifierList, Extends, For, FuncGlyph, HereComment, HoistTarget, IdentifierLiteral, If, ImportClause, ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier, ImportSpecifierList, In, Index, InfinityLiteral, JS_FORBIDDEN, LEVEL_ACCESS, LEVEL_COND, LEVEL_LIST, LEVEL_OP, LEVEL_PAREN, LEVEL_TOP, LineComment, Literal, ModuleDeclaration, ModuleSpecifier, ModuleSpecifierList, NEGATE, NO, NaNLiteral, NullLiteral, NumberLiteral, Obj, Op, Param, Parens, PassthroughLiteral, PropertyName, Range, RegexLiteral, RegexWithInterpolations, Return, SIMPLENUM, Scope, Slice, Splat, StatementLiteral, StringLiteral, StringWithInterpolations, Super, SuperCall, Switch, TAB, THIS, TaggedTemplateCall, ThisLiteral, Throw, Try, UTILITIES, UndefinedLiteral, Value, While, YES, YieldReturn, addDataToNode, attachCommentsToNode, compact, del, ends, extend, flatten, fragmentsToText, hasLineComments, indentInitial, isLiteralArguments, isLiteralThis, isUnassignable, locationDataToString, merge, moveComments, multident, shouldCacheOrIsAssignable, some, starts, throwSyntaxError, unfoldSoak, unshiftAfterComments, utility,
			indexOf = [].indexOf,
			splice = [].splice,
			slice = [].slice;

		Error.stackTraceLimit = 2e308;

		({Scope} = require('/scope'));

		({isUnassignable, JS_FORBIDDEN} = require('/lexer'));

		// Import the helpers we plan to use.
		({compact, flatten, extend, merge, del, starts, ends, some, addDataToNode, attachCommentsToNode, locationDataToString, throwSyntaxError} = require('/helpers'));

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
				return `${this.code}${(this.locationData ? ": " + locationDataToString(this.locationData) : '')}`;
			}

		};

		// Convert an array of CodeFragments into a string.
		fragmentsToText = function(fragments) {
			var fragment;
			return ((function() {
				var j, len1, results;
				results = [];
				for (j = 0, len1 = fragments.length; j < len1; j++) {
					fragment = fragments[j];
					results.push(fragment.code);
				}
				return results;
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
					var args, argumentsNode, func, jumpNode, meth, parts, ref1, ref2;
					if (jumpNode = this.jumps()) {
						jumpNode.error('cannot use a pure statement in an expression');
					}
					o.sharedScope = true;
					func = new Code([], Block.wrap([this]));
					args = [];
					if (this.contains((function(node) {
						return node instanceof SuperCall;
					}))) {
						func.bound = true;
					} else if ((argumentsNode = this.contains(isLiteralArguments)) || this.contains(isLiteralThis)) {
						args = [new ThisLiteral];
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
				// variable scope corresponds the source position. This is used extensively to deal with executable
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

				// Construct a node that returns the current node's result.
				// Note that this is overridden for smarter behavior for
				// many statement nodes (e.g. If, For)...
				makeReturn(res) {
					var me;
					me = this.unwrapAll();
					if (res) {
						return new Call(new Literal(`${res}.push`), [me]);
					} else {
						return new Return(me);
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

				// `toString` representation of the node, for inspecting the parse tree.
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
				updateLocationDataIfMissing(locationData) {
					if (this.locationData && !this.forceUpdateLocation) {
						return this;
					}
					delete this.forceUpdateLocation;
					this.locationData = locationData;
					return this.eachChild(function(child) {
						return child.updateLocationDataIfMissing(locationData);
					});
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

			// `jumps` tells you if an expression, or an internal part of an expression
			// has a flow control construct (like `break`, or `continue`, or `return`,
			// or `throw`) that jumps out of the normal flow of control and can’t be
			// used as a value. This is important because things like this make no sense;
			// we have to disallow them.
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

		})();

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
				makeReturn(res) {
					var expr, len;
					len = this.expressions.length;
					while (len--) {
						expr = this.expressions[len];
						this.expressions[len] = expr.makeReturn(res);
						if (expr instanceof Return && !expr.expression) {
							this.expressions.splice(len, 1);
						}
						break;
					}
					return this;
				}

				// A **Block** is the only node that can serve as the root.
				compileToFragments(o = {}, level) {
					if (o.scope) {
						return super.compileToFragments(o, level);
					} else {
						return this.compileRoot(o);
					}
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
								lastFragment = fragments[fragments.length - 1];
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

				// If we happen to be the top-level **Block**, wrap everything in a safety
				// closure, unless requested not to. It would be better not to generate them
				// in the first place, but for now, clean up obvious double-parentheses.
				compileRoot(o) {
					var fragments, j, len1, name, ref1, ref2;
					o.indent = o.bare ? '' : TAB;
					o.level = LEVEL_TOP;
					this.spaced = true;
					o.scope = new Scope(null, this, null, (ref1 = o.referencedVars) != null ? ref1 : []);
					ref2 = o.locals || [];
					for (j = 0, len1 = ref2.length; j < len1; j++) {
						name = ref2[j];
						// Mark given local variables in the root scope as parameters so they don’t
						// end up being declared on this block.
						o.scope.parameter(name);
					}
					fragments = this.compileWithDeclarations(o);
					HoistTarget.expand(fragments);
					fragments = this.compileComments(fragments);
					if (o.bare) {
						return fragments;
					}
					return [].concat(this.makeCode("(function() {\n"), fragments, this.makeCode("\n}).call(this);\n"));
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
							fragments.push(this.makeCode(`;\n${(this.spaced ? '\n' : '')}`));
						} else if (fragments.length && post.length) {
							fragments.push(this.makeCode("\n"));
						}
					}
					return fragments.concat(post);
				}

				compileComments(fragments) {
					var code, commentFragment, fragment, fragmentIndent, fragmentIndex, indent, j, k, l, len1, len2, len3, newLineIndex, onNextLine, pastFragment, pastFragmentIndex, q, r, ref1, ref2, ref3, ref4, trail, upcomingFragment, upcomingFragmentIndex;
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
							ref1 = fragments.slice(0, fragmentIndex + 1);
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
								var l, len2, ref2, results;
								ref2 = fragment.precedingComments;
								results = [];
								for (l = 0, len2 = ref2.length; l < len2; l++) {
									commentFragment = ref2[l];
									if (commentFragment.isHereComment && commentFragment.multiline) {
										results.push(multident(commentFragment.code, fragmentIndent, false));
									} else {
										results.push(commentFragment.code);
									}
								}
								return results;
							})()).join(`\n${fragmentIndent}`).replace(/^(\s*)$/gm, '');
							ref2 = fragments.slice(0, fragmentIndex + 1);
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
								for (q = 0, len2 = ref3.length; q < len2; q++) {
									upcomingFragment = ref3[q];
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
								var len3, r, ref4, results;
								ref4 = fragment.followingComments;
								results = [];
								for (r = 0, len3 = ref4.length; r < len3; r++) {
									commentFragment = ref4[r];
									if (commentFragment.isHereComment && commentFragment.multiline) {
										results.push(multident(commentFragment.code, fragmentIndent, false));
									} else {
										results.push(commentFragment.code);
									}
								}
								return results;
							})()).join(`\n${fragmentIndent}`).replace(/^(\s*)$/gm, '');
							ref4 = fragments.slice(fragmentIndex);
							for (upcomingFragmentIndex = r = 0, len3 = ref4.length; r < len3; upcomingFragmentIndex = ++r) {
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

			};

			Block.prototype.children = ['expressions'];

			return Block;

		})();

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

				toString() {
					// This is only intended for debugging.
					return ` ${(this.isStatement() ? super.toString() : this.constructor.name)}: ${this.value}`;
				}

			};

			Literal.prototype.shouldCache = NO;

			return Literal;

		})();

		exports.NumberLiteral = NumberLiteral = class NumberLiteral extends Literal {};

		exports.InfinityLiteral = InfinityLiteral = class InfinityLiteral extends NumberLiteral {
			compileNode() {
				return [this.makeCode('2e308')];
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

		};

		exports.StringLiteral = StringLiteral = class StringLiteral extends Literal {
			compileNode(o) {
				var res;
				return res = this.csx ? [this.makeCode(this.unquote(true, true))] : super.compileNode();
			}

			unquote(doubleQuote = false, newLine = false) {
				var unquoted;
				unquoted = this.value.slice(1, -1);
				if (doubleQuote) {
					unquoted = unquoted.replace(/\\"/g, '"');
				}
				if (newLine) {
					unquoted = unquoted.replace(/\\n/g, '\n');
				}
				return unquoted;
			}

		};

		exports.RegexLiteral = RegexLiteral = class RegexLiteral extends Literal {};

		exports.PassthroughLiteral = PassthroughLiteral = class PassthroughLiteral extends Literal {};

		exports.IdentifierLiteral = IdentifierLiteral = (function() {
			class IdentifierLiteral extends Literal {
				eachName(iterator) {
					return iterator(this);
				}

			};

			IdentifierLiteral.prototype.isAssignable = YES;

			return IdentifierLiteral;

		})();

		exports.CSXTag = CSXTag = class CSXTag extends IdentifierLiteral {};

		exports.PropertyName = PropertyName = (function() {
			class PropertyName extends Literal {};

			PropertyName.prototype.isAssignable = YES;

			return PropertyName;

		})();

		exports.ComputedPropertyName = ComputedPropertyName = class ComputedPropertyName extends PropertyName {
			compileNode(o) {
				return [this.makeCode('['), ...this.value.compileToFragments(o, LEVEL_LIST), this.makeCode(']')];
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

			};

			StatementLiteral.prototype.isStatement = YES;

			StatementLiteral.prototype.makeReturn = THIS;

			return StatementLiteral;

		})();

		exports.ThisLiteral = ThisLiteral = class ThisLiteral extends Literal {
			constructor() {
				super('this');
			}

			compileNode(o) {
				var code, ref1;
				code = ((ref1 = o.scope.method) != null ? ref1.bound : void 0) ? o.scope.method.context : this.value;
				return [this.makeCode(code)];
			}

		};

		exports.UndefinedLiteral = UndefinedLiteral = class UndefinedLiteral extends Literal {
			constructor() {
				super('undefined');
			}

			compileNode(o) {
				return [this.makeCode(o.level >= LEVEL_ACCESS ? '(void 0)' : 'void 0')];
			}

		};

		exports.NullLiteral = NullLiteral = class NullLiteral extends Literal {
			constructor() {
				super('null');
			}

		};

		exports.BooleanLiteral = BooleanLiteral = class BooleanLiteral extends Literal {};

		//### Return

		// A `return` is a *pureStatement*—wrapping it in a closure wouldn’t make sense.
		exports.Return = Return = (function() {
			class Return extends Base {
				constructor(expression1) {
					super();
					this.expression = expression1;
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

			};

			Return.prototype.children = ['expression'];

			Return.prototype.isStatement = YES;

			Return.prototype.makeReturn = THIS;

			Return.prototype.jumps = THIS;

			return Return;

		})();

		// `yield return` works exactly like `return`, except that it turns the function
		// into a generator.
		exports.YieldReturn = YieldReturn = class YieldReturn extends Return {
			compileNode(o) {
				if (o.scope.parent == null) {
					this.error('yield can only occur inside functions');
				}
				return super.compileNode(o);
			}

		};

		exports.AwaitReturn = AwaitReturn = class AwaitReturn extends Return {
			compileNode(o) {
				if (o.scope.parent == null) {
					this.error('await can only occur inside functions');
				}
				return super.compileNode(o);
			}

		};

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

				isAssignable() {
					return this.hasProperties() || this.base.isAssignable();
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
						if (node.soak || node instanceof Call) {
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
					var lastProp, ref1;
					ref1 = this.properties, lastProp = ref1[ref1.length - 1];
					return lastProp instanceof Slice;
				}

				looksStatic(className) {
					var ref1;
					return (this.this || this.base instanceof ThisLiteral || this.base.value === className) && this.properties.length === 1 && ((ref1 = this.properties[0].name) != null ? ref1.value : void 0) !== 'prototype';
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
					ref1 = this.properties, name = ref1[ref1.length - 1];
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
					fragments = this.base.compileToFragments(o, (props.length ? LEVEL_ACCESS : null));
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

				eachName(iterator) {
					if (this.hasProperties()) {
						return iterator(this);
					} else if (this.base.isAssignable()) {
						return this.base.eachName(iterator);
					} else {
						return this.error('tried to assign to unassignable value');
					}
				}

			};

			Value.prototype.children = ['base', 'properties'];

			return Value;

		})();

		//### HereComment

		// Comment delimited by `###` (becoming `/* */`).
		exports.HereComment = HereComment = class HereComment extends Base {
			constructor({
					content: content1,
					newLine: newLine1,
					unshift: unshift
				}) {
				super();
				this.content = content1;
				this.newLine = newLine1;
				this.unshift = unshift;
			}

			compileNode(o) {
				var fragment, hasLeadingMarks, j, largestIndent, leadingWhitespace, len1, line, multiline, ref1;
				multiline = indexOf.call(this.content, '\n') >= 0;
				hasLeadingMarks = /\n\s*[#|\*]/.test(this.content);
				if (hasLeadingMarks) {
					this.content = this.content.replace(/^([ \t]*)#(?=\s)/gm, ' *');
				}
				// Unindent multiline comments. They will be reindented later.
				if (multiline) {
					largestIndent = '';
					ref1 = this.content.split('\n');
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						line = ref1[j];
						leadingWhitespace = /^\s*/.exec(line)[0];
						if (leadingWhitespace.length > largestIndent.length) {
							largestIndent = leadingWhitespace;
						}
					}
					this.content = this.content.replace(RegExp(`^(${leadingWhitespace})`, "gm"), '');
				}
				this.content = `/*${this.content}${(hasLeadingMarks ? ' ' : '')}*/`;
				fragment = this.makeCode(this.content);
				fragment.newLine = this.newLine;
				fragment.unshift = this.unshift;
				fragment.multiline = multiline;
				// Don’t rely on `fragment.type`, which can break when the compiler is minified.
				fragment.isComment = fragment.isHereComment = true;
				return fragment;
			}

		};

		//### LineComment

		// Comment running from `#` to the end of a line (becoming `//`).
		exports.LineComment = LineComment = class LineComment extends Base {
			constructor({
					content: content1,
					newLine: newLine1,
					unshift: unshift
				}) {
				super();
				this.content = content1;
				this.newLine = newLine1;
				this.unshift = unshift;
			}

			compileNode(o) {
				var fragment;
				fragment = this.makeCode(/^\s*$/.test(this.content) ? '' : `//${this.content}`);
				fragment.newLine = this.newLine;
				fragment.unshift = this.unshift;
				fragment.trail = !this.newLine && !this.unshift;
				// Don’t rely on `fragment.type`, which can break when the compiler is minified.
				fragment.isComment = fragment.isLineComment = true;
				return fragment;
			}

		};

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
					this.isNew = false;
					if (this.variable instanceof Value && this.variable.isNotCallable()) {
						this.variable.error("literal is not a function");
					}
					this.csx = this.variable.base instanceof CSXTag;
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
						this.locationData.first_line = locationData.first_line;
						this.locationData.first_column = locationData.first_column;
						base = ((ref1 = this.variable) != null ? ref1.base : void 0) || this.variable;
						if (base.needsUpdatedStartLocation) {
							this.variable.locationData.first_line = locationData.first_line;
							this.variable.locationData.first_column = locationData.first_column;
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
						left = new Literal(`typeof ${left.compile(o)} === "function"`);
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
					var arg, argIndex, compiledArgs, fragments, j, len1, ref1, ref2;
					if (this.csx) {
						return this.compileCSX(o);
					}
					if ((ref1 = this.variable) != null) {
						ref1.front = this.front;
					}
					compiledArgs = [];
					ref2 = this.args;
					for (argIndex = j = 0, len1 = ref2.length; j < len1; argIndex = ++j) {
						arg = ref2[argIndex];
						if (argIndex) {
							compiledArgs.push(this.makeCode(", "));
						}
						compiledArgs.push(...(arg.compileToFragments(o, LEVEL_LIST)));
					}
					fragments = [];
					if (this.isNew) {
						if (this.variable instanceof Super) {
							this.variable.error("Unsupported reference to 'super'");
						}
						fragments.push(this.makeCode('new '));
					}
					fragments.push(...this.variable.compileToFragments(o, LEVEL_ACCESS));
					fragments.push(this.makeCode('('), ...compiledArgs, this.makeCode(')'));
					return fragments;
				}

				compileCSX(o) {
					var attr, attrProps, attributes, content, fragments, j, len1, obj, ref1, tag;
					[attributes, content] = this.args;
					attributes.base.csx = true;
					if (content != null) {
						content.base.csx = true;
					}
					fragments = [this.makeCode('<')];
					fragments.push(...(tag = this.variable.compileToFragments(o, LEVEL_ACCESS)));
					if (attributes.base instanceof Arr) {
						ref1 = attributes.base.objects;
						for (j = 0, len1 = ref1.length; j < len1; j++) {
							obj = ref1[j];
							attr = obj.base;
							attrProps = (attr != null ? attr.properties : void 0) || [];
							// Catch invalid CSX attributes: <div {a:"b", props} {props} "value" />
							if (!(attr instanceof Obj || attr instanceof IdentifierLiteral) || (attr instanceof Obj && !attr.generated && (attrProps.length > 1 || !(attrProps[0] instanceof Splat)))) {
								obj.error("Unexpected token. Allowed CSX attributes are: id=\"val\", src={source}, {props...} or attribute.");
							}
							if (obj.base instanceof Obj) {
								obj.base.csx = true;
							}
							fragments.push(this.makeCode(' '));
							fragments.push(...obj.compileToFragments(o, LEVEL_PAREN));
						}
					}
					if (content) {
						fragments.push(this.makeCode('>'));
						fragments.push(...content.compileNode(o, LEVEL_LIST));
						fragments.push(...[this.makeCode('</'), ...tag, this.makeCode('>')]);
					} else {
						fragments.push(this.makeCode(' />'));
					}
					return fragments;
				}

			};

			Call.prototype.children = ['variable', 'args'];

			return Call;

		})();

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

		})();

		exports.Super = Super = (function() {
			class Super extends Base {
				constructor(accessor) {
					super();
					this.accessor = accessor;
				}

				compileNode(o) {
					var fragments, method, name, nref, ref1, ref2, salvagedComments, variable;
					method = o.scope.namedMethod();
					if (!(method != null ? method.isMethod : void 0)) {
						this.error('cannot use super outside of an instance method');
					}
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

			};

			Super.prototype.children = ['accessor'];

			return Super;

		})();

		//### RegexWithInterpolations

		// Regexes with interpolations are in fact just a variation of a `Call` (a
		// `RegExp()` call to be precise) with a `StringWithInterpolations` inside.
		exports.RegexWithInterpolations = RegexWithInterpolations = class RegexWithInterpolations extends Call {
			constructor(args = []) {
				super(new Value(new IdentifierLiteral('RegExp')), args, false);
			}

		};

		//### TaggedTemplateCall
		exports.TaggedTemplateCall = TaggedTemplateCall = class TaggedTemplateCall extends Call {
			constructor(variable, arg, soak) {
				if (arg instanceof StringLiteral) {
					arg = new StringWithInterpolations(Block.wrap([new Value(arg)]));
				}
				super(variable, [arg], soak);
			}

			compileNode(o) {
				return this.variable.compileToFragments(o, LEVEL_ACCESS).concat(this.args[0].compileToFragments(o, LEVEL_LIST));
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

		})();

		//### Access

		// A `.` access into a property of a value, or the `::` shorthand for
		// an access into the object's prototype.
		exports.Access = Access = (function() {
			class Access extends Base {
				constructor(name1, tag) {
					super();
					this.name = name1;
					this.soak = tag === 'soak';
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

			};

			Access.prototype.children = ['name'];

			Access.prototype.shouldCache = NO;

			return Access;

		})();

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

			};

			Index.prototype.children = ['index'];

			return Index;

		})();

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
					this.fromNum = this.from.isNumber() ? Number(this.fromVar) : null;
					this.toNum = this.to.isNumber() ? Number(this.toVar) : null;
					return this.stepNum = (step != null ? step.isNumber() : void 0) ? Number(this.stepVar) : null;
				}

				// When compiled normally, the range returns the contents of the *for loop*
				// needed to iterate over the values in the range. Used by comprehensions.
				compileNode(o) {
					var cond, condPart, from, gt, idx, idxName, known, lt, namedIndex, stepPart, to, varPart;
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
					varPart = `${idx} = ${this.fromC}`;
					if (this.toC !== this.toVar) {
						varPart += `, ${this.toC}`;
					}
					if (this.step !== this.stepVar) {
						varPart += `, ${this.step}`;
					}
					[lt, gt] = [`${idx} <${this.equals}`, `${idx} >${this.equals}`];
					// Generate the condition.
					condPart = this.stepNum != null ? this.stepNum > 0 ? `${lt} ${this.toVar}` : `${gt} ${this.toVar}` : known ? ([from, to] = [this.fromNum, this.toNum], from <= to ? `${lt} ${to}` : `${gt} ${to}`) : (cond = this.stepVar ? `${this.stepVar} > 0` : `${this.fromVar} <= ${this.toVar}`, `${cond} ? ${lt} ${this.toVar} : ${gt} ${this.toVar}`);
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
					var args, body, cond, hasArgs, i, idt, j, known, post, pre, range, ref1, ref2, result, results, vars;
					known = (this.fromNum != null) && (this.toNum != null);
					if (known && Math.abs(this.fromNum - this.toNum) <= 20) {
						range = (function() {
							results = [];
							for (var j = ref1 = this.fromNum, ref2 = this.toNum; ref1 <= ref2 ? j <= ref2 : j >= ref2; ref1 <= ref2 ? j++ : j--){ results.push(j); }
							return results;
						}).apply(this);
						if (this.exclusive) {
							range.pop();
						}
						return [this.makeCode(`[${range.join(', ')}]`)];
					}
					idt = this.tab + TAB;
					i = o.scope.freeVariable('i', {
						single: true
					});
					result = o.scope.freeVariable('results');
					pre = `\n${idt}${result} = [];`;
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

			};

			Range.prototype.children = ['from', 'to'];

			return Range;

		})();

		//### Slice

		// An array slice literal. Unlike JavaScript's `Array#slice`, the second parameter
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
					fromCompiled = from && from.compileToFragments(o, LEVEL_PAREN) || [this.makeCode('0')];
					// TODO: jwalton - move this into the 'if'?
					if (to) {
						compiled = to.compileToFragments(o, LEVEL_PAREN);
						compiledText = fragmentsToText(compiled);
						if (!(!this.range.exclusive && +compiledText === -1)) {
							toStr = ', ' + (this.range.exclusive ? compiledText : to.isNumber() ? `${+compiledText + 1}` : (compiled = to.compileToFragments(o, LEVEL_ACCESS), `+${fragmentsToText(compiled)} + 1 || 9e9`));
						}
					}
					return [this.makeCode(`.slice(${fragmentsToText(fromCompiled)}${toStr || ''})`)];
				}

			};

			Slice.prototype.children = ['range'];

			return Slice;

		})();

		//### Obj

		// An object literal, nothing fancy.
		exports.Obj = Obj = (function() {
			class Obj extends Base {
				constructor(props, generated = false, lhs1 = false) {
					super();
					this.generated = generated;
					this.lhs = lhs1;
					this.objects = this.properties = props || [];
				}

				isAssignable() {
					var j, len1, message, prop, ref1;
					ref1 = this.properties;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						prop = ref1[j];
						// Check for reserved words.
						message = isUnassignable(prop.unwrapAll().value);
						if (message) {
							prop.error(message);
						}
						if (prop instanceof Assign && prop.context === 'object') {
							prop = prop.value;
						}
						if (!prop.isAssignable()) {
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

				compileNode(o) {
					var answer, i, idt, indent, isCompact, j, join, k, key, l, lastNode, len1, len2, len3, len4, node, prop, props, q, ref1, unwrappedVal, value;
					props = this.properties;
					if (this.generated) {
						for (j = 0, len1 = props.length; j < len1; j++) {
							node = props[j];
							if (node instanceof Value) {
								node.error('cannot have an implicit value in an implicit object');
							}
						}
					}
					if (this.hasSplat() && !this.csx) {
						// Object spread properties. https://github.com/tc39/proposal-object-rest-spread/blob/master/Spread.md
						return this.compileSpread(o);
					}
					idt = o.indent += TAB;
					lastNode = this.lastNode(this.properties);
					if (this.csx) {
						// CSX attributes <div id="val" attr={aaa} {props...} />
						return this.compileCSXAttributes(o);
					}
					// If this object is the left-hand side of an assignment, all its children
					// are too.
					if (this.lhs) {
						for (k = 0, len2 = props.length; k < len2; k++) {
							prop = props[k];
							if (!(prop instanceof Assign)) {
								continue;
							}
							({value} = prop);
							unwrappedVal = value.unwrapAll();
							if (unwrappedVal instanceof Arr || unwrappedVal instanceof Obj) {
								unwrappedVal.lhs = true;
							} else if (unwrappedVal instanceof Assign) {
								unwrappedVal.nestedLhs = true;
							}
						}
					}
					isCompact = true;
					ref1 = this.properties;
					for (l = 0, len3 = ref1.length; l < len3; l++) {
						prop = ref1[l];
						if (prop instanceof Assign && prop.context === 'object') {
							isCompact = false;
						}
					}
					answer = [];
					answer.push(this.makeCode(isCompact ? '' : '\n'));
					for (i = q = 0, len4 = props.length; q < len4; i = ++q) {
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
							} else if (!(typeof prop.bareLiteral === "function" ? prop.bareLiteral(IdentifierLiteral) : void 0)) {
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
					var j, len1, prop, ref1, results;
					ref1 = this.properties;
					results = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						prop = ref1[j];
						if (prop instanceof Assign && prop.context === 'object') {
							prop = prop.value;
						}
						prop = prop.unwrapAll();
						if (prop.eachName != null) {
							results.push(prop.eachName(iterator));
						} else {
							results.push(void 0);
						}
					}
					return results;
				}

				// Object spread properties. https://github.com/tc39/proposal-object-rest-spread/blob/master/Spread.md
				// `obj2 = {a: 1, obj..., c: 3, d: 4}` → `obj2 = _extends({}, {a: 1}, obj, {c: 3, d: 4})`
				compileSpread(o) {
					var _extends, addSlice, j, len1, prop, propSlices, props, slices, splatSlice;
					props = this.properties;
					// Store object spreads.
					splatSlice = [];
					propSlices = [];
					slices = [];
					addSlice = function() {
						if (propSlices.length) {
							slices.push(new Obj(propSlices));
						}
						if (splatSlice.length) {
							slices.push(...splatSlice);
						}
						splatSlice = [];
						return propSlices = [];
					};
					for (j = 0, len1 = props.length; j < len1; j++) {
						prop = props[j];
						if (prop instanceof Splat) {
							splatSlice.push(new Value(prop.name));
							addSlice();
						} else {
							propSlices.push(prop);
						}
					}
					addSlice();
					if (!(slices[0] instanceof Obj)) {
						slices.unshift(new Obj);
					}
					_extends = new Value(new Literal(utility('_extends', o)));
					return (new Call(_extends, slices)).compileToFragments(o);
				}

				compileCSXAttributes(o) {
					var answer, i, j, join, len1, prop, props;
					props = this.properties;
					answer = [];
					for (i = j = 0, len1 = props.length; j < len1; i = ++j) {
						prop = props[i];
						prop.csx = true;
						join = i === props.length - 1 ? '' : ' ';
						if (prop instanceof Splat) {
							prop = new Literal(`{${prop.compile(o)}}`);
						}
						answer.push(...prop.compileToFragments(o, LEVEL_TOP));
						answer.push(this.makeCode(join));
					}
					if (this.front) {
						return this.wrapInParentheses(answer);
					} else {
						return answer;
					}
				}

			};

			Obj.prototype.children = ['properties'];

			return Obj;

		})();

		//### Arr

		// An array literal.
		exports.Arr = Arr = (function() {
			class Arr extends Base {
				constructor(objs, lhs1 = false) {
					super();
					this.lhs = lhs1;
					this.objects = objs || [];
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

				isAssignable() {
					var i, j, len1, obj, ref1;
					if (!this.objects.length) {
						return false;
					}
					ref1 = this.objects;
					for (i = j = 0, len1 = ref1.length; j < len1; i = ++j) {
						obj = ref1[i];
						if (obj instanceof Splat && i + 1 !== this.objects.length) {
							return false;
						}
						if (!(obj.isAssignable() && (!obj.isAtomic || obj.isAtomic()))) {
							return false;
						}
					}
					return true;
				}

				shouldCache() {
					return !this.isAssignable();
				}

				compileNode(o) {
					var answer, compiledObjs, fragment, fragmentIndex, fragmentIsElision, fragments, includesLineCommentsOnNonFirstElement, index, j, k, l, len1, len2, len3, len4, len5, obj, objIndex, olen, passedElision, q, r, ref1, unwrappedObj;
					if (!this.objects.length) {
						return [this.makeCode('[]')];
					}
					o.indent += TAB;
					fragmentIsElision = function(fragment) {
						return fragmentsToText(fragment).trim() === ',';
					};
					// Detect if `Elisions` at the beginning of the array are processed (e.g. [, , , a]).
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
						// If this array is the left-hand side of an assignment, all its children
						// are too.
						if (this.lhs) {
							if (unwrappedObj instanceof Arr || unwrappedObj instanceof Obj) {
								unwrappedObj.lhs = true;
							}
						}
					}
					compiledObjs = (function() {
						var k, len2, ref2, results;
						ref2 = this.objects;
						results = [];
						for (k = 0, len2 = ref2.length; k < len2; k++) {
							obj = ref2[k];
							results.push(obj.compileToFragments(o, LEVEL_LIST));
						}
						return results;
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
						for (fragmentIndex = q = 0, len4 = answer.length; q < len4; fragmentIndex = ++q) {
							fragment = answer[fragmentIndex];
							if (fragment.isHereComment) {
								fragment.code = `${multident(fragment.code, o.indent, false)}\n${o.indent}`;
							} else if (fragment.code === ', ' && !(fragment != null ? fragment.isElision : void 0)) {
								fragment.code = `,\n${o.indent}`;
							}
						}
						answer.unshift(this.makeCode(`[\n${o.indent}`));
						answer.push(this.makeCode(`\n${this.tab}]`));
					} else {
						for (r = 0, len5 = answer.length; r < len5; r++) {
							fragment = answer[r];
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
					var j, len1, obj, ref1, results;
					ref1 = this.objects;
					results = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						obj = ref1[j];
						obj = obj.unwrapAll();
						results.push(obj.eachName(iterator));
					}
					return results;
				}

			};

			Arr.prototype.children = ['objects'];

			return Arr;

		})();

		//### Class

		// The CoffeeScript class definition.
		// Initialize a **Class** with its name, an optional superclass, and a body.
		exports.Class = Class = (function() {
			class Class extends Base {
				constructor(variable1, parent1, body1 = new Block) {
					super();
					this.variable = variable1;
					this.parent = parent1;
					this.body = body1;
				}

				compileNode(o) {
					var executableBody, node, parentName;
					this.name = this.determineName();
					executableBody = this.walkBody();
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
					ref1 = this.variable.properties, tail = ref1[ref1.length - 1];
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

				walkBody() {
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
								if (initializerExpression = this.addInitializerExpression(assign)) {
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
							if (initializerExpression = this.addInitializerExpression(expression)) {
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
					if (initializer.length !== expressions.length) {
						this.body.expressions = (function() {
							var l, len3, results;
							results = [];
							for (l = 0, len3 = initializer.length; l < len3; l++) {
								expression = initializer[l];
								results.push(expression.hoist());
							}
							return results;
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
				addInitializerExpression(node) {
					if (node.unwrapAll() instanceof PassthroughLiteral) {
						return node;
					} else if (this.validInitializerMethod(node)) {
						return this.addInitializerMethod(node);
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
					var method, methodName, variable;
					({
						variable,
						value: method
					} = assign);
					method.isMethod = true;
					method.isStatic = variable.looksStatic(this.name);
					if (method.isStatic) {
						method.name = variable.properties[0];
					} else {
						methodName = variable.base;
						method.name = new (methodName.shouldCache() ? Index : Access)(methodName);
						method.name.updateLocationDataIfMissing(methodName.locationData);
						if (methodName.value === 'constructor') {
							method.ctor = (this.parent ? 'derived' : 'base');
						}
						if (method.bound && method.ctor) {
							method.error('Cannot define a constructor as a bound (fat arrow) function');
						}
					}
					return method;
				}

				makeDefaultConstructor() {
					var applyArgs, applyCtor, ctor;
					ctor = this.addInitializerMethod(new Assign(new Value(new PropertyName('constructor')), new Code));
					this.body.unshift(ctor);
					if (this.parent) {
						ctor.body.push(new SuperCall(new Super, [new Splat(new IdentifierLiteral('arguments'))]));
					}
					if (this.externalCtor) {
						applyCtor = new Value(this.externalCtor, [new Access(new PropertyName('apply'))]);
						applyArgs = [new ThisLiteral, new IdentifierLiteral('arguments')];
						ctor.body.push(new Call(applyCtor, applyArgs));
						ctor.body.makeReturn();
					}
					return ctor;
				}

				proxyBoundMethods() {
					var method, name;
					this.ctor.thisAssignments = (function() {
						var j, len1, ref1, results;
						ref1 = this.boundMethods;
						results = [];
						for (j = 0, len1 = ref1.length; j < len1; j++) {
							method = ref1[j];
							if (this.parent) {
								method.classVariable = this.variableRef;
							}
							name = new Value(new ThisLiteral, [method.name]);
							results.push(new Assign(name, new Call(new Value(name, [new Access(new PropertyName('bind'))]), [new ThisLiteral])));
						}
						return results;
					}).call(this);
					return null;
				}

			};

			Class.prototype.children = ['variable', 'parent', 'body'];

			return Class;

		})();

		exports.ExecutableClassBody = ExecutableClassBody = (function() {
			class ExecutableClassBody extends Base {
				constructor(_class, body1 = new Block) {
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
					this.name = (ref1 = this.class.name) != null ? ref1 : this.defaultClassVariableName;
					directives = this.walkBody();
					this.setContext();
					ident = new IdentifierLiteral(this.name);
					params = [];
					args = [];
					wrapper = new Code(params, this.body);
					klass = new Parens(new Call(wrapper, args));
					this.body.spaced = true;
					o.classScope = wrapper.makeScope(o.scope);
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
						} else if (node instanceof Code && node.bound && node.isStatic) {
							return node.context = this.name;
						}
					});
				}

				// Make class/prototype assignments for invalid ES properties
				addProperties(assigns) {
					var assign, base, name, prototype, result, value, variable;
					result = (function() {
						var j, len1, results;
						results = [];
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
								assign = this.externalCtor = new Assign(new Value, value);
							} else if (!assign.variable.this) {
								name = new (base.shouldCache() ? Index : Access)(base);
								prototype = new Access(new PropertyName('prototype'));
								variable = new Value(new ThisLiteral(), [prototype, name]);
								assign.variable = variable;
							} else if (assign.value instanceof Code) {
								assign.value.isStatic = true;
							}
							results.push(assign);
						}
						return results;
					}).call(this);
					return compact(result);
				}

			};

			ExecutableClassBody.prototype.children = ['class', 'body'];

			ExecutableClassBody.prototype.defaultClassVariableName = '_Class';

			return ExecutableClassBody;

		})();

		//### Import and Export
		exports.ModuleDeclaration = ModuleDeclaration = (function() {
			class ModuleDeclaration extends Base {
				constructor(clause, source1) {
					super();
					this.clause = clause;
					this.source = source1;
					this.checkSource();
				}

				checkSource() {
					if ((this.source != null) && this.source instanceof StringWithInterpolations) {
						return this.source.error('the name of the module to be imported from must be an uninterpolated string');
					}
				}

				checkScope(o, moduleDeclarationType) {
					if (o.indent.length !== 0) {
						return this.error(`${moduleDeclarationType} statements must be at top-level scope`);
					}
				}

			};

			ModuleDeclaration.prototype.children = ['clause', 'source'];

			ModuleDeclaration.prototype.isStatement = YES;

			ModuleDeclaration.prototype.jumps = THIS;

			ModuleDeclaration.prototype.makeReturn = THIS;

			return ModuleDeclaration;

		})();

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
				}
				code.push(this.makeCode(';'));
				return code;
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

			};

			ImportClause.prototype.children = ['defaultBinding', 'namedImports'];

			return ImportClause;

		})();

		exports.ExportDeclaration = ExportDeclaration = class ExportDeclaration extends ModuleDeclaration {
			compileNode(o) {
				var code, ref1;
				this.checkScope(o, 'export');
				code = [];
				code.push(this.makeCode(`${this.tab}export `));
				if (this instanceof ExportDefaultDeclaration) {
					code.push(this.makeCode('default '));
				}
				if (!(this instanceof ExportDefaultDeclaration) && (this.clause instanceof Assign || this.clause instanceof Class)) {
					// Prevent exporting an anonymous class; all exported members must be named
					if (this.clause instanceof Class && !this.clause.variable) {
						this.clause.error('anonymous classes cannot be exported');
					}
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
				}
				code.push(this.makeCode(';'));
				return code;
			}

		};

		exports.ExportNamedDeclaration = ExportNamedDeclaration = class ExportNamedDeclaration extends ExportDeclaration {};

		exports.ExportDefaultDeclaration = ExportDefaultDeclaration = class ExportDefaultDeclaration extends ExportDeclaration {};

		exports.ExportAllDeclaration = ExportAllDeclaration = class ExportAllDeclaration extends ExportDeclaration {};

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
						var j, len1, ref1, results;
						ref1 = this.specifiers;
						results = [];
						for (j = 0, len1 = ref1.length; j < len1; j++) {
							specifier = ref1[j];
							results.push(specifier.compileToFragments(o, LEVEL_LIST));
						}
						return results;
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

			};

			ModuleSpecifierList.prototype.children = ['specifiers'];

			return ModuleSpecifierList;

		})();

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
					o.scope.find(this.identifier, this.moduleDeclarationType);
					code = [];
					code.push(this.makeCode(this.original.value));
					if (this.alias != null) {
						code.push(this.makeCode(` as ${this.alias.value}`));
					}
					return code;
				}

			};

			ModuleSpecifier.prototype.children = ['original', 'alias'];

			return ModuleSpecifier;

		})();

		exports.ImportSpecifier = ImportSpecifier = class ImportSpecifier extends ModuleSpecifier {
			constructor(imported, local) {
				super(imported, local, 'import');
			}

			compileNode(o) {
				var ref1;
				// Per the spec, symbols can’t be imported multiple times
				// (e.g. `import { foo, foo } from 'lib'` is invalid)
				if ((ref1 = this.identifier, indexOf.call(o.importedSymbols, ref1) >= 0) || o.scope.check(this.identifier)) {
					this.error(`'${this.identifier}' has already been declared`);
				} else {
					o.importedSymbols.push(this.identifier);
				}
				return super.compileNode(o);
			}

		};

		exports.ImportDefaultSpecifier = ImportDefaultSpecifier = class ImportDefaultSpecifier extends ImportSpecifier {};

		exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier = class ImportNamespaceSpecifier extends ImportSpecifier {};

		exports.ExportSpecifier = ExportSpecifier = class ExportSpecifier extends ModuleSpecifier {
			constructor(local, exported) {
				super(local, exported, 'export');
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
					({param: this.param, subpattern: this.subpattern, operatorToken: this.operatorToken, moduleDeclaration: this.moduleDeclaration} = options);
				}

				isStatement(o) {
					return (o != null ? o.level : void 0) === LEVEL_TOP && (this.context != null) && (this.moduleDeclaration || indexOf.call(this.context, "?") >= 0);
				}

				checkAssignability(o, varBase) {
					if (Object.prototype.hasOwnProperty.call(o.scope.positions, varBase.value) && o.scope.variables[o.scope.positions[varBase.value]].type === 'import') {
						return varBase.error(`'${varBase.value}' is read-only`);
					}
				}

				assigns(name) {
					return this[this.context === 'object' ? 'value' : 'variable'].assigns(name);
				}

				unfoldSoak(o) {
					return unfoldSoak(o, this, 'variable');
				}

				// Compile an assignment, delegating to `compileDestructuring` or
				// `compileSplice` if appropriate. Keep track of the name of the base object
				// we've been assigned to, for correct internal references. If the variable
				// has not been seen yet within the current scope, declare it.
				compileNode(o) {
					var answer, compiledName, hasSplat, isValue, j, name, objDestructAnswer, properties, prototype, ref1, ref2, ref3, ref4, ref5, val, varBase;
					isValue = this.variable instanceof Value;
					if (isValue) {
						// When compiling `@variable`, remember if it is part of a function parameter.
						this.variable.param = this.param;
						// If `@variable` is an array or an object, we’re destructuring;
						// if it’s also `isAssignable()`, the destructuring syntax is supported
						// in ES and we can output it as is; otherwise we `@compileDestructuring`
						// and convert this ES-unsupported destructuring into acceptable output.
						if (this.variable.isArray() || this.variable.isObject()) {
							// This is the left-hand side of an assignment; let `Arr` and `Obj`
							// know that, so that those nodes know that they’re assignable as
							// destructured variables.
							this.variable.base.lhs = true;
							// Check if @variable contains Obj with splats.
							hasSplat = this.variable.contains(function(node) {
								return node instanceof Obj && node.hasSplat();
							});
							if (!this.variable.isAssignable() || this.variable.isArray() && hasSplat) {
								return this.compileDestructuring(o);
							}
							if (this.variable.isObject() && hasSplat) {
								// Object destructuring. Can be removed once ES proposal hits Stage 4.
								objDestructAnswer = this.compileObjectDestruct(o);
							}
							if (objDestructAnswer) {
								return objDestructAnswer;
							}
						}
						if (this.variable.isSplice()) {
							return this.compileSplice(o);
						}
						if ((ref1 = this.context) === '||=' || ref1 === '&&=' || ref1 === '?=') {
							return this.compileConditional(o);
						}
						if ((ref2 = this.context) === '**=' || ref2 === '//=' || ref2 === '%%=') {
							return this.compileSpecialMath(o);
						}
					}
					if (!this.context) {
						varBase = this.variable.unwrapAll();
						if (!varBase.isAssignable()) {
							this.variable.error(`'${this.variable.compile(o)}' can't be assigned`);
						}
						varBase.eachName((name) => {
							var commentFragments, commentsNode, message;
							if (typeof name.hasProperties === "function" ? name.hasProperties() : void 0) {
								return;
							}
							message = isUnassignable(name.value);
							if (message) {
								name.error(message);
							}
							// `moduleDeclaration` can be `'import'` or `'export'`.
							this.checkAssignability(o, name);
							if (this.moduleDeclaration) {
								return o.scope.add(name.value, this.moduleDeclaration);
							} else if (this.param) {
								return o.scope.add(name.value, this.param === 'alwaysDeclare' ? 'var' : 'param');
							} else {
								o.scope.find(name.value);
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
					if (this.value instanceof Code) {
						if (this.value.isStatic) {
							this.value.name = this.variable.properties[0];
						} else if (((ref3 = this.variable.properties) != null ? ref3.length : void 0) >= 2) {
							ref4 = this.variable.properties, properties = 3 <= ref4.length ? slice.call(ref4, 0, j = ref4.length - 2) : (j = 0, []), prototype = ref4[j++], name = ref4[j++];
							if (((ref5 = prototype.name) != null ? ref5.value : void 0) === 'prototype') {
								this.value.name = name;
							}
						}
					}
					if (this.csx) {
						this.value.base.csxAttribute = true;
					}
					val = this.value.compileToFragments(o, LEVEL_LIST);
					compiledName = this.variable.compileToFragments(o, LEVEL_LIST);
					if (this.context === 'object') {
						if (this.variable.shouldCache()) {
							compiledName.unshift(this.makeCode('['));
							compiledName.push(this.makeCode(']'));
						}
						return compiledName.concat(this.makeCode(this.csx ? '=' : ': '), val);
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

				// Check object destructuring variable for rest elements;
				// can be removed once ES proposal hits Stage 4.
				compileObjectDestruct(o) {
					var fragments, getPropKey, getPropName, j, len1, restElement, restElements, result, traverseRest, value, valueRef, valueRefTemp;
					// Returns a safe (cached) reference to the key for a given property
					getPropKey = function(prop) {
						var key;
						if (prop instanceof Assign) {
							[prop.variable, key] = prop.variable.cache(o);
							return key;
						} else {
							return prop;
						}
					};
					// Returns the name of a given property for use with excludeProps
					// Property names are quoted (e.g. `a: b` -> 'a'), and everything else uses the key reference
					// (e.g. `'a': b -> 'a'`, `"#{a}": b` -> <cached>`)
					getPropName = function(prop) {
						var cached, key;
						key = getPropKey(prop);
						cached = prop instanceof Assign && prop.variable !== key;
						if (cached || !key.isAssignable()) {
							return key;
						} else {
							return new Literal(`'${key.compileWithoutComments(o)}'`);
						}
					};
					// Recursive function for searching and storing rest elements in objects.
					// e.g. `{[properties...]} = source`.
					traverseRest = (properties, source) => {
						var base1, index, j, len1, nestedProperties, nestedSource, nestedSourceDefault, p, prop, restElements, restIndex;
						restElements = [];
						restIndex = void 0;
						if (source.properties == null) {
							source = new Value(source);
						}
						for (index = j = 0, len1 = properties.length; j < len1; index = ++j) {
							prop = properties[index];
							nestedSourceDefault = nestedSource = nestedProperties = null;
							if (prop instanceof Assign) {
								if (typeof (base1 = prop.value).isObject === "function" ? base1.isObject() : void 0) {
									if (prop.context !== 'object') {
										// prop is `k = {...} `
										continue;
									}
									// prop is `k: {...}`
									nestedProperties = prop.value.base.properties;
								} else if (prop.value instanceof Assign && prop.value.variable.isObject()) {
									// prop is `k: {...} = default`
									nestedProperties = prop.value.variable.base.properties;
									[prop.value.value, nestedSourceDefault] = prop.value.value.cache(o);
								}
								if (nestedProperties) {
									nestedSource = new Value(source.base, source.properties.concat([new Access(getPropKey(prop))]));
									if (nestedSourceDefault) {
										nestedSource = new Value(new Op('?', nestedSource, nestedSourceDefault));
									}
									restElements.push(...traverseRest(nestedProperties, nestedSource));
								}
							} else if (prop instanceof Splat) {
								if (restIndex != null) {
									prop.error("multiple rest elements are disallowed in object destructuring");
								}
								restIndex = index;
								restElements.push({
									name: prop.name.unwrapAll(),
									source,
									excludeProps: new Arr((function() {
										var k, len2, results;
										results = [];
										for (k = 0, len2 = properties.length; k < len2; k++) {
											p = properties[k];
											if (p !== prop) {
												results.push(getPropName(p));
											}
										}
										return results;
									})())
								});
							}
						}
						if (restIndex != null) {
							// Remove rest element from the properties after iteration
							properties.splice(restIndex, 1);
						}
						return restElements;
					};
					// Cache the value for reuse with rest elements.
					valueRefTemp = this.value.shouldCache() ? new IdentifierLiteral(o.scope.freeVariable('ref', {
						reserve: false
					})) : this.value.base;
					// Find all rest elements.
					restElements = traverseRest(this.variable.base.properties, valueRefTemp);
					if (!(restElements && restElements.length > 0)) {
						return false;
					}
					[this.value, valueRef] = this.value.cache(o);
					result = new Block([this]);
					for (j = 0, len1 = restElements.length; j < len1; j++) {
						restElement = restElements[j];
						value = new Call(new Value(new Literal(utility('objectWithoutKeys', o))), [restElement.source, restElement.excludeProps]);
						result.push(new Assign(new Value(restElement.name), value, null, {
							param: this.param ? 'alwaysDeclare' : null
						}));
					}
					fragments = result.compileToFragments(o);
					if (o.level === LEVEL_TOP) {
						// Remove leading tab and trailing semicolon
						fragments.shift();
						fragments.pop();
					}
					return fragments;
				}

				// Brief implementation of recursive pattern matching, when assigning array or
				// object literals to a value. Peeks at their properties to assign inner names.
				compileDestructuring(o) {
					var acc, assigns, code, defaultValue, expandedIdx, fragments, i, idx, isObject, ivar, j, len1, message, name, obj, objects, olen, ref, rest, top, val, value, vvar, vvarText;
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
					// Disallow `[...] = a` for some reason. (Could be equivalent to `[] = a`?)
					if (olen === 1 && obj instanceof Expansion) {
						obj.error('Destructuring assignment has no target');
					}
					isObject = this.variable.isObject();
					// Special case for when there's only one thing destructured off of
					// something. `{a} = b`, `[a] = b`, `{a: b} = c`
					if (top && olen === 1 && !(obj instanceof Splat)) {
						// Pick the property straight off the value when there’s just one to pick
						// (no need to cache the value into a variable).
						defaultValue = void 0;
						if (obj instanceof Assign && obj.context === 'object') {
							({
								// A regular object pattern-match.
								variable: {
									base: idx
								},
								value: obj
							} = obj);
							if (obj instanceof Assign) {
								defaultValue = obj.value;
								obj = obj.variable;
							}
						} else {
							if (obj instanceof Assign) {
								defaultValue = obj.value;
								obj = obj.variable;
							}
							// A shorthand `{a, b, @c} = val` pattern-match.
							// A regular array pattern-match.
							idx = isObject ? obj.this ? obj.properties[0].name : new PropertyName(obj.unwrap().value) : new NumberLiteral(0);
						}
						acc = idx.unwrap() instanceof PropertyName;
						value = new Value(value);
						value.properties.push(new (acc ? Access : Index)(idx));
						message = isUnassignable(obj.unwrap().value);
						if (message) {
							obj.error(message);
						}
						if (defaultValue) {
							defaultValue.isDefaultValue = true;
							value = new Op('?', value, defaultValue);
						}
						return new Assign(obj, value, null, {
							param: this.param
						}).compileToFragments(o, LEVEL_TOP);
					}
					vvar = value.compileToFragments(o, LEVEL_LIST);
					vvarText = fragmentsToText(vvar);
					assigns = [];
					expandedIdx = false;
					// At this point, there are several things to destructure. So the `fn()` in
					// `{a, b} = fn()` must be cached, for example. Make vvar into a simple
					// variable if it isn’t already.
					if (!(value.unwrap() instanceof IdentifierLiteral) || this.variable.assigns(vvarText)) {
						ref = o.scope.freeVariable('ref');
						assigns.push([this.makeCode(ref + ' = '), ...vvar]);
						vvar = [this.makeCode(ref)];
						vvarText = ref;
					}
					// And here comes the big loop that handles all of these cases:
					// `[a, b] = c`
					// `[a..., b] = c`
					// `[..., a, b] = c`
					// `[@a, b] = c`
					// `[a = 1, b] = c`
					// `{a, b} = c`
					// `{@a, b} = c`
					// `{a = 1, b} = c`
					// etc.
					for (i = j = 0, len1 = objects.length; j < len1; i = ++j) {
						obj = objects[i];
						idx = i;
						if (!expandedIdx && obj instanceof Splat) {
							name = obj.name.unwrap().value;
							obj = obj.unwrap();
							val = `${olen} <= ${vvarText}.length ? ${utility('slice', o)}.call(${vvarText}, ${i}`;
							rest = olen - i - 1;
							if (rest !== 0) {
								ivar = o.scope.freeVariable('i', {
									single: true
								});
								val += `, ${ivar} = ${vvarText}.length - ${rest}) : (${ivar} = ${i}, [])`;
							} else {
								val += ") : []";
							}
							val = new Literal(val);
							expandedIdx = `${ivar}++`;
						} else if (!expandedIdx && obj instanceof Expansion) {
							rest = olen - i - 1;
							if (rest !== 0) {
								if (rest === 1) {
									expandedIdx = `${vvarText}.length - 1`;
								} else {
									ivar = o.scope.freeVariable('i', {
										single: true
									});
									val = new Literal(`${ivar} = ${vvarText}.length - ${rest}`);
									expandedIdx = `${ivar}++`;
									assigns.push(val.compileToFragments(o, LEVEL_LIST));
								}
							}
							continue;
						} else {
							if (obj instanceof Splat || obj instanceof Expansion) {
								obj.error("multiple splats/expansions are disallowed in an assignment");
							}
							defaultValue = void 0;
							if (obj instanceof Assign && obj.context === 'object') {
								({
									// A regular object pattern-match.
									variable: {
										base: idx
									},
									value: obj
								} = obj);
								if (obj instanceof Assign) {
									defaultValue = obj.value;
									obj = obj.variable;
								}
							} else {
								if (obj instanceof Assign) {
									defaultValue = obj.value;
									obj = obj.variable;
								}
								// A shorthand `{a, b, @c} = val` pattern-match.
								// A regular array pattern-match.
								idx = isObject ? obj.this ? obj.properties[0].name : new PropertyName(obj.unwrap().value) : new Literal(expandedIdx || idx);
							}
							name = obj.unwrap().value;
							acc = idx.unwrap() instanceof PropertyName;
							val = new Value(new Literal(vvarText), [new (acc ? Access : Index)(idx)]);
							if (defaultValue) {
								defaultValue.isDefaultValue = true;
								val = new Op('?', val, defaultValue);
							}
						}
						if (name != null) {
							message = isUnassignable(name);
							if (message) {
								obj.error(message);
							}
						}
						if (!(obj instanceof Elision)) {
							assigns.push(new Assign(obj, val, null, {
								param: this.param,
								subpattern: true
							}).compileToFragments(o, LEVEL_LIST));
						} else {
							if (expandedIdx) {
								// Output `Elision` only if `idx` is `i++`, e.g. expandedIdx.
								assigns.push(idx.compileToFragments(o, LEVEL_LIST));
							}
						}
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

				// When compiling a conditional assignment, take care to ensure that the
				// operands are only evaluated once, even though we have to reference them
				// more than once.
				compileConditional(o) {
					var fragments, left, right;
					[left, right] = this.variable.cacheReference(o);
					// Disallow conditional assignment of undefined variables.
					if (!left.properties.length && left.base instanceof Literal && !(left.base instanceof ThisLiteral) && !o.scope.check(left.base.value)) {
						this.variable.error(`the variable "${left.base.value}" can't be assigned with ${this.context} because it has not been declared before`);
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

				// Convert special math assignment operators like `a **= b` to the equivalent
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

			};

			Assign.prototype.children = ['variable', 'value'];

			Assign.prototype.isAssignable = YES;

			return Assign;

		})();

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
					this.body = body || new Block;
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
						if (this.isGenerator && this.isAsync) {
							return node.error("function can't contain both yield and await");
						}
					});
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
					var answer, body, boundMethodCheck, comment, condition, exprs, generatedVariables, haveBodyParam, haveSplatParam, i, ifTrue, j, k, l, len1, len2, len3, m, methodScope, modifiers, name, param, paramNames, paramToAddToScope, params, paramsAfterSplat, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, scopeVariablesCount, signature, splatParamName, thisAssignments, wasEmpty, yieldNode;
					if (this.ctor) {
						if (this.isAsync) {
							this.name.error('Class constructor may not be async');
						}
						if (this.isGenerator) {
							this.name.error('Class constructor may not be a generator');
						}
					}
					if (this.bound) {
						if ((ref1 = o.scope.method) != null ? ref1.bound : void 0) {
							this.context = o.scope.method.context;
						}
						if (!this.context) {
							this.context = 'this';
						}
					}
					o.scope = del(o, 'classScope') || this.makeScope(o.scope);
					o.scope.shared = del(o, 'sharedScope');
					o.indent += TAB;
					delete o.bare;
					delete o.isExistentialEquals;
					params = [];
					exprs = [];
					thisAssignments = (ref2 = (ref3 = this.thisAssignments) != null ? ref3.slice() : void 0) != null ? ref2 : [];
					paramsAfterSplat = [];
					haveSplatParam = false;
					haveBodyParam = false;
					// Check for duplicate parameters and separate `this` assignments.
					paramNames = [];
					this.eachParamName(function(name, node, param) {
						var target;
						if (indexOf.call(paramNames, name) >= 0) {
							node.error(`multiple parameters named '${name}'`);
						}
						paramNames.push(name);
						if (node.this) {
							name = node.properties[0].name.value;
							if (indexOf.call(JS_FORBIDDEN, name) >= 0) {
								name = `_${name}`;
							}
							target = new IdentifierLiteral(o.scope.freeVariable(name));
							param.renameParam(node, target);
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
						// Was `...` used with this parameter? (Only one such parameter is allowed
						// per function.) Splat/expansion parameters cannot have default values,
						// so we need not worry about that.
						if (param.splat || param instanceof Expansion) {
							if (haveSplatParam) {
								param.error('only one splat or expansion parameter is allowed per function definition');
							} else if (param instanceof Expansion && this.params.length === 1) {
								param.error('an expansion parameter cannot be the only parameter in a function definition');
							}
							haveSplatParam = true;
							if (param.splat) {
								if (param.name instanceof Arr) {
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
									condition = new Op('===', param, new UndefinedLiteral);
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
									// Compile `foo({a, b...}) ->` to `foo(arg) -> {a, b...} = arg`.
									// Can be removed once ES proposal hits Stage 4.
									if (param.name instanceof Obj && param.name.hasSplat()) {
										splatParamName = o.scope.freeVariable('arg');
										o.scope.parameter(splatParamName);
										ref = new Value(new IdentifierLiteral(splatParamName));
										exprs.push(new Assign(new Value(param.name), ref, null, {
											param: 'alwaysDeclare'
										}));
										// Compile `foo({a, b...} = {}) ->` to `foo(arg = {}) -> {a, b...} = arg`.
										if ((param.value != null) && !param.assignedInBody) {
											ref = new Assign(ref, param.value, null, {
												param: true
											});
										}
									} else if (!param.shouldCache()) {
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
									condition = new Op('===', param, new UndefinedLiteral);
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
							results;
								results = [];
								for (k = 0, len2 = paramsAfterSplat.length; k < len2; k++) {
									param = paramsAfterSplat[k];
									results.push(param.asReference(o));
								}
								return results;
							})())
						])), new Value(new IdentifierLiteral(splatParamName))));
					}
					// Add new expressions to the function body
					wasEmpty = this.body.isEmpty();
					if (!this.expandCtorSuper(thisAssignments)) {
						this.body.expressions.unshift(...thisAssignments);
					}
					this.body.expressions.unshift(...exprs);
					if (this.isMethod && this.bound && !this.isStatic && this.classVariable) {
						boundMethodCheck = new Value(new Literal(utility('boundMethodCheck', o)));
						this.body.expressions.unshift(new Call(boundMethodCheck, [new Value(new ThisLiteral), this.classVariable]));
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
						modifiers.push(`function${(this.isGenerator ? '*' : '')}`);
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
						signature.push(...param.compileToFragments(o));
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
						var len4, q, results;
						results = [];
						for (q = 0, len4 = modifiers.length; q < len4; q++) {
							m = modifiers[q];
							results.push(this.makeCode(m));
						}
						return results;
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

				eachParamName(iterator) {
					var j, len1, param, ref1, results;
					ref1 = this.params;
					results = [];
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						param = ref1[j];
						results.push(param.eachName(iterator));
					}
					return results;
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

				expandCtorSuper(thisAssignments) {
					var haveThisParam, param, ref1, seenSuper;
					if (!this.ctor) {
						return false;
					}
					this.eachSuperCall(Block.wrap(this.params), function(superCall) {
						return superCall.error("'super' is not allowed in constructor parameter defaults");
					});
					seenSuper = this.eachSuperCall(this.body, (superCall) => {
						if (this.ctor === 'base') {
							superCall.error("'super' is only allowed in derived class constructors");
						}
						return superCall.expressions = thisAssignments;
					});
					haveThisParam = thisAssignments.length && thisAssignments.length !== ((ref1 = this.thisAssignments) != null ? ref1.length : void 0);
					if (this.ctor === 'derived' && !seenSuper && haveThisParam) {
						param = thisAssignments[0].variable;
						param.error("Can't use @params in derived class constructors without calling super");
					}
					return seenSuper;
				}

				// Find all super calls in the given context node;
				// returns `true` if `iterator` is called.
				eachSuperCall(context, iterator) {
					var seenSuper;
					seenSuper = false;
					context.traverseChildren(true, (child) => {
						if (child instanceof SuperCall) {
							// `super` in a constructor (the only `super` without an accessor)
							// cannot be given an argument with a reference to `this`, as that would
							// be referencing `this` before calling `super`.
							if (!child.variable.accessor) {
								Block.wrap(child.args).traverseChildren(true, (node) => {
									if (node.this) {
										return node.error("Can't call super with @params in derived class constructors");
									}
								});
							}
							seenSuper = true;
							iterator(child);
						} else if (child instanceof ThisLiteral && this.ctor === 'derived' && !seenSuper) {
							child.error("Can't reference 'this' before calling super in derived class constructors");
						}
						// `super` has the same target in bound (arrow) functions, so check them too
						return !(child instanceof SuperCall) && (!(child instanceof Code) || child.bound);
					});
					return seenSuper;
				}

			};

			Code.prototype.children = ['params', 'body'];

			Code.prototype.jumps = NO;

			return Code;

		})();

		//### Param

		// A parameter in a function definition. Beyond a typical JavaScript parameter,
		// these parameters can also attach themselves to the context of the function,
		// as well as be a splat, gathering up a group of parameters into an array.
		exports.Param = Param = (function() {
			class Param extends Base {
				constructor(name1, value1, splat) {
					var message, token;
					super();
					this.name = name1;
					this.value = value1;
					this.splat = splat;
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
					var atParam, j, len1, node, obj, ref1, ref2;
					atParam = (obj) => {
						return iterator(`@${obj.properties[0].name.value}`, obj, this);
					};
					if (name instanceof Literal) {
						// * simple literals `foo`
						return iterator(name.value, name, this);
					}
					if (name instanceof Value) {
						// * at-params `@foo`
						return atParam(name);
					}
					ref2 = (ref1 = name.objects) != null ? ref1 : [];
					for (j = 0, len1 = ref2.length; j < len1; j++) {
						obj = ref2[j];
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
								atParam(obj);
							} else {
								// * simple destructured parameters {foo}
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
							return new Assign(new Value(key), newNode, 'object');
						} else {
							return newNode;
						}
					};
					return this.replaceInContext(isNode, replacement);
				}

			};

			Param.prototype.children = ['name', 'value'];

			return Param;

		})();

		//### Splat

		// A splat, either as a parameter to a function, an argument to a call,
		// or as part of a destructuring assignment.
		exports.Splat = Splat = (function() {
			class Splat extends Base {
				constructor(name) {
					super();
					this.name = name.compile ? name : new Literal(name);
				}

				isAssignable() {
					return this.name.isAssignable() && (!this.name.isAtomic || this.name.isAtomic());
				}

				assigns(name) {
					return this.name.assigns(name);
				}

				compileNode(o) {
					return [this.makeCode('...'), ...this.name.compileToFragments(o, LEVEL_OP)];
				}

				unwrap() {
					return this.name;
				}

			};

			Splat.prototype.children = ['name'];

			return Splat;

		})();

		//### Expansion

		// Used to skip values inside an array destructuring (pattern matching) or
		// parameter list.
		exports.Expansion = Expansion = (function() {
			class Expansion extends Base {
				compileNode(o) {
					return this.error('Expansion must be used inside a destructuring assignment or parameter list');
				}

				asReference(o) {
					return this;
				}

				eachName(iterator) {}

			};

			Expansion.prototype.shouldCache = NO;

			return Expansion;

		})();

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

			};

			Elision.prototype.isAssignable = YES;

			Elision.prototype.shouldCache = NO;

			return Elision;

		})();

		//### While

		// A while loop, the only sort of low-level loop exposed by CoffeeScript. From
		// it, all other loops can be manufactured. Useful in cases where you need more
		// flexibility or more speed than a comprehension can provide.
		exports.While = While = (function() {
			class While extends Base {
				constructor(condition, options) {
					super();
					this.condition = (options != null ? options.invert : void 0) ? condition.invert() : condition;
					this.guard = options != null ? options.guard : void 0;
				}

				makeReturn(res) {
					if (res) {
						return super.makeReturn(res);
					} else {
						this.returns = !this.jumps();
						return this;
					}
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
					answer = [].concat(this.makeCode(set + this.tab + "while ("), this.condition.compileToFragments(o, LEVEL_PAREN), this.makeCode(") {"), body, this.makeCode("}"));
					if (this.returns) {
						answer.push(this.makeCode(`\n${this.tab}return ${rvar};`));
					}
					return answer;
				}

			};

			While.prototype.children = ['condition', 'guard', 'body'];

			While.prototype.isStatement = YES;

			return While;

		})();

		//### Op

		// Simple Arithmetic and logical operations. Performs some conversion from
		// CoffeeScript operations into their JavaScript equivalents.
		exports.Op = Op = (function() {
			var CONVERSIONS, INVERSIONS;

			class Op extends Base {
				constructor(op, first, second, flip) {
					var firstCall;
					super();
					if (op === 'in') {
						return new In(first, second);
					}
					if (op === 'do') {
						return Op.prototype.generateDo(first);
					}
					if (op === 'new') {
						if ((firstCall = first.unwrap()) instanceof Call && !firstCall.do && !firstCall.isNew) {
							return firstCall.newInstance();
						}
						if (first instanceof Code && first.bound || first.do) {
							first = new Parens(first);
						}
					}
					this.operator = CONVERSIONS[op] || op;
					this.first = first;
					this.second = second;
					this.flip = !!flip;
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

				invert() {
					var allInvertable, curr, fst, op, ref1;
					if (this.isChainable() && this.first.isChainable()) {
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

				compileNode(o) {
					var answer, isChain, lhs, message, ref1, rhs;
					isChain = this.isChainable() && this.first.isChainable();
					if (!isChain) {
						// In chains, there's no need to wrap bare obj literals in parens,
						// as the chained expression is wrapped.
						this.first.front = this.front;
					}
					if (this.operator === 'delete' && o.scope.check(this.first.unwrapAll().value)) {
						this.error('delete operand may not be argument or var');
					}
					if ((ref1 = this.operator) === '--' || ref1 === '++') {
						message = isUnassignable(this.first.unwrapAll().value);
						if (message) {
							this.first.error(message);
						}
					}
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
						case '**':
							return this.compilePower(o);
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
					fragments = fst.concat(this.makeCode(` ${(this.invert ? '&&' : '||')} `), shared.compileToFragments(o), this.makeCode(` ${this.operator} `), this.second.compileToFragments(o, LEVEL_OP));
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
					if ((op === 'new' || op === 'typeof' || op === 'delete') || plusMinus && this.first instanceof Op && this.first.operator === op) {
						parts.push([this.makeCode(' ')]);
					}
					if ((plusMinus && this.first instanceof Op) || (op === 'new' && this.first.isStatement(o))) {
						this.first = new Parens(this.first);
					}
					parts.push(this.first.compileToFragments(o, LEVEL_OP));
					if (this.flip) {
						parts.reverse();
					}
					return this.joinFragmentArrays(parts, '');
				}

				compileContinuation(o) {
					var op, parts, ref1, ref2;
					parts = [];
					op = this.operator;
					if (o.scope.parent == null) {
						this.error(`${this.operator} can only occur inside functions`);
					}
					if (((ref1 = o.scope.method) != null ? ref1.bound : void 0) && o.scope.method.isGenerator) {
						this.error('yield cannot occur inside bound (fat arrow) functions');
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
						if (((ref2 = this.first.base) != null ? ref2.value : void 0) !== '') {
							parts.push([this.makeCode(" ")]);
						}
						parts.push(this.first.compileToFragments(o, LEVEL_OP));
						if (o.level >= LEVEL_PAREN) {
							parts.push([this.makeCode(")")]);
						}
					}
					return this.joinFragmentArrays(parts, '');
				}

				compilePower(o) {
					var pow;
					// Make a Math.pow call
					pow = new Value(new IdentifierLiteral('Math'), [new Access(new PropertyName('pow'))]);
					return new Call(pow, [this.first, this.second]).compileToFragments(o);
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

		})();

		//### In
		exports.In = In = (function() {
			class In extends Base {
				constructor(object, array) {
					super();
					this.object = object;
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

		})();

		//### Try

		// A classic *try/catch/finally* block.
		exports.Try = Try = (function() {
			class Try extends Base {
				constructor(attempt, errorVariable, recovery, ensure) {
					super();
					this.attempt = attempt;
					this.errorVariable = errorVariable;
					this.recovery = recovery;
					this.ensure = ensure;
				}

				jumps(o) {
					var ref1;
					return this.attempt.jumps(o) || ((ref1 = this.recovery) != null ? ref1.jumps(o) : void 0);
				}

				makeReturn(res) {
					if (this.attempt) {
						this.attempt = this.attempt.makeReturn(res);
					}
					if (this.recovery) {
						this.recovery = this.recovery.makeReturn(res);
					}
					return this;
				}

				// Compilation is more or less as you would expect -- the *finally* clause
				// is optional, the *catch* is not.
				compileNode(o) {
					var catchPart, ensurePart, generatedErrorVariableName, message, placeholder, tryPart;
					o.indent += TAB;
					tryPart = this.attempt.compileToFragments(o, LEVEL_TOP);
					catchPart = this.recovery ? (generatedErrorVariableName = o.scope.freeVariable('error', {
						reserve: false
					}), placeholder = new IdentifierLiteral(generatedErrorVariableName), this.errorVariable ? (message = isUnassignable(this.errorVariable.unwrapAll().value), message ? this.errorVariable.error(message) : void 0, this.recovery.unshift(new Assign(this.errorVariable, placeholder))) : void 0, [].concat(this.makeCode(" catch ("), placeholder.compileToFragments(o), this.makeCode(") {\n"), this.recovery.compileToFragments(o, LEVEL_TOP), this.makeCode(`\n${this.tab}}`))) : !(this.ensure || this.recovery) ? (generatedErrorVariableName = o.scope.freeVariable('error', {
						reserve: false
					}), [this.makeCode(` catch (${generatedErrorVariableName}) {}`)]) : [];
					ensurePart = this.ensure ? [].concat(this.makeCode(" finally {\n"), this.ensure.compileToFragments(o, LEVEL_TOP), this.makeCode(`\n${this.tab}}`)) : [];
					return [].concat(this.makeCode(`${this.tab}try {\n`), tryPart, this.makeCode(`\n${this.tab}}`), catchPart, ensurePart);
				}

			};

			Try.prototype.children = ['attempt', 'recovery', 'ensure'];

			Try.prototype.isStatement = YES;

			return Try;

		})();

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

			};

			Throw.prototype.children = ['expression'];

			Throw.prototype.isStatement = YES;

			Throw.prototype.jumps = NO;

			// A **Throw** is already a return, of sorts...
			Throw.prototype.makeReturn = THIS;

			return Throw;

		})();

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
						code = `typeof ${code} ${cmp} "undefined"` + (this.comparisonTarget !== 'undefined' ? ` ${cnj} ${code} ${cmp} ${this.comparisonTarget}` : '');
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

			};

			Existence.prototype.children = ['expression'];

			Existence.prototype.invert = NEGATE;

			return Existence;

		})();

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
					if (expr instanceof Value && expr.isAtomic() && !this.csxAttribute && !shouldWrapComment) {
						expr.front = this.front;
						return expr.compileToFragments(o);
					}
					fragments = expr.compileToFragments(o, LEVEL_PAREN);
					bare = o.level < LEVEL_OP && !shouldWrapComment && (expr instanceof Op || expr.unwrap() instanceof Call || (expr instanceof For && expr.returns)) && (o.level < LEVEL_COND || fragments.length <= 3);
					if (this.csxAttribute) {
						return this.wrapInBraces(fragments);
					}
					if (bare) {
						return fragments;
					} else {
						return this.wrapInParentheses(fragments);
					}
				}

			};

			Parens.prototype.children = ['body'];

			return Parens;

		})();

		//### StringWithInterpolations
		exports.StringWithInterpolations = StringWithInterpolations = (function() {
			class StringWithInterpolations extends Base {
				constructor(body1) {
					super();
					this.body = body1;
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

				compileNode(o) {
					var code, element, elements, expr, fragments, j, len1, salvagedComments, wrapped;
					if (this.csxAttribute) {
						wrapped = new Parens(new StringWithInterpolations(this.body));
						wrapped.csxAttribute = true;
						return wrapped.compileNode(o);
					}
					// Assumes that `expr` is `Value` » `StringLiteral` or `Op`
					expr = this.body.unwrap();
					elements = [];
					salvagedComments = [];
					expr.traverseChildren(false, function(node) {
						var comment, j, k, len1, len2, ref1;
						if (node instanceof StringLiteral) {
							if (node.comments) {
								salvagedComments.push(...node.comments);
								delete node.comments;
							}
							elements.push(node);
							return true;
						} else if (node instanceof Parens) {
							if (salvagedComments.length !== 0) {
								for (j = 0, len1 = salvagedComments.length; j < len1; j++) {
									comment = salvagedComments[j];
									comment.unshift = true;
									comment.newLine = true;
								}
								attachCommentsToNode(salvagedComments, node);
							}
							elements.push(node);
							return false;
						} else if (node.comments) {
							// This node is getting discarded, but salvage its comments.
							if (elements.length !== 0 && !(elements[elements.length - 1] instanceof StringLiteral)) {
								ref1 = node.comments;
								for (k = 0, len2 = ref1.length; k < len2; k++) {
									comment = ref1[k];
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
					fragments = [];
					if (!this.csx) {
						fragments.push(this.makeCode('`'));
					}
					for (j = 0, len1 = elements.length; j < len1; j++) {
						element = elements[j];
						if (element instanceof StringLiteral) {
							element.value = element.unquote(true, this.csx);
							if (!this.csx) {
								// Backticks and `${` inside template literals must be escaped.
								element.value = element.value.replace(/(\\*)(`|\$\{)/g, function(match, backslashes, toBeEscaped) {
									if (backslashes.length % 2 === 0) {
										return `${backslashes}\\${toBeEscaped}`;
									} else {
										return match;
									}
								});
							}
							fragments.push(...element.compileToFragments(o));
						} else {
							if (!this.csx) {
								fragments.push(this.makeCode('$'));
							}
							code = element.compileToFragments(o, LEVEL_PAREN);
							if (!this.isNestedTag(element) || code.some(function(fragment) {
								return fragment.comments != null;
							})) {
								code = this.wrapInBraces(code);
								// Flag the `{` and `}` fragments as having been generated by this
								// `StringWithInterpolations` node, so that `compileComments` knows
								// to treat them as bounds. Don’t trust `fragment.type`, which can
								// report minified variable names when this compiler is minified.
								code[0].isStringWithInterpolations = true;
								code[code.length - 1].isStringWithInterpolations = true;
							}
							fragments.push(...code);
						}
					}
					if (!this.csx) {
						fragments.push(this.makeCode('`'));
					}
					return fragments;
				}

				isNestedTag(element) {
					var call, exprs, ref1;
					exprs = (ref1 = element.body) != null ? ref1.expressions : void 0;
					call = exprs != null ? exprs[0].unwrap() : void 0;
					return this.csx && exprs && exprs.length === 1 && call instanceof Call && call.csx;
				}

			};

			StringWithInterpolations.prototype.children = ['body'];

			return StringWithInterpolations;

		})();

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
					var attribute, j, len1, ref1, ref2, ref3;
					super();
					({source: this.source, guard: this.guard, step: this.step, name: this.name, index: this.index} = source);
					this.body = Block.wrap([body]);
					this.own = source.own != null;
					this.object = source.object != null;
					this.from = source.from != null;
					if (this.from && this.index) {
						this.index.error('cannot use index with for-from');
					}
					if (this.own && !this.object) {
						source.ownTag.error(`cannot use own with for-${(this.from ? 'from' : 'in')}`);
					}
					if (this.object) {
						[this.name, this.index] = [this.index, this.name];
					}
					if (((ref1 = this.index) != null ? typeof ref1.isArray === "function" ? ref1.isArray() : void 0 : void 0) || ((ref2 = this.index) != null ? typeof ref2.isObject === "function" ? ref2.isObject() : void 0 : void 0)) {
						this.index.error('index cannot be a pattern matching expression');
					}
					this.range = this.source instanceof Value && this.source.base instanceof Range && !this.source.properties.length && !this.from;
					this.pattern = this.name instanceof Value;
					if (this.range && this.index) {
						this.index.error('indexes do not apply to range loops');
					}
					if (this.range && this.pattern) {
						this.name.error('cannot pattern match over range loops');
					}
					this.returns = false;
					ref3 = ['source', 'guard', 'step', 'name', 'index'];
					// Move up any comments in the “`for` line”, i.e. the line of code with `for`,
					// from any child nodes of that line up to the `for` node itself so that these
					// comments get output, and get output above the `for` loop.
					for (j = 0, len1 = ref3.length; j < len1; j++) {
						attribute = ref3[j];
						if (!this[attribute]) {
							continue;
						}
						this[attribute].traverseChildren(true, (node) => {
							var comment, k, len2, ref4;
							if (node.comments) {
								ref4 = node.comments;
								for (k = 0, len2 = ref4.length; k < len2; k++) {
									comment = ref4[k];
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
				}

				// Welcome to the hairiest method in all of CoffeeScript. Handles the inner
				// loop, filtering, stepping, and result saving for array, object, and range
				// comprehensions. Some of the generated code can be shared in common, and
				// some cannot.
				compileNode(o) {
					var body, bodyFragments, compare, compareDown, declare, declareDown, defPart, defPartFragments, down, forPartFragments, fragments, guardPart, idt1, increment, index, ivar, kvar, kvarAssign, last, lvar, name, namePart, ref, ref1, resultPart, returnResult, rvar, scope, source, step, stepNum, stepVar, svar, varPart;
					body = Block.wrap([this.body]);
					ref1 = body.expressions, last = ref1[ref1.length - 1];
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
							stepNum = Number(stepVar);
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
							defPart += `${this.tab}${(ref = scope.freeVariable('ref'))} = ${svar};\n`;
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
								increment = `${(kvar !== ivar ? `++${ivar}` : `${ivar}++`)}`;
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
					defPartFragments = [].concat(this.makeCode(defPart), this.pluckDirectCall(o, body));
					if (namePart) {
						varPart = `\n${idt1}${namePart};`;
					}
					if (this.object) {
						forPartFragments = [this.makeCode(`${kvar} in ${svar}`)];
						if (this.own) {
							guardPart = `\n${idt1}if (!${utility('hasProp', o)}.call(${svar}, ${kvar})) continue;`;
						}
					} else if (this.from) {
						forPartFragments = [this.makeCode(`${kvar} of ${svar}`)];
					}
					bodyFragments = body.compileToFragments(merge(o, {
						indent: idt1
					}), LEVEL_TOP);
					if (bodyFragments && bodyFragments.length > 0) {
						bodyFragments = [].concat(this.makeCode('\n'), bodyFragments, this.makeCode('\n'));
					}
					fragments = [];
					if ((defPartFragments != null) && fragmentsToText(defPartFragments) !== '') {
						fragments = fragments.concat(defPartFragments);
					}
					if (resultPart) {
						fragments.push(this.makeCode(resultPart));
					}
					fragments = fragments.concat(this.makeCode(this.tab), this.makeCode('for ('), forPartFragments, this.makeCode(`) {${guardPart}${varPart}`), bodyFragments, this.makeCode(this.tab), this.makeCode('}'));
					if (returnResult) {
						fragments.push(this.makeCode(returnResult));
					}
					return fragments;
				}

				pluckDirectCall(o, body) {
					var base, defs, expr, fn, idx, j, len1, ref, ref1, ref2, ref3, ref4, ref5, ref6, val;
					defs = [];
					ref1 = body.expressions;
					for (idx = j = 0, len1 = ref1.length; j < len1; idx = ++j) {
						expr = ref1[idx];
						expr = expr.unwrapAll();
						if (!(expr instanceof Call)) {
							continue;
						}
						val = (ref2 = expr.variable) != null ? ref2.unwrapAll() : void 0;
						if (!((val instanceof Code) || (val instanceof Value && ((ref3 = val.base) != null ? ref3.unwrapAll() : void 0) instanceof Code && val.properties.length === 1 && ((ref4 = (ref5 = val.properties[0].name) != null ? ref5.value : void 0) === 'call' || ref4 === 'apply')))) {
							continue;
						}
						fn = ((ref6 = val.base) != null ? ref6.unwrapAll() : void 0) || val;
						ref = new IdentifierLiteral(o.scope.freeVariable('fn'));
						base = new Value(ref);
						if (val.base) {
							[val.base, base] = [base, val];
						}
						body.expressions[idx] = new Call(base, expr.args);
						defs = defs.concat(this.makeCode(this.tab), new Assign(ref, fn).compileToFragments(o, LEVEL_TOP), this.makeCode(';\n'));
					}
					return defs;
				}

			};

			For.prototype.children = ['body', 'source', 'guard', 'step'];

			return For;

		})();

		//### Switch

		// A JavaScript *switch* statement. Converts into a returnable expression on-demand.
		exports.Switch = Switch = (function() {
			class Switch extends Base {
				constructor(subject, cases, otherwise) {
					super();
					this.subject = subject;
					this.cases = cases;
					this.otherwise = otherwise;
				}

				jumps(o = {
						block: true
					}) {
					var block, conds, j, jumpNode, len1, ref1, ref2;
					ref1 = this.cases;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						[conds, block] = ref1[j];
						if (jumpNode = block.jumps(o)) {
							return jumpNode;
						}
					}
					return (ref2 = this.otherwise) != null ? ref2.jumps(o) : void 0;
				}

				makeReturn(res) {
					var j, len1, pair, ref1, ref2;
					ref1 = this.cases;
					for (j = 0, len1 = ref1.length; j < len1; j++) {
						pair = ref1[j];
						pair[1].makeReturn(res);
					}
					if (res) {
						this.otherwise || (this.otherwise = new Block([new Literal('void 0')]));
					}
					if ((ref2 = this.otherwise) != null) {
						ref2.makeReturn(res);
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
						[conditions, block] = ref1[i];
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

			};

			Switch.prototype.children = ['subject', 'cases', 'otherwise'];

			Switch.prototype.isStatement = YES;

			return Switch;

		})();

		//### If

		// *If/else* statements. Acts as an expression by pushing down requested returns
		// to the last line of each clause.

		// Single-expression **Ifs** are compiled into conditional operators if possible,
		// because ternaries are already proper expressions, and don’t need conversion.
		exports.If = If = (function() {
			class If extends Base {
				constructor(condition, body1, options = {}) {
					super();
					this.body = body1;
					this.condition = options.type === 'unless' ? condition.invert() : condition;
					this.elseBody = null;
					this.isChain = false;
					({soak: this.soak} = options);
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
					} else {
						this.isChain = elseBody instanceof If;
						this.elseBody = this.ensureBlock(elseBody);
						this.elseBody.updateLocationDataIfMissing(elseBody.locationData);
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

				makeReturn(res) {
					if (res) {
						this.elseBody || (this.elseBody = new Block([new Literal('void 0')]));
					}
					this.body && (this.body = new Block([this.body.makeReturn(res)]));
					this.elseBody && (this.elseBody = new Block([this.elseBody.makeReturn(res)]));
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
						return new If(this.condition.invert(), this.elseBodyNode(), {
							type: 'if'
						}).compileToFragments(o);
					}
					indent = o.indent + TAB;
					cond = this.condition.compileToFragments(o, LEVEL_PAREN);
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
					cond = this.condition.compileToFragments(o, LEVEL_COND);
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

			};

			If.prototype.children = ['condition', 'body', 'elseBody'];

			return If;

		})();

		// Constants
		// ---------
		UTILITIES = {
			modulo: function() {
				return 'function(a, b) { return (+a % (b = +b) + b) % b; }';
			},
			objectWithoutKeys: function() {
				return "function(o, ks) { var res = {}; for (var k in o) ([].indexOf.call(ks, k) < 0 && {}.hasOwnProperty.call(o, k)) && (res[k] = o[k]); return res; }";
			},
			boundMethodCheck: function() {
				return "function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } }";
			},
			_extends: function() {
				return "Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }";
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

		return exports;
	};
	//#endregion

	//#region URL: /coffeescript
	modules['/coffeescript'] = function () {
		var exports = {};
		// CoffeeScript can be used both on the server, as a command-line compiler based
		// on Node.js/V8, or to run CoffeeScript directly in the browser. This module
		// contains the main entry functions for tokenizing, parsing, and compiling
		// source CoffeeScript into JavaScript.
		var FILE_EXTENSIONS, Lexer, SourceMap, base64encode, checkShebangLine, compile, formatSourcePosition, getSourceMap, helpers, lexer, packageJson, parser, sourceMaps, sources, withPrettyErrors,
			indexOf = [].indexOf;

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
		exports.VERSION = /*BT- packageJson.version*/'2.0.3';

		/*BT-
		exports.FILE_EXTENSIONS = FILE_EXTENSIONS = ['.coffee', '.litcoffee', '.coffee.md'];
		*/

		// Expose helpers for testing.
		exports.helpers = helpers;

		/*BT-
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

		/*BT-
		// For each compiled file, save its source in memory in case we need to
		// recompile it later. We might need to recompile if the first compilation
		// didn’t create a source map (faster) but something went wrong and we need
		// a stack trace. Assuming that most of the time, code isn’t throwing
		// exceptions, it’s probably more efficient to compile twice only when we
		// need a stack trace, rather than always generating a source map even when
		// it’s not likely to be used. Save in form of `filename`: [`(source)`]
		sources = {};

		// Also save source maps if generated, in form of `(source)`: [`(source map)`].
		sourceMaps = {};
		*/

		// Compile CoffeeScript code to JavaScript, using the Coffee/Jison compiler.

		// If `options.sourceMap` is specified, then `options.filename` must also be
		// specified. All options that can be passed to `SourceMap#generate` may also
		// be passed here.

		// This returns a javascript string, unless `options.sourceMap` is passed,
		// in which case this returns a `{js, v3SourceMap, sourceMap}`
		// object, where sourceMap is a sourcemap.coffee#SourceMap object, handy for
		// doing programmatic lookups.
		exports.compile = compile = withPrettyErrors(function(code, options = {}) {
			var currentColumn, currentLine, encoded, filename, fragment, fragments, generateSourceMap, header, i, j, js, len, len1, map, newLines, ref, ref1, sourceMapDataURI, sourceURL, token, tokens, transpiler, transpilerOptions, transpilerOutput, v3SourceMap;
			// Clone `options`, to avoid mutating the `options` object passed in.
			options = Object.assign({}, options);
			/*BT-
			// Always generate a source map if no filename is passed in, since without a
			// a filename we have no way to retrieve this source later in the event that
			// we need to recompile it to get a source map for `prepareStackTrace`.
			generateSourceMap = options.sourceMap || options.inlineMap || (options.filename == null);
			filename = options.filename || '<anonymous>';
			checkShebangLine(filename, code);
			if (sources[filename] == null) {
				sources[filename] = [];
			}
			sources[filename].push(code);
			if (generateSourceMap) {
				map = new SourceMap;
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
			fragments = parser.parse(tokens).compileToFragments(options);
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
				if (sourceMaps[filename] == null) {
					sourceMaps[filename] = [];
				}
				sourceMaps[filename].push(map);
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
				sourceURL = `//# sourceURL=${(ref1 = options.filename) != null ? ref1 : 'coffeescript'}`;
				js = `${js}\n${sourceMapDataURI}\n${sourceURL}`;
			}
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
				return parser.parse(lexer.tokenize(source, options));
			} else {
				return parser.parse(source);
			}
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
		lexer = new Lexer;

		// The real Lexer produces a generic stream of tokens. This object provides a
		// thin wrapper around it, compatible with the Jison API. We can then pass it
		// directly as a "Jison lexer".
		parser.lexer = {
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

		getSourceMap = function(filename, line, column) {
			var answer, i, map, ref, ref1, sourceLocation;
			if (!(filename === '<anonymous>' || (ref = filename.slice(filename.lastIndexOf('.')), indexOf.call(FILE_EXTENSIONS, ref) >= 0))) {
				// Skip files that we didn’t compile, like Node system files that appear in
				// the stack trace, as they never have source maps.
				return null;
			}
			if (filename !== '<anonymous>' && (sourceMaps[filename] != null)) {
				return sourceMaps[filename][sourceMaps[filename].length - 1];
			// CoffeeScript compiled in a browser or via `CoffeeScript.compile` or `.run`
			// may get compiled with `options.filename` that’s missing, which becomes
			// `<anonymous>`; but the runtime might request the stack trace with the
			// filename of the script file. See if we have a source map cached under
			// `<anonymous>` that matches the error.
			} else if (sourceMaps['<anonymous>'] != null) {
				ref1 = sourceMaps['<anonymous>'];
				// Work backwards from the most recent anonymous source maps, until we find
				// one that works. This isn’t foolproof; there is a chance that multiple
				// source maps will have line/column pairs that match. But we have no other
				// way to match them. `frame.getFunction().toString()` doesn’t always work,
				// and it’s not foolproof either.
				for (i = ref1.length - 1; i >= 0; i += -1) {
					map = ref1[i];
					sourceLocation = map.sourceLocation([line - 1, column - 1]);
					if (((sourceLocation != null ? sourceLocation[0] : void 0) != null) && (sourceLocation[1] != null)) {
						return map;
					}
				}
			}
			// If all else fails, recompile this source to get a source map. We need the
			// previous section (for `<anonymous>`) despite this option, because after it
			// gets compiled we will still need to look it up from
			// `sourceMaps['<anonymous>']` in order to find and return it. That’s why we
			// start searching from the end in the previous block, because most of the
			// time the source map we want is the last one.
			if (sources[filename] != null) {
				answer = compile(sources[filename][sources[filename].length - 1], {
					filename: filename,
					sourceMap: true,
					literate: helpers.isLiterate(filename)
				});
				return answer.sourceMap;
			} else {
				return null;
			}
		};

		// Based on [michaelficarra/CoffeeScriptRedux](http://goo.gl/ZTx1p)
		// NodeJS / V8 have no support for transforming positions in stack traces using
		// sourceMap, so we must monkey-patch Error to display CoffeeScript source
		// positions.
		Error.prepareStackTrace = function(err, stack) {
			var frame, frames, getSourceMapping;
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
			frames = (function() {
				var i, len, results;
				results = [];
				for (i = 0, len = stack.length; i < len; i++) {
					frame = stack[i];
					if (frame.getFunction() === exports.run) {
						break;
					}
					results.push(`    at ${formatSourcePosition(frame, getSourceMapping)}`);
				}
				return results;
			})();
			return `${err.toString()}\n${frames.join('\n')}\n`;
		};

		checkShebangLine = function(file, input) {
			var args, firstLine, ref, rest;
			firstLine = input.split(/$/m)[0];
			rest = firstLine != null ? firstLine.match(/^#!\s*([^\s]+\s*)(.*)/) : void 0;
			args = rest != null ? (ref = rest[2]) != null ? ref.split(/\s/).filter(function(s) {
				return s !== '';
			}) : void 0 : void 0;
			if ((args != null ? args.length : void 0) > 1) {
				console.error('The script to be run begins with a shebang line with more than one\nargument. This script will fail on platforms such as Linux which only\nallow a single argument.');
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