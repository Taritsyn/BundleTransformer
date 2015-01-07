/*!
 * CoffeeScript Compiler v1.8.0
 * http://coffeescript.org
 *
 * Copyright 2014, Jeremy Ashkenas
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
	  var buildLocationData, extend, flatten, last, repeat, syntaxErrorToString, _ref;

	  exports.starts = function(string, literal, start) {
		return literal === string.substr(start, literal.length);
	  };

	  exports.ends = function(string, literal, back) {
		var len;
		len = literal.length;
		return literal === string.substr(string.length - len - (back || 0), len);
	  };

	  exports.repeat = repeat = function(str, n) {
		var res;
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

	  exports.compact = function(array) {
		var item, _i, _len, _results;
		_results = [];
		for (_i = 0, _len = array.length; _i < _len; _i++) {
		  item = array[_i];
		  if (item) {
			_results.push(item);
		  }
		}
		return _results;
	  };

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

	  exports.merge = function(options, overrides) {
		return extend(extend({}, options), overrides);
	  };

	  extend = exports.extend = function(object, properties) {
		var key, val;
		for (key in properties) {
		  val = properties[key];
		  object[key] = val;
		}
		return object;
	  };

	  exports.flatten = flatten = function(array) {
		var element, flattened, _i, _len;
		flattened = [];
		for (_i = 0, _len = array.length; _i < _len; _i++) {
		  element = array[_i];
		  if (element instanceof Array) {
			flattened = flattened.concat(flatten(element));
		  } else {
			flattened.push(element);
		  }
		}
		return flattened;
	  };

	  exports.del = function(obj, key) {
		var val;
		val = obj[key];
		delete obj[key];
		return val;
	  };

	  exports.last = last = function(array, back) {
		return array[array.length - (back || 0) - 1];
	  };

	  exports.some = (_ref = Array.prototype.some) != null ? _ref : function(fn) {
		var e, _i, _len;
		for (_i = 0, _len = this.length; _i < _len; _i++) {
		  e = this[_i];
		  if (fn(e)) {
			return true;
		  }
		}
		return false;
	  };

	  exports.invertLiterate = function(code) {
		var line, lines, maybe_code;
		maybe_code = true;
		lines = (function() {
		  var _i, _len, _ref1, _results;
		  _ref1 = code.split('\n');
		  _results = [];
		  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
			line = _ref1[_i];
			if (maybe_code && /^([ ]{4}|[ ]{0,3}\t)/.test(line)) {
			  _results.push(line);
			} else if (maybe_code = /^\s*$/.test(line)) {
			  _results.push(line);
			} else {
			  _results.push('# ' + line);
			}
		  }
		  return _results;
		})();
		return lines.join('\n');
	  };

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

	  exports.addLocationDataFn = function(first, last) {
		return function(obj) {
		  if (((typeof obj) === 'object') && (!!obj['updateLocationDataIfMissing'])) {
			obj.updateLocationDataIfMissing(buildLocationData(first, last));
		  }
		  return obj;
		};
	  };

	  exports.locationDataToString = function(obj) {
		var locationData;
		if (("2" in obj) && ("first_line" in obj[2])) {
		  locationData = obj[2];
		} else if ("first_line" in obj) {
		  locationData = obj;
		}
		if (locationData) {
		  return ((locationData.first_line + 1) + ":" + (locationData.first_column + 1) + "-") + ((locationData.last_line + 1) + ":" + (locationData.last_column + 1));
		} else {
		  return "No location data";
		}
	  };

	  exports.baseFileName = function(file, stripExt, useWinPathSep) {
		var parts, pathSep;
		if (stripExt == null) {
		  stripExt = false;
		}
		if (useWinPathSep == null) {
		  useWinPathSep = false;
		}
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

	  exports.isCoffee = function(file) {
		return /\.((lit)?coffee|coffee\.md)$/.test(file);
	  };

	  exports.isLiterate = function(file) {
		return /\.(litcoffee|coffee\.md)$/.test(file);
	  };

	  exports.throwSyntaxError = function(message, location) {
		var error;
		error = new SyntaxError(message);
		error.location = location;
		error.toString = syntaxErrorToString;
		error.stack = error.toString();
		throw error;
	  };

	  exports.updateSyntaxError = function(error, code, filename) {
		if (error.toString === syntaxErrorToString) {
		  error.code || (error.code = code);
		  error.filename || (error.filename = filename);
		  error.stack = error.toString();
		}
		return error;
	  };

	  syntaxErrorToString = function() {
		var codeLine, colorize, colorsEnabled, end, filename, first_column, first_line, last_column, last_line, marker, start, _ref1, _ref2;
		if (!(this.code && this.location)) {
		  return Error.prototype.toString.call(this);
		}
		_ref1 = this.location, first_line = _ref1.first_line, first_column = _ref1.first_column, last_line = _ref1.last_line, last_column = _ref1.last_column;
		if (last_line == null) {
		  last_line = first_line;
		}
		if (last_column == null) {
		  last_column = first_column;
		}
		filename = this.filename || '[stdin]';
		codeLine = this.code.split('\n')[first_line];
		start = first_column;
		end = first_line === last_line ? last_column + 1 : codeLine.length;
		marker = codeLine.slice(0, start).replace(/[^\s]/g, ' ') + repeat('^', end - start);
		if (typeof process !== "undefined" && process !== null) {
		  colorsEnabled = process.stdout.isTTY && !process.env.NODE_DISABLE_COLORS;
		}
		if ((_ref2 = this.colorful) != null ? _ref2 : colorsEnabled) {
		  colorize = function(str) {
			return "\x1B[1;31m" + str + "\x1B[0m";
		  };
		  codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
		  marker = colorize(marker);
		}
		return filename + ":" + (first_line + 1) + ":" + (first_column + 1) + ": error: " + this.message + "\n" + codeLine + "\n" + marker;
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
	  var BALANCED_PAIRS, CALL_CLOSERS, EXPRESSION_CLOSE, EXPRESSION_END, EXPRESSION_START, IMPLICIT_CALL, IMPLICIT_END, IMPLICIT_FUNC, IMPLICIT_UNSPACED_CALL, INVERSES, LINEBREAKS, SINGLE_CLOSERS, SINGLE_LINERS, generate, left, rite, _i, _len, _ref,
		__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
		__slice = [].slice;

	  generate = function(tag, value, origin) {
		var tok;
		tok = [tag, value];
		tok.generated = true;
		if (origin) {
		  tok.origin = origin;
		}
		return tok;
	  };

	  exports.Rewriter = (function() {
		function Rewriter() {}

		Rewriter.prototype.rewrite = function(tokens) {
		  this.tokens = tokens;
		  this.removeLeadingNewlines();
		  this.closeOpenCalls();
		  this.closeOpenIndexes();
		  this.normalizeLines();
		  this.tagPostfixConditionals();
		  this.addImplicitBracesAndParens();
		  this.addLocationDataToGeneratedTokens();
		  return this.tokens;
		};

		Rewriter.prototype.scanTokens = function(block) {
		  var i, token, tokens;
		  tokens = this.tokens;
		  i = 0;
		  while (token = tokens[i]) {
			i += block.call(this, token, i, tokens);
		  }
		  return true;
		};

		Rewriter.prototype.detectEnd = function(i, condition, action) {
		  var levels, token, tokens, _ref, _ref1;
		  tokens = this.tokens;
		  levels = 0;
		  while (token = tokens[i]) {
			if (levels === 0 && condition.call(this, token, i)) {
			  return action.call(this, token, i);
			}
			if (!token || levels < 0) {
			  return action.call(this, token, i - 1);
			}
			if (_ref = token[0], __indexOf.call(EXPRESSION_START, _ref) >= 0) {
			  levels += 1;
			} else if (_ref1 = token[0], __indexOf.call(EXPRESSION_END, _ref1) >= 0) {
			  levels -= 1;
			}
			i += 1;
		  }
		  return i - 1;
		};

		Rewriter.prototype.removeLeadingNewlines = function() {
		  var i, tag, _i, _len, _ref;
		  _ref = this.tokens;
		  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
			tag = _ref[i][0];
			if (tag !== 'TERMINATOR') {
			  break;
			}
		  }
		  if (i) {
			return this.tokens.splice(0, i);
		  }
		};

		Rewriter.prototype.closeOpenCalls = function() {
		  var action, condition;
		  condition = function(token, i) {
			var _ref;
			return ((_ref = token[0]) === ')' || _ref === 'CALL_END') || token[0] === 'OUTDENT' && this.tag(i - 1) === ')';
		  };
		  action = function(token, i) {
			return this.tokens[token[0] === 'OUTDENT' ? i - 1 : i][0] = 'CALL_END';
		  };
		  return this.scanTokens(function(token, i) {
			if (token[0] === 'CALL_START') {
			  this.detectEnd(i + 1, condition, action);
			}
			return 1;
		  });
		};

		Rewriter.prototype.closeOpenIndexes = function() {
		  var action, condition;
		  condition = function(token, i) {
			var _ref;
			return (_ref = token[0]) === ']' || _ref === 'INDEX_END';
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
		};

		Rewriter.prototype.matchTags = function() {
		  var fuzz, i, j, pattern, _i, _ref, _ref1;
		  i = arguments[0], pattern = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		  fuzz = 0;
		  for (j = _i = 0, _ref = pattern.length; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
			while (this.tag(i + j + fuzz) === 'HERECOMMENT') {
			  fuzz += 2;
			}
			if (pattern[j] == null) {
			  continue;
			}
			if (typeof pattern[j] === 'string') {
			  pattern[j] = [pattern[j]];
			}
			if (_ref1 = this.tag(i + j + fuzz), __indexOf.call(pattern[j], _ref1) < 0) {
			  return false;
			}
		  }
		  return true;
		};

		Rewriter.prototype.looksObjectish = function(j) {
		  return this.matchTags(j, '@', null, ':') || this.matchTags(j, null, ':');
		};

		Rewriter.prototype.findTagsBackwards = function(i, tags) {
		  var backStack, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
		  backStack = [];
		  while (i >= 0 && (backStack.length || (_ref2 = this.tag(i), __indexOf.call(tags, _ref2) < 0) && ((_ref3 = this.tag(i), __indexOf.call(EXPRESSION_START, _ref3) < 0) || this.tokens[i].generated) && (_ref4 = this.tag(i), __indexOf.call(LINEBREAKS, _ref4) < 0))) {
			if (_ref = this.tag(i), __indexOf.call(EXPRESSION_END, _ref) >= 0) {
			  backStack.push(this.tag(i));
			}
			if ((_ref1 = this.tag(i), __indexOf.call(EXPRESSION_START, _ref1) >= 0) && backStack.length) {
			  backStack.pop();
			}
			i -= 1;
		  }
		  return _ref5 = this.tag(i), __indexOf.call(tags, _ref5) >= 0;
		};

		Rewriter.prototype.addImplicitBracesAndParens = function() {
		  var stack;
		  stack = [];
		  return this.scanTokens(function(token, i, tokens) {
			var endImplicitCall, endImplicitObject, forward, inImplicit, inImplicitCall, inImplicitControl, inImplicitObject, newLine, nextTag, offset, prevTag, prevToken, s, sameLine, stackIdx, stackTag, stackTop, startIdx, startImplicitCall, startImplicitObject, startsLine, tag, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
			tag = token[0];
			prevTag = (prevToken = i > 0 ? tokens[i - 1] : [])[0];
			nextTag = (i < tokens.length - 1 ? tokens[i + 1] : [])[0];
			stackTop = function() {
			  return stack[stack.length - 1];
			};
			startIdx = i;
			forward = function(n) {
			  return i - startIdx + n;
			};
			inImplicit = function() {
			  var _ref, _ref1;
			  return (_ref = stackTop()) != null ? (_ref1 = _ref[2]) != null ? _ref1.ours : void 0 : void 0;
			};
			inImplicitCall = function() {
			  var _ref;
			  return inImplicit() && ((_ref = stackTop()) != null ? _ref[0] : void 0) === '(';
			};
			inImplicitObject = function() {
			  var _ref;
			  return inImplicit() && ((_ref = stackTop()) != null ? _ref[0] : void 0) === '{';
			};
			inImplicitControl = function() {
			  var _ref;
			  return inImplicit && ((_ref = stackTop()) != null ? _ref[0] : void 0) === 'CONTROL';
			};
			startImplicitCall = function(j) {
			  var idx;
			  idx = j != null ? j : i;
			  stack.push([
				'(', idx, {
				  ours: true
				}
			  ]);
			  tokens.splice(idx, 0, generate('CALL_START', '('));
			  if (j == null) {
				return i += 1;
			  }
			};
			endImplicitCall = function() {
			  stack.pop();
			  tokens.splice(i, 0, generate('CALL_END', ')'));
			  return i += 1;
			};
			startImplicitObject = function(j, startsLine) {
			  var idx;
			  if (startsLine == null) {
				startsLine = true;
			  }
			  idx = j != null ? j : i;
			  stack.push([
				'{', idx, {
				  sameLine: true,
				  startsLine: startsLine,
				  ours: true
				}
			  ]);
			  tokens.splice(idx, 0, generate('{', generate(new String('{')), token));
			  if (j == null) {
				return i += 1;
			  }
			};
			endImplicitObject = function(j) {
			  j = j != null ? j : i;
			  stack.pop();
			  tokens.splice(j, 0, generate('}', '}', token));
			  return i += 1;
			};
			if (inImplicitCall() && (tag === 'IF' || tag === 'TRY' || tag === 'FINALLY' || tag === 'CATCH' || tag === 'CLASS' || tag === 'SWITCH')) {
			  stack.push([
				'CONTROL', i, {
				  ours: true
				}
			  ]);
			  return forward(1);
			}
			if (tag === 'INDENT' && inImplicit()) {
			  if (prevTag !== '=>' && prevTag !== '->' && prevTag !== '[' && prevTag !== '(' && prevTag !== ',' && prevTag !== '{' && prevTag !== 'TRY' && prevTag !== 'ELSE' && prevTag !== '=') {
				while (inImplicitCall()) {
				  endImplicitCall();
				}
			  }
			  if (inImplicitControl()) {
				stack.pop();
			  }
			  stack.push([tag, i]);
			  return forward(1);
			}
			if (__indexOf.call(EXPRESSION_START, tag) >= 0) {
			  stack.push([tag, i]);
			  return forward(1);
			}
			if (__indexOf.call(EXPRESSION_END, tag) >= 0) {
			  while (inImplicit()) {
				if (inImplicitCall()) {
				  endImplicitCall();
				} else if (inImplicitObject()) {
				  endImplicitObject();
				} else {
				  stack.pop();
				}
			  }
			  stack.pop();
			}
			if ((__indexOf.call(IMPLICIT_FUNC, tag) >= 0 && token.spaced && !token.stringEnd || tag === '?' && i > 0 && !tokens[i - 1].spaced) && (__indexOf.call(IMPLICIT_CALL, nextTag) >= 0 || __indexOf.call(IMPLICIT_UNSPACED_CALL, nextTag) >= 0 && !((_ref = tokens[i + 1]) != null ? _ref.spaced : void 0) && !((_ref1 = tokens[i + 1]) != null ? _ref1.newLine : void 0))) {
			  if (tag === '?') {
				tag = token[0] = 'FUNC_EXIST';
			  }
			  startImplicitCall(i + 1);
			  return forward(2);
			}
			if (__indexOf.call(IMPLICIT_FUNC, tag) >= 0 && this.matchTags(i + 1, 'INDENT', null, ':') && !this.findTagsBackwards(i, ['CLASS', 'EXTENDS', 'IF', 'CATCH', 'SWITCH', 'LEADING_WHEN', 'FOR', 'WHILE', 'UNTIL'])) {
			  startImplicitCall(i + 1);
			  stack.push(['INDENT', i + 2]);
			  return forward(3);
			}
			if (tag === ':') {
			  if (this.tag(i - 2) === '@') {
				s = i - 2;
			  } else {
				s = i - 1;
			  }
			  while (this.tag(s - 2) === 'HERECOMMENT') {
				s -= 2;
			  }
			  this.insideForDeclaration = nextTag === 'FOR';
			  startsLine = s === 0 || (_ref2 = this.tag(s - 1), __indexOf.call(LINEBREAKS, _ref2) >= 0) || tokens[s - 1].newLine;
			  if (stackTop()) {
				_ref3 = stackTop(), stackTag = _ref3[0], stackIdx = _ref3[1];
				if ((stackTag === '{' || stackTag === 'INDENT' && this.tag(stackIdx - 1) === '{') && (startsLine || this.tag(s - 1) === ',' || this.tag(s - 1) === '{')) {
				  return forward(1);
				}
			  }
			  startImplicitObject(s, !!startsLine);
			  return forward(2);
			}
			if (inImplicitObject() && __indexOf.call(LINEBREAKS, tag) >= 0) {
			  stackTop()[2].sameLine = false;
			}
			newLine = prevTag === 'OUTDENT' || prevToken.newLine;
			if (__indexOf.call(IMPLICIT_END, tag) >= 0 || __indexOf.call(CALL_CLOSERS, tag) >= 0 && newLine) {
			  while (inImplicit()) {
				_ref4 = stackTop(), stackTag = _ref4[0], stackIdx = _ref4[1], (_ref5 = _ref4[2], sameLine = _ref5.sameLine, startsLine = _ref5.startsLine);
				if (inImplicitCall() && prevTag !== ',') {
				  endImplicitCall();
				} else if (inImplicitObject() && !this.insideForDeclaration && sameLine && tag !== 'TERMINATOR' && prevTag !== ':' && endImplicitObject()) {

				} else if (inImplicitObject() && tag === 'TERMINATOR' && prevTag !== ',' && !(startsLine && this.looksObjectish(i + 1))) {
				  endImplicitObject();
				} else {
				  break;
				}
			  }
			}
			if (tag === ',' && !this.looksObjectish(i + 1) && inImplicitObject() && !this.insideForDeclaration && (nextTag !== 'TERMINATOR' || !this.looksObjectish(i + 2))) {
			  offset = nextTag === 'OUTDENT' ? 1 : 0;
			  while (inImplicitObject()) {
				endImplicitObject(i + offset);
			  }
			}
			return forward(1);
		  });
		};

		Rewriter.prototype.addLocationDataToGeneratedTokens = function() {
		  return this.scanTokens(function(token, i, tokens) {
			var column, line, nextLocation, prevLocation, _ref, _ref1;
			if (token[2]) {
			  return 1;
			}
			if (!(token.generated || token.explicit)) {
			  return 1;
			}
			if (token[0] === '{' && (nextLocation = (_ref = tokens[i + 1]) != null ? _ref[2] : void 0)) {
			  line = nextLocation.first_line, column = nextLocation.first_column;
			} else if (prevLocation = (_ref1 = tokens[i - 1]) != null ? _ref1[2] : void 0) {
			  line = prevLocation.last_line, column = prevLocation.last_column;
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
		};

		Rewriter.prototype.normalizeLines = function() {
		  var action, condition, indent, outdent, starter;
		  starter = indent = outdent = null;
		  condition = function(token, i) {
			var _ref, _ref1, _ref2, _ref3;
			return token[1] !== ';' && (_ref = token[0], __indexOf.call(SINGLE_CLOSERS, _ref) >= 0) && !(token[0] === 'TERMINATOR' && (_ref1 = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref1) >= 0)) && !(token[0] === 'ELSE' && starter !== 'THEN') && !(((_ref2 = token[0]) === 'CATCH' || _ref2 === 'FINALLY') && (starter === '->' || starter === '=>')) || (_ref3 = token[0], __indexOf.call(CALL_CLOSERS, _ref3) >= 0) && this.tokens[i - 1].newLine;
		  };
		  action = function(token, i) {
			return this.tokens.splice((this.tag(i - 1) === ',' ? i - 1 : i), 0, outdent);
		  };
		  return this.scanTokens(function(token, i, tokens) {
			var j, tag, _i, _ref, _ref1, _ref2;
			tag = token[0];
			if (tag === 'TERMINATOR') {
			  if (this.tag(i + 1) === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
				tokens.splice.apply(tokens, [i, 1].concat(__slice.call(this.indentation())));
				return 1;
			  }
			  if (_ref = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref) >= 0) {
				tokens.splice(i, 1);
				return 0;
			  }
			}
			if (tag === 'CATCH') {
			  for (j = _i = 1; _i <= 2; j = ++_i) {
				if (!((_ref1 = this.tag(i + j)) === 'OUTDENT' || _ref1 === 'TERMINATOR' || _ref1 === 'FINALLY')) {
				  continue;
				}
				tokens.splice.apply(tokens, [i + j, 0].concat(__slice.call(this.indentation())));
				return 2 + j;
			  }
			}
			if (__indexOf.call(SINGLE_LINERS, tag) >= 0 && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF')) {
			  starter = tag;
			  _ref2 = this.indentation(tokens[i]), indent = _ref2[0], outdent = _ref2[1];
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
		};

		Rewriter.prototype.tagPostfixConditionals = function() {
		  var action, condition, original;
		  original = null;
		  condition = function(token, i) {
			var prevTag, tag;
			tag = token[0];
			prevTag = this.tokens[i - 1][0];
			return tag === 'TERMINATOR' || (tag === 'INDENT' && __indexOf.call(SINGLE_LINERS, prevTag) < 0);
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
		};

		Rewriter.prototype.indentation = function(origin) {
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
		};

		Rewriter.prototype.generate = generate;

		Rewriter.prototype.tag = function(i) {
		  var _ref;
		  return (_ref = this.tokens[i]) != null ? _ref[0] : void 0;
		};

		return Rewriter;

	  })();

	  BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END']];

	  exports.INVERSES = INVERSES = {};

	  EXPRESSION_START = [];

	  EXPRESSION_END = [];

	  for (_i = 0, _len = BALANCED_PAIRS.length; _i < _len; _i++) {
		_ref = BALANCED_PAIRS[_i], left = _ref[0], rite = _ref[1];
		EXPRESSION_START.push(INVERSES[rite] = left);
		EXPRESSION_END.push(INVERSES[left] = rite);
	  }

	  EXPRESSION_CLOSE = ['CATCH', 'THEN', 'ELSE', 'FINALLY'].concat(EXPRESSION_END);

	  IMPLICIT_FUNC = ['IDENTIFIER', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS'];

	  IMPLICIT_CALL = ['IDENTIFIER', 'NUMBER', 'STRING', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'NULL', 'UNDEFINED', 'UNARY', 'YIELD', 'UNARY_MATH', 'SUPER', 'THROW', '@', '->', '=>', '[', '(', '{', '--', '++'];

	  IMPLICIT_UNSPACED_CALL = ['+', '-'];

	  IMPLICIT_END = ['POST_IF', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR'];

	  SINGLE_LINERS = ['ELSE', '->', '=>', 'TRY', 'FINALLY', 'THEN'];

	  SINGLE_CLOSERS = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN'];

	  LINEBREAKS = ['TERMINATOR', 'INDENT', 'OUTDENT'];

	  CALL_CLOSERS = ['.', '?.', '::', '?::'];
  
	  return exports;
	};
	//#endregion

	//#region URL: /lexer
	modules['/lexer'] = function () {
	  var exports = {};
	  var BOM, BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HERECOMMENT_ILLEGAL, HEREDOC_DOUBLE, HEREDOC_INDENT, HEREDOC_SINGLE, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDENTABLE_CLOSERS, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LEADING_BLANK_LINE, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NOT_SPACED_REGEX, NUMBER, OCTAL_ESCAPE, OPERATOR, REGEX, REGEX_FLAGS, REGEX_ILLEGAL, RELATION, RESERVED, Rewriter, SHIFT, STRICT_PROSCRIBED, STRING_DOUBLE, STRING_OMIT, STRING_SINGLE, STRING_START, TRAILING_BLANK_LINE, TRAILING_SPACES, UNARY, UNARY_MATH, VALID_FLAGS, WHITESPACE, compact, count, invertLiterate, key, last, locationDataToString, repeat, starts, throwSyntaxError, _ref, _ref1,
		__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

	  _ref = require('/rewriter'), Rewriter = _ref.Rewriter, INVERSES = _ref.INVERSES;

	  _ref1 = require('/helpers'), count = _ref1.count, starts = _ref1.starts, compact = _ref1.compact, last = _ref1.last, repeat = _ref1.repeat, invertLiterate = _ref1.invertLiterate, locationDataToString = _ref1.locationDataToString, throwSyntaxError = _ref1.throwSyntaxError;

	  exports.Lexer = Lexer = (function() {
		function Lexer() {}

		Lexer.prototype.tokenize = function(code, opts) {
		  var consumed, end, i, _ref2;
		  if (opts == null) {
			opts = {};
		  }
		  this.literate = opts.literate;
		  this.indent = 0;
		  this.baseIndent = 0;
		  this.indebt = 0;
		  this.outdebt = 0;
		  this.indents = [];
		  this.ends = [];
		  this.tokens = [];
		  this.chunkLine = opts.line || 0;
		  this.chunkColumn = opts.column || 0;
		  code = this.clean(code);
		  i = 0;
		  while (this.chunk = code.slice(i)) {
			consumed = this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
			_ref2 = this.getLineAndColumnFromChunk(consumed), this.chunkLine = _ref2[0], this.chunkColumn = _ref2[1];
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
			throwSyntaxError("missing " + end.tag, end.origin[2]);
		  }
		  if (opts.rewrite === false) {
			return this.tokens;
		  }
		  return (new Rewriter).rewrite(this.tokens);
		};

		Lexer.prototype.clean = function(code) {
		  if (code.charCodeAt(0) === BOM) {
			code = code.slice(1);
		  }
		  code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
		  if (WHITESPACE.test(code)) {
			code = "\n" + code;
			this.chunkLine--;
		  }
		  if (this.literate) {
			code = invertLiterate(code);
		  }
		  return code;
		};

		Lexer.prototype.identifierToken = function() {
		  var colon, colonOffset, forcedIdentifier, id, idLength, input, match, poppedToken, prev, tag, tagToken, _ref2, _ref3, _ref4;
		  if (!(match = IDENTIFIER.exec(this.chunk))) {
			return 0;
		  }
		  input = match[0], id = match[1], colon = match[2];
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
		  forcedIdentifier = colon || (prev = last(this.tokens)) && (((_ref2 = prev[0]) === '.' || _ref2 === '?.' || _ref2 === '::' || _ref2 === '?::') || !prev.spaced && prev[0] === '@');
		  tag = 'IDENTIFIER';
		  if (!forcedIdentifier && (__indexOf.call(JS_KEYWORDS, id) >= 0 || __indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
			tag = id.toUpperCase();
			if (tag === 'WHEN' && (_ref3 = this.tag(), __indexOf.call(LINE_BREAK, _ref3) >= 0)) {
			  tag = 'LEADING_WHEN';
			} else if (tag === 'FOR') {
			  this.seenFor = true;
			} else if (tag === 'UNLESS') {
			  tag = 'IF';
			} else if (__indexOf.call(UNARY, tag) >= 0) {
			  tag = 'UNARY';
			} else if (__indexOf.call(RELATION, tag) >= 0) {
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
		  }
		  if (__indexOf.call(JS_FORBIDDEN, id) >= 0) {
			if (forcedIdentifier) {
			  tag = 'IDENTIFIER';
			  id = new String(id);
			  id.reserved = true;
			} else if (__indexOf.call(RESERVED, id) >= 0) {
			  this.error("reserved word \"" + id + "\"");
			}
		  }
		  if (!forcedIdentifier) {
			if (__indexOf.call(COFFEE_ALIASES, id) >= 0) {
			  id = COFFEE_ALIAS_MAP[id];
			}
			tag = (function() {
			  switch (id) {
				case '!':
				  return 'UNARY';
				case '==':
				case '!=':
				  return 'COMPARE';
				case '&&':
				case '||':
				  return 'LOGIC';
				case 'true':
				case 'false':
				  return 'BOOL';
				case 'break':
				case 'continue':
				  return 'STATEMENT';
				default:
				  return tag;
			  }
			})();
		  }
		  tagToken = this.token(tag, id, 0, idLength);
		  if (poppedToken) {
			_ref4 = [poppedToken[2].first_line, poppedToken[2].first_column], tagToken[2].first_line = _ref4[0], tagToken[2].first_column = _ref4[1];
		  }
		  if (colon) {
			colonOffset = input.lastIndexOf(':');
			this.token(':', ':', colonOffset, colon.length);
		  }
		  return input.length;
		};

		Lexer.prototype.numberToken = function() {
		  var binaryLiteral, lexedLength, match, number, octalLiteral;
		  if (!(match = NUMBER.exec(this.chunk))) {
			return 0;
		  }
		  number = match[0];
		  if (/^0[BOX]/.test(number)) {
			this.error("radix prefix '" + number + "' must be lowercase");
		  } else if (/E/.test(number) && !/^0x/.test(number)) {
			this.error("exponential notation '" + number + "' must be indicated with a lowercase 'e'");
		  } else if (/^0\d*[89]/.test(number)) {
			this.error("decimal literal '" + number + "' must not be prefixed with '0'");
		  } else if (/^0\d+/.test(number)) {
			this.error("octal literal '" + number + "' must be prefixed with '0o'");
		  }
		  lexedLength = number.length;
		  if (octalLiteral = /^0o([0-7]+)/.exec(number)) {
			number = '0x' + parseInt(octalLiteral[1], 8).toString(16);
		  }
		  if (binaryLiteral = /^0b([01]+)/.exec(number)) {
			number = '0x' + parseInt(binaryLiteral[1], 2).toString(16);
		  }
		  this.token('NUMBER', number, 0, lexedLength);
		  return lexedLength;
		};

		Lexer.prototype.stringToken = function() {
		  var $, attempt, doc, end, heredoc, i, indent, indentRegex, match, quote, regex, start, token, tokens, _ref2, _ref3;
		  quote = (STRING_START.exec(this.chunk) || [])[0];
		  if (!quote) {
			return 0;
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
		  start = quote.length;
		  _ref2 = this.matchWithInterpolations(this.chunk.slice(start), regex, quote, start), tokens = _ref2.tokens, end = _ref2.index;
		  $ = tokens.length - 1;
		  if (heredoc) {
			indent = null;
			doc = ((function() {
			  var _i, _len, _results;
			  _results = [];
			  for (i = _i = 0, _len = tokens.length; _i < _len; i = ++_i) {
				token = tokens[i];
				if (token[0] === 'NEOSTRING') {
				  _results.push(token[1]);
				}
			  }
			  return _results;
			})()).join('#{}');
			while (match = HEREDOC_INDENT.exec(doc)) {
			  attempt = match[1];
			  if (indent === null || (0 < (_ref3 = attempt.length) && _ref3 < indent.length)) {
				indent = attempt;
			  }
			}
			if (indent) {
			  indentRegex = RegExp("^" + indent, "gm");
			}
			this.mergeInterpolationTokens(tokens, {
			  quote: quote[0],
			  start: start,
			  end: end
			}, (function(_this) {
			  return function(value, i) {
				value = _this.formatString(value);
				if (i === 0) {
				  value = value.replace(LEADING_BLANK_LINE, '');
				}
				if (i === $) {
				  value = value.replace(TRAILING_BLANK_LINE, '');
				}
				value = value.replace(indentRegex, '');
				value = value.replace(MULTILINER, '\\n');
				return value;
			  };
			})(this));
		  } else {
			this.mergeInterpolationTokens(tokens, {
			  quote: quote,
			  start: start,
			  end: end
			}, (function(_this) {
			  return function(value, i) {
				value = _this.formatString(value);
				value = value.replace(STRING_OMIT, function(match, offset) {
				  if ((i === 0 && offset === 0) || (i === $ && offset + match.length === value.length)) {
					return '';
				  } else {
					return ' ';
				  }
				});
				return value;
			  };
			})(this));
		  }
		  return end;
		};

		Lexer.prototype.commentToken = function() {
		  var comment, here, match;
		  if (!(match = this.chunk.match(COMMENT))) {
			return 0;
		  }
		  comment = match[0], here = match[1];
		  if (here) {
			if (match = HERECOMMENT_ILLEGAL.exec(comment)) {
			  this.error("block comments cannot contain " + match[0], match.index);
			}
			if (here.indexOf('\n') >= 0) {
			  here = here.replace(RegExp("\\n" + (repeat(' ', this.indent)), "g"), '\n');
			}
			this.token('HERECOMMENT', here, 0, comment.length);
		  }
		  return comment.length;
		};

		Lexer.prototype.jsToken = function() {
		  var match, script;
		  if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
			return 0;
		  }
		  this.token('JS', (script = match[0]).slice(1, -1), 0, script.length);
		  return script.length;
		};

		Lexer.prototype.regexToken = function() {
		  var end, flags, index, match, prev, re, regex, tokens, _ref2, _ref3;
		  switch (false) {
			case !(match = REGEX_ILLEGAL.exec(this.chunk)):
			  this.error("regular expressions cannot begin with " + match[2], match.index + match[1].length);
			  break;
			case this.chunk.slice(0, 3) !== '///':
			  _ref2 = this.matchWithInterpolations(this.chunk.slice(3), HEREGEX, '///', 3), tokens = _ref2.tokens, index = _ref2.index;
			  break;
			case !(match = REGEX.exec(this.chunk)):
			  regex = match[0];
			  index = regex.length;
			  prev = last(this.tokens);
			  if (prev && (_ref3 = prev[0], __indexOf.call((prev.spaced ? NOT_REGEX : NOT_SPACED_REGEX), _ref3) >= 0)) {
				return 0;
			  }
			  break;
			default:
			  return 0;
		  }
		  flags = REGEX_FLAGS.exec(this.chunk.slice(index))[0];
		  end = index + flags.length;
		  switch (false) {
			case !!VALID_FLAGS.test(flags):
			  this.error("invalid regular expression flags " + flags, index);
			  break;
			case !regex:
			  this.token('REGEX', "" + regex + flags);
			  break;
			case tokens.length !== 1:
			  re = this.formatHeregex(tokens[0][1]).replace(/\//g, '\\/');
			  this.token('REGEX', "/" + (re || '(?:)') + "/" + flags);
			  break;
			default:
			  this.token('IDENTIFIER', 'RegExp', 0, 0);
			  this.token('CALL_START', '(', 0, 0);
			  this.mergeInterpolationTokens(tokens, {
				quote: '"',
				start: 3,
				end: end
			  }, (function(_this) {
				return function(value) {
				  return _this.formatHeregex(value).replace(/\\/g, '\\\\');
				};
			  })(this));
			  if (flags) {
				this.token(',', ',', index, 0);
				this.token('STRING', '"' + flags + '"', index, flags.length);
			  }
			  this.token(')', ')', end, 0);
		  }
		  return end;
		};

		Lexer.prototype.lineToken = function() {
		  var diff, indent, match, noNewlines, size;
		  if (!(match = MULTI_DENT.exec(this.chunk))) {
			return 0;
		  }
		  indent = match[0];
		  this.seenFor = false;
		  size = indent.length - 1 - indent.lastIndexOf('\n');
		  noNewlines = this.unfinished();
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
		  } else if (size < this.baseIndent) {
			this.error('missing indentation', indent.length);
		  } else {
			this.indebt = 0;
			this.outdentToken(this.indent - size, noNewlines, indent.length);
		  }
		  return indent.length;
		};

		Lexer.prototype.outdentToken = function(moveOut, noNewlines, outdentLength) {
		  var decreasedIndent, dent, lastIndent, _ref2;
		  decreasedIndent = this.indent - moveOut;
		  while (moveOut > 0) {
			lastIndent = this.indents[this.indents.length - 1];
			if (!lastIndent) {
			  moveOut = 0;
			} else if (lastIndent === this.outdebt) {
			  moveOut -= this.outdebt;
			  this.outdebt = 0;
			} else if (lastIndent < this.outdebt) {
			  this.outdebt -= lastIndent;
			  moveOut -= lastIndent;
			} else {
			  dent = this.indents.pop() + this.outdebt;
			  if (outdentLength && (_ref2 = this.chunk[outdentLength], __indexOf.call(INDENTABLE_CLOSERS, _ref2) >= 0)) {
				decreasedIndent -= dent - moveOut;
				moveOut = dent;
			  }
			  this.outdebt = 0;
			  this.pair('OUTDENT');
			  this.token('OUTDENT', moveOut, 0, outdentLength);
			  moveOut -= dent;
			}
		  }
		  if (dent) {
			this.outdebt -= moveOut;
		  }
		  while (this.value() === ';') {
			this.tokens.pop();
		  }
		  if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
			this.token('TERMINATOR', '\n', outdentLength, 0);
		  }
		  this.indent = decreasedIndent;
		  return this;
		};

		Lexer.prototype.whitespaceToken = function() {
		  var match, nline, prev;
		  if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === '\n'))) {
			return 0;
		  }
		  prev = last(this.tokens);
		  if (prev) {
			prev[match ? 'spaced' : 'newLine'] = true;
		  }
		  if (match) {
			return match[0].length;
		  } else {
			return 0;
		  }
		};

		Lexer.prototype.newlineToken = function(offset) {
		  while (this.value() === ';') {
			this.tokens.pop();
		  }
		  if (this.tag() !== 'TERMINATOR') {
			this.token('TERMINATOR', '\n', offset, 0);
		  }
		  return this;
		};

		Lexer.prototype.suppressNewlines = function() {
		  if (this.value() === '\\') {
			this.tokens.pop();
		  }
		  return this;
		};

		Lexer.prototype.literalToken = function() {
		  var match, prev, tag, token, value, _ref2, _ref3, _ref4, _ref5;
		  if (match = OPERATOR.exec(this.chunk)) {
			value = match[0];
			if (CODE.test(value)) {
			  this.tagParameters();
			}
		  } else {
			value = this.chunk.charAt(0);
		  }
		  tag = value;
		  prev = last(this.tokens);
		  if (value === '=' && prev) {
			if (!prev[1].reserved && (_ref2 = prev[1], __indexOf.call(JS_FORBIDDEN, _ref2) >= 0)) {
			  this.error("reserved word \"" + (this.value()) + "\" can't be assigned");
			}
			if ((_ref3 = prev[1]) === '||' || _ref3 === '&&') {
			  prev[0] = 'COMPOUND_ASSIGN';
			  prev[1] += '=';
			  return value.length;
			}
		  }
		  if (value === ';') {
			this.seenFor = false;
			tag = 'TERMINATOR';
		  } else if (__indexOf.call(MATH, value) >= 0) {
			tag = 'MATH';
		  } else if (__indexOf.call(COMPARE, value) >= 0) {
			tag = 'COMPARE';
		  } else if (__indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
			tag = 'COMPOUND_ASSIGN';
		  } else if (__indexOf.call(UNARY, value) >= 0) {
			tag = 'UNARY';
		  } else if (__indexOf.call(UNARY_MATH, value) >= 0) {
			tag = 'UNARY_MATH';
		  } else if (__indexOf.call(SHIFT, value) >= 0) {
			tag = 'SHIFT';
		  } else if (__indexOf.call(LOGIC, value) >= 0 || value === '?' && (prev != null ? prev.spaced : void 0)) {
			tag = 'LOGIC';
		  } else if (prev && !prev.spaced) {
			if (value === '(' && (_ref4 = prev[0], __indexOf.call(CALLABLE, _ref4) >= 0)) {
			  if (prev[0] === '?') {
				prev[0] = 'FUNC_EXIST';
			  }
			  tag = 'CALL_START';
			} else if (value === '[' && (_ref5 = prev[0], __indexOf.call(INDEXABLE, _ref5) >= 0)) {
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
		  this.tokens.push(token);
		  return value.length;
		};

		Lexer.prototype.tagParameters = function() {
		  var i, stack, tok, tokens;
		  if (this.tag() !== ')') {
			return this;
		  }
		  stack = [];
		  tokens = this.tokens;
		  i = tokens.length;
		  tokens[--i][0] = 'PARAM_END';
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
				  return this;
				}
			}
		  }
		  return this;
		};

		Lexer.prototype.closeIndentation = function() {
		  return this.outdentToken(this.indent);
		};

		Lexer.prototype.matchWithInterpolations = function(str, regex, end, offsetInChunk) {
		  var column, index, line, nested, strPart, tokens, _ref2, _ref3, _ref4;
		  tokens = [];
		  while (true) {
			strPart = regex.exec(str)[0];
			tokens.push(this.makeToken('NEOSTRING', strPart, offsetInChunk));
			str = str.slice(strPart.length);
			offsetInChunk += strPart.length;
			if (str.slice(0, 2) !== '#{') {
			  break;
			}
			_ref2 = this.getLineAndColumnFromChunk(offsetInChunk + 1), line = _ref2[0], column = _ref2[1];
			_ref3 = new Lexer().tokenize(str.slice(1), {
			  line: line,
			  column: column,
			  untilBalanced: true
			}), nested = _ref3.tokens, index = _ref3.index;
			index += 1;
			nested.shift();
			nested.pop();
			if (((_ref4 = nested[0]) != null ? _ref4[0] : void 0) === 'TERMINATOR') {
			  nested.shift();
			}
			if (nested.length > 1) {
			  nested.unshift(this.makeToken('(', '(', offsetInChunk + 1, 0));
			  nested.push(this.makeToken(')', ')', offsetInChunk + 1 + index, 0));
			}
			tokens.push(['TOKENS', nested]);
			str = str.slice(index);
			offsetInChunk += index;
		  }
		  if (str.slice(0, end.length) !== end) {
			this.error("missing " + end);
		  }
		  return {
			tokens: tokens,
			index: offsetInChunk + end.length
		  };
		};

		Lexer.prototype.mergeInterpolationTokens = function(tokens, _arg, fn) {
		  var converted, end, errorToken, firstEmptyStringIndex, firstIndex, i, interpolated, locationToken, plusToken, quote, rparen, start, tag, token, tokensToPush, value, _i, _len, _ref2;
		  quote = _arg.quote, start = _arg.start, end = _arg.end;
		  if (interpolated = tokens.length > 1) {
			errorToken = this.makeToken('', 'interpolation', start + tokens[0][1].length, 2);
			this.token('(', '(', 0, 0, errorToken);
		  }
		  firstIndex = this.tokens.length;
		  for (i = _i = 0, _len = tokens.length; _i < _len; i = ++_i) {
			token = tokens[i];
			tag = token[0], value = token[1];
			switch (tag) {
			  case 'TOKENS':
				if (value.length === 0) {
				  continue;
				}
				locationToken = value[0];
				tokensToPush = value;
				break;
			  case 'NEOSTRING':
				converted = fn(token[1], i);
				if (converted.length === 0) {
				  if (i === 0) {
					firstEmptyStringIndex = this.tokens.length;
				  } else {
					continue;
				  }
				}
				if (i === 2 && (firstEmptyStringIndex != null)) {
				  this.tokens.splice(firstEmptyStringIndex, 2);
				}
				token[0] = 'STRING';
				token[1] = this.makeString(converted, quote);
				locationToken = token;
				tokensToPush = [token];
			}
			if (this.tokens.length > firstIndex) {
			  plusToken = this.token('+', '+');
			  plusToken[2] = {
				first_line: locationToken[2].first_line,
				first_column: locationToken[2].first_column,
				last_line: locationToken[2].first_line,
				last_column: locationToken[2].first_column
			  };
			}
			(_ref2 = this.tokens).push.apply(_ref2, tokensToPush);
		  }
		  if (interpolated) {
			rparen = this.token(')', ')', end, 0);
			return rparen.stringEnd = true;
		  }
		};

		Lexer.prototype.pair = function(tag) {
		  var wanted, _ref2;
		  if (tag !== (wanted = (_ref2 = last(this.ends)) != null ? _ref2.tag : void 0)) {
			if ('OUTDENT' !== wanted) {
			  this.error("unmatched " + tag);
			}
			this.outdentToken(last(this.indents), true);
			return this.pair(tag);
		  }
		  return this.ends.pop();
		};

		Lexer.prototype.getLineAndColumnFromChunk = function(offset) {
		  var column, lineCount, lines, string;
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
			lines = string.split('\n');
			column = last(lines).length;
		  } else {
			column += string.length;
		  }
		  return [this.chunkLine + lineCount, column];
		};

		Lexer.prototype.makeToken = function(tag, value, offsetInChunk, length) {
		  var lastCharacter, locationData, token, _ref2, _ref3;
		  if (offsetInChunk == null) {
			offsetInChunk = 0;
		  }
		  if (length == null) {
			length = value.length;
		  }
		  locationData = {};
		  _ref2 = this.getLineAndColumnFromChunk(offsetInChunk), locationData.first_line = _ref2[0], locationData.first_column = _ref2[1];
		  lastCharacter = Math.max(0, length - 1);
		  _ref3 = this.getLineAndColumnFromChunk(offsetInChunk + lastCharacter), locationData.last_line = _ref3[0], locationData.last_column = _ref3[1];
		  token = [tag, value, locationData];
		  return token;
		};

		Lexer.prototype.token = function(tag, value, offsetInChunk, length, origin) {
		  var token;
		  token = this.makeToken(tag, value, offsetInChunk, length);
		  if (origin) {
			token.origin = origin;
		  }
		  this.tokens.push(token);
		  return token;
		};

		Lexer.prototype.tag = function(index, tag) {
		  var tok;
		  return (tok = last(this.tokens, index)) && (tag ? tok[0] = tag : tok[0]);
		};

		Lexer.prototype.value = function(index, val) {
		  var tok;
		  return (tok = last(this.tokens, index)) && (val ? tok[1] = val : tok[1]);
		};

		Lexer.prototype.unfinished = function() {
		  var _ref2;
		  return LINE_CONTINUER.test(this.chunk) || ((_ref2 = this.tag()) === '\\' || _ref2 === '.' || _ref2 === '?.' || _ref2 === '?::' || _ref2 === 'UNARY' || _ref2 === 'MATH' || _ref2 === 'UNARY_MATH' || _ref2 === '+' || _ref2 === '-' || _ref2 === 'YIELD' || _ref2 === '**' || _ref2 === 'SHIFT' || _ref2 === 'RELATION' || _ref2 === 'COMPARE' || _ref2 === 'LOGIC' || _ref2 === 'THROW' || _ref2 === 'EXTENDS');
		};

		Lexer.prototype.formatString = function(str) {
		  return str.replace(/\\[^\S\n]*(\n|\\)\s*/g, function(escaped, character) {
			if (character === '\n') {
			  return '';
			} else {
			  return escaped;
			}
		  });
		};

		Lexer.prototype.formatHeregex = function(str) {
		  return str.replace(HEREGEX_OMIT, '$1$2').replace(MULTILINER, '\\n');
		};

		Lexer.prototype.makeString = function(body, quote) {
		  var match;
		  if (!body) {
			return quote + quote;
		  }
		  body = body.replace(RegExp("\\\\(" + quote + "|\\\\)", "g"), function(match, contents) {
			if (contents === quote) {
			  return contents;
			} else {
			  return match;
			}
		  });
		  body = body.replace(RegExp("" + quote, "g"), '\\$&');
		  if (match = OCTAL_ESCAPE.exec(body)) {
			this.error("octal escape sequences are not allowed " + match[2], match.index + match[1].length + 1);
		  }
		  return quote + body + quote;
		};

		Lexer.prototype.error = function(message, offset) {
		  var first_column, first_line, _ref2;
		  if (offset == null) {
			offset = 0;
		  }
		  _ref2 = this.getLineAndColumnFromChunk(offset), first_line = _ref2[0], first_column = _ref2[1];
		  return throwSyntaxError(message, {
			first_line: first_line,
			first_column: first_column
		  });
		};

		return Lexer;

	  })();

	  JS_KEYWORDS = ['true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'yield', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super'];

	  COFFEE_KEYWORDS = ['undefined', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];

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
		var _results;
		_results = [];
		for (key in COFFEE_ALIAS_MAP) {
		  _results.push(key);
		}
		return _results;
	  })();

	  COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

	  RESERVED = ['case', 'default', 'function', 'var', 'void', 'with', 'const', 'let', 'enum', 'export', 'import', 'native', '__hasProp', '__extends', '__slice', '__bind', '__indexOf', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static'];

	  STRICT_PROSCRIBED = ['arguments', 'eval', 'yield*'];

	  JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);

	  exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(COFFEE_KEYWORDS).concat(STRICT_PROSCRIBED);

	  exports.STRICT_PROSCRIBED = STRICT_PROSCRIBED;

	  BOM = 65279;

	  IDENTIFIER = /^(?!\d)((?:(?!\s)[$\w\x7f-\uffff])+)([^\n\S]*:(?!:))?/;

	  NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;

	  OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>*\/%])\2=?|\?(\.|::)|\.{2,3})/;

	  WHITESPACE = /^[^\n\S]+/;

	  COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|###$)|^(?:\s*#(?!##[^#]).*)+/;

	  CODE = /^[-=]>/;

	  MULTI_DENT = /^(?:\n[^\n\S]*)+/;

	  JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

	  STRING_START = /^(?:'''|"""|'|")/;

	  STRING_SINGLE = /^(?:[^\\']|\\[\s\S])*/;

	  STRING_DOUBLE = /^(?:[^\\"#]|\\[\s\S]|\#(?!\{))*/;

	  HEREDOC_SINGLE = /^(?:[^\\']|\\[\s\S]|'(?!''))*/;

	  HEREDOC_DOUBLE = /^(?:[^\\"#]|\\[\s\S]|"(?!"")|\#(?!\{))*/;

	  STRING_OMIT = /\s*\n\s*/g;

	  HEREDOC_INDENT = /\n+([^\n\S]*)(?=\S)/g;

	  REGEX = /^\/(?![\s=])(?:[^[\/\n\\]|\\.|\[(?:\\.|[^\]\n\\])*])+\//;

	  REGEX_FLAGS = /^\w*/;

	  VALID_FLAGS = /^(?!.*(.).*\1)[imgy]*$/;

	  HEREGEX = /^(?:[^\\\/#]|\\[\s\S]|\/(?!\/\/)|\#(?!\{))*/;

	  HEREGEX_OMIT = /((?:\\\\)+)|\\(\s|\/)|\s+(?:#.*)?/g;

	  REGEX_ILLEGAL = /^(\/|\/{3}\s*)(\*)/;

	  MULTILINER = /\n/g;

	  HERECOMMENT_ILLEGAL = /\*\//;

	  LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;

	  OCTAL_ESCAPE = /^((?:\\.|[^\\])*)(\\(?:0[0-7]|[1-7]))/;

	  LEADING_BLANK_LINE = /^[^\n\S]*\n/;

	  TRAILING_BLANK_LINE = /\n[^\n\S]*$/;

	  TRAILING_SPACES = /\s+$/;

	  COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=', '**=', '//=', '%%='];

	  UNARY = ['NEW', 'TYPEOF', 'DELETE', 'DO'];

	  UNARY_MATH = ['!', '~'];

	  LOGIC = ['&&', '||', '&', '|', '^'];

	  SHIFT = ['<<', '>>', '>>>'];

	  COMPARE = ['==', '!=', '<', '>', '<=', '>='];

	  MATH = ['*', '/', '%', '//', '%%'];

	  RELATION = ['IN', 'OF', 'INSTANCEOF'];

	  BOOL = ['TRUE', 'FALSE'];

	  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', 'NULL', 'UNDEFINED', '++', '--'];

	  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING', ']');

	  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

	  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOL', 'NULL', 'UNDEFINED');

	  LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

	  INDENTABLE_CLOSERS = [')', '}', ']'];

	  return exports;
	};
	//#endregion

	//#region URL: /parser
	modules['/parser'] = function(){
		var exports = {};
		/* parser generated by jison 0.4.13 */
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
		var parser = (function(){
		var parser = {trace: function trace() { },
		yy: {},
		symbols_: {"error":2,"Root":3,"Body":4,"Line":5,"TERMINATOR":6,"Expression":7,"Statement":8,"Return":9,"Comment":10,"STATEMENT":11,"Value":12,"Invocation":13,"Code":14,"Operation":15,"Assign":16,"If":17,"Try":18,"While":19,"For":20,"Switch":21,"Class":22,"Throw":23,"Block":24,"INDENT":25,"OUTDENT":26,"Identifier":27,"IDENTIFIER":28,"AlphaNumeric":29,"NUMBER":30,"STRING":31,"Literal":32,"JS":33,"REGEX":34,"DEBUGGER":35,"UNDEFINED":36,"NULL":37,"BOOL":38,"Assignable":39,"=":40,"AssignObj":41,"ObjAssignable":42,":":43,"ThisProperty":44,"RETURN":45,"HERECOMMENT":46,"PARAM_START":47,"ParamList":48,"PARAM_END":49,"FuncGlyph":50,"->":51,"=>":52,"OptComma":53,",":54,"Param":55,"ParamVar":56,"...":57,"Array":58,"Object":59,"Splat":60,"SimpleAssignable":61,"Accessor":62,"Parenthetical":63,"Range":64,"This":65,".":66,"?.":67,"::":68,"?::":69,"Index":70,"INDEX_START":71,"IndexValue":72,"INDEX_END":73,"INDEX_SOAK":74,"Slice":75,"{":76,"AssignList":77,"}":78,"CLASS":79,"EXTENDS":80,"OptFuncExist":81,"Arguments":82,"SUPER":83,"FUNC_EXIST":84,"CALL_START":85,"CALL_END":86,"ArgList":87,"THIS":88,"@":89,"[":90,"]":91,"RangeDots":92,"..":93,"Arg":94,"SimpleArgs":95,"TRY":96,"Catch":97,"FINALLY":98,"CATCH":99,"THROW":100,"(":101,")":102,"WhileSource":103,"WHILE":104,"WHEN":105,"UNTIL":106,"Loop":107,"LOOP":108,"ForBody":109,"FOR":110,"ForStart":111,"ForSource":112,"ForVariables":113,"OWN":114,"ForValue":115,"FORIN":116,"FOROF":117,"BY":118,"SWITCH":119,"Whens":120,"ELSE":121,"When":122,"LEADING_WHEN":123,"IfBlock":124,"IF":125,"POST_IF":126,"UNARY":127,"UNARY_MATH":128,"-":129,"+":130,"YIELD":131,"FROM":132,"--":133,"++":134,"?":135,"MATH":136,"**":137,"SHIFT":138,"COMPARE":139,"LOGIC":140,"RELATION":141,"COMPOUND_ASSIGN":142,"$accept":0,"$end":1},
		terminals_: {2:"error",6:"TERMINATOR",11:"STATEMENT",25:"INDENT",26:"OUTDENT",28:"IDENTIFIER",30:"NUMBER",31:"STRING",33:"JS",34:"REGEX",35:"DEBUGGER",36:"UNDEFINED",37:"NULL",38:"BOOL",40:"=",43:":",45:"RETURN",46:"HERECOMMENT",47:"PARAM_START",49:"PARAM_END",51:"->",52:"=>",54:",",57:"...",66:".",67:"?.",68:"::",69:"?::",71:"INDEX_START",73:"INDEX_END",74:"INDEX_SOAK",76:"{",78:"}",79:"CLASS",80:"EXTENDS",83:"SUPER",84:"FUNC_EXIST",85:"CALL_START",86:"CALL_END",88:"THIS",89:"@",90:"[",91:"]",93:"..",96:"TRY",98:"FINALLY",99:"CATCH",100:"THROW",101:"(",102:")",104:"WHILE",105:"WHEN",106:"UNTIL",108:"LOOP",110:"FOR",114:"OWN",116:"FORIN",117:"FOROF",118:"BY",119:"SWITCH",121:"ELSE",123:"LEADING_WHEN",125:"IF",126:"POST_IF",127:"UNARY",128:"UNARY_MATH",129:"-",130:"+",131:"YIELD",132:"FROM",133:"--",134:"++",135:"?",136:"MATH",137:"**",138:"SHIFT",139:"COMPARE",140:"LOGIC",141:"RELATION",142:"COMPOUND_ASSIGN"},
		productions_: [0,[3,0],[3,1],[4,1],[4,3],[4,2],[5,1],[5,1],[8,1],[8,1],[8,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[24,2],[24,3],[27,1],[29,1],[29,1],[32,1],[32,1],[32,1],[32,1],[32,1],[32,1],[32,1],[16,3],[16,4],[16,5],[41,1],[41,3],[41,5],[41,1],[42,1],[42,1],[42,1],[9,2],[9,1],[10,1],[14,5],[14,2],[50,1],[50,1],[53,0],[53,1],[48,0],[48,1],[48,3],[48,4],[48,6],[55,1],[55,2],[55,3],[55,1],[56,1],[56,1],[56,1],[56,1],[60,2],[61,1],[61,2],[61,2],[61,1],[39,1],[39,1],[39,1],[12,1],[12,1],[12,1],[12,1],[12,1],[62,2],[62,2],[62,2],[62,2],[62,1],[62,1],[70,3],[70,2],[72,1],[72,1],[59,4],[77,0],[77,1],[77,3],[77,4],[77,6],[22,1],[22,2],[22,3],[22,4],[22,2],[22,3],[22,4],[22,5],[13,3],[13,3],[13,1],[13,2],[81,0],[81,1],[82,2],[82,4],[65,1],[65,1],[44,2],[58,2],[58,4],[92,1],[92,1],[64,5],[75,3],[75,2],[75,2],[75,1],[87,1],[87,3],[87,4],[87,4],[87,6],[94,1],[94,1],[94,1],[95,1],[95,3],[18,2],[18,3],[18,4],[18,5],[97,3],[97,3],[97,2],[23,2],[63,3],[63,5],[103,2],[103,4],[103,2],[103,4],[19,2],[19,2],[19,2],[19,1],[107,2],[107,2],[20,2],[20,2],[20,2],[109,2],[109,2],[111,2],[111,3],[115,1],[115,1],[115,1],[115,1],[113,1],[113,3],[112,2],[112,2],[112,4],[112,4],[112,4],[112,6],[112,6],[21,5],[21,7],[21,4],[21,6],[120,1],[120,2],[122,3],[122,4],[124,3],[124,5],[17,1],[17,3],[17,3],[17,3],[15,2],[15,2],[15,2],[15,2],[15,2],[15,2],[15,3],[15,2],[15,2],[15,2],[15,2],[15,2],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,3],[15,5],[15,4],[15,3]],
		performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */
		/**/) {
		/* this == yyval */

		var $0 = $$.length - 1;
		switch (yystate) {
		case 1:return this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Block);
		break;
		case 2:return this.$ = $$[$0];
		break;
		case 3:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(yy.Block.wrap([$$[$0]]));
		break;
		case 4:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].push($$[$0]));
		break;
		case 5:this.$ = $$[$0-1];
		break;
		case 6:this.$ = $$[$0];
		break;
		case 7:this.$ = $$[$0];
		break;
		case 8:this.$ = $$[$0];
		break;
		case 9:this.$ = $$[$0];
		break;
		case 10:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
		break;
		case 11:this.$ = $$[$0];
		break;
		case 12:this.$ = $$[$0];
		break;
		case 13:this.$ = $$[$0];
		break;
		case 14:this.$ = $$[$0];
		break;
		case 15:this.$ = $$[$0];
		break;
		case 16:this.$ = $$[$0];
		break;
		case 17:this.$ = $$[$0];
		break;
		case 18:this.$ = $$[$0];
		break;
		case 19:this.$ = $$[$0];
		break;
		case 20:this.$ = $$[$0];
		break;
		case 21:this.$ = $$[$0];
		break;
		case 22:this.$ = $$[$0];
		break;
		case 23:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Block);
		break;
		case 24:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-1]);
		break;
		case 25:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
		break;
		case 26:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
		break;
		case 27:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
		break;
		case 28:this.$ = $$[$0];
		break;
		case 29:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
		break;
		case 30:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
		break;
		case 31:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Literal($$[$0]));
		break;
		case 32:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Undefined);
		break;
		case 33:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Null);
		break;
		case 34:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Bool($$[$0]));
		break;
		case 35:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Assign($$[$0-2], $$[$0]));
		break;
		case 36:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Assign($$[$0-3], $$[$0]));
		break;
		case 37:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Assign($$[$0-4], $$[$0-1]));
		break;
		case 38:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 39:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Assign(yy.addLocationDataFn(_$[$0-2])(new yy.Value($$[$0-2])), $$[$0], 'object'));
		break;
		case 40:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Assign(yy.addLocationDataFn(_$[$0-4])(new yy.Value($$[$0-4])), $$[$0-1], 'object'));
		break;
		case 41:this.$ = $$[$0];
		break;
		case 42:this.$ = $$[$0];
		break;
		case 43:this.$ = $$[$0];
		break;
		case 44:this.$ = $$[$0];
		break;
		case 45:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Return($$[$0]));
		break;
		case 46:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Return);
		break;
		case 47:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Comment($$[$0]));
		break;
		case 48:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Code($$[$0-3], $$[$0], $$[$0-1]));
		break;
		case 49:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Code([], $$[$0], $$[$0-1]));
		break;
		case 50:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('func');
		break;
		case 51:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('boundfunc');
		break;
		case 52:this.$ = $$[$0];
		break;
		case 53:this.$ = $$[$0];
		break;
		case 54:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([]);
		break;
		case 55:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([$$[$0]]);
		break;
		case 56:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].concat($$[$0]));
		break;
		case 57:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-3].concat($$[$0]));
		break;
		case 58:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])($$[$0-5].concat($$[$0-2]));
		break;
		case 59:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Param($$[$0]));
		break;
		case 60:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Param($$[$0-1], null, true));
		break;
		case 61:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Param($$[$0-2], $$[$0]));
		break;
		case 62:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Expansion);
		break;
		case 63:this.$ = $$[$0];
		break;
		case 64:this.$ = $$[$0];
		break;
		case 65:this.$ = $$[$0];
		break;
		case 66:this.$ = $$[$0];
		break;
		case 67:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Splat($$[$0-1]));
		break;
		case 68:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 69:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0-1].add($$[$0]));
		break;
		case 70:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Value($$[$0-1], [].concat($$[$0])));
		break;
		case 71:this.$ = $$[$0];
		break;
		case 72:this.$ = $$[$0];
		break;
		case 73:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 74:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 75:this.$ = $$[$0];
		break;
		case 76:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 77:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 78:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 79:this.$ = $$[$0];
		break;
		case 80:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Access($$[$0]));
		break;
		case 81:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Access($$[$0], 'soak'));
		break;
		case 82:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([yy.addLocationDataFn(_$[$0-1])(new yy.Access(new yy.Literal('prototype'))), yy.addLocationDataFn(_$[$0])(new yy.Access($$[$0]))]);
		break;
		case 83:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([yy.addLocationDataFn(_$[$0-1])(new yy.Access(new yy.Literal('prototype'), 'soak')), yy.addLocationDataFn(_$[$0])(new yy.Access($$[$0]))]);
		break;
		case 84:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Access(new yy.Literal('prototype')));
		break;
		case 85:this.$ = $$[$0];
		break;
		case 86:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-1]);
		break;
		case 87:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(yy.extend($$[$0], {
				  soak: true
				}));
		break;
		case 88:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Index($$[$0]));
		break;
		case 89:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Slice($$[$0]));
		break;
		case 90:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Obj($$[$0-2], $$[$0-3].generated));
		break;
		case 91:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([]);
		break;
		case 92:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([$$[$0]]);
		break;
		case 93:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].concat($$[$0]));
		break;
		case 94:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-3].concat($$[$0]));
		break;
		case 95:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])($$[$0-5].concat($$[$0-2]));
		break;
		case 96:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Class);
		break;
		case 97:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Class(null, null, $$[$0]));
		break;
		case 98:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Class(null, $$[$0]));
		break;
		case 99:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Class(null, $$[$0-1], $$[$0]));
		break;
		case 100:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Class($$[$0]));
		break;
		case 101:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Class($$[$0-1], null, $$[$0]));
		break;
		case 102:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Class($$[$0-2], $$[$0]));
		break;
		case 103:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Class($$[$0-3], $$[$0-1], $$[$0]));
		break;
		case 104:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Call($$[$0-2], $$[$0], $$[$0-1]));
		break;
		case 105:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Call($$[$0-2], $$[$0], $$[$0-1]));
		break;
		case 106:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]));
		break;
		case 107:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Call('super', $$[$0]));
		break;
		case 108:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(false);
		break;
		case 109:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(true);
		break;
		case 110:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([]);
		break;
		case 111:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-2]);
		break;
		case 112:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value(new yy.Literal('this')));
		break;
		case 113:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value(new yy.Literal('this')));
		break;
		case 114:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Value(yy.addLocationDataFn(_$[$0-1])(new yy.Literal('this')), [yy.addLocationDataFn(_$[$0])(new yy.Access($$[$0]))], 'this'));
		break;
		case 115:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Arr([]));
		break;
		case 116:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Arr($$[$0-2]));
		break;
		case 117:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('inclusive');
		break;
		case 118:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])('exclusive');
		break;
		case 119:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]));
		break;
		case 120:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Range($$[$0-2], $$[$0], $$[$0-1]));
		break;
		case 121:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Range($$[$0-1], null, $$[$0]));
		break;
		case 122:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Range(null, $$[$0], $$[$0-1]));
		break;
		case 123:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Range(null, null, $$[$0]));
		break;
		case 124:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([$$[$0]]);
		break;
		case 125:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].concat($$[$0]));
		break;
		case 126:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-3].concat($$[$0]));
		break;
		case 127:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])($$[$0-2]);
		break;
		case 128:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])($$[$0-5].concat($$[$0-2]));
		break;
		case 129:this.$ = $$[$0];
		break;
		case 130:this.$ = $$[$0];
		break;
		case 131:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Expansion);
		break;
		case 132:this.$ = $$[$0];
		break;
		case 133:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([].concat($$[$0-2], $$[$0]));
		break;
		case 134:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Try($$[$0]));
		break;
		case 135:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]));
		break;
		case 136:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Try($$[$0-2], null, null, $$[$0]));
		break;
		case 137:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]));
		break;
		case 138:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([$$[$0-1], $$[$0]]);
		break;
		case 139:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([yy.addLocationDataFn(_$[$0-1])(new yy.Value($$[$0-1])), $$[$0]]);
		break;
		case 140:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])([null, $$[$0]]);
		break;
		case 141:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Throw($$[$0]));
		break;
		case 142:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Parens($$[$0-1]));
		break;
		case 143:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Parens($$[$0-2]));
		break;
		case 144:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While($$[$0]));
		break;
		case 145:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.While($$[$0-2], {
				  guard: $$[$0]
				}));
		break;
		case 146:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While($$[$0], {
				  invert: true
				}));
		break;
		case 147:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.While($$[$0-2], {
				  invert: true,
				  guard: $$[$0]
				}));
		break;
		case 148:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0-1].addBody($$[$0]));
		break;
		case 149:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0].addBody(yy.addLocationDataFn(_$[$0-1])(yy.Block.wrap([$$[$0-1]]))));
		break;
		case 150:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0].addBody(yy.addLocationDataFn(_$[$0-1])(yy.Block.wrap([$$[$0-1]]))));
		break;
		case 151:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])($$[$0]);
		break;
		case 152:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While(yy.addLocationDataFn(_$[$0-1])(new yy.Literal('true'))).addBody($$[$0]));
		break;
		case 153:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.While(yy.addLocationDataFn(_$[$0-1])(new yy.Literal('true'))).addBody(yy.addLocationDataFn(_$[$0])(yy.Block.wrap([$$[$0]]))));
		break;
		case 154:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.For($$[$0-1], $$[$0]));
		break;
		case 155:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.For($$[$0-1], $$[$0]));
		break;
		case 156:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.For($$[$0], $$[$0-1]));
		break;
		case 157:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])({
				  source: yy.addLocationDataFn(_$[$0])(new yy.Value($$[$0]))
				});
		break;
		case 158:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])((function () {
				$$[$0].own = $$[$0-1].own;
				$$[$0].name = $$[$0-1][0];
				$$[$0].index = $$[$0-1][1];
				return $$[$0];
			  }()));
		break;
		case 159:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0]);
		break;
		case 160:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])((function () {
				$$[$0].own = true;
				return $$[$0];
			  }()));
		break;
		case 161:this.$ = $$[$0];
		break;
		case 162:this.$ = $$[$0];
		break;
		case 163:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 164:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])(new yy.Value($$[$0]));
		break;
		case 165:this.$ = yy.addLocationDataFn(_$[$0], _$[$0])([$$[$0]]);
		break;
		case 166:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([$$[$0-2], $$[$0]]);
		break;
		case 167:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])({
				  source: $$[$0]
				});
		break;
		case 168:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])({
				  source: $$[$0],
				  object: true
				});
		break;
		case 169:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
				  source: $$[$0-2],
				  guard: $$[$0]
				});
		break;
		case 170:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
				  source: $$[$0-2],
				  guard: $$[$0],
				  object: true
				});
		break;
		case 171:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])({
				  source: $$[$0-2],
				  step: $$[$0]
				});
		break;
		case 172:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])({
				  source: $$[$0-4],
				  guard: $$[$0-2],
				  step: $$[$0]
				});
		break;
		case 173:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])({
				  source: $$[$0-4],
				  step: $$[$0-2],
				  guard: $$[$0]
				});
		break;
		case 174:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Switch($$[$0-3], $$[$0-1]));
		break;
		case 175:this.$ = yy.addLocationDataFn(_$[$0-6], _$[$0])(new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]));
		break;
		case 176:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Switch(null, $$[$0-1]));
		break;
		case 177:this.$ = yy.addLocationDataFn(_$[$0-5], _$[$0])(new yy.Switch(null, $$[$0-3], $$[$0-1]));
		break;
		case 178:this.$ = $$[$0];
		break;
		case 179:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])($$[$0-1].concat($$[$0]));
		break;
		case 180:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])([[$$[$0-1], $$[$0]]]);
		break;
		case 181:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])([[$$[$0-2], $$[$0-1]]]);
		break;
		case 182:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0-1], $$[$0], {
				  type: $$[$0-2]
				}));
		break;
		case 183:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])($$[$0-4].addElse(yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0-1], $$[$0], {
				  type: $$[$0-2]
				}))));
		break;
		case 184:this.$ = $$[$0];
		break;
		case 185:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])($$[$0-2].addElse($$[$0]));
		break;
		case 186:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0], yy.addLocationDataFn(_$[$0-2])(yy.Block.wrap([$$[$0-2]])), {
				  type: $$[$0-1],
				  statement: true
				}));
		break;
		case 187:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.If($$[$0], yy.addLocationDataFn(_$[$0-2])(yy.Block.wrap([$$[$0-2]])), {
				  type: $$[$0-1],
				  statement: true
				}));
		break;
		case 188:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op($$[$0-1], $$[$0]));
		break;
		case 189:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op($$[$0-1], $$[$0]));
		break;
		case 190:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('-', $$[$0]));
		break;
		case 191:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('+', $$[$0]));
		break;
		case 192:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op($$[$0-1], $$[$0]));
		break;
		case 193:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op($$[$0-1], $$[$0]));
		break;
		case 194:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-2].concat($$[$0-1]), $$[$0]));
		break;
		case 195:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('--', $$[$0]));
		break;
		case 196:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('++', $$[$0]));
		break;
		case 197:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('--', $$[$0-1], null, true));
		break;
		case 198:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Op('++', $$[$0-1], null, true));
		break;
		case 199:this.$ = yy.addLocationDataFn(_$[$0-1], _$[$0])(new yy.Existence($$[$0-1]));
		break;
		case 200:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op('+', $$[$0-2], $$[$0]));
		break;
		case 201:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op('-', $$[$0-2], $$[$0]));
		break;
		case 202:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
		break;
		case 203:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
		break;
		case 204:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
		break;
		case 205:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
		break;
		case 206:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Op($$[$0-1], $$[$0-2], $$[$0]));
		break;
		case 207:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])((function () {
				if ($$[$0-1].charAt(0) === '!') {
				  return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
				} else {
				  return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
				}
			  }()));
		break;
		case 208:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Assign($$[$0-2], $$[$0], $$[$0-1]));
		break;
		case 209:this.$ = yy.addLocationDataFn(_$[$0-4], _$[$0])(new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]));
		break;
		case 210:this.$ = yy.addLocationDataFn(_$[$0-3], _$[$0])(new yy.Assign($$[$0-3], $$[$0], $$[$0-2]));
		break;
		case 211:this.$ = yy.addLocationDataFn(_$[$0-2], _$[$0])(new yy.Extends($$[$0-2], $$[$0]));
		break;
		}
		},
		table: [{1:[2,1],3:1,4:2,5:3,7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[3]},{1:[2,2],6:[1,74]},{1:[2,3],6:[2,3],26:[2,3],102:[2,3]},{1:[2,6],6:[2,6],26:[2,6],102:[2,6],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,7],6:[2,7],26:[2,7],102:[2,7],103:88,104:[1,65],106:[1,66],109:89,110:[1,68],111:69,126:[1,87]},{1:[2,11],6:[2,11],25:[2,11],26:[2,11],49:[2,11],54:[2,11],57:[2,11],62:91,66:[1,93],67:[1,94],68:[1,95],69:[1,96],70:97,71:[1,98],73:[2,11],74:[1,99],78:[2,11],81:90,84:[1,92],85:[2,108],86:[2,11],91:[2,11],93:[2,11],102:[2,11],104:[2,11],105:[2,11],106:[2,11],110:[2,11],118:[2,11],126:[2,11],129:[2,11],130:[2,11],135:[2,11],136:[2,11],137:[2,11],138:[2,11],139:[2,11],140:[2,11],141:[2,11]},{1:[2,12],6:[2,12],25:[2,12],26:[2,12],49:[2,12],54:[2,12],57:[2,12],62:101,66:[1,93],67:[1,94],68:[1,95],69:[1,96],70:97,71:[1,98],73:[2,12],74:[1,99],78:[2,12],81:100,84:[1,92],85:[2,108],86:[2,12],91:[2,12],93:[2,12],102:[2,12],104:[2,12],105:[2,12],106:[2,12],110:[2,12],118:[2,12],126:[2,12],129:[2,12],130:[2,12],135:[2,12],136:[2,12],137:[2,12],138:[2,12],139:[2,12],140:[2,12],141:[2,12]},{1:[2,13],6:[2,13],25:[2,13],26:[2,13],49:[2,13],54:[2,13],57:[2,13],73:[2,13],78:[2,13],86:[2,13],91:[2,13],93:[2,13],102:[2,13],104:[2,13],105:[2,13],106:[2,13],110:[2,13],118:[2,13],126:[2,13],129:[2,13],130:[2,13],135:[2,13],136:[2,13],137:[2,13],138:[2,13],139:[2,13],140:[2,13],141:[2,13]},{1:[2,14],6:[2,14],25:[2,14],26:[2,14],49:[2,14],54:[2,14],57:[2,14],73:[2,14],78:[2,14],86:[2,14],91:[2,14],93:[2,14],102:[2,14],104:[2,14],105:[2,14],106:[2,14],110:[2,14],118:[2,14],126:[2,14],129:[2,14],130:[2,14],135:[2,14],136:[2,14],137:[2,14],138:[2,14],139:[2,14],140:[2,14],141:[2,14]},{1:[2,15],6:[2,15],25:[2,15],26:[2,15],49:[2,15],54:[2,15],57:[2,15],73:[2,15],78:[2,15],86:[2,15],91:[2,15],93:[2,15],102:[2,15],104:[2,15],105:[2,15],106:[2,15],110:[2,15],118:[2,15],126:[2,15],129:[2,15],130:[2,15],135:[2,15],136:[2,15],137:[2,15],138:[2,15],139:[2,15],140:[2,15],141:[2,15]},{1:[2,16],6:[2,16],25:[2,16],26:[2,16],49:[2,16],54:[2,16],57:[2,16],73:[2,16],78:[2,16],86:[2,16],91:[2,16],93:[2,16],102:[2,16],104:[2,16],105:[2,16],106:[2,16],110:[2,16],118:[2,16],126:[2,16],129:[2,16],130:[2,16],135:[2,16],136:[2,16],137:[2,16],138:[2,16],139:[2,16],140:[2,16],141:[2,16]},{1:[2,17],6:[2,17],25:[2,17],26:[2,17],49:[2,17],54:[2,17],57:[2,17],73:[2,17],78:[2,17],86:[2,17],91:[2,17],93:[2,17],102:[2,17],104:[2,17],105:[2,17],106:[2,17],110:[2,17],118:[2,17],126:[2,17],129:[2,17],130:[2,17],135:[2,17],136:[2,17],137:[2,17],138:[2,17],139:[2,17],140:[2,17],141:[2,17]},{1:[2,18],6:[2,18],25:[2,18],26:[2,18],49:[2,18],54:[2,18],57:[2,18],73:[2,18],78:[2,18],86:[2,18],91:[2,18],93:[2,18],102:[2,18],104:[2,18],105:[2,18],106:[2,18],110:[2,18],118:[2,18],126:[2,18],129:[2,18],130:[2,18],135:[2,18],136:[2,18],137:[2,18],138:[2,18],139:[2,18],140:[2,18],141:[2,18]},{1:[2,19],6:[2,19],25:[2,19],26:[2,19],49:[2,19],54:[2,19],57:[2,19],73:[2,19],78:[2,19],86:[2,19],91:[2,19],93:[2,19],102:[2,19],104:[2,19],105:[2,19],106:[2,19],110:[2,19],118:[2,19],126:[2,19],129:[2,19],130:[2,19],135:[2,19],136:[2,19],137:[2,19],138:[2,19],139:[2,19],140:[2,19],141:[2,19]},{1:[2,20],6:[2,20],25:[2,20],26:[2,20],49:[2,20],54:[2,20],57:[2,20],73:[2,20],78:[2,20],86:[2,20],91:[2,20],93:[2,20],102:[2,20],104:[2,20],105:[2,20],106:[2,20],110:[2,20],118:[2,20],126:[2,20],129:[2,20],130:[2,20],135:[2,20],136:[2,20],137:[2,20],138:[2,20],139:[2,20],140:[2,20],141:[2,20]},{1:[2,21],6:[2,21],25:[2,21],26:[2,21],49:[2,21],54:[2,21],57:[2,21],73:[2,21],78:[2,21],86:[2,21],91:[2,21],93:[2,21],102:[2,21],104:[2,21],105:[2,21],106:[2,21],110:[2,21],118:[2,21],126:[2,21],129:[2,21],130:[2,21],135:[2,21],136:[2,21],137:[2,21],138:[2,21],139:[2,21],140:[2,21],141:[2,21]},{1:[2,22],6:[2,22],25:[2,22],26:[2,22],49:[2,22],54:[2,22],57:[2,22],73:[2,22],78:[2,22],86:[2,22],91:[2,22],93:[2,22],102:[2,22],104:[2,22],105:[2,22],106:[2,22],110:[2,22],118:[2,22],126:[2,22],129:[2,22],130:[2,22],135:[2,22],136:[2,22],137:[2,22],138:[2,22],139:[2,22],140:[2,22],141:[2,22]},{1:[2,8],6:[2,8],25:[2,8],26:[2,8],49:[2,8],54:[2,8],57:[2,8],73:[2,8],78:[2,8],86:[2,8],91:[2,8],93:[2,8],102:[2,8],104:[2,8],105:[2,8],106:[2,8],110:[2,8],118:[2,8],126:[2,8],129:[2,8],130:[2,8],135:[2,8],136:[2,8],137:[2,8],138:[2,8],139:[2,8],140:[2,8],141:[2,8]},{1:[2,9],6:[2,9],25:[2,9],26:[2,9],49:[2,9],54:[2,9],57:[2,9],73:[2,9],78:[2,9],86:[2,9],91:[2,9],93:[2,9],102:[2,9],104:[2,9],105:[2,9],106:[2,9],110:[2,9],118:[2,9],126:[2,9],129:[2,9],130:[2,9],135:[2,9],136:[2,9],137:[2,9],138:[2,9],139:[2,9],140:[2,9],141:[2,9]},{1:[2,10],6:[2,10],25:[2,10],26:[2,10],49:[2,10],54:[2,10],57:[2,10],73:[2,10],78:[2,10],86:[2,10],91:[2,10],93:[2,10],102:[2,10],104:[2,10],105:[2,10],106:[2,10],110:[2,10],118:[2,10],126:[2,10],129:[2,10],130:[2,10],135:[2,10],136:[2,10],137:[2,10],138:[2,10],139:[2,10],140:[2,10],141:[2,10]},{1:[2,75],6:[2,75],25:[2,75],26:[2,75],40:[1,102],49:[2,75],54:[2,75],57:[2,75],66:[2,75],67:[2,75],68:[2,75],69:[2,75],71:[2,75],73:[2,75],74:[2,75],78:[2,75],84:[2,75],85:[2,75],86:[2,75],91:[2,75],93:[2,75],102:[2,75],104:[2,75],105:[2,75],106:[2,75],110:[2,75],118:[2,75],126:[2,75],129:[2,75],130:[2,75],135:[2,75],136:[2,75],137:[2,75],138:[2,75],139:[2,75],140:[2,75],141:[2,75]},{1:[2,76],6:[2,76],25:[2,76],26:[2,76],49:[2,76],54:[2,76],57:[2,76],66:[2,76],67:[2,76],68:[2,76],69:[2,76],71:[2,76],73:[2,76],74:[2,76],78:[2,76],84:[2,76],85:[2,76],86:[2,76],91:[2,76],93:[2,76],102:[2,76],104:[2,76],105:[2,76],106:[2,76],110:[2,76],118:[2,76],126:[2,76],129:[2,76],130:[2,76],135:[2,76],136:[2,76],137:[2,76],138:[2,76],139:[2,76],140:[2,76],141:[2,76]},{1:[2,77],6:[2,77],25:[2,77],26:[2,77],49:[2,77],54:[2,77],57:[2,77],66:[2,77],67:[2,77],68:[2,77],69:[2,77],71:[2,77],73:[2,77],74:[2,77],78:[2,77],84:[2,77],85:[2,77],86:[2,77],91:[2,77],93:[2,77],102:[2,77],104:[2,77],105:[2,77],106:[2,77],110:[2,77],118:[2,77],126:[2,77],129:[2,77],130:[2,77],135:[2,77],136:[2,77],137:[2,77],138:[2,77],139:[2,77],140:[2,77],141:[2,77]},{1:[2,78],6:[2,78],25:[2,78],26:[2,78],49:[2,78],54:[2,78],57:[2,78],66:[2,78],67:[2,78],68:[2,78],69:[2,78],71:[2,78],73:[2,78],74:[2,78],78:[2,78],84:[2,78],85:[2,78],86:[2,78],91:[2,78],93:[2,78],102:[2,78],104:[2,78],105:[2,78],106:[2,78],110:[2,78],118:[2,78],126:[2,78],129:[2,78],130:[2,78],135:[2,78],136:[2,78],137:[2,78],138:[2,78],139:[2,78],140:[2,78],141:[2,78]},{1:[2,79],6:[2,79],25:[2,79],26:[2,79],49:[2,79],54:[2,79],57:[2,79],66:[2,79],67:[2,79],68:[2,79],69:[2,79],71:[2,79],73:[2,79],74:[2,79],78:[2,79],84:[2,79],85:[2,79],86:[2,79],91:[2,79],93:[2,79],102:[2,79],104:[2,79],105:[2,79],106:[2,79],110:[2,79],118:[2,79],126:[2,79],129:[2,79],130:[2,79],135:[2,79],136:[2,79],137:[2,79],138:[2,79],139:[2,79],140:[2,79],141:[2,79]},{1:[2,106],6:[2,106],25:[2,106],26:[2,106],49:[2,106],54:[2,106],57:[2,106],66:[2,106],67:[2,106],68:[2,106],69:[2,106],71:[2,106],73:[2,106],74:[2,106],78:[2,106],82:103,84:[2,106],85:[1,104],86:[2,106],91:[2,106],93:[2,106],102:[2,106],104:[2,106],105:[2,106],106:[2,106],110:[2,106],118:[2,106],126:[2,106],129:[2,106],130:[2,106],135:[2,106],136:[2,106],137:[2,106],138:[2,106],139:[2,106],140:[2,106],141:[2,106]},{6:[2,54],25:[2,54],27:109,28:[1,73],44:110,48:105,49:[2,54],54:[2,54],55:106,56:107,57:[1,108],58:111,59:112,76:[1,70],89:[1,113],90:[1,114]},{24:115,25:[1,116]},{7:117,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:119,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:120,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:121,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:123,8:122,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],132:[1,124],133:[1,34],134:[1,35]},{12:126,13:127,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:128,44:63,58:47,59:48,61:125,63:23,64:24,65:25,76:[1,70],83:[1,26],88:[1,58],89:[1,59],90:[1,57],101:[1,56]},{12:126,13:127,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:128,44:63,58:47,59:48,61:129,63:23,64:24,65:25,76:[1,70],83:[1,26],88:[1,58],89:[1,59],90:[1,57],101:[1,56]},{1:[2,72],6:[2,72],25:[2,72],26:[2,72],40:[2,72],49:[2,72],54:[2,72],57:[2,72],66:[2,72],67:[2,72],68:[2,72],69:[2,72],71:[2,72],73:[2,72],74:[2,72],78:[2,72],80:[1,133],84:[2,72],85:[2,72],86:[2,72],91:[2,72],93:[2,72],102:[2,72],104:[2,72],105:[2,72],106:[2,72],110:[2,72],118:[2,72],126:[2,72],129:[2,72],130:[2,72],133:[1,130],134:[1,131],135:[2,72],136:[2,72],137:[2,72],138:[2,72],139:[2,72],140:[2,72],141:[2,72],142:[1,132]},{1:[2,184],6:[2,184],25:[2,184],26:[2,184],49:[2,184],54:[2,184],57:[2,184],73:[2,184],78:[2,184],86:[2,184],91:[2,184],93:[2,184],102:[2,184],104:[2,184],105:[2,184],106:[2,184],110:[2,184],118:[2,184],121:[1,134],126:[2,184],129:[2,184],130:[2,184],135:[2,184],136:[2,184],137:[2,184],138:[2,184],139:[2,184],140:[2,184],141:[2,184]},{24:135,25:[1,116]},{24:136,25:[1,116]},{1:[2,151],6:[2,151],25:[2,151],26:[2,151],49:[2,151],54:[2,151],57:[2,151],73:[2,151],78:[2,151],86:[2,151],91:[2,151],93:[2,151],102:[2,151],104:[2,151],105:[2,151],106:[2,151],110:[2,151],118:[2,151],126:[2,151],129:[2,151],130:[2,151],135:[2,151],136:[2,151],137:[2,151],138:[2,151],139:[2,151],140:[2,151],141:[2,151]},{24:137,25:[1,116]},{7:138,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,139],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,96],6:[2,96],12:126,13:127,24:140,25:[1,116],26:[2,96],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:128,44:63,49:[2,96],54:[2,96],57:[2,96],58:47,59:48,61:142,63:23,64:24,65:25,73:[2,96],76:[1,70],78:[2,96],80:[1,141],83:[1,26],86:[2,96],88:[1,58],89:[1,59],90:[1,57],91:[2,96],93:[2,96],101:[1,56],102:[2,96],104:[2,96],105:[2,96],106:[2,96],110:[2,96],118:[2,96],126:[2,96],129:[2,96],130:[2,96],135:[2,96],136:[2,96],137:[2,96],138:[2,96],139:[2,96],140:[2,96],141:[2,96]},{7:143,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,46],6:[2,46],7:144,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[2,46],26:[2,46],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],49:[2,46],50:28,51:[1,60],52:[1,61],54:[2,46],57:[2,46],58:47,59:48,61:36,63:23,64:24,65:25,73:[2,46],76:[1,70],78:[2,46],79:[1,43],83:[1,26],86:[2,46],88:[1,58],89:[1,59],90:[1,57],91:[2,46],93:[2,46],96:[1,38],100:[1,44],101:[1,56],102:[2,46],103:39,104:[2,46],105:[2,46],106:[2,46],107:40,108:[1,67],109:41,110:[2,46],111:69,118:[2,46],119:[1,42],124:37,125:[1,64],126:[2,46],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35],135:[2,46],136:[2,46],137:[2,46],138:[2,46],139:[2,46],140:[2,46],141:[2,46]},{1:[2,47],6:[2,47],25:[2,47],26:[2,47],49:[2,47],54:[2,47],57:[2,47],73:[2,47],78:[2,47],86:[2,47],91:[2,47],93:[2,47],102:[2,47],104:[2,47],105:[2,47],106:[2,47],110:[2,47],118:[2,47],126:[2,47],129:[2,47],130:[2,47],135:[2,47],136:[2,47],137:[2,47],138:[2,47],139:[2,47],140:[2,47],141:[2,47]},{1:[2,73],6:[2,73],25:[2,73],26:[2,73],40:[2,73],49:[2,73],54:[2,73],57:[2,73],66:[2,73],67:[2,73],68:[2,73],69:[2,73],71:[2,73],73:[2,73],74:[2,73],78:[2,73],84:[2,73],85:[2,73],86:[2,73],91:[2,73],93:[2,73],102:[2,73],104:[2,73],105:[2,73],106:[2,73],110:[2,73],118:[2,73],126:[2,73],129:[2,73],130:[2,73],135:[2,73],136:[2,73],137:[2,73],138:[2,73],139:[2,73],140:[2,73],141:[2,73]},{1:[2,74],6:[2,74],25:[2,74],26:[2,74],40:[2,74],49:[2,74],54:[2,74],57:[2,74],66:[2,74],67:[2,74],68:[2,74],69:[2,74],71:[2,74],73:[2,74],74:[2,74],78:[2,74],84:[2,74],85:[2,74],86:[2,74],91:[2,74],93:[2,74],102:[2,74],104:[2,74],105:[2,74],106:[2,74],110:[2,74],118:[2,74],126:[2,74],129:[2,74],130:[2,74],135:[2,74],136:[2,74],137:[2,74],138:[2,74],139:[2,74],140:[2,74],141:[2,74]},{1:[2,28],6:[2,28],25:[2,28],26:[2,28],49:[2,28],54:[2,28],57:[2,28],66:[2,28],67:[2,28],68:[2,28],69:[2,28],71:[2,28],73:[2,28],74:[2,28],78:[2,28],84:[2,28],85:[2,28],86:[2,28],91:[2,28],93:[2,28],102:[2,28],104:[2,28],105:[2,28],106:[2,28],110:[2,28],118:[2,28],126:[2,28],129:[2,28],130:[2,28],135:[2,28],136:[2,28],137:[2,28],138:[2,28],139:[2,28],140:[2,28],141:[2,28]},{1:[2,29],6:[2,29],25:[2,29],26:[2,29],49:[2,29],54:[2,29],57:[2,29],66:[2,29],67:[2,29],68:[2,29],69:[2,29],71:[2,29],73:[2,29],74:[2,29],78:[2,29],84:[2,29],85:[2,29],86:[2,29],91:[2,29],93:[2,29],102:[2,29],104:[2,29],105:[2,29],106:[2,29],110:[2,29],118:[2,29],126:[2,29],129:[2,29],130:[2,29],135:[2,29],136:[2,29],137:[2,29],138:[2,29],139:[2,29],140:[2,29],141:[2,29]},{1:[2,30],6:[2,30],25:[2,30],26:[2,30],49:[2,30],54:[2,30],57:[2,30],66:[2,30],67:[2,30],68:[2,30],69:[2,30],71:[2,30],73:[2,30],74:[2,30],78:[2,30],84:[2,30],85:[2,30],86:[2,30],91:[2,30],93:[2,30],102:[2,30],104:[2,30],105:[2,30],106:[2,30],110:[2,30],118:[2,30],126:[2,30],129:[2,30],130:[2,30],135:[2,30],136:[2,30],137:[2,30],138:[2,30],139:[2,30],140:[2,30],141:[2,30]},{1:[2,31],6:[2,31],25:[2,31],26:[2,31],49:[2,31],54:[2,31],57:[2,31],66:[2,31],67:[2,31],68:[2,31],69:[2,31],71:[2,31],73:[2,31],74:[2,31],78:[2,31],84:[2,31],85:[2,31],86:[2,31],91:[2,31],93:[2,31],102:[2,31],104:[2,31],105:[2,31],106:[2,31],110:[2,31],118:[2,31],126:[2,31],129:[2,31],130:[2,31],135:[2,31],136:[2,31],137:[2,31],138:[2,31],139:[2,31],140:[2,31],141:[2,31]},{1:[2,32],6:[2,32],25:[2,32],26:[2,32],49:[2,32],54:[2,32],57:[2,32],66:[2,32],67:[2,32],68:[2,32],69:[2,32],71:[2,32],73:[2,32],74:[2,32],78:[2,32],84:[2,32],85:[2,32],86:[2,32],91:[2,32],93:[2,32],102:[2,32],104:[2,32],105:[2,32],106:[2,32],110:[2,32],118:[2,32],126:[2,32],129:[2,32],130:[2,32],135:[2,32],136:[2,32],137:[2,32],138:[2,32],139:[2,32],140:[2,32],141:[2,32]},{1:[2,33],6:[2,33],25:[2,33],26:[2,33],49:[2,33],54:[2,33],57:[2,33],66:[2,33],67:[2,33],68:[2,33],69:[2,33],71:[2,33],73:[2,33],74:[2,33],78:[2,33],84:[2,33],85:[2,33],86:[2,33],91:[2,33],93:[2,33],102:[2,33],104:[2,33],105:[2,33],106:[2,33],110:[2,33],118:[2,33],126:[2,33],129:[2,33],130:[2,33],135:[2,33],136:[2,33],137:[2,33],138:[2,33],139:[2,33],140:[2,33],141:[2,33]},{1:[2,34],6:[2,34],25:[2,34],26:[2,34],49:[2,34],54:[2,34],57:[2,34],66:[2,34],67:[2,34],68:[2,34],69:[2,34],71:[2,34],73:[2,34],74:[2,34],78:[2,34],84:[2,34],85:[2,34],86:[2,34],91:[2,34],93:[2,34],102:[2,34],104:[2,34],105:[2,34],106:[2,34],110:[2,34],118:[2,34],126:[2,34],129:[2,34],130:[2,34],135:[2,34],136:[2,34],137:[2,34],138:[2,34],139:[2,34],140:[2,34],141:[2,34]},{4:145,5:3,7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,146],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:147,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,151],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],57:[1,153],58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],87:149,88:[1,58],89:[1,59],90:[1,57],91:[1,148],94:150,96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,112],6:[2,112],25:[2,112],26:[2,112],49:[2,112],54:[2,112],57:[2,112],66:[2,112],67:[2,112],68:[2,112],69:[2,112],71:[2,112],73:[2,112],74:[2,112],78:[2,112],84:[2,112],85:[2,112],86:[2,112],91:[2,112],93:[2,112],102:[2,112],104:[2,112],105:[2,112],106:[2,112],110:[2,112],118:[2,112],126:[2,112],129:[2,112],130:[2,112],135:[2,112],136:[2,112],137:[2,112],138:[2,112],139:[2,112],140:[2,112],141:[2,112]},{1:[2,113],6:[2,113],25:[2,113],26:[2,113],27:154,28:[1,73],49:[2,113],54:[2,113],57:[2,113],66:[2,113],67:[2,113],68:[2,113],69:[2,113],71:[2,113],73:[2,113],74:[2,113],78:[2,113],84:[2,113],85:[2,113],86:[2,113],91:[2,113],93:[2,113],102:[2,113],104:[2,113],105:[2,113],106:[2,113],110:[2,113],118:[2,113],126:[2,113],129:[2,113],130:[2,113],135:[2,113],136:[2,113],137:[2,113],138:[2,113],139:[2,113],140:[2,113],141:[2,113]},{25:[2,50]},{25:[2,51]},{1:[2,68],6:[2,68],25:[2,68],26:[2,68],40:[2,68],49:[2,68],54:[2,68],57:[2,68],66:[2,68],67:[2,68],68:[2,68],69:[2,68],71:[2,68],73:[2,68],74:[2,68],78:[2,68],80:[2,68],84:[2,68],85:[2,68],86:[2,68],91:[2,68],93:[2,68],102:[2,68],104:[2,68],105:[2,68],106:[2,68],110:[2,68],118:[2,68],126:[2,68],129:[2,68],130:[2,68],133:[2,68],134:[2,68],135:[2,68],136:[2,68],137:[2,68],138:[2,68],139:[2,68],140:[2,68],141:[2,68],142:[2,68]},{1:[2,71],6:[2,71],25:[2,71],26:[2,71],40:[2,71],49:[2,71],54:[2,71],57:[2,71],66:[2,71],67:[2,71],68:[2,71],69:[2,71],71:[2,71],73:[2,71],74:[2,71],78:[2,71],80:[2,71],84:[2,71],85:[2,71],86:[2,71],91:[2,71],93:[2,71],102:[2,71],104:[2,71],105:[2,71],106:[2,71],110:[2,71],118:[2,71],126:[2,71],129:[2,71],130:[2,71],133:[2,71],134:[2,71],135:[2,71],136:[2,71],137:[2,71],138:[2,71],139:[2,71],140:[2,71],141:[2,71],142:[2,71]},{7:155,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:156,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:157,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:159,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,24:158,25:[1,116],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{27:164,28:[1,73],44:165,58:166,59:167,64:160,76:[1,70],89:[1,113],90:[1,57],113:161,114:[1,162],115:163},{112:168,116:[1,169],117:[1,170]},{6:[2,91],10:174,25:[2,91],27:175,28:[1,73],29:176,30:[1,71],31:[1,72],41:172,42:173,44:177,46:[1,46],54:[2,91],77:171,78:[2,91],89:[1,113]},{1:[2,26],6:[2,26],25:[2,26],26:[2,26],43:[2,26],49:[2,26],54:[2,26],57:[2,26],66:[2,26],67:[2,26],68:[2,26],69:[2,26],71:[2,26],73:[2,26],74:[2,26],78:[2,26],84:[2,26],85:[2,26],86:[2,26],91:[2,26],93:[2,26],102:[2,26],104:[2,26],105:[2,26],106:[2,26],110:[2,26],118:[2,26],126:[2,26],129:[2,26],130:[2,26],135:[2,26],136:[2,26],137:[2,26],138:[2,26],139:[2,26],140:[2,26],141:[2,26]},{1:[2,27],6:[2,27],25:[2,27],26:[2,27],43:[2,27],49:[2,27],54:[2,27],57:[2,27],66:[2,27],67:[2,27],68:[2,27],69:[2,27],71:[2,27],73:[2,27],74:[2,27],78:[2,27],84:[2,27],85:[2,27],86:[2,27],91:[2,27],93:[2,27],102:[2,27],104:[2,27],105:[2,27],106:[2,27],110:[2,27],118:[2,27],126:[2,27],129:[2,27],130:[2,27],135:[2,27],136:[2,27],137:[2,27],138:[2,27],139:[2,27],140:[2,27],141:[2,27]},{1:[2,25],6:[2,25],25:[2,25],26:[2,25],40:[2,25],43:[2,25],49:[2,25],54:[2,25],57:[2,25],66:[2,25],67:[2,25],68:[2,25],69:[2,25],71:[2,25],73:[2,25],74:[2,25],78:[2,25],80:[2,25],84:[2,25],85:[2,25],86:[2,25],91:[2,25],93:[2,25],102:[2,25],104:[2,25],105:[2,25],106:[2,25],110:[2,25],116:[2,25],117:[2,25],118:[2,25],126:[2,25],129:[2,25],130:[2,25],133:[2,25],134:[2,25],135:[2,25],136:[2,25],137:[2,25],138:[2,25],139:[2,25],140:[2,25],141:[2,25],142:[2,25]},{1:[2,5],5:178,6:[2,5],7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,26:[2,5],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],102:[2,5],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,199],6:[2,199],25:[2,199],26:[2,199],49:[2,199],54:[2,199],57:[2,199],73:[2,199],78:[2,199],86:[2,199],91:[2,199],93:[2,199],102:[2,199],104:[2,199],105:[2,199],106:[2,199],110:[2,199],118:[2,199],126:[2,199],129:[2,199],130:[2,199],135:[2,199],136:[2,199],137:[2,199],138:[2,199],139:[2,199],140:[2,199],141:[2,199]},{7:179,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:180,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:181,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:182,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:183,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:184,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:185,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:186,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:187,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,150],6:[2,150],25:[2,150],26:[2,150],49:[2,150],54:[2,150],57:[2,150],73:[2,150],78:[2,150],86:[2,150],91:[2,150],93:[2,150],102:[2,150],104:[2,150],105:[2,150],106:[2,150],110:[2,150],118:[2,150],126:[2,150],129:[2,150],130:[2,150],135:[2,150],136:[2,150],137:[2,150],138:[2,150],139:[2,150],140:[2,150],141:[2,150]},{1:[2,155],6:[2,155],25:[2,155],26:[2,155],49:[2,155],54:[2,155],57:[2,155],73:[2,155],78:[2,155],86:[2,155],91:[2,155],93:[2,155],102:[2,155],104:[2,155],105:[2,155],106:[2,155],110:[2,155],118:[2,155],126:[2,155],129:[2,155],130:[2,155],135:[2,155],136:[2,155],137:[2,155],138:[2,155],139:[2,155],140:[2,155],141:[2,155]},{7:188,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,149],6:[2,149],25:[2,149],26:[2,149],49:[2,149],54:[2,149],57:[2,149],73:[2,149],78:[2,149],86:[2,149],91:[2,149],93:[2,149],102:[2,149],104:[2,149],105:[2,149],106:[2,149],110:[2,149],118:[2,149],126:[2,149],129:[2,149],130:[2,149],135:[2,149],136:[2,149],137:[2,149],138:[2,149],139:[2,149],140:[2,149],141:[2,149]},{1:[2,154],6:[2,154],25:[2,154],26:[2,154],49:[2,154],54:[2,154],57:[2,154],73:[2,154],78:[2,154],86:[2,154],91:[2,154],93:[2,154],102:[2,154],104:[2,154],105:[2,154],106:[2,154],110:[2,154],118:[2,154],126:[2,154],129:[2,154],130:[2,154],135:[2,154],136:[2,154],137:[2,154],138:[2,154],139:[2,154],140:[2,154],141:[2,154]},{82:189,85:[1,104]},{1:[2,69],6:[2,69],25:[2,69],26:[2,69],40:[2,69],49:[2,69],54:[2,69],57:[2,69],66:[2,69],67:[2,69],68:[2,69],69:[2,69],71:[2,69],73:[2,69],74:[2,69],78:[2,69],80:[2,69],84:[2,69],85:[2,69],86:[2,69],91:[2,69],93:[2,69],102:[2,69],104:[2,69],105:[2,69],106:[2,69],110:[2,69],118:[2,69],126:[2,69],129:[2,69],130:[2,69],133:[2,69],134:[2,69],135:[2,69],136:[2,69],137:[2,69],138:[2,69],139:[2,69],140:[2,69],141:[2,69],142:[2,69]},{85:[2,109]},{27:190,28:[1,73]},{27:191,28:[1,73]},{1:[2,84],6:[2,84],25:[2,84],26:[2,84],27:192,28:[1,73],40:[2,84],49:[2,84],54:[2,84],57:[2,84],66:[2,84],67:[2,84],68:[2,84],69:[2,84],71:[2,84],73:[2,84],74:[2,84],78:[2,84],80:[2,84],84:[2,84],85:[2,84],86:[2,84],91:[2,84],93:[2,84],102:[2,84],104:[2,84],105:[2,84],106:[2,84],110:[2,84],118:[2,84],126:[2,84],129:[2,84],130:[2,84],133:[2,84],134:[2,84],135:[2,84],136:[2,84],137:[2,84],138:[2,84],139:[2,84],140:[2,84],141:[2,84],142:[2,84]},{27:193,28:[1,73]},{1:[2,85],6:[2,85],25:[2,85],26:[2,85],40:[2,85],49:[2,85],54:[2,85],57:[2,85],66:[2,85],67:[2,85],68:[2,85],69:[2,85],71:[2,85],73:[2,85],74:[2,85],78:[2,85],80:[2,85],84:[2,85],85:[2,85],86:[2,85],91:[2,85],93:[2,85],102:[2,85],104:[2,85],105:[2,85],106:[2,85],110:[2,85],118:[2,85],126:[2,85],129:[2,85],130:[2,85],133:[2,85],134:[2,85],135:[2,85],136:[2,85],137:[2,85],138:[2,85],139:[2,85],140:[2,85],141:[2,85],142:[2,85]},{7:195,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],57:[1,199],58:47,59:48,61:36,63:23,64:24,65:25,72:194,75:196,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],92:197,93:[1,198],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{70:200,71:[1,98],74:[1,99]},{82:201,85:[1,104]},{1:[2,70],6:[2,70],25:[2,70],26:[2,70],40:[2,70],49:[2,70],54:[2,70],57:[2,70],66:[2,70],67:[2,70],68:[2,70],69:[2,70],71:[2,70],73:[2,70],74:[2,70],78:[2,70],80:[2,70],84:[2,70],85:[2,70],86:[2,70],91:[2,70],93:[2,70],102:[2,70],104:[2,70],105:[2,70],106:[2,70],110:[2,70],118:[2,70],126:[2,70],129:[2,70],130:[2,70],133:[2,70],134:[2,70],135:[2,70],136:[2,70],137:[2,70],138:[2,70],139:[2,70],140:[2,70],141:[2,70],142:[2,70]},{6:[1,203],7:202,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,204],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,107],6:[2,107],25:[2,107],26:[2,107],49:[2,107],54:[2,107],57:[2,107],66:[2,107],67:[2,107],68:[2,107],69:[2,107],71:[2,107],73:[2,107],74:[2,107],78:[2,107],84:[2,107],85:[2,107],86:[2,107],91:[2,107],93:[2,107],102:[2,107],104:[2,107],105:[2,107],106:[2,107],110:[2,107],118:[2,107],126:[2,107],129:[2,107],130:[2,107],135:[2,107],136:[2,107],137:[2,107],138:[2,107],139:[2,107],140:[2,107],141:[2,107]},{7:207,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,151],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],57:[1,153],58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],86:[1,205],87:206,88:[1,58],89:[1,59],90:[1,57],94:150,96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{6:[2,52],25:[2,52],49:[1,208],53:210,54:[1,209]},{6:[2,55],25:[2,55],26:[2,55],49:[2,55],54:[2,55]},{6:[2,59],25:[2,59],26:[2,59],40:[1,212],49:[2,59],54:[2,59],57:[1,211]},{6:[2,62],25:[2,62],26:[2,62],49:[2,62],54:[2,62]},{6:[2,63],25:[2,63],26:[2,63],40:[2,63],49:[2,63],54:[2,63],57:[2,63]},{6:[2,64],25:[2,64],26:[2,64],40:[2,64],49:[2,64],54:[2,64],57:[2,64]},{6:[2,65],25:[2,65],26:[2,65],40:[2,65],49:[2,65],54:[2,65],57:[2,65]},{6:[2,66],25:[2,66],26:[2,66],40:[2,66],49:[2,66],54:[2,66],57:[2,66]},{27:154,28:[1,73]},{7:207,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,151],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],57:[1,153],58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],87:149,88:[1,58],89:[1,59],90:[1,57],91:[1,148],94:150,96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,49],6:[2,49],25:[2,49],26:[2,49],49:[2,49],54:[2,49],57:[2,49],73:[2,49],78:[2,49],86:[2,49],91:[2,49],93:[2,49],102:[2,49],104:[2,49],105:[2,49],106:[2,49],110:[2,49],118:[2,49],126:[2,49],129:[2,49],130:[2,49],135:[2,49],136:[2,49],137:[2,49],138:[2,49],139:[2,49],140:[2,49],141:[2,49]},{4:214,5:3,7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,26:[1,213],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,188],6:[2,188],25:[2,188],26:[2,188],49:[2,188],54:[2,188],57:[2,188],73:[2,188],78:[2,188],86:[2,188],91:[2,188],93:[2,188],102:[2,188],103:85,104:[2,188],105:[2,188],106:[2,188],109:86,110:[2,188],111:69,118:[2,188],126:[2,188],129:[2,188],130:[2,188],135:[1,75],136:[2,188],137:[2,188],138:[2,188],139:[2,188],140:[2,188],141:[2,188]},{103:88,104:[1,65],106:[1,66],109:89,110:[1,68],111:69,126:[1,87]},{1:[2,189],6:[2,189],25:[2,189],26:[2,189],49:[2,189],54:[2,189],57:[2,189],73:[2,189],78:[2,189],86:[2,189],91:[2,189],93:[2,189],102:[2,189],103:85,104:[2,189],105:[2,189],106:[2,189],109:86,110:[2,189],111:69,118:[2,189],126:[2,189],129:[2,189],130:[2,189],135:[1,75],136:[2,189],137:[1,79],138:[2,189],139:[2,189],140:[2,189],141:[2,189]},{1:[2,190],6:[2,190],25:[2,190],26:[2,190],49:[2,190],54:[2,190],57:[2,190],73:[2,190],78:[2,190],86:[2,190],91:[2,190],93:[2,190],102:[2,190],103:85,104:[2,190],105:[2,190],106:[2,190],109:86,110:[2,190],111:69,118:[2,190],126:[2,190],129:[2,190],130:[2,190],135:[1,75],136:[2,190],137:[1,79],138:[2,190],139:[2,190],140:[2,190],141:[2,190]},{1:[2,191],6:[2,191],25:[2,191],26:[2,191],49:[2,191],54:[2,191],57:[2,191],73:[2,191],78:[2,191],86:[2,191],91:[2,191],93:[2,191],102:[2,191],103:85,104:[2,191],105:[2,191],106:[2,191],109:86,110:[2,191],111:69,118:[2,191],126:[2,191],129:[2,191],130:[2,191],135:[1,75],136:[2,191],137:[1,79],138:[2,191],139:[2,191],140:[2,191],141:[2,191]},{1:[2,192],6:[2,192],25:[2,192],26:[2,192],49:[2,192],54:[2,192],57:[2,192],73:[2,192],78:[2,192],86:[2,192],91:[2,192],93:[2,192],102:[2,192],103:88,104:[2,192],105:[2,192],106:[2,192],109:89,110:[2,192],111:69,118:[2,192],126:[2,192],129:[2,192],130:[2,192],135:[2,192],136:[2,192],137:[2,192],138:[2,192],139:[2,192],140:[2,192],141:[2,192]},{1:[2,193],6:[2,193],25:[2,193],26:[2,193],49:[2,193],54:[2,193],57:[2,193],73:[2,193],78:[2,193],86:[2,193],91:[2,193],93:[2,193],102:[2,193],103:85,104:[2,193],105:[2,193],106:[2,193],109:86,110:[2,193],111:69,118:[2,193],126:[2,193],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{7:215,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,195],6:[2,195],25:[2,195],26:[2,195],49:[2,195],54:[2,195],57:[2,195],66:[2,72],67:[2,72],68:[2,72],69:[2,72],71:[2,72],73:[2,195],74:[2,72],78:[2,195],84:[2,72],85:[2,72],86:[2,195],91:[2,195],93:[2,195],102:[2,195],104:[2,195],105:[2,195],106:[2,195],110:[2,195],118:[2,195],126:[2,195],129:[2,195],130:[2,195],135:[2,195],136:[2,195],137:[2,195],138:[2,195],139:[2,195],140:[2,195],141:[2,195]},{62:91,66:[1,93],67:[1,94],68:[1,95],69:[1,96],70:97,71:[1,98],74:[1,99],81:90,84:[1,92],85:[2,108]},{62:101,66:[1,93],67:[1,94],68:[1,95],69:[1,96],70:97,71:[1,98],74:[1,99],81:100,84:[1,92],85:[2,108]},{66:[2,75],67:[2,75],68:[2,75],69:[2,75],71:[2,75],74:[2,75],84:[2,75],85:[2,75]},{1:[2,196],6:[2,196],25:[2,196],26:[2,196],49:[2,196],54:[2,196],57:[2,196],66:[2,72],67:[2,72],68:[2,72],69:[2,72],71:[2,72],73:[2,196],74:[2,72],78:[2,196],84:[2,72],85:[2,72],86:[2,196],91:[2,196],93:[2,196],102:[2,196],104:[2,196],105:[2,196],106:[2,196],110:[2,196],118:[2,196],126:[2,196],129:[2,196],130:[2,196],135:[2,196],136:[2,196],137:[2,196],138:[2,196],139:[2,196],140:[2,196],141:[2,196]},{1:[2,197],6:[2,197],25:[2,197],26:[2,197],49:[2,197],54:[2,197],57:[2,197],73:[2,197],78:[2,197],86:[2,197],91:[2,197],93:[2,197],102:[2,197],104:[2,197],105:[2,197],106:[2,197],110:[2,197],118:[2,197],126:[2,197],129:[2,197],130:[2,197],135:[2,197],136:[2,197],137:[2,197],138:[2,197],139:[2,197],140:[2,197],141:[2,197]},{1:[2,198],6:[2,198],25:[2,198],26:[2,198],49:[2,198],54:[2,198],57:[2,198],73:[2,198],78:[2,198],86:[2,198],91:[2,198],93:[2,198],102:[2,198],104:[2,198],105:[2,198],106:[2,198],110:[2,198],118:[2,198],126:[2,198],129:[2,198],130:[2,198],135:[2,198],136:[2,198],137:[2,198],138:[2,198],139:[2,198],140:[2,198],141:[2,198]},{6:[1,218],7:216,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,217],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:219,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{24:220,25:[1,116],125:[1,221]},{1:[2,134],6:[2,134],25:[2,134],26:[2,134],49:[2,134],54:[2,134],57:[2,134],73:[2,134],78:[2,134],86:[2,134],91:[2,134],93:[2,134],97:222,98:[1,223],99:[1,224],102:[2,134],104:[2,134],105:[2,134],106:[2,134],110:[2,134],118:[2,134],126:[2,134],129:[2,134],130:[2,134],135:[2,134],136:[2,134],137:[2,134],138:[2,134],139:[2,134],140:[2,134],141:[2,134]},{1:[2,148],6:[2,148],25:[2,148],26:[2,148],49:[2,148],54:[2,148],57:[2,148],73:[2,148],78:[2,148],86:[2,148],91:[2,148],93:[2,148],102:[2,148],104:[2,148],105:[2,148],106:[2,148],110:[2,148],118:[2,148],126:[2,148],129:[2,148],130:[2,148],135:[2,148],136:[2,148],137:[2,148],138:[2,148],139:[2,148],140:[2,148],141:[2,148]},{1:[2,156],6:[2,156],25:[2,156],26:[2,156],49:[2,156],54:[2,156],57:[2,156],73:[2,156],78:[2,156],86:[2,156],91:[2,156],93:[2,156],102:[2,156],104:[2,156],105:[2,156],106:[2,156],110:[2,156],118:[2,156],126:[2,156],129:[2,156],130:[2,156],135:[2,156],136:[2,156],137:[2,156],138:[2,156],139:[2,156],140:[2,156],141:[2,156]},{25:[1,225],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{120:226,122:227,123:[1,228]},{1:[2,97],6:[2,97],25:[2,97],26:[2,97],49:[2,97],54:[2,97],57:[2,97],73:[2,97],78:[2,97],86:[2,97],91:[2,97],93:[2,97],102:[2,97],104:[2,97],105:[2,97],106:[2,97],110:[2,97],118:[2,97],126:[2,97],129:[2,97],130:[2,97],135:[2,97],136:[2,97],137:[2,97],138:[2,97],139:[2,97],140:[2,97],141:[2,97]},{7:229,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,100],6:[2,100],24:230,25:[1,116],26:[2,100],49:[2,100],54:[2,100],57:[2,100],66:[2,72],67:[2,72],68:[2,72],69:[2,72],71:[2,72],73:[2,100],74:[2,72],78:[2,100],80:[1,231],84:[2,72],85:[2,72],86:[2,100],91:[2,100],93:[2,100],102:[2,100],104:[2,100],105:[2,100],106:[2,100],110:[2,100],118:[2,100],126:[2,100],129:[2,100],130:[2,100],135:[2,100],136:[2,100],137:[2,100],138:[2,100],139:[2,100],140:[2,100],141:[2,100]},{1:[2,141],6:[2,141],25:[2,141],26:[2,141],49:[2,141],54:[2,141],57:[2,141],73:[2,141],78:[2,141],86:[2,141],91:[2,141],93:[2,141],102:[2,141],103:85,104:[2,141],105:[2,141],106:[2,141],109:86,110:[2,141],111:69,118:[2,141],126:[2,141],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,45],6:[2,45],25:[2,45],26:[2,45],49:[2,45],54:[2,45],57:[2,45],73:[2,45],78:[2,45],86:[2,45],91:[2,45],93:[2,45],102:[2,45],103:85,104:[2,45],105:[2,45],106:[2,45],109:86,110:[2,45],111:69,118:[2,45],126:[2,45],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{6:[1,74],102:[1,232]},{4:233,5:3,7:4,8:5,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{6:[2,129],25:[2,129],54:[2,129],57:[1,235],91:[2,129],92:234,93:[1,198],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,115],6:[2,115],25:[2,115],26:[2,115],40:[2,115],49:[2,115],54:[2,115],57:[2,115],66:[2,115],67:[2,115],68:[2,115],69:[2,115],71:[2,115],73:[2,115],74:[2,115],78:[2,115],84:[2,115],85:[2,115],86:[2,115],91:[2,115],93:[2,115],102:[2,115],104:[2,115],105:[2,115],106:[2,115],110:[2,115],116:[2,115],117:[2,115],118:[2,115],126:[2,115],129:[2,115],130:[2,115],135:[2,115],136:[2,115],137:[2,115],138:[2,115],139:[2,115],140:[2,115],141:[2,115]},{6:[2,52],25:[2,52],53:236,54:[1,237],91:[2,52]},{6:[2,124],25:[2,124],26:[2,124],54:[2,124],86:[2,124],91:[2,124]},{7:207,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,151],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],57:[1,153],58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],87:238,88:[1,58],89:[1,59],90:[1,57],94:150,96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{6:[2,130],25:[2,130],26:[2,130],54:[2,130],86:[2,130],91:[2,130]},{6:[2,131],25:[2,131],26:[2,131],54:[2,131],86:[2,131],91:[2,131]},{1:[2,114],6:[2,114],25:[2,114],26:[2,114],40:[2,114],43:[2,114],49:[2,114],54:[2,114],57:[2,114],66:[2,114],67:[2,114],68:[2,114],69:[2,114],71:[2,114],73:[2,114],74:[2,114],78:[2,114],80:[2,114],84:[2,114],85:[2,114],86:[2,114],91:[2,114],93:[2,114],102:[2,114],104:[2,114],105:[2,114],106:[2,114],110:[2,114],116:[2,114],117:[2,114],118:[2,114],126:[2,114],129:[2,114],130:[2,114],133:[2,114],134:[2,114],135:[2,114],136:[2,114],137:[2,114],138:[2,114],139:[2,114],140:[2,114],141:[2,114],142:[2,114]},{24:239,25:[1,116],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,144],6:[2,144],25:[2,144],26:[2,144],49:[2,144],54:[2,144],57:[2,144],73:[2,144],78:[2,144],86:[2,144],91:[2,144],93:[2,144],102:[2,144],103:85,104:[1,65],105:[1,240],106:[1,66],109:86,110:[1,68],111:69,118:[2,144],126:[2,144],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,146],6:[2,146],25:[2,146],26:[2,146],49:[2,146],54:[2,146],57:[2,146],73:[2,146],78:[2,146],86:[2,146],91:[2,146],93:[2,146],102:[2,146],103:85,104:[1,65],105:[1,241],106:[1,66],109:86,110:[1,68],111:69,118:[2,146],126:[2,146],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,152],6:[2,152],25:[2,152],26:[2,152],49:[2,152],54:[2,152],57:[2,152],73:[2,152],78:[2,152],86:[2,152],91:[2,152],93:[2,152],102:[2,152],104:[2,152],105:[2,152],106:[2,152],110:[2,152],118:[2,152],126:[2,152],129:[2,152],130:[2,152],135:[2,152],136:[2,152],137:[2,152],138:[2,152],139:[2,152],140:[2,152],141:[2,152]},{1:[2,153],6:[2,153],25:[2,153],26:[2,153],49:[2,153],54:[2,153],57:[2,153],73:[2,153],78:[2,153],86:[2,153],91:[2,153],93:[2,153],102:[2,153],103:85,104:[1,65],105:[2,153],106:[1,66],109:86,110:[1,68],111:69,118:[2,153],126:[2,153],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,157],6:[2,157],25:[2,157],26:[2,157],49:[2,157],54:[2,157],57:[2,157],73:[2,157],78:[2,157],86:[2,157],91:[2,157],93:[2,157],102:[2,157],104:[2,157],105:[2,157],106:[2,157],110:[2,157],118:[2,157],126:[2,157],129:[2,157],130:[2,157],135:[2,157],136:[2,157],137:[2,157],138:[2,157],139:[2,157],140:[2,157],141:[2,157]},{116:[2,159],117:[2,159]},{27:164,28:[1,73],44:165,58:166,59:167,76:[1,70],89:[1,113],90:[1,114],113:242,115:163},{54:[1,243],116:[2,165],117:[2,165]},{54:[2,161],116:[2,161],117:[2,161]},{54:[2,162],116:[2,162],117:[2,162]},{54:[2,163],116:[2,163],117:[2,163]},{54:[2,164],116:[2,164],117:[2,164]},{1:[2,158],6:[2,158],25:[2,158],26:[2,158],49:[2,158],54:[2,158],57:[2,158],73:[2,158],78:[2,158],86:[2,158],91:[2,158],93:[2,158],102:[2,158],104:[2,158],105:[2,158],106:[2,158],110:[2,158],118:[2,158],126:[2,158],129:[2,158],130:[2,158],135:[2,158],136:[2,158],137:[2,158],138:[2,158],139:[2,158],140:[2,158],141:[2,158]},{7:244,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:245,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{6:[2,52],25:[2,52],53:246,54:[1,247],78:[2,52]},{6:[2,92],25:[2,92],26:[2,92],54:[2,92],78:[2,92]},{6:[2,38],25:[2,38],26:[2,38],43:[1,248],54:[2,38],78:[2,38]},{6:[2,41],25:[2,41],26:[2,41],54:[2,41],78:[2,41]},{6:[2,42],25:[2,42],26:[2,42],43:[2,42],54:[2,42],78:[2,42]},{6:[2,43],25:[2,43],26:[2,43],43:[2,43],54:[2,43],78:[2,43]},{6:[2,44],25:[2,44],26:[2,44],43:[2,44],54:[2,44],78:[2,44]},{1:[2,4],6:[2,4],26:[2,4],102:[2,4]},{1:[2,200],6:[2,200],25:[2,200],26:[2,200],49:[2,200],54:[2,200],57:[2,200],73:[2,200],78:[2,200],86:[2,200],91:[2,200],93:[2,200],102:[2,200],103:85,104:[2,200],105:[2,200],106:[2,200],109:86,110:[2,200],111:69,118:[2,200],126:[2,200],129:[2,200],130:[2,200],135:[1,75],136:[1,78],137:[1,79],138:[2,200],139:[2,200],140:[2,200],141:[2,200]},{1:[2,201],6:[2,201],25:[2,201],26:[2,201],49:[2,201],54:[2,201],57:[2,201],73:[2,201],78:[2,201],86:[2,201],91:[2,201],93:[2,201],102:[2,201],103:85,104:[2,201],105:[2,201],106:[2,201],109:86,110:[2,201],111:69,118:[2,201],126:[2,201],129:[2,201],130:[2,201],135:[1,75],136:[1,78],137:[1,79],138:[2,201],139:[2,201],140:[2,201],141:[2,201]},{1:[2,202],6:[2,202],25:[2,202],26:[2,202],49:[2,202],54:[2,202],57:[2,202],73:[2,202],78:[2,202],86:[2,202],91:[2,202],93:[2,202],102:[2,202],103:85,104:[2,202],105:[2,202],106:[2,202],109:86,110:[2,202],111:69,118:[2,202],126:[2,202],129:[2,202],130:[2,202],135:[1,75],136:[2,202],137:[1,79],138:[2,202],139:[2,202],140:[2,202],141:[2,202]},{1:[2,203],6:[2,203],25:[2,203],26:[2,203],49:[2,203],54:[2,203],57:[2,203],73:[2,203],78:[2,203],86:[2,203],91:[2,203],93:[2,203],102:[2,203],103:85,104:[2,203],105:[2,203],106:[2,203],109:86,110:[2,203],111:69,118:[2,203],126:[2,203],129:[2,203],130:[2,203],135:[1,75],136:[2,203],137:[1,79],138:[2,203],139:[2,203],140:[2,203],141:[2,203]},{1:[2,204],6:[2,204],25:[2,204],26:[2,204],49:[2,204],54:[2,204],57:[2,204],73:[2,204],78:[2,204],86:[2,204],91:[2,204],93:[2,204],102:[2,204],103:85,104:[2,204],105:[2,204],106:[2,204],109:86,110:[2,204],111:69,118:[2,204],126:[2,204],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[2,204],139:[2,204],140:[2,204],141:[2,204]},{1:[2,205],6:[2,205],25:[2,205],26:[2,205],49:[2,205],54:[2,205],57:[2,205],73:[2,205],78:[2,205],86:[2,205],91:[2,205],93:[2,205],102:[2,205],103:85,104:[2,205],105:[2,205],106:[2,205],109:86,110:[2,205],111:69,118:[2,205],126:[2,205],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[2,205],140:[2,205],141:[1,83]},{1:[2,206],6:[2,206],25:[2,206],26:[2,206],49:[2,206],54:[2,206],57:[2,206],73:[2,206],78:[2,206],86:[2,206],91:[2,206],93:[2,206],102:[2,206],103:85,104:[2,206],105:[2,206],106:[2,206],109:86,110:[2,206],111:69,118:[2,206],126:[2,206],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[2,206],141:[1,83]},{1:[2,207],6:[2,207],25:[2,207],26:[2,207],49:[2,207],54:[2,207],57:[2,207],73:[2,207],78:[2,207],86:[2,207],91:[2,207],93:[2,207],102:[2,207],103:85,104:[2,207],105:[2,207],106:[2,207],109:86,110:[2,207],111:69,118:[2,207],126:[2,207],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[2,207],140:[2,207],141:[2,207]},{1:[2,187],6:[2,187],25:[2,187],26:[2,187],49:[2,187],54:[2,187],57:[2,187],73:[2,187],78:[2,187],86:[2,187],91:[2,187],93:[2,187],102:[2,187],103:85,104:[1,65],105:[2,187],106:[1,66],109:86,110:[1,68],111:69,118:[2,187],126:[2,187],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,186],6:[2,186],25:[2,186],26:[2,186],49:[2,186],54:[2,186],57:[2,186],73:[2,186],78:[2,186],86:[2,186],91:[2,186],93:[2,186],102:[2,186],103:85,104:[1,65],105:[2,186],106:[1,66],109:86,110:[1,68],111:69,118:[2,186],126:[2,186],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,104],6:[2,104],25:[2,104],26:[2,104],49:[2,104],54:[2,104],57:[2,104],66:[2,104],67:[2,104],68:[2,104],69:[2,104],71:[2,104],73:[2,104],74:[2,104],78:[2,104],84:[2,104],85:[2,104],86:[2,104],91:[2,104],93:[2,104],102:[2,104],104:[2,104],105:[2,104],106:[2,104],110:[2,104],118:[2,104],126:[2,104],129:[2,104],130:[2,104],135:[2,104],136:[2,104],137:[2,104],138:[2,104],139:[2,104],140:[2,104],141:[2,104]},{1:[2,80],6:[2,80],25:[2,80],26:[2,80],40:[2,80],49:[2,80],54:[2,80],57:[2,80],66:[2,80],67:[2,80],68:[2,80],69:[2,80],71:[2,80],73:[2,80],74:[2,80],78:[2,80],80:[2,80],84:[2,80],85:[2,80],86:[2,80],91:[2,80],93:[2,80],102:[2,80],104:[2,80],105:[2,80],106:[2,80],110:[2,80],118:[2,80],126:[2,80],129:[2,80],130:[2,80],133:[2,80],134:[2,80],135:[2,80],136:[2,80],137:[2,80],138:[2,80],139:[2,80],140:[2,80],141:[2,80],142:[2,80]},{1:[2,81],6:[2,81],25:[2,81],26:[2,81],40:[2,81],49:[2,81],54:[2,81],57:[2,81],66:[2,81],67:[2,81],68:[2,81],69:[2,81],71:[2,81],73:[2,81],74:[2,81],78:[2,81],80:[2,81],84:[2,81],85:[2,81],86:[2,81],91:[2,81],93:[2,81],102:[2,81],104:[2,81],105:[2,81],106:[2,81],110:[2,81],118:[2,81],126:[2,81],129:[2,81],130:[2,81],133:[2,81],134:[2,81],135:[2,81],136:[2,81],137:[2,81],138:[2,81],139:[2,81],140:[2,81],141:[2,81],142:[2,81]},{1:[2,82],6:[2,82],25:[2,82],26:[2,82],40:[2,82],49:[2,82],54:[2,82],57:[2,82],66:[2,82],67:[2,82],68:[2,82],69:[2,82],71:[2,82],73:[2,82],74:[2,82],78:[2,82],80:[2,82],84:[2,82],85:[2,82],86:[2,82],91:[2,82],93:[2,82],102:[2,82],104:[2,82],105:[2,82],106:[2,82],110:[2,82],118:[2,82],126:[2,82],129:[2,82],130:[2,82],133:[2,82],134:[2,82],135:[2,82],136:[2,82],137:[2,82],138:[2,82],139:[2,82],140:[2,82],141:[2,82],142:[2,82]},{1:[2,83],6:[2,83],25:[2,83],26:[2,83],40:[2,83],49:[2,83],54:[2,83],57:[2,83],66:[2,83],67:[2,83],68:[2,83],69:[2,83],71:[2,83],73:[2,83],74:[2,83],78:[2,83],80:[2,83],84:[2,83],85:[2,83],86:[2,83],91:[2,83],93:[2,83],102:[2,83],104:[2,83],105:[2,83],106:[2,83],110:[2,83],118:[2,83],126:[2,83],129:[2,83],130:[2,83],133:[2,83],134:[2,83],135:[2,83],136:[2,83],137:[2,83],138:[2,83],139:[2,83],140:[2,83],141:[2,83],142:[2,83]},{73:[1,249]},{57:[1,199],73:[2,88],92:250,93:[1,198],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{73:[2,89]},{7:251,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,73:[2,123],76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{11:[2,117],28:[2,117],30:[2,117],31:[2,117],33:[2,117],34:[2,117],35:[2,117],36:[2,117],37:[2,117],38:[2,117],45:[2,117],46:[2,117],47:[2,117],51:[2,117],52:[2,117],73:[2,117],76:[2,117],79:[2,117],83:[2,117],88:[2,117],89:[2,117],90:[2,117],96:[2,117],100:[2,117],101:[2,117],104:[2,117],106:[2,117],108:[2,117],110:[2,117],119:[2,117],125:[2,117],127:[2,117],128:[2,117],129:[2,117],130:[2,117],131:[2,117],133:[2,117],134:[2,117]},{11:[2,118],28:[2,118],30:[2,118],31:[2,118],33:[2,118],34:[2,118],35:[2,118],36:[2,118],37:[2,118],38:[2,118],45:[2,118],46:[2,118],47:[2,118],51:[2,118],52:[2,118],73:[2,118],76:[2,118],79:[2,118],83:[2,118],88:[2,118],89:[2,118],90:[2,118],96:[2,118],100:[2,118],101:[2,118],104:[2,118],106:[2,118],108:[2,118],110:[2,118],119:[2,118],125:[2,118],127:[2,118],128:[2,118],129:[2,118],130:[2,118],131:[2,118],133:[2,118],134:[2,118]},{1:[2,87],6:[2,87],25:[2,87],26:[2,87],40:[2,87],49:[2,87],54:[2,87],57:[2,87],66:[2,87],67:[2,87],68:[2,87],69:[2,87],71:[2,87],73:[2,87],74:[2,87],78:[2,87],80:[2,87],84:[2,87],85:[2,87],86:[2,87],91:[2,87],93:[2,87],102:[2,87],104:[2,87],105:[2,87],106:[2,87],110:[2,87],118:[2,87],126:[2,87],129:[2,87],130:[2,87],133:[2,87],134:[2,87],135:[2,87],136:[2,87],137:[2,87],138:[2,87],139:[2,87],140:[2,87],141:[2,87],142:[2,87]},{1:[2,105],6:[2,105],25:[2,105],26:[2,105],49:[2,105],54:[2,105],57:[2,105],66:[2,105],67:[2,105],68:[2,105],69:[2,105],71:[2,105],73:[2,105],74:[2,105],78:[2,105],84:[2,105],85:[2,105],86:[2,105],91:[2,105],93:[2,105],102:[2,105],104:[2,105],105:[2,105],106:[2,105],110:[2,105],118:[2,105],126:[2,105],129:[2,105],130:[2,105],135:[2,105],136:[2,105],137:[2,105],138:[2,105],139:[2,105],140:[2,105],141:[2,105]},{1:[2,35],6:[2,35],25:[2,35],26:[2,35],49:[2,35],54:[2,35],57:[2,35],73:[2,35],78:[2,35],86:[2,35],91:[2,35],93:[2,35],102:[2,35],103:85,104:[2,35],105:[2,35],106:[2,35],109:86,110:[2,35],111:69,118:[2,35],126:[2,35],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{7:252,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:253,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,110],6:[2,110],25:[2,110],26:[2,110],49:[2,110],54:[2,110],57:[2,110],66:[2,110],67:[2,110],68:[2,110],69:[2,110],71:[2,110],73:[2,110],74:[2,110],78:[2,110],84:[2,110],85:[2,110],86:[2,110],91:[2,110],93:[2,110],102:[2,110],104:[2,110],105:[2,110],106:[2,110],110:[2,110],118:[2,110],126:[2,110],129:[2,110],130:[2,110],135:[2,110],136:[2,110],137:[2,110],138:[2,110],139:[2,110],140:[2,110],141:[2,110]},{6:[2,52],25:[2,52],53:254,54:[1,237],86:[2,52]},{6:[2,129],25:[2,129],26:[2,129],54:[2,129],57:[1,255],86:[2,129],91:[2,129],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{50:256,51:[1,60],52:[1,61]},{6:[2,53],25:[2,53],26:[2,53],27:109,28:[1,73],44:110,55:257,56:107,57:[1,108],58:111,59:112,76:[1,70],89:[1,113],90:[1,114]},{6:[1,258],25:[1,259]},{6:[2,60],25:[2,60],26:[2,60],49:[2,60],54:[2,60]},{7:260,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,23],6:[2,23],25:[2,23],26:[2,23],49:[2,23],54:[2,23],57:[2,23],73:[2,23],78:[2,23],86:[2,23],91:[2,23],93:[2,23],98:[2,23],99:[2,23],102:[2,23],104:[2,23],105:[2,23],106:[2,23],110:[2,23],118:[2,23],121:[2,23],123:[2,23],126:[2,23],129:[2,23],130:[2,23],135:[2,23],136:[2,23],137:[2,23],138:[2,23],139:[2,23],140:[2,23],141:[2,23]},{6:[1,74],26:[1,261]},{1:[2,194],6:[2,194],25:[2,194],26:[2,194],49:[2,194],54:[2,194],57:[2,194],73:[2,194],78:[2,194],86:[2,194],91:[2,194],93:[2,194],102:[2,194],103:85,104:[2,194],105:[2,194],106:[2,194],109:86,110:[2,194],111:69,118:[2,194],126:[2,194],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,208],6:[2,208],25:[2,208],26:[2,208],49:[2,208],54:[2,208],57:[2,208],73:[2,208],78:[2,208],86:[2,208],91:[2,208],93:[2,208],102:[2,208],103:85,104:[2,208],105:[2,208],106:[2,208],109:86,110:[2,208],111:69,118:[2,208],126:[2,208],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{7:262,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:263,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,211],6:[2,211],25:[2,211],26:[2,211],49:[2,211],54:[2,211],57:[2,211],73:[2,211],78:[2,211],86:[2,211],91:[2,211],93:[2,211],102:[2,211],103:85,104:[2,211],105:[2,211],106:[2,211],109:86,110:[2,211],111:69,118:[2,211],126:[2,211],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,185],6:[2,185],25:[2,185],26:[2,185],49:[2,185],54:[2,185],57:[2,185],73:[2,185],78:[2,185],86:[2,185],91:[2,185],93:[2,185],102:[2,185],104:[2,185],105:[2,185],106:[2,185],110:[2,185],118:[2,185],126:[2,185],129:[2,185],130:[2,185],135:[2,185],136:[2,185],137:[2,185],138:[2,185],139:[2,185],140:[2,185],141:[2,185]},{7:264,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,135],6:[2,135],25:[2,135],26:[2,135],49:[2,135],54:[2,135],57:[2,135],73:[2,135],78:[2,135],86:[2,135],91:[2,135],93:[2,135],98:[1,265],102:[2,135],104:[2,135],105:[2,135],106:[2,135],110:[2,135],118:[2,135],126:[2,135],129:[2,135],130:[2,135],135:[2,135],136:[2,135],137:[2,135],138:[2,135],139:[2,135],140:[2,135],141:[2,135]},{24:266,25:[1,116]},{24:269,25:[1,116],27:267,28:[1,73],59:268,76:[1,70]},{120:270,122:227,123:[1,228]},{26:[1,271],121:[1,272],122:273,123:[1,228]},{26:[2,178],121:[2,178],123:[2,178]},{7:275,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],95:274,96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,98],6:[2,98],24:276,25:[1,116],26:[2,98],49:[2,98],54:[2,98],57:[2,98],73:[2,98],78:[2,98],86:[2,98],91:[2,98],93:[2,98],102:[2,98],103:85,104:[1,65],105:[2,98],106:[1,66],109:86,110:[1,68],111:69,118:[2,98],126:[2,98],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,101],6:[2,101],25:[2,101],26:[2,101],49:[2,101],54:[2,101],57:[2,101],73:[2,101],78:[2,101],86:[2,101],91:[2,101],93:[2,101],102:[2,101],104:[2,101],105:[2,101],106:[2,101],110:[2,101],118:[2,101],126:[2,101],129:[2,101],130:[2,101],135:[2,101],136:[2,101],137:[2,101],138:[2,101],139:[2,101],140:[2,101],141:[2,101]},{7:277,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,142],6:[2,142],25:[2,142],26:[2,142],49:[2,142],54:[2,142],57:[2,142],66:[2,142],67:[2,142],68:[2,142],69:[2,142],71:[2,142],73:[2,142],74:[2,142],78:[2,142],84:[2,142],85:[2,142],86:[2,142],91:[2,142],93:[2,142],102:[2,142],104:[2,142],105:[2,142],106:[2,142],110:[2,142],118:[2,142],126:[2,142],129:[2,142],130:[2,142],135:[2,142],136:[2,142],137:[2,142],138:[2,142],139:[2,142],140:[2,142],141:[2,142]},{6:[1,74],26:[1,278]},{7:279,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{6:[2,67],11:[2,118],25:[2,67],28:[2,118],30:[2,118],31:[2,118],33:[2,118],34:[2,118],35:[2,118],36:[2,118],37:[2,118],38:[2,118],45:[2,118],46:[2,118],47:[2,118],51:[2,118],52:[2,118],54:[2,67],76:[2,118],79:[2,118],83:[2,118],88:[2,118],89:[2,118],90:[2,118],91:[2,67],96:[2,118],100:[2,118],101:[2,118],104:[2,118],106:[2,118],108:[2,118],110:[2,118],119:[2,118],125:[2,118],127:[2,118],128:[2,118],129:[2,118],130:[2,118],131:[2,118],133:[2,118],134:[2,118]},{6:[1,281],25:[1,282],91:[1,280]},{6:[2,53],7:207,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[2,53],26:[2,53],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],57:[1,153],58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],86:[2,53],88:[1,58],89:[1,59],90:[1,57],91:[2,53],94:283,96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{6:[2,52],25:[2,52],26:[2,52],53:284,54:[1,237]},{1:[2,182],6:[2,182],25:[2,182],26:[2,182],49:[2,182],54:[2,182],57:[2,182],73:[2,182],78:[2,182],86:[2,182],91:[2,182],93:[2,182],102:[2,182],104:[2,182],105:[2,182],106:[2,182],110:[2,182],118:[2,182],121:[2,182],126:[2,182],129:[2,182],130:[2,182],135:[2,182],136:[2,182],137:[2,182],138:[2,182],139:[2,182],140:[2,182],141:[2,182]},{7:285,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:286,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{116:[2,160],117:[2,160]},{27:164,28:[1,73],44:165,58:166,59:167,76:[1,70],89:[1,113],90:[1,114],115:287},{1:[2,167],6:[2,167],25:[2,167],26:[2,167],49:[2,167],54:[2,167],57:[2,167],73:[2,167],78:[2,167],86:[2,167],91:[2,167],93:[2,167],102:[2,167],103:85,104:[2,167],105:[1,288],106:[2,167],109:86,110:[2,167],111:69,118:[1,289],126:[2,167],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,168],6:[2,168],25:[2,168],26:[2,168],49:[2,168],54:[2,168],57:[2,168],73:[2,168],78:[2,168],86:[2,168],91:[2,168],93:[2,168],102:[2,168],103:85,104:[2,168],105:[1,290],106:[2,168],109:86,110:[2,168],111:69,118:[2,168],126:[2,168],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{6:[1,292],25:[1,293],78:[1,291]},{6:[2,53],10:174,25:[2,53],26:[2,53],27:175,28:[1,73],29:176,30:[1,71],31:[1,72],41:294,42:173,44:177,46:[1,46],78:[2,53],89:[1,113]},{7:295,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,296],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,86],6:[2,86],25:[2,86],26:[2,86],40:[2,86],49:[2,86],54:[2,86],57:[2,86],66:[2,86],67:[2,86],68:[2,86],69:[2,86],71:[2,86],73:[2,86],74:[2,86],78:[2,86],80:[2,86],84:[2,86],85:[2,86],86:[2,86],91:[2,86],93:[2,86],102:[2,86],104:[2,86],105:[2,86],106:[2,86],110:[2,86],118:[2,86],126:[2,86],129:[2,86],130:[2,86],133:[2,86],134:[2,86],135:[2,86],136:[2,86],137:[2,86],138:[2,86],139:[2,86],140:[2,86],141:[2,86],142:[2,86]},{7:297,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,73:[2,121],76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{73:[2,122],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,36],6:[2,36],25:[2,36],26:[2,36],49:[2,36],54:[2,36],57:[2,36],73:[2,36],78:[2,36],86:[2,36],91:[2,36],93:[2,36],102:[2,36],103:85,104:[2,36],105:[2,36],106:[2,36],109:86,110:[2,36],111:69,118:[2,36],126:[2,36],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{26:[1,298],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{6:[1,281],25:[1,282],86:[1,299]},{6:[2,67],25:[2,67],26:[2,67],54:[2,67],86:[2,67],91:[2,67]},{24:300,25:[1,116]},{6:[2,56],25:[2,56],26:[2,56],49:[2,56],54:[2,56]},{27:109,28:[1,73],44:110,55:301,56:107,57:[1,108],58:111,59:112,76:[1,70],89:[1,113],90:[1,114]},{6:[2,54],25:[2,54],26:[2,54],27:109,28:[1,73],44:110,48:302,54:[2,54],55:106,56:107,57:[1,108],58:111,59:112,76:[1,70],89:[1,113],90:[1,114]},{6:[2,61],25:[2,61],26:[2,61],49:[2,61],54:[2,61],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,24],6:[2,24],25:[2,24],26:[2,24],49:[2,24],54:[2,24],57:[2,24],73:[2,24],78:[2,24],86:[2,24],91:[2,24],93:[2,24],98:[2,24],99:[2,24],102:[2,24],104:[2,24],105:[2,24],106:[2,24],110:[2,24],118:[2,24],121:[2,24],123:[2,24],126:[2,24],129:[2,24],130:[2,24],135:[2,24],136:[2,24],137:[2,24],138:[2,24],139:[2,24],140:[2,24],141:[2,24]},{26:[1,303],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,210],6:[2,210],25:[2,210],26:[2,210],49:[2,210],54:[2,210],57:[2,210],73:[2,210],78:[2,210],86:[2,210],91:[2,210],93:[2,210],102:[2,210],103:85,104:[2,210],105:[2,210],106:[2,210],109:86,110:[2,210],111:69,118:[2,210],126:[2,210],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{24:304,25:[1,116],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{24:305,25:[1,116]},{1:[2,136],6:[2,136],25:[2,136],26:[2,136],49:[2,136],54:[2,136],57:[2,136],73:[2,136],78:[2,136],86:[2,136],91:[2,136],93:[2,136],102:[2,136],104:[2,136],105:[2,136],106:[2,136],110:[2,136],118:[2,136],126:[2,136],129:[2,136],130:[2,136],135:[2,136],136:[2,136],137:[2,136],138:[2,136],139:[2,136],140:[2,136],141:[2,136]},{24:306,25:[1,116]},{24:307,25:[1,116]},{1:[2,140],6:[2,140],25:[2,140],26:[2,140],49:[2,140],54:[2,140],57:[2,140],73:[2,140],78:[2,140],86:[2,140],91:[2,140],93:[2,140],98:[2,140],102:[2,140],104:[2,140],105:[2,140],106:[2,140],110:[2,140],118:[2,140],126:[2,140],129:[2,140],130:[2,140],135:[2,140],136:[2,140],137:[2,140],138:[2,140],139:[2,140],140:[2,140],141:[2,140]},{26:[1,308],121:[1,309],122:273,123:[1,228]},{1:[2,176],6:[2,176],25:[2,176],26:[2,176],49:[2,176],54:[2,176],57:[2,176],73:[2,176],78:[2,176],86:[2,176],91:[2,176],93:[2,176],102:[2,176],104:[2,176],105:[2,176],106:[2,176],110:[2,176],118:[2,176],126:[2,176],129:[2,176],130:[2,176],135:[2,176],136:[2,176],137:[2,176],138:[2,176],139:[2,176],140:[2,176],141:[2,176]},{24:310,25:[1,116]},{26:[2,179],121:[2,179],123:[2,179]},{24:311,25:[1,116],54:[1,312]},{25:[2,132],54:[2,132],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,99],6:[2,99],25:[2,99],26:[2,99],49:[2,99],54:[2,99],57:[2,99],73:[2,99],78:[2,99],86:[2,99],91:[2,99],93:[2,99],102:[2,99],104:[2,99],105:[2,99],106:[2,99],110:[2,99],118:[2,99],126:[2,99],129:[2,99],130:[2,99],135:[2,99],136:[2,99],137:[2,99],138:[2,99],139:[2,99],140:[2,99],141:[2,99]},{1:[2,102],6:[2,102],24:313,25:[1,116],26:[2,102],49:[2,102],54:[2,102],57:[2,102],73:[2,102],78:[2,102],86:[2,102],91:[2,102],93:[2,102],102:[2,102],103:85,104:[1,65],105:[2,102],106:[1,66],109:86,110:[1,68],111:69,118:[2,102],126:[2,102],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{102:[1,314]},{91:[1,315],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,116],6:[2,116],25:[2,116],26:[2,116],40:[2,116],49:[2,116],54:[2,116],57:[2,116],66:[2,116],67:[2,116],68:[2,116],69:[2,116],71:[2,116],73:[2,116],74:[2,116],78:[2,116],84:[2,116],85:[2,116],86:[2,116],91:[2,116],93:[2,116],102:[2,116],104:[2,116],105:[2,116],106:[2,116],110:[2,116],116:[2,116],117:[2,116],118:[2,116],126:[2,116],129:[2,116],130:[2,116],135:[2,116],136:[2,116],137:[2,116],138:[2,116],139:[2,116],140:[2,116],141:[2,116]},{7:207,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],57:[1,153],58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],94:316,96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:207,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,25:[1,151],27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],57:[1,153],58:47,59:48,60:152,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],87:317,88:[1,58],89:[1,59],90:[1,57],94:150,96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{6:[2,125],25:[2,125],26:[2,125],54:[2,125],86:[2,125],91:[2,125]},{6:[1,281],25:[1,282],26:[1,318]},{1:[2,145],6:[2,145],25:[2,145],26:[2,145],49:[2,145],54:[2,145],57:[2,145],73:[2,145],78:[2,145],86:[2,145],91:[2,145],93:[2,145],102:[2,145],103:85,104:[1,65],105:[2,145],106:[1,66],109:86,110:[1,68],111:69,118:[2,145],126:[2,145],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,147],6:[2,147],25:[2,147],26:[2,147],49:[2,147],54:[2,147],57:[2,147],73:[2,147],78:[2,147],86:[2,147],91:[2,147],93:[2,147],102:[2,147],103:85,104:[1,65],105:[2,147],106:[1,66],109:86,110:[1,68],111:69,118:[2,147],126:[2,147],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{116:[2,166],117:[2,166]},{7:319,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:320,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:321,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,90],6:[2,90],25:[2,90],26:[2,90],40:[2,90],49:[2,90],54:[2,90],57:[2,90],66:[2,90],67:[2,90],68:[2,90],69:[2,90],71:[2,90],73:[2,90],74:[2,90],78:[2,90],84:[2,90],85:[2,90],86:[2,90],91:[2,90],93:[2,90],102:[2,90],104:[2,90],105:[2,90],106:[2,90],110:[2,90],116:[2,90],117:[2,90],118:[2,90],126:[2,90],129:[2,90],130:[2,90],135:[2,90],136:[2,90],137:[2,90],138:[2,90],139:[2,90],140:[2,90],141:[2,90]},{10:174,27:175,28:[1,73],29:176,30:[1,71],31:[1,72],41:322,42:173,44:177,46:[1,46],89:[1,113]},{6:[2,91],10:174,25:[2,91],26:[2,91],27:175,28:[1,73],29:176,30:[1,71],31:[1,72],41:172,42:173,44:177,46:[1,46],54:[2,91],77:323,89:[1,113]},{6:[2,93],25:[2,93],26:[2,93],54:[2,93],78:[2,93]},{6:[2,39],25:[2,39],26:[2,39],54:[2,39],78:[2,39],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{7:324,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{73:[2,120],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,37],6:[2,37],25:[2,37],26:[2,37],49:[2,37],54:[2,37],57:[2,37],73:[2,37],78:[2,37],86:[2,37],91:[2,37],93:[2,37],102:[2,37],104:[2,37],105:[2,37],106:[2,37],110:[2,37],118:[2,37],126:[2,37],129:[2,37],130:[2,37],135:[2,37],136:[2,37],137:[2,37],138:[2,37],139:[2,37],140:[2,37],141:[2,37]},{1:[2,111],6:[2,111],25:[2,111],26:[2,111],49:[2,111],54:[2,111],57:[2,111],66:[2,111],67:[2,111],68:[2,111],69:[2,111],71:[2,111],73:[2,111],74:[2,111],78:[2,111],84:[2,111],85:[2,111],86:[2,111],91:[2,111],93:[2,111],102:[2,111],104:[2,111],105:[2,111],106:[2,111],110:[2,111],118:[2,111],126:[2,111],129:[2,111],130:[2,111],135:[2,111],136:[2,111],137:[2,111],138:[2,111],139:[2,111],140:[2,111],141:[2,111]},{1:[2,48],6:[2,48],25:[2,48],26:[2,48],49:[2,48],54:[2,48],57:[2,48],73:[2,48],78:[2,48],86:[2,48],91:[2,48],93:[2,48],102:[2,48],104:[2,48],105:[2,48],106:[2,48],110:[2,48],118:[2,48],126:[2,48],129:[2,48],130:[2,48],135:[2,48],136:[2,48],137:[2,48],138:[2,48],139:[2,48],140:[2,48],141:[2,48]},{6:[2,57],25:[2,57],26:[2,57],49:[2,57],54:[2,57]},{6:[2,52],25:[2,52],26:[2,52],53:325,54:[1,209]},{1:[2,209],6:[2,209],25:[2,209],26:[2,209],49:[2,209],54:[2,209],57:[2,209],73:[2,209],78:[2,209],86:[2,209],91:[2,209],93:[2,209],102:[2,209],104:[2,209],105:[2,209],106:[2,209],110:[2,209],118:[2,209],126:[2,209],129:[2,209],130:[2,209],135:[2,209],136:[2,209],137:[2,209],138:[2,209],139:[2,209],140:[2,209],141:[2,209]},{1:[2,183],6:[2,183],25:[2,183],26:[2,183],49:[2,183],54:[2,183],57:[2,183],73:[2,183],78:[2,183],86:[2,183],91:[2,183],93:[2,183],102:[2,183],104:[2,183],105:[2,183],106:[2,183],110:[2,183],118:[2,183],121:[2,183],126:[2,183],129:[2,183],130:[2,183],135:[2,183],136:[2,183],137:[2,183],138:[2,183],139:[2,183],140:[2,183],141:[2,183]},{1:[2,137],6:[2,137],25:[2,137],26:[2,137],49:[2,137],54:[2,137],57:[2,137],73:[2,137],78:[2,137],86:[2,137],91:[2,137],93:[2,137],102:[2,137],104:[2,137],105:[2,137],106:[2,137],110:[2,137],118:[2,137],126:[2,137],129:[2,137],130:[2,137],135:[2,137],136:[2,137],137:[2,137],138:[2,137],139:[2,137],140:[2,137],141:[2,137]},{1:[2,138],6:[2,138],25:[2,138],26:[2,138],49:[2,138],54:[2,138],57:[2,138],73:[2,138],78:[2,138],86:[2,138],91:[2,138],93:[2,138],98:[2,138],102:[2,138],104:[2,138],105:[2,138],106:[2,138],110:[2,138],118:[2,138],126:[2,138],129:[2,138],130:[2,138],135:[2,138],136:[2,138],137:[2,138],138:[2,138],139:[2,138],140:[2,138],141:[2,138]},{1:[2,139],6:[2,139],25:[2,139],26:[2,139],49:[2,139],54:[2,139],57:[2,139],73:[2,139],78:[2,139],86:[2,139],91:[2,139],93:[2,139],98:[2,139],102:[2,139],104:[2,139],105:[2,139],106:[2,139],110:[2,139],118:[2,139],126:[2,139],129:[2,139],130:[2,139],135:[2,139],136:[2,139],137:[2,139],138:[2,139],139:[2,139],140:[2,139],141:[2,139]},{1:[2,174],6:[2,174],25:[2,174],26:[2,174],49:[2,174],54:[2,174],57:[2,174],73:[2,174],78:[2,174],86:[2,174],91:[2,174],93:[2,174],102:[2,174],104:[2,174],105:[2,174],106:[2,174],110:[2,174],118:[2,174],126:[2,174],129:[2,174],130:[2,174],135:[2,174],136:[2,174],137:[2,174],138:[2,174],139:[2,174],140:[2,174],141:[2,174]},{24:326,25:[1,116]},{26:[1,327]},{6:[1,328],26:[2,180],121:[2,180],123:[2,180]},{7:329,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{1:[2,103],6:[2,103],25:[2,103],26:[2,103],49:[2,103],54:[2,103],57:[2,103],73:[2,103],78:[2,103],86:[2,103],91:[2,103],93:[2,103],102:[2,103],104:[2,103],105:[2,103],106:[2,103],110:[2,103],118:[2,103],126:[2,103],129:[2,103],130:[2,103],135:[2,103],136:[2,103],137:[2,103],138:[2,103],139:[2,103],140:[2,103],141:[2,103]},{1:[2,143],6:[2,143],25:[2,143],26:[2,143],49:[2,143],54:[2,143],57:[2,143],66:[2,143],67:[2,143],68:[2,143],69:[2,143],71:[2,143],73:[2,143],74:[2,143],78:[2,143],84:[2,143],85:[2,143],86:[2,143],91:[2,143],93:[2,143],102:[2,143],104:[2,143],105:[2,143],106:[2,143],110:[2,143],118:[2,143],126:[2,143],129:[2,143],130:[2,143],135:[2,143],136:[2,143],137:[2,143],138:[2,143],139:[2,143],140:[2,143],141:[2,143]},{1:[2,119],6:[2,119],25:[2,119],26:[2,119],49:[2,119],54:[2,119],57:[2,119],66:[2,119],67:[2,119],68:[2,119],69:[2,119],71:[2,119],73:[2,119],74:[2,119],78:[2,119],84:[2,119],85:[2,119],86:[2,119],91:[2,119],93:[2,119],102:[2,119],104:[2,119],105:[2,119],106:[2,119],110:[2,119],118:[2,119],126:[2,119],129:[2,119],130:[2,119],135:[2,119],136:[2,119],137:[2,119],138:[2,119],139:[2,119],140:[2,119],141:[2,119]},{6:[2,126],25:[2,126],26:[2,126],54:[2,126],86:[2,126],91:[2,126]},{6:[2,52],25:[2,52],26:[2,52],53:330,54:[1,237]},{6:[2,127],25:[2,127],26:[2,127],54:[2,127],86:[2,127],91:[2,127]},{1:[2,169],6:[2,169],25:[2,169],26:[2,169],49:[2,169],54:[2,169],57:[2,169],73:[2,169],78:[2,169],86:[2,169],91:[2,169],93:[2,169],102:[2,169],103:85,104:[2,169],105:[2,169],106:[2,169],109:86,110:[2,169],111:69,118:[1,331],126:[2,169],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,171],6:[2,171],25:[2,171],26:[2,171],49:[2,171],54:[2,171],57:[2,171],73:[2,171],78:[2,171],86:[2,171],91:[2,171],93:[2,171],102:[2,171],103:85,104:[2,171],105:[1,332],106:[2,171],109:86,110:[2,171],111:69,118:[2,171],126:[2,171],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,170],6:[2,170],25:[2,170],26:[2,170],49:[2,170],54:[2,170],57:[2,170],73:[2,170],78:[2,170],86:[2,170],91:[2,170],93:[2,170],102:[2,170],103:85,104:[2,170],105:[2,170],106:[2,170],109:86,110:[2,170],111:69,118:[2,170],126:[2,170],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{6:[2,94],25:[2,94],26:[2,94],54:[2,94],78:[2,94]},{6:[2,52],25:[2,52],26:[2,52],53:333,54:[1,247]},{26:[1,334],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{6:[1,258],25:[1,259],26:[1,335]},{26:[1,336]},{1:[2,177],6:[2,177],25:[2,177],26:[2,177],49:[2,177],54:[2,177],57:[2,177],73:[2,177],78:[2,177],86:[2,177],91:[2,177],93:[2,177],102:[2,177],104:[2,177],105:[2,177],106:[2,177],110:[2,177],118:[2,177],126:[2,177],129:[2,177],130:[2,177],135:[2,177],136:[2,177],137:[2,177],138:[2,177],139:[2,177],140:[2,177],141:[2,177]},{26:[2,181],121:[2,181],123:[2,181]},{25:[2,133],54:[2,133],103:85,104:[1,65],106:[1,66],109:86,110:[1,68],111:69,126:[1,84],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{6:[1,281],25:[1,282],26:[1,337]},{7:338,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{7:339,8:118,9:18,10:19,11:[1,20],12:6,13:7,14:8,15:9,16:10,17:11,18:12,19:13,20:14,21:15,22:16,23:17,27:62,28:[1,73],29:49,30:[1,71],31:[1,72],32:22,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:[1,54],38:[1,55],39:21,44:63,45:[1,45],46:[1,46],47:[1,27],50:28,51:[1,60],52:[1,61],58:47,59:48,61:36,63:23,64:24,65:25,76:[1,70],79:[1,43],83:[1,26],88:[1,58],89:[1,59],90:[1,57],96:[1,38],100:[1,44],101:[1,56],103:39,104:[1,65],106:[1,66],107:40,108:[1,67],109:41,110:[1,68],111:69,119:[1,42],124:37,125:[1,64],127:[1,29],128:[1,30],129:[1,31],130:[1,32],131:[1,33],133:[1,34],134:[1,35]},{6:[1,292],25:[1,293],26:[1,340]},{6:[2,40],25:[2,40],26:[2,40],54:[2,40],78:[2,40]},{6:[2,58],25:[2,58],26:[2,58],49:[2,58],54:[2,58]},{1:[2,175],6:[2,175],25:[2,175],26:[2,175],49:[2,175],54:[2,175],57:[2,175],73:[2,175],78:[2,175],86:[2,175],91:[2,175],93:[2,175],102:[2,175],104:[2,175],105:[2,175],106:[2,175],110:[2,175],118:[2,175],126:[2,175],129:[2,175],130:[2,175],135:[2,175],136:[2,175],137:[2,175],138:[2,175],139:[2,175],140:[2,175],141:[2,175]},{6:[2,128],25:[2,128],26:[2,128],54:[2,128],86:[2,128],91:[2,128]},{1:[2,172],6:[2,172],25:[2,172],26:[2,172],49:[2,172],54:[2,172],57:[2,172],73:[2,172],78:[2,172],86:[2,172],91:[2,172],93:[2,172],102:[2,172],103:85,104:[2,172],105:[2,172],106:[2,172],109:86,110:[2,172],111:69,118:[2,172],126:[2,172],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{1:[2,173],6:[2,173],25:[2,173],26:[2,173],49:[2,173],54:[2,173],57:[2,173],73:[2,173],78:[2,173],86:[2,173],91:[2,173],93:[2,173],102:[2,173],103:85,104:[2,173],105:[2,173],106:[2,173],109:86,110:[2,173],111:69,118:[2,173],126:[2,173],129:[1,77],130:[1,76],135:[1,75],136:[1,78],137:[1,79],138:[1,80],139:[1,81],140:[1,82],141:[1,83]},{6:[2,95],25:[2,95],26:[2,95],54:[2,95],78:[2,95]}],
		defaultActions: {60:[2,50],61:[2,51],92:[2,109],196:[2,89]},
		parseError: function parseError(str, hash) {
			if (hash.recoverable) {
				this.trace(str);
			} else {
				throw new Error(str);
			}
		},
		parse: function parse(input) {
			var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
			var args = lstack.slice.call(arguments, 1);
			this.lexer.setInput(input);
			this.lexer.yy = this.yy;
			this.yy.lexer = this.lexer;
			this.yy.parser = this;
			if (typeof this.lexer.yylloc == 'undefined') {
				this.lexer.yylloc = {};
			}
			var yyloc = this.lexer.yylloc;
			lstack.push(yyloc);
			var ranges = this.lexer.options && this.lexer.options.ranges;
			if (typeof this.yy.parseError === 'function') {
				this.parseError = this.yy.parseError;
			} else {
				this.parseError = Object.getPrototypeOf(this).parseError;
			}
			function popStack(n) {
				stack.length = stack.length - 2 * n;
				vstack.length = vstack.length - n;
				lstack.length = lstack.length - n;
			}
			function lex() {
				var token;
				token = self.lexer.lex() || EOF;
				if (typeof token !== 'number') {
					token = self.symbols_[token] || token;
				}
				return token;
			}
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
						if (this.lexer.showPosition) {
							errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
						} else {
							errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
						}
						this.parseError(errStr, {
							text: this.lexer.match,
							token: this.terminals_[symbol] || symbol,
							line: this.lexer.yylineno,
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
					vstack.push(this.lexer.yytext);
					lstack.push(this.lexer.yylloc);
					stack.push(action[1]);
					symbol = null;
					if (!preErrorSymbol) {
						yyleng = this.lexer.yyleng;
						yytext = this.lexer.yytext;
						yylineno = this.lexer.yylineno;
						yyloc = this.lexer.yylloc;
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
						this.yy,
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

//		if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
		exports.parser = parser;
		exports.Parser = parser.Parser;
		exports.parse = function () { return parser.parse.apply(parser, arguments); };
//		exports.main = function commonjsMain(args) {
//			if (!args[1]) {
//				console.log('Usage: '+args[0]+' FILE');
//				process.exit(1);
//			}
//			var source = require('/fs').readFileSync(require('/path').normalize(args[1]), "utf8");
//			return exports.parser.parse(source);
//		};
//		if (typeof module !== 'undefined' && require.main === module) {
//		  exports.main(process.argv.slice(1));
//		}
//		}
		
		return exports;
	};
	
//	if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
//	exports.parser = parser;
//	exports.Parser = parser.Parser;
//	exports.parse = function () { return parser.parse.apply(parser, arguments); };
//	exports.main = function commonjsMain(args) {
//		if (!args[1]) {
//			console.log('Usage: '+args[0]+' FILE');
//			process.exit(1);
//		}
//		var source = require('/fs').readFileSync(require('/path').normalize(args[1]), "utf8");
//		return exports.parser.parse(source);
//	};
//	if (typeof module !== 'undefined' && require.main === module) {
//	  exports.main(process.argv.slice(1));
//	}
//	}
	//#endregion

	//#region URL: /scope
	modules['/scope'] = function() {
	  var exports = {};
	  var Scope, extend, last, _ref;

	  _ref = require('/helpers'), extend = _ref.extend, last = _ref.last;

	  exports.Scope = Scope = (function() {
		Scope.root = null;

		function Scope(parent, expressions, method) {
		  this.parent = parent;
		  this.expressions = expressions;
		  this.method = method;
		  this.variables = [
			{
			  name: 'arguments',
			  type: 'arguments'
			}
		  ];
		  this.positions = {};
		  if (!this.parent) {
			Scope.root = this;
		  }
		}

		Scope.prototype.add = function(name, type, immediate) {
		  if (this.shared && !immediate) {
			return this.parent.add(name, type, immediate);
		  }
		  if (Object.prototype.hasOwnProperty.call(this.positions, name)) {
			return this.variables[this.positions[name]].type = type;
		  } else {
			return this.positions[name] = this.variables.push({
			  name: name,
			  type: type
			}) - 1;
		  }
		};

		Scope.prototype.namedMethod = function() {
		  var _ref1;
		  if (((_ref1 = this.method) != null ? _ref1.name : void 0) || !this.parent) {
			return this.method;
		  }
		  return this.parent.namedMethod();
		};

		Scope.prototype.find = function(name) {
		  if (this.check(name)) {
			return true;
		  }
		  this.add(name, 'var');
		  return false;
		};

		Scope.prototype.parameter = function(name) {
		  if (this.shared && this.parent.check(name, true)) {
			return;
		  }
		  return this.add(name, 'param');
		};

		Scope.prototype.check = function(name) {
		  var _ref1;
		  return !!(this.type(name) || ((_ref1 = this.parent) != null ? _ref1.check(name) : void 0));
		};

		Scope.prototype.temporary = function(name, index) {
		  if (name.length > 1) {
			return '_' + name + (index > 1 ? index - 1 : '');
		  } else {
			return '_' + (index + parseInt(name, 36)).toString(36).replace(/\d/g, 'a');
		  }
		};

		Scope.prototype.type = function(name) {
		  var v, _i, _len, _ref1;
		  _ref1 = this.variables;
		  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
			v = _ref1[_i];
			if (v.name === name) {
			  return v.type;
			}
		  }
		  return null;
		};

		Scope.prototype.freeVariable = function(name, reserve) {
		  var index, temp;
		  if (reserve == null) {
			reserve = true;
		  }
		  index = 0;
		  while (this.check((temp = this.temporary(name, index)))) {
			index++;
		  }
		  if (reserve) {
			this.add(temp, 'var', true);
		  }
		  return temp;
		};

		Scope.prototype.assign = function(name, value) {
		  this.add(name, {
			value: value,
			assigned: true
		  }, true);
		  return this.hasAssignments = true;
		};

		Scope.prototype.hasDeclarations = function() {
		  return !!this.declaredVariables().length;
		};

		Scope.prototype.declaredVariables = function() {
		  var realVars, tempVars, v, _i, _len, _ref1;
		  realVars = [];
		  tempVars = [];
		  _ref1 = this.variables;
		  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
			v = _ref1[_i];
			if (v.type === 'var') {
			  (v.name.charAt(0) === '_' ? tempVars : realVars).push(v.name);
			}
		  }
		  return realVars.sort().concat(tempVars.sort());
		};

		Scope.prototype.assignedVariables = function() {
		  var v, _i, _len, _ref1, _results;
		  _ref1 = this.variables;
		  _results = [];
		  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
			v = _ref1[_i];
			if (v.type.assigned) {
			  _results.push(v.name + " = " + v.type.value);
			}
		  }
		  return _results;
		};

		return Scope;

	  })();
  
	  return exports;
	};
	//#endregion

	//#region URL: /nodes
	modules['/nodes'] = function() {
	  var exports = {};
	  var Access, Arr, Assign, Base, Block, Call, Class, Code, CodeFragment, Comment, Existence, Expansion, Extends, For, HEXNUM, IDENTIFIER, IDENTIFIER_STR, IS_REGEX, IS_STRING, If, In, Index, LEVEL_ACCESS, LEVEL_COND, LEVEL_LIST, LEVEL_OP, LEVEL_PAREN, LEVEL_TOP, Literal, METHOD_DEF, NEGATE, NO, NUMBER, Obj, Op, Param, Parens, RESERVED, Range, Return, SIMPLENUM, STRICT_PROSCRIBED, Scope, Slice, Splat, Switch, TAB, THIS, Throw, Try, UTILITIES, Value, While, YES, addLocationDataFn, compact, del, ends, extend, flatten, fragmentsToText, isLiteralArguments, isLiteralThis, last, locationDataToString, merge, multident, parseNum, some, starts, throwSyntaxError, unfoldSoak, utility, _ref, _ref1,
		__hasProp = {}.hasOwnProperty,
		__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
		__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
		__slice = [].slice;

	  Error.stackTraceLimit = Infinity;

	  Scope = require('/scope').Scope;

	  _ref = require('/lexer'), RESERVED = _ref.RESERVED, STRICT_PROSCRIBED = _ref.STRICT_PROSCRIBED;

	  _ref1 = require('/helpers'), compact = _ref1.compact, flatten = _ref1.flatten, extend = _ref1.extend, merge = _ref1.merge, del = _ref1.del, starts = _ref1.starts, ends = _ref1.ends, last = _ref1.last, some = _ref1.some, addLocationDataFn = _ref1.addLocationDataFn, locationDataToString = _ref1.locationDataToString, throwSyntaxError = _ref1.throwSyntaxError;

	  exports.extend = extend;

	  exports.addLocationDataFn = addLocationDataFn;

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

	  exports.CodeFragment = CodeFragment = (function() {
		function CodeFragment(parent, code) {
		  var _ref2;
		  this.code = "" + code;
		  this.locationData = parent != null ? parent.locationData : void 0;
		  this.type = (parent != null ? (_ref2 = parent.constructor) != null ? _ref2.name : void 0 : void 0) || 'unknown';
		}

		CodeFragment.prototype.toString = function() {
		  return "" + this.code + (this.locationData ? ": " + locationDataToString(this.locationData) : '');
		};

		return CodeFragment;

	  })();

	  fragmentsToText = function(fragments) {
		var fragment;
		return ((function() {
		  var _i, _len, _results;
		  _results = [];
		  for (_i = 0, _len = fragments.length; _i < _len; _i++) {
			fragment = fragments[_i];
			_results.push(fragment.code);
		  }
		  return _results;
		})()).join('');
	  };

	  exports.Base = Base = (function() {
		function Base() {}

		Base.prototype.compile = function(o, lvl) {
		  return fragmentsToText(this.compileToFragments(o, lvl));
		};

		Base.prototype.compileToFragments = function(o, lvl) {
		  var node;
		  o = extend({}, o);
		  if (lvl) {
			o.level = lvl;
		  }
		  node = this.unfoldSoak(o) || this;
		  node.tab = o.indent;
		  if (o.level === LEVEL_TOP || !node.isStatement(o)) {
			return node.compileNode(o);
		  } else {
			return node.compileClosure(o);
		  }
		};

		Base.prototype.compileClosure = function(o) {
		  var args, argumentsNode, func, jumpNode, meth, parts;
		  if (jumpNode = this.jumps()) {
			jumpNode.error('cannot use a pure statement in an expression');
		  }
		  o.sharedScope = true;
		  func = new Code([], Block.wrap([this]));
		  args = [];
		  if ((argumentsNode = this.contains(isLiteralArguments)) || this.contains(isLiteralThis)) {
			args = [new Literal('this')];
			if (argumentsNode) {
			  meth = 'apply';
			  args.push(new Literal('arguments'));
			} else {
			  meth = 'call';
			}
			func = new Value(func, [new Access(new Literal(meth))]);
		  }
		  parts = (new Call(func, args)).compileNode(o);
		  if (func.isGenerator) {
			parts.unshift(this.makeCode("(yield* "));
			parts.push(this.makeCode(")"));
		  }
		  return parts;
		};

		Base.prototype.cache = function(o, level, reused) {
		  var ref, sub;
		  if (!this.isComplex()) {
			ref = level ? this.compileToFragments(o, level) : this;
			return [ref, ref];
		  } else {
			ref = new Literal(reused || o.scope.freeVariable('ref'));
			sub = new Assign(ref, this);
			if (level) {
			  return [sub.compileToFragments(o, level), [this.makeCode(ref.value)]];
			} else {
			  return [sub, ref];
			}
		  }
		};

		Base.prototype.cacheToCodeFragments = function(cacheValues) {
		  return [fragmentsToText(cacheValues[0]), fragmentsToText(cacheValues[1])];
		};

		Base.prototype.makeReturn = function(res) {
		  var me;
		  me = this.unwrapAll();
		  if (res) {
			return new Call(new Literal(res + ".push"), [me]);
		  } else {
			return new Return(me);
		  }
		};

		Base.prototype.contains = function(pred) {
		  var node;
		  node = void 0;
		  this.traverseChildren(false, function(n) {
			if (pred(n)) {
			  node = n;
			  return false;
			}
		  });
		  return node;
		};

		Base.prototype.lastNonComment = function(list) {
		  var i;
		  i = list.length;
		  while (i--) {
			if (!(list[i] instanceof Comment)) {
			  return list[i];
			}
		  }
		  return null;
		};

		Base.prototype.toString = function(idt, name) {
		  var tree;
		  if (idt == null) {
			idt = '';
		  }
		  if (name == null) {
			name = this.constructor.name;
		  }
		  tree = '\n' + idt + name;
		  if (this.soak) {
			tree += '?';
		  }
		  this.eachChild(function(node) {
			return tree += node.toString(idt + TAB);
		  });
		  return tree;
		};

		Base.prototype.eachChild = function(func) {
		  var attr, child, _i, _j, _len, _len1, _ref2, _ref3;
		  if (!this.children) {
			return this;
		  }
		  _ref2 = this.children;
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			attr = _ref2[_i];
			if (this[attr]) {
			  _ref3 = flatten([this[attr]]);
			  for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
				child = _ref3[_j];
				if (func(child) === false) {
				  return this;
				}
			  }
			}
		  }
		  return this;
		};

		Base.prototype.traverseChildren = function(crossScope, func) {
		  return this.eachChild(function(child) {
			var recur;
			recur = func(child);
			if (recur !== false) {
			  return child.traverseChildren(crossScope, func);
			}
		  });
		};

		Base.prototype.invert = function() {
		  return new Op('!', this);
		};

		Base.prototype.unwrapAll = function() {
		  var node;
		  node = this;
		  while (node !== (node = node.unwrap())) {
			continue;
		  }
		  return node;
		};

		Base.prototype.children = [];

		Base.prototype.isStatement = NO;

		Base.prototype.jumps = NO;

		Base.prototype.isComplex = YES;

		Base.prototype.isChainable = NO;

		Base.prototype.isAssignable = NO;

		Base.prototype.unwrap = THIS;

		Base.prototype.unfoldSoak = NO;

		Base.prototype.assigns = NO;

		Base.prototype.updateLocationDataIfMissing = function(locationData) {
		  if (this.locationData) {
			return this;
		  }
		  this.locationData = locationData;
		  return this.eachChild(function(child) {
			return child.updateLocationDataIfMissing(locationData);
		  });
		};

		Base.prototype.error = function(message) {
		  return throwSyntaxError(message, this.locationData);
		};

		Base.prototype.makeCode = function(code) {
		  return new CodeFragment(this, code);
		};

		Base.prototype.wrapInBraces = function(fragments) {
		  return [].concat(this.makeCode('('), fragments, this.makeCode(')'));
		};

		Base.prototype.joinFragmentArrays = function(fragmentsList, joinStr) {
		  var answer, fragments, i, _i, _len;
		  answer = [];
		  for (i = _i = 0, _len = fragmentsList.length; _i < _len; i = ++_i) {
			fragments = fragmentsList[i];
			if (i) {
			  answer.push(this.makeCode(joinStr));
			}
			answer = answer.concat(fragments);
		  }
		  return answer;
		};

		return Base;

	  })();

	  exports.Block = Block = (function(_super) {
		__extends(Block, _super);

		function Block(nodes) {
		  this.expressions = compact(flatten(nodes || []));
		}

		Block.prototype.children = ['expressions'];

		Block.prototype.push = function(node) {
		  this.expressions.push(node);
		  return this;
		};

		Block.prototype.pop = function() {
		  return this.expressions.pop();
		};

		Block.prototype.unshift = function(node) {
		  this.expressions.unshift(node);
		  return this;
		};

		Block.prototype.unwrap = function() {
		  if (this.expressions.length === 1) {
			return this.expressions[0];
		  } else {
			return this;
		  }
		};

		Block.prototype.isEmpty = function() {
		  return !this.expressions.length;
		};

		Block.prototype.isStatement = function(o) {
		  var exp, _i, _len, _ref2;
		  _ref2 = this.expressions;
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			exp = _ref2[_i];
			if (exp.isStatement(o)) {
			  return true;
			}
		  }
		  return false;
		};

		Block.prototype.jumps = function(o) {
		  var exp, jumpNode, _i, _len, _ref2;
		  _ref2 = this.expressions;
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			exp = _ref2[_i];
			if (jumpNode = exp.jumps(o)) {
			  return jumpNode;
			}
		  }
		};

		Block.prototype.makeReturn = function(res) {
		  var expr, len;
		  len = this.expressions.length;
		  while (len--) {
			expr = this.expressions[len];
			if (!(expr instanceof Comment)) {
			  this.expressions[len] = expr.makeReturn(res);
			  if (expr instanceof Return && !expr.expression) {
				this.expressions.splice(len, 1);
			  }
			  break;
			}
		  }
		  return this;
		};

		Block.prototype.compileToFragments = function(o, level) {
		  if (o == null) {
			o = {};
		  }
		  if (o.scope) {
			return Block.__super__.compileToFragments.call(this, o, level);
		  } else {
			return this.compileRoot(o);
		  }
		};

		Block.prototype.compileNode = function(o) {
		  var answer, compiledNodes, fragments, index, node, top, _i, _len, _ref2;
		  this.tab = o.indent;
		  top = o.level === LEVEL_TOP;
		  compiledNodes = [];
		  _ref2 = this.expressions;
		  for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
			node = _ref2[index];
			node = node.unwrapAll();
			node = node.unfoldSoak(o) || node;
			if (node instanceof Block) {
			  compiledNodes.push(node.compileNode(o));
			} else if (top) {
			  node.front = true;
			  fragments = node.compileToFragments(o);
			  if (!node.isStatement(o)) {
				fragments.unshift(this.makeCode("" + this.tab));
				fragments.push(this.makeCode(";"));
			  }
			  compiledNodes.push(fragments);
			} else {
			  compiledNodes.push(node.compileToFragments(o, LEVEL_LIST));
			}
		  }
		  if (top) {
			if (this.spaced) {
			  return [].concat(this.joinFragmentArrays(compiledNodes, '\n\n'), this.makeCode("\n"));
			} else {
			  return this.joinFragmentArrays(compiledNodes, '\n');
			}
		  }
		  if (compiledNodes.length) {
			answer = this.joinFragmentArrays(compiledNodes, ', ');
		  } else {
			answer = [this.makeCode("void 0")];
		  }
		  if (compiledNodes.length > 1 && o.level >= LEVEL_LIST) {
			return this.wrapInBraces(answer);
		  } else {
			return answer;
		  }
		};

		Block.prototype.compileRoot = function(o) {
		  var exp, fragments, i, name, prelude, preludeExps, rest, _i, _len, _ref2;
		  o.indent = o.bare ? '' : TAB;
		  o.level = LEVEL_TOP;
		  this.spaced = true;
		  o.scope = new Scope(null, this, null);
		  _ref2 = o.locals || [];
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			name = _ref2[_i];
			o.scope.parameter(name);
		  }
		  prelude = [];
		  if (!o.bare) {
			preludeExps = (function() {
			  var _j, _len1, _ref3, _results;
			  _ref3 = this.expressions;
			  _results = [];
			  for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
				exp = _ref3[i];
				if (!(exp.unwrap() instanceof Comment)) {
				  break;
				}
				_results.push(exp);
			  }
			  return _results;
			}).call(this);
			rest = this.expressions.slice(preludeExps.length);
			this.expressions = preludeExps;
			if (preludeExps.length) {
			  prelude = this.compileNode(merge(o, {
				indent: ''
			  }));
			  prelude.push(this.makeCode("\n"));
			}
			this.expressions = rest;
		  }
		  fragments = this.compileWithDeclarations(o);
		  if (o.bare) {
			return fragments;
		  }
		  return [].concat(prelude, this.makeCode("(function() {\n"), fragments, this.makeCode("\n}).call(this);\n"));
		};

		Block.prototype.compileWithDeclarations = function(o) {
		  var assigns, declars, exp, fragments, i, post, rest, scope, spaced, _i, _len, _ref2, _ref3, _ref4;
		  fragments = [];
		  post = [];
		  _ref2 = this.expressions;
		  for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
			exp = _ref2[i];
			exp = exp.unwrap();
			if (!(exp instanceof Comment || exp instanceof Literal)) {
			  break;
			}
		  }
		  o = merge(o, {
			level: LEVEL_TOP
		  });
		  if (i) {
			rest = this.expressions.splice(i, 9e9);
			_ref3 = [this.spaced, false], spaced = _ref3[0], this.spaced = _ref3[1];
			_ref4 = [this.compileNode(o), spaced], fragments = _ref4[0], this.spaced = _ref4[1];
			this.expressions = rest;
		  }
		  post = this.compileNode(o);
		  scope = o.scope;
		  if (scope.expressions === this) {
			declars = o.scope.hasDeclarations();
			assigns = scope.hasAssignments;
			if (declars || assigns) {
			  if (i) {
				fragments.push(this.makeCode('\n'));
			  }
			  fragments.push(this.makeCode(this.tab + "var "));
			  if (declars) {
				fragments.push(this.makeCode(scope.declaredVariables().join(', ')));
			  }
			  if (assigns) {
				if (declars) {
				  fragments.push(this.makeCode(",\n" + (this.tab + TAB)));
				}
				fragments.push(this.makeCode(scope.assignedVariables().join(",\n" + (this.tab + TAB))));
			  }
			  fragments.push(this.makeCode(";\n" + (this.spaced ? '\n' : '')));
			} else if (fragments.length && post.length) {
			  fragments.push(this.makeCode("\n"));
			}
		  }
		  return fragments.concat(post);
		};

		Block.wrap = function(nodes) {
		  if (nodes.length === 1 && nodes[0] instanceof Block) {
			return nodes[0];
		  }
		  return new Block(nodes);
		};

		return Block;

	  })(Base);

	  exports.Literal = Literal = (function(_super) {
		__extends(Literal, _super);

		function Literal(value) {
		  this.value = value;
		}

		Literal.prototype.makeReturn = function() {
		  if (this.isStatement()) {
			return this;
		  } else {
			return Literal.__super__.makeReturn.apply(this, arguments);
		  }
		};

		Literal.prototype.isAssignable = function() {
		  return IDENTIFIER.test(this.value);
		};

		Literal.prototype.isStatement = function() {
		  var _ref2;
		  return (_ref2 = this.value) === 'break' || _ref2 === 'continue' || _ref2 === 'debugger';
		};

		Literal.prototype.isComplex = NO;

		Literal.prototype.assigns = function(name) {
		  return name === this.value;
		};

		Literal.prototype.jumps = function(o) {
		  if (this.value === 'break' && !((o != null ? o.loop : void 0) || (o != null ? o.block : void 0))) {
			return this;
		  }
		  if (this.value === 'continue' && !(o != null ? o.loop : void 0)) {
			return this;
		  }
		};

		Literal.prototype.compileNode = function(o) {
		  var answer, code, _ref2;
		  code = this.value === 'this' ? ((_ref2 = o.scope.method) != null ? _ref2.bound : void 0) ? o.scope.method.context : this.value : this.value.reserved ? "\"" + this.value + "\"" : this.value;
		  answer = this.isStatement() ? "" + this.tab + code + ";" : code;
		  return [this.makeCode(answer)];
		};

		Literal.prototype.toString = function() {
		  return ' "' + this.value + '"';
		};

		return Literal;

	  })(Base);

	  exports.Undefined = (function(_super) {
		__extends(Undefined, _super);

		function Undefined() {
		  return Undefined.__super__.constructor.apply(this, arguments);
		}

		Undefined.prototype.isAssignable = NO;

		Undefined.prototype.isComplex = NO;

		Undefined.prototype.compileNode = function(o) {
		  return [this.makeCode(o.level >= LEVEL_ACCESS ? '(void 0)' : 'void 0')];
		};

		return Undefined;

	  })(Base);

	  exports.Null = (function(_super) {
		__extends(Null, _super);

		function Null() {
		  return Null.__super__.constructor.apply(this, arguments);
		}

		Null.prototype.isAssignable = NO;

		Null.prototype.isComplex = NO;

		Null.prototype.compileNode = function() {
		  return [this.makeCode("null")];
		};

		return Null;

	  })(Base);

	  exports.Bool = (function(_super) {
		__extends(Bool, _super);

		Bool.prototype.isAssignable = NO;

		Bool.prototype.isComplex = NO;

		Bool.prototype.compileNode = function() {
		  return [this.makeCode(this.val)];
		};

		function Bool(val) {
		  this.val = val;
		}

		return Bool;

	  })(Base);

	  exports.Return = Return = (function(_super) {
		__extends(Return, _super);

		function Return(expression) {
		  this.expression = expression;
		}

		Return.prototype.children = ['expression'];

		Return.prototype.isStatement = YES;

		Return.prototype.makeReturn = THIS;

		Return.prototype.jumps = THIS;

		Return.prototype.compileToFragments = function(o, level) {
		  var expr, _ref2;
		  expr = (_ref2 = this.expression) != null ? _ref2.makeReturn() : void 0;
		  if (expr && !(expr instanceof Return)) {
			return expr.compileToFragments(o, level);
		  } else {
			return Return.__super__.compileToFragments.call(this, o, level);
		  }
		};

		Return.prototype.compileNode = function(o) {
		  var answer;
		  answer = [];
		  answer.push(this.makeCode(this.tab + ("return" + (this.expression ? " " : ""))));
		  if (this.expression) {
			answer = answer.concat(this.expression.compileToFragments(o, LEVEL_PAREN));
		  }
		  answer.push(this.makeCode(";"));
		  return answer;
		};

		return Return;

	  })(Base);

	  exports.Value = Value = (function(_super) {
		__extends(Value, _super);

		function Value(base, props, tag) {
		  if (!props && base instanceof Value) {
			return base;
		  }
		  this.base = base;
		  this.properties = props || [];
		  if (tag) {
			this[tag] = true;
		  }
		  return this;
		}

		Value.prototype.children = ['base', 'properties'];

		Value.prototype.add = function(props) {
		  this.properties = this.properties.concat(props);
		  return this;
		};

		Value.prototype.hasProperties = function() {
		  return !!this.properties.length;
		};

		Value.prototype.bareLiteral = function(type) {
		  return !this.properties.length && this.base instanceof type;
		};

		Value.prototype.isArray = function() {
		  return this.bareLiteral(Arr);
		};

		Value.prototype.isRange = function() {
		  return this.bareLiteral(Range);
		};

		Value.prototype.isComplex = function() {
		  return this.hasProperties() || this.base.isComplex();
		};

		Value.prototype.isAssignable = function() {
		  return this.hasProperties() || this.base.isAssignable();
		};

		Value.prototype.isSimpleNumber = function() {
		  return this.bareLiteral(Literal) && SIMPLENUM.test(this.base.value);
		};

		Value.prototype.isString = function() {
		  return this.bareLiteral(Literal) && IS_STRING.test(this.base.value);
		};

		Value.prototype.isRegex = function() {
		  return this.bareLiteral(Literal) && IS_REGEX.test(this.base.value);
		};

		Value.prototype.isAtomic = function() {
		  var node, _i, _len, _ref2;
		  _ref2 = this.properties.concat(this.base);
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			node = _ref2[_i];
			if (node.soak || node instanceof Call) {
			  return false;
			}
		  }
		  return true;
		};

		Value.prototype.isNotCallable = function() {
		  return this.isSimpleNumber() || this.isString() || this.isRegex() || this.isArray() || this.isRange() || this.isSplice() || this.isObject();
		};

		Value.prototype.isStatement = function(o) {
		  return !this.properties.length && this.base.isStatement(o);
		};

		Value.prototype.assigns = function(name) {
		  return !this.properties.length && this.base.assigns(name);
		};

		Value.prototype.jumps = function(o) {
		  return !this.properties.length && this.base.jumps(o);
		};

		Value.prototype.isObject = function(onlyGenerated) {
		  if (this.properties.length) {
			return false;
		  }
		  return (this.base instanceof Obj) && (!onlyGenerated || this.base.generated);
		};

		Value.prototype.isSplice = function() {
		  return last(this.properties) instanceof Slice;
		};

		Value.prototype.looksStatic = function(className) {
		  var _ref2;
		  return this.base.value === className && this.properties.length && ((_ref2 = this.properties[0].name) != null ? _ref2.value : void 0) !== 'prototype';
		};

		Value.prototype.unwrap = function() {
		  if (this.properties.length) {
			return this;
		  } else {
			return this.base;
		  }
		};

		Value.prototype.cacheReference = function(o) {
		  var base, bref, name, nref;
		  name = last(this.properties);
		  if (this.properties.length < 2 && !this.base.isComplex() && !(name != null ? name.isComplex() : void 0)) {
			return [this, this];
		  }
		  base = new Value(this.base, this.properties.slice(0, -1));
		  if (base.isComplex()) {
			bref = new Literal(o.scope.freeVariable('base'));
			base = new Value(new Parens(new Assign(bref, base)));
		  }
		  if (!name) {
			return [base, bref];
		  }
		  if (name.isComplex()) {
			nref = new Literal(o.scope.freeVariable('name'));
			name = new Index(new Assign(nref, name.index));
			nref = new Index(nref);
		  }
		  return [base.add(name), new Value(bref || base.base, [nref || name])];
		};

		Value.prototype.compileNode = function(o) {
		  var fragments, prop, props, _i, _len;
		  this.base.front = this.front;
		  props = this.properties;
		  fragments = this.base.compileToFragments(o, (props.length ? LEVEL_ACCESS : null));
		  if ((this.base instanceof Parens || props.length) && SIMPLENUM.test(fragmentsToText(fragments))) {
			fragments.push(this.makeCode('.'));
		  }
		  for (_i = 0, _len = props.length; _i < _len; _i++) {
			prop = props[_i];
			fragments.push.apply(fragments, prop.compileToFragments(o));
		  }
		  return fragments;
		};

		Value.prototype.unfoldSoak = function(o) {
		  return this.unfoldedSoak != null ? this.unfoldedSoak : this.unfoldedSoak = (function(_this) {
			return function() {
			  var fst, i, ifn, prop, ref, snd, _i, _len, _ref2, _ref3;
			  if (ifn = _this.base.unfoldSoak(o)) {
				(_ref2 = ifn.body.properties).push.apply(_ref2, _this.properties);
				return ifn;
			  }
			  _ref3 = _this.properties;
			  for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
				prop = _ref3[i];
				if (!prop.soak) {
				  continue;
				}
				prop.soak = false;
				fst = new Value(_this.base, _this.properties.slice(0, i));
				snd = new Value(_this.base, _this.properties.slice(i));
				if (fst.isComplex()) {
				  ref = new Literal(o.scope.freeVariable('ref'));
				  fst = new Parens(new Assign(ref, fst));
				  snd.base = ref;
				}
				return new If(new Existence(fst), snd, {
				  soak: true
				});
			  }
			  return false;
			};
		  })(this)();
		};

		return Value;

	  })(Base);

	  exports.Comment = Comment = (function(_super) {
		__extends(Comment, _super);

		function Comment(comment) {
		  this.comment = comment;
		}

		Comment.prototype.isStatement = YES;

		Comment.prototype.makeReturn = THIS;

		Comment.prototype.compileNode = function(o, level) {
		  var code, comment;
		  comment = this.comment.replace(/^(\s*)# /gm, "$1 * ");
		  code = "/*" + (multident(comment, this.tab)) + (__indexOf.call(comment, '\n') >= 0 ? "\n" + this.tab : '') + " */";
		  if ((level || o.level) === LEVEL_TOP) {
			code = o.indent + code;
		  }
		  return [this.makeCode("\n"), this.makeCode(code)];
		};

		return Comment;

	  })(Base);

	  exports.Call = Call = (function(_super) {
		__extends(Call, _super);

		function Call(variable, args, soak) {
		  this.args = args != null ? args : [];
		  this.soak = soak;
		  this.isNew = false;
		  this.isSuper = variable === 'super';
		  this.variable = this.isSuper ? null : variable;
		  if (variable instanceof Value && variable.isNotCallable()) {
			variable.error("literal is not a function");
		  }
		}

		Call.prototype.children = ['variable', 'args'];

		Call.prototype.newInstance = function() {
		  var base, _ref2;
		  base = ((_ref2 = this.variable) != null ? _ref2.base : void 0) || this.variable;
		  if (base instanceof Call && !base.isNew) {
			base.newInstance();
		  } else {
			this.isNew = true;
		  }
		  return this;
		};

		Call.prototype.superReference = function(o) {
		  var accesses, method;
		  method = o.scope.namedMethod();
		  if (method != null ? method.klass : void 0) {
			accesses = [new Access(new Literal('__super__'))];
			if (method["static"]) {
			  accesses.push(new Access(new Literal('constructor')));
			}
			accesses.push(new Access(new Literal(method.name)));
			return (new Value(new Literal(method.klass), accesses)).compile(o);
		  } else if (method != null ? method.ctor : void 0) {
			return method.name + ".__super__.constructor";
		  } else {
			return this.error('cannot call super outside of an instance method.');
		  }
		};

		Call.prototype.superThis = function(o) {
		  var method;
		  method = o.scope.method;
		  return (method && !method.klass && method.context) || "this";
		};

		Call.prototype.unfoldSoak = function(o) {
		  var call, ifn, left, list, rite, _i, _len, _ref2, _ref3;
		  if (this.soak) {
			if (this.variable) {
			  if (ifn = unfoldSoak(o, this, 'variable')) {
				return ifn;
			  }
			  _ref2 = new Value(this.variable).cacheReference(o), left = _ref2[0], rite = _ref2[1];
			} else {
			  left = new Literal(this.superReference(o));
			  rite = new Value(left);
			}
			rite = new Call(rite, this.args);
			rite.isNew = this.isNew;
			left = new Literal("typeof " + (left.compile(o)) + " === \"function\"");
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
		  _ref3 = list.reverse();
		  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
			call = _ref3[_i];
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
		};

		Call.prototype.compileNode = function(o) {
		  var arg, argIndex, compiledArgs, compiledArray, fragments, preface, _i, _len, _ref2, _ref3;
		  if ((_ref2 = this.variable) != null) {
			_ref2.front = this.front;
		  }
		  compiledArray = Splat.compileSplattedArray(o, this.args, true);
		  if (compiledArray.length) {
			return this.compileSplat(o, compiledArray);
		  }
		  compiledArgs = [];
		  _ref3 = this.args;
		  for (argIndex = _i = 0, _len = _ref3.length; _i < _len; argIndex = ++_i) {
			arg = _ref3[argIndex];
			if (argIndex) {
			  compiledArgs.push(this.makeCode(", "));
			}
			compiledArgs.push.apply(compiledArgs, arg.compileToFragments(o, LEVEL_LIST));
		  }
		  fragments = [];
		  if (this.isSuper) {
			preface = this.superReference(o) + (".call(" + (this.superThis(o)));
			if (compiledArgs.length) {
			  preface += ", ";
			}
			fragments.push(this.makeCode(preface));
		  } else {
			if (this.isNew) {
			  fragments.push(this.makeCode('new '));
			}
			fragments.push.apply(fragments, this.variable.compileToFragments(o, LEVEL_ACCESS));
			fragments.push(this.makeCode("("));
		  }
		  fragments.push.apply(fragments, compiledArgs);
		  fragments.push(this.makeCode(")"));
		  return fragments;
		};

		Call.prototype.compileSplat = function(o, splatArgs) {
		  var answer, base, fun, idt, name, ref;
		  if (this.isSuper) {
			return [].concat(this.makeCode((this.superReference(o)) + ".apply(" + (this.superThis(o)) + ", "), splatArgs, this.makeCode(")"));
		  }
		  if (this.isNew) {
			idt = this.tab + TAB;
			return [].concat(this.makeCode("(function(func, args, ctor) {\n" + idt + "ctor.prototype = func.prototype;\n" + idt + "var child = new ctor, result = func.apply(child, args);\n" + idt + "return Object(result) === result ? result : child;\n" + this.tab + "})("), this.variable.compileToFragments(o, LEVEL_LIST), this.makeCode(", "), splatArgs, this.makeCode(", function(){})"));
		  }
		  answer = [];
		  base = new Value(this.variable);
		  if ((name = base.properties.pop()) && base.isComplex()) {
			ref = o.scope.freeVariable('ref');
			answer = answer.concat(this.makeCode("(" + ref + " = "), base.compileToFragments(o, LEVEL_LIST), this.makeCode(")"), name.compileToFragments(o));
		  } else {
			fun = base.compileToFragments(o, LEVEL_ACCESS);
			if (SIMPLENUM.test(fragmentsToText(fun))) {
			  fun = this.wrapInBraces(fun);
			}
			if (name) {
			  ref = fragmentsToText(fun);
			  fun.push.apply(fun, name.compileToFragments(o));
			} else {
			  ref = 'null';
			}
			answer = answer.concat(fun);
		  }
		  return answer = answer.concat(this.makeCode(".apply(" + ref + ", "), splatArgs, this.makeCode(")"));
		};

		return Call;

	  })(Base);

	  exports.Extends = Extends = (function(_super) {
		__extends(Extends, _super);

		function Extends(child, parent) {
		  this.child = child;
		  this.parent = parent;
		}

		Extends.prototype.children = ['child', 'parent'];

		Extends.prototype.compileToFragments = function(o) {
		  return new Call(new Value(new Literal(utility('extends'))), [this.child, this.parent]).compileToFragments(o);
		};

		return Extends;

	  })(Base);

	  exports.Access = Access = (function(_super) {
		__extends(Access, _super);

		function Access(name, tag) {
		  this.name = name;
		  this.name.asKey = true;
		  this.soak = tag === 'soak';
		}

		Access.prototype.children = ['name'];

		Access.prototype.compileToFragments = function(o) {
		  var name;
		  name = this.name.compileToFragments(o);
		  if (IDENTIFIER.test(fragmentsToText(name))) {
			name.unshift(this.makeCode("."));
		  } else {
			name.unshift(this.makeCode("["));
			name.push(this.makeCode("]"));
		  }
		  return name;
		};

		Access.prototype.isComplex = NO;

		return Access;

	  })(Base);

	  exports.Index = Index = (function(_super) {
		__extends(Index, _super);

		function Index(index) {
		  this.index = index;
		}

		Index.prototype.children = ['index'];

		Index.prototype.compileToFragments = function(o) {
		  return [].concat(this.makeCode("["), this.index.compileToFragments(o, LEVEL_PAREN), this.makeCode("]"));
		};

		Index.prototype.isComplex = function() {
		  return this.index.isComplex();
		};

		return Index;

	  })(Base);

	  exports.Range = Range = (function(_super) {
		__extends(Range, _super);

		Range.prototype.children = ['from', 'to'];

		function Range(from, to, tag) {
		  this.from = from;
		  this.to = to;
		  this.exclusive = tag === 'exclusive';
		  this.equals = this.exclusive ? '' : '=';
		}

		Range.prototype.compileVariables = function(o) {
		  var step, _ref2, _ref3, _ref4, _ref5;
		  o = merge(o, {
			top: true
		  });
		  _ref2 = this.cacheToCodeFragments(this.from.cache(o, LEVEL_LIST)), this.fromC = _ref2[0], this.fromVar = _ref2[1];
		  _ref3 = this.cacheToCodeFragments(this.to.cache(o, LEVEL_LIST)), this.toC = _ref3[0], this.toVar = _ref3[1];
		  if (step = del(o, 'step')) {
			_ref4 = this.cacheToCodeFragments(step.cache(o, LEVEL_LIST)), this.step = _ref4[0], this.stepVar = _ref4[1];
		  }
		  _ref5 = [this.fromVar.match(NUMBER), this.toVar.match(NUMBER)], this.fromNum = _ref5[0], this.toNum = _ref5[1];
		  if (this.stepVar) {
			return this.stepNum = this.stepVar.match(NUMBER);
		  }
		};

		Range.prototype.compileNode = function(o) {
		  var cond, condPart, from, gt, idx, idxName, known, lt, namedIndex, stepPart, to, varPart, _ref2, _ref3;
		  if (!this.fromVar) {
			this.compileVariables(o);
		  }
		  if (!o.index) {
			return this.compileArray(o);
		  }
		  known = this.fromNum && this.toNum;
		  idx = del(o, 'index');
		  idxName = del(o, 'name');
		  namedIndex = idxName && idxName !== idx;
		  varPart = idx + " = " + this.fromC;
		  if (this.toC !== this.toVar) {
			varPart += ", " + this.toC;
		  }
		  if (this.step !== this.stepVar) {
			varPart += ", " + this.step;
		  }
		  _ref2 = [idx + " <" + this.equals, idx + " >" + this.equals], lt = _ref2[0], gt = _ref2[1];
		  condPart = this.stepNum ? parseNum(this.stepNum[0]) > 0 ? lt + " " + this.toVar : gt + " " + this.toVar : known ? ((_ref3 = [parseNum(this.fromNum[0]), parseNum(this.toNum[0])], from = _ref3[0], to = _ref3[1], _ref3), from <= to ? lt + " " + to : gt + " " + to) : (cond = this.stepVar ? this.stepVar + " > 0" : this.fromVar + " <= " + this.toVar, cond + " ? " + lt + " " + this.toVar + " : " + gt + " " + this.toVar);
		  stepPart = this.stepVar ? idx + " += " + this.stepVar : known ? namedIndex ? from <= to ? "++" + idx : "--" + idx : from <= to ? idx + "++" : idx + "--" : namedIndex ? cond + " ? ++" + idx + " : --" + idx : cond + " ? " + idx + "++ : " + idx + "--";
		  if (namedIndex) {
			varPart = idxName + " = " + varPart;
		  }
		  if (namedIndex) {
			stepPart = idxName + " = " + stepPart;
		  }
		  return [this.makeCode(varPart + "; " + condPart + "; " + stepPart)];
		};

		Range.prototype.compileArray = function(o) {
		  var args, body, cond, hasArgs, i, idt, post, pre, range, result, vars, _i, _ref2, _ref3, _results;
		  if (this.fromNum && this.toNum && Math.abs(this.fromNum - this.toNum) <= 20) {
			range = (function() {
			  _results = [];
			  for (var _i = _ref2 = +this.fromNum, _ref3 = +this.toNum; _ref2 <= _ref3 ? _i <= _ref3 : _i >= _ref3; _ref2 <= _ref3 ? _i++ : _i--){ _results.push(_i); }
			  return _results;
			}).apply(this);
			if (this.exclusive) {
			  range.pop();
			}
			return [this.makeCode("[" + (range.join(', ')) + "]")];
		  }
		  idt = this.tab + TAB;
		  i = o.scope.freeVariable('i');
		  result = o.scope.freeVariable('results');
		  pre = "\n" + idt + result + " = [];";
		  if (this.fromNum && this.toNum) {
			o.index = i;
			body = fragmentsToText(this.compileNode(o));
		  } else {
			vars = (i + " = " + this.fromC) + (this.toC !== this.toVar ? ", " + this.toC : '');
			cond = this.fromVar + " <= " + this.toVar;
			body = "var " + vars + "; " + cond + " ? " + i + " <" + this.equals + " " + this.toVar + " : " + i + " >" + this.equals + " " + this.toVar + "; " + cond + " ? " + i + "++ : " + i + "--";
		  }
		  post = "{ " + result + ".push(" + i + "); }\n" + idt + "return " + result + ";\n" + o.indent;
		  hasArgs = function(node) {
			return node != null ? node.contains(isLiteralArguments) : void 0;
		  };
		  if (hasArgs(this.from) || hasArgs(this.to)) {
			args = ', arguments';
		  }
		  return [this.makeCode("(function() {" + pre + "\n" + idt + "for (" + body + ")" + post + "}).apply(this" + (args != null ? args : '') + ")")];
		};

		return Range;

	  })(Base);

	  exports.Slice = Slice = (function(_super) {
		__extends(Slice, _super);

		Slice.prototype.children = ['range'];

		function Slice(range) {
		  this.range = range;
		  Slice.__super__.constructor.call(this);
		}

		Slice.prototype.compileNode = function(o) {
		  var compiled, compiledText, from, fromCompiled, to, toStr, _ref2;
		  _ref2 = this.range, to = _ref2.to, from = _ref2.from;
		  fromCompiled = from && from.compileToFragments(o, LEVEL_PAREN) || [this.makeCode('0')];
		  if (to) {
			compiled = to.compileToFragments(o, LEVEL_PAREN);
			compiledText = fragmentsToText(compiled);
			if (!(!this.range.exclusive && +compiledText === -1)) {
			  toStr = ', ' + (this.range.exclusive ? compiledText : SIMPLENUM.test(compiledText) ? "" + (+compiledText + 1) : (compiled = to.compileToFragments(o, LEVEL_ACCESS), "+" + (fragmentsToText(compiled)) + " + 1 || 9e9"));
			}
		  }
		  return [this.makeCode(".slice(" + (fragmentsToText(fromCompiled)) + (toStr || '') + ")")];
		};

		return Slice;

	  })(Base);

	  exports.Obj = Obj = (function(_super) {
		__extends(Obj, _super);

		function Obj(props, generated) {
		  this.generated = generated != null ? generated : false;
		  this.objects = this.properties = props || [];
		}

		Obj.prototype.children = ['properties'];

		Obj.prototype.compileNode = function(o) {
		  var answer, i, idt, indent, join, lastNoncom, node, prop, props, _i, _j, _len, _len1;
		  props = this.properties;
		  if (!props.length) {
			return [this.makeCode(this.front ? '({})' : '{}')];
		  }
		  if (this.generated) {
			for (_i = 0, _len = props.length; _i < _len; _i++) {
			  node = props[_i];
			  if (node instanceof Value) {
				node.error('cannot have an implicit value in an implicit object');
			  }
			}
		  }
		  idt = o.indent += TAB;
		  lastNoncom = this.lastNonComment(this.properties);
		  answer = [];
		  for (i = _j = 0, _len1 = props.length; _j < _len1; i = ++_j) {
			prop = props[i];
			join = i === props.length - 1 ? '' : prop === lastNoncom || prop instanceof Comment ? '\n' : ',\n';
			indent = prop instanceof Comment ? '' : idt;
			if (prop instanceof Assign && prop.variable instanceof Value && prop.variable.hasProperties()) {
			  prop.variable.error('Invalid object key');
			}
			if (prop instanceof Value && prop["this"]) {
			  prop = new Assign(prop.properties[0].name, prop, 'object');
			}
			if (!(prop instanceof Comment)) {
			  if (!(prop instanceof Assign)) {
				prop = new Assign(prop, prop, 'object');
			  }
			  (prop.variable.base || prop.variable).asKey = true;
			}
			if (indent) {
			  answer.push(this.makeCode(indent));
			}
			answer.push.apply(answer, prop.compileToFragments(o, LEVEL_TOP));
			if (join) {
			  answer.push(this.makeCode(join));
			}
		  }
		  answer.unshift(this.makeCode("{" + (props.length && '\n')));
		  answer.push(this.makeCode((props.length && '\n' + this.tab) + "}"));
		  if (this.front) {
			return this.wrapInBraces(answer);
		  } else {
			return answer;
		  }
		};

		Obj.prototype.assigns = function(name) {
		  var prop, _i, _len, _ref2;
		  _ref2 = this.properties;
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			prop = _ref2[_i];
			if (prop.assigns(name)) {
			  return true;
			}
		  }
		  return false;
		};

		return Obj;

	  })(Base);

	  exports.Arr = Arr = (function(_super) {
		__extends(Arr, _super);

		function Arr(objs) {
		  this.objects = objs || [];
		}

		Arr.prototype.children = ['objects'];

		Arr.prototype.compileNode = function(o) {
		  var answer, compiledObjs, fragments, index, obj, _i, _len;
		  if (!this.objects.length) {
			return [this.makeCode('[]')];
		  }
		  o.indent += TAB;
		  answer = Splat.compileSplattedArray(o, this.objects);
		  if (answer.length) {
			return answer;
		  }
		  answer = [];
		  compiledObjs = (function() {
			var _i, _len, _ref2, _results;
			_ref2 = this.objects;
			_results = [];
			for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			  obj = _ref2[_i];
			  _results.push(obj.compileToFragments(o, LEVEL_LIST));
			}
			return _results;
		  }).call(this);
		  for (index = _i = 0, _len = compiledObjs.length; _i < _len; index = ++_i) {
			fragments = compiledObjs[index];
			if (index) {
			  answer.push(this.makeCode(", "));
			}
			answer.push.apply(answer, fragments);
		  }
		  if (fragmentsToText(answer).indexOf('\n') >= 0) {
			answer.unshift(this.makeCode("[\n" + o.indent));
			answer.push(this.makeCode("\n" + this.tab + "]"));
		  } else {
			answer.unshift(this.makeCode("["));
			answer.push(this.makeCode("]"));
		  }
		  return answer;
		};

		Arr.prototype.assigns = function(name) {
		  var obj, _i, _len, _ref2;
		  _ref2 = this.objects;
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			obj = _ref2[_i];
			if (obj.assigns(name)) {
			  return true;
			}
		  }
		  return false;
		};

		return Arr;

	  })(Base);

	  exports.Class = Class = (function(_super) {
		__extends(Class, _super);

		function Class(variable, parent, body) {
		  this.variable = variable;
		  this.parent = parent;
		  this.body = body != null ? body : new Block;
		  this.boundFuncs = [];
		  this.body.classBody = true;
		}

		Class.prototype.children = ['variable', 'parent', 'body'];

		Class.prototype.determineName = function() {
		  var decl, tail;
		  if (!this.variable) {
			return null;
		  }
		  decl = (tail = last(this.variable.properties)) ? tail instanceof Access && tail.name.value : this.variable.base.value;
		  if (__indexOf.call(STRICT_PROSCRIBED, decl) >= 0) {
			this.variable.error("class variable name may not be " + decl);
		  }
		  return decl && (decl = IDENTIFIER.test(decl) && decl);
		};

		Class.prototype.setContext = function(name) {
		  return this.body.traverseChildren(false, function(node) {
			if (node.classBody) {
			  return false;
			}
			if (node instanceof Literal && node.value === 'this') {
			  return node.value = name;
			} else if (node instanceof Code) {
			  node.klass = name;
			  if (node.bound) {
				return node.context = name;
			  }
			}
		  });
		};

		Class.prototype.addBoundFunctions = function(o) {
		  var bvar, lhs, _i, _len, _ref2;
		  _ref2 = this.boundFuncs;
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			bvar = _ref2[_i];
			lhs = (new Value(new Literal("this"), [new Access(bvar)])).compile(o);
			this.ctor.body.unshift(new Literal(lhs + " = " + (utility('bind')) + "(" + lhs + ", this)"));
		  }
		};

		Class.prototype.addProperties = function(node, name, o) {
		  var assign, base, exprs, func, props;
		  props = node.base.properties.slice(0);
		  exprs = (function() {
			var _results;
			_results = [];
			while (assign = props.shift()) {
			  if (assign instanceof Assign) {
				base = assign.variable.base;
				delete assign.context;
				func = assign.value;
				if (base.value === 'constructor') {
				  if (this.ctor) {
					assign.error('cannot define more than one constructor in a class');
				  }
				  if (func.bound) {
					assign.error('cannot define a constructor as a bound function');
				  }
				  if (func instanceof Code) {
					assign = this.ctor = func;
				  } else {
					this.externalCtor = o.classScope.freeVariable('class');
					assign = new Assign(new Literal(this.externalCtor), func);
				  }
				} else {
				  if (assign.variable["this"]) {
					func["static"] = true;
				  } else {
					assign.variable = new Value(new Literal(name), [new Access(new Literal('prototype')), new Access(base)]);
					if (func instanceof Code && func.bound) {
					  this.boundFuncs.push(base);
					  func.bound = false;
					}
				  }
				}
			  }
			  _results.push(assign);
			}
			return _results;
		  }).call(this);
		  return compact(exprs);
		};

		Class.prototype.walkBody = function(name, o) {
		  return this.traverseChildren(false, (function(_this) {
			return function(child) {
			  var cont, exps, i, node, _i, _len, _ref2;
			  cont = true;
			  if (child instanceof Class) {
				return false;
			  }
			  if (child instanceof Block) {
				_ref2 = exps = child.expressions;
				for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
				  node = _ref2[i];
				  if (node instanceof Assign && node.variable.looksStatic(name)) {
					node.value["static"] = true;
				  } else if (node instanceof Value && node.isObject(true)) {
					cont = false;
					exps[i] = _this.addProperties(node, name, o);
				  }
				}
				child.expressions = exps = flatten(exps);
			  }
			  return cont && !(child instanceof Class);
			};
		  })(this));
		};

		Class.prototype.hoistDirectivePrologue = function() {
		  var expressions, index, node;
		  index = 0;
		  expressions = this.body.expressions;
		  while ((node = expressions[index]) && node instanceof Comment || node instanceof Value && node.isString()) {
			++index;
		  }
		  return this.directives = expressions.splice(0, index);
		};

		Class.prototype.ensureConstructor = function(name) {
		  if (!this.ctor) {
			this.ctor = new Code;
			if (this.externalCtor) {
			  this.ctor.body.push(new Literal(this.externalCtor + ".apply(this, arguments)"));
			} else if (this.parent) {
			  this.ctor.body.push(new Literal(name + ".__super__.constructor.apply(this, arguments)"));
			}
			this.ctor.body.makeReturn();
			this.body.expressions.unshift(this.ctor);
		  }
		  this.ctor.ctor = this.ctor.name = name;
		  this.ctor.klass = null;
		  return this.ctor.noReturn = true;
		};

		Class.prototype.compileNode = function(o) {
		  var args, argumentsNode, func, jumpNode, klass, lname, name, superClass, _ref2;
		  if (jumpNode = this.body.jumps()) {
			jumpNode.error('Class bodies cannot contain pure statements');
		  }
		  if (argumentsNode = this.body.contains(isLiteralArguments)) {
			argumentsNode.error("Class bodies shouldn't reference arguments");
		  }
		  name = this.determineName() || '_Class';
		  if (name.reserved) {
			name = "_" + name;
		  }
		  lname = new Literal(name);
		  func = new Code([], Block.wrap([this.body]));
		  args = [];
		  o.classScope = func.makeScope(o.scope);
		  this.hoistDirectivePrologue();
		  this.setContext(name);
		  this.walkBody(name, o);
		  this.ensureConstructor(name);
		  this.addBoundFunctions(o);
		  this.body.spaced = true;
		  this.body.expressions.push(lname);
		  if (this.parent) {
			superClass = new Literal(o.classScope.freeVariable('super', false));
			this.body.expressions.unshift(new Extends(lname, superClass));
			func.params.push(new Param(superClass));
			args.push(this.parent);
		  }
		  (_ref2 = this.body.expressions).unshift.apply(_ref2, this.directives);
		  klass = new Parens(new Call(func, args));
		  if (this.variable) {
			klass = new Assign(this.variable, klass);
		  }
		  return klass.compileToFragments(o);
		};

		return Class;

	  })(Base);

	  exports.Assign = Assign = (function(_super) {
		__extends(Assign, _super);

		function Assign(variable, value, context, options) {
		  var forbidden, name, _ref2;
		  this.variable = variable;
		  this.value = value;
		  this.context = context;
		  this.param = options && options.param;
		  this.subpattern = options && options.subpattern;
		  forbidden = (_ref2 = (name = this.variable.unwrapAll().value), __indexOf.call(STRICT_PROSCRIBED, _ref2) >= 0);
		  if (forbidden && this.context !== 'object') {
			this.variable.error("variable name may not be \"" + name + "\"");
		  }
		}

		Assign.prototype.children = ['variable', 'value'];

		Assign.prototype.isStatement = function(o) {
		  return (o != null ? o.level : void 0) === LEVEL_TOP && (this.context != null) && __indexOf.call(this.context, "?") >= 0;
		};

		Assign.prototype.assigns = function(name) {
		  return this[this.context === 'object' ? 'value' : 'variable'].assigns(name);
		};

		Assign.prototype.unfoldSoak = function(o) {
		  return unfoldSoak(o, this, 'variable');
		};

		Assign.prototype.compileNode = function(o) {
		  var answer, compiledName, isValue, match, name, val, varBase, _ref2, _ref3, _ref4, _ref5;
		  if (isValue = this.variable instanceof Value) {
			if (this.variable.isArray() || this.variable.isObject()) {
			  return this.compilePatternMatch(o);
			}
			if (this.variable.isSplice()) {
			  return this.compileSplice(o);
			}
			if ((_ref2 = this.context) === '||=' || _ref2 === '&&=' || _ref2 === '?=') {
			  return this.compileConditional(o);
			}
			if ((_ref3 = this.context) === '**=' || _ref3 === '//=' || _ref3 === '%%=') {
			  return this.compileSpecialMath(o);
			}
		  }
		  compiledName = this.variable.compileToFragments(o, LEVEL_LIST);
		  name = fragmentsToText(compiledName);
		  if (!this.context) {
			varBase = this.variable.unwrapAll();
			if (!varBase.isAssignable()) {
			  this.variable.error("\"" + (this.variable.compile(o)) + "\" cannot be assigned");
			}
			if (!(typeof varBase.hasProperties === "function" ? varBase.hasProperties() : void 0)) {
			  if (this.param) {
				o.scope.add(name, 'var');
			  } else {
				o.scope.find(name);
			  }
			}
		  }
		  if (this.value instanceof Code && (match = METHOD_DEF.exec(name))) {
			if (match[2]) {
			  this.value.klass = match[1];
			}
			this.value.name = (_ref4 = (_ref5 = match[3]) != null ? _ref5 : match[4]) != null ? _ref4 : match[5];
		  }
		  val = this.value.compileToFragments(o, LEVEL_LIST);
		  if (this.context === 'object') {
			return compiledName.concat(this.makeCode(": "), val);
		  }
		  answer = compiledName.concat(this.makeCode(" " + (this.context || '=') + " "), val);
		  if (o.level <= LEVEL_LIST) {
			return answer;
		  } else {
			return this.wrapInBraces(answer);
		  }
		};

		Assign.prototype.compilePatternMatch = function(o) {
		  var acc, assigns, code, expandedIdx, fragments, i, idx, isObject, ivar, name, obj, objects, olen, ref, rest, top, val, value, vvar, vvarText, _i, _len, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
		  top = o.level === LEVEL_TOP;
		  value = this.value;
		  objects = this.variable.base.objects;
		  if (!(olen = objects.length)) {
			code = value.compileToFragments(o);
			if (o.level >= LEVEL_OP) {
			  return this.wrapInBraces(code);
			} else {
			  return code;
			}
		  }
		  isObject = this.variable.isObject();
		  if (top && olen === 1 && !((obj = objects[0]) instanceof Splat)) {
			if (obj instanceof Assign) {
			  _ref2 = obj, (_ref3 = _ref2.variable, idx = _ref3.base), obj = _ref2.value;
			} else {
			  idx = isObject ? obj["this"] ? obj.properties[0].name : obj : new Literal(0);
			}
			acc = IDENTIFIER.test(idx.unwrap().value || 0);
			value = new Value(value);
			value.properties.push(new (acc ? Access : Index)(idx));
			if (_ref4 = obj.unwrap().value, __indexOf.call(RESERVED, _ref4) >= 0) {
			  obj.error("assignment to a reserved word: " + (obj.compile(o)));
			}
			return new Assign(obj, value, null, {
			  param: this.param
			}).compileToFragments(o, LEVEL_TOP);
		  }
		  vvar = value.compileToFragments(o, LEVEL_LIST);
		  vvarText = fragmentsToText(vvar);
		  assigns = [];
		  expandedIdx = false;
		  if (!IDENTIFIER.test(vvarText) || this.variable.assigns(vvarText)) {
			assigns.push([this.makeCode((ref = o.scope.freeVariable('ref')) + " = ")].concat(__slice.call(vvar)));
			vvar = [this.makeCode(ref)];
			vvarText = ref;
		  }
		  for (i = _i = 0, _len = objects.length; _i < _len; i = ++_i) {
			obj = objects[i];
			idx = i;
			if (isObject) {
			  if (obj instanceof Assign) {
				_ref5 = obj, (_ref6 = _ref5.variable, idx = _ref6.base), obj = _ref5.value;
			  } else {
				if (obj.base instanceof Parens) {
				  _ref7 = new Value(obj.unwrapAll()).cacheReference(o), obj = _ref7[0], idx = _ref7[1];
				} else {
				  idx = obj["this"] ? obj.properties[0].name : obj;
				}
			  }
			}
			if (!expandedIdx && obj instanceof Splat) {
			  name = obj.name.unwrap().value;
			  obj = obj.unwrap();
			  val = olen + " <= " + vvarText + ".length ? " + (utility('slice')) + ".call(" + vvarText + ", " + i;
			  if (rest = olen - i - 1) {
				ivar = o.scope.freeVariable('i');
				val += ", " + ivar + " = " + vvarText + ".length - " + rest + ") : (" + ivar + " = " + i + ", [])";
			  } else {
				val += ") : []";
			  }
			  val = new Literal(val);
			  expandedIdx = ivar + "++";
			} else if (!expandedIdx && obj instanceof Expansion) {
			  if (rest = olen - i - 1) {
				if (rest === 1) {
				  expandedIdx = vvarText + ".length - 1";
				} else {
				  ivar = o.scope.freeVariable('i');
				  val = new Literal(ivar + " = " + vvarText + ".length - " + rest);
				  expandedIdx = ivar + "++";
				  assigns.push(val.compileToFragments(o, LEVEL_LIST));
				}
			  }
			  continue;
			} else {
			  name = obj.unwrap().value;
			  if (obj instanceof Splat || obj instanceof Expansion) {
				obj.error("multiple splats/expansions are disallowed in an assignment");
			  }
			  if (typeof idx === 'number') {
				idx = new Literal(expandedIdx || idx);
				acc = false;
			  } else {
				acc = isObject && IDENTIFIER.test(idx.unwrap().value || 0);
			  }
			  val = new Value(new Literal(vvarText), [new (acc ? Access : Index)(idx)]);
			}
			if ((name != null) && __indexOf.call(RESERVED, name) >= 0) {
			  obj.error("assignment to a reserved word: " + (obj.compile(o)));
			}
			assigns.push(new Assign(obj, val, null, {
			  param: this.param,
			  subpattern: true
			}).compileToFragments(o, LEVEL_LIST));
		  }
		  if (!(top || this.subpattern)) {
			assigns.push(vvar);
		  }
		  fragments = this.joinFragmentArrays(assigns, ', ');
		  if (o.level < LEVEL_LIST) {
			return fragments;
		  } else {
			return this.wrapInBraces(fragments);
		  }
		};

		Assign.prototype.compileConditional = function(o) {
		  var fragments, left, right, _ref2;
		  _ref2 = this.variable.cacheReference(o), left = _ref2[0], right = _ref2[1];
		  if (!left.properties.length && left.base instanceof Literal && left.base.value !== "this" && !o.scope.check(left.base.value)) {
			this.variable.error("the variable \"" + left.base.value + "\" can't be assigned with " + this.context + " because it has not been declared before");
		  }
		  if (__indexOf.call(this.context, "?") >= 0) {
			o.isExistentialEquals = true;
			return new If(new Existence(left), right, {
			  type: 'if'
			}).addElse(new Assign(right, this.value, '=')).compileToFragments(o);
		  } else {
			fragments = new Op(this.context.slice(0, -1), left, new Assign(right, this.value, '=')).compileToFragments(o);
			if (o.level <= LEVEL_LIST) {
			  return fragments;
			} else {
			  return this.wrapInBraces(fragments);
			}
		  }
		};

		Assign.prototype.compileSpecialMath = function(o) {
		  var left, right, _ref2;
		  _ref2 = this.variable.cacheReference(o), left = _ref2[0], right = _ref2[1];
		  return new Assign(left, new Op(this.context.slice(0, -1), right, this.value)).compileToFragments(o);
		};

		Assign.prototype.compileSplice = function(o) {
		  var answer, exclusive, from, fromDecl, fromRef, name, to, valDef, valRef, _ref2, _ref3, _ref4;
		  _ref2 = this.variable.properties.pop().range, from = _ref2.from, to = _ref2.to, exclusive = _ref2.exclusive;
		  name = this.variable.compile(o);
		  if (from) {
			_ref3 = this.cacheToCodeFragments(from.cache(o, LEVEL_OP)), fromDecl = _ref3[0], fromRef = _ref3[1];
		  } else {
			fromDecl = fromRef = '0';
		  }
		  if (to) {
			if (from instanceof Value && from.isSimpleNumber() && to instanceof Value && to.isSimpleNumber()) {
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
		  _ref4 = this.value.cache(o, LEVEL_LIST), valDef = _ref4[0], valRef = _ref4[1];
		  answer = [].concat(this.makeCode("[].splice.apply(" + name + ", [" + fromDecl + ", " + to + "].concat("), valDef, this.makeCode(")), "), valRef);
		  if (o.level > LEVEL_TOP) {
			return this.wrapInBraces(answer);
		  } else {
			return answer;
		  }
		};

		return Assign;

	  })(Base);

	  exports.Code = Code = (function(_super) {
		__extends(Code, _super);

		function Code(params, body, tag) {
		  this.params = params || [];
		  this.body = body || new Block;
		  this.bound = tag === 'boundfunc';
		  this.isGenerator = !!this.body.contains(function(node) {
			var _ref2;
			return node instanceof Op && ((_ref2 = node.operator) === 'yield' || _ref2 === 'yield*');
		  });
		}

		Code.prototype.children = ['params', 'body'];

		Code.prototype.isStatement = function() {
		  return !!this.ctor;
		};

		Code.prototype.jumps = NO;

		Code.prototype.makeScope = function(parentScope) {
		  return new Scope(parentScope, this.body, this);
		};

		Code.prototype.compileNode = function(o) {
		  var answer, boundfunc, code, exprs, i, lit, p, param, params, ref, splats, uniqs, val, wasEmpty, wrapper, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
		  if (this.bound && ((_ref2 = o.scope.method) != null ? _ref2.bound : void 0)) {
			this.context = o.scope.method.context;
		  }
		  if (this.bound && !this.context) {
			this.context = '_this';
			wrapper = new Code([new Param(new Literal(this.context))], new Block([this]));
			boundfunc = new Call(wrapper, [new Literal('this')]);
			boundfunc.updateLocationDataIfMissing(this.locationData);
			return boundfunc.compileNode(o);
		  }
		  o.scope = del(o, 'classScope') || this.makeScope(o.scope);
		  o.scope.shared = del(o, 'sharedScope');
		  o.indent += TAB;
		  delete o.bare;
		  delete o.isExistentialEquals;
		  params = [];
		  exprs = [];
		  _ref3 = this.params;
		  for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
			param = _ref3[_i];
			if (!(param instanceof Expansion)) {
			  o.scope.parameter(param.asReference(o));
			}
		  }
		  _ref4 = this.params;
		  for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
			param = _ref4[_j];
			if (!(param.splat || param instanceof Expansion)) {
			  continue;
			}
			_ref5 = this.params;
			for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
			  p = _ref5[_k].name;
			  if (!(!(param instanceof Expansion))) {
				continue;
			  }
			  if (p["this"]) {
				p = p.properties[0].name;
			  }
			  if (p.value) {
				o.scope.add(p.value, 'var', true);
			  }
			}
			splats = new Assign(new Value(new Arr((function() {
			  var _l, _len3, _ref6, _results;
			  _ref6 = this.params;
			  _results = [];
			  for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
				p = _ref6[_l];
				_results.push(p.asReference(o));
			  }
			  return _results;
			}).call(this))), new Value(new Literal('arguments')));
			break;
		  }
		  _ref6 = this.params;
		  for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
			param = _ref6[_l];
			if (param.isComplex()) {
			  val = ref = param.asReference(o);
			  if (param.value) {
				val = new Op('?', ref, param.value);
			  }
			  exprs.push(new Assign(new Value(param.name), val, '=', {
				param: true
			  }));
			} else {
			  ref = param;
			  if (param.value) {
				lit = new Literal(ref.name.value + ' == null');
				val = new Assign(new Value(param.name), param.value, '=');
				exprs.push(new If(lit, val));
			  }
			}
			if (!splats) {
			  params.push(ref);
			}
		  }
		  wasEmpty = this.body.isEmpty();
		  if (splats) {
			exprs.unshift(splats);
		  }
		  if (exprs.length) {
			(_ref7 = this.body.expressions).unshift.apply(_ref7, exprs);
		  }
		  for (i = _m = 0, _len4 = params.length; _m < _len4; i = ++_m) {
			p = params[i];
			params[i] = p.compileToFragments(o);
			o.scope.parameter(fragmentsToText(params[i]));
		  }
		  uniqs = [];
		  this.eachParamName(function(name, node) {
			if (__indexOf.call(uniqs, name) >= 0) {
			  node.error("multiple parameters named '" + name + "'");
			}
			return uniqs.push(name);
		  });
		  if (!(wasEmpty || this.noReturn)) {
			this.body.makeReturn();
		  }
		  code = 'function';
		  if (this.isGenerator) {
			code += '*';
		  }
		  if (this.ctor) {
			code += ' ' + this.name;
		  }
		  code += '(';
		  answer = [this.makeCode(code)];
		  for (i = _n = 0, _len5 = params.length; _n < _len5; i = ++_n) {
			p = params[i];
			if (i) {
			  answer.push(this.makeCode(", "));
			}
			answer.push.apply(answer, p);
		  }
		  answer.push(this.makeCode(') {'));
		  if (!this.body.isEmpty()) {
			answer = answer.concat(this.makeCode("\n"), this.body.compileWithDeclarations(o), this.makeCode("\n" + this.tab));
		  }
		  answer.push(this.makeCode('}'));
		  if (this.ctor) {
			return [this.makeCode(this.tab)].concat(__slice.call(answer));
		  }
		  if (this.front || (o.level >= LEVEL_ACCESS)) {
			return this.wrapInBraces(answer);
		  } else {
			return answer;
		  }
		};

		Code.prototype.eachParamName = function(iterator) {
		  var param, _i, _len, _ref2, _results;
		  _ref2 = this.params;
		  _results = [];
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			param = _ref2[_i];
			_results.push(param.eachName(iterator));
		  }
		  return _results;
		};

		Code.prototype.traverseChildren = function(crossScope, func) {
		  if (crossScope) {
			return Code.__super__.traverseChildren.call(this, crossScope, func);
		  }
		};

		return Code;

	  })(Base);

	  exports.Param = Param = (function(_super) {
		__extends(Param, _super);

		function Param(name, value, splat) {
		  var _ref2;
		  this.name = name;
		  this.value = value;
		  this.splat = splat;
		  if (_ref2 = (name = this.name.unwrapAll().value), __indexOf.call(STRICT_PROSCRIBED, _ref2) >= 0) {
			this.name.error("parameter name \"" + name + "\" is not allowed");
		  }
		}

		Param.prototype.children = ['name', 'value'];

		Param.prototype.compileToFragments = function(o) {
		  return this.name.compileToFragments(o, LEVEL_LIST);
		};

		Param.prototype.asReference = function(o) {
		  var node;
		  if (this.reference) {
			return this.reference;
		  }
		  node = this.name;
		  if (node["this"]) {
			node = node.properties[0].name;
			if (node.value.reserved) {
			  node = new Literal(o.scope.freeVariable(node.value));
			}
		  } else if (node.isComplex()) {
			node = new Literal(o.scope.freeVariable('arg'));
		  }
		  node = new Value(node);
		  if (this.splat) {
			node = new Splat(node);
		  }
		  node.updateLocationDataIfMissing(this.locationData);
		  return this.reference = node;
		};

		Param.prototype.isComplex = function() {
		  return this.name.isComplex();
		};

		Param.prototype.eachName = function(iterator, name) {
		  var atParam, node, obj, _i, _len, _ref2;
		  if (name == null) {
			name = this.name;
		  }
		  atParam = function(obj) {
			var node;
			node = obj.properties[0].name;
			if (!node.value.reserved) {
			  return iterator(node.value, node);
			}
		  };
		  if (name instanceof Literal) {
			return iterator(name.value, name);
		  }
		  if (name instanceof Value) {
			return atParam(name);
		  }
		  _ref2 = name.objects;
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			obj = _ref2[_i];
			if (obj instanceof Assign) {
			  this.eachName(iterator, obj.value.unwrap());
			} else if (obj instanceof Splat) {
			  node = obj.name.unwrap();
			  iterator(node.value, node);
			} else if (obj instanceof Value) {
			  if (obj.isArray() || obj.isObject()) {
				this.eachName(iterator, obj.base);
			  } else if (obj["this"]) {
				atParam(obj);
			  } else {
				iterator(obj.base.value, obj.base);
			  }
			} else if (!(obj instanceof Expansion)) {
			  obj.error("illegal parameter " + (obj.compile()));
			}
		  }
		};

		return Param;

	  })(Base);

	  exports.Splat = Splat = (function(_super) {
		__extends(Splat, _super);

		Splat.prototype.children = ['name'];

		Splat.prototype.isAssignable = YES;

		function Splat(name) {
		  this.name = name.compile ? name : new Literal(name);
		}

		Splat.prototype.assigns = function(name) {
		  return this.name.assigns(name);
		};

		Splat.prototype.compileToFragments = function(o) {
		  return this.name.compileToFragments(o);
		};

		Splat.prototype.unwrap = function() {
		  return this.name;
		};

		Splat.compileSplattedArray = function(o, list, apply) {
		  var args, base, compiledNode, concatPart, fragments, i, index, node, _i, _len;
		  index = -1;
		  while ((node = list[++index]) && !(node instanceof Splat)) {
			continue;
		  }
		  if (index >= list.length) {
			return [];
		  }
		  if (list.length === 1) {
			node = list[0];
			fragments = node.compileToFragments(o, LEVEL_LIST);
			if (apply) {
			  return fragments;
			}
			return [].concat(node.makeCode((utility('slice')) + ".call("), fragments, node.makeCode(")"));
		  }
		  args = list.slice(index);
		  for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
			node = args[i];
			compiledNode = node.compileToFragments(o, LEVEL_LIST);
			args[i] = node instanceof Splat ? [].concat(node.makeCode((utility('slice')) + ".call("), compiledNode, node.makeCode(")")) : [].concat(node.makeCode("["), compiledNode, node.makeCode("]"));
		  }
		  if (index === 0) {
			node = list[0];
			concatPart = node.joinFragmentArrays(args.slice(1), ', ');
			return args[0].concat(node.makeCode(".concat("), concatPart, node.makeCode(")"));
		  }
		  base = (function() {
			var _j, _len1, _ref2, _results;
			_ref2 = list.slice(0, index);
			_results = [];
			for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
			  node = _ref2[_j];
			  _results.push(node.compileToFragments(o, LEVEL_LIST));
			}
			return _results;
		  })();
		  base = list[0].joinFragmentArrays(base, ', ');
		  concatPart = list[index].joinFragmentArrays(args, ', ');
		  return [].concat(list[0].makeCode("["), base, list[index].makeCode("].concat("), concatPart, (last(list)).makeCode(")"));
		};

		return Splat;

	  })(Base);

	  exports.Expansion = Expansion = (function(_super) {
		__extends(Expansion, _super);

		function Expansion() {
		  return Expansion.__super__.constructor.apply(this, arguments);
		}

		Expansion.prototype.isComplex = NO;

		Expansion.prototype.compileNode = function(o) {
		  return this.error('Expansion must be used inside a destructuring assignment or parameter list');
		};

		Expansion.prototype.asReference = function(o) {
		  return this;
		};

		Expansion.prototype.eachName = function(iterator) {};

		return Expansion;

	  })(Base);

	  exports.While = While = (function(_super) {
		__extends(While, _super);

		function While(condition, options) {
		  this.condition = (options != null ? options.invert : void 0) ? condition.invert() : condition;
		  this.guard = options != null ? options.guard : void 0;
		}

		While.prototype.children = ['condition', 'guard', 'body'];

		While.prototype.isStatement = YES;

		While.prototype.makeReturn = function(res) {
		  if (res) {
			return While.__super__.makeReturn.apply(this, arguments);
		  } else {
			this.returns = !this.jumps({
			  loop: true
			});
			return this;
		  }
		};

		While.prototype.addBody = function(body) {
		  this.body = body;
		  return this;
		};

		While.prototype.jumps = function() {
		  var expressions, jumpNode, node, _i, _len;
		  expressions = this.body.expressions;
		  if (!expressions.length) {
			return false;
		  }
		  for (_i = 0, _len = expressions.length; _i < _len; _i++) {
			node = expressions[_i];
			if (jumpNode = node.jumps({
			  loop: true
			})) {
			  return jumpNode;
			}
		  }
		  return false;
		};

		While.prototype.compileNode = function(o) {
		  var answer, body, rvar, set;
		  o.indent += TAB;
		  set = '';
		  body = this.body;
		  if (body.isEmpty()) {
			body = this.makeCode('');
		  } else {
			if (this.returns) {
			  body.makeReturn(rvar = o.scope.freeVariable('results'));
			  set = "" + this.tab + rvar + " = [];\n";
			}
			if (this.guard) {
			  if (body.expressions.length > 1) {
				body.expressions.unshift(new If((new Parens(this.guard)).invert(), new Literal("continue")));
			  } else {
				if (this.guard) {
				  body = Block.wrap([new If(this.guard, body)]);
				}
			  }
			}
			body = [].concat(this.makeCode("\n"), body.compileToFragments(o, LEVEL_TOP), this.makeCode("\n" + this.tab));
		  }
		  answer = [].concat(this.makeCode(set + this.tab + "while ("), this.condition.compileToFragments(o, LEVEL_PAREN), this.makeCode(") {"), body, this.makeCode("}"));
		  if (this.returns) {
			answer.push(this.makeCode("\n" + this.tab + "return " + rvar + ";"));
		  }
		  return answer;
		};

		return While;

	  })(Base);

	  exports.Op = Op = (function(_super) {
		var CONVERSIONS, INVERSIONS;

		__extends(Op, _super);

		function Op(op, first, second, flip) {
		  if (op === 'in') {
			return new In(first, second);
		  }
		  if (op === 'do') {
			return this.generateDo(first);
		  }
		  if (op === 'new') {
			if (first instanceof Call && !first["do"] && !first.isNew) {
			  return first.newInstance();
			}
			if (first instanceof Code && first.bound || first["do"]) {
			  first = new Parens(first);
			}
		  }
		  this.operator = CONVERSIONS[op] || op;
		  this.first = first;
		  this.second = second;
		  this.flip = !!flip;
		  return this;
		}

		CONVERSIONS = {
		  '==': '===',
		  '!=': '!==',
		  'of': 'in',
		  'yieldfrom': 'yield*'
		};

		INVERSIONS = {
		  '!==': '===',
		  '===': '!=='
		};

		Op.prototype.children = ['first', 'second'];

		Op.prototype.isSimpleNumber = NO;

		Op.prototype.isYield = function() {
		  var _ref2;
		  return (_ref2 = this.operator) === 'yield' || _ref2 === 'yield*';
		};

		Op.prototype.isUnary = function() {
		  return !this.second;
		};

		Op.prototype.isComplex = function() {
		  var _ref2;
		  return !(this.isUnary() && ((_ref2 = this.operator) === '+' || _ref2 === '-')) || this.first.isComplex();
		};

		Op.prototype.isChainable = function() {
		  var _ref2;
		  return (_ref2 = this.operator) === '<' || _ref2 === '>' || _ref2 === '>=' || _ref2 === '<=' || _ref2 === '===' || _ref2 === '!==';
		};

		Op.prototype.invert = function() {
		  var allInvertable, curr, fst, op, _ref2;
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
		  } else if (this.operator === '!' && (fst = this.first.unwrap()) instanceof Op && ((_ref2 = fst.operator) === '!' || _ref2 === 'in' || _ref2 === 'instanceof')) {
			return fst;
		  } else {
			return new Op('!', this);
		  }
		};

		Op.prototype.unfoldSoak = function(o) {
		  var _ref2;
		  return ((_ref2 = this.operator) === '++' || _ref2 === '--' || _ref2 === 'delete') && unfoldSoak(o, this, 'first');
		};

		Op.prototype.generateDo = function(exp) {
		  var call, func, param, passedParams, ref, _i, _len, _ref2;
		  passedParams = [];
		  func = exp instanceof Assign && (ref = exp.value.unwrap()) instanceof Code ? ref : exp;
		  _ref2 = func.params || [];
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			param = _ref2[_i];
			if (param.value) {
			  passedParams.push(param.value);
			  delete param.value;
			} else {
			  passedParams.push(param);
			}
		  }
		  call = new Call(exp, passedParams);
		  call["do"] = true;
		  return call;
		};

		Op.prototype.compileNode = function(o) {
		  var answer, isChain, lhs, rhs, _ref2, _ref3;
		  isChain = this.isChainable() && this.first.isChainable();
		  if (!isChain) {
			this.first.front = this.front;
		  }
		  if (this.operator === 'delete' && o.scope.check(this.first.unwrapAll().value)) {
			this.error('delete operand may not be argument or var');
		  }
		  if (((_ref2 = this.operator) === '--' || _ref2 === '++') && (_ref3 = this.first.unwrapAll().value, __indexOf.call(STRICT_PROSCRIBED, _ref3) >= 0)) {
			this.error("cannot increment/decrement \"" + (this.first.unwrapAll().value) + "\"");
		  }
		  if (this.isYield()) {
			return this.compileYield(o);
		  }
		  if (this.isUnary()) {
			return this.compileUnary(o);
		  }
		  if (isChain) {
			return this.compileChain(o);
		  }
		  switch (this.operator) {
			case '?':
			  return this.compileExistence(o);
			case '**':
			  return this.compilePower(o);
			case '//':
			  return this.compileFloorDivision(o);
			case '%%':
			  return this.compileModulo(o);
			default:
			  lhs = this.first.compileToFragments(o, LEVEL_OP);
			  rhs = this.second.compileToFragments(o, LEVEL_OP);
			  answer = [].concat(lhs, this.makeCode(" " + this.operator + " "), rhs);
			  if (o.level <= LEVEL_OP) {
				return answer;
			  } else {
				return this.wrapInBraces(answer);
			  }
		  }
		};

		Op.prototype.compileChain = function(o) {
		  var fragments, fst, shared, _ref2;
		  _ref2 = this.first.second.cache(o), this.first.second = _ref2[0], shared = _ref2[1];
		  fst = this.first.compileToFragments(o, LEVEL_OP);
		  fragments = fst.concat(this.makeCode(" " + (this.invert ? '&&' : '||') + " "), shared.compileToFragments(o), this.makeCode(" " + this.operator + " "), this.second.compileToFragments(o, LEVEL_OP));
		  return this.wrapInBraces(fragments);
		};

		Op.prototype.compileExistence = function(o) {
		  var fst, ref;
		  if (this.first.isComplex()) {
			ref = new Literal(o.scope.freeVariable('ref'));
			fst = new Parens(new Assign(ref, this.first));
		  } else {
			fst = this.first;
			ref = fst;
		  }
		  return new If(new Existence(fst), ref, {
			type: 'if'
		  }).addElse(this.second).compileToFragments(o);
		};

		Op.prototype.compileUnary = function(o) {
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
		};

		Op.prototype.compileYield = function(o) {
		  var op, parts;
		  parts = [];
		  op = this.operator;
		  if (o.scope.parent == null) {
			this.error('yield statements must occur within a function generator.');
		  }
		  if (__indexOf.call(Object.keys(this.first), 'expression') >= 0) {
			if (this.first.expression != null) {
			  parts.push(this.first.expression.compileToFragments(o, LEVEL_OP));
			}
		  } else {
			parts.push([this.makeCode("(" + op + " ")]);
			parts.push(this.first.compileToFragments(o, LEVEL_OP));
			parts.push([this.makeCode(")")]);
		  }
		  return this.joinFragmentArrays(parts, '');
		};

		Op.prototype.compilePower = function(o) {
		  var pow;
		  pow = new Value(new Literal('Math'), [new Access(new Literal('pow'))]);
		  return new Call(pow, [this.first, this.second]).compileToFragments(o);
		};

		Op.prototype.compileFloorDivision = function(o) {
		  var div, floor;
		  floor = new Value(new Literal('Math'), [new Access(new Literal('floor'))]);
		  div = new Op('/', this.first, this.second);
		  return new Call(floor, [div]).compileToFragments(o);
		};

		Op.prototype.compileModulo = function(o) {
		  var mod;
		  mod = new Value(new Literal(utility('modulo')));
		  return new Call(mod, [this.first, this.second]).compileToFragments(o);
		};

		Op.prototype.toString = function(idt) {
		  return Op.__super__.toString.call(this, idt, this.constructor.name + ' ' + this.operator);
		};

		return Op;

	  })(Base);

	  exports.In = In = (function(_super) {
		__extends(In, _super);

		function In(object, array) {
		  this.object = object;
		  this.array = array;
		}

		In.prototype.children = ['object', 'array'];

		In.prototype.invert = NEGATE;

		In.prototype.compileNode = function(o) {
		  var hasSplat, obj, _i, _len, _ref2;
		  if (this.array instanceof Value && this.array.isArray() && this.array.base.objects.length) {
			_ref2 = this.array.base.objects;
			for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			  obj = _ref2[_i];
			  if (!(obj instanceof Splat)) {
				continue;
			  }
			  hasSplat = true;
			  break;
			}
			if (!hasSplat) {
			  return this.compileOrTest(o);
			}
		  }
		  return this.compileLoopTest(o);
		};

		In.prototype.compileOrTest = function(o) {
		  var cmp, cnj, i, item, ref, sub, tests, _i, _len, _ref2, _ref3, _ref4;
		  _ref2 = this.object.cache(o, LEVEL_OP), sub = _ref2[0], ref = _ref2[1];
		  _ref3 = this.negated ? [' !== ', ' && '] : [' === ', ' || '], cmp = _ref3[0], cnj = _ref3[1];
		  tests = [];
		  _ref4 = this.array.base.objects;
		  for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
			item = _ref4[i];
			if (i) {
			  tests.push(this.makeCode(cnj));
			}
			tests = tests.concat((i ? ref : sub), this.makeCode(cmp), item.compileToFragments(o, LEVEL_ACCESS));
		  }
		  if (o.level < LEVEL_OP) {
			return tests;
		  } else {
			return this.wrapInBraces(tests);
		  }
		};

		In.prototype.compileLoopTest = function(o) {
		  var fragments, ref, sub, _ref2;
		  _ref2 = this.object.cache(o, LEVEL_LIST), sub = _ref2[0], ref = _ref2[1];
		  fragments = [].concat(this.makeCode(utility('indexOf') + ".call("), this.array.compileToFragments(o, LEVEL_LIST), this.makeCode(", "), ref, this.makeCode(") " + (this.negated ? '< 0' : '>= 0')));
		  if (fragmentsToText(sub) === fragmentsToText(ref)) {
			return fragments;
		  }
		  fragments = sub.concat(this.makeCode(', '), fragments);
		  if (o.level < LEVEL_LIST) {
			return fragments;
		  } else {
			return this.wrapInBraces(fragments);
		  }
		};

		In.prototype.toString = function(idt) {
		  return In.__super__.toString.call(this, idt, this.constructor.name + (this.negated ? '!' : ''));
		};

		return In;

	  })(Base);

	  exports.Try = Try = (function(_super) {
		__extends(Try, _super);

		function Try(attempt, errorVariable, recovery, ensure) {
		  this.attempt = attempt;
		  this.errorVariable = errorVariable;
		  this.recovery = recovery;
		  this.ensure = ensure;
		}

		Try.prototype.children = ['attempt', 'recovery', 'ensure'];

		Try.prototype.isStatement = YES;

		Try.prototype.jumps = function(o) {
		  var _ref2;
		  return this.attempt.jumps(o) || ((_ref2 = this.recovery) != null ? _ref2.jumps(o) : void 0);
		};

		Try.prototype.makeReturn = function(res) {
		  if (this.attempt) {
			this.attempt = this.attempt.makeReturn(res);
		  }
		  if (this.recovery) {
			this.recovery = this.recovery.makeReturn(res);
		  }
		  return this;
		};

		Try.prototype.compileNode = function(o) {
		  var catchPart, ensurePart, placeholder, tryPart;
		  o.indent += TAB;
		  tryPart = this.attempt.compileToFragments(o, LEVEL_TOP);
		  catchPart = this.recovery ? (placeholder = new Literal('_error'), this.errorVariable ? this.recovery.unshift(new Assign(this.errorVariable, placeholder)) : void 0, [].concat(this.makeCode(" catch ("), placeholder.compileToFragments(o), this.makeCode(") {\n"), this.recovery.compileToFragments(o, LEVEL_TOP), this.makeCode("\n" + this.tab + "}"))) : !(this.ensure || this.recovery) ? [this.makeCode(' catch (_error) {}')] : [];
		  ensurePart = this.ensure ? [].concat(this.makeCode(" finally {\n"), this.ensure.compileToFragments(o, LEVEL_TOP), this.makeCode("\n" + this.tab + "}")) : [];
		  return [].concat(this.makeCode(this.tab + "try {\n"), tryPart, this.makeCode("\n" + this.tab + "}"), catchPart, ensurePart);
		};

		return Try;

	  })(Base);

	  exports.Throw = Throw = (function(_super) {
		__extends(Throw, _super);

		function Throw(expression) {
		  this.expression = expression;
		}

		Throw.prototype.children = ['expression'];

		Throw.prototype.isStatement = YES;

		Throw.prototype.jumps = NO;

		Throw.prototype.makeReturn = THIS;

		Throw.prototype.compileNode = function(o) {
		  return [].concat(this.makeCode(this.tab + "throw "), this.expression.compileToFragments(o), this.makeCode(";"));
		};

		return Throw;

	  })(Base);

	  exports.Existence = Existence = (function(_super) {
		__extends(Existence, _super);

		function Existence(expression) {
		  this.expression = expression;
		}

		Existence.prototype.children = ['expression'];

		Existence.prototype.invert = NEGATE;

		Existence.prototype.compileNode = function(o) {
		  var cmp, cnj, code, _ref2;
		  this.expression.front = this.front;
		  code = this.expression.compile(o, LEVEL_OP);
		  if (IDENTIFIER.test(code) && !o.scope.check(code)) {
			_ref2 = this.negated ? ['===', '||'] : ['!==', '&&'], cmp = _ref2[0], cnj = _ref2[1];
			code = "typeof " + code + " " + cmp + " \"undefined\" " + cnj + " " + code + " " + cmp + " null";
		  } else {
			code = code + " " + (this.negated ? '==' : '!=') + " null";
		  }
		  return [this.makeCode(o.level <= LEVEL_COND ? code : "(" + code + ")")];
		};

		return Existence;

	  })(Base);

	  exports.Parens = Parens = (function(_super) {
		__extends(Parens, _super);

		function Parens(body) {
		  this.body = body;
		}

		Parens.prototype.children = ['body'];

		Parens.prototype.unwrap = function() {
		  return this.body;
		};

		Parens.prototype.isComplex = function() {
		  return this.body.isComplex();
		};

		Parens.prototype.compileNode = function(o) {
		  var bare, expr, fragments;
		  expr = this.body.unwrap();
		  if (expr instanceof Value && expr.isAtomic()) {
			expr.front = this.front;
			return expr.compileToFragments(o);
		  }
		  fragments = expr.compileToFragments(o, LEVEL_PAREN);
		  bare = o.level < LEVEL_OP && (expr instanceof Op || expr instanceof Call || (expr instanceof For && expr.returns));
		  if (bare) {
			return fragments;
		  } else {
			return this.wrapInBraces(fragments);
		  }
		};

		return Parens;

	  })(Base);

	  exports.For = For = (function(_super) {
		__extends(For, _super);

		function For(body, source) {
		  var _ref2;
		  this.source = source.source, this.guard = source.guard, this.step = source.step, this.name = source.name, this.index = source.index;
		  this.body = Block.wrap([body]);
		  this.own = !!source.own;
		  this.object = !!source.object;
		  if (this.object) {
			_ref2 = [this.index, this.name], this.name = _ref2[0], this.index = _ref2[1];
		  }
		  if (this.index instanceof Value) {
			this.index.error('index cannot be a pattern matching expression');
		  }
		  this.range = this.source instanceof Value && this.source.base instanceof Range && !this.source.properties.length;
		  this.pattern = this.name instanceof Value;
		  if (this.range && this.index) {
			this.index.error('indexes do not apply to range loops');
		  }
		  if (this.range && this.pattern) {
			this.name.error('cannot pattern match over range loops');
		  }
		  if (this.own && !this.object) {
			this.name.error('cannot use own with for-in');
		  }
		  this.returns = false;
		}

		For.prototype.children = ['body', 'source', 'guard', 'step'];

		For.prototype.compileNode = function(o) {
		  var body, bodyFragments, compare, compareDown, declare, declareDown, defPart, defPartFragments, down, forPartFragments, guardPart, idt1, increment, index, ivar, kvar, kvarAssign, lastJumps, lvar, name, namePart, ref, resultPart, returnResult, rvar, scope, source, step, stepNum, stepVar, svar, varPart, _ref2, _ref3;
		  body = Block.wrap([this.body]);
		  lastJumps = (_ref2 = last(body.expressions)) != null ? _ref2.jumps() : void 0;
		  if (lastJumps && lastJumps instanceof Return) {
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
		  if (index) {
			scope.find(index);
		  }
		  if (this.returns) {
			rvar = scope.freeVariable('results');
		  }
		  ivar = (this.object && index) || scope.freeVariable('i');
		  kvar = (this.range && name) || index || ivar;
		  kvarAssign = kvar !== ivar ? kvar + " = " : "";
		  if (this.step && !this.range) {
			_ref3 = this.cacheToCodeFragments(this.step.cache(o, LEVEL_LIST)), step = _ref3[0], stepVar = _ref3[1];
			stepNum = stepVar.match(NUMBER);
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
			  name: name,
			  step: this.step
			}));
		  } else {
			svar = this.source.compile(o, LEVEL_LIST);
			if ((name || this.own) && !IDENTIFIER.test(svar)) {
			  defPart += "" + this.tab + (ref = scope.freeVariable('ref')) + " = " + svar + ";\n";
			  svar = ref;
			}
			if (name && !this.pattern) {
			  namePart = name + " = " + svar + "[" + kvar + "]";
			}
			if (!this.object) {
			  if (step !== stepVar) {
				defPart += "" + this.tab + step + ";\n";
			  }
			  if (!(this.step && stepNum && (down = parseNum(stepNum[0]) < 0))) {
				lvar = scope.freeVariable('len');
			  }
			  declare = "" + kvarAssign + ivar + " = 0, " + lvar + " = " + svar + ".length";
			  declareDown = "" + kvarAssign + ivar + " = " + svar + ".length - 1";
			  compare = ivar + " < " + lvar;
			  compareDown = ivar + " >= 0";
			  if (this.step) {
				if (stepNum) {
				  if (down) {
					compare = compareDown;
					declare = declareDown;
				  }
				} else {
				  compare = stepVar + " > 0 ? " + compare + " : " + compareDown;
				  declare = "(" + stepVar + " > 0 ? (" + declare + ") : " + declareDown + ")";
				}
				increment = ivar + " += " + stepVar;
			  } else {
				increment = "" + (kvar !== ivar ? "++" + ivar : ivar + "++");
			  }
			  forPartFragments = [this.makeCode(declare + "; " + compare + "; " + kvarAssign + increment)];
			}
		  }
		  if (this.returns) {
			resultPart = "" + this.tab + rvar + " = [];\n";
			returnResult = "\n" + this.tab + "return " + rvar + ";";
			body.makeReturn(rvar);
		  }
		  if (this.guard) {
			if (body.expressions.length > 1) {
			  body.expressions.unshift(new If((new Parens(this.guard)).invert(), new Literal("continue")));
			} else {
			  if (this.guard) {
				body = Block.wrap([new If(this.guard, body)]);
			  }
			}
		  }
		  if (this.pattern) {
			body.expressions.unshift(new Assign(this.name, new Literal(svar + "[" + kvar + "]")));
		  }
		  defPartFragments = [].concat(this.makeCode(defPart), this.pluckDirectCall(o, body));
		  if (namePart) {
			varPart = "\n" + idt1 + namePart + ";";
		  }
		  if (this.object) {
			forPartFragments = [this.makeCode(kvar + " in " + svar)];
			if (this.own) {
			  guardPart = "\n" + idt1 + "if (!" + (utility('hasProp')) + ".call(" + svar + ", " + kvar + ")) continue;";
			}
		  }
		  bodyFragments = body.compileToFragments(merge(o, {
			indent: idt1
		  }), LEVEL_TOP);
		  if (bodyFragments && (bodyFragments.length > 0)) {
			bodyFragments = [].concat(this.makeCode("\n"), bodyFragments, this.makeCode("\n"));
		  }
		  return [].concat(defPartFragments, this.makeCode("" + (resultPart || '') + this.tab + "for ("), forPartFragments, this.makeCode(") {" + guardPart + varPart), bodyFragments, this.makeCode(this.tab + "}" + (returnResult || '')));
		};

		For.prototype.pluckDirectCall = function(o, body) {
		  var base, defs, expr, fn, idx, ref, val, _i, _len, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
		  defs = [];
		  _ref2 = body.expressions;
		  for (idx = _i = 0, _len = _ref2.length; _i < _len; idx = ++_i) {
			expr = _ref2[idx];
			expr = expr.unwrapAll();
			if (!(expr instanceof Call)) {
			  continue;
			}
			val = (_ref3 = expr.variable) != null ? _ref3.unwrapAll() : void 0;
			if (!((val instanceof Code) || (val instanceof Value && ((_ref4 = val.base) != null ? _ref4.unwrapAll() : void 0) instanceof Code && val.properties.length === 1 && ((_ref5 = (_ref6 = val.properties[0].name) != null ? _ref6.value : void 0) === 'call' || _ref5 === 'apply')))) {
			  continue;
			}
			fn = ((_ref7 = val.base) != null ? _ref7.unwrapAll() : void 0) || val;
			ref = new Literal(o.scope.freeVariable('fn'));
			base = new Value(ref);
			if (val.base) {
			  _ref8 = [base, val], val.base = _ref8[0], base = _ref8[1];
			}
			body.expressions[idx] = new Call(base, expr.args);
			defs = defs.concat(this.makeCode(this.tab), new Assign(ref, fn).compileToFragments(o, LEVEL_TOP), this.makeCode(';\n'));
		  }
		  return defs;
		};

		return For;

	  })(While);

	  exports.Switch = Switch = (function(_super) {
		__extends(Switch, _super);

		function Switch(subject, cases, otherwise) {
		  this.subject = subject;
		  this.cases = cases;
		  this.otherwise = otherwise;
		}

		Switch.prototype.children = ['subject', 'cases', 'otherwise'];

		Switch.prototype.isStatement = YES;

		Switch.prototype.jumps = function(o) {
		  var block, conds, jumpNode, _i, _len, _ref2, _ref3, _ref4;
		  if (o == null) {
			o = {
			  block: true
			};
		  }
		  _ref2 = this.cases;
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			_ref3 = _ref2[_i], conds = _ref3[0], block = _ref3[1];
			if (jumpNode = block.jumps(o)) {
			  return jumpNode;
			}
		  }
		  return (_ref4 = this.otherwise) != null ? _ref4.jumps(o) : void 0;
		};

		Switch.prototype.makeReturn = function(res) {
		  var pair, _i, _len, _ref2, _ref3;
		  _ref2 = this.cases;
		  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
			pair = _ref2[_i];
			pair[1].makeReturn(res);
		  }
		  if (res) {
			this.otherwise || (this.otherwise = new Block([new Literal('void 0')]));
		  }
		  if ((_ref3 = this.otherwise) != null) {
			_ref3.makeReturn(res);
		  }
		  return this;
		};

		Switch.prototype.compileNode = function(o) {
		  var block, body, cond, conditions, expr, fragments, i, idt1, idt2, _i, _j, _len, _len1, _ref2, _ref3, _ref4;
		  idt1 = o.indent + TAB;
		  idt2 = o.indent = idt1 + TAB;
		  fragments = [].concat(this.makeCode(this.tab + "switch ("), (this.subject ? this.subject.compileToFragments(o, LEVEL_PAREN) : this.makeCode("false")), this.makeCode(") {\n"));
		  _ref2 = this.cases;
		  for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
			_ref3 = _ref2[i], conditions = _ref3[0], block = _ref3[1];
			_ref4 = flatten([conditions]);
			for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
			  cond = _ref4[_j];
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
			expr = this.lastNonComment(block.expressions);
			if (expr instanceof Return || (expr instanceof Literal && expr.jumps() && expr.value !== 'debugger')) {
			  continue;
			}
			fragments.push(cond.makeCode(idt2 + 'break;\n'));
		  }
		  if (this.otherwise && this.otherwise.expressions.length) {
			fragments.push.apply(fragments, [this.makeCode(idt1 + "default:\n")].concat(__slice.call(this.otherwise.compileToFragments(o, LEVEL_TOP)), [this.makeCode("\n")]));
		  }
		  fragments.push(this.makeCode(this.tab + '}'));
		  return fragments;
		};

		return Switch;

	  })(Base);

	  exports.If = If = (function(_super) {
		__extends(If, _super);

		function If(condition, body, options) {
		  this.body = body;
		  if (options == null) {
			options = {};
		  }
		  this.condition = options.type === 'unless' ? condition.invert() : condition;
		  this.elseBody = null;
		  this.isChain = false;
		  this.soak = options.soak;
		}

		If.prototype.children = ['condition', 'body', 'elseBody'];

		If.prototype.bodyNode = function() {
		  var _ref2;
		  return (_ref2 = this.body) != null ? _ref2.unwrap() : void 0;
		};

		If.prototype.elseBodyNode = function() {
		  var _ref2;
		  return (_ref2 = this.elseBody) != null ? _ref2.unwrap() : void 0;
		};

		If.prototype.addElse = function(elseBody) {
		  if (this.isChain) {
			this.elseBodyNode().addElse(elseBody);
		  } else {
			this.isChain = elseBody instanceof If;
			this.elseBody = this.ensureBlock(elseBody);
			this.elseBody.updateLocationDataIfMissing(elseBody.locationData);
		  }
		  return this;
		};

		If.prototype.isStatement = function(o) {
		  var _ref2;
		  return (o != null ? o.level : void 0) === LEVEL_TOP || this.bodyNode().isStatement(o) || ((_ref2 = this.elseBodyNode()) != null ? _ref2.isStatement(o) : void 0);
		};

		If.prototype.jumps = function(o) {
		  var _ref2;
		  return this.body.jumps(o) || ((_ref2 = this.elseBody) != null ? _ref2.jumps(o) : void 0);
		};

		If.prototype.compileNode = function(o) {
		  if (this.isStatement(o)) {
			return this.compileStatement(o);
		  } else {
			return this.compileExpression(o);
		  }
		};

		If.prototype.makeReturn = function(res) {
		  if (res) {
			this.elseBody || (this.elseBody = new Block([new Literal('void 0')]));
		  }
		  this.body && (this.body = new Block([this.body.makeReturn(res)]));
		  this.elseBody && (this.elseBody = new Block([this.elseBody.makeReturn(res)]));
		  return this;
		};

		If.prototype.ensureBlock = function(node) {
		  if (node instanceof Block) {
			return node;
		  } else {
			return new Block([node]);
		  }
		};

		If.prototype.compileStatement = function(o) {
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
		  body = this.ensureBlock(this.body).compileToFragments(merge(o, {
			indent: indent
		  }));
		  ifPart = [].concat(this.makeCode("if ("), cond, this.makeCode(") {\n"), body, this.makeCode("\n" + this.tab + "}"));
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
			answer = answer.concat(this.makeCode("{\n"), this.elseBody.compileToFragments(merge(o, {
			  indent: indent
			}), LEVEL_TOP), this.makeCode("\n" + this.tab + "}"));
		  }
		  return answer;
		};

		If.prototype.compileExpression = function(o) {
		  var alt, body, cond, fragments;
		  cond = this.condition.compileToFragments(o, LEVEL_COND);
		  body = this.bodyNode().compileToFragments(o, LEVEL_LIST);
		  alt = this.elseBodyNode() ? this.elseBodyNode().compileToFragments(o, LEVEL_LIST) : [this.makeCode('void 0')];
		  fragments = cond.concat(this.makeCode(" ? "), body, this.makeCode(" : "), alt);
		  if (o.level >= LEVEL_COND) {
			return this.wrapInBraces(fragments);
		  } else {
			return fragments;
		  }
		};

		If.prototype.unfoldSoak = function() {
		  return this.soak && this;
		};

		return If;

	  })(Base);

	  UTILITIES = {
		"extends": function() {
		  return "function(child, parent) { for (var key in parent) { if (" + (utility('hasProp')) + ".call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }";
		},
		bind: function() {
		  return 'function(fn, me){ return function(){ return fn.apply(me, arguments); }; }';
		},
		indexOf: function() {
		  return "[].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; }";
		},
		modulo: function() {
		  return "function(a, b) { return (+a % (b = +b) + b) % b; }";
		},
		hasProp: function() {
		  return '{}.hasOwnProperty';
		},
		slice: function() {
		  return '[].slice';
		}
	  };

	  LEVEL_TOP = 1;

	  LEVEL_PAREN = 2;

	  LEVEL_LIST = 3;

	  LEVEL_COND = 4;

	  LEVEL_OP = 5;

	  LEVEL_ACCESS = 6;

	  TAB = '  ';

	  IDENTIFIER_STR = "[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*";

	  IDENTIFIER = RegExp("^" + IDENTIFIER_STR + "$");

	  SIMPLENUM = /^[+-]?\d+$/;

	  HEXNUM = /^[+-]?0x[\da-f]+/i;

	  NUMBER = /^[+-]?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)$/i;

	  METHOD_DEF = RegExp("^(" + IDENTIFIER_STR + ")(\\.prototype)?(?:\\.(" + IDENTIFIER_STR + ")|\\[(\"(?:[^\\\\\"\\r\\n]|\\\\.)*\"|'(?:[^\\\\'\\r\\n]|\\\\.)*')\\]|\\[(0x[\\da-fA-F]+|\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\])$");

	  IS_STRING = /^['"]/;

	  IS_REGEX = /^\//;

	  utility = function(name) {
		var ref;
		ref = "__" + name;
		Scope.root.assign(ref, UTILITIES[name]());
		return ref;
	  };

	  multident = function(code, tab) {
		code = code.replace(/\n/g, '$&' + tab);
		return code.replace(/\s+$/, '');
	  };

	  parseNum = function(x) {
		if (x == null) {
		  return 0;
		} else if (x.match(HEXNUM)) {
		  return parseInt(x, 16);
		} else {
		  return parseFloat(x);
		}
	  };

	  isLiteralArguments = function(node) {
		return node instanceof Literal && node.value === 'arguments' && !node.asKey;
	  };

	  isLiteralThis = function(node) {
		return (node instanceof Literal && node.value === 'this' && !node.asKey) || (node instanceof Code && node.bound) || (node instanceof Call && node.isSuper);
	  };

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
	
	//#region URL: /coffee-script
	modules['/coffee-script'] = function () {
	  var exports = {};
	  var Lexer, SourceMap, compile, ext, formatSourcePosition, fs, getSourceMap, helpers, lexer, parser, path, sourceMaps, vm, withPrettyErrors, _base, _i, _len, _ref,
		__hasProp = {}.hasOwnProperty,
		__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

//	  fs = require('/fs');

//	  vm = require('/vm');

//	  path = require('/path');

	  Lexer = require('/lexer').Lexer;

	  parser = require('/parser').parser;

	  helpers = require('/helpers');

//	  SourceMap = require('/sourcemap');

	  exports.VERSION = '1.8.0';

//	  exports.FILE_EXTENSIONS = ['.coffee', '.litcoffee', '.coffee.md'];

	  exports.helpers = helpers;

	  withPrettyErrors = function(fn) {
		return function(code, options) {
		  var err;
		  if (options == null) {
			options = {};
		  }
		  try {
			return fn.call(this, code, options);
		  } catch (_error) {
			err = _error;
			throw helpers.updateSyntaxError(err, code, options.filename);
		  }
		};
	  };

	  exports.compile = compile = withPrettyErrors(function(code, options) {
		var answer, currentColumn, currentLine, extend, fragment, fragments, header, js, map, merge, newLines, _i, _len;
		merge = helpers.merge, extend = helpers.extend;
		options = extend({}, options);
//		if (options.sourceMap) {
//		  map = new SourceMap;
//		}
		fragments = parser.parse(lexer.tokenize(code, options)).compileToFragments(options);
		currentLine = 0;
//		if (options.header) {
//		  currentLine += 1;
//		}
//		if (options.shiftLine) {
//		  currentLine += 1;
//		}
		currentColumn = 0;
		js = "";
		for (_i = 0, _len = fragments.length; _i < _len; _i++) {
		  fragment = fragments[_i];
//		  if (options.sourceMap) {
//			if (fragment.locationData) {
//			  map.add([fragment.locationData.first_line, fragment.locationData.first_column], [currentLine, currentColumn], {
//				noReplace: true
//			  });
//			}
//			newLines = helpers.count(fragment.code, "\n");
//			currentLine += newLines;
//			if (newLines) {
//			  currentColumn = fragment.code.length - (fragment.code.lastIndexOf("\n") + 1);
//			} else {
//			  currentColumn += fragment.code.length;
//			}
//		  }
		  js += fragment.code;
		}
//		if (options.header) {
//		  header = "Generated by CoffeeScript " + this.VERSION;
//		  js = "// " + header + "\n" + js;
//		}
//		if (options.sourceMap) {
//		  answer = {
//			js: js
//		  };
//		  answer.sourceMap = map;
//		  answer.v3SourceMap = map.generate(options, code);
//		  return answer;
//		} else {
		  return js;
//		}
	  });

//	  exports.tokens = withPrettyErrors(function(code, options) {
//		return lexer.tokenize(code, options);
//	  });

//	  exports.nodes = withPrettyErrors(function(source, options) {
//		if (typeof source === 'string') {
//		  return parser.parse(lexer.tokenize(source, options));
//		} else {
//		  return parser.parse(source);
//		}
//	  });

//	  exports.run = function(code, options) {
//		var answer, dir, mainModule, _ref;
//		if (options == null) {
//		  options = {};
//		}
//		mainModule = require.main;
//		mainModule.filename = process.argv[1] = options.filename ? fs.realpathSync(options.filename) : '.';
//		mainModule.moduleCache && (mainModule.moduleCache = {});
//		dir = options.filename ? path.dirname(fs.realpathSync(options.filename)) : fs.realpathSync('.');
//		mainModule.paths = require('/module')._nodeModulePaths(dir);
//		if (!helpers.isCoffee(mainModule.filename) || require.extensions) {
//		  answer = compile(code, options);
//		  code = (_ref = answer.js) != null ? _ref : answer;
//		}
//		return mainModule._compile(code, mainModule.filename);
//	  };

//	  exports["eval"] = function(code, options) {
//		var Module, createContext, isContext, js, k, o, r, sandbox, v, _i, _len, _module, _ref, _ref1, _ref2, _ref3, _require;
//		if (options == null) {
//		  options = {};
//		}
//		if (!(code = code.trim())) {
//		  return;
//		}
//		createContext = (_ref = vm.Script.createContext) != null ? _ref : vm.createContext;
//		isContext = (_ref1 = vm.isContext) != null ? _ref1 : function(ctx) {
//		  return options.sandbox instanceof createContext().constructor;
//		};
//		if (createContext) {
//		  if (options.sandbox != null) {
//			if (isContext(options.sandbox)) {
//			  sandbox = options.sandbox;
//			} else {
//			  sandbox = createContext();
//			  _ref2 = options.sandbox;
//			  for (k in _ref2) {
//				if (!__hasProp.call(_ref2, k)) continue;
//				v = _ref2[k];
//				sandbox[k] = v;
//			  }
//			}
//			sandbox.global = sandbox.root = sandbox.GLOBAL = sandbox;
//		  } else {
//			sandbox = global;
//		  }
//		  sandbox.__filename = options.filename || 'eval';
//		  sandbox.__dirname = path.dirname(sandbox.__filename);
//		  if (!(sandbox !== global || sandbox.module || sandbox.require)) {
//			Module = require('/module');
//			sandbox.module = _module = new Module(options.modulename || 'eval');
//			sandbox.require = _require = function(path) {
//			  return Module._load(path, _module, true);
//			};
//			_module.filename = sandbox.__filename;
//			_ref3 = Object.getOwnPropertyNames(require);
//			for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
//			  r = _ref3[_i];
//			  if (r !== 'paths') {
//				_require[r] = require[r];
//			  }
//			}
//			_require.paths = _module.paths = Module._nodeModulePaths(process.cwd());
//			_require.resolve = function(request) {
//			  return Module._resolveFilename(request, _module);
//			};
//		  }
//		}
//		o = {};
//		for (k in options) {
//		  if (!__hasProp.call(options, k)) continue;
//		  v = options[k];
//		  o[k] = v;
//		}
//		o.bare = true;
//		js = compile(code, o);
//		if (sandbox === global) {
//		  return vm.runInThisContext(js);
//		} else {
//		  return vm.runInContext(js, sandbox);
//		}
//	  };

//	  exports.register = function() {
//		return require('/register');
//	  };

//	  if (require.extensions) {
//		_ref = this.FILE_EXTENSIONS;
//		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
//		  ext = _ref[_i];
//		  if ((_base = require.extensions)[ext] == null) {
//			_base[ext] = function() {
//			  throw new Error("Use CoffeeScript.register() or require the coffee-script/register module to require " + ext + " files.");
//			};
//		  }
//		}
//	  }

//	  exports._compileFile = function(filename, sourceMap) {
//		var answer, err, raw, stripped;
//		if (sourceMap == null) {
//		  sourceMap = false;
//		}
//		raw = fs.readFileSync(filename, 'utf8');
//		stripped = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;
//		try {
//		  answer = compile(stripped, {
//			filename: filename,
//			sourceMap: sourceMap,
//			literate: helpers.isLiterate(filename)
//		  });
//		} catch (_error) {
//		  err = _error;
//		  throw helpers.updateSyntaxError(err, stripped, filename);
//		}
//		return answer;
//	  };

	  lexer = new Lexer;

	  parser.lexer = {
		lex: function() {
		  var tag, token;
		  token = this.tokens[this.pos++];
		  if (token) {
			tag = token[0], this.yytext = token[1], this.yylloc = token[2];
			this.errorToken = token.origin || token;
			this.yylineno = this.yylloc.first_line;
		  } else {
			tag = '';
		  }
		  return tag;
		},
		setInput: function(tokens) {
		  this.tokens = tokens;
		  return this.pos = 0;
		},
		upcomingInput: function() {
		  return "";
		}
	  };

	  parser.yy = require('/nodes');

	  parser.yy.parseError = function(message, _arg) {
		var errorLoc, errorTag, errorText, errorToken, token, tokens, _ref1;
		token = _arg.token;
		_ref1 = parser.lexer, errorToken = _ref1.errorToken, tokens = _ref1.tokens;
		errorTag = errorToken[0], errorText = errorToken[1], errorLoc = errorToken[2];
		errorText = errorToken === tokens[tokens.length - 1] ? 'end of input' : errorTag === 'INDENT' || errorTag === 'OUTDENT' ? 'indentation' : helpers.nameWhitespaceCharacter(errorText);
		return helpers.throwSyntaxError("unexpected " + errorText, errorLoc);
	  };

//	  formatSourcePosition = function(frame, getSourceMapping) {
//		var as, column, fileLocation, fileName, functionName, isConstructor, isMethodCall, line, methodName, source, tp, typeName;
//		fileName = void 0;
//		fileLocation = '';
//		if (frame.isNative()) {
//		  fileLocation = "native";
//		} else {
//		  if (frame.isEval()) {
//			fileName = frame.getScriptNameOrSourceURL();
//			if (!fileName) {
//			  fileLocation = (frame.getEvalOrigin()) + ", ";
//			}
//		  } else {
//			fileName = frame.getFileName();
//		  }
//		  fileName || (fileName = "<anonymous>");
//		  line = frame.getLineNumber();
//		  column = frame.getColumnNumber();
//		  source = getSourceMapping(fileName, line, column);
//		  fileLocation = source ? fileName + ":" + source[0] + ":" + source[1] : fileName + ":" + line + ":" + column;
//		}
//		functionName = frame.getFunctionName();
//		isConstructor = frame.isConstructor();
//		isMethodCall = !(frame.isToplevel() || isConstructor);
//		if (isMethodCall) {
//		  methodName = frame.getMethodName();
//		  typeName = frame.getTypeName();
//		  if (functionName) {
//			tp = as = '';
//			if (typeName && functionName.indexOf(typeName)) {
//			  tp = typeName + ".";
//			}
//			if (methodName && functionName.indexOf("." + methodName) !== functionName.length - methodName.length - 1) {
//			  as = " [as " + methodName + "]";
//			}
//			return "" + tp + functionName + as + " (" + fileLocation + ")";
//		  } else {
//			return typeName + "." + (methodName || '<anonymous>') + " (" + fileLocation + ")";
//		  }
//		} else if (isConstructor) {
//		  return "new " + (functionName || '<anonymous>') + " (" + fileLocation + ")";
//		} else if (functionName) {
//		  return functionName + " (" + fileLocation + ")";
//		} else {
//		  return fileLocation;
//		}
//	  };

//	  sourceMaps = {};

//	  getSourceMap = function(filename) {
//		var answer, _ref1;
//		if (sourceMaps[filename]) {
//		  return sourceMaps[filename];
//		}
//		if (_ref1 = path != null ? path.extname(filename) : void 0, __indexOf.call(exports.FILE_EXTENSIONS, _ref1) < 0) {
//		  return;
//		}
//		answer = exports._compileFile(filename, true);
//		return sourceMaps[filename] = answer.sourceMap;
//	  };

//	  Error.prepareStackTrace = function(err, stack) {
//		var frame, frames, getSourceMapping;
//		getSourceMapping = function(filename, line, column) {
//		  var answer, sourceMap;
//		  sourceMap = getSourceMap(filename);
//		  if (sourceMap) {
//			answer = sourceMap.sourceLocation([line - 1, column - 1]);
//		  }
//		  if (answer) {
//			return [answer[0] + 1, answer[1] + 1];
//		  } else {
//			return null;
//		  }
//		};
//		frames = (function() {
//		  var _j, _len1, _results;
//		  _results = [];
//		  for (_j = 0, _len1 = stack.length; _j < _len1; _j++) {
//			frame = stack[_j];
//			if (frame.getFunction() === exports.run) {
//			  break;
//			}
//			_results.push("  at " + (formatSourcePosition(frame, getSourceMapping)));
//		  }
//		  return _results;
//		})();
//		return (err.toString()) + "\n" + (frames.join('\n')) + "\n";
//	  };
  
	  return exports;
	};
	//#endregion
	
	return require('/coffee-script');
 })();