/*!
* CSSO (CSS Optimizer) v1.4.1
* http://github.com/css/csso
*
* Copyright 2011-2015, Sergey Kryzhanovsky
* Released under the MIT License
*/
var CSSO = (function(){
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
		
	//#region URL: /compressor
	modules['/compressor'] = function () {
		var translate = require('/utils/translate');
		var constants = require('/compressor/const');
		var rules = require('/compressor/rules');
		var TRBL = require('/compressor/trbl');
		var color = require('/compressor/color');
		var packNumber = require('/compressor/utils').packNumber;

		function CSSOCompressor() {
			this.props = {};
			this.shorts = {};
			this.shorts2 = {};

			this.shortGroupID = 0;
			this.lastShortGroupID = 0;
			this.lastShortSelector = 0;
		}

		CSSOCompressor.prototype.injectInfo = function(token) {
			for (var i = token.length - 1; i > -1; i--) {
				var child = token[i];

				if (Array.isArray(child)) {
					this.injectInfo(child);
					child.unshift({});
				}
			}
		};

		function readBlock(stylesheet, offset) {
			var buffer = [];
			var nonSpaceTokenInBuffer = false;
			var protectedComment;

			for (var i = offset; i < stylesheet.length; i++) {
				var token = stylesheet[i];

				if (token[1] === 'comment' &&
					token[2].charAt(0) === '!') {
					if (nonSpaceTokenInBuffer || protectedComment) {
						break;
					}

					protectedComment = token;
					continue;
				}

				if (token[1] !== 's') {
					nonSpaceTokenInBuffer = true;
				}

				buffer.push(token);
			}

			return {
				comment: protectedComment,
				stylesheet: [{}, 'stylesheet'].concat(buffer),
				offset: i
			};
		}

		CSSOCompressor.prototype.process = function(rules, token, container, idx, path, stack) {
			var type = token[1];
			var rule = rules[type];
			var result;

			if (rule) {
				result = token;

				for (var i = 0; i < rule.length; i++) {
					var tmp = this[rule[i]](result, type, container, idx, path, stack);

					if (tmp === null) {
						return null;
					}

					if (tmp !== undefined) {
						result = tmp;
					}
				}
			}

			return result;
		};

		CSSOCompressor.prototype.walk = function(rules, token, path, name, stack) {
			if (!stack) {
				stack = [token];
			}

			for (var i = token.length - 1; i >= 2; i--) {
				var child = token[i];

				if (Array.isArray(child)) {
					stack.push(child);
					child = this.walk(rules, child, path + '/' + i, null, stack); // go inside
					stack.pop();

					if (child === null) {
						token.splice(i, 1);
					} else {
						child = this.process(rules, child, token, i, path, stack);
						if (child) {
							// compressed not null
							token[i] = child;
						} else if (child === null) {
							// null is the mark to delete token
							token.splice(i, 1);
						}
					}
				}
			}

//			if (this.debug && name) {
//				console.log(name + '\n  ' + translate(token, true).trim());
//				console.log('');
//			}

			return token.length ? token : null;
		};

		function compressBlock(ast, restructuring) {
			// compression without restructure
			ast = this.walk(rules.cleanComments, ast, '/0', 'cleanComments');
			ast = this.walk(rules.compress, ast, '/0', 'compress');
			ast = this.walk(rules.prepare, ast, '/0', 'prepare');
			ast = this.walk(rules.freezeRuleset, ast, '/0', 'freezeRuleset');

			// structure optimisations
			if (restructuring) {
				var initAst = this.copyArray(ast);
				var initLength = translate(initAst, true).length;

				ast = this.walk(rules.rejoinRuleset, ast, '/0', 'rejoinRuleset');
				this.disjoin(ast);
				ast = this.walk(rules.markShorthand, ast, '/0', 'markShorthand');
				ast = this.walk(rules.cleanShortcut, ast, '/0', 'cleanShortcut');
				ast = this.walk(rules.restructureBlock, ast, '/0', 'restructureBlock');

				var curLength = Infinity;
				var minLength;
				var astSnapshot;
				do {
					minLength = curLength;
					astSnapshot = this.copyArray(ast);
					ast = this.walk(rules.rejoinRuleset, ast, '/0', 'rejoinRuleset');
					ast = this.walk(rules.restructureRuleset, ast, '/0', 'restructureRuleset');
					curLength = translate(ast, true).length;
				} while (minLength > curLength);

				if (initLength < minLength && initLength < curLength) {
					ast = initAst;
				} else if (minLength < curLength) {
					ast = astSnapshot;
				}
			}

			ast = this.walk(rules.finalize, ast, '/0');

			return ast;
		}

		CSSOCompressor.prototype.compress = function(ast, options) {
//			this.debug = Boolean(options.debug);

			ast = ast || [{}, 'stylesheet'];

			if (typeof ast[0] === 'string') {
				this.injectInfo([ast]);
			}

			var result = [{}, 'stylesheet'];
			var block = { offset: 2 };
			var restructuring = options.restructuring || options.restructuring === undefined;
			var firstAtrulesAllowed = true;

			do {
				block = readBlock(ast, block.offset);
				block.stylesheet.firstAtrulesAllowed = firstAtrulesAllowed;
				block.stylesheet = compressBlock.call(this, block.stylesheet, restructuring);

				if (block.comment) {
					// add \n before comment if there is another content in result
					if (result.length > 2) {
						result.push([{}, 's', '\n']);
					}

					result.push(block.comment);

					// add \n after comment if block is not empty
					if (block.stylesheet.length > 2) {
						result.push([{}, 's', '\n']);
					}
				}

				result.push.apply(result, block.stylesheet.slice(2));

				if (firstAtrulesAllowed && result.length > 2) {
					firstAtrulesAllowed = this.cleanImport(
						null, null, block.stylesheet, block.stylesheet.length
					) !== null;
				}
			} while (block.offset < ast.length);

			return result;
		};

		CSSOCompressor.prototype.disjoin = function(token) {
			for (var i = token.length - 1; i >= 2; i--) {
				var child = token[i];

				if (!Array.isArray(child)) {
					continue;
				}

				if (child[1] === 'ruleset') {
					var selector = child[2];

					child[0].shortGroupID = this.shortGroupID++;

					// there are more than 1 simple selector split for rulesets
					if (selector.length > 3) {
						// generate new rule sets:
						// .a, .b { color: red; }
						// ->
						// .a { color: red; }
						// .b { color: red; }
						for (var j = selector.length - 1; j >= 2; j--) {
							var selectorInfo = this.copyObject(selector[0]);
							var newRuleset = [
							  this.copyObject(child[0]),
							  'ruleset',
							  [selectorInfo, 'selector', selector[j]],
							  this.copyArray(child[3])
							];

							selectorInfo.s = selector[j][0].s;
							token.splice(i + 1, 0, newRuleset);
						}

						// delete old ruleset
						token.splice(i, 1);
					}
				} else {
					// try disjoin nested stylesheets, i.e. @media, @support etc.
					this.disjoin(child);
				}
			}

//			if (this.debug) {
//				console.log('disjoin\n  ' + translate(token, true).trim());
//				console.log('');
//			}
		};

		CSSOCompressor.prototype.freezeRulesets = function(token) {
			var info = token[0];
			var selector = token[2];

			info.freeze = this.freezeNeeded(selector);
			info.freezeID = this.selectorSignature(selector);
			info.pseudoID = this.composePseudoID(selector);
			info.pseudoSignature = this.pseudoSelectorSignature(selector, constants.allowedPClasses, true);
			this.markSimplePseudo(selector);

			return token;
		};

		CSSOCompressor.prototype.markSimplePseudo = function(selector) {
			var hash = {};

			for (var i = 2; i < selector.length; i++) {
				var simpleSelector = selector[i];

				simpleSelector[0].pseudo = this.containsPseudo(simpleSelector);
				simpleSelector[0].sg = hash;
				hash[simpleSelector[0].s] = 1;
			}
		};

		CSSOCompressor.prototype.composePseudoID = function(selector) {
			var pseudos = [];

			for (var i = 2; i < selector.length; i++) {
				var simpleSelector = selector[i];

				if (this.containsPseudo(simpleSelector)) {
					pseudos.push(simpleSelector[0].s);
				}
			}

			return pseudos.sort().join(',');
		};

		CSSOCompressor.prototype.containsPseudo = function(sselector) {
			for (var j = 2; j < sselector.length; j++) {
				switch (sselector[j][1]) {
					case 'pseudoc':
					case 'pseudoe':
					case 'nthselector':
						if (sselector[j][2][2] in constants.notFPClasses === false) {
							return true;
						}
				}
			}
		};

		CSSOCompressor.prototype.selectorSignature = function(selector) {
			var parts = [];

			for (var i = 2; i < selector.length; i++) {
				parts.push(translate(selector[i], true));
			}

			return parts.sort().join(',');
		};

		CSSOCompressor.prototype.pseudoSelectorSignature = function(selector, exclude, dontAppendExcludeMark) {
			var pseudos = {};
			var wasExclude = false;

			exclude = exclude || {};

			for (var i = 2; i < selector.length; i++) {
				var simpleSelector = selector[i];

				for (var j = 2; j < simpleSelector.length; j++) {
					switch (simpleSelector[j][1]) {
						case 'pseudoc':
						case 'pseudoe':
						case 'nthselector':
							if (!exclude.hasOwnProperty(simpleSelector[j][2][2])) {
								pseudos[simpleSelector[j][2][2]] = 1;
							} else {
								wasExclude = true;
							}
							break;
					}
				}
			}

			return Object.keys(pseudos).sort().join(',') + (dontAppendExcludeMark ? '' : wasExclude);
		};

		CSSOCompressor.prototype.freezeNeeded = function(selector) {
			for (var i = 2; i < selector.length; i++) {
				var simpleSelector = selector[i];

				for (var j = 2; j < simpleSelector.length; j++) {
					switch (simpleSelector[j][1]) {
						case 'pseudoc':
							if (!(simpleSelector[j][2][2] in constants.notFPClasses)) {
								return true;
							}
							break;

						case 'pseudoe':
							if (!(simpleSelector[j][2][2] in constants.notFPElements)) {
								return true;
							}
							break;

						case 'nthselector':
							return true;
					}
				}
			}

			return false;
		};

		CSSOCompressor.prototype.cleanCharset = function(token, rule, parent, i) {
			if (token[2][2][2] === 'charset') {
				for (i = i - 1; i > 1; i--) {
					if (parent[i][1] !== 's' && parent[i][1] !== 'comment') {
						return null;
					}
				}
			}
		};

		CSSOCompressor.prototype.cleanImport = function(token, rule, parent, i) {
			if (!parent.firstAtrulesAllowed) {
				return null;
			}

			for (i = i - 1; i > 1; i--) {
				var type = parent[i][1];

				if (type !== 's' && type !== 'comment') {
					if (type === 'atrules') {
						var atrule = parent[i][2][2][2];

						if (atrule !== 'import' && atrule !== 'charset') {
							return null;
						}
					} else {
						return null;
					}
				}
			}
		};

		CSSOCompressor.prototype.cleanComment = function(token, rule, parent, i) {
			return null;
		};

		CSSOCompressor.prototype.cleanWhitespace = function(token, rule, parent, i) {
			var parentType = parent[1];
			var prevType = (parentType === 'braces' && i === 4) ||
						   (parentType !== 'braces' && i === 2) ? null : parent[i - 1][1];
			var nextType = i === parent.length - 1 ? null : parent[i + 1][1];

			if (nextType === 'unknown') {
				token[2] = '\n';
			} else {
				if (parentType === 'simpleselector') {
					if (!prevType || prevType === 'combinator' ||
						!nextType || nextType === 'combinator') {
						return null;
					}
				} else if ((parentType !== 'atrulerq' || prevType) &&
					!this.issue16(prevType, nextType) &&
					!this.issue165(parent, prevType, nextType) &&
					!this.issue134(prevType, nextType) &&
					!this.issue228(prevType, nextType)) {

					if (nextType !== null && prevType !== null) {
						if ((prevType === 'ident' && parent[i - 1][2] === '*') ||
							(nextType === 'ident' && parent[i + 1][2] === '*')) {
							return null;
						}

						if (this._cleanWhitespace(nextType, false) ||
							this._cleanWhitespace(prevType, true)) {
							return null;
						}
					} else {
						return null;
					}
				}

				token[2] = ' ';
			}

			return token;
		};

		// See https://github.com/afelix/csso/issues/16
		CSSOCompressor.prototype.issue16 = function(prevType, nextType) {
			return nextType && prevType === 'uri';
		};

		// See https://github.com/css/csso/issues/165
		CSSOCompressor.prototype.issue165 = function(parent, prevType, nextType) {
			return parent[1] === 'atrulerq' && prevType === 'braces' && nextType === 'ident';
		};

		// See https://github.com/css/csso/issues/134
		CSSOCompressor.prototype.issue134 = function(prevType, nextType) {
			return prevType === 'funktion' && (nextType === 'funktion' || nextType === 'vhash');
		};

		CSSOCompressor.prototype.issue228 = function(prevType, nextType) {
			return prevType === 'braces' && nextType === 'unary';
		};

		CSSOCompressor.prototype._cleanWhitespace = function(type, left) {
			switch (type) {
				case 's':
				case 'operator':
				case 'attrselector':
				case 'block':
				case 'decldelim':
				case 'ruleset':
				case 'declaration':
				case 'atruleb':
				case 'atrules':
				case 'atruler':
				case 'important':
				case 'nth':
				case 'combinator':
					return true;
			}

			if (left) {
				switch (type) {
					case 'funktion':
					case 'braces':
					case 'uri':
						return true;
				}
			}
		};

		CSSOCompressor.prototype.cleanDecldelim = function(token) {
			for (var i = token.length - 1; i > 1; i--) {
				var type = token[i][1];
				var nextType = token[i + 1][1];

				if (type === 'decldelim' && nextType !== 'declaration') {
					token.splice(i, 1);
				}
			}

			if (token[2][1] === 'decldelim') {
				token.splice(2, 1);
			}

			return token;
		};

		CSSOCompressor.prototype.compressNumber = function(token) {
			var value = packNumber(token[2]);

			token[2] = value;
			token[0].s = value;

			return token;
		};

		CSSOCompressor.prototype.cleanUnary = function(token, rule, parent, i) {
			var next = parent[i + 1];

			if (next && next[1] === 'number' && next[2] === '0') {
				return null;
			}

			return token;
		};

		CSSOCompressor.prototype.compressColor = function(token, rule, parent, i) {
			switch (rule) {
				case 'vhash':
					return color.compressHex(token);

				case 'funktion':
					return color.compressFunction(token, rule, parent, i);

				case 'ident':
					return color.compressIdent(token, rule, parent, i);
			}
		};

		CSSOCompressor.prototype.compressDimension = function(token, rule, parent, i, path, stack) {
			var value = token[2][2];
			var unit = token[3][2];

			if (value === '0' && !constants.nonLengthUnits[unit]) {
				// issue #200: don't remove units in flex property as it could change value meaning
				if (parent[1] === 'value' && stack[stack.length - 2][2][2][2] === 'flex') {
					return;
				}

				// issue #222: don't remove units inside calc
				var i = stack.length - 1;
				while (i > 0 && (stack[i][1] === 'braces' || stack[i][1] === 'functionBody')) {
					i--;
					if (stack[i][1] === 'funktion' && stack[i][2][2] === 'calc') {
						return;
					}
				}

				return token[2];
			}
		};

		CSSOCompressor.prototype.compressString = function(token) {
			// remove escaped \n, i.e.
			// .a { content: "foo\
			// bar"}
			// ->
			// .a { content: "foobar" }
			token[2] = token[2].replace(/\\\n/g, '');
		};

		CSSOCompressor.prototype.compressFontWeight = function(token) {
			var property = token[2];
			var value = token[3];

			if (/font-weight$/.test(property[2][2]) && value[2][1] === 'ident') {
				switch (value[2][2]) {
					case 'normal':
						value[2] = [{}, 'number', '400'];
						break;
					case 'bold':
						value[2] = [{}, 'number', '700'];
						break;
				}
			}
		};

		CSSOCompressor.prototype.compressFont = function(token) {
			var property = token[2];
			var value = token[3];

			if (/font$/.test(property[2][2]) && value.length) {
				value.splice(2, 0, [{}, 's', '']);

				for (var i = value.length - 1; i > 2; i--) {
					if (value[i][1] === 'ident') {
						var ident = value[i][2];
						if (ident === 'bold') {
							value[i] = [{}, 'number', '700'];
						} else if (ident === 'normal') {
							var t = value[i - 1];

							if (t[1] === 'operator' && t[2] === '/') {
								value.splice(--i, 2);
							} else {
								value.splice(i, 1);
							}

							if (value[i - 1][1] === 's') {
								value.splice(--i, 1);
							}
						} else if (ident === 'medium' && value[i + 1] && value[i + 1][2] !== '/') {
							value.splice(i, 1);
							if (value[i - 1][1] === 's') {
								value.splice(--i, 1);
							}
						}
					}
				}

				if (value.length > 2 && value[2][1] === 's') {
					value.splice(2, 1);
				}

				if (value.length === 2) {
					value.push([{}, 'ident', 'normal']);
				}

				return token;
			}
		};

		CSSOCompressor.prototype.compressBackground = function(token) {
			function lastType() {
				if (sequence.length) {
					return sequence[sequence.length - 1][1];
				}
			}

			function flush() {
				if (lastType() === 's') {
					sequence.pop();
				}

				if (!sequence.length ||
					(sequence.length === 1 && sequence[0][1] === 'important')) {
					value.push(
						[{}, 'number', '0'],
						[{}, 's', ' '],
						[{}, 'number', '0']
					);
				}

				value.push.apply(value, sequence);
				sequence = [];
			}

			var property = token[2];
			var value = token[3];

			if (/background$/.test(property[2][2]) && value.length) {
				var current = value.splice(2);
				var sequence = [];

				for (var i = 0; i < current.length; i++) {
					var node = current[i];
					var type = node[1];
					var val = node[2];

					// flush collected sequence
					if (type === 'operator' && val === ',') {
						flush();
						value.push(node);
						continue;
					}

					// remove defaults
					if (type === 'ident') {
						if (val === 'transparent' ||
							val === 'none' ||
							val === 'repeat' ||
							val === 'scroll') {
							continue;
						}
					}

					// don't add redundant spaces
					if (type === 's' && (!sequence.length || lastType() === 's')) {
						continue;
					}

					sequence.push(node);
				}

				flush();

				return token;
			}
		};

		CSSOCompressor.prototype.cleanEmpty = function(token, rule) {
			switch (rule) {
				case 'ruleset':
					if (!token[3] || token[3].length === 2) {
						return null;
					}
					break;

				case 'atruleb':
					if (token[token.length - 1].length < 3) {
						return null;
					}
					break;

				case 'atruler':
					if (token[4].length < 3) {
						return null;
					}
					break;
			}
		};

		CSSOCompressor.prototype.destroyDelims = function() {
			return null;
		};

		CSSOCompressor.prototype.preTranslate = function(token) {
			token[0].s = translate(token, true);
			return token;
		};

		CSSOCompressor.prototype.markShorthands = function(token, rule, parent, j, path) {
			var selector = '';
			var freeze = false;
			var freezeID = 'fake';
			var shortGroupID = parent[0].shortGroupID;
			var pre;
			var sh;

			if (parent[1] === 'ruleset') {
				selector = parent[2][2][0].s,
				freeze = parent[0].freeze,
				freezeID = parent[0].freezeID;
			}

			pre = this.pathUp(path) + '/' + (freeze ? '&' + freezeID + '&' : '') + selector + '/';

			for (var i = token.length - 1; i > -1; i--) {
				var createNew = true;
				var child = token[i];

				if (child[1] === 'declaration') {
					var childInfo = child[0];
					var property = child[2][0].s;
					var value = child[3];
					var important = value[value.length - 1][1] === 'important';

					childInfo.id = path + '/' + i;

					if (property in TRBL.props) {
						var key = pre + TRBL.extractMain(property);
						var shorts = this.shorts2[key] || [];

						if (!this.lastShortSelector ||
							selector === this.lastShortSelector ||
							shortGroupID === this.lastShortGroupID) {
							if (shorts.length) {
								sh = shorts[shorts.length - 1];
								createNew = false;
							}
						}

						if (createNew) {
							sh = new TRBL(property, important);
							shorts.push(sh);
							childInfo.replaceByShort = true;
						} else {
							childInfo.removeByShort = true;
						}

						childInfo.shorthandKey = { key: key, i: shorts.length - 1 };

						sh.add(property, value[0].s, value.slice(2), important);

						this.shorts2[key] = shorts;

						this.lastShortSelector = selector;
						this.lastShortGroupID = shortGroupID;
					}
				}
			}

			return token;
		};

		CSSOCompressor.prototype.cleanShorthands = function(token) {
			var info = token[0];

			if (info.removeByShort || info.replaceByShort) {
				var sKey = info.shorthandKey;
				var shorthand = this.shorts2[sKey.key][sKey.i];

				if (shorthand.isOkToMinimize()) {
					if (info.replaceByShort) {
						var shorterToken  = [{}, 'declaration', shorthand.getProperty(), shorthand.getValue()];
						shorterToken[0].s = translate(shorterToken, true);
						return shorterToken;
					} else {
						return null;
					}
				}
			}
		};

		CSSOCompressor.prototype.restructureBlock = function(token, rule, parent, j, path) {
			var props = {};
			var isPseudo = false;
			var selector = '';
			var freeze = false;
			var freezeID = 'fake';
			var pseudoID = 'fake';
			var sg = {};

			if (parent[1] === 'ruleset') {
				var parentInfo = parent[0];
				var parentSelectorInfo = parent[2][2][0];

				props = this.props;
				isPseudo = parentSelectorInfo.pseudo;
				selector = parentSelectorInfo.s;
				freeze = parentInfo.freeze;
				freezeID = parentInfo.freezeID;
				pseudoID = parentInfo.pseudoID;
				sg = parentSelectorInfo.sg;
			}

			for (var i = token.length - 1; i > -1; i--) {
				var child = token[i];

				if (child[1] === 'declaration') {
					var value = child[3];
					var important = value[value.length - 1][1] === 'important';
					var property = child[2][0].s;
					var pre = this.pathUp(path) + '/' + selector + '/';
					var ppre = this.buildPPre(pre, property, value, child, freeze);
					var ppreProps = props[ppre];
					var id = path + '/' + i;

					child[0].id = id;

					if (!constants.dontRestructure[property] && ppreProps) {
						if ((isPseudo && freezeID === ppreProps.freezeID) || // pseudo from equal selectors group
							(!isPseudo && pseudoID === ppreProps.pseudoID) || // not pseudo from equal pseudo signature group
							(isPseudo && pseudoID === ppreProps.pseudoID && this.hashInHash(sg, ppreProps.sg))) { // pseudo from covered selectors group
							if (important && !ppreProps.important) {
								props[ppre] = {
									block: token,
									important: important,
									id: id,
									sg: sg,
									freeze: freeze,
									path: path,
									freezeID: freezeID,
									pseudoID: pseudoID
								};

								this.deleteProperty(ppreProps.block, ppreProps.id);
							} else {
								token.splice(i, 1);
							}
						}
					} else if (this.needless(property, props, pre, important, value, child, freeze)) {
						token.splice(i, 1);
					} else {
						props[ppre] = {
							block: token,
							important: important,
							id: id,
							sg: sg,
							freeze: freeze,
							path: path,
							freezeID: freezeID,
							pseudoID: pseudoID
						};
					}
				}
			}
			return token;
		};

		CSSOCompressor.prototype.buildPPre = function(pre, property, value, d, freeze) {
			var fp = freeze ? 'ft:' : 'ff:';

			if (property.indexOf('background') !== -1) {
				return fp + pre + d[0].s;
			}

			var vendorId = '';
			var hack9 = 0;
			var functions = {};
			var units = {};

			for (var i = 2; i < value.length; i++) {
				if (!vendorId) {
					vendorId = this.getVendorIDFromToken(value[i]);
				}

				switch (value[i][1]) {
					case 'ident':
						if (value[i][2] === '\\9') {
							hack9 = 1;
						}
						break;

					case 'funktion':
						var name = value[i][2][2];

						if (name === 'rect') {
							// there are 2 forms of rect:
							//   rect(<top>, <right>, <bottom>, <left>) - standart
							//   rect(<top> <right> <bottom> <left>) – backwards compatible syntax
							// only the same form values can be merged
							if (value[i][3].slice(2).some(function(token) {
								return token[1] === 'operator' && token[2] === ',';
							})) {
								name = 'rect-backward';
							}
						}

						functions[name] = true;
						break;

					case 'dimension':
						var unit = value[i][3][2];
						switch (unit) {
							// is not supported until IE11
							case 'rem':

							// v* units is too buggy across browsers and better
							// don't merge values with those units
							case 'vw':
							case 'vh':
							case 'vmin':
							case 'vmax':
							case 'vm': // IE9 supporting "vm" instead of "vmin".
								units[unit] = true;
								break;
						}
						break;
				}
			}

			return (
				fp + pre + property +
				'[' + Object.keys(functions) + ']' +
				Object.keys(units) +
				hack9 + vendorId
			);
		};

		CSSOCompressor.prototype.getVendorIDFromToken = function(token) {
			var vendorId;

			switch (token[1]) {
				case 'ident':
					vendorId = this.getVendorFromString(token[2]);
					break;

				case 'funktion':
					vendorId = this.getVendorFromString(token[2][2]);
					break;
			}

			if (vendorId) {
				return constants.vendorID[vendorId] || '';
			}

			return '';
		};

		CSSOCompressor.prototype.getVendorFromString = function(string) {
			if (string[0] === '-') {
				var secondDashIndex = string.indexOf('-', 2);
				if (secondDashIndex !== -1) {
					return string.substr(0, secondDashIndex + 1);
				}
			}

			return '';
		};

		CSSOCompressor.prototype.deleteProperty = function(block, id) {
			for (var i = block.length - 1; i > 1; i--) {
				var child = block[i];

				if (Array.isArray(child) &&
					child[1] === 'declaration' &&
					child[0].id === id) {
					block.splice(i, 1);
					return;
				}
			}
		};

		CSSOCompressor.prototype.needless = function(name, props, pre, important, v, d, freeze) {
			var hack = name[0];

			if (hack === '*' || hack === '_' || hack === '$') {
				name = name.substr(1);
			} else if (hack === '/' && name[1] === '/') {
				hack = '//';
				name = name.substr(2);
			} else {
				hack = '';
			}

			var vendor = this.getVendorFromString(name);
			var table = constants.nlTable[name.substr(vendor.length)];

			if (table) {
				for (var i = 0; i < table.length; i++) {
					var ppre = this.buildPPre(pre, hack + vendor + table[i], v, d, freeze);
					var property = props[ppre];

					if (property) {
						return (!important || property.important);
					}
				}
			}
		};

		CSSOCompressor.prototype.rejoinRuleset = function(token, rule, container, i) {
			var prev = i === 2 || container[i - 1][1] === 'unknown' ? null : container[i - 1];
			var prevSelector = prev ? prev[2] : [];
			var prevBlock = prev ? prev[3] : [];
			var selector = token[2];
			var block = token[3];

			if (block.length === 2) {
				return null;
			}

			if (prevSelector.length > 2 &&
				prevBlock.length > 2 &&
				token[0].pseudoSignature == prev[0].pseudoSignature) {
				if (token[1] !== prev[1]) {
					return;
				}

				// try to join by selectors
				var prevHash = this.getHash(prevSelector);
				var hash = this.getHash(selector);

				if (this.equalHash(hash, prevHash)) {
					prev[3] = prev[3].concat(token[3].splice(2));
					return null;
				}
				if (this.okToJoinByProperties(token, prev)) {
					// try to join by properties
					var r = this.analyze(token, prev);
					if (!r.ne1.length && !r.ne2.length) {
						prev[2] = this.cleanSelector(prev[2].concat(token[2].splice(2)));
						prev[2][0].s = translate(prev[2], true);
						return null;
					}
				}
			}
		};

		CSSOCompressor.prototype.okToJoinByProperties = function(token1, token2) {
			var info1 = token1[0];
			var info2 = token2[0];

			// same frozen ruleset
			if (info1.freezeID === info2.freezeID) {
				return true;
			}

			// same pseudo-classes in selectors
			if (info1.pseudoID === info2.pseudoID) {
				return true;
			}

			// different frozen rulesets
			if (info1.freeze && info2.freeze) {
				var signature1 = this.pseudoSelectorSignature(token1[2], constants.allowedPClasses);
				var signature2 = this.pseudoSelectorSignature(token2[2], constants.allowedPClasses);

				return signature1 === signature2;
			}

			// is it frozen at all?
			return !info1.freeze && !info2.freeze;
		};

		CSSOCompressor.prototype.containsOnlyAllowedPClasses = function(selector) {
			for (var i = 2; i < selector.length; i++) {
				var simpleSelector = selector[i];

				for (var j = 2; j < simpleSelector.length; j++) {
					if (simpleSelector[j][1] == 'pseudoc' ||
						simpleSelector[j][1] == 'pseudoe') {
						if (!constants.allowedPClasses[simpleSelector[j][2][2]]) {
							return false;
						}
					}
				}
			}

			return true;
		};

		CSSOCompressor.prototype.restructureRuleset = function(token, rule, parent, i) {
			var prevToken = (i === 2 || parent[i - 1][1] === 'unknown') ? null : parent[i - 1];
			var prevSelector = prevToken ? prevToken[2] : [];
			var prevBlock = prevToken ? prevToken[3] : [];
			var selector = token[2];
			var block = token[3];

			if (block.length < 3) {
				return null;
			}

			if (prevSelector.length > 2 &&
				prevBlock.length > 2 &&
				token[0].pseudoSignature == prevToken[0].pseudoSignature) {
				if (token[1] !== prevToken[1]) {
					return;
				}

				// try to join by properties
				var analyzeInfo = this.analyze(token, prevToken);

				if (analyzeInfo.eq.length && (analyzeInfo.ne1.length || analyzeInfo.ne2.length)) {
					if (analyzeInfo.ne1.length && !analyzeInfo.ne2.length) {
						// prevToken in token
						var simpleSelectorCount = selector.length - 2; // - type and info
						var selectorStr = translate(selector, true);
						var selectorLength = selectorStr.length +
											 simpleSelectorCount - 1; // delims count
						var blockLength = this.calcLength(analyzeInfo.eq) + // declarations length
										  analyzeInfo.eq.length - 1; // decldelims length

						if (selectorLength < blockLength) {
							prevToken[2] = this.cleanSelector(prevSelector.concat(selector.slice(2)));
							token[3] = [block[0], block[1]].concat(analyzeInfo.ne1);
							return token;
						}
					} else if (analyzeInfo.ne2.length && !analyzeInfo.ne1.length) {
						// token in prevToken
						var simpleSelectorCount = prevSelector.length - 2; // - type and info
						var selectorStr = translate(prevSelector, true);
						// selectorLength = selector str - delims count
						var selectorLength = selectorStr.length + simpleSelectorCount - 1;
						var blockLength = this.calcLength(analyzeInfo.eq) + // declarations length
										  analyzeInfo.eq.length - 1; // decldelims length

						if (selectorLength < blockLength) {
							token[2] = this.cleanSelector(prevSelector.concat(selector.slice(2)));
							prevToken[3] = [prevBlock[0], prevBlock[1]].concat(analyzeInfo.ne2);
							return token;
						}
					} else {
						// extract equal block?
						var newSelector = this.cleanSelector(prevSelector.concat(selector.slice(2)));
						var newSelectorStr = translate(newSelector, true);
						var newSelectorLength = newSelectorStr.length + // selector length
												newSelector.length - 1 + // delims length
												2; // braces length
						var blockLength = this.calcLength(analyzeInfo.eq) + // declarations length
										  analyzeInfo.eq.length - 1; // decldelims length

						// ok, it's good enough to extract
						if (blockLength >= newSelectorLength) {
							var newRuleset = [
								{},
								'ruleset',
								newSelector,
								[{}, 'block'].concat(analyzeInfo.eq)
							];

							newSelector[0].s = newSelectorStr;
							token[3] = [block[0], block[1]].concat(analyzeInfo.ne1);
							prevToken[3] = [prevBlock[0], prevBlock[1]].concat(analyzeInfo.ne2);
							parent.splice(i, 0, newRuleset);
							return newRuleset;
						}
					}
				}
			}
		};

		CSSOCompressor.prototype.calcLength = function(tokens) {
			var length = 0;

			for (var i = 0; i < tokens.length; i++) {
				length += tokens[i][0].s.length;
			};

			return length;
		};

		CSSOCompressor.prototype.cleanSelector = function(token) {
			if (token.length === 2) {
				return null;
			}

			var saw = {};

			for (var i = 2; i < token.length; i++) {
				var selector = token[i][0].s;
				if (saw.hasOwnProperty(selector)) {
					token.splice(i, 1);
					i--;
				} else {
					saw[selector] = true;
				}
			}

			return token;
		};

		CSSOCompressor.prototype.analyze = function(token1, token2) {
			var result = {
				eq: [],
				ne1: [],
				ne2: []
			};

			if (token1[1] !== token2[1]) {
				return result;
			}

			var items1 = token1[3];
			var items2 = token2[3];
			var hash1 = this.getHash(items1);
			var hash2 = this.getHash(items2);

			for (var i = 2; i < items1.length; i++) {
				var item = items1[i];

				if (item[0].s in hash2) {
					result.eq.push(item);
				} else {
					result.ne1.push(item);
				}
			}

			for (var i = 2; i < items2.length; i++) {
				var item = items2[i];

				if (item[0].s in hash1 === false) {
					result.ne2.push(item);
				}
			}

			return result;
		};

		CSSOCompressor.prototype.equalHash = function(h0, h1) {
			for (var key in h0) {
				if (key in h1 === false) {
					return false;
				}
			}

			for (var key in h1) {
				if (key in h0 === false) {
					return false;
				}
			}

			return true;
		};

		CSSOCompressor.prototype.getHash = function(tokens) {
			var hash = {};

			for (var i = 2; i < tokens.length; i++) {
				hash[tokens[i][0].s] = true;
			}

			return hash;
		};

		CSSOCompressor.prototype.hashInHash = function(hash1, hash2) {
			for (var key in hash1) {
				if (key in hash2 === false) {
					return false;
				}
			}

			return true;
		};

		CSSOCompressor.prototype.delimSelectors = function(token) {
			for (var i = token.length - 1; i > 2; i--) {
				token.splice(i, 0, [{}, 'delim']);
			}
		};

		CSSOCompressor.prototype.delimBlocks = function(token) {
			for (var i = token.length - 1; i > 2; i--) {
				token.splice(i, 0, [{}, 'decldelim']);
			}
		};

		CSSOCompressor.prototype.copyObject = function(obj) {
			var result = {};

			for (var key in obj) {
				result[key] = obj[key];
			}

			return result;
		};

		CSSOCompressor.prototype.copyArray = function(token) {
			var result = token.slice();
			var oldInfo = token[0];
			var newInfo = {};

			for (var key in oldInfo) {
				newInfo[key] = oldInfo[key];
			}

			result[0] = newInfo;

			for (var i = 2; i < token.length; i++) {
				if (Array.isArray(token[i])) {
					result[i] = this.copyArray(token[i]);
				}
			}

			return result;
		};

		CSSOCompressor.prototype.pathUp = function(path) {
			return path.substr(0, path.lastIndexOf('/'));
		};

		var exports = function(tree, options) {
			return new CSSOCompressor().compress(tree, options || {});
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/color
	modules['/compressor/color'] = function () {
		var packNumber = require('/compressor/utils').packNumber;

		// http://www.w3.org/TR/css3-color/#svg-color
		var NAME_TO_HEX = {
			'aliceblue': 'f0f8ff',
			'antiquewhite': 'faebd7',
			'aqua': '0ff',
			'aquamarine': '7fffd4',
			'azure': 'f0ffff',
			'beige': 'f5f5dc',
			'bisque': 'ffe4c4',
			'black': '000',
			'blanchedalmond': 'ffebcd',
			'blue': '00f',
			'blueviolet': '8a2be2',
			'brown': 'a52a2a',
			'burlywood': 'deb887',
			'cadetblue': '5f9ea0',
			'chartreuse': '7fff00',
			'chocolate': 'd2691e',
			'coral': 'ff7f50',
			'cornflowerblue': '6495ed',
			'cornsilk': 'fff8dc',
			'crimson': 'dc143c',
			'cyan': '0ff',
			'darkblue': '00008b',
			'darkcyan': '008b8b',
			'darkgoldenrod': 'b8860b',
			'darkgray': 'a9a9a9',
			'darkgrey': 'a9a9a9',
			'darkgreen': '006400',
			'darkkhaki': 'bdb76b',
			'darkmagenta': '8b008b',
			'darkolivegreen': '556b2f',
			'darkorange': 'ff8c00',
			'darkorchid': '9932cc',
			'darkred': '8b0000',
			'darksalmon': 'e9967a',
			'darkseagreen': '8fbc8f',
			'darkslateblue': '483d8b',
			'darkslategray': '2f4f4f',
			'darkslategrey': '2f4f4f',
			'darkturquoise': '00ced1',
			'darkviolet': '9400d3',
			'deeppink': 'ff1493',
			'deepskyblue': '00bfff',
			'dimgray': '696969',
			'dimgrey': '696969',
			'dodgerblue': '1e90ff',
			'firebrick': 'b22222',
			'floralwhite': 'fffaf0',
			'forestgreen': '228b22',
			'fuchsia': 'f0f',
			'gainsboro': 'dcdcdc',
			'ghostwhite': 'f8f8ff',
			'gold': 'ffd700',
			'goldenrod': 'daa520',
			'gray': '808080',
			'grey': '808080',
			'green': '008000',
			'greenyellow': 'adff2f',
			'honeydew': 'f0fff0',
			'hotpink': 'ff69b4',
			'indianred': 'cd5c5c',
			'indigo': '4b0082',
			'ivory': 'fffff0',
			'khaki': 'f0e68c',
			'lavender': 'e6e6fa',
			'lavenderblush': 'fff0f5',
			'lawngreen': '7cfc00',
			'lemonchiffon': 'fffacd',
			'lightblue': 'add8e6',
			'lightcoral': 'f08080',
			'lightcyan': 'e0ffff',
			'lightgoldenrodyellow': 'fafad2',
			'lightgray': 'd3d3d3',
			'lightgrey': 'd3d3d3',
			'lightgreen': '90ee90',
			'lightpink': 'ffb6c1',
			'lightsalmon': 'ffa07a',
			'lightseagreen': '20b2aa',
			'lightskyblue': '87cefa',
			'lightslategray': '789',
			'lightslategrey': '789',
			'lightsteelblue': 'b0c4de',
			'lightyellow': 'ffffe0',
			'lime': '0f0',
			'limegreen': '32cd32',
			'linen': 'faf0e6',
			'magenta': 'f0f',
			'maroon': '800000',
			'mediumaquamarine': '66cdaa',
			'mediumblue': '0000cd',
			'mediumorchid': 'ba55d3',
			'mediumpurple': '9370db',
			'mediumseagreen': '3cb371',
			'mediumslateblue': '7b68ee',
			'mediumspringgreen': '00fa9a',
			'mediumturquoise': '48d1cc',
			'mediumvioletred': 'c71585',
			'midnightblue': '191970',
			'mintcream': 'f5fffa',
			'mistyrose': 'ffe4e1',
			'moccasin': 'ffe4b5',
			'navajowhite': 'ffdead',
			'navy': '000080',
			'oldlace': 'fdf5e6',
			'olive': '808000',
			'olivedrab': '6b8e23',
			'orange': 'ffa500',
			'orangered': 'ff4500',
			'orchid': 'da70d6',
			'palegoldenrod': 'eee8aa',
			'palegreen': '98fb98',
			'paleturquoise': 'afeeee',
			'palevioletred': 'db7093',
			'papayawhip': 'ffefd5',
			'peachpuff': 'ffdab9',
			'peru': 'cd853f',
			'pink': 'ffc0cb',
			'plum': 'dda0dd',
			'powderblue': 'b0e0e6',
			'purple': '800080',
			'rebeccapurple': '639',
			'red': 'f00',
			'rosybrown': 'bc8f8f',
			'royalblue': '4169e1',
			'saddlebrown': '8b4513',
			'salmon': 'fa8072',
			'sandybrown': 'f4a460',
			'seagreen': '2e8b57',
			'seashell': 'fff5ee',
			'sienna': 'a0522d',
			'silver': 'c0c0c0',
			'skyblue': '87ceeb',
			'slateblue': '6a5acd',
			'slategray': '708090',
			'slategrey': '708090',
			'snow': 'fffafa',
			'springgreen': '00ff7f',
			'steelblue': '4682b4',
			'tan': 'd2b48c',
			'teal': '008080',
			'thistle': 'd8bfd8',
			'tomato': 'ff6347',
			'turquoise': '40e0d0',
			'violet': 'ee82ee',
			'wheat': 'f5deb3',
			'white': 'fff',
			'whitesmoke': 'f5f5f5',
			'yellow': 'ff0',
			'yellowgreen': '9acd32'
		};

		var HEX_TO_NAME = {
			'800000': 'maroon',
			'800080': 'purple',
			'808000': 'olive',
			'808080': 'gray',
			'00ffff': 'cyan',
			'f0ffff': 'azure',
			'f5f5dc': 'beige',
			'ffe4c4': 'bisque',
			'000000': 'black',
			'0000ff': 'blue',
			'a52a2a': 'brown',
			'ff7f50': 'coral',
			'ffd700': 'gold',
			'008000': 'green',
			'4b0082': 'indigo',
			'fffff0': 'ivory',
			'f0e68c': 'khaki',
			'00ff00': 'lime',
			'faf0e6': 'linen',
			'000080': 'navy',
			'ffa500': 'orange',
			'da70d6': 'orchid',
			'cd853f': 'peru',
			'ffc0cb': 'pink',
			'dda0dd': 'plum',
			'f00': 'red',
			'ff0000': 'red',
			'fa8072': 'salmon',
			'a0522d': 'sienna',
			'c0c0c0': 'silver',
			'fffafa': 'snow',
			'd2b48c': 'tan',
			'008080': 'teal',
			'ff6347': 'tomato',
			'ee82ee': 'violet',
			'f5deb3': 'wheat',
			'ffffff': 'white',
			'ffff00': 'yellow'
		};

		function hueToRgb(p, q, t) {
			if (t < 0) {
				t += 1;
			}
			if (t > 1) {
				t -= 1;
			}
			if (t < 1 / 6) {
				return p + (q - p) * 6 * t;
			}
			if (t < 1 / 2) {
				return q;
			}
			if (t < 2 / 3) {
				return p + (q - p) * (2 / 3 - t) * 6;
			}
			return p;
		}

		function hslToRgb(h, s, l, a) {
			var r;
			var g;
			var b;

			if (s == 0) {
				r = g = b = l; // achromatic
			} else {
				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;

				r = hueToRgb(p, q, h + 1 / 3);
				g = hueToRgb(p, q, h);
				b = hueToRgb(p, q, h - 1 / 3);
			}

			return [
				Math.round(r * 255),
				Math.round(g * 255),
				Math.round(b * 255),
				a
			];
		}

		function toHex(value) {
			value = value.toString(16);
			return value.length === 1 ? '0' + value : value;
		}

		function parseFunctionArgs(body, count, rgb) {
			var args = [];

			for (var i = 2, unary = false; i < body.length; i++) {
				var child = body[i];
				var type = child[1];

				switch (type) {
					case 'number':
					case 'percentage':
						// fit value to 0..255 range
						args.push({
							type: type,
							unary: unary,
							value: Number(type === 'number' ? body[i][2] : body[i][2][2])
						});
						break;

					case 'unary':
						if (child[2] === '+' || child[2] === '-') {
							unary = child[2];
							break;
						}
						// only + and - allowed
						return;

					case 'operator':
						if (child[2] === ',') {
							unary = false;
							break;
						}
						// only comma operator allowed
						return;

					default:
						// something we couldn't understand
						return;
				}
			}

			if (args.length !== count) {
				// invalid arguments count
				// TODO: remove those tokens
				return;
			}

			if (args.length === 4) {
				if (args[3].type !== 'number') {
					// 4th argument should be a number
					// TODO: remove those tokens
					return;
				}

				args[3].type = 'alpha';
			}

			if (rgb) {
				if (args[0].type !== args[1].type || args[0].type !== args[2].type) {
					// invalid color, numbers and percentage shouldn't be mixed
					// TODO: remove those tokens
					return;
				}
			} else {
				if (args[0].type !== 'number' ||
					args[1].type !== 'percentage' ||
					args[2].type !== 'percentage') {
					// invalid color, for hsl values should be: number, percentage, percentage
					// TODO: remove those tokens
					return;
				}

				args[0].type = 'angle';
			}

			return args.map(function(arg, idx) {
				var value = arg.unary === '-' ? 0 : arg.value;

				switch (arg.type) {
					case 'number':
						value = Math.min(value, 255);
						break;

					case 'percentage':
						value = Math.min(value, 100) / 100;

						if (!rgb) {
							return value;
						}

						value = 255 * value;
						break;

					case 'angle':
						return (((value % 360) + 360) % 360) / 360;

					case 'alpha':
						// 0..1
						return Math.min(value, 1);
				}

				return Math.round(value);
			});
		}

		function compressFunction(token, rule, parent, idx) {
			var functionName = token[2][2];
			var body = token[3];
			var args;

			if (functionName === 'rgba' || functionName === 'hsla') {
				args = parseFunctionArgs(body, 4, functionName === 'rgba');

				if (!args) {
					// something went wrong
					return;
				}

				if (functionName === 'hsla') {
					args = hslToRgb.apply(null, args);
					token[2][2] = 'rgba';
				}

				if (args[3] !== 1) {
					// replace argument values for normalized/interpolated
					token[3] = body.filter(function(argToken, idx) {
						// ignore body's info and type
						if (idx < 2) {
							return true;
						}

						var type = argToken[1];

						if (type === 'number' || type === 'percentage') {
							var number = packNumber(String(args.shift()));
							argToken[0].s = number;
							argToken[1] = 'number';
							argToken[2] = number;
							return true;
						}

						return type === 'operator';
					});

					return;
				}

				// otherwise convert to rgb, i.e. rgba(255, 0, 0, 1) -> rgb(255, 0, 0)
				functionName = 'rgb';
			}

			if (functionName === 'hsl') {
				args = args || parseFunctionArgs(body, 3, false);

				if (!args) {
					// something went wrong
					return;
				}

				// convert to rgb
				args = hslToRgb.apply(null, args);
				functionName = 'rgb';
			}

			if (functionName === 'rgb') {
				args = args || parseFunctionArgs(body, 3, true);

				if (!args) {
					// something went wrong
					return;
				}

				var color = toHex(args[0]) + toHex(args[1]) + toHex(args[2]);
				var vhash = compressHex(color, {});
				var next = parent[idx + 1];

				// check if color is not at the end and not followed by space
				if (next && next[1] != 's') {
					parent.splice(idx + 1, 0, [{}, 's', ' ']);
				}

				return vhash;
			}
		}

		function compressIdent(token, rule, parent) {
			var parentType = parent[1];

			if (parentType === 'value' || parentType === 'functionBody') {
				var color = token[2].toLowerCase();
				var hex = NAME_TO_HEX[color];

				if (hex) {
					if (hex.length + 1 <= color.length) {
						// replace for shorter hex value
						return [{}, 'vhash', hex];
					} else {
						// special case for consistent colors
						if (color === 'grey') {
							color = 'gray';
						}

						// just replace value for lower cased name
						token[2] = color;
					}
				}
			}
		}

		function compressHex(color, info) {
			var minColor = color.toLowerCase();

			if (color.length === 6 &&
				color[0] === color[1] &&
				color[2] === color[3] &&
				color[4] === color[5]) {
				minColor = color[0] + color[2] + color[4];
			}

			if (HEX_TO_NAME[minColor]) {
				return [info, 'ident', HEX_TO_NAME[minColor]];
			}

			return [info, 'vhash', minColor];
		}

		var exports = {
			compressFunction: compressFunction,
			compressIdent: compressIdent,
			compressHex: function(token) {
				return compressHex(token[2], token[0]);
			}
		};
		
		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/const
	modules['/compressor/const'] = function () {
		var exports = {};

		exports.nonLengthUnits = {
			'deg': 1,
			'grad': 1,
			'rad': 1,
			'turn': 1,
			's': 1,
			'ms': 1,
			'Hz': 1,
			'kHz': 1,
			'dpi': 1,
			'dpcm': 1,
			'dppx': 1
		};

		exports.cleanCfg = {
			'cleanComment': 1
		};

		exports.defCCfg = {
			'cleanCharset': 1,
			'cleanImport': 1,
			'cleanWhitespace': 1,
			'cleanDecldelim': 1,
			'compressNumber': 1,
			'cleanUnary': 1,
			'compressColor': 1,
			'compressDimension': 1,
			'compressString': 1,
			'compressFontWeight': 1,
			'compressFont': 1,
			'compressBackground': 1,
			'cleanEmpty': 1
		};

		exports.defRBCfg = {
			'restructureBlock': 1
		};

		exports.defRJCfg = {
			'rejoinRuleset': 1,
			'cleanEmpty': 1
		};

		exports.defRRCfg = {
			'restructureRuleset': 1,
			'cleanEmpty': 1
		};

		exports.defFCfg = {
			'cleanEmpty': 1,
			'delimSelectors': 1,
			'delimBlocks': 1
		};

		exports.preCfg = {
			'destroyDelims': 1,
			'preTranslate': 1
		};

		exports.msCfg = {
			'markShorthands': 1
		};

		exports.frCfg = {
			'freezeRulesets': 1
		};

		exports.csCfg = {
			'cleanShorthands': 1,
			'cleanEmpty': 1
		};

		exports.order = [
			'cleanCharset',
			'cleanImport',
			'cleanComment',
			'cleanWhitespace',
			'compressNumber',
			'cleanUnary',
			'compressColor',
			'compressDimension',
			'compressString',
			'compressFontWeight',
			'compressFont',
			'compressBackground',
			'freezeRulesets',
			'destroyDelims',
			'preTranslate',
			'markShorthands',
			'cleanShorthands',
			'restructureBlock',
			'rejoinRuleset',
			'restructureRuleset',
			'cleanEmpty',
			'delimSelectors',
			'delimBlocks'
		];

		exports.profile = {
			'cleanCharset': {
				'atrules': 1
			},
			'cleanImport': {
				'atrules': 1
			},
			'cleanWhitespace': {
				's': 1
			},
			'compressNumber': {
				'number': 1
			},
			'cleanUnary': {
				'unary': 1
			},
			'compressColor': {
				'vhash': 1,
				'funktion': 1,
				'ident': 1
			},
			'compressDimension': {
				'dimension': 1
			},
			'compressString': {
				'string': 1
			},
			'compressFontWeight': {
				'declaration': 1
			},
			'compressFont': {
				'declaration': 1
			},
			'compressBackground': {
				'declaration': 1
			},
			'cleanComment': {
				'comment': 1
			},
			'cleanDecldelim': {
				'block': 1
			},
			'cleanEmpty': {
				'ruleset': 1,
				'atruleb': 1,
				'atruler': 1
			},
			'destroyDelims': {
				'decldelim': 1,
				'delim': 1
			},
			'preTranslate': {
				'declaration': 1,
				'property': 1,
				'simpleselector': 1,
				'filter': 1,
				'value': 1,
				'number': 1,
				'percentage': 1,
				'dimension': 1,
				'ident': 1
			},
			'restructureBlock': {
				'block': 1
			},
			'rejoinRuleset': {
				'ruleset': 1
			},
			'restructureRuleset': {
				'ruleset': 1
			},
			'delimSelectors': {
				'selector': 1
			},
			'delimBlocks': {
				'block': 1
			},
			'markShorthands': {
				'block': 1
			},
			'cleanShorthands': {
				'declaration': 1
			},
			'freezeRulesets': {
				'ruleset': 1
			}
		};

		exports.notFPClasses = {
			'link': 1,
			'visited': 1,
			'hover': 1,
			'active': 1,
			'first-letter': 1,
			'first-line': 1
		};

		exports.notFPElements = {
			'first-letter': 1,
			'first-line': 1
		};

		exports.dontRestructure = {
			'src': 1 // https://github.com/afelix/csso/issues/50
		};

		exports.vendorID = {
			'-o-': 'o',
			'-moz-': 'm',
			'-webkit-': 'w',
			'-ms-': 'i',
			'-epub-': 'e',
			'-apple-': 'a',
			'-xv-': 'x',
			'-wap-': 'p'
		};

		exports.nlTable = {
			'border-width': ['border'],
			'border-style': ['border'],
			'border-color': ['border'],
			'border-top': ['border'],
			'border-right': ['border'],
			'border-bottom': ['border'],
			'border-left': ['border'],
			'border-top-width': ['border-top', 'border-width', 'border'],
			'border-right-width': ['border-right', 'border-width', 'border'],
			'border-bottom-width': ['border-bottom', 'border-width', 'border'],
			'border-left-width': ['border-left', 'border-width', 'border'],
			'border-top-style': ['border-top', 'border-style', 'border'],
			'border-right-style': ['border-right', 'border-style', 'border'],
			'border-bottom-style': ['border-bottom', 'border-style', 'border'],
			'border-left-style': ['border-left', 'border-style', 'border'],
			'border-top-color': ['border-top', 'border-color', 'border'],
			'border-right-color': ['border-right', 'border-color', 'border'],
			'border-bottom-color': ['border-bottom', 'border-color', 'border'],
			'border-left-color': ['border-left', 'border-color', 'border'],
			'margin-top': ['margin'],
			'margin-right': ['margin'],
			'margin-bottom': ['margin'],
			'margin-left': ['margin'],
			'padding-top': ['padding'],
			'padding-right': ['padding'],
			'padding-bottom': ['padding'],
			'padding-left': ['padding'],
			'font-style': ['font'],
			'font-variant': ['font'],
			'font-weight': ['font'],
			'font-size': ['font'],
			'font-family': ['font'],
			'list-style-type': ['list-style'],
			'list-style-position': ['list-style'],
			'list-style-image': ['list-style']
		};

		exports.allowedPClasses = {
			'after': 1,
			'before': 1
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/rules
	modules['/compressor/rules'] = function () {
		var constants = require('/compressor/const');

		function initRules(config) {
			var store = {};
			var order = constants.order;
			var profile = constants.profile;
			var rules = order.filter(function(key) {
				return key in config;
			});

			if (!rules.length) {
				rules = order;
			}

			rules.forEach(function(rule) {
				Object.keys(profile[rule]).forEach(function(key) {
					if (store[key]) {
						store[key].push(rule);
					} else {
						store[key] = [rule];
					}
				});
			});

			return store;
		};

		var exports = {
			cleanComments: initRules(constants.cleanCfg), // special case to resolve ambiguity
			compress: initRules(constants.defCCfg),
			prepare: initRules(constants.preCfg),
			freezeRuleset: initRules(constants.frCfg),
			markShorthand: initRules(constants.msCfg),
			cleanShortcut: initRules(constants.csCfg),
			restructureBlock: initRules(constants.defRBCfg),
			rejoinRuleset: initRules(constants.defRJCfg),
			restructureRuleset: initRules(constants.defRRCfg),
			finalize: initRules(constants.defFCfg)
		};
		
		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/trbl
	modules['/compressor/trbl'] = function () {
		var unsafeToMerge = /vh|vw|vmin|vmax|vm|rem|\\9/;

		var TOP = 0;
		var RIGHT = 1;
		var BOTTOM = 2;
		var LEFT = 3;
		var SIDES = ['top', 'right', 'bottom', 'left'];
		var SIDE = {
			'margin-top': 'top',
			'margin-right': 'right',
			'margin-bottom': 'bottom',
			'margin-left': 'left',
			'padding-top': 'top',
			'padding-right': 'right',
			'padding-bottom': 'bottom',
			'padding-left': 'left'
		};
		var MAIN_PROPERTY = {
			'margin': 'margin',
			'margin-top': 'margin',
			'margin-right': 'margin',
			'margin-bottom': 'margin',
			'margin-left': 'margin',
			'padding': 'padding',
			'padding-top': 'padding',
			'padding-right': 'padding',
			'padding-bottom': 'padding',
			'padding-left': 'padding'
		};

		function TRBL(name, important) {
			this.name = TRBL.extractMain(name);
			this.important = important ? 4 : 0;
			this.sides = {
				'top': null,
				'right': null,
				'bottom': null,
				'left': null
			};
		}

		TRBL.props = MAIN_PROPERTY;

		TRBL.extractMain = function(name) {
			return MAIN_PROPERTY[name];
		};

		TRBL.prototype.impSum = function() {
			var sideCount = 0;
			var important = 0;

			for (var side in this.sides) {
				if (this.sides[side]) {
					sideCount++;
					if (this.sides[side].important) {
						important++;
					}
				}
			}

			return important === sideCount ? important : 0;
		};

		TRBL.prototype.add = function(name, sValue, tValue, important) {
			function add(token, str) {
				if (wasUnary) {
					var last = values[values.length - 1];
					last.t.push(token);
					last.s += str;
					wasUnary = false;
				} else {
					values.push({
						s: str,
						t: [token],
						important: important
					});
				}
			}

			var sides = this.sides;
			var side = SIDE[name];
			var wasUnary = false;
			var values = [];

			important = important ? 1 : 0;

			if (side) {
				if (side in sides) {
					var currentValue = sides[side];

					if (!currentValue || (important && !currentValue.important)) {
						sides[side] = {
							s: important ? sValue.substring(0, sValue.length - 10) : sValue,
							t: tValue[0][1] === 'unary'
								? [tValue[0], tValue[1]]
								: [tValue[0]],
							important: important
						};
					}

					return true;
				}
			} else if (name === this.name) {
				for (var i = 0; i < tValue.length; i++) {
					var child = tValue[i];

					switch (child[1]) {
						case 'unary':
							add(child, child[2]);
							wasUnary = true;
							break;

						case 'number':
						case 'ident':
							add(child, child[2]);
							break;

						case 'percentage':
							add(child, child[2][2] + '%');
							break;

						case 'dimension':
							add(child, child[2][2] + child[3][2]);
							break;

						case 's':
						case 'comment':
						case 'important':
							break;

						default:
							return false;
					}
				}

				if (values.length > 4) {
					return false;
				}

				if (!values[RIGHT]) {
					values[RIGHT] = values[TOP];
				}
				if (!values[BOTTOM]) {
					values[BOTTOM] = values[TOP];
				}
				if (!values[LEFT]) {
					values[LEFT] = values[RIGHT];
				}

				for (var i = 0; i < 4; i++) {
					if (!sides[SIDES[i]] || (important && !sides[SIDES[i]].important)) {
						sides[SIDES[i]] = values[i];
					}
				}

				return true;
			}
		};

		TRBL.prototype.isOkToMinimize = function() {
			var top = this.sides.top;
			var right = this.sides.right;
			var bottom = this.sides.bottom;
			var left = this.sides.left;

			if (top && right && bottom && left) {
				if (unsafeToMerge.test([top.s, right.s, bottom.s, left.s].join(' '))) {
					return false;
				}

				var important = top.important +
								right.important +
								bottom.important +
								left.important;

				return important === 0 || important === 4 || important === this.important;
			}

			return false;
		};

		TRBL.prototype.getValue = function() {
			var result = [{}, 'value'];
			var sides = this.sides;
			var values = [
				sides.top,
				sides.right,
				sides.bottom,
				sides.left
			];

			if (sides.left.s === sides.right.s) {
				values.pop();
				if (sides.bottom.s === sides.top.s) {
					values.pop();
					if (sides.right.s === sides.top.s) {
						values.pop();
					}
				}
			}

			result = result.concat(values[TOP].t);
			for (var i = 1; i < values.length; i++) {
				result.push([{ s: ' ' }, 's', ' ']);
				result = result.concat(values[i].t);
			}

			if (this.impSum()) {
				result.push([{ s: '!important' }, 'important']);
			}

			return result;
		};

		TRBL.prototype.getProperty = function() {
			return [
				{ s: this.name },
				'property',
				[{ s: this.name }, 'ident', this.name]
			];
		};
		
		return TRBL;
	};
	//#endregion
	
	//#region URL: /compressor/utils
	modules['/compressor/utils'] = function () {
		function packNumber(value) {
			value = value
				.replace(/^0+/, '')
				.replace(/\.0*$/, '')
				.replace(/(\..*\d+)0+$/, '$1');

			return value === '.' || value === '' ? '0' : value;
		}

		var exports = {
			packNumber: packNumber
		};
		
		return exports;
	};
	//#endregion
		
	//#region URL: /parser
	modules['/parser'] = function () {
		var TokenType = require('/parser/const');
		var tokenize = require('/parser/tokenize');

		var tokens;
		var needInfo;
		var pos;
		var failLN;
		var currentBlockLN;

		var NodeType = {
			IdentType: 'ident',
			AtkeywordType: 'atkeyword',
			StringType: 'string',
			ShashType: 'shash',
			VhashType: 'vhash',
			NumberType: 'number',
			PercentageType: 'percentage',
			DimensionType: 'dimension',
			DecldelimType: 'decldelim',
			SType: 's',
			AttrselectorType: 'attrselector',
			AttribType: 'attrib',
			NthType: 'nth',
			NthselectorType: 'nthselector',
			NamespaceType: 'namespace',
			ClazzType: 'clazz',
			PseudoeType: 'pseudoe',
			PseudocType: 'pseudoc',
			DelimType: 'delim',
			StylesheetType: 'stylesheet',
			AtrulebType: 'atruleb',
			AtrulesType: 'atrules',
			AtrulerqType: 'atrulerq',
			AtrulersType: 'atrulers',
			AtrulerType: 'atruler',
			BlockType: 'block',
			RulesetType: 'ruleset',
			CombinatorType: 'combinator',
			SimpleselectorType: 'simpleselector',
			SelectorType: 'selector',
			DeclarationType: 'declaration',
			PropertyType: 'property',
			ImportantType: 'important',
			UnaryType: 'unary',
			OperatorType: 'operator',
			BracesType: 'braces',
			ValueType: 'value',
			ProgidType: 'progid',
			FiltervType: 'filterv',
			FilterType: 'filter',
			CommentType: 'comment',
			UriType: 'uri',
			RawType: 'raw',
			FunctionBodyType: 'functionBody',
			FunktionType: 'funktion',
			FunctionExpressionType: 'functionExpression',
			UnknownType: 'unknown'
		};

		var CSSPRules = {
			'ident': function() { if (checkIdent(pos)) return getIdent() },
			'atkeyword': function() { if (checkAtkeyword(pos)) return getAtkeyword() },
			'string': function() { if (checkString(pos)) return getString() },
			'shash': function() { if (checkShash(pos)) return getShash() },
			'vhash': function() { if (checkVhash(pos)) return getVhash() },
			'number': function() { if (checkNumber(pos)) return getNumber() },
			'percentage': function() { if (checkPercentage(pos)) return getPercentage() },
			'dimension': function() { if (checkDimension(pos)) return getDimension() },
			'decldelim': function() { if (checkDecldelim(pos)) return getDecldelim() },
			's': function() { if (checkS(pos)) return getS() },
			'attrselector': function() { if (checkAttrselector(pos)) return getAttrselector() },
			'attrib': function() { if (checkAttrib(pos)) return getAttrib() },
			'nth': function() { if (checkNth(pos)) return getNth() },
			'nthselector': function() { if (checkNthselector(pos)) return getNthselector() },
			'namespace': function() { if (checkNamespace(pos)) return getNamespace() },
			'clazz': function() { if (checkClazz(pos)) return getClazz() },
			'pseudoe': function() { if (checkPseudoe(pos)) return getPseudoe() },
			'pseudoc': function() { if (checkPseudoc(pos)) return getPseudoc() },
			'delim': function() { if (checkDelim(pos)) return getDelim() },
			'stylesheet': function() { if (checkStylesheet(pos)) return getStylesheet() },
			'atruleb': function() { if (checkAtruleb(pos)) return getAtruleb() },
			'atrules': function() { if (checkAtrules(pos)) return getAtrules() },
			'atrulerq': function() { if (checkAtrulerq(pos)) return getAtrulerq() },
			'atrulers': function() { if (checkAtrulers(pos)) return getAtrulers() },
			'atruler': function() { if (checkAtruler(pos)) return getAtruler() },
			'block': function() { if (checkBlock(pos)) return getBlock() },
			'ruleset': function() { if (checkRuleset(pos)) return getRuleset() },
			'combinator': function() { if (checkCombinator(pos)) return getCombinator() },
			'simpleselector': function() { if (checkSimpleselector(pos)) return getSimpleSelector() },
			'selector': function() { if (checkSelector(pos)) return getSelector() },
			'declaration': function() { if (checkDeclaration(pos)) return getDeclaration() },
			'property': function() { if (checkProperty(pos)) return getProperty() },
			'important': function() { if (checkImportant(pos)) return getImportant() },
			'unary': function() { if (checkUnary(pos)) return getUnary() },
			'operator': function() { if (checkOperator(pos)) return getOperator() },
			'braces': function() { if (checkBraces(pos)) return getBraces() },
			'value': function() { if (checkValue(pos)) return getValue() },
			'progid': function() { if (checkProgid(pos)) return getProgid() },
			'filterv': function() { if (checkFilterv(pos)) return getFilterv() },
			'filter': function() { if (checkFilter(pos)) return getFilter() },
			'comment': function() { if (checkComment(pos)) return getComment() },
			'uri': function() { if (checkUri(pos)) return getUri() },
			'funktion': function() { if (checkFunktion(pos)) return getFunktion() },
			'functionExpression': function() { if (checkFunctionExpression(pos)) return getFunctionExpression() },
			'unknown': function() { if (checkUnknown(pos)) return getUnknown() }
		};

		function fail(token) {
			if (token && token.line > failLN) {
				failLN = token.line;
			}
		}

		function throwError() {
			throw new Error('Please check the validity of the CSS block starting from the line #' + currentBlockLN);
		}

		function getInfo(idx) {
			var token = tokens[idx];

			return {
				offset: token.offset,
				line: token.line,
				column: token.column
			};
		}

		function createToken(type) {
			var result;

			if (needInfo) {
				result = [getInfo(pos), type];
			} else {
				result = [type];
			}

			return result;
		}

		//any = braces | string | percentage | dimension | number | uri | functionExpression | funktion | ident | unary
		function checkAny(_i) {
			return checkBraces(_i) ||
				   checkString(_i) ||
				   checkPercentage(_i) ||
				   checkDimension(_i) ||
				   checkNumber(_i) ||
				   checkUri(_i) ||
				   checkFunctionExpression(_i) ||
				   checkFunktion(_i) ||
				   checkIdent(_i) ||
				   checkUnary(_i);
		}

		function getAny() {
			if (checkBraces(pos)) return getBraces();
			else if (checkString(pos)) return getString();
			else if (checkPercentage(pos)) return getPercentage();
			else if (checkDimension(pos)) return getDimension();
			else if (checkNumber(pos)) return getNumber();
			else if (checkUri(pos)) return getUri();
			else if (checkFunctionExpression(pos)) return getFunctionExpression();
			else if (checkFunktion(pos)) return getFunktion();
			else if (checkIdent(pos)) return getIdent();
			else if (checkUnary(pos)) return getUnary();
		}

		//atkeyword = '@' ident:x -> [#atkeyword, x]
		function checkAtkeyword(_i) {
			var l;

			if (tokens[_i++].type !== TokenType.CommercialAt) return fail(tokens[_i - 1]);

			if (l = checkIdent(_i)) return l + 1;

			return fail(tokens[_i]);
		}

		function getAtkeyword() {
			var startPos = pos;

			pos++;

			return needInfo?
				[getInfo(startPos), NodeType.AtkeywordType, getIdent()]:
				[NodeType.AtkeywordType, getIdent()];
		}

		//attrib = '[' sc*:s0 ident:x sc*:s1 attrselector:a sc*:s2 (ident | string):y sc*:s3 ']' -> this.concat([#attrib], s0, [x], s1, [a], s2, [y], s3)
		//       | '[' sc*:s0 ident:x sc*:s1 ']' -> this.concat([#attrib], s0, [x], s1),
		function checkAttrib(_i) {
			if (tokens[_i].type !== TokenType.LeftSquareBracket) return fail(tokens[_i]);

			if (!tokens[_i].right) return fail(tokens[_i]);

			return tokens[_i].right - _i + 1;
		}

		function checkAttrib1(_i) {
			var start = _i;

			_i++;

			var l = checkSC(_i); // s0

			if (l) _i += l;

			if (l = checkIdent(_i, true)) _i += l; // x
			else return fail(tokens[_i]);

			if (tokens[_i].type === TokenType.VerticalLine &&
				tokens[_i + 1].type !== TokenType.EqualsSign) {
				_i++;
				if (l = checkIdent(_i, true)) _i += l; // x
				else return fail(tokens[_i]);
			}

			if (l = checkSC(_i)) _i += l; // s1

			if (l = checkAttrselector(_i)) _i += l; // a
			else return fail(tokens[_i]);

			if (l = checkSC(_i)) _i += l; // s2

			if ((l = checkIdent(_i)) || (l = checkString(_i))) _i += l; // y
			else return fail(tokens[_i]);

			if (l = checkSC(_i)) _i += l; // s3

			if (tokens[_i].type === TokenType.RightSquareBracket) return _i - start;

			return fail(tokens[_i]);
		}

		function getAttrib1() {
			var startPos = pos;

			pos++;

			var a = (needInfo? [getInfo(startPos), NodeType.AttribType] : [NodeType.AttribType]);

			a = a.concat(
				getSC(),
				[getIdent()]
			);

			if (tokens[pos].type === TokenType.VerticalLine &&
				tokens[pos + 1].type !== TokenType.EqualsSign) {
				a.push(
					getNamespace(),
					getIdent()
				);
			}
			
			a = a.concat(
				getSC(),
				[getAttrselector()],
				getSC(),
				[checkString(pos) ? getString() : getIdent()],
				getSC()
			);

			pos++;

			return a;
		}

		function checkAttrib2(_i) {
			var start = _i;

			_i++;

			var l = checkSC(_i);

			if (l) _i += l;

			if (l = checkIdent(_i, true)) _i += l;

			if (tokens[_i].type === TokenType.VerticalLine &&
				tokens[_i + 1].type !== TokenType.EqualsSign) {
				_i++;
				if (l = checkIdent(_i, true)) _i += l; // x
				else return fail(tokens[_i]);
			}

			if (l = checkSC(_i)) _i += l;

			if (tokens[_i].type === TokenType.RightSquareBracket) return _i - start;

			return fail(tokens[_i]);
		}

		function getAttrib2() {
			var startPos = pos;

			pos++;

			var a = (needInfo? [getInfo(startPos), NodeType.AttribType] : [NodeType.AttribType])
				.concat(
					getSC(),
					[getIdent()]
				);

			if (tokens[pos].type === TokenType.VerticalLine &&
				tokens[pos + 1].type !== TokenType.EqualsSign) {
				a.push(
					getNamespace(),
					getIdent()
				);
			}

			a = a.concat(
				getSC()
			);

			pos++;

			return a;
		}

		function getAttrib() {
			if (checkAttrib1(pos)) return getAttrib1();
			if (checkAttrib2(pos)) return getAttrib2();
		}

		//attrselector = (seq('=') | seq('~=') | seq('^=') | seq('$=') | seq('*=') | seq('|=')):x -> [#attrselector, x]
		function checkAttrselector(_i) {
			if (tokens[_i].type === TokenType.EqualsSign) return 1;
			if (tokens[_i].type === TokenType.VerticalLine && (!tokens[_i + 1] || tokens[_i + 1].type !== TokenType.EqualsSign)) return 1;

			if (!tokens[_i + 1] || tokens[_i + 1].type !== TokenType.EqualsSign) return fail(tokens[_i]);

			switch(tokens[_i].type) {
				case TokenType.Tilde:
				case TokenType.CircumflexAccent:
				case TokenType.DollarSign:
				case TokenType.Asterisk:
				case TokenType.VerticalLine:
					return 2;
			}

			return fail(tokens[_i]);
		}

		function getAttrselector() {
			var startPos = pos,
				s = tokens[pos++].value;

			if (tokens[pos] && tokens[pos].type === TokenType.EqualsSign) s += tokens[pos++].value;

			return needInfo?
					[getInfo(startPos), NodeType.AttrselectorType, s] :
					[NodeType.AttrselectorType, s];
		}

		//atrule = atruler | atruleb | atrules
		function checkAtrule(_i) {
			var start = _i,
				l;

			if (tokens[start].atrule_l !== undefined) return tokens[start].atrule_l;

			if (l = checkAtruler(_i)) tokens[_i].atrule_type = 1;
			else if (l = checkAtruleb(_i)) tokens[_i].atrule_type = 2;
			else if (l = checkAtrules(_i)) tokens[_i].atrule_type = 3;
			else return fail(tokens[start]);

			tokens[start].atrule_l = l;

			return l;
		}

		function getAtrule() {
			switch (tokens[pos].atrule_type) {
				case 1: return getAtruler();
				case 2: return getAtruleb();
				case 3: return getAtrules();
			}
		}

		//atruleb = atkeyword:ak tset*:ap block:b -> this.concat([#atruleb, ak], ap, [b])
		function checkAtruleb(_i) {
			var start = _i,
				l;

			if (l = checkAtkeyword(_i)) _i += l;
			else return fail(tokens[_i]);

			if (l = checkTsets(_i)) _i += l;

			if (l = checkBlock(_i)) _i += l;
			else return fail(tokens[_i]);

			return _i - start;
		}

		function getAtruleb() {
			return (needInfo?
						[getInfo(pos), NodeType.AtrulebType, getAtkeyword()] :
						[NodeType.AtrulebType, getAtkeyword()])
							.concat(getTsets())
							.concat([getBlock()]);
		}

		//atruler = atkeyword:ak atrulerq:x '{' atrulers:y '}' -> [#atruler, ak, x, y]
		function checkAtruler(_i) {
			var start = _i,
				l;

			if (l = checkAtkeyword(_i)) _i += l;
			else return fail(tokens[_i]);

			if (l = checkAtrulerq(_i)) _i += l;

			if (_i < tokens.length && tokens[_i].type === TokenType.LeftCurlyBracket) _i++;
			else return fail(tokens[_i]);

			if (l = checkAtrulers(_i)) _i += l;

			if (_i < tokens.length && tokens[_i].type === TokenType.RightCurlyBracket) _i++;
			else return fail(tokens[_i]);

			return _i - start;
		}

		function getAtruler() {
			var atruler = needInfo?
							[getInfo(pos), NodeType.AtrulerType, getAtkeyword(), getAtrulerq()] :
							[NodeType.AtrulerType, getAtkeyword(), getAtrulerq()];

			pos++;

			atruler.push(getAtrulers());

			pos++;

			return atruler;
		}

		//atrulerq = tset*:ap -> [#atrulerq].concat(ap)
		function checkAtrulerq(_i) {
			return checkTsets(_i);
		}

		function getAtrulerq() {
			return createToken(NodeType.AtrulerqType).concat(getTsets());
		}

		//atrulers = sc*:s0 ruleset*:r sc*:s1 -> this.concat([#atrulers], s0, r, s1)
		function checkAtrulers(_i) {
			var start = _i,
				l;

			if (l = checkSC(_i)) _i += l;

			while ((l = checkRuleset(_i)) || (l = checkAtrule(_i)) || (l = checkSC(_i))) {
				_i += l;
			}

			tokens[_i].atrulers_end = 1;

			if (l = checkSC(_i)) _i += l;

			return _i - start;
		}

		function getAtrulers() {
			var atrulers = createToken(NodeType.AtrulersType).concat(getSC());

			while (!tokens[pos].atrulers_end) {
				if (checkSC(pos)) {
					atrulers = atrulers.concat(getSC());
				} else if (checkRuleset(pos)) {
					atrulers.push(getRuleset());
				} else {
					atrulers.push(getAtrule());
				}
			}

			return atrulers.concat(getSC());
		}

		//atrules = atkeyword:ak tset*:ap ';' -> this.concat([#atrules, ak], ap)
		function checkAtrules(_i) {
			var start = _i,
				l;

			if (l = checkAtkeyword(_i)) _i += l;
			else return fail(tokens[_i]);

			if (l = checkTsets(_i)) _i += l;

			if (_i >= tokens.length) return _i - start;

			if (tokens[_i].type === TokenType.Semicolon) _i++;
			else return fail(tokens[_i]);

			return _i - start;
		}

		function getAtrules() {
			var atrules = (needInfo? [getInfo(pos), NodeType.AtrulesType, getAtkeyword()] : [NodeType.AtrulesType, getAtkeyword()]).concat(getTsets());

			pos++;

			return atrules;
		}

		//block = '{' blockdecl*:x '}' -> this.concatContent([#block], x)
		function checkBlock(_i) {
			if (_i < tokens.length && tokens[_i].type === TokenType.LeftCurlyBracket) return tokens[_i].right - _i + 1;

			return fail(tokens[_i]);
		}

		function getBlock() {
			var block = createToken(NodeType.BlockType);
			var end = tokens[pos].right;

			pos++;

			while (pos < end) {
				if (checkBlockdecl(pos)) block = block.concat(getBlockdecl());
				else throwError();
			}

			pos = end + 1;

			return block;
		}

		//blockdecl = sc*:s0 (filter | declaration):x decldelim:y sc*:s1 -> this.concat(s0, [x], [y], s1)
		//          | sc*:s0 (filter | declaration):x sc*:s1 -> this.concat(s0, [x], s1)
		//          | sc*:s0 decldelim:x sc*:s1 -> this.concat(s0, [x], s1)
		//          | sc+:s0 -> s0

		function checkBlockdecl(_i) {
			var l;

			if (l = _checkBlockdecl0(_i)) tokens[_i].bd_type = 1;
			else if (l = _checkBlockdecl1(_i)) tokens[_i].bd_type = 2;
			else if (l = _checkBlockdecl2(_i)) tokens[_i].bd_type = 3;
			else if (l = _checkBlockdecl3(_i)) tokens[_i].bd_type = 4;
			else return fail(tokens[_i]);

			return l;
		}

		function getBlockdecl() {
			switch (tokens[pos].bd_type) {
				case 1: return _getBlockdecl0();
				case 2: return _getBlockdecl1();
				case 3: return _getBlockdecl2();
				case 4: return _getBlockdecl3();
			}
		}

		//sc*:s0 (filter | declaration):x decldelim:y sc*:s1 -> this.concat(s0, [x], [y], s1)
		function _checkBlockdecl0(_i) {
			var start = _i,
				l;

			if (l = checkSC(_i)) _i += l;

			if (l = checkFilter(_i)) {
				tokens[_i].bd_filter = 1;
				_i += l;
			} else if (l = checkDeclaration(_i)) {
				tokens[_i].bd_decl = 1;
				_i += l;
			} else return fail(tokens[_i]);

			if (_i < tokens.length && (l = checkDecldelim(_i))) _i += l;
			else return fail(tokens[_i]);

			if (l = checkSC(_i)) _i += l;

			return _i - start;
		}

		function _getBlockdecl0() {
			return getSC()
					.concat([tokens[pos].bd_filter? getFilter() : getDeclaration()])
					.concat([getDecldelim()])
					.concat(getSC());
		}

		//sc*:s0 (filter | declaration):x sc*:s1 -> this.concat(s0, [x], s1)
		function _checkBlockdecl1(_i) {
			var start = _i,
				l;

			if (l = checkSC(_i)) _i += l;

			if (l = checkFilter(_i)) {
				tokens[_i].bd_filter = 1;
				_i += l;
			} else if (l = checkDeclaration(_i)) {
				tokens[_i].bd_decl = 1;
				_i += l;
			} else return fail(tokens[_i]);

			if (l = checkSC(_i)) _i += l;

			return _i - start;
		}

		function _getBlockdecl1() {
			return getSC()
					.concat([tokens[pos].bd_filter? getFilter() : getDeclaration()])
					.concat(getSC());
		}

		//sc*:s0 decldelim:x sc*:s1 -> this.concat(s0, [x], s1)
		function _checkBlockdecl2(_i) {
			var start = _i,
				l;

			if (l = checkSC(_i)) _i += l;

			if (l = checkDecldelim(_i)) _i += l;
			else return fail(tokens[_i]);

			if (l = checkSC(_i)) _i += l;

			return _i - start;
		}

		function _getBlockdecl2() {
			return getSC()
					 .concat([getDecldelim()])
					 .concat(getSC());
		}

		//sc+:s0 -> s0
		function _checkBlockdecl3(_i) {
			return checkSC(_i);
		}

		function _getBlockdecl3() {
			return getSC();
		}

		//braces = '(' tset*:x ')' -> this.concat([#braces, '(', ')'], x)
		//       | '[' tset*:x ']' -> this.concat([#braces, '[', ']'], x)
		function checkBraces(_i) {
			if (_i >= tokens.length ||
				(tokens[_i].type !== TokenType.LeftParenthesis &&
				 tokens[_i].type !== TokenType.LeftSquareBracket)
				) return fail(tokens[_i]);

			return tokens[_i].right - _i + 1;
		}

		function getBraces() {
			var startPos = pos,
				left = pos,
				right = tokens[pos].right;

			pos++;

			var tsets = getTsets();

			pos++;

			return needInfo?
					[getInfo(startPos), NodeType.BracesType, tokens[left].value, tokens[right].value].concat(tsets) :
					[NodeType.BracesType, tokens[left].value, tokens[right].value].concat(tsets);
		}

		// node: Clazz
		function checkClazz(_i) {
			var token = tokens[_i];
			var l;

			if (token.clazz_l) return token.clazz_l;

			if (token.type === TokenType.FullStop) {
				// otherwise it's converts to dimension and some part of selector lost (issue 99)
				if (tokens[_i + 1].type === 'DecimalNumber' &&
					!/\D/.test(tokens[_i + 1].value)) {
					_i++;
				}

				if (l = checkIdent(_i + 1)) {
					token.clazz_l = l + 1;
					return l + 1;
				}
			}

			return fail(token);
		}

		function getClazz() {
			var startPos = pos;
			var clazz_l = pos + tokens[pos].clazz_l;
			pos++;
			var ident = createToken(NodeType.IdentType).concat(joinValues(pos, clazz_l - 1));

			pos = clazz_l;

			return needInfo?
					[getInfo(startPos), NodeType.ClazzType, ident] :
					[NodeType.ClazzType, ident];
		}

		// node: Combinator
		function checkCombinator(_i) {
			if (tokens[_i].type === TokenType.PlusSign ||
				tokens[_i].type === TokenType.GreaterThanSign ||
				tokens[_i].type === TokenType.Deep ||
				tokens[_i].type === TokenType.Tilde) return 1;

			return fail(tokens[_i]);
		}

		function getCombinator() {
			return needInfo?
					[getInfo(pos), NodeType.CombinatorType, tokens[pos++].value] :
					[NodeType.CombinatorType, tokens[pos++].value];
		}

		// node: Comment
		function checkComment(_i) {
			if (tokens[_i].type === TokenType.CommentML) return 1;

			return fail(tokens[_i]);
		}

		function getComment() {
			var startPos = pos,
				s = tokens[pos].value.substring(2),
				l = s.length;

			if (s.charAt(l - 2) === '*' && s.charAt(l - 1) === '/') s = s.substring(0, l - 2);

			pos++;

			return needInfo?
					[getInfo(startPos), NodeType.CommentType, s] :
					[NodeType.CommentType, s];
		}

		// declaration = property:x ':' value:y -> [#declaration, x, y]
		function checkDeclaration(_i) {
			var start = _i,
				l;

			if (l = checkProperty(_i)) _i += l;
			else return fail(tokens[_i]);

			if (_i < tokens.length && tokens[_i].type === TokenType.Colon) _i++;
			else return fail(tokens[_i]);

			if (l = checkValue(_i)) _i += l;
			else return fail(tokens[_i]);

			return _i - start;
		}

		function getDeclaration() {
			var declaration = needInfo?
					[getInfo(pos), NodeType.DeclarationType, getProperty()] :
					[NodeType.DeclarationType, getProperty()];

			pos++;

			declaration.push(getValue());

			return declaration;
		}

		// node: Decldelim
		function checkDecldelim(_i) {
			if (_i < tokens.length && tokens[_i].type === TokenType.Semicolon) return 1;

			return fail(tokens[_i]);
		}

		function getDecldelim() {
			var startPos = pos;

			pos++;

			return needInfo?
					[getInfo(startPos), NodeType.DecldelimType] :
					[NodeType.DecldelimType];
		}

		// node: Delim
		function checkDelim(_i) {
			if (_i < tokens.length && tokens[_i].type === TokenType.Comma) return 1;

			if (_i >= tokens.length) return fail(tokens[tokens.length - 1]);

			return fail(tokens[_i]);
		}

		function getDelim() {
			var startPos = pos;

			pos++;

			return needInfo?
					[getInfo(startPos), NodeType.DelimType] :
					[NodeType.DelimType];
		}

		// node: Dimension
		function checkDimension(_i) {
			var ln = checkNumber(_i),
				li;

			if (!ln || (ln && _i + ln >= tokens.length)) return fail(tokens[_i]);

			if (li = checkNmName2(_i + ln)) return ln + li;

			return fail(tokens[_i]);
		}

		function getDimension() {
			var startPos = pos,
				n = getNumber(),
				dimension = needInfo ?
					[getInfo(pos), NodeType.IdentType, getNmName2()] :
					[NodeType.IdentType, getNmName2()];

			return needInfo?
					[getInfo(startPos), NodeType.DimensionType, n, dimension] :
					[NodeType.DimensionType, n, dimension];
		}

		//filter = filterp:x ':' filterv:y -> [#filter, x, y]
		function checkFilter(_i) {
			var start = _i,
				l;

			if (l = checkFilterp(_i)) _i += l;
			else return fail(tokens[_i]);

			if (tokens[_i].type === TokenType.Colon) _i++;
			else return fail(tokens[_i]);

			if (l = checkFilterv(_i)) _i += l;
			else return fail(tokens[_i]);

			return _i - start;
		}

		function getFilter() {
			var filter = needInfo?
					[getInfo(pos), NodeType.FilterType, getFilterp()] :
					[NodeType.FilterType, getFilterp()];

			pos++;

			filter.push(getFilterv());

			return filter;
		}

		//filterp = (seq('-filter') | seq('_filter') | seq('*filter') | seq('-ms-filter') | seq('filter')):t sc*:s0 -> this.concat([#property, [#ident, t]], s0)
		function checkFilterp(_i) {
			var start = _i,
				l,
				x;

			if (_i < tokens.length) {
				if (tokens[_i].value === 'filter') l = 1;
				else {
					x = joinValues2(_i, 2);

					if (x === '-filter' || x === '_filter' || x === '*filter') l = 2;
					else {
						x = joinValues2(_i, 4);

						if (x === '-ms-filter') l = 4;
						else return fail(tokens[_i]);
					}
				}

				tokens[start].filterp_l = l;

				_i += l;

				if (checkSC(_i)) _i += l;

				return _i - start;
			}

			return fail(tokens[_i]);
		}

		function getFilterp() {
			var startPos = pos,
				x = joinValues2(pos, tokens[pos].filterp_l),
				ident = needInfo? [getInfo(startPos), NodeType.IdentType, x] : [NodeType.IdentType, x];

			pos += tokens[pos].filterp_l;

			return (needInfo? [getInfo(startPos), NodeType.PropertyType, ident] : [NodeType.PropertyType, ident])
						.concat(getSC());

		}

		//filterv = progid+:x -> [#filterv].concat(x)
		function checkFilterv(_i) {
			var start = _i,
				l;

			if (l = checkProgid(_i)) _i += l;
			else return fail(tokens[_i]);

			while (l = checkProgid(_i)) {
				_i += l;
			}

			tokens[start].last_progid = _i;

			if (_i < tokens.length && (l = checkSC(_i))) _i += l;

			if (_i < tokens.length && (l = checkImportant(_i))) _i += l;

			return _i - start;
		}

		function getFilterv() {
			var filterv = createToken(NodeType.FiltervType);
			var last_progid = tokens[pos].last_progid;

			while (pos < last_progid) {
				filterv.push(getProgid());
			}

			filterv = filterv.concat(checkSC(pos) ? getSC() : []);

			if (pos < tokens.length && checkImportant(pos)) filterv.push(getImportant());

			return filterv;
		}

		//functionExpression = ``expression('' functionExpressionBody*:x ')' -> [#functionExpression, x.join('')],
		function checkFunctionExpression(_i) {
			var start = _i;

			if (!tokens[_i] || tokens[_i++].value !== 'expression') return fail(tokens[_i - 1]);

			if (!tokens[_i] || tokens[_i].type !== TokenType.LeftParenthesis) return fail(tokens[_i]);

			return tokens[_i].right - start + 1;
		}

		function getFunctionExpression() {
			var startPos = pos;

			pos++;

			var e = joinValues(pos + 1, tokens[pos].right - 1);

			pos = tokens[pos].right + 1;

			return needInfo?
					[getInfo(startPos), NodeType.FunctionExpressionType, e] :
					[NodeType.FunctionExpressionType, e];
		}

		//funktion = ident:x '(' functionBody:y ')' -> [#funktion, x, y]
		function checkFunktion(_i) {
			var start = _i,
				l = checkIdent(_i);

			if (!l) return fail(tokens[_i]);

			_i += l;

			if (_i >= tokens.length || tokens[_i].type !== TokenType.LeftParenthesis) return fail(tokens[_i - 1]);

			return tokens[_i].right - start + 1;
		}

		function getFunktion() {
			var startPos = pos,
				ident = getIdent();

			pos++;

			var body = ident[needInfo? 2 : 1] !== 'not'?
				getFunctionBody() :
				getNotFunctionBody(); // ok, here we have CSS3 initial draft: http://dev.w3.org/csswg/selectors3/#negation

			return needInfo?
					[getInfo(startPos), NodeType.FunktionType, ident, body] :
					[NodeType.FunktionType, ident, body];
		}

		function getFunctionBody() {
			var startPos = pos,
				body = [],
				x;

			while (tokens[pos].type !== TokenType.RightParenthesis) {
				if (checkTset(pos)) {
					x = getTset();
					if ((needInfo && typeof x[1] === 'string') || typeof x[0] === 'string') body.push(x);
					else body = body.concat(x);
				} else if (checkClazz(pos)) {
					body.push(getClazz());
				} else {
					throwError();
				}
			}

			pos++;

			return (needInfo?
						[getInfo(startPos), NodeType.FunctionBodyType] :
						[NodeType.FunctionBodyType]
					).concat(body);
		}

		function getNotFunctionBody() {
			var startPos = pos,
				body = [];

			while (tokens[pos].type !== TokenType.RightParenthesis) {
				if (checkSimpleselector(pos)) {
					body.push(getSimpleSelector());
				} else {
					throwError();
				}
			}

			pos++;

			return (needInfo?
						[getInfo(startPos), NodeType.FunctionBodyType] :
						[NodeType.FunctionBodyType]
					).concat(body);
		}

		function getUnicodeRange(i, tryNext) {
			var hex = '';

			for (;i < tokens.length; i++) {
				if (tokens[i].type !== TokenType.DecimalNumber &&
					tokens[i].type !== TokenType.Identifier) {
					break;
				}

				hex += tokens[i].value
			}

			if (/^[0-9a-f]{1,6}$/i.test(hex)) {
				// U+abc???
				if (tryNext) {
					for (;hex.length < 6 && i < tokens.length; i++) {
						if (tokens[i].type !== TokenType.QuestionMark) {
							break;
						}

						hex += tokens[i].value
						tryNext = false;
					}
				}

				// U+aaa-bbb
				if (tryNext) {
					if (tokens[i] && tokens[i].type === TokenType.HyphenMinus) {
						var next = getUnicodeRange(i + 1);
						if (next) {
							return next;
						}
					}
				}

				return i;
			}
		}

		// node: Ident
		function checkIdent(_i, attribute) {
			if (_i >= tokens.length) return fail(tokens[_i]);

			var start = _i,
				wasIdent = false;

			// unicode-range-token
			if (tokens[_i].type === TokenType.Identifier &&
				(tokens[_i].value === 'U' || tokens[_i].value === 'u') &&
				tokens[_i + 1].type === TokenType.PlusSign) {
				var unicodeRange = getUnicodeRange(_i + 2, true);
				if (unicodeRange) {
					tokens[start].ident_last = unicodeRange - 1;
					return unicodeRange + 2;
				}
			}

			if (tokens[_i].type === TokenType.LowLine) return checkIdentLowLine(_i, attribute);

			// start char / word
			if (tokens[_i].type === TokenType.HyphenMinus ||
				tokens[_i].type === TokenType.Identifier ||
				tokens[_i].type === TokenType.DollarSign ||
				tokens[_i].type === TokenType.Asterisk) _i++;
			else return fail(tokens[_i]);

			wasIdent = tokens[_i - 1].type === TokenType.Identifier;

			for (; _i < tokens.length; _i++) {
				if (tokens[_i].type !== TokenType.HyphenMinus &&
					tokens[_i].type !== TokenType.LowLine) {
						if (tokens[_i].type !== TokenType.Identifier &&
							(!attribute || tokens[_i].type !== TokenType.Colon) &&
							(!wasIdent || tokens[_i].type !== TokenType.DecimalNumber)
							) break;
						else wasIdent = true;
				}
			}

			if (!wasIdent && tokens[start].type !== TokenType.Asterisk) return fail(tokens[_i]);

			tokens[start].ident_last = _i - 1;

			return _i - start;
		}

		function checkIdentLowLine(_i, attribute) {
			var start = _i;

			_i++;

			for (; _i < tokens.length; _i++) {
				if (tokens[_i].type !== TokenType.HyphenMinus &&
					tokens[_i].type !== TokenType.DecimalNumber &&
					tokens[_i].type !== TokenType.LowLine &&
					tokens[_i].type !== TokenType.Identifier &&
					(!attribute || tokens[_i].type !== TokenType.Colon)) break;
			}

			tokens[start].ident_last = _i - 1;

			return _i - start;
		}

		function getIdent() {
			var startPos = pos,
				s = joinValues(pos, tokens[pos].ident_last);

			pos = tokens[pos].ident_last + 1;

			return needInfo?
					[getInfo(startPos), NodeType.IdentType, s] :
					[NodeType.IdentType, s];
		}

		//important = '!' sc*:s0 seq('important') -> [#important].concat(s0)
		function checkImportant(_i) {
			var start = _i,
				l;

			if (tokens[_i++].type !== TokenType.ExclamationMark) return fail(tokens[_i - 1]);

			if (l = checkSC(_i)) _i += l;

			if (tokens[_i].value.toLowerCase() !== 'important') return fail(tokens[_i]);

			return _i - start + 1;
		}

		function getImportant() {
			var startPos = pos;

			pos++;

			var sc = getSC();

			pos++;

			return (needInfo? [getInfo(startPos), NodeType.ImportantType] : [NodeType.ImportantType]).concat(sc);
		}

		// node: Namespace
		function checkNamespace(_i) {
			if (tokens[_i].type === TokenType.VerticalLine) return 1;

			return fail(tokens[_i]);
		}

		function getNamespace() {
			var startPos = pos;

			pos++;

			return needInfo?
					[getInfo(startPos), NodeType.NamespaceType] :
					[NodeType.NamespaceType];
		}

		//nth = (digit | 'n')+:x -> [#nth, x.join('')]
		//    | (seq('even') | seq('odd')):x -> [#nth, x]
		function checkNth(_i) {
			return checkNth1(_i) || checkNth2(_i);
		}

		function checkNth1(_i) {
			var start = _i;

			for (; _i < tokens.length; _i++) {
				if (tokens[_i].type !== TokenType.DecimalNumber && tokens[_i].value !== 'n') break;
			}

			if (_i !== start) {
				tokens[start].nth_last = _i - 1;
				return _i - start;
			}

			return fail(tokens[_i]);
		}

		function getNth() {
			var startPos = pos;

			if (tokens[pos].nth_last) {
				var n = needInfo?
							[getInfo(startPos), NodeType.NthType, joinValues(pos, tokens[pos].nth_last)] :
							[NodeType.NthType, joinValues(pos, tokens[pos].nth_last)];

				pos = tokens[pos].nth_last + 1;

				return n;
			}

			return needInfo?
					[getInfo(startPos), NodeType.NthType, tokens[pos++].value] :
					[NodeType.NthType, tokens[pos++].value];
		}

		function checkNth2(_i) {
			if (tokens[_i].value === 'even' || tokens[_i].value === 'odd') return 1;

			return fail(tokens[_i]);
		}

		//nthf = ':' seq('nth-'):x (seq('child') | seq('last-child') | seq('of-type') | seq('last-of-type')):y -> (x + y)
		function checkNthf(_i) {
			var start = _i,
				l = 0;

			if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]); l++;

			if (tokens[_i++].value !== 'nth' || tokens[_i++].value !== '-') return fail(tokens[_i - 1]); l += 2;

			if ('child' === tokens[_i].value) {
				l += 1;
			} else if ('last-child' === tokens[_i].value +
										tokens[_i + 1].value +
										tokens[_i + 2].value) {
				l += 3;
			} else if ('of-type' === tokens[_i].value +
									 tokens[_i + 1].value +
									 tokens[_i + 2].value) {
				l += 3;
			} else if ('last-of-type' === tokens[_i].value +
										  tokens[_i + 1].value +
										  tokens[_i + 2].value +
										  tokens[_i + 3].value +
										  tokens[_i + 4].value) {
				l += 5;
			} else return fail(tokens[_i]);

			tokens[start + 1].nthf_last = start + l - 1;

			return l;
		}

		function getNthf() {
			pos++;

			var s = joinValues(pos, tokens[pos].nthf_last);

			pos = tokens[pos].nthf_last + 1;

			return s;
		}

		//nthselector = nthf:x '(' (sc | unary | nth)*:y ')' -> [#nthselector, [#ident, x]].concat(y)
		function checkNthselector(_i) {
			var start = _i,
				l;

			if (l = checkNthf(_i)) _i += l;
			else return fail(tokens[_i]);

			if (tokens[_i].type !== TokenType.LeftParenthesis || !tokens[_i].right) return fail(tokens[_i]);

			l++;

			var rp = tokens[_i++].right;

			while (_i < rp) {
				if (l = checkSC(_i)) _i += l;
				else if (l = checkUnary(_i)) _i += l;
				else if (l = checkNth(_i)) _i += l;
				else return fail(tokens[_i]);
			}

			return rp - start + 1;
		}

		function getNthselector() {
			var nthf = needInfo?
						[getInfo(pos), NodeType.IdentType, getNthf()] :
						[NodeType.IdentType, getNthf()],
				ns = needInfo?
						[getInfo(pos), NodeType.NthselectorType, nthf] :
						[NodeType.NthselectorType, nthf];

			pos++;

			while (tokens[pos].type !== TokenType.RightParenthesis) {
				if (checkSC(pos)) ns = ns.concat(getSC());
				else if (checkUnary(pos)) ns.push(getUnary());
				else if (checkNth(pos)) ns.push(getNth());
			}

			pos++;

			return ns;
		}

		// node: Number
		function checkNumber(_i) {
			if (_i < tokens.length && tokens[_i].number_l) return tokens[_i].number_l;

			if (_i < tokens.length && tokens[_i].type === TokenType.DecimalNumber &&
				(!tokens[_i + 1] ||
				 (tokens[_i + 1] && tokens[_i + 1].type !== TokenType.FullStop))
			) return (tokens[_i].number_l = 1, tokens[_i].number_l); // 10

			if (_i < tokens.length &&
				 tokens[_i].type === TokenType.DecimalNumber &&
				 tokens[_i + 1] && tokens[_i + 1].type === TokenType.FullStop &&
				 (!tokens[_i + 2] || (tokens[_i + 2].type !== TokenType.DecimalNumber))
			) return (tokens[_i].number_l = 2, tokens[_i].number_l); // 10.

			if (_i < tokens.length &&
				tokens[_i].type === TokenType.FullStop &&
				tokens[_i + 1].type === TokenType.DecimalNumber
			) return (tokens[_i].number_l = 2, tokens[_i].number_l); // .10

			if (_i < tokens.length &&
				tokens[_i].type === TokenType.DecimalNumber &&
				tokens[_i + 1] && tokens[_i + 1].type === TokenType.FullStop &&
				tokens[_i + 2] && tokens[_i + 2].type === TokenType.DecimalNumber
			) return (tokens[_i].number_l = 3, tokens[_i].number_l); // 10.10

			return fail(tokens[_i]);
		}

		function getNumber() {
			var s = '',
				startPos = pos,
				l = tokens[pos].number_l;

			for (var i = 0; i < l; i++) {
				s += tokens[pos + i].value;
			}

			pos += l;

			return needInfo?
					[getInfo(startPos), NodeType.NumberType, s] :
					[NodeType.NumberType, s];
		}

		// node: Operator
		function checkOperator(_i) {
			if (_i < tokens.length &&
				(tokens[_i].type === TokenType.Solidus ||
				tokens[_i].type === TokenType.Comma ||
				tokens[_i].type === TokenType.Colon ||
				tokens[_i].type === TokenType.EqualsSign)) return 1;

			return fail(tokens[_i]);
		}

		function getOperator() {
			return needInfo?
					[getInfo(pos), NodeType.OperatorType, tokens[pos++].value] :
					[NodeType.OperatorType, tokens[pos++].value];
		}

		// node: Percentage
		function checkPercentage(_i) {
			var x = checkNumber(_i);

			if (!x || (x && _i + x >= tokens.length)) return fail(tokens[_i]);

			if (tokens[_i + x].type === TokenType.PercentSign) return x + 1;

			return fail(tokens[_i]);
		}

		function getPercentage() {
			var startPos = pos,
				n = getNumber();

			pos++;

			return needInfo?
					[getInfo(startPos), NodeType.PercentageType, n] :
					[NodeType.PercentageType, n];
		}

		//progid = sc*:s0 seq('progid:DXImageTransform.Microsoft.'):x letter+:y '(' (m_string | m_comment | ~')' char)+:z ')' sc*:s1
		//                -> this.concat([#progid], s0, [[#raw, x + y.join('') + '(' + z.join('') + ')']], s1),
		function checkProgid(_i) {
			var start = _i,
				l,
				x;

			if (l = checkSC(_i)) _i += l;

			if ((x = joinValues2(_i, 6)) === 'progid:DXImageTransform.Microsoft.') {
				_i += 6;
			} else return fail(tokens[_i - 1]);

			if (l = checkIdent(_i)) _i += l;
			else return fail(tokens[_i]);

			if (l = checkSC(_i)) _i += l;

			if (tokens[_i].type === TokenType.LeftParenthesis) {
				tokens[start].progid_end = tokens[_i].right;
				_i = tokens[_i].right + 1;
			} else return fail(tokens[_i]);

			if (l = checkSC(_i)) _i += l;

			return _i - start;
		}

		function getProgid() {
			var startPos = pos,
				progid_end = tokens[pos].progid_end;

			return (needInfo? [getInfo(startPos), NodeType.ProgidType] : [NodeType.ProgidType])
					.concat(getSC())
					.concat([_getProgid(progid_end)])
					.concat(getSC());
		}

		function _getProgid(progid_end) {
			var startPos = pos,
				x = joinValues(pos, progid_end);

			pos = progid_end + 1;

			return needInfo?
					[getInfo(startPos), NodeType.RawType, x] :
					[NodeType.RawType, x];
		}

		//property = ident:x sc*:s0 -> this.concat([#property, x], s0)
		function checkProperty(_i) {
			var start = _i,
				l;

			if (l = checkIdent(_i)) _i += l;
			else return fail(tokens[_i]);

			if (l = checkSC(_i)) _i += l;
			return _i - start;
		}

		function getProperty() {
			var startPos = pos;

			return (needInfo?
					[getInfo(startPos), NodeType.PropertyType, getIdent()] :
					[NodeType.PropertyType, getIdent()])
				.concat(getSC());
		}

		function checkPseudo(_i) {
			return checkPseudoe(_i) ||
				   checkPseudoc(_i);
		}

		function getPseudo() {
			if (checkPseudoe(pos)) return getPseudoe();
			if (checkPseudoc(pos)) return getPseudoc();
		}

		function checkPseudoe(_i) {
			var l;

			if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]);

			if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]);

			if (l = checkIdent(_i)) return l + 2;

			return fail(tokens[_i]);
		}

		function getPseudoe() {
			var startPos = pos;

			pos += 2;

			return needInfo?
					[getInfo(startPos), NodeType.PseudoeType, getIdent()] :
					[NodeType.PseudoeType, getIdent()];
		}

		//pseudoc = ':' (funktion | ident):x -> [#pseudoc, x]
		function checkPseudoc(_i) {
			var l;

			if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]);

			if ((l = checkFunktion(_i)) || (l = checkIdent(_i))) return l + 1;

			return fail(tokens[_i]);
		}

		function getPseudoc() {
			var startPos = pos;

			pos++;

			return needInfo?
					[getInfo(startPos), NodeType.PseudocType, checkFunktion(pos)? getFunktion() : getIdent()] :
					[NodeType.PseudocType, checkFunktion(pos)? getFunktion() : getIdent()];
		}

		//ruleset = selector*:x block:y -> this.concat([#ruleset], x, [y])
		function checkRuleset(_i) {
			var start = _i,
				l;

			if (tokens[start].ruleset_l !== undefined) return tokens[start].ruleset_l;

			while (l = checkSelector(_i)) {
				_i += l;
			}

			if (l = checkBlock(_i)) _i += l;
			else return fail(tokens[_i]);

			tokens[start].ruleset_l = _i - start;

			return _i - start;
		}

		function getRuleset() {
			var ruleset = createToken(NodeType.RulesetType);

			while (!checkBlock(pos)) {
				ruleset.push(getSelector());
			}

			ruleset.push(getBlock());

			return ruleset;
		}

		// node: S
		function checkS(_i) {
			if (tokens[_i].type === TokenType.Space) {
				return 1;
			}

			return fail(tokens[_i]);
		}

		function getS() {
			var startPos = pos,
				s = tokens[pos].value;

			pos++;

			return needInfo? [getInfo(startPos), NodeType.SType, s] : [NodeType.SType, s];
		}

		function checkSC(_i) {
			var l,
				lsc = 0;

			while (_i < tokens.length) {
				if (!(l = checkS(_i)) && !(l = checkComment(_i))) break;
				_i += l;
				lsc += l;
			}

			if (lsc) return lsc;

			if (_i >= tokens.length) return fail(tokens[tokens.length - 1]);

			return fail(tokens[_i]);
		}

		function getSC() {
			var sc = [];

			while (pos < tokens.length) {
				if (checkS(pos)) sc.push(getS());
				else if (checkComment(pos)) sc.push(getComment());
				else break;
			}

			return sc;
		}

		//selector = (simpleselector | delim)+:x -> this.concat([#selector], x)
		function checkSelector(_i) {
			var start = _i,
				l;

			if (_i < tokens.length) {
				while (l = checkSimpleselector(_i) || checkDelim(_i)) {
					_i += l;
				}

				tokens[start].selector_end = _i - 1;

				return _i - start;
			}
		}

		function getSelector() {
			var selector = createToken(NodeType.SelectorType);
			var selector_end = tokens[pos].selector_end;

			while (pos <= selector_end) {
				selector.push(checkDelim(pos) ? getDelim() : getSimpleSelector());
			}

			return selector;
		}

		// node: Shash
		function checkShash(_i) {
			if (tokens[_i].type !== TokenType.NumberSign) return fail(tokens[_i]);

			var l = checkNmName(_i + 1);

			if (l) return l + 1;

			return fail(tokens[_i]);
		}

		function getShash() {
			var startPos = pos;

			pos++;

			return needInfo?
					[getInfo(startPos), NodeType.ShashType, getNmName()] :
					[NodeType.ShashType, getNmName()];
		}

		//simpleselector = (nthselector | combinator | attrib | pseudo | clazz | shash | any | sc | namespace)+:x -> this.concatContent([#simpleselector], [x])
		function checkSimpleselector(_i) {
			var start = _i,
				l;

			while (_i < tokens.length) {
				if (l = _checkSimpleSelector(_i)) _i += l;
				else break;
			}

			if (_i - start) return _i - start;

			if (_i >= tokens.length) return fail(tokens[tokens.length - 1]);

			return fail(tokens[_i]);
		}

		function _checkSimpleSelector(_i) {
			return checkNthselector(_i) ||
				   checkCombinator(_i) ||
				   checkAttrib(_i) ||
				   checkPseudo(_i) ||
				   checkClazz(_i) ||
				   checkShash(_i) ||
				   checkAny(_i) ||
				   checkSC(_i) ||
				   checkNamespace(_i);
		}

		function getSimpleSelector() {
			var ss = createToken(NodeType.SimpleselectorType);
			var t;

			while (pos < tokens.length && _checkSimpleSelector(pos)) {
				t = _getSimpleSelector();

				if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') ss.push(t);
				else ss = ss.concat(t);
			}

			return ss;
		}

		function _getSimpleSelector() {
			if (checkNthselector(pos)) return getNthselector();
			else if (checkCombinator(pos)) return getCombinator();
			else if (checkAttrib(pos)) return getAttrib();
			else if (checkPseudo(pos)) return getPseudo();
			else if (checkClazz(pos)) return getClazz();
			else if (checkShash(pos)) return getShash();
			else if (checkAny(pos)) return getAny();
			else if (checkSC(pos)) return getSC();
			else if (checkNamespace(pos)) return getNamespace();
		}

		// node: String
		function checkString(_i) {
			if (_i < tokens.length &&
				(tokens[_i].type === TokenType.StringSQ || tokens[_i].type === TokenType.StringDQ)
			) return 1;

			return fail(tokens[_i]);
		}

		function getString() {
			var startPos = pos;

			return needInfo?
					[getInfo(startPos), NodeType.StringType, tokens[pos++].value] :
					[NodeType.StringType, tokens[pos++].value];
		}

		//stylesheet = (cdo | cdc | sc | statement)*:x -> this.concat([#stylesheet], x)
		function checkStylesheet(_i) {
			var start = _i,
				l;

			while (_i < tokens.length) {
				if (l = checkSC(_i)) _i += l;
				else {
					currentBlockLN = tokens[_i].line;
					if (l = checkAtrule(_i)) _i += l;
					else if (l = checkRuleset(_i)) _i += l;
					else if (l = checkUnknown(_i)) _i += l;
					else throwError();
				}
			}

			return _i - start;
		}

		function getStylesheet() {
			var stylesheet = createToken(NodeType.StylesheetType);

			while (pos < tokens.length) {
				if (checkSC(pos)) stylesheet = stylesheet.concat(getSC());
				else {
					currentBlockLN = tokens[pos].line;
					if (checkRuleset(pos)) stylesheet.push(getRuleset());
					else if (checkAtrule(pos)) stylesheet.push(getAtrule());
					else if (checkUnknown(pos)) stylesheet.push(getUnknown());
					else throwError();
				}
			}

			return stylesheet;
		}

		//tset = vhash | any | sc | operator
		function checkTset(_i) {
			return checkVhash(_i) ||
				   checkAny(_i) ||
				   checkSC(_i) ||
				   checkOperator(_i);
		}

		function getTset() {
			if (checkVhash(pos)) return getVhash();
			else if (checkAny(pos)) return getAny();
			else if (checkSC(pos)) return getSC();
			else if (checkOperator(pos)) return getOperator();
		}

		function checkTsets(_i) {
			var start = _i,
				l;

			while (l = checkTset(_i)) {
				_i += l;
			}

			return _i - start;
		}

		function getTsets() {
			var tsets = [],
				x;

			while (x = getTset()) {
				if ((needInfo && typeof x[1] === 'string') || typeof x[0] === 'string') tsets.push(x);
				else tsets = tsets.concat(x);
			}

			return tsets;
		}

		// node: Unary
		function checkUnary(_i) {
			if (_i < tokens.length &&
				(tokens[_i].type === TokenType.HyphenMinus ||
				tokens[_i].type === TokenType.PlusSign)
			) return 1;

			return fail(tokens[_i]);
		}

		function getUnary() {
			var startPos = pos;

			return needInfo?
					[getInfo(startPos), NodeType.UnaryType, tokens[pos++].value] :
					[NodeType.UnaryType, tokens[pos++].value];
		}

		// node: Unknown
		function checkUnknown(_i) {
			if (_i < tokens.length && tokens[_i].type === TokenType.CommentSL) return 1;

			return fail(tokens[_i]);
		}

		function getUnknown() {
			var startPos = pos;

			return needInfo?
					[getInfo(startPos), NodeType.UnknownType, tokens[pos++].value] :
					[NodeType.UnknownType, tokens[pos++].value];
		}

		//    uri = seq('url(') sc*:s0 string:x sc*:s1 ')' -> this.concat([#uri], s0, [x], s1)
		//        | seq('url(') sc*:s0 (~')' ~m_w char)*:x sc*:s1 ')' -> this.concat([#uri], s0, [[#raw, x.join('')]], s1),
		function checkUri(_i) {
			var start = _i;

			if (_i < tokens.length && tokens[_i++].value !== 'url') return fail(tokens[_i - 1]);

			if (!tokens[_i] || tokens[_i].type !== TokenType.LeftParenthesis) return fail(tokens[_i]);

			return tokens[_i].right - start + 1;
		}

		function getUri() {
			var startPos = pos;

			pos += 2;

			if (checkUri1(pos)) {
				var uri = (needInfo? [getInfo(startPos), NodeType.UriType] : [NodeType.UriType])
							.concat(getSC())
							.concat([getString()])
							.concat(getSC());

				pos++;

				return uri;
			} else {
				var uri = (needInfo? [getInfo(startPos), NodeType.UriType] : [NodeType.UriType])
							.concat(getSC()),
					l = checkExcluding(pos),
					raw = needInfo?
							[getInfo(pos), NodeType.RawType, joinValues(pos, pos + l)] :
							[NodeType.RawType, joinValues(pos, pos + l)];

				uri.push(raw);

				pos += l + 1;

				uri = uri.concat(getSC());

				pos++;

				return uri;
			}
		}

		function checkUri1(_i) {
			var start = _i,
				l = checkSC(_i);

			if (l) _i += l;

			if (tokens[_i].type !== TokenType.StringDQ && tokens[_i].type !== TokenType.StringSQ) return fail(tokens[_i]);

			_i++;

			if (l = checkSC(_i)) _i += l;

			return _i - start;
		}

		// value = (sc | vhash | any | block | atkeyword | operator | important)+:x -> this.concat([#value], x)
		function checkValue(_i) {
			var start = _i,
				l;

			while (_i < tokens.length) {
				if (l = _checkValue(_i)) _i += l;
				else break;
			}

			if (_i - start) return _i - start;

			return fail(tokens[_i]);
		}

		function _checkValue(_i) {
			return checkSC(_i) ||
				   checkVhash(_i) ||
				   checkAny(_i) ||
				   checkBlock(_i) ||
				   checkAtkeyword(_i) ||
				   checkOperator(_i) ||
				   checkImportant(_i);
		}

		function getValue() {
			var ss = createToken(NodeType.ValueType);
			var t;

			while (pos < tokens.length && _checkValue(pos)) {
				t = _getValue();

				if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') ss.push(t);
				else ss = ss.concat(t);
			}

			return ss;
		}

		function _getValue() {
			if (checkSC(pos)) return getSC();
			else if (checkVhash(pos)) return getVhash();
			else if (checkAny(pos)) return getAny();
			else if (checkBlock(pos)) return getBlock();
			else if (checkAtkeyword(pos)) return getAtkeyword();
			else if (checkOperator(pos)) return getOperator();
			else if (checkImportant(pos)) return getImportant();
		}

		// node: Vhash
		function checkVhash(_i) {
			if (_i >= tokens.length || tokens[_i].type !== TokenType.NumberSign) return fail(tokens[_i]);

			var l = checkNmName2(_i + 1);

			if (l) return l + 1;

			return fail(tokens[_i]);
		}

		function getVhash() {
			var startPos = pos;

			pos++;

			return needInfo?
					[getInfo(startPos), NodeType.VhashType, getNmName2()] :
					[NodeType.VhashType, getNmName2()];
		}

		function checkNmName(_i) {
			var start = _i;

			// start char / word
			if (tokens[_i].type === TokenType.HyphenMinus ||
				tokens[_i].type === TokenType.LowLine ||
				tokens[_i].type === TokenType.Identifier ||
				tokens[_i].type === TokenType.DecimalNumber) _i++;
			else return fail(tokens[_i]);

			for (; _i < tokens.length; _i++) {
				if (tokens[_i].type !== TokenType.HyphenMinus &&
					tokens[_i].type !== TokenType.LowLine &&
					tokens[_i].type !== TokenType.Identifier &&
					tokens[_i].type !== TokenType.DecimalNumber) break;
			}

			tokens[start].nm_name_last = _i - 1;

			return _i - start;
		}

		function getNmName() {
			var s = joinValues(pos, tokens[pos].nm_name_last);

			pos = tokens[pos].nm_name_last + 1;

			return s;
		}

		function checkNmName2(_i) {
			if (tokens[_i].type === TokenType.Identifier) return 1;
			else if (tokens[_i].type !== TokenType.DecimalNumber) return fail(tokens[_i]);

			_i++;

			if (!tokens[_i] || tokens[_i].type !== TokenType.Identifier) return 1;

			return 2;
		}

		function getNmName2() {
			var s = tokens[pos].value;

			if (tokens[pos++].type === TokenType.DecimalNumber &&
					pos < tokens.length &&
					tokens[pos].type === TokenType.Identifier
			) s += tokens[pos++].value;

			return s;
		}

		function checkExcluding( _i) {
			var start = _i;

			while(_i < tokens.length) {
				var type = tokens[_i++].type;

				if (type === TokenType.Space ||
					type === TokenType.LeftParenthesis ||
					type === TokenType.RightParenthesis) {
					break;
				}
			}

			return _i - start - 2;
		}

		function joinValues(start, finish) {
			var s = '';

			for (var i = start; i <= finish; i++) {
				s += tokens[i].value;
			}

			return s;
		}

		function joinValues2(start, num) {
			if (start + num - 1 >= tokens.length) {
				return;
			}

			var s = '';

			for (var i = 0; i < num; i++) {
				s += tokens[start + i].value;
			}

			return s;
		}

		function parse(source, rule, _needInfo) {
			tokens = tokenize(source);
			rule = rule || 'stylesheet';
			needInfo = _needInfo;
			pos = 0;
			failLN = 0;

			var ast = CSSPRules[rule]();
			//console.log(require('../utils/stringify.js')(require('../utils/cleanInfo.js')(ast), true));
			return ast;
		};

		return parse;
	};
	//#endregion
	
	//#region URL: /parser/const
	modules['/parser/const'] = function () {
		var exports = {
			StringSQ: 'StringSQ',
			StringDQ: 'StringDQ',
			CommentML: 'CommentML',
			CommentSL: 'CommentSL',

			Newline: 'Newline',
			Space: 'Space',
			Tab: 'Tab',

			ExclamationMark: 'ExclamationMark',         // !
			QuotationMark: 'QuotationMark',             // "
			NumberSign: 'NumberSign',                   // #
			DollarSign: 'DollarSign',                   // $
			PercentSign: 'PercentSign',                 // %
			Ampersand: 'Ampersand',                     // &
			Apostrophe: 'Apostrophe',                   // '
			LeftParenthesis: 'LeftParenthesis',         // (
			RightParenthesis: 'RightParenthesis',       // )
			Asterisk: 'Asterisk',                       // *
			PlusSign: 'PlusSign',                       // +
			Comma: 'Comma',                             // ,
			HyphenMinus: 'HyphenMinus',                 // -
			FullStop: 'FullStop',                       // .
			Solidus: 'Solidus',                         // /
			Colon: 'Colon',                             // :
			Semicolon: 'Semicolon',                     // ;
			LessThanSign: 'LessThanSign',               // <
			EqualsSign: 'EqualsSign',                   // =
			GreaterThanSign: 'GreaterThanSign',         // >
			QuestionMark: 'QuestionMark',               // ?
			CommercialAt: 'CommercialAt',               // @
			LeftSquareBracket: 'LeftSquareBracket',     // [
			ReverseSolidus: 'ReverseSolidus',           // \
			RightSquareBracket: 'RightSquareBracket',   // ]
			CircumflexAccent: 'CircumflexAccent',       // ^
			LowLine: 'LowLine',                         // _
			LeftCurlyBracket: 'LeftCurlyBracket',       // {
			VerticalLine: 'VerticalLine',               // |
			RightCurlyBracket: 'RightCurlyBracket',     // }
			Tilde: 'Tilde',                             // ~
			Deep: 'Deep',                               // /deep/

			Identifier: 'Identifier',
			DecimalNumber: 'DecimalNumber'
		};
		
		return exports;
	};
	//#endregion
	
	//#region URL: /parser/tokenize
	modules['/parser/tokenize'] = function () {
		var TokenType = require('/parser/const');
		var pos;
		var lineStartPos;
		var ln;

		var Punctuation = {
			' ': TokenType.Space,
			'\n': TokenType.Newline,
			'\r': TokenType.Newline,
			'\t': TokenType.Tab,
			'!': TokenType.ExclamationMark,
			'"': TokenType.QuotationMark,
			'#': TokenType.NumberSign,
			'$': TokenType.DollarSign,
			'%': TokenType.PercentSign,
			'&': TokenType.Ampersand,
			'\'': TokenType.Apostrophe,
			'(': TokenType.LeftParenthesis,
			')': TokenType.RightParenthesis,
			'*': TokenType.Asterisk,
			'+': TokenType.PlusSign,
			',': TokenType.Comma,
			'-': TokenType.HyphenMinus,
			'.': TokenType.FullStop,
			'/': TokenType.Solidus,
			':': TokenType.Colon,
			';': TokenType.Semicolon,
			'<': TokenType.LessThanSign,
			'=': TokenType.EqualsSign,
			'>': TokenType.GreaterThanSign,
			'?': TokenType.QuestionMark,
			'@': TokenType.CommercialAt,
			'[': TokenType.LeftSquareBracket,
			']': TokenType.RightSquareBracket,
			'^': TokenType.CircumflexAccent,
			'_': TokenType.LowLine,
			'{': TokenType.LeftCurlyBracket,
			'|': TokenType.VerticalLine,
			'}': TokenType.RightCurlyBracket,
			'~': TokenType.Tilde
		};

		function isDecimalDigit(c) {
			return '0123456789'.indexOf(c) !== -1;
		}

		function tokenize(s) {
			function pushToken(type, ln, column, value) {
				tokens.push(x = {
					type: type,
					value: value,

					offset: lastPos,
					line: ln,
					column: column
				});

				lastPos = pos;
			}

			if (!s) {
				return [];
			}

			var tokens = [];
			var urlMode = false;

			// ignore first char if it is byte order marker (UTF-8 BOM)
			pos = s.charCodeAt(0) === 0xFEFF ? 1 : 0;
			var lastPos = pos;
			ln = 1;
			lineStartPos = -1;

			var blockMode = 0;
			var c;
			var cn;
			var ident;

			for (; pos < s.length; pos++) {
				c = s.charAt(pos);
				cn = s.charAt(pos + 1);

				if (c === '/' && cn === '*') {
					pushToken(TokenType.CommentML, ln, pos - lineStartPos, parseMLComment(s));
				} else if (!urlMode && c === '/' && s.substr(pos + 1, 5) === 'deep/') {
					pushToken(TokenType.Deep, ln, pos - lineStartPos, '/deep/');
					pos += 5;
				} else if (!urlMode && c === '/' && cn === '/') {
					if (blockMode > 0) {
						pushToken(TokenType.Identifier, ln, pos - lineStartPos, ident = parseIdentifier(s));
						urlMode = urlMode || ident === 'url';
					} else {
						pushToken(TokenType.CommentSL, ln, pos - lineStartPos, parseSLComment(s));
					}
				} else if (c === '"' || c === "'") {
					pushToken(c === '"' ? TokenType.StringDQ : TokenType.StringSQ, ln, pos - lineStartPos, parseString(s, c));
				} else if (c === ' ' || c === '\n' || c === '\r' || c === '\t') {
					pushToken(TokenType.Space, ln, pos - lineStartPos, parseSpaces(s));
				} else if (c in Punctuation) {
					pushToken(Punctuation[c], ln, pos - lineStartPos, c);
					if (c === ')') {
						urlMode = false;
					}
					if (c === '{') {
						blockMode++;
					}
					if (c === '}') {
						blockMode--;
					}
				} else if (isDecimalDigit(c)) {
					pushToken(TokenType.DecimalNumber, ln, pos - lineStartPos, parseDecimalNumber(s));
				} else {
					pushToken(TokenType.Identifier, ln, pos - lineStartPos, ident = parseIdentifier(s));
					urlMode = urlMode || ident === 'url';
				}
			}

			mark(tokens);

			return tokens;
		}

		function parseSpaces(s) {
			var start = pos;

			for (; pos < s.length; pos++) {
				var c = s.charAt(pos);
				if (c === '\n') {
					ln++;
					lineStartPos = pos;
				} else if (c !== ' ' && c !== '\r' && c !== '\t') {
					break;
				}
			}

			pos--;
			return s.substring(start, pos + 1);
		}

		function parseMLComment(s) {
			var start = pos;

			for (pos = pos + 2; pos < s.length; pos++) {
				if (s.charAt(pos) === '*') {
					if (s.charAt(pos + 1) === '/') {
						pos++;
						break;
					}
				}
				if (s.charAt(pos) === '\n') {
					ln++;
					lineStartPos = pos;
				}
			}

			return s.substring(start, pos + 1);
		}

		function parseSLComment(s) {
			var start = pos;

			for (pos = pos + 2; pos < s.length; pos++) {
				if (s.charAt(pos) === '\n' || s.charAt(pos) === '\r') {
					pos++;
					break;
				}
			}

			pos--;
			return s.substring(start, pos + 1);
		}

		function parseString(s, q) {
			var start = pos;

			for (pos = pos + 1; pos < s.length; pos++) {
				if (s.charAt(pos) === '\\') {
					pos++;
				} else if (s.charAt(pos) === q) {
					break;
				}
			}

			return s.substring(start, pos + 1);
		}

		function parseDecimalNumber(s) {
			var start = pos;

			for (; pos < s.length; pos++) {
				if (!isDecimalDigit(s.charAt(pos))) {
					break;
				}
			}

			pos--;
			return s.substring(start, pos + 1);
		}

		function parseIdentifier(s) {
			var start = pos;

			while (s.charAt(pos) === '/') {
				pos++;
			}

			for (; pos < s.length; pos++) {
				c = s.charAt(pos);
				if (c === '\\') {
					pos++;
				} else if (c in Punctuation && c !== '_') {
					break;
				}
			}

			pos--;

			return s.substring(start, pos + 1);
		}

		// ====================================
		// second run
		// ====================================

		function mark(tokens) {
			var ps = []; // Parenthesis
			var sbs = []; // SquareBracket
			var cbs = []; // CurlyBracket

			for (var i = 0, t; i < tokens.length; i++) {
				t = tokens[i];
				switch (t.type) {
					case TokenType.LeftParenthesis:
						ps.push(i);
						break;
					case TokenType.RightParenthesis:
						if (ps.length) {
							tokens[ps.pop()].right = i;
						}
						break;
					case TokenType.LeftSquareBracket:
						sbs.push(i);
						break;
					case TokenType.RightSquareBracket:
						if (sbs.length) {
							tokens[sbs.pop()].right = i;
						}
						break;
					case TokenType.LeftCurlyBracket:
						cbs.push(i);
						break;
					case TokenType.RightCurlyBracket:
						if (cbs.length) {
							tokens[cbs.pop()].right = i;
						}
						break;
				}
			}
		}

		return tokenize;
	};
	//#endregion
	
	//#region URL: /utils/cleanInfo
	modules['/utils/cleanInfo'] = function () {
		function cleanInfo(tree) {
			var res = tree.slice(1);

			for (var i = 1, token; token = res[i]; i++) {
				if (Array.isArray(token)) {
					res[i] = cleanInfo(token);
				}
			}

			return res;
		};
		
		return cleanInfo;
	};
	//#endregion
	
	//#region URL: /utils/stringify
	modules['/utils/stringify'] = function () {
		function indent(num) {
			return new Array(num + 1).join('  ');
		}

		function escape(str) {
			return str
				.replace(/\\/g, '\\\\')
				.replace(/\r/g, '\\r')
				.replace(/\n/g, '\\n')
				.replace(/\t/g, '\\t')
				.replace(/"/g, '\\"');
		}

		function stringify(val, level) {
			level = level || 0;

			if (typeof val == 'string') {
				return '"' + escape(val) + '"';
			}

			if (val && val.constructor === Object) {
				var body = Object.keys(val).map(function(k) {
					return indent(level + 1) + '"' + escape(k) + '": ' + stringify(val[k], level + 1);
				}).join(',\n');

				return '{' + (body ? '\n' + body + '\n' + indent(level) : '') + '}';
			}

			if (Array.isArray(val)) {
				var join = true;
				var body = val.map(function(item, idx) {
					var prefix = idx ? ' ' : '';

					if (Array.isArray(item) && (!join || !item.some(Array.isArray))) {
						prefix = '\n' + indent(level + 1);
						join = false;
					}

					return prefix + stringify(item, level + 1);
				}).join(',');

				if (/\n/.test(body)) {
					body =
						'\n' + indent(level + 1) +
						body +
						'\n' + indent(level);
				}

				return '[' + body + ']';
			}

			return String(val);
		};
		
		return stringify;
	};
	//#endregion
	
	//#region URL: /utils/translate
	modules['/utils/translate'] = function () {
		var useInfo;
		var buffer;
		var typeHandlers = {
			unary: simple,
			nth: simple,
			combinator: simple,
			ident: simple,
			number: simple,
			s: simple,
			string: simple,
			attrselector: simple,
			operator: simple,
			raw: simple,
			unknown: simple,

			simpleselector: composite,
			dimension: composite,
			selector: composite,
			property: composite,
			value: composite,
			filterv: composite,
			progid: composite,
			ruleset: composite,
			atruleb: composite,
			atrulerq: composite,
			atrulers: composite,
			stylesheet: composite,

			percentage: percentage,
			comment: comment,
			clazz: clazz,
			atkeyword: atkeyword,
			shash: shash,
			vhash: vhash,
			attrib: attrib,
			important: important,
			nthselector: nthselector,
			funktion: funktion,
			declaration: declaration,
			filter: filter,
			block: block,
			braces: braces,
			atrules: atrules,
			atruler: atruler,
			pseudoe: pseudoe,
			pseudoc: pseudoc,
			uri: uri,
			functionExpression: functionExpression,

			cdo: function() {
				buffer.push('cdo');
			},
			cdc: function() {
				buffer.push('cdc');
			},
			decldelim: function() {
				buffer.push(';');
			},
			namespace: function() {
				buffer.push('|');
			},
			delim: function() {
				buffer.push(',');
			}
		};

		function simple(token) {
			buffer.push(token[useInfo + 1]);
		}

		function composite(token) {
			for (var i = useInfo + 1; i < token.length; i++) {
				translate(token[i]);
			}
		}

		function compositeFrom(token, i) {
			for (; i < token.length; i++) {
				translate(token[i]);
			}
		}

		function percentage(token) {
			translate(token[useInfo + 1]);
			buffer.push('%');
		}

		function comment(token) {
			buffer.push('/*', token[useInfo + 1], '*/');
		}

		function clazz(token) {
			buffer.push('.');
			translate(token[useInfo + 1]);
		}

		function atkeyword(token) {
			buffer.push('@');
			translate(token[useInfo + 1]);
		}

		function shash(token) {
			buffer.push('#', token[useInfo + 1]);
		}

		function vhash(token) {
			buffer.push('#', token[useInfo + 1]);
		}

		function attrib(token) {
			buffer.push('[');
			composite(token);
			buffer.push(']');
		}

		function important(token) {
			buffer.push('!');
			composite(token);
			buffer.push('important');
		}

		function nthselector(token) {
			buffer.push(':');
			simple(token[useInfo + 1]);
			buffer.push('(');
			compositeFrom(token, useInfo + 2);
			buffer.push(')');
		}

		function funktion(token) {
			simple(token[useInfo + 1]);
			buffer.push('(');
			composite(token[useInfo + 2]);
			buffer.push(')');
		}

		function declaration(token) {
			translate(token[useInfo + 1]);
			buffer.push(':');
			translate(token[useInfo + 2]);
		}

		function filter(token) {
			translate(token[useInfo + 1]);
			buffer.push(':');
			translate(token[useInfo + 2]);
		}

		function block(token) {
			buffer.push('{');
			composite(token);
			buffer.push('}');
		}

		function braces(token) {
			buffer.push(token[useInfo + 1]);
			compositeFrom(token, useInfo + 3);
			buffer.push(token[useInfo + 2]);
		}

		function atrules(token) {
			composite(token);
			buffer.push(';');
		}

		function atruler(token) {
			translate(token[useInfo + 1]);
			translate(token[useInfo + 2]);
			buffer.push('{');
			translate(token[useInfo + 3]);
			buffer.push('}');
		}

		function pseudoe(token) {
			buffer.push('::');
			translate(token[useInfo + 1]);
		}

		function pseudoc(token) {
			buffer.push(':');
			translate(token[useInfo + 1]);
		}

		function uri(token) {
			buffer.push('url(');
			composite(token);
			buffer.push(')');
		}

		function functionExpression(token) {
			buffer.push('expression(', token[useInfo + 1], ')');
		}

		function translate(token) {
			typeHandlers[token[useInfo]](token);
		}

		var exports = function(tree, hasInfo) {
			useInfo = hasInfo ? 1 : 0;
			buffer = [];

			translate(tree);

			return buffer.join('');
		};
		
		return exports;
	};
	//#endregion	

	//#region URL: /
	modules['/'] = function () {
		var parse = require('/parser');
		var compress = require('/compressor');
		var translate = require('/utils/translate');
		var stringify = require('/utils/stringify');
		var cleanInfo = require('/utils/cleanInfo');

//		var justDoIt = function(src, noStructureOptimizations, needInfo) {
//			console.warn('`csso.justDoIt()` method is deprecated, use `csso.minify()` instead');
//
//			var ast = parse(src, 'stylesheet', needInfo);
//			var compressed = compress(ast, {
//				restructuring: !noStructureOptimizations
//			});
//			return translate(compressed, true);
//		};

		var minify = function(src, options) {
			var ast = parse(src, 'stylesheet', true);
			var compressed = compress(ast, options);
			return translate(compressed, true);
		};

		var exports = {
			// main method
			minify: minify,

			// utils
			parse: parse,
			compress: compress,
			translate: translate,

			stringify: stringify,
			cleanInfo: cleanInfo,

//			// deprecated
//			justDoIt: justDoIt
		};
		
		return exports;
	};
	//#endregion
	
	return require('/');
})();