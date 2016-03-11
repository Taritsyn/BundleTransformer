/*!
* CSSO (CSS Optimizer) v1.7.0
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
		var List = require('/utils/list');
		var convertToInternal = require('/compressor/ast/gonzalesToInternal');
		var convertToGonzales = require('/compressor/ast/internalToGonzales');
		var internalWalkAll = require('/compressor/ast/walk').all;
		var clean = require('/compressor/clean');
		var compress = require('/compressor/compress');
		var restructureAst = require('/compressor/restructure');

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

		function compressBlock(ast, restructuring, num/*, logger*/) {
//			logger('Compress block #' + num, null, true);

			var internalAst = convertToInternal(ast);
//			logger('convertToInternal', internalAst);

			internalAst.firstAtrulesAllowed = ast.firstAtrulesAllowed;

			// remove useless
			internalWalkAll(internalAst, clean);
//			logger('clean', internalAst);

			// compress nodes
			internalWalkAll(internalAst, compress);
//			logger('compress', internalAst);

			// structure optimisations
			if (restructuring) {
				restructureAst(internalAst/*, logger*/);
			}

			return internalAst;
		}

		var exports = function compress(ast, options) {
			ast = ast || [{}, 'stylesheet'];
			options = options || {};

//			var logger = typeof options.logger === 'function' ? options.logger : Function();
			var restructuring =
				'restructure' in options ? options.restructure :
				'restructuring' in options ? options.restructuring :
				true;
			var result = new List();
			var block = { offset: 2 };
			var firstAtrulesAllowed = true;
			var blockNum = 1;

			if (typeof ast[0] === 'string') {
				injectInfo([ast]);
			}

			do {
				block = readBlock(ast, block.offset);
				block.stylesheet.firstAtrulesAllowed = firstAtrulesAllowed;
				block.stylesheet = compressBlock(block.stylesheet, restructuring, blockNum++/*, logger*/);

				if (block.comment) {
					// add \n before comment if there is another content in result
					if (!result.isEmpty()) {
						result.insert(List.createItem({
							type: 'Raw',
							value: '\n'
						}));
					}

					result.insert(List.createItem({
						type: 'Comment',
						value: block.comment[2]
					}));

					// add \n after comment if block is not empty
					if (!block.stylesheet.rules.isEmpty()) {
						result.insert(List.createItem({
							type: 'Raw',
							value: '\n'
						}));
					}
				}

				result.appendList(block.stylesheet.rules);

				if (firstAtrulesAllowed && !result.isEmpty()) {
					var lastRule = result.last();

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
		var List = require('/utils/list');
		var styleSheetSeed = 0; // FIXME: until node.js 0.10 support drop and we can't use Map instead

		function StyleSheet(tokens) {
			var rules = new List();

			for (var i = 2; i < tokens.length; i++) {
				var token = tokens[i];
				var type = token[1];

				if (type !== 's' &&
					type !== 'comment' &&
					type !== 'unknown') {
					rules.insert(List.createItem(convertToInternal(token)));
				}
			}

			return {
				type: 'StyleSheet',
				info: tokens[0],
				avoidRulesMerge: false,
				rules: rules,
				id: styleSheetSeed++
			};
		}

		function Atrule(token, expression, block) {
			if (expression instanceof List) {
				expression = {
					type: 'AtruleExpression',
					info: expression.head ? expression.head.data.info : null,
					sequence: expression,
					id: null
				};
			}

			return {
				type: 'Atrule',
				info: token[0],
				name: token[2][2][2],
				expression: expression,
				block: block
			};
		}

		function Declaration(token) {
			return {
				type: 'Declaration',
				info: token[0],
				property: convertToInternal(token[2]),
				value: convertToInternal(token[3]),
				id: 0,
				length: 0,
				fingerprint: null
			};
		}

		function Value(token) {
			var important = false;
			var end = token.length - 1;

			for (; end >= 2; end--) {
				var type = token[end][1];
				if (type !== 's' && type !== 'comment') {
					if (type === 'important' && !important) {
						important = true;
					} else {
						break;
					}
				}
			}

			return {
				type: 'Value',
				info: token[0],
				important: important,
				sequence: trimSC(token, 2, end)
			};
		}

		function firstNonSC(token) {
			return convertToInternal(token[skipSC(token, 2)]);
		}

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
			var list = new List();

			start = skipSC(token, start);
			for (; end >= start; end--) {
				var type = token[end][1];
				if (type !== 's' && type !== 'comment') {
					break;
				}
			}

			for (var i = start; i <= end; i++) {
				var node = convertToInternal(token[i]);
				if (node) {
					list.insert(List.createItem(node));
				}
			}

			return list;
		}

		function argumentList(token) {
			var list = new List();
			var args = token;
			var start = 2;

			for (var i = start; i < args.length; i++) {
				if (args[i][1] === 'operator' && args[i][2] === ',') {
					list.insert(List.createItem({
						type: 'Argument',
						info: {},
						sequence: trimSC(args, start, i - 1)
					}));
					start = i + 1;
				}
			}

			var lastArg = trimSC(args, start, args.length - 1);
			if (lastArg.head || list.head) {
				list.insert(List.createItem({
					type: 'Argument',
					info: {},
					sequence: lastArg
				}));
			}

			return list;
		}

		var types = {
			atkeyword: false,
			atruleb: function(token) {
				return Atrule(
					token,
					trimSC(token, 3, token.length - 2),
					convertToInternal(token[token.length - 1])
				);
			},
			atruler: function(token) {
				return Atrule(
					token,
					convertToInternal(token[3]),
					convertToInternal(token[4])
				);
			},
			atrulerq: function(token) {
				return {
					type: 'AtruleExpression',
					info: token[0],
					sequence: trimSC(token, 2, token.length - 1),
					id: null
				};
			},
			atrulers: StyleSheet,
			atrules: function(token) {
				return Atrule(
					token,
					trimSC(token, 3, token.length - 1),
					null
				);
			},
			attrib: function(token) {
				var offset = 2;
				var name;
				var operator = null;
				var value = null;
				var flags = null;

				offset = skipSC(token, 2);
				name = convertToInternal(token[offset]);

				offset = skipSC(token, offset + 1);
				if (offset < token.length) {
					operator = token[offset][2];

					offset = skipSC(token, offset + 1);
					value = convertToInternal(token[offset]);

					if (offset < token.length) {
						offset = skipSC(token, offset + 1);
						if (offset < token.length && token[offset][1] === 'attribFlags') {
							flags = token[offset][2];
						}
					}
				}

				return {
					type: 'Attribute',
					info: token[0],
					name: name,
					operator: operator,
					value: value,
					flags: flags
				};
			},
			attrselector: false,
			block: function(token) {
				var declarations = new List();

				for (var i = 2; i < token.length; i++) {
					var item = token[i];
					var type = item[1];

					if (type === 'declaration' || type === 'filter') {
						declarations.insert(List.createItem(convertToInternal(item)));
					}
				}

				return {
					type: 'Block',
					info: token[0],
					declarations: declarations
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
			declaration: Declaration,
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
			filter: Declaration,
			filterv: Value,
			functionExpression: function(token) {
				return {
					type: 'Function',
					name: 'expression',
					arguments: new List([{
						type: 'Argument',
						sequence: new List([{
							type: 'Raw',
							value: token[2]
						}])
					}])
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
					arguments: new List([{
						type: 'Argument',
						sequence: new List(
							token
								.slice(3)
								.filter(function(item) {
									return item[1] !== 's' && item[1] !== 'comment';
								})
								.map(convertToInternal)
						)
					}])
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
					value: firstNonSC(token)
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
							sequence: types.selector(value[3]).selectors
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
				var block = convertToInternal(token[3]);

				return {
					type: 'Ruleset',
					info: token[0],
					pseudoSignature: null,
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
				var selectors = new List();

				for (var i = 2; i < token.length; i++) {
					var item = token[i];
					var type = item[1];

					if (type === 'simpleselector' || type === 'delim') {
						if (last === type) {
							// bad selector
							selectors = new List();
							break;
						}
						last = type;
					}

					if (type === 'simpleselector') {
						selectors.insert(List.createItem(convertToInternal(item)));
					}
				}

				// check selector is valid since gonzales parses selectors
				// like "foo," or "foo,,bar" as correct;
				// w/o this check broken selector will be repaired and broken ruleset apply;
				// make selector empty so compressor can remove ruleset with no selector
				if (last === 'delim' || (!selectors.isEmpty() && selectors.last().sequence.isEmpty())) {
					selectors = new List();
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
				var sequence = new List();
				var combinator = null;

				for (var i = skipSC(token, 2); i < token.length; i++) {
					var item = token[i];

					switch (item[1]) {
						case 's':
							if (!combinator) {
								combinator = [item[0], 'combinator', ' '];
							}
							break;

						case 'comment':
							break;

						case 'combinator':
							combinator = item;
							break;

						default:
							if (combinator !== null) {
								sequence.insert(List.createItem(convertToInternal(combinator)));
							}

							combinator = null;
							sequence.insert(List.createItem(convertToInternal(item)));
					}
				}

				return {
					type: 'SimpleSelector',
					info: token[0],
					sequence: sequence,
					id: null,
					compareMarker: null
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
					value: firstNonSC(token)
				};
			},
			value: Value,
			vhash: function(token) {
				return {
					type: 'Hash',
					info: token[0],
					value: token[2]
				};
			}
		};

		function convertToInternal(token) {
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
			var list = node[itemsProperty];

			list.each(function(data, item) {
				result.push(toGonzales(data));

				if (item.next) {
					result.push(delimeter.slice());
				}
			});

			return result;
		}

		function buildArguments(body, args) {
			args.each(function(data, item) {
				body.push.apply(body, data.sequence.map(toGonzales));
				if (item.next) {
					body.push([{}, 'operator', ',']);
				}
			});
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

					if (node.expression && !node.expression.sequence.isEmpty()) {
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
					return [
						node.info,
						'ruleset',
						toGonzales(node.selector),
						toGonzales(node.block)
					];

				case 'Selector':
					return eachDelim(node, 'selector', 'selectors', [{}, 'delim']);

				case 'SimpleSelector':
					var result = [
						node.info,
						'simpleselector'
					];

					node.sequence.each(function(data) {
						var node = toGonzales(data);

						// add extra spaces around /deep/ combinator since comment beginning/ending may to be produced
						if (data.type === 'Combinator' && data.name === '/deep/') {
							result.push(
								[{}, 's', ' '],
								node,
								[{}, 's', ' ']
							);
						} else {
							result.push(node);
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

					result.push([{}, 'ident', node.name.name]);

					if (node.operator !== null) {
						result.push([{}, 'attrselector', node.operator]);

						if (node.value !== null) {
							result.push(toGonzales(node.value));

							if (node.flags !== null) {
								if (node.value.type !== 'String') {
									result.push([{}, 's', ' ']);
								}

								result.push([{}, 'attribFlags', node.flags]);
							}
						}
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

				case 'Block':
					return eachDelim(node, 'block', 'declarations', [{}, 'decldelim']);

				case 'Declaration':
					return [
						node.info,
						!node.value.sequence.isEmpty() &&
						node.value.sequence.first().type === 'Progid' &&
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

				case 'Value':
					var result = [
						node.info,
						!node.sequence.isEmpty() &&
						node.sequence.first().type === 'Progid'
							? 'filterv'
							: 'value'
					].concat(node.sequence.map(toGonzales));

					if (node.important) {
						result.push([{}, 'important']);
					}

					return result;

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

				case 'Percentage':
					return [node.info, 'percentage', [{}, 'number', node.value]];

				case 'Space':
					return [node.info, 's', ' '];

				case 'Comment':
					return [node.info, 'comment', node.value];

				// nothing to do
				// case 'Argument':

				default:
					throw new Error('Unknown node type: ' + node.type);
			}
		}

		return toGonzales;
	};
	//#endregion

	//#region URL: /compressor/ast/names
	modules['/compressor/ast/names'] = function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var knownKeywords = Object.create(null);
		var knownProperties = Object.create(null);

		function getVendorPrefix(string) {
			if (string[0] === '-') {
				// skip 2 chars to avoid wrong match with variables names
				var secondDashIndex = string.indexOf('-', 2);

				if (secondDashIndex !== -1) {
					return string.substr(0, secondDashIndex + 1);
				}
			}

			return '';
		}

		function getKeywordInfo(keyword) {
			if (hasOwnProperty.call(knownKeywords, keyword)) {
				return knownKeywords[keyword];
			}

			var lowerCaseKeyword = keyword.toLowerCase();
			var vendor = getVendorPrefix(lowerCaseKeyword);
			var name = lowerCaseKeyword;

			if (vendor) {
				name = name.substr(vendor.length);
			}

			return knownKeywords[keyword] = Object.freeze({
				vendor: vendor,
				prefix: vendor,
				name: name
			});
		}

		function getPropertyInfo(property) {
			if (hasOwnProperty.call(knownProperties, property)) {
				return knownProperties[property];
			}

			var lowerCaseProperty = property.toLowerCase();
			var hack = lowerCaseProperty[0];

			if (hack === '*' || hack === '_' || hack === '$') {
				lowerCaseProperty = lowerCaseProperty.substr(1);
			} else if (hack === '/' && property[1] === '/') {
				hack = '//';
				lowerCaseProperty = lowerCaseProperty.substr(2);
			} else {
				hack = '';
			}

			var vendor = getVendorPrefix(lowerCaseProperty);
			var name = lowerCaseProperty;

			if (vendor) {
				name = name.substr(vendor.length);
			}

			return knownProperties[property] = Object.freeze({
				hack: hack,
				vendor: vendor,
				prefix: hack + vendor,
				name: name
			});
		}

		var exports = {
			keyword: getKeywordInfo,
			property: getPropertyInfo
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/ast/translate
	modules['/compressor/ast/translate'] = function () {
		function each(list) {
			if (list.head && list.head === list.tail) {
				return translate(list.head.data);
			}

			return list.map(translate).join('');
		}

		function eachDelim(list, delimeter) {
			if (list.head && list.head === list.tail) {
				return translate(list.head.data);
			}

			return list.map(translate).join(delimeter);
		}

		function translate(node) {
			switch (node.type) {
				case 'StyleSheet':
					return each(node.rules);

				case 'Atrule':
					var result = '@' + node.name;

					if (node.expression && !node.expression.sequence.isEmpty()) {
						result += ' ' + translate(node.expression);
					}

					if (node.block) {
						return result + '{' + translate(node.block) + '}';
					} else {
						return result + ';';
					}

				case 'Ruleset':
					return translate(node.selector) + '{' + translate(node.block) + '}';

				case 'Selector':
					return eachDelim(node.selectors, ',');

				case 'SimpleSelector':
					return node.sequence.map(function(node) {
						// add extra spaces around /deep/ combinator since comment beginning/ending may to be produced
						if (node.type === 'Combinator' && node.name === '/deep/') {
							return ' ' + translate(node) + ' ';
						}

						return translate(node);
					}).join('');

				case 'Declaration':
					return translate(node.property) + ':' + translate(node.value);

				case 'Property':
					return node.name;

				case 'Value':
					return node.important
						? each(node.sequence) + '!important'
						: each(node.sequence);

				case 'Attribute':
					var result = translate(node.name);

					if (node.operator !== null) {
						result += node.operator;

						if (node.value !== null) {
							result += translate(node.value);

							if (node.flags !== null) {
								result += (node.value.type !== 'String' ? ' ' : '') + node.flags;
							}
						}
					}

					return '[' + result + ']';

				case 'FunctionalPseudo':
					return ':' + node.name + '(' + eachDelim(node.arguments, ',') + ')';

				case 'Function':
					return node.name + '(' + eachDelim(node.arguments, ',') + ')';

				case 'Block':
					return eachDelim(node.declarations, ';');

				case 'Negation':
					return ':not(' + eachDelim(node.sequence, ',') + ')';

				case 'Braces':
					return node.open + each(node.sequence) + node.close;

				case 'Argument':
				case 'AtruleExpression':
					return each(node.sequence);

				case 'Url':
					return 'url(' + translate(node.value) + ')';

				case 'Progid':
					return translate(node.value);

				case 'Combinator':
					return node.name;

				case 'Identifier':
					return node.name;

				case 'PseudoClass':
					return ':' + node.name;

				case 'PseudoElement':
					return '::' + node.name;

				case 'Class':
					return '.' + node.name;

				case 'Id':
					return '#' + node.name;

				case 'Hash':
					return '#' + node.value;

				case 'Dimension':
					return node.value + node.unit;

				case 'Nth':
					return node.value;

				case 'Number':
					return node.value;

				case 'String':
					return node.value;

				case 'Operator':
					return node.value;

				case 'Raw':
					return node.value;

				case 'Percentage':
					return node.value + '%';

				case 'Space':
					return ' ';

				case 'Comment':
					return '/*' + node.value + '*/';

				default:
					throw new Error('Unknown node type: ' + node.type);
			}
		}

		return translate;
	};
	//#endregion

	//#region URL: /compressor/ast/walk
	modules['/compressor/ast/walk'] = function () {
		function walkRules(node, item, list) {
			switch (node.type) {
				case 'StyleSheet':
					var oldStylesheet = this.stylesheet;
					this.stylesheet = node;

					node.rules.each(walkRules, this);

					this.stylesheet = oldStylesheet;
					break;

				case 'Atrule':
					if (node.block !== null) {
						walkRules.call(this, node.block);
					}

					this.fn(node, item, list);
					break;

				case 'Ruleset':
					this.fn(node, item, list);
					break;
			}

		}

		function walkRulesRight(node, item, list) {
			switch (node.type) {
				case 'StyleSheet':
					var oldStylesheet = this.stylesheet;
					this.stylesheet = node;

					node.rules.eachRight(walkRulesRight, this);

					this.stylesheet = oldStylesheet;
					break;

				case 'Atrule':
					if (node.block !== null) {
						walkRulesRight.call(this, node.block);
					}

					this.fn(node, item, list);
					break;

				case 'Ruleset':
					this.fn(node, item, list);
					break;
			}
		}

		function walkAll(node, item, list) {
			switch (node.type) {
				case 'StyleSheet':
					var oldStylesheet = this.stylesheet;
					this.stylesheet = node;

					node.rules.each(walkAll, this);

					this.stylesheet = oldStylesheet;
					break;

				case 'Atrule':
					if (node.expression !== null) {
						walkAll.call(this, node.expression);
					}
					if (node.block !== null) {
						walkAll.call(this, node.block);
					}
					break;

				case 'Ruleset':
					this.ruleset = node;

					if (node.selector !== null) {
						walkAll.call(this, node.selector);
					}
					walkAll.call(this, node.block);

					this.ruleset = null;
					break;

				case 'Selector':
					var oldSelector = this.selector;
					this.selector = node;

					node.selectors.each(walkAll, this);

					this.selector = oldSelector;
					break;

				case 'Block':
					node.declarations.each(walkAll, this);
					break;

				case 'Declaration':
					this.declaration = node;

					walkAll.call(this, node.property);
					walkAll.call(this, node.value);

					this.declaration = null;
					break;

				case 'Attribute':
					walkAll.call(this, node.name);
					if (node.value !== null) {
						walkAll.call(this, node.value);
					}
					break;

				case 'FunctionalPseudo':
				case 'Function':
					this['function'] = node;

					node.arguments.each(walkAll, this);

					this['function'] = null;
					break;

				case 'Value':
				case 'Argument':
				case 'AtruleExpression':
				case 'SimpleSelector':
				case 'Braces':
				case 'Negation':
					node.sequence.each(walkAll, this);
					break;

				case 'Url':
				case 'Progid':
					walkAll.call(this, node.value);
					break;

				// nothig to do with
				// case 'Property':
				// case 'Combinator':
				// case 'Dimension':
				// case 'Hash':
				// case 'Identifier':
				// case 'Nth':
				// case 'Class':
				// case 'Id':
				// case 'Percentage':
				// case 'PseudoClass':
				// case 'PseudoElement':
				// case 'Space':
				// case 'Number':
				// case 'String':
				// case 'Operator':
				// case 'Raw':
			}

			this.fn(node, item, list);
		}

		function createContext(root, fn) {
			var context = {
				fn: fn,
				root: root,
				stylesheet: null,
				ruleset: null,
				selector: null,
				declaration: null,
				function: null
			};

			return context;
		}

		var exports = {
			all: function(root, fn) {
				walkAll.call(createContext(root, fn), root);
			},
			rules: function(root, fn) {
				walkRules.call(createContext(root, fn), root);
			},
			rulesRight: function(root, fn) {
				walkRulesRight.call(createContext(root, fn), root);
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
			Declaration: require('/compressor/clean/Declaration'),
			Identifier: require('/compressor/clean/Identifier')
		};

		var exports = function(node, item, list) {
			if (handlers.hasOwnProperty(node.type)) {
				handlers[node.type].call(this, node, item, list);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/clean/Atrule
	modules['/compressor/clean/Atrule'] = function () {
		var exports = function cleanAtrule(node, item, list) {
			if (node.block) {
				// otherwise removed at-rule don't prevent @import for removal
				this.root.firstAtrulesAllowed = false;

				if (node.block.type === 'Block' && node.block.declarations.isEmpty()) {
					list.remove(item);
					return;
				}

				if (node.block.type === 'StyleSheet' && node.block.rules.isEmpty()) {
					list.remove(item);
					return;
				}
			}

			switch (node.name) {
				case 'charset':
					if (node.expression.sequence.isEmpty()) {
						list.remove(item);
						return;
					}

					// if there is any rule before @charset -> remove it
					if (item.prev) {
						list.remove(item);
						return;
					}

					break;

				case 'import':
					if (!this.root.firstAtrulesAllowed) {
						list.remove(item);
						return;
					}

					// if there are some rules that not an @import or @charset before @import
					// remove it
					list.prevUntil(item.prev, function(rule) {
						if (rule.type === 'Atrule') {
							if (rule.name === 'import' || rule.name === 'charset') {
								return;
							}
						}

						this.root.firstAtrulesAllowed = false;
						list.remove(item);
						return true;
					}, this);

					break;
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/clean/Declaration
	modules['/compressor/clean/Declaration'] = function () {
		var exports = function cleanDeclartion(node, item, list) {
			if (node.value.sequence.isEmpty()) {
				list.remove(item);
			}
		};
	
		return exports;
	};
	//#endregion

	//#region URL: /compressor/clean/Identifier
	modules['/compressor/clean/Identifier'] = function () {
		var exports = function(node, item, list) {
			// remove useless universal selector
			if (this.selector !== null && node.name === '*') {
				// remove when universal selector isn't last
				if (item.next && item.next.data.type !== 'Combinator') {
					list.remove(item);
				}
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/clean/Ruleset
	modules['/compressor/clean/Ruleset'] = function () {
		var exports = function cleanRuleset(node, item, list) {
			if (node.selector.selectors.isEmpty() ||
				node.block.declarations.isEmpty()) {
				list.remove(item);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/clean/Space
	modules['/compressor/clean/Space'] = function () {
		function canCleanWhitespace(node, left) {
			if (node.type === 'Operator') {
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

		var exports = function cleanWhitespace(node, item, list) {
			var prev = item.prev && item.prev.data;
			var next = item.next && item.next.data;
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

			if (canCleanWhitespace(next, false) ||
				canCleanWhitespace(prev, true)) {
				list.remove(item);
				return;
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
			Url: require('/compressor/compress/Url'),
			Hash: require('/compressor/compress/color').compressHex,
			Identifier: require('/compressor/compress/color').compressIdent,
			Function: require('/compressor/compress/color').compressFunction
		};

		var exports = function(node, item, list) {
			if (handlers.hasOwnProperty(node.type)) {
				handlers[node.type].call(this, node, item, list);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/atrule/keyframes
	modules['/compressor/compress/atrule/keyframes'] = function () {
		var exports = function(node) {
			node.block.rules.each(function(ruleset) {
				ruleset.selector.selectors.each(function(simpleselector) {
					simpleselector.sequence.each(function(data, item) {
						if (data.type === 'Percentage' && data.value === '100') {
							item.data = {
								type: 'Identifier',
								info: data.info,
								name: 'to'
							};
						} else if (data.type === 'Identifier' && data.name === 'from') {
							item.data = {
								type: 'Percentage',
								info: data.info,
								value: '0'
							};
						}
					});
				});
			});
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/Atrule
	modules['/compressor/compress/Atrule'] = function () {
		var resolveKeyword = require('/compressor/ast/names').keyword;
		var compressKeyframes = require('/compressor/compress/atrule/keyframes');

		var exports = function(node) {
			// compress @keyframe selectors
			if (resolveKeyword(node.name).name === 'keyframes') {
				compressKeyframes(node);
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
		var List = require('/utils/list');
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
			var argument = functionArgs.head;
			var args = [];

			while (argument !== null) {
				var argumentPart = argument.data.sequence.head;
				var wasValue = false;

				while (argumentPart !== null) {
					var value = argumentPart.data;
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

					argumentPart = argumentPart.next;
				}

				argument = argument.next;
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

			return args.map(function(arg) {
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

		function compressFunction(node, item, list) {
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
					node.arguments.each(function(argument) {
						var item = argument.sequence.head;

						if (item.data.type === 'Operator') {
							item = item.next;
						}

						argument.sequence = new List([{
							type: 'Number',
							info: item.data.info,
							value: packNumber(args.shift())
						}]);
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
				var next = item.next;
				if (next && next.data.type !== 'Space') {
					list.insert(list.createItem({
						type: 'Space'
					}), next);
				}

				item.data = {
					type: 'Hash',
					info: node.info,
					value: toHex(args[0]) + toHex(args[1]) + toHex(args[2])
				};

				compressHex(item.data, item);
			}
		}

		function compressIdent(node, item) {
			if (this.declaration === null) {
				return;
			}

			var color = node.name.toLowerCase();

			if (NAME_TO_HEX.hasOwnProperty(color)) {
				var hex = NAME_TO_HEX[color];

				if (hex.length + 1 <= color.length) {
					// replace for shorter hex value
					item.data = {
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

		function compressHex(node, item) {
			var color = node.value.toLowerCase();

			// #112233 -> #123
			if (color.length === 6 &&
				color[0] === color[1] &&
				color[2] === color[3] &&
				color[4] === color[5]) {
				color = color[0] + color[2] + color[4];
			}

			if (HEX_TO_NAME[color]) {
				item.data = {
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

		var exports = function compressDimension(node, item) {
			var value = packNumber(node.value);
			var unit = node.unit;

			node.value = value;

			if (value === '0' && this.declaration && !NON_LENGTH_UNIT.hasOwnProperty(unit)) {
				// issue #200: don't remove units in flex property as it could change value meaning
				if (this.declaration.property.name === 'flex') {
					return;
				}

				// issue #222: don't remove units inside calc
				if (this['function'] && this['function'].name === 'calc') {
					return;
				}

				item.data = {
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

			if (value.length === 0 || value === '-') {
				value = '0';
			}

			return value;
		};

		var exports = function(node) {
			node.value = packNumber(node.value);
		};
		exports.pack = packNumber;

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/property/background
	modules['/compressor/compress/property/background'] = function () {
		var List = require('/utils/list');

		var exports = function compressBackground(node) {
			function lastType() {
				if (buffer.length) {
					return buffer[buffer.length - 1].type;
				}
			}

			function flush() {
				if (lastType() === 'Space') {
					buffer.pop();
				}

				if (!buffer.length) {
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

			node.sequence.each(function(node) {
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
			node.sequence = new List(newValue);
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/property/font
	modules['/compressor/compress/property/font'] = function () {
		var exports = function compressFont(node) {
			var list = node.sequence;

			list.eachRight(function(node, item) {
				if (node.type === 'Identifier') {
					if (node.name === 'bold') {
						item.data = {
							type: 'Number',
							info: node.info,
							value: '700'
						};
					} else if (node.name === 'normal') {
						var prev = item.prev;

						if (prev && prev.data.type === 'Operator' && prev.data.value === '/') {
							this.remove(prev);
						}

						this.remove(item);
					} else if (node.name === 'medium') {
						var next = item.next;

						if (!next || next.data.type !== 'Operator') {
							this.remove(item);
						}
					}
				}
			});

			// remove redundant spaces
			list.each(function(node, item) {
				if (node.type === 'Space') {
					if (!item.prev || !item.next || item.next.data.type === 'Space') {
						this.remove(item);
					}
				}
			});

			if (list.isEmpty()) {
				list.insert(list.createItem({
					type: 'Identifier',
					name: 'normal'
				}));
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/property/font-weight
	modules['/compressor/compress/property/font-weight'] = function () {
		var exports = function compressFontWeight(node) {
			var value = node.sequence.head.data;

			if (value.type === 'Identifier') {
				switch (value.name) {
					case 'normal':
						node.sequence.head.data = {
							type: 'Number',
							info: value.info,
							value: '400'
						};
						break;
					case 'bold':
						node.sequence.head.data = {
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

	//#region URL: /compressor/compress/Url
	modules['/compressor/compress/Url'] = function () {
		var UNICODE = '\\\\[0-9a-f]{1,6}(\\r\\n|[ \\n\\r\\t\\f])?';
		var ESCAPE = '(' + UNICODE + '|\\\\[^\\n\\r\\f0-9a-fA-F])';
		var NONPRINTABLE = '\u0000\u0008\u000b\u000e-\u001f\u007f';
		var SAFE_URL = new RegExp('^(' + ESCAPE + '|[^\"\'\\(\\)\\\\\\s' + NONPRINTABLE + '])*$', 'i');

		var exports = function(node) {
			var value = node.value;

			if (value.type !== 'String') {
				return;
			}

			var quote = value.value[0];
			var url = value.value.substr(1, value.value.length - 2);

			// convert `\\` to `/`
			url = url.replace(/\\\\/g, '/');

			// remove quotes when safe
			// https://www.w3.org/TR/css-syntax-3/#url-unquoted-diagram
			if (SAFE_URL.test(url)) {
				node.value = {
					type: 'Raw',
					info: node.value.info,
					value: url
				};
			} else {
				// use double quotes if string has no double quotes
				// otherwise use original quotes
				// TODO: make better quote type selection
				node.value.value = url.indexOf('"') === -1 ? '"' + url + '"' : quote + url + quote;
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress/Value
	modules['/compressor/compress/Value'] = function () {
		var resolveName = require('/compressor/ast/names').property;
		var handlers = {
			'font': require('/compressor/compress/property/font'),
			'font-weight': require('/compressor/compress/property/font-weight'),
			'background': require('/compressor/compress/property/background')
		};

		var exports = function compressValue(node) {
			if (!this.declaration) {
				return;
			}

			var property = resolveName(this.declaration.property.name);

			if (handlers.hasOwnProperty(property.name)) {
				handlers[property.name](node);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure
	modules['/compressor/restructure'] = function () {
		var internalWalkRules = require('/compressor/ast/walk').rules;
		var internalWalkRulesRight = require('/compressor/ast/walk').rulesRight;
		var translate = require('/compressor/ast/translate');
		var prepare = require('/compressor/restructure/prepare');
		var initialMergeRuleset = require('/compressor/restructure/1-initialMergeRuleset');
		var mergeAtrule = require('/compressor/restructure/2-mergeAtrule');
		var disjoinRuleset = require('/compressor/restructure/3-disjoinRuleset');
		var restructShorthand = require('/compressor/restructure/4-restructShorthand');
		var restructBlock = require('/compressor/restructure/6-restructBlock');
		var mergeRuleset = require('/compressor/restructure/7-mergeRuleset');
		var restructRuleset = require('/compressor/restructure/8-restructRuleset');

		function Index() {
			this.seed = 0;
			this.map = Object.create(null);
		}

		Index.prototype.resolve = function(str) {
			var index = this.map[str];

			if (!index) {
				index = ++this.seed;
				this.map[str] = index;
			}

			return index;
		};

		var exports = function(ast/*, debug*/) {
			function walkRulesets(name, fn) {
				internalWalkRules(ast, function(node, item, list) {
					if (node.type === 'Ruleset') {
						fn.call(this, node, item, list);
					}
				});

//				debug(name, ast);
			}

			function walkRulesetsRight(name, fn) {
				internalWalkRulesRight(ast, function(node, item, list) {
					if (node.type === 'Ruleset') {
						fn.call(this, node, item, list);
					}
				});

//				debug(name, ast);
			}

			function walkAtrules(name, fn) {
				internalWalkRulesRight(ast, function(node, item, list) {
					if (node.type === 'Atrule') {
						fn.call(this, node, item, list);
					}
				});

//				debug(name, ast);
			}

			var declarationMarker = (function() {
				var names = new Index();
				var values = new Index();

				return function markDeclaration(node) {
					// node.id = translate(node);

					var property = node.property.name;
					var value = translate(node.value);

					node.id = names.resolve(property) + (values.resolve(value) << 12);
					node.length = property.length + 1 + value.length;

					return node;
				};
			})();

			// prepare ast for restructing
			internalWalkRules(ast, function(node) {
				prepare(node, declarationMarker);
			});
//			debug('prepare', ast);

			// todo: remove initial merge
			walkRulesetsRight('initialMergeRuleset', initialMergeRuleset);
			walkAtrules('mergeAtrule', mergeAtrule);
			walkRulesetsRight('disjoinRuleset', disjoinRuleset);

			restructShorthand(ast, declarationMarker);
//			debug('restructShorthand', ast);

			restructBlock(ast);
//			debug('restructBlock', ast);

			walkRulesets('mergeRuleset', mergeRuleset);
			walkRulesetsRight('restructRuleset', restructRuleset);
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/1-initialMergeRuleset
	modules['/compressor/restructure/1-initialMergeRuleset'] = function () {
		var utils = require('/compressor/restructure/utils');

		var exports = function initialMergeRuleset(node, item, list) {
			var selector = node.selector.selectors;
			var block = node.block;

			list.prevUntil(item.prev, function(prev) {
				if (prev.type !== 'Ruleset') {
					return true;
				}

				if (node.pseudoSignature !== prev.pseudoSignature) {
					return true;
				}

				var prevSelector = prev.selector.selectors;
				var prevBlock = prev.block;

				// try to join by selectors
				if (utils.isEqualLists(prevSelector, selector)) {
					prevBlock.declarations.appendList(block.declarations);
					list.remove(item);
					return true;
				}

				// try to join by properties
				var diff = utils.compareDeclarations(block.declarations, prevBlock.declarations);

				if (!diff.ne1.length && !diff.ne2.length) {
					utils.addToSelector(prevSelector, selector);
					list.remove(item);
					return true;
				}

				// go to next ruleset if simpleselectors has no equal specificity and element selector
				return selector.some(function(a) {
					return prevSelector.some(function(b) {
						return a.compareMarker === b.compareMarker;
					});
				});
			});
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/2-mergeAtrule
	modules['/compressor/restructure/2-mergeAtrule'] = function () {
		function isMediaRule(node) {
			return node.type === 'Atrule' && node.name === 'media';
		}

		var exports = function rejoinAtrule(node, item, list) {
			if (!isMediaRule(node)) {
				return;
			}

			var prev = item.prev && item.prev.data;

			if (!prev || !isMediaRule(prev)) {
				return;
			}

			// merge @media with same query
			if (node.expression.id === prev.expression.id) {
				prev.block.rules.appendList(node.block.rules);
				prev.info = {
					primary: prev.info,
					merged: node.info
				};
				list.remove(item);
			}
		};
		
		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/3-disjoinRuleset
	modules['/compressor/restructure/3-disjoinRuleset'] = function () {
		var List = require('/utils/list');

		var exports = function disjoin(node, item, list) {
			var selectors = node.selector.selectors;

			// generate new rule sets:
			// .a, .b { color: red; }
			// ->
			// .a { color: red; }
			// .b { color: red; }

			// while there are more than 1 simple selector split for rulesets
			while (selectors.head !== selectors.tail) {
				var newSelectors = new List();
				newSelectors.insert(selectors.remove(selectors.head));

				list.insert(list.createItem({
					type: 'Ruleset',
					info: node.info,
					pseudoSignature: node.pseudoSignature,
					selector: {
						type: 'Selector',
						info: node.selector.info,
						selectors: newSelectors
					},
					block: {
						type: 'Block',
						info: node.block.info,
						declarations: node.block.declarations.copy()
					}
				}), item);
			}
		};
		
		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/4-restructShorthand
	modules['/compressor/restructure/4-restructShorthand'] = function () {
		var List = require('/utils/list');
		var translate = require('/compressor/ast/translate');
		var internalWalkRulesRight = require('/compressor/ast/walk').rulesRight;

		var REPLACE = 1;
		var REMOVE = 2;
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

		function TRBL(name) {
			this.name = name;
			this.info = null;
			this.iehack = undefined;
			this.sides = {
				'top': null,
				'right': null,
				'bottom': null,
				'left': null
			};
		}

		TRBL.prototype.getValueSequence = function(value, count) {
			var values = [];
			var iehack = false;
			var hasBadValues = value.sequence.some(function(child) {
				var special = false;

				switch (child.type) {
					case 'Identifier':
						switch (child.name) {
							case '\\9':
								iehack = true;
								return;

							case 'inherit':
							case 'initial':
							case 'unset':
							case 'revert':
								special = child.name;
								break;
						}
						break;

					case 'Dimension':
						switch (child.unit) {
							// is not supported until IE11
							case 'rem':

							// v* units is too buggy across browsers and better
							// don't merge values with those units
							case 'vw':
							case 'vh':
							case 'vmin':
							case 'vmax':
							case 'vm': // IE9 supporting "vm" instead of "vmin".
								special = child.unit;
								break;
						}
						break;

					case 'Number':
					case 'Percentage':
						break;

					case 'Space':
						return false; // ignore space

					default:
						return true;  // bad value
				}

				values.push({
					node: child,
					special: special,
					important: value.important
				});
			});

			if (hasBadValues || values.length > count) {
				return false;
			}

			if (typeof this.iehack === 'boolean' && this.iehack !== iehack) {
				return false;
			}

			this.iehack = iehack; // move outside

			return values;
		};

		TRBL.prototype.canOverride = function(side, value) {
			var currentValue = this.sides[side];

			return !currentValue || (value.important && !currentValue.important);
		};

		TRBL.prototype.add = function(name, value, info) {
			function attemptToAdd() {
				var sides = this.sides;
				var side = SIDE[name];

				if (side) {
					if (side in sides) {
						var values = this.getValueSequence(value, 1);

						if (!values || !values.length) {
							return false;
						}

						// can mix only if specials are equal
						for (var key in sides) {
							if (sides[key] !== null && sides[key].special !== values[0].special) {
								return false;
							}
						}

						if (!this.canOverride(side, values[0])) {
							return true;
						}

						sides[side] = values[0];
						return true;
					}
				} else if (name === this.name) {
					var values = this.getValueSequence(value, 4);

					if (!values || !values.length) {
						return false;
					}

					switch (values.length) {
						case 1:
							values[RIGHT] = values[TOP];
							values[BOTTOM] = values[TOP];
							values[LEFT] = values[TOP];
							break;

						case 2:
							values[BOTTOM] = values[TOP];
							values[LEFT] = values[RIGHT];
							break;

						case 3:
							values[LEFT] = values[RIGHT];
							break;
					}

					// can mix only if specials are equal
					for (var i = 0; i < 4; i++) {
						for (var key in sides) {
							if (sides[key] !== null && sides[key].special !== values[i].special) {
								return false;
							}
						}
					}

					for (var i = 0; i < 4; i++) {
						if (this.canOverride(SIDES[i], values[i])) {
							sides[SIDES[i]] = values[i];
						}
					}

					return true;
				}
			}

			if (!attemptToAdd.call(this)) {
				return false;
			}

			if (this.info) {
				this.info = {
					primary: this.info,
					merged: info
				};
			} else {
				this.info = info;
			}

			return true;
		};

		TRBL.prototype.isOkToMinimize = function() {
			var top = this.sides.top;
			var right = this.sides.right;
			var bottom = this.sides.bottom;
			var left = this.sides.left;

			if (top && right && bottom && left) {
				var important =
					top.important +
					right.important +
					bottom.important +
					left.important;

				return important === 0 || important === 4;
			}

			return false;
		};

		TRBL.prototype.getValue = function() {
			var result = [];
			var sides = this.sides;
			var values = [
				sides.top,
				sides.right,
				sides.bottom,
				sides.left
			];
			var stringValues = [
				translate(sides.top.node),
				translate(sides.right.node),
				translate(sides.bottom.node),
				translate(sides.left.node)
			];

			if (stringValues[LEFT] === stringValues[RIGHT]) {
				values.pop();
				if (stringValues[BOTTOM] === stringValues[TOP]) {
					values.pop();
					if (stringValues[RIGHT] === stringValues[TOP]) {
						values.pop();
					}
				}
			}

			for (var i = 0; i < values.length; i++) {
				if (i) {
					result.push({ type: 'Space' });
				}

				result.push(values[i].node);
			}

			if (this.iehack) {
				result.push({ type: 'Space' }, {
					type: 'Identifier',
					info: {},
					name: '\\9'
				});
			}

			return {
				type: 'Value',
				info: {},
				important: sides.top.important,
				sequence: new List(result)
			};
		};

		TRBL.prototype.getProperty = function() {
			return {
				type: 'Property',
				info: {},
				name: this.name
			};
		};

		function processRuleset(ruleset, shorts, shortDeclarations, lastShortSelector) {
			var declarations = ruleset.block.declarations;
			var selector = ruleset.selector.selectors.first().id;

			ruleset.block.declarations.eachRight(function(declaration, item) {
				var property = declaration.property.name;

				if (!MAIN_PROPERTY.hasOwnProperty(property)) {
					return;
				}

				var key = MAIN_PROPERTY[property];
				var shorthand;
				var operation;

				if (!lastShortSelector || selector === lastShortSelector) {
					if (key in shorts) {
						operation = REMOVE;
						shorthand = shorts[key];
					}
				}

				if (!shorthand || !shorthand.add(property, declaration.value, declaration.info)) {
					operation = REPLACE;
					shorthand = new TRBL(key);
					shorthand.add(property, declaration.value, declaration.info);
				}

				shorts[key] = shorthand;
				shortDeclarations.push({
					operation: operation,
					block: declarations,
					item: item,
					shorthand: shorthand
				});

				lastShortSelector = selector;
			});

			return lastShortSelector;
		};

		function processShorthands(shortDeclarations, markDeclaration) {
			shortDeclarations.forEach(function(item) {
				var shorthand = item.shorthand;

				if (!shorthand.isOkToMinimize()) {
					return;
				}

				if (item.operation === REPLACE) {
					item.item.data = markDeclaration({
						type: 'Declaration',
						info: shorthand.info,
						property: shorthand.getProperty(),
						value: shorthand.getValue(),
						id: 0,
						length: 0,
						fingerprint: null
					});
				} else {
					item.block.remove(item.item);
				}
			});
		};

		var exports = function restructBlock(ast, declarationMarker) {
			var stylesheetMap = {};
			var shortDeclarations = [];

			internalWalkRulesRight(ast, function(node) {
				if (node.type !== 'Ruleset') {
					return;
				}

				var stylesheet = this.stylesheet;
				var rulesetId = (node.pseudoSignature || '') + '|' + node.selector.selectors.first().id;
				var rulesetMap;
				var shorts;

				if (!stylesheetMap.hasOwnProperty(stylesheet.id)) {
					rulesetMap = {
						lastShortSelector: null
					};
					stylesheetMap[stylesheet.id] = rulesetMap;
				} else {
					rulesetMap = stylesheetMap[stylesheet.id];
				}

				if (rulesetMap.hasOwnProperty(rulesetId)) {
					shorts = rulesetMap[rulesetId];
				} else {
					shorts = {};
					rulesetMap[rulesetId] = shorts;
				}

				rulesetMap.lastShortSelector = processRuleset.call(this, node, shorts, shortDeclarations, rulesetMap.lastShortSelector);
			});

			processShorthands(shortDeclarations, declarationMarker);
		};
		
		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/6-restructBlock
	modules['/compressor/restructure/6-restructBlock'] = function () {
		var resolveProperty = require('/compressor/ast/names').property;
		var resolveKeyword = require('/compressor/ast/names').keyword;
		var internalWalkRulesRight = require('/compressor/ast/walk').rulesRight;
		var translate = require('/compressor/ast/translate');
		var dontRestructure = {
			'src': 1 // https://github.com/afelix/csso/issues/50
		};

		var DONT_MIX_VALUE = {
			// https://developer.mozilla.org/en-US/docs/Web/CSS/display#Browser_compatibility
			'display': /table|ruby|flex|-(flex)?box$|grid|contents|run-in/i,
			// https://developer.mozilla.org/en/docs/Web/CSS/text-align
			'text-align': /^(start|end|match-parent|justify-all)$/i
		};

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

		function getPropertyFingerprint(propertyName, declaration, fingerprints) {
			var realName = resolveProperty(propertyName).name;

			if (realName === 'background' ||
			   (realName === 'filter' && declaration.value.sequence.first().type === 'Progid')) {
				return propertyName + ':' + translate(declaration.value);
			}

			var declarationId = declaration.id;
			var fingerprint = fingerprints[declarationId];

			if (!fingerprint) {
				var vendorId = '';
				var hack9 = '';
				var special = {};

				declaration.value.sequence.each(function(node) {
					switch (node.type) {
						case 'Identifier':
							var name = node.name;

							if (!vendorId) {
								vendorId = resolveKeyword(name).vendor;
							}

							if (name === '\\9') {
								hack9 = name;
							}

							if (DONT_MIX_VALUE.hasOwnProperty(realName) &&
								DONT_MIX_VALUE[realName].test(name)) {
								special[name] = true;
							}

							break;

						case 'Function':
							var name = node.name;

							if (!vendorId) {
								vendorId = resolveKeyword(name).vendor;
							}

							if (name === 'rect') {
								// there are 2 forms of rect:
								//   rect(<top>, <right>, <bottom>, <left>) - standart
								//   rect(<top> <right> <bottom> <left>) – backwards compatible syntax
								// only the same form values can be merged
								if (node.arguments.size < 4) {
									name = 'rect-backward';
								}
							}

							special[name + '()'] = true;
							break;

						case 'Dimension':
							var unit = node.unit;

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
				});

				fingerprint = '|' + Object.keys(special).sort() + '|' + hack9 + vendorId;

				fingerprints[declarationId] = fingerprint;
			}

			return propertyName + fingerprint;
		}

		function needless(props, declaration, fingerprints) {
			var property = resolveProperty(declaration.property.name);

			if (NEEDLESS_TABLE.hasOwnProperty(property.name)) {
				var table = NEEDLESS_TABLE[property.name];

				for (var i = 0; i < table.length; i++) {
					var ppre = getPropertyFingerprint(property.prefix + table[i], declaration, fingerprints);
					var prev = props[ppre];

					if (prev && (!declaration.value.important || prev.item.data.value.important)) {
						return prev;
					}
				}
			}
		}

		function processRuleset(ruleset, item, list, props, fingerprints) {
			var declarations = ruleset.block.declarations;

			declarations.eachRight(function(declaration, declarationItem) {
				var property = declaration.property.name;
				var fingerprint = getPropertyFingerprint(property, declaration, fingerprints);
				var prev = props[fingerprint];

				if (prev && !dontRestructure.hasOwnProperty(property)) {
					if (declaration.value.important && !prev.item.data.value.important) {
						props[fingerprint] = {
							block: declarations,
							item: declarationItem
						};

						prev.block.remove(prev.item);
						declaration.info = {
							primary: declaration.info,
							merged: prev.item.data.info
						};
					} else {
						declarations.remove(declarationItem);
						prev.item.data.info = {
							primary: prev.item.data.info,
							merged: declaration.info
						};
					}
				} else {
					var prev = needless(props, declaration, fingerprints);

					if (prev) {
						declarations.remove(declarationItem);
						prev.item.data.info = {
							primary: prev.item.data.info,
							merged: declaration.info
						};
					} else {
						declaration.fingerprint = fingerprint;

						props[fingerprint] = {
							block: declarations,
							item: declarationItem
						};
					}
				}
			});

			if (declarations.isEmpty()) {
				list.remove(item);
			}
		};

		var exports = function restructBlock(ast) {
			var stylesheetMap = {};
			var fingerprints = Object.create(null);

			internalWalkRulesRight(ast, function(node, item, list) {
				if (node.type !== 'Ruleset') {
					return;
				}

				var stylesheet = this.stylesheet;
				var rulesetId = (node.pseudoSignature || '') + '|' + node.selector.selectors.first().id;
				var rulesetMap;
				var props;

				if (!stylesheetMap.hasOwnProperty(stylesheet.id)) {
					rulesetMap = {};
					stylesheetMap[stylesheet.id] = rulesetMap;
				} else {
					rulesetMap = stylesheetMap[stylesheet.id];
				}

				if (rulesetMap.hasOwnProperty(rulesetId)) {
					props = rulesetMap[rulesetId];
				} else {
					props = {};
					rulesetMap[rulesetId] = props;
				}

				processRuleset.call(this, node, item, list, props, fingerprints);
			});
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/7-mergeRuleset
	modules['/compressor/restructure/7-mergeRuleset'] = function () {
		var utils = require('/compressor/restructure/utils');

		var exports = function mergeRuleset(node, item, list) {
			var selector = node.selector.selectors;
			var block = node.block.declarations;
			var nodeCompareMarker = selector.first().compareMarker;
			var skippedCompareMarkers = {};

			list.nextUntil(item.next, function(next, nextItem) {
				if (next.type !== 'Ruleset') {
					return true;
				}

				if (node.pseudoSignature !== next.pseudoSignature) {
					return true;
				}

				var nextFirstSelector = next.selector.selectors.head;
				var nextBlock = next.block.declarations;
				var nextCompareMarker = nextFirstSelector.data.compareMarker;

				// if next ruleset has same marked as one of skipped then stop joining
				if (nextCompareMarker in skippedCompareMarkers) {
					return true;
				}

				// try to join by selectors
				if (selector.head === selector.tail) {
					if (selector.first().id === nextFirstSelector.data.id) {
						block.appendList(nextBlock);
						list.remove(nextItem);
						return;
					}
				}

				// try to join by properties
				if (utils.isEqualDeclarations(block, nextBlock)) {
					var nextStr = nextFirstSelector.data.id;

					selector.some(function(data, item) {
						var curStr = data.id;

						if (nextStr === curStr) {
							return true;
						}

						if (nextStr < curStr) {
							selector.insert(nextFirstSelector, item);
							return true;
						}

						if (!item.next) {
							selector.insert(nextFirstSelector);
							return true;
						}
					});

					list.remove(nextItem);
					return;
				}

				// go to next ruleset if current one can be skipped (has no equal specificity nor element selector)
				if (nextCompareMarker === nodeCompareMarker) {
					return true;
				}

				skippedCompareMarkers[nextCompareMarker] = true;
			});
		};
		
		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/8-restructRuleset
	modules['/compressor/restructure/8-restructRuleset'] = function () {
		var List = require('/utils/list');
		var utils = require('/compressor/restructure/utils');

		function calcSelectorLength(list) {
			var length = 0;

			list.each(function(data) {
				length += data.id.length + 1;
			});

			return length - 1;
		}

		function calcDeclarationsLength(tokens) {
			var length = 0;

			for (var i = 0; i < tokens.length; i++) {
				length += tokens[i].length;
			}

			return (
				length +          // declarations
				tokens.length - 1 // delimeters
			);
		}

		var exports = function restructRuleset(node, item, list) {
			var avoidRulesMerge = this.stylesheet.avoidRulesMerge;
			var selector = node.selector.selectors;
			var block = node.block;
			var skippedCompareMarkers = Object.create(null);

			list.prevUntil(item.prev, function(prev, prevItem) {
				if (prev.type !== 'Ruleset') {
					return true;
				}

				var prevSelector = prev.selector.selectors;
				var prevBlock = prev.block;

				if (node.pseudoSignature !== prev.pseudoSignature) {
					return true;
				}

				// try prev ruleset if simpleselectors has no equal specifity and element selector
				var prevSelectorCursor = prevSelector.head;
				while (prevSelectorCursor) {
					if (prevSelectorCursor.data.compareMarker in skippedCompareMarkers) {
						return true;
					}

					prevSelectorCursor = prevSelectorCursor.next;
				}

				// try to join by selectors
				if (utils.isEqualLists(prevSelector, selector)) {
					prevBlock.declarations.appendList(block.declarations);
					list.remove(item);
					return true;
				}

				// try to join by properties
				var diff = utils.compareDeclarations(block.declarations, prevBlock.declarations);

				// console.log(diff.eq, diff.ne1, diff.ne2);

				if (diff.eq.length) {
					if (!diff.ne1.length && !diff.ne2.length) {
						// equal blocks
						utils.addToSelector(selector, prevSelector);
						list.remove(prevItem);
						return true;
					} else if (!avoidRulesMerge) { /* probably we don't need to prevent those merges for @keyframes
													  TODO: need to be checked */

						if (diff.ne1.length && !diff.ne2.length) {
							// prevBlock is subset block
							var selectorLength = calcSelectorLength(selector);
							var blockLength = calcDeclarationsLength(diff.eq); // declarations length

							if (selectorLength < blockLength) {
								utils.addToSelector(prevSelector, selector);
								node.block.declarations = new List(diff.ne1);
							}
						} else if (!diff.ne1.length && diff.ne2.length) {
							// node is subset of prevBlock
							var selectorLength = calcSelectorLength(prevSelector);
							var blockLength = calcDeclarationsLength(diff.eq); // declarations length

							if (selectorLength < blockLength) {
								utils.addToSelector(selector, prevSelector);
								prev.block.declarations = new List(diff.ne2);
							}
						} else {
							// diff.ne1.length && diff.ne2.length
							// extract equal block
							var newSelector = {
								type: 'Selector',
								info: {},
								selectors: utils.addToSelector(prevSelector.copy(), selector)
							};
							var newBlockLength = calcSelectorLength(newSelector.selectors) + 2; // selectors length + curly braces length
							var blockLength = calcDeclarationsLength(diff.eq); // declarations length

							// create new ruleset if declarations length greater than
							// ruleset description overhead
							if (blockLength >= newBlockLength) {
								var newRuleset = {
									type: 'Ruleset',
									info: {},
									pseudoSignature: node.pseudoSignature,
									selector: newSelector,
									block: {
										type: 'Block',
										info: {},
										declarations: new List(diff.eq)
									}
								};

								node.block.declarations = new List(diff.ne1);
								prev.block.declarations = new List(diff.ne2.concat(diff.ne2overrided));
								list.insert(list.createItem(newRuleset), prevItem);
								return true;
							}
						}
					}
				}

				prevSelector.each(function(data) {
					skippedCompareMarkers[data.compareMarker] = true;
				});
			});
		};
		
		return exports;
	};
	//#endregion

	//#region URL: /compressor/restructure/prepare
	modules['/compressor/restructure/prepare'] = function () {
		var resolveKeyword = require('/compressor/ast/names').keyword;
		var translate = require('/compressor/ast/translate');
		var processSelector = require('/compressor/restructure/prepare/processSelector');

		var exports = function walk(node, markDeclaration) {
			switch (node.type) {
				case 'Ruleset':
					node.block.declarations.each(markDeclaration);
					processSelector(node);
					break;

				case 'Atrule':
					if (node.expression) {
						node.expression.id = translate(node.expression);
					}

					// compare keyframe selectors by its values
					// NOTE: still no clarification about problems with keyframes selector grouping (issue #197)
					if (resolveKeyword(node.name).name === 'keyframes') {
						node.block.avoidRulesMerge = true;  /* probably we don't need to prevent those merges for @keyframes
															   TODO: need to be checked */
						node.block.rules.each(function(ruleset) {
							ruleset.selector.selectors.each(function(simpleselector) {
								simpleselector.compareMarker = simpleselector.id;
							});
						});
					}
					break;
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/prepare/processSelector
	modules['/compressor/restructure/prepare/processSelector'] = function () {
		var translate = require('/compressor/ast/translate');
		var specificity = require('/compressor/restructure/prepare/specificity');

		var nonFreezePseudoElements = {
			'first-letter': true,
			'first-line': true,
			'after': true,
			'before': true
		};
		var nonFreezePseudoClasses = {
			'link': true,
			'visited': true,
			'hover': true,
			'active': true,
			'first-letter': true,
			'first-line': true,
			'after': true,
			'before': true
		};

		var exports = function freeze(node) {
			var pseudos = Object.create(null);
			var hasPseudo = false;

			node.selector.selectors.each(function(simpleSelector) {
				var list = simpleSelector.sequence;
				var last = list.tail;
				var tagName = '*';

				while (last && last.prev && last.prev.data.type !== 'Combinator') {
					last = last.prev;
				}

				if (last && last.data.type === 'Identifier') {
					tagName = last.data.name;
				}

				simpleSelector.compareMarker = specificity(simpleSelector) + ',' + tagName;
				simpleSelector.id = translate(simpleSelector);

				simpleSelector.sequence.each(function(node) {
					switch (node.type) {
						case 'PseudoClass':
							if (!nonFreezePseudoClasses.hasOwnProperty(node.name)) {
								pseudos[node.name] = true;
								hasPseudo = true;
							}
							break;

						case 'PseudoElement':
							if (!nonFreezePseudoElements.hasOwnProperty(node.name)) {
								pseudos[node.name] = true;
								hasPseudo = true;
							}
							break;

						case 'FunctionalPseudo':
							pseudos[node.name] = true;
							hasPseudo = true;
							break;
					}
				});
			});

			if (hasPseudo) {
				node.pseudoSignature = Object.keys(pseudos).sort().join(',');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/restructure/prepare/specificity
	modules['/compressor/restructure/prepare/specificity'] = function () {
		var exports = function specificity(simpleSelector) {
			var A = 0;
			var B = 0;
			var C = 0;

			simpleSelector.sequence.each(function walk(data) {
				switch (data.type) {
					case 'SimpleSelector':
					case 'Negation':
						data.sequence.each(walk);
						break;

					case 'Id':
						A++;
						break;

					case 'Class':
					case 'Attribute':
					case 'FunctionalPseudo':
						B++;
						break;

					case 'Identifier':
						if (data.name !== '*') {
							C++;
						}
						break;

					case 'PseudoElement':
						C++;
						break;

					case 'PseudoClass':
						var name = data.name.toLowerCase();
						if (name === 'before' ||
							name === 'after' ||
							name === 'first-line' ||
							name === 'first-letter') {
							C++;
						} else {
							B++;
						}
						break;
				}
			});

			return [A, B, C];
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/restructure/utils
	modules['/compressor/restructure/utils'] = function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty;

		function isEqualLists(a, b) {
			var cursor1 = a.head;
			var cursor2 = b.head;

			while (cursor1 && cursor2 && cursor1.data.id === cursor2.data.id) {
				cursor1 = cursor1.next;
				cursor2 = cursor2.next;
			}

			return cursor1 === null && cursor2 === null;
		}

		function isEqualDeclarations(a, b) {
			var cursor1 = a.head;
			var cursor2 = b.head;

			while (cursor1 && cursor2 && cursor1.data.id === cursor2.data.id) {
				cursor1 = cursor1.next;
				cursor2 = cursor2.next;
			}

			return cursor1 === null && cursor2 === null;
		}

		function compareDeclarations(declarations1, declarations2) {
			var result = {
				eq: [],
				ne1: [],
				ne2: [],
				ne2overrided: []
			};

			var fingerprints = Object.create(null);
			var declarations2hash = Object.create(null);

			for (var cursor = declarations2.head; cursor; cursor = cursor.next)  {
				declarations2hash[cursor.data.id] = true;
			}

			for (var cursor = declarations1.head; cursor; cursor = cursor.next)  {
				var data = cursor.data;

				if (data.fingerprint) {
					fingerprints[data.fingerprint] = data.value.important;
				}

				if (declarations2hash[data.id]) {
					declarations2hash[data.id] = false;
					result.eq.push(data);
				} else {
					result.ne1.push(data);
				}
			}

			for (var cursor = declarations2.head; cursor; cursor = cursor.next)  {
				var data = cursor.data;

				if (declarations2hash[data.id]) {
					// if declarations1 has overriding declaration, this is not a difference
					// but take in account !important - prev should be equal or greater than follow
					if (hasOwnProperty.call(fingerprints, data.fingerprint) &&
						Number(fingerprints[data.fingerprint]) >= Number(data.value.important)) {
						result.ne2overrided.push(data);
					} else {
						result.ne2.push(data);
					}
				}
			}

			return result;
		}

		function addToSelector(dest, source) {
			source.each(function(sourceData) {
				var newStr = sourceData.id;
				var cursor = dest.head;

				while (cursor) {
					var nextStr = cursor.data.id;

					if (nextStr === newStr) {
						return;
					}

					if (nextStr > newStr) {
						break;
					}

					cursor = cursor.next;
				}

				dest.insert(dest.createItem(sourceData), cursor);
			});

			return dest;
		}

		var exports = {
			isEqualLists: isEqualLists,
			isEqualDeclarations: isEqualDeclarations,
			compareDeclarations: compareDeclarations,
			addToSelector: addToSelector
		};

		return exports;
	};
	//#endregion
		
	//#region URL: /parser
	modules['/parser'] = function () {
		'use strict';

		var TokenType = require('/parser/const').TokenType;
		var NodeType = require('/parser/const').NodeType;
		var tokenize = require('/parser/tokenize');
		var cleanInfo = require('/utils/cleanInfo');
		var needPositions;
		var filename;
		var tokens;
		var pos;

		var SCOPE_ATRULE_EXPRESSION = 1;
		var SCOPE_SELECTOR = 2;
		var SCOPE_VALUE = 3;

		var specialFunctions = {};
		specialFunctions[SCOPE_ATRULE_EXPRESSION] = {
			url: getUri
		};
		specialFunctions[SCOPE_SELECTOR] = {
			url: getUri,
			not: getNotFunction
		};
		specialFunctions[SCOPE_VALUE] = {
			url: getUri,
			expression: getOldIEExpression,
			var: getVarFunction
		};

		var rules = {
			'atkeyword': getAtkeyword,
			'atruleb': getAtrule,
			'atruler': getAtrule,
			'atrules': getAtrule,
			'attrib': getAttrib,
			'attrselector': getAttrselector,
			'block': getBlock,
			'braces': getBraces,
			'clazz': getClass,
			'combinator': getCombinator,
			'comment': getComment,
			'declaration': getDeclaration,
			'dimension': getDimension,
			'filter': getDeclaration,
			'functionExpression': getOldIEExpression,
			'funktion': getFunction,
			'ident': getIdentifier,
			'important': getImportant,
			'nth': getNth,
			'nthselector': getNthSelector,
			'number': getNumber,
			'operator': getOperator,
			'percentage': getPercentage,
			'progid': getProgid,
			'property': getProperty,
			'pseudoc': getPseudoc,
			'pseudoe': getPseudoe,
			'ruleset': getRuleset,
			'selector': getSelector,
			'shash': getShash,
			'simpleselector': getSimpleSelector,
			'string': getString,
			'stylesheet': getStylesheet,
			'unary': getUnary,
			'unknown': getUnknown,
			'uri': getUri,
			'value': getValue,
			'vhash': getVhash
		};

		function parseError(message) {
			var error = new Error(message);
			var line = 1;
			var column = 1;
			var lines;

			if (tokens.length) {
				if (pos < tokens.length) {
					line = tokens[pos].line;
					column = tokens[pos].column;
				} else {
					pos = tokens.length - 1;
					lines = tokens[pos].value.trimRight().split(/\n|\r\n?|\f/);
					line = tokens[pos].line + lines.length - 1;
					column = lines.length > 1
						? lines[lines.length - 1].length + 1
						: tokens[pos].column + lines[lines.length - 1].length;
				}

			}

			error.name = 'CssSyntaxError';
			error.parseError = {
				line: line,
				column: column
			};

			throw error;
		}

		function eat(tokenType) {
			if (pos < tokens.length && tokens[pos].type === tokenType) {
				pos++;
				return true;
			}

			parseError(tokenType + ' is expected');
		}

		function expectIdentifier(name, eat) {
			if (pos < tokens.length) {
				var token = tokens[pos];
				if (token.type === TokenType.Identifier &&
					token.value.toLowerCase() === name) {
					if (eat) {
						pos++;
					}

					return true;
				}
			}

			parseError('Identifier `' + name + '` is expected');
		}

		function expectAny(what) {
			if (pos < tokens.length) {
				for (var i = 1, type = tokens[pos].type; i < arguments.length; i++) {
					if (type === arguments[i]) {
						return true;
					}
				}
			}

			parseError(what + ' is expected');
		}

		function getInfo(idx) {
			if (needPositions && idx < tokens.length) {
				var token = tokens[idx];

				return {
					source: filename,
					offset: token.offset,
					line: token.line,
					column: token.column
				};
			}

			return null;

		}

		function getStylesheet(nested) {
			var stylesheet = [getInfo(pos), NodeType.StylesheetType];

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.Space:
						stylesheet.push(getS());
						break;

					case TokenType.Comment:
						stylesheet.push(getComment());
						break;

					case TokenType.Unknown:
						stylesheet.push(getUnknown());
						break;

					case TokenType.CommercialAt:
						stylesheet.push(getAtrule());
						break;

					case TokenType.RightCurlyBracket:
						if (!nested) {
							parseError('Unexpected right curly brace');
						}

						break scan;

					default:
						stylesheet.push(getRuleset());
				}
			}

			return stylesheet;
		}

		function isBlockAtrule(i) {
			for (i++; i < tokens.length; i++) {
				var type = tokens[i].type;

				if (type === TokenType.RightCurlyBracket) {
					return true;
				}

				if (type === TokenType.LeftCurlyBracket ||
					type === TokenType.CommercialAt) {
					return false;
				}
			}

			return true;
		}

		function getAtkeyword() {
			eat(TokenType.CommercialAt);

			return [getInfo(pos - 1), NodeType.AtkeywordType, getIdentifier()];
		}

		function getAtrule() {
			var node = [getInfo(pos), NodeType.AtrulesType, getAtkeyword(pos)];

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.Semicolon:
						pos++;
						break scan;

					case TokenType.LeftCurlyBracket:
						if (isBlockAtrule(pos)) {
							node[1] = NodeType.AtrulebType;
							node.push(getBlock());
						} else {
							node[1] = NodeType.AtrulerType;
							node.push([
								{},
								NodeType.AtrulerqType
							].concat(node.splice(3)));

							pos++;  // {

							var stylesheet = getStylesheet(true);
							stylesheet[1] = NodeType.AtrulersType;
							node.push(stylesheet);

							pos++;  // }
						}
						break scan;

					case TokenType.Space:
						node.push(getS());
						break;

					case TokenType.Comment:
						node.push(getComment());
						break;

					case TokenType.Comma:
						node.push(getOperator());
						break;

					case TokenType.Colon:
						node.push(getPseudo());
						break;

					case TokenType.LeftParenthesis:
						node.push(getBraces(SCOPE_ATRULE_EXPRESSION));
						break;

					default:
						node.push(getAny(SCOPE_ATRULE_EXPRESSION));
				}
			}

			return node;
		}

		function getRuleset() {
			return [
				getInfo(pos),
				NodeType.RulesetType,
				getSelector(),
				getBlock()
			];
		}

		function getSelector() {
			var selector = [getInfo(pos), NodeType.SelectorType];

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.LeftCurlyBracket:
						break scan;

					case TokenType.Comma:
						selector.push([
							getInfo(pos++),
							NodeType.DelimType
						]);
						break;

					default:
						selector.push(getSimpleSelector());
				}
			}

			return selector;
		}

		function getSimpleSelector(nested) {
			var node = [getInfo(pos), NodeType.SimpleselectorType];

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.Comma:
						break scan;

					case TokenType.LeftCurlyBracket:
						if (nested) {
							parseError('Unexpected input');
						}

						break scan;

					case TokenType.RightParenthesis:
						if (!nested) {
							parseError('Unexpected input');
						}

						break scan;

					case TokenType.Space:
						node.push(getS());
						break;

					case TokenType.Comment:
						node.push(getComment());
						break;

					case TokenType.PlusSign:
					case TokenType.GreaterThanSign:
					case TokenType.Tilde:
					case TokenType.Solidus:
						node.push(getCombinator());
						break;

					case TokenType.FullStop:
						node.push(getClass());
						break;

					case TokenType.LeftSquareBracket:
						node.push(getAttrib());
						break;

					case TokenType.NumberSign:
						node.push(getShash());
						break;

					case TokenType.Colon:
						node.push(getPseudo());
						break;

					case TokenType.HyphenMinus:
					case TokenType.LowLine:
					case TokenType.Identifier:
					case TokenType.Asterisk:
					case TokenType.DecimalNumber:
						node.push(
							tryGetPercentage() ||
							getNamespacedIdentifier(false)
						);
						break;

					default:
						parseError('Unexpected input');
				}
			}

			return node;
		}

		function getBlock() {
			var node = [getInfo(pos), NodeType.BlockType];

			eat(TokenType.LeftCurlyBracket);

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.RightCurlyBracket:
						break scan;

					case TokenType.Space:
						node.push(getS());
						break;

					case TokenType.Comment:
						node.push(getComment());
						break;

					case TokenType.Semicolon: // ;
						node.push([
							getInfo(pos++),
							NodeType.DecldelimType
						]);
						break;

					default:
						node.push(getDeclaration());
				}
			}

			eat(TokenType.RightCurlyBracket);

			return node;
		}

		function getDeclaration(nested) {
			var startPos = pos;
			var info = getInfo(pos);
			var property = getProperty();

			eat(TokenType.Colon);

			// check it's a filter
			for (var j = startPos; j < pos; j++) {
				if (tokens[j].value === 'filter') {
					if (checkProgid(pos)) {
						return [
							info,
							NodeType.FilterType,
							property,
							getFilterv()
						];
					}
					break;
				}
			}

			return [
				info,
				NodeType.DeclarationType,
				property,
				getValue(nested)
			];
		}

		function getProperty() {
			var info = getInfo(pos);
			var name = '';

			while (pos < tokens.length) {
				var type = tokens[pos].type;

				if (type !== TokenType.Solidus &&
					type !== TokenType.Asterisk &&
					type !== TokenType.DollarSign) {
					break;
				}

				name += tokens[pos++].value;
			}

			return readSC([
				info,
				NodeType.PropertyType,
				[
					info,
					NodeType.IdentType,
					name + readIdent(true)
				]
			]);
		}

		function getValue(nested) {
			var node = [getInfo(pos), NodeType.ValueType];

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.RightCurlyBracket:
					case TokenType.Semicolon:
						break scan;

					case TokenType.RightParenthesis:
						if (!nested) {
							parseError('Unexpected input');
						}
						break scan;

					case TokenType.Space:
						node.push(getS());
						break;

					case TokenType.Comment:
						node.push(getComment());
						break;

					case TokenType.NumberSign:
						node.push(getVhash());
						break;

					case TokenType.Solidus:
					case TokenType.Comma:
						node.push(getOperator());
						break;

					case TokenType.LeftParenthesis:
					case TokenType.LeftSquareBracket:
						node.push(getBraces(SCOPE_VALUE));
						break;

					case TokenType.ExclamationMark:
						node.push(getImportant());
						break;

					default:
						// check for unicode range: U+0F00, U+0F00-0FFF, u+0F00??
						if (tokens[pos].type === TokenType.Identifier) {
							var prefix = tokens[pos].value;
							if ((prefix === 'U' || prefix === 'u') &&
								pos + 1 < tokens.length &&
								tokens[pos + 1].type === TokenType.PlusSign) {
								pos += 2;

								node.push([
									getInfo(pos),
									NodeType.IdentType,
									prefix + '+' + getUnicodeRange(true)
								]);
								break;
							}
						}

						node.push(getAny(SCOPE_VALUE));
				}
			}

			return node;
		}

		// any = string | percentage | dimension | number | uri | functionExpression | funktion | unary | operator | ident
		function getAny(scope) {
			var startPos = pos;

			switch (tokens[pos].type) {
				case TokenType.String:
					return getString();

				case TokenType.FullStop:
				case TokenType.DecimalNumber:
				case TokenType.HyphenMinus:
				case TokenType.PlusSign:
					var number = tryGetNumber();

					if (number !== null) {
						if (pos < tokens.length) {
							if (tokens[pos].type === TokenType.PercentSign) {
								return getPercentage(startPos, number);
							} else if (tokens[pos].type === TokenType.Identifier) {
								return getDimension(startPos, number);
							}
						}

						return number;
					}

					if (tokens[pos].type === TokenType.HyphenMinus &&
						pos < tokens.length &&
						(tokens[pos + 1].type === TokenType.Identifier || tokens[pos + 1].type === TokenType.HyphenMinus)) {
						break;
					}

					if (tokens[pos].type === TokenType.HyphenMinus ||
						tokens[pos].type === TokenType.PlusSign) {
						return getUnary();
					}

					parseError('Unexpected input');
					break;

				case TokenType.HyphenMinus:
				case TokenType.LowLine:
				case TokenType.Identifier:
					break;

				default:
					parseError('Unexpected input');
			}

			var ident = getIdentifier();

			if (pos < tokens.length && tokens[pos].type === TokenType.LeftParenthesis) {
				pos = startPos;
				return getFunction(scope);
			}

			return ident;
		}

		// '[' S* attrib_name ']'
		// '[' S* attrib_name attrib_match [ IDENT | STRING ] S* attrib_flags? ']'
		function getAttrib() {
			var node = [getInfo(pos), NodeType.AttribType];

			eat(TokenType.LeftSquareBracket);

			readSC(node);

			node.push(getNamespacedIdentifier(true));

			readSC(node);

			if (pos < tokens.length && tokens[pos].type !== TokenType.RightSquareBracket) {
				node.push(getAttrselector());
				readSC(node);

				if (pos < tokens.length && tokens[pos].type === TokenType.String) {
					node.push(getString());
				} else {
					node.push(getIdentifier());
				}

				readSC(node);

				// attribute flags
				if (pos < tokens.length && tokens[pos].type === TokenType.Identifier) {
					node.push([
						getInfo(pos),
						'attribFlags',
						tokens[pos++].value
					]);
					readSC(node);
				}
			}

			eat(TokenType.RightSquareBracket);

			return node;
		}

		function getAttrselector() {
			expectAny('Attribute selector (=, ~=, ^=, $=, *=, |=)',
				TokenType.EqualsSign,        // =
				TokenType.Tilde,             // ~=
				TokenType.CircumflexAccent,  // ^=
				TokenType.DollarSign,        // $=
				TokenType.Asterisk,          // *=
				TokenType.VerticalLine       // |=
			);

			var startPos = pos;
			var name;

			if (tokens[pos].type === TokenType.EqualsSign) {
				name = '=';
				pos++;
			} else {
				name = tokens[pos].value + '=';
				pos++;
				eat(TokenType.EqualsSign);
			}

			return [getInfo(startPos), NodeType.AttrselectorType, name];
		}

		function getBraces(scope) {
			expectAny('Parenthesis or square bracket',
				TokenType.LeftParenthesis,
				TokenType.LeftSquareBracket
			);

			var close;

			if (tokens[pos].type === TokenType.LeftParenthesis) {
				close = TokenType.RightParenthesis;
			} else {
				close = TokenType.RightSquareBracket;
			}

			var node = [
				getInfo(pos),
				NodeType.BracesType,
				tokens[pos].value,
				null
			];

			// left brace
			pos++;

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case close:
						node[3] = tokens[pos].value;
						break scan;

					case TokenType.Space:
						node.push(getS());
						break;

					case TokenType.Comment:
						node.push(getComment());
						break;

					case TokenType.NumberSign: // ??
						node.push(getVhash());
						break;

					case TokenType.LeftParenthesis:
					case TokenType.LeftSquareBracket:
						node.push(getBraces(scope));
						break;

					case TokenType.Solidus:
					case TokenType.Asterisk:
					case TokenType.Comma:
					case TokenType.Colon:
						node.push(getOperator());
						break;

					default:
						node.push(getAny(scope));
				}
			}

			// right brace
			eat(close);

			return node;
		}

		// '.' ident
		function getClass() {
			var startPos = pos;

			eat(TokenType.FullStop);

			return [
				getInfo(startPos),
				NodeType.ClassType,
				getIdentifier()
			];
		}

		// '#' ident
		// FIXME: shash node should has structure like other ident's (['shash', ['ident', ident]])
		function getShash() {
			var startPos = pos;

			eat(TokenType.NumberSign);

			return [
				getInfo(startPos),
				NodeType.ShashType,
				readIdent()
			];
		}

		// + | > | ~ | /deep/
		function getCombinator() {
			var info = getInfo(pos);
			var combinator;

			switch (tokens[pos].type) {
				case TokenType.PlusSign:
				case TokenType.GreaterThanSign:
				case TokenType.Tilde:
					combinator = tokens[pos].value;
					pos++;
					break;

				case TokenType.Solidus:
					combinator = '/deep/';
					pos++;

					expectIdentifier('deep', true);

					eat(TokenType.Solidus);
					break;

				default:
					parseError('Combinator (+, >, ~, /deep/) is expected');
			}

			return [info, NodeType.CombinatorType, combinator];
		}

		// '/*' .* '*/'
		function getComment() {
			var value = tokens[pos].value;
			var len = value.length;

			if (len > 4 && value.charAt(len - 2) === '*' && value.charAt(len - 1) === '/') {
				len -= 2;
			}

			return [getInfo(pos++), NodeType.CommentType, value.substring(2, len)];
		}

		// special reader for units to avoid adjoined IE hacks (i.e. '1px\9')
		function readUnit() {
			if (pos < tokens.length && tokens[pos].type === TokenType.Identifier) {
				var unit = tokens[pos].value;
				var backSlashPos = unit.indexOf('\\');

				// no backslash in unit name
				if (backSlashPos === -1) {
					pos++;
					return unit;
				}

				// patch token
				tokens[pos].value = unit.substr(backSlashPos);
				tokens[pos].offset += backSlashPos;
				tokens[pos].column += backSlashPos;

				// return unit w/o backslash part
				return unit.substr(0, backSlashPos);
			}

			parseError('Identifier is expected');
		}

		// number ident
		function getDimension(startPos, number) {
			return [
				getInfo(startPos || pos),
				NodeType.DimensionType,
				number || getNumber(),
				[getInfo(pos), NodeType.IdentType, readUnit()]
			];
		}

		// expression '(' raw ')'
		function getOldIEExpression(startPos, ident) {
			var raw = '';
			var balance = 0;
			var startPos = pos;
			var ident = getIdentifier();

			if (ident[2] !== 'expression') {
				parseError('`expression` is expected');
			}

			eat(TokenType.LeftParenthesis);

			while (pos < tokens.length) {
				if (tokens[pos].type === TokenType.RightParenthesis) {
					if (balance === 0) {
						break;
					}

					balance--;
				} else if (tokens[pos].type === TokenType.LeftParenthesis) {
					balance++;
				}

				raw += tokens[pos++].value;
			}

			eat(TokenType.RightParenthesis);

			return [
				getInfo(startPos),
				NodeType.FunctionExpressionType,
				raw
			];
		}

		// ident '(' functionBody ')' |
		// not '(' <simpleSelector>* ')'
		function getFunction(scope) {
			var body = getFunctionBody;

			// parse special functions
			if (pos + 1 < tokens.length && tokens[pos].type === TokenType.Identifier) {
				var name = tokens[pos].value;

				if (tokens[pos + 1].type === TokenType.LeftParenthesis) {
					if (specialFunctions.hasOwnProperty(scope)) {
						if (specialFunctions[scope].hasOwnProperty(name)) {
							return specialFunctions[scope][name](scope);
						}
					}
				}
			}

			return getFunctionInternal(body, scope);
		}

		function getNotFunction(scope) {
			return getFunctionInternal(getNotFunctionBody, scope);
		}

		function getVarFunction(scope) {
			return getFunctionInternal(getVarFunctionBody, scope);
		}

		function getFunctionInternal(functionBodyReader, scope) {
			var startPos = pos;
			var ident = getIdentifier();

			eat(TokenType.LeftParenthesis);

			var body = functionBodyReader(scope);

			eat(TokenType.RightParenthesis);

			return [getInfo(startPos), NodeType.FunctionType, ident, body];
		}

		function getFunctionBody(scope) {
			var node = [getInfo(pos), NodeType.FunctionBodyType];

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.RightParenthesis:
						break scan;

					case TokenType.Space:
						node.push(getS());
						break;

					case TokenType.Comment:
						node.push(getComment());
						break;

					case TokenType.NumberSign: // TODO: not sure it should be here
						node.push(getVhash());
						break;

					case TokenType.LeftParenthesis:
					case TokenType.LeftSquareBracket:
						node.push(getBraces(scope));
						break;

					case TokenType.Solidus:
					case TokenType.Asterisk:
					case TokenType.Comma:
					case TokenType.Colon:
					case TokenType.EqualsSign:
						node.push(getOperator());
						break;

					default:
						node.push(getAny(scope));
				}
			}

			return node;
		}

		function getNotFunctionBody() {
			var node = [getInfo(pos), NodeType.FunctionBodyType];
			var wasSelector = false;

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.RightParenthesis:
						if (!wasSelector) {
							parseError('Simple selector is expected');
						}

						break scan;

					case TokenType.Comma:
						if (!wasSelector) {
							parseError('Simple selector is expected');
						}

						wasSelector = false;
						node.push([
							getInfo(pos++),
							NodeType.DelimType
						]);
						break;

					default:
						wasSelector = true;
						node.push(getSimpleSelector(true));
				}
			}

			return node;
		}

		// var '(' ident (',' <declaration-value>)? ')'
		function getVarFunctionBody() {
			var node = [getInfo(pos), NodeType.FunctionBodyType];

			readSC(node);
			node.push(getIdentifier(true));
			readSC(node);

			if (pos < tokens.length && tokens[pos].type === TokenType.Comma) {
				node.push(
					getOperator(),
					getValue(true)
				);
				readSC(node);
			}

			return node;
		}

		// url '(' ws* (string | raw) ws* ')'
		function getUri() {
			var startPos = pos;
			var node = [getInfo(startPos), NodeType.UriType];
			var ident = getIdentifier();

			if (ident[2] !== 'url') {
				parseError('`url` is expected');
			}

			eat(TokenType.LeftParenthesis); // (

			readSC(node);

			if (tokens[pos].type === TokenType.String) {
				node.push(getString());
				readSC(node);
			} else {
				var rawStart = pos;
				var raw = '';

				while (pos < tokens.length) {
					var type = tokens[pos].type;

					if (type === TokenType.Space ||
						type === TokenType.LeftParenthesis ||
						type === TokenType.RightParenthesis) {
						break;
					}

					raw += tokens[pos++].value;
				}

				node.push([
					getInfo(rawStart),
					NodeType.RawType,
					raw
				]);

				readSC(node);
			}

			eat(TokenType.RightParenthesis); // )

			return node;
		}

		function getUnicodeRange(tryNext) {
			var hex = '';

			for (; pos < tokens.length; pos++) {
				if (tokens[pos].type !== TokenType.DecimalNumber &&
					tokens[pos].type !== TokenType.Identifier) {
					break;
				}

				hex += tokens[pos].value;
			}

			if (!/^[0-9a-f]{1,6}$/i.test(hex)) {
				parseError('Unexpected input');
			}

			// U+abc???
			if (tryNext) {
				for (; hex.length < 6 && pos < tokens.length; pos++) {
					if (tokens[pos].type !== TokenType.QuestionMark) {
						break;
					}

					hex += tokens[pos].value;
					tryNext = false;
				}
			}

			// U+aaa-bbb
			if (tryNext) {
				if (pos < tokens.length && tokens[pos].type === TokenType.HyphenMinus) {
					pos++;
					var next = getUnicodeRange(false);

					if (!next) {
						parseError('Unexpected input');
					}

					hex += '-' + next;
				}
			}

			return hex;
		}

		function readIdent(varAllowed) {
			var name = '';

			// optional first -
			if (pos < tokens.length && tokens[pos].type === TokenType.HyphenMinus) {
				name = '-';
				pos++;

				if (varAllowed && pos < tokens.length && tokens[pos].type === TokenType.HyphenMinus) {
					name = '--';
					pos++;
				}
			}

			expectAny('Identifier',
				TokenType.LowLine,
				TokenType.Identifier
			);

			if (pos < tokens.length) {
				name += tokens[pos].value;
				pos++;

				for (; pos < tokens.length; pos++) {
					var type = tokens[pos].type;
					if (type !== TokenType.LowLine &&
						type !== TokenType.Identifier &&
						type !== TokenType.DecimalNumber &&
						type !== TokenType.HyphenMinus) {
						break;
					}

					name += tokens[pos].value;
				}
			}

			return name;
		}

		function getNamespacedIdentifier(checkColon) {
			if (pos >= tokens.length) {
				parseError('Unexpected end of input');
			}

			var info = getInfo(pos);
			var name;

			if (tokens[pos].type === TokenType.Asterisk) {
				checkColon = false;
				name = '*';
				pos++;
			} else {
				name = readIdent();
			}

			if (pos < tokens.length) {
				if (tokens[pos].type === TokenType.VerticalLine &&
					pos + 1 < tokens.length &&
					tokens[pos + 1].type !== TokenType.EqualsSign) {
					name += '|';
					pos++;

					if (pos < tokens.length) {
						if (tokens[pos].type === TokenType.HyphenMinus ||
							tokens[pos].type === TokenType.Identifier ||
							tokens[pos].type === TokenType.LowLine) {
							name += readIdent();
						} else if (tokens[pos].type === TokenType.Asterisk) {
							checkColon = false;
							name += '*';
							pos++;
						}
					}
				}
			}

			if (checkColon && pos < tokens.length && tokens[pos].type === TokenType.Colon) {
				pos++;
				name += ':' + readIdent();
			}

			return [
				info,
				NodeType.IdentType,
				name
			];
		}

		function getIdentifier(varAllowed) {
			return [getInfo(pos), NodeType.IdentType, readIdent(varAllowed)];
		}

		// ! ws* important
		function getImportant() {
			eat(TokenType.ExclamationMark);

			var node = readSC([getInfo(pos - 1), NodeType.ImportantType]);

			expectIdentifier('important', true);

			return node;
		}

		// odd | even | number? n
		function getNth() {
			expectAny('Number, odd or even',
				TokenType.Identifier,
				TokenType.DecimalNumber
			);

			var startPos = pos;
			var value = tokens[pos].value;

			if (tokens[pos].type === TokenType.DecimalNumber) {
				if (pos + 1 < tokens.length &&
					tokens[pos + 1].type === TokenType.Identifier &&
					tokens[pos + 1].value === 'n') {
					value += 'n';
					pos++;
				}
			} else {
				if (value !== 'odd' && value !== 'even' && value !== 'n') {
					parseError('Unexpected identifier');
				}
			}

			pos++;

			return [
				getInfo(startPos),
				NodeType.NthType,
				value
			];
		}

		function getNthSelector() {
			eat(TokenType.Colon);
			expectIdentifier('nth', false);

			var node = [getInfo(pos - 1), NodeType.NthselectorType, getIdentifier()];

			eat(TokenType.LeftParenthesis);

			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.RightParenthesis:
						break scan;

					case TokenType.Space:
						node.push(getS());
						break;

					case TokenType.Comment:
						node.push(getComment());
						break;

					case TokenType.HyphenMinus:
					case TokenType.PlusSign:
						node.push(getUnary());
						break;

					default:
						node.push(getNth());
				}
			}

			eat(TokenType.RightParenthesis);

			return node;
		}

		function tryGetNumber() {
			var startPos = pos;
			var wasDigits = false;
			var number = '';
			var i = pos;

			if (i < tokens.length && tokens[i].type === TokenType.HyphenMinus) {
				number = '-';
				i++;
			}

			if (i < tokens.length && tokens[i].type === TokenType.DecimalNumber) {
				wasDigits = true;
				number += tokens[i].value;
				i++;
			}

			if (i < tokens.length && tokens[i].type === TokenType.FullStop) {
				number += '.';
				i++;
			}

			if (i < tokens.length && tokens[i].type === TokenType.DecimalNumber) {
				wasDigits = true;
				number += tokens[i].value;
				i++;
			}

			if (wasDigits) {
				pos = i;
				return [getInfo(startPos), NodeType.NumberType, number];
			}

			return null;
		}

		function getNumber() {
			var number = tryGetNumber();

			if (!number) {
				parseError('Wrong number');
			}

			return number;
		}

		// '/' | '*' | ',' | ':' | '='
		// TODO: remove '=' since it's wrong operator, but theat as operator
		// to make old things like `filter: alpha(opacity=0)` works
		function getOperator() {
			expectAny('Operator',
				TokenType.Solidus,
				TokenType.Asterisk,
				TokenType.Comma,
				TokenType.Colon,
				TokenType.EqualsSign
			);

			return [getInfo(pos), NodeType.OperatorType, tokens[pos++].value];
		}

		// node: Percentage
		function tryGetPercentage() {
			var startPos = pos;
			var number = tryGetNumber();

			if (!number) {
				return null;
			}

			if (pos >= tokens.length || tokens[pos].type !== TokenType.PercentSign) {
				return null;
			}

			return getPercentage(startPos, number);
		}

		function getPercentage(startPos, number) {
			if (!startPos) {
				startPos = pos;
			}

			if (!number) {
				number = getNumber();
			}

			eat(TokenType.PercentSign);

			return [getInfo(startPos), NodeType.PercentageType, number];
		}

		function getFilterv() {
			var node = [getInfo(pos), NodeType.FiltervType];

			while (checkProgid(pos)) {
				node.push(getProgid());
			}

			readSC(node);

			if (pos < tokens.length && tokens[pos].type === TokenType.ExclamationMark) {
				node.push(getImportant());
			}

			return node;
		}

		// 'progid:' ws* 'DXImageTransform.Microsoft.' ident ws* '(' .* ')'
		function checkSC(i) {
			var start = i;

			while (i < tokens.length) {
				if (tokens[i].type === TokenType.Space ||
					tokens[i].type === TokenType.Comment) {
					i++;
				} else {
					break;
				}
			}

			return i - start;
		}

		function checkProgid(i) {
			var start = i;

			i += checkSC(i);

			if (i + 1 >= tokens.length ||
				tokens[i + 0].value !== 'progid' ||
				tokens[i + 1].type !== TokenType.Colon) {
				return false; // fail
			}

			i += 2;
			i += checkSC(i);

			if (i + 6 >= tokens.length ||
				tokens[i + 0].value !== 'DXImageTransform' ||
				tokens[i + 1].type !== TokenType.FullStop ||
				tokens[i + 2].value !== 'Microsoft' ||
				tokens[i + 3].type !== TokenType.FullStop ||
				tokens[i + 4].type !== TokenType.Identifier) {
				return false; // fail
			}

			i += 5;
			i += checkSC(i);

			if (i >= tokens.length ||
				tokens[i].type !== TokenType.LeftParenthesis) {
				return false; // fail
			}

			while (i < tokens.length) {
				if (tokens[i++].type === TokenType.RightParenthesis) {
					break;
				}
			}

			tokens[start].progidEnd = i;

			return true;
		}

		function getProgid() {
			var node = [getInfo(pos), NodeType.ProgidType];
			var progidEnd = tokens[pos].progidEnd;
			var value = '';

			if (!progidEnd && !checkProgid(pos)) {
				parseError('progid is expected');
			}

			readSC(node);

			var rawStart = pos;
			for (; pos < progidEnd; pos++) {
				value += tokens[pos].value;
			}

			node.push([
				getInfo(rawStart),
				NodeType.RawType,
				value
			]);

			readSC(node);

			return node;
		}

		// <pseudo-element> | <nth-selector> | <pseudo-class>
		function getPseudo() {
			if (pos >= tokens.length || tokens[pos].type !== TokenType.Colon) {
				parseError('Colon is expected');
			}

			if (pos + 1 >= tokens.length) {
				pos++;
				parseError('Colon or identifier is expected');
			}

			var next = tokens[pos + 1];

			if (next.type === TokenType.Colon) {
				return getPseudoe();
			}

			if (next.type === TokenType.Identifier &&
				next.value === 'nth') {
				return getNthSelector();
			}

			return getPseudoc();
		}

		// :: ident
		function getPseudoe() {
			eat(TokenType.Colon);
			eat(TokenType.Colon);

			return [getInfo(pos - 2), NodeType.PseudoeType, getIdentifier()];
		}

		// : ( ident | function )
		function getPseudoc() {
			var startPos = pos;
			var node = eat(TokenType.Colon) && getIdentifier();

			if (pos < tokens.length && tokens[pos].type === TokenType.LeftParenthesis) {
				pos = startPos + 1;
				node = getFunction(SCOPE_SELECTOR);
			}

			return [
				getInfo(startPos),
				NodeType.PseudocType,
				node
			];
		}

		// ws
		function getS() {
			return [getInfo(pos), NodeType.SType, tokens[pos++].value];
		}

		function readSC(node) {
			scan:
			while (pos < tokens.length) {
				switch (tokens[pos].type) {
					case TokenType.Space:
						node.push(getS());
						break;

					case TokenType.Comment:
						node.push(getComment());
						break;

					default:
						break scan;
				}
			}

			return node;
		}

		// node: String
		function getString() {
			return [getInfo(pos), NodeType.StringType, tokens[pos++].value];
		}

		// '+' | '-'
		function getUnary() {
			expectAny('Unary operator',
				TokenType.HyphenMinus,
				TokenType.PlusSign
			);

			return [getInfo(pos), NodeType.UnaryType, tokens[pos++].value];
		}

		// '//' ...
		// TODO: remove it as wrong thing
		function getUnknown() {
			eat(TokenType.Unknown);

			return [getInfo(pos - 1), NodeType.UnknownType, tokens[pos - 1].value];
		}

		// # ident
		function getVhash() {
			eat(TokenType.NumberSign);

			expectAny('Number or identifier',
				TokenType.DecimalNumber,
				TokenType.Identifier
			);

			var name = tokens[pos].value;

			if (tokens[pos++].type === TokenType.DecimalNumber) {
				if (pos < tokens.length && tokens[pos].type === TokenType.Identifier) {
					name += tokens[pos++].value;
				}
			}

			return [getInfo(pos - 1), NodeType.VhashType, name];
		}

		function parse(source, rule, options) {
			var ast;

			options = options || {};

			if (options === true) {
				options = {
					positions: true,
					needInfo: true
				};
			}

			if ('positions' in options) {
				needPositions = options.positions || false;
			} else {
				// deprecated option but using for backward capability
				needPositions = options.needPositions || false;
			}

			filename = options.filename || '<unknown>';
			rule = rule || 'stylesheet';
			pos = 0;

			tokens = tokenize(source, options.line, options.column);

			if (tokens.length) {
				ast = rules[rule]();
			}

			tokens = null; // drop tokens

			if (!ast && rule === 'stylesheet') {
				ast = [{}, rule];
			}

			if (ast && !options.needInfo) {
				ast = cleanInfo(ast);
			}

			// console.log(require('../utils/stringify.js')(require('../utils/cleanInfo.js')(ast), true));
			return ast;
		};

		return parse;
	};
	//#endregion
	
	//#region URL: /parser/const
	modules['/parser/const'] = function () {
		var exports = {};

		exports.TokenType = {
			String: 'String',
			Comment: 'Comment',
			Unknown: 'Unknown',
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

		// var i = 1;
		// for (var key in exports.TokenType) {
		//     exports.TokenType[key] = i++;
		// }

		exports.NodeType = {
			AtkeywordType: 'atkeyword',
			AtrulebType: 'atruleb',
			AtrulerqType: 'atrulerq',
			AtrulersType: 'atrulers',
			AtrulerType: 'atruler',
			AtrulesType: 'atrules',
			AttribType: 'attrib',
			AttrselectorType: 'attrselector',
			BlockType: 'block',
			BracesType: 'braces',
			ClassType: 'clazz',
			CombinatorType: 'combinator',
			CommentType: 'comment',
			DeclarationType: 'declaration',
			DecldelimType: 'decldelim',
			DelimType: 'delim',
			DimensionType: 'dimension',
			FilterType: 'filter',
			FiltervType: 'filterv',
			FunctionBodyType: 'functionBody',
			FunctionExpressionType: 'functionExpression',
			FunctionType: 'funktion',
			IdentType: 'ident',
			ImportantType: 'important',
			NamespaceType: 'namespace',
			NthselectorType: 'nthselector',
			NthType: 'nth',
			NumberType: 'number',
			OperatorType: 'operator',
			PercentageType: 'percentage',
			ProgidType: 'progid',
			PropertyType: 'property',
			PseudocType: 'pseudoc',
			PseudoeType: 'pseudoe',
			RawType: 'raw',
			RulesetType: 'ruleset',
			SelectorType: 'selector',
			ShashType: 'shash',
			SimpleselectorType: 'simpleselector',
			StringType: 'string',
			StylesheetType: 'stylesheet',
			SType: 's',
			UnaryType: 'unary',
			UnknownType: 'unknown',
			UriType: 'uri',
			ValueType: 'value',
			VhashType: 'vhash'
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /parser/tokenize
	modules['/parser/tokenize'] = function () {
		'use strict';

		var TokenType = require('/parser/const').TokenType;
		var lineStartPos;
		var line;
		var pos;

		var TAB = 9;
		var N = 10;
		var F = 12;
		var R = 13;
		var SPACE = 32;
		var DOUBLE_QUOTE = 34;
		var QUOTE = 39;
		var RIGHT_PARENTHESIS = 41;
		var STAR = 42;
		var SLASH = 47;
		var BACK_SLASH = 92;
		var UNDERSCORE = 95;
		var LEFT_CURLY_BRACE = 123;
		var RIGHT_CURLY_BRACE = 125;

		var WHITESPACE = 1;
		var PUNCTUATOR = 2;
		var DIGIT = 3;
		var STRING_SQ = 4;
		var STRING_DQ = 5;

		var PUNCTUATION = {
			9:  TokenType.Tab,                // '\t'
			10: TokenType.Newline,            // '\n'
			13: TokenType.Newline,            // '\r'
			32: TokenType.Space,              // ' '
			33: TokenType.ExclamationMark,    // '!'
			34: TokenType.QuotationMark,      // '"'
			35: TokenType.NumberSign,         // '#'
			36: TokenType.DollarSign,         // '$'
			37: TokenType.PercentSign,        // '%'
			38: TokenType.Ampersand,          // '&'
			39: TokenType.Apostrophe,         // '\''
			40: TokenType.LeftParenthesis,    // '('
			41: TokenType.RightParenthesis,   // ')'
			42: TokenType.Asterisk,           // '*'
			43: TokenType.PlusSign,           // '+'
			44: TokenType.Comma,              // ','
			45: TokenType.HyphenMinus,        // '-'
			46: TokenType.FullStop,           // '.'
			47: TokenType.Solidus,            // '/'
			58: TokenType.Colon,              // ':'
			59: TokenType.Semicolon,          // ';'
			60: TokenType.LessThanSign,       // '<'
			61: TokenType.EqualsSign,         // '='
			62: TokenType.GreaterThanSign,    // '>'
			63: TokenType.QuestionMark,       // '?'
			64: TokenType.CommercialAt,       // '@'
			91: TokenType.LeftSquareBracket,  // '['
			93: TokenType.RightSquareBracket, // ']'
			94: TokenType.CircumflexAccent,   // '^'
			95: TokenType.LowLine,            // '_'
			123: TokenType.LeftCurlyBracket,  // '{'
			124: TokenType.VerticalLine,      // '|'
			125: TokenType.RightCurlyBracket, // '}'
			126: TokenType.Tilde              // '~'
		};
		var SYMBOL_CATEGORY_LENGTH = Math.max.apply(null, Object.keys(PUNCTUATION)) + 1;
		var SYMBOL_CATEGORY = new Uint32Array(SYMBOL_CATEGORY_LENGTH);
		var IS_PUNCTUATOR = new Uint32Array(SYMBOL_CATEGORY_LENGTH);

		// fill categories
		Object.keys(PUNCTUATION).forEach(function(key) {
			SYMBOL_CATEGORY[Number(key)] = PUNCTUATOR;
			IS_PUNCTUATOR[Number(key)] = PUNCTUATOR;
		}, SYMBOL_CATEGORY);

		// don't treat as punctuator
		IS_PUNCTUATOR[UNDERSCORE] = 0;

		for (var i = 48; i <= 57; i++) {
			SYMBOL_CATEGORY[i] = DIGIT;
		}

		SYMBOL_CATEGORY[SPACE] = WHITESPACE;
		SYMBOL_CATEGORY[TAB] = WHITESPACE;
		SYMBOL_CATEGORY[N] = WHITESPACE;
		SYMBOL_CATEGORY[R] = WHITESPACE;
		SYMBOL_CATEGORY[F] = WHITESPACE;

		SYMBOL_CATEGORY[QUOTE] = STRING_SQ;
		SYMBOL_CATEGORY[DOUBLE_QUOTE] = STRING_DQ;

		//
		// main part
		//

		function tokenize(source, initLine, initColumn) {
			function pushToken(type, line, column, value) {
				tokens.push({
					type: type,
					value: value,

					offset: lastPos,
					line: line,
					column: column
				});

				lastPos = pos;
			}

			if (!source) {
				return [];
			}

			var tokens = [];
			var urlMode = false;
			var lastPos = 0;
			var blockMode = 0;
			var code;
			var next;
			var ident;

			// ignore first char if it is byte order marker (UTF-8 BOM)
			pos = source.charCodeAt(0) === 0xFEFF ? 1 : 0;
			lastPos = pos;
			line = typeof initLine === 'undefined' ? 1 : initLine;
			lineStartPos = typeof initColumn === 'undefined' ? -1 : -initColumn;

			for (; pos < source.length; pos++) {
				code = source.charCodeAt(pos);

				switch (code < SYMBOL_CATEGORY_LENGTH ? SYMBOL_CATEGORY[code] : 0) {
					case DIGIT:
						pushToken(TokenType.DecimalNumber, line, pos - lineStartPos, parseDecimalNumber(source));
						break;

					case STRING_SQ:
					case STRING_DQ:
						pushToken(TokenType.String, line, pos - lineStartPos, parseString(source, code));
						break;

					case WHITESPACE:
						pushToken(TokenType.Space, line, pos - lineStartPos, parseSpaces(source));
						break;

					case PUNCTUATOR:
						if (code === SLASH) {
							next = source.charCodeAt(pos + 1);

							if (next === STAR) { // /*
								pushToken(TokenType.Comment, line, pos - lineStartPos, parseComment(source));
								continue;
							} else if (next === SLASH && !urlMode) { // //
								if (blockMode > 0) {
									var skip = 2;

									while (source.charCodeAt(pos + skip) === SLASH) {
										skip++;
									}

									pushToken(TokenType.Identifier, line, pos - lineStartPos, ident = parseIdentifier(source, skip));
									urlMode = urlMode || ident === 'url';
								} else {
									pushToken(TokenType.Unknown, line, pos - lineStartPos, parseUnknown(source));
								}
								continue;
							}
						}

						pushToken(PUNCTUATION[code], line, pos - lineStartPos, String.fromCharCode(code));

						if (code === RIGHT_PARENTHESIS) {
							urlMode = false;
						} else if (code === LEFT_CURLY_BRACE) {
							blockMode++;
						} else if (code === RIGHT_CURLY_BRACE) {
							blockMode--;
						}

						break;

					default:
						pushToken(TokenType.Identifier, line, pos - lineStartPos, ident = parseIdentifier(source, 0));
						urlMode = urlMode || ident === 'url';
				}
			}

			return tokens;
		}

		function checkNewline(code, s) {
			if (code === N || code === F || code === R) {
				if (code === R && pos + 1 < s.length && s.charCodeAt(pos + 1) === N) {
					pos++;
				}

				line++;
				lineStartPos = pos;
				return true;
			}

			return false;
		}

		function parseSpaces(s) {
			var start = pos;

			for (; pos < s.length; pos++) {
				var code = s.charCodeAt(pos);

				if (!checkNewline(code, s) && code !== SPACE && code !== TAB) {
					break;
				}
			}

			pos--;
			return s.substring(start, pos + 1);
		}

		function parseComment(s) {
			var start = pos;

			for (pos += 2; pos < s.length; pos++) {
				var code = s.charCodeAt(pos);

				if (code === STAR) { // */
					if (s.charCodeAt(pos + 1) === SLASH) {
						pos++;
						break;
					}
				} else {
					checkNewline(code, s);
				}
			}

			return s.substring(start, pos + 1);
		}

		function parseUnknown(s) {
			var start = pos;

			for (pos += 2; pos < s.length; pos++) {
				if (checkNewline(s.charCodeAt(pos), s)) {
					break;
				}
			}

			return s.substring(start, pos + 1);
		}

		function parseString(s, quote) {
			var start = pos;
			var res = '';

			for (pos++; pos < s.length; pos++) {
				var code = s.charCodeAt(pos);

				if (code === BACK_SLASH) {
					var end = pos++;

					if (checkNewline(s.charCodeAt(pos), s)) {
						res += s.substring(start, end);
						start = pos + 1;
					}
				} else if (code === quote) {
					break;
				}
			}

			return res + s.substring(start, pos + 1);
		}

		function parseDecimalNumber(s) {
			var start = pos;
			var code;

			for (pos++; pos < s.length; pos++) {
				code = s.charCodeAt(pos);

				if (code < 48 || code > 57) {  // 0 .. 9
					break;
				}
			}

			pos--;
			return s.substring(start, pos + 1);
		}

		function parseIdentifier(s, skip) {
			var start = pos;

			for (pos += skip; pos < s.length; pos++) {
				var code = s.charCodeAt(pos);

				if (code === BACK_SLASH) {
					pos++;

					// skip escaped unicode sequence that can ends with space
					// [0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?
					for (var i = 0; i < 7 && pos + i < s.length; i++) {
						code = s.charCodeAt(pos + i);

						if (i !== 6) {
							if ((code >= 48 && code <= 57) ||  // 0 .. 9
								(code >= 65 && code <= 70) ||  // A .. F
								(code >= 97 && code <= 102)) { // a .. f
								continue;
							}
						}

						if (i > 0) {
							pos += i - 1;
							if (code === SPACE || code === TAB || checkNewline(code, s)) {
								pos++;
							}
						}

						break;
					}
				} else if (code < SYMBOL_CATEGORY_LENGTH &&
						   IS_PUNCTUATOR[code] === PUNCTUATOR) {
					break;
				}
			}

			pos--;
			return s.substring(start, pos + 1);
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
	
	//#region URL: /utils/list
	modules['/utils/list'] = function () {
		//
		//            item        item        item        item
		//          /------\    /------\    /------\    /------\
		//          | data |    | data |    | data |    | data |
		//  null <--+-prev |<---+-prev |<---+-prev |<---+-prev |
		//          | next-+--->| next-+--->| next-+--->| next-+--> null
		//          \------/    \------/    \------/    \------/
		//             ^                                    ^
		//             |                list                |
		//             |              /------\              |
		//             \--------------+-head |              |
		//                            | tail-+--------------/
		//                            \------/
		//

		function createItem(data) {
			return {
				data: data,
				next: null,
				prev: null
			};
		}

		var List = function(values) {
			this.cursor = null;
			this.head = null;
			this.tail = null;

			if (Array.isArray(values)) {
				var cursor = null;

				for (var i = 0; i < values.length; i++) {
					var item = createItem(values[i]);

					if (cursor !== null) {
						cursor.next = item;
					} else {
						this.head = item;
					}

					item.prev = cursor;
					cursor = item;
				}

				this.tail = cursor;
			}
		};

		Object.defineProperty(List.prototype, 'size', {
			get: function() {
				var size = 0;
				var cursor = this.head;

				while (cursor) {
					size++;
					cursor = cursor.next;
				}

				return size;
			}
		});

		List.createItem = createItem;
		List.prototype.createItem = createItem;

		List.prototype.toArray = function() {
			var cursor = this.head;
			var result = [];

			while (cursor) {
				result.push(cursor.data);
				cursor = cursor.next;
			}

			return result;
		};
		List.prototype.toJSON = function() {
			return this.toArray();
		};

		List.prototype.isEmpty = function() {
			return this.head === null;
		};

		List.prototype.first = function() {
			return this.head && this.head.data;
		};

		List.prototype.last = function() {
			return this.tail && this.tail.data;
		};

		List.prototype.each = function(fn, context) {
			var item;
			var cursor = {
				prev: null,
				next: this.head,
				cursor: this.cursor
			};

			if (context === undefined) {
				context = this;
			}

			// push cursor
			this.cursor = cursor;

			while (cursor.next !== null) {
				item = cursor.next;
				cursor.next = item.next;

				fn.call(context, item.data, item, this);
			}

			// pop cursor
			this.cursor = this.cursor.cursor;
		};

		List.prototype.eachRight = function(fn, context) {
			var item;
			var cursor = {
				prev: this.tail,
				next: null,
				cursor: this.cursor
			};

			if (context === undefined) {
				context = this;
			}

			// push cursor
			this.cursor = cursor;

			while (cursor.prev !== null) {
				item = cursor.prev;
				cursor.prev = item.prev;

				fn.call(context, item.data, item, this);
			}

			// pop cursor
			this.cursor = this.cursor.cursor;
		};

		List.prototype.nextUntil = function(start, fn, context) {
			if (start === null) {
				return;
			}

			var item;
			var cursor = {
				prev: null,
				next: start,
				cursor: this.cursor
			};

			if (context === undefined) {
				context = this;
			}

			// push cursor
			this.cursor = cursor;

			while (cursor.next !== null) {
				item = cursor.next;
				cursor.next = item.next;

				if (fn.call(context, item.data, item, this)) {
					break;
				}
			}

			// pop cursor
			this.cursor = this.cursor.cursor;
		};

		List.prototype.prevUntil = function(start, fn, context) {
			if (start === null) {
				return;
			}

			var item;
			var cursor = {
				prev: start,
				next: null,
				cursor: this.cursor
			};

			if (context === undefined) {
				context = this;
			}

			// push cursor
			this.cursor = cursor;

			while (cursor.prev !== null) {
				item = cursor.prev;
				cursor.prev = item.prev;

				if (fn.call(context, item.data, item, this)) {
					break;
				}
			}

			// pop cursor
			this.cursor = this.cursor.cursor;
		};

		List.prototype.some = function(fn, context) {
			var cursor = this.head;

			if (context === undefined) {
				context = this;
			}

			while (cursor !== null) {
				if (fn.call(context, cursor.data, cursor, this)) {
					return true;
				}

				cursor = cursor.next;
			}

			return false;
		};

		List.prototype.map = function(fn, context) {
			var result = [];
			var cursor = this.head;

			if (context === undefined) {
				context = this;
			}

			while (cursor !== null) {
				result.push(fn.call(context, cursor.data, cursor, this));
				cursor = cursor.next;
			}

			return result;
		};

		List.prototype.copy = function() {
			var result = new List();
			var cursor = this.head;

			while (cursor !== null) {
				result.insert(createItem(cursor.data));
				cursor = cursor.next;
			}

			return result;
		};

		List.prototype.updateCursors = function(prevOld, prevNew, nextOld, nextNew) {
			var cursor = this.cursor;

			while (cursor !== null) {
				if (prevNew === true || cursor.prev === prevOld) {
					cursor.prev = prevNew;
				}

				if (nextNew === true || cursor.next === nextOld) {
					cursor.next = nextNew;
				}

				cursor = cursor.cursor;
			}
		};

		List.prototype.insert = function(item, before) {
			if (before !== undefined && before !== null) {
				// prev   before
				//      ^
				//     item
				this.updateCursors(before.prev, item, before, item);

				if (before.prev === null) {
					// insert to the beginning of list
					if (this.head !== before) {
						throw new Error('before doesn\'t below to list');
					}

					// since head points to before therefore list doesn't empty
					// no need to check tail
					this.head = item;
					before.prev = item;
					item.next = before;

					this.updateCursors(null, item);
				} else {

					// insert between two items
					before.prev.next = item;
					item.prev = before.prev;

					before.prev = item;
					item.next = before;
				}
			} else {
				// tail
				//      ^
				//     item
				this.updateCursors(this.tail, item, null, item);

				// insert to end of the list
				if (this.tail !== null) {
					// if list has a tail, then it also has a head, but head doesn't change

					// last item -> new item
					this.tail.next = item;

					// last item <- new item
					item.prev = this.tail;
				} else {
					// if list has no a tail, then it also has no a head
					// in this case points head to new item
					this.head = item;
				}

				// tail always start point to new item
				this.tail = item;
			}
		};

		List.prototype.remove = function(item) {
			//      item
			//       ^
			// prev     next
			this.updateCursors(item, item.prev, item, item.next);

			if (item.prev !== null) {
				item.prev.next = item.next;
			} else {
				if (this.head !== item) {
					throw new Error('item doesn\'t below to list');
				}

				this.head = item.next;
			}

			if (item.next !== null) {
				item.next.prev = item.prev;
			} else {
				if (this.tail !== item) {
					throw new Error('item doesn\'t below to list');
				}

				this.tail = item.prev;
			}

			item.prev = null;
			item.next = null;

			return item;
		};

		List.prototype.appendList = function(list) {
			// ignore empty lists
			if (list.head === null) {
				return;
			}

			this.updateCursors(this.tail, list.tail, null, list.head);

			// insert to end of the list
			if (this.tail !== null) {
				// if destination list has a tail, then it also has a head,
				// but head doesn't change

				// dest tail -> source head
				this.tail.next = list.head;

				// dest tail <- source head
				list.head.prev = this.tail;
			} else {
				// if list has no a tail, then it also has no a head
				// in this case points head to new item
				this.head = list.head;
			}

			// tail always start point to new item
			this.tail = list.tail;

			list.head = null;
			list.tail = null;
		};

		return List;
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
			attribFlags: simple,

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

			decldelim: function() {
				buffer.push(';');
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

			switch (token[offset + 0]) {
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
//		var traslateInternalWithSourceMap = require('/compressor/ast/translateWithSourceMap');
		var internalWalkers = require('/compressor/ast/walk');
		var walk = require('/utils/walker');
		var translate = require('/utils/translate');
		var stringify = require('/utils/stringify');
		var cleanInfo = require('/utils/cleanInfo');

//		var justDoIt = function(src, noStructureOptimizations, needInfo) {
//			console.warn('`csso.justDoIt()` method is deprecated, use `csso.minify()` instead');
//
//			var ast = parse(src, 'stylesheet', needInfo);
//			var compressed = compress(ast, {
//				restructure: !noStructureOptimizations,
//				outputAst: 'internal'
//			});
//
//			return traslateInternal(compressed);
//		};

		function debugOutput(name, options, startTime, data) {
//			if (options.debug) {
//				console.error('## ' + name + ' done in %d ms\n', Date.now() - startTime);
//			}

			return data;
		}

//		function createDefaultLogger(level) {
//			var lastDebug;
//
//			return function logger(title, ast) {
//				var line = title;
//
//				if (ast) {
//					line = '[' + ((Date.now() - lastDebug) / 1000).toFixed(3) + 's] ' + line;
//				}
//
//				if (level > 1 && ast) {
//					var css = traslateInternal(ast, true);
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
//		}

		function buildCompressOptions(options) {
			var result = {};

			for (var key in options) {
				result[key] = options[key];
			}

			result.outputAst = 'internal';

//			if (typeof result.logger !== 'function' && options.debug) {
//				result.logger = createDefaultLogger(options.debug);
//			}

			return result;
		}

		var minify = function(source, options) {
			options = options || {};

			var filename = options.filename || '<unknown>';
			var result;

			// parse
			var ast = debugOutput('parsing', options, new Date(),
				parse(source, 'stylesheet', {
					filename: filename,
//					positions: Boolean(options.sourceMap),
					needInfo: true
				})
			);

			// compress
			var compressedAst = debugOutput('compress', options, new Date(),
				compress(ast, buildCompressOptions(options))
			);

			// translate
//			if (options.sourceMap) {
//				result = debugOutput('translateWithSourceMap', options, new Date(), (function() {
//					var tmp = traslateInternalWithSourceMap(compressedAst);
//					tmp.map._file = filename; // since other tools can relay on file in source map transform chain
//					tmp.map.setSourceContent(filename, source);
//					return tmp;
//				})());
//			} else {
				result = debugOutput('translate', options, new Date(),
					traslateInternal(compressedAst)
				);
//			}

			return result;
		};

		var exports = {
			version: '1.7.0',

			// main method
			minify: minify,

			// utils
			parse: parse,
			compress: compress,
			translate: translate,

			walk: walk,
			stringify: stringify,
			cleanInfo: cleanInfo,

			// internal ast
			internal: {
				fromGonzales: require('/compressor/ast/gonzalesToInternal'),
				toGonzales: require('/compressor/ast/internalToGonzales'),
				translate: traslateInternal,
//				translateWithSourceMap: traslateInternalWithSourceMap,
				walk: internalWalkers.all,
				walkRules: internalWalkers.rules,
				walkRulesRight: internalWalkers.rulesRight
			},

//			// deprecated
//			justDoIt: justDoIt
		};

		return exports;
	};
	//#endregion
	
	return require('/');
})();