/*!
* CSSO (CSS Optimizer) v3.2.0
* https://github.com/css/csso
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

	//#region URL: /
	modules['/'] = function () {
		var csstree = require('/css-tree');
		var parse = csstree.parse;
		var compress = require('/compress');
		var translate = csstree.translate;
		/*BT-
		var translateWithSourceMap = csstree.translateWithSourceMap;
		*/

		function debugOutput(name, options, startTime, data) {
			/*BT-
			if (options.debug) {
				console.error('## ' + name + ' done in %d ms\n', Date.now() - startTime);
			}
			*/

			return data;
		}

		/*BT-
		function createDefaultLogger(level) {
			var lastDebug;

			return function logger(title, ast) {
				var line = title;

				if (ast) {
					line = '[' + ((Date.now() - lastDebug) / 1000).toFixed(3) + 's] ' + line;
				}

				if (level > 1 && ast) {
					var css = translate(ast, true);

					// when level 2, limit css to 256 symbols
					if (level === 2 && css.length > 256) {
						css = css.substr(0, 256) + '...';
					}

					line += '\n  ' + css + '\n';
				}

				console.error(line);
				lastDebug = Date.now();
			};
		}
		*/

		function copy(obj) {
			var result = {};

			for (var key in obj) {
				result[key] = obj[key];
			}

			return result;
		}

		function buildCompressOptions(options) {
			options = copy(options);

			/*BT-
			if (typeof options.logger !== 'function' && options.debug) {
				options.logger = createDefaultLogger(options.debug);
			}
			*/

			return options;
		}

		/*BT-
		function runHandler(ast, options, handlers) {
			if (!Array.isArray(handlers)) {
				handlers = [handlers];
			}

			handlers.forEach(function(fn) {
				fn(ast, options);
			});
		}
		*/

		function minify(context, source, options) {
			options = options || {};

			var filename = options.filename || '<unknown>';
			var result;

			// parse
			var ast = debugOutput('parsing', options, Date.now(),
				parse(source, {
					context: context,
					filename: filename/*BT-,
					positions: Boolean(options.sourceMap)
					*/
				})
			);

			/*BT-
			// before compress handlers
			if (options.beforeCompress) {
				debugOutput('beforeCompress', options, Date.now(),
					runHandler(ast, options, options.beforeCompress)
				);
			}
			*/

			// compress
			var compressResult = debugOutput('compress', options, Date.now(),
				compress(ast, buildCompressOptions(options))
			);

			/*BT-
			// after compress handlers
			if (options.afterCompress) {
				debugOutput('afterCompress', options, Date.now(),
					runHandler(compressResult, options, options.afterCompress)
				);
			}

			// translate
			if (options.sourceMap) {
				result = debugOutput('translateWithSourceMap', options, Date.now(), (function() {
					var tmp = translateWithSourceMap(compressResult.ast);
					tmp.map._file = filename; // since other tools can relay on file in source map transform chain
					tmp.map.setSourceContent(filename, source);
					return tmp;
				})());
			} else {
			*/
				result = debugOutput('translate', options, Date.now(), {
					css: translate(compressResult.ast),
					map: null
				});
			/*BT-
			}
			*/

			return result;
		}

		function minifyStylesheet(source, options) {
			return minify('stylesheet', source, options);
		}

		function minifyBlock(source, options) {
			return minify('declarationList', source, options);
		}

		var exports = {
			version: '3.2.0',

			// main methods
			minify: minifyStylesheet,
			minifyBlock: minifyBlock,

			// compress an AST
			compress: compress,

			// css syntax parser/walkers/generator/etc
			syntax: csstree
		};

		return exports;
	};
	//#endregion

	//#region URL: /clean
	modules['/clean'] = function () {
		var walk = require('/css-tree').walkUp;
		var handlers = {
			Atrule: require('/clean/Atrule'),
			Rule: require('/clean/Rule'),
			Declaration: require('/clean/Declaration'),
			TypeSelector: require('/clean/TypeSelector'),
			Comment: require('/clean/Comment'),
			Operator: require('/clean/Operator'),
			WhiteSpace: require('/clean/WhiteSpace')
		};

		var exports = function(ast, options) {
			walk(ast, function(node, item, list) {
				if (handlers.hasOwnProperty(node.type)) {
					handlers[node.type].call(this, node, item, list, options);
				}
			});
		};

		return exports;
	};
	//#endregion

	//#region URL: /clean/Atrule
	modules['/clean/Atrule'] = function () {
		var resolveKeyword = require('/css-tree').keyword;

		var exports = function cleanAtrule(node, item, list) {
			if (node.block) {
				// otherwise removed at-rule don't prevent @import for removal
				if (this.stylesheet !== null) {
					this.stylesheet.firstAtrulesAllowed = false;
				}

				if (node.block.children.isEmpty()) {
					list.remove(item);
					return;
				}
			}

			switch (node.name) {
				case 'charset':
					if (!node.prelude || node.prelude.children.isEmpty()) {
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
					if (this.stylesheet === null || !this.stylesheet.firstAtrulesAllowed) {
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

				default:
					var keyword = resolveKeyword(node.name);
					if (keyword.name === 'keyframes' ||
						keyword.name === 'media' ||
						keyword.name === 'supports') {

						// drop at-rule with no prelude
						if (!node.prelude || node.prelude.children.isEmpty()) {
							list.remove(item);
						}
					}
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /clean/Comment
	modules['/clean/Comment'] = function () {
		function cleanComment(data, item, list) {
			list.remove(item);
		}

		return cleanComment;
	};
	//#endregion

	//#region URL: /clean/Declaration
	modules['/clean/Declaration'] = function () {
		function cleanDeclartion(node, item, list) {
			if (node.value.children && node.value.children.isEmpty()) {
				list.remove(item);
			}
		}

		return cleanDeclartion;
	};
	//#endregion

	//#region URL: /clean/Operator
	modules['/clean/Operator'] = function () {
		// remove white spaces around operators when safe
		function cleanWhitespace(node, item, list) {
			if (node.value === '+' || node.value === '-') {
				return;
			}

			if (item.prev !== null && item.prev.data.type === 'WhiteSpace') {
				list.remove(item.prev);
			}

			if (item.next !== null && item.next.data.type === 'WhiteSpace') {
				list.remove(item.next);
			}
		}

		return cleanWhitespace;
	};
	//#endregion

	//#region URL: /clean/Rule
	modules['/clean/Rule'] = function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var walk = require('/css-tree').walk;

		function cleanUnused(selectorList, usageData) {
			selectorList.children.each(function(selector, item, list) {
				var shouldRemove = false;

				walk(selector, function(node) {
					// ignore nodes in nested selectors
					if (this.selector === null || this.selector === selectorList) {
						switch (node.type) {
							case 'SelectorList':
								// TODO: remove toLowerCase when pseudo selectors will be normalized
								// ignore selectors inside :not()
								if (this['function'] === null || this['function'].name.toLowerCase() !== 'not') {
									if (cleanUnused(node, usageData)) {
										shouldRemove = true;
									}
								}
								break;

							case 'ClassSelector':
								if (usageData.whitelist !== null &&
									usageData.whitelist.classes !== null &&
									!hasOwnProperty.call(usageData.whitelist.classes, node.name)) {
									shouldRemove = true;
								}
								if (usageData.blacklist !== null &&
									usageData.blacklist.classes !== null &&
									hasOwnProperty.call(usageData.blacklist.classes, node.name)) {
									shouldRemove = true;
								}
								break;

							case 'IdSelector':
								if (usageData.whitelist !== null &&
									usageData.whitelist.ids !== null &&
									!hasOwnProperty.call(usageData.whitelist.ids, node.name)) {
									shouldRemove = true;
								}
								if (usageData.blacklist !== null &&
									usageData.blacklist.ids !== null &&
									hasOwnProperty.call(usageData.blacklist.ids, node.name)) {
									shouldRemove = true;
								}
								break;

							case 'TypeSelector':
								// TODO: remove toLowerCase when type selectors will be normalized
								// ignore universal selectors
								if (node.name.charAt(node.name.length - 1) !== '*') {
									if (usageData.whitelist !== null &&
										usageData.whitelist.tags !== null &&
										!hasOwnProperty.call(usageData.whitelist.tags, node.name.toLowerCase())) {
										shouldRemove = true;
									}
									if (usageData.blacklist !== null &&
										usageData.blacklist.tags !== null &&
										hasOwnProperty.call(usageData.blacklist.tags, node.name.toLowerCase())) {
										shouldRemove = true;
									}
								}
								break;
						}
					}
				});

				if (shouldRemove) {
					list.remove(item);
				}
			});

			return selectorList.children.isEmpty();
		}

		var exports = function cleanRuleset(node, item, list, options) {
			var usageData = options.usage;

			if (usageData && (usageData.whitelist !== null || usageData.blacklist !== null)) {
				cleanUnused(node.selector, usageData);
			}

			if (node.selector.children.isEmpty() ||
				node.block.children.isEmpty()) {
				list.remove(item);
			}
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /clean/TypeSelector
	modules['/clean/TypeSelector'] = function () {
		// remove useless universal selector
		function cleanType(node, item, list) {
			var name = item.data.name;

			// check it's a non-namespaced universal selector
			if (name !== '*') {
				return;
			}

			// remove when universal selector before other selectors
			var nextType = item.next && item.next.data.type;
			if (nextType === 'IdSelector' ||
				nextType === 'ClassSelector' ||
				nextType === 'AttributeSelector' ||
				nextType === 'PseudoClassSelector' ||
				nextType === 'PseudoElementSelector') {
				list.remove(item);
			}
		};

		return cleanType;
	};
	//#endregion

	//#region URL: /clean/WhiteSpace
	modules['/clean/WhiteSpace'] = function () {
		function cleanWhitespace(node, item, list) {
			// remove when first or last item in sequence
			if (item.next === null || item.prev === null) {
				list.remove(item);
				return;
			}

			// remove when previous node is whitespace
			if (item.prev.data.type === 'WhiteSpace') {
				list.remove(item);
				return;
			}

			if ((this.stylesheet !== null && this.stylesheet.children === list) ||
				(this.block !== null && this.block.children === list)) {
				list.remove(item);
				return;
			}
		}

		return cleanWhitespace;
	};
	//#endregion

	//#region URL: /replace
	modules['/replace'] = function () {
		var walk = require('/css-tree').walkUp;
		var handlers = {
			Atrule: require('/replace/Atrule'),
			AttributeSelector: require('/replace/AttributeSelector'),
			Value: require('/replace/Value'),
			Dimension: require('/replace/Dimension'),
			Percentage: require('/replace/Number'),
			Number: require('/replace/Number'),
			String: require('/replace/String'),
			Url: require('/replace/Url'),
			HexColor: require('/replace/color').compressHex,
			Identifier: require('/replace/color').compressIdent,
			Function: require('/replace/color').compressFunction
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

	//#region URL: /replace/atrule/keyframes
	modules['/replace/atrule/keyframes'] = function () {
		var exports = function(node) {
			node.block.children.each(function(rule) {
				rule.selector.children.each(function(simpleselector) {
					simpleselector.children.each(function(data, item) {
						if (data.type === 'Percentage' && data.value === '100') {
							item.data = {
								type: 'TypeSelector',
								loc: data.loc,
								name: 'to'
							};
						} else if (data.type === 'TypeSelector' && data.name === 'from') {
							item.data = {
								type: 'Percentage',
								loc: data.loc,
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

	//#region URL: /replace/property/background
	modules['/replace/property/background'] = function () {
		var List = require('/css-tree').List;

		var exports = function compressBackground(node) {
			function lastType() {
				if (buffer.length) {
					return buffer[buffer.length - 1].type;
				}
			}

			function flush() {
				if (lastType() === 'WhiteSpace') {
					buffer.pop();
				}

				if (!buffer.length) {
					buffer.unshift(
						{
							type: 'Number',
							loc: null,
							value: '0'
						},
						{
							type: 'WhiteSpace',
							value: ' '
						},
						{
							type: 'Number',
							loc: null,
							value: '0'
						}
					);
				}

				newValue.push.apply(newValue, buffer);

				buffer = [];
			}

			var newValue = [];
			var buffer = [];

			node.children.each(function(node) {
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
				if (node.type === 'WhiteSpace' && (!buffer.length || lastType() === 'WhiteSpace')) {
					return;
				}

				buffer.push(node);
			});

			flush();
			node.children = new List().fromArray(newValue);
		};

		return exports;
	};
	//#endregion

	//#region URL: /replace/property/border
	modules['/replace/property/border'] = function () {
		function removeItemAndRedundantWhiteSpace(list, item) {
			var prev = item.prev;
			var next = item.next;

			if (next !== null) {
				if (next.data.type === 'WhiteSpace' && (prev === null || prev.data.type === 'WhiteSpace')) {
					list.remove(next);
				}
			} else if (prev !== null && prev.data.type === 'WhiteSpace') {
				list.remove(prev);
			}

			list.remove(item);
		}

		var exports = function compressBorder(node) {
			node.children.each(function(node, item, list) {
				if (node.type === 'Identifier' && node.name.toLowerCase() === 'none') {
					if (list.head === list.tail) {
						// replace `none` for zero when `none` is a single term
						item.data = {
							type: 'Number',
							loc: node.loc,
							value: '0'
						};
					} else {
						removeItemAndRedundantWhiteSpace(list, item);
					}
				}
			});
		};

		return exports;
	};
	//#endregion

	//#region URL: /replace/property/font
	modules['/replace/property/font'] = function () {
		function compressFont(node) {
			var list = node.children;

			list.eachRight(function(node, item) {
				if (node.type === 'Identifier') {
					if (node.name === 'bold') {
						item.data = {
							type: 'Number',
							loc: node.loc,
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
				if (node.type === 'WhiteSpace') {
					if (!item.prev || !item.next || item.next.data.type === 'WhiteSpace') {
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

		return compressFont;
	};
	//#endregion

	//#region URL: /replace/property/font-weight
	modules['/replace/property/font-weight'] = function () {
		function compressFontWeight(node) {
			var value = node.children.head.data;

			if (value.type === 'Identifier') {
				switch (value.name) {
					case 'normal':
						node.children.head.data = {
							type: 'Number',
							loc: value.loc,
							value: '400'
						};
						break;
					case 'bold':
						node.children.head.data = {
							type: 'Number',
							loc: value.loc,
							value: '700'
						};
						break;
				}
			}
		};

		return compressFontWeight;
	};
	//#endregion

	//#region URL: /replace/Atrule
	modules['/replace/Atrule'] = function () {
		var resolveKeyword = require('/css-tree').keyword;
		var compressKeyframes = require('/replace/atrule/keyframes');

		var exports = function(node) {
			// compress @keyframe selectors
			if (resolveKeyword(node.name).name === 'keyframes') {
				compressKeyframes(node);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /replace/AttributeSelector
	modules['/replace/AttributeSelector'] = function () {
		// Can unquote attribute detection
		// Adopted implementation of Mathias Bynens
		// https://github.com/mathiasbynens/mothereff.in/blob/master/unquoted-attributes/eff.js
		var escapesRx = /\\([0-9A-Fa-f]{1,6})(\r\n|[ \t\n\f\r])?|\\./g;
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
					loc: attrValue.loc,
					name: unquotedValue
				};
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /replace/color
	modules['/replace/color'] = function () {
		var lexer = require('/css-tree').lexer;
		var packNumber = require('/replace/Number').pack;

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

			if (s === 0) {
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
			var cursor = functionArgs.head;
			var args = [];
			var wasValue = false;

			while (cursor !== null) {
				var node = cursor.data;
				var type = node.type;

				switch (type) {
					case 'Number':
					case 'Percentage':
						if (wasValue) {
							return;
						}

						wasValue = true;
						args.push({
							type: type,
							value: Number(node.value)
						});
						break;

					case 'Operator':
						if (node.value === ',') {
							if (!wasValue) {
								return;
							}
							wasValue = false;
						} else if (wasValue || node.value !== '+') {
							return;
						}
						break;

					default:
						// something we couldn't understand
						return;
				}

				cursor = cursor.next;
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
				args = parseFunctionArgs(node.children, 4, functionName === 'rgba');

				if (!args) {
					// something went wrong
					return;
				}

				if (functionName === 'hsla') {
					args = hslToRgb.apply(null, args);
					node.name = 'rgba';
				}

				if (args[3] === 0) {
					// try to replace `rgba(x, x, x, 0)` to `transparent`
					// always replace `rgba(0, 0, 0, 0)` to `transparent`
					// otherwise avoid replacement in gradients since it may break color transition
					// http://stackoverflow.com/questions/11829410/css3-gradient-rendering-issues-from-transparent-to-white
					var scopeFunctionName = this['function'] && this['function'].name;
					if ((args[0] === 0 && args[1] === 0 && args[2] === 0) ||
						!/^(?:to|from|color-stop)$|gradient$/i.test(scopeFunctionName)) {

						item.data = {
							type: 'Identifier',
							loc: node.loc,
							name: 'transparent'
						};

						return;
					}
				}

				if (args[3] !== 1) {
					// replace argument values for normalized/interpolated
					node.children.each(function(node, item, list) {
						if (node.type === 'Operator') {
							if (node.value !== ',') {
								list.remove(item);
							}
							return;
						}

						item.data = {
							type: 'Number',
							loc: node.loc,
							value: packNumber(args.shift(), null)
						};
					});

					return;
				}

				// otherwise convert to rgb, i.e. rgba(255, 0, 0, 1) -> rgb(255, 0, 0)
				functionName = 'rgb';
			}

			if (functionName === 'hsl') {
				args = args || parseFunctionArgs(node.children, 3, false);

				if (!args) {
					// something went wrong
					return;
				}

				// convert to rgb
				args = hslToRgb.apply(null, args);
				functionName = 'rgb';
			}

			if (functionName === 'rgb') {
				args = args || parseFunctionArgs(node.children, 3, true);

				if (!args) {
					// something went wrong
					return;
				}

				// check if color is not at the end and not followed by space
				var next = item.next;
				if (next && next.data.type !== 'WhiteSpace') {
					list.insert(list.createItem({
						type: 'WhiteSpace',
						value: ' '
					}), next);
				}

				item.data = {
					type: 'HexColor',
					loc: node.loc,
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

			if (NAME_TO_HEX.hasOwnProperty(color) &&
				lexer.matchDeclaration(this.declaration).isType(node, 'color')) {
				var hex = NAME_TO_HEX[color];

				if (hex.length + 1 <= color.length) {
					// replace for shorter hex value
					item.data = {
						type: 'HexColor',
						loc: node.loc,
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
					loc: node.loc,
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

	//#region URL: /replace/Dimension
	modules['/replace/Dimension'] = function () {
		var packNumber = require('/replace/Number').pack;
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
			var value = packNumber(node.value, item);

			node.value = value;

			if (value === '0' && this.declaration !== null && this.atrulePrelude === null) {
				var unit = node.unit.toLowerCase();

				// only length values can be compressed
				if (!LENGTH_UNIT.hasOwnProperty(unit)) {
					return;
				}

				// issue #200: don't remove units in flex property as it could change value meaning
				if (this.declaration.property === 'flex') {
					return;
				}

				// issue #222: don't remove units inside calc
				if (this['function'] && this['function'].name === 'calc') {
					return;
				}

				item.data = {
					type: 'Number',
					loc: node.loc,
					value: value
				};
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /replace/Number
	modules['/replace/Number'] = function () {
		var OMIT_PLUSSIGN = /^(?:\+|(-))?0*(\d*)(?:\.0*|(\.\d*?)0*)?$/;
		var KEEP_PLUSSIGN = /^([\+\-])?0*(\d*)(?:\.0*|(\.\d*?)0*)?$/;
		var unsafeToRemovePlusSignAfter = {
			Dimension: true,
			HexColor: true,
			Identifier: true,
			Number: true,
			Raw: true,
			UnicodeRange: true
		};

		function packNumber(value, item) {
			// omit plus sign only if no prev or prev is safe type
			var regexp = item && item.prev !== null && unsafeToRemovePlusSignAfter.hasOwnProperty(item.prev.data.type)
				? KEEP_PLUSSIGN
				: OMIT_PLUSSIGN;

			// 100 -> '100'
			// 00100 -> '100'
			// +100 -> '100' (only when safe, e.g. omitting plus sign for 1px+1px leads to single dimension instead of two)
			// -100 -> '-100'
			// 0.123 -> '.123'
			// 0.12300 -> '.123'
			// 0.0 -> ''
			// 0 -> ''
			// -0 -> '-'
			value = String(value).replace(regexp, '$1$2$3');

			if (value === '' || value === '-') {
				value = '0';
			}

			return value;
		}

		var exports = function(node, item) {
			node.value = packNumber(node.value, item);
		};
		exports.pack = packNumber;

		return exports;
	};
	//#endregion

	//#region URL: /replace/String
	modules['/replace/String'] = function () {
		var exports = function(node) {
			var value = node.value;

			// remove escaped newlines, i.e.
			// .a { content: "foo\
			// bar"}
			// ->
			// .a { content: "foobar" }
			value = value.replace(/\\(\r\n|\r|\n|\f)/g, '');

			node.value = value;
		};

		return exports;
	};
	//#endregion

	//#region URL: /replace/Url
	modules['/replace/Url'] = function () {
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
					loc: node.value.loc,
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

	//#region URL: /replace/Value
	modules['/replace/Value'] = function () {
		var resolveName = require('/css-tree').property;
		var handlers = {
			'font': require('/replace/property/font'),
			'font-weight': require('/replace/property/font-weight'),
			'background': require('/replace/property/background'),
			'border': require('/replace/property/border'),
			'outline': require('/replace/property/border')
		};

		var exports = function compressValue(node) {
			if (!this.declaration) {
				return;
			}

			var property = resolveName(this.declaration.property);

			if (handlers.hasOwnProperty(property.name)) {
				handlers[property.name](node);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure
	modules['/restructure'] = function () {
		var prepare = require('/restructure/prepare');
		var mergeAtrule = require('/restructure/1-mergeAtrule');
		var initialMergeRuleset = require('/restructure/2-initialMergeRuleset');
		var disjoinRuleset = require('/restructure/3-disjoinRuleset');
		var restructShorthand = require('/restructure/4-restructShorthand');
		var restructBlock = require('/restructure/6-restructBlock');
		var mergeRuleset = require('/restructure/7-mergeRuleset');
		var restructRuleset = require('/restructure/8-restructRuleset');

		var exports = function(ast, options) {
			// prepare ast for restructing
			var indexer = prepare(ast, options);
			/*BT-
			options.logger('prepare', ast);
			*/

			mergeAtrule(ast, options);
			/*BT-
			options.logger('mergeAtrule', ast);
			*/

			initialMergeRuleset(ast);
			/*BT-
			options.logger('initialMergeRuleset', ast);
			*/

			disjoinRuleset(ast);
			/*BT-
			options.logger('disjoinRuleset', ast);
			*/

			restructShorthand(ast, indexer);
			/*BT-
			options.logger('restructShorthand', ast);
			*/

			restructBlock(ast);
			/*BT-
			options.logger('restructBlock', ast);
			*/

			mergeRuleset(ast);
			/*BT-
			options.logger('mergeRuleset', ast);
			*/

			restructRuleset(ast);
			/*BT-
			options.logger('restructRuleset', ast);
			*/
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/prepare
	modules['/restructure/prepare'] = function () {
		var resolveKeyword = require('/css-tree').keyword;
		var walkRules = require('/css-tree').walkRules;
		var translate = require('/css-tree').translate;
		var createDeclarationIndexer = require('/restructure/prepare/createDeclarationIndexer');
		var processSelector = require('/restructure/prepare/processSelector');

		function walk(node, markDeclaration, options) {
			switch (node.type) {
				case 'Rule':
					node.block.children.each(markDeclaration);
					processSelector(node, options.usage);
					break;

				case 'Atrule':
					if (node.prelude) {
						node.prelude.id = null; // pre-init property to avoid multiple hidden class for translate
						node.prelude.id = translate(node.prelude);
					}

					// compare keyframe selectors by its values
					// NOTE: still no clarification about problems with keyframes selector grouping (issue #197)
					if (resolveKeyword(node.name).name === 'keyframes') {
						node.block.avoidRulesMerge = true;  /* probably we don't need to prevent those merges for @keyframes
															   TODO: need to be checked */
						node.block.children.each(function(rule) {
							rule.selector.children.each(function(simpleselector) {
								simpleselector.compareMarker = simpleselector.id;
							});
						});
					}
					break;
			}
		}

		var exports = function prepare(ast, options) {
			var markDeclaration = createDeclarationIndexer();

			walkRules(ast, function(node) {
				walk(node, markDeclaration, options);
			});

			return {
				declaration: markDeclaration
			};
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/prepare/createDeclarationIndexer
	modules['/restructure/prepare/createDeclarationIndexer'] = function () {
		var translate = require('/css-tree').translate;

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
			var ids = new Index();

			return function markDeclaration(node) {
				var id = translate(node);

				node.id = ids.resolve(id);
				node.length = id.length;
				node.fingerprint = null;

				return node;
			};
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/prepare/processSelector
	modules['/restructure/prepare/processSelector'] = function () {
		var translate = require('/css-tree').translate;
		var specificity = require('/restructure/prepare/specificity');

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

			node.selector.children.each(function(simpleSelector) {
				var tagName = '*';
				var scope = 0;

				simpleSelector.children.each(function(node) {
					switch (node.type) {
						case 'ClassSelector':
							if (usageData && usageData.scopes) {
								var classScope = usageData.scopes[node.name] || 0;

								if (scope !== 0 && classScope !== scope) {
									throw new Error('Selector can\'t has classes from different scopes: ' + translate(simpleSelector));
								}

								scope = classScope;
							}
							break;

						case 'PseudoClassSelector':
							var name = node.name.toLowerCase();

							if (!nonFreezePseudoClasses.hasOwnProperty(name)) {
								pseudos[name] = true;
								hasPseudo = true;
							}
							break;

						case 'PseudoElementSelector':
							var name = node.name.toLowerCase();

							if (!nonFreezePseudoElements.hasOwnProperty(name)) {
								pseudos[name] = true;
								hasPseudo = true;
							}
							break;

						case 'TypeSelector':
							tagName = node.name.toLowerCase();
							break;

						case 'AttributeSelector':
							if (node.flags) {
								pseudos['[' + node.flags.toLowerCase() + ']'] = true;
								hasPseudo = true;
							}
							break;

						case 'WhiteSpace':
						case 'Combinator':
							tagName = '*';
							break;
					}
				});

				simpleSelector.compareMarker = specificity(simpleSelector).toString();
				simpleSelector.id = null; // pre-init property to avoid multiple hidden class
				simpleSelector.id = translate(simpleSelector);

				if (scope) {
					simpleSelector.compareMarker += ':' + scope;
				}

				if (tagName !== '*') {
					simpleSelector.compareMarker += ',' + tagName;
				}
			});

			// add property to all rule nodes to avoid multiple hidden class
			node.pseudoSignature = hasPseudo && Object.keys(pseudos).sort().join(',');
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/prepare/specificity
	modules['/restructure/prepare/specificity'] = function () {
		function specificity(simpleSelector) {
			var A = 0;
			var B = 0;
			var C = 0;

			simpleSelector.children.each(function walk(node) {
				switch (node.type) {
					case 'SelectorList':
					case 'Selector':
						node.children.each(walk);
						break;

					case 'IdSelector':
						A++;
						break;

					case 'ClassSelector':
					case 'AttributeSelector':
						B++;
						break;

					case 'PseudoClassSelector':
						switch (node.name.toLowerCase()) {
							case 'not':
								node.children.each(walk);
								break;

							case 'before':
							case 'after':
							case 'first-line':
							case 'first-letter':
								C++;
								break;

							// TODO: support for :nth-*(.. of <SelectorList>), :matches(), :has()

							default:
								B++;
						}
						break;

					case 'PseudoElementSelector':
						C++;
						break;

					case 'TypeSelector':
						// ignore universal selector
						if (node.name.charAt(node.name.length - 1) !== '*') {
							C++;
						}
						break;

				}
			});

			return [A, B, C];
		};

		return specificity;
	};
	//#endregion

	//#region URL: /restructure/1-mergeAtrule
	modules['/restructure/1-mergeAtrule'] = function () {
		var List = require('/css-tree').List;
		var resolveKeyword = require('/css-tree').keyword;
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var walkRulesRight = require('/css-tree').walkRulesRight;

		function addRuleToMap(map, item, list, single) {
			var node = item.data;
			var name = resolveKeyword(node.name).name;
			var id = node.name.toLowerCase() + '/' + (node.prelude ? node.prelude.id : null);

			if (!hasOwnProperty.call(map, name)) {
				map[name] = Object.create(null);
			}

			if (single) {
				delete map[name][id];
			}

			if (!hasOwnProperty.call(map[name], id)) {
				map[name][id] = new List();
			}

			map[name][id].append(list.remove(item));
		}

		function relocateAtrules(ast, options) {
			var collected = Object.create(null);
			var topInjectPoint = null;

			ast.children.each(function(node, item, list) {
				if (node.type === 'Atrule') {
					var keyword = resolveKeyword(node.name);

					switch (keyword.name) {
						case 'keyframes':
							addRuleToMap(collected, item, list, true);
							return;

						case 'media':
							if (options.forceMediaMerge) {
								addRuleToMap(collected, item, list, false);
								return;
							}
							break;
					}

					if (topInjectPoint === null &&
						keyword.name !== 'charset' &&
						keyword.name !== 'import') {
						topInjectPoint = item;
					}
				} else {
					if (topInjectPoint === null) {
						topInjectPoint = item;
					}
				}
			});

			for (var atrule in collected) {
				for (var id in collected[atrule]) {
					ast.children.insertList(collected[atrule][id], atrule === 'media' ? null : topInjectPoint);
				}
			}
		};

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
			if (node.prelude &&
				prev.prelude &&
				node.prelude.id === prev.prelude.id) {
				prev.block.children.appendList(node.block.children);
				list.remove(item);

				// TODO: use it when we can refer to several points in source
				// prev.loc = {
				//     primary: prev.loc,
				//     merged: node.loc
				// };
			}
		}

		var exports = function rejoinAtrule(ast, options) {
			relocateAtrules(ast, options);

			walkRulesRight(ast, function(node, item, list) {
				if (node.type === 'Atrule') {
					processAtrule(node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/2-initialMergeRuleset
	modules['/restructure/2-initialMergeRuleset'] = function () {
		var walkRules = require('/css-tree').walkRules;
		var utils = require('/restructure/utils');

		function processRule(node, item, list) {
			var selectors = node.selector.children;
			var declarations = node.block.children;

			list.prevUntil(item.prev, function(prev) {
				// skip non-ruleset node if safe
				if (prev.type !== 'Rule') {
					return utils.unsafeToSkipNode.call(selectors, prev);
				}

				var prevSelectors = prev.selector.children;
				var prevDeclarations = prev.block.children;

				// try to join rulesets with equal pseudo signature
				if (node.pseudoSignature === prev.pseudoSignature) {
					// try to join by selectors
					if (utils.isEqualSelectors(prevSelectors, selectors)) {
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
		}

		// NOTE: direction should be left to right, since rulesets merge to left
		// ruleset. When direction right to left unmerged rulesets may prevent lookup
		// TODO: remove initial merge
		var exports = function initialMergeRule(ast) {
			walkRules(ast, function(node, item, list) {
				if (node.type === 'Rule') {
					processRule(node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/3-disjoinRuleset
	modules['/restructure/3-disjoinRuleset'] = function () {
		var List = require('/css-tree').List;
		var walkRulesRight = require('/css-tree').walkRulesRight;

		function processRule(node, item, list) {
			var selectors = node.selector.children;

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
					type: 'Rule',
					loc: node.loc,
					selector: {
						type: 'SelectorList',
						loc: node.selector.loc,
						children: newSelectors
					},
					block: {
						type: 'Block',
						loc: node.block.loc,
						children: node.block.children.copy()
					},
					pseudoSignature: node.pseudoSignature
				}), item);
			}
		}

		var exports = function disjoinRule(ast) {
			walkRulesRight(ast, function(node, item, list) {
				if (node.type === 'Rule') {
					processRule(node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/4-restructShorthand
	modules['/restructure/4-restructShorthand'] = function () {
		var List = require('/css-tree').List;
		var translate = require('/css-tree').translate;
		var walkRulesRight = require('/css-tree').walkRulesRight;

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
			this.loc = null;
			this.iehack = undefined;
			this.sides = {
				'top': null,
				'right': null,
				'bottom': null,
				'left': null
			};
		}

		TRBL.prototype.getValueSequence = function(declaration, count) {
			var values = [];
			var iehack = '';
			var hasBadValues = declaration.value.children.some(function(child) {
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

					case 'HexColor': // color
					case 'Number':
					case 'Percentage':
						break;

					case 'Function':
						special = child.name;
						break;

					case 'WhiteSpace':
						return false; // ignore space

					default:
						return true;  // bad value
				}

				values.push({
					node: child,
					special: special,
					important: declaration.important
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

		TRBL.prototype.add = function(name, declaration) {
			function attemptToAdd() {
				var sides = this.sides;
				var side = SIDE[name];

				if (side) {
					if (side in sides === false) {
						return false;
					}

					var values = this.getValueSequence(declaration, 1);

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
					var values = this.getValueSequence(declaration, 4);

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

			// TODO: use it when we can refer to several points in source
			// if (this.loc) {
			//	 this.loc = {
			//		 primary: this.loc,
			//		 merged: declaration.loc
			//	 };
			// } else {
			//	 this.loc = declaration.loc;
			// }
			if (!this.loc) {
				this.loc = declaration.loc;
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
			var result = new List();
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
					result.appendData({ type: 'WhiteSpace', value: ' ' });
				}

				result.appendData(values[i].node);
			}

			if (this.iehack) {
				result.appendData({ type: 'WhiteSpace', value: ' ' });
				result.appendData({
					type: 'Identifier',
					loc: null,
					name: this.iehack
				});
			}

			return {
				type: 'Value',
				loc: null,
				children: result
			};
		};

		TRBL.prototype.getDeclaration = function() {
			return {
				type: 'Declaration',
				loc: this.loc,
				important: this.sides.top.important,
				property: this.name,
				value: this.getValue()
			};
		};

		function processRule(rule, shorts, shortDeclarations, lastShortSelector) {
			var declarations = rule.block.children;
			var selector = rule.selector.children.first().id;

			rule.block.children.eachRight(function(declaration, item) {
				var property = declaration.property;

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

				if (!shorthand || !shorthand.add(property, declaration)) {
					operation = REPLACE;
					shorthand = new TRBL(key);

					// if can't parse value ignore it and break shorthand children
					if (!shorthand.add(property, declaration)) {
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
		}

		function processShorthands(shortDeclarations, markDeclaration) {
			shortDeclarations.forEach(function(item) {
				var shorthand = item.shorthand;

				if (!shorthand.isOkToMinimize()) {
					return;
				}

				if (item.operation === REPLACE) {
					item.item.data = markDeclaration(shorthand.getDeclaration());
				} else {
					item.block.remove(item.item);
				}
			});
		}

		var exports = function restructBlock(ast, indexer) {
			var stylesheetMap = {};
			var shortDeclarations = [];

			walkRulesRight(ast, function(node) {
				if (node.type !== 'Rule') {
					return;
				}

				var stylesheet = this.block || this.stylesheet;
				var ruleId = (node.pseudoSignature || '') + '|' + node.selector.children.first().id;
				var ruleMap;
				var shorts;

				if (!stylesheetMap.hasOwnProperty(stylesheet.id)) {
					ruleMap = {
						lastShortSelector: null
					};
					stylesheetMap[stylesheet.id] = ruleMap;
				} else {
					ruleMap = stylesheetMap[stylesheet.id];
				}

				if (ruleMap.hasOwnProperty(ruleId)) {
					shorts = ruleMap[ruleId];
				} else {
					shorts = {};
					ruleMap[ruleId] = shorts;
				}

				ruleMap.lastShortSelector = processRule.call(this, node, shorts, shortDeclarations, ruleMap.lastShortSelector);
			});

			processShorthands(shortDeclarations, indexer.declaration);
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/6-restructBlock
	modules['/restructure/6-restructBlock'] = function () {
		var resolveProperty = require('/css-tree').property;
		var resolveKeyword = require('/css-tree').keyword;
		var walkRulesRight = require('/css-tree').walkRulesRight;
		var translate = require('/css-tree').translate;
		var fingerprintId = 1;
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

			if (realName === 'background') {
				return propertyName + ':' + translate(declaration.value);
			}

			var declarationId = declaration.id;
			var fingerprint = fingerprints[declarationId];

			if (!fingerprint) {
				switch (declaration.value.type) {
					case 'Value':
						var vendorId = '';
						var iehack = '';
						var special = {};
						var raw = false;

						declaration.value.children.each(function walk(node) {
							switch (node.type) {
								case 'Value':
								case 'Brackets':
								case 'Parentheses':
									node.children.each(walk);
									break;

								case 'Raw':
									raw = true;
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
										var hasComma = node.children.some(function(node) {
											return node.type === 'Operator' && node.value === ',';
										});
										if (!hasComma) {
											name = 'rect-backward';
										}
									}

									special[name + '()'] = true;

									// check nested tokens too
									node.children.each(walk);

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

						fingerprint = raw
							? '!' + fingerprintId++
							: '!' + Object.keys(special).sort() + '|' + iehack + vendorId;
						break;

					case 'Raw':
						fingerprint = '!' + declaration.value.value;
						break;

					default:
						fingerprint = translate(declaration.value);
				}

				fingerprints[declarationId] = fingerprint;
			}

			return propertyName + fingerprint;
		}

		function needless(props, declaration, fingerprints) {
			var property = resolveProperty(declaration.property);

			if (NEEDLESS_TABLE.hasOwnProperty(property.name)) {
				var table = NEEDLESS_TABLE[property.name];

				for (var i = 0; i < table.length; i++) {
					var ppre = getPropertyFingerprint(property.prefix + table[i], declaration, fingerprints);
					var prev = props.hasOwnProperty(ppre) ? props[ppre] : null;

					if (prev && (!declaration.important || prev.item.data.important)) {
						return prev;
					}
				}
			}
		}

		function processRule(rule, item, list, props, fingerprints) {
			var declarations = rule.block.children;

			declarations.eachRight(function(declaration, declarationItem) {
				var property = declaration.property;
				var fingerprint = getPropertyFingerprint(property, declaration, fingerprints);
				var prev = props[fingerprint];

				if (prev && !dontRestructure.hasOwnProperty(property)) {
					if (declaration.important && !prev.item.data.important) {
						props[fingerprint] = {
							block: declarations,
							item: declarationItem
						};

						prev.block.remove(prev.item);

						// TODO: use it when we can refer to several points in source
						// declaration.loc = {
						//	 primary: declaration.loc,
						//	 merged: prev.item.data.loc
						// };
					} else {
						declarations.remove(declarationItem);

						// TODO: use it when we can refer to several points in source
						// prev.item.data.loc = {
						//	 primary: prev.item.data.loc,
						//	 merged: declaration.loc
						// };
					}
				} else {
					var prev = needless(props, declaration, fingerprints);

					if (prev) {
						declarations.remove(declarationItem);

						// TODO: use it when we can refer to several points in source
						// prev.item.data.loc = {
						//	 primary: prev.item.data.loc,
						//	 merged: declaration.loc
						// };
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
		}

		var exports = function restructBlock(ast) {
			var stylesheetMap = {};
			var fingerprints = Object.create(null);

			walkRulesRight(ast, function(node, item, list) {
				if (node.type !== 'Rule') {
					return;
				}

				var stylesheet = this.block || this.stylesheet;
				var ruleId = (node.pseudoSignature || '') + '|' + node.selector.children.first().id;
				var ruleMap;
				var props;

				if (!stylesheetMap.hasOwnProperty(stylesheet.id)) {
					ruleMap = {};
					stylesheetMap[stylesheet.id] = ruleMap;
				} else {
					ruleMap = stylesheetMap[stylesheet.id];
				}

				if (ruleMap.hasOwnProperty(ruleId)) {
					props = ruleMap[ruleId];
				} else {
					props = {};
					ruleMap[ruleId] = props;
				}

				processRule.call(this, node, item, list, props, fingerprints);
			});
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/7-mergeRuleset
	modules['/restructure/7-mergeRuleset'] = function () {
		var walkRules = require('/css-tree').walkRules;
		var utils = require('/restructure/utils');

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

		function processRule(node, item, list) {
			var selectors = node.selector.children;
			var declarations = node.block.children;
			var nodeCompareMarker = selectors.first().compareMarker;
			var skippedCompareMarkers = {};

			list.nextUntil(item.next, function(next, nextItem) {
				// skip non-ruleset node if safe
				if (next.type !== 'Rule') {
					return utils.unsafeToSkipNode.call(selectors, next);
				}

				if (node.pseudoSignature !== next.pseudoSignature) {
					return true;
				}

				var nextFirstSelector = next.selector.children.head;
				var nextDeclarations = next.block.children;
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
		}

		var exports = function mergeRule(ast) {
			walkRules(ast, function(node, item, list) {
				if (node.type === 'Rule') {
					processRule(node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/8-restructRuleset
	modules['/restructure/8-restructRuleset'] = function () {
		var List = require('/css-tree').List;
		var walkRulesRight = require('/css-tree').walkRulesRight;
		var utils = require('/restructure/utils');

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

		function processRule(node, item, list) {
			var avoidRulesMerge = this.block !== null ? this.block.avoidRulesMerge : false;
			var selectors = node.selector.children;
			var block = node.block;
			var disallowDownMarkers = Object.create(null);
			var allowMergeUp = true;
			var allowMergeDown = true;

			list.prevUntil(item.prev, function(prev, prevItem) {
				// skip non-ruleset node if safe
				if (prev.type !== 'Rule') {
					return utils.unsafeToSkipNode.call(selectors, prev);
				}

				var prevSelectors = prev.selector.children;
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
				if (allowMergeUp && utils.isEqualSelectors(prevSelectors, selectors)) {
					prevBlock.children.appendList(block.children);
					list.remove(item);
					return true;
				}

				// try to join by properties
				var diff = utils.compareDeclarations(block.children, prevBlock.children);

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
								block.children = new List().fromArray(diff.ne1);
							}
						} else if (!diff.ne1.length && diff.ne2.length) {
							// node is subset of prevBlock
							var selectorLength = calcSelectorLength(prevSelectors);
							var blockLength = calcDeclarationsLength(diff.eq); // declarations length

							if (allowMergeDown && selectorLength < blockLength) {
								utils.addSelectors(selectors, prevSelectors);
								prevBlock.children = new List().fromArray(diff.ne2);
							}
						} else {
							// diff.ne1.length && diff.ne2.length
							// extract equal block
							var newSelector = {
								type: 'SelectorList',
								loc: null,
								children: utils.addSelectors(prevSelectors.copy(), selectors)
							};
							var newBlockLength = calcSelectorLength(newSelector.children) + 2; // selectors length + curly braces length
							var blockLength = calcDeclarationsLength(diff.eq); // declarations length

							// create new ruleset if declarations length greater than
							// ruleset description overhead
							if (allowMergeDown && blockLength >= newBlockLength) {
								var newRule = {
									type: 'Rule',
									loc: null,
									selector: newSelector,
									block: {
										type: 'Block',
										loc: null,
										children: new List().fromArray(diff.eq)
									},
									pseudoSignature: node.pseudoSignature
								};

								block.children = new List().fromArray(diff.ne1);
								prevBlock.children = new List().fromArray(diff.ne2.concat(diff.ne2overrided));
								list.insert(list.createItem(newRule), prevItem);
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
		}

		var exports = function restructRule(ast) {
			walkRulesRight(ast, function(node, item, list) {
				if (node.type === 'Rule') {
					processRule.call(this, node, item, list);
				}
			});
		};

		return exports;
	};
	//#endregion

	//#region URL: /restructure/utils
	modules['/restructure/utils'] = function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty;

		function isEqualSelectors(a, b) {
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
					fingerprints[data.fingerprint] = data.important;
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
						Number(fingerprints[data.fingerprint]) >= Number(data.important)) {
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
				case 'Rule':
					// unsafe skip ruleset with selector similarities
					return hasSimilarSelectors(node.selector.children, this);

				case 'Atrule':
					// can skip at-rules with blocks
					if (node.block) {
						// unsafe skip at-rule if block contains something unsafe to skip
						return node.block.children.some(unsafeToSkipNode, this);
					}
					break;

				case 'Declaration':
					return false;
			}

			// unsafe by default
			return true;
		}

		var exports = {
			isEqualSelectors: isEqualSelectors,
			isEqualDeclarations: isEqualDeclarations,
			compareDeclarations: compareDeclarations,
			addSelectors: addSelectors,
			hasSimilarSelectors: hasSimilarSelectors,
			unsafeToSkipNode: unsafeToSkipNode
		};

		return exports;
	};
	//#endregion

	//#region URL: /compress
	modules['/compress'] = function () {
		var List = require('/css-tree').List;
		var clone = require('/css-tree').clone;
		var usageUtils = require('/usage');
		var clean = require('/clean');
		var replace = require('/replace');
		var restructure = require('/restructure');
		var walkRules = require('/css-tree').walkRules;

		function readChunk(children, specialComments) {
			var buffer = new List();
			var nonSpaceTokenInBuffer = false;
			var protectedComment;

			children.nextUntil(children.head, function(node, item, list) {
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

				if (node.type !== 'WhiteSpace') {
					nonSpaceTokenInBuffer = true;
				}

				buffer.insert(list.remove(item));
			});

			return {
				comment: protectedComment,
				stylesheet: {
					type: 'StyleSheet',
					loc: null,
					children: buffer
				}
			};
		}

		function compressChunk(ast, firstAtrulesAllowed, num, options) {
			/*BT-
			options.logger('Compress block #' + num, null, true);
			*/

			var seed = 1;

			if (ast.type === 'StyleSheet') {
				ast.firstAtrulesAllowed = firstAtrulesAllowed;
				ast.id = seed++;
			}

			walkRules(ast, function markScopes(node) {
				if (node.type === 'Atrule' && node.block !== null) {
					node.block.id = seed++;
				}
			});
			/*BT-
			options.logger('init', ast);
			*/

			// remove redundant
			clean(ast, options);
			/*BT-
			options.logger('clean', ast);
			*/

			// replace nodes for shortened forms
			replace(ast, options);
			/*BT-
			options.logger('replace', ast);
			*/

			// structure optimisations
			if (options.restructuring) {
				restructure(ast, options);
			}

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
			return new List().appendData({
				type: 'Rule',
				loc: null,
				selector: {
					type: 'SelectorList',
					loc: null,
					children: new List().appendData({
						type: 'Selector',
						loc: null,
						children: new List().appendData({
							type: 'TypeSelector',
							loc: null,
							name: 'x'
						})
					})
				},
				block: block
			});
		}

		var exports = function compress(ast, options) {
			ast = ast || { type: 'StyleSheet', loc: null, children: new List() };
			options = options || {};

			var compressOptions = {
				/*BT-
				logger: typeof options.logger === 'function' ? options.logger : function() {},
				*/
				restructuring: getRestructureOption(options),
				forceMediaMerge: Boolean(options.forceMediaMerge),
				usage: options.usage ? usageUtils.buildIndex(options.usage) : false
			};
			var specialComments = getCommentsOption(options);
			var firstAtrulesAllowed = true;
			var input;
			var output = new List();
			var chunk;
			var chunkNum = 1;
			var chunkChildren;

			if (options.clone) {
				ast = clone(ast);
			}

			if (ast.type === 'StyleSheet') {
				input = ast.children;
				ast.children = output;
			} else {
				input = wrapBlock(ast);
			}

			do {
				chunk = readChunk(input, Boolean(specialComments));
				compressChunk(chunk.stylesheet, firstAtrulesAllowed, chunkNum++, compressOptions);
				chunkChildren = chunk.stylesheet.children;

				if (chunk.comment) {
					// add \n before comment if there is another content in output
					if (!output.isEmpty()) {
						output.insert(List.createItem({
							type: 'Raw',
							value: '\n'
						}));
					}

					output.insert(List.createItem(chunk.comment));

					// add \n after comment if chunk is not empty
					if (!chunkChildren.isEmpty()) {
						output.insert(List.createItem({
							type: 'Raw',
							value: '\n'
						}));
					}
				}

				if (firstAtrulesAllowed && !chunkChildren.isEmpty()) {
					var lastRule = chunkChildren.last();

					if (lastRule.type !== 'Atrule' ||
					   (lastRule.name !== 'import' && lastRule.name !== 'charset')) {
						firstAtrulesAllowed = false;
					}
				}

				if (specialComments !== 'exclamation') {
					specialComments = false;
				}

				output.appendList(chunkChildren);
			} while (!input.isEmpty());

			return {
				ast: ast
			};
		};

		return exports;
	};
	//#endregion

	//#region URL: /usage
	modules['/usage'] = function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty;

		function buildMap(list, caseInsensitive) {
			var map = Object.create(null);

			if (!Array.isArray(list)) {
				return null;
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

		function buildList(data) {
			if (!data) {
				return null;
			}

			var tags = buildMap(data.tags, true);
			var ids = buildMap(data.ids);
			var classes = buildMap(data.classes);

			if (tags === null &&
				ids === null &&
				classes === null) {
				return null;
			}

			return {
				tags: tags,
				ids: ids,
				classes: classes
			};
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
				whitelist: buildList(data),
				blacklist: buildList(data.blacklist),
				scopes: scopes
			};
		}

		var exports = {
			buildIndex: buildIndex
		};

		return exports;
	};
	//#endregion

	/*!
	* CSSTree v1.0.0 Alpha 23
	* https://github.com/csstree/csstree
	*
	* Copyright 2016-2017, Roman Dvornov
	* Released under the MIT License
	*/
	//#region URL: /css-tree
	modules['/css-tree'] = function () {
		'use strict';

		var exports = require('/css-tree/syntax');

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/convertor
	modules['/css-tree/convertor'] = function () {
		var createConvertor = require('/css-tree/convertor/create');

		var exports = createConvertor(require('/css-tree/walker'));

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/convertor/create
	modules['/css-tree/convertor/create'] = function () {
		var List = require('/css-tree/utils/list');

		var exports = function createConvertors(walker) {
			var walk = walker.walk;
			var walkUp = walker.walkUp;

			return {
				fromPlainObject: function(ast) {
					walk(ast, function(node) {
						if (node.children && node.children instanceof List === false) {
							node.children = new List().fromArray(node.children);
						}
					});

					return ast;
				},
				toPlainObject: function(ast) {
					walkUp(ast, function(node) {
						if (node.children && node.children instanceof List) {
							node.children = node.children.toArray();
						}
					});

					return ast;
				}
			};
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/data
	modules['/css-tree/data'] = function () {
		var mdnProperties = require('/css-tree/data/mdn-data/css/properties');
		var mdnSyntaxes = require('/css-tree/data/mdn-data/css/syntaxes');
		var patch = require('/css-tree/data/patch');
		var data = {
			properties: {},
			types: {}
		};

		function normalizeSyntax(syntax) {
			return syntax
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&nbsp;/g, ' ')
				.replace(/&amp;/g, '&');
		}

		function patchDict(dict, patchDict) {
			for (var key in patchDict) {
				if (key in dict) {
					if (patchDict[key].syntax) {
						dict[key].syntax = patchDict[key].syntax;
					} else {
						delete dict[key];
					}
				} else {
					if (patchDict[key].syntax) {
						dict[key] = patchDict[key];
					}
				}
			}
		}

		// apply patch
		patchDict(mdnProperties, patch.properties);
		patchDict(mdnSyntaxes, patch.syntaxes);

		// normalize source mdnProperties syntaxes, since it uses html token
		for (var key in mdnProperties) {
			data.properties[key] = normalizeSyntax(mdnProperties[key].syntax);
		}

		for (var key in mdnSyntaxes) {
			data.types[key] = normalizeSyntax(mdnSyntaxes[key].syntax);
		}

		return data;
	};
	//#endregion

	//#region URL: /css-tree/data/mdn-data/css/properties
	modules['/css-tree/data/mdn-data/css/properties'] = function () {
		var exports = {
			"--*": {
				"syntax": "<declaration-value>",
				"media": "all",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Variables"
				],
				"initial": "seeProse",
				"appliesto": "allElements",
				"computed": "asSpecifiedWithVarsSubstituted",
				"order": "perGrammar",
				"status": "experimental"
			},
			"-ms-overflow-style": {
				"syntax": "auto | none | scrollbar | -ms-autohiding-scrollbar",
				"media": "interactive",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Microsoft Extensions"
				],
				"initial": "auto",
				"appliesto": "nonReplacedBlockAndInlineBlockElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-appearance": {
				"syntax": "none | button | button-arrow-down | button-arrow-next | button-arrow-previous | button-arrow-up | button-bevel | button-focus | caret | checkbox | checkbox-container | checkbox-label | checkmenuitem | dualbutton | groupbox | listbox | listitem | menuarrow | menubar | menucheckbox | menuimage | menuitem | menuitemtext | menulist | menulist-button | menulist-text | menulist-textfield | menupopup | menuradio | menuseparator | meterbar | meterchunk | progressbar | progressbar-vertical | progresschunk | progresschunk-vertical | radio | radio-container | radio-label | radiomenuitem | range | range-thumb | resizer | resizerpanel | scale-horizontal | scalethumbend | scalethumb-horizontal | scalethumbstart | scalethumbtick | scalethumb-vertical | scale-vertical | scrollbarbutton-down | scrollbarbutton-left | scrollbarbutton-right | scrollbarbutton-up | scrollbarthumb-horizontal | scrollbarthumb-vertical | scrollbartrack-horizontal | scrollbartrack-vertical | searchfield | separator | sheet | spinner | spinner-downbutton | spinner-textfield | spinner-upbutton | splitter | statusbar | statusbarpanel | tab | tabpanel | tabpanels | tab-scroll-arrow-back | tab-scroll-arrow-forward | textfield | textfield-multiline | toolbar | toolbarbutton | toolbarbutton-dropdown | toolbargripper | toolbox | tooltip | treeheader | treeheadercell | treeheadersortarrow | treeitem | treeline | treetwisty | treetwistyopen | treeview | -moz-mac-unified-toolbar | -moz-win-borderless-glass | -moz-win-browsertabbar-toolbox | -moz-win-communicationstext | -moz-win-communications-toolbox | -moz-win-exclude-glass | -moz-win-glass | -moz-win-mediatext | -moz-win-media-toolbox | -moz-window-button-box | -moz-window-button-box-maximized | -moz-window-button-close | -moz-window-button-maximize | -moz-window-button-minimize | -moz-window-button-restore | -moz-window-frame-bottom | -moz-window-frame-left | -moz-window-frame-right | -moz-window-titlebar | -moz-window-titlebar-maximized",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions",
					"WebKit Extensions"
				],
				"initial": "noneButOverriddenInUserAgentCSS",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-binding": {
				"syntax": "<url> | none",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "none",
				"appliesto": "allElementsExceptGeneratedContentOrPseudoElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-border-bottom-colors": {
				"syntax": "[ <color> ]* <color> | none",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-border-left-colors": {
				"syntax": "[ <color> ]* <color> | none",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-border-right-colors": {
				"syntax": "[ <color> ]* <color> | none",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-border-top-colors": {
				"syntax": "[ <color> ]* <color> | none",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-context-properties": {
				"syntax": "none | [ fill | fill-opacity | stroke | stroke-opacity ]#",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "none",
				"appliesto": "allElementsThatCanReferenceImages",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-float-edge": {
				"syntax": "border-box | content-box | margin-box | padding-box",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "content-box",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-force-broken-image-icon": {
				"syntax": "<integer>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "0",
				"appliesto": "images",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-image-region": {
				"syntax": "<shape> | auto",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "auto",
				"appliesto": "xulImageElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-orient": {
				"syntax": "inline | block | horizontal | vertical",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "inline",
				"appliesto": "anyElementEffectOnProgressAndMeter",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-outline-radius": {
				"syntax": "<outline-radius>{1,4} [ / <outline-radius>{1,4} ]?",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"-moz-outline-radius-topleft",
					"-moz-outline-radius-topright",
					"-moz-outline-radius-bottomright",
					"-moz-outline-radius-bottomleft"
				],
				"percentages": [
					"-moz-outline-radius-topleft",
					"-moz-outline-radius-topright",
					"-moz-outline-radius-bottomright",
					"-moz-outline-radius-bottomleft"
				],
				"groups": [
					"Mozilla Extensions"
				],
				"initial": [
					"-moz-outline-radius-topleft",
					"-moz-outline-radius-topright",
					"-moz-outline-radius-bottomright",
					"-moz-outline-radius-bottomleft"
				],
				"appliesto": "allElements",
				"computed": [
					"-moz-outline-radius-topleft",
					"-moz-outline-radius-topright",
					"-moz-outline-radius-bottomright",
					"-moz-outline-radius-bottomleft"
				],
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-outline-radius-bottomleft": {
				"syntax": "<outline-radius>",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToDimensionOfBorderBox",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-outline-radius-bottomright": {
				"syntax": "<outline-radius>",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToDimensionOfBorderBox",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-outline-radius-topleft": {
				"syntax": "<outline-radius>",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToDimensionOfBorderBox",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-outline-radius-topright": {
				"syntax": "<outline-radius>",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToDimensionOfBorderBox",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-stack-sizing": {
				"syntax": "ignore | stretch-to-fit",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "stretch-to-fit",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-text-blink": {
				"syntax": "none | blink",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-user-focus": {
				"syntax": "ignore | normal | select-after | select-before | select-menu | select-same | select-all | none",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-user-input": {
				"syntax": "auto | none | enabled | disabled",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-user-modify": {
				"syntax": "read-only | read-write | write-only",
				"media": "interactive",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "read-only",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-moz-window-shadow": {
				"syntax": "default | menu | tooltip | sheet | none",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "default",
				"appliesto": "allElementsCreatingNativeWindows",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-border-before": {
				"syntax": "<'border-width'> || <'border-style'> || <'color'>",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": [
					"-webkit-border-before-width"
				],
				"groups": [
					"WebKit Extensions"
				],
				"initial": [
					"border-width",
					"border-style",
					"color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-width",
					"border-style",
					"color"
				],
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-border-before-color": {
				"syntax": "<'color'>",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-border-before-style": {
				"syntax": "<'border-style'>",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-border-before-width": {
				"syntax": "<'border-width'>",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLengthZeroIfBorderStyleNoneOrHidden",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-box-reflect": {
				"syntax": "[ above | below | right | left ]? <length>? <image>?",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-mask": {
				"syntax": "<mask-image> [ <'-webkit-mask-repeat'> || <'-webkit-mask-attachment'> || <'-webkit-mask-position'> || <'-webkit-mask-origin'> || <'-webkit-mask-clip'> ]*",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": [
					"-webkit-mask-image",
					"-webkit-mask-repeat",
					"-webkit-mask-attachment",
					"-webkit-mask-position",
					"-webkit-mask-origin",
					"-webkit-mask-clip"
				],
				"appliesto": "allElements",
				"computed": [
					"-webkit-mask-image",
					"-webkit-mask-repeat",
					"-webkit-mask-attachment",
					"-webkit-mask-position",
					"-webkit-mask-origin",
					"-webkit-mask-clip"
				],
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-mask-attachment": {
				"syntax": "<attachment> [, <attachment> ]*",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "scroll",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-clip": {
				"syntax": "[ border | border-box | padding | padding-box | content | content-box | text ]#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "border",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-composite": {
				"syntax": "<composite-style> [, <composite-style> ]*",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "source-over",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-image": {
				"syntax": "<mask-image> [, <mask-image> ]*",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "absoluteURIOrNone",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-origin": {
				"syntax": "[ padding | border | content ] [, [ border | padding | content ] ]*",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "padding",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-position": {
				"syntax": "<mask-position>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToSizeOfElement",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "0% 0%",
				"appliesto": "allElements",
				"computed": "absoluteLengthOrPercentage",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-position-x": {
				"syntax": "[ <length-percentage> | left | center | right ]#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToSizeOfElement",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "0%",
				"appliesto": "allElements",
				"computed": "absoluteLengthOrPercentage",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-position-y": {
				"syntax": "[ <length-percentage> | top | center | bottom ]#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToSizeOfElement",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "0%",
				"appliesto": "allElements",
				"computed": "absoluteLengthOrPercentage",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-repeat": {
				"syntax": "<repeat-style> [, <repeat-style> ]*",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "repeat",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-repeat-x": {
				"syntax": "repeat | no-repeat | space | round",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "repeat",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-mask-repeat-y": {
				"syntax": "repeat | no-repeat | space | round",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "repeat",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"status": "nonstandard"
			},
			"-webkit-tap-highlight-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "black",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-text-fill-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": true,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-text-stroke": {
				"syntax": "<length> || <color>",
				"media": "visual",
				"inherited": true,
				"animationType": [
					"-webkit-text-stroke-width",
					"-webkit-text-stroke-color"
				],
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": [
					"-webkit-text-stroke-width",
					"-webkit-text-stroke-color"
				],
				"appliesto": "allElements",
				"computed": [
					"-webkit-text-stroke-width",
					"-webkit-text-stroke-color"
				],
				"order": "canonicalOrder",
				"status": "nonstandard"
			},
			"-webkit-text-stroke-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": true,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-text-stroke-width": {
				"syntax": "<length>",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "absoluteLength",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"-webkit-touch-callout": {
				"syntax": "default | none",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"WebKit Extensions"
				],
				"initial": "default",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"align-content": {
				"syntax": "flex-start | flex-end | center | space-between | space-around | space-evenly | stretch",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "stretch",
				"appliesto": "multilineFlexContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"align-items": {
				"syntax": "flex-start | flex-end | center | baseline | stretch",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "stretch",
				"appliesto": "flexContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"align-self": {
				"syntax": "auto | flex-start | flex-end | center | baseline | stretch",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "auto",
				"appliesto": "flexItemsAndInFlowPseudos",
				"computed": "autoOnAbsolutelyPositionedElementsValueOfAlignItemsOnParent",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"all": {
				"syntax": "initial | inherit | unset",
				"media": "noPracticalMedia",
				"inherited": false,
				"animationType": "eachOfShorthandPropertiesExceptUnicodeBiDiAndDirection",
				"percentages": "no",
				"groups": [
					"CSS Miscellaneous"
				],
				"initial": "noPracticalInitialValue",
				"appliesto": "allElements",
				"computed": "asSpecifiedAppliesToEachProperty",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"animation": {
				"syntax": "<single-animation>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Animations"
				],
				"initial": [
					"animation-name",
					"animation-duration",
					"animation-timing-function",
					"animation-delay",
					"animation-iteration-count",
					"animation-direction",
					"animation-fill-mode",
					"animation-play-state"
				],
				"appliesto": "allElementsAndPseudos",
				"computed": [
					"animation-name",
					"animation-duration",
					"animation-timing-function",
					"animation-delay",
					"animation-direction",
					"animation-iteration-count",
					"animation-fill-mode",
					"animation-play-state"
				],
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"animation-delay": {
				"syntax": "<time>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Animations"
				],
				"initial": "0s",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"animation-direction": {
				"syntax": "<single-animation-direction>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Animations"
				],
				"initial": "normal",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"animation-duration": {
				"syntax": "<time>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Animations"
				],
				"initial": "0s",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"animation-fill-mode": {
				"syntax": "<single-animation-fill-mode>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Animations"
				],
				"initial": "none",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"animation-iteration-count": {
				"syntax": "<single-animation-iteration-count>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Animations"
				],
				"initial": "1",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"animation-name": {
				"syntax": "[ none | <keyframes-name> ]#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Animations"
				],
				"initial": "none",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"animation-play-state": {
				"syntax": "<single-animation-play-state>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Animations"
				],
				"initial": "running",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"animation-timing-function": {
				"syntax": "<single-timing-function>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Animations"
				],
				"initial": "ease",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"appearance": {
				"syntax": "auto | none",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "perGrammar",
				"status": "experimental"
			},
			"azimuth": {
				"syntax": "<angle> | [ [ left-side | far-left | left | center-left | center | center-right | right | far-right | right-side ] || behind ] | leftwards | rightwards",
				"media": "aural",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Speech"
				],
				"initial": "center",
				"appliesto": "allElements",
				"computed": "normalizedAngle",
				"order": "orderOfAppearance",
				"status": "obsolete"
			},
			"backdrop-filter": {
				"syntax": "none | <filter-function-list>",
				"media": "visual",
				"inherited": false,
				"animationType": "filterList",
				"percentages": "no",
				"groups": [
					"Filter Effects"
				],
				"initial": "none",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"backface-visibility": {
				"syntax": "visible | hidden",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Transforms"
				],
				"initial": "visible",
				"appliesto": "transformableElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"background": {
				"syntax": "[ <bg-layer> , ]* <final-bg-layer>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"background-color",
					"background-image",
					"background-clip",
					"background-position",
					"background-size",
					"background-repeat",
					"background-attachment"
				],
				"percentages": [
					"background-position",
					"background-size"
				],
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"background-image",
					"background-position",
					"background-size",
					"background-repeat",
					"background-origin",
					"background-clip",
					"background-attachment",
					"background-color"
				],
				"appliesto": "allElements",
				"computed": [
					"background-image",
					"background-position",
					"background-size",
					"background-repeat",
					"background-origin",
					"background-clip",
					"background-attachment",
					"background-color"
				],
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"background-attachment": {
				"syntax": "<attachment>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "scroll",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"background-blend-mode": {
				"syntax": "<blend-mode>#",
				"media": "none",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Compositing and Blending"
				],
				"initial": "normal",
				"appliesto": "allElementsSVGContainerGraphicsAndGraphicsReferencingElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"background-clip": {
				"syntax": "<box>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "border-box",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"background-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": false,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "transparent",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"background-image": {
				"syntax": "<bg-image>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecifiedURLsAbsolute",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"background-origin": {
				"syntax": "<box>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "padding-box",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"background-position": {
				"syntax": "<position>#",
				"media": "visual",
				"inherited": false,
				"animationType": "repeatableListOfSimpleListOfLpc",
				"percentages": "referToSizeOfBackgroundPositioningAreaMinusBackgroundImageSize",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "0% 0%",
				"appliesto": "allElements",
				"computed": "listEachItemTwoKeywordsOriginOffsets",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"background-position-x": {
				"syntax": "[ center | [ left | right | x-start | x-end ]? <length-percentage>? ]#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToWidthOfBackgroundPositioningAreaMinusBackgroundImageHeight",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "left",
				"appliesto": "allElements",
				"computed": "listEachItemConsistingOfAbsoluteLengthPercentageAndOrigin",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"background-position-y": {
				"syntax": "[ center | [ top | bottom | y-start | y-end ]? <length-percentage>? ]#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToHeightOfBackgroundPositioningAreaMinusBackgroundImageHeight",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "top",
				"appliesto": "allElements",
				"computed": "listEachItemConsistingOfAbsoluteLengthPercentageAndOrigin",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"background-repeat": {
				"syntax": "<repeat-style>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "repeat",
				"appliesto": "allElements",
				"computed": "listEachItemHasTwoKeywordsOnePerDimension",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"background-size": {
				"syntax": "<bg-size>#",
				"media": "visual",
				"inherited": false,
				"animationType": "repeatableListOfSimpleListOfLpc",
				"percentages": "relativeToBackgroundPositioningArea",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "auto auto",
				"appliesto": "allElements",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"block-size": {
				"syntax": "<'width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "blockSizeOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "auto",
				"appliesto": "sameAsWidthAndHeight",
				"computed": "sameAsWidthAndHeight",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border": {
				"syntax": "<br-width> || <br-style> || <color>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"border-color",
					"border-style",
					"border-width"
				],
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-width",
					"border-style",
					"border-color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-width",
					"border-style",
					"border-color"
				],
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-block-end": {
				"syntax": "<'border-width'> || <'border-style'> || <'color'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": [
					"border-width",
					"border-style",
					"color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-width",
					"border-style",
					"color"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-block-end-color": {
				"syntax": "<'color'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-block-end-style": {
				"syntax": "<'border-style'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-block-end-width": {
				"syntax": "<'border-width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLengthZeroIfBorderStyleNoneOrHidden",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-block-start": {
				"syntax": "<'border-width'> || <'border-style'> || <'color'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": [
					"border-width",
					"border-style",
					"color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-width",
					"border-style",
					"color"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-block-start-color": {
				"syntax": "<'color'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-block-start-style": {
				"syntax": "<'border-style'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-block-start-width": {
				"syntax": "<'border-width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLengthZeroIfBorderStyleNoneOrHidden",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-bottom": {
				"syntax": "<br-width> || <br-style> || <color>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"border-bottom-color",
					"border-bottom-style",
					"border-bottom-width"
				],
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-bottom-width",
					"border-bottom-style",
					"border-bottom-color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-bottom-width",
					"border-bottom-style",
					"border-bottom-color"
				],
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-bottom-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": false,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-bottom-left-radius": {
				"syntax": "<length-percentage>{1,2}",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToDimensionOfBorderBox",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "0",
				"appliesto": "allElementsUAsNotRequiredWhenCollapse",
				"computed": "twoAbsoluteLengthOrPercentages",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-bottom-right-radius": {
				"syntax": "<length-percentage>{1,2}",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToDimensionOfBorderBox",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "0",
				"appliesto": "allElementsUAsNotRequiredWhenCollapse",
				"computed": "twoAbsoluteLengthOrPercentages",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-bottom-style": {
				"syntax": "<br-style>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-bottom-width": {
				"syntax": "<br-width>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLengthOr0IfBorderBottomStyleNoneOrHidden",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-collapse": {
				"syntax": "collapse | separate",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Table"
				],
				"initial": "separate",
				"appliesto": "tableElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-color": {
				"syntax": "<color>{1,4}",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"border-bottom-color",
					"border-left-color",
					"border-right-color",
					"border-top-color"
				],
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-top-color",
					"border-right-color",
					"border-bottom-color",
					"border-left-color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-bottom-color",
					"border-left-color",
					"border-right-color",
					"border-top-color"
				],
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-image": {
				"syntax": "<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": [
					"border-image-slice",
					"border-image-width"
				],
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-image-source",
					"border-image-slice",
					"border-image-width",
					"border-image-outset",
					"border-image-repeat"
				],
				"appliesto": "allElementsExceptTableElementsWhenCollapse",
				"computed": [
					"border-image-outset",
					"border-image-repeat",
					"border-image-slice",
					"border-image-source",
					"border-image-width"
				],
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-image-outset": {
				"syntax": "[ <length> | <number> ]{1,4}",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "0s",
				"appliesto": "allElementsExceptTableElementsWhenCollapse",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-image-repeat": {
				"syntax": "[ stretch | repeat | round | space ]{1,2}",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "stretch",
				"appliesto": "allElementsExceptTableElementsWhenCollapse",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-image-slice": {
				"syntax": "<number-percentage>{1,4} && fill?",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToSizeOfBorderImage",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "100%",
				"appliesto": "allElementsExceptTableElementsWhenCollapse",
				"computed": "oneToFourPercentagesOrAbsoluteLengthsPlusFill",
				"order": "percentagesOrLengthsFollowedByFill",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-image-source": {
				"syntax": "none | <image>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "none",
				"appliesto": "allElementsExceptTableElementsWhenCollapse",
				"computed": "noneOrImageWithAbsoluteURI",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-image-width": {
				"syntax": "[ <length-percentage> | <number> | auto ]{1,4}",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToWidthOrHeightOfBorderImageArea",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "1",
				"appliesto": "allElementsExceptTableElementsWhenCollapse",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-inline-end": {
				"syntax": "<'border-width'> || <'border-style'> || <'color'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": [
					"border-width",
					"border-style",
					"color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-width",
					"border-style",
					"color"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-inline-end-color": {
				"syntax": "<'color'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-inline-end-style": {
				"syntax": "<'border-style'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-inline-end-width": {
				"syntax": "<'border-width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLengthZeroIfBorderStyleNoneOrHidden",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-inline-start": {
				"syntax": "<'border-width'> || <'border-style'> || <'color'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": [
					"border-width",
					"border-style",
					"color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-width",
					"border-style",
					"color"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-inline-start-color": {
				"syntax": "<'color'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-inline-start-style": {
				"syntax": "<'border-style'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-inline-start-width": {
				"syntax": "<'border-width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLengthZeroIfBorderStyleNoneOrHidden",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-left": {
				"syntax": "<br-width> || <br-style> || <color>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"border-left-color",
					"border-left-style",
					"border-left-width"
				],
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-left-width",
					"border-left-style",
					"border-left-color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-left-width",
					"border-left-style",
					"border-left-color"
				],
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-left-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": false,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-left-style": {
				"syntax": "<br-style>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-left-width": {
				"syntax": "<br-width>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLengthOr0IfBorderLeftStyleNoneOrHidden",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-radius": {
				"syntax": "<length-percentage>{1,4} [ / <length-percentage>{1,4} ]?",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"border-top-left-radius",
					"border-top-right-radius",
					"border-bottom-right-radius",
					"border-bottom-left-radius"
				],
				"percentages": "referToDimensionOfBorderBox",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-top-left-radius",
					"border-top-right-radius",
					"border-bottom-right-radius",
					"border-bottom-left-radius"
				],
				"appliesto": "allElementsUAsNotRequiredWhenCollapse",
				"computed": [
					"border-bottom-left-radius",
					"border-bottom-right-radius",
					"border-top-left-radius",
					"border-top-right-radius"
				],
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-right": {
				"syntax": "<br-width> || <br-style> || <color>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"border-right-color",
					"border-right-style",
					"border-right-width"
				],
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-right-width",
					"border-right-style",
					"border-right-color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-right-width",
					"border-right-style",
					"border-right-color"
				],
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-right-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": false,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-right-style": {
				"syntax": "<br-style>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-right-width": {
				"syntax": "<br-width>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLengthOr0IfBorderRightStyleNoneOrHidden",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-spacing": {
				"syntax": "<length> <length>?",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Table"
				],
				"initial": "0",
				"appliesto": "tableElements",
				"computed": "twoAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"border-style": {
				"syntax": "<br-style>{1,4}",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-top-style",
					"border-right-style",
					"border-bottom-style",
					"border-left-style"
				],
				"appliesto": "allElements",
				"computed": [
					"border-bottom-style",
					"border-left-style",
					"border-right-style",
					"border-top-style"
				],
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-top": {
				"syntax": "<br-width> || <br-style> || <color>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"border-top-color",
					"border-top-style",
					"border-top-width"
				],
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-top-width",
					"border-top-style",
					"border-top-color"
				],
				"appliesto": "allElements",
				"computed": [
					"border-top-width",
					"border-top-style",
					"border-top-color"
				],
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-top-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": false,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-top-left-radius": {
				"syntax": "<length-percentage>{1,2}",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToDimensionOfBorderBox",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "0",
				"appliesto": "allElementsUAsNotRequiredWhenCollapse",
				"computed": "twoAbsoluteLengthOrPercentages",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-top-right-radius": {
				"syntax": "<length-percentage>{1,2}",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToDimensionOfBorderBox",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "0",
				"appliesto": "allElementsUAsNotRequiredWhenCollapse",
				"computed": "twoAbsoluteLengthOrPercentages",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-top-style": {
				"syntax": "<br-style>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-top-width": {
				"syntax": "<br-width>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLengthOr0IfBorderTopStyleNoneOrHidden",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"border-width": {
				"syntax": "<br-width>{1,4}",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"border-bottom-width",
					"border-left-width",
					"border-right-width",
					"border-top-width"
				],
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": [
					"border-top-width",
					"border-right-width",
					"border-bottom-width",
					"border-left-width"
				],
				"appliesto": "allElements",
				"computed": [
					"border-bottom-width",
					"border-left-width",
					"border-right-width",
					"border-top-width"
				],
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"bottom": {
				"syntax": "<length> | <percentage> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToContainingBlockHeight",
				"groups": [
					"CSS Positioning"
				],
				"initial": "auto",
				"appliesto": "positionedElements",
				"computed": "lengthAbsolutePercentageAsSpecifiedOtherwiseAuto",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"box-align": {
				"syntax": "start | center | end | baseline | stretch",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions",
					"WebKit Extensions"
				],
				"initial": "stretch",
				"appliesto": "elementsWithDisplayBoxOrInlineBox",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"box-decoration-break": {
				"syntax": "slice | clone",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Box Model"
				],
				"initial": "slice",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"box-direction": {
				"syntax": "normal | reverse | inherit",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions",
					"WebKit Extensions"
				],
				"initial": "normal",
				"appliesto": "elementsWithDisplayBoxOrInlineBox",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"box-flex": {
				"syntax": "<number>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions",
					"WebKit Extensions"
				],
				"initial": "0",
				"appliesto": "directChildrenOfElementsWithDisplayMozBoxMozInlineBox",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"box-flex-group": {
				"syntax": "<integer>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions",
					"WebKit Extensions"
				],
				"initial": "1",
				"appliesto": "inFlowChildrenOfBoxElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"box-lines": {
				"syntax": "single | multiple",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions",
					"WebKit Extensions"
				],
				"initial": "single",
				"appliesto": "boxElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"box-ordinal-group": {
				"syntax": "<integer>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions",
					"WebKit Extensions"
				],
				"initial": "1",
				"appliesto": "childrenOfBoxElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"box-orient": {
				"syntax": "horizontal | vertical | inline-axis | block-axis | inherit",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions",
					"WebKit Extensions"
				],
				"initial": "inlineAxisHorizontalInXUL",
				"appliesto": "elementsWithDisplayBoxOrInlineBox",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"box-pack": {
				"syntax": "start | center | end | justify",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions",
					"WebKit Extensions"
				],
				"initial": "start",
				"appliesto": "elementsWithDisplayMozBoxMozInlineBox",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"box-shadow": {
				"syntax": "none | <shadow>#",
				"media": "visual",
				"inherited": false,
				"animationType": "shadowList",
				"percentages": "no",
				"groups": [
					"CSS Background and Borders"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "absoluteLengthsSpecifiedColorAsSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"box-sizing": {
				"syntax": "content-box | border-box",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Box Model"
				],
				"initial": "content-box",
				"appliesto": "allElementsAcceptingWidthOrHeight",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"break-after": {
				"syntax": "auto | avoid | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region",
				"media": "paged",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "auto",
				"appliesto": "blockLevelElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"break-before": {
				"syntax": "auto | avoid | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region",
				"media": "paged",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "auto",
				"appliesto": "blockLevelElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"break-inside": {
				"syntax": "auto | avoid | avoid-page | avoid-column | avoid-region",
				"media": "paged",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "auto",
				"appliesto": "blockLevelElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"caption-side": {
				"syntax": "top | bottom | block-start | block-end | inline-start | inline-end",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Table"
				],
				"initial": "top",
				"appliesto": "tableCaptionElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"caret-color": {
				"syntax": "auto | <color>",
				"media": "interactive",
				"inherited": true,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asAutoOrColor",
				"order": "perGrammar",
				"status": "standard"
			},
			"clear": {
				"syntax": "none | left | right | both | inline-start | inline-end",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Positioning"
				],
				"initial": "none",
				"appliesto": "blockLevelElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"clip": {
				"syntax": "<shape> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "rectangle",
				"percentages": "no",
				"groups": [
					"CSS Miscellaneous"
				],
				"initial": "auto",
				"appliesto": "absolutelyPositionedElements",
				"computed": "autoOrRectangle",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"clip-path": {
				"syntax": "<clip-source> | [ <basic-shape> || <geometry-box> ] | none",
				"media": "visual",
				"inherited": false,
				"animationType": "basicShapeOtherwiseNo",
				"percentages": "referToReferenceBoxWhenSpecifiedOtherwiseBorderBox",
				"groups": [
					"CSS Miscellaneous"
				],
				"initial": "none",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "asSpecifiedURLsAbsolute",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": true,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS Colors"
				],
				"initial": "variesFromBrowserToBrowser",
				"appliesto": "allElements",
				"computed": "translucentValuesRGBAOtherwiseRGB",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"column-count": {
				"syntax": "<number> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "integer",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "auto",
				"appliesto": "nonReplacedBlockElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"column-fill": {
				"syntax": "auto | balance",
				"media": "visualInContinuousMediaNoEffectInOverflowColumns",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "balance",
				"appliesto": "multicolElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"column-gap": {
				"syntax": "<length> | normal",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "normal",
				"appliesto": "multicolElements",
				"computed": "absoluteLengthOrNormal",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"column-rule": {
				"syntax": "<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"column-rule-color",
					"column-rule-style",
					"column-rule-width"
				],
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": [
					"column-rule-width",
					"column-rule-style",
					"column-rule-color"
				],
				"appliesto": "multicolElements",
				"computed": [
					"column-rule-color",
					"column-rule-style",
					"column-rule-width"
				],
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"column-rule-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": false,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "currentcolor",
				"appliesto": "multicolElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"column-rule-style": {
				"syntax": "<br-style>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "none",
				"appliesto": "multicolElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"column-rule-width": {
				"syntax": "<br-width>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "medium",
				"appliesto": "multicolElements",
				"computed": "absoluteLength0IfColumnRuleStyleNoneOrHidden",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"column-span": {
				"syntax": "none | all",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "none",
				"appliesto": "inFlowBlockLevelElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"column-width": {
				"syntax": "<length> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": "auto",
				"appliesto": "nonReplacedBlockElements",
				"computed": "absoluteLengthZeroOrLarger",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"columns": {
				"syntax": "<'column-width'> || <'column-count'>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"column-width",
					"column-count"
				],
				"percentages": "no",
				"groups": [
					"CSS Columns"
				],
				"initial": [
					"column-width",
					"column-count"
				],
				"appliesto": "nonReplacedBlockElements",
				"computed": [
					"column-width",
					"column-count"
				],
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"contain": {
				"syntax": "none | strict | content | [ size || layout || style || paint ]",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Containment"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "perGrammar",
				"status": "experimental"
			},
			"content": {
				"syntax": "normal | none | [ <content-replacement> | <content-list> ] [/ <string> ]?",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Generated Content"
				],
				"initial": "normal",
				"appliesto": "beforeAndAfterPseudos",
				"computed": "normalOnElementsForPseudosNoneAbsoluteURIStringOrAsSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"counter-increment": {
				"syntax": "[ <custom-ident> <integer>? ]+ | none",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Lists and Counters"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"counter-reset": {
				"syntax": "[ <custom-ident> <integer>? ]+ | none",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Lists and Counters"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"cursor": {
				"syntax": "[ [ <url> [ <x> <y> ]? , ]* [ auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out | grab | grabbing ] ]",
				"media": "visual, interactive",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecifiedURLsAbsolute",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"direction": {
				"syntax": "ltr | rtl",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Writing Modes"
				],
				"initial": "ltr",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"display": {
				"syntax": "[ <display-outside> || <display-inside> ] | <display-listitem> | <display-internal> | <display-box> | <display-legacy>",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Miscellaneous"
				],
				"initial": "inline",
				"appliesto": "allElements",
				"computed": "asSpecifiedExceptPositionedFloatingAndRootElementsKeywordMaybeDifferent",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"display-inside": {
				"syntax": "auto | block | table | flex | grid | ruby",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Display"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"display-list": {
				"syntax": "none | list-item",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Display"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"display-outside": {
				"syntax": "block-level | inline-level | run-in | contents | none | table-row-group | table-header-group | table-footer-group | table-row | table-cell | table-column-group | table-column | table-caption | ruby-base | ruby-text | ruby-base-container | ruby-text-container",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Display"
				],
				"initial": "inline-level",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"empty-cells": {
				"syntax": "show | hide",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Table"
				],
				"initial": "show",
				"appliesto": "tableCellElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"filter": {
				"syntax": "none | <filter-function-list>",
				"media": "visual",
				"inherited": false,
				"animationType": "filterList",
				"percentages": "no",
				"groups": [
					"Filter Effects"
				],
				"initial": "none",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"flex": {
				"syntax": "none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"flex-grow",
					"flex-shrink",
					"flex-basis"
				],
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": [
					"flex-grow",
					"flex-shrink",
					"flex-basis"
				],
				"appliesto": "flexItemsAndInFlowPseudos",
				"computed": [
					"flex-grow",
					"flex-shrink",
					"flex-basis"
				],
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"flex-basis": {
				"syntax": "content | <'width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToFlexContainersInnerMainSize",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "auto",
				"appliesto": "flexItemsAndInFlowPseudos",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "lengthOrPercentageBeforeKeywordIfBothPresent",
				"status": "standard"
			},
			"flex-direction": {
				"syntax": "row | row-reverse | column | column-reverse",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "row",
				"appliesto": "flexContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"flex-flow": {
				"syntax": "<'flex-direction'> || <'flex-wrap'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": [
					"flex-direction",
					"flex-wrap"
				],
				"appliesto": "flexContainers",
				"computed": [
					"flex-direction",
					"flex-wrap"
				],
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"flex-grow": {
				"syntax": "<number>",
				"media": "visual",
				"inherited": false,
				"animationType": "number",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "0",
				"appliesto": "flexItemsAndInFlowPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"flex-shrink": {
				"syntax": "<number>",
				"media": "visual",
				"inherited": false,
				"animationType": "number",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "1",
				"appliesto": "flexItemsAndInFlowPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"flex-wrap": {
				"syntax": "nowrap | wrap | wrap-reverse",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "nowrap",
				"appliesto": "flexContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"float": {
				"syntax": "left | right | none | inline-start | inline-end",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Positioning"
				],
				"initial": "none",
				"appliesto": "allElementsNoEffectIfDisplayNone",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"font": {
				"syntax": "[ [ <'font-style'> || <font-variant-css21> || <'font-weight'> || <'font-stretch'> ]? <'font-size'> [ / <'line-height'> ]? <'font-family'> ] | caption | icon | menu | message-box | small-caption | status-bar",
				"media": "visual",
				"inherited": true,
				"animationType": [
					"font-style",
					"font-variant",
					"font-weight",
					"font-stretch",
					"font-size",
					"line-height",
					"font-family"
				],
				"percentages": [
					"font-size",
					"line-height"
				],
				"groups": [
					"CSS Fonts"
				],
				"initial": [
					"font-style",
					"font-variant",
					"font-weight",
					"font-stretch",
					"font-size",
					"line-height",
					"font-family"
				],
				"appliesto": "allElements",
				"computed": [
					"font-style",
					"font-variant",
					"font-weight",
					"font-stretch",
					"font-size",
					"line-height",
					"font-family"
				],
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-family": {
				"syntax": "[ <family-name> | <generic-family> ]#",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "dependsOnUserAgent",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-feature-settings": {
				"syntax": "normal | <feature-tag-value>#",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-kerning": {
				"syntax": "auto | normal | none",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-language-override": {
				"syntax": "normal | <string>",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-variation-settings": {
				"syntax": "normal | [ <string> <number> ]#",
				"media": "visual",
				"inherited": true,
				"animationType": "transform",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "perGrammar",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "experimental"
			},
			"font-size": {
				"syntax": "<absolute-size> | <relative-size> | <length-percentage>",
				"media": "visual",
				"inherited": true,
				"animationType": "length",
				"percentages": "referToParentElementsFontSize",
				"groups": [
					"CSS Fonts"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-size-adjust": {
				"syntax": "none | <number>",
				"media": "visual",
				"inherited": true,
				"animationType": "number",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-stretch": {
				"syntax": "normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded",
				"media": "visual",
				"inherited": true,
				"animationType": "fontStretch",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-style": {
				"syntax": "normal | italic | oblique",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-synthesis": {
				"syntax": "none | [ weight || style ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "weight style",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-variant": {
				"syntax": "normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> || stylistic( <feature-value-name> ) || historical-forms || styleset( <feature-value-name># ) || character-variant( <feature-value-name># ) || swash( <feature-value-name> ) || ornaments( <feature-value-name> ) || annotation( <feature-value-name> ) || [ small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps ] || <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero || <east-asian-variant-values> || <east-asian-width-values> || ruby ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-variant-alternates": {
				"syntax": "normal | [ stylistic( <feature-value-name> ) || historical-forms || styleset( <feature-value-name># ) || character-variant( <feature-value-name># ) || swash( <feature-value-name> ) || ornaments( <feature-value-name> ) || annotation( <feature-value-name> ) ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-variant-caps": {
				"syntax": "normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-variant-east-asian": {
				"syntax": "normal | [ <east-asian-variant-values> || <east-asian-width-values> || ruby ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-variant-ligatures": {
				"syntax": "normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-variant-numeric": {
				"syntax": "normal | [ <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-variant-position": {
				"syntax": "normal | sub | super",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"font-weight": {
				"syntax": "normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900",
				"media": "visual",
				"inherited": true,
				"animationType": "fontWeight",
				"percentages": "no",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "keywordOrNumericalValueBolderLighterTransformedToRealValue",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"grid": {
				"syntax": "<'grid-template'> | <'grid-template-rows'> / [ auto-flow && dense? ] <'grid-auto-columns'>? | [ auto-flow && dense? ] <'grid-auto-rows'>? / <'grid-template-columns'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": [
					"grid-template-rows",
					"grid-template-columns",
					"grid-auto-rows",
					"grid-auto-columns"
				],
				"groups": [
					"CSS Grid Layout"
				],
				"initial": [
					"grid-template-rows",
					"grid-template-columns",
					"grid-template-areas",
					"grid-auto-rows",
					"grid-auto-columns",
					"grid-auto-flow",
					"grid-column-gap",
					"grid-row-gap"
				],
				"appliesto": "gridContainers",
				"computed": [
					"grid-template-rows",
					"grid-template-columns",
					"grid-template-areas",
					"grid-auto-rows",
					"grid-auto-columns",
					"grid-auto-flow",
					"grid-column-gap",
					"grid-row-gap"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-area": {
				"syntax": "<grid-line> [ / <grid-line> ]{0,3}",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": [
					"grid-row-start",
					"grid-column-start",
					"grid-row-end",
					"grid-column-end"
				],
				"appliesto": "gridItemsAndBoxesWithinGridContainer",
				"computed": [
					"grid-row-start",
					"grid-column-start",
					"grid-row-end",
					"grid-column-end"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-auto-columns": {
				"syntax": "<track-size>+",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToDimensionOfContentArea",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "auto",
				"appliesto": "gridContainers",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-auto-flow": {
				"syntax": "[ row | column ] || dense",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "row",
				"appliesto": "gridContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-auto-rows": {
				"syntax": "<track-size>+",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToDimensionOfContentArea",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "auto",
				"appliesto": "gridContainers",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-column": {
				"syntax": "<grid-line> [ / <grid-line> ]?",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": [
					"grid-column-start",
					"grid-column-end"
				],
				"appliesto": "gridItemsAndBoxesWithinGridContainer",
				"computed": [
					"grid-column-start",
					"grid-column-end"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-column-end": {
				"syntax": "<grid-line>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "auto",
				"appliesto": "gridItemsAndBoxesWithinGridContainer",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-column-gap": {
				"syntax": "<length-percentage>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToDimensionOfContentArea",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "0",
				"appliesto": "gridContainers",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-column-start": {
				"syntax": "<grid-line>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "auto",
				"appliesto": "gridItemsAndBoxesWithinGridContainer",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-gap": {
				"syntax": "<'grid-row-gap'> <'grid-column-gap'>?",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"grid-row-gap",
					"grid-column-gap"
				],
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": [
					"grid-row-gap",
					"grid-column-gap"
				],
				"appliesto": "gridContainers",
				"computed": [
					"grid-row-gap",
					"grid-column-gap"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-row": {
				"syntax": "<grid-line> [ / <grid-line> ]?",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": [
					"grid-row-start",
					"grid-row-end"
				],
				"appliesto": "gridItemsAndBoxesWithinGridContainer",
				"computed": [
					"grid-row-start",
					"grid-row-end"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-row-end": {
				"syntax": "<grid-line>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "auto",
				"appliesto": "gridItemsAndBoxesWithinGridContainer",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-row-gap": {
				"syntax": "<length-percentage>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToDimensionOfContentArea",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "0",
				"appliesto": "gridContainers",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-row-start": {
				"syntax": "<grid-line>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "auto",
				"appliesto": "gridItemsAndBoxesWithinGridContainer",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-template": {
				"syntax": "none | [ <'grid-template-rows'> / <'grid-template-columns'> ] | [ <line-names>? <string> <track-size>? <line-names>? ]+ [ / <explicit-track-list> ]?",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": [
					"grid-template-columns",
					"grid-template-rows"
				],
				"groups": [
					"CSS Grid Layout"
				],
				"initial": [
					"grid-template-columns",
					"grid-template-rows",
					"grid-template-areas"
				],
				"appliesto": "gridContainers",
				"computed": [
					"grid-template-columns",
					"grid-template-rows",
					"grid-template-areas"
				],
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-template-areas": {
				"syntax": "none | <string>+",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "none",
				"appliesto": "gridContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-template-columns": {
				"syntax": "none | <track-list> | <auto-track-list>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToDimensionOfContentArea",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "none",
				"appliesto": "gridContainers",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"grid-template-rows": {
				"syntax": "none | <track-list> | <auto-track-list>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "referToDimensionOfContentArea",
				"groups": [
					"CSS Grid Layout"
				],
				"initial": "none",
				"appliesto": "gridContainers",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"height": {
				"syntax": "[ <length> | <percentage> ] && [ border-box | content-box ]? | available | min-content | max-content | fit-content | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "regardingHeightOfGeneratedBoxContainingBlockPercentagesRelativeToContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "auto",
				"appliesto": "allElementsButNonReplacedAndTableColumns",
				"computed": "percentageAutoOrAbsoluteLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"hyphens": {
				"syntax": "none | manual | auto",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "manual",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"image-orientation": {
				"syntax": "from-image | <angle> | [ <angle>? flip ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Images"
				],
				"initial": "0deg",
				"appliesto": "allElements",
				"computed": "angleRoundedToNextQuarter",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"image-rendering": {
				"syntax": "auto | crisp-edges | pixelated",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Images"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"image-resolution": {
				"syntax": "[ from-image || <resolution> ] && snap?",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Images"
				],
				"initial": "1dppx",
				"appliesto": "allElements",
				"computed": "asSpecifiedWithExceptionOfResolution",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"ime-mode": {
				"syntax": "auto | normal | active | inactive | disabled",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Miscellaneous"
				],
				"initial": "auto",
				"appliesto": "textFields",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"initial-letter": {
				"syntax": "normal | [ <number> <integer>? ]",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Inline"
				],
				"initial": "normal",
				"appliesto": "firstLetterPseudoElementsAndInlineLevelFirstChildren",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"initial-letter-align": {
				"syntax": "[ auto | alphabetic | hanging | ideographic ]",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Inline"
				],
				"initial": "auto",
				"appliesto": "firstLetterPseudoElementsAndInlineLevelFirstChildren",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"inline-size": {
				"syntax": "<'width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "inlineSizeOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "auto",
				"appliesto": "sameAsWidthAndHeight",
				"computed": "sameAsWidthAndHeight",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"isolation": {
				"syntax": "auto | isolate",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Compositing and Blending"
				],
				"initial": "auto",
				"appliesto": "allElementsSVGContainerGraphicsAndGraphicsReferencingElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"justify-content": {
				"syntax": "flex-start | flex-end | center | space-between | space-around | space-evenly",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "flex-start",
				"appliesto": "flexContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"left": {
				"syntax": "<length> | <percentage> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Positioning"
				],
				"initial": "auto",
				"appliesto": "positionedElements",
				"computed": "lengthAbsolutePercentageAsSpecifiedOtherwiseAuto",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"letter-spacing": {
				"syntax": "normal | <length>",
				"media": "visual",
				"inherited": true,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "optimumValueOfAbsoluteLengthOrNormal",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line"
				],
				"status": "standard"
			},
			"line-break": {
				"syntax": "auto | loose | normal | strict",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"line-height": {
				"syntax": "normal | <number> | <length> | <percentage>",
				"media": "visual",
				"inherited": true,
				"animationType": "numberOrLength",
				"percentages": "referToElementFontSize",
				"groups": [
					"CSS Fonts"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "absoluteLengthOrAsSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"list-style": {
				"syntax": "<'list-style-type'> || <'list-style-position'> || <'list-style-image'>",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Lists and Counters"
				],
				"initial": [
					"list-style-type",
					"list-style-position",
					"list-style-image"
				],
				"appliesto": "listItems",
				"computed": [
					"list-style-image",
					"list-style-position",
					"list-style-type"
				],
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"list-style-image": {
				"syntax": "<url> | none",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Lists and Counters"
				],
				"initial": "none",
				"appliesto": "listItems",
				"computed": "noneOrImageWithAbsoluteURI",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"list-style-position": {
				"syntax": "inside | outside",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Lists and Counters"
				],
				"initial": "outside",
				"appliesto": "listItems",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"list-style-type": {
				"syntax": "<counter-style> | <string> | none",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Lists and Counters"
				],
				"initial": "disc",
				"appliesto": "listItems",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"margin": {
				"syntax": "[ <length> | <percentage> | auto ]{1,4}",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": [
					"margin-bottom",
					"margin-left",
					"margin-right",
					"margin-top"
				],
				"appliesto": "allElementsExceptTableDisplayTypes",
				"computed": [
					"margin-bottom",
					"margin-left",
					"margin-right",
					"margin-top"
				],
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"margin-block-end": {
				"syntax": "<'margin-left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "dependsOnLayoutModel",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "sameAsMargin",
				"computed": "lengthAbsolutePercentageAsSpecifiedOtherwiseAuto",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"margin-block-start": {
				"syntax": "<'margin-left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "dependsOnLayoutModel",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "sameAsMargin",
				"computed": "lengthAbsolutePercentageAsSpecifiedOtherwiseAuto",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"margin-bottom": {
				"syntax": "<length> | <percentage> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsExceptTableDisplayTypes",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"margin-inline-end": {
				"syntax": "<'margin-left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "dependsOnLayoutModel",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "sameAsMargin",
				"computed": "lengthAbsolutePercentageAsSpecifiedOtherwiseAuto",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"margin-inline-start": {
				"syntax": "<'margin-left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "dependsOnLayoutModel",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "sameAsMargin",
				"computed": "lengthAbsolutePercentageAsSpecifiedOtherwiseAuto",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"margin-left": {
				"syntax": "<length> | <percentage> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsExceptTableDisplayTypes",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"margin-right": {
				"syntax": "<length> | <percentage> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsExceptTableDisplayTypes",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"margin-top": {
				"syntax": "<length> | <percentage> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsExceptTableDisplayTypes",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"marker-offset": {
				"syntax": "<length> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Generated Content"
				],
				"initial": "auto",
				"appliesto": "elementsWithDisplayMarker",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"mask": {
				"syntax": "<mask-layer>#",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"mask-position",
					"mask-size"
				],
				"percentages": [
					"mask-position"
				],
				"groups": [
					"CSS Masks"
				],
				"initial": [
					"mask-origin",
					"mask-clip"
				],
				"appliesto": "allElementsSVGContainerElements",
				"computed": [
					"mask-origin",
					"mask-clip"
				],
				"order": "uniqueOrder",
				"stacking": true,
				"status": "standard"
			},
			"mask-clip": {
				"syntax": "[ <geometry-box> | no-clip ]#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Masks"
				],
				"initial": "border-box",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"mask-composite": {
				"syntax": "<compositing-operator>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Masks"
				],
				"initial": "add",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"mask-image": {
				"syntax": "<mask-reference>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Masks"
				],
				"initial": "none",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "asSpecifiedURLsAbsolute",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"mask-mode": {
				"syntax": "<masking-mode>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Masks"
				],
				"initial": "match-source",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"mask-origin": {
				"syntax": "<geometry-box>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Masks"
				],
				"initial": "border-box",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"mask-position": {
				"syntax": "<position>#",
				"media": "visual",
				"inherited": false,
				"animationType": "repeatableListOfSimpleListOfLpc",
				"percentages": "referToSizeOfMaskPaintingArea",
				"groups": [
					"CSS Masks"
				],
				"initial": "0% 0%",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "consistsOfTwoKeywordsForOriginAndOffsets",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"mask-repeat": {
				"syntax": "<repeat-style>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Masks"
				],
				"initial": "repeat",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "consistsOfTwoDimensionKeywords",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"mask-size": {
				"syntax": "<bg-size>#",
				"media": "visual",
				"inherited": false,
				"animationType": "repeatableListOfSimpleListOfLpc",
				"percentages": "no",
				"groups": [
					"CSS Masks"
				],
				"initial": "auto",
				"appliesto": "allElementsSVGContainerElements",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"mask-type": {
				"syntax": "luminance | alpha",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Masks"
				],
				"initial": "luminance",
				"appliesto": "maskElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"max-block-size": {
				"syntax": "<'max-width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "blockSizeOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "sameAsWidthAndHeight",
				"computed": "sameAsMaxWidthAndMaxHeight",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"max-height": {
				"syntax": "<length> | <percentage> | none | max-content | min-content | fit-content | fill-available",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "regardingHeightOfGeneratedBoxContainingBlockPercentagesNone",
				"groups": [
					"CSS Box Model"
				],
				"initial": "none",
				"appliesto": "allElementsButNonReplacedAndTableColumns",
				"computed": "percentageAsSpecifiedAbsoluteLengthOrNone",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"max-inline-size": {
				"syntax": "<'max-width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "inlineSizeOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "sameAsWidthAndHeight",
				"computed": "sameAsMaxWidthAndMaxHeight",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"max-width": {
				"syntax": "<length> | <percentage> | none | max-content | min-content | fit-content | fill-available",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "none",
				"appliesto": "allElementsButNonReplacedAndTableRows",
				"computed": "percentageAsSpecifiedAbsoluteLengthOrNone",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"min-block-size": {
				"syntax": "<'min-width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "blockSizeOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "sameAsWidthAndHeight",
				"computed": "sameAsMinWidthAndMinHeight",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"min-height": {
				"syntax": "<length> | <percentage> | auto | max-content | min-content | fit-content | fill-available",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "regardingHeightOfGeneratedBoxContainingBlockPercentages0",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsButNonReplacedAndTableColumns",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"min-inline-size": {
				"syntax": "<'min-width'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "inlineSizeOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "sameAsWidthAndHeight",
				"computed": "sameAsMinWidthAndMinHeight",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"min-width": {
				"syntax": "<length> | <percentage> | auto | max-content | min-content | fit-content | fill-available",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsButNonReplacedAndTableRows",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"mix-blend-mode": {
				"syntax": "<blend-mode>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Compositing and Blending"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"stacking": true,
				"status": "standard"
			},
			"object-fit": {
				"syntax": "fill | contain | cover | none | scale-down",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Images"
				],
				"initial": "fill",
				"appliesto": "replacedElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"object-position": {
				"syntax": "<position>",
				"media": "visual",
				"inherited": true,
				"animationType": "repeatableListOfSimpleListOfLpc",
				"percentages": "referToWidthAndHeightOfElement",
				"groups": [
					"CSS Images"
				],
				"initial": "50% 50%",
				"appliesto": "replacedElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"offset": {
				"syntax": "[ <'offset-position'>? [ <'offset-path'> [ <'offset-distance'> || <'offset-rotate'> ]? ]? ]! [ / <'offset-anchor'> ]?",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"offset-position",
					"offset-path",
					"offset-distance",
					"offset-anchor",
					"offset-rotate"
				],
				"percentages": [
					"offset-position",
					"offset-distance",
					"offset-anchor"
				],
				"groups": [
					"CSS Motion"
				],
				"initial": [
					"offset-position",
					"offset-path",
					"offset-distance",
					"offset-anchor",
					"offset-rotate"
				],
				"appliesto": "transformableElements",
				"computed": [
					"offset-position",
					"offset-path",
					"offset-distance",
					"offset-anchor",
					"offset-rotate"
				],
				"order": "perGrammar",
				"stacking": true,
				"status": "experimental"
			},
			"offset-anchor": {
				"syntax": "auto | <position>",
				"media": "visual",
				"inherited": false,
				"animationType": "position",
				"percentages": "relativeToWidthAndHeight",
				"groups": [
					"CSS Motion"
				],
				"initial": "auto",
				"appliesto": "transformableElements",
				"computed": "forLengthAbsoluteValueOtherwisePercentage",
				"order": "perGrammar",
				"status": "experimental"
			},
			"offset-block-end": {
				"syntax": "<'left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalHeightOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "auto",
				"appliesto": "positionedElements",
				"computed": "sameAsBoxOffsets",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"offset-block-start": {
				"syntax": "<'left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalHeightOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "auto",
				"appliesto": "positionedElements",
				"computed": "sameAsBoxOffsets",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"offset-inline-end": {
				"syntax": "<'left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "auto",
				"appliesto": "positionedElements",
				"computed": "sameAsBoxOffsets",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"offset-inline-start": {
				"syntax": "<'left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "auto",
				"appliesto": "positionedElements",
				"computed": "sameAsBoxOffsets",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"offset-distance": {
				"syntax": "<length-percentage>",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToTotalPathLength",
				"groups": [
					"CSS Motion"
				],
				"initial": "0",
				"appliesto": "transformableElements",
				"computed": "forLengthAbsoluteValueOtherwisePercentage",
				"order": "perGrammar",
				"status": "experimental"
			},
			"offset-path": {
				"syntax": "none | ray( [ <angle> && <size>? && contain? ] ) | <path()> | <url> | [ <basic-shape> || <geometry-box> ]",
				"media": "visual",
				"inherited": false,
				"animationType": "angleOrBasicShapeOrPath",
				"percentages": "no",
				"groups": [
					"CSS Motion"
				],
				"initial": "none",
				"appliesto": "transformableElements",
				"computed": "asSpecified",
				"order": "perGrammar",
				"stacking": true,
				"status": "experimental"
			},
			"offset-position": {
				"syntax": "auto | <position>",
				"media": "visual",
				"inherited": false,
				"animationType": "position",
				"percentages": "referToSizeOfContainingBlock",
				"groups": [
					"CSS Motion"
				],
				"initial": "auto",
				"appliesto": "transformableElements",
				"computed": "forLengthAbsoluteValueOtherwisePercentage",
				"order": "perGrammar",
				"status": "experimental"
			},
			"offset-rotate": {
				"syntax": "[ auto | reverse ] || <angle>",
				"media": "visual",
				"inherited": false,
				"animationType": "angle",
				"percentages": "no",
				"groups": [
					"CSS Motion"
				],
				"initial": "auto",
				"appliesto": "transformableElements",
				"computed": "asSpecified",
				"order": "perGrammar",
				"status": "experimental"
			},
			"opacity": {
				"syntax": "<number>",
				"media": "visual",
				"inherited": false,
				"animationType": "number",
				"percentages": "no",
				"groups": [
					"CSS Colors"
				],
				"initial": "1.0",
				"appliesto": "allElements",
				"computed": "specifiedValueClipped0To1",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::placeholder"
				],
				"status": "standard"
			},
			"order": {
				"syntax": "<integer>",
				"media": "visual",
				"inherited": false,
				"animationType": "integer",
				"percentages": "no",
				"groups": [
					"CSS Flexible Box Layout"
				],
				"initial": "0",
				"appliesto": "flexItemsAndAbsolutelyPositionedFlexContainerChildren",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"orphans": {
				"syntax": "<integer>",
				"media": "visual, paged",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Pages"
				],
				"initial": "2",
				"appliesto": "blockContainerElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"outline": {
				"syntax": "[ <'outline-color'> || <'outline-style'> || <'outline-width'> ]",
				"media": "visual, interactive",
				"inherited": false,
				"animationType": [
					"outline-color",
					"outline-width",
					"outline-style"
				],
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": [
					"outline-color",
					"outline-style",
					"outline-width"
				],
				"appliesto": "allElements",
				"computed": [
					"outline-color",
					"outline-width",
					"outline-style"
				],
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"outline-color": {
				"syntax": "<color> | invert",
				"media": "visual, interactive",
				"inherited": false,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": "invertOrCurrentColor",
				"appliesto": "allElements",
				"computed": "invertForTranslucentColorRGBAOtherwiseRGB",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"outline-offset": {
				"syntax": "<length>",
				"media": "visual, interactive",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"outline-style": {
				"syntax": "auto | <br-style>",
				"media": "visual, interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"outline-width": {
				"syntax": "<br-width>",
				"media": "visual, interactive",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": "medium",
				"appliesto": "allElements",
				"computed": "absoluteLength0ForNone",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"overflow": {
				"syntax": "visible | hidden | scroll | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Box Model"
				],
				"initial": "visible",
				"appliesto": "nonReplacedBlockAndInlineBlockElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"overflow-clip-box": {
				"syntax": "padding-box | content-box",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "padding-box",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"overflow-wrap": {
				"syntax": "normal | break-word",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"overflow-x": {
				"syntax": "visible | hidden | scroll | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Box Model"
				],
				"initial": "visible",
				"appliesto": "nonReplacedBlockAndInlineBlockElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"overflow-y": {
				"syntax": "visible | hidden | scroll | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Box Model"
				],
				"initial": "visible",
				"appliesto": "nonReplacedBlockAndInlineBlockElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"padding": {
				"syntax": "[ <length> | <percentage> ]{1,4}",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": [
					"padding-bottom",
					"padding-left",
					"padding-right",
					"padding-top"
				],
				"appliesto": "allElementsExceptInternalTableDisplayTypes",
				"computed": [
					"padding-bottom",
					"padding-left",
					"padding-right",
					"padding-top"
				],
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"padding-block-end": {
				"syntax": "<'padding-left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "asLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"padding-block-start": {
				"syntax": "<'padding-left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "asLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"padding-bottom": {
				"syntax": "<length> | <percentage>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsExceptInternalTableDisplayTypes",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"padding-inline-end": {
				"syntax": "<'padding-left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "asLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"padding-inline-start": {
				"syntax": "<'padding-left'>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "logicalWidthOfContainingBlock",
				"groups": [
					"CSS Logical Properties"
				],
				"initial": "0",
				"appliesto": "allElements",
				"computed": "asLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"padding-left": {
				"syntax": "<length> | <percentage>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsExceptInternalTableDisplayTypes",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"padding-right": {
				"syntax": "<length> | <percentage>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsExceptInternalTableDisplayTypes",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"padding-top": {
				"syntax": "<length> | <percentage>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "0",
				"appliesto": "allElementsExceptInternalTableDisplayTypes",
				"computed": "percentageAsSpecifiedOrAbsoluteLength",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter"
				],
				"status": "standard"
			},
			"page-break-after": {
				"syntax": "auto | always | avoid | left | right",
				"media": "visual, paged",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Pages"
				],
				"initial": "auto",
				"appliesto": "blockElementsInNormalFlow",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"page-break-before": {
				"syntax": "auto | always | avoid | left | right",
				"media": "visual, paged",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Pages"
				],
				"initial": "auto",
				"appliesto": "blockElementsInNormalFlow",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"page-break-inside": {
				"syntax": "auto | avoid",
				"media": "visual, paged",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Pages"
				],
				"initial": "auto",
				"appliesto": "blockElementsInNormalFlow",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"perspective": {
				"syntax": "none | <length>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Transforms"
				],
				"initial": "none",
				"appliesto": "transformableElements",
				"computed": "absoluteLengthOrNone",
				"order": "uniqueOrder",
				"stacking": true,
				"status": "standard"
			},
			"perspective-origin": {
				"syntax": "<position>",
				"media": "visual",
				"inherited": false,
				"animationType": "simpleListOfLpc",
				"percentages": "referToSizeOfBoundingBox",
				"groups": [
					"CSS Transforms"
				],
				"initial": "50% 50%",
				"appliesto": "transformableElements",
				"computed": "forLengthAbsoluteValueOtherwisePercentage",
				"order": "oneOrTwoValuesLengthAbsoluteKeywordsPercentages",
				"status": "standard"
			},
			"pointer-events": {
				"syntax": "auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Pointer Events"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"position": {
				"syntax": "static | relative | absolute | sticky | fixed",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Positioning"
				],
				"initial": "static",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"stacking": true,
				"status": "standard"
			},
			"quotes": {
				"syntax": "none | [ <string> <string> ]+",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Generated Content"
				],
				"initial": "dependsOnUserAgent",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"resize": {
				"syntax": "none | both | horizontal | vertical",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": "none",
				"appliesto": "elementsWithOverflowNotVisibleAndReplacedElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"right": {
				"syntax": "<length> | <percentage> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Positioning"
				],
				"initial": "auto",
				"appliesto": "positionedElements",
				"computed": "lengthAbsolutePercentageAsSpecifiedOtherwiseAuto",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"ruby-align": {
				"syntax": "start | center | space-between | space-around",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Ruby"
				],
				"initial": "space-around",
				"appliesto": "rubyBasesAnnotationsBaseAnnotationContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"ruby-merge": {
				"syntax": "separate | collapse | auto",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Ruby"
				],
				"initial": "separate",
				"appliesto": "rubyAnnotationsContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"ruby-position": {
				"syntax": "over | under | inter-character",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Ruby"
				],
				"initial": "over",
				"appliesto": "rubyAnnotationsContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"scroll-behavior": {
				"syntax": "auto | smooth",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSSOM View"
				],
				"initial": "auto",
				"appliesto": "scrollingBoxes",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"scroll-snap-coordinate": {
				"syntax": "none | <position>#",
				"media": "interactive",
				"inherited": false,
				"animationType": "position",
				"percentages": "referToBorderBox",
				"groups": [
					"CSS Scroll Snap Points"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"scroll-snap-destination": {
				"syntax": "<position>",
				"media": "interactive",
				"inherited": false,
				"animationType": "position",
				"percentages": "relativeToScrollContainerPaddingBoxAxis",
				"groups": [
					"CSS Scroll Snap Points"
				],
				"initial": "0px 0px",
				"appliesto": "scrollContainers",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"scroll-snap-points-x": {
				"syntax": "none | repeat( <length-percentage> )",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "relativeToScrollContainerPaddingBoxAxis",
				"groups": [
					"CSS Scroll Snap Points"
				],
				"initial": "none",
				"appliesto": "scrollContainers",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "obsolete"
			},
			"scroll-snap-points-y": {
				"syntax": "none | repeat( <length-percentage> )",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "relativeToScrollContainerPaddingBoxAxis",
				"groups": [
					"CSS Scroll Snap Points"
				],
				"initial": "none",
				"appliesto": "scrollContainers",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "obsolete"
			},
			"scroll-snap-type": {
				"syntax": "none | mandatory | proximity",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Scroll Snap Points"
				],
				"initial": "none",
				"appliesto": "scrollContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"scroll-snap-type-x": {
				"syntax": "none | mandatory | proximity",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Scroll Snap Points"
				],
				"initial": "none",
				"appliesto": "scrollContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"scroll-snap-type-y": {
				"syntax": "none | mandatory | proximity",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Scroll Snap Points"
				],
				"initial": "none",
				"appliesto": "scrollContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"shape-image-threshold": {
				"syntax": "<number>",
				"media": "visual",
				"inherited": false,
				"animationType": "number",
				"percentages": "no",
				"groups": [
					"CSS Shapes"
				],
				"initial": "0.0",
				"appliesto": "floats",
				"computed": "specifiedValueNumberClipped0To1",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"shape-margin": {
				"syntax": "<length-percentage>",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Shapes"
				],
				"initial": "0",
				"appliesto": "floats",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"shape-outside": {
				"syntax": "none | <shape-box> || <basic-shape> | <image>",
				"media": "visual",
				"inherited": false,
				"animationType": "basicShapeOtherwiseNo",
				"percentages": "no",
				"groups": [
					"CSS Shapes"
				],
				"initial": "none",
				"appliesto": "floats",
				"computed": "asDefinedForBasicShapeWithAbsoluteURIOtherwiseAsSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"tab-size": {
				"syntax": "<integer> | <length>",
				"media": "visual",
				"inherited": true,
				"animationType": "length",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "8",
				"appliesto": "blockContainers",
				"computed": "specifiedIntegerOrAbsoluteLength",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"table-layout": {
				"syntax": "auto | fixed",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Table"
				],
				"initial": "auto",
				"appliesto": "tableElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"text-align": {
				"syntax": "start | end | left | right | center | justify | match-parent",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "startOrNamelessValueIfLTRRightIfRTL",
				"appliesto": "blockContainers",
				"computed": "asSpecifiedExceptMatchParent",
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::placeholder"
				],
				"status": "standard"
			},
			"text-align-last": {
				"syntax": "auto | start | end | left | right | center | justify",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "auto",
				"appliesto": "blockContainers",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"text-combine-upright": {
				"syntax": "none | all | [ digits <integer>? ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Writing Modes"
				],
				"initial": "none",
				"appliesto": "nonReplacedInlineElements",
				"computed": "keywordPlusIntegerIfDigits",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"text-decoration": {
				"syntax": "<'text-decoration-line'> || <'text-decoration-style'> || <'text-decoration-color'>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"text-decoration-color",
					"text-decoration-style",
					"text-decoration-line"
				],
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": [
					"text-decoration-color",
					"text-decoration-style",
					"text-decoration-line"
				],
				"appliesto": "allElements",
				"computed": [
					"text-decoration-line",
					"text-decoration-style",
					"text-decoration-color"
				],
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"text-decoration-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": false,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"text-decoration-line": {
				"syntax": "none | [ underline || overline || line-through || blink ]",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"text-decoration-skip": {
				"syntax": "none | [ objects || spaces || ink || edges || box-decoration ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": "objects",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"status": "experimental"
			},
			"text-decoration-style": {
				"syntax": "solid | double | dotted | dashed | wavy",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": "solid",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"text-emphasis": {
				"syntax": "<'text-emphasis-style'> || <'text-emphasis-color'>",
				"media": "visual",
				"inherited": false,
				"animationType": [
					"text-emphasis-color",
					"text-emphasis-style"
				],
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": [
					"text-emphasis-style",
					"text-emphasis-color"
				],
				"appliesto": "allElements",
				"computed": [
					"text-emphasis-style",
					"text-emphasis-color"
				],
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"text-emphasis-color": {
				"syntax": "<color>",
				"media": "visual",
				"inherited": false,
				"animationType": "color",
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": "currentcolor",
				"appliesto": "allElements",
				"computed": "computedColor",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"text-emphasis-position": {
				"syntax": "[ over | under ] && [ right | left ]",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": "over right",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"text-emphasis-style": {
				"syntax": "none | [ [ filled | open ] || [ dot | circle | double-circle | triangle | sesame ] ] | <string>",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"text-indent": {
				"syntax": "<length-percentage> && hanging? && each-line?",
				"media": "visual",
				"inherited": true,
				"animationType": "lpc",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Text"
				],
				"initial": "0",
				"appliesto": "blockContainers",
				"computed": "percentageOrAbsoluteLengthPlusKeywords",
				"order": "lengthOrPercentageBeforeKeywords",
				"status": "standard"
			},
			"text-justify": {
				"syntax": "auto | inter-character | inter-word | none",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "auto",
				"appliesto": "inlineLevelAndTableCellElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"text-orientation": {
				"syntax": "mixed | upright | sideways",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Writing Modes"
				],
				"initial": "mixed",
				"appliesto": "allElementsExceptTableRowGroupsRowsColumnGroupsAndColumns",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"text-overflow": {
				"syntax": "[ clip | ellipsis | <string> ]{1,2}",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS User Interface"
				],
				"initial": "clip",
				"appliesto": "blockContainerElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::placeholder"
				],
				"status": "standard"
			},
			"text-rendering": {
				"syntax": "auto | optimizeSpeed | optimizeLegibility | geometricPrecision",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Miscellaneous"
				],
				"initial": "auto",
				"appliesto": "textElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"text-shadow": {
				"syntax": "none | <shadow-t>#",
				"media": "visual",
				"inherited": true,
				"animationType": "shadowList",
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "colorPlusThreeAbsoluteLengths",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"text-size-adjust": {
				"syntax": "none | auto | <percentage>",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "referToSizeOfFont",
				"groups": [
					"CSS Text"
				],
				"initial": "autoForSmartphoneBrowsersSupportingInflation",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "experimental"
			},
			"text-transform": {
				"syntax": "none | capitalize | uppercase | lowercase | full-width",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "none",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"text-underline-position": {
				"syntax": "auto | [ under || [ left | right ] ]",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text Decoration"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"top": {
				"syntax": "<length> | <percentage> | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToContainingBlockHeight",
				"groups": [
					"CSS Positioning"
				],
				"initial": "auto",
				"appliesto": "positionedElements",
				"computed": "lengthAbsolutePercentageAsSpecifiedOtherwiseAuto",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"touch-action": {
				"syntax": "auto | none | [ [ pan-x | pan-left | pan-right ] || [ pan-y | pan-up | pan-down ] || pinch-zoom ] | manipulation",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Pointer Events"
				],
				"initial": "auto",
				"appliesto": "allElementsExceptNonReplacedInlineElementsTableRowsColumnsRowColumnGroups",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"transform": {
				"syntax": "none | <transform-list>",
				"media": "visual",
				"inherited": false,
				"animationType": "transform",
				"percentages": "referToSizeOfBoundingBox",
				"groups": [
					"CSS Transforms"
				],
				"initial": "none",
				"appliesto": "transformableElements",
				"computed": "asSpecifiedRelativeToAbsoluteLengths",
				"order": "uniqueOrder",
				"stacking": true,
				"status": "standard"
			},
			"transform-box": {
				"syntax": "border-box | fill-box | view-box",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Transforms"
				],
				"initial": "border-box ",
				"appliesto": "transformableElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"transform-origin": {
				"syntax": "[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?",
				"media": "visual",
				"inherited": false,
				"animationType": "simpleListOfLpc",
				"percentages": "referToSizeOfBoundingBox",
				"groups": [
					"CSS Transforms"
				],
				"initial": "50% 50% 0",
				"appliesto": "transformableElements",
				"computed": "forLengthAbsoluteValueOtherwisePercentage",
				"order": "oneOrTwoValuesLengthAbsoluteKeywordsPercentages",
				"status": "standard"
			},
			"transform-style": {
				"syntax": "flat | preserve-3d",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Transforms"
				],
				"initial": "flat",
				"appliesto": "transformableElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"stacking": true,
				"status": "standard"
			},
			"transition": {
				"syntax": "<single-transition>#",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Transitions"
				],
				"initial": [
					"transition-delay",
					"transition-duration",
					"transition-property",
					"transition-timing-function"
				],
				"appliesto": "allElementsAndPseudos",
				"computed": [
					"transition-delay",
					"transition-duration",
					"transition-property",
					"transition-timing-function"
				],
				"order": "orderOfAppearance",
				"status": "standard"
			},
			"transition-delay": {
				"syntax": "<time>#",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Transitions"
				],
				"initial": "0s",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"transition-duration": {
				"syntax": "<time>#",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Transitions"
				],
				"initial": "0s",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"transition-property": {
				"syntax": "none | <single-transition-property>#",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Transitions"
				],
				"initial": "all",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"transition-timing-function": {
				"syntax": "<single-transition-timing-function>#",
				"media": "interactive",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Transitions"
				],
				"initial": "ease",
				"appliesto": "allElementsAndPseudos",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"unicode-bidi": {
				"syntax": "normal | embed | isolate | bidi-override | isolate-override | plaintext",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Writing Modes"
				],
				"initial": "normal",
				"appliesto": "allElementsSomeValuesNoEffectOnNonInlineElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"user-select": {
				"syntax": "auto | text | none | contain | all",
				"media": "visual",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"Mozilla Extensions"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "nonstandard"
			},
			"vertical-align": {
				"syntax": "baseline | sub | super | text-top | text-bottom | middle | top | bottom | <percentage> | <length>",
				"media": "visual",
				"inherited": false,
				"animationType": "length",
				"percentages": "referToLineHeight",
				"groups": [
					"CSS Table"
				],
				"initial": "baseline",
				"appliesto": "inlineLevelAndTableCellElements",
				"computed": "absoluteLengthOrKeyword",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"visibility": {
				"syntax": "visible | hidden | collapse",
				"media": "visual",
				"inherited": true,
				"animationType": "visibility",
				"percentages": "no",
				"groups": [
					"CSS Box Model"
				],
				"initial": "visible",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"white-space": {
				"syntax": "normal | pre | nowrap | pre-wrap | pre-line",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"widows": {
				"syntax": "<integer>",
				"media": "visual, paged",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Pages"
				],
				"initial": "2",
				"appliesto": "blockContainerElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"width": {
				"syntax": "[ <length> | <percentage> ] && [ border-box | content-box ]? | available | min-content | max-content | fit-content | auto",
				"media": "visual",
				"inherited": false,
				"animationType": "lpc",
				"percentages": "referToWidthOfContainingBlock",
				"groups": [
					"CSS Box Model"
				],
				"initial": "auto",
				"appliesto": "allElementsButNonReplacedAndTableRows",
				"computed": "percentageAutoOrAbsoluteLength",
				"order": "lengthOrPercentageBeforeKeywordIfBothPresent",
				"status": "standard"
			},
			"will-change": {
				"syntax": "auto | <animateable-feature>#",
				"media": "all",
				"inherited": false,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Miscellaneous"
				],
				"initial": "auto",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"word-break": {
				"syntax": "normal | break-all | keep-all",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"word-spacing": {
				"syntax": "normal | <length-percentage>",
				"media": "visual",
				"inherited": true,
				"animationType": "length",
				"percentages": "referToWidthOfAffectedGlyph",
				"groups": [
					"CSS Text"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "optimumMinAndMaxValueOfAbsoluteLengthPercentageOrNormal",
				"order": "uniqueOrder",
				"alsoAppliesTo": [
					"::first-letter",
					"::first-line",
					"::placeholder"
				],
				"status": "standard"
			},
			"word-wrap": {
				"syntax": "normal | break-word",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Text"
				],
				"initial": "normal",
				"appliesto": "allElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"writing-mode": {
				"syntax": "horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr",
				"media": "visual",
				"inherited": true,
				"animationType": "discrete",
				"percentages": "no",
				"groups": [
					"CSS Writing Modes"
				],
				"initial": "horizontal-tb",
				"appliesto": "allElementsExceptTableRowColumnGroupsTableRowsColumns",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"status": "standard"
			},
			"z-index": {
				"syntax": "auto | <integer>",
				"media": "visual",
				"inherited": false,
				"animationType": "integer",
				"percentages": "no",
				"groups": [
					"CSS Positioning"
				],
				"initial": "auto",
				"appliesto": "positionedElements",
				"computed": "asSpecified",
				"order": "uniqueOrder",
				"stacking": true,
				"status": "standard"
			}
		}
		;

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/data/mdn-data/css/syntaxes
	modules['/css-tree/data/mdn-data/css/syntaxes'] = function () {
		var exports = {
			"absolute-size": {
				"syntax": "xx-small | x-small | small | medium | large | x-large | xx-large"
			},
			"alpha-value": {
				"syntax": "<number> | <percentage>"
			},
			"angle-percentage": {
				"syntax": "<angle> | <percentage>"
			},
			"animateable-feature": {
				"syntax": "scroll-position | contents | <custom-ident>"
			},
			"attachment": {
				"syntax": "scroll | fixed | local"
			},
			"attr()": {
				"syntax": "attr( <attr-name> <type-or-unit>? [, <attr-fallback> ]? )"
			},
			"auto-repeat": {
				"syntax": "repeat( [ auto-fill | auto-fit ] , [ <line-names>? <fixed-size> ]+ <line-names>? )"
			},
			"auto-track-list": {
				"syntax": "[ <line-names>? [ <fixed-size> | <fixed-repeat> ] ]* <line-names>? <auto-repeat>\n[ <line-names>? [ <fixed-size> | <fixed-repeat> ] ]* <line-names>?"
			},
			"basic-shape": {
				"syntax": "<inset()> | <circle()> | <ellipse()> | <polygon()>"
			},
			"bg-image": {
				"syntax": "none | <image>"
			},
			"bg-layer": {
				"syntax": "<bg-image> || <position> [ / <bg-size> ]? || <repeat-style> || <attachment> || <box>{1,2}"
			},
			"bg-size": {
				"syntax": "[ <length-percentage> | auto ]{1,2} | cover | contain"
			},
			"blur()": {
				"syntax": "blur( <length> )"
			},
			"blend-mode": {
				"syntax": "normal | multiply | screen | overlay | darken | lighten | color-dodge | color-burn | hard-light | soft-light | difference | exclusion | hue | saturation | color | luminosity"
			},
			"box": {
				"syntax": "border-box | padding-box | content-box"
			},
			"br-style": {
				"syntax": "none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset"
			},
			"br-width": {
				"syntax": "<length> | thin | medium | thick"
			},
			"brightness()": {
				"syntax": "brightness( <number-percentage> )"
			},
			"calc()": {
				"syntax": "calc( <calc-sum> )"
			},
			"calc-sum": {
				"syntax": "<calc-product> [ [ '+' | '-' ] <calc-product> ]*"
			},
			"calc-product": {
				"syntax": "<calc-value> [ '*' <calc-value> | '/' <number> ]*"
			},
			"calc-value": {
				"syntax": "<number> | <dimension> | <percentage> | ( <calc-sum> )"
			},
			"cf-final-image": {
				"syntax": "<image> | <color>"
			},
			"cf-mixing-image": {
				"syntax": "<percentage>? && <image>"
			},
			"circle()": {
				"syntax": "circle( [ <shape-radius> ]? [ at <position> ]? )"
			},
			"clip-source": {
				"syntax": "<url>"
			},
			"color": {
				"syntax": "<rgb()> | <rgba()> | <hsl()> | <hsla()> | <hex-color> | <named-color> | currentcolor | <deprecated-system-color>"
			},
			"color-stop": {
				"syntax": "<color> <length-percentage>?"
			},
			"color-stop-list": {
				"syntax": "<color-stop>#{2,}"
			},
			"common-lig-values": {
				"syntax": "[ common-ligatures | no-common-ligatures ]"
			},
			"composite-style": {
				"syntax": "clear | copy | source-over | source-in | source-out | source-atop | destination-over | destination-in | destination-out | destination-atop | xor"
			},
			"compositing-operator": {
				"syntax": "add | subtract | intersect | exclude"
			},
			"contextual-alt-values": {
				"syntax": "[ contextual | no-contextual ]"
			},
			"content-list": {
				"syntax": "[ <string> | contents | <image> | <quote> | <target> | <leader()> ]+"
			},
			"content-replacement": {
				"syntax": "<image>"
			},
			"contrast()": {
				"syntax": "contrast( [ <number-percentage> ] )"
			},
			"counter-style": {
				"syntax": "<counter-style-name> | symbols()"
			},
			"counter-style-name": {
				"syntax": "<custom-ident>"
			},
			"cross-fade()": {
				"syntax": "cross-fade( <cf-mixing-image> , <cf-final-image>? )"
			},
			"cubic-bezier-timing-function": {
				"syntax": "ease | ease-in | ease-out | ease-in-out | cubic-bezier(<number>, <number>, <number>, <number>)"
			},
			"deprecated-system-color": {
				"syntax": "ActiveBorder | ActiveCaption | AppWorkspace | Background | ButtonFace | ButtonHighlight | ButtonShadow | ButtonText | CaptionText | GrayText | Highlight | HighlightText | InactiveBorder | InactiveCaption | InactiveCaptionText | InfoBackground | InfoText | Menu | MenuText | Scrollbar | ThreeDDarkShadow | ThreeDFace | ThreeDHighlight | ThreeDLightShadow | ThreeDShadow | Window | WindowFrame | WindowText"
			},
			"discretionary-lig-values": {
				"syntax": "[ discretionary-ligatures | no-discretionary-ligatures ]"
			},
			"display-box": {
				"syntax": "contents | none"
			},
			"display-inside": {
				"syntax": "flow | flow-root | table | flex | grid | subgrid | ruby"
			},
			"display-internal": {
				"syntax": "table-row-group | table-header-group | table-footer-group | table-row | table-cell | table-column-group | table-column | table-caption | ruby-base | ruby-text | ruby-base-container | ruby-text-container"
			},
			"display-legacy": {
				"syntax": "inline-block | inline-list-item | inline-table | inline-flex | inline-grid"
			},
			"display-listitem": {
				"syntax": "list-item && <display-outside>? && [ flow | flow-root ]?"
			},
			"display-outside": {
				"syntax": "block | inline | run-in"
			},
			"drop-shadow()": {
				"syntax": "drop-shadow( <length>{2,3} <color>? )"
			},
			"east-asian-variant-values": {
				"syntax": "[ jis78 | jis83 | jis90 | jis04 | simplified | traditional ]"
			},
			"east-asian-width-values": {
				"syntax": "[ full-width | proportional-width ]"
			},
			"element()": {
				"syntax": "element( <id-selector> )"
			},
			"ellipse()": {
				"syntax": "ellipse( [ <shape-radius>{2} ]? [ at <position> ]? )"
			},
			"ending-shape": {
				"syntax": "circle | ellipse"
			},
			"explicit-track-list": {
				"syntax": "[ <line-names>? <track-size> ]+ <line-names>?"
			},
			"family-name": {
				"syntax": "<string> | <custom-ident>+"
			},
			"feature-tag-value": {
				"syntax": "<string> [ <integer> | on | off ]?"
			},
			"feature-type": {
				"syntax": "@stylistic | @historical-forms | @styleset | @character-variant | @swash | @ornaments | @annotation"
			},
			"feature-value-block": {
				"syntax": "<feature-type> {\n	<feature-value-declaration-list>\n}"
			},
			"feature-value-block-list": {
				"syntax": "<feature-value-block>+"
			},
			"feature-value-declaration": {
				"syntax": "<custom-ident>: <integer>+;"
			},
			"feature-value-declaration-list": {
				"syntax": "<feature-value-declaration>"
			},
			"feature-value-name": {
				"syntax": "<custom-ident>"
			},
			"fill-rule": {
				"syntax": "nonzero | evenodd"
			},
			"filter-function": {
				"syntax": "<blur()> | <brightness()> | <contrast()> | <drop-shadow()> | <grayscale()> | <hue-rotate()> | <invert()> | <opacity()> | <sepia()> | <saturate()>"
			},
			"filter-function-list": {
				"syntax": "[ <filter-function> | <url> ]+"
			},
			"final-bg-layer": {
				"syntax": "<bg-image> || <position> [ / <bg-size> ]? || <repeat-style> || <attachment> || <box> || <box> || <'background-color'>"
			},
			"fit-content()": {
				"syntax": "fit-content( [ <length> | <percentage> ] )"
			},
			"fixed-breadth": {
				"syntax": "<length-percentage>"
			},
			"fixed-repeat": {
				"syntax": "repeat( [ <positive-integer> ] , [ <line-names>? <fixed-size> ]+ <line-names>? )"
			},
			"fixed-size": {
				"syntax": "<fixed-breadth> | minmax( <fixed-breadth> , <track-breadth> ) | minmax( <inflexible-breadth> , <fixed-breadth> )"
			},
			"font-variant-css21": {
				"syntax": "[ normal | small-caps ]"
			},
			"frames-timing-function": {
				"syntax": "frames(<integer>)"
			},
			"frequency-percentage": {
				"syntax": "<frequency> | <percentage>"
			},
			"general-enclosed": {
				"syntax": "[ <function-token> <any-value> ) ] | ( <ident> <any-value> )"
			},
			"generic-family": {
				"syntax": "serif | sans-serif | cursive | fantasy | monospace"
			},
			"generic-name": {
				"syntax": "serif | sans-serif | cursive | fantasy | monospace"
			},
			"geometry-box": {
				"syntax": "<shape-box> | fill-box | stroke-box | view-box"
			},
			"gradient": {
				"syntax": "<linear-gradient()> | <repeating-linear-gradient()> | <radial-gradient()> | <repeating-radial-gradient()>"
			},
			"grayscale()": {
				"syntax": "grayscale( <number-percentage> )"
			},
			"grid-line": {
				"syntax": "auto | <custom-ident> | [ <integer> && <custom-ident>? ] | [ span && [ <integer> || <custom-ident> ] ]"
			},
			"historical-lig-values": {
				"syntax": "[ historical-ligatures | no-historical-ligatures ]"
			},
			"hsl()": {
				"syntax": "hsl( [ <hue> <percentage> <percentage> [ / <alpha-value> ]? ] | [ <hue>, <percentage>, <percentage>, <alpha-value>? ] )"
			},
			"hsla()": {
				"syntax": "hsla( [ <hue> <percentage> <percentage> [ / <alpha-value> ]? ] | [ <hue>, <percentage>, <percentage>, <alpha-value>? ] )"
			},
			"hue": {
				"syntax": "<number> | <angle>"
			},
			"hue-rotate()": {
				"syntax": "hue-rotate( <angle> )"
			},
			"image": {
				"syntax": "<url> | <image()> | <image-set()> | <element()> | <cross-fade()> | <gradient>"
			},
			"image()": {
				"syntax": "image( [ [ <image> | <string> ]? , <color>? ]! )"
			},
			"image-set()": {
				"syntax": "image-set( <image-set-option># )"
			},
			"image-set-option": {
				"syntax": "[ <image> | <string> ] <resolution>"
			},
			"inflexible-breadth": {
				"syntax": "<length> | <percentage> | min-content | max-content | auto"
			},
			"inset()": {
				"syntax": "inset( <length-percentage>{1,4} [ round <border-radius> ]? )"
			},
			"invert()": {
				"syntax": "invert( <number-percentage> )"
			},
			"keyframes-name": {
				"syntax": "<custom-ident> | <string>"
			},
			"keyframe-block": {
				"syntax": "<keyframe-selector># {\n	<declaration-list>\n}"
			},
			"keyframe-block-list": {
				"syntax": "<keyframe-block>+"
			},
			"keyframe-selector": {
				"syntax": "from | to | <percentage>"
			},
			"leader()": {
				"syntax": "leader( <leader-type> )"
			},
			"leader-type": {
				"syntax": "dotted | solid | space | <string>"
			},
			"length-percentage": {
				"syntax": "<length> | <percentage>"
			},
			"line-names": {
				"syntax": "'[' <custom-ident>* ']'"
			},
			"line-name-list": {
				"syntax": "[ <line-names> | <name-repeat> ]+"
			},
			"linear-gradient()": {
				"syntax": "linear-gradient( [ <angle> | to <side-or-corner> ]? , <color-stop-list> )"
			},
			"mask-layer": {
				"syntax": "<mask-reference> || <position> [ / <bg-size> ]? || <repeat-style> || <geometry-box> || [ <geometry-box> | no-clip ] || <compositing-operator> || <masking-mode>"
			},
			"mask-position": {
				"syntax": "[ <length-percentage> | left | center | right ] [ <length-percentage> | top | center | bottom ]?"
			},
			"mask-reference": {
				"syntax": "none | <image> | <mask-source>"
			},
			"mask-source": {
				"syntax": "<url>"
			},
			"masking-mode": {
				"syntax": "alpha | luminance | match-source"
			},
			"matrix()": {
				"syntax": "matrix( <number> [, <number> ]{5,5} )"
			},
			"matrix3d()": {
				"syntax": "matrix3d( <number> [, <number> ]{15,15} )"
			},
			"media-and": {
				"syntax": "<media-in-parens> [ and <media-in-parens> ]+"
			},
			"media-condition": {
				"syntax": "<media-not> | <media-and> | <media-or> | <media-in-parens>"
			},
			"media-condition-without-or": {
				"syntax": "<media-not> | <media-and> | <media-in-parens>"
			},
			"media-feature": {
				"syntax": "( [ <mf-plain> | <mf-boolean> | <mf-range> ] )"
			},
			"media-in-parens": {
				"syntax": "( <media-condition> ) | <media-feature> | <general-enclosed>"
			},
			"media-not": {
				"syntax": "not <media-in-parens>"
			},
			"media-or": {
				"syntax": "<media-in-parens> [ or <media-in-parens> ]+"
			},
			"media-query": {
				"syntax": "<media-condition> | [ not | only ]? <media-type> [ and <media-condition-without-or> ]?"
			},
			"media-query-list": {
				"syntax": "<media-query>#"
			},
			"media-type": {
				"syntax": "<ident>"
			},
			"mf-boolean": {
				"syntax": "<mf-name>"
			},
			"mf-name": {
				"syntax": "<ident>"
			},
			"mf-plain": {
				"syntax": "<mf-name> : <mf-value>"
			},
			"mf-range": {
				"syntax": "<mf-name> [ '<' | '>' ]? '='? <mf-value>\n| <mf-value> [ '<' | '>' ]? '='? <mf-name>\n| <mf-value> '<' '='? <mf-name> '<' '='? <mf-value>\n| <mf-value> '>' '='? <mf-name> '>' '='? <mf-value>"
			},
			"mf-value": {
				"syntax": "<number> | <dimension> | <ident> | <ratio>"
			},
			"minmax()": {
				"syntax": "minmax( [ <length> | <percentage> | <flex> | min-content | max-content | auto ] , [ <length> | <percentage> | <flex> | min-content | max-content | auto ] )"
			},
			"named-color": {
				"syntax": "transparent | aliceblue | antiquewhite | aqua | aquamarine | azure | beige | bisque | black | blanchedalmond | blue | blueviolet | brown | burlywood | cadetblue | chartreuse | chocolate | coral | cornflowerblue | cornsilk | crimson | cyan | darkblue | darkcyan | darkgoldenrod | darkgray | darkgreen | darkgrey | darkkhaki | darkmagenta | darkolivegreen | darkorange | darkorchid | darkred | darksalmon | darkseagreen | darkslateblue | darkslategray | darkslategrey | darkturquoise | darkviolet | deeppink | deepskyblue | dimgray | dimgrey | dodgerblue | firebrick | floralwhite | forestgreen | fuchsia | gainsboro | ghostwhite | gold | goldenrod | gray | green | greenyellow | grey | honeydew | hotpink | indianred | indigo | ivory | khaki | lavender | lavenderblush | lawngreen | lemonchiffon | lightblue | lightcoral | lightcyan | lightgoldenrodyellow | lightgray | lightgreen | lightgrey | lightpink | lightsalmon | lightseagreen | lightskyblue | lightslategray | lightslategrey | lightsteelblue | lightyellow | lime | limegreen | linen | magenta | maroon | mediumaquamarine | mediumblue | mediumorchid | mediumpurple | mediumseagreen | mediumslateblue | mediumspringgreen | mediumturquoise | mediumvioletred | midnightblue | mintcream | mistyrose | moccasin | navajowhite | navy | oldlace | olive | olivedrab | orange | orangered | orchid | palegoldenrod | palegreen | paleturquoise | palevioletred | papayawhip | peachpuff | peru | pink | plum | powderblue | purple | rebeccapurple | red | rosybrown | royalblue | saddlebrown | salmon | sandybrown | seagreen | seashell | sienna | silver | skyblue | slateblue | slategray | slategrey | snow | springgreen | steelblue | tan | teal | thistle | tomato | turquoise | violet | wheat | white | whitesmoke | yellow | yellowgreen"
			},
			"namespace-prefix": {
				"syntax": "<ident>"
			},
			"number-percentage": {
				"syntax": "<number> | <percentage>"
			},
			"numeric-figure-values": {
				"syntax": "[ lining-nums | oldstyle-nums ]"
			},
			"numeric-fraction-values": {
				"syntax": "[ diagonal-fractions | stacked-fractions ]"
			},
			"numeric-spacing-values": {
				"syntax": "[ proportional-nums | tabular-nums ]"
			},
			"nth": {
				"syntax": "<an-plus-b> | even | odd"
			},
			"opacity()": {
				"syntax": "opacity( [ <number-percentage> ] )"
			},
			"page-body": {
				"syntax": "<declaration>? [ ; <page-body> ]? | <page-margin-box> <page-body>"
			},
			"page-margin-box": {
				"syntax": "<page-margin-box-type> {\n	<declaration-list>\n}"
			},
			"page-margin-box-type": {
				"syntax": "@top-left-corner | @top-left | @top-center | @top-right | @top-right-corner | @bottom-left-corner | @bottom-left | @bottom-center | @bottom-right | @bottom-right-corner | @left-top | @left-middle | @left-bottom | @right-top | @right-middle | @right-bottom"
			},
			"page-selector-list": {
				"syntax": "[ <page-selector># ]?"
			},
			"page-selector": {
				"syntax": "<pseudo-page>+ | <ident> <pseudo-page>*"
			},
			"perspective()": {
				"syntax": "perspective( <length> )"
			},
			"polygon()": {
				"syntax": "polygon( <fill-rule>? , [ <length-percentage> <length-percentage> ]# )"
			},
			"position": {
				"syntax": "[[ left | center | right | top | bottom | <length-percentage> ] | [ left | center | right | <length-percentage> ] [ top | center | bottom | <length-percentage> ] | [ center | [ left | right ] <length-percentage>? ] && [ center | [ top | bottom ] <length-percentage>? ]]"
			},
			"pseudo-page": {
				"syntax": ": [ left | right | first | blank ]"
			},
			"quote": {
				"syntax": "open-quote | close-quote | no-open-quote | no-close-quote"
			},
			"radial-gradient()": {
				"syntax": "radial-gradient( [ <ending-shape> || <size> ]? [ at <position> ]? , <color-stop-list> )"
			},
			"relative-size": {
				"syntax": "larger | smaller"
			},
			"repeat-style": {
				"syntax": "repeat-x | repeat-y | [ repeat | space | round | no-repeat ]{1,2}"
			},
			"repeating-linear-gradient()": {
				"syntax": "repeating-linear-gradient( [ <angle> | to <side-or-corner> ]? , <color-stop-list> )"
			},
			"repeating-radial-gradient()": {
				"syntax": "repeating-radial-gradient( [ <ending-shape> || <size> ]? [ at <position> ]? , <color-stop-list> )"
			},
			"rgb()": {
				"syntax": "rgb( [ [ <percentage>{3} | <number>{3} ] [ / <alpha-value> ]? ] | [ [ <percentage>#{3} | <number>#{3} ] , <alpha-value>? ] )"
			},
			"rgba()": {
				"syntax": "rgba( [ [ <percentage>{3} | <number>{3} ] [ / <alpha-value> ]? ] | [ [ <percentage>#{3} | <number>#{3} ] , <alpha-value>? ] )"
			},
			"rotate()": {
				"syntax": "rotate( <angle> )"
			},
			"rotate3d()": {
				"syntax": "rotate3d( <number> , <number> , <number> , <angle> )"
			},
			"rotateX()": {
				"syntax": "rotateX( <angle> )"
			},
			"rotateY()": {
				"syntax": "rotateY( <angle> )"
			},
			"rotateZ()": {
				"syntax": "rotateZ( <angle> )"
			},
			"saturate()": {
				"syntax": "saturate( <number-percentage> )"
			},
			"scale()": {
				"syntax": "scale( <number> [, <number> ]? )"
			},
			"scale3d()": {
				"syntax": "scale3d( <number> , <number> , <number> )"
			},
			"scaleX()": {
				"syntax": "scaleX( <number> )"
			},
			"scaleY()": {
				"syntax": "scaleY( <number> )"
			},
			"scaleZ()": {
				"syntax": "scaleZ( <number> )"
			},
			"shape-radius": {
				"syntax": "<length-percentage> | closest-side | farthest-side"
			},
			"skew()": {
				"syntax": "skew( <angle> [, <angle> ]? )"
			},
			"skewX()": {
				"syntax": "skewX( <angle> )"
			},
			"skewY()": {
				"syntax": "skewY( <angle> )"
			},
			"sepia()": {
				"syntax": "sepia( <number-percentage> )"
			},
			"shadow": {
				"syntax": "inset? && <length>{2,4} && <color>?"
			},
			"shadow-t": {
				"syntax": "[ <length>{2,3} && <color>? ]"
			},
			"shape": {
				"syntax": "rect(<top>, <right>, <bottom>, <left>)"
			},
			"shape-box": {
				"syntax": "<box> | margin-box"
			},
			"side-or-corner": {
				"syntax": "[ left | right ] || [ top | bottom ]"
			},
			"single-animation": {
				"syntax": "<time> || <single-timing-function> || <time> || <single-animation-iteration-count> || <single-animation-direction> || <single-animation-fill-mode> || <single-animation-play-state> || [ none | <keyframes-name> ]"
			},
			"single-animation-direction": {
				"syntax": "normal | reverse | alternate | alternate-reverse"
			},
			"single-animation-fill-mode": {
				"syntax": "none | forwards | backwards | both"
			},
			"single-animation-iteration-count": {
				"syntax": "infinite | <number>"
			},
			"single-animation-play-state": {
				"syntax": "running | paused"
			},
			"single-timing-function": {
				"syntax": "linear | <cubic-bezier-timing-function> | <step-timing-function> | <frames-timing-function>"
			},
			"single-transition": {
				"syntax": "[ none | <single-transition-property> ] || <time> || <single-transition-timing-function> || <time>"
			},
			"single-transition-timing-function": {
				"syntax": "<single-timing-function>"
			},
			"single-transition-property": {
				"syntax": "all | <custom-ident>"
			},
			"size": {
				"syntax": "closest-side | farthest-side | closest-corner | farthest-corner | <length> | <length-percentage>{2}"
			},
			"step-timing-function": {
				"syntax": "step-start | step-end | steps(<integer>[, [ start | end ] ]?)"
			},
			"symbol": {
				"syntax": "<string> | <image> | <ident>"
			},
			"target": {
				"syntax": "<target-counter()> | <target-counters()> | <target-text()>"
			},
			"target-counter()": {
				"syntax": "target-counter( [ <string> | <url> ] , <custom-ident> , <counter-style>? )"
			},
			"target-counters()": {
				"syntax": "target-counters( [ <string> | <url> ] , <custom-ident> , <string> , <counter-style>? )"
			},
			"target-text()": {
				"syntax": "target-text( [ <string> | <url> ] , [ content | before | after | first-letter ]? )"
			},
			"time-percentage": {
				"syntax": "<time> | <percentage>"
			},
			"track-breadth": {
				"syntax": "<length-percentage> | <flex> | min-content | max-content | auto"
			},
			"track-list": {
				"syntax": "[ <line-names>? [ <track-size> | <track-repeat> ] ]+ <line-names>?"
			},
			"track-repeat": {
				"syntax": "repeat( [ <positive-integer> ] , [ <line-names>? <track-size> ]+ <line-names>? )"
			},
			"track-size": {
				"syntax": "<track-breadth> | minmax( <inflexible-breadth> , <track-breadth> ) | fit-content( [ <length> | <percentage> ] )"
			},
			"transform-function": {
				"syntax": "[ <matrix()> || <translate()> || <translateX()> || <translateY()> || <scale()> || <scaleX()> || <scaleY()> || <rotate()> || <skew()> || <skewX()> || <skewY()> || <matrix3d()> || <translate3d()> || <translateZ()> || <scale3d()> || <scaleZ()> || <rotate3d()> || <rotateX()> || <rotateY()> || <rotateZ()> || <perspective()> ]+"
			},
			"transform-list": {
				"syntax": "<transform-function>+"
			},
			"translate()": {
				"syntax": "translate( <length-percentage> [, <length-percentage> ]? )"
			},
			"translate3d()": {
				"syntax": "translate3d( <length-percentage> , <length-percentage> , <length> )"
			},
			"translateX()": {
				"syntax": "translateX( <length-percentage> )"
			},
			"translateY()": {
				"syntax": "translateY( <length-percentage> )"
			},
			"translateZ()": {
				"syntax": "translateZ( <length> )"
			},
			"type-or-unit": {
				"syntax": "string | integer | color | url | integer | number | length | angle | time | frequency | em | ex | px | rem | vw | vh | vmin | vmax | mm | q | cm | in | pt | pc | deg | grad | rad | ms | s | Hz | kHz | %"
			},
			"var()": {
				"syntax": "var( <custom-property-name> [, <declaration-value> ]? )"
			},
			"viewport-length": {
				"syntax": "auto | <length-percentage>"
			}
		}

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/data/patch
	modules['/css-tree/data/patch'] = function () {
		var exports = {
			"properties": {
				"--*": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"-moz-background-clip": {
					"comment": "deprecated syntax in old Firefox, https://developer.mozilla.org/en/docs/Web/CSS/background-clip",
					"syntax": "padding | border"
				},
				"-moz-border-radius-bottomleft": {
					"comment": "https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius",
					"syntax": "<'border-bottom-left-radius'>"
				},
				"-moz-border-radius-bottomright": {
					"comment": "https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-right-radius",
					"syntax": "<'border-bottom-right-radius'>"
				},
				"-moz-border-radius-topleft": {
					"comment": "https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-left-radius",
					"syntax": "<'border-top-left-radius'>"
				},
				"-moz-border-radius-topright": {
					"comment": "https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-right-radius",
					"syntax": "<'border-bottom-right-radius'>"
				},
				"-moz-osx-font-smoothing": {
					"comment": "misssed old syntax https://developer.mozilla.org/en-US/docs/Web/CSS/font-smooth",
					"syntax": "auto | unset | grayscale"
				},
				"-moz-user-select": {
					"comment": "https://developer.mozilla.org/en-US/docs/Web/CSS/user-select",
					"syntax": "none | text | all | -moz-none"
				},
				"-ms-filter": {
					"comment": "added missed syntax https://blogs.msdn.microsoft.com/ie/2009/02/19/the-css-corner-using-filters-in-ie8/",
					"syntax": "<string>"
				},
				"-ms-flex-align": {
					"comment": "misssed old syntax implemented in IE, https://www.w3.org/TR/2012/WD-css3-flexbox-20120322/#flex-align",
					"syntax": "start | end | center | baseline | stretch"
				},
				"-ms-flex-item-align": {
					"comment": "misssed old syntax implemented in IE, https://www.w3.org/TR/2012/WD-css3-flexbox-20120322/#flex-align",
					"syntax": "auto | start | end | center | baseline | stretch"
				},
				"-ms-flex-line-pack": {
					"comment": "misssed old syntax implemented in IE, https://www.w3.org/TR/2012/WD-css3-flexbox-20120322/#flex-line-pack",
					"syntax": "start | end | center | justify | distribute | stretch"
				},
				"-ms-flex-negative": {
					"comment": "misssed old syntax implemented in IE; TODO: find references for comfirmation",
					"syntax": "<'flex-shrink'>"
				},
				"-ms-flex-pack": {
					"comment": "misssed old syntax implemented in IE, https://www.w3.org/TR/2012/WD-css3-flexbox-20120322/#flex-pack",
					"syntax": "start | end | center | justify | distribute"
				},
				"-ms-flex-order": {
					"comment": "misssed old syntax implemented in IE; https://msdn.microsoft.com/en-us/library/jj127303(v=vs.85).aspx",
					"syntax": "<integer>"
				},
				"-ms-flex-positive": {
					"comment": "misssed old syntax implemented in IE; TODO: find references for comfirmation",
					"syntax": "<'flex-grow'>"
				},
				"-ms-flex-preferred-size": {
					"comment": "misssed old syntax implemented in IE; TODO: find references for comfirmation",
					"syntax": "<'flex-basis'>"
				},
				"-ms-interpolation-mode": {
					"comment": "https://msdn.microsoft.com/en-us/library/ff521095(v=vs.85).aspx",
					"syntax": "nearest-neighbor | bicubic"
				},
				"-ms-grid-column-align": {
					"comment": "add this property first since it uses as fallback for flexbox, https://msdn.microsoft.com/en-us/library/windows/apps/hh466338.aspx",
					"syntax": "start | end | center | stretch"
				},
				"-ms-grid-row-align": {
					"comment": "add this property first since it uses as fallback for flexbox, https://msdn.microsoft.com/en-us/library/windows/apps/hh466348.aspx",
					"syntax": "start | end | center | stretch"
				},
				"-ms-high-contrast-adjust": {
					"comment": "https://msdn.microsoft.com/en-us/library/hh771863(v=vs.85).aspx",
					"syntax": "auto | none"
				},
				"-ms-user-select": {
					"comment": "https://msdn.microsoft.com/en-us/library/hh781492(v=vs.85).aspx",
					"syntax": "none | element | text"
				},
				"-webkit-appearance": {
					"comment": "webkit specific keywords",
					"references": [
						"http://css-infos.net/property/-webkit-appearance"
					],
					"syntax": "none | button | button-bevel | caps-lock-indicator | caret | checkbox | default-button | listbox | listitem | media-fullscreen-button | media-mute-button | media-play-button | media-seek-back-button | media-seek-forward-button | media-slider | media-sliderthumb | menulist | menulist-button | menulist-text | menulist-textfield | push-button | radio | scrollbarbutton-down | scrollbarbutton-left | scrollbarbutton-right | scrollbarbutton-up | scrollbargripper-horizontal | scrollbargripper-vertical | scrollbarthumb-horizontal | scrollbarthumb-vertical | scrollbartrack-horizontal | scrollbartrack-vertical | searchfield | searchfield-cancel-button | searchfield-decoration | searchfield-results-button | searchfield-results-decoration | slider-horizontal | slider-vertical | sliderthumb-horizontal | sliderthumb-vertical | square-button | textarea | textfield"
				},
				"-webkit-background-clip": {
					"comment": "https://developer.mozilla.org/en/docs/Web/CSS/background-clip",
					"syntax": "[ <box> | border | padding | content | text ]#"
				},
				"-webkit-column-break-after": {
					"comment": "added, http://help.dottoro.com/lcrthhhv.php",
					"syntax": "always | auto | avoid"
				},
				"-webkit-column-break-before": {
					"comment": "added, http://help.dottoro.com/lcxquvkf.php",
					"syntax": "always | auto | avoid"
				},
				"-webkit-column-break-inside": {
					"comment": "added, http://help.dottoro.com/lclhnthl.php",
					"syntax": "always | auto | avoid"
				},
				"-webkit-font-smoothing": {
					"comment": "https://developer.mozilla.org/en-US/docs/Web/CSS/font-smooth",
					"syntax": "none | antialiased | subpixel-antialiased"
				},
				"-webkit-line-clamp": {
					"comment": "non-standard and deprecated but may still using by some sites",
					"syntax": "<positive-integer>"
				},
				"-webkit-mask-box-image": {
					"comment": "missed; https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-mask-box-image",
					"syntax": "[ <url> | <gradient> | none ] [ <length-percentage>{4} <-webkit-mask-box-repeat>{2} ]?"
				},
				"-webkit-mask-clip": {
					"comment": "change type to <-webkit-mask-clip-style> since it differ from <mask-clip>, extra space between [ and ,",
					"syntax": "<-webkit-mask-clip-style> [, <-webkit-mask-clip-style> ]*"
				},
				"-webkit-overflow-scrolling": {
					"comment": "missed; https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-overflow-scrolling",
					"syntax": "auto | touch"
				},
				"-webkit-print-color-adjust": {
					"comment": "missed",
					"references": [
						"https://developer.mozilla.org/en/docs/Web/CSS/-webkit-print-color-adjust"
					],
					"syntax": "economy | exact"
				},
				"-webkit-text-security": {
					"comment": "missed; http://help.dottoro.com/lcbkewgt.php",
					"syntax": "none | circle | disc | square"
				},
				"-webkit-user-drag": {
					"comment": "missed; http://help.dottoro.com/lcbixvwm.php",
					"syntax": "none | element | auto"
				},
				"-webkit-user-select": {
					"comment": "auto is supported by old webkit, https://developer.mozilla.org/en-US/docs/Web/CSS/user-select",
					"syntax": "auto | none | text | all"
				},
				"alignment-baseline": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/text.html#AlignmentBaselineProperty"
					],
					"syntax": "auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical"
				},
				"baseline-shift": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/text.html#BaselineShiftProperty"
					],
					"syntax": "baseline | sub | super | <svg-length>"
				},
				"behavior": {
					"comment": "added old IE property https://msdn.microsoft.com/en-us/library/ms530723(v=vs.85).aspx",
					"syntax": "<url>+"
				},
				"clip-rule": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/masking.html#ClipRuleProperty"
					],
					"syntax": "nonzero | evenodd"
				},
				"cue": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<'cue-before'> <'cue-after'>?"
				},
				"cue-after": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<url> <decibel>? | none"
				},
				"cue-before": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<url> <decibel>? | none"
				},
				"cursor": {
					"comment": "added legacy keywords: hand, -webkit-grab. -webkit-grabbing, -webkit-zoom-in, -webkit-zoom-out, -moz-grab, -moz-grabbing, -moz-zoom-in, -moz-zoom-out",
					"refenrences": ["https://www.sitepoint.com/css3-cursor-styles/"],
					"syntax": "[ [ <url> [ <x> <y> ]? , ]* [ auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out | grab | grabbing | hand | -webkit-grab | -webkit-grabbing | -webkit-zoom-in | -webkit-zoom-out | -moz-grab | -moz-grabbing | -moz-zoom-in | -moz-zoom-out ] ]"
				},
				"display": {
					"comment": "extended with -ms-flexbox",
					"syntax": "none | inline | block | list-item | inline-list-item | inline-block | inline-table | table | table-cell | table-column | table-column-group | table-footer-group | table-header-group | table-row | table-row-group | flex | inline-flex | grid | inline-grid | run-in | ruby | ruby-base | ruby-text | ruby-base-container | ruby-text-container | contents | -ms-flexbox | -ms-inline-flexbox | -ms-grid | -ms-inline-grid | -webkit-flex | -webkit-inline-flex | -webkit-box | -webkit-inline-box | -moz-inline-stack | -moz-box | -moz-inline-box"
				},
				"position": {
					"comment": "extended with -webkit-sticky",
					"syntax": "static | relative | absolute | sticky | fixed | -webkit-sticky"
				},
				"dominant-baseline": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/text.html#DominantBaselineProperty"
					],
					"syntax": "auto | use-script | no-change | reset-size | ideographic | alphabetic | hanging | mathematical | central | middle | text-after-edge | text-before-edge"
				},
				"image-rendering": {
					"comment": "extended with <-non-standart-image-rendering>, added SVG keywords optimizeSpeed and optimizeQuality",
					"references": [
						"https://developer.mozilla.org/en/docs/Web/CSS/image-rendering",
						"https://www.w3.org/TR/SVG/painting.html#ImageRenderingProperty"
					],
					"syntax": "auto | crisp-edges | pixelated | optimizeSpeed | optimizeQuality | <-non-standart-image-rendering>"
				},
				"fill": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#FillProperty"
					],
					"syntax": "<paint>"
				},
				"fill-opacity": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#FillProperty"
					],
					"syntax": "<number-zero-one>"
				},
				"fill-rule": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#FillProperty"
					],
					"syntax": "nonzero | evenodd"
				},
				"filter": {
					"comment": "extend with IE legacy syntaxes",
					"syntax": "none | <filter-function-list> | <-ms-filter>"
				},
				"font": {
					"comment": "extend with non-standart fonts",
					"syntax": "[ [ <'font-style'> || <font-variant-css21> || <'font-weight'> || <'font-stretch'> ]? <'font-size'> [ / <'line-height'> ]? <'font-family'> ] | caption | icon | menu | message-box | small-caption | status-bar | <-non-standart-font>"
				},
				"glyph-orientation-horizontal": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/text.html#GlyphOrientationHorizontalProperty"
					],
					"syntax": "<angle>"
				},
				"glyph-orientation-vertical": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/text.html#GlyphOrientationVerticalProperty"
					],
					"syntax": "<angle>"
				},
				"kerning": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/text.html#KerningProperty"
					],
					"syntax": "auto | <svg-length>"
				},
				"letter-spacing": {
					"comment": "fix syntax <length> -> <length-percentage>",
					"references": [
						"https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/letter-spacing"
					],
					"syntax": "normal | <length-percentage>"
				},
				"marker": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#MarkerProperties"
					],
					"syntax": "none | <url>"
				},
				"marker-end": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#MarkerProperties"
					],
					"syntax": "none | <url>"
				},
				"marker-mid": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#MarkerProperties"
					],
					"syntax": "none | <url>"
				},
				"marker-start": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#MarkerProperties"
					],
					"syntax": "none | <url>"
				},
				"max-width": {
					"comment": "extend by non-standart width keywords https://developer.mozilla.org/en-US/docs/Web/CSS/max-width",
					"syntax": "<length> | <percentage> | none | max-content | min-content | fit-content | fill-available | <-non-standart-width>"
				},
				"min-width": {
					"comment": "extend by non-standart width keywords https://developer.mozilla.org/en-US/docs/Web/CSS/width",
					"syntax": "<length> | <percentage> | auto | max-content | min-content | fit-content | fill-available | <-non-standart-width>"
				},
				"opacity": {
					"comment": "strict to 0..1 <number> -> <number-zero-one>",
					"syntax": "<number-zero-one>"
				},
				"pause": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<'pause-before'> <'pause-after'>?"
				},
				"pause-after": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<time> | none | x-weak | weak | medium | strong | x-strong"
				},
				"pause-before": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<time> | none | x-weak | weak | medium | strong | x-strong"
				},
				"rest": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<'rest-before'> <'rest-after'>?"
				},
				"rest-after": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<time> | none | x-weak | weak | medium | strong | x-strong"
				},
				"rest-before": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<time> | none | x-weak | weak | medium | strong | x-strong"
				},
				"shape-rendering": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#ShapeRenderingPropert"
					],
					"syntax": "auto | optimizeSpeed | crispEdges | geometricPrecision"
				},
				"src": {
					"comment": "added @font-face's src property https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src",
					"syntax": "[ <url> format( <string># )? | local( <family-name> ) ]#"
				},
				"speak": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "auto | none | normal"
				},
				"speak-as": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "normal | spell-out || digits || [ literal-punctuation | no-punctuation ]"
				},
				"stroke": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#StrokeProperties"
					],
					"syntax": "<paint>"
				},
				"stroke-dasharray": {
					"comment": "added SVG property; a list of comma and/or white space separated <length>s and <percentage>s",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#StrokeProperties"
					],
					"syntax": "none | [ <svg-length>+ ]#"
				},
				"stroke-dashoffset": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#StrokeProperties"
					],
					"syntax": "<svg-length>"
				},
				"stroke-linecap": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#StrokeProperties"
					],
					"syntax": "butt | round | square"
				},
				"stroke-linejoin": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#StrokeProperties"
					],
					"syntax": "miter | round | bevel"
				},
				"stroke-miterlimit": {
					"comment": "added SVG property (<miterlimit> = <number-one-or-greater>) ",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#StrokeProperties"
					],
					"syntax": "<number-one-or-greater>"
				},
				"stroke-opacity": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#StrokeProperties"
					],
					"syntax": "<number-zero-one>"
				},
				"stroke-width": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/painting.html#StrokeProperties"
					],
					"syntax": "<svg-length>"
				},
				"text-anchor": {
					"comment": "added SVG property",
					"references": [
						"https://www.w3.org/TR/SVG/text.html#TextAlignmentProperties"
					],
					"syntax": "start | middle | end"
				},
				"transform-origin": {
					"comment": "move first group to the end since less collecting",
					"syntax": "[ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>? | [ <length-percentage> | left | center | right | top | bottom ]"
				},
				"unicode-bidi": {
					"comment": "added prefixed keywords https://developer.mozilla.org/en-US/docs/Web/CSS/unicode-bidi",
					"syntax": "normal | embed | isolate | bidi-override | isolate-override | plaintext | -moz-isolate | -moz-isolate-override | -moz-plaintext | -webkit-isolate"
				},
				"unicode-range": {
					"comment": "added missed property https://developer.mozilla.org/en-US/docs/Web/CSS/%40font-face/unicode-range",
					"syntax": "<unicode-range>#"
				},
				"voice-balance": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<number> | left | center | right | leftwards | rightwards"
				},
				"voice-duration": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "auto | <time>"
				},
				"voice-family": {
					"comment": "<name> -> <family-name>, https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "[ [ <family-name> | <generic-voice> ] , ]* [ <family-name> | <generic-voice> ] | preserve"
				},
				"voice-pitch": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<frequency> && absolute | [ [ x-low | low | medium | high | x-high ] || [ <frequency> | <semitones> | <percentage> ] ]"
				},
				"voice-range": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "<frequency> && absolute | [ [ x-low | low | medium | high | x-high ] || [ <frequency> | <semitones> | <percentage> ] ]"
				},
				"voice-rate": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "[ normal | x-slow | slow | medium | fast | x-fast ] || <percentage>"
				},
				"voice-stress": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "normal | strong | moderate | none | reduced"
				},
				"voice-volume": {
					"comment": "https://www.w3.org/TR/css3-speech/#property-index",
					"syntax": "silent | [ [ x-soft | soft | medium | loud | x-loud ] || <decibel> ]"
				},
				"word-break": {
					"comment": "extend with non-standart keywords",
					"syntax": "normal | break-all | keep-all | <-non-standart-word-break>"
				},
				"writing-mode": {
					"comment": "extend with SVG keywords",
					"syntax": "horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr | <svg-writing-mode>"
				},
				"zoom": {
					"comment": "missed, not in DB, https://developer.mozilla.org/en-US/docs/Web/CSS/zoom",
					"syntax": "normal | reset | <number> | <percentage>"
				}
			},
			"syntaxes": {
				"-legacy-gradient()": {
					"comment": "added collection of legacy gradient syntaxes",
					"syntax": "<-webkit-gradient()> | <-legacy-linear-gradient()> | <-legacy-repeating-linear-gradient()> | <-legacy-radial-gradient()> | <-legacy-repeating-radial-gradient()>"
				},
				"-legacy-linear-gradient()": {
					"comment": "like standart syntax but w/o `to` keyword https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient",
					"syntax": "-moz-linear-gradient( <-legacy-linear-gradient-arguments> ) | -ms-linear-gradient( <-legacy-linear-gradient-arguments> ) | -webkit-linear-gradient( <-legacy-linear-gradient-arguments> ) | -o-linear-gradient( <-legacy-linear-gradient-arguments> )"
				},
				"-legacy-repeating-linear-gradient()": {
					"comment": "like standart syntax but w/o `to` keyword https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient",
					"syntax": "-moz-repeating-linear-gradient( <-legacy-linear-gradient-arguments> ) | -ms-repeating-linear-gradient( <-legacy-linear-gradient-arguments> ) | -webkit-repeating-linear-gradient( <-legacy-linear-gradient-arguments> ) | -o-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )"
				},
				"-legacy-linear-gradient-arguments": {
					"comment": "like standart syntax but w/o `to` keyword https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient",
					"syntax": "[ <angle> | <side-or-corner> ]? , <color-stop-list>"
				},
				"-legacy-radial-gradient()": {
					"comment": "deprecated syntax that implemented by some browsers https://www.w3.org/TR/2011/WD-css3-images-20110908/#radial-gradients",
					"syntax": "-moz-radial-gradient( <-legacy-radial-gradient-arguments> ) | -ms-radial-gradient( <-legacy-radial-gradient-arguments> ) | -webkit-radial-gradient( <-legacy-radial-gradient-arguments> ) | -o-radial-gradient( <-legacy-radial-gradient-arguments> )"
				},
				"-legacy-repeating-radial-gradient()": {
					"comment": "deprecated syntax that implemented by some browsers https://www.w3.org/TR/2011/WD-css3-images-20110908/#radial-gradients",
					"syntax": "-moz-repeating-radial-gradient( <-legacy-radial-gradient-arguments> ) | -ms-repeating-radial-gradient( <-legacy-radial-gradient-arguments> ) | -webkit-repeating-radial-gradient( <-legacy-radial-gradient-arguments> ) | -o-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )"
				},
				"-legacy-radial-gradient-arguments": {
					"comment": "deprecated syntax that implemented by some browsers https://www.w3.org/TR/2011/WD-css3-images-20110908/#radial-gradients",
					"syntax": "[ <position> , ]? [ [ [ <-legacy-radial-gradient-shape> || <-legacy-radial-gradient-size> ] | [ <length> | <percentage> ]{2} ] , ]? <color-stop-list>"
				},
				"-legacy-radial-gradient-size": {
					"comment": "before standart it contains 2 extra keywords (`contain` and `cover`) https://www.w3.org/TR/2011/WD-css3-images-20110908/#ltsize",
					"syntax": "closest-side | closest-corner | farthest-side | farthest-corner | contain | cover"
				},
				"-legacy-radial-gradient-shape": {
					"comment": "define to duoble sure it doesn't extends in future https://www.w3.org/TR/2011/WD-css3-images-20110908/#ltshape",
					"syntax": "circle | ellipse"
				},
				"-non-standart-font": {
					"comment": "non standart fonts",
					"preferences": [
						"https://webkit.org/blog/3709/using-the-system-font-in-web-content/"
					],
					"syntax": "-apple-system-body | -apple-system-headline | -apple-system-subheadline | -apple-system-caption1 | -apple-system-caption2 | -apple-system-footnote | -apple-system-short-body | -apple-system-short-headline | -apple-system-short-subheadline | -apple-system-short-caption1 | -apple-system-short-footnote | -apple-system-tall-body"
				},
				"-non-standart-color": {
					"comment": "non standart colors",
					"references": [
						"http://cssdot.ru/%D0%A1%D0%BF%D1%80%D0%B0%D0%B2%D0%BE%D1%87%D0%BD%D0%B8%D0%BA_CSS/color-i305.html",
						"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#Mozilla_Color_Preference_Extensions"
					],
					"syntax": "-moz-ButtonDefault | -moz-ButtonHoverFace | -moz-ButtonHoverText | -moz-CellHighlight | -moz-CellHighlightText | -moz-Combobox | -moz-ComboboxText | -moz-Dialog | -moz-DialogText | -moz-dragtargetzone | -moz-EvenTreeRow | -moz-Field | -moz-FieldText | -moz-html-CellHighlight | -moz-html-CellHighlightText | -moz-mac-accentdarkestshadow | -moz-mac-accentdarkshadow | -moz-mac-accentface | -moz-mac-accentlightesthighlight | -moz-mac-accentlightshadow | -moz-mac-accentregularhighlight | -moz-mac-accentregularshadow | -moz-mac-chrome-active | -moz-mac-chrome-inactive | -moz-mac-focusring | -moz-mac-menuselect | -moz-mac-menushadow | -moz-mac-menutextselect | -moz-MenuHover | -moz-MenuHoverText | -moz-MenuBarText | -moz-MenuBarHoverText | -moz-nativehyperlinktext | -moz-OddTreeRow | -moz-win-communicationstext | -moz-win-mediatext | -moz-activehyperlinktext | -moz-default-background-color | -moz-default-color | -moz-hyperlinktext | -moz-visitedhyperlinktext | -webkit-activelink | -webkit-focus-ring-color | -webkit-link | -webkit-text"
				},
				"-non-standart-image-rendering": {
					"comment": "non-standart keywords http://phrogz.net/tmp/canvas_image_zoom.html",
					"syntax": "optimize-contrast | -moz-crisp-edges | -o-crisp-edges | -webkit-optimize-contrast"
				},
				"-non-standart-width": {
					"comment": "non-standart keywords https://developer.mozilla.org/en-US/docs/Web/CSS/width",
					"syntax": "min-intrinsic | intrinsic | -moz-min-content | -moz-max-content | -webkit-min-content | -webkit-max-content"
				},
				"-non-standart-word-break": {
					"comment": "non-standart keywords https://css-tricks.com/almanac/properties/w/word-break/",
					"syntax": "break-word"
				},
				"-webkit-image-set()": {
					"comment": "added alias",
					"syntax": "<image-set()>"
				},
				"-webkit-gradient()": {
					"comment": "first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/ - TODO: simplify when after match algorithm improvement ( [, point, radius | , point] -> [, radius]? , point )",
					"syntax": "-webkit-gradient( <-webkit-gradient-type>, <-webkit-gradient-point> [, <-webkit-gradient-point> | , <-webkit-gradient-radius>, <-webkit-gradient-point> ] [, <-webkit-gradient-radius>]? [, <-webkit-gradient-color-stop()>]* )"
				},
				"-webkit-gradient-color-stop()": {
					"comment": "first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/",
					"syntax": "from( <color> ) | color-stop( [ <number-zero-one> | <percentage> ] , <color> ) | to( <color> )"
				},
				"-webkit-gradient-point": {
					"comment": "first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/",
					"syntax": " [ left | center | right | <length-percentage> ] [ top | center | bottom | <length-percentage> ]"
				},
				"-webkit-gradient-radius": {
					"comment": "first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/",
					"syntax": "<length> | <percentage>"
				},
				"-webkit-gradient-type": {
					"comment": "first Apple proposal gradient syntax https://webkit.org/blog/175/introducing-css-gradients/",
					"syntax": "linear | radial"
				},
				"-webkit-mask-box-repeat": {
					"comment": "missed; https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-mask-box-image",
					"syntax": "repeat | stretch | round"
				},
				"-webkit-mask-clip-style": {
					"comment": "missed; there is no enough information about `-webkit-mask-clip` property, but looks like all those keywords are working",
					"syntax": "border | border-box | padding | padding-box | content | content-box | text"
				},
				"-ms-filter": {
					"syntax": "[ <progid> | FlipH | FlipV ]+"
				},
				"age": {
					"comment": "https://www.w3.org/TR/css3-speech/#voice-family",
					"syntax": "child | young | old"
				},
				"attr()": {
					"comment": "drop it since it's a generic",
					"syntax": null
				},
				"border-radius": {
					"comment": "missed, https://drafts.csswg.org/css-backgrounds-3/#the-border-radius",
					"syntax": "<length-percentage>{1,2}"
				},
				"bottom": {
					"comment": "missed; not sure we should add it, but no others except `shape` is using it so it's ok for now; https://drafts.fxtf.org/css-masking-1/#funcdef-clip-rect",
					"syntax": "<length> | auto"
				},
				"content-list": {
					"comment": "missed -> https://drafts.csswg.org/css-content/#typedef-content-list (document-url, <target> and leader() is omitted util stabilization)",
					"syntax": "[ <string> | contents | <url> | <quote> | <attr()> | counter( <ident>, <'list-style-type'>? ) ]+"
				},
				"inset()": {
					"comment": "changed <border-radius> to <'border-radius'>",
					"syntax": "inset( <length-percentage>{1,4} [ round <'border-radius'> ]? )"
				},
				"generic-voice": {
					"comment": "https://www.w3.org/TR/css3-speech/#voice-family",
					"syntax": "[ <age>? <gender> <integer>? ]"
				},
				"gender": {
					"comment": "https://www.w3.org/TR/css3-speech/#voice-family",
					"syntax": "male | female | neutral"
				},
				"generic-family": {
					"comment": "added -apple-system",
					"references": [
						"https://webkit.org/blog/3709/using-the-system-font-in-web-content/"
					],
					"syntax": "serif | sans-serif | cursive | fantasy | monospace | -apple-system"
				},
				"gradient": {
					"comment": "added -webkit-gradient() since may to be used for legacy support",
					"syntax": "<-legacy-gradient()> | <linear-gradient()> | <repeating-linear-gradient()> | <radial-gradient()> | <repeating-radial-gradient()>"
				},
				"left": {
					"comment": "missed; not sure we should add it, but no others except `shape` is using it so it's ok for now; https://drafts.fxtf.org/css-masking-1/#funcdef-clip-rect",
					"syntax": "<length> | auto"
				},
				"mask-image": {
					"comment": "missed; https://drafts.fxtf.org/css-masking-1/#the-mask-image",
					"syntax": "<mask-reference>#"
				},
				"matrix()": {
					"comment": "redundant max",
					"syntax": "matrix( <number> [, <number> ]{5} )"
				},
				"matrix3d()": {
					"comment": "redundant max",
					"syntax": "matrix3d( <number> [, <number> ]{15} )"
				},
				"name-repeat": {
					"comment": "missed, and looks like obsolete, keep it as is since other property syntaxes should be changed too; https://www.w3.org/TR/2015/WD-css-grid-1-20150917/#typedef-name-repeat",
					"syntax": "repeat( [ <positive-integer> | auto-fill ], <line-names>+)"
				},
				"named-color": {
					"comment": "replaced <ident> to list of colors according to https://www.w3.org/TR/css-color-4/#named-colors",
					"syntax": "transparent | aliceblue | antiquewhite | aqua | aquamarine | azure | beige | bisque | black | blanchedalmond | blue | blueviolet | brown | burlywood | cadetblue | chartreuse | chocolate | coral | cornflowerblue | cornsilk | crimson | cyan | darkblue | darkcyan | darkgoldenrod | darkgray | darkgreen | darkgrey | darkkhaki | darkmagenta | darkolivegreen | darkorange | darkorchid | darkred | darksalmon | darkseagreen | darkslateblue | darkslategray | darkslategrey | darkturquoise | darkviolet | deeppink | deepskyblue | dimgray | dimgrey | dodgerblue | firebrick | floralwhite | forestgreen | fuchsia | gainsboro | ghostwhite | gold | goldenrod | gray | green | greenyellow | grey | honeydew | hotpink | indianred | indigo | ivory | khaki | lavender | lavenderblush | lawngreen | lemonchiffon | lightblue | lightcoral | lightcyan | lightgoldenrodyellow | lightgray | lightgreen | lightgrey | lightpink | lightsalmon | lightseagreen | lightskyblue | lightslategray | lightslategrey | lightsteelblue | lightyellow | lime | limegreen | linen | magenta | maroon | mediumaquamarine | mediumblue | mediumorchid | mediumpurple | mediumseagreen | mediumslateblue | mediumspringgreen | mediumturquoise | mediumvioletred | midnightblue | mintcream | mistyrose | moccasin | navajowhite | navy | oldlace | olive | olivedrab | orange | orangered | orchid | palegoldenrod | palegreen | paleturquoise | palevioletred | papayawhip | peachpuff | peru | pink | plum | powderblue | purple | rebeccapurple | red | rosybrown | royalblue | saddlebrown | salmon | sandybrown | seagreen | seashell | sienna | silver | skyblue | slateblue | slategray | slategrey | snow | springgreen | steelblue | tan | teal | thistle | tomato | turquoise | violet | wheat | white | whitesmoke | yellow | yellowgreen | <-non-standart-color>"
				},
				"outline-radius": {
					"comment": "missed, looks like it's a similar to <border-radius> https://developer.mozilla.org/en/docs/Web/CSS/-moz-outline-radius",
					"syntax": "<border-radius>"
				},
				"paint": {
					"comment": "simplified SVG syntax (omit <icccolor>, replace <funciri> for <url>) https://www.w3.org/TR/SVG/painting.html#SpecifyingPaint",
					"syntax": "none | currentColor | <color> | <url> [ none | currentColor | <color> ]?"
				},
				"path()": {
					"comment": "missed, `motion` property was renamed, but left it as is for now; path() syntax was get from last draft https://drafts.fxtf.org/motion-1/#funcdef-offset-path-path",
					"syntax": "path( <string> )"
				},
				"position": {
					"comment": "rewrite syntax (TODO: make match work with original syntax)",
					"syntax": "[ center && [ left | right | top | bottom ] <length-percentage>? ] | [ [ left | right ] <length-percentage>? ] && [ [ top | bottom ] <length-percentage>? ] | [ [ left | center | right | <length-percentage> ] || [ top | center | bottom | <length-percentage> ] ]"
				},
				"right": {
					"comment": "missed; not sure we should add it, but no others except `shape` is using it so it's ok for now; https://drafts.fxtf.org/css-masking-1/#funcdef-clip-rect",
					"syntax": "<length> | auto"
				},
				"shape": {
					"comment": "missed spaces in function body and add backwards compatible syntax",
					"syntax": "rect( [ [ <top>, <right>, <bottom>, <left> ] | [ <top> <right> <bottom> <left> ] ] )"
				},
				"single-transition": {
					"comment": "moved <single-transition-timing-function> in the beginning to avoid wrong match to <single-transition-property>",
					"syntax": "<single-transition-timing-function> || [ none | <single-transition-property> ] || <time> || <time>"
				},
				"svg-length": {
					"comment": "All coordinates and lengths in SVG can be specified with or without a unit identifier",
					"references": [
						"https://www.w3.org/TR/SVG11/coords.html#Units"
					],
					"syntax": "<percentage> | <length> | <number>"
				},
				"svg-writing-mode": {
					"comment": "SVG specific keywords (deprecated for CSS)",
					"references": [
						"https://developer.mozilla.org/en/docs/Web/CSS/writing-mode",
						"https://www.w3.org/TR/SVG/text.html#WritingModeProperty"
					],
					"syntax": "lr-tb | rl-tb | tb-rl | lr | rl | tb"
				},
				"top": {
					"comment": "missed; not sure we should add it, but no others except `shape` is using it so it's ok for now; https://drafts.fxtf.org/css-masking-1/#funcdef-clip-rect",
					"syntax": "<length> | auto"
				},
				"x": {
					"comment": "missed; not sure we should add it, but no others except `cursor` is using it so it's ok for now; https://drafts.csswg.org/css-ui-3/#cursor",
					"syntax": "<number>"
				},
				"y": {
					"comment": "missed; not sure we should add it, but no others except `cursor` is using so it's ok for now; https://drafts.csswg.org/css-ui-3/#cursor",
					"syntax": "<number>"
				},
				"var()": {
					"comment": "drop it since it's a generic (also syntax is incorrect and can't be parsed)",
					"syntax": null
				},

				"an-plus-b": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"feature-type": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"feature-value-block": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"feature-value-declaration": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"feature-value-block-list": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"feature-value-declaration-list": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"general-enclosed": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"keyframe-block": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"keyframe-block-list": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"mf-plain": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"mf-range": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"mf-value": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"media-and": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"media-condition": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"media-not": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"media-or": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"media-in-parens": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"media-feature": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"media-condition-without-or": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"media-query": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"media-query-list": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"nth": {
					"comment": "syntax has <an-plus-b> that doesn't support currently, drop for now",
					"syntax": null
				},
				"page-selector": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"page-selector-list": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"page-body": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"page-margin-box": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"page-margin-box-type": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				},
				"pseudo-page": {
					"comment": "syntax is incorrect and can't be parsed, drop for now",
					"syntax": null
				}
			}
		}
		;

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/generator
	modules['/css-tree/generator'] = function () {
		var createGenerator = require('/css-tree/generator/create');
		var config = require('/css-tree/syntax/config/parser');

		var exports = createGenerator(config);

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/generator/create
	modules['/css-tree/generator/create'] = function () {
		'use strict';

		/*BT-
		var sourceMapGenerator = require('/css-tree/generator/sourceMap');
		*/
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var noop = function() {};

		function each(processChunk, node) {
			var list = node.children;
			var cursor = list.head;

			while (cursor !== null) {
				this.generate(processChunk, cursor.data, cursor, list);
				cursor = cursor.next;
			}
		}

		function eachComma(processChunk, node) {
			var list = node.children;
			var cursor = list.head;

			while (cursor !== null) {
				if (cursor.prev) {
					processChunk(',');
				}

				this.generate(processChunk, cursor.data, cursor, list);
				cursor = cursor.next;
			}
		}

		function createGenerator(types) {
			var context = {
				generate: function(processChunk, node, item, list) {
					if (hasOwnProperty.call(types, node.type)) {
						types[node.type].call(this, processChunk, node, item, list);
					} else {
						throw new Error('Unknown node type: ' + node.type);
					}
				},
				each: each,
				eachComma: eachComma
			};

			return function(node, fn) {
				if (typeof fn !== 'function') {
					// default generator concats all chunks in a single string
					var buffer = [];
					context.generate(function(chunk) {
						buffer.push(chunk);
					}, node);
					return buffer.join('');
				}
				context.generate(fn, node);
			};
		}

		function createMarkupGenerator(types) {
			var context = {
				generate: function(processChunk, node, item, list) {
					if (hasOwnProperty.call(types, node.type)) {
						var nodeBuffer = [];
						types[node.type].call(this, function(chunk) {
							nodeBuffer.push(chunk);
						}, node, item, list);
						processChunk({
							node: node,
							value: nodeBuffer
						});
					} else {
						throw new Error('Unknown node type: ' + node.type);
					}
				},
				each: each,
				eachComma: eachComma
			};

			return function(node, enter, leave) {
				function walk(node, buffer) {
					var value = node.value;

					enter(node.node, buffer, value);

					if (typeof value === 'string') {
						buffer += value;
					} else {
						for (var i = 0; i < value.length; i++) {
							if (typeof value[i] === 'string') {
								buffer += value[i];
							} else {
								buffer = walk(value[i], buffer);
							}
						}
					}

					leave(node.node, buffer, value);

					return buffer;
				}

				if (typeof enter !== 'function') {
					enter = noop;
				}
				if (typeof leave !== 'function') {
					leave = noop;
				}

				var buffer = [];
				context.generate(function() {
					buffer.push.apply(buffer, arguments);
				}, node);
				return walk(buffer[0], '');
			};
		}

		function getTypesFromConfig(config) {
			var types = {};

			if (config.node) {
				for (var name in config.node) {
					var nodeType = config.node[name];

					types[name] = nodeType.generate;
				}
			}

			return types;
		}

		var exports = function(config) {
			var types = getTypesFromConfig(config);
			var markupGenerator = createMarkupGenerator(types);

			return {
				translate: createGenerator(types),
				/*BT-
				translateWithSourceMap: function(node) {
					return sourceMapGenerator(markupGenerator, node);
				},
				*/
				translateMarkup: markupGenerator
			};
		};

		exports.createGenerator = createGenerator;
		exports.createMarkupGenerator = createMarkupGenerator;
		/*BT-
		exports.sourceMap = require('/css-tree/generator/sourceMap');
		*/

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/lexer
	modules['/css-tree/lexer'] = function () {
		'use strict';

		var exports = {
			Lexer: require('/css-tree/lexer/Lexer'),
			grammar: require('/css-tree/lexer/grammar')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/lexer/grammar
	modules['/css-tree/lexer/grammar'] = function () {
		var exports = {
			SyntaxParseError: require('/css-tree/lexer/grammar/error').SyntaxParseError,
			parse: require('/css-tree/lexer/grammar/parse'),
			translate: require('/css-tree/lexer/grammar/translate'),
			walk: require('/css-tree/lexer/grammar/walk')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/lexer/grammar/error
	modules['/css-tree/lexer/grammar/error'] = function () {
		'use strict';

		var SyntaxParseError = function(message, syntaxStr, offset) {
			// some VMs prevent setting line/column otherwise (iOS Safari 10 even throw an exception)
			var error = Object.create(SyntaxError.prototype);

			error.name = 'SyntaxParseError';
			error.rawMessage = message;
			error.stack = (new Error().stack || '').replace(/^.+\n/, error.name + ': ' + message + '\n');
			error.syntax = syntaxStr;
			error.offset = offset;
			error.message = error.rawMessage + '\n' +
				'  ' + error.syntax + '\n' +
				'--' + new Array((error.offset || error.syntax.length) + 1).join('-') + '^';

			return error;
		};

		var exports = {
			SyntaxParseError: SyntaxParseError
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/lexer/grammar/parse
	modules['/css-tree/lexer/grammar/parse'] = function () {
		'use strict';

		var SyntaxParseError = require('/css-tree/lexer/grammar/error').SyntaxParseError;

		var TAB = 9;
		var N = 10;
		var F = 12;
		var R = 13;
		var SPACE = 32;
		var EXCLAMATIONMARK = 33;    // !
		var NUMBERSIGN = 35;         // #
		var PERCENTSIGN = 37;        // %
		var AMPERSAND = 38;          // &
		var APOSTROPHE = 39;         // '
		var LEFTPARENTHESIS = 40;    // (
		var RIGHTPARENTHESIS = 41;   // )
		var ASTERISK = 42;           // *
		var PLUSSIGN = 43;           // +
		var COMMA = 44;              // ,
		var SOLIDUS = 47;            // /
		var LESSTHANSIGN = 60;       // <
		var GREATERTHANSIGN = 62;    // >
		var QUESTIONMARK = 63;       // ?
		var LEFTSQUAREBRACKET = 91;  // [
		var RIGHTSQUAREBRACKET = 93; // ]
		var LEFTCURLYBRACKET = 123;  // {
		var VERTICALLINE = 124;      // |
		var RIGHTCURLYBRACKET = 125; // }
		var COMBINATOR_PRECEDENCE = {
			' ': 1,
			'&&': 2,
			'||': 3,
			'|': 4
		};
		var MULTIPLIER_DEFAULT = {
			comma: false,
			min: 1,
			max: 1
		};
		var MULTIPLIER_ZERO_OR_MORE = {
			comma: false,
			min: 0,
			max: 0
		};
		var MULTIPLIER_ONE_OR_MORE = {
			comma: false,
			min: 1,
			max: 0
		};
		var MULTIPLIER_ONE_OR_MORE_COMMA_SEPARATED = {
			comma: true,
			min: 1,
			max: 0
		};
		var MULTIPLIER_ZERO_OR_ONE = {
			comma: false,
			min: 0,
			max: 1
		};
		var NAME_CHAR = (function() {
			var array = typeof Uint32Array === 'function' ? new Uint32Array(128) : new Array(128);
			for (var i = 0; i < 128; i++) {
				array[i] = /[a-zA-Z0-9\-]/.test(String.fromCharCode(i)) ? 1 : 0;
			}
			return array;
		})();

		var Tokenizer = function(str) {
			this.str = str;
			this.pos = 0;
		};
		Tokenizer.prototype = {
			charCode: function() {
				return this.pos < this.str.length ? this.str.charCodeAt(this.pos) : 0;
			},
			nextCharCode: function() {
				return this.pos + 1 < this.str.length ? this.str.charCodeAt(this.pos + 1) : 0;
			},
			substringToPos: function(end) {
				return this.str.substring(this.pos, this.pos = end);
			},
			eat: function(code) {
				if (this.charCode() !== code) {
					error(this, this.pos, 'Expect `' + String.fromCharCode(code) + '`');
				}

				this.pos++;
			}
		};

		function scanSpaces(tokenizer) {
			var end = tokenizer.pos + 1;

			for (; end < tokenizer.str.length; end++) {
				var code = tokenizer.str.charCodeAt(end);
				if (code !== R && code !== N && code !== F && code !== SPACE && code !== TAB) {
					break;
				}
			}

			return tokenizer.substringToPos(end);
		}

		function scanWord(tokenizer) {
			var end = tokenizer.pos;

			for (; end < tokenizer.str.length; end++) {
				var code = tokenizer.str.charCodeAt(end);
				if (code >= 128 || NAME_CHAR[code] === 0) {
					break;
				}
			}

			if (tokenizer.pos === end) {
				error(tokenizer, tokenizer.pos, 'Expect a keyword');
			}

			return tokenizer.substringToPos(end);
		}

		function scanNumber(tokenizer) {
			var end = tokenizer.pos;

			for (; end < tokenizer.str.length; end++) {
				var code = tokenizer.str.charCodeAt(end);
				if (code < 48 || code > 57) {
					break;
				}
			}

			if (tokenizer.pos === end) {
				error(tokenizer, tokenizer.pos, 'Expect a number');
			}

			return tokenizer.substringToPos(end);
		}

		function scanString(tokenizer) {
			var end = tokenizer.str.indexOf('\'', tokenizer.pos + 1);

			if (end === -1) {
				error(tokenizer, tokenizer.str.length, 'Expect a quote');
			}

			return tokenizer.substringToPos(end + 1);
		}

		function readMultiplierRange(tokenizer, comma) {
			var min = null;
			var max = null;

			tokenizer.eat(LEFTCURLYBRACKET);

			min = scanNumber(tokenizer);

			if (tokenizer.charCode() === COMMA) {
				tokenizer.pos++;
				if (tokenizer.charCode() !== RIGHTCURLYBRACKET) {
					max = scanNumber(tokenizer);
				}
			} else {
				max = min;
			}

			tokenizer.eat(RIGHTCURLYBRACKET);

			return {
				comma: comma,
				min: Number(min),
				max: max ? Number(max) : 0
			};
		}

		function readMultiplier(tokenizer) {
			switch (tokenizer.charCode()) {
				case ASTERISK:
					tokenizer.pos++;
					return MULTIPLIER_ZERO_OR_MORE;

				case PLUSSIGN:
					tokenizer.pos++;
					return MULTIPLIER_ONE_OR_MORE;

				case QUESTIONMARK:
					tokenizer.pos++;
					return MULTIPLIER_ZERO_OR_ONE;

				case NUMBERSIGN:
					tokenizer.pos++;

					if (tokenizer.charCode() !== LEFTCURLYBRACKET) {
						return MULTIPLIER_ONE_OR_MORE_COMMA_SEPARATED;
					}

					return readMultiplierRange(tokenizer, true);

				case LEFTCURLYBRACKET:
					return readMultiplierRange(tokenizer, false);
			}

			return MULTIPLIER_DEFAULT;
		}

		function maybeMultiplied(tokenizer, node) {
			var multiplier = readMultiplier(tokenizer);

			if (multiplier !== MULTIPLIER_DEFAULT) {
				return {
					type: 'Group',
					terms: [node],
					combinator: '|',  // `|` combinator is simplest in implementation (and therefore faster)
					disallowEmpty: false,
					multiplier: multiplier,
					explicit: false
				};
			}

			return node;
		}

		function readProperty(tokenizer) {
			var name;

			tokenizer.eat(LESSTHANSIGN);
			tokenizer.eat(APOSTROPHE);

			name = scanWord(tokenizer);

			tokenizer.eat(APOSTROPHE);
			tokenizer.eat(GREATERTHANSIGN);

			return maybeMultiplied(tokenizer, {
				type: 'Property',
				name: name
			});
		}

		function readType(tokenizer) {
			var name;

			tokenizer.eat(LESSTHANSIGN);
			name = scanWord(tokenizer);

			if (tokenizer.charCode() === LEFTPARENTHESIS &&
				tokenizer.nextCharCode() === RIGHTPARENTHESIS) {
				tokenizer.pos += 2;
				name += '()';
			}

			tokenizer.eat(GREATERTHANSIGN);

			return maybeMultiplied(tokenizer, {
				type: 'Type',
				name: name
			});
		}

		function readKeywordOrFunction(tokenizer) {
			var children = null;
			var name;

			name = scanWord(tokenizer);

			if (tokenizer.charCode() === LEFTPARENTHESIS) {
				tokenizer.pos++;
				children = readImplicitGroup(tokenizer);
				tokenizer.eat(RIGHTPARENTHESIS);

				return maybeMultiplied(tokenizer, {
					type: 'Function',
					name: name,
					children: children
				});
			}

			return maybeMultiplied(tokenizer, {
				type: 'Keyword',
				name: name
			});
		}

		function regroupTerms(terms, combinators) {
			function createGroup(terms, combinator) {
				return {
					type: 'Group',
					terms: terms,
					combinator: combinator,
					disallowEmpty: false,
					multiplier: MULTIPLIER_DEFAULT,
					explicit: false
				};
			}

			combinators = Object.keys(combinators).sort(function(a, b) {
				return COMBINATOR_PRECEDENCE[a] - COMBINATOR_PRECEDENCE[b];
			});

			while (combinators.length > 0) {
				var combinator = combinators.shift();
				for (var i = 0, subgroupStart = 0; i < terms.length; i++) {
					var term = terms[i];
					if (term.type === 'Combinator') {
						if (term.value === combinator) {
							if (subgroupStart === -1) {
								subgroupStart = i - 1;
							}
							terms.splice(i, 1);
							i--;
						} else {
							if (subgroupStart !== -1 && i - subgroupStart > 1) {
								terms.splice(
									subgroupStart,
									i - subgroupStart,
									createGroup(terms.slice(subgroupStart, i), combinator)
								);
								i = subgroupStart + 1;
							}
							subgroupStart = -1;
						}
					}
				}

				if (subgroupStart !== -1 && combinators.length) {
					terms.splice(
						subgroupStart,
						i - subgroupStart,
						createGroup(terms.slice(subgroupStart, i), combinator)
					);
				}
			}

			return combinator;
		}

		function readImplicitGroup(tokenizer) {
			var terms = [];
			var combinators = {};
			var token;
			var prevToken = null;
			var prevTokenPos = tokenizer.pos;

			while (token = peek(tokenizer)) {
				if (token.type !== 'Spaces') {
					if (token.type === 'Combinator') {
						// check for combinator in group beginning and double combinator sequence
						if (prevToken === null || prevToken.type === 'Combinator') {
							error(tokenizer, prevTokenPos, 'Unexpected combinator');
						}

						combinators[token.value] = true;
					} else if (prevToken !== null && prevToken.type !== 'Combinator') {
						combinators[' '] = true;  // a b
						terms.push({
							type: 'Combinator',
							value: ' '
						});
					}

					terms.push(token);
					prevToken = token;
					prevTokenPos = tokenizer.pos;
				}
			}

			// check for combinator in group ending
			if (prevToken !== null && prevToken.type === 'Combinator') {
				error(tokenizer, tokenizer.pos - prevTokenPos, 'Unexpected combinator');
			}

			return {
				type: 'Group',
				terms: terms,
				combinator: regroupTerms(terms, combinators) || ' ',
				disallowEmpty: false,
				multiplier: MULTIPLIER_DEFAULT,
				explicit: false
			};
		}

		function readGroup(tokenizer) {
			var result;

			tokenizer.eat(LEFTSQUAREBRACKET);
			result = readImplicitGroup(tokenizer);
			tokenizer.eat(RIGHTSQUAREBRACKET);

			result.explicit = true;
			result.multiplier = readMultiplier(tokenizer);

			if (tokenizer.charCode() === EXCLAMATIONMARK) {
				tokenizer.pos++;
				result.disallowEmpty = true;
			}

			return result;
		}

		function peek(tokenizer) {
			var code = tokenizer.charCode();

			if (code < 128 && NAME_CHAR[code] === 1) {
				return readKeywordOrFunction(tokenizer);
			}

			switch (code) {
				case LEFTSQUAREBRACKET:
					return readGroup(tokenizer);

				case LESSTHANSIGN:
					if (tokenizer.nextCharCode() === APOSTROPHE) {
						return readProperty(tokenizer);
					} else {
						return readType(tokenizer);
					}

				case VERTICALLINE:
					return {
						type: 'Combinator',
						value: tokenizer.substringToPos(tokenizer.nextCharCode() === VERTICALLINE ? tokenizer.pos + 2 : tokenizer.pos + 1)
					};

				case AMPERSAND:
					tokenizer.pos++;
					tokenizer.eat(AMPERSAND);
					return {
						type: 'Combinator',
						value: '&&'
					};

				case COMMA:
					tokenizer.pos++;
					return {
						type: 'Comma',
						value: ','
					};

				case SOLIDUS:
					tokenizer.pos++;
					return {
						type: 'Slash',
						value: '/'
					};

				case PERCENTSIGN:  // looks like exception, needs for attr()'s <type-or-unit>
					tokenizer.pos++;
					return {
						type: 'Percent',
						value: '%'
					};

				case LEFTPARENTHESIS:
					tokenizer.pos++;
					var children = readImplicitGroup(tokenizer);
					tokenizer.eat(RIGHTPARENTHESIS);

					return {
						type: 'Parentheses',
						children: children
					};

				case APOSTROPHE:
					return {
						type: 'String',
						value: scanString(tokenizer)
					};

				case SPACE:
				case TAB:
				case N:
				case R:
				case F:
					return {
						type: 'Spaces',
						value: scanSpaces(tokenizer)
					};
			}
		}

		function error(tokenizer, pos, msg) {
			throw new SyntaxParseError(msg || 'Unexpected input', tokenizer.str, pos);
		}

		function parse(str) {
			var tokenizer = new Tokenizer(str);
			var result = readImplicitGroup(tokenizer);

			if (tokenizer.pos !== str.length) {
				error(tokenizer, tokenizer.pos);
			}

			// reduce redundant groups with single group term
			if (result.terms.length === 1 && result.terms[0].type === 'Group') {
				result = result.terms[0];
			}

			return result;
		}

		// warm up parse to elimitate code branches that never execute
		// fix soft deoptimizations (insufficient type feedback)
		parse('[a&&<b>#|<\'c\'>*||e(){2,} f{2} /,(% g#{1,2})]!');

		return parse;
	};
	//#endregion

	//#region URL: /css-tree/lexer/grammar/translate
	modules['/css-tree/lexer/grammar/translate'] = function () {
		'use strict';

		function isNodeType(node, type) {
			return node && node.type === type;
		}

		function serializeMultiplier(multiplier) {
			if (multiplier.min === 0 && multiplier.max === 0) {
				return '*';
			}

			if (multiplier.min === 0 && multiplier.max === 1) {
				return '?';
			}

			if (multiplier.min === 1 && multiplier.max === 0) {
				return multiplier.comma ? '#' : '+';
			}

			if (multiplier.min === 1 && multiplier.max === 1) {
				return '';
			}

			return (
				(multiplier.comma ? '#' : '') +
				'{' + multiplier.min + (multiplier.min !== multiplier.max ? ',' + (multiplier.max !== 0 ? multiplier.max : '') : '') + '}'
			);
		}

		function translateSequence(node, forceBraces, decorate) {
			var result = '';

			if (node.explicit || forceBraces) {
				result += '[' + (!isNodeType(node.terms[0], 'Comma') ? ' ' : '');
			}

			result += node.terms.map(function(term) {
				return translate(term, forceBraces, decorate);
			}).join(node.combinator === ' ' ? ' ' : ' ' + node.combinator + ' ');

			if (node.explicit || forceBraces) {
				result += ' ]';
			}

			return result;
		}

		function translateParentheses(group, forceBraces, decorate) {
			if (!group.terms.length) {
				return '()';
			}

			return '( ' + translateSequence(group, forceBraces, decorate) + ' )';
		}

		function translate(node, forceBraces, decorate) {
			if (Array.isArray(node)) {
				return node.map(function(item) {
					return translate(item, forceBraces, decorate);
				}).join('');
			}

			var result;

			switch (node.type) {
				case 'Group':
					result =
						translateSequence(node, forceBraces, decorate) +
						(node.disallowEmpty ? '!' : '') +
						serializeMultiplier(node.multiplier);
					break;

				case 'Keyword':
					result = node.name;
					break;

				case 'Function':
					result = node.name + translateParentheses(node.children, forceBraces, decorate);
					break;

				case 'Parentheses': // replace for seq('(' seq(...node.children) ')')
					result = translateParentheses(node.children, forceBraces, decorate);
					break;

				case 'Type':
					result = '<' + node.name + '>';
					break;

				case 'Property':
					result = '<\'' + node.name + '\'>';
					break;

				case 'Combinator': // remove?
				case 'Slash':      // replace for String? '/'
				case 'Percent':    // replace for String? '%'
				case 'String':
				case 'Comma':
					result = node.value;
					break;

				default:
					throw new Error('Unknown node type: ' + node.type);
			}

			if (typeof decorate === 'function') {
				result = decorate(result, node);
			}

			return result;
		}

		return translate;
	};
	//#endregion

	//#region URL: /css-tree/lexer/grammar/walk
	modules['/css-tree/lexer/grammar/walk'] = function () {
		'use strict';

		var exports = function walk(node, fn, context) {
			switch (node.type) {
				case 'Group':
					node.terms.forEach(function(term) {
						walk(term, fn, context);
					});
					break;

				case 'Function':
				case 'Parentheses':
					walk(node.children, fn, context);
					break;

				case 'Keyword':
				case 'Type':
				case 'Property':
				case 'Combinator':
				case 'Comma':
				case 'Slash':
				case 'String':
				case 'Percent':
					break;

				default:
					throw new Error('Unknown type: ' + node.type);
			}

			fn.call(context, node);
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/lexer/error
	modules['/css-tree/lexer/error'] = function () {
		'use strict';

		var translateGrammar = require('/css-tree/lexer/grammar/translate');

		function getLocation(node, point) {
			var loc = node && node.loc && node.loc[point];

			return loc
				? { offset: loc.offset,
					line: loc.line,
					column: loc.column }
				: null;
		}

		var SyntaxReferenceError = function(type, referenceName) {
			// some VMs prevent setting line/column otherwise (iOS Safari 10 even throw an exception)
			var error = Object.create(SyntaxError.prototype);

			error.name = 'SyntaxReferenceError';
			error.reference = referenceName;
			error.message = type + ' `' + referenceName + '`';
			error.stack = (new Error().stack || '').replace(/^.+\n/, error.name + ': ' + error.message + '\n');

			return error;
		};

		var MatchError = function(message, lexer, syntax, value, badNode) {
			// some VMs prevent setting line/column otherwise (iOS Safari 10 even throw an exception)
			var error = Object.create(SyntaxError.prototype);
			var errorOffset = -1;
			var start = getLocation(badNode, 'start');
			var end = getLocation(badNode, 'end');
			var css = lexer.syntax.translateMarkup(value, function(node, buffer) {
				if (node === badNode) {
					errorOffset = buffer.length;
				}
			});

			if (errorOffset === -1) {
				errorOffset = css.length;
			}

			error.name = 'SyntaxMatchError';
			error.rawMessage = message;
			error.stack = (new Error().stack || '').replace(/^.+\n/, error.name + ': ' + message + '\n');
			error.syntax = syntax ? translateGrammar(syntax) : '<generic>';
			error.css = css;
			error.mismatchOffset = errorOffset;
			error.loc = {
				source: badNode && badNode.loc && badNode.loc.source || '<unknown>',
				start: start,
				end: end
			};
			error.line = start ? start.line : undefined;
			error.column = start ? start.column : undefined;
			error.offset = start ? start.offset : undefined;
			error.message = message + '\n' +
				'  syntax: ' + error.syntax + '\n' +
				'   value: ' + (error.css || '<empty string>') + '\n' +
				'  --------' + new Array(error.mismatchOffset + 1).join('-') + '^';

			return error;
		};

		var exports = {
			SyntaxReferenceError: SyntaxReferenceError,
			MatchError: MatchError
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/lexer/generic
	modules['/css-tree/lexer/generic'] = function () {
		'use strict';

		var names = require('/css-tree/utils/names');

		// https://www.w3.org/TR/css-values-3/#lengths
		var LENGTH = {
			// absolute length units
			'px': true,
			'mm': true,
			'cm': true,
			'in': true,
			'pt': true,
			'pc': true,
			'q': true,

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

		var ANGLE = {
			'deg': true,
			'grad': true,
			'rad': true,
			'turn': true
		};

		var TIME = {
			's': true,
			'ms': true
		};

		var FREQUENCY = {
			'hz': true,
			'khz': true
		};

		// https://www.w3.org/TR/css-values-3/#resolution (https://drafts.csswg.org/css-values/#resolution)
		var RESOLUTION = {
			'dpi': true,
			'dpcm': true,
			'dppx': true,
			'x': true      // https://github.com/w3c/csswg-drafts/issues/461
		};

		// https://drafts.csswg.org/css-grid/#fr-unit
		var FLEX = {
			'fr': true
		};

		// https://www.w3.org/TR/css3-speech/#mixing-props-voice-volume
		var DECIBEL = {
			'db': true
		};

		// https://www.w3.org/TR/css3-speech/#voice-props-voice-pitch
		var SEMITONES = {
			'st': true
		};

		// can be used wherever <length>, <frequency>, <angle>, <time>, <percentage>, <number>, or <integer> values are allowed
		// https://drafts.csswg.org/css-values/#calc-notation
		function isCalc(node) {
			if (node.data.type !== 'Function') {
				return false;
			}

			var keyword = names.keyword(node.data.name);

			if (keyword.name !== 'calc') {
				return false;
			}

			// there were some prefixed implementations
			return keyword.vendor === '' ||
				   keyword.vendor === '-moz-' ||
				   keyword.vendor === '-webkit-';
		}

		function astNode(type) {
			return function(node) {
				return node.data.type === type;
			};
		}

		function dimension(type) {
			return function(node) {
				return isCalc(node) ||
					   (node.data.type === 'Dimension' && type.hasOwnProperty(node.data.unit.toLowerCase()));
			};
		}

		function zeroUnitlessDimension(type) {
			return function(node) {
				return isCalc(node) ||
					   (node.data.type === 'Dimension' && type.hasOwnProperty(node.data.unit.toLowerCase())) ||
					   (node.data.type === 'Number' && Number(node.data.value) === 0);
			};
		}

		function attr(node) {
			return node.data.type === 'Function' && node.data.name.toLowerCase() === 'attr';
		}

		function number(node) {
			return isCalc(node) || node.data.type === 'Number';
		}

		function numberZeroOne(node) {
			if (isCalc(node) || node.data.type === 'Number') {
				var value = Number(node.data.value);

				return value >= 0 && value <= 1;
			}

			return false;
		}

		function numberOneOrGreater(node) {
			if (isCalc(node) || node.data.type === 'Number') {
				return Number(node.data.value) >= 1;
			}

			return false;
		}

		// TODO: fail on 10e-2
		function integer(node) {
			return isCalc(node) ||
				   (node.data.type === 'Number' && node.data.value.indexOf('.') === -1);
		}

		// TODO: fail on 10e-2
		function positiveInteger(node) {
			return isCalc(node) ||
				   (node.data.type === 'Number' && node.data.value.indexOf('.') === -1 && node.data.value.charAt(0) !== '-');
		}

		function percentage(node) {
			return isCalc(node) ||
				   node.data.type === 'Percentage';
		}

		function hexColor(node) {
			if (node.data.type !== 'HexColor') {
				return false;
			}

			var hex = node.data.value;

			return /^[0-9a-fA-F]{3,8}$/.test(hex) &&
				   (hex.length === 3 || hex.length === 4 || hex.length === 6 || hex.length === 8);
		}

		function expression(node) {
			return node.data.type === 'Function' && node.data.name.toLowerCase() === 'expression';
		}

		// https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
		// https://drafts.csswg.org/css-values-4/#identifier-value
		function customIdent(node) {
			if (node.data.type !== 'Identifier') {
				return false;
			}

			var name = node.data.name.toLowerCase();

			// ยง 3.2. Author-defined Identifiers: the <custom-ident> type
			// The CSS-wide keywords are not valid <custom-ident>s
			if (name === 'unset' || name === 'initial' || name === 'inherit') {
				return false;
			}

			// The default keyword is reserved and is also not a valid <custom-ident>
			if (name === 'default') {
				return false;
			}

			// TODO: ignore property specific keywords (as described https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident)

			return true;
		}

		var exports = {
			'angle': zeroUnitlessDimension(ANGLE),
			'attr()': attr,
			'custom-ident': customIdent,
			'decibel': dimension(DECIBEL),
			'dimension': astNode('Dimension'),
			'frequency': dimension(FREQUENCY),
			'flex': dimension(FLEX),
			'hex-color': hexColor,
			'id-selector': astNode('IdSelector'), // element( <id-selector> )
			'ident': astNode('Identifier'),
			'integer': integer,
			'length': zeroUnitlessDimension(LENGTH),
			'number': number,
			'number-zero-one': numberZeroOne,
			'number-one-or-greater': numberOneOrGreater,
			'percentage': percentage,
			'positive-integer': positiveInteger,
			'resolution': dimension(RESOLUTION),
			'semitones': dimension(SEMITONES),
			'string': astNode('String'),
			'time': dimension(TIME),
			'unicode-range': astNode('UnicodeRange'),
			'url': astNode('Url'),

			// old IE stuff
			'progid': astNode('Raw'),
			'expression': expression
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/lexer/Lexer
	modules['/css-tree/lexer/Lexer'] = function () {
		'use strict';

		var SyntaxReferenceError = require('/css-tree/lexer/error').SyntaxReferenceError;
		var MatchError = require('/css-tree/lexer/error').MatchError;
		var names = require('/css-tree/utils/names');
		var generic = require('/css-tree/lexer/generic');
		var parse = require('/css-tree/lexer/grammar/parse');
		var translate = require('/css-tree/lexer/grammar/translate');
		var walk = require('/css-tree/lexer/grammar/walk');
		var match = require('/css-tree/lexer/match');
		var trace = require('/css-tree/lexer/trace');
		var search = require('/css-tree/lexer/search');
		var getStructureFromConfig = require('/css-tree/lexer/structure').getStructureFromConfig;
		var cssWideKeywords = parse('inherit | initial | unset');
		var cssWideKeywordsWithExpression = parse('inherit | initial | unset | <expression>');

		function dumpMapSyntax(map, syntaxAsAst) {
			var result = {};

			for (var name in map) {
				if (map[name].syntax) {
					result[name] = syntaxAsAst ? map[name].syntax : translate(map[name].syntax);
				}
			}

			return result;
		}

		function unwrapNode(item) {
			return item && item.data;
		}

		function valueHasVar(value) {
			var hasVar = false;

			this.syntax.walk(value, function(node) {
				if (node.type === 'Function' && node.name.toLowerCase() === 'var') {
					hasVar = true;
				}
			});

			return hasVar;
		}

		// check node is \0 or \9 hack
		function isHack(node) {
			return node.type === 'Identifier' && /^\\[09]/.test(node.name);
		}

		// white spaces, comments and some hacks can to be ignored at the end of value
		function isNextMayToBeIgnored(cursor) {
			while (cursor !== null) {
				if (cursor.data.type !== 'WhiteSpace' &&
					cursor.data.type !== 'Comment' &&
					!isHack(cursor.data)) {
					return false;
				}

				cursor = cursor.next;
			}

			return true;
		}

		function buildMatchResult(match, error) {
			return {
				matched: match,
				error: error,
				getTrace: trace.getTrace,
				isType: trace.isType,
				isProperty: trace.isProperty,
				isKeyword: trace.isKeyword
			};
		}

		function matchSyntax(lexer, syntax, value) {
			var result;

			if (!value || value.type !== 'Value') {
				return buildMatchResult(null, new Error('Not a Value node'));
			}

			if (valueHasVar.call(lexer, value)) {
				return buildMatchResult(null, new Error('Matching for a value with var() is not supported'));
			}

			result = match(lexer, lexer.valueCommonSyntax, value.children.head);

			if (!result.match) {
				result = syntax.match(value.children.head);
				if (!result.match) {
					return buildMatchResult(null, new MatchError('Mismatch', lexer, syntax.syntax, value, result.badNode || unwrapNode(result.next)));
				}
			}

			// enhance top-level match wrapper
			if (result.match.type === 'ASTNode') {
				result.match = {
					syntax: {
						type: syntax.type,
						name: syntax.name
					},
					match: [result.match]
				};
			} else if (result.match.syntax.type === 'Group') {
				result.match.syntax = {
					type: syntax.type,
					name: syntax.name
				};
			}

			if (result.next && !isNextMayToBeIgnored(result.next)) {
				return buildMatchResult(null, new MatchError('Uncomplete match', lexer, syntax.syntax, value, result.badNode || unwrapNode(result.next)));
			}

			return buildMatchResult(result.match, null);
		}

		var Lexer = function(config, syntax, structure) {
			this.valueCommonSyntax = cssWideKeywords;
			this.syntax = syntax;
			this.generic = false;
			this.properties = {};
			this.types = {};
			this.structure = structure || getStructureFromConfig(config);

			if (config) {
				if (config.generic) {
					this.generic = true;
					for (var name in generic) {
						this.addType_(name, generic[name]);
					}
				}

				if (config.types) {
					for (var name in config.types) {
						this.addType_(name, config.types[name]);
					}
				}

				if (config.properties) {
					for (var name in config.properties) {
						this.addProperty_(name, config.properties[name]);
					}
				}
			}
		};

		Lexer.prototype = {
			structure: {},
			checkStructure: function(ast) {
				var structure = this.structure;
				var warns = [];

				this.syntax.walk(ast, function(node) {
					if (structure.hasOwnProperty(node.type)) {
						structure[node.type].check(node, warns.push.bind(warns));
					} else {
						throw new Error('Unknown node type: ' + node.type);
					}
				});

				return warns.length ? warns : false;
			},

			createDescriptor: function(syntax, type, name) {
				var self = this;
				var descriptor = {
					type: type,
					name: name,
					syntax: null,
					match: null
				};

				if (typeof syntax === 'function') {
					// convert syntax to pseudo syntax node
					// NOTE: that's not a part of match result tree
					syntax = {
						type: 'ASTNode',
						match: syntax
					};

					descriptor.match = function(item) {
						return match(self, syntax, item);
					};
				} else {
					if (typeof syntax === 'string') {
						// lazy parsing on first access
						Object.defineProperty(descriptor, 'syntax', {
							get: function() {
								Object.defineProperty(descriptor, 'syntax', {
									value: parse(syntax)
								});

								return descriptor.syntax;
							}
						});
					} else {
						descriptor.syntax = syntax;
					}

					descriptor.match = function(item) {
						return match(self, descriptor.syntax, item);
					};
				}

				return descriptor;
			},
			addProperty_: function(name, syntax) {
				this.properties[name] = this.createDescriptor(syntax, 'Property', name);
			},
			addType_: function(name, syntax) {
				this.types[name] = this.createDescriptor(syntax, 'Type', name);

				if (syntax === generic.expression) {
					this.valueCommonSyntax = cssWideKeywordsWithExpression;
				}
			},

			matchDeclaration: function(node) {
				if (node.type !== 'Declaration') {
					return buildMatchResult(null, new Error('Not a Declaration node'));
				}

				return this.matchProperty(node.property, node.value);
			},
			matchProperty: function(propertyName, value) {
				var property = names.property(propertyName);

				// don't match syntax for a custom property
				if (property.custom) {
					return buildMatchResult(null, new Error('Lexer matching doesn\'t applicable for custom properties'));
				}

				var propertySyntax = property.vendor
					? this.getProperty(property.vendor + property.name) || this.getProperty(property.name)
					: this.getProperty(property.name);

				if (!propertySyntax) {
					return buildMatchResult(null, new SyntaxReferenceError('Unknown property', propertyName));
				}

				return matchSyntax(this, propertySyntax, value);
			},
			matchType: function(typeName, value) {
				var typeSyntax = this.getType(typeName);

				if (!typeSyntax) {
					return buildMatchResult(null, new SyntaxReferenceError('Unknown type', typeName));
				}

				return matchSyntax(this, typeSyntax, value);
			},

			findValueFragments: function(propertyName, value, type, name) {
				return search.matchFragments(this, value, this.matchProperty(propertyName, value), type, name);
			},
			findDeclarationValueFragments: function(declaration, type, name) {
				return search.matchFragments(this, declaration.value, this.matchDeclaration(declaration), type, name);
			},
			findAllFragments: function(ast, type, name) {
				var result = [];

				this.syntax.walkDeclarations(ast, function(declaration) {
					result.push.apply(result, this.findDeclarationValueFragments(declaration, type, name));
				}.bind(this));

				return result;
			},

			getProperty: function(name) {
				return this.properties.hasOwnProperty(name) ? this.properties[name] : null;
			},
			getType: function(name) {
				return this.types.hasOwnProperty(name) ? this.types[name] : null;
			},

			validate: function() {
				function validate(syntax, name, broken, descriptor) {
					if (broken.hasOwnProperty(name)) {
						return broken[name];
					}

					broken[name] = false;
					if (descriptor.syntax !== null) {
						walk(descriptor.syntax, function(node) {
							if (node.type !== 'Type' && node.type !== 'Property') {
								return;
							}

							var map = node.type === 'Type' ? syntax.types : syntax.properties;
							var brokenMap = node.type === 'Type' ? brokenTypes : brokenProperties;

							if (!map.hasOwnProperty(node.name) || validate(syntax, node.name, brokenMap, map[node.name])) {
								broken[name] = true;
							}
						}, this);
					}
				}

				var brokenTypes = {};
				var brokenProperties = {};

				for (var key in this.types) {
					validate(this, key, brokenTypes, this.types[key]);
				}

				for (var key in this.properties) {
					validate(this, key, brokenProperties, this.properties[key]);
				}

				brokenTypes = Object.keys(brokenTypes).filter(function(name) {
					return brokenTypes[name];
				});
				brokenProperties = Object.keys(brokenProperties).filter(function(name) {
					return brokenProperties[name];
				});

				if (brokenTypes.length || brokenProperties.length) {
					return {
						types: brokenTypes,
						properties: brokenProperties
					};
				}

				return null;
			},
			dump: function(syntaxAsAst) {
				return {
					generic: this.generic,
					types: dumpMapSyntax(this.types, syntaxAsAst),
					properties: dumpMapSyntax(this.properties, syntaxAsAst)
				};
			},
			toString: function() {
				return JSON.stringify(this.dump());
			}
		};

		return Lexer;
	};
	//#endregion

	//#region URL: /css-tree/lexer/match
	modules['/css-tree/lexer/match'] = function () {
		'use strict';

		var names = require('/css-tree/utils/names');
		var MULTIPLIER_DEFAULT = {
			comma: false,
			min: 1,
			max: 1
		};

		function skipSpaces(node) {
			while (node !== null && (node.data.type === 'WhiteSpace' || node.data.type === 'Comment')) {
				node = node.next;
			}

			return node;
		}

		function putResult(buffer, match) {
			var type = match.type || match.syntax.type;

			// ignore groups
			if (type === 'Group') {
				buffer.push.apply(buffer, match.match);
			} else {
				buffer.push(match);
			}
		}

		function matchToJSON() {
			return {
				type: this.syntax.type,
				name: this.syntax.name,
				match: this.match,
				node: this.node
			};
		}

		function buildMatchNode(badNode, lastNode, next, match) {
			if (badNode) {
				return {
					badNode: badNode,
					lastNode: null,
					next: null,
					match: null
				};
			}

			return {
				badNode: null,
				lastNode: lastNode,
				next: next,
				match: match
			};
		}

		function matchGroup(lexer, syntaxNode, node) {
			var result = [];
			var buffer;
			var multiplier = syntaxNode.multiplier || MULTIPLIER_DEFAULT;
			var min = multiplier.min;
			var max = multiplier.max === 0 ? Infinity : multiplier.max;
			var lastCommaTermCount;
			var lastComma;
			var matchCount = 0;
			var lastNode = null;
			var badNode = null;

			mismatch:
			while (matchCount < max) {
				node = skipSpaces(node);
				buffer = [];

				switch (syntaxNode.combinator) {
					case '|':
						for (var i = 0; i < syntaxNode.terms.length; i++) {
							var term = syntaxNode.terms[i];
							var res = matchSyntax(lexer, term, node);

							if (res.match) {
								putResult(buffer, res.match);
								node = res.next;
								break;  // continue matching
							} else if (res.badNode) {
								badNode = res.badNode;
								break mismatch;
							} else if (res.lastNode) {
								lastNode = res.lastNode;
							}
						}

						if (buffer.length === 0) {
							break mismatch; // nothing found -> stop matching
						}

						break;

					case ' ':
						var beforeMatchNode = node;
						var lastMatchedTerm = null;
						var hasTailMatch = false;
						var commaMissed = false;

						for (var i = 0; i < syntaxNode.terms.length; i++) {
							var term = syntaxNode.terms[i];
							var res = matchSyntax(lexer, term, node);

							if (res.match) {
								if (term.type === 'Comma' && i !== 0 && !hasTailMatch) {
									// recover cursor to state before last match and stop matching
									lastNode = node && node.data;
									node = beforeMatchNode;
									break mismatch;
								}

								// non-empty match (res.next will refer to another node)
								if (res.next !== node) {
									// match should be preceded by a comma
									if (commaMissed) {
										lastNode = node && node.data;
										node = beforeMatchNode;
										break mismatch;
									}

									hasTailMatch = term.type !== 'Comma';
									lastMatchedTerm = term;
								}

								putResult(buffer, res.match);
								node = skipSpaces(res.next);
							} else if (res.badNode) {
								badNode = res.badNode;
								break mismatch;
							} else {
								if (res.lastNode) {
									lastNode = res.lastNode;
								}

								// it's ok when comma doesn't match when no matches yet
								// but only if comma is not first or last term
								if (term.type === 'Comma' && i !== 0 && i !== syntaxNode.terms.length - 1) {
									if (hasTailMatch) {
										commaMissed = true;
									}
									continue;
								}

								// recover cursor to state before last match and stop matching
								lastNode = res.lastNode || (node && node.data);
								node = beforeMatchNode;
								break mismatch;
							}
						}

						// don't allow empty match when [ ]!
						if (!lastMatchedTerm && syntaxNode.disallowEmpty) {
							// empty match but shouldn't
							// recover cursor to state before last match and stop matching
							lastNode = node && node.data;
							node = beforeMatchNode;
							break mismatch;
						}

						// don't allow comma at the end but only if last term isn't a comma
						if (lastMatchedTerm && lastMatchedTerm.type === 'Comma' && term.type !== 'Comma') {
							lastNode = node && node.data;
							node = beforeMatchNode;
							break mismatch;
						}

						break;

					case '&&':
						var beforeMatchNode = node;
						var lastMatchedTerm = null;
						var terms = syntaxNode.terms.slice();

						while (terms.length) {
							var wasMatch = false;
							var emptyMatched = 0;

							for (var i = 0; i < terms.length; i++) {
								var term = terms[i];
								var res = matchSyntax(lexer, term, node);

								if (res.match) {
									// non-empty match (res.next will refer to another node)
									if (res.next !== node) {
										lastMatchedTerm = term;
									} else {
										emptyMatched++;
										continue;
									}

									wasMatch = true;
									terms.splice(i--, 1);
									putResult(buffer, res.match);
									node = skipSpaces(res.next);
									break;
								} else if (res.badNode) {
									badNode = res.badNode;
									break mismatch;
								} else if (res.lastNode) {
									lastNode = res.lastNode;
								}
							}

							if (!wasMatch) {
								// terms left, but they all are optional
								if (emptyMatched === terms.length) {
									break;
								}

								// not ok
								lastNode = node && node.data;
								node = beforeMatchNode;
								break mismatch;
							}
						}

						if (!lastMatchedTerm && syntaxNode.disallowEmpty) { // don't allow empty match when [ ]!
							// empty match but shouldn't
							// recover cursor to state before last match and stop matching
							lastNode = node && node.data;
							node = beforeMatchNode;
							break mismatch;
						}

						break;

					case '||':
						var beforeMatchNode = node;
						var lastMatchedTerm = null;
						var terms = syntaxNode.terms.slice();

						while (terms.length) {
							var wasMatch = false;
							var emptyMatched = 0;

							for (var i = 0; i < terms.length; i++) {
								var term = terms[i];
								var res = matchSyntax(lexer, term, node);

								if (res.match) {
									// non-empty match (res.next will refer to another node)
									if (res.next !== node) {
										lastMatchedTerm = term;
									} else {
										emptyMatched++;
										continue;
									}

									wasMatch = true;
									terms.splice(i--, 1);
									putResult(buffer, res.match);
									node = skipSpaces(res.next);
									break;
								} else if (res.badNode) {
									badNode = res.badNode;
									break mismatch;
								} else if (res.lastNode) {
									lastNode = res.lastNode;
								}
							}

							if (!wasMatch) {
								break;
							}
						}

						// don't allow empty match
						if (!lastMatchedTerm && (emptyMatched !== terms.length || syntaxNode.disallowEmpty)) {
							// empty match but shouldn't
							// recover cursor to state before last match and stop matching
							lastNode = node && node.data;
							node = beforeMatchNode;
							break mismatch;
						}

						break;
				}

				// flush buffer
				result.push.apply(result, buffer);
				matchCount++;

				if (!node) {
					break;
				}

				if (multiplier.comma) {
					if (lastComma && lastCommaTermCount === result.length) {
						// nothing match after comma
						break mismatch;
					}

					node = skipSpaces(node);
					if (node !== null && node.data.type === 'Operator' && node.data.value === ',') {
						result.push({
							syntax: syntaxNode,
							match: [{
								type: 'ASTNode',
								node: node.data,
								childrenMatch: null
							}]
						});
						lastCommaTermCount = result.length;
						lastComma = node;
						node = node.next;
					} else {
						lastNode = node !== null ? node.data : null;
						break mismatch;
					}
				}
			}

			// console.log(syntaxNode.type, badNode, lastNode);

			if (lastComma && lastCommaTermCount === result.length) {
				// nothing match after comma
				node = lastComma;
				result.pop();
			}

			return buildMatchNode(badNode, lastNode, node, matchCount < min ? null : {
				syntax: syntaxNode,
				match: result,
				toJSON: matchToJSON
			});
		}

		function matchSyntax(lexer, syntaxNode, node) {
			var badNode = null;
			var lastNode = null;
			var match = null;

			switch (syntaxNode.type) {
				case 'Group':
					return matchGroup(lexer, syntaxNode, node);

				case 'Function':
					// expect a function node
					if (!node || node.data.type !== 'Function') {
						break;
					}

					var keyword = names.keyword(node.data.name);
					var name = syntaxNode.name.toLowerCase();

					// check function name with vendor consideration
					if (name !== keyword.vendor + keyword.name) {
						break;
					}

					var res = matchSyntax(lexer, syntaxNode.children, node.data.children.head);
					if (!res.match || res.next) {
						badNode = res.badNode || res.lastNode || (res.next ? res.next.data : null) || node.data;
						break;
					}

					match = [{
						type: 'ASTNode',
						node: node.data,
						childrenMatch: res.match.match
					}];

					// Use node.next instead of res.next here since syntax is matching
					// for internal list and it should be completelly matched (res.next is null at this point).
					// Therefore function is matched and we are going to next node
					node = node.next;
					break;

				case 'Parentheses':
					if (!node || node.data.type !== 'Parentheses') {
						break;
					}

					var res = matchSyntax(lexer, syntaxNode.children, node.data.children.head);
					if (!res.match || res.next) {
						badNode = res.badNode || res.lastNode || (res.next ? res.next.data : null) || node.data;  // TODO: case when res.next === null
						break;
					}

					match = [{
						type: 'ASTNode',
						node: node.data,
						childrenMatch: res.match.match
					}];

					node = res.next;
					break;

				case 'Type':
					var typeSyntax = lexer.getType(syntaxNode.name);
					if (!typeSyntax) {
						throw new Error('Unknown syntax type `' + syntaxNode.name + '`');
					}

					var res = typeSyntax.match(node);
					if (!res.match) {
						badNode = res && res.badNode; // TODO: case when res.next === null
						lastNode = (res && res.lastNode) || (node && node.data);
						break;
					}

					node = res.next;
					putResult(match = [], res.match);
					if (match.length === 0) {
						match = null;
					}
					break;

				case 'Property':
					var propertySyntax = lexer.getProperty(syntaxNode.name);
					if (!propertySyntax) {
						throw new Error('Unknown property `' + syntaxNode.name + '`');
					}

					var res = propertySyntax.match(node);
					if (!res.match) {
						badNode = res && res.badNode; // TODO: case when res.next === null
						lastNode = (res && res.lastNode) || (node && node.data);
						break;
					}

					node = res.next;
					putResult(match = [], res.match);
					if (match.length === 0) {
						match = null;
					}
					break;

				case 'Keyword':
					if (!node) {
						break;
					}

					if (node.data.type === 'Identifier') {
						var keyword = names.keyword(node.data.name);
						var keywordName = keyword.name;
						var name = syntaxNode.name.toLowerCase();

						// drop \0 and \9 hack from keyword name
						if (keywordName.indexOf('\\') !== -1) {
							keywordName = keywordName.replace(/\\[09].*$/, '');
						}

						if (name !== keyword.vendor + keywordName) {
							break;
						}
					} else {
						// keyword may to be a number (e.g. font-weight: 400 )
						if (node.data.type !== 'Number' || node.data.value !== syntaxNode.name) {
							break;
						}
					}

					match = [{
						type: 'ASTNode',
						node: node.data,
						childrenMatch: null
					}];
					node = node.next;
					break;

				case 'Slash':
				case 'Comma':
					if (!node || node.data.type !== 'Operator' || node.data.value !== syntaxNode.value) {
						break;
					}

					match = [{
						type: 'ASTNode',
						node: node.data,
						childrenMatch: null
					}];
					node = node.next;
					break;

				case 'String':
					if (!node || node.data.type !== 'String') {
						break;
					}

					match = [{
						type: 'ASTNode',
						node: node.data,
						childrenMatch: null
					}];
					node = node.next;
					break;

				case 'ASTNode':
					if (node && syntaxNode.match(node)) {
						match = {
							type: 'ASTNode',
							node: node.data,
							childrenMatch: null
						};
						node = node.next;
					}
					return buildMatchNode(badNode, lastNode, node, match);

				default:
					throw new Error('Not implemented yet node type: ' + syntaxNode.type);
			}

			return buildMatchNode(badNode, lastNode, node, match === null ? null : {
				syntax: syntaxNode,
				match: match,
				toJSON: matchToJSON
			});

		};

		return matchSyntax;
	};
	//#endregion

	//#region URL: /css-tree/lexer/search
	modules['/css-tree/lexer/search'] = function () {
		var List = require('/css-tree/utils/list');

		function getFirstMatchNode(matchNode) {
			if (matchNode.type === 'ASTNode') {
				return matchNode.node;
			}

			if (matchNode.match.length !== 0) {
				return getFirstMatchNode(matchNode.match[0]);
			}

			return null;
		}

		function getLastMatchNode(matchNode) {
			if (matchNode.type === 'ASTNode') {
				return matchNode.node;
			}

			if (matchNode.match.length !== 0) {
				return getLastMatchNode(matchNode.match[matchNode.match.length - 1]);
			}

			return null;
		}

		function matchFragments(lexer, ast, match, type, name) {
			function findFragments(matchNode) {
				if (matchNode.type === 'ASTNode') {
					return;
				}

				if (matchNode.syntax.type === type &&
					matchNode.syntax.name === name) {
					var start = getFirstMatchNode(matchNode);
					var end = getLastMatchNode(matchNode);

					lexer.syntax.walk(ast, function(node, item, list) {
						if (node === start) {
							var nodes = new List();
							var loc = null;

							do {
								nodes.appendData(item.data);

								if (item.data === end) {
									break;
								}

								item = item.next;
							} while (item !== null);

							if (start.loc !== null && end.loc !== null) {
								loc = {
									source: start.loc.source,
									start: start.loc.start,
									end: end.loc.end
								};
							}

							fragments.push({
								parent: list,
								loc: loc,
								nodes: nodes
							});
						}
					});
				}

				matchNode.match.forEach(findFragments);
			}

			var fragments = [];

			if (match.matched !== null) {
				findFragments(match.matched);
			}

			return fragments;
		}

		var exports = {
			matchFragments: matchFragments
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/lexer/structure
	modules['/css-tree/lexer/structure'] = function () {
		var List = require('/css-tree/utils/list');

		function isValidNumber(value) {
			// Number.isInteger(value) && value >= 0
			return (
				typeof value === 'number' &&
				isFinite(value) &&
				Math.floor(value) === value &&
				value >= 0
			);
		}

		function isValidLocation(loc) {
			return (
				Boolean(loc) &&
				isValidNumber(loc.offset) &&
				isValidNumber(loc.line) &&
				isValidNumber(loc.column)
			);
		}

		function createNodeStructureChecker(type, fields) {
			return function checkNode(node, warn) {
				if (!node || node.constructor !== Object) {
					return warn('Type of node should be an object');
				}

				for (var key in node) {
					if (key === 'type') {
						if (node.type !== type) {
							warn('Wrong node type `' + node.type + '` but expected `' + type + '`');
						}
					} else if (key === 'loc') {
						if (node.loc === null) {
							continue;
						} else if (node.loc && node.loc.constructor === Object) {
							if (typeof node.loc.source === 'string' &&
								isValidLocation(node.loc.start) &&
								isValidLocation(node.loc.end)) {
								continue;
							}
						}
						warn('Wrong value for `' + type + '.' + key + '` field');
					} else if (fields.hasOwnProperty(key)) {
						for (var i = 0, valid = false; !valid && i < fields[key].length; i++) {
							var fieldType = fields[key][i];

							switch (fieldType) {
								case String:
									valid = typeof node[key] === 'string';
									break;

								case Boolean:
									valid = typeof node[key] === 'boolean';
									break;

								case null:
									valid = node[key] === null;
									break;

								default:
									if (typeof fieldType === 'string') {
										valid = node[key] && node[key].type === fieldType;
									} else if (Array.isArray(fieldType)) {
										valid = node[key] instanceof List;
									}
							}
						}
						if (!valid) {
							warn('Wrong value for `' + type + '.' + key + '` field');
						}
					} else {
						warn('Unknown field `' + key + '` for ' + type);
					}
				}

				for (var key in fields) {
					if (hasOwnProperty.call(node, key) === false) {
						warn('Field `' + type + '.' + key + '` is missed');
					}
				}
			};
		}

		function processStructure(name, nodeType) {
			var structure = nodeType.structure;
			var fields = {
				type: String,
				loc: true
			};
			var docs = {
				type: '"' + name + '"'
			};

			for (var key in structure) {
				var docsTypes = [];
				var fieldTypes = fields[key] = Array.isArray(structure[key])
					? structure[key].slice()
					: [structure[key]];

				for (var i = 0; i < fieldTypes.length; i++) {
					var fieldType = fieldTypes[i];
					if (fieldType === String || fieldType === Boolean) {
						docsTypes.push(fieldType.name);
					} else if (fieldType === null) {
						docsTypes.push('null');
					} else if (typeof fieldType === 'string') {
						docsTypes.push('<' + fieldType + '>');
					} else if (Array.isArray(fieldType)) {
						docsTypes.push('List'); // TODO: use type enum
					} else {
						throw new Error('Wrong value in `' + name + '` structure definition');
					}
				}

				docs[key] = docsTypes.join(' | ');
			}

			return {
				docs: docs,
				check: createNodeStructureChecker(name, fields)
			};
		}

		var exports = {
			getStructureFromConfig: function(config) {
				var structure = {};

				if (config.node) {
					for (var name in config.node) {
						var nodeType = config.node[name];

						if (nodeType.structure) {
							structure[name] = processStructure(name, nodeType);
						} else {
							throw new Error('Missed `structure` field in `' + name + '` node type definition');
						}
					}
				}

				return structure;
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/lexer/trace
	modules['/css-tree/lexer/trace'] = function () {
		function getTrace(node) {
			function hasMatch(matchNode) {
				if (matchNode.type === 'ASTNode') {
					if (matchNode.node === node) {
						result = [];
						return true;
					}

					if (matchNode.childrenMatch) {
						// use for-loop for better perfomance
						for (var i = 0; i < matchNode.childrenMatch.length; i++) {
							if (hasMatch(matchNode.childrenMatch[i])) {
								return true;
							}
						}
					}
				} else {
					// use for-loop for better perfomance
					for (var i = 0; i < matchNode.match.length; i++) {
						if (hasMatch(matchNode.match[i])) {
							if (matchNode.syntax.type === 'Type' ||
								matchNode.syntax.type === 'Property' ||
								matchNode.syntax.type === 'Keyword') {
								result.unshift(matchNode.syntax);
							}
							return true;
						}
					}
				}

				return false;
			}

			var result = null;

			if (this.matched !== null) {
				hasMatch(this.matched);
			}

			return result;
		}

		function testNode(match, node, fn) {
			var trace = getTrace.call(match, node);

			if (trace === null) {
				return false;
			}

			return trace.some(fn);
		}

		function isType(node, type) {
			return testNode(this, node, function(matchNode) {
				return matchNode.type === 'Type' && matchNode.name === type;
			});
		}

		function isProperty(node, property) {
			return testNode(this, node, function(matchNode) {
				return matchNode.type === 'Property' && matchNode.name === property;
			});
		}

		function isKeyword(node) {
			return testNode(this, node, function(matchNode) {
				return matchNode.type === 'Keyword';
			});
		}

		var exports = {
			getTrace: getTrace,
			isType: isType,
			isProperty: isProperty,
			isKeyword: isKeyword
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/parser
	modules['/css-tree/parser'] = function () {
		var createParser = require('/css-tree/parser/create');
		var config = require('/css-tree/syntax/config/parser');

		var exports = createParser(config);

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/parser/create
	modules['/css-tree/parser/create'] = function () {
		'use strict';

		var Tokenizer = require('/css-tree/tokenizer');
		var sequence = require('/css-tree/parser/sequence');
		var noop = function() {};

		function createParseContext(name) {
			return function() {
				return this[name]();
			};
		}

		function processConfig(config) {
			var parserConfig = {
				context: {},
				scope: {},
				atrule: {},
				pseudo: {}
			};

			if (config.parseContext) {
				for (var name in config.parseContext) {
					switch (typeof config.parseContext[name]) {
						case 'function':
							parserConfig.context[name] = config.parseContext[name];
							break;

						case 'string':
							parserConfig.context[name] = createParseContext(config.parseContext[name]);
							break;
					}
				}
			}

			if (config.scope) {
				for (var name in config.scope) {
					parserConfig.scope[name] = config.scope[name];
				}
			}

			if (config.atrule) {
				for (var name in config.atrule) {
					var atrule = config.atrule[name];

					if (atrule.parse) {
						parserConfig.atrule[name] = atrule.parse;
					}
				}
			}

			if (config.pseudo) {
				for (var name in config.pseudo) {
					var pseudo = config.pseudo[name];

					if (pseudo.parse) {
						parserConfig.pseudo[name] = pseudo.parse;
					}
				}
			}

			if (config.node) {
				for (var name in config.node) {
					parserConfig[name] = config.node[name].parse;
				}
			}

			return parserConfig;
		}

		var exports = function createParser(config) {
			var parser = {
				scanner: new Tokenizer(),
				filename: '<unknown>',
				needPositions: false,
				tolerant: false,
				onParseError: noop,
				parseAtrulePrelude: true,
				parseSelector: true,
				parseValue: true,
				parseCustomProperty: false,

				readSequence: sequence,

				tolerantParse: function(consumer, fallback) {
					if (this.tolerant) {
						var start = this.scanner.currentToken;

						try {
							return consumer.call(this);
						} catch (e) {
							this.onParseError(e);
							return fallback.call(this, start);
						}
					} else {
						return consumer.call(this);
					}
				},

				getLocation: function(start, end) {
					if (this.needPositions) {
						return this.scanner.getLocationRange(
							start,
							end,
							this.filename
						);
					}

					return null;
				},
				getLocationFromList: function(list) {
					if (this.needPositions) {
						return this.scanner.getLocationRange(
							list.head !== null ? list.first().loc.start.offset - this.scanner.startOffset : this.scanner.tokenStart,
							list.head !== null ? list.last().loc.end.offset - this.scanner.startOffset : this.scanner.tokenStart,
							this.filename
						);
					}

					return null;
				}
			};

			config = processConfig(config || {});
			for (var key in config) {
				parser[key] = config[key];
			}

			return function(source, options) {
				options = options || {};

				var context = options.context || 'default';
				var ast;

				parser.scanner.setSource(source, options.offset, options.line, options.column);
				parser.filename = options.filename || '<unknown>';
				parser.needPositions = Boolean(options.positions);
				parser.tolerant = Boolean(options.tolerant);
				parser.onParseError = typeof options.onParseError === 'function' ? options.onParseError : noop;
				parser.parseAtrulePrelude = 'parseAtrulePrelude' in options ? Boolean(options.parseAtrulePrelude) : true;
				parser.parseSelector = 'parseSelector' in options ? Boolean(options.parseSelector) : true;
				parser.parseValue = 'parseValue' in options ? Boolean(options.parseValue) : true;
				parser.parseCustomProperty = 'parseCustomProperty' in options ? Boolean(options.parseCustomProperty) : false;

				if (!parser.context.hasOwnProperty(context)) {
					throw new Error('Unknown context `' + context + '`');
				}

				ast = parser.context[context].call(parser, options);

				if (!parser.scanner.eof) {
					parser.scanner.error();
				}

				// console.log(JSON.stringify(ast, null, 4));
				return ast;
			};
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/parser/sequence
	modules['/css-tree/parser/sequence'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;
		var WHITESPACE = TYPE.WhiteSpace;
		var COMMENT = TYPE.Comment;

		var exports = function readSequence(recognizer) {
			var children = new List();
			var child = null;
			var context = {
				recognizer: recognizer,
				space: null,
				ignoreWS: false,
				ignoreWSAfter: false
			};

			this.scanner.skipSC();

			while (!this.scanner.eof) {
				switch (this.scanner.tokenType) {
					case COMMENT:
						this.scanner.next();
						continue;

					case WHITESPACE:
						if (context.ignoreWS) {
							this.scanner.next();
						} else {
							context.space = this.WhiteSpace();
						}
						continue;
				}

				child = recognizer.getNode.call(this, context);

				if (child === undefined) {
					break;
				}

				if (context.space !== null) {
					children.appendData(context.space);
					context.space = null;
				}

				children.appendData(child);

				if (context.ignoreWSAfter) {
					context.ignoreWSAfter = false;
					context.ignoreWS = true;
				} else {
					context.ignoreWS = false;
				}
			}

			return children;
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax
	modules['/css-tree/syntax'] = function () {
		function merge() {
			var dest = {};

			for (var i = 0; i < arguments.length; i++) {
				var src = arguments[i];
				for (var key in src) {
					dest[key] = src[key];
				}
			}

			return dest;
		}

		var exports = require('/css-tree/syntax/create').create(
			merge(
				require('/css-tree/syntax/config/lexer'),
				require('/css-tree/syntax/config/parser'),
				require('/css-tree/syntax/config/walker')
			)
		);

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/atrule
	modules['/css-tree/syntax/atrule'] = function () {
		var exports = {
			'font-face': require('/css-tree/syntax/atrule/font-face'),
			'import': require('/css-tree/syntax/atrule/import'),
			'media': require('/css-tree/syntax/atrule/media'),
			'page': require('/css-tree/syntax/atrule/page'),
			'supports': require('/css-tree/syntax/atrule/supports')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/atrule/font-face
	modules['/css-tree/syntax/atrule/font-face'] = function () {
		var exports = {
			parse: {
				prelude: null,
				block: function() {
					return this.Block(this.Declaration);
				}
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/atrule/import
	modules['/css-tree/syntax/atrule/import'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var STRING = TYPE.String;
		var IDENTIFIER = TYPE.Identifier;
		var URL = TYPE.Url;
		var LEFTPARENTHESIS = TYPE.LeftParenthesis;

		var exports = {
			parse: {
				prelude: function() {
					var children = new List();

					this.scanner.skipSC();

					switch (this.scanner.tokenType) {
						case STRING:
							children.appendData(this.String());
							break;

						case URL:
							children.appendData(this.Url());
							break;

						default:
							this.scanner.error('String or url() is expected');
					}

					if (this.scanner.lookupNonWSType(0) === IDENTIFIER ||
						this.scanner.lookupNonWSType(0) === LEFTPARENTHESIS) {
						children.appendData(this.WhiteSpace());
						children.appendData(this.MediaQueryList());
					}

					return children;
				},
				block: null
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/atrule/media
	modules['/css-tree/syntax/atrule/media'] = function () {
		var List = require('/css-tree/utils/list');

		var exports = {
			parse: {
				prelude: function() {
					return new List().appendData(
						this.MediaQueryList()
					);
				},
				block: function() {
					return this.Block(this.Rule);
				}
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/atrule/page
	modules['/css-tree/syntax/atrule/page'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;
		var LEFTCURLYBRACKET = TYPE.LeftCurlyBracket;

		var exports = {
			parse: {
				prelude: function() {
					if (this.scanner.lookupNonWSType(0) === LEFTCURLYBRACKET) {
						return null;
					}

					return new List().appendData(
						this.SelectorList()
					);
				},
				block: function() {
					return this.Block(this.Declaration);
				}
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/atrule/supports
	modules['/css-tree/syntax/atrule/supports'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var WHITESPACE = TYPE.WhiteSpace;
		var COMMENT = TYPE.Comment;
		var IDENTIFIER = TYPE.Identifier;
		var FUNCTION = TYPE.Function;
		var LEFTPARENTHESIS = TYPE.LeftParenthesis;
		var HYPHENMINUS = TYPE.HyphenMinus;
		var COLON = TYPE.Colon;

		function consumeRaw() {
			return new List().appendData(
				this.Raw(this.scanner.currentToken, 0, 0, false, false)
			);
		}

		function parentheses() {
			var index = 0;

			this.scanner.skipSC();

			// TODO: make it simplier
			if (this.scanner.tokenType === IDENTIFIER) {
				index = 1;
			} else if (this.scanner.tokenType === HYPHENMINUS &&
					   this.scanner.lookupType(1) === IDENTIFIER) {
				index = 2;
			}

			if (index !== 0 && this.scanner.lookupNonWSType(index) === COLON) {
				return new List().appendData(
					this.Declaration()
				);
			}

			return readSequence.call(this);
		}

		function readSequence() {
			var children = new List();
			var space = null;
			var child;

			this.scanner.skipSC();

			scan:
			while (!this.scanner.eof) {
				switch (this.scanner.tokenType) {
					case WHITESPACE:
						space = this.WhiteSpace();
						continue;

					case COMMENT:
						this.scanner.next();
						continue;

					case FUNCTION:
						child = this.Function(consumeRaw, this.scope.AtrulePrelude);
						break;

					case IDENTIFIER:
						child = this.Identifier();
						break;

					case LEFTPARENTHESIS:
						child = this.Parentheses(parentheses, this.scope.AtrulePrelude);
						break;

					default:
						break scan;
				}

				if (space !== null) {
					children.appendData(space);
					space = null;
				}

				children.appendData(child);
			}

			return children;
		}

		var exports = {
			parse: {
				prelude: function() {
					var children = readSequence.call(this);

					if (children.isEmpty()) {
						this.scanner.error('Condition is expected');
					}

					return children;
				},
				block: function() {
					return this.Block(this.Rule);
				}
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/config/lexer
	modules['/css-tree/syntax/config/lexer'] = function () {
		var data = require('/css-tree/data');

		var exports = {
			generic: true,
			types: data.types,
			properties: data.properties,
			node: require('/css-tree/syntax/node')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/config/mix
	modules['/css-tree/syntax/config/mix'] = function () {
		var shape = {
			generic: true,
			types: {},
			properties: {},
			parseContext: {},
			scope: {},
			atrule: ['parse'],
			pseudo: ['parse'],
			node: ['name', 'structure', 'parse', 'generate', 'walkContext']
		};

		function isObject(value) {
			return value && value.constructor === Object;
		}

		function copy(value) {
			if (isObject(value)) {
				var res = {};
				for (var key in value) {
					res[key] = value[key];
				}
				return res;
			} else {
				return value;
			}
		}

		function extend(dest, src) {
			for (var key in src) {
				if (isObject(dest[key])) {
					extend(dest[key], copy(src[key]));
				} else {
					dest[key] = copy(src[key]);
				}
			}
		}

		function mix(dest, src, shape) {
			for (var key in shape) {
				if (shape[key] === true) {
					if (key in src) {
						dest[key] = copy(src[key]);
					}
				} else if (shape[key]) {
					if (isObject(shape[key])) {
						var res = {};
						extend(res, dest[key]);
						extend(res, src[key]);
						dest[key] = res;
					} else if (Array.isArray(shape[key])) {
						var res = {};
						var innerShape = shape[key].reduce(function(s, k) {
							s[k] = true;
							return s;
						}, {});
						for (var name in dest[key]) {
							res[name] = {};
							if (dest[key] && dest[key][name]) {
								mix(res[name], dest[key][name], innerShape);
							}
						}
						for (var name in src[key]) {
							if (!res[name]) {
								res[name] = {};
							}
							if (src[key] && src[key][name]) {
								mix(res[name], src[key][name], innerShape);
							}
						}
						dest[key] = res;
					}
				}
			}
			return dest;
		}

		var exports = function(dest, src) {
			return mix(dest, src, shape);
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/config/parser
	modules['/css-tree/syntax/config/parser'] = function () {
		var exports = {
			parseContext: {
				default: 'StyleSheet',
				stylesheet: 'StyleSheet',
				atrule: 'Atrule',
				atrulePrelude: function(options) {
					return this.AtrulePrelude(options.atrule ? String(options.atrule) : null);
				},
				mediaQueryList: 'MediaQueryList',
				mediaQuery: 'MediaQuery',
				rule: 'Rule',
				selectorList: 'SelectorList',
				selector: 'Selector',
				block: function() {
					return this.Block(this.Declaration);
				},
				declarationList: 'DeclarationList',
				declaration: 'Declaration',
				value: function(options) {
					return this.Value(options.property ? String(options.property) : null);
				}
			},
			scope: require('/css-tree/syntax/scope'),
			atrule: require('/css-tree/syntax/atrule'),
			pseudo: require('/css-tree/syntax/pseudo'),
			node: require('/css-tree/syntax/node')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/config/walker
	modules['/css-tree/syntax/config/walker'] = function () {
		var exports = {
			node: require('/css-tree/syntax/node')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/function/element
	modules['/css-tree/syntax/function/element'] = function () {
		var List = require('/css-tree/utils/list');

		// https://drafts.csswg.org/css-images-4/#element-notation
		// https://developer.mozilla.org/en-US/docs/Web/CSS/element
		var exports = function() {
			this.scanner.skipSC();

			var id = this.IdSelector();

			this.scanner.skipSC();

			return new List().appendData(
				id
			);
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/function/expression
	modules['/css-tree/syntax/function/expression'] = function () {
		var List = require('/css-tree/utils/list');

		// legacy IE function
		// expression '(' raw ')'
		var exports = function() {
			return new List().appendData(
				this.Raw(this.scanner.currentToken, 0, 0, false, false)
			);
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/function/var
	modules['/css-tree/syntax/function/var'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var COMMA = TYPE.Comma;
		var SEMICOLON = TYPE.Semicolon;
		var HYPHENMINUS = TYPE.HyphenMinus;
		var EXCLAMATIONMARK = TYPE.ExclamationMark;

		// var '(' ident (',' <value>? )? ')'
		var exports = function() {
			var children = new List();

			this.scanner.skipSC();

			var identStart = this.scanner.tokenStart;

			this.scanner.eat(HYPHENMINUS);
			if (this.scanner.source.charCodeAt(this.scanner.tokenStart) !== HYPHENMINUS) {
				this.scanner.error('HyphenMinus is expected');
			}
			this.scanner.eat(IDENTIFIER);

			children.appendData({
				type: 'Identifier',
				loc: this.getLocation(identStart, this.scanner.tokenStart),
				name: this.scanner.substrToCursor(identStart)
			});

			this.scanner.skipSC();

			if (this.scanner.tokenType === COMMA) {
				children.appendData(this.Operator());
				children.appendData(this.parseCustomProperty
					? this.Value(null)
					: this.Raw(this.scanner.currentToken, EXCLAMATIONMARK, SEMICOLON, false, false)
				);
			}

			return children;
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node
	modules['/css-tree/syntax/node'] = function () {
		var exports = {
			AnPlusB: require('/css-tree/syntax/node/AnPlusB'),
			Atrule: require('/css-tree/syntax/node/Atrule'),
			AtrulePrelude: require('/css-tree/syntax/node/AtrulePrelude'),
			AttributeSelector: require('/css-tree/syntax/node/AttributeSelector'),
			Block: require('/css-tree/syntax/node/Block'),
			Brackets: require('/css-tree/syntax/node/Brackets'),
			CDC: require('/css-tree/syntax/node/CDC'),
			CDO: require('/css-tree/syntax/node/CDO'),
			ClassSelector: require('/css-tree/syntax/node/ClassSelector'),
			Combinator: require('/css-tree/syntax/node/Combinator'),
			Comment: require('/css-tree/syntax/node/Comment'),
			Declaration: require('/css-tree/syntax/node/Declaration'),
			DeclarationList: require('/css-tree/syntax/node/DeclarationList'),
			Dimension: require('/css-tree/syntax/node/Dimension'),
			Function: require('/css-tree/syntax/node/Function'),
			HexColor: require('/css-tree/syntax/node/HexColor'),
			Identifier: require('/css-tree/syntax/node/Identifier'),
			IdSelector: require('/css-tree/syntax/node/IdSelector'),
			MediaFeature: require('/css-tree/syntax/node/MediaFeature'),
			MediaQuery: require('/css-tree/syntax/node/MediaQuery'),
			MediaQueryList: require('/css-tree/syntax/node/MediaQueryList'),
			Nth: require('/css-tree/syntax/node/Nth'),
			Number: require('/css-tree/syntax/node/Number'),
			Operator: require('/css-tree/syntax/node/Operator'),
			Parentheses: require('/css-tree/syntax/node/Parentheses'),
			Percentage: require('/css-tree/syntax/node/Percentage'),
			PseudoClassSelector: require('/css-tree/syntax/node/PseudoClassSelector'),
			PseudoElementSelector: require('/css-tree/syntax/node/PseudoElementSelector'),
			Ratio: require('/css-tree/syntax/node/Ratio'),
			Raw: require('/css-tree/syntax/node/Raw'),
			Rule: require('/css-tree/syntax/node/Rule'),
			Selector: require('/css-tree/syntax/node/Selector'),
			SelectorList: require('/css-tree/syntax/node/SelectorList'),
			String: require('/css-tree/syntax/node/String'),
			StyleSheet: require('/css-tree/syntax/node/StyleSheet'),
			TypeSelector: require('/css-tree/syntax/node/TypeSelector'),
			UnicodeRange: require('/css-tree/syntax/node/UnicodeRange'),
			Url: require('/css-tree/syntax/node/Url'),
			Value: require('/css-tree/syntax/node/Value'),
			WhiteSpace: require('/css-tree/syntax/node/WhiteSpace')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/AnPlusB
	modules['/css-tree/syntax/node/AnPlusB'] = function () {
		var cmpChar = require('/css-tree/tokenizer').cmpChar;
		var isNumber = require('/css-tree/tokenizer').isNumber;
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var NUMBER = TYPE.Number;
		var PLUSSIGN = TYPE.PlusSign;
		var HYPHENMINUS = TYPE.HyphenMinus;
		var N = 110; // 'n'.charCodeAt(0)
		var DISALLOW_SIGN = true;
		var ALLOW_SIGN = false;

		function checkTokenIsInteger(scanner, disallowSign) {
			var pos = scanner.tokenStart;

			if (scanner.source.charCodeAt(pos) === PLUSSIGN ||
				scanner.source.charCodeAt(pos) === HYPHENMINUS) {
				if (disallowSign) {
					scanner.error();
				}
				pos++;
			}

			for (; pos < scanner.tokenEnd; pos++) {
				if (!isNumber(scanner.source.charCodeAt(pos))) {
					scanner.error('Unexpected input', pos);
				}
			}
		}

		// An+B microsyntax https://www.w3.org/TR/css-syntax-3/#anb
		var exports = {
			name: 'AnPlusB',
			structure: {
				a: [String, null],
				b: [String, null]
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var end = start;
				var prefix = '';
				var a = null;
				var b = null;

				if (this.scanner.tokenType === NUMBER ||
					this.scanner.tokenType === PLUSSIGN) {
					checkTokenIsInteger(this.scanner, ALLOW_SIGN);
					prefix = this.scanner.getTokenValue();
					this.scanner.next();
					end = this.scanner.tokenStart;
				}

				if (this.scanner.tokenType === IDENTIFIER) {
					var bStart = this.scanner.tokenStart;

					if (cmpChar(this.scanner.source, bStart, HYPHENMINUS)) {
						if (prefix === '') {
							prefix = '-';
							bStart++;
						} else {
							this.scanner.error('Unexpected hyphen minus');
						}
					}

					if (!cmpChar(this.scanner.source, bStart, N)) {
						this.scanner.error();
					}

					a = prefix === ''  ? '1'  :
						prefix === '+' ? '+1' :
						prefix === '-' ? '-1' :
						prefix;

					var len = this.scanner.tokenEnd - bStart;
					if (len > 1) {
						// ..n-..
						if (this.scanner.source.charCodeAt(bStart + 1) !== HYPHENMINUS) {
							this.scanner.error('Unexpected input', bStart + 1);
						}

						if (len > 2) {
							// ..n-{number}..
							this.scanner.tokenStart = bStart + 2;
						} else {
							// ..n- {number}
							this.scanner.next();
							this.scanner.skipSC();
						}

						checkTokenIsInteger(this.scanner, DISALLOW_SIGN);
						b = '-' + this.scanner.getTokenValue();
						this.scanner.next();
						end = this.scanner.tokenStart;
					} else {
						prefix = '';
						this.scanner.next();
						end = this.scanner.tokenStart;
						this.scanner.skipSC();

						if (this.scanner.tokenType === HYPHENMINUS ||
							this.scanner.tokenType === PLUSSIGN) {
							prefix = this.scanner.getTokenValue();
							this.scanner.next();
							this.scanner.skipSC();
						}

						if (this.scanner.tokenType === NUMBER) {
							checkTokenIsInteger(this.scanner, prefix !== '');

							if (!isNumber(this.scanner.source.charCodeAt(this.scanner.tokenStart))) {
								prefix = this.scanner.source.charAt(this.scanner.tokenStart);
								this.scanner.tokenStart++;
							}

							if (prefix === '') {
								// should be an operator before number
								this.scanner.error();
							} else if (prefix === '+') {
								// plus is using by default
								prefix = '';
							}

							b = prefix + this.scanner.getTokenValue();

							this.scanner.next();
							end = this.scanner.tokenStart;
						} else {
							if (prefix) {
								this.scanner.eat(NUMBER);
							}
						}
					}
				} else {
					if (prefix === '' || prefix === '+') { // no number
						this.scanner.error(
							'Number or identifier is expected',
							this.scanner.tokenStart + (
								this.scanner.tokenType === PLUSSIGN ||
								this.scanner.tokenType === HYPHENMINUS
							)
						);
					}

					b = prefix;
				}

				return {
					type: 'AnPlusB',
					loc: this.getLocation(start, end),
					a: a,
					b: b
				};
			},
			generate: function(processChunk, node) {
				var a = node.a !== null && node.a !== undefined;
				var b = node.b !== null && node.b !== undefined;

				if (a) {
					processChunk(
						node.a === '+1' ? '+n' :
						node.a ===  '1' ?  'n' :
						node.a === '-1' ? '-n' :
						node.a + 'n'
					);

					if (b) {
						b = String(node.b);
						if (b.charAt(0) === '-' || b.charAt(0) === '+') {
							processChunk(b.charAt(0));
							processChunk(b.substr(1));
						} else {
							processChunk('+');
							processChunk(b);
						}
					}
				} else {
					processChunk(String(node.b));
				}
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Atrule
	modules['/css-tree/syntax/node/Atrule'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var ATRULE = TYPE.Atrule;
		var SEMICOLON = TYPE.Semicolon;
		var LEFTCURLYBRACKET = TYPE.LeftCurlyBracket;
		var RIGHTCURLYBRACKET = TYPE.RightCurlyBracket;

		function isBlockAtrule() {
			for (var offset = 1, type; type = this.scanner.lookupType(offset); offset++) {
				if (type === RIGHTCURLYBRACKET) {
					return true;
				}

				if (type === LEFTCURLYBRACKET ||
					type === ATRULE) {
					return false;
				}
			}

			this.scanner.skip(offset);
			this.scanner.eat(RIGHTCURLYBRACKET);
		}

		var exports = {
			name: 'Atrule',
			structure: {
				name: String,
				prelude: ['AtrulePrelude', null],
				block: ['Block', null]
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var name;
				var nameLowerCase;
				var prelude = null;
				var block = null;

				this.scanner.eat(ATRULE);

				name = this.scanner.substrToCursor(start + 1);
				nameLowerCase = name.toLowerCase();
				this.scanner.skipSC();

				prelude = this.AtrulePrelude(name);

				// turn empty AtrulePrelude into null
				if (prelude.children.head === null) {
					prelude = null;
				}

				this.scanner.skipSC();

				if (this.atrule.hasOwnProperty(nameLowerCase)) {
					if (typeof this.atrule[nameLowerCase].block === 'function') {
						if (this.scanner.tokenType !== LEFTCURLYBRACKET) {
							// FIXME: make tolerant
							this.scanner.error('Curly bracket is expected');
						}

						block = this.atrule[nameLowerCase].block.call(this);
					} else {
						if (!this.tolerant || !this.scanner.eof) {
							this.scanner.eat(SEMICOLON);
						}
					}
				} else {
					switch (this.scanner.tokenType) {
						case SEMICOLON:
							this.scanner.next();
							break;

						case LEFTCURLYBRACKET:
							// TODO: should consume block content as Raw?
							block = this.Block(isBlockAtrule.call(this) ? this.Declaration : this.Rule);
							break;

						default:
							if (!this.tolerant) {
								this.scanner.error('Semicolon or block is expected');
							}
					}
				}

				return {
					type: 'Atrule',
					loc: this.getLocation(start, this.scanner.tokenStart),
					name: name,
					prelude: prelude,
					block: block
				};
			},
			generate: function(processChunk, node) {
				processChunk('@');
				processChunk(node.name);

				if (node.prelude !== null) {
					processChunk(' ');
					this.generate(processChunk, node.prelude);
				}

				if (node.block) {
					this.generate(processChunk, node.block);
				} else {
					processChunk(';');
				}
			},
			walkContext: 'atrule'
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/AtrulePrelude
	modules['/css-tree/syntax/node/AtrulePrelude'] = function () {
		var List = require('/css-tree/utils/list');

		var TYPE = require('/css-tree/tokenizer').TYPE;
		var SEMICOLON = TYPE.Semicolon;
		var LEFTCURLYBRACKET = TYPE.LeftCurlyBracket;

		function consumeRaw(startToken) {
			return new List().appendData(
				this.Raw(startToken, SEMICOLON, LEFTCURLYBRACKET, false, true)
			);
		}

		function consumeDefaultSequence() {
			return this.readSequence(this.scope.AtrulePrelude);
		}

		var exports = {
			name: 'AtrulePrelude',
			structure: {
				children: [[]]
			},
			parse: function(name) {
				var children = null;
				var startToken = this.scanner.currentToken;

				if (name !== null) {
					name = name.toLowerCase();
				}

				if (this.parseAtrulePrelude) {
					// custom consumer
					if (this.atrule.hasOwnProperty(name)) {
						if (typeof this.atrule[name].prelude === 'function') {
							children = this.tolerantParse(this.atrule[name].prelude, consumeRaw);
						}
					} else {
						// default consumer
						this.scanner.skipSC();
						children = this.tolerantParse(consumeDefaultSequence, consumeRaw);
					}

					if (this.tolerant) {
						if (this.scanner.eof || (this.scanner.tokenType !== SEMICOLON && this.scanner.tokenType !== LEFTCURLYBRACKET)) {
							children = consumeRaw.call(this, startToken);
						}
					}
				} else {
					children = consumeRaw.call(this, startToken);
				}

				if (children === null) {
					children = new List();
				}

				return {
					type: 'AtrulePrelude',
					loc: this.getLocationFromList(children),
					children: children
				};
			},
			generate: function(processChunk, node) {
				this.each(processChunk, node);
			},
			walkContext: 'atrulePrelude'
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/AttributeSelector
	modules['/css-tree/syntax/node/AttributeSelector'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var STRING = TYPE.String;
		var DOLLARSIGN = TYPE.DollarSign;
		var ASTERISK = TYPE.Asterisk;
		var COLON = TYPE.Colon;
		var EQUALSSIGN = TYPE.EqualsSign;
		var LEFTSQUAREBRACKET = TYPE.LeftSquareBracket;
		var RIGHTSQUAREBRACKET = TYPE.RightSquareBracket;
		var CIRCUMFLEXACCENT = TYPE.CircumflexAccent;
		var VERTICALLINE = TYPE.VerticalLine;
		var TILDE = TYPE.Tilde;

		function getAttributeName() {
			if (this.scanner.eof) {
				this.scanner.error('Unexpected end of input');
			}

			var start = this.scanner.tokenStart;
			var expectIdentifier = false;
			var checkColon = true;

			if (this.scanner.tokenType === ASTERISK) {
				expectIdentifier = true;
				checkColon = false;
				this.scanner.next();
			} else if (this.scanner.tokenType !== VERTICALLINE) {
				this.scanner.eat(IDENTIFIER);
			}

			if (this.scanner.tokenType === VERTICALLINE) {
				if (this.scanner.lookupType(1) !== EQUALSSIGN) {
					this.scanner.next();
					this.scanner.eat(IDENTIFIER);
				} else if (expectIdentifier) {
					this.scanner.error('Identifier is expected', this.scanner.tokenEnd);
				}
			} else if (expectIdentifier) {
				this.scanner.error('Vertical line is expected');
			}

			if (checkColon && this.scanner.tokenType === COLON) {
				this.scanner.next();
				this.scanner.eat(IDENTIFIER);
			}

			return {
				type: 'Identifier',
				loc: this.getLocation(start, this.scanner.tokenStart),
				name: this.scanner.substrToCursor(start)
			};
		}

		function getOperator() {
			var start = this.scanner.tokenStart;
			var tokenType = this.scanner.tokenType;

			if (tokenType !== EQUALSSIGN &&        // =
				tokenType !== TILDE &&             // ~=
				tokenType !== CIRCUMFLEXACCENT &&  // ^=
				tokenType !== DOLLARSIGN &&        // $=
				tokenType !== ASTERISK &&          // *=
				tokenType !== VERTICALLINE         // |=
			) {
				this.scanner.error('Attribute selector (=, ~=, ^=, $=, *=, |=) is expected');
			}

			if (tokenType === EQUALSSIGN) {
				this.scanner.next();
			} else {
				this.scanner.next();
				this.scanner.eat(EQUALSSIGN);
			}

			return this.scanner.substrToCursor(start);
		}

		// '[' S* attrib_name ']'
		// '[' S* attrib_name S* attrib_matcher S* [ IDENT | STRING ] S* attrib_flags? S* ']'
		var exports = {
			name: 'AttributeSelector',
			structure: {
				name: 'Identifier',
				matcher: [String, null],
				value: ['String', 'Identifier', null],
				flags: [String, null]
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var name;
				var matcher = null;
				var value = null;
				var flags = null;

				this.scanner.eat(LEFTSQUAREBRACKET);
				this.scanner.skipSC();

				name = getAttributeName.call(this);
				this.scanner.skipSC();

				if (this.scanner.tokenType !== RIGHTSQUAREBRACKET) {
					// avoid case `[name i]`
					if (this.scanner.tokenType !== IDENTIFIER) {
						matcher = getOperator.call(this);

						this.scanner.skipSC();

						value = this.scanner.tokenType === STRING
							? this.String()
							: this.Identifier();

						this.scanner.skipSC();
					}

					// attribute flags
					if (this.scanner.tokenType === IDENTIFIER) {
						flags = this.scanner.getTokenValue();
						this.scanner.next();

						this.scanner.skipSC();
					}
				}

				this.scanner.eat(RIGHTSQUAREBRACKET);

				return {
					type: 'AttributeSelector',
					loc: this.getLocation(start, this.scanner.tokenStart),
					name: name,
					matcher: matcher,
					value: value,
					flags: flags
				};
			},
			generate: function(processChunk, node) {
				var flagsPrefix = ' ';

				processChunk('[');
				this.generate(processChunk, node.name);

				if (node.matcher !== null) {
					processChunk(node.matcher);

					if (node.value !== null) {
						this.generate(processChunk, node.value);

						// space between string and flags is not required
						if (node.value.type === 'String') {
							flagsPrefix = '';
						}
					}
				}

				if (node.flags !== null) {
					processChunk(flagsPrefix);
					processChunk(node.flags);
				}

				processChunk(']');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Block
	modules['/css-tree/syntax/node/Block'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var WHITESPACE = TYPE.WhiteSpace;
		var COMMENT = TYPE.Comment;
		var SEMICOLON = TYPE.Semicolon;
		var ATRULE = TYPE.Atrule;
		var LEFTCURLYBRACKET = TYPE.LeftCurlyBracket;
		var RIGHTCURLYBRACKET = TYPE.RightCurlyBracket;

		function consumeRaw(startToken) {
			return this.Raw(startToken, 0, SEMICOLON, true, true);
		}

		var exports = {
			name: 'Block',
			structure: {
				children: [['Atrule', 'Rule', 'Declaration']]
			},
			parse: function(defaultConsumer) {
				if (!defaultConsumer) {
					defaultConsumer = this.Declaration;
				}

				var start = this.scanner.tokenStart;
				var children = new List();

				this.scanner.eat(LEFTCURLYBRACKET);

				scan:
				while (!this.scanner.eof) {
					switch (this.scanner.tokenType) {
						case RIGHTCURLYBRACKET:
							break scan;

						case WHITESPACE:
						case COMMENT:
						case SEMICOLON:
							this.scanner.next();
							break;

						case ATRULE:
							children.appendData(this.tolerantParse(this.Atrule, consumeRaw));
							break;

						default:
							children.appendData(this.tolerantParse(defaultConsumer, consumeRaw));
					}
				}

				if (!this.tolerant || !this.scanner.eof) {
					this.scanner.eat(RIGHTCURLYBRACKET);
				}

				return {
					type: 'Block',
					loc: this.getLocation(start, this.scanner.tokenStart),
					children: children
				};
			},
			generate: function(processChunk, node) {
				processChunk('{');
				this.each(processChunk, node);
				processChunk('}');
			},
			walkContext: 'block'
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Brackets
	modules['/css-tree/syntax/node/Brackets'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;
		var LEFTSQUAREBRACKET = TYPE.LeftSquareBracket;
		var RIGHTSQUAREBRACKET = TYPE.RightSquareBracket;

		// currently only Grid Layout uses square brackets, but left it universal
		// https://drafts.csswg.org/css-grid/#track-sizing
		// [ ident* ]
		var exports = {
			name: 'Brackets',
			structure: {
				children: [[]]
			},
			parse: function(readSequence, recognizer) {
				var start = this.scanner.tokenStart;
				var children = null;

				this.scanner.eat(LEFTSQUAREBRACKET);
				children = readSequence.call(this, recognizer);
				this.scanner.eat(RIGHTSQUAREBRACKET);

				return {
					type: 'Brackets',
					loc: this.getLocation(start, this.scanner.tokenStart),
					children: children
				};
			},
			generate: function(processChunk, node) {
				processChunk('[');
				this.each(processChunk, node);
				processChunk(']');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/CDC
	modules['/css-tree/syntax/node/CDC'] = function () {
		var CDC = require('/css-tree/tokenizer').TYPE.CDC;

		var exports = {
			name: 'CDC',
			structure: [],
			parse: function() {
				var start = this.scanner.tokenStart;

				this.scanner.eat(CDC); // -->

				return {
					type: 'CDC',
					loc: this.getLocation(start, this.scanner.tokenStart)
				};
			},
			generate: function(processChunk) {
				processChunk('-->');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/CDO
	modules['/css-tree/syntax/node/CDO'] = function () {
		var CDO = require('/css-tree/tokenizer').TYPE.CDO;

		var exports = {
			name: 'CDO',
			structure: [],
			parse: function() {
				var start = this.scanner.tokenStart;

				this.scanner.eat(CDO); // <!--

				return {
					type: 'CDO',
					loc: this.getLocation(start, this.scanner.tokenStart)
				};
			},
			generate: function(processChunk) {
				processChunk('<!--');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/ClassSelector
	modules['/css-tree/syntax/node/ClassSelector'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;
		var IDENTIFIER = TYPE.Identifier;
		var FULLSTOP = TYPE.FullStop;

		// '.' ident
		var exports = {
			name: 'ClassSelector',
			structure: {
				name: String
			},
			parse: function() {
				this.scanner.eat(FULLSTOP);

				return {
					type: 'ClassSelector',
					loc: this.getLocation(this.scanner.tokenStart - 1, this.scanner.tokenEnd),
					name: this.scanner.consume(IDENTIFIER)
				};
			},
			generate: function(processChunk, node) {
				processChunk('.');
				processChunk(node.name);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Combinator
	modules['/css-tree/syntax/node/Combinator'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var PLUSSIGN = TYPE.PlusSign;
		var SOLIDUS = TYPE.Solidus;
		var GREATERTHANSIGN = TYPE.GreaterThanSign;
		var TILDE = TYPE.Tilde;

		// + | > | ~ | /deep/
		var exports = {
			name: 'Combinator',
			structure: {
				name: String
			},
			parse: function() {
				var start = this.scanner.tokenStart;

				switch (this.scanner.tokenType) {
					case GREATERTHANSIGN:
					case PLUSSIGN:
					case TILDE:
						this.scanner.next();
						break;

					case SOLIDUS:
						this.scanner.next();
						this.scanner.expectIdentifier('deep');
						this.scanner.eat(SOLIDUS);
						break;

					default:
						this.scanner.error('Combinator is expected');
				}

				return {
					type: 'Combinator',
					loc: this.getLocation(start, this.scanner.tokenStart),
					name: this.scanner.substrToCursor(start)
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.name);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Comment
	modules['/css-tree/syntax/node/Comment'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var ASTERISK = TYPE.Asterisk;
		var SOLIDUS = TYPE.Solidus;

		// '/*' .* '*/'
		var exports = {
			name: 'Comment',
			structure: {
				value: String
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var end = this.scanner.tokenEnd;

				if ((end - start + 2) >= 2 &&
					this.scanner.source.charCodeAt(end - 2) === ASTERISK &&
					this.scanner.source.charCodeAt(end - 1) === SOLIDUS) {
					end -= 2;
				}

				this.scanner.next();

				return {
					type: 'Comment',
					loc: this.getLocation(start, this.scanner.tokenStart),
					value: this.scanner.source.substring(start + 2, end)
				};
			},
			generate: function(processChunk, node) {
				processChunk('/*');
				processChunk(node.value);
				processChunk('*/');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Declaration
	modules['/css-tree/syntax/node/Declaration'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var COLON = TYPE.Colon;
		var EXCLAMATIONMARK = TYPE.ExclamationMark;
		var SOLIDUS = TYPE.Solidus;
		var ASTERISK = TYPE.Asterisk;
		var DOLLARSIGN = TYPE.DollarSign;
		var HYPHENMINUS = TYPE.HyphenMinus;
		var SEMICOLON = TYPE.Semicolon;
		var RIGHTCURLYBRACKET = TYPE.RightCurlyBracket;
		var RIGHTPARENTHESIS = TYPE.RightParenthesis;
		var PLUSSIGN = TYPE.PlusSign;
		var NUMBERSIGN = TYPE.NumberSign;

		var exports = {
			name: 'Declaration',
			structure: {
				important: [Boolean, String],
				property: String,
				value: ['Value', 'Raw']
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var property = readProperty.call(this);
				var important = false;
				var value;

				this.scanner.skipSC();
				this.scanner.eat(COLON);

				if (isCustomProperty(property) ? this.parseCustomProperty : this.parseValue) {
					value = this.Value(property);
				} else {
					value = this.Raw(this.scanner.currentToken, EXCLAMATIONMARK, SEMICOLON, false, false);
				}

				if (this.scanner.tokenType === EXCLAMATIONMARK) {
					important = getImportant(this.scanner);
					this.scanner.skipSC();
				}

				// TODO: include or not to include semicolon to range?
				// if (this.scanner.tokenType === SEMICOLON) {
				//     this.scanner.next();
				// }

				if (!this.scanner.eof &&
					this.scanner.tokenType !== SEMICOLON &&
					this.scanner.tokenType !== RIGHTPARENTHESIS &&
					this.scanner.tokenType !== RIGHTCURLYBRACKET) {
					this.scanner.error();
				}

				return {
					type: 'Declaration',
					loc: this.getLocation(start, this.scanner.tokenStart),
					important: important,
					property: property,
					value: value
				};
			},
			generate: function(processChunk, node, item) {
				processChunk(node.property);
				processChunk(':');
				this.generate(processChunk, node.value);

				if (node.important) {
					processChunk(node.important === true ? '!important' : '!' + node.important);
				}

				if (item && item.next) {
					processChunk(';');
				}
			},
			walkContext: 'declaration'
		};

		function isCustomProperty(name) {
			return name.length >= 2 &&
				   name.charCodeAt(0) === HYPHENMINUS &&
				   name.charCodeAt(1) === HYPHENMINUS;
		}

		function readProperty() {
			var start = this.scanner.tokenStart;
			var prefix = 0;

			// hacks
			switch (this.scanner.tokenType) {
				case ASTERISK:
				case DOLLARSIGN:
				case PLUSSIGN:
				case NUMBERSIGN:
					prefix = 1;
					break;

				// TODO: not sure we should support this hack
				case SOLIDUS:
					prefix = this.scanner.lookupType(1) === SOLIDUS ? 2 : 1;
					break;
			}

			if (this.scanner.lookupType(prefix) === HYPHENMINUS) {
				prefix++;
			}

			if (prefix) {
				this.scanner.skip(prefix);
			}

			this.scanner.eat(IDENTIFIER);

			return this.scanner.substrToCursor(start);
		}

		// ! ws* important
		function getImportant(scanner) {
			scanner.eat(EXCLAMATIONMARK);
			scanner.skipSC();

			var important = scanner.consume(IDENTIFIER);

			// store original value in case it differ from `important`
			// for better original source restoring and hacks like `!ie` support
			return important === 'important' ? true : important;
		}

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/DeclarationList
	modules['/css-tree/syntax/node/DeclarationList'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var WHITESPACE = TYPE.WhiteSpace;
		var COMMENT = TYPE.Comment;
		var SEMICOLON = TYPE.Semicolon;

		function consumeRaw(startToken) {
			return this.Raw(startToken, 0, SEMICOLON, true, true);
		}

		var exports = {
			name: 'DeclarationList',
			structure: {
				children: [['Declaration']]
			},
			parse: function() {
				var children = new List();

				scan:
				while (!this.scanner.eof) {
					switch (this.scanner.tokenType) {
						case WHITESPACE:
						case COMMENT:
						case SEMICOLON:
							this.scanner.next();
							break;

						default:
							children.appendData(this.tolerantParse(this.Declaration, consumeRaw));
					}
				}

				return {
					type: 'DeclarationList',
					loc: this.getLocationFromList(children),
					children: children
				};
			},
			generate: function(processChunk, node) {
				this.each(processChunk, node);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Dimension
	modules['/css-tree/syntax/node/Dimension'] = function () {
		var NUMBER = require('/css-tree/tokenizer').TYPE.Number;

		// special reader for units to avoid adjoined IE hacks (i.e. '1px\9')
		function readUnit(scanner) {
			var unit = scanner.getTokenValue();
			var backSlashPos = unit.indexOf('\\');

			if (backSlashPos > 0) {
				// patch token offset
				scanner.tokenStart += backSlashPos;

				// return part before backslash
				return unit.substring(0, backSlashPos);
			}

			// no backslash in unit name
			scanner.next();

			return unit;
		}

		// number ident
		var exports = {
			name: 'Dimension',
			structure: {
				value: String,
				unit: String
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var value = this.scanner.consume(NUMBER);
				var unit = readUnit(this.scanner);

				return {
					type: 'Dimension',
					loc: this.getLocation(start, this.scanner.tokenStart),
					value: value,
					unit: unit
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.value);
				processChunk(node.unit);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Function
	modules['/css-tree/syntax/node/Function'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;
		var RIGHTPARENTHESIS = TYPE.RightParenthesis;

		// <function-token> <sequence> ')'
		var exports = {
			name: 'Function',
			structure: {
				name: String,
				children: [[]]
			},
			parse: function(readSequence, recognizer) {
				var start = this.scanner.tokenStart;
				var name = this.scanner.consumeFunctionName();
				var nameLowerCase = name.toLowerCase();
				var children;

				children = recognizer.hasOwnProperty(nameLowerCase)
					? recognizer[nameLowerCase].call(this, recognizer)
					: readSequence.call(this, recognizer);

				this.scanner.eat(RIGHTPARENTHESIS);

				return {
					type: 'Function',
					loc: this.getLocation(start, this.scanner.tokenStart),
					name: name,
					children: children
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.name);
				processChunk('(');
				this.each(processChunk, node);
				processChunk(')');
			},
			walkContext: 'function'
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/HexColor
	modules['/css-tree/syntax/node/HexColor'] = function () {
		var isHex = require('/css-tree/tokenizer').isHex;
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var NUMBER = TYPE.Number;
		var NUMBERSIGN = TYPE.NumberSign;

		function consumeHexSequence(scanner, required) {
			if (!isHex(scanner.source.charCodeAt(scanner.tokenStart))) {
				if (required) {
					scanner.error('Unexpected input', scanner.tokenStart);
				} else {
					return;
				}
			}

			for (var pos = scanner.tokenStart + 1; pos < scanner.tokenEnd; pos++) {
				var code = scanner.source.charCodeAt(pos);

				// break on non-hex char
				if (!isHex(code)) {
					// break token, exclude symbol
					scanner.tokenStart = pos;
					return;
				}
			}

			// token is full hex sequence, go to next token
			scanner.next();
		}

		// # ident
		var exports = {
			name: 'HexColor',
			structure: {
				value: String
			},
			parse: function() {
				var start = this.scanner.tokenStart;

				this.scanner.eat(NUMBERSIGN);

				scan:
				switch (this.scanner.tokenType) {
					case NUMBER:
						consumeHexSequence(this.scanner, true);

						// if token is identifier then number consists of hex only,
						// try to add identifier to result
						if (this.scanner.tokenType === IDENTIFIER) {
							consumeHexSequence(this.scanner, false);
						}

						break;

					case IDENTIFIER:
						consumeHexSequence(this.scanner, true);
						break;

					default:
						this.scanner.error('Number or identifier is expected');
				}

				return {
					type: 'HexColor',
					loc: this.getLocation(start, this.scanner.tokenStart),
					value: this.scanner.substrToCursor(start + 1) // skip #
				};
			},
			generate: function(processChunk, node) {
				processChunk('#');
				processChunk(node.value);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Identifier
	modules['/css-tree/syntax/node/Identifier'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;
		var IDENTIFIER = TYPE.Identifier;

		var exports = {
			name: 'Identifier',
			structure: {
				name: String
			},
			parse: function() {
				return {
					type: 'Identifier',
					loc: this.getLocation(this.scanner.tokenStart, this.scanner.tokenEnd),
					name: this.scanner.consume(IDENTIFIER)
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.name);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/IdSelector
	modules['/css-tree/syntax/node/IdSelector'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;
		var IDENTIFIER = TYPE.Identifier;
		var NUMBERSIGN = TYPE.NumberSign;

		// '#' ident
		var exports = {
			name: 'IdSelector',
			structure: {
				name: String
			},
			parse: function() {
				this.scanner.eat(NUMBERSIGN);

				return {
					type: 'IdSelector',
					loc: this.getLocation(this.scanner.tokenStart - 1, this.scanner.tokenEnd),
					name: this.scanner.consume(IDENTIFIER)
				};
			},
			generate: function(processChunk, node) {
				processChunk('#');
				processChunk(node.name);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/MediaFeature
	modules['/css-tree/syntax/node/MediaFeature'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var NUMBER = TYPE.Number;
		var LEFTPARENTHESIS = TYPE.LeftParenthesis;
		var RIGHTPARENTHESIS = TYPE.RightParenthesis;
		var COLON = TYPE.Colon;
		var SOLIDUS = TYPE.Solidus;

		var exports = {
			name: 'MediaFeature',
			structure: {
				name: String,
				value: ['Identifier', 'Number', 'Dimension', 'Ratio', null]
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var name;
				var value = null;

				this.scanner.eat(LEFTPARENTHESIS);
				this.scanner.skipSC();

				name = this.scanner.consume(IDENTIFIER);
				this.scanner.skipSC();

				if (this.scanner.tokenType !== RIGHTPARENTHESIS) {
					this.scanner.eat(COLON);
					this.scanner.skipSC();

					switch (this.scanner.tokenType) {
						case NUMBER:
							if (this.scanner.lookupType(1) === IDENTIFIER) {
								value = this.Dimension();
							} else if (this.scanner.lookupNonWSType(1) === SOLIDUS) {
								value = this.Ratio();
							} else {
								value = this.Number();
							}

							break;

						case IDENTIFIER:
							value = this.Identifier();

							break;

						default:
							this.scanner.error('Number, dimension, ratio or identifier is expected');
					}

					this.scanner.skipSC();
				}

				this.scanner.eat(RIGHTPARENTHESIS);

				return {
					type: 'MediaFeature',
					loc: this.getLocation(start, this.scanner.tokenStart),
					name: name,
					value: value
				};
			},
			generate: function(processChunk, node) {
				processChunk('(');
				processChunk(node.name);
				if (node.value !== null) {
					processChunk(':');
					this.generate(processChunk, node.value);
				}
				processChunk(')');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/MediaQuery
	modules['/css-tree/syntax/node/MediaQuery'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var WHITESPACE = TYPE.WhiteSpace;
		var COMMENT = TYPE.Comment;
		var IDENTIFIER = TYPE.Identifier;
		var LEFTPARENTHESIS = TYPE.LeftParenthesis;

		var exports = {
			name: 'MediaQuery',
			structure: {
				children: [['Identifier', 'MediaFeature', 'WhiteSpace']]
			},
			parse: function() {
				this.scanner.skipSC();

				var children = new List();
				var child = null;
				var space = null;

				scan:
				while (!this.scanner.eof) {
					switch (this.scanner.tokenType) {
						case COMMENT:
							this.scanner.next();
							continue;

						case WHITESPACE:
							space = this.WhiteSpace();
							continue;

						case IDENTIFIER:
							child = this.Identifier();
							break;

						case LEFTPARENTHESIS:
							child = this.MediaFeature();
							break;

						default:
							break scan;
					}

					if (space !== null) {
						children.appendData(space);
						space = null;
					}

					children.appendData(child);
				}

				if (child === null) {
					this.scanner.error('Identifier or parenthesis is expected');
				}

				return {
					type: 'MediaQuery',
					loc: this.getLocationFromList(children),
					children: children
				};
			},
			generate: function(processChunk, node) {
				this.each(processChunk, node);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/MediaQueryList
	modules['/css-tree/syntax/node/MediaQueryList'] = function () {
		var List = require('/css-tree/utils/list');
		var COMMA = require('/css-tree/tokenizer').TYPE.Comma;

		var exports = {
			name: 'MediaQueryList',
			structure: {
				children: [['MediaQuery']]
			},
			parse: function(relative) {
				var children = new List();

				this.scanner.skipSC();

				while (!this.scanner.eof) {
					children.appendData(this.MediaQuery(relative));

					if (this.scanner.tokenType !== COMMA) {
						break;
					}

					this.scanner.next();
				}

				return {
					type: 'MediaQueryList',
					loc: this.getLocationFromList(children),
					children: children
				};
			},
			generate: function(processChunk, node) {
				this.eachComma(processChunk, node);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Nth
	modules['/css-tree/syntax/node/Nth'] = function () {
		// https://drafts.csswg.org/css-syntax-3/#the-anb-type
		var exports = {
			name: 'Nth',
			structure: {
				nth: ['AnPlusB', 'Identifier'],
				selector: ['SelectorList', null]
			},
			parse: function(allowOfClause) {
				this.scanner.skipSC();

				var start = this.scanner.tokenStart;
				var end = start;
				var selector = null;
				var query;

				if (this.scanner.lookupValue(0, 'odd') || this.scanner.lookupValue(0, 'even')) {
					query = this.Identifier();
				} else {
					query = this.AnPlusB();
				}

				this.scanner.skipSC();

				if (allowOfClause && this.scanner.lookupValue(0, 'of')) {
					this.scanner.next();

					selector = this.SelectorList();

					if (this.needPositions) {
						end = selector.children.last().loc.end.offset;
					}
				} else {
					if (this.needPositions) {
						end = query.loc.end.offset;
					}
				}

				return {
					type: 'Nth',
					loc: this.getLocation(start, end),
					nth: query,
					selector: selector
				};
			},
			generate: function(processChunk, node) {
				this.generate(processChunk, node.nth);
				if (node.selector !== null) {
					processChunk(' of ');
					this.generate(processChunk, node.selector);
				}
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Number
	modules['/css-tree/syntax/node/Number'] = function () {
		var NUMBER = require('/css-tree/tokenizer').TYPE.Number;

		var exports = {
			name: 'Number',
			structure: {
				value: String
			},
			parse: function() {
				return {
					type: 'Number',
					loc: this.getLocation(this.scanner.tokenStart, this.scanner.tokenEnd),
					value: this.scanner.consume(NUMBER)
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.value);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Operator
	modules['/css-tree/syntax/node/Operator'] = function () {
		// '/' | '*' | ',' | ':' | '+' | '-'
		var exports = {
			name: 'Operator',
			structure: {
				value: String
			},
			parse: function() {
				var start = this.scanner.tokenStart;

				this.scanner.next();

				return {
					type: 'Operator',
					loc: this.getLocation(start, this.scanner.tokenStart),
					value: this.scanner.substrToCursor(start)
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.value);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Parentheses
	modules['/css-tree/syntax/node/Parentheses'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;
		var LEFTPARENTHESIS = TYPE.LeftParenthesis;
		var RIGHTPARENTHESIS = TYPE.RightParenthesis;

		var exports = {
			name: 'Parentheses',
			structure: {
				children: [[]]
			},
			parse: function(readSequence, recognizer) {
				var start = this.scanner.tokenStart;
				var children = null;

				this.scanner.eat(LEFTPARENTHESIS);
				children = readSequence.call(this, recognizer);
				this.scanner.eat(RIGHTPARENTHESIS);

				return {
					type: 'Parentheses',
					loc: this.getLocation(start, this.scanner.tokenStart),
					children: children
				};
			},
			generate: function(processChunk, node) {
				processChunk('(');
				this.each(processChunk, node);
				processChunk(')');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Percentage
	modules['/css-tree/syntax/node/Percentage'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var NUMBER = TYPE.Number;
		var PERCENTSIGN = TYPE.PercentSign;

		var exports = {
			name: 'Percentage',
			structure: {
				value: String
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var number = this.scanner.consume(NUMBER);

				this.scanner.eat(PERCENTSIGN);

				return {
					type: 'Percentage',
					loc: this.getLocation(start, this.scanner.tokenStart),
					value: number
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.value);
				processChunk('%');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/PseudoClassSelector
	modules['/css-tree/syntax/node/PseudoClassSelector'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var FUNCTION = TYPE.Function;
		var COLON = TYPE.Colon;
		var RIGHTPARENTHESIS = TYPE.RightParenthesis;

		// : ident [ '(' .. ')' ]?
		var exports = {
			name: 'PseudoClassSelector',
			structure: {
				name: String,
				children: [['Raw'], null]
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var children = null;
				var name;
				var nameLowerCase;

				this.scanner.eat(COLON);

				if (this.scanner.tokenType === FUNCTION) {
					name = this.scanner.consumeFunctionName();
					nameLowerCase = name.toLowerCase();

					if (this.pseudo.hasOwnProperty(nameLowerCase)) {
						this.scanner.skipSC();
						children = this.pseudo[nameLowerCase].call(this);
						this.scanner.skipSC();
					} else {
						children = new List().appendData(
							this.Raw(this.scanner.currentToken, 0, 0, false, false)
						);
					}

					this.scanner.eat(RIGHTPARENTHESIS);
				} else {
					name = this.scanner.consume(IDENTIFIER);
				}

				return {
					type: 'PseudoClassSelector',
					loc: this.getLocation(start, this.scanner.tokenStart),
					name: name,
					children: children
				};
			},
			generate: function(processChunk, node) {
				processChunk(':');
				processChunk(node.name);

				if (node.children !== null) {
					processChunk('(');
					this.each(processChunk, node);
					processChunk(')');
				}
			},
			walkContext: 'function'
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/PseudoElementSelector
	modules['/css-tree/syntax/node/PseudoElementSelector'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var FUNCTION = TYPE.Function;
		var COLON = TYPE.Colon;
		var RIGHTPARENTHESIS = TYPE.RightParenthesis;

		// :: ident [ '(' .. ')' ]?
		var exports = {
			name: 'PseudoElementSelector',
			structure: {
				name: String,
				children: [['Raw'], null]
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var children = null;
				var name;
				var nameLowerCase;

				this.scanner.eat(COLON);
				this.scanner.eat(COLON);

				if (this.scanner.tokenType === FUNCTION) {
					name = this.scanner.consumeFunctionName();
					nameLowerCase = name.toLowerCase();

					if (this.pseudo.hasOwnProperty(nameLowerCase)) {
						this.scanner.skipSC();
						children = this.pseudo[nameLowerCase].call(this);
						this.scanner.skipSC();
					} else {
						children = new List().appendData(
							this.Raw(this.scanner.currentToken, 0, 0, false, false)
						);
					}

					this.scanner.eat(RIGHTPARENTHESIS);
				} else {
					name = this.scanner.consume(IDENTIFIER);
				}

				return {
					type: 'PseudoElementSelector',
					loc: this.getLocation(start, this.scanner.tokenStart),
					name: name,
					children: children
				};
			},
			generate: function(processChunk, node) {
				processChunk('::');
				processChunk(node.name);

				if (node.children !== null) {
					processChunk('(');
					this.each(processChunk, node);
					processChunk(')');
				}
			},
			walkContext: 'function'
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Ratio
	modules['/css-tree/syntax/node/Ratio'] = function () {
		var isNumber = require('/css-tree/tokenizer').isNumber;
		var TYPE = require('/css-tree/tokenizer').TYPE;
		var NUMBER = TYPE.Number;
		var SOLIDUS = TYPE.Solidus;
		var FULLSTOP = TYPE.FullStop;

		// Terms of <ratio> should to be a positive number (not zero or negative)
		// (see https://drafts.csswg.org/mediaqueries-3/#values)
		// However, -o-min-device-pixel-ratio takes fractional values as a ratio's term
		// and this is using by various sites. Therefore we relax checking on parse
		// to test a term is unsigned number without exponent part.
		// Additional checks may to be applied on lexer validation.
		function consumeNumber(scanner) {
			var value = scanner.consumeNonWS(NUMBER);

			for (var i = 0; i < value.length; i++) {
				var code = value.charCodeAt(i);
				if (!isNumber(code) && code !== FULLSTOP) {
					scanner.error('Unsigned number is expected', scanner.tokenStart - value.length + i);
				}
			}

			if (Number(value) === 0) {
				scanner.error('Zero number is not allowed', scanner.tokenStart - value.length);
			}

			return value;
		}

		// <positive-integer> S* '/' S* <positive-integer>
		var exports = {
			name: 'Ratio',
			structure: {
				left: String,
				right: String
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var left = consumeNumber(this.scanner);
				var right;

				this.scanner.eatNonWS(SOLIDUS);
				right = consumeNumber(this.scanner);

				return {
					type: 'Ratio',
					loc: this.getLocation(start, this.scanner.tokenStart),
					left: left,
					right: right
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.left);
				processChunk('/');
				processChunk(node.right);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Raw
	modules['/css-tree/syntax/node/Raw'] = function () {
		var exports = {
			name: 'Raw',
			structure: {
				value: String
			},
			parse: function(startToken, endTokenType1, endTokenType2, includeTokenType2, excludeWhiteSpace) {
				var startOffset = this.scanner.getTokenStart(startToken);
				var endOffset;

				this.scanner.skip(
					this.scanner.getRawLength(
						startToken,
						endTokenType1,
						endTokenType2,
						includeTokenType2
					)
				);

				if (excludeWhiteSpace && this.scanner.tokenStart > startOffset) {
					endOffset = this.scanner.getOffsetExcludeWS();
				} else {
					endOffset = this.scanner.tokenStart;
				}

				return {
					type: 'Raw',
					loc: this.getLocation(startOffset, endOffset),
					value: this.scanner.source.substring(startOffset, endOffset)
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.value);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Rule
	modules['/css-tree/syntax/node/Rule'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var LEFTCURLYBRACKET = TYPE.LeftCurlyBracket;

		function consumeRaw(startToken) {
			return this.Raw(startToken, LEFTCURLYBRACKET, 0, false, true);
		}

		var exports = {
			name: 'Rule',
			structure: {
				selector: ['SelectorList', 'Raw'],
				block: ['Block']
			},
			parse: function() {
				var startToken = this.scanner.currentToken;
				var startOffset = this.scanner.tokenStart;
				var selector = this.parseSelector
					? this.tolerantParse(this.SelectorList, consumeRaw)
					: consumeRaw.call(this, startToken);
				var block = this.Block(this.Declaration);

				return {
					type: 'Rule',
					loc: this.getLocation(startOffset, this.scanner.tokenStart),
					selector: selector,
					block: block
				};
			},
			generate: function(processChunk, node) {
				this.generate(processChunk, node.selector);
				this.generate(processChunk, node.block);
			},
			walkContext: 'rule'
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Selector
	modules['/css-tree/syntax/node/Selector'] = function () {
		var exports = {
			name: 'Selector',
			structure: {
				children: [[
					'TypeSelector',
					'IdSelector',
					'ClassSelector',
					'AttributeSelector',
					'PseudoClassSelector',
					'PseudoElementSelector',
					'Combinator',
					'WhiteSpace'
				]]
			},
			parse: function() {
				var children = this.readSequence(this.scope.Selector);

				// nothing were consumed
				if (children.isEmpty()) {
					this.scanner.error('Selector is expected');
				}

				return {
					type: 'Selector',
					loc: this.getLocationFromList(children),
					children: children
				};
			},
			generate: function(processChunk, node) {
				this.each(processChunk, node);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/SelectorList
	modules['/css-tree/syntax/node/SelectorList'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var COMMA = TYPE.Comma;
		var LEFTCURLYBRACKET = TYPE.LeftCurlyBracket;

		var exports = {
			name: 'SelectorList',
			structure: {
				children: [['Selector', 'Raw']]
			},
			parse: function() {
				var children = new List();

				while (!this.scanner.eof) {
					children.appendData(this.parseSelector
						? this.Selector()
						: this.Raw(this.scanner.currentToken, COMMA, LEFTCURLYBRACKET, false, false)
					);

					if (this.scanner.tokenType === COMMA) {
						this.scanner.next();
						continue;
					}

					break;
				}

				return {
					type: 'SelectorList',
					loc: this.getLocationFromList(children),
					children: children
				};
			},
			generate: function(processChunk, node) {
				this.eachComma(processChunk, node);
			},
			walkContext: 'selector'
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/String
	modules['/css-tree/syntax/node/String'] = function () {
		var STRING = require('/css-tree/tokenizer').TYPE.String;

		var exports = {
			name: 'String',
			structure: {
				value: String
			},
			parse: function() {
				return {
					type: 'String',
					loc: this.getLocation(this.scanner.tokenStart, this.scanner.tokenEnd),
					value: this.scanner.consume(STRING)
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.value);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/StyleSheet
	modules['/css-tree/syntax/node/StyleSheet'] = function () {
		var List = require('/css-tree/utils/list');
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var WHITESPACE = TYPE.WhiteSpace;
		var COMMENT = TYPE.Comment;
		var EXCLAMATIONMARK = TYPE.ExclamationMark;
		var ATRULE = TYPE.Atrule;
		var CDO = TYPE.CDO;
		var CDC = TYPE.CDC;

		function consumeRaw(startToken) {
			return this.Raw(startToken, 0, 0, false, false);
		}

		var exports = {
			name: 'StyleSheet',
			structure: {
				children: [['Comment', 'Atrule', 'Rule', 'Raw']]
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var children = new List();
				var child;

				scan:
				while (!this.scanner.eof) {
					switch (this.scanner.tokenType) {
						case WHITESPACE:
							this.scanner.next();
							continue;

						case COMMENT:
							// ignore comments except exclamation comments (i.e. /*! .. */) on top level
							if (this.scanner.source.charCodeAt(this.scanner.tokenStart + 2) !== EXCLAMATIONMARK) {
								this.scanner.next();
								continue;
							}

							child = this.Comment();
							break;

						case CDO: // <!--
							child = this.CDO();
							break;

						case CDC: // -->
							child = this.CDC();
							break;

						// CSS Syntax Module Level 3
						// ยง2.2 Error handling
						// At the "top level" of a stylesheet, an <at-keyword-token> starts an at-rule.
						case ATRULE:
							child = this.Atrule();
							break;

						// Anything else starts a qualified rule ...
						default:
							child = this.tolerantParse(this.Rule, consumeRaw);
					}

					children.appendData(child);
				}

				return {
					type: 'StyleSheet',
					loc: this.getLocation(start, this.scanner.tokenStart),
					children: children
				};
			},
			generate: function(processChunk, node) {
				this.each(processChunk, node);
			},
			walkContext: 'stylesheet'
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/TypeSelector
	modules['/css-tree/syntax/node/TypeSelector'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var ASTERISK = TYPE.Asterisk;
		var VERTICALLINE = TYPE.VerticalLine;

		function eatIdentifierOrAsterisk() {
			if (this.scanner.tokenType !== IDENTIFIER &&
				this.scanner.tokenType !== ASTERISK) {
				this.scanner.error('Identifier or asterisk is expected');
			}

			this.scanner.next();
		}

		// ident
		// ident|ident
		// ident|*
		// *
		// *|ident
		// *|*
		// |ident
		// |*
		var exports = {
			name: 'TypeSelector',
			structure: {
				name: String
			},
			parse: function() {
				var start = this.scanner.tokenStart;

				if (this.scanner.tokenType === VERTICALLINE) {
					this.scanner.next();
					eatIdentifierOrAsterisk.call(this);
				} else {
					eatIdentifierOrAsterisk.call(this);

					if (this.scanner.tokenType === VERTICALLINE) {
						this.scanner.next();
						eatIdentifierOrAsterisk.call(this);
					}
				}

				return {
					type: 'TypeSelector',
					loc: this.getLocation(start, this.scanner.tokenStart),
					name: this.scanner.substrToCursor(start)
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.name);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/UnicodeRange
	modules['/css-tree/syntax/node/UnicodeRange'] = function () {
		var isHex = require('/css-tree/tokenizer').isHex;
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var NUMBER = TYPE.Number;
		var PLUSSIGN = TYPE.PlusSign;
		var HYPHENMINUS = TYPE.HyphenMinus;
		var FULLSTOP = TYPE.FullStop;
		var QUESTIONMARK = TYPE.QuestionMark;

		function scanUnicodeNumber(scanner) {
			for (var pos = scanner.tokenStart + 1; pos < scanner.tokenEnd; pos++) {
				var code = scanner.source.charCodeAt(pos);

				// break on fullstop or hyperminus/plussign after exponent
				if (code === FULLSTOP || code === PLUSSIGN) {
					// break token, exclude symbol
					scanner.tokenStart = pos;
					return false;
				}
			}

			return true;
		}

		// https://drafts.csswg.org/css-syntax-3/#urange
		function scanUnicodeRange(scanner) {
			var hexStart = scanner.tokenStart + 1; // skip +
			var hexLength = 0;

			scan: {
				if (scanner.tokenType === NUMBER) {
					if (scanner.source.charCodeAt(scanner.tokenStart) !== FULLSTOP && scanUnicodeNumber(scanner)) {
						scanner.next();
					} else if (scanner.source.charCodeAt(scanner.tokenStart) !== HYPHENMINUS) {
						break scan;
					}
				} else {
					scanner.next(); // PLUSSIGN
				}

				if (scanner.tokenType === HYPHENMINUS) {
					scanner.next();
				}

				if (scanner.tokenType === NUMBER) {
					scanner.next();
				}

				if (scanner.tokenType === IDENTIFIER) {
					scanner.next();
				}

				if (scanner.tokenStart === hexStart) {
					scanner.error('Unexpected input', hexStart);
				}
			}

			// validate for U+x{1,6} or U+x{1,6}-x{1,6}
			// where x is [0-9a-fA-F]
			for (var i = hexStart, wasHyphenMinus = false; i < scanner.tokenStart; i++) {
				var code = scanner.source.charCodeAt(i);

				if (isHex(code) === false && (code !== HYPHENMINUS || wasHyphenMinus)) {
					scanner.error('Unexpected input', i);
				}

				if (code === HYPHENMINUS) {
					// hex sequence shouldn't be an empty
					if (hexLength === 0) {
						scanner.error('Unexpected input', i);
					}

					wasHyphenMinus = true;
					hexLength = 0;
				} else {
					hexLength++;

					// too long hex sequence
					if (hexLength > 6) {
						scanner.error('Too long hex sequence', i);
					}
				}

			}

			// check we have a non-zero sequence
			if (hexLength === 0) {
				scanner.error('Unexpected input', i - 1);
			}

			// U+abc???
			if (!wasHyphenMinus) {
				// consume as many U+003F QUESTION MARK (?) code points as possible
				for (; hexLength < 6 && !scanner.eof; scanner.next()) {
					if (scanner.tokenType !== QUESTIONMARK) {
						break;
					}

					hexLength++;
				}
			}
		}

		var exports = {
			name: 'UnicodeRange',
			structure: {
				value: String
			},
			parse: function() {
				var start = this.scanner.tokenStart;

				this.scanner.next(); // U or u
				scanUnicodeRange(this.scanner);

				return {
					type: 'UnicodeRange',
					loc: this.getLocation(start, this.scanner.tokenStart),
					value: this.scanner.substrToCursor(start)
				};
			},
			generate: function(processChunk, node) {
				processChunk(node.value);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Url
	modules['/css-tree/syntax/node/Url'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var STRING = TYPE.String;
		var URL = TYPE.Url;
		var RAW = TYPE.Raw;
		var RIGHTPARENTHESIS = TYPE.RightParenthesis;

		// url '(' S* (string | raw) S* ')'
		var exports = {
			name: 'Url',
			structure: {
				value: ['String', 'Raw']
			},
			parse: function() {
				var start = this.scanner.tokenStart;
				var value;

				this.scanner.eat(URL);
				this.scanner.skipSC();

				switch (this.scanner.tokenType) {
					case STRING:
						value = this.String();
						break;

					case RAW:
						value = this.Raw(this.scanner.currentToken, 0, RAW, true, false);
						break;

					default:
						this.scanner.error('String or Raw is expected');
				}

				this.scanner.skipSC();
				this.scanner.eat(RIGHTPARENTHESIS);

				return {
					type: 'Url',
					loc: this.getLocation(start, this.scanner.tokenStart),
					value: value
				};
			},
			generate: function(processChunk, node) {
				processChunk('url');
				processChunk('(');
				this.generate(processChunk, node.value);
				processChunk(')');
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/Value
	modules['/css-tree/syntax/node/Value'] = function () {
		var endsWith = require('/css-tree/tokenizer').endsWith;
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var WHITESPACE = TYPE.WhiteSpace;
		var COMMENT = TYPE.Comment;
		var FUNCTION = TYPE.Function;
		var COLON = TYPE.Colon;
		var SEMICOLON = TYPE.Semicolon;
		var EXCLAMATIONMARK = TYPE.ExclamationMark;

		// 'progid:' ws* 'DXImageTransform.Microsoft.' ident ws* '(' .* ')'
		function checkProgid(scanner) {
			var offset = 0;

			for (var type; type = scanner.lookupType(offset); offset++) {
				if (type !== WHITESPACE && type !== COMMENT) {
					break;
				}
			}

			if (scanner.lookupValue(offset, 'alpha(') ||
				scanner.lookupValue(offset, 'chroma(') ||
				scanner.lookupValue(offset, 'dropshadow(')) {
				if (scanner.lookupType(offset) !== FUNCTION) {
					return false;
				}
			} else {
				if (scanner.lookupValue(offset, 'progid') === false ||
					scanner.lookupType(offset + 1) !== COLON) {
					return false;
				}
			}

			return true;
		}

		var exports = {
			name: 'Value',
			structure: {
				children: [[]]
			},
			parse: function(property) {
				// special parser for filter property since it can contains non-standart syntax for old IE
				if (property !== null && endsWith(property, 'filter') && checkProgid(this.scanner)) {
					this.scanner.skipSC();
					return this.Raw(this.scanner.currentToken, EXCLAMATIONMARK, SEMICOLON, false, false);
				}

				var start = this.scanner.tokenStart;
				var children = this.readSequence(this.scope.Value);

				return {
					type: 'Value',
					loc: this.getLocation(start, this.scanner.tokenStart),
					children: children
				};
			},
			generate: function(processChunk, node) {
				this.each(processChunk, node);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/node/WhiteSpace
	modules['/css-tree/syntax/node/WhiteSpace'] = function () {
		var WHITESPACE = require('/css-tree/tokenizer').TYPE.WhiteSpace;
		var SPACE = Object.freeze({
			type: 'WhiteSpace',
			loc: null,
			value: ' '
		});

		var exports = {
			name: 'WhiteSpace',
			structure: {
				value: String
			},
			parse: function() {
				this.scanner.eat(WHITESPACE);
				return SPACE;

				// return {
				//     type: 'WhiteSpace',
				//     loc: this.getLocation(this.scanner.tokenStart, this.scanner.tokenEnd),
				//     value: this.scanner.consume(WHITESPACE)
				// };
			},
			generate: function(processChunk, node) {
				processChunk(node.value);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo
	modules['/css-tree/syntax/pseudo'] = function () {
		var exports = {
			'dir': require('/css-tree/syntax/pseudo/dir'),
			'has': require('/css-tree/syntax/pseudo/has'),
			'lang': require('/css-tree/syntax/pseudo/lang'),
			'matches': require('/css-tree/syntax/pseudo/matches'),
			'not': require('/css-tree/syntax/pseudo/not'),
			'nth-child': require('/css-tree/syntax/pseudo/nth-child'),
			'nth-last-child': require('/css-tree/syntax/pseudo/nth-last-child'),
			'nth-last-of-type': require('/css-tree/syntax/pseudo/nth-last-of-type'),
			'nth-of-type': require('/css-tree/syntax/pseudo/nth-of-type'),
			'slotted': require('/css-tree/syntax/pseudo/slotted')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/common/nth
	modules['/css-tree/syntax/pseudo/common/nth'] = function () {
		var List = require('/css-tree/utils/list');
		var DISALLOW_OF_CLAUSE = false;

		var exports = {
			parse: function nth() {
				return new List().appendData(
					this.Nth(DISALLOW_OF_CLAUSE)
				);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/common/nthWithOfClause
	modules['/css-tree/syntax/pseudo/common/nthWithOfClause'] = function () {
		var List = require('/css-tree/utils/list');
		var ALLOW_OF_CLAUSE = true;

		var exports = {
			parse: function() {
				return new List().appendData(
					this.Nth(ALLOW_OF_CLAUSE)
				);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/common/selectorList
	modules['/css-tree/syntax/pseudo/common/selectorList'] = function () {
		var List = require('/css-tree/utils/list');

		var exports = {
			parse: function selectorList() {
				return new List().appendData(
					this.SelectorList()
				);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/dir
	modules['/css-tree/syntax/pseudo/dir'] = function () {
		var List = require('/css-tree/utils/list');

		var exports = {
			parse: function() {
				return new List().appendData(
					this.Identifier()
				);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/has
	modules['/css-tree/syntax/pseudo/has'] = function () {
		var List = require('/css-tree/utils/list');

		var exports = {
			parse: function() {
				return new List().appendData(
					this.SelectorList()
				);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/lang
	modules['/css-tree/syntax/pseudo/lang'] = function () {
		var List = require('/css-tree/utils/list');

		var exports = {
			parse: function() {
				return new List().appendData(
					this.Identifier()
				);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/matches
	modules['/css-tree/syntax/pseudo/matches'] = function () {
		var exports = require('/css-tree/syntax/pseudo/common/selectorList');

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/not
	modules['/css-tree/syntax/pseudo/not'] = function () {
		var exports = require('/css-tree/syntax/pseudo/common/selectorList');

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/nth-child
	modules['/css-tree/syntax/pseudo/nth-child'] = function () {
		var exports = require('/css-tree/syntax/pseudo/common/nthWithOfClause');

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/nth-last-child
	modules['/css-tree/syntax/pseudo/nth-last-child'] = function () {
		var exports = require('/css-tree/syntax/pseudo/common/nthWithOfClause');

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/nth-last-of-type
	modules['/css-tree/syntax/pseudo/nth-last-of-type'] = function () {
		var exports = require('/css-tree/syntax/pseudo/common/nth');

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/nth-of-type
	modules['/css-tree/syntax/pseudo/nth-of-type'] = function () {
		var exports = require('/css-tree/syntax/pseudo/common/nth');

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/pseudo/slotted
	modules['/css-tree/syntax/pseudo/slotted'] = function () {
		var List = require('/css-tree/utils/list');

		var exports = {
			parse: function compoundSelector() {
				return new List().appendData(
					this.Selector()
				);
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/scope
	modules['/css-tree/syntax/scope'] = function () {
		var exports = {
			AtrulePrelude: require('/css-tree/syntax/scope/atrulePrelude'),
			Selector: require('/css-tree/syntax/scope/selector'),
			Value: require('/css-tree/syntax/scope/value')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/scope/atrulePrelude
	modules['/css-tree/syntax/scope/atrulePrelude'] = function () {
		var exports = {
			getNode: require('/css-tree/syntax/scope/default')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/scope/default
	modules['/css-tree/syntax/scope/default'] = function () {
		var cmpChar = require('/css-tree/tokenizer').cmpChar;
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var STRING = TYPE.String;
		var NUMBER = TYPE.Number;
		var FUNCTION = TYPE.Function;
		var URL = TYPE.Url;
		var NUMBERSIGN = TYPE.NumberSign;
		var LEFTPARENTHESIS = TYPE.LeftParenthesis;
		var LEFTSQUAREBRACKET = TYPE.LeftSquareBracket;
		var PLUSSIGN = TYPE.PlusSign;
		var HYPHENMINUS = TYPE.HyphenMinus;
		var COMMA = TYPE.Comma;
		var SOLIDUS = TYPE.Solidus;
		var ASTERISK = TYPE.Asterisk;
		var PERCENTSIGN = TYPE.PercentSign;
		var BACKSLASH = TYPE.Backslash;
		var U = 117; // 'u'.charCodeAt(0)

		var exports = function defaultRecognizer(context) {
			switch (this.scanner.tokenType) {
				case NUMBERSIGN:
					return this.HexColor();

				case COMMA:
					context.space = null;
					context.ignoreWSAfter = true;
					return this.Operator();

				case SOLIDUS:
				case ASTERISK:
				case PLUSSIGN:
				case HYPHENMINUS:
					return this.Operator();

				case LEFTPARENTHESIS:
					return this.Parentheses(this.readSequence, context.recognizer);

				case LEFTSQUAREBRACKET:
					return this.Brackets(this.readSequence, context.recognizer);

				case STRING:
					return this.String();

				case NUMBER:
					switch (this.scanner.lookupType(1)) {
						case PERCENTSIGN:
							return this.Percentage();

						case IDENTIFIER:
							// edge case: number with folowing \0 and \9 hack shouldn't to be a Dimension
							if (cmpChar(this.scanner.source, this.scanner.tokenEnd, BACKSLASH)) {
								return this.Number();
							} else {
								return this.Dimension();
							}

						default:
							return this.Number();
					}

				case FUNCTION:
					return this.Function(this.readSequence, context.recognizer);

				case URL:
					return this.Url();

				case IDENTIFIER:
					// check for unicode range, it should start with u+ or U+
					if (cmpChar(this.scanner.source, this.scanner.tokenStart, U) &&
						cmpChar(this.scanner.source, this.scanner.tokenStart + 1, PLUSSIGN)) {
						return this.UnicodeRange();
					} else {
						return this.Identifier();
					}
			}
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/scope/selector
	modules['/css-tree/syntax/scope/selector'] = function () {
		var TYPE = require('/css-tree/tokenizer').TYPE;

		var IDENTIFIER = TYPE.Identifier;
		var NUMBER = TYPE.Number;
		var NUMBERSIGN = TYPE.NumberSign;
		var LEFTSQUAREBRACKET = TYPE.LeftSquareBracket;
		var PLUSSIGN = TYPE.PlusSign;
		var SOLIDUS = TYPE.Solidus;
		var ASTERISK = TYPE.Asterisk;
		var FULLSTOP = TYPE.FullStop;
		var COLON = TYPE.Colon;
		var GREATERTHANSIGN = TYPE.GreaterThanSign;
		var VERTICALLINE = TYPE.VerticalLine;
		var TILDE = TYPE.Tilde;

		function getNode(context) {
			switch (this.scanner.tokenType) {
				case PLUSSIGN:
				case GREATERTHANSIGN:
				case TILDE:
					context.space = null;
					context.ignoreWSAfter = true;
					return this.Combinator();

				case SOLIDUS:  // /deep/
					return this.Combinator();

				case FULLSTOP:
					return this.ClassSelector();

				case LEFTSQUAREBRACKET:
					return this.AttributeSelector();

				case NUMBERSIGN:
					return this.IdSelector();

				case COLON:
					if (this.scanner.lookupType(1) === COLON) {
						return this.PseudoElementSelector();
					} else {
						return this.PseudoClassSelector();
					}

				case IDENTIFIER:
				case ASTERISK:
				case VERTICALLINE:
					return this.TypeSelector();

				case NUMBER:
					return this.Percentage();
			}
		};

		var exports = {
			getNode: getNode
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/scope/value
	modules['/css-tree/syntax/scope/value'] = function () {
		var exports = {
			getNode: require('/css-tree/syntax/scope/default'),
			'-moz-element': require('/css-tree/syntax/function/element'),
			'element': require('/css-tree/syntax/function/element'),
			'expression': require('/css-tree/syntax/function/expression'),
			'var': require('/css-tree/syntax/function/var')
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/syntax/create
	modules['/css-tree/syntax/create'] = function () {
		var List = require('/css-tree/utils/list');
		var Tokenizer = require('/css-tree/tokenizer');
		var Lexer = require('/css-tree/lexer/Lexer');
		var grammar = require('/css-tree/lexer/grammar');
		var createParser = require('/css-tree/parser/create');
		var createGenerator = require('/css-tree/generator/create');
		var createConvertor = require('/css-tree/convertor/create');
		var createWalker = require('/css-tree/walker/create');
		var clone = require('/css-tree/utils/clone');
		var names = require('/css-tree/utils/names');
		var mix = require('/css-tree/syntax/config/mix');

		function assign(dest, src) {
			for (var key in src) {
				dest[key] = src[key];
			}

			return dest;
		}

		function createSyntax(config) {
			var parse = createParser(config);
			var walker = createWalker(config);
			var generator = createGenerator(config);
			var convertor = createConvertor(walker);

			var syntax = {
				List: List,
				Tokenizer: Tokenizer,
				Lexer: Lexer,

				property: names.property,
				keyword: names.keyword,

				grammar: grammar,
				lexer: null,
				createLexer: function(config) {
					return new Lexer(config, syntax, syntax.lexer.structure);
				},

				parse: parse,

				walk: walker.walk,
				walkUp: walker.walkUp,
				walkRules: walker.walkRules,
				walkRulesRight: walker.walkRulesRight,
				walkDeclarations: walker.walkDeclarations,

				translate: generator.translate,
				/*BT-
				translateWithSourceMap: generator.translateWithSourceMap,
				*/
				translateMarkup: generator.translateMarkup,

				clone: clone,
				fromPlainObject: convertor.fromPlainObject,
				toPlainObject: convertor.toPlainObject,

				createSyntax: function(config) {
					return createSyntax(mix({}, config));
				},
				fork: function(extension) {
					var base = mix({}, config); // copy of config
					return createSyntax(
						typeof extension === 'function'
							? extension(base, assign)
							: mix(base, extension)
					);
				}
			};

			syntax.lexer = new Lexer({
				generic: true,
				types: config.types,
				properties: config.properties,
				node: config.node
			}, syntax);

			return syntax;
		};

		var exports = {};
		exports.create = function(config) {
			return createSyntax(mix({}, config));
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/tokenizer
	modules['/css-tree/tokenizer'] = function () {
		var exports = require('/css-tree/tokenizer/Tokenizer');

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/tokenizer/const
	modules['/css-tree/tokenizer/const'] = function () {
		'use strict';

		// token types (note: value shouldn't intersect with used char codes)
		var WHITESPACE = 1;
		var IDENTIFIER = 2;
		var NUMBER = 3;
		var STRING = 4;
		var COMMENT = 5;
		var PUNCTUATOR = 6;
		var CDO = 7;
		var CDC = 8;
		var ATRULE = 14;
		var FUNCTION = 15;
		var URL = 16;
		var RAW = 17;

		var TAB = 9;
		var N = 10;
		var F = 12;
		var R = 13;
		var SPACE = 32;

		var TYPE = {
			WhiteSpace:   WHITESPACE,
			Identifier:   IDENTIFIER,
			Number:           NUMBER,
			String:           STRING,
			Comment:         COMMENT,
			Punctuator:   PUNCTUATOR,
			CDO:                 CDO,
			CDC:                 CDC,
			Atrule:           ATRULE,
			Function:       FUNCTION,
			Url:                 URL,
			Raw:                 RAW,

			ExclamationMark:      33,  // !
			QuotationMark:        34,  // "
			NumberSign:           35,  // #
			DollarSign:           36,  // $
			PercentSign:          37,  // %
			Ampersand:            38,  // &
			Apostrophe:           39,  // '
			LeftParenthesis:      40,  // (
			RightParenthesis:     41,  // )
			Asterisk:             42,  // *
			PlusSign:             43,  // +
			Comma:                44,  // ,
			HyphenMinus:          45,  // -
			FullStop:             46,  // .
			Solidus:              47,  // /
			Colon:                58,  // :
			Semicolon:            59,  // ;
			LessThanSign:         60,  // <
			EqualsSign:           61,  // =
			GreaterThanSign:      62,  // >
			QuestionMark:         63,  // ?
			CommercialAt:         64,  // @
			LeftSquareBracket:    91,  // [
			Backslash:            92,  // \
			RightSquareBracket:   93,  // ]
			CircumflexAccent:     94,  // ^
			LowLine:              95,  // _
			GraveAccent:          96,  // `
			LeftCurlyBracket:    123,  // {
			VerticalLine:        124,  // |
			RightCurlyBracket:   125,  // }
			Tilde:               126   // ~
		};

		var NAME = Object.keys(TYPE).reduce(function(result, key) {
			result[TYPE[key]] = key;
			return result;
		}, {});

		// https://drafts.csswg.org/css-syntax/#tokenizer-definitions
		// > non-ASCII code point
		// >   A code point with a value equal to or greater than U+0080 <control>
		// > name-start code point
		// >   A letter, a non-ASCII code point, or U+005F LOW LINE (_).
		// > name code point
		// >   A name-start code point, a digit, or U+002D HYPHEN-MINUS (-)
		// That means only ASCII code points has a special meaning and we a maps for 0..127 codes only
		var SafeUint32Array = typeof Uint32Array !== 'undefined' ? Uint32Array : Array; // fallback on Array when TypedArray is not supported
		var SYMBOL_TYPE = new SafeUint32Array(0x80);
		var PUNCTUATION = new SafeUint32Array(0x80);
		var STOP_URL_RAW = new SafeUint32Array(0x80);

		for (var i = 0; i < SYMBOL_TYPE.length; i++) {
			SYMBOL_TYPE[i] = IDENTIFIER;
		}

		// fill categories
		[
			TYPE.ExclamationMark,    // !
			TYPE.QuotationMark,      // "
			TYPE.NumberSign,         // #
			TYPE.DollarSign,         // $
			TYPE.PercentSign,        // %
			TYPE.Ampersand,          // &
			TYPE.Apostrophe,         // '
			TYPE.LeftParenthesis,    // (
			TYPE.RightParenthesis,   // )
			TYPE.Asterisk,           // *
			TYPE.PlusSign,           // +
			TYPE.Comma,              // ,
			TYPE.HyphenMinus,        // -
			TYPE.FullStop,           // .
			TYPE.Solidus,            // /
			TYPE.Colon,              // :
			TYPE.Semicolon,          // ;
			TYPE.LessThanSign,       // <
			TYPE.EqualsSign,         // =
			TYPE.GreaterThanSign,    // >
			TYPE.QuestionMark,       // ?
			TYPE.CommercialAt,       // @
			TYPE.LeftSquareBracket,  // [
			// TYPE.Backslash,          // \
			TYPE.RightSquareBracket, // ]
			TYPE.CircumflexAccent,   // ^
			// TYPE.LowLine,            // _
			TYPE.GraveAccent,        // `
			TYPE.LeftCurlyBracket,   // {
			TYPE.VerticalLine,       // |
			TYPE.RightCurlyBracket,  // }
			TYPE.Tilde               // ~
		].forEach(function(key) {
			SYMBOL_TYPE[Number(key)] = PUNCTUATOR;
			PUNCTUATION[Number(key)] = PUNCTUATOR;
		});

		for (var i = 48; i <= 57; i++) {
			SYMBOL_TYPE[i] = NUMBER;
		}

		SYMBOL_TYPE[SPACE] = WHITESPACE;
		SYMBOL_TYPE[TAB] = WHITESPACE;
		SYMBOL_TYPE[N] = WHITESPACE;
		SYMBOL_TYPE[R] = WHITESPACE;
		SYMBOL_TYPE[F] = WHITESPACE;

		SYMBOL_TYPE[TYPE.Apostrophe] = STRING;
		SYMBOL_TYPE[TYPE.QuotationMark] = STRING;

		STOP_URL_RAW[SPACE] = 1;
		STOP_URL_RAW[TAB] = 1;
		STOP_URL_RAW[N] = 1;
		STOP_URL_RAW[R] = 1;
		STOP_URL_RAW[F] = 1;
		STOP_URL_RAW[TYPE.Apostrophe] = 1;
		STOP_URL_RAW[TYPE.QuotationMark] = 1;
		STOP_URL_RAW[TYPE.LeftParenthesis] = 1;
		STOP_URL_RAW[TYPE.RightParenthesis] = 1;

		// whitespace is punctuation ...
		PUNCTUATION[SPACE] = PUNCTUATOR;
		PUNCTUATION[TAB] = PUNCTUATOR;
		PUNCTUATION[N] = PUNCTUATOR;
		PUNCTUATION[R] = PUNCTUATOR;
		PUNCTUATION[F] = PUNCTUATOR;
		// ... hyper minus is not
		PUNCTUATION[TYPE.HyphenMinus] = 0;

		var exports = {
			TYPE: TYPE,
			NAME: NAME,

			SYMBOL_TYPE: SYMBOL_TYPE,
			PUNCTUATION: PUNCTUATION,
			STOP_URL_RAW: STOP_URL_RAW
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/tokenizer/error
	modules['/css-tree/tokenizer/error'] = function () {
		'use strict';

		var MAX_LINE_LENGTH = 100;
		var OFFSET_CORRECTION = 60;
		var TAB_REPLACEMENT = '    ';

		function sourceFragment(error, extraLines) {
			function processLines(start, end) {
				return lines.slice(start, end).map(function(line, idx) {
					var num = String(start + idx + 1);

					while (num.length < maxNumLength) {
						num = ' ' + num;
					}

					return num + ' |' + line;
				}).join('\n');
			}

			var lines = error.source.split(/\n|\r\n?|\f/);
			var line = error.line;
			var column = error.column;
			var startLine = Math.max(1, line - extraLines) - 1;
			var endLine = Math.min(line + extraLines, lines.length + 1);
			var maxNumLength = Math.max(4, String(endLine).length) + 1;
			var cutLeft = 0;

			// correct column according to replaced tab before column
			column += (TAB_REPLACEMENT.length - 1) * (lines[line - 1].substr(0, column - 1).match(/\t/g) || []).length;

			if (column > MAX_LINE_LENGTH) {
				cutLeft = column - OFFSET_CORRECTION + 3;
				column = OFFSET_CORRECTION - 2;
			}

			for (var i = startLine; i <= endLine; i++) {
				if (i >= 0 && i < lines.length) {
					lines[i] = lines[i].replace(/\t/g, TAB_REPLACEMENT);
					lines[i] =
						(cutLeft > 0 && lines[i].length > cutLeft ? '\u2026' : '') +
						lines[i].substr(cutLeft, MAX_LINE_LENGTH - 2) +
						(lines[i].length > cutLeft + MAX_LINE_LENGTH - 1 ? '\u2026' : '');
				}
			}

			return [
				processLines(startLine, line),
				new Array(column + maxNumLength + 2).join('-') + '^',
				processLines(line, endLine)
			].join('\n');
		}

		var CssSyntaxError = function(message, source, offset, line, column) {
			// some VMs prevent setting line/column otherwise (iOS Safari 10 even throw an exception)
			var error = Object.create(SyntaxError.prototype);

			error.name = 'CssSyntaxError';
			error.message = message;
			error.stack = (new Error().stack || '').replace(/^.+\n/, error.name + ': ' + error.message + '\n');
			error.source = source;
			error.offset = offset;
			error.line = line;
			error.column = column;

			error.sourceFragment = function(extraLines) {
				return sourceFragment(error, isNaN(extraLines) ? 0 : extraLines);
			};
			Object.defineProperty(error, 'formattedMessage', {
				get: function() {
					return (
						'Parse error: ' + error.message + '\n' +
						sourceFragment(error, 2)
					);
				}
			});

			// for backward capability
			error.parseError = {
				offset: offset,
				line: line,
				column: column
			};

			return error;
		};

		return CssSyntaxError;
	};
	//#endregion

	//#region URL: /css-tree/tokenizer/Tokenizer
	modules['/css-tree/tokenizer/Tokenizer'] = function () {
		'use strict';

		var CssSyntaxError = require('/css-tree/tokenizer/error');

		var constants = require('/css-tree/tokenizer/const');
		var TYPE = constants.TYPE;
		var NAME = constants.NAME;
		var SYMBOL_TYPE = constants.SYMBOL_TYPE;

		var utils = require('/css-tree/tokenizer/utils');
		var firstCharOffset = utils.firstCharOffset;
		var cmpStr = utils.cmpStr;
		var isNumber = utils.isNumber;
		var findLastNonSpaceLocation = utils.findLastNonSpaceLocation;
		var findWhiteSpaceEnd = utils.findWhiteSpaceEnd;
		var findCommentEnd = utils.findCommentEnd;
		var findStringEnd = utils.findStringEnd;
		var findNumberEnd = utils.findNumberEnd;
		var findIdentifierEnd = utils.findIdentifierEnd;
		var findUrlRawEnd = utils.findUrlRawEnd;

		var NULL = 0;
		var WHITESPACE = TYPE.WhiteSpace;
		var IDENTIFIER = TYPE.Identifier;
		var NUMBER = TYPE.Number;
		var STRING = TYPE.String;
		var COMMENT = TYPE.Comment;
		var PUNCTUATOR = TYPE.Punctuator;
		var CDO = TYPE.CDO;
		var CDC = TYPE.CDC;
		var ATRULE = TYPE.Atrule;
		var FUNCTION = TYPE.Function;
		var URL = TYPE.Url;
		var RAW = TYPE.Raw;

		var N = 10;
		var F = 12;
		var R = 13;
		var STAR = TYPE.Asterisk;
		var SLASH = TYPE.Solidus;
		var FULLSTOP = TYPE.FullStop;
		var PLUSSIGN = TYPE.PlusSign;
		var HYPHENMINUS = TYPE.HyphenMinus;
		var GREATERTHANSIGN = TYPE.GreaterThanSign;
		var LESSTHANSIGN = TYPE.LessThanSign;
		var EXCLAMATIONMARK = TYPE.ExclamationMark;
		var COMMERCIALAT = TYPE.CommercialAt;
		var QUOTATIONMARK = TYPE.QuotationMark;
		var APOSTROPHE = TYPE.Apostrophe;
		var LEFTPARENTHESIS = TYPE.LeftParenthesis;
		var RIGHTPARENTHESIS = TYPE.RightParenthesis;
		var LEFTCURLYBRACKET = TYPE.LeftCurlyBracket;
		var RIGHTCURLYBRACKET = TYPE.RightCurlyBracket;
		var LEFTSQUAREBRACKET = TYPE.LeftSquareBracket;
		var RIGHTSQUAREBRACKET = TYPE.RightSquareBracket;

		var MIN_BUFFER_SIZE = 16 * 1024;
		var OFFSET_MASK = 0x00FFFFFF;
		var TYPE_SHIFT = 24;
		var SafeUint32Array = typeof Uint32Array !== 'undefined' ? Uint32Array : Array; // fallback on Array when TypedArray is not supported

		function computeLinesAndColumns(tokenizer, source) {
			var sourceLength = source.length;
			var start = firstCharOffset(source);
			var lines = tokenizer.lines;
			var line = tokenizer.startLine;
			var columns = tokenizer.columns;
			var column = tokenizer.startColumn;

			if (lines === null || lines.length < sourceLength + 1) {
				lines = new SafeUint32Array(Math.max(sourceLength + 1024, MIN_BUFFER_SIZE));
				columns = new SafeUint32Array(lines.length);
			}

			for (var i = start; i < sourceLength; i++) {
				var code = source.charCodeAt(i);

				lines[i] = line;
				columns[i] = column++;

				if (code === N || code === R || code === F) {
					if (code === R && i + 1 < sourceLength && source.charCodeAt(i + 1) === N) {
						i++;
						lines[i] = line;
						columns[i] = column;
					}

					line++;
					column = 1;
				}
			}

			lines[i] = line;
			columns[i] = column;

			tokenizer.linesAnsColumnsComputed = true;
			tokenizer.lines = lines;
			tokenizer.columns = columns;
		}

		function tokenLayout(tokenizer, source, startPos) {
			var sourceLength = source.length;
			var offsetAndType = tokenizer.offsetAndType;
			var balance = tokenizer.balance;
			var tokenCount = 0;
			var prevType = 0;
			var offset = startPos;
			var anchor = 0;
			var balanceCloseCode = 0;
			var balanceStart = 0;
			var balancePrev = 0;

			if (offsetAndType === null || offsetAndType.length < sourceLength + 1) {
				offsetAndType = new SafeUint32Array(sourceLength + 1024);
				balance = new SafeUint32Array(sourceLength + 1024);
			}

			while (offset < sourceLength) {
				var code = source.charCodeAt(offset);
				var type = code < 0x80 ? SYMBOL_TYPE[code] : IDENTIFIER;

				balance[tokenCount] = sourceLength;

				switch (type) {
					case WHITESPACE:
						offset = findWhiteSpaceEnd(source, offset + 1);
						break;

					case PUNCTUATOR:
						switch (code) {
							case balanceCloseCode:
								balancePrev = balanceStart & OFFSET_MASK;
								balanceStart = balance[balancePrev];
								balanceCloseCode = balanceStart >> TYPE_SHIFT;
								balance[tokenCount] = balancePrev;
								balance[balancePrev++] = tokenCount;
								for (; balancePrev < tokenCount; balancePrev++) {
									if (balance[balancePrev] === sourceLength) {
										balance[balancePrev] = tokenCount;
									}
								}
								break;

							case LEFTSQUAREBRACKET:
								balance[tokenCount] = balanceStart;
								balanceCloseCode = RIGHTSQUAREBRACKET;
								balanceStart = (balanceCloseCode << TYPE_SHIFT) | tokenCount;
								break;

							case LEFTCURLYBRACKET:
								balance[tokenCount] = balanceStart;
								balanceCloseCode = RIGHTCURLYBRACKET;
								balanceStart = (balanceCloseCode << TYPE_SHIFT) | tokenCount;
								break;

							case LEFTPARENTHESIS:
								balance[tokenCount] = balanceStart;
								balanceCloseCode = RIGHTPARENTHESIS;
								balanceStart = (balanceCloseCode << TYPE_SHIFT) | tokenCount;
								break;
						}

						// /*
						if (code === STAR && prevType === SLASH) {
							type = COMMENT;
							offset = findCommentEnd(source, offset + 1);
							tokenCount--; // rewrite prev token
							break;
						}

						// edge case for -.123 and +.123
						if (code === FULLSTOP && (prevType === PLUSSIGN || prevType === HYPHENMINUS)) {
							if (offset + 1 < sourceLength && isNumber(source.charCodeAt(offset + 1))) {
								type = NUMBER;
								offset = findNumberEnd(source, offset + 2, false);
								tokenCount--; // rewrite prev token
								break;
							}
						}

						// <!--
						if (code === EXCLAMATIONMARK && prevType === LESSTHANSIGN) {
							if (offset + 2 < sourceLength &&
								source.charCodeAt(offset + 1) === HYPHENMINUS &&
								source.charCodeAt(offset + 2) === HYPHENMINUS) {
								type = CDO;
								offset = offset + 3;
								tokenCount--; // rewrite prev token
								break;
							}
						}

						// -->
						if (code === HYPHENMINUS && prevType === HYPHENMINUS) {
							if (offset + 1 < sourceLength && source.charCodeAt(offset + 1) === GREATERTHANSIGN) {
								type = CDC;
								offset = offset + 2;
								tokenCount--; // rewrite prev token
								break;
							}
						}

						// ident(
						if (code === LEFTPARENTHESIS && prevType === IDENTIFIER) {
							offset = offset + 1;
							tokenCount--; // rewrite prev token
							balance[tokenCount] = balance[tokenCount + 1];
							balanceStart--;

							// 4 char length identifier and equal to `url(` (case insensitive)
							if (offset - anchor === 4 && cmpStr(source, anchor, offset, 'url(')) {
								// special case for url() because it can contain any symbols sequence with few exceptions
								anchor = findWhiteSpaceEnd(source, offset);
								code = source.charCodeAt(anchor);
								if (code !== LEFTPARENTHESIS &&
									code !== RIGHTPARENTHESIS &&
									code !== QUOTATIONMARK &&
									code !== APOSTROPHE) {
									// url(
									offsetAndType[tokenCount++] = (URL << TYPE_SHIFT) | offset;
									balance[tokenCount] = sourceLength;

									// ws*
									if (anchor !== offset) {
										offsetAndType[tokenCount++] = (WHITESPACE << TYPE_SHIFT) | anchor;
										balance[tokenCount] = sourceLength;
									}

									// raw
									type = RAW;
									offset = findUrlRawEnd(source, anchor);
								} else {
									type = URL;
								}
							} else {
								type = FUNCTION;
							}
							break;
						}

						type = code;
						offset = offset + 1;
						break;

					case NUMBER:
						offset = findNumberEnd(source, offset + 1, prevType !== FULLSTOP);

						// merge number with a preceding dot, dash or plus
						if (prevType === FULLSTOP ||
							prevType === HYPHENMINUS ||
							prevType === PLUSSIGN) {
							tokenCount--; // rewrite prev token
						}

						break;

					case STRING:
						offset = findStringEnd(source, offset + 1, code);
						break;

					default:
						anchor = offset;
						offset = findIdentifierEnd(source, offset);

						// merge identifier with a preceding dash
						if (prevType === HYPHENMINUS) {
							// rewrite prev token
							tokenCount--;
							// restore prev prev token type
							// for case @-prefix-ident
							prevType = tokenCount === 0 ? 0 : offsetAndType[tokenCount - 1] >> TYPE_SHIFT;
						}

						if (prevType === COMMERCIALAT) {
							// rewrite prev token and change type to <at-keyword-token>
							tokenCount--;
							type = ATRULE;
						}
				}

				offsetAndType[tokenCount++] = (type << TYPE_SHIFT) | offset;
				prevType = type;
			}

			// finalize arrays
			offsetAndType[tokenCount] = offset;
			balance[tokenCount] = sourceLength;
			balance[sourceLength] = sourceLength; // prevents false positive balance match with any token
			while (balanceStart !== 0) {
				balancePrev = balanceStart & OFFSET_MASK;
				balanceStart = balance[balancePrev];
				balance[balancePrev] = sourceLength;
			}

			tokenizer.offsetAndType = offsetAndType;
			tokenizer.tokenCount = tokenCount;
			tokenizer.balance = balance;
		}

		//
		// tokenizer
		//

		var Tokenizer = function(source, startOffset, startLine, startColumn) {
			this.offsetAndType = null;
			this.balance = null;
			this.lines = null;
			this.columns = null;

			this.setSource(source, startOffset, startLine, startColumn);
		};

		Tokenizer.prototype = {
			setSource: function(source, startOffset, startLine, startColumn) {
				var safeSource = String(source || '');
				var start = firstCharOffset(safeSource);

				this.source = safeSource;
				this.firstCharOffset = start;
				this.startOffset = typeof startOffset === 'undefined' ? 0 : startOffset;
				this.startLine = typeof startLine === 'undefined' ? 1 : startLine;
				this.startColumn = typeof startColumn === 'undefined' ? 1 : startColumn;
				this.linesAnsColumnsComputed = false;

				this.eof = false;
				this.currentToken = -1;
				this.tokenType = 0;
				this.tokenStart = start;
				this.tokenEnd = start;

				tokenLayout(this, safeSource, start);
				this.next();
			},

			lookupType: function(offset) {
				offset += this.currentToken;

				if (offset < this.tokenCount) {
					return this.offsetAndType[offset] >> TYPE_SHIFT;
				}

				return NULL;
			},
			lookupNonWSType: function(offset) {
				offset += this.currentToken;

				for (var type; offset < this.tokenCount; offset++) {
					type = this.offsetAndType[offset] >> TYPE_SHIFT;

					if (type !== WHITESPACE) {
						return type;
					}
				}

				return NULL;
			},
			lookupValue: function(offset, referenceStr) {
				offset += this.currentToken;

				if (offset < this.tokenCount) {
					return cmpStr(
						this.source,
						this.offsetAndType[offset - 1] & OFFSET_MASK,
						this.offsetAndType[offset] & OFFSET_MASK,
						referenceStr
					);
				}

				return false;
			},
			getTokenStart: function(tokenNum) {
				if (tokenNum === this.currentToken) {
					return this.tokenStart;
				}

				if (tokenNum > 0) {
					return tokenNum < this.tokenCount
						? this.offsetAndType[tokenNum - 1] & OFFSET_MASK
						: this.offsetAndType[this.tokenCount] & OFFSET_MASK;
				}

				return this.firstCharOffset;
			},
			getOffsetExcludeWS: function() {
				if (this.currentToken > 0) {
					if ((this.offsetAndType[this.currentToken - 1] >> TYPE_SHIFT) === WHITESPACE) {
						return this.currentToken > 1
							? this.offsetAndType[this.currentToken - 2] & OFFSET_MASK
							: this.firstCharOffset;
					}
				}
				return this.tokenStart;
			},
			getRawLength: function(startToken, endTokenType1, endTokenType2, includeTokenType2) {
				var cursor = startToken;
				var balanceEnd;

				loop:
				for (; cursor < this.tokenCount; cursor++) {
					balanceEnd = this.balance[cursor];

					// belance end points to offset before start
					if (balanceEnd < startToken) {
						break loop;
					}

					// check token is stop type
					switch (this.offsetAndType[cursor] >> TYPE_SHIFT) {
						case endTokenType1:
							break loop;

						case endTokenType2:
							if (includeTokenType2) {
								cursor++;
							}
							break loop;

						default:
							// fast forward to the end of balanced block
							if (this.balance[balanceEnd] === cursor) {
								cursor = balanceEnd;
							}
					}

				}

				return cursor - this.currentToken;
			},

			getTokenValue: function() {
				return this.source.substring(this.tokenStart, this.tokenEnd);
			},
			substrToCursor: function(start) {
				return this.source.substring(start, this.tokenStart);
			},

			skipWS: function() {
				for (var i = this.currentToken, skipTokenCount = 0; i < this.tokenCount; i++, skipTokenCount++) {
					if ((this.offsetAndType[i] >> TYPE_SHIFT) !== WHITESPACE) {
						break;
					}
				}

				if (skipTokenCount > 0) {
					this.skip(skipTokenCount);
				}
			},
			skipSC: function() {
				while (this.tokenType === WHITESPACE || this.tokenType === COMMENT) {
					this.next();
				}
			},
			skip: function(tokenCount) {
				var next = this.currentToken + tokenCount;

				if (next < this.tokenCount) {
					this.currentToken = next;
					this.tokenStart = this.offsetAndType[next - 1] & OFFSET_MASK;
					next = this.offsetAndType[next];
					this.tokenType = next >> TYPE_SHIFT;
					this.tokenEnd = next & OFFSET_MASK;
				} else {
					this.currentToken = this.tokenCount;
					this.next();
				}
			},
			next: function() {
				var next = this.currentToken + 1;

				if (next < this.tokenCount) {
					this.currentToken = next;
					this.tokenStart = this.tokenEnd;
					next = this.offsetAndType[next];
					this.tokenType = next >> TYPE_SHIFT;
					this.tokenEnd = next & OFFSET_MASK;
				} else {
					this.currentToken = this.tokenCount;
					this.eof = true;
					this.tokenType = NULL;
					this.tokenStart = this.tokenEnd = this.source.length;
				}
			},

			eat: function(tokenType) {
				if (this.tokenType !== tokenType) {
					var offset = this.tokenStart;
					var message = NAME[tokenType] + ' is expected';

					// tweak message and offset
					if (tokenType === IDENTIFIER) {
						// when identifier is expected but there is a function or url
						if (this.tokenType === FUNCTION || this.tokenType === URL) {
							offset = this.tokenEnd - 1;
							message += ' but function found';
						}
					} else {
						// when test type is part of another token show error for current position + 1
						// e.g. eat(HYPHENMINUS) will fail on "-foo", but pointing on "-" is odd
						if (this.source.charCodeAt(this.tokenStart) === tokenType) {
							offset = offset + 1;
						}
					}

					this.error(message, offset);
				}

				this.next();
			},
			eatNonWS: function(tokenType) {
				this.skipWS();
				this.eat(tokenType);
			},

			consume: function(tokenType) {
				var value = this.getTokenValue();

				this.eat(tokenType);

				return value;
			},
			consumeFunctionName: function() {
				var name = this.source.substring(this.tokenStart, this.tokenEnd - 1);

				this.eat(FUNCTION);

				return name;
			},
			consumeNonWS: function(tokenType) {
				this.skipWS();

				return this.consume(tokenType);
			},

			expectIdentifier: function(name) {
				if (this.tokenType !== IDENTIFIER || cmpStr(this.source, this.tokenStart, this.tokenEnd, name) === false) {
					this.error('Identifier `' + name + '` is expected');
				}

				this.next();
			},

			getLocation: function(offset, filename) {
				if (!this.linesAnsColumnsComputed) {
					computeLinesAndColumns(this, this.source);
				}

				return {
					source: filename,
					offset: this.startOffset + offset,
					line: this.lines[offset],
					column: this.columns[offset]
				};
			},

			getLocationRange: function(start, end, filename) {
				if (!this.linesAnsColumnsComputed) {
					computeLinesAndColumns(this, this.source);
				}

				return {
					source: filename,
					start: {
						offset: this.startOffset + start,
						line: this.lines[start],
						column: this.columns[start]
					},
					end: {
						offset: this.startOffset + end,
						line: this.lines[end],
						column: this.columns[end]
					}
				};
			},

			error: function(message, offset) {
				var location = typeof offset !== 'undefined' && offset < this.source.length
					? this.getLocation(offset)
					: this.eof
						? findLastNonSpaceLocation(this)
						: this.getLocation(this.tokenStart);

				throw new CssSyntaxError(
					message || 'Unexpected input',
					this.source,
					location.offset,
					location.line,
					location.column
				);
			},

			dump: function() {
				var offset = 0;

				return Array.prototype.slice.call(this.offsetAndType, 0, this.tokenCount).map(function(item, idx) {
					var start = offset;
					var end = item & OFFSET_MASK;

					offset = end;

					return {
						idx: idx,
						type: NAME[item >> TYPE_SHIFT],
						chunk: this.source.substring(start, end),
						balance: this.balance[idx]
					};
				}, this);
			}
		};

		// extend with error class
		Tokenizer.CssSyntaxError = CssSyntaxError;

		// extend tokenizer with constants
		Object.keys(constants).forEach(function(key) {
			Tokenizer[key] = constants[key];
		});

		// extend tokenizer with static methods from utils
		Object.keys(utils).forEach(function(key) {
			Tokenizer[key] = utils[key];
		});

		// warm up tokenizer to elimitate code branches that never execute
		// fix soft deoptimizations (insufficient type feedback)
		new Tokenizer('\n\r\r\n\f<!---->//""\'\'/*\r\n\f*/1a;.\\31\t\+2{url(a);func();+1.2e3 -.4e-5 .6e+7}').getLocation();

		return Tokenizer;
	};
	//#endregion

	//#region URL: /css-tree/tokenizer/utils
	modules['/css-tree/tokenizer/utils'] = function () {
		'use strict';

		var constants = require('/css-tree/tokenizer/const');
		var PUNCTUATION = constants.PUNCTUATION;
		var STOP_URL_RAW = constants.STOP_URL_RAW;
		var TYPE = constants.TYPE;
		var FULLSTOP = TYPE.FullStop;
		var PLUSSIGN = TYPE.PlusSign;
		var HYPHENMINUS = TYPE.HyphenMinus;
		var PUNCTUATOR = TYPE.Punctuator;
		var TAB = 9;
		var N = 10;
		var F = 12;
		var R = 13;
		var SPACE = 32;
		var BACK_SLASH = 92;
		var E = 101; // 'e'.charCodeAt(0)

		function firstCharOffset(source) {
			// detect BOM (https://en.wikipedia.org/wiki/Byte_order_mark)
			if (source.charCodeAt(0) === 0xFEFF ||  // UTF-16BE
				source.charCodeAt(0) === 0xFFFE) {  // UTF-16LE
				return 1;
			}

			return 0;
		}

		function isHex(code) {
			return (code >= 48 && code <= 57) || // 0 .. 9
				   (code >= 65 && code <= 70) || // A .. F
				   (code >= 97 && code <= 102);  // a .. f
		}

		function isNumber(code) {
			return code >= 48 && code <= 57;
		}

		function isNewline(source, offset, code) {
			if (code === N || code === F || code === R) {
				if (code === R && offset + 1 < source.length && source.charCodeAt(offset + 1) === N) {
					return 2;
				}

				return 1;
			}

			return 0;
		}

		function cmpChar(testStr, offset, referenceCode) {
			var code = testStr.charCodeAt(offset);

			// code.toLowerCase()
			if (code >= 65 && code <= 90) {
				code = code | 32;
			}

			return code === referenceCode;
		}

		function cmpStr(testStr, start, end, referenceStr) {
			if (end - start !== referenceStr.length) {
				return false;
			}

			if (start < 0 || end > testStr.length) {
				return false;
			}

			for (var i = start; i < end; i++) {
				var testCode = testStr.charCodeAt(i);
				var refCode = referenceStr.charCodeAt(i - start);

				// testStr[i].toLowerCase()
				if (testCode >= 65 && testCode <= 90) {
					testCode = testCode | 32;
				}

				if (testCode !== refCode) {
					return false;
				}
			}

			return true;
		}

		function endsWith(testStr, referenceStr) {
			return cmpStr(testStr, testStr.length - referenceStr.length, testStr.length, referenceStr);
		}

		function findLastNonSpaceLocation(scanner) {
			for (var i = scanner.source.length - 1; i >= 0; i--) {
				var code = scanner.source.charCodeAt(i);

				if (code !== SPACE && code !== TAB && code !== R && code !== N && code !== F) {
					break;
				}
			}

			return scanner.getLocation(i + 1);
		}

		function findWhiteSpaceEnd(source, offset) {
			for (; offset < source.length; offset++) {
				var code = source.charCodeAt(offset);

				if (code !== SPACE && code !== TAB && code !== R && code !== N && code !== F) {
					break;
				}
			}

			return offset;
		}

		function findCommentEnd(source, offset) {
			var commentEnd = source.indexOf('*/', offset);

			if (commentEnd === -1) {
				return source.length;
			}

			return commentEnd + 2;
		}

		function findStringEnd(source, offset, quote) {
			for (; offset < source.length; offset++) {
				var code = source.charCodeAt(offset);

				// TODO: bad string
				if (code === BACK_SLASH) {
					offset++;
				} else if (code === quote) {
					offset++;
					break;
				}
			}

			return offset;
		}

		function findDecimalNumberEnd(source, offset) {
			for (; offset < source.length; offset++) {
				var code = source.charCodeAt(offset);

				if (code < 48 || code > 57) {  // not a 0 .. 9
					break;
				}
			}

			return offset;
		}

		function findNumberEnd(source, offset, allowFraction) {
			var code;

			offset = findDecimalNumberEnd(source, offset);

			// fraction: .\d+
			if (allowFraction && offset + 1 < source.length && source.charCodeAt(offset) === FULLSTOP) {
				code = source.charCodeAt(offset + 1);

				if (isNumber(code)) {
					offset = findDecimalNumberEnd(source, offset + 1);
				}
			}

			// exponent: e[+-]\d+
			if (offset + 1 < source.length) {
				if ((source.charCodeAt(offset) | 32) === E) { // case insensitive check for `e`
					code = source.charCodeAt(offset + 1);

					if (code === PLUSSIGN || code === HYPHENMINUS) {
						if (offset + 2 < source.length) {
							code = source.charCodeAt(offset + 2);
						}
					}

					if (isNumber(code)) {
						offset = findDecimalNumberEnd(source, offset + 2);
					}
				}
			}

			return offset;
		}

		// skip escaped unicode sequence that can ends with space
		// [0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?
		function findEscaseEnd(source, offset) {
			for (var i = 0; i < 7 && offset + i < source.length; i++) {
				var code = source.charCodeAt(offset + i);

				if (i !== 6 && isHex(code)) {
					continue;
				}

				if (i > 0) {
					offset += i - 1 + isNewline(source, offset + i, code);
					if (code === SPACE || code === TAB) {
						offset++;
					}
				}

				break;
			}

			return offset;
		}

		function findIdentifierEnd(source, offset) {
			for (; offset < source.length; offset++) {
				var code = source.charCodeAt(offset);

				if (code === BACK_SLASH) {
					offset = findEscaseEnd(source, offset + 1);
				} else if (code < 0x80 && PUNCTUATION[code] === PUNCTUATOR) {
					break;
				}
			}

			return offset;
		}

		function findUrlRawEnd(source, offset) {
			for (; offset < source.length; offset++) {
				var code = source.charCodeAt(offset);

				if (code === BACK_SLASH) {
					offset = findEscaseEnd(source, offset + 1);
				} else if (code < 0x80 && STOP_URL_RAW[code] === 1) {
					break;
				}
			}

			return offset;
		}

		var exports = {
			firstCharOffset: firstCharOffset,

			isHex: isHex,
			isNumber: isNumber,
			isNewline: isNewline,

			cmpChar: cmpChar,
			cmpStr: cmpStr,
			endsWith: endsWith,

			findLastNonSpaceLocation: findLastNonSpaceLocation,
			findWhiteSpaceEnd: findWhiteSpaceEnd,
			findCommentEnd: findCommentEnd,
			findStringEnd: findStringEnd,
			findDecimalNumberEnd: findDecimalNumberEnd,
			findNumberEnd: findNumberEnd,
			findEscaseEnd: findEscaseEnd,
			findIdentifierEnd: findIdentifierEnd,
			findUrlRawEnd: findUrlRawEnd
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/utils/clone
	modules['/css-tree/utils/clone'] = function () {
		'use strict';

		var List = require('/css-tree/utils/list');

		var exports = function clone(node) {
			var result = {};

			for (var key in node) {
				var value = node[key];

				if (value) {
					if (Array.isArray(value)) {
						value = value.slice(0);
					} else if (value instanceof List) {
						value = new List().fromArray(value.map(clone));
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

	//#region URL: /css-tree/utils/list
	modules['/css-tree/utils/list'] = function () {
		'use strict';

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
				prev: null,
				next: null,
				data: data
			};
		}

		var cursors = null;
		var List = function() {
			this.cursor = null;
			this.head = null;
			this.tail = null;
		};

		List.createItem = createItem;
		List.prototype.createItem = createItem;

		List.prototype.getSize = function() {
			var size = 0;
			var cursor = this.head;

			while (cursor) {
				size++;
				cursor = cursor.next;
			}

			return size;
		};

		List.prototype.fromArray = function(array) {
			var cursor = null;

			this.head = null;

			for (var i = 0; i < array.length; i++) {
				var item = createItem(array[i]);

				if (cursor !== null) {
					cursor.next = item;
				} else {
					this.head = item;
				}

				item.prev = cursor;
				cursor = item;
			}

			this.tail = cursor;

			return this;
		};

		List.prototype.toArray = function() {
			var cursor = this.head;
			var result = [];

			while (cursor) {
				result.push(cursor.data);
				cursor = cursor.next;
			}

			return result;
		};

		List.prototype.toJSON = List.prototype.toArray;

		List.prototype.isEmpty = function() {
			return this.head === null;
		};

		List.prototype.first = function() {
			return this.head && this.head.data;
		};

		List.prototype.last = function() {
			return this.tail && this.tail.data;
		};

		function allocateCursor(node, prev, next) {
			var cursor;

			if (cursors !== null) {
				cursor = cursors;
				cursors = cursors.cursor;
				cursor.prev = prev;
				cursor.next = next;
				cursor.cursor = node.cursor;
			} else {
				cursor = {
					prev: prev,
					next: next,
					cursor: node.cursor
				};
			}

			node.cursor = cursor;

			return cursor;
		}

		function releaseCursor(node) {
			var cursor = node.cursor;

			node.cursor = cursor.cursor;
			cursor.prev = null;
			cursor.next = null;
			cursor.cursor = cursors;
			cursors = cursor;
		}

		List.prototype.each = function(fn, context) {
			var item;

			if (context === undefined) {
				context = this;
			}

			// push cursor
			var cursor = allocateCursor(this, null, this.head);

			while (cursor.next !== null) {
				item = cursor.next;
				cursor.next = item.next;

				fn.call(context, item.data, item, this);
			}

			// pop cursor
			releaseCursor(this);
		};

		List.prototype.eachRight = function(fn, context) {
			var item;

			if (context === undefined) {
				context = this;
			}

			// push cursor
			var cursor = allocateCursor(this, this.tail, null);

			while (cursor.prev !== null) {
				item = cursor.prev;
				cursor.prev = item.prev;

				fn.call(context, item.data, item, this);
			}

			// pop cursor
			releaseCursor(this);
		};

		List.prototype.nextUntil = function(start, fn, context) {
			if (start === null) {
				return;
			}

			var item;

			if (context === undefined) {
				context = this;
			}

			// push cursor
			var cursor = allocateCursor(this, null, start);

			while (cursor.next !== null) {
				item = cursor.next;
				cursor.next = item.next;

				if (fn.call(context, item.data, item, this)) {
					break;
				}
			}

			// pop cursor
			releaseCursor(this);
		};

		List.prototype.prevUntil = function(start, fn, context) {
			if (start === null) {
				return;
			}

			var item;

			if (context === undefined) {
				context = this;
			}

			// push cursor
			var cursor = allocateCursor(this, start, null);

			while (cursor.prev !== null) {
				item = cursor.prev;
				cursor.prev = item.prev;

				if (fn.call(context, item.data, item, this)) {
					break;
				}
			}

			// pop cursor
			releaseCursor(this);
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

		List.prototype.clear = function() {
			this.head = null;
			this.tail = null;
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
				if (cursor.prev === prevOld) {
					cursor.prev = prevNew;
				}

				if (cursor.next === nextOld) {
					cursor.next = nextNew;
				}

				cursor = cursor.cursor;
			}
		};

		List.prototype.prepend = function(item) {
			//	  head
			//	^
			// item
			this.updateCursors(null, item, this.head, item);

			// insert to the beginning of the list
			if (this.head !== null) {
				// new item <- first item
				this.head.prev = item;

				// new item -> first item
				item.next = this.head;
			} else {
				// if list has no head, then it also has no tail
				// in this case tail points to the new item
				this.tail = item;
			}

			// head always points to new item
			this.head = item;

			return this;
		};

		List.prototype.prependData = function(data) {
			return this.prepend(createItem(data));
		};

		List.prototype.append = function(item) {
			// tail
			//	  ^
			//	  item
			this.updateCursors(this.tail, item, null, item);

			// insert to the ending of the list
			if (this.tail !== null) {
				// last item -> new item
				this.tail.next = item;

				// last item <- new item
				item.prev = this.tail;
			} else {
				// if list has no tail, then it also has no head
				// in this case head points to new item
				this.head = item;
			}

			// tail always points to new item
			this.tail = item;

			return this;
		};

		List.prototype.appendData = function(data) {
			return this.append(createItem(data));
		};

		List.prototype.insert = function(item, before) {
			if (before !== undefined && before !== null) {
				// prev   before
				//	  ^
				//	 item
				this.updateCursors(before.prev, item, before, item);

				if (before.prev === null) {
					// insert to the beginning of list
					if (this.head !== before) {
						throw new Error('before doesn\'t belong to list');
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
				this.append(item);
			}
		};

		List.prototype.insertData = function(data, before) {
			this.insert(createItem(data), before);
		};

		List.prototype.remove = function(item) {
			//	  item
			//	   ^
			// prev	 next
			this.updateCursors(item, item.prev, item, item.next);

			if (item.prev !== null) {
				item.prev.next = item.next;
			} else {
				if (this.head !== item) {
					throw new Error('item doesn\'t belong to list');
				}

				this.head = item.next;
			}

			if (item.next !== null) {
				item.next.prev = item.prev;
			} else {
				if (this.tail !== item) {
					throw new Error('item doesn\'t belong to list');
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

		List.prototype.insertList = function(list, before) {
			if (before !== undefined && before !== null) {
				// ignore empty lists
				if (list.head === null) {
					return;
				}

				this.updateCursors(before.prev, list.tail, before, list.head);

				// insert in the middle of dist list
				if (before.prev !== null) {
					// before.prev <-> list.head
					before.prev.next = list.head;
					list.head.prev = before.prev;
				} else {
					this.head = list.head;
				}

				before.prev = list.tail;
				list.tail.next = before;

				list.head = null;
				list.tail = null;
			} else {
				this.appendList(list);
			}
		};

		List.prototype.replace = function(oldItem, newItemOrList) {
			if ('head' in newItemOrList) {
				this.insertList(newItemOrList, oldItem);
			} else {
				this.insert(newItemOrList, oldItem);
			}
			this.remove(oldItem);
		};

		return List;
	};
	//#endregion

	//#region URL: /css-tree/utils/names
	modules['/css-tree/utils/names'] = function () {
		'use strict';

		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var keywords = Object.create(null);
		var properties = Object.create(null);
		var HYPHENMINUS = 45; // '-'.charCodeAt()

		function isCustomProperty(str, offset) {
			return str.length - offset >= 2 &&
				   str.charCodeAt(offset) === HYPHENMINUS &&
				   str.charCodeAt(offset + 1) === HYPHENMINUS;
		}

		function getVendorPrefix(str, offset) {
			if (str.charCodeAt(offset) === HYPHENMINUS) {
				// vendor should contain at least one letter
				var secondDashIndex = str.indexOf('-', offset + 2);

				if (secondDashIndex !== -1) {
					return str.substring(offset, secondDashIndex + 1);
				}
			}

			return '';
		}

		function getKeywordInfo(keyword) {
			if (hasOwnProperty.call(keywords, keyword)) {
				return keywords[keyword];
			}

			var name = keyword.toLowerCase();

			if (hasOwnProperty.call(keywords, name)) {
				return keywords[keyword] = keywords[name];
			}

			var vendor = !isCustomProperty(name, 0) ? getVendorPrefix(name, 0) : '';

			return keywords[keyword] = Object.freeze({
				vendor: vendor,
				prefix: vendor,
				name: name.substr(vendor.length)
			});
		}

		function getPropertyInfo(property) {
			if (hasOwnProperty.call(properties, property)) {
				return properties[property];
			}

			var name = property;
			var hack = property[0];

			if (hack === '/' && property[1] === '/') {
				hack = '//';
			} else if (hack !== '_' &&
					   hack !== '*' &&
					   hack !== '$' &&
					   hack !== '#' &&
					   hack !== '+') {
				hack = '';
			}

			var custom = isCustomProperty(name, hack.length);

			if (!custom) {
				name = name.toLowerCase();
				if (hasOwnProperty.call(properties, name)) {
					return properties[property] = properties[name];
				}
			}

			var vendor = !custom ? getVendorPrefix(name, hack.length) : '';

			return properties[property] = Object.freeze({
				hack: hack,
				vendor: vendor,
				prefix: hack + vendor,
				name: name.substr(hack.length + vendor.length),
				custom: custom
			});
		}

		var exports = {
			keyword: getKeywordInfo,
			property: getPropertyInfo
		};

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/walker
	modules['/css-tree/walker'] = function () {
		var createWalker = require('/css-tree/walker/create');
		var config = require('/css-tree/syntax/config/walker');

		var exports = createWalker(config);

		return exports;
	};
	//#endregion

	//#region URL: /css-tree/walker/create
	modules['/css-tree/walker/create'] = function () {
		'use strict';

		function walkRules(node, item, list) {
			switch (node.type) {
				case 'StyleSheet':
					var oldStylesheet = this.stylesheet;
					this.stylesheet = node;

					node.children.each(walkRules, this);

					this.stylesheet = oldStylesheet;
					break;

				case 'Atrule':
					if (node.block !== null) {
						var oldAtrule = this.atrule;
						this.atrule = node;

						walkRules.call(this, node.block);

						this.atrule = oldAtrule;
					}

					this.fn(node, item, list);
					break;

				case 'Rule':
					this.fn(node, item, list);

					var oldRule = this.rule;
					this.rule = node;

					walkRules.call(this, node.block);

					this.rule = oldRule;
					break;

				case 'Block':
					var oldBlock = this.block;
					this.block = node;

					node.children.each(walkRules, this);

					this.block = oldBlock;
					break;
			}
		}

		function walkRulesRight(node, item, list) {
			switch (node.type) {
				case 'StyleSheet':
					var oldStylesheet = this.stylesheet;
					this.stylesheet = node;

					node.children.eachRight(walkRulesRight, this);

					this.stylesheet = oldStylesheet;
					break;

				case 'Atrule':
					if (node.block !== null) {
						var oldAtrule = this.atrule;
						this.atrule = node;

						walkRulesRight.call(this, node.block);

						this.atrule = oldAtrule;
					}

					this.fn(node, item, list);
					break;

				case 'Rule':
					var oldRule = this.rule;
					this.rule = node;

					walkRulesRight.call(this, node.block);

					this.rule = oldRule;

					this.fn(node, item, list);
					break;

				case 'Block':
					var oldBlock = this.block;
					this.block = node;

					node.children.eachRight(walkRulesRight, this);

					this.block = oldBlock;
					break;
			}
		}

		function walkDeclarations(node) {
			switch (node.type) {
				case 'StyleSheet':
					var oldStylesheet = this.stylesheet;
					this.stylesheet = node;

					node.children.each(walkDeclarations, this);

					this.stylesheet = oldStylesheet;
					break;

				case 'Atrule':
					if (node.block !== null) {
						var oldAtrule = this.atrule;
						this.atrule = node;

						walkDeclarations.call(this, node.block);

						this.atrule = oldAtrule;
					}
					break;

				case 'Rule':
					var oldRule = this.rule;
					this.rule = node;

					if (node.block !== null) {
						walkDeclarations.call(this, node.block);
					}

					this.rule = oldRule;
					break;

				case 'Block':
					node.children.each(function(node, item, list) {
						if (node.type === 'Declaration') {
							this.fn(node, item, list);
						} else {
							walkDeclarations.call(this, node);
						}
					}, this);
					break;
			}
		}

		function getWalkersFromStructure(name, nodeType) {
			var structure = nodeType.structure;
			var walkers = [];

			for (var key in structure) {
				var walker = {
					name: key,
					type: false,
					nullable: false
				};

				var fieldTypes = structure[key];

				if (!Array.isArray(structure[key])) {
					fieldTypes = [structure[key]];
				}

				for (var i = 0; i < fieldTypes.length; i++) {
					var fieldType = fieldTypes[i];
					if (fieldType === null) {
						walker.nullable = true;
					} else if (typeof fieldType === 'string') {
						walker.type = 'node';
					} else if (Array.isArray(fieldType)) {
						walker.type = 'list';
					}
				}

				if (walker.type) {
					walkers.push(walker);
				}
			}

			if (walkers.length) {
				return {
					context: nodeType.walkContext,
					fields: walkers
				};
			}

			return null;
		}

		function getTypesFromConfig(config) {
			var types = {};

			if (config.node) {
				for (var name in config.node) {
					var nodeType = config.node[name];

					if (nodeType.structure) {
						var walkers = getWalkersFromStructure(name, nodeType);
						if (walkers !== null) {
							types[name] = walkers;
						}
					} else {
						throw new Error('Missed `structure` field in `' + name + '` node type definition');
					}
				}
			}

			return types;
		}

		function createContext(root, fn) {
			var context = {
				fn: fn,
				root: root,
				stylesheet: null,
				atrule: null,
				atrulePrelude: null,
				rule: null,
				selector: null,
				block: null,
				declaration: null,
				function: null
			};

			return context;
		}

		var exports = function createWalker(config) {
			var types = getTypesFromConfig(config);
			var walkers = {};

			for (var name in types) {
				var config = types[name];
				walkers[name] = Function('node', 'context', 'walk',
					(config.context ? 'var old = context.' + config.context + ';\ncontext.' + config.context + ' = node;\n' : '') +
					config.fields.map(function(field) {
						var line = field.type === 'list'
							? 'node.' + field.name + '.each(walk);'
							: 'walk(node.' + field.name + ');';

						if (field.nullable) {
							line = 'if (node.' + field.name + ') {\n    ' + line + '}';
						}

						return line;
					}).join('\n') +
					(config.context ? '\ncontext.' + config.context + ' = old;' : '')
				);
			}

			return {
				walk: function(root, fn) {
					function walk(node, item, list) {
						fn.call(context, node, item, list);
						if (walkers.hasOwnProperty(node.type)) {
							walkers[node.type](node, context, walk);
						}
					}

					var context = createContext(root, fn);

					walk(root);
				},
				walkUp: function(root, fn) {
					function walk(node, item, list) {
						if (walkers.hasOwnProperty(node.type)) {
							walkers[node.type](node, context, walk);
						}
						fn.call(context, node, item, list);
					}

					var context = createContext(root, fn);

					walk(root);
				},
				walkRules: function(root, fn) {
					walkRules.call(createContext(root, fn), root);
				},
				walkRulesRight: function(root, fn) {
					walkRulesRight.call(createContext(root, fn), root);
				},
				walkDeclarations: function(root, fn) {
					walkDeclarations.call(createContext(root, fn), root);
				}
			};
		};

		return exports;
	};
	//#endregion

	return require('/');
})();