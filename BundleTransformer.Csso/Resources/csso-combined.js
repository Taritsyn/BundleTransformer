/*!
* CSSO (CSS Optimizer) v1.5.3
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
		var convertToInternal = require('/compressor/ast/gonzalesToInternal');
		var convertToGonzales = require('/compressor/ast/internalToGonzales');
		var internalTranslate = require('/compressor/ast/translate');
		var internalWalkAll = require('/compressor/ast/walk').all;
		var cleanFn = require('/compressor/clean');
		var compressFn = require('/compressor/compress');
		var restructureAst = require('/compressor/restructure');

//		function createLogger(level) {
//			var lastDebug;
//
//			if (!level) {
//				// no output
//				return function() {};
//			}
//
//			return function debugOutput(name, token, reset) {
//				var line = (!reset ? '(' + ((Date.now() - lastDebug) / 1000).toFixed(3) + 'ms) ' : '') + name;
//
//				if (level > 1 && token) {
//					var css = internalTranslate(token, true).trim();
//
//					// when level 2, limit css to 256 symbols
//					if (level === 2 && css.length > 256) {
//						css = css.substr(0, 256) + '...';
//					}
//
//					line += '\n  ' + css + '\n';
//				}
//
//				console.error(line);
//				lastDebug = Date.now();
//			};
//		};

		function injectInfo(token) {
			for (var i = token.length - 1; i > -1; i--) {
				var child = token[i];

				if (Array.isArray(child)) {
					injectInfo(child);
					child.unshift({});
				}
			}
		}

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

		function compressBlock(ast, restructuring, num/*, debug*/) {
			function walk(name, fn) {
				internalWalkAll(internalAst, fn);

//				debug(name, internalAst);
			}

//			debug('Compress block #' + num, null, true);

			var internalAst = convertToInternal(ast);
//			debug('convertToInternal', internalAst);

			internalAst.firstAtrulesAllowed = ast.firstAtrulesAllowed;
			walk('clean', cleanFn);
			walk('compress', compressFn);

			// structure optimisations
			if (restructuring) {
				restructureAst(internalAst/*, debug*/);
			}

			return internalAst;
		}

		var exports = function compress(ast, options) {
			ast = ast || [{}, 'stylesheet'];
			options = options || {};

//			var debug = createLogger(options.debug);
			var restructuring = options.restructuring || options.restructuring === undefined;
			var result = [];
			var block = { offset: 2 };
			var firstAtrulesAllowed = true;
			var blockNum = 1;

			if (typeof ast[0] === 'string') {
				injectInfo([ast]);
			}

			do {
				block = readBlock(ast, block.offset);
				block.stylesheet.firstAtrulesAllowed = firstAtrulesAllowed;
				block.stylesheet = compressBlock(block.stylesheet, restructuring, blockNum++/*, debug*/);

				if (block.comment) {
					// add \n before comment if there is another content in result
					if (result.length) {
						result.push({
							type: 'Raw',
							value: '\n'
						});
					}

					result.push({
						type: 'Comment',
						value: block.comment[2]
					});

					// add \n after comment if block is not empty
					if (block.stylesheet.rules.length) {
						result.push({
							type: 'Raw',
							value: '\n'
						});
					}
				}

				result.push.apply(result, block.stylesheet.rules);

				if (firstAtrulesAllowed && result.length) {
					var lastRule = result[result.length - 1];

					if (lastRule.type !== 'Atrule' ||
					   (lastRule.name !== 'import' && lastRule.name !== 'charset')) {
						firstAtrulesAllowed = false;
					}
				}
			} while (block.offset < ast.length);

			if (!options.outputAst || options.outputAst === 'gonzales') {
				return convertToGonzales({
					type: 'StyleSheet',
					rules: result
				});
			}

			return {
				type: 'StyleSheet',
				rules: result
			};
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/ast/gonzalesToInternal
	modules['/compressor/ast/gonzalesToInternal'] = function () {
		var StyleSheet = function(token) {
			return {
				type: 'StyleSheet',
				info: token[0],
				rules: token.filter(function(item, idx) {
					return idx >= 2 &&
						   item[1] !== 's' &&
						   item[1] !== 'comment' &&
						   item[1] !== 'unknown';
				}).map(convertToInternal)
			};
		};

		function skipSC(token, offset) {
			for (; offset < token.length; offset++) {
				var type = token[offset][1];
				if (type !== 's' && type !== 'comment') {
					break;
				}
			}

			return offset;
		}

		function trimSC(token, start, end) {
			start = skipSC(token, start);
			for (; end >= start; end--) {
				var type = token[end][1];
				if (type !== 's' && type !== 'comment') {
					break;
				}
			}

			if (end < start) {
				return [];
			}

			return token
				.slice(start, end + 1)
				.map(convertToInternal)
				.filter(Boolean);
		}

		function argumentList(token) {
			var result = [];
			var args = token;
			var start = 2;

			for (var i = start; i < args.length; i++) {
				if (args[i][1] === 'operator' && args[i][2] === ',') {
					result.push({
						type: 'Argument',
						info: {},
						sequence: trimSC(args, start, i - 1)
					});
					start = i + 1;
				}
			}

			var lastArg = trimSC(args, start, args.length - 1);
			if (lastArg.length || result.length) {
				result.push({
					type: 'Argument',
					info: {},
					sequence: lastArg
				});
			}

			return result;
		}

		var types = {
			atkeyword: false,
			atruleb: function(token) {
				return {
					type: 'Atrule',
					info: token[0],
					name: token[2][2][2],
					expression: {
						type: 'AtruleExpression',
						info: {},
						sequence: trimSC(token, 3, token.length - 2)
					},
					block: convertToInternal(token[token.length - 1])
				};
			},
			atruler: function(token) {
				return {
					type: 'Atrule',
					info: token[0],
					name: token[2][2][2],
					expression: convertToInternal(token[3]),
					block: convertToInternal(token[4])
				};
			},
			atrulerq: function(token) {
				return {
					type: 'AtruleExpression',
					info: token[0],
					sequence: trimSC(token, 2, token.length - 1)
				};
			},
			atrulers: StyleSheet,
			atrules: function(token) {
				return {
					type: 'Atrule',
					info: token[0],
					name: token[2][2][2],
					expression: {
						type: 'AtruleExpression',
						info: {},
						sequence: trimSC(token, 3, token.length - 1)
					},
					block: null
				};
			},
			attrib: function(token) {
				var offset = 2;

				offset = skipSC(token, 2);
				var name = convertToInternal(token[offset]);

				if (token[offset + 1] && token[offset + 1][1] === 'namespace') {
					name.name += '|' + token[offset + 2][2];
					offset += 2;
				}

				offset = skipSC(token, offset + 1);
				var operator = token[offset] ? token[offset][2] : null;

				offset = skipSC(token, offset + 1);
				var value = convertToInternal(token[offset]);

				return {
					type: 'Attribute',
					info: token[0],
					name: name,
					operator: operator,
					value: value
				};
			},
			attrselector: false,
			block: function(token) {
				return {
					type: 'Block',
					info: token[0],
					declarations: token.filter(function(item, idx) {
						return idx >= 2 && (item[1] === 'declaration' || item[1] === 'filter');
					}).map(convertToInternal)
				};
			},
			braces: function(token) {
				return {
					type: 'Braces',
					info: token[0],
					open: token[2],
					close: token[3],
					sequence: trimSC(token, 4, token.length - 1)
				};
			},
			clazz: function(token) {
				return {
					type: 'Class',
					info: token[0],
					name: token[2][2]
				};
			},
			combinator: function(token) {
				return {
					type: 'Combinator',
					info: token[0],
					name: token[2]
				};
			},
			comment: false,
			declaration: function(token) {
				return {
					type: 'Declaration',
					info: token[0],
					property: convertToInternal(token[2]),
					value: convertToInternal(token[3])
				};
			},
			decldelim: false, // redundant
			delim: false,     // redundant
			dimension: function(token) {
				return {
					type: 'Dimension',
					info: token[0],
					value: token[2][2],
					unit: token[3][2]
				};
			},
			filter: function(token) {
				return {
					type: 'Declaration',
					info: token[0],
					property: convertToInternal(token[2]),
					value: convertToInternal(token[3])
				};
			},
			filterv: function(token) {
				return {
					type: 'Value',
					info: token[0],
					sequence: trimSC(token, 2, token.length - 1)
				};
			},
			functionExpression: function(token) {
				return {
					type: 'Function',
					name: 'expression',
					arguments: [{
						type: 'Argument',
						sequence: [{
							type: 'Raw',
							value: token[2]
						}]
					}]
				};
			},
			funktion: function(token) {
				return {
					type: 'Function',
					info: token[0],
					name: token[2][2],
					arguments: argumentList(token[3])
				};
			},
			functionBody: false,  // redundant
			ident: function(token) {
				return {
					type: 'Identifier',
					info: token[0],
					name: token[2]
				};
			},
			important: function(token) {
				return {
					type: 'Important',
					info: token[0]
				};
			},
			namespace: false,
			nth: function(token) {
				return {
					type: 'Nth',
					value: token[2]
				};
			},
			nthselector: function(token) {
				return {
					type: 'FunctionalPseudo',
					info: token[0],
					name: token[2][2],
					arguments: [{
						type: 'Argument',
						sequence: token.filter(function(item, idx) {
							return idx >= 3 && item[1] !== 's' && item[1] !== 'comment';
						}).map(convertToInternal)
					}]
				};
			},
			number: function(token) {
				return {
					type: 'Number',
					info: token[0],
					value: token[2]
				};
			},
			operator: function(token) {
				return {
					type: 'Operator',
					info: token[0],
					value: token[2]
				};
			},
			percentage: function(token) {
				return {
					type: 'Percentage',
					info: token[0],
					value: token[2][2]
				};
			},
			progid: function(token) {
				return {
					type: 'Progid',
					info: token[0],
					value: trimSC(token, 2, token.length - 1)[0]
				};
			},
			property: function(token) {
				return {
					type: 'Property',
					info: token[0],
					name: token[2][2]
				};
			},
			pseudoc: function(token) {
				var value = token[2];

				if (value[1] === 'funktion') {
					var name = value[2][2];

					if (name === 'not') {
						return {
							type: 'Negation',
							sequence: [
								types.simpleselector(value[3][2])
							]
						};
					}

					return {
						type: 'FunctionalPseudo',
						info: value[0],
						name: name,
						arguments: argumentList(value[3])
					};
				}

				return {
					type: 'PseudoClass',
					info: token[0],
					name: value[2]
				};
			},
			pseudoe: function(token) {
				var value = token[2];

				return {
					type: 'PseudoElement',
					info: token[0],
					name: value[2]
				};
			},
			raw: function(token) {
				return {
					type: 'Raw',
					info: token[0],
					value: token[2]
				};
			},
			ruleset: function(token) {
				var selector = convertToInternal(token[2]);
				var block;

				if (token.length === 4) {
					block = convertToInternal(token[3]);
				} else {
					block = selector;
					selector = null;
				}

				return {
					type: 'Ruleset',
					info: token[0],
					selector: selector,
					block: block
				};
			},
			s: function(token) {
				return {
					type: 'Space',
					info: token[0]
				};
			},
			selector: function(token) {
				var last = 'delim';
				var badSelector = false;
				var selectors = token.filter(function(item, idx) {
					var type = item[1];

					if (type === 'simpleselector' || type === 'delim') {
						if (last === type) {
							badSelector = true;
						}
						last = type;
					}

					return idx >= 2 && type === 'simpleselector';
				}).map(convertToInternal);

				// check selector is valid since gonzales parses selectors
				// like "foo," or "foo,,bar" as correct;
				// w/o this check broken selector will be repaired and broken ruleset apply;
				// return null in this case so compressor could remove ruleset with no selector
				if (badSelector ||
					last === 'delim' ||
					selectors.length === 0 ||
					selectors[selectors.length - 1].sequence.length === 0) {
					return null;
				}

				return {
					type: 'Selector',
					info: token[0],
					selectors: selectors
				};
			},
			shash: function(token) {
				return {
					type: 'Id',
					info: token[0],
					name: token[2]
				};
			},
			simpleselector: function(token) {
				var sequence = [];
				for (var i = skipSC(token, 2), needCombinator = false; i < token.length; i++) {
					var item = token[i];
					switch (item[1]) {
						case 'combinator':
							needCombinator = false;
							sequence.push(item);
							break;

						case 's':
							if (sequence[sequence.length - 1][1] !== 'combinator') {
								needCombinator = item;
							}
							break;

						case 'comment':
							break;

						case 'namespace':
							// ident namespace ident -> ident '|' ident
							sequence[sequence.length - 1] = [
								{},
								'ident',
								sequence[sequence.length - 1][2] + '|' + token[i + 1][2]
							];
							i++;
							break;

						default:
							if (needCombinator) {
								sequence.push([needCombinator[0], 'combinator', ' ']);
							}
							needCombinator = false;
							sequence.push(item);
					}
				}

				return {
					type: 'SimpleSelector',
					info: token[0],
					sequence: sequence.map(convertToInternal)
				};
			},
			string: function(token) {
				return {
					type: 'String',
					info: token[0],
					value: token[2]
				};
			},
			stylesheet: StyleSheet,
			unary: function(token) {
				return {
					type: 'Operator',
					info: token[0],
					value: token[2]
				};
			},
			unknown: false,
			uri: function(token) {
				return {
					type: 'Url',
					info: token[0],
					value: trimSC(token, 2, token.length - 1)[0]
				};
			},
			value: function(token) {
				return {
					type: 'Value',
					info: token[0],
					sequence: trimSC(token, 2, token.length - 1)
				};
			},
			vhash: function(token) {
				return {
					type: 'Hash',
					info: token[0],
					value: token[2]
				};
			}
		};

		function convertToInternal(token, parent, stack) {
			if (token) {
				var type = token[1];

				if (types.hasOwnProperty(type) && typeof types[type] === 'function') {
					return types[type](token);
				}
			}

			return null;
		}
		
		return convertToInternal;
	};
	//#endregion
	
	//#region URL: /compressor/ast/internalToGonzales
	modules['/compressor/ast/internalToGonzales'] = function () {
		function eachDelim(node, type, itemsProperty, delimeter) {
			var result = [node.info, type];
			var items = node[itemsProperty];

			for (var i = 0; i < items.length; i++) {
				result.push(toGonzales(items[i]));

				if (i !== items.length - 1) {
					result.push(delimeter.slice());
				}
			}

			return result;
		}

		function buildArguments(body, args) {
			for (var i = 0; i < args.length; i++) {
				body.push.apply(body, args[i].sequence.map(toGonzales));
				if (i !== args.length - 1) {
					body.push([{}, 'operator', ',']);
				}
			}
		}

		function toGonzales(node) {
			switch (node.type) {
				case 'StyleSheet':
					return [
						node.info || {},
						'stylesheet'
					].concat(node.rules.map(toGonzales).filter(Boolean));

				case 'Atrule':
					var type = 'atruler';

					if (!node.block) {
						type = 'atrules';
					} else {
						if (node.block.type === 'Block') {
							type = 'atruleb';
						}
					}

					var result = [
						node.info,
						type,
						[{}, 'atkeyword', [{}, 'ident', node.name]]
					];

					if (node.expression && node.expression.sequence.length) {
						if (type === 'atruler') {
							result.push([
								node.expression.info,
								'atrulerq',
								[{}, 's', ' ']
							].concat(node.expression.sequence.map(toGonzales)));
						} else {
							result.push([{}, 's', ' ']);
							result = result.concat(node.expression.sequence.map(toGonzales));
						}
					} else {
						if (type === 'atruler') {
							result.push([
								{},
								'atrulerq'
							]);
						}
					}

					if (node.block) {
						if (type === 'atruler') {
							result.push([
								node.block.info,
								'atrulers'
							].concat(node.block.rules.map(toGonzales)));
						} else {
							result.push(toGonzales(node.block));
						}
					}

					return result;

				case 'Ruleset':
					return node.selector
						? [
							node.info,
							'ruleset',
							toGonzales(node.selector),
							toGonzales(node.block)
						]
						: [
							node.info,
							'ruleset',
							toGonzales(node.block)
						];

				case 'Selector':
					return eachDelim(node, 'selector', 'selectors', [{}, 'delim']);

				case 'SimpleSelector':
					var result = [
						node.info,
						'simpleselector'
					];

					node.sequence.forEach(function(item) {
						item = toGonzales(item);
						if (item[1] === 'ident' && /\|/.test(item[2])) {
							result.push(
								[{}, 'ident', item[2].split('|')[0]],
								[{}, 'namespace'],
								[{}, 'ident', item[2].split('|')[1]]
							);
						} else {
							result.push(item);
						}
					});

					return result;

				case 'Negation':
					var body = eachDelim(node, 'functionBody', 'sequence', [{}, 'delim']);

					return [
						node.info,
						'pseudoc',
						[
							{},
							'funktion',
							[{}, 'ident', 'not'],
							body
						]
					];

				case 'Attribute':
					var result = [
						node.info,
						'attrib'
					];

					if (/\|/.test(node.name.name)) {
						result = result.concat([
							[{}, 'ident', node.name.name.split('|')[0]],
							[{}, 'namespace'],
							[{}, 'ident', node.name.name.split('|')[1]]
						]);
					} else {
						result.push([{}, 'ident', node.name.name]);
					}

					if (node.operator) {
						result.push([{}, 'attrselector', node.operator]);
					}
					if (node.value) {
						result.push(toGonzales(node.value));
					}
					return result;

				case 'FunctionalPseudo':
					if (/^nth-/.test(node.name)) {
						var result = [
							node.info,
							'nthselector',
							[{}, 'ident', node.name]
						];

						buildArguments(result, node.arguments);

						return result;
					} else {
						var body = [
							{},
							'functionBody'
						];

						buildArguments(body, node.arguments);

						return [
							node.info,
							'pseudoc',
							[
								{},
								'funktion',
								[{}, 'ident', node.name],
								body
							]
						];
					}

				case 'Function':
					var body = [
						{},
						'functionBody'
					];

					buildArguments(body, node.arguments);

					if (node.name === 'expression') {
						return [{}, 'functionExpression', body[2][2]];
					}

					return [
						node.info,
						'funktion',
						[{}, 'ident', node.name],
						body
					];

				case 'Argument':
					return;

				case 'Block':
					return eachDelim(node, 'block', 'declarations', [{}, 'decldelim']);

				case 'Declaration':
					return [
						node.info,
						node.value.sequence.length &&
						node.value.sequence[0].type === 'Progid' &&
						/(-[a-z]+-|[\*-_])?filter$/.test(node.property.name)
							? 'filter'
							: 'declaration',
						toGonzales(node.property),
						toGonzales(node.value)
					];

				case 'Braces':
					return [
						node.info,
						'braces',
						node.open,
						node.close
					].concat(node.sequence.map(toGonzales));

				// case 'AtruleExpression':

				case 'Value':
					return [
						node.info,
						node.sequence.length &&
						node.sequence[0].type === 'Progid'
							? 'filterv'
							: 'value'
					].concat(node.sequence.map(toGonzales));

				case 'Url':
					return [node.info, 'uri', toGonzales(node.value)];

				case 'Progid':
					return [node.info, 'progid', toGonzales(node.value)];

				case 'Property':
					return [node.info, 'property', [{}, 'ident', node.name]];

				case 'Combinator':
					return node.name === ' '
						? [node.info, 's', node.name]
						: [node.info, 'combinator', node.name];

				case 'Identifier':
					return [node.info, 'ident', node.name];

				case 'PseudoElement':
					return [node.info, 'pseudoe', [{}, 'ident', node.name]];

				case 'PseudoClass':
					return [node.info, 'pseudoc', [{}, 'ident', node.name]];

				case 'Class':
					return [node.info, 'clazz', [{}, 'ident', node.name]];

				case 'Id':
					return [node.info, 'shash', node.name];

				case 'Nth':
					return [node.info, 'nth', node.value];

				case 'Hash':
					return [node.info, 'vhash', node.value];

				case 'Number':
					return [node.info, 'number', node.value];

				case 'Dimension':
					return [
						node.info,
						'dimension',
						[{}, 'number', node.value],
						[{}, 'ident', node.unit]
					];

				case 'Operator':
					return [
						node.info,
						node.value === '+' || node.value === '-' ? 'unary' : 'operator',
						node.value
					];

				case 'Raw':
					return [node.info, node.value && /\S/.test(node.value) ? 'raw' : 's', node.value];

				case 'String':
					return [node.info, 'string', node.value];

				case 'Important':
					return [node.info, 'important'];

				case 'Percentage':
					return [node.info, 'percentage', [{}, 'number', node.value]];

				case 'Space':
					return [node.info, 's', ' '];

				case 'Comment':
					return [node.info, 'comment', node.value];

				default:
					console.warn('Unknown node type:', node);
			}
		}

		var exports = function(node) {
			return node ? toGonzales(node) : [];
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/ast/translate
	modules['/compressor/ast/translate'] = function () {
		function each(array, buffer) {
			for (var i = 0; i < array.length; i++) {
				translate(array[i], buffer, array, i);
			}
		}

		function eachDelim(array, buffer, delimeter) {
			for (var i = 0; i < array.length; i++) {
				translate(array[i], buffer, array, i);

				if (i !== array.length - 1) {
					buffer.push(delimeter);
				}
			}
		}

		function translate(node, buffer, array, i) {
			switch (node.type) {
				case 'Atrule':
					buffer.push('@', node.name);
					if (node.expression && node.expression.sequence.length) {
						buffer.push(' ');
						translate(node.expression, buffer);
					}
					if (node.block) {
						buffer.push('{');
						translate(node.block, buffer);
						buffer.push('}');
					} else {
						buffer.push(';');
					}
					break;

				case 'Declaration':
					translate(node.property, buffer);
					buffer.push(':');
					translate(node.value, buffer);
					break;

				case 'Attribute':
					buffer.push('[');
					translate(node.name, buffer);
					if (node.operator) {
						buffer.push(node.operator);
					}
					if (node.value) {
						translate(node.value, buffer);
					}
					buffer.push(']');
					break;

				case 'FunctionalPseudo':
					buffer.push(':', node.name, '(');
					eachDelim(node.arguments, buffer, ',');
					buffer.push(')');
					break;

				case 'Function':
					buffer.push(node.name, '(');
					eachDelim(node.arguments, buffer, ',');
					buffer.push(')');
					break;

				case 'Block':
					eachDelim(node.declarations, buffer, ';');
					break;

				case 'Ruleset':
					if (node.selector) {
						translate(node.selector, buffer);
					}
					buffer.push('{');
					translate(node.block, buffer);
					buffer.push('}');
					break;

				case 'Selector':
					eachDelim(node.selectors, buffer, ',');
					break;

				case 'Negation':
					buffer.push(':not(');
					eachDelim(node.sequence, buffer, ',');
					buffer.push(')');
					break;

				case 'Braces':
					buffer.push(node.open);
					each(node.sequence, buffer);
					buffer.push(node.close);
					break;

				case 'Argument':
				case 'AtruleExpression':
				case 'Value':
				case 'SimpleSelector':
					each(node.sequence, buffer);
					break;

				case 'StyleSheet':
					each(node.rules, buffer);
					break;

				case 'Url':
					buffer.push('url(');
					translate(node.value, buffer);
					buffer.push(')');
					break;

				case 'Progid':
					translate(node.value, buffer);
					break;

				case 'Property':
				case 'Combinator':
				case 'Identifier':
					buffer.push(node.name);
					break;

				case 'PseudoClass':
					buffer.push(':', node.name);
					break;

				case 'PseudoElement':
					buffer.push('::', node.name);
					break;

				case 'Class':
					buffer.push('.', node.name);
					break;

				case 'Dimension':
					buffer.push(node.value, node.unit);
					break;

				case 'Id':
					buffer.push('#', node.name);
					break;
				case 'Hash':
					buffer.push('#', node.value);
					break;

				case 'Nth':
				case 'Number':
				case 'String':
				case 'Operator':
				case 'Raw':
					buffer.push(node.value);
					break;

				case 'Important': // remove
					buffer.push('!important');
					break;

				case 'Percentage':
					buffer.push(node.value, '%');
					break;

				case 'Space':
					buffer.push(' ');
					break;

				case 'Comment':
					buffer.push('/*', node.value, '*/');
					break;

				default:
					console.warn('Unknown node type:', node);
			}
		}

		var exports = function(node) {
			var buffer = [];

			translate(node, buffer);

			return buffer.join('');
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/ast/walk
	modules['/compressor/ast/walk'] = function () {
		function each(array, walker, parent) {
			for (var i = 0; i < array.length; i++) {
				var item = array[i];
				var result = walker.call(this, item, parent, array, i);

				if (result === null) {
					array.splice(i, 1);
					i--;
				} else if (result && result !== item) {
					array.splice(i, 1, result);
				}
			}
		}

		function eachRight(array, walker, parent) {
			for (var i = array.length - 1; i >= 0; i--) {
				var item = array[i];
				var result = walker.call(this, item, parent, array, i);

				if (result === null) {
					array.splice(i, 1);
				} else if (result && result !== item) {
					array.splice(i, 1, result);
				}
			}
		}

		function walkRules(node, parent, array, index) {
			switch (node.type) {
				case 'StyleSheet':
					each.call(this, node.rules, walkRules, node);
					break;

				case 'Atrule':
					if (node.block) {
						walkRules.call(this, node.block);
					}
					return this.fn(node, parent, array, index);

				case 'Ruleset':
					return this.fn(node, parent, array, index);
			}
		}

		function walkRulesRight(node, parent, array, index) {
			switch (node.type) {
				case 'StyleSheet':
					eachRight.call(this, node.rules, walkRulesRight, node);
					break;

				case 'Atrule':
					if (node.block) {
						walkRulesRight.call(this, node.block);
					}
					return this.fn(node, parent, array, index);

				case 'Ruleset':
					return this.fn(node, parent, array, index);
			}
		}

		function walkAll(node, parent, array, index) {
			this.stack.push(node);

			switch (node.type) {
				case 'Atrule':
					if (node.expression) {
						walkAll.call(this, node.expression, node);
					}
					if (node.block) {
						walkAll.call(this, node.block, node);
					}
					break;

				case 'Declaration':
					walkAll.call(this, node.property, node);
					walkAll.call(this, node.value, node);
					break;

				case 'Attribute':
					walkAll.call(this, node.name, node);
					if (node.value) {
						walkAll.call(this, node.value, node);
					}
					break;

				case 'FunctionalPseudo':
				case 'Function':
					each.call(this, node.arguments, walkAll, node);
					break;

				case 'Block':
					each.call(this, node.declarations, walkAll, node);
					break;

				case 'Ruleset':
					if (node.selector) {
						walkAll.call(this, node.selector, node);
					}
					walkAll.call(this, node.block, node);
					break;

				case 'Selector':
					each.call(this, node.selectors, walkAll, node);
					break;

				case 'Argument':
				case 'AtruleExpression':
				case 'Braces':
				case 'Negation':
				case 'Value':
				case 'SimpleSelector':
					each.call(this, node.sequence, walkAll, node);
					break;

				case 'StyleSheet':
					each.call(this, node.rules, walkAll, node);
					break;

				case 'Url':
				case 'Progid':
					walkAll.call(this, node.value, node);
					break;

				case 'Property':
				case 'Combinator':
				case 'Dimension':
				case 'Hash':
				case 'Identifier':
				case 'Important': // remove
				case 'Nth':
				case 'Class':
				case 'Id':
				case 'Percentage':
				case 'PseudoClass':
				case 'PseudoElement':
				case 'Space':
				case 'Number':
				case 'String':
				case 'Operator':
				case 'Raw':
					break;
			}

			this.stack.pop(node);

			return this.fn(node, parent, array, index);
		}

		var exports = {
			all: function(root, fn) {
				walkAll.call({
					fn: fn,
					root: root,
					stack: []
				}, root);
			},
			rules: function(root, fn) {
				walkRules.call({
					fn: fn,
					root: root,
					stack: []
				}, root);
			},
			rulesRight: function(root, fn) {
				walkRulesRight.call({
					fn: fn,
					root: root,
					stack: []
				}, root);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/clean
	modules['/compressor/clean'] = function () {
		var handlers = {
			Space: require('/compressor/clean/Space'),
			Atrule: require('/compressor/clean/Atrule'),
			Ruleset: require('/compressor/clean/Ruleset'),
			Declaration: require('/compressor/clean/Declaration')
		};

		var exports = function(node, parent, array, index) {
			if (handlers.hasOwnProperty(node.type)) {
				return handlers[node.type].call(this, node, parent, array, index);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/clean/Atrule
	modules['/compressor/clean/Atrule'] = function () {
		var exports = function cleanAtrule(node, parent, array, i) {
			if (node.block) {
				// otherwise removed at-rule don't prevent @import for removal
				this.root.firstAtrulesAllowed = false;

				if (node.block.type === 'Block' && !node.block.declarations.length) {
					return null;
				}

				if (node.block.type === 'StyleSheet' && !node.block.rules.length) {
					return null;
				}
			}

			switch (node.name) {
				case 'charset':
					if (!node.expression.sequence.length) {
						return null;
					}

					// if there is any rule before @charset -> remove it
					if (i) {
						return null;
					}

					break;

				case 'import':
					if (!this.root.firstAtrulesAllowed) {
						return null;
					}

					// if there are some rules that not an @import or @charset before @import
					// remove it
					for (i = i - 1; i >= 0; i--) {
						var rule = array[i];
						if (rule.type === 'Atrule') {
							if (rule.name === 'import' || rule.name === 'charset') {
								continue;
							}
						}

						this.root.firstAtrulesAllowed = false;
						return null;
					}

					break;
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/clean/Declaration
	modules['/compressor/clean/Declaration'] = function () {
		var exports = function cleanDeclartion(node) {
			if (!node.value.sequence.length) {
				return null;
			}
		};
		
		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/clean/Ruleset
	modules['/compressor/clean/Ruleset'] = function () {
		var exports = function cleanRuleset(node) {
			if (!node.selector || !node.block.declarations.length) {
				return null;
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/clean/Space
	modules['/compressor/clean/Space'] = function () {
		function canCleanWhitespace(node, left) {
			switch (node.type) {
				case 'Important':
				case 'Nth':
					return true;

				case 'Operator':
					return node.value !== '+' && node.value !== '-';
			}

			if (left) {
				switch (node.type) {
					case 'Function':
					case 'Braces':
					case 'Url':
						return true;
				}
			}
		}

		var exports = function cleanWhitespace(node, parent, array, index) {
			var prev = array[index - 1];
			var next = array[index + 1];
			var prevType = prev.type;
			var nextType = next.type;

			// See https://github.com/css/csso/issues/16
			if (prevType === 'Url' && nextType) {
				return;
			}

			// See https://github.com/css/csso/issues/165
			if (prevType === 'Braces' && nextType === 'Identifier') {
				return;
			}

			// See https://github.com/css/csso/issues/134
			if (prevType === 'Function' && (nextType === 'Function' || nextType === 'Hash')) {
				return;
			}

			// See https://github.com/css/csso/issues/228
			if (prevType === 'Braces' && nextType === 'Operator' && (next.value === '+' || next.value === '-')) {
				return;
			}

			if ((prevType === 'Identifier' && prev.name === '*') ||
				(nextType === 'Identifier' && next.name === '*')) {
				return null;
			}

			if (canCleanWhitespace(next, false) ||
				canCleanWhitespace(prev, true)) {
				return null;
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress
	modules['/compressor/compress'] = function () {
		var handlers = {
			Atrule: require('/compressor/compress/Atrule'),
			Attribute: require('/compressor/compress/Attribute'),
			Value: require('/compressor/compress/Value'),
			Dimension: require('/compressor/compress/Dimension'),
			Percentage: require('/compressor/compress/Number'),
			Number: require('/compressor/compress/Number'),
			String: require('/compressor/compress/String'),
			Hash: require('/compressor/compress/color').compressHex,
			Identifier: require('/compressor/compress/color').compressIdent,
			Function: require('/compressor/compress/color').compressFunction
		};

		var exports = function(node, parent, array, index) {
			if (handlers.hasOwnProperty(node.type)) {
				return handlers[node.type].call(this, node, parent, array, index);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/atrule/keyframes
	modules['/compressor/compress/atrule/keyframes'] = function () {
		var exports = function(node) {
			node.block.rules.forEach(function(ruleset) {
				ruleset.selector.selectors.forEach(function(simpleselector) {
					var array = simpleselector.sequence;

					for (var i = 0; i < array.length; i++) {
						var part = array[i];
						if (part.type === 'Percentage' && part.value === '100') {
							array[i] = {
								type: 'Identifier',
								info: array[i].info,
								name: 'to'
							};
						} else if (part.type === 'Identifier' && part.name === 'from') {
							array[i] = {
								type: 'Percentage',
								info: array[i].info,
								value: '0'
							};
						}
					}
				});
			});
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/Atrule
	modules['/compressor/compress/Atrule'] = function () {
		var compressKeyframes = require('/compressor/compress/atrule/keyframes');

		var exports = function(node, parent, array, index) {
			// compress @keyframe selectors
			if (/^(-[a-z\d]+-)?keyframes$/.test(node.name)) {
				compressKeyframes(node, parent, array, index);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/Attribute
	modules['/compressor/compress/Attribute'] = function () {
		// Can unquote attribute detection
		// Adopted implementation of Mathias Bynens
		// https://github.com/mathiasbynens/mothereff.in/blob/master/unquoted-attributes/eff.js
		var escapesRx = /\\([0-9A-Fa-f]{1,6})[ \t\n\f\r]?|\\./g;
		var blockUnquoteRx = /^(-?\d|--)|[\u0000-\u002c\u002e\u002f\u003A-\u0040\u005B-\u005E\u0060\u007B-\u009f]/;

		function canUnquote(value) {
			if (value === '' || value === '-') {
				return;
			}

			// Escapes are valid, so replace them with a valid non-empty string
			value = value.replace(escapesRx, 'a');

			return !blockUnquoteRx.test(value);
		}

		var exports = function(node) {
			var attrValue = node.value;

			if (!attrValue || attrValue.type !== 'String') {
				return;
			}

			var unquotedValue = attrValue.value.replace(/^(.)(.*)\1$/, '$2');
			if (canUnquote(unquotedValue)) {
				node.value = {
					type: 'Identifier',
					info: attrValue.info,
					name: unquotedValue
				};
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/color
	modules['/compressor/compress/color'] = function () {
		var packNumber = require('/compressor/compress/Number').pack;

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

		function parseFunctionArgs(functionArgs, count, rgb) {
			var args = [];

			for (var i = 0; i < functionArgs.length; i++) {
				// each arguments should just one node
				var items = functionArgs[i].sequence;
				var wasValue = false;

				for (var j = 0; j < items.length; j++) {
					var value = items[j];
					var type = value.type;
					switch (type) {
						case 'Number':
						case 'Percentage':
							if (wasValue) {
								return;
							}

							wasValue = true;
							args.push({
								type: type,
								value: Number(value.value)
							});
							break;
						case 'Operator':
							if (wasValue || value.value !== '+') {
								return;
							}
							break;

						default:
							// something we couldn't understand
							return;
					}
				}
			}

			if (args.length !== count) {
				// invalid arguments count
				// TODO: remove those tokens
				return;
			}

			if (args.length === 4) {
				if (args[3].type !== 'Number') {
					// 4th argument should be a number
					// TODO: remove those tokens
					return;
				}

				args[3].type = 'Alpha';
			}

			if (rgb) {
				if (args[0].type !== args[1].type || args[0].type !== args[2].type) {
					// invalid color, numbers and percentage shouldn't be mixed
					// TODO: remove those tokens
					return;
				}
			} else {
				if (args[0].type !== 'Number' ||
					args[1].type !== 'Percentage' ||
					args[2].type !== 'Percentage') {
					// invalid color, for hsl values should be: number, percentage, percentage
					// TODO: remove those tokens
					return;
				}

				args[0].type = 'Angle';
			}

			return args.map(function(arg, idx) {
				var value = Math.max(0, arg.value);

				switch (arg.type) {
					case 'Number':
						// fit value to [0..255] range
						value = Math.min(value, 255);
						break;

					case 'Percentage':
						// convert 0..100% to value in [0..255] range
						value = Math.min(value, 100) / 100;

						if (!rgb) {
							return value;
						}

						value = 255 * value;
						break;

					case 'Angle':
						// fit value to (-360..360) range
						return (((value % 360) + 360) % 360) / 360;

					case 'Alpha':
						// fit value to [0..1] range
						return Math.min(value, 1);
				}

				return Math.round(value);
			});
		}

		function compressFunction(node, parent, array, index) {
			var functionName = node.name;
			var args;

			if (functionName === 'rgba' || functionName === 'hsla') {
				args = parseFunctionArgs(node.arguments, 4, functionName === 'rgba');

				if (!args) {
					// something went wrong
					return;
				}

				if (functionName === 'hsla') {
					args = hslToRgb.apply(null, args);
					node.name = 'rgba';
				}

				if (args[3] !== 1) {
					// replace argument values for normalized/interpolated
					node.arguments.forEach(function(argument, idx) {
						var value = argument.sequence[0];

						if (value.type === 'Operator') {
							value = argument.sequence[1];
						}

						argument.sequence = [{
							type: 'Number',
							info: value.info,
							value: packNumber(args[idx])
						}];
					});

					return;
				}

				// otherwise convert to rgb, i.e. rgba(255, 0, 0, 1) -> rgb(255, 0, 0)
				functionName = 'rgb';
			}

			if (functionName === 'hsl') {
				args = args || parseFunctionArgs(node.arguments, 3, false);

				if (!args) {
					// something went wrong
					return;
				}

				// convert to rgb
				args = hslToRgb.apply(null, args);
				functionName = 'rgb';
			}

			if (functionName === 'rgb') {
				args = args || parseFunctionArgs(node.arguments, 3, true);

				if (!args) {
					// something went wrong
					return;
				}

				// check if color is not at the end and not followed by space
				var next = array && index < array.length - 1 ? array[index + 1] : null;
				if (next && next.type !== 'Space') {
					array.splice(index + 1, 0, {
						type: 'Space'
					});
				}

				var color = {
					type: 'Hash',
					info: node.info,
					value: toHex(args[0]) + toHex(args[1]) + toHex(args[2])
				};

				return compressHex(color) || color;
			}
		}

		function compressIdent(node, parent) {
			var parentType = parent.type;

			if (parentType !== 'Value' && parentType !== 'Function') {
				return;
			}

			var color = node.name.toLowerCase();
			var hex = NAME_TO_HEX[color];

			if (hex) {
				if (hex.length + 1 <= color.length) {
					// replace for shorter hex value
					return {
						type: 'Hash',
						info: node.info,
						value: hex
					};
				} else {
					// special case for consistent colors
					if (color === 'grey') {
						color = 'gray';
					}

					// just replace value for lower cased name
					node.name = color;
				}
			}
		}

		function compressHex(node) {
			var color = node.value.toLowerCase();

			// #112233 -> #123
			if (color.length === 6 &&
				color[0] === color[1] &&
				color[2] === color[3] &&
				color[4] === color[5]) {
				color = color[0] + color[2] + color[4];
			}

			if (HEX_TO_NAME[color]) {
				return {
					type: 'Identifier',
					info: node.info,
					name: HEX_TO_NAME[color]
				};
			} else {
				node.value = color;
			}
		}

		var exports = {
			compressFunction: compressFunction,
			compressIdent: compressIdent,
			compressHex: compressHex
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/Dimension
	modules['/compressor/compress/Dimension'] = function () {
		var packNumber = require('/compressor/compress/Number').pack;
		var NON_LENGTH_UNIT = {
			'deg': true,
			'grad': true,
			'rad': true,
			'turn': true,
			's': true,
			'ms': true,
			'Hz': true,
			'kHz': true,
			'dpi': true,
			'dpcm': true,
			'dppx': true
		};

		var exports = function compressDimension(node, parent) {
			var value = packNumber(node.value);
			var unit = node.unit;

			node.value = value;

			if (value === '0' && !NON_LENGTH_UNIT[unit]) {
				// issue #200: don't remove units in flex property as it could change value meaning
				if (parent.type === 'Value' && this.stack[this.stack.length - 2].property.name === 'flex') {
					return;
				}

				// issue #222: don't remove units inside calc
				for (var i = this.stack.length - 1; i >= 0; i--) {
					var cursor = this.stack[i];
					if (cursor.type === 'Function' && cursor.name === 'calc') {
						return;
					}
					if (cursor.type !== 'Braces' && cursor.type !== 'Argument') {
						break;
					}
				}

				return {
					type: 'Number',
					info: node.info,
					value: value
				};
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/Number
	modules['/compressor/compress/Number'] = function () {
		function packNumber(value) {
			// 100 -> '100'
			// 00100 -> '100'
			// +100 -> '100'
			// -100 -> '-100'
			// 0.123 -> '.123'
			// 0.12300 -> '.123'
			// 0.0 -> ''
			// 0 -> ''
			value = String(value).replace(/^(?:\+|(-))?0*(\d*)(?:\.0*|(\.\d*?)0*)?$/, '$1$2$3');

			if (value === '' || value === '-') {
				value = '0';
			}

			return value;
		};

		var exports = {};
		exports = function(node) {
			node.value = packNumber(node.value);
		};
		exports.pack = packNumber;

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/property/background
	modules['/compressor/compress/property/background'] = function () {
		var exports = function compressBackground(value) {
			function lastType() {
				if (buffer.length) {
					return buffer[buffer.length - 1].type;
				}
			}

			function flush() {
				if (lastType() === 'Space') {
					buffer.pop();
				}

				if (!buffer.length ||
					(buffer.length === 1 && buffer[0].type === 'Important')) {
					buffer.unshift(
						{
							type: 'Number',
							value: '0'
						},
						{
							type: 'Space'
						},
						{
							type: 'Number',
							value: '0'
						}
					);
				}

				newValue.push.apply(newValue, buffer);

				buffer = [];
			}

			var newValue = [];
			var buffer = [];

			value.sequence.forEach(function(node) {
				if (node.type === 'Operator' && node.value === ',') {
					flush();
					newValue.push(node);
					return;
				}

				// remove defaults
				if (node.type === 'Identifier') {
					if (node.name === 'transparent' ||
						node.name === 'none' ||
						node.name === 'repeat' ||
						node.name === 'scroll') {
						return;
					}
				}

				// don't add redundant spaces
				if (node.type === 'Space' && (!buffer.length || lastType() === 'Space')) {
					return;
				}

				buffer.push(node);
			});

			flush();
			value.sequence = newValue;
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/property/font
	modules['/compressor/compress/property/font'] = function () {
		var exports = function compressFont(value) {
			var array = value.sequence;

			for (var i = array.length - 1; i >= 0; i--) {
				var node = array[i];

				if (node.type === 'Identifier') {
					if (node.name === 'bold') {
						array[i] = {
							type: 'Number',
							info: value.info,
							value: '700'
						};
					} else if (node.name === 'normal') {
						var prev = i ? array[i - 1] : null;

						if (prev && prev.type === 'Operator' && prev.value === '/') {
							array.splice(--i, 2);
						} else {
							array.splice(i, 1);
						}
					} else if (node.name === 'medium') {
						var next = i < array.length - 1 ? array[i + 1] : null;

						if (!next || next.type !== 'Operator') {
							array.splice(i, 1);
						}
					}
				}
			}

			// remove redundant spaces
			for (var i = 0; i < array.length; i++) {
				if (array[i].type === 'Space') {
					if (!i || i === array.length - 1 || array[i + 1].type === 'Space') {
						array.splice(i, 1);
						i--;
					}
				}
			}

			if (!array.length) {
				array.push({
					type: 'Identifier',
					name: 'normal'
				});
			}

			value.sequence = array;
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/property/font-weight
	modules['/compressor/compress/property/font-weight'] = function () {
		var exports = function compressFontWeight(node) {
			var value = node.sequence[0];

			if (value.type === 'Identifier') {
				switch (value.name) {
					case 'normal':
						node.sequence[0] = {
							type: 'Number',
							info: value.info,
							value: '400'
						};
						break;
					case 'bold':
						node.sequence[0] = {
							type: 'Number',
							info: value.info,
							value: '700'
						};
						break;
				}
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/String
	modules['/compressor/compress/String'] = function () {
		var exports = function(node) {
			var value = node.value;

			// remove escaped \n, i.e.
			// .a { content: "foo\
			// bar"}
			// ->
			// .a { content: "foobar" }
			value = value.replace(/\\\n/g, '');

			node.value = value;
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/Value
	modules['/compressor/compress/Value'] = function () {
		var compressFont = require('/compressor/compress/property/font');
		var compressFontWeight = require('/compressor/compress/property/font-weight');
		var compressBackground = require('/compressor/compress/property/background');

		var exports = function compressValue(node, parent) {
			var property = parent.property.name;

			if (/background$/.test(property)) {
				compressBackground(node);
			} else if (/font$/.test(property)) {
				compressFont(node);
			} else if (/font-weight$/.test(property)) {
				compressFontWeight(node);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure
	modules['/compressor/restructure'] = function () {
		var internalWalkAll = require('/compressor/ast/walk').all;
		var internalWalkRules = require('/compressor/ast/walk').rules;
		var internalWalkRulesRight = require('/compressor/ast/walk').rulesRight;
		var prepare = require('/compressor/restructure/prepare');
		var markShorthands = require('/compressor/restructure/markShorthands');
		var processShorthands = require('/compressor/restructure/processShorthands');
		var disjoin = require('/compressor/restructure/disjoinRuleset');
		var rejoinRuleset = require('/compressor/restructure/rejoinRuleset');
		var initialRejoinRuleset = require('/compressor/restructure/initialRejoinRuleset');
		var rejoinAtrule = require('/compressor/restructure/rejoinAtrule');
		var restructBlock = require('/compressor/restructure/restructBlock');
		var restructRuleset = require('/compressor/restructure/restructRuleset');

		var exports = function(ast/*, debug*/) {
			function walk(name, fn) {
				internalWalkAll(ast, fn);

//				debug(name, ast);
			}

			function walkRulesets(name, fn) {
				// console.log(require('../ast/translate.js')(ast));
				internalWalkRules(ast, function(node) {
					if (node.type === 'Ruleset') {
						return fn.apply(this, arguments);
						// console.log(require('../ast/translate.js')(ast));
					}
				});

//				debug(name, ast);
			}

			function walkRulesetsRight(name, fn) {
				internalWalkRulesRight(ast, function(node) {
					if (node.type === 'Ruleset') {
						return fn.apply(this, arguments);
					}
				});

//				debug(name, ast);
			}

			function walkAtrules(name, fn) {
				internalWalkRulesRight(ast, function(node) {
					if (node.type === 'Atrule') {
						return fn.apply(this, arguments);
					}
				});

//				debug(name, ast);
			}

			// prepare ast for restructing
			walk('prepare', prepare);

			// todo: remove initial rejoin
			walkRulesetsRight('initialRejoinRuleset', initialRejoinRuleset);
			walkAtrules('rejoinAtrule', rejoinAtrule);
			walkRulesetsRight('disjoin', disjoin);

			var shortDeclarations = [];
			walkRulesetsRight('buildMaps', function(ruleset, stylesheet) {
				var map = stylesheet.info.selectorsMap;
				if (!map) {
					map = stylesheet.info.selectorsMap = {};
					stylesheet.info.shortDeclarations = shortDeclarations;
					stylesheet.info.lastShortSelector = null;
				}

				var selector = ruleset.selector.selectors[0].info.s;
				if (selector in map === false) {
					map[selector] = {
						props: {},
						shorts: {}
					};
				}
			});

			walkRulesetsRight('markShorthands', markShorthands);
			processShorthands(shortDeclarations);
//			debug('processShorthand', ast);

			walkRulesetsRight('restructBlock', restructBlock);
			// console.log(require('../ast/translate.js')(ast));
			walkRulesets('rejoinRuleset', rejoinRuleset);
			walkRulesetsRight('restructRuleset', restructRuleset);
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/disjoinRuleset
	modules['/compressor/restructure/disjoinRuleset'] = function () {
		var utils = require('/compressor/restructure/utils');

		var exports = function disjoin(node, parent, array, i) {
			var selectors = node.selector.selectors;

			// there are more than 1 simple selector split for rulesets
			if (selectors.length > 1) {
				// generate new rule sets:
				// .a, .b { color: red; }
				// ->
				// .a { color: red; }
				// .b { color: red; }
				for (var j = selectors.length - 1; j >= 1; j--) {
					array.splice(i + 1, 0, {
						type: 'Ruleset',
						info: utils.copyObject(node.info),
						selector: {
							type: 'Selector',
							info: utils.copyObject(node.selector.info),
							selectors: [
								selectors[j]
							]
						},
						block: {
							type: 'Block',
							info: utils.copyObject(node.block.info),
							declarations: node.block.declarations.slice()
						}
					});
				}

				// delete all selectors except first one
				node.selector.selectors = [
					node.selector.selectors[0]
				];
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/initialRejoinRuleset
	modules['/compressor/restructure/initialRejoinRuleset'] = function () {
		var utils = require('/compressor/restructure/utils');

		var exports = function rejoinRuleset(node, parent, array, i) {
			var selector = node.selector.selectors;
			var block = node.block;

			if (!block.declarations.length) {
				return null;
			}

			for (i = i - 1; i >= 0; i--) {
				var prev = array[i];

				if (prev.type !== 'Ruleset') {
					return;
				}

				var prevSelector = prev.selector.selectors;
				var prevBlock = prev.block;

				if (node.info.pseudoSignature !== prev.info.pseudoSignature) {
					return;
				}

				// try to join by selectors
				var prevHash = utils.getHash(prevSelector);
				var hash = utils.getHash(selector);

				if (utils.equalHash(hash, prevHash)) {
					prevBlock.declarations.push.apply(prevBlock.declarations, block.declarations);
					return null;
				}

				if (!utils.isCompatibleSignatures(node, prev)) {
					return;
				}

				// try to join by properties
				var diff = utils.compareRulesets(node, prev);

				if (!diff.ne1.length && !diff.ne2.length) {
					utils.addToSelector(prevSelector, selector);

					return null;
				}

				// go to next ruleset if simpleselectors has no equal specifity and element selector
				for (var j = 0; j < prevSelector.length; j++) {
					for (var k = 0; k < selector.length; k++) {
						if (prevSelector[j].info.compareMarker === selector[k].info.compareMarker) {
							return;
						}
					}
				}
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/markShorthands
	modules['/compressor/restructure/markShorthands'] = function () {
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
			'padding-left': 'left',

			'border-top-color': 'top',
			'border-right-color': 'right',
			'border-bottom-color': 'bottom',
			'border-left-color': 'left',
			'border-top-width': 'top',
			'border-right-width': 'right',
			'border-bottom-width': 'bottom',
			'border-left-width': 'left',
			'border-top-style': 'top',
			'border-right-style': 'right',
			'border-bottom-style': 'bottom',
			'border-left-style': 'left'
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
			'padding-left': 'padding',

			'border-color': 'border-color',
			'border-top-color': 'border-color',
			'border-right-color': 'border-color',
			'border-bottom-color': 'border-color',
			'border-left-color': 'border-color',
			'border-width': 'border-width',
			'border-top-width': 'border-width',
			'border-right-width': 'border-width',
			'border-bottom-width': 'border-width',
			'border-left-width': 'border-width',
			'border-style': 'border-style',
			'border-top-style': 'border-style',
			'border-right-style': 'border-style',
			'border-bottom-style': 'border-style',
			'border-left-style': 'border-style'
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
			function add(node, str) {
				values.push({
					s: str,
					node: node,
					important: important
				});
			}

			var sides = this.sides;
			var side = SIDE[name];
			var values = [];

			important = important ? 1 : 0;

			if (side) {
				if (side in sides) {
					var currentValue = sides[side];

					if (!currentValue || (important && !currentValue.important)) {
						sides[side] = {
							s: important ? sValue.substring(0, sValue.length - 10) : sValue,
							node: tValue[0],
							important: important
						};
					}

					return true;
				}
			} else if (name === this.name) {
				for (var i = 0; i < tValue.length; i++) {
					var child = tValue[i];

					switch (child.type) {
						case 'Identifier':
							add(child, child.name);
							break;

						case 'Number':
							add(child, child.value);
							break;

						case 'Percentage':
							add(child, child.value + '%');
							break;

						case 'Dimension':
							add(child, child.value + child.unit);
							break;

						case 'Space':
						case 'Important':
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
			var result = {
				type: 'Value',
				info: {},
				sequence: []
			};
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

			result.sequence.push(values[TOP].node);
			for (var i = 1; i < values.length; i++) {
				result.sequence.push(
					{ type: 'Space' },
					values[i].node
				);
			}

			if (this.impSum()) {
				result.sequence.push({ type: 'Important' });
			}

			return result;
		};

		TRBL.prototype.getProperty = function() {
			return {
				type: 'Property',
				info: { s: this.name },
				name: this.name
			};
		};

		var exports = function markShorthands(ruleset, parent) {
			var declarations = ruleset.block.declarations;
			var selector = ruleset.selector.selectors[0].info.s;
			var freezeID = ruleset.info.freezeID || '';
			var shorts = parent.info.selectorsMap[selector].shorts;

			for (var i = declarations.length - 1; i >= 0; i--) {
				var child = declarations[i];

				if (child.type === 'Declaration') {
					var childInfo = child.info;
					var property = child.property.info.s;
					var value = child.value;
					var important = value.sequence[value.sequence.length - 1].type === 'Important';

					if (property in TRBL.props) {
						var key = freezeID + TRBL.extractMain(property);
						var shorthand = null;

						if (!parent.info.lastShortSelector || selector === parent.info.lastShortSelector) {
							if (key in shorts) {
								shorthand = shorts[key];
								childInfo.removeByShort = true;
							}
						}

						if (!shorthand) {
							shorthand = new TRBL(property, important);
							childInfo.replaceByShort = true;
						}

						shorthand.add(property, value.info.s, value.sequence.slice(0), important);

						shorts[key] = shorthand;
						parent.info.shortDeclarations.push({
							info: shorthand,
							block: declarations,
							declaration: child,
							pos: i
						});

						parent.info.lastShortSelector = selector;
					}
				}
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/prepare
	modules['/compressor/restructure/prepare'] = function () {
		var translate = require('/compressor/ast/translate');
		var specificity = require('/compressor/restructure/prepare/specificity');
		var freeze = require('/compressor/restructure/prepare/freeze');

		function translateNode(node) {
			node.info.s = translate(node);
		}

		var handlers = {
			Ruleset: freeze,

			Atrule: function(node, root) {
				var name = node.name;

				// compare keyframe selectors by its values
				// NOTE: still no clarification about problems with keyframes selector grouping (issue #197)
				if (/^(-[a-z\d]+-)?keyframes$/.test(name)) {
					node.block.rules.forEach(function(ruleset) {
						ruleset.selector.selectors.forEach(function(simpleselector) {
							simpleselector.info.compareMarker = simpleselector.info.s;
						});
					});
				}
			},

			SimpleSelector: function(node) {
				var info = node.info;
				var array = node.sequence;
				var tagName = '*';
				var last;

				for (var i = array.length - 1; i >= 0; i--) {
					if (array[i].type === 'Combinator') {
						break;
					}

					last = array[i];
				}

				if (last.type === 'Identifier') {
					tagName = last.name;
				}

				info.compareMarker = specificity(node) + ',' + tagName;
				info.s = translate(node);
			},

			AtruleExpression: translateNode,
			Declaration: translateNode,
			Property: translateNode,
			Value: translateNode
		};

		var exports = function(node, parent) {
			if (handlers[node.type]) {
				return handlers[node.type].call(this, node, parent);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/prepare/freeze
	modules['/compressor/restructure/prepare/freeze'] = function () {
		var allowedPseudoClasses = {
			'after': 1,
			'before': 1
		};
		var nonFreezePreudoElements = {
			'first-letter': true,
			'first-line': true
		};
		var nonFreezePseudoClasses = {
			'link': true,
			'visited': true,
			'hover': true,
			'active': true,
			'first-letter': true,
			'first-line': true
		};

		function containsPseudo(simpleSelector) {
			return simpleSelector.sequence.some(function(node) {
				switch (node.type) {
					case 'PseudoClass':
					case 'PseudoElement':
					case 'FunctionalPseudo':
						if (node.name in nonFreezePseudoClasses === false) {
							return true;
						}
				}
			});
		}

		function selectorSignature(selector) {
			// looks wrong and non-efficient
			return selector.selectors.map(function(node) {
				return node.info.s;
			}).sort().join(',');
		}

		function freezeNeeded(selector) {
			return selector.selectors.some(function(simpleSelector) {
				return simpleSelector.sequence.some(function(node) {
					switch (node.type) {
						case 'PseudoClass':
							if (node.name in nonFreezePseudoClasses === false) {
								return true;
							}
							break;

						case 'PseudoElement':
							if (node.name in nonFreezePreudoElements === false) {
								return true;
							}
							break;

						case 'FunctionalPseudo':
							return true;
					}
				});
			});
		}

		function composePseudoID(selector) {
			var pseudos = [];

			selector.selectors.forEach(function(simpleSelector) {
				if (containsPseudo(simpleSelector)) {
					pseudos.push(simpleSelector.info.s);
				}
			});

			return pseudos.sort().join(',');
		}

		function pseudoSelectorSignature(selector, exclude) {
			var pseudos = {};
			var wasExclude = false;

			selector.selectors.forEach(function(simpleSelector) {
				simpleSelector.sequence.forEach(function(node) {
					switch (node.type) {
						case 'PseudoClass':
						case 'PseudoElement':
						case 'FunctionalPseudo':
							if (!exclude.hasOwnProperty(node.name)) {
								pseudos[node.name] = 1;
							} else {
								wasExclude = true;
							}
							break;
					}
				});
			});

			return Object.keys(pseudos).sort().join(',') + wasExclude;
		}

		function markSimplePseudo(selector) {
			var hash = {};

			selector.selectors.forEach(function(simpleSelector) {
				var info = simpleSelector.info;

				info.pseudo = containsPseudo(simpleSelector);
				info.sg = hash;
				hash[info.s] = true;
			});
		}

		var exports = function freeze(node) {
			var selector = node.selector;
			var freeze = freezeNeeded(selector);

			if (freeze) {
				var info = node.info;

				info.freeze = freeze;
				info.freezeID = selectorSignature(selector);
				info.pseudoID = composePseudoID(selector);
				info.pseudoSignature = pseudoSelectorSignature(selector, allowedPseudoClasses);
				markSimplePseudo(selector);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/prepare/specificity
	modules['/compressor/restructure/prepare/specificity'] = function () {
		var A = 2;
		var B = 1;
		var C = 0;

		var exports = function specificity(simpleSelector) {
			var specificity = [0, 0, 0];

			simpleSelector.sequence.forEach(function walk(item) {
				switch (item.type) {
					case 'SimpleSelector':
					case 'Negation':
						item.sequence.forEach(walk);
						break;

					case 'Id':
						specificity[C]++;
						break;

					case 'Class':
					case 'Attribute':
					case 'FunctionalPseudo':
						specificity[B]++;
						break;

					case 'Identifier':
						if (item.name !== '*') {
							specificity[A]++;
						}
						break;

					case 'PseudoElement':
						specificity[A]++;
						break;

					case 'PseudoClass':
						var name = item.name.toLowerCase();
						if (name === 'before' ||
							name === 'after' ||
							name === 'first-line' ||
							name === 'first-letter') {
							specificity[A]++;
						} else {
							specificity[B]++;
						}
						break;
				}
			});

			return specificity;
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/processShorthands
	modules['/compressor/restructure/processShorthands'] = function () {
		var translate = require('/compressor/ast/translate');

		function processShorthand(item) {
			var info = item.declaration.info;

			if (info.removeByShort || info.replaceByShort) {
				var shorthand = item.info;

				if (shorthand.isOkToMinimize()) {
					if (info.replaceByShort) {
						var shorterToken = {
							type: 'Declaration',
							info: {},
							property: shorthand.getProperty(),
							value: shorthand.getValue()
						};
						shorterToken.info.s = translate(shorterToken);
						item.block.splice(item.pos, 1, shorterToken);
					} else {
						item.block.splice(item.pos, 1);
					}
				}
			}
		}

		var exports = function processShorthands(shortDeclarations) {
			shortDeclarations.forEach(processShorthand);
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/rejoinAtrule
	modules['/compressor/restructure/rejoinAtrule'] = function () {
		function isMediaRule(node) {
			return node.type === 'Atrule' && node.name === 'media';
		}

		var exports = function rejoinAtrule(node, parent, array, i) {
			if (!isMediaRule(node)) {
				return;
			}

			var prev = i ? array[i - 1] : null;

			if (!prev || !isMediaRule(prev)) {
				return;
			}

			// merge @media with same query
			if (node.expression.info.s === prev.expression.info.s) {
				Array.prototype.push.apply(prev.block.rules, node.block.rules);
				return null;
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/rejoinRuleset
	modules['/compressor/restructure/rejoinRuleset'] = function () {
		var utils = require('/compressor/restructure/utils');

		var exports = function rejoinRuleset(node, parent, array, i) {
			var selector = node.selector.selectors;
			var block = node.block.declarations;

			if (!block.length) {
				return null;
			}

			var nodeCompareMarker = selector[0].info.compareMarker;
			var skippedCompareMarkers = {};

			for (i = i + 1; i < array.length; i++) {
				var next = array[i];

				if (next.type !== 'Ruleset') {
					return;
				}

				if (node.info.pseudoSignature !== next.info.pseudoSignature) {
					return;
				}

				var nextFirstSelector = next.selector.selectors[0];
				var nextBlock = next.block.declarations;
				var nextCompareMarker = nextFirstSelector.info.compareMarker;

				// if next ruleset has same marked as one of skipped then stop joining
				if (nextCompareMarker in skippedCompareMarkers) {
					return;
				}

				// try to join by selectors
				if (selector.length === 1) {
					if (selector[0].info.s === nextFirstSelector.info.s) {
						block.push.apply(block, nextBlock);
						array.splice(i, 1);
						i--;

						continue;
					}
				}

				if (!utils.isCompatibleSignatures(node, next)) {
					return;
				}

				// try to join by properties
				if (block.length === nextBlock.length) {
					var equalBlocks = true;

					for (var j = 0; j < block.length; j++) {
						if (block[j].info.s !== nextBlock[j].info.s) {
							equalBlocks = false;
							break;
						}
					}

					if (equalBlocks) {
						var nextStr = nextFirstSelector.info.s;

						for (var j = selector.length; j >= 0; j--) {
							if (!j || nextStr > selector[j - 1].info.s) {
								selector.splice(j, 0, nextFirstSelector);
								break;
							}
						}

						array.splice(i, 1);
						i--;

						continue;
					}
				}

				// go to next ruleset if current one can be skipped (has no equal specificity nor element selector)
				if (nextCompareMarker === nodeCompareMarker) {
					return;
				}

				skippedCompareMarkers[nextCompareMarker] = true;
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/restructBlock
	modules['/compressor/restructure/restructBlock'] = function () {
		var utils = require('/compressor/restructure/utils');
		var nameVendorMap = {};
		var propertyInfoMap = {};
		var dontRestructure = {
			'src': 1 // https://github.com/afelix/csso/issues/50
		};

		// https://developer.mozilla.org/en-US/docs/Web/CSS/display#Browser_compatibility
		var IS_DISPLAY = /display$/;
		var DISPLAY_DONT_MIX_VALUE = /table|ruby|flex|-(flex)?box$|grid|contents|run-in/;

		var NEEDLESS_TABLE = {
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

		function getVendorIDFromToken(token) {
			var name;

			switch (token.type) {
				case 'Identifier':
				case 'Function':
					name = getVendorFromString(token.name);
					break;
			}

			return name || '';
		}

		function getVendorFromString(string) {
			if (string[0] === '-') {
				if (string in nameVendorMap) {
					return nameVendorMap[string];
				}

				var secondDashIndex = string.indexOf('-', 2);
				if (secondDashIndex !== -1) {
					return nameVendorMap[string] = string.substr(0, secondDashIndex + 1);
				}
			}

			return '';
		}

		function getPropertyInfo(name) {
			if (name in propertyInfoMap) {
				return propertyInfoMap[name];
			}

			var hack = name[0];

			if (hack === '*' || hack === '_' || hack === '$') {
				name = name.substr(1);
			} else if (hack === '/' && name[1] === '/') {
				hack = '//';
				name = name.substr(2);
			} else {
				hack = '';
			}

			var vendor = getVendorFromString(name);

			return propertyInfoMap[name] = {
				prefix: hack + vendor,
				hack: hack,
				vendor: vendor,
				table: NEEDLESS_TABLE[name.substr(vendor.length)]
			};
		}

		function getPropertyFingerprint(property, value, declaration, freeze) {
			var fp = freeze ? 'freeze:' : '';

			if (property.indexOf('background') !== -1 ||
			   (property.indexOf('filter') !== -1 && value[0].type === 'Progid')) {
				return fp + declaration.info.s;
			}

			var vendorId = '';
			var hack9 = 0;
			var functions = {};
			var special = {};

			for (var i = 0; i < value.length; i++) {
				if (!vendorId) {
					vendorId = getVendorIDFromToken(value[i]);
				}

				switch (value[i].type) {
					case 'Identifier':
						var name = value[i].name;

						if (name === '\\9') {
							hack9 = 1;
						}

						if (IS_DISPLAY.test(property) && DISPLAY_DONT_MIX_VALUE.test(name)) {
							special[name] = true;
						}

						break;

					case 'Function':
						var name = value[i].name;

						if (name === 'rect') {
							// there are 2 forms of rect:
							//   rect(<top>, <right>, <bottom>, <left>) - standart
							//   rect(<top> <right> <bottom> <left>) – backwards compatible syntax
							// only the same form values can be merged
							if (value[i].arguments.length < 4) {
								name = 'rect-backward';
							}
						}

						functions[name] = true;
						break;

					case 'Dimension':
						var unit = value[i].unit;

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
								special[unit] = true;
								break;
						}
						break;
				}
			}

			return (
				fp + property +
				'[' + Object.keys(functions) + ']' +
				Object.keys(special) +
				hack9 + vendorId
			);
		}

		function needless(name, props, important, v, d, freeze) {
			var info = getPropertyInfo(name);
			var table = info.table;

			if (table) {
				for (var i = 0; i < table.length; i++) {
					var ppre = getPropertyFingerprint(info.prefix + table[i], v, d, freeze);
					var property = props[ppre];

					if (property) {
						return !important || property.important;
					}
				}
			}
		}

		var exports = function restructureBlock(ruleset, parent) {
			var rulesetInfo = ruleset.info;
			var selectorInfo = ruleset.selector.selectors[0].info;
			var declarations = ruleset.block.declarations;

			var freeze = rulesetInfo.freeze;
			var freezeID = rulesetInfo.freezeID;
			var pseudoID = rulesetInfo.pseudoID;
			var isPseudo = selectorInfo.pseudo;
			var sg = selectorInfo.sg;
			var props = parent.info.selectorsMap[selectorInfo.s].props;

			for (var i = declarations.length - 1; i >= 0; i--) {
				var child = declarations[i];

				if (child.type === 'Declaration') {
					var value = child.value.sequence;
					var important = value[value.length - 1].type === 'Important';
					var property = child.property.info.s;
					var fingerprint = getPropertyFingerprint(property, value, child, freeze);
					var ppreProps = props[fingerprint];

					if (!dontRestructure[property] && ppreProps) {
						if ((isPseudo && freezeID === ppreProps.freezeID) || // pseudo from equal selectors group
							(!isPseudo && pseudoID === ppreProps.pseudoID) || // not pseudo from equal pseudo signature group
							(isPseudo && pseudoID === ppreProps.pseudoID && utils.hashInHash(sg, ppreProps.sg))) { // pseudo from covered selectors group
							if (important && !ppreProps.important) {
								props[fingerprint] = {
									block: declarations,
									child: child,
									important: important,
									sg: sg,
									freezeID: freezeID,
									pseudoID: pseudoID
								};

								ppreProps.block.splice(ppreProps.block.indexOf(ppreProps.child), 1);
							} else {
								declarations.splice(i, 1);
							}
						}
					} else if (needless(property, props, important, value, child, freeze)) {
						declarations.splice(i, 1);
					} else {
						child.info.fingerprint = fingerprint;

						props[fingerprint] = {
							block: declarations,
							child: child,
							important: important,
							sg: sg,
							freezeID: freezeID,
							pseudoID: pseudoID
						};
					}
				}
			}

			if (!declarations.length) {
				return null;
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/restructRuleset
	modules['/compressor/restructure/restructRuleset'] = function () {
		var utils = require('/compressor/restructure/utils');

		function calcLength(tokens) {
			var length = 0;

			for (var i = 0; i < tokens.length; i++) {
				length += tokens[i].info.s.length;
			}

			return length;
		}

		var exports = function restructureRuleset(node, parent, array, i) {
			var selector = node.selector.selectors;
			var block = node.block;

			for (i = i - 1; i >= 0; i--) {
				var prevNode = array[i];

				if (prevNode.type !== 'Ruleset') {
					return;
				}

				var prevSelector = prevNode.selector.selectors;
				var prevBlock = prevNode.block;

				if (node.info.pseudoSignature !== prevNode.info.pseudoSignature) {
					return;
				}

				// try to join by selectors
				var prevHash = utils.getHash(prevSelector);
				var hash = utils.getHash(selector);

				if (utils.equalHash(hash, prevHash)) {
					prevBlock.declarations.push.apply(prevBlock.declarations, block.declarations);
					return null;
				}

				// try to join by properties
				var diff = utils.compareRulesets(node, prevNode);

				// console.log(diff.eq, diff.ne1, diff.ne2);

				if (diff.eq.length) {
					if (!diff.ne1.length && !diff.ne2.length) {
						if (utils.isCompatibleSignatures(node, prevNode)) {
							utils.addToSelector(prevSelector, selector);
							return null;
						}
					} else {
						if (diff.ne1.length && !diff.ne2.length) {
							// prevBlock is subset block
							var simpleSelectorCount = selector.length - 2; // - type and info
							var selectorLength = calcLength(selector) + // selectors length
												 simpleSelectorCount - 1; // delims count
							var blockLength = calcLength(diff.eq) + // declarations length
											  diff.eq.length - 1; // decldelims length

							if (selectorLength < blockLength) {
								utils.addToSelector(prevSelector, selector);
								node.block = {
									type: 'Block',
									info: block.info,
									declarations: diff.ne1
								};
							}
						} else if (!diff.ne1.length && diff.ne2.length) {
							// node is subset of prevBlock
							var simpleSelectorCount = prevSelector.length - 2; // - type and info
							var selectorLength = calcLength(prevSelector) + // selectors length
												 simpleSelectorCount - 1; // delims count
							var blockLength = calcLength(diff.eq) + // declarations length
											  diff.eq.length - 1; // decldelims length

							if (selectorLength < blockLength) {
								utils.addToSelector(selector, prevSelector);
								prevNode.block = {
									type: 'Block',
									info: prevBlock.info,
									declarations: diff.ne2
								};
							}
						} else {
							// diff.ne1.length && diff.ne2.length
							// extract equal block
							var newSelector = {
								type: 'Selector',
								info: {},
								selectors: utils.addToSelector(prevSelector.slice(), selector)
							};
							var newSelectorLength = calcLength(newSelector.selectors) + // selectors length
													newSelector.selectors.length - 1 + // delims length
													2; // braces length
							var blockLength = calcLength(diff.eq) + // declarations length
											  diff.eq.length - 1; // decldelims length

							// ok, it's good enough to extract
							if (blockLength >= newSelectorLength) {
								var newRuleset = {
									type: 'Ruleset',
									info: {},
									selector: newSelector,
									block: {
										type: 'Block',
										info: {},
										declarations: diff.eq
									}
								};

								node.block = {
									type: 'Block',
									info: block.info,
									declarations: diff.ne1
								};
								prevNode.block = {
									type: 'Block',
									info: prevBlock.info,
									declarations: diff.ne2.concat(diff.ne2overrided)
								};
								array.splice(i, 0, newRuleset);
								return;
							}
						}
					}
				}

				// go to next ruleset if simpleselectors has no equal specifity and element selector
				for (var j = 0; j < prevSelector.length; j++) {
					for (var k = 0; k < selector.length; k++) {
						if (prevSelector[j].info.compareMarker === selector[k].info.compareMarker) {
							return;
						}
					}
				}
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/utils
	modules['/compressor/restructure/utils'] = function () {
		function copyObject(obj) {
			var result = {};

			for (var key in obj) {
				result[key] = obj[key];
			}

			return result;
		}

		function equalHash(h0, h1) {
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
		}

		function getHash(tokens) {
			var hash = {};

			for (var i = 0; i < tokens.length; i++) {
				hash[tokens[i].info.s] = true;
			}

			return hash;
		}

		function hashInHash(hash1, hash2) {
			for (var key in hash1) {
				if (key in hash2 === false) {
					return false;
				}
			}

			return true;
		}

		function compareRulesets(ruleset1, ruleset2) {
			var result = {
				eq: [],
				ne1: [],
				ne2: [],
				ne2overrided: []
			};

			var items1 = ruleset1.block.declarations;  // token
			var items2 = ruleset2.block.declarations;  // prev
			var hash1 = getHash(items1);
			var hash2 = getHash(items2);
			var fingerprints = {};

			for (var i = 0; i < items1.length; i++) {
				if (items1[i].info.fingerprint) {
					fingerprints[items1[i].info.fingerprint] = true;
				}
			}

			for (var i = 0; i < items1.length; i++) {
				var item = items1[i];

				if (item.info.s in hash2) {
					result.eq.push(item);
				} else {
					result.ne1.push(item);
				}
			}

			for (var i = 0; i < items2.length; i++) {
				var item = items2[i];

				if (item.info.s in hash1 === false) {
					// if ruleset1 has overriding declaration, this is not a difference
					if (item.info.fingerprint in fingerprints === false) {
						result.ne2.push(item);
					} else {
						result.ne2overrided.push(item);
					}
				}
			}

			return result;
		}

		function addToSelector(dest, source) {
			ignore:
			for (var i = 0; i < source.length; i++) {
				var simpleSelectorStr = source[i].info.s;
				for (var j = dest.length; j > 0; j--) {
					var prevSimpleSelectorStr = dest[j - 1].info.s;
					if (prevSimpleSelectorStr === simpleSelectorStr) {
						continue ignore;
					}
					if (prevSimpleSelectorStr < simpleSelectorStr) {
						break;
					}
				}
				dest.splice(j, 0, source[i]);
			}

			return dest;
		}

		function isCompatibleSignatures(token1, token2) {
			var info1 = token1.info;
			var info2 = token2.info;

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
				var signature1 = info1.pseudoSignature;
				var signature2 = info2.pseudoSignature;

				return signature1 === signature2;
			}

			// is it frozen at all?
			return !info1.freeze && !info2.freeze;
		}

		var exports = {
			copyObject: copyObject,
			equalHash: equalHash,
			getHash: getHash,
			hashInHash: hashInHash,
			isCompatibleSignatures: isCompatibleSignatures,
			compareRulesets: compareRulesets,
			addToSelector: addToSelector
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
				tokens[_i].type === TokenType.Tilde) {
				return 1;
			}

			if (tokens[_i + 0].type === TokenType.Solidus &&
				tokens[_i + 1].type === TokenType.Identifier && tokens[_i + 1].value === 'deep' &&
				tokens[_i + 2].type === TokenType.Solidus) {
				return 3;
			}

			return fail(tokens[_i]);
		}

		function getCombinator() {
			var combinator = tokens[pos].value;

			if (tokens[pos].type === TokenType.Solidus) {
				combinator = '/deep/';
				pos += 3;
			} else {
				pos += 1;
			}

			return needInfo?
					[getInfo(pos), NodeType.CombinatorType, combinator] :
					[NodeType.CombinatorType, combinator];
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
					return unicodeRange - start;
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
		function checkNumber(_i, sign) {
			if (_i < tokens.length && tokens[_i].number_l) return tokens[_i].number_l;

			if (!sign && _i < tokens.length && tokens[_i].type === TokenType.HyphenMinus) {
				var x = checkNumber(_i + 1, true);
				if (x) {
					tokens[_i].number_l = x + 1;
					return tokens[_i].number_l;
				} else {
					fail(tokens[_i])
				}
			}

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

			if (_i < tokens.length - 1 && tokens[_i].value === 'progid' && tokens[_i + 1].type === TokenType.Colon) {
				_i += 2;
			} else return fail(tokens[_i]);

			if (l = checkSC(_i)) _i += l;

			if ((x = joinValues2(_i, 4)) === 'DXImageTransform.Microsoft.') {
				_i += 4;
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

				if (!t) {
					throwError();
				}

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

			if (!ast && rule === 'stylesheet') {
				return needInfo ? [{}, rule] : [rule];
			}

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
				tokens.push({
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
				} else if (!urlMode && c === '/' && cn === '/') {
					if (blockMode > 0) {
						pushToken(TokenType.Identifier, ln, pos - lineStartPos, ident = parseIdentifier(s));
						urlMode = urlMode || ident === 'url';
					} else {
						pushToken(TokenType.CommentSL, ln, pos - lineStartPos, parseSLComment(s));
					}
				} else if (c === '"' || c === "'") {
					pushToken(c === '"' ? TokenType.StringDQ : TokenType.StringSQ, ln, pos - lineStartPos, parseString(s, c));
				} else if (c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === '\f') {
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
				// \n or \f
				if (c === '\n' || c === '\f') {
					ln++;
					lineStartPos = pos;
				// \r + optional \n
				} else if (c === '\r') {
					ln++;
					if (s.charAt(pos + 1) === '\n') {
						pos++;
					}
					lineStartPos = pos;
				} else if (c !== ' ' && c !== '\t') {
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
					break;
				}
			}

			return s.substring(start, pos + 1);
		}

		function parseString(s, q) {
			var start = pos;
			var res = '';

			for (pos = pos + 1; pos < s.length; pos++) {
				if (s.charAt(pos) === '\\') {
					var next = s.charAt(pos + 1);
					// \n or \f
					if (next === '\n' || next === '\f') {
						res += s.substring(start, pos);
						start = pos + 2;
						pos++;
					// \r + optional \n
					} else if (next === '\r') {
						res += s.substring(start, pos);
						if (s.charAt(pos + 2) === '\n') {
							pos++;
						}
						start = pos + 2;
						pos++;
					} else {
						pos++;
					}
				} else if (s.charAt(pos) === q) {
					break;
				}
			}

			return res + s.substring(start, pos + 1);
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
				var c = s.charAt(pos);
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
	
	//#region URL: /utils/walker
	modules['/utils/walker'] = function () {
		var offset;
		var process;

		function walk(token, parent, stack) {
			process(token, parent, stack);
			stack.push(token);

			switch (token[offset + 0])
			{
				case 'simpleselector':
				case 'dimension':
				case 'selector':
				case 'property':
				case 'value':
				case 'filterv':
				case 'progid':
				case 'ruleset':
				case 'atruleb':
				case 'atrulerq':
				case 'atrulers':
				case 'stylesheet':
				case 'attrib':
				case 'important':
				case 'block':
				case 'atrules':
				case 'uri':
					for (var i = offset + 1; i < token.length; i++) {
						walk(token[i], token, stack);
					}
					break;

				case 'percentage':
				case 'clazz':
				case 'atkeyword':
				case 'pseudoe':
				case 'pseudoc':
					walk(token[offset + 1], token, stack);
					break;

				case 'declaration':
				case 'filter':
					walk(token[offset + 1], token, stack);
					walk(token[offset + 2], token, stack);
					break;

				case 'atruler':
					walk(token[offset + 1], token, stack);
					walk(token[offset + 2], token, stack);
					walk(token[offset + 3], token, stack);
					break;

				case 'braces':
					for (var i = offset + 3; i < token.length; i++) {
						walk(token[i], token, stack);
					}
					break;

				case 'nthselector':
					process(token[offset + 1], token, stack);
					for (var i = offset + 2; i < token.length; i++) {
						walk(token[i], token, stack);
					}
					break;

				case 'funktion':
					process(token[offset + 1], token, stack);
					process(token[offset + 2], token, stack);

					token = token[offset + 2];
					stack.push(token);
					for (var i = offset + 1; i < token.length; i++) {
						walk(token[i], token, stack);
					}
					stack.pop();
					break;
			}

			stack.pop();
		}

		var exports = function(tree, fn, hasInfo) {
			offset = hasInfo ? 1 : 0;

			if (typeof fn === 'function') {
				process = fn;

				walk(tree, null, []);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /
	modules['/'] = function () {
		var parse = require('/parser');
		var compress = require('/compressor');
		var traslateInternal = require('/compressor/ast/translate');
		var walk = require('/utils/walker');
		var translate = require('/utils/translate');
		var stringify = require('/utils/stringify');
		var cleanInfo = require('/utils/cleanInfo');

//		var justDoIt = function(src, noStructureOptimizations, needInfo) {
//			console.warn('`csso.justDoIt()` method is deprecated, use `csso.minify()` instead');
//
//			var ast = parse(src, 'stylesheet', needInfo);
//			var compressed = compress(ast, {
//				restructuring: !noStructureOptimizations,
//				outputAst: 'internal'
//			});
//
//			return traslateInternal(compressed);
//		};

		var minify = function(src, options) {
			var minifyOptions = {
				outputAst: 'internal'
			};

			if (options) {
				for (var key in options) {
					minifyOptions[key] = options[key];
				}
			}

//			var t = Date.now();
			var ast = parse(src, 'stylesheet', true);
//			if (minifyOptions.debug) {
//				console.error('## parsing done in %d ms\n', Date.now() - t);
//			}

//			var t = Date.now();
			var compressed = compress(ast, minifyOptions);
//			if (minifyOptions.debug) {
//				console.error('## compressing done in %d ms\n', Date.now() - t);
//			}

			return traslateInternal(compressed);
		};

		var exports = {
			version: '1.5.1',

			// main method
			minify: minify,

			// utils
			parse: parse,
			compress: compress,
			translate: translate,

			walk: walk,
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