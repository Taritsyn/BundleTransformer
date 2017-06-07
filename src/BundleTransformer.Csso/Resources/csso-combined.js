/*!
* CSSO (CSS Optimizer) v2.3.1
* http://github.com/css/csso
*
* Copyright 2011-2017, Sergey Kryzhanovsky
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
		var clone = require('/utils/clone');
		var usageUtils = require('/compressor/usage');
		var clean = require('/compressor/clean');
		var compress = require('/compressor/compress');
		var restructureBlock = require('/compressor/restructure');
		var walkRules = require('/utils/walk').rules;

		function readRulesChunk(rules, specialComments) {
			var buffer = new List();
			var nonSpaceTokenInBuffer = false;
			var protectedComment;

			rules.nextUntil(rules.head, function(node, item, list) {
				if (node.type === 'Comment') {
					if (!specialComments || node.value.charAt(0) !== '!') {
						list.remove(item);
						return;
					}

					if (nonSpaceTokenInBuffer || protectedComment) {
						return true;
					}

					list.remove(item);
					protectedComment = node;
					return;
				}

				if (node.type !== 'Space') {
					nonSpaceTokenInBuffer = true;
				}

				buffer.insert(list.remove(item));
			});

			return {
				comment: protectedComment,
				stylesheet: {
					type: 'StyleSheet',
					info: null,
					rules: buffer
				}
			};
		}

		function compressChunk(ast, firstAtrulesAllowed, usageData, num/*, logger*/) {
//			logger('Compress block #' + num, null, true);

			var seed = 1;
			walkRules(ast, function markStylesheets() {
				if ('id' in this.stylesheet === false) {
					this.stylesheet.firstAtrulesAllowed = firstAtrulesAllowed;
					this.stylesheet.id = seed++;
				}
			});
//			logger('init', ast);

			// remove redundant
			clean(ast, usageData);
//			logger('clean', ast);

			// compress nodes
			compress(ast, usageData);
//			logger('compress', ast);

			return ast;
		}

		function getCommentsOption(options) {
			var comments = 'comments' in options ? options.comments : 'exclamation';

			if (typeof comments === 'boolean') {
				comments = comments ? 'exclamation' : false;
			} else if (comments !== 'exclamation' && comments !== 'first-exclamation') {
				comments = false;
			}

			return comments;
		}

		function getRestructureOption(options) {
			return 'restructure' in options ? options.restructure :
				   'restructuring' in options ? options.restructuring :
				   true;
		}

		function wrapBlock(block) {
			return new List([{
				type: 'Ruleset',
				selector: {
					type: 'Selector',
					selectors: new List([{
						type: 'SimpleSelector',
						sequence: new List([{
							type: 'Identifier',
							name: 'x'
						}])
					}])
				},
				block: block
			}]);
		}

		var exports = function compress(ast, options) {
			ast = ast || { type: 'StyleSheet', info: null, rules: new List() };
			options = options || {};

//			var logger = typeof options.logger === 'function' ? options.logger : Function();
			var specialComments = getCommentsOption(options);
			var restructuring = getRestructureOption(options);
			var firstAtrulesAllowed = true;
			var usageData = false;
			var inputRules;
			var outputRules = new List();
			var chunk;
			var chunkNum = 1;
			var chunkRules;

			if (options.clone) {
				ast = clone(ast);
			}

			if (ast.type === 'StyleSheet') {
				inputRules = ast.rules;
				ast.rules = outputRules;
			} else {
				inputRules = wrapBlock(ast);
			}

			if (options.usage) {
				usageData = usageUtils.buildIndex(options.usage);
			}

			do {
				chunk = readRulesChunk(inputRules, Boolean(specialComments));

				compressChunk(chunk.stylesheet, firstAtrulesAllowed, usageData, chunkNum++/*, logger*/);

				// structure optimisations
				if (restructuring) {
					restructureBlock(chunk.stylesheet, usageData/*, logger*/);
				}

				chunkRules = chunk.stylesheet.rules;

				if (chunk.comment) {
					// add \n before comment if there is another content in outputRules
					if (!outputRules.isEmpty()) {
						outputRules.insert(List.createItem({
							type: 'Raw',
							value: '\n'
						}));
					}

					outputRules.insert(List.createItem(chunk.comment));

					// add \n after comment if chunk is not empty
					if (!chunkRules.isEmpty()) {
						outputRules.insert(List.createItem({
							type: 'Raw',
							value: '\n'
						}));
					}
				}

				if (firstAtrulesAllowed && !chunkRules.isEmpty()) {
					var lastRule = chunkRules.last();

					if (lastRule.type !== 'Atrule' ||
					   (lastRule.name !== 'import' && lastRule.name !== 'charset')) {
						firstAtrulesAllowed = false;
					}
				}

				if (specialComments !== 'exclamation') {
					specialComments = false;
				}

				outputRules.appendList(chunkRules);
			} while (!inputRules.isEmpty());

			return {
				ast: ast
			};
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/clean
	modules['/compressor/clean'] = function () {
		var walk = require('/utils/walk').all;
		var handlers = {
			Space: require('/compressor/clean/Space'),
			Atrule: require('/compressor/clean/Atrule'),
			Ruleset: require('/compressor/clean/Ruleset'),
			Declaration: require('/compressor/clean/Declaration'),
			Identifier: require('/compressor/clean/Identifier'),
			Comment: require('/compressor/clean/Comment')
		};

		var exports = function(ast, usageData) {
			walk(ast, function(node, item, list) {
				if (handlers.hasOwnProperty(node.type)) {
					handlers[node.type].call(this, node, item, list, usageData);
				}
			});
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

	//#region URL: /compressor/clean/Comment
	modules['/compressor/clean/Comment'] = function () {
		var exports = function cleanComment(data, item, list) {
			list.remove(item);
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
		var exports = function cleanIdentifier(node, item, list) {
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
		var hasOwnProperty = Object.prototype.hasOwnProperty;

		function cleanUnused(node, usageData) {
			return node.selector.selectors.each(function(selector, item, list) {
				var hasUnused = selector.sequence.some(function(node) {
					switch (node.type) {
						case 'Class':
							return usageData.classes && !hasOwnProperty.call(usageData.classes, node.name);

						case 'Id':
							return usageData.ids && !hasOwnProperty.call(usageData.ids, node.name);

						case 'Identifier':
							// ignore universal selector
							if (node.name !== '*') {
								// TODO: remove toLowerCase when type selectors will be normalized
								return usageData.tags && !hasOwnProperty.call(usageData.tags, node.name.toLowerCase());
							}

							break;
					}
				});

				if (hasUnused) {
					list.remove(item);
				}
			});
		}

		var exports = function cleanRuleset(node, item, list, usageData) {
			if (usageData) {
				cleanUnused(node, usageData);
			}

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
		function canCleanWhitespace(node) {
			if (node.type !== 'Operator') {
				return false;
			}

			return node.value !== '+' && node.value !== '-';
		}

		var exports = function cleanWhitespace(node, item, list) {
			var prev = item.prev && item.prev.data;
			var next = item.next && item.next.data;

			if (canCleanWhitespace(prev) || canCleanWhitespace(next)) {
				list.remove(item);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/compress
	modules['/compressor/compress'] = function () {
		var walk = require('/utils/walk').all;
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

		var exports = function(ast) {
			walk(ast, function(node, item, list) {
				if (handlers.hasOwnProperty(node.type)) {
					handlers[node.type].call(this, node, item, list);
				}
			});
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
		var resolveKeyword = require('/utils/names').keyword;
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
		var LENGTH_UNIT = {
			// absolute length units
			'px': true,
			'mm': true,
			'cm': true,
			'in': true,
			'pt': true,
			'pc': true,

			// relative length units
			'em': true,
			'ex': true,
			'ch': true,
			'rem': true,

			// viewport-percentage lengths
			'vh': true,
			'vw': true,
			'vmin': true,
			'vmax': true,
			'vm': true
		};

		var exports = function compressDimension(node, item) {
			var value = packNumber(node.value);

			node.value = value;

			if (value === '0' && this.declaration) {
				var unit = node.unit.toLowerCase();

				// only length values can be compressed
				if (!LENGTH_UNIT.hasOwnProperty(unit)) {
					return;
				}

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
		var resolveName = require('/utils/names').property;
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
		var prepare = require('/compressor/restructure/prepare');
		var initialMergeRuleset = require('/compressor/restructure/1-initialMergeRuleset');
		var mergeAtrule = require('/compressor/restructure/2-mergeAtrule');
		var disjoinRuleset = require('/compressor/restructure/3-disjoinRuleset');
		var restructShorthand = require('/compressor/restructure/4-restructShorthand');
		var restructBlock = require('/compressor/restructure/6-restructBlock');
		var mergeRuleset = require('/compressor/restructure/7-mergeRuleset');
		var restructRuleset = require('/compressor/restructure/8-restructRuleset');

		var exports = function(ast, usageData/*, debug*/) {
			// prepare ast for restructing
			var indexer = prepare(ast, usageData);
//			debug('prepare', ast);

			initialMergeRuleset(ast);
//			debug('initialMergeRuleset', ast);

			mergeAtrule(ast);
//			debug('mergeAtrule', ast);

			disjoinRuleset(ast);
//			debug('disjoinRuleset', ast);

			restructShorthand(ast, indexer);
//			debug('restructShorthand', ast);

			restructBlock(ast);
//			debug('restructBlock', ast);

			mergeRuleset(ast);
//			debug('mergeRuleset', ast);

			restructRuleset(ast);
//			debug('restructRuleset', ast);
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/1-initialMergeRuleset
	modules['/compressor/restructure/1-initialMergeRuleset'] = function () {
		var utils = require('/compressor/restructure/utils');
		var walkRules = require('/utils/walk').rules;

		function processRuleset(node, item, list) {
			var selectors = node.selector.selectors;
			var declarations = node.block.declarations;

			list.prevUntil(item.prev, function(prev) {
				// skip non-ruleset node if safe
				if (prev.type !== 'Ruleset') {
					return utils.unsafeToSkipNode.call(selectors, prev);
				}

				var prevSelectors = prev.selector.selectors;
				var prevDeclarations = prev.block.declarations;

				// try to join rulesets with equal pseudo signature
				if (node.pseudoSignature === prev.pseudoSignature) {
					// try to join by selectors
					if (utils.isEqualLists(prevSelectors, selectors)) {
						prevDeclarations.appendList(declarations);
						list.remove(item);
						return true;
					}

					// try to join by declarations
					if (utils.isEqualDeclarations(declarations, prevDeclarations)) {
						utils.addSelectors(prevSelectors, selectors);
						list.remove(item);
						return true;
					}
				}

				// go to prev ruleset if has no selector similarities
				return utils.hasSimilarSelectors(selectors, prevSelectors);
			});
		};

		// NOTE: direction should be left to right, since rulesets merge to left
		// ruleset. When direction right to left unmerged rulesets may prevent lookup
		// TODO: remove initial merge
		var exports = function initialMergeRuleset(ast) {
			walkRules(ast, function(node, item, list) {
				if (node.type === 'Ruleset') {
					processRuleset(node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/2-mergeAtrule
	modules['/compressor/restructure/2-mergeAtrule'] = function () {
		var walkRulesRight = require('/utils/walk').rulesRight;

		function isMediaRule(node) {
			return node.type === 'Atrule' && node.name === 'media';
		}

		function processAtrule(node, item, list) {
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

		var exports = function rejoinAtrule(ast) {
			walkRulesRight(ast, function(node, item, list) {
				if (node.type === 'Atrule') {
					processAtrule(node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/3-disjoinRuleset
	modules['/compressor/restructure/3-disjoinRuleset'] = function () {
		var List = require('/utils/list');
		var walkRulesRight = require('/utils/walk').rulesRight;

		function processRuleset(node, item, list) {
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

		var exports = function disjoinRuleset(ast) {
			walkRulesRight(ast, function(node, item, list) {
				if (node.type === 'Ruleset') {
					processRuleset(node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/4-restructShorthand
	modules['/compressor/restructure/4-restructShorthand'] = function () {
		var List = require('/utils/list');
		var translate = require('/utils/translate');
		var walkRulesRight = require('/utils/walk').rulesRight;

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
			var iehack = '';
			var hasBadValues = value.sequence.some(function(child) {
				var special = false;

				switch (child.type) {
					case 'Identifier':
						switch (child.name) {
							case '\\0':
							case '\\9':
								iehack = child.name;
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

					case 'Hash': // color
					case 'Number':
					case 'Percentage':
						break;

					case 'Function':
						special = child.name;
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

			if (typeof this.iehack === 'string' && this.iehack !== iehack) {
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
					if (side in sides === false) {
						return false;
					}

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
					name: this.iehack
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

					// if can't parse value ignore it and break shorthand sequence
					if (!shorthand.add(property, declaration.value, declaration.info)) {
						lastShortSelector = null;
						return;
					}
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

		var exports = function restructBlock(ast, indexer) {
			var stylesheetMap = {};
			var shortDeclarations = [];

			walkRulesRight(ast, function(node) {
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

			processShorthands(shortDeclarations, indexer.declaration);
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/6-restructBlock
	modules['/compressor/restructure/6-restructBlock'] = function () {
		var resolveProperty = require('/utils/names').property;
		var resolveKeyword = require('/utils/names').keyword;
		var walkRulesRight = require('/utils/walk').rulesRight;
		var translate = require('/utils/translate');
		var dontRestructure = {
			'src': 1 // https://github.com/afelix/csso/issues/50
		};

		var DONT_MIX_VALUE = {
			// https://developer.mozilla.org/en-US/docs/Web/CSS/display#Browser_compatibility
			'display': /table|ruby|flex|-(flex)?box$|grid|contents|run-in/i,
			// https://developer.mozilla.org/en/docs/Web/CSS/text-align
			'text-align': /^(start|end|match-parent|justify-all)$/i
		};

		var CURSOR_SAFE_VALUE = [
			'auto', 'crosshair', 'default', 'move', 'text', 'wait', 'help',
			'n-resize', 'e-resize', 's-resize', 'w-resize',
			'ne-resize', 'nw-resize', 'se-resize', 'sw-resize',
			'pointer', 'progress', 'not-allowed', 'no-drop', 'vertical-text', 'all-scroll',
			'col-resize', 'row-resize'
		];

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
				var iehack = '';
				var special = {};

				declaration.value.sequence.each(function walk(node) {
					switch (node.type) {
						case 'Argument':
						case 'Value':
						case 'Braces':
							node.sequence.each(walk);
							break;

						case 'Identifier':
							var name = node.name;

							if (!vendorId) {
								vendorId = resolveKeyword(name).vendor;
							}

							if (/\\[09]/.test(name)) {
								iehack = RegExp.lastMatch;
							}

							if (realName === 'cursor') {
								if (CURSOR_SAFE_VALUE.indexOf(name) === -1) {
									special[name] = true;
								}
							} else if (DONT_MIX_VALUE.hasOwnProperty(realName)) {
								if (DONT_MIX_VALUE[realName].test(name)) {
									special[name] = true;
								}
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

							// check nested tokens too
							node.arguments.each(walk);

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

				fingerprint = '|' + Object.keys(special).sort() + '|' + iehack + vendorId;

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

			walkRulesRight(ast, function(node, item, list) {
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
		var walkRules = require('/utils/walk').rules;

		/*
			At this step all rules has single simple selector. We try to join by equal
			declaration blocks to first rule, e.g.

			.a { color: red }
			b { ... }
			.b { color: red }
			->
			.a, .b { color: red }
			b { ... }
		*/

		function processRuleset(node, item, list) {
			var selectors = node.selector.selectors;
			var declarations = node.block.declarations;
			var nodeCompareMarker = selectors.first().compareMarker;
			var skippedCompareMarkers = {};

			list.nextUntil(item.next, function(next, nextItem) {
				// skip non-ruleset node if safe
				if (next.type !== 'Ruleset') {
					return utils.unsafeToSkipNode.call(selectors, next);
				}

				if (node.pseudoSignature !== next.pseudoSignature) {
					return true;
				}

				var nextFirstSelector = next.selector.selectors.head;
				var nextDeclarations = next.block.declarations;
				var nextCompareMarker = nextFirstSelector.data.compareMarker;

				// if next ruleset has same marked as one of skipped then stop joining
				if (nextCompareMarker in skippedCompareMarkers) {
					return true;
				}

				// try to join by selectors
				if (selectors.head === selectors.tail) {
					if (selectors.first().id === nextFirstSelector.data.id) {
						declarations.appendList(nextDeclarations);
						list.remove(nextItem);
						return;
					}
				}

				// try to join by properties
				if (utils.isEqualDeclarations(declarations, nextDeclarations)) {
					var nextStr = nextFirstSelector.data.id;

					selectors.some(function(data, item) {
						var curStr = data.id;

						if (nextStr < curStr) {
							selectors.insert(nextFirstSelector, item);
							return true;
						}

						if (!item.next) {
							selectors.insert(nextFirstSelector);
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

		var exports = function mergeRuleset(ast) {
			walkRules(ast, function(node, item, list) {
				if (node.type === 'Ruleset') {
					processRuleset(node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /compressor/restructure/8-restructRuleset
	modules['/compressor/restructure/8-restructRuleset'] = function () {
		var List = require('/utils/list');
		var utils = require('/compressor/restructure/utils');
		var walkRulesRight = require('/utils/walk').rulesRight;

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

		function processRuleset(node, item, list) {
			var avoidRulesMerge = this.stylesheet.avoidRulesMerge;
			var selectors = node.selector.selectors;
			var block = node.block;
			var disallowDownMarkers = Object.create(null);
			var allowMergeUp = true;
			var allowMergeDown = true;

			list.prevUntil(item.prev, function(prev, prevItem) {
				// skip non-ruleset node if safe
				if (prev.type !== 'Ruleset') {
					return utils.unsafeToSkipNode.call(selectors, prev);
				}

				var prevSelectors = prev.selector.selectors;
				var prevBlock = prev.block;

				if (node.pseudoSignature !== prev.pseudoSignature) {
					return true;
				}

				allowMergeDown = !prevSelectors.some(function(selector) {
					return selector.compareMarker in disallowDownMarkers;
				});

				// try prev ruleset if simpleselectors has no equal specifity and element selector
				if (!allowMergeDown && !allowMergeUp) {
					return true;
				}

				// try to join by selectors
				if (allowMergeUp && utils.isEqualLists(prevSelectors, selectors)) {
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
						if (allowMergeDown) {
							utils.addSelectors(selectors, prevSelectors);
							list.remove(prevItem);
						}

						return true;
					} else if (!avoidRulesMerge) { /* probably we don't need to prevent those merges for @keyframes
													  TODO: need to be checked */

						if (diff.ne1.length && !diff.ne2.length) {
							// prevBlock is subset block
							var selectorLength = calcSelectorLength(selectors);
							var blockLength = calcDeclarationsLength(diff.eq); // declarations length

							if (allowMergeUp && selectorLength < blockLength) {
								utils.addSelectors(prevSelectors, selectors);
								block.declarations = new List(diff.ne1);
							}
						} else if (!diff.ne1.length && diff.ne2.length) {
							// node is subset of prevBlock
							var selectorLength = calcSelectorLength(prevSelectors);
							var blockLength = calcDeclarationsLength(diff.eq); // declarations length

							if (allowMergeDown && selectorLength < blockLength) {
								utils.addSelectors(selectors, prevSelectors);
								prevBlock.declarations = new List(diff.ne2);
							}
						} else {
							// diff.ne1.length && diff.ne2.length
							// extract equal block
							var newSelector = {
								type: 'Selector',
								info: {},
								selectors: utils.addSelectors(prevSelectors.copy(), selectors)
							};
							var newBlockLength = calcSelectorLength(newSelector.selectors) + 2; // selectors length + curly braces length
							var blockLength = calcDeclarationsLength(diff.eq); // declarations length

							// create new ruleset if declarations length greater than
							// ruleset description overhead
							if (allowMergeDown && blockLength >= newBlockLength) {
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

								block.declarations = new List(diff.ne1);
								prevBlock.declarations = new List(diff.ne2.concat(diff.ne2overrided));
								list.insert(list.createItem(newRuleset), prevItem);
								return true;
							}
						}
					}
				}

				if (allowMergeUp) {
					// TODO: disallow up merge only if any property interception only (i.e. diff.ne2overrided.length > 0);
					// await property families to find property interception correctly
					allowMergeUp = !prevSelectors.some(function(prevSelector) {
						return selectors.some(function(selector) {
							return selector.compareMarker === prevSelector.compareMarker;
						});
					});
				}

				prevSelectors.each(function(data) {
					disallowDownMarkers[data.compareMarker] = true;
				});
			});
		};

		var exports = function restructRuleset(ast) {
			walkRulesRight(ast, function(node, item, list) {
				if (node.type === 'Ruleset') {
					processRuleset.call(this, node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/restructure/prepare
	modules['/compressor/restructure/prepare'] = function () {
		var resolveKeyword = require('/utils/names').keyword;
		var walkRules = require('/utils/walk').rules;
		var translate = require('/utils/translate');
		var createDeclarationIndexer = require('/compressor/restructure/prepare/createDeclarationIndexer');
		var processSelector = require('/compressor/restructure/prepare/processSelector');

		function walk(node, markDeclaration, usageData) {
			switch (node.type) {
				case 'Ruleset':
					node.block.declarations.each(markDeclaration);
					processSelector(node, usageData);
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

		var exports = function prepare(ast, usageData) {
			var markDeclaration = createDeclarationIndexer();

			walkRules(ast, function(node) {
				walk(node, markDeclaration, usageData);
			});

			return {
				declaration: markDeclaration
			};
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/restructure/prepare/createDeclarationIndexer
	modules['/compressor/restructure/prepare/createDeclarationIndexer'] = function () {
		var translate = require('/utils/translate');

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

		var exports = function createDeclarationIndexer() {
			var names = new Index();
			var values = new Index();

			return function markDeclaration(node) {
				var property = node.property.name;
				var value = translate(node.value);

				node.id = names.resolve(property) + (values.resolve(value) << 12);
				node.length = property.length + 1 + value.length;

				return node;
			};
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/restructure/prepare/processSelector
	modules['/compressor/restructure/prepare/processSelector'] = function () {
		var translate = require('/utils/translate');
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

		var exports = function freeze(node, usageData) {
			var pseudos = Object.create(null);
			var hasPseudo = false;

			node.selector.selectors.each(function(simpleSelector) {
				var tagName = '*';
				var scope = 0;

				simpleSelector.sequence.some(function(node) {
					switch (node.type) {
						case 'Class':
							if (usageData && usageData.scopes) {
								var classScope = usageData.scopes[node.name] || 0;

								if (scope !== 0 && classScope !== scope) {
									throw new Error('Selector can\'t has classes from different scopes: ' + translate(simpleSelector));
								}

								scope = classScope;
							}
							break;

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

						case 'Negation':
							pseudos.not = true;
							hasPseudo = true;
							break;

						case 'Identifier':
							tagName = node.name;
							break;

						case 'Attribute':
							if (node.flags) {
								pseudos['[' + node.flags + ']'] = true;
								hasPseudo = true;
							}
							break;

						case 'Combinator':
							tagName = '*';
							break;
					}
				});

				simpleSelector.id = translate(simpleSelector);
				simpleSelector.compareMarker = specificity(simpleSelector).toString();

				if (scope) {
					simpleSelector.compareMarker += ':' + scope;
				}

				if (tagName !== '*') {
					simpleSelector.compareMarker += ',' + tagName;
				}
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

			while (cursor1 !== null && cursor2 !== null && cursor1.data.id === cursor2.data.id) {
				cursor1 = cursor1.next;
				cursor2 = cursor2.next;
			}

			return cursor1 === null && cursor2 === null;
		}

		function isEqualDeclarations(a, b) {
			var cursor1 = a.head;
			var cursor2 = b.head;

			while (cursor1 !== null && cursor2 !== null && cursor1.data.id === cursor2.data.id) {
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

		function addSelectors(dest, source) {
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

		// check if simpleselectors has no equal specificity and element selector
		function hasSimilarSelectors(selectors1, selectors2) {
			return selectors1.some(function(a) {
				return selectors2.some(function(b) {
					return a.compareMarker === b.compareMarker;
				});
			});
		}

		// test node can't to be skipped
		function unsafeToSkipNode(node) {
			switch (node.type) {
				case 'Ruleset':
					// unsafe skip ruleset with selector similarities
					return hasSimilarSelectors(node.selector.selectors, this);

				case 'Atrule':
					// can skip at-rules with blocks
					if (node.block) {
						// non-stylesheet blocks are safe to skip since have no selectors
						if (node.block.type !== 'StyleSheet') {
							return false;
						}

						// unsafe skip at-rule if block contains something unsafe to skip
						return node.block.rules.some(unsafeToSkipNode, this);
					}
					break;
			}

			// unsafe by default
			return true;
		}

		var exports = {
			isEqualLists: isEqualLists,
			isEqualDeclarations: isEqualDeclarations,
			compareDeclarations: compareDeclarations,
			addSelectors: addSelectors,
			hasSimilarSelectors: hasSimilarSelectors,
			unsafeToSkipNode: unsafeToSkipNode
		};

		return exports;
	};
	//#endregion

	//#region URL: /compressor/usage
	modules['/compressor/usage'] = function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty;

		function buildMap(list, caseInsensitive) {
			var map = Object.create(null);

			if (!Array.isArray(list)) {
				return false;
			}

			for (var i = 0; i < list.length; i++) {
				var name = list[i];

				if (caseInsensitive) {
					name = name.toLowerCase();
				}

				map[name] = true;
			}

			return map;
		}

		function buildIndex(data) {
			var scopes = false;

			if (data.scopes && Array.isArray(data.scopes)) {
				scopes = Object.create(null);

				for (var i = 0; i < data.scopes.length; i++) {
					var list = data.scopes[i];

					if (!list || !Array.isArray(list)) {
						throw new Error('Wrong usage format');
					}

					for (var j = 0; j < list.length; j++) {
						var name = list[j];

						if (hasOwnProperty.call(scopes, name)) {
							throw new Error('Class can\'t be used for several scopes: ' + name);
						}

						scopes[name] = i + 1;
					}
				}
			}

			return {
				tags: buildMap(data.tags, true),
				ids: buildMap(data.ids),
				classes: buildMap(data.classes),
				scopes: scopes
			};
		}

		var exports = {
			buildIndex: buildIndex
		};

		return exports;
	};
	//#endregion

	//#region URL: /parser
	modules['/parser'] = function () {
		'use strict';

		var TokenType = require('/parser/const').TokenType;
		var Scanner = require('/parser/scanner');
		var List = require('/utils/list');
		var needPositions;
		var filename;
		var scanner;

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

		var initialContext = {
			stylesheet: getStylesheet,
			atrule: getAtrule,
			atruleExpression: getAtruleExpression,
			ruleset: getRuleset,
			selector: getSelector,
			simpleSelector: getSimpleSelector,
			block: getBlock,
			declaration: getDeclaration,
			value: getValue
		};

		var blockMode = {
			'declaration': true,
			'property': true
		};

		function parseError(message) {
			var error = new Error(message);
			var offset = 0;
			var line = 1;
			var column = 1;
			var lines;

			if (scanner.token !== null) {
				offset = scanner.token.offset;
				line = scanner.token.line;
				column = scanner.token.column;
			} else if (scanner.prevToken !== null) {
				lines = scanner.prevToken.value.trimRight();
				offset = scanner.prevToken.offset + lines.length;
				lines = lines.split(/\n|\r\n?|\f/);
				line = scanner.prevToken.line + lines.length - 1;
				column = lines.length > 1
					? lines[lines.length - 1].length + 1
					: scanner.prevToken.column + lines[lines.length - 1].length;
			}

			error.name = 'CssSyntaxError';
			error.parseError = {
				offset: offset,
				line: line,
				column: column
			};

			throw error;
		}

		function eat(tokenType) {
			if (scanner.token !== null && scanner.token.type === tokenType) {
				scanner.next();
				return true;
			}

			parseError(tokenType + ' is expected');
		}

		function expectIdentifier(name, eat) {
			if (scanner.token !== null) {
				if (scanner.token.type === TokenType.Identifier &&
					scanner.token.value.toLowerCase() === name) {
					if (eat) {
						scanner.next();
					}

					return true;
				}
			}

			parseError('Identifier `' + name + '` is expected');
		}

		function expectAny(what) {
			if (scanner.token !== null) {
				for (var i = 1, type = scanner.token.type; i < arguments.length; i++) {
					if (type === arguments[i]) {
						return true;
					}
				}
			}

			parseError(what + ' is expected');
		}

		function getInfo() {
			if (needPositions && scanner.token) {
				return {
					source: filename,
					offset: scanner.token.offset,
					line: scanner.token.line,
					column: scanner.token.column
				};
			}

			return null;

		}

		function removeTrailingSpaces(list) {
			while (list.tail) {
				if (list.tail.data.type === 'Space') {
					list.remove(list.tail);
				} else {
					break;
				}
			}
		}

		function getStylesheet(nested) {
			var child = null;
			var node = {
				type: 'StyleSheet',
				info: getInfo(),
				rules: new List()
			};

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
					case TokenType.Space:
						scanner.next();
						child = null;
						break;

					case TokenType.Comment:
						// ignore comments except exclamation comments on top level
						if (nested || scanner.token.value.charAt(2) !== '!') {
							scanner.next();
							child = null;
						} else {
							child = getComment();
						}
						break;

					case TokenType.Unknown:
						child = getUnknown();
						break;

					case TokenType.CommercialAt:
						child = getAtrule();
						break;

					case TokenType.RightCurlyBracket:
						if (!nested) {
							parseError('Unexpected right curly brace');
						}

						break scan;

					default:
						child = getRuleset();
				}

				if (child !== null) {
					node.rules.insert(List.createItem(child));
				}
			}

			return node;
		}

		// '//' ...
		// TODO: remove it as wrong thing
		function getUnknown() {
			var info = getInfo();
			var value = scanner.token.value;

			eat(TokenType.Unknown);

			return {
				type: 'Unknown',
				info: info,
				value: value
			};
		}

		function isBlockAtrule() {
			for (var offset = 1, cursor; cursor = scanner.lookup(offset); offset++) {
				var type = cursor.type;

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

		function getAtruleExpression() {
			var child = null;
			var node = {
				type: 'AtruleExpression',
				info: getInfo(),
				sequence: new List()
			};

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
					case TokenType.Semicolon:
						break scan;

					case TokenType.LeftCurlyBracket:
						break scan;

					case TokenType.Space:
						if (node.sequence.isEmpty()) {
							scanner.next(); // ignore spaces in beginning
							child = null;
						} else {
							child = getS();
						}
						break;

					case TokenType.Comment: // ignore comments
						scanner.next();
						child = null;
						break;

					case TokenType.Comma:
						child = getOperator();
						break;

					case TokenType.Colon:
						child = getPseudo();
						break;

					case TokenType.LeftParenthesis:
						child = getBraces(SCOPE_ATRULE_EXPRESSION);
						break;

					default:
						child = getAny(SCOPE_ATRULE_EXPRESSION);
				}

				if (child !== null) {
					node.sequence.insert(List.createItem(child));
				}
			}

			removeTrailingSpaces(node.sequence);

			return node;
		}

		function getAtrule() {
			eat(TokenType.CommercialAt);

			var node = {
				type: 'Atrule',
				info: getInfo(),
				name: readIdent(false),
				expression: getAtruleExpression(),
				block: null
			};

			if (scanner.token !== null) {
				switch (scanner.token.type) {
					case TokenType.Semicolon:
						scanner.next();  // {
						break;

					case TokenType.LeftCurlyBracket:
						scanner.next();  // {

						if (isBlockAtrule()) {
							node.block = getBlock();
						} else {
							node.block = getStylesheet(true);
						}

						eat(TokenType.RightCurlyBracket);
						break;

					default:
						parseError('Unexpected input');
				}
			}

			return node;
		}

		function getRuleset() {
			return {
				type: 'Ruleset',
				info: getInfo(),
				selector: getSelector(),
				block: getBlockWithBrackets()
			};
		}

		function getSelector() {
			var isBadSelector = false;
			var lastComma = true;
			var node = {
				type: 'Selector',
				info: getInfo(),
				selectors: new List()
			};

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
					case TokenType.LeftCurlyBracket:
						break scan;

					case TokenType.Comma:
						if (lastComma) {
							isBadSelector = true;
						}

						lastComma = true;
						scanner.next();
						break;

					default:
						if (!lastComma) {
							isBadSelector = true;
						}

						lastComma = false;
						node.selectors.insert(List.createItem(getSimpleSelector()));

						if (node.selectors.tail.data.sequence.isEmpty()) {
							isBadSelector = true;
						}
				}
			}

			if (lastComma) {
				isBadSelector = true;
				// parseError('Unexpected trailing comma');
			}

			if (isBadSelector) {
				node.selectors = new List();
			}

			return node;
		}

		function getSimpleSelector(nested) {
			var child = null;
			var combinator = null;
			var node = {
				type: 'SimpleSelector',
				info: getInfo(),
				sequence: new List()
			};

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
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

					case TokenType.Comment:
						scanner.next();
						child = null;
						break;

					case TokenType.Space:
						child = null;
						if (!combinator && node.sequence.head) {
							combinator = getCombinator();
						} else {
							scanner.next();
						}
						break;

					case TokenType.PlusSign:
					case TokenType.GreaterThanSign:
					case TokenType.Tilde:
					case TokenType.Solidus:
						if (combinator && combinator.name !== ' ') {
							parseError('Unexpected combinator');
						}

						child = null;
						combinator = getCombinator();
						break;

					case TokenType.FullStop:
						child = getClass();
						break;

					case TokenType.LeftSquareBracket:
						child = getAttribute();
						break;

					case TokenType.NumberSign:
						child = getShash();
						break;

					case TokenType.Colon:
						child = getPseudo();
						break;

					case TokenType.LowLine:
					case TokenType.Identifier:
					case TokenType.Asterisk:
						child = getNamespacedIdentifier(false);
						break;

					case TokenType.HyphenMinus:
					case TokenType.DecimalNumber:
						child = tryGetPercentage() || getNamespacedIdentifier(false);
						break;

					default:
						parseError('Unexpected input');
				}

				if (child !== null) {
					if (combinator !== null) {
						node.sequence.insert(List.createItem(combinator));
						combinator = null;
					}

					node.sequence.insert(List.createItem(child));
				}
			}

			if (combinator && combinator.name !== ' ') {
				parseError('Unexpected combinator');
			}

			return node;
		}

		function getDeclarations() {
			var child = null;
			var declarations = new List();

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
					case TokenType.RightCurlyBracket:
						break scan;

					case TokenType.Space:
					case TokenType.Comment:
						scanner.next();
						child = null;
						break;

					case TokenType.Semicolon: // ;
						scanner.next();
						child = null;
						break;

					default:
						child = getDeclaration();
				}

				if (child !== null) {
					declarations.insert(List.createItem(child));
				}
			}

			return declarations;
		}

		function getBlockWithBrackets() {
			var info = getInfo();
			var node;

			eat(TokenType.LeftCurlyBracket);
			node = {
				type: 'Block',
				info: info,
				declarations: getDeclarations()
			};
			eat(TokenType.RightCurlyBracket);

			return node;
		}

		function getBlock() {
			return {
				type: 'Block',
				info: getInfo(),
				declarations: getDeclarations()
			};
		}

		function getDeclaration(nested) {
			var info = getInfo();
			var property = getProperty();
			var value;

			eat(TokenType.Colon);

			// check it's a filter
			if (/filter$/.test(property.name.toLowerCase()) && checkProgid()) {
				value = getFilterValue();
			} else {
				value = getValue(nested);
			}

			return {
				type: 'Declaration',
				info: info,
				property: property,
				value: value
			};
		}

		function getProperty() {
			var name = '';
			var node = {
				type: 'Property',
				info: getInfo(),
				name: null
			};

			for (; scanner.token !== null; scanner.next()) {
				var type = scanner.token.type;

				if (type !== TokenType.Solidus &&
					type !== TokenType.Asterisk &&
					type !== TokenType.DollarSign) {
					break;
				}

				name += scanner.token.value;
			}

			node.name = name + readIdent(true);

			readSC();

			return node;
		}

		function getValue(nested) {
			var child = null;
			var node = {
				type: 'Value',
				info: getInfo(),
				important: false,
				sequence: new List()
			};

			readSC();

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
					case TokenType.RightCurlyBracket:
					case TokenType.Semicolon:
						break scan;

					case TokenType.RightParenthesis:
						if (!nested) {
							parseError('Unexpected input');
						}
						break scan;

					case TokenType.Space:
						child = getS();
						break;

					case TokenType.Comment: // ignore comments
						scanner.next();
						child = null;
						break;

					case TokenType.NumberSign:
						child = getVhash();
						break;

					case TokenType.Solidus:
					case TokenType.Comma:
						child = getOperator();
						break;

					case TokenType.LeftParenthesis:
					case TokenType.LeftSquareBracket:
						child = getBraces(SCOPE_VALUE);
						break;

					case TokenType.ExclamationMark:
						node.important = getImportant();
						child = null;
						break;

					default:
						// check for unicode range: U+0F00, U+0F00-0FFF, u+0F00??
						if (scanner.token.type === TokenType.Identifier) {
							var prefix = scanner.token.value;
							if (prefix === 'U' || prefix === 'u') {
								if (scanner.lookupType(1, TokenType.PlusSign)) {
									scanner.next(); // U or u
									scanner.next(); // +

									child = {
										type: 'Identifier',
										info: getInfo(), // FIXME: wrong position
										name: prefix + '+' + readUnicodeRange(true)
									};
								}
								break;
							}
						}

						child = getAny(SCOPE_VALUE);
				}

				if (child !== null) {
					node.sequence.insert(List.createItem(child));
				}
			}

			removeTrailingSpaces(node.sequence);

			return node;
		}

		// any = string | percentage | dimension | number | uri | functionExpression | funktion | unary | operator | ident
		function getAny(scope) {
			switch (scanner.token.type) {
				case TokenType.String:
					return getString();

				case TokenType.LowLine:
				case TokenType.Identifier:
					break;

				case TokenType.FullStop:
				case TokenType.DecimalNumber:
				case TokenType.HyphenMinus:
				case TokenType.PlusSign:
					var number = tryGetNumber();

					if (number !== null) {
						if (scanner.token !== null) {
							if (scanner.token.type === TokenType.PercentSign) {
								return getPercentage(number);
							} else if (scanner.token.type === TokenType.Identifier) {
								return getDimension(number.value);
							}
						}

						return number;
					}

					if (scanner.token.type === TokenType.HyphenMinus) {
						var next = scanner.lookup(1);
						if (next && (next.type === TokenType.Identifier || next.type === TokenType.HyphenMinus)) {
							break;
						}
					}

					if (scanner.token.type === TokenType.HyphenMinus ||
						scanner.token.type === TokenType.PlusSign) {
						return getOperator();
					}

					parseError('Unexpected input');

				default:
					parseError('Unexpected input');
			}

			var ident = getIdentifier(false);

			if (scanner.token !== null && scanner.token.type === TokenType.LeftParenthesis) {
				return getFunction(scope, ident);
			}

			return ident;
		}

		function readAttrselector() {
			expectAny('Attribute selector (=, ~=, ^=, $=, *=, |=)',
				TokenType.EqualsSign,        // =
				TokenType.Tilde,             // ~=
				TokenType.CircumflexAccent,  // ^=
				TokenType.DollarSign,        // $=
				TokenType.Asterisk,          // *=
				TokenType.VerticalLine       // |=
			);

			var name;

			if (scanner.token.type === TokenType.EqualsSign) {
				name = '=';
				scanner.next();
			} else {
				name = scanner.token.value + '=';
				scanner.next();
				eat(TokenType.EqualsSign);
			}

			return name;
		}

		// '[' S* attrib_name ']'
		// '[' S* attrib_name S* attrib_match S* [ IDENT | STRING ] S* attrib_flags? S* ']'
		function getAttribute() {
			var node = {
				type: 'Attribute',
				info: getInfo(),
				name: null,
				operator: null,
				value: null,
				flags: null
			};

			eat(TokenType.LeftSquareBracket);

			readSC();

			node.name = getNamespacedIdentifier(true);

			readSC();

			if (scanner.token !== null && scanner.token.type !== TokenType.RightSquareBracket) {
				// avoid case `[name i]`
				if (scanner.token.type !== TokenType.Identifier) {
					node.operator = readAttrselector();

					readSC();

					if (scanner.token !== null && scanner.token.type === TokenType.String) {
						node.value = getString();
					} else {
						node.value = getIdentifier(false);
					}

					readSC();
				}

				// attribute flags
				if (scanner.token !== null && scanner.token.type === TokenType.Identifier) {
					node.flags = scanner.token.value;

					scanner.next();
					readSC();
				}
			}

			eat(TokenType.RightSquareBracket);

			return node;
		}

		function getBraces(scope) {
			var close;
			var child = null;
			var node = {
				type: 'Braces',
				info: getInfo(),
				open: scanner.token.value,
				close: null,
				sequence: new List()
			};

			if (scanner.token.type === TokenType.LeftParenthesis) {
				close = TokenType.RightParenthesis;
			} else {
				close = TokenType.RightSquareBracket;
			}

			// left brace
			scanner.next();

			readSC();

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
					case close:
						node.close = scanner.token.value;
						break scan;

					case TokenType.Space:
						child = getS();
						break;

					case TokenType.Comment:
						scanner.next();
						child = null;
						break;

					case TokenType.NumberSign: // ??
						child = getVhash();
						break;

					case TokenType.LeftParenthesis:
					case TokenType.LeftSquareBracket:
						child = getBraces(scope);
						break;

					case TokenType.Solidus:
					case TokenType.Asterisk:
					case TokenType.Comma:
					case TokenType.Colon:
						child = getOperator();
						break;

					default:
						child = getAny(scope);
				}

				if (child !== null) {
					node.sequence.insert(List.createItem(child));
				}
			}

			removeTrailingSpaces(node.sequence);

			// right brace
			eat(close);

			return node;
		}

		// '.' ident
		function getClass() {
			var info = getInfo();

			eat(TokenType.FullStop);

			return {
				type: 'Class',
				info: info,
				name: readIdent(false)
			};
		}

		// '#' ident
		function getShash() {
			var info = getInfo();

			eat(TokenType.NumberSign);

			return {
				type: 'Id',
				info: info,
				name: readIdent(false)
			};
		}

		// + | > | ~ | /deep/
		function getCombinator() {
			var info = getInfo();
			var combinator;

			switch (scanner.token.type) {
				case TokenType.Space:
					combinator = ' ';
					scanner.next();
					break;

				case TokenType.PlusSign:
				case TokenType.GreaterThanSign:
				case TokenType.Tilde:
					combinator = scanner.token.value;
					scanner.next();
					break;

				case TokenType.Solidus:
					combinator = '/deep/';
					scanner.next();

					expectIdentifier('deep', true);

					eat(TokenType.Solidus);
					break;

				default:
					parseError('Combinator (+, >, ~, /deep/) is expected');
			}

			return {
				type: 'Combinator',
				info: info,
				name: combinator
			};
		}

		// '/*' .* '*/'
		function getComment() {
			var info = getInfo();
			var value = scanner.token.value;
			var len = value.length;

			if (len > 4 && value.charAt(len - 2) === '*' && value.charAt(len - 1) === '/') {
				len -= 2;
			}

			scanner.next();

			return {
				type: 'Comment',
				info: info,
				value: value.substring(2, len)
			};
		}

		// special reader for units to avoid adjoined IE hacks (i.e. '1px\9')
		function readUnit() {
			if (scanner.token !== null && scanner.token.type === TokenType.Identifier) {
				var unit = scanner.token.value;
				var backSlashPos = unit.indexOf('\\');

				// no backslash in unit name
				if (backSlashPos === -1) {
					scanner.next();
					return unit;
				}

				// patch token
				scanner.token.value = unit.substr(backSlashPos);
				scanner.token.offset += backSlashPos;
				scanner.token.column += backSlashPos;

				// return unit w/o backslash part
				return unit.substr(0, backSlashPos);
			}

			parseError('Identifier is expected');
		}

		// number ident
		function getDimension(number) {
			return {
				type: 'Dimension',
				info: getInfo(),
				value: number || readNumber(),
				unit: readUnit()
			};
		}

		// number "%"
		function tryGetPercentage() {
			var number = tryGetNumber();

			if (number && scanner.token !== null && scanner.token.type === TokenType.PercentSign) {
				return getPercentage(number);
			}

			return null;
		}

		function getPercentage(number) {
			var info;

			if (!number) {
				info = getInfo();
				number = readNumber();
			} else {
				info = number.info;
				number = number.value;
			}

			eat(TokenType.PercentSign);

			return {
				type: 'Percentage',
				info: info,
				value: number
			};
		}

		// ident '(' functionBody ')' |
		// not '(' <simpleSelector>* ')'
		function getFunction(scope, ident) {
			var defaultArguments = getFunctionArguments;

			if (!ident) {
				ident = getIdentifier(false);
			}

			// parse special functions
			var name = ident.name.toLowerCase();

			if (specialFunctions.hasOwnProperty(scope)) {
				if (specialFunctions[scope].hasOwnProperty(name)) {
					return specialFunctions[scope][name](scope, ident);
				}
			}

			return getFunctionInternal(defaultArguments, scope, ident);
		}

		function getFunctionInternal(functionArgumentsReader, scope, ident) {
			var args;

			eat(TokenType.LeftParenthesis);
			args = functionArgumentsReader(scope);
			eat(TokenType.RightParenthesis);

			return {
				type: scope === SCOPE_SELECTOR ? 'FunctionalPseudo' : 'Function',
				info: ident.info,
				name: ident.name,
				arguments: args
			};
		}

		function getFunctionArguments(scope) {
			var args = new List();
			var argument = null;
			var child = null;

			readSC();

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
					case TokenType.RightParenthesis:
						break scan;

					case TokenType.Space:
						child = getS();
						break;

					case TokenType.Comment: // ignore comments
						scanner.next();
						child = null;
						break;

					case TokenType.NumberSign: // TODO: not sure it should be here
						child = getVhash();
						break;

					case TokenType.LeftParenthesis:
					case TokenType.LeftSquareBracket:
						child = getBraces(scope);
						break;

					case TokenType.Comma:
						if (argument) {
							removeTrailingSpaces(argument.sequence);
						} else {
							args.insert(List.createItem({
								type: 'Argument',
								sequence: new List()
							}));
						}
						scanner.next();
						readSC();
						argument = null;
						child = null;
						break;

					case TokenType.Solidus:
					case TokenType.Asterisk:
					case TokenType.Colon:
					case TokenType.EqualsSign:
						child = getOperator();
						break;

					default:
						child = getAny(scope);
				}

				if (argument === null) {
					argument = {
						type: 'Argument',
						sequence: new List()
					};
					args.insert(List.createItem(argument));
				}

				if (child !== null) {
					argument.sequence.insert(List.createItem(child));
				}
			}

			if (argument !== null) {
				removeTrailingSpaces(argument.sequence);
			}

			return args;
		}

		function getVarFunction(scope, ident) {
			return getFunctionInternal(getVarFunctionArguments, scope, ident);
		}

		function getNotFunctionArguments() {
			var args = new List();
			var wasSelector = false;

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
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
						scanner.next();
						break;

					default:
						wasSelector = true;
						args.insert(List.createItem(getSimpleSelector(true)));
				}
			}

			return args;
		}

		function getNotFunction(scope, ident) {
			var args;

			eat(TokenType.LeftParenthesis);
			args = getNotFunctionArguments(scope);
			eat(TokenType.RightParenthesis);

			return {
				type: 'Negation',
				info: ident.info,
				// name: ident.name,  // TODO: add name?
				sequence: args        // FIXME: -> arguments?
			};
		}

		// var '(' ident (',' <declaration-value>)? ')'
		function getVarFunctionArguments() { // TODO: special type Variable?
			var args = new List();

			readSC();

			args.insert(List.createItem({
				type: 'Argument',
				sequence: new List([getIdentifier(true)])
			}));

			readSC();

			if (scanner.token !== null && scanner.token.type === TokenType.Comma) {
				eat(TokenType.Comma);
				readSC();

				args.insert(List.createItem({
					type: 'Argument',
					sequence: new List([getValue(true)])
				}));

				readSC();
			}

			return args;
		}

		// url '(' ws* (string | raw) ws* ')'
		function getUri(scope, ident) {
			var node = {
				type: 'Url',
				info: ident.info,
				// name: ident.name,
				value: null
			};

			eat(TokenType.LeftParenthesis); // (

			readSC();

			if (scanner.token.type === TokenType.String) {
				node.value = getString();
				readSC();
			} else {
				var rawInfo = getInfo();
				var raw = '';

				for (; scanner.token !== null; scanner.next()) {
					var type = scanner.token.type;

					if (type === TokenType.Space ||
						type === TokenType.LeftParenthesis ||
						type === TokenType.RightParenthesis) {
						break;
					}

					raw += scanner.token.value;
				}

				node.value = {
					type: 'Raw',
					info: rawInfo,
					value: raw
				};

				readSC();
			}

			eat(TokenType.RightParenthesis); // )

			return node;
		}

		// expression '(' raw ')'
		function getOldIEExpression(scope, ident) {
			var balance = 0;
			var raw = '';

			eat(TokenType.LeftParenthesis);

			for (; scanner.token !== null; scanner.next()) {
				if (scanner.token.type === TokenType.RightParenthesis) {
					if (balance === 0) {
						break;
					}

					balance--;
				} else if (scanner.token.type === TokenType.LeftParenthesis) {
					balance++;
				}

				raw += scanner.token.value;
			}

			eat(TokenType.RightParenthesis);

			return {
				type: 'Function',
				info: ident.info,
				name: ident.name,
				arguments: new List([{
					type: 'Argument',
					sequence: new List([{
						type: 'Raw',
						value: raw
					}])
				}])
			};
		}

		function readUnicodeRange(tryNext) {
			var hex = '';

			for (; scanner.token !== null; scanner.next()) {
				if (scanner.token.type !== TokenType.DecimalNumber &&
					scanner.token.type !== TokenType.Identifier) {
					break;
				}

				hex += scanner.token.value;
			}

			if (!/^[0-9a-f]{1,6}$/i.test(hex)) {
				parseError('Unexpected input');
			}

			// U+abc???
			if (tryNext) {
				for (; hex.length < 6 && scanner.token !== null; scanner.next()) {
					if (scanner.token.type !== TokenType.QuestionMark) {
						break;
					}

					hex += scanner.token.value;
					tryNext = false;
				}
			}

			// U+aaa-bbb
			if (tryNext) {
				if (scanner.token !== null && scanner.token.type === TokenType.HyphenMinus) {
					scanner.next();

					var next = readUnicodeRange(false);

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
			if (scanner.token !== null && scanner.token.type === TokenType.HyphenMinus) {
				name = '-';
				scanner.next();

				if (varAllowed && scanner.token !== null && scanner.token.type === TokenType.HyphenMinus) {
					name = '--';
					scanner.next();
				}
			}

			expectAny('Identifier',
				TokenType.LowLine,
				TokenType.Identifier
			);

			if (scanner.token !== null) {
				name += scanner.token.value;
				scanner.next();

				for (; scanner.token !== null; scanner.next()) {
					var type = scanner.token.type;

					if (type !== TokenType.LowLine &&
						type !== TokenType.Identifier &&
						type !== TokenType.DecimalNumber &&
						type !== TokenType.HyphenMinus) {
						break;
					}

					name += scanner.token.value;
				}
			}

			return name;
		}

		function getNamespacedIdentifier(checkColon) {
			if (scanner.token === null) {
				parseError('Unexpected end of input');
			}

			var info = getInfo();
			var name;

			if (scanner.token.type === TokenType.Asterisk) {
				checkColon = false;
				name = '*';
				scanner.next();
			} else {
				name = readIdent(false);
			}

			if (scanner.token !== null) {
				if (scanner.token.type === TokenType.VerticalLine &&
					scanner.lookupType(1, TokenType.EqualsSign) === false) {
					name += '|';

					if (scanner.next() !== null) {
						if (scanner.token.type === TokenType.HyphenMinus ||
							scanner.token.type === TokenType.Identifier ||
							scanner.token.type === TokenType.LowLine) {
							name += readIdent(false);
						} else if (scanner.token.type === TokenType.Asterisk) {
							checkColon = false;
							name += '*';
							scanner.next();
						}
					}
				}
			}

			if (checkColon && scanner.token !== null && scanner.token.type === TokenType.Colon) {
				scanner.next();
				name += ':' + readIdent(false);
			}

			return {
				type: 'Identifier',
				info: info,
				name: name
			};
		}

		function getIdentifier(varAllowed) {
			return {
				type: 'Identifier',
				info: getInfo(),
				name: readIdent(varAllowed)
			};
		}

		// ! ws* important
		function getImportant() { // TODO?
			// var info = getInfo();

			eat(TokenType.ExclamationMark);

			readSC();

			// return {
			//     type: 'Identifier',
			//     info: info,
			//     name: readIdent(false)
			// };

			expectIdentifier('important');

			readIdent(false);

			// should return identifier in future for original source restoring as is
			// returns true for now since it's fit to optimizer purposes
			return true;
		}

		// odd | even | number? n
		function getNth() {
			expectAny('Number, odd or even',
				TokenType.Identifier,
				TokenType.DecimalNumber
			);

			var info = getInfo();
			var value = scanner.token.value;
			var cmpValue;

			if (scanner.token.type === TokenType.DecimalNumber) {
				var next = scanner.lookup(1);
				if (next !== null &&
					next.type === TokenType.Identifier &&
					next.value.toLowerCase() === 'n') {
					value += next.value;
					scanner.next();
				}
			} else {
				var cmpValue = value.toLowerCase();
				if (cmpValue !== 'odd' && cmpValue !== 'even' && cmpValue !== 'n') {
					parseError('Unexpected identifier');
				}
			}

			scanner.next();

			return {
				type: 'Nth',
				info: info,
				value: value
			};
		}

		function getNthSelector() {
			var info = getInfo();
			var sequence = new List();
			var node;
			var child = null;

			eat(TokenType.Colon);
			expectIdentifier('nth', false);

			node = {
				type: 'FunctionalPseudo',
				info: info,
				name: readIdent(false),
				arguments: new List([{
					type: 'Argument',
					sequence: sequence
				}])
			};

			eat(TokenType.LeftParenthesis);

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
					case TokenType.RightParenthesis:
						break scan;

					case TokenType.Space:
					case TokenType.Comment:
						scanner.next();
						child = null;
						break;

					case TokenType.HyphenMinus:
					case TokenType.PlusSign:
						child = getOperator();
						break;

					default:
						child = getNth();
				}

				if (child !== null) {
					sequence.insert(List.createItem(child));
				}
			}

			eat(TokenType.RightParenthesis);

			return node;
		}

		function readNumber() {
			var wasDigits = false;
			var number = '';
			var offset = 0;

			if (scanner.lookupType(offset, TokenType.HyphenMinus)) {
				number = '-';
				offset++;
			}

			if (scanner.lookupType(offset, TokenType.DecimalNumber)) {
				wasDigits = true;
				number += scanner.lookup(offset).value;
				offset++;
			}

			if (scanner.lookupType(offset, TokenType.FullStop)) {
				number += '.';
				offset++;
			}

			if (scanner.lookupType(offset, TokenType.DecimalNumber)) {
				wasDigits = true;
				number += scanner.lookup(offset).value;
				offset++;
			}

			if (wasDigits) {
				while (offset--) {
					scanner.next();
				}

				return number;
			}

			return null;
		}

		function tryGetNumber() {
			var info = getInfo();
			var number = readNumber();

			if (number !== null) {
				return {
					type: 'Number',
					info: info,
					value: number
				};
			}

			return null;
		}

		// '/' | '*' | ',' | ':' | '=' | '+' | '-'
		// TODO: remove '=' since it's wrong operator, but theat as operator
		// to make old things like `filter: alpha(opacity=0)` works
		function getOperator() {
			var node = {
				type: 'Operator',
				info: getInfo(),
				value: scanner.token.value
			};

			scanner.next();

			return node;
		}

		function getFilterValue() { // TODO
			var progid;
			var node = {
				type: 'Value',
				info: getInfo(),
				important: false,
				sequence: new List()
			};

			while (progid = checkProgid()) {
				node.sequence.insert(List.createItem(getProgid(progid)));
			}

			readSC(node);

			if (scanner.token !== null && scanner.token.type === TokenType.ExclamationMark) {
				node.important = getImportant();
			}

			return node;
		}

		// 'progid:' ws* 'DXImageTransform.Microsoft.' ident ws* '(' .* ')'
		function checkProgid() {
			function checkSC(offset) {
				for (var cursor; cursor = scanner.lookup(offset); offset++) {
					if (cursor.type !== TokenType.Space &&
						cursor.type !== TokenType.Comment) {
						break;
					}
				}

				return offset;
			}

			var offset = checkSC(0);

			if (scanner.lookup(offset + 1) === null ||
				scanner.lookup(offset + 0).value.toLowerCase() !== 'progid' ||
				scanner.lookup(offset + 1).type !== TokenType.Colon) {
				return false; // fail
			}

			offset += 2;
			offset = checkSC(offset);

			if (scanner.lookup(offset + 5) === null ||
				scanner.lookup(offset + 0).value.toLowerCase() !== 'dximagetransform' ||
				scanner.lookup(offset + 1).type !== TokenType.FullStop ||
				scanner.lookup(offset + 2).value.toLowerCase() !== 'microsoft' ||
				scanner.lookup(offset + 3).type !== TokenType.FullStop ||
				scanner.lookup(offset + 4).type !== TokenType.Identifier) {
				return false; // fail
			}

			offset += 5;
			offset = checkSC(offset);

			if (scanner.lookupType(offset, TokenType.LeftParenthesis) === false) {
				return false; // fail
			}

			for (var cursor; cursor = scanner.lookup(offset); offset++) {
				if (cursor.type === TokenType.RightParenthesis) {
					return cursor;
				}
			}

			return false;
		}

		function getProgid(progidEnd) {
			var value = '';
			var node = {
				type: 'Progid',
				info: getInfo(),
				value: null
			};

			if (!progidEnd) {
				progidEnd = checkProgid();
			}

			if (!progidEnd) {
				parseError('progid is expected');
			}

			readSC(node);

			var rawInfo = getInfo();
			for (; scanner.token && scanner.token !== progidEnd; scanner.next()) {
				value += scanner.token.value;
			}

			eat(TokenType.RightParenthesis);
			value += ')';

			node.value = {
				type: 'Raw',
				info: rawInfo,
				value: value
			};

			readSC(node);

			return node;
		}

		// <pseudo-element> | <nth-selector> | <pseudo-class>
		function getPseudo() {
			var next = scanner.lookup(1);

			if (next === null) {
				scanner.next();
				parseError('Colon or identifier is expected');
			}

			if (next.type === TokenType.Colon) {
				return getPseudoElement();
			}

			if (next.type === TokenType.Identifier &&
				next.value.toLowerCase() === 'nth') {
				return getNthSelector();
			}

			return getPseudoClass();
		}

		// :: ident
		function getPseudoElement() {
			var info = getInfo();

			eat(TokenType.Colon);
			eat(TokenType.Colon);

			return {
				type: 'PseudoElement',
				info: info,
				name: readIdent(false)
			};
		}

		// : ( ident | function )
		function getPseudoClass() {
			var info = getInfo();
			var ident = eat(TokenType.Colon) && getIdentifier(false);

			if (scanner.token !== null && scanner.token.type === TokenType.LeftParenthesis) {
				return getFunction(SCOPE_SELECTOR, ident);
			}

			return {
				type: 'PseudoClass',
				info: info,
				name: ident.name
			};
		}

		// ws
		function getS() {
			var node = {
				type: 'Space'
				// value: scanner.token.value
			};

			scanner.next();

			return node;
		}

		function readSC() {
			// var nodes = [];

			scan:
			while (scanner.token !== null) {
				switch (scanner.token.type) {
					case TokenType.Space:
						scanner.next();
						// nodes.push(getS());
						break;

					case TokenType.Comment:
						scanner.next();
						// nodes.push(getComment());
						break;

					default:
						break scan;
				}
			}

			return null;

			// return nodes.length ? new List(nodes) : null;
		}

		// node: String
		function getString() {
			var node = {
				type: 'String',
				info: getInfo(),
				value: scanner.token.value
			};

			scanner.next();

			return node;
		}

		// # ident
		function getVhash() {
			var info = getInfo();
			var value;

			eat(TokenType.NumberSign);

			expectAny('Number or identifier',
				TokenType.DecimalNumber,
				TokenType.Identifier
			);

			value = scanner.token.value;

			if (scanner.token.type === TokenType.DecimalNumber &&
				scanner.lookupType(1, TokenType.Identifier)) {
				scanner.next();
				value += scanner.token.value;
			}

			scanner.next();

			return {
				type: 'Hash',
				info: info,
				value: value
			};
		}

		var exports = function parse(source, options) {
			var ast;

			if (!options || typeof options !== 'object') {
				options = {};
			}

			var context = options.context || 'stylesheet';
			needPositions = Boolean(options.positions);
			filename = options.filename || '<unknown>';

			if (!initialContext.hasOwnProperty(context)) {
				throw new Error('Unknown context `' + context + '`');
			}

			scanner = new Scanner(source, blockMode.hasOwnProperty(context), options.line, options.column);
			scanner.next();
			ast = initialContext[context]();

			scanner = null;

			// console.log(JSON.stringify(ast, null, 4));
			return ast;
		};

		return exports;
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

		return exports;
	};
	//#endregion

	//#region URL: /parser/scanner
	modules['/parser/scanner'] = function () {
		'use strict';

		var TokenType = require('/parser/const').TokenType;

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
		var STRING = 4;

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

		SYMBOL_CATEGORY[QUOTE] = STRING;
		SYMBOL_CATEGORY[DOUBLE_QUOTE] = STRING;

		//
		// scanner
		//

		var Scanner = function(source, initBlockMode, initLine, initColumn) {
			this.source = source;

			this.pos = source.charCodeAt(0) === 0xFEFF ? 1 : 0;
			this.eof = this.pos === this.source.length;
			this.line = typeof initLine === 'undefined' ? 1 : initLine;
			this.lineStartPos = typeof initColumn === 'undefined' ? -1 : -initColumn;

			this.minBlockMode = initBlockMode ? 1 : 0;
			this.blockMode = this.minBlockMode;
			this.urlMode = false;

			this.prevToken = null;
			this.token = null;
			this.buffer = [];
		};

		Scanner.prototype = {
			lookup: function(offset) {
				if (offset === 0) {
					return this.token;
				}

				for (var i = this.buffer.length; !this.eof && i < offset; i++) {
					this.buffer.push(this.getToken());
				}

				return offset <= this.buffer.length ? this.buffer[offset - 1] : null;
			},
			lookupType: function(offset, type) {
				var token = this.lookup(offset);

				return token !== null && token.type === type;
			},
			next: function() {
				var newToken = null;

				if (this.buffer.length !== 0) {
					newToken = this.buffer.shift();
				} else if (!this.eof) {
					newToken = this.getToken();
				}

				this.prevToken = this.token;
				this.token = newToken;

				return newToken;
			},

			tokenize: function() {
				var tokens = [];

				for (; this.pos < this.source.length; this.pos++) {
					tokens.push(this.getToken());
				}

				return tokens;
			},

			getToken: function() {
				var code = this.source.charCodeAt(this.pos);
				var line = this.line;
				var column = this.pos - this.lineStartPos;
				var offset = this.pos;
				var next;
				var type;
				var value;

				switch (code < SYMBOL_CATEGORY_LENGTH ? SYMBOL_CATEGORY[code] : 0) {
					case DIGIT:
						type = TokenType.DecimalNumber;
						value = this.readDecimalNumber();
						break;

					case STRING:
						type = TokenType.String;
						value = this.readString(code);
						break;

					case WHITESPACE:
						type = TokenType.Space;
						value = this.readSpaces();
						break;

					case PUNCTUATOR:
						if (code === SLASH) {
							next = this.pos + 1 < this.source.length ? this.source.charCodeAt(this.pos + 1) : 0;

							if (next === STAR) { // /*
								type = TokenType.Comment;
								value = this.readComment();
								break;
							} else if (next === SLASH && !this.urlMode) { // //
								if (this.blockMode > 0) {
									var skip = 2;

									while (this.source.charCodeAt(this.pos + 2) === SLASH) {
										skip++;
									}

									type = TokenType.Identifier;
									value = this.readIdentifier(skip);

									this.urlMode = this.urlMode || value === 'url';
								} else {
									type = TokenType.Unknown;
									value = this.readUnknown();
								}
								break;
							}
						}

						type = PUNCTUATION[code];
						value = String.fromCharCode(code);
						this.pos++;

						if (code === RIGHT_PARENTHESIS) {
							this.urlMode = false;
						} else if (code === LEFT_CURLY_BRACE) {
							this.blockMode++;
						} else if (code === RIGHT_CURLY_BRACE) {
							if (this.blockMode > this.minBlockMode) {
								this.blockMode--;
							}
						}

						break;

					default:
						type = TokenType.Identifier;
						value = this.readIdentifier(0);

						this.urlMode = this.urlMode || value === 'url';
				}

				this.eof = this.pos === this.source.length;

				return {
					type: type,
					value: value,

					offset: offset,
					line: line,
					column: column
				};
			},

			isNewline: function(code) {
				if (code === N || code === F || code === R) {
					if (code === R && this.pos + 1 < this.source.length && this.source.charCodeAt(this.pos + 1) === N) {
						this.pos++;
					}

					this.line++;
					this.lineStartPos = this.pos;
					return true;
				}

				return false;
			},

			readSpaces: function() {
				var start = this.pos;

				for (; this.pos < this.source.length; this.pos++) {
					var code = this.source.charCodeAt(this.pos);

					if (!this.isNewline(code) && code !== SPACE && code !== TAB) {
						break;
					}
				}

				return this.source.substring(start, this.pos);
			},

			readComment: function() {
				var start = this.pos;

				for (this.pos += 2; this.pos < this.source.length; this.pos++) {
					var code = this.source.charCodeAt(this.pos);

					if (code === STAR) { // */
						if (this.source.charCodeAt(this.pos + 1) === SLASH) {
							this.pos += 2;
							break;
						}
					} else {
						this.isNewline(code);
					}
				}

				return this.source.substring(start, this.pos);
			},

			readUnknown: function() {
				var start = this.pos;

				for (this.pos += 2; this.pos < this.source.length; this.pos++) {
					if (this.isNewline(this.source.charCodeAt(this.pos), this.source)) {
						break;
					}
				}

				return this.source.substring(start, this.pos);
			},

			readString: function(quote) {
				var start = this.pos;
				var res = '';

				for (this.pos++; this.pos < this.source.length; this.pos++) {
					var code = this.source.charCodeAt(this.pos);

					if (code === BACK_SLASH) {
						var end = this.pos++;

						if (this.isNewline(this.source.charCodeAt(this.pos), this.source)) {
							res += this.source.substring(start, end);
							start = this.pos + 1;
						}
					} else if (code === quote) {
						this.pos++;
						break;
					}
				}

				return res + this.source.substring(start, this.pos);
			},

			readDecimalNumber: function() {
				var start = this.pos;
				var code;

				for (this.pos++; this.pos < this.source.length; this.pos++) {
					code = this.source.charCodeAt(this.pos);

					if (code < 48 || code > 57) {  // 0 .. 9
						break;
					}
				}

				return this.source.substring(start, this.pos);
			},

			readIdentifier: function(skip) {
				var start = this.pos;

				for (this.pos += skip; this.pos < this.source.length; this.pos++) {
					var code = this.source.charCodeAt(this.pos);

					if (code === BACK_SLASH) {
						this.pos++;

						// skip escaped unicode sequence that can ends with space
						// [0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?
						for (var i = 0; i < 7 && this.pos + i < this.source.length; i++) {
							code = this.source.charCodeAt(this.pos + i);

							if (i !== 6) {
								if ((code >= 48 && code <= 57) ||  // 0 .. 9
									(code >= 65 && code <= 70) ||  // A .. F
									(code >= 97 && code <= 102)) { // a .. f
									continue;
								}
							}

							if (i > 0) {
								this.pos += i - 1;
								if (code === SPACE || code === TAB || this.isNewline(code)) {
									this.pos++;
								}
							}

							break;
						}
					} else if (code < SYMBOL_CATEGORY_LENGTH &&
							   IS_PUNCTUATOR[code] === PUNCTUATOR) {
						break;
					}
				}

				return this.source.substring(start, this.pos);
			}
		};

		// warm up tokenizer to elimitate code branches that never execute
		// fix soft deoptimizations (insufficient type feedback)
		new Scanner('\n\r\r\n\f//""\'\'/**/1a;.{url(a)}').lookup(1e3);

		return Scanner;
	};
	//#endregion

	//#region URL: /utils/clone
	modules['/utils/clone'] = function () {
		var List = require('/utils/list');

		var exports = function clone(node) {
			var result = {};

			for (var key in node) {
				var value = node[key];

				if (value) {
					if (Array.isArray(value)) {
						value = value.slice(0);
					} else if (value instanceof List) {
						value = new List(value.map(clone));
					} else if (value.constructor === Object) {
						value = clone(value);
					}
				}

				result[key] = value;
			}

			return result;
		};

		return exports;
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

	//#region URL: /utils/names
	modules['/utils/names'] = function () {
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

	//#region URL: /utils/translate
	modules['/utils/translate'] = function () {
		function each(list) {
			if (list.head === null) {
				return '';
			}

			if (list.head === list.tail) {
				return translate(list.head.data);
			}

			return list.map(translate).join('');
		}

		function eachDelim(list, delimeter) {
			if (list.head === null) {
				return '';
			}

			if (list.head === list.tail) {
				return translate(list.head.data);
			}

			return list.map(translate).join(delimeter);
		}

		function translate(node) {
			switch (node.type) {
				case 'StyleSheet':
					return each(node.rules);

				case 'Atrule':
					var nodes = ['@', node.name];

					if (node.expression && !node.expression.sequence.isEmpty()) {
						nodes.push(' ', translate(node.expression));
					}

					if (node.block) {
						nodes.push('{', translate(node.block), '}');
					} else {
						nodes.push(';');
					}

					return nodes.join('');

				case 'Ruleset':
					return translate(node.selector) + '{' + translate(node.block) + '}';

				case 'Selector':
					return eachDelim(node.selectors, ',');

				case 'SimpleSelector':
					var nodes = node.sequence.map(function(node) {
						// add extra spaces around /deep/ combinator since comment beginning/ending may to be produced
						if (node.type === 'Combinator' && node.name === '/deep/') {
							return ' ' + translate(node) + ' ';
						}

						return translate(node);
					});

					return nodes.join('');

				case 'Block':
					return eachDelim(node.declarations, ';');

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
					var flagsPrefix = ' ';

					if (node.operator !== null) {
						result += node.operator;

						if (node.value !== null) {
							result += translate(node.value);

							// space between string and flags is not required
							if (node.value.type === 'String') {
								flagsPrefix = '';
							}
						}
					}

					if (node.flags !== null) {
						result += flagsPrefix + node.flags;
					}

					return '[' + result + ']';

				case 'FunctionalPseudo':
					return ':' + node.name + '(' + eachDelim(node.arguments, ',') + ')';

				case 'Function':
					return node.name + '(' + eachDelim(node.arguments, ',') + ')';

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

				case 'Unknown':
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
	
	//#region URL: /utils/walk
	modules['/utils/walk'] = function () {
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

				case 'AtruleExpression':
					this.atruleExpression = node;

					node.sequence.each(walkAll, this);

					this.atruleExpression = null;
					break;

				case 'Value':
				case 'Argument':
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
				atruleExpression: null,
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

	//#region URL: /
	modules['/'] = function () {
		var parse = require('/parser');
		var compress = require('/compressor');
		var translate = require('/utils/translate');
//		var translateWithSourceMap = require('/utils/translateWithSourceMap');
		var walkers = require('/utils/walk');
		var clone = require('/utils/clone');
		var List = require('/utils/list');

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
//					var css = translate(ast, true);
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

		function copy(obj) {
			var result = {};

			for (var key in obj) {
				result[key] = obj[key];
			}

			return result;
		}

		function buildCompressOptions(options) {
			options = copy(options);

//			if (typeof options.logger !== 'function' && options.debug) {
//				options.logger = createDefaultLogger(options.debug);
//			}

			return options;
		}

//		function runHandler(ast, options, handlers) {
//			if (!Array.isArray(handlers)) {
//				handlers = [handlers];
//			}
//
//			handlers.forEach(function(fn) {
//				fn(ast, options);
//			});
//		}

		function minify(context, source, options) {
			options = options || {};

			var filename = options.filename || '<unknown>';
			var result;

			// parse
			var ast = debugOutput('parsing', options, Date.now(),
				parse(source, {
					context: context,
					filename: filename//,
//					positions: Boolean(options.sourceMap)
				})
			);

//			// before compress handlers
//			if (options.beforeCompress) {
//				debugOutput('beforeCompress', options, Date.now(),
//					runHandler(ast, options, options.beforeCompress)
//				);
//			}

			// compress
			var compressResult = debugOutput('compress', options, Date.now(),
				compress(ast, buildCompressOptions(options))
			);

//			// after compress handlers
//			if (options.afterCompress) {
//				debugOutput('afterCompress', options, Date.now(),
//					runHandler(compressResult, options, options.afterCompress)
//				);
//			}

			// translate
//			if (options.sourceMap) {
//				result = debugOutput('translateWithSourceMap', options, Date.now(), (function() {
//					var tmp = translateWithSourceMap(compressResult.ast);
//					tmp.map._file = filename; // since other tools can relay on file in source map transform chain
//					tmp.map.setSourceContent(filename, source);
//					return tmp;
//				})());
//			} else {
				result = debugOutput('translate', options, Date.now(), {
					css: translate(compressResult.ast),
					map: null
				});
//			}

			return result;
		}

		function minifyStylesheet(source, options) {
			return minify('stylesheet', source, options);
		};

		function minifyBlock(source, options) {
			return minify('block', source, options);
		}

		var exports = {
			version: '2.3.1',

			// classes
			List: List,

			// main methods
			minify: minifyStylesheet,
			minifyBlock: minifyBlock,

			// step by step
			parse: parse,
			compress: compress,
			translate: translate,
//			translateWithSourceMap: translateWithSourceMap,

			// walkers
			walk: walkers.all,
			walkRules: walkers.rules,
			walkRulesRight: walkers.rulesRight,

			// utils
			clone: clone
		};

		return exports;
	};
	//#endregion
	
	return require('/');
})();