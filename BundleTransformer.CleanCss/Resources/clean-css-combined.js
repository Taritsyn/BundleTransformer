/*!
 * Clean-css v2.2.12
 * https://github.com/GoalSmashers/clean-css
 *
 * Copyright (C) 2011-2014 GoalSmashers.com
 * Released under the terms of MIT license
 */
var CleanCss = (function(){
	var require = function(name) {
		return require[name];
	};
	
	//#region URL: ./colors/shortener
	require['./colors/shortener'] = (function () {
		function Shortener(data) {
		  var COLORS = {
			aliceblue: '#f0f8ff',
			antiquewhite: '#faebd7',
			aqua: '#0ff',
			aquamarine: '#7fffd4',
			azure: '#f0ffff',
			beige: '#f5f5dc',
			bisque: '#ffe4c4',
			black: '#000',
			blanchedalmond: '#ffebcd',
			blue: '#00f',
			blueviolet: '#8a2be2',
			brown: '#a52a2a',
			burlywood: '#deb887',
			cadetblue: '#5f9ea0',
			chartreuse: '#7fff00',
			chocolate: '#d2691e',
			coral: '#ff7f50',
			cornflowerblue: '#6495ed',
			cornsilk: '#fff8dc',
			crimson: '#dc143c',
			cyan: '#0ff',
			darkblue: '#00008b',
			darkcyan: '#008b8b',
			darkgoldenrod: '#b8860b',
			darkgray: '#a9a9a9',
			darkgreen: '#006400',
			darkkhaki: '#bdb76b',
			darkmagenta: '#8b008b',
			darkolivegreen: '#556b2f',
			darkorange: '#ff8c00',
			darkorchid: '#9932cc',
			darkred: '#8b0000',
			darksalmon: '#e9967a',
			darkseagreen: '#8fbc8f',
			darkslateblue: '#483d8b',
			darkslategray: '#2f4f4f',
			darkturquoise: '#00ced1',
			darkviolet: '#9400d3',
			deeppink: '#ff1493',
			deepskyblue: '#00bfff',
			dimgray: '#696969',
			dodgerblue: '#1e90ff',
			firebrick: '#b22222',
			floralwhite: '#fffaf0',
			forestgreen: '#228b22',
			fuchsia: '#f0f',
			gainsboro: '#dcdcdc',
			ghostwhite: '#f8f8ff',
			gold: '#ffd700',
			goldenrod: '#daa520',
			gray: '#808080',
			green: '#008000',
			greenyellow: '#adff2f',
			honeydew: '#f0fff0',
			hotpink: '#ff69b4',
			indianred: '#cd5c5c',
			indigo: '#4b0082',
			ivory: '#fffff0',
			khaki: '#f0e68c',
			lavender: '#e6e6fa',
			lavenderblush: '#fff0f5',
			lawngreen: '#7cfc00',
			lemonchiffon: '#fffacd',
			lightblue: '#add8e6',
			lightcoral: '#f08080',
			lightcyan: '#e0ffff',
			lightgoldenrodyellow: '#fafad2',
			lightgray: '#d3d3d3',
			lightgreen: '#90ee90',
			lightpink: '#ffb6c1',
			lightsalmon: '#ffa07a',
			lightseagreen: '#20b2aa',
			lightskyblue: '#87cefa',
			lightslategray: '#778899',
			lightsteelblue: '#b0c4de',
			lightyellow: '#ffffe0',
			lime: '#0f0',
			limegreen: '#32cd32',
			linen: '#faf0e6',
			magenta: '#ff00ff',
			maroon: '#800000',
			mediumaquamarine: '#66cdaa',
			mediumblue: '#0000cd',
			mediumorchid: '#ba55d3',
			mediumpurple: '#9370db',
			mediumseagreen: '#3cb371',
			mediumslateblue: '#7b68ee',
			mediumspringgreen: '#00fa9a',
			mediumturquoise: '#48d1cc',
			mediumvioletred: '#c71585',
			midnightblue: '#191970',
			mintcream: '#f5fffa',
			mistyrose: '#ffe4e1',
			moccasin: '#ffe4b5',
			navajowhite: '#ffdead',
			navy: '#000080',
			oldlace: '#fdf5e6',
			olive: '#808000',
			olivedrab: '#6b8e23',
			orange: '#ffa500',
			orangered: '#ff4500',
			orchid: '#da70d6',
			palegoldenrod: '#eee8aa',
			palegreen: '#98fb98',
			paleturquoise: '#afeeee',
			palevioletred: '#db7093',
			papayawhip: '#ffefd5',
			peachpuff: '#ffdab9',
			peru: '#cd853f',
			pink: '#ffc0cb',
			plum: '#dda0dd',
			powderblue: '#b0e0e6',
			purple: '#800080',
			red: '#f00',
			rosybrown: '#bc8f8f',
			royalblue: '#4169e1',
			saddlebrown: '#8b4513',
			salmon: '#fa8072',
			sandybrown: '#f4a460',
			seagreen: '#2e8b57',
			seashell: '#fff5ee',
			sienna: '#a0522d',
			silver: '#c0c0c0',
			skyblue: '#87ceeb',
			slateblue: '#6a5acd',
			slategray: '#708090',
			snow: '#fffafa',
			springgreen: '#00ff7f',
			steelblue: '#4682b4',
			tan: '#d2b48c',
			teal: '#008080',
			thistle: '#d8bfd8',
			tomato: '#ff6347',
			turquoise: '#40e0d0',
			violet: '#ee82ee',
			wheat: '#f5deb3',
			white: '#fff',
			whitesmoke: '#f5f5f5',
			yellow: '#ff0',
			yellowgreen: '#9acd32'
		  };

		  var toHex = {};
		  var toName = {};

		  for (var name in COLORS) {
			var color = COLORS[name];
			if (name.length < color.length)
			  toName[color] = name;
			else
			  toHex[name] = color;
		  }

		  return {
			toHex: toHex,
			toName: toName,

			// replace color name with hex values if shorter (or the other way around)
			process: function() {
			  [toHex, toName].forEach(function(conversion) {
				var pattern = '(' + Object.keys(conversion).join('|') + ')';
				var colorSwitcher = function(match, prefix, colorValue, suffix) {
				  return prefix + conversion[colorValue.toLowerCase()] + suffix;
				};
				data = data.replace(new RegExp('([ :,\\(])' + pattern + '([;\\}!\\) ])', 'ig'), colorSwitcher);
				data = data.replace(new RegExp('(,)' + pattern + '(,)', 'ig'), colorSwitcher);
			  });

			  return data;
			}
		  };
		};
		
		return Shortener;
	}).call(this);
	//#endregion
	
	//#region URL: ./colors/hsl-to-hex
	require['./colors/hsl-to-hex'] = (function () {
		function HSLToHex(data) {
		  // HSL to RGB converter. Both methods adapted from:
		  // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
		  var hslToRgb = function(h, s, l) {
			var r, g, b;

			// normalize hue orientation b/w 0 and 360 degrees
			h = h % 360;
			if (h < 0)
			  h += 360;
			h = ~~h / 360;

			if (s < 0)
			  s = 0;
			else if (s > 100)
			  s = 100;
			s = ~~s / 100;

			if (l < 0)
			  l = 0;
			else if (l > 100)
			  l = 100;
			l = ~~l / 100;

			if (s === 0) {
			  r = g = b = l; // achromatic
			} else {
			  var q = l < 0.5 ?
				l * (1 + s) :
				l + s - l * s;
			  var p = 2 * l - q;
			  r = hueToRgb(p, q, h + 1/3);
			  g = hueToRgb(p, q, h);
			  b = hueToRgb(p, q, h - 1/3);
			}

			return [~~(r * 255), ~~(g * 255), ~~(b * 255)];
		  };

		  var hueToRgb = function(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		  };

		  return {
			process: function() {
			  return data.replace(/hsl\((-?\d+),(-?\d+)%?,(-?\d+)%?\)/g, function(match, hue, saturation, lightness) {
				var asRgb = hslToRgb(hue, saturation, lightness);
				var redAsHex = asRgb[0].toString(16);
				var greenAsHex = asRgb[1].toString(16);
				var blueAsHex = asRgb[2].toString(16);

				return '#' +
				  ((redAsHex.length == 1 ? '0' : '') + redAsHex) +
				  ((greenAsHex.length == 1 ? '0' : '') + greenAsHex) +
				  ((blueAsHex.length == 1 ? '0' : '') + blueAsHex);
			  });
			}
		  };
		};
		
		return HSLToHex;
	}).call(this);
	//#endregion
	
	//#region URL: ./colors/rgb-to-hex
	require['./colors/rgb-to-hex'] = (function () {
		function RGBToHex(data) {
		  return {
			process: function() {
			  return data.replace(/rgb\((\-?\d+),(\-?\d+),(\-?\d+)\)/g, function(match, red, green, blue) {
				red = Math.max(0, Math.min(~~red, 255));
				green = Math.max(0, Math.min(~~green, 255));
				blue = Math.max(0, Math.min(~~blue, 255));

				// Credit: Asen  http://jsbin.com/UPUmaGOc/2/edit?js,console
				return '#' + ('00000' + (red << 16 | green << 8 | blue).toString(16)).slice(-6);
			  });
			}
		  };
		};

		return RGBToHex;
	}).call(this);
	//#endregion
	
	//#region URL: ./colors/long-to-short-hex
	require['./colors/long-to-short-hex'] = (function () {
		function LongToShortHex(data) {
		  return {
			process: function() {
			  return data.replace(/([,: \(])#([0-9a-f]{6})/gi, function(match, prefix, color) {
				if (color[0] == color[1] && color[2] == color[3] && color[4] == color[5])
				  return prefix + '#' + color[0] + color[2] + color[4];
				else
				  return prefix + '#' + color;
			  });
			}
		  };
		};
		
		return LongToShortHex;
	}).call(this);
	//#endregion
	
	//#region URL: ./properties/token
	require['./properties/token'] = (function () {
	  // Helper for tokenizing the contents of a CSS selector block
	  var createTokenPrototype = function (processable) {
		var important = '!important';

		// Constructor for tokens
		function Token (prop, p2, p3) {
		  this.prop = prop;
		  if (typeof(p2) === 'string') {
			this.value = p2;
			this.isImportant = p3;
		  }
		  else {
			this.value = processable[prop].defaultValue;
			this.isImportant = p2;
		  }
		}

		Token.prototype.prop = null;
		Token.prototype.value = null;
		Token.prototype.granularValues = null;
		Token.prototype.components = null;
		Token.prototype.position = null;
		Token.prototype.isImportant = false;
		Token.prototype.isDirty = false;
		Token.prototype.isShorthand = false;
		Token.prototype.isIrrelevant = false;
		Token.prototype.isReal = true;
		Token.prototype.isMarkedForDeletion = false;

		// Tells if this token is a component of the other one
		Token.prototype.isComponentOf = function (other) {
		  if (!processable[this.prop] || !processable[other.prop])
			return false;
		  if (!(processable[other.prop].components instanceof Array) || !processable[other.prop].components.length)
			return false;

		  return processable[other.prop].components.indexOf(this.prop) >= 0;
		};

		// Clones a token
		Token.prototype.clone = function (isImportant) {
		  var token = new Token(this.prop, this.value, (typeof(isImportant) !== 'undefined' ? isImportant : this.isImportant));
		  return token;
		};

		// Creates an irrelevant token with the same prop
		Token.prototype.cloneIrrelevant = function (isImportant) {
		  var token = Token.makeDefault(this.prop, (typeof(isImportant) !== 'undefined' ? isImportant : this.isImportant));
		  token.isIrrelevant = true;
		  return token;
		};

		// Creates an array of property tokens with their default values
		Token.makeDefaults = function (props, important) {
		  return props.map(function(prop) {
			return new Token(prop, important);
		  });
		};

		// Parses one CSS property declaration into a token
		Token.tokenizeOne = function (fullProp) {
		  // Find first colon
		  var colonPos = fullProp.indexOf(':');

		  if (colonPos < 0) {
			// This property doesn't have a colon, it's invalid. Let's keep it intact anyway.
			return new Token('', fullProp);
		  }

		  // Parse parts of the property
		  var prop = fullProp.substr(0, colonPos).trim();
		  var value = fullProp.substr(colonPos + 1).trim();
		  var isImportant = false;
		  var importantPos = value.indexOf(important);

		  // Check if the property is important
		  if (importantPos >= 1 && importantPos === value.length - important.length) {
			value = value.substr(0, importantPos).trim();
			isImportant = true;
		  }

		  // Return result
		  var result = new Token(prop, value, isImportant);

		  // If this is a shorthand, break up its values
		  // NOTE: we need to do this for all shorthands because otherwise we couldn't remove default values from them
		  if (processable[prop] && processable[prop].isShorthand) {
			result.isShorthand = true;
			result.components = processable[prop].breakUp(result);
			result.isDirty = true;
		  }

		  return result;
		};

		// Breaks up a string of CSS property declarations into tokens so that they can be handled more easily
		Token.tokenize = function (input) {
		  // Split the input by semicolons and parse the parts
		  var tokens = input.split(';').map(Token.tokenizeOne);
		  return tokens;
		};

		// Transforms tokens back into CSS properties
		Token.detokenize = function (tokens) {
		  // If by mistake the input is not an array, make it an array
		  if (!(tokens instanceof Array)) {
			tokens = [tokens];
		  }

		  var result = '';

		  // This step takes care of putting together the components of shorthands
		  // NOTE: this is necessary to do for every shorthand, otherwise we couldn't remove their default values
		  for (var i = 0; i < tokens.length; i++) {
			var t = tokens[i];
			if (t.isShorthand && t.isDirty) {
			  var news = processable[t.prop].putTogether(t.prop, t.components, t.isImportant);
			  Array.prototype.splice.apply(tokens, [i, 1].concat(news));
			  t.isDirty = false;
			  i--;
			  continue;
			}

			if (t.prop)
			  result += t.prop + ':';

			if (t.value)
			  result += t.value;

			if (t.isImportant)
			  result += important;

			result += ';';
		  }

		  return result.substr(0, result.length - 1);
		};

		// Gets the final (detokenized) length of the given tokens
		Token.getDetokenizedLength = function (tokens) {
		  // If by mistake the input is not an array, make it an array
		  if (!(tokens instanceof Array)) {
			tokens = [tokens];
		  }

		  var result = 0;

		  // This step takes care of putting together the components of shorthands
		  // NOTE: this is necessary to do for every shorthand, otherwise we couldn't remove their default values
		  for (var i = 0; i < tokens.length; i++) {
			var t = tokens[i];
			if (t.isShorthand && t.isDirty) {
			  var news = processable[t.prop].putTogether(t.prop, t.components, t.isImportant);
			  Array.prototype.splice.apply(tokens, [i, 1].concat(news));
			  t.isDirty = false;
			  i--;
			  continue;
			}

			if (t.prop) {
			  result += t.prop.length + 1;
			}
			if (t.value) {
			  result += t.value.length;
			}
			if (t.isImportant) {
			  result += important.length;
			}
		  }

		  return result;
		};

		return Token;
	  };

	  return {
		createTokenPrototype: createTokenPrototype
	  };
	}).call(this);
	//#endregion

	//#region URL: ./text/splitter
	require['./text/splitter'] = (function () {
		var Splitter = function Splitter (separator) {
		  this.separator = separator;
		};

		Splitter.prototype.split = function (value) {
		  if (value.indexOf(this.separator) === -1)
			return [value];

		  if (value.indexOf('(') === -1)
			return value.split(this.separator);

		  var level = 0;
		  var cursor = 0;
		  var lastStart = 0;
		  var len = value.length;
		  var tokens = [];

		  while (cursor++ < len) {
			if (value[cursor] == '(') {
			  level++;
			} else if (value[cursor] == ')') {
			  level--;
			} else if (value[cursor] == this.separator && level === 0) {
			  tokens.push(value.substring(lastStart, cursor));
			  lastStart = cursor + 1;
			}
		  }

		  if (lastStart < cursor + 1)
			tokens.push(value.substring(lastStart));

		  return tokens;
		};
		
		return Splitter;
	}).call(this);
	//#endregion

	//#region URL: ./properties/validator
	require['./properties/validator'] = (function () {
	  // Validates various CSS property values
	  var Splitter = require('./text/splitter');

	  // Regexes used for stuff
	  var widthKeywords = ['thin', 'thick', 'medium', 'inherit', 'initial'];
	  var cssUnitRegexStr = '(\\-?\\.?\\d+\\.?\\d*(px|%|em|rem|in|cm|mm|ex|pt|pc|vw|vh|vmin|vmax|)|auto|inherit)';
	  var cssFunctionNoVendorRegexStr = '[A-Z]+(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.|\\(|\\))*\\)';
	  var cssFunctionVendorRegexStr = '\\-(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.|\\(|\\))*\\)';
	  var cssVariableRegexStr = 'var\\(\\-\\-[^\\)]+\\)';
	  var cssFunctionAnyRegexStr = '(' + cssVariableRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';
	  var cssUnitAnyRegexStr = '(none|' + widthKeywords.join('|') + '|' + cssUnitRegexStr + '|' + cssVariableRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';

	  var cssFunctionNoVendorRegex = new RegExp('^' + cssFunctionNoVendorRegexStr + '$', 'i');
	  var cssFunctionVendorRegex = new RegExp('^' + cssFunctionVendorRegexStr + '$', 'i');
	  var cssVariableRegex = new RegExp('^' + cssVariableRegexStr + '$', 'i');
	  var cssFunctionAnyRegex = new RegExp('^' + cssFunctionAnyRegexStr + '$', 'i');
	  var cssUnitRegex = new RegExp('^' + cssUnitRegexStr + '$', 'i');
	  var cssUnitAnyRegex = new RegExp('^' + cssUnitAnyRegexStr + '$', 'i');

	  var backgroundRepeatKeywords = ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'inherit'];
	  var backgroundAttachmentKeywords = ['inherit', 'scroll', 'fixed', 'local'];
	  var backgroundPositionKeywords = ['center', 'top', 'bottom', 'left', 'right'];
	  var backgroundSizeKeywords = ['contain', 'cover'];
	  var listStyleTypeKeywords = ['armenian', 'circle', 'cjk-ideographic', 'decimal', 'decimal-leading-zero', 'disc', 'georgian', 'hebrew', 'hiragana', 'hiragana-iroha', 'inherit', 'katakana', 'katakana-iroha', 'lower-alpha', 'lower-greek', 'lower-latin', 'lower-roman', 'none', 'square', 'upper-alpha', 'upper-latin', 'upper-roman'];
	  var listStylePositionKeywords = ['inside', 'outside', 'inherit'];
	  var outlineStyleKeywords = ['auto', 'inherit', 'hidden', 'none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];

	  var validator = {
		isValidHexColor: function (s) {
		  return (s.length === 4 || s.length === 7) && s[0] === '#';
		},
		isValidRgbaColor: function (s) {
		  s = s.split(' ').join('');
		  return s.length > 0 && s.indexOf('rgba(') === 0 && s.indexOf(')') === s.length - 1;
		},
		isValidHslaColor: function (s) {
		  s = s.split(' ').join('');
		  return s.length > 0 && s.indexOf('hsla(') === 0 && s.indexOf(')') === s.length - 1;
		},
		isValidNamedColor: function (s) {
		  // We don't really check if it's a valid color value, but allow any letters in it
		  return s !== 'auto' && (s === 'transparent' || s === 'inherit' || /^[a-zA-Z]+$/.test(s));
		},
		isValidVariable: function(s) {
		  return cssVariableRegex.test(s);
		},
		isValidColor: function (s) {
		  return validator.isValidNamedColor(s) || validator.isValidHexColor(s) || validator.isValidRgbaColor(s) || validator.isValidHslaColor(s) || validator.isValidVariable(s);
		},
		isValidUrl: function (s) {
		  // NOTE: at this point all URLs are replaced with placeholders by clean-css, so we check for those placeholders
		  return s.indexOf('__ESCAPED_URL_CLEAN_CSS') === 0;
		},
		isValidUnit: function (s) {
		  return cssUnitAnyRegex.test(s);
		},
		isValidUnitWithoutFunction: function (s) {
		  return cssUnitRegex.test(s);
		},
		isValidFunctionWithoutVendorPrefix: function (s) {
		  return cssFunctionNoVendorRegex.test(s);
		},
		isValidFunctionWithVendorPrefix: function (s) {
		  return cssFunctionVendorRegex.test(s);
		},
		isValidFunction: function (s) {
		  return cssFunctionAnyRegex.test(s);
		},
		isValidBackgroundRepeat: function (s) {
		  return backgroundRepeatKeywords.indexOf(s) >= 0 || validator.isValidVariable(s);
		},
		isValidBackgroundAttachment: function (s) {
		  return backgroundAttachmentKeywords.indexOf(s) >= 0 || validator.isValidVariable(s);
		},
		isValidBackgroundPositionPart: function (s) {
		  if (backgroundPositionKeywords.indexOf(s) >= 0)
			return true;

		  return cssUnitRegex.test(s) || validator.isValidVariable(s);
		},
		isValidBackgroundPosition: function (s) {
		  if (s === 'inherit')
			return true;

		  var parts = s.split(' ');
		  for (var i = 0, l = parts.length; i < l; i++) {
			if (parts[i] === '')
			  continue;
			if (validator.isValidBackgroundPositionPart(parts[i]) || validator.isValidVariable(parts[i]))
			  continue;

			return false;
		  }

		  return true;
		},
		isValidBackgroundSizePart: function(s) {
		  return backgroundSizeKeywords.indexOf(s) >= 0 || cssUnitRegex.test(s) || validator.isValidVariable(s);
		},
		isValidBackgroundPositionAndSize: function(s) {
		  if (s.indexOf('/') < 0)
			return false;

		  var twoParts = new Splitter('/').split(s);
		  return validator.isValidBackgroundSizePart(twoParts.pop()) && validator.isValidBackgroundPositionPart(twoParts.pop());
		},
		isValidListStyleType: function (s) {
		  return listStyleTypeKeywords.indexOf(s) >= 0 || validator.isValidVariable(s);
		},
		isValidListStylePosition: function (s) {
		  return listStylePositionKeywords.indexOf(s) >= 0 || validator.isValidVariable(s);
		},
		isValidOutlineColor: function (s) {
		  return s === 'invert' || validator.isValidColor(s) || validator.isValidVendorPrefixedValue(s);
		},
		isValidOutlineStyle: function (s) {
		  return outlineStyleKeywords.indexOf(s) >= 0 || validator.isValidVariable(s);
		},
		isValidOutlineWidth: function (s) {
		  return validator.isValidUnit(s) || widthKeywords.indexOf(s) >= 0 || validator.isValidVariable(s);
		},
		isValidVendorPrefixedValue: function (s) {
		  return /^-([A-Za-z0-9]|-)*$/gi.test(s);
		},
		areSameFunction: function (a, b) {
		  if (!validator.isValidFunction(a) || !validator.isValidFunction(b))
			return false;

		  var f1name = a.substring(0, a.indexOf('('));
		  var f2name = b.substring(0, b.indexOf('('));

		  return f1name === f2name;
		}
	  };

	  return validator;
	}).call(this);
	//#endregion

	//#region URL: ./properties/processable
	require['./properties/processable'] = (function () {
	  // Contains the interpretation of CSS properties, as used by the property optimizer

	  var tokenModule = require('./properties/token');
	  var validator = require('./properties/validator');
	  var Splitter = require('./text/splitter');

	  // Functions that decide what value can override what.
	  // The main purpose is to disallow removing CSS fallbacks.
	  // A separate implementation is needed for every different kind of CSS property.
	  // -----
	  // The generic idea is that properties that have wider browser support are 'more understandable'
	  // than others and that 'less understandable' values can't override more understandable ones.
	  var canOverride = {
		// Use when two tokens of the same property can always be merged
		always: function () {
		  // NOTE: We could have (val1, val2) parameters here but jshint complains because we don't use them
		  return true;
		},
		// Use when two tokens of the same property can only be merged if they have the same value
		sameValue: function(val1, val2) {
		  return val1 === val2;
		},
		sameFunctionOrValue: function(val1, val2) {
		  // Functions with the same name can override each other
		  if (validator.areSameFunction(val1, val2)) {
			return true;
		  }

		  return val1 === val2;
		},
		// Use for properties containing CSS units (margin-top, padding-left, etc.)
		unit: function(val1, val2) {
		  // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
		  // Understandability: (unit without functions) > (same functions | standard functions) > anything else
		  // NOTE: there is no point in having different vendor-specific functions override each other or standard functions,
		  //       or having standard functions override vendor-specific functions, but standard functions can override each other
		  // NOTE: vendor-specific property values are not taken into consideration here at the moment

		  if (validator.isValidUnitWithoutFunction(val2))
			return true;
		  if (validator.isValidUnitWithoutFunction(val1))
			return false;

		  // Standard non-vendor-prefixed functions can override each other
		  if (validator.isValidFunctionWithoutVendorPrefix(val2) && validator.isValidFunctionWithoutVendorPrefix(val1)) {
			return true;
		  }

		  // Functions with the same name can override each other; same values can override each other
		  return canOverride.sameFunctionOrValue(val1, val2);
		},
		// Use for color properties (color, background-color, border-color, etc.)
		color: function(val1, val2) {
		  // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
		  // Understandability: (hex | named) > (rgba | hsla) > (same function name) > anything else
		  // NOTE: at this point rgb and hsl are replaced by hex values by clean-css

		  // (hex | named)
		  if (validator.isValidNamedColor(val2) || validator.isValidHexColor(val2))
			return true;
		  if (validator.isValidNamedColor(val1) || validator.isValidHexColor(val1))
			return false;

		  // (rgba|hsla)
		  if (validator.isValidRgbaColor(val2) || validator.isValidHslaColor(val2))
			return true;
		  if (validator.isValidRgbaColor(val1) || validator.isValidHslaColor(val1))
			return false;

		  // Functions with the same name can override each other; same values can override each other
		  return canOverride.sameFunctionOrValue(val1, val2);
		},
		// Use for background-image
		backgroundImage: function(val1, val2) {
		  // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
		  // Understandability: (none | url | inherit) > (same function) > (same value)

		  // (none | url)
		  if (val2 === 'none' || val2 === 'inherit' || validator.isValidUrl(val2))
			return true;
		  if (val1 === 'none' || val1 === 'inherit' || validator.isValidUrl(val1))
			return false;

		  // Functions with the same name can override each other; same values can override each other
		  return canOverride.sameFunctionOrValue(val1, val2);
		},
		border: function(val1, val2) {
		  var brokenUp1 = breakUp.border(Token.tokenizeOne(val1));
		  var brokenUp2 = breakUp.border(Token.tokenizeOne(val2));

		  return canOverride.color(brokenUp1[2].value, brokenUp2[2].value);
		}
	  };
	  canOverride = Object.freeze(canOverride);

	  // Functions for breaking up shorthands to components
	  var breakUp = {};
	  breakUp.takeCareOfFourValues = function (splitfunc) {
		return function (token) {
		  var descriptor = processable[token.prop];
		  var result = [];
		  var splitval = splitfunc(token.value);

		  if (splitval.length === 0 || (splitval.length < descriptor.components.length && descriptor.components.length > 4)) {
			// This token is malformed and we have no idea how to fix it. So let's just keep it intact
			return [token];
		  }

		  // Fix those that we do know how to fix
		  if (splitval.length < descriptor.components.length && splitval.length < 2) {
			// foo{margin:1px} -> foo{margin:1px 1px}
			splitval[1] = splitval[0];
		  }
		  if (splitval.length < descriptor.components.length && splitval.length < 3) {
			// foo{margin:1px 2px} -> foo{margin:1px 2px 1px}
			splitval[2] = splitval[0];
		  }
		  if (splitval.length < descriptor.components.length && splitval.length < 4) {
			// foo{margin:1px 2px 3px} -> foo{margin:1px 2px 3px 2px}
			splitval[3] = splitval[1];
		  }

		  // Now break it up to its components
		  for (var i = 0; i < descriptor.components.length; i++) {
			var t = new Token(descriptor.components[i], splitval[i], token.isImportant);
			result.push(t);
		  }

		  return result;
		};
	  };
	  // Use this when you simply want to break up four values along spaces
	  breakUp.fourBySpaces = breakUp.takeCareOfFourValues(function (val) {
		return new Splitter(' ').split(val).filter(function (v) { return v; });
	  });
	  // Breaks up a background property value
	  breakUp.commaSeparatedMulitpleValues = function (splitfunc) {
		return function (token) {
		  if (token.value.indexOf(',') === -1)
			return splitfunc(token);

		  var values = new Splitter(',').split(token.value);
		  var components = [];

		  for (var i = 0, l = values.length; i < l; i++) {
			token.value = values[i];
			components.push(splitfunc(token));
		  }

		  for (var j = 0, m = components[0].length; j < m; j++) {
			for (var k = 0, n = components.length, newValues = []; k < n; k++) {
			  newValues.push(components[k][j].value);
			}

			components[0][j].value = newValues.join(',');
		  }

		  return components[0];
		};
	  };
	  breakUp.background = function (token) {
		// Default values
		var result = Token.makeDefaults(['background-image', 'background-position', 'background-size', 'background-repeat', 'background-attachment', 'background-color'], token.isImportant);
		var image = result[0];
		var position = result[1];
		var size = result[2];
		var repeat = result[3];
		var attachment = result[4];
		var color = result[5];

		// Take care of inherit
		if (token.value === 'inherit') {
		  // NOTE: 'inherit' is not a valid value for background-attachment so there we'll leave the default value
		  color.value = image.value =  repeat.value = position.value = size.value = attachment.value = 'inherit';
		  return result;
		}

		// Break the background up into parts
		var parts = new Splitter(' ').split(token.value);
		if (parts.length === 0)
		  return result;

		// Iterate over all parts and try to fit them into positions
		for (var i = parts.length - 1; i >= 0; i--) {
		  var currentPart = parts[i];

		  if (validator.isValidBackgroundAttachment(currentPart)) {
			attachment.value = currentPart;
		  } else if (validator.isValidBackgroundRepeat(currentPart)) {
			repeat.value = currentPart;
		  } else if (validator.isValidBackgroundPositionPart(currentPart) || validator.isValidBackgroundSizePart(currentPart)) {
			if (i > 0) {
			  var previousPart = parts[i - 1];

			  if (previousPart.indexOf('/') > 0) {
				var twoParts = new Splitter('/').split(previousPart);
				size.value = twoParts.pop() + ' ' + currentPart;
				parts[i - 1] = twoParts.pop();
			  } else if (i > 1 && parts[i - 2] == '/') {
				size.value = previousPart + ' ' + currentPart;
				i -= 2;
			  } else if (parts[i - 1] == '/') {
				size.value = currentPart;
				position.value = previousPart;
				i--;
			  } else {
				position.value = previousPart + ' ' + currentPart;
				i--;
			  }
			} else {
			  position.value = currentPart;
			}
		  } else if (validator.isValidBackgroundPositionAndSize(currentPart)) {
			var sizeValue = new Splitter('/').split(currentPart);
			size.value = sizeValue.pop();
			position.value = sizeValue.pop();
		  } else if ((color.value == processable[color.prop].defaultValue || color.value == 'none') && validator.isValidColor(currentPart)) {
			color.value = currentPart;
		  } else if (validator.isValidUrl(currentPart) || validator.isValidFunction(currentPart)) {
			image.value = currentPart;
		  }
		}

		return result;
	  };
	  // Breaks up a list-style property value
	  breakUp.listStyle = function (token) {
		// Default values
		var result = Token.makeDefaults(['list-style-type', 'list-style-position', 'list-style-image'], token.isImportant);
		var type = result[0], position = result[1], image = result[2];

		if (token.value === 'inherit') {
		  type.value = position.value = image.value = 'inherit';
		  return result;
		}

		var parts = new Splitter(' ').split(token.value);
		var ci = 0;

		// Type
		if (ci < parts.length && validator.isValidListStyleType(parts[ci])) {
		  type.value = parts[ci];
		  ci++;
		}
		// Position
		if (ci < parts.length && validator.isValidListStylePosition(parts[ci])) {
		  position.value = parts[ci];
		  ci++;
		}
		// Image
		if (ci < parts.length) {
		  image.value = parts.splice(ci, parts.length - ci + 1).join(' ');
		}

		return result;
	  };

	  breakUp._widthStyleColor = function(token, prefix, order) {
		// Default values
		var components = order.map(function(prop) {
		  return prefix + '-' + prop;
		});
		var result = Token.makeDefaults(components, token.isImportant);
		var color = result[order.indexOf('color')];
		var style = result[order.indexOf('style')];
		var width = result[order.indexOf('width')];

		// Take care of inherit
		if (token.value === 'inherit' || token.value === 'inherit inherit inherit') {
		  color.value = style.value = width.value = 'inherit';
		  return result;
		}

		// NOTE: usually users don't follow the required order of parts in this shorthand,
		// so we'll try to parse it caring as little about order as possible

		var parts = new Splitter(' ').split(token.value), w;

		if (parts.length === 0) {
		  return result;
		}

		if (parts.length >= 1) {
		  // Try to find -width, excluding inherit because that can be anything
		  w = parts.filter(function(p) { return p !== 'inherit' && validator.isValidOutlineWidth(p); });
		  if (w.length) {
			width.value = w[0];
			parts.splice(parts.indexOf(w[0]), 1);
		  }
		}
		if (parts.length >= 1) {
		  // Try to find -style, excluding inherit because that can be anything
		  w = parts.filter(function(p) { return p !== 'inherit' && validator.isValidOutlineStyle(p); });
		  if (w.length) {
			style.value = w[0];
			parts.splice(parts.indexOf(w[0]), 1);
		  }
		}
		if (parts.length >= 1) {
		  // Find -color but this time can catch inherit
		  w = parts.filter(function(p) { return validator.isValidOutlineColor(p); });
		  if (w.length) {
			color.value = w[0];
			parts.splice(parts.indexOf(w[0]), 1);
		  }
		}

		return result;
	  };

	  breakUp.outline = function(token) {
		return breakUp._widthStyleColor(token, 'outline', ['color', 'style', 'width']);
	  };

	  breakUp.border = function(token) {
		return breakUp._widthStyleColor(token, 'border', ['width', 'style', 'color']);
	  };

	  breakUp.borderRadius = function(token) {
		var parts = token.value.split('/');
		if (parts.length == 1)
		  return breakUp.fourBySpaces(token);

		var horizontalPart = token.clone();
		var verticalPart = token.clone();

		horizontalPart.value = parts[0];
		verticalPart.value = parts[1];

		var horizontalBreakUp = breakUp.fourBySpaces(horizontalPart);
		var verticalBreakUp = breakUp.fourBySpaces(verticalPart);

		for (var i = 0; i < 4; i++) {
		  horizontalBreakUp[i].value = [horizontalBreakUp[i].value, verticalBreakUp[i].value];
		}

		return horizontalBreakUp;
	  };

	  // Contains functions that can put together shorthands from their components
	  // NOTE: correct order of tokens is assumed inside these functions!
	  var putTogether = {
		// Use this for properties which have four unit values (margin, padding, etc.)
		// NOTE: optimizes to shorter forms too (that only specify 1, 2, or 3 values)
		fourUnits: function (prop, tokens, isImportant) {
		  // See about irrelevant tokens
		  // NOTE: This will enable some crazy optimalizations for us.
		  if (tokens[0].isIrrelevant)
			tokens[0].value = tokens[2].value;
		  if (tokens[2].isIrrelevant)
			tokens[2].value = tokens[0].value;
		  if (tokens[1].isIrrelevant)
			tokens[1].value = tokens[3].value;
		  if (tokens[3].isIrrelevant)
			tokens[3].value = tokens[1].value;

		  if (tokens[0].isIrrelevant && tokens[2].isIrrelevant) {
			if (tokens[1].value === tokens[3].value)
			  tokens[0].value = tokens[2].value = tokens[1].value;
			else
			  tokens[0].value = tokens[2].value = '0';
		  }
		  if (tokens[1].isIrrelevant && tokens[3].isIrrelevant) {
			if (tokens[0].value === tokens[2].value)
			  tokens[1].value = tokens[3].value = tokens[0].value;
			else
			  tokens[1].value = tokens[3].value = '0';
		  }

		  var result = new Token(prop, tokens[0].value, isImportant);
		  result.granularValues = [];
		  result.granularValues[tokens[0].prop] = tokens[0].value;
		  result.granularValues[tokens[1].prop] = tokens[1].value;
		  result.granularValues[tokens[2].prop] = tokens[2].value;
		  result.granularValues[tokens[3].prop] = tokens[3].value;

		  // If all of them are irrelevant
		  if (tokens[0].isIrrelevant && tokens[1].isIrrelevant && tokens[2].isIrrelevant && tokens[3].isIrrelevant) {
			result.value = processable[prop].shortestValue || processable[prop].defaultValue;
			return result;
		  }

		  // 1-value short form: all four components are equal
		  if (tokens[0].value === tokens[1].value && tokens[0].value === tokens[2].value && tokens[0].value === tokens[3].value) {
			return result;
		  }
		  result.value += ' ' + tokens[1].value;
		  // 2-value short form: first and third; second and fourth values are equal
		  if (tokens[0].value === tokens[2].value && tokens[1].value === tokens[3].value) {
			return result;
		  }
		  result.value += ' ' + tokens[2].value;
		  // 3-value short form: second and fourth values are equal
		  if (tokens[1].value === tokens[3].value) {
			return result;
		  }
		  // 4-value form (none of the above optimalizations could be accomplished)
		  result.value += ' ' + tokens[3].value;
		  return result;
		},
		// Puts together the components by spaces and omits default values (this is the case for most shorthands)
		bySpacesOmitDefaults: function (prop, tokens, isImportant, meta) {
		  var result = new Token(prop, '', isImportant);

		  // Get irrelevant tokens
		  var irrelevantTokens = tokens.filter(function (t) { return t.isIrrelevant; });

		  // If every token is irrelevant, return shortest possible value, fallback to default value
		  if (irrelevantTokens.length === tokens.length) {
			result.isIrrelevant = true;
			result.value = processable[prop].shortestValue || processable[prop].defaultValue;
			return result;
		  }

		  // This will be the value of the shorthand if all the components are default
		  var valueIfAllDefault = processable[prop].defaultValue;

		  // Go through all tokens and concatenate their values as necessary
		  for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];

			// Set granular value so that other parts of the code can use this for optimalization opportunities
			result.granularValues = result.granularValues || { };
			result.granularValues[token.prop] = token.value;

			// Use irrelevant tokens for optimalization opportunity
			if (token.isIrrelevant) {
			  // Get shortest possible value, fallback to default value
			  var tokenShortest = processable[token.prop].shortestValue || processable[token.prop].defaultValue;
			  // If the shortest possible value of this token is shorter than the default value of the shorthand, use it instead
			  if (tokenShortest.length < valueIfAllDefault.length) {
				valueIfAllDefault = tokenShortest;
			  }
			}

			// Omit default / irrelevant value
			if (token.isIrrelevant || (processable[token.prop] && processable[token.prop].defaultValue === token.value)) {
			  continue;
			}

			if (meta && meta.partsCount && meta.position < meta.partsCount - 1 && processable[token.prop].multiValueLastOnly)
			  continue;

			var requiresPreceeding = processable[token.prop].shorthandFollows;
			if (requiresPreceeding && (tokens[i - 1].value == processable[requiresPreceeding].defaultValue)) {
			  result.value += ' ' + tokens[i - 1].value;
			}

			result.value += (processable[token.prop].prefixShorthandValueWith || ' ') + token.value;
		  }

		  result.value = result.value.trim();
		  if (!result.value) {
			result.value = valueIfAllDefault;
		  }

		  return result;
		},
		commaSeparatedMulitpleValues: function (assembleFunction) {
		  return function(prop, tokens, isImportant) {
			var tokenSplitLengths = tokens.map(function (token) {
			  return new Splitter(',').split(token.value).length;
			});
			var partsCount = Math.max.apply(Math, tokenSplitLengths);

			if (partsCount == 1)
			  return assembleFunction(prop, tokens, isImportant);

			var merged = [];

			for (var i = 0; i < partsCount; i++) {
			  merged.push([]);

			  for (var j = 0; j < tokens.length; j++) {
				var split = new Splitter(',').split(tokens[j].value);
				merged[i].push(split[i] || split[0]);
			  }
			}

			var mergedValues = [];
			var firstProcessed;
			for (i = 0; i < partsCount; i++) {
			  for (var k = 0, n = merged[i].length; k < n; k++) {
				tokens[k].value = merged[i][k];
			  }

			  var meta = {
				partsCount: partsCount,
				position: i
			  };
			  var processed = assembleFunction(prop, tokens, isImportant, meta);
			  mergedValues.push(processed.value);

			  if (!firstProcessed)
				firstProcessed = processed;
			}

			firstProcessed.value = mergedValues.join(',');
			return firstProcessed;
		  };
		},
		// Handles the cases when some or all the fine-grained properties are set to inherit
		takeCareOfInherit: function (innerFunc) {
		  return function (prop, tokens, isImportant, meta) {
			// Filter out the inheriting and non-inheriting tokens in one iteration
			var inheritingTokens = [];
			var nonInheritingTokens = [];
			var result2Shorthandable = [];
			var i;
			for (i = 0; i < tokens.length; i++) {
			  if (tokens[i].value === 'inherit') {
				inheritingTokens.push(tokens[i]);

				// Indicate that this property is irrelevant and its value can safely be set to anything else
				var r2s = new Token(tokens[i].prop, tokens[i].isImportant);
				r2s.isIrrelevant = true;
				result2Shorthandable.push(r2s);
			  } else {
				nonInheritingTokens.push(tokens[i]);
				result2Shorthandable.push(tokens[i]);
			  }
			}

			if (nonInheritingTokens.length === 0) {
			  // When all the tokens are 'inherit'
			  return new Token(prop, 'inherit', isImportant);
			} else if (inheritingTokens.length > 0) {
			  // When some (but not all) of the tokens are 'inherit'

			  // Result 1. Shorthand just the inherit values and have it overridden with the non-inheriting ones
			  var result1 = [new Token(prop, 'inherit', isImportant)].concat(nonInheritingTokens);

			  // Result 2. Shorthand every non-inherit value and then have it overridden with the inheriting ones
			  var result2 = [innerFunc(prop, result2Shorthandable, isImportant, meta)].concat(inheritingTokens);

			  // Return whichever is shorter
			  var dl1 = Token.getDetokenizedLength(result1);
			  var dl2 = Token.getDetokenizedLength(result2);

			  return dl1 < dl2 ? result1 : result2;
			} else {
			  // When none of tokens are 'inherit'
			  return innerFunc(prop, tokens, isImportant, meta);
			}
		  };
		},
		borderRadius: function (prop, tokens, isImportant) {
		  var verticalTokens = [];

		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];
			if (!Array.isArray(token.value))
			  continue;

			if (token.value.length > 1) {
			  verticalTokens.push({
				prop: token.prop,
				value: token.value[1],
				isImportant: token.isImportant
			  });
			}

			token.value = token.value[0];
		  }

		  var result = putTogether.takeCareOfInherit(putTogether.fourUnits)(prop, tokens, isImportant);
		  if (verticalTokens.length > 0) {
			var verticalResult = putTogether.takeCareOfInherit(putTogether.fourUnits)(prop, verticalTokens, isImportant);
			if (result.value != verticalResult.value)
			  result.value += '/' + verticalResult.value;
		  }

		  return result;
		}
	  };

	  // Properties to process
	  // Extend this object in order to add support for more properties in the optimizer.
	  //
	  // Each key in this object represents a CSS property and should be an object.
	  // Such an object contains properties that describe how the represented CSS property should be handled.
	  // Possible options:
	  //
	  // * components: array (Only specify for shorthand properties.)
	  //   Contains the names of the granular properties this shorthand compacts.
	  //
	  // * canOverride: function (Default is canOverride.sameValue - meaning that they'll only be merged if they have the same value.)
	  //   Returns whether two tokens of this property can be merged with each other.
	  //   This property has no meaning for shorthands.
	  //
	  // * defaultValue: string
	  //   Specifies the default value of the property according to the CSS standard.
	  //   For shorthand, this is used when every component is set to its default value, therefore it should be the shortest possible default value of all the components.
	  //
	  // * shortestValue: string
	  //   Specifies the shortest possible value the property can possibly have.
	  //   (Falls back to defaultValue if unspecified.)
	  //
	  // * breakUp: function (Only specify for shorthand properties.)
	  //   Breaks the shorthand up to its components.
	  //
	  // * putTogether: function (Only specify for shorthand properties.)
	  //   Puts the shorthand together from its components.
	  //
	  var processable = {
		'color': {
		  canOverride: canOverride.color,
		  defaultValue: 'transparent',
		  shortestValue: 'red'
		},
		// background ------------------------------------------------------------------------------
		'background': {
		  components: [
			'background-image',
			'background-position',
			'background-size',
			'background-repeat',
			'background-attachment',
			'background-color'
		  ],
		  breakUp: breakUp.commaSeparatedMulitpleValues(breakUp.background),
		  putTogether: putTogether.commaSeparatedMulitpleValues(
			putTogether.takeCareOfInherit(putTogether.bySpacesOmitDefaults)
		  ),
		  defaultValue: '0 0',
		  shortestValue: '0'
		},
		'background-color': {
		  canOverride: canOverride.color,
		  defaultValue: 'transparent',
		  multiValueLastOnly: true,
		  shortestValue: 'red'
		},
		'background-image': {
		  canOverride: canOverride.backgroundImage,
		  defaultValue: 'none'
		},
		'background-repeat': {
		  canOverride: canOverride.always,
		  defaultValue: 'repeat'
		},
		'background-position': {
		  canOverride: canOverride.always,
		  defaultValue: '0 0',
		  shortestValue: '0'
		},
		'background-size': {
		  canOverride: canOverride.always,
		  defaultValue: 'auto',
		  shortestValue: '0 0',
		  prefixShorthandValueWith: '/',
		  shorthandFollows: 'background-position'
		},
		'background-attachment': {
		  canOverride: canOverride.always,
		  defaultValue: 'scroll'
		},
		'border': {
		  breakUp: breakUp.border,
		  canOverride: canOverride.border,
		  components: [
			'border-width',
			'border-style',
			'border-color'
		  ],
		  defaultValue: 'none',
		  putTogether: putTogether.takeCareOfInherit(putTogether.bySpacesOmitDefaults)
		},
		'border-color': {
		  canOverride: canOverride.color,
		  defaultValue: 'none'
		},
		'border-style': {
		  canOverride: canOverride.always,
		  defaultValue: 'none'
		},
		'border-width': {
		  canOverride: canOverride.unit,
		  defaultValue: 'medium',
		  shortestValue: '0'
		},
		// list-style ------------------------------------------------------------------------------
		'list-style': {
		  components: [
			'list-style-type',
			'list-style-position',
			'list-style-image'
		  ],
		  canOverride: canOverride.always,
		  breakUp: breakUp.listStyle,
		  putTogether: putTogether.takeCareOfInherit(putTogether.bySpacesOmitDefaults),
		  defaultValue: 'outside', // can't use 'disc' because that'd override default 'decimal' for <ol>
		  shortestValue: 'none'
		},
		'list-style-type' : {
		  canOverride: canOverride.always,
		  shortestValue: 'none',
		  defaultValue: '__hack'
		  // NOTE: we can't tell the real default value here, it's 'disc' for <ul> and 'decimal' for <ol>
		  //       -- this is a hack, but it doesn't matter because this value will be either overridden or it will disappear at the final step anyway
		},
		'list-style-position' : {
		  canOverride: canOverride.always,
		  defaultValue: 'outside',
		  shortestValue: 'inside'
		},
		'list-style-image' : {
		  canOverride: canOverride.always,
		  defaultValue: 'none'
		},
		// outline ------------------------------------------------------------------------------
		'outline': {
		  components: [
			'outline-color',
			'outline-style',
			'outline-width'
		  ],
		  breakUp: breakUp.outline,
		  putTogether: putTogether.takeCareOfInherit(putTogether.bySpacesOmitDefaults),
		  defaultValue: '0'
		},
		'outline-color': {
		  canOverride: canOverride.color,
		  defaultValue: 'invert',
		  shortestValue: 'red'
		},
		'outline-style': {
		  canOverride: canOverride.always,
		  defaultValue: 'none'
		},
		'outline-width': {
		  canOverride: canOverride.unit,
		  defaultValue: 'medium',
		  shortestValue: '0'
		},
		// transform
		'-moz-transform': {
		  canOverride: canOverride.sameFunctionOrValue
		},
		'-ms-transform': {
		  canOverride: canOverride.sameFunctionOrValue
		},
		'-webkit-transform': {
		  canOverride: canOverride.sameFunctionOrValue
		},
		'transform': {
		  canOverride: canOverride.sameFunctionOrValue
		}
	  };

	  var addFourValueShorthand = function (prop, components, options) {
		options = options || {};
		processable[prop] = {
		  components: components,
		  breakUp: options.breakUp || breakUp.fourBySpaces,
		  putTogether: options.putTogether || putTogether.takeCareOfInherit(putTogether.fourUnits),
		  defaultValue: options.defaultValue || '0',
		  shortestValue: options.shortestValue
		};
		for (var i = 0; i < components.length; i++) {
		  processable[components[i]] = {
			breakUp: options.breakUp || breakUp.fourBySpaces,
			canOverride: options.canOverride || canOverride.unit,
			defaultValue: options.defaultValue || '0',
			shortestValue: options.shortestValue
		  };
		}
	  };

	  ['', '-moz-', '-o-', '-webkit-'].forEach(function (prefix) {
		addFourValueShorthand(prefix + 'border-radius', [
		  prefix + 'border-top-left-radius',
		  prefix + 'border-top-right-radius',
		  prefix + 'border-bottom-right-radius',
		  prefix + 'border-bottom-left-radius'
		], {
		  breakUp: breakUp.borderRadius,
		  putTogether: putTogether.borderRadius
		});
	  });

	  addFourValueShorthand('border-color', [
		'border-top-color',
		'border-right-color',
		'border-bottom-color',
		'border-left-color'
	  ], {
		breakUp: breakUp.fourBySpaces,
		canOverride: canOverride.color,
		defaultValue: 'currentColor',
		shortestValue: 'red'
	  });

	  addFourValueShorthand('border-style', [
		'border-top-style',
		'border-right-style',
		'border-bottom-style',
		'border-left-style'
	  ], {
		breakUp: breakUp.fourBySpaces,
		canOverride: canOverride.always,
		defaultValue: 'none'
	  });

	  addFourValueShorthand('border-width', [
		'border-top-width',
		'border-right-width',
		'border-bottom-width',
		'border-left-width'
	  ], {
		defaultValue: 'medium',
		shortestValue: '0'
	  });

	  addFourValueShorthand('padding', [
		'padding-top',
		'padding-right',
		'padding-bottom',
		'padding-left'
	  ]);

	  addFourValueShorthand('margin', [
		'margin-top',
		'margin-right',
		'margin-bottom',
		'margin-left'
	  ]);

	  // Set some stuff iteratively
	  for (var proc in processable) {
		if (!processable.hasOwnProperty(proc))
		  continue;

		var currDesc = processable[proc];

		if (!(currDesc.components instanceof Array) || currDesc.components.length === 0)
		  continue;

		currDesc.isShorthand = true;

		for (var cI = 0; cI < currDesc.components.length; cI++) {
		  if (!processable[currDesc.components[cI]]) {
			throw new Error('"' + currDesc.components[cI] + '" is defined as a component of "' + proc + '" but isn\'t defined in processable.');
		  }
		  processable[currDesc.components[cI]].componentOf = proc;
		}
	  }

	  var Token = tokenModule.createTokenPrototype(processable);

	  return {
		implementedFor: /background|border|color|list|margin|outline|padding|transform/,
		processable: processable,
		Token: Token
	  };
	}).call(this);
	//#endregion
	
	//#region URL: ./properties/override-compactor
	require['./properties/override-compactor'] = (function () {
	  // Compacts the given tokens according to their ability to override each other.
	
	  // Default override function: only allow overrides when the two values are the same
	  var sameValue = function (val1, val2) {
		return val1 === val2;
	  };

	  var compactOverrides = function (tokens, processable) {
		var result, can, token, t, i, ii, oldResult, matchingComponent;

		// Used when searching for a component that matches token
		var nameMatchFilter1 = function (x) {
		  return x.prop === token.prop;
		};
		// Used when searching for a component that matches t
		var nameMatchFilter2 = function (x) {
		  return x.prop === t.prop;
		};

		// Go from the end and always take what the current token can't override as the new result set
		// NOTE: can't cache result.length here because it will change with every iteration
		for (result = tokens, i = 0; (ii = result.length - 1 - i) >= 0; i++) {
		  token = result[ii];
		  can = (processable[token.prop] && processable[token.prop].canOverride) || sameValue;
		  oldResult = result;
		  result = [];

		  // Special flag which indicates that the current token should be removed
		  var removeSelf = false;
		  var oldResultLength = oldResult.length;

		  for (var iii = 0; iii < oldResultLength; iii++) {
			t = oldResult[iii];

			// A token can't override itself (checked by reference, not by value)
			// NOTE: except when we explicitly tell it to remove itself
			if (t === token && !removeSelf) {
			  result.push(t);
			  continue;
			}

			// Only an important token can even try to override tokens that come after it
			if (iii > ii && !token.isImportant) {
			  result.push(t);
			  continue;
			}

			// A nonimportant token can never override an important one
			if (t.isImportant && !token.isImportant) {
			  result.push(t);
			  continue;
			}

			if (token.isShorthand && !t.isShorthand && t.isComponentOf(token)) {
			  // token (a shorthand) is trying to override t (a component)

			  // Find the matching component in the shorthand
			  matchingComponent = token.components.filter(nameMatchFilter2)[0];
			  can = (processable[t.prop] && processable[t.prop].canOverride) || sameValue;
			  if (!can(t.value, matchingComponent.value)) {
				// The shorthand can't override the component
				result.push(t);
			  }
			} else if (t.isShorthand && !token.isShorthand && token.isComponentOf(t)) {
			  // token (a component) is trying to override a component of t (a shorthand)

			  // Find the matching component in the shorthand
			  matchingComponent = t.components.filter(nameMatchFilter1)[0];
			  if (can(matchingComponent.value, token.value)) {
				// The component can override the matching component in the shorthand

				if (!token.isImportant) {
				  // The overriding component is non-important which means we can simply include it into the shorthand
				  // NOTE: stuff that can't really be included, like inherit, is taken care of at the final step, not here
				  matchingComponent.value = token.value;
				  // We use the special flag to get rid of the component
				  removeSelf = true;
				} else {
				  // The overriding component is important; sadly we can't get rid of it,
				  // but we can still mark the matching component in the shorthand as irrelevant
				  matchingComponent.isIrrelevant = true;
				}
				t.isDirty = true;
			  }
			  result.push(t);
			} else if (token.isShorthand && t.isShorthand && token.prop === t.prop) {
			  // token is a shorthand and is trying to override another instance of the same shorthand

			  // Can only override other shorthand when each of its components can override each of the other's components
			  for (var iiii = 0; iiii < t.components.length; iiii++) {
				can = (processable[t.components[iiii].prop] && processable[t.components[iiii].prop].canOverride) || sameValue;
				if (!can(t.components[iiii].value, token.components[iiii].value)) {
				  result.push(t);
				  break;
				}
			  }
			} else if (t.prop !== token.prop || !can(t.value, token.value)) {
			  // in every other case, use the override mechanism
			  result.push(t);
			}
		  }
		  if (removeSelf) {
			i--;
		  }
		}

		return result;
	  };

	  return {
		compactOverrides: compactOverrides
	  };
	}).call(this);
	//#endregion
	
	//#region URL: ./properties/shorthand-compactor
	require['./properties/shorthand-compactor'] = (function () {
	  // Compacts the tokens by transforming properties into their shorthand notations when possible

	  var isHackValue = function (t) { return t.value === '__hack'; };

	  var compactShorthands = function(tokens, isImportant, processable, Token) {
		// Contains the components found so far, grouped by shorthand name
		var componentsSoFar = { };

		// Initializes a prop in componentsSoFar
		var initSoFar = function (shprop, last, clearAll) {
		  var found = {};
		  var shorthandPosition;

		  if (!clearAll && componentsSoFar[shprop]) {
			for (var i = 0; i < processable[shprop].components.length; i++) {
			  var prop = processable[shprop].components[i];
			  found[prop] = [];

			  if (!(componentsSoFar[shprop].found[prop]))
				continue;

			  for (var ii = 0; ii < componentsSoFar[shprop].found[prop].length; ii++) {
				var comp = componentsSoFar[shprop].found[prop][ii];

				if (comp.isMarkedForDeletion)
				  continue;

				found[prop].push(comp);

				if (comp.position && (!shorthandPosition || comp.position < shorthandPosition))
				  shorthandPosition = comp.position;
			  }
			}
		  }
		  componentsSoFar[shprop] = {
			lastShorthand: last,
			found: found,
			shorthandPosition: shorthandPosition
		  };
		};

		// Adds a component to componentsSoFar
		var addComponentSoFar = function (token, index) {
		  var shprop = processable[token.prop].componentOf;
		  if (!componentsSoFar[shprop])
			initSoFar(shprop);
		  if (!componentsSoFar[shprop].found[token.prop])
			componentsSoFar[shprop].found[token.prop] = [];

		  // Add the newfound component to componentsSoFar
		  componentsSoFar[shprop].found[token.prop].push(token);

		  if (!componentsSoFar[shprop].shorthandPosition && index) {
			// If the haven't decided on where the shorthand should go, put it in the place of this component
			componentsSoFar[shprop].shorthandPosition = index;
		  }
		};

		// Tries to compact a prop in componentsSoFar
		var compactSoFar = function (prop) {
		  var i;
		  var componentsCount = processable[prop].components.length;

		  // Check basics
		  if (!componentsSoFar[prop] || !componentsSoFar[prop].found)
			return false;

		  // Find components for the shorthand
		  var components = [];
		  var realComponents = [];
		  for (i = 0 ; i < componentsCount; i++) {
			// Get property name
			var pp = processable[prop].components[i];

			if (componentsSoFar[prop].found[pp] && componentsSoFar[prop].found[pp].length) {
			  // We really found it
			  var foundRealComp = componentsSoFar[prop].found[pp][0];
			  components.push(foundRealComp);
			  if (foundRealComp.isReal !== false) {
				realComponents.push(foundRealComp);
			  }
			} else if (componentsSoFar[prop].lastShorthand) {
			  // It's defined in the previous shorthand
			  var c = componentsSoFar[prop].lastShorthand.components[i].clone(isImportant);
			  components.push(c);
			} else {
			  // Couldn't find this component at all
			  return false;
			}
		  }

		  if (realComponents.length === 0) {
			// Couldn't find enough components, sorry
			return false;
		  }

		  if (realComponents.length === componentsCount) {
			// When all the components are from real values, only allow shorthanding if their understandability allows it
			// This is the case when every component can override their default values, or when all of them use the same function

			var canOverrideDefault = true;
			var functionNameMatches = true;
			var functionName;

			for (var ci = 0; ci < realComponents.length; ci++) {
			  var rc = realComponents[ci];

			  if (!processable[rc.prop].canOverride(processable[rc.prop].defaultValue, rc.value)) {
				canOverrideDefault = false;
			  }
			  var iop = rc.value.indexOf('(');
			  if (iop >= 0) {
				var otherFunctionName = rc.value.substring(0, iop);
				if (functionName)
				  functionNameMatches = functionNameMatches && otherFunctionName === functionName;
				else
				  functionName = otherFunctionName;
			  }
			}

			if (!canOverrideDefault || !functionNameMatches)
			  return false;
		  }

		  // Compact the components into a shorthand
		  var compacted = processable[prop].putTogether(prop, components, isImportant);
		  if (!(compacted instanceof Array)) {
			compacted = [compacted];
		  }

		  var compactedLength = Token.getDetokenizedLength(compacted);
		  var authenticLength = Token.getDetokenizedLength(realComponents);

		  if (realComponents.length === componentsCount || compactedLength < authenticLength || components.some(isHackValue)) {
			compacted[0].isShorthand = true;
			compacted[0].components = processable[prop].breakUp(compacted[0]);

			// Mark the granular components for deletion
			for (i = 0; i < realComponents.length; i++) {
			  realComponents[i].isMarkedForDeletion = true;
			}

			// Mark the position of the new shorthand
			tokens[componentsSoFar[prop].shorthandPosition].replaceWith = compacted;

			// Reinitialize the thing for further compacting
			initSoFar(prop, compacted[0]);
			for (i = 1; i < compacted.length; i++) {
			  addComponentSoFar(compacted[i]);
			}

			// Yes, we can keep the new shorthand!
			return true;
		  }

		  return false;
		};

		// Tries to compact all properties currently in componentsSoFar
		var compactAllSoFar = function () {
		  for (var i in componentsSoFar) {
			if (componentsSoFar.hasOwnProperty(i)) {
			  while (compactSoFar(i)) { }
			}
		  }
		};

		var i, token;

		// Go through each token and collect components for each shorthand as we go on
		for (i = 0; i < tokens.length; i++) {
		  token = tokens[i];
		  if (token.isMarkedForDeletion) {
			continue;
		  }
		  if (!processable[token.prop]) {
			// We don't know what it is, move on
			continue;
		  }
		  if (processable[token.prop].isShorthand) {
			// Found an instance of a full shorthand
			// NOTE: we should NOT mix together tokens that come before and after the shorthands

			if (token.isImportant === isImportant || (token.isImportant && !isImportant)) {
			  // Try to compact what we've found so far
			  while (compactSoFar(token.prop)) { }
			  // Reset
			  initSoFar(token.prop, token, true);
			}

			// TODO: when the old optimizer is removed, take care of this corner case:
			//   div{background-color:#111;background-image:url(aaa);background:linear-gradient(aaa);background-repeat:no-repeat;background-position:1px 2px;background-attachment:scroll}
			//   -> should not be shorthanded / minified at all because the result wouldn't be equivalent to the original in any browser
		  } else if (processable[token.prop].componentOf) {
			// Found a component of a shorthand
			if (token.isImportant === isImportant) {
			  // Same importantness
			  token.position = i;
			  addComponentSoFar(token, i);
			} else if (!isImportant && token.isImportant) {
			  // Use importants for optimalization opportunities
			  // https://github.com/GoalSmashers/clean-css/issues/184
			  var importantTrickComp = new Token(token.prop, token.value, isImportant);
			  importantTrickComp.isIrrelevant = true;
			  importantTrickComp.isReal = false;
			  addComponentSoFar(importantTrickComp);
			}
		  } else {
			// This is not a shorthand and not a component, don't care about it
			continue;
		  }
		}

		// Perform all possible compactions
		compactAllSoFar();

		// Process the results - throw away stuff marked for deletion, insert compacted things, etc.
		var result = [];
		for (i = 0; i < tokens.length; i++) {
		  token = tokens[i];

		  if (token.replaceWith) {
			for (var ii = 0; ii < token.replaceWith.length; ii++) {
			  result.push(token.replaceWith[ii]);
			}
		  }
		  if (!token.isMarkedForDeletion) {
			result.push(token);
		  }

		  token.isMarkedForDeletion = false;
		  token.replaceWith = null;
		}

		return result;
	  };

	  return {
		compactShorthands: compactShorthands
	  };
	}).call(this);
	//#endregion

	//#region URL: ./properties/optimizer
	require['./properties/optimizer'] = (function () {
		var processableInfo = require('./properties/processable');
		var overrideCompactor = require('./properties/override-compactor');
		var shorthandCompactor = require('./properties/shorthand-compactor');

		function Optimizer(compatibility, aggressiveMerging) {
		  var overridable = {
			'animation-delay': ['animation'],
			'animation-direction': ['animation'],
			'animation-duration': ['animation'],
			'animation-fill-mode': ['animation'],
			'animation-iteration-count': ['animation'],
			'animation-name': ['animation'],
			'animation-play-state': ['animation'],
			'animation-timing-function': ['animation'],
			'-moz-animation-delay': ['-moz-animation'],
			'-moz-animation-direction': ['-moz-animation'],
			'-moz-animation-duration': ['-moz-animation'],
			'-moz-animation-fill-mode': ['-moz-animation'],
			'-moz-animation-iteration-count': ['-moz-animation'],
			'-moz-animation-name': ['-moz-animation'],
			'-moz-animation-play-state': ['-moz-animation'],
			'-moz-animation-timing-function': ['-moz-animation'],
			'-o-animation-delay': ['-o-animation'],
			'-o-animation-direction': ['-o-animation'],
			'-o-animation-duration': ['-o-animation'],
			'-o-animation-fill-mode': ['-o-animation'],
			'-o-animation-iteration-count': ['-o-animation'],
			'-o-animation-name': ['-o-animation'],
			'-o-animation-play-state': ['-o-animation'],
			'-o-animation-timing-function': ['-o-animation'],
			'-webkit-animation-delay': ['-webkit-animation'],
			'-webkit-animation-direction': ['-webkit-animation'],
			'-webkit-animation-duration': ['-webkit-animation'],
			'-webkit-animation-fill-mode': ['-webkit-animation'],
			'-webkit-animation-iteration-count': ['-webkit-animation'],
			'-webkit-animation-name': ['-webkit-animation'],
			'-webkit-animation-play-state': ['-webkit-animation'],
			'-webkit-animation-timing-function': ['-webkit-animation'],
			'background-attachment': ['background'],
			'background-clip': ['background'],
			'background-color': ['background'],
			'background-image': ['background'],
			'background-origin': ['background'],
			'background-position': ['background'],
			'background-repeat': ['background'],
			'background-size': ['background'],
			'border-color': ['border'],
			'border-style': ['border'],
			'border-width': ['border'],
			'border-bottom': ['border'],
			'border-bottom-color': ['border-bottom', 'border-color', 'border'],
			'border-bottom-style': ['border-bottom', 'border-style', 'border'],
			'border-bottom-width': ['border-bottom', 'border-width', 'border'],
			'border-left': ['border'],
			'border-left-color': ['border-left', 'border-color', 'border'],
			'border-left-style': ['border-left', 'border-style', 'border'],
			'border-left-width': ['border-left', 'border-width', 'border'],
			'border-right': ['border'],
			'border-right-color': ['border-right', 'border-color', 'border'],
			'border-right-style': ['border-right', 'border-style', 'border'],
			'border-right-width': ['border-right', 'border-width', 'border'],
			'border-top': ['border'],
			'border-top-color': ['border-top', 'border-color', 'border'],
			'border-top-style': ['border-top', 'border-style', 'border'],
			'border-top-width': ['border-top', 'border-width', 'border'],
			'font-family': ['font'],
			'font-size': ['font'],
			'font-style': ['font'],
			'font-variant': ['font'],
			'font-weight': ['font'],
			'list-style-image': ['list-style'],
			'list-style-position': ['list-style'],
			'list-style-type': ['list-style'],
			'margin-bottom': ['margin'],
			'margin-left': ['margin'],
			'margin-right': ['margin'],
			'margin-top': ['margin'],
			'outline-color': ['outline'],
			'outline-style': ['outline'],
			'outline-width': ['outline'],
			'padding-bottom': ['padding'],
			'padding-left': ['padding'],
			'padding-right': ['padding'],
			'padding-top': ['padding'],
			'transition-delay': ['transition'],
			'transition-duration': ['transition'],
			'transition-property': ['transition'],
			'transition-timing-function': ['transition'],
			'-moz-transition-delay': ['-moz-transition'],
			'-moz-transition-duration': ['-moz-transition'],
			'-moz-transition-property': ['-moz-transition'],
			'-moz-transition-timing-function': ['-moz-transition'],
			'-o-transition-delay': ['-o-transition'],
			'-o-transition-duration': ['-o-transition'],
			'-o-transition-property': ['-o-transition'],
			'-o-transition-timing-function': ['-o-transition'],
			'-webkit-transition-delay': ['-webkit-transition'],
			'-webkit-transition-duration': ['-webkit-transition'],
			'-webkit-transition-property': ['-webkit-transition'],
			'-webkit-transition-timing-function': ['-webkit-transition']
		  };

		  var IE_BACKSLASH_HACK = '\\9';

		  var overrides = {};
		  for (var granular in overridable) {
			for (var i = 0; i < overridable[granular].length; i++) {
			  var coarse = overridable[granular][i];
			  var list = overrides[coarse];

			  if (list)
				list.push(granular);
			  else
				overrides[coarse] = [granular];
			}
		  }

		  var tokenize = function(body) {
			var tokens = body.split(';');
			var keyValues = [];

			if (tokens.length === 0 || (tokens.length == 1 && tokens[0].indexOf(IE_BACKSLASH_HACK) == -1))
			  return;

			for (var i = 0, l = tokens.length; i < l; i++) {
			  var token = tokens[i];
			  if (token === '')
				continue;

			  var firstColon = token.indexOf(':');
			  keyValues.push([
				token.substring(0, firstColon),
				token.substring(firstColon + 1),
				token.indexOf('!important') > -1,
				token.indexOf(IE_BACKSLASH_HACK, firstColon + 1) === token.length - IE_BACKSLASH_HACK.length
			  ]);
			}

			return keyValues;
		  };

		  var optimize = function(tokens, allowAdjacent) {
			var merged = [];
			var properties = [];
			var lastProperty = null;
			var rescanTrigger = {};

			var removeOverridenBy = function(property, isImportant) {
			  var overrided = overrides[property];
			  for (var i = 0, l = overrided.length; i < l; i++) {
				for (var j = 0; j < properties.length; j++) {
				  if (properties[j] != overrided[i] || (merged[j][2] && !isImportant))
					continue;

				  merged.splice(j, 1);
				  properties.splice(j, 1);
				  j -= 1;
				}
			  }
			};

			var mergeablePosition = function(position) {
			  if (allowAdjacent === false || allowAdjacent === true)
				return allowAdjacent;

			  return allowAdjacent.indexOf(position) > -1;
			};

			tokensLoop:
			for (var i = 0, l = tokens.length; i < l; i++) {
			  var token = tokens[i];
			  var property = token[0];
			  var value = token[1];
			  var isImportant = token[2];
			  var isIEHack = token[3];
			  var _property = (property == '-ms-filter' || property == 'filter') ?
				(lastProperty == 'background' || lastProperty == 'background-image' ? lastProperty : property) :
				property;
			  var toOverridePosition = 0;

			  if (!compatibility && isIEHack)
				continue;

			  // comment is necessary - we assume that if two properties are one after another
			  // then it is intentional way of redefining property which may not be widely supported
			  // e.g. a{display:inline-block;display:-moz-inline-box}
			  // however if `mergeablePosition` yields true then the rule does not apply
			  // (e.g merging two adjacent selectors: `a{display:block}a{display:block}`)
			  if (aggressiveMerging && _property != lastProperty || mergeablePosition(i)) {
				while (true) {
				  toOverridePosition = properties.indexOf(_property, toOverridePosition);
				  if (toOverridePosition == -1)
					break;

				  var lastToken = merged[toOverridePosition];
				  var wasImportant = lastToken[2];
				  var wasIEHack = lastToken[3];

				  if (wasImportant && !isImportant)
					continue tokensLoop;

				  if (compatibility && !wasIEHack && isIEHack)
					break;

				  var _info = processableInfo.processable[_property];
				  if (!isIEHack && !wasIEHack && _info && _info.canOverride && !_info.canOverride(tokens[toOverridePosition][1], value))
					break;

				  merged.splice(toOverridePosition, 1);
				  properties.splice(toOverridePosition, 1);
				}
			  }

			  merged.push(token);
			  properties.push(_property);

			  // certain properties (see values of `overridable`) should trigger removal of
			  // more granular properties (see keys of `overridable`)
			  if (rescanTrigger[_property])
				removeOverridenBy(_property, isImportant);

			  // add rescan triggers - if certain property appears later in the list a rescan needs
			  // to be triggered, e.g 'border-top' triggers a rescan after 'border-top-width' and
			  // 'border-top-color' as they can be removed
			  for (var j = 0, list = overridable[_property] || [], m = list.length; j < m; j++)
				rescanTrigger[list[j]] = true;

			  lastProperty = _property;
			}

			return merged;
		  };

		  var rebuild = function(tokens) {
			var flat = [];


			for (var i = 0, l = tokens.length; i < l; i++) {
			  flat.push(tokens[i][0] + ':' + tokens[i][1]);
			}

			return flat.join(';');
		  };

		  var compact = function (input) {
			var processable = processableInfo.processable;
			var Token = processableInfo.Token;

			var tokens = Token.tokenize(input);

			tokens = overrideCompactor.compactOverrides(tokens, processable);
			tokens = shorthandCompactor.compactShorthands(tokens, false, processable, Token);
			tokens = shorthandCompactor.compactShorthands(tokens, true, processable, Token);

			return Token.detokenize(tokens);
		  };

		  return {
			process: function(body, allowAdjacent, skipCompacting) {
			  var result = body;

			  var tokens = tokenize(body);
			  if (tokens) {
				var optimized = optimize(tokens, allowAdjacent);
				result = rebuild(optimized);
			  }

			  if (!skipCompacting && processableInfo.implementedFor.test(result)) {
				result = compact(result);
			  }

			  return result;
			}
		  };
		};

		return Optimizer;
	}).call(this);
	//#endregion
	
	//#region URL: ./properties/scanner
	require['./properties/scanner'] = (function () {
	  var OPEN_BRACE = '{';
	  var SEMICOLON = ';';
	  var COLON = ':';

	  var PropertyScanner = function PropertyScanner(data) {
		this.data = data;
	  };

	  PropertyScanner.prototype.nextAt = function(cursor) {
		var lastColon = this.data.lastIndexOf(COLON, cursor);
		var lastOpenBrace = this.data.lastIndexOf(OPEN_BRACE, cursor);
		var lastSemicolon = this.data.lastIndexOf(SEMICOLON, cursor);
		var startAt = Math.max(lastOpenBrace, lastSemicolon);

		return this.data.substring(startAt + 1, lastColon).trim();
	  };

	  return PropertyScanner;
	}).call(this);
	//#endregion
	
	//#region URL: ./text/escape-store
	require['./text/escape-store'] = (function () {
		function EscapeStore(placeholderRoot) {
		  placeholderRoot = 'ESCAPED_' + placeholderRoot + '_CLEAN_CSS';

		  var placeholderToData = {};
		  var dataToPlaceholder = {};
		  var count = 0;
		  var nextPlaceholder = function() {
			return '__' + placeholderRoot + (count++) + '__';
		  };
		  var pattern = '(__' + placeholderRoot + '\\d{1,}__)';

		  return {
			placeholderPattern: pattern,

			placeholderRegExp: new RegExp(pattern, 'g'),

			store: function(data) {
			  var placeholder = dataToPlaceholder[data];
			  if (!placeholder) {
				placeholder = nextPlaceholder();
				placeholderToData[placeholder] = data;
				dataToPlaceholder[data] = placeholder;
			  }

			  return placeholder;
			},

			restore: function(placeholder) {
			  return placeholderToData[placeholder];
			}
		  };
		};
		
		return EscapeStore;
	}).call(this);
	//#endregion
	
	//#region URL: ./text/quote-scanner
	require['./text/quote-scanner'] = (function () {
	  var QuoteScanner = function QuoteScanner(data) {
		this.data = data;
	  };

	  var findQuoteEnd = function(data, matched, cursor, oldCursor) {
		var commentStartMark = '/*';
		var commentEndMark = '*/';
		var escapeMark = '\\';
		var blockEndMark = '}';
		var dataPrefix = data.substring(oldCursor, cursor);
		var commentEndedAt = dataPrefix.lastIndexOf(commentEndMark, cursor);
		var commentStartedAt = dataPrefix.lastIndexOf(commentStartMark, cursor);
		var commentStarted = false;

		if (commentEndedAt >= cursor && commentStartedAt > -1)
		  commentStarted = true;
		if (commentStartedAt < cursor && commentStartedAt > commentEndedAt)
		  commentStarted = true;

		if (commentStarted) {
		  var commentEndsAt = data.indexOf(commentEndMark, cursor);
		  if (commentEndsAt > -1)
			return commentEndsAt;

		  commentEndsAt = data.indexOf(blockEndMark, cursor);
		  return commentEndsAt > -1 ? commentEndsAt - 1 : data.length;
		}

		while (true) {
		  if (data[cursor] === undefined)
			break;
		  if (data[cursor] == matched && data[cursor - 1] != escapeMark)
			break;

		  cursor++;
		}

		return cursor;
	  };

	  QuoteScanner.prototype.each = function(callback) {
		var data = this.data;
		var tempData = [];
		var nextStart = 0;
		var nextEnd = 0;
		var cursor = 0;
		var matchedMark = null;
		var singleMark = '\'';
		var doubleMark = '"';
		var dataLength = data.length;

		for (; nextEnd < data.length;) {
		  var nextStartSingle = data.indexOf(singleMark, nextEnd + 1);
		  var nextStartDouble = data.indexOf(doubleMark, nextEnd + 1);

		  if (nextStartSingle == -1)
			nextStartSingle = dataLength;
		  if (nextStartDouble == -1)
			nextStartDouble = dataLength;

		  if (nextStartSingle < nextStartDouble) {
			nextStart = nextStartSingle;
			matchedMark = singleMark;
		  } else {
			nextStart = nextStartDouble;
			matchedMark = doubleMark;
		  }

		  if (nextStart == -1)
			break;

		  nextEnd = findQuoteEnd(data, matchedMark, nextStart + 1, cursor);
		  if (nextEnd == -1)
			break;

		  var text = data.substring(nextStart, nextEnd + 1);
		  tempData.push(data.substring(cursor, nextStart));
		  if (text.length > 0)
			callback(text, tempData, nextStart);

		  cursor = nextEnd + 1;
		}

		return tempData.length > 0 ?
		  tempData.join('') + data.substring(cursor, data.length) :
		  data;
	  };
	  
	  return QuoteScanner;
	}).call(this);
	//#endregion
	
	//#region URL: ./text/comments
	require['./text/comments'] = (function () {
		var EscapeStore = require('./text/escape-store');
		var QuoteScanner = require('./text/quote-scanner');

		function Comments(keepSpecialComments, keepBreaks, lineBreak) {
		  var comments = new EscapeStore('COMMENT');

		  return {
			// Strip special comments (/*! ... */) by replacing them by a special marker
			// for further restoring. Plain comments are removed. It's done by scanning data using
			// String#indexOf scanning instead of regexps to speed up the process.
			escape: function(data) {
			  var tempData = [];
			  var nextStart = 0;
			  var nextEnd = 0;
			  var cursor = 0;
			  var isQuotedAt = (function () {
				var quoteMap = [];
				new QuoteScanner(data).each(function (quotedString, _, startsAt) {
				  quoteMap.push([startsAt, startsAt + quotedString.length]);
				});

				return function (position) {
				  for (var i = 0, l = quoteMap.length; i < l; i++) {
					if (quoteMap[i][0] < position && quoteMap[i][1] > position)
					  return true;
				  }

				  return false;
				};
			  })();

			  for (; nextEnd < data.length;) {
				nextStart = data.indexOf('/*', cursor);
				if (nextStart == -1)
				  break;
				if (isQuotedAt(nextStart)) {
				  tempData.push(data.substring(cursor, nextStart + 2));
				  cursor = nextStart + 2;
				  continue;
				}

				nextEnd = data.indexOf('*/', nextStart + 2);
				if (nextEnd == -1)
				  break;

				tempData.push(data.substring(cursor, nextStart));
				if (data[nextStart + 2] == '!') {
				  // in case of special comments, replace them with a placeholder
				  var comment = data.substring(nextStart, nextEnd + 2);
				  var placeholder = comments.store(comment);
				  tempData.push(placeholder);
				}
				cursor = nextEnd + 2;
			  }

			  return tempData.length > 0 ?
				tempData.join('') + data.substring(cursor, data.length) :
				data;
			},

			restore: function(data) {
			  var restored = 0;
			  var breakSuffix = keepBreaks ? lineBreak : '';

			  return data.replace(new RegExp(comments.placeholderPattern + '(' + lineBreak + '| )?', 'g'), function(match, placeholder) {
				restored++;

				switch (keepSpecialComments) {
				  case '*':
					return comments.restore(placeholder) + breakSuffix;
				  case 1:
				  case '1':
					return restored == 1 ?
					  comments.restore(placeholder) + breakSuffix :
					  '';
				  case 0:
				  case '0':
					return '';
				}
			  });
			}
		  };
		};
		
		return Comments;
	}).call(this);
	//#endregion
	
	//#region URL: ./text/expressions
	require['./text/expressions'] = (function () {
		var EscapeStore = require('./text/escape-store');

		function Expressions() {
		  var expressions = new EscapeStore('EXPRESSION');

		  var findEnd = function(data, start) {
			var end = start + 'expression'.length;
			var level = 0;
			var quoted = false;

			while (true) {
			  var next = data[end++];

			  if (quoted) {
				quoted = next != '\'' && next != '"';
			  } else {
				quoted = next == '\'' || next == '"';

				if (next == '(')
				  level++;
				if (next == ')')
				  level--;
				if (next == '}' && level == 1) {
				  end--;
				  level--;
				}
			  }

			  if (level === 0 && next == ')')
				break;
			  if (!next) {
				end = data.substring(0, end).lastIndexOf('}');
				break;
			  }
			}

			return end;
		  };

		  return {
			// Escapes expressions by replacing them by a special
			// marker for further restoring. It's done via string scanning
			// instead of regexps to speed up the process.
			escape: function(data) {
			  var nextStart = 0;
			  var nextEnd = 0;
			  var cursor = 0;
			  var tempData = [];

			  for (; nextEnd < data.length;) {
				nextStart = data.indexOf('expression(', nextEnd);
				if (nextStart == -1)
				  break;

				nextEnd = findEnd(data, nextStart);

				var expression = data.substring(nextStart, nextEnd);
				var placeholder = expressions.store(expression);
				tempData.push(data.substring(cursor, nextStart));
				tempData.push(placeholder);
				cursor = nextEnd;
			  }

			  return tempData.length > 0 ?
				tempData.join('') + data.substring(cursor, data.length) :
				data;
			},

			restore: function(data) {
			  return data.replace(expressions.placeholderRegExp, expressions.restore);
			}
		  };
		};
		
		return Expressions;
	}).call(this);
	//#endregion
	
	//#region URL: ./text/name-quotes
	require['./text/name-quotes'] = (function () {
	  var QuoteScanner = require('./text/quote-scanner');
	  var PropertyScanner = require('./properties/scanner');

	  var NameQuotes = function NameQuotes() {};

	  var STRIPPABLE = /^['"][a-zA-Z][a-zA-Z\d\-_]+['"]$/;

	  var properties = [
		'animation',
		'-moz-animation',
		'-o-animation',
		'-webkit-animation',
		'animation-name',
		'-moz-animation-name',
		'-o-animation-name',
		'-webkit-animation-name',
		'font',
		'font-family'
	  ];

	  NameQuotes.prototype.process = function(data) {
		var scanner = new PropertyScanner(data);

		return new QuoteScanner(data).each(function(match, store, cursor) {
		  var lastProperty = scanner.nextAt(cursor);
		  if (properties.indexOf(lastProperty) > -1) {
			if (STRIPPABLE.test(match))
			  match = match.substring(1, match.length - 1);
		  }

		  store.push(match);
		});
	  };
	  
	  return NameQuotes;
	}).call(this);
	//#endregion
	
	//#region URL: ./text/free
	require['./text/free'] = (function () {
	  var EscapeStore = require('./text/escape-store');
	  var QuoteScanner = require('./text/quote-scanner');

	  var Free = function Free() {
		this.matches = new EscapeStore('FREE_TEXT');
	  };

	  // Strip content tags by replacing them by the a special
	  // marker for further restoring. It's done via string scanning
	  // instead of regexps to speed up the process.
	  Free.prototype.escape = function(data) {
		var self = this;

		return new QuoteScanner(data).each(function(match, store) {
		  var placeholder = self.matches.store(match);
		  store.push(placeholder);
		});
	  };

	  Free.prototype.restore = function(data) {
		return data.replace(this.matches.placeholderRegExp, this.matches.restore);
	  };

	  return Free;
	}).call(this);
	//#endregion
	
	//#region URL: ./text/urls
	require['./text/urls'] = (function () {
		var EscapeStore = require('./text/escape-store');
		
		function Urls() {
		  var urls = new EscapeStore('URL');

		  return {
			// Strip urls by replacing them by a special
			// marker for further restoring. It's done via string scanning
			// instead of regexps to speed up the process.
			escape: function(data) {
			  var nextStart = 0;
			  var nextEnd = 0;
			  var cursor = 0;
			  var tempData = [];

			  for (; nextEnd < data.length;) {
				nextStart = data.indexOf('url(', nextEnd);
				if (nextStart == -1)
				  break;

				nextEnd = data.indexOf(')', nextStart);

				var url = data.substring(nextStart, nextEnd + 1);
				var placeholder = urls.store(url);
				tempData.push(data.substring(cursor, nextStart));
				tempData.push(placeholder);
				cursor = nextEnd + 1;
			  }

			  return tempData.length > 0 ?
				tempData.join('') + data.substring(cursor, data.length) :
				data;
			},

			restore: function(data) {
			  return data.replace(urls.placeholderRegExp, function(placeholder) {
				return urls.restore(placeholder).replace(/\s/g, '');
			  });
			}
		  };
		};

		return Urls;
	}).call(this);
	//#endregion
	
	//#region URL: ./selectors/empty-removal
	require['./selectors/empty-removal'] = (function () {
		function EmptyRemoval(data) {
		  var stripEmpty = function(cssData) {
			var tempData = [];
			var nextEmpty = 0;
			var cursor = 0;

			for (; nextEmpty < cssData.length;) {
			  nextEmpty = cssData.indexOf('{}', cursor);
			  if (nextEmpty == -1)
				break;

			  var startsAt = nextEmpty - 1;
			  while (cssData[startsAt] && cssData[startsAt] != '}' && cssData[startsAt] != '{' && cssData[startsAt] != ';')
				startsAt--;

			  tempData.push(cssData.substring(cursor, startsAt + 1));
			  cursor = nextEmpty + 2;
			}

			return tempData.length > 0 ?
			  stripEmpty(tempData.join('') + cssData.substring(cursor, cssData.length)) :
			  cssData;
		  };

		  return {
			process: function() {
			  return stripEmpty(data);
			}
		  };
		};

		return EmptyRemoval;
	}).call(this);
	//#endregion
	
	//#region URL: ./selectors/tokenizer
	require['./selectors/tokenizer'] = (function () {
		function Tokenizer(data, minifyContext) {
		  var chunker = new Chunker(data, 128);
		  var chunk = chunker.next();
		  var flatBlock = /(^@(font\-face|page|\-ms\-viewport|\-o\-viewport|viewport)|\\@.+?)/;

		  var whatsNext = function(context) {
			var cursor = context.cursor;
			var mode = context.mode;
			var closest;

			if (chunk.length == context.cursor) {
			  if (chunker.isEmpty())
				return null;

			  chunk = chunker.next();
			  context.cursor = 0;
			}

			if (mode == 'body') {
			  closest = chunk.indexOf('}', cursor);
			  return closest > -1 ?
				[closest, 'bodyEnd'] :
				null;
			}

			var nextSpecial = chunk.indexOf('@', context.cursor);
			var nextEscape = mode == 'top' ? chunk.indexOf('__ESCAPED_COMMENT_CLEAN_CSS', context.cursor) : -1;
			var nextBodyStart = chunk.indexOf('{', context.cursor);
			var nextBodyEnd = chunk.indexOf('}', context.cursor);

			closest = nextSpecial;
			if (closest == -1 || (nextEscape > -1 && nextEscape < closest))
			  closest = nextEscape;
			if (closest == -1 || (nextBodyStart > -1 && nextBodyStart < closest))
			  closest = nextBodyStart;
			if (closest == -1 || (nextBodyEnd > -1 && nextBodyEnd < closest))
			  closest = nextBodyEnd;

			if (closest == -1)
			  return;
			if (nextEscape === closest)
			  return [closest, 'escape'];
			if (nextBodyStart === closest)
			  return [closest, 'bodyStart'];
			if (nextBodyEnd === closest)
			  return [closest, 'bodyEnd'];
			if (nextSpecial === closest)
			  return [closest, 'special'];
		  };

		  var tokenize = function(context) {
			var tokenized = [];

			context = context || { cursor: 0, mode: 'top' };

			while (true) {
			  var next = whatsNext(context);
			  if (!next) {
				var whatsLeft = chunk.substring(context.cursor);
				if (whatsLeft.length > 0) {
				  tokenized.push(whatsLeft);
				  context.cursor += whatsLeft.length;
				}
				break;
			  }

			  var nextSpecial = next[0];
			  var what = next[1];
			  var nextEnd;
			  var oldMode;

			  if (what == 'special') {
				var firstOpenBraceAt = chunk.indexOf('{', nextSpecial);
				var firstSemicolonAt = chunk.indexOf(';', nextSpecial);
				var isSingle = firstSemicolonAt > -1 && (firstOpenBraceAt == -1 || firstSemicolonAt < firstOpenBraceAt);
				if (isSingle) {
				  nextEnd = chunk.indexOf(';', nextSpecial + 1);
				  tokenized.push(chunk.substring(context.cursor, nextEnd + 1));

				  context.cursor = nextEnd + 1;
				} else {
				  nextEnd = chunk.indexOf('{', nextSpecial + 1);
				  var block = chunk.substring(context.cursor, nextEnd).trim();

				  var isFlat = flatBlock.test(block);
				  oldMode = context.mode;
				  context.cursor = nextEnd + 1;
				  context.mode = isFlat ? 'body' : 'block';
				  var specialBody = tokenize(context);
				  context.mode = oldMode;

				  tokenized.push({ block: block, body: specialBody });
				}
			  } else if (what == 'escape') {
				nextEnd = chunk.indexOf('__', nextSpecial + 1);
				var escaped = chunk.substring(context.cursor, nextEnd + 2);
				tokenized.push(escaped);

				context.cursor = nextEnd + 2;
			  } else if (what == 'bodyStart') {
				var selector = chunk.substring(context.cursor, nextSpecial).trim();

				oldMode = context.mode;
				context.cursor = nextSpecial + 1;
				context.mode = 'body';
				var body = tokenize(context);
				context.mode = oldMode;

				tokenized.push({ selector: selector, body: body });
			  } else if (what == 'bodyEnd') {
				// extra closing brace at the top level can be safely ignored
				if (context.mode == 'top') {
				  var at = context.cursor;
				  var warning = chunk[context.cursor] == '}' ?
					'Unexpected \'}\' in \'' + chunk.substring(at - 20, at + 20) + '\'. Ignoring.' :
					'Unexpected content: \'' + chunk.substring(at, nextSpecial + 1) + '\'. Ignoring.';

				  minifyContext.warnings.push(warning);
				  context.cursor = nextSpecial + 1;
				  continue;
				}

				if (context.mode != 'block')
				  tokenized = chunk.substring(context.cursor, nextSpecial);

				context.cursor = nextSpecial + 1;

				break;
			  }
			}

			return tokenized;
		  };

		  return {
			process: function() {
			  return tokenize();
			}
		  };
		};

		// Divides `data` into chunks of `chunkSize` for faster processing
		var Chunker = function(data, chunkSize) {
		  var chunks = [];
		  for (var cursor = 0, dataSize = data.length; cursor < dataSize;) {
			var nextCursor = cursor + chunkSize > dataSize ?
			  dataSize - 1 :
			  cursor + chunkSize;

			if (data[nextCursor] != '}')
			  nextCursor = data.indexOf('}', nextCursor);
			if (nextCursor == -1)
			  nextCursor = data.length - 1;

			chunks.push(data.substring(cursor, nextCursor + 1));
			cursor = nextCursor + 1;
		  }

		  return {
			isEmpty: function() {
			  return chunks.length === 0;
			},

			next: function() {
			  return chunks.shift() || '';
			}
		  };
		};

		return Tokenizer;
	}).call(this);
	//#endregion
	
	//#region URL: ./selectors/optimizer
	require['./selectors/optimizer'] = (function () {
		var Tokenizer = require('./selectors/tokenizer');
		var PropertyOptimizer = require('./properties/optimizer');

		function Optimizer(data, context, options) {
		  var specialSelectors = {
			'*': /\-(moz|ms|o|webkit)\-/,
			'ie8': /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:root|:nth|:first\-of|:last|:only|:empty|:target|:checked|::selection|:enabled|:disabled|:not)/,
			'ie7': /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:focus|:before|:after|:root|:nth|:first\-of|:last|:only|:empty|:target|:checked|::selection|:enabled|:disabled|:not)/
		  };

		  var minificationsMade = [];

		  var propertyOptimizer = new PropertyOptimizer(options.compatibility, options.aggressiveMerging);

		  var cleanUpSelector = function(selectors) {
			if (selectors.indexOf(',') == -1)
			  return selectors;

			var plain = [];
			var cursor = 0;
			var lastComma = 0;
			var noBrackets = selectors.indexOf('(') == -1;
			var withinBrackets = function(idx) {
			  if (noBrackets)
				return false;

			  var previousOpening = selectors.lastIndexOf('(', idx);
			  var previousClosing = selectors.lastIndexOf(')', idx);

			  if (previousOpening == -1)
				return false;
			  if (previousClosing > 0 && previousClosing < idx)
				return false;

			  return true;
			};

			while (true) {
			  var nextComma = selectors.indexOf(',', cursor + 1);
			  var selector;

			  if (nextComma === -1) {
				nextComma = selectors.length;
			  } else if (withinBrackets(nextComma)) {
				cursor = nextComma + 1;
				continue;
			  }
			  selector = selectors.substring(lastComma, nextComma);
			  lastComma = cursor = nextComma + 1;

			  if (plain.indexOf(selector) == -1)
				plain.push(selector);

			  if (nextComma === selectors.length)
				break;
			}

			return plain.sort().join(',');
		  };

		  var isSpecial = function(selector) {
			return specialSelectors[options.compatibility || '*'].test(selector);
		  };

		  var removeDuplicates = function(tokens) {
			var matched = {};
			var forRemoval = [];

			for (var i = 0, l = tokens.length; i < l; i++) {
			  var token = tokens[i];
			  if (typeof token == 'string' || token.block)
				continue;

			  var id = token.body + '@' + token.selector;
			  var alreadyMatched = matched[id];

			  if (alreadyMatched) {
				forRemoval.push(alreadyMatched[0]);
				alreadyMatched.unshift(i);
			  } else {
				matched[id] = [i];
			  }
			}

			forRemoval = forRemoval.sort(function(a, b) {
			  return a > b ? 1 : -1;
			});

			for (var j = 0, n = forRemoval.length; j < n; j++) {
			  tokens.splice(forRemoval[j] - j, 1);
			}

			minificationsMade.unshift(forRemoval.length > 0);
		  };

		  var mergeAdjacent = function(tokens) {
			var forRemoval = [];
			var lastToken = { selector: null, body: null };

			for (var i = 0, l = tokens.length; i < l; i++) {
			  var token = tokens[i];

			  if (typeof token == 'string' || token.block)
				continue;

			  if (token.selector == lastToken.selector) {
				var joinAt = [lastToken.body.split(';').length];
				lastToken.body = propertyOptimizer.process(lastToken.body + ';' + token.body, joinAt);
				forRemoval.push(i);
			  } else if (token.body == lastToken.body && !isSpecial(token.selector) && !isSpecial(lastToken.selector)) {
				lastToken.selector = cleanUpSelector(lastToken.selector + ',' + token.selector);
				forRemoval.push(i);
			  } else {
				lastToken = token;
			  }
			}

			for (var j = 0, m = forRemoval.length; j < m; j++) {
			  tokens.splice(forRemoval[j] - j, 1);
			}

			minificationsMade.unshift(forRemoval.length > 0);
		  };

		  var reduceNonAdjacent = function(tokens) {
			var candidates = {};
			var moreThanOnce = [];

			for (var i = tokens.length - 1; i >= 0; i--) {
			  var token = tokens[i];

			  if (typeof token == 'string' || token.block)
				continue;

			  var complexSelector = token.selector;
			  var selectors = complexSelector.indexOf(',') > -1 && !isSpecial(complexSelector) ?
				complexSelector.split(',').concat(complexSelector) : // simplification, as :not() can have commas too
				[complexSelector];

			  for (var j = 0, m = selectors.length; j < m; j++) {
				var selector = selectors[j];

				if (!candidates[selector])
				  candidates[selector] = [];
				else
				  moreThanOnce.push(selector);

				candidates[selector].push({
				  where: i,
				  partial: selector != complexSelector
				});
			  }
			}

			var reducedInSimple = _reduceSimpleNonAdjacentCases(tokens, moreThanOnce, candidates);
			var reducedInComplex = _reduceComplexNonAdjacentCases(tokens, candidates);

			minificationsMade.unshift(reducedInSimple || reducedInComplex);
		  };

		  var _reduceSimpleNonAdjacentCases = function(tokens, matches, positions) {
			var reduced = false;

			for (var i = 0, l = matches.length; i < l; i++) {
			  var selector = matches[i];
			  var data = positions[selector];

			  if (data.length < 2)
				continue;

			  /* jshint loopfunc: true */
			  _reduceSelector(tokens, selector, data, {
				filterOut: function(idx, bodies) {
				  return data[idx].partial && bodies.length === 0;
				},
				callback: function(token, newBody, processedCount, tokenIdx) {
				  if (!data[processedCount - tokenIdx - 1].partial) {
					token.body = newBody.join(';');
					reduced = true;
				  }
				}
			  });
			}

			return reduced;
		  };

		  var _reduceComplexNonAdjacentCases = function(tokens, positions) {
			var reduced = false;

			allSelectors:
			for (var complexSelector in positions) {
			  if (complexSelector.indexOf(',') == -1) // simplification, as :not() can have commas too
				continue;

			  var intoPosition = positions[complexSelector].pop().where;
			  var intoToken = tokens[intoPosition];

			  var selectors = isSpecial(complexSelector) ?
				[complexSelector] :
				complexSelector.split(',');
			  var reducedBodies = [];

			  for (var j = 0, m = selectors.length; j < m; j++) {
				var selector = selectors[j];
				var data = positions[selector];

				if (data.length < 2)
				  continue allSelectors;

				/* jshint loopfunc: true */
				_reduceSelector(tokens, selector, data, {
				  filterOut: function(idx) {
					return data[idx].where < intoPosition;
				  },
				  callback: function(token, newBody, processedCount, tokenIdx) {
					if (tokenIdx === 0)
					  reducedBodies.push(newBody.join(';'));
				  }
				});

				if (reducedBodies[reducedBodies.length - 1] != reducedBodies[0])
				  continue allSelectors;
			  }

			  intoToken.body = reducedBodies[0];
			  reduced = true;
			}

			return reduced;
		  };

		  var _reduceSelector = function(tokens, selector, data, options) {
			var bodies = [];
			var joinsAt = [];
			var splitBodies = [];
			var processedTokens = [];

			for (var j = data.length - 1, m = 0; j >= 0; j--) {
			  if (options.filterOut(j, bodies))
				continue;

			  var where = data[j].where;
			  var token = tokens[where];
			  var body = token.body;
			  bodies.push(body);
			  splitBodies.push(body.split(';'));
			  processedTokens.push(where);
			}

			for (j = 0, m = bodies.length; j < m; j++) {
			  if (bodies[j].length > 0)
				joinsAt.push((joinsAt[j - 1] || 0) + splitBodies[j].length);
			}

			var optimizedBody = propertyOptimizer.process(bodies.join(';'), joinsAt, true);
			var optimizedProperties = optimizedBody.split(';');

			var processedCount = processedTokens.length;
			var propertyIdx = optimizedProperties.length - 1;
			var tokenIdx = processedCount - 1;

			while (tokenIdx >= 0) {
			  if ((tokenIdx === 0 || splitBodies[tokenIdx].indexOf(optimizedProperties[propertyIdx]) > -1) && propertyIdx > -1) {
				propertyIdx--;
				continue;
			  }

			  var newBody = optimizedProperties.splice(propertyIdx + 1);
			  options.callback(tokens[processedTokens[tokenIdx]], newBody, processedCount, tokenIdx);

			  tokenIdx--;
			}
		  };

		  var optimize = function(tokens) {
			var noChanges = function() {
			  return minificationsMade.length > 4 &&
				minificationsMade[0] === false &&
				minificationsMade[1] === false;
			};

			tokens = Array.isArray(tokens) ? tokens : [tokens];
			for (var i = 0, l = tokens.length; i < l; i++) {
			  var token = tokens[i];

			  if (token.selector) {
				token.selector = cleanUpSelector(token.selector);
				token.body = propertyOptimizer.process(token.body, false);
			  } else if (token.block) {
				optimize(token.body);
			  }
			}

			// Run until 2 last operations do not yield any changes
			minificationsMade = [];
			while (true) {
			  if (noChanges())
				break;
			  removeDuplicates(tokens);

			  if (noChanges())
				break;
			  mergeAdjacent(tokens);

			  if (noChanges())
				break;
			  reduceNonAdjacent(tokens);
			}
		  };

		  var rebuild = function(tokens) {
			var rebuilt = [];

			tokens = Array.isArray(tokens) ? tokens : [tokens];
			for (var i = 0, l = tokens.length; i < l; i++) {
			  var token = tokens[i];

			  if (typeof token == 'string') {
				rebuilt.push(token);
				continue;
			  }

			  var name = token.block || token.selector;
			  var body = token.block ? rebuild(token.body) : token.body;

			  if (body.length > 0)
				rebuilt.push(name + '{' + body + '}');
			}

			return rebuilt.join(options.keepBreaks ? options.lineBreak : '');
		  };

		  return {
			process: function() {
			  var tokenized = new Tokenizer(data, context).process();
			  optimize(tokenized);
			  return rebuild(tokenized);
			}
		  };
		};

		return Optimizer;
	}).call(this);
	//#endregion
	
	//#region URL: ./clean
	require['./clean'] = (function () {
		var exports;
		var ColorShortener = require('./colors/shortener');
		var ColorHSLToHex = require('./colors/hsl-to-hex');
		var ColorRGBToHex = require('./colors/rgb-to-hex');
		var ColorLongToShortHex = require('./colors/long-to-short-hex');

//		var ImportInliner = require('./imports/inliner');
//		var UrlRebase = require('./images/url-rebase');
		var EmptyRemoval = require('./selectors/empty-removal');

		var CommentsProcessor = require('./text/comments');
		var ExpressionsProcessor = require('./text/expressions');
		var FreeTextProcessor = require('./text/free');
		var UrlsProcessor = require('./text/urls');
		var NameQuotesProcessor = require('./text/name-quotes');
		var Splitter = require('./text/splitter');

		var SelectorsOptimizer = require('./selectors/optimizer');

		var CleanCSS = exports = function CleanCSS(options) {
		  options = options || {};

		  // back compat
		  if (!(this instanceof CleanCSS))
			return new CleanCSS(options);

		  options.keepBreaks = options.keepBreaks || false;

//		  //active by default
//		  if (undefined === options.processImport)
//			options.processImport = true;

		  this.options = options;
//		  this.stats = {};
		  this.context = {
			errors: [],
			warnings: [],
			debug: options.debug
		  };
		  this.errors = this.context.errors;
		  this.warnings = this.context.warnings;
		  this.lineBreak = process.platform == 'win32' ? '\r\n' : '\n';
		};

		CleanCSS.prototype.minify = function(data, callback) {
		  var options = this.options;

//		  if (Buffer.isBuffer(data))
//			data = data.toString();

//		  if (options.processImport || data.indexOf('@shallow') > 0) {
//			// inline all imports
//			var self = this;
//			var runner = callback ?
//			  process.nextTick :
//			  function(callback) { return callback(); };
//
//			return runner(function() {
//			  return new ImportInliner(self.context, options.inliner).process(data, {
//				localOnly: !callback,
//				root: options.root || process.cwd(),
//				relativeTo: options.relativeTo,
//				whenDone: function(data) {
//				  return minify.call(self, data, callback);
//				}
//			  });
//			});
//		  } else {
			return minify.call(this, data, callback);
//		  }
		};

		var minify = function(data, callback) {
//		  var startedAt;
//		  var stats = this.stats;
		  var options = this.options;
		  var context = this.context;
		  var lineBreak = this.lineBreak;

		  var commentsProcessor = new CommentsProcessor(
			'keepSpecialComments' in options ? options.keepSpecialComments : '*',
			options.keepBreaks,
			lineBreak
		  );
		  var expressionsProcessor = new ExpressionsProcessor();
		  var freeTextProcessor = new FreeTextProcessor();
		  var urlsProcessor = new UrlsProcessor();
		  var nameQuotesProcessor = new NameQuotesProcessor();

//		  if (options.debug) {
//			this.startedAt = process.hrtime();
//			this.stats.originalSize = data.length;
//		  }

		  var replace = function() {
			if (typeof arguments[0] == 'function')
			  arguments[0]();
			else
			  data = data.replace.apply(data, arguments);
		  };

//		  // replace function
//		  if (options.benchmark) {
//			var originalReplace = replace;
//			replace = function(pattern, replacement) {
//			  var name = typeof pattern == 'function' ?
//				/function (\w+)\(/.exec(pattern.toString())[1] :
//				pattern;
//
//			  var start = process.hrtime();
//			  originalReplace(pattern, replacement);
//
//			  var itTook = process.hrtime(start);
//			  console.log('%d ms: ' + name, 1000 * itTook[0] + itTook[1] / 1000000);
//			};
//		  }

//		  if (options.debug) {
//			startedAt = process.hrtime();
//			stats.originalSize = data.length;
//		  }

		  replace(function escapeComments() {
			data = commentsProcessor.escape(data);
		  });

		  // replace all escaped line breaks
		  replace(/\\(\r\n|\n)/gm, '');

		  // strip parentheses in urls if possible (no spaces inside)
		  replace(/url\((['"])([^\)]+)['"]\)/g, function(match, quote, url) {
			var unsafeDataURI = url.indexOf('data:') === 0 && url.match(/data:\w+\/[^;]+;base64,/) === null;
			if (url.match(/[ \t]/g) !== null || unsafeDataURI)
			  return 'url(' + quote + url + quote + ')';
			else
			  return 'url(' + url + ')';
		  });

		  // strip parentheses in animation & font names
		  replace(function removeQuotes() {
			data = nameQuotesProcessor.process(data);
		  });

		  // strip parentheses in @keyframes
		  replace(/@(\-moz\-|\-o\-|\-webkit\-)?keyframes ([^{]+)/g, function(match, prefix, name) {
			prefix = prefix || '';
			return '@' + prefix + 'keyframes ' + (name.indexOf(' ') > -1 ? name : name.replace(/['"]/g, ''));
		  });

		  // IE shorter filters, but only if single (IE 7 issue)
		  replace(/progid:DXImageTransform\.Microsoft\.(Alpha|Chroma)(\([^\)]+\))([;}'"])/g, function(match, filter, args, suffix) {
			return filter.toLowerCase() + args + suffix;
		  });

		  replace(function escapeExpressions() {
			data = expressionsProcessor.escape(data);
		  });

		  // strip parentheses in attribute values
		  replace(/\[([^\]]+)\]/g, function(match, content) {
			var eqIndex = content.indexOf('=');
			var singleQuoteIndex = content.indexOf('\'');
			var doubleQuoteIndex = content.indexOf('"');
			if (eqIndex < 0 && singleQuoteIndex < 0 && doubleQuoteIndex < 0)
			  return match;
			if (singleQuoteIndex === 0 || doubleQuoteIndex === 0)
			  return match;

			var key = content.substring(0, eqIndex);
			var value = content.substring(eqIndex + 1, content.length);

			if (/^['"](?:[a-zA-Z][a-zA-Z\d\-_]+)['"]$/.test(value))
			  return '[' + key + '=' + value.substring(1, value.length - 1) + ']';
			else
			  return match;
		  });

		  replace(function escapeFreeText() {
			data = freeTextProcessor.escape(data);
		  });

		  replace(function escapeUrls() {
			data = urlsProcessor.escape(data);
		  });

		  // remove invalid special declarations
		  replace(/@charset [^;]+;/ig, function (match) {
			return match.indexOf('@charset') > -1 ? match : '';
		  });

		  // whitespace inside attribute selectors brackets
		  replace(/\[([^\]]+)\]/g, function(match) {
			return match.replace(/\s/g, '');
		  });

		  // line breaks
		  replace(/[\r]?\n/g, ' ');

		  // multiple whitespace
		  replace(/[\t ]+/g, ' ');

		  // multiple semicolons (with optional whitespace)
		  replace(/;[ ]?;+/g, ';');

		  // multiple line breaks to one
		  replace(/ (?:\r\n|\n)/g, lineBreak);
		  replace(/(?:\r\n|\n)+/g, lineBreak);

		  // remove spaces around selectors
		  replace(/ ([+~>]) /g, '$1');

		  // remove extra spaces inside content
		  replace(/([!\(\{\}:;=,\n]) /g, '$1');
		  replace(/ ([!\)\{\};=,\n])/g, '$1');
		  replace(/(?:\r\n|\n)\}/g, '}');
		  replace(/([\{;,])(?:\r\n|\n)/g, '$1');
		  replace(/ :([^\{\};]+)([;}])/g, ':$1$2');

		  // restore spaces inside IE filters (IE 7 issue)
		  replace(/progid:[^(]+\(([^\)]+)/g, function(match) {
			return match.replace(/,/g, ', ');
		  });

		  // trailing semicolons
		  replace(/;\}/g, '}');

		  replace(function hsl2Hex() {
			data = new ColorHSLToHex(data).process();
		  });

		  replace(function rgb2Hex() {
			data = new ColorRGBToHex(data).process();
		  });

		  replace(function longToShortHex() {
			data = new ColorLongToShortHex(data).process();
		  });

		  replace(function shortenColors() {
			data = new ColorShortener(data).process();
		  });

		  // replace font weight with numerical value
		  replace(/(font\-weight|font):(normal|bold)([ ;\}!])(\w*)/g, function(match, property, weight, suffix, next) {
			if (suffix == ' ' && (next.indexOf('/') > -1 || next == 'normal' || /[1-9]00/.test(next)))
			  return match;

			if (weight == 'normal')
			  return property + ':400' + suffix + next;
			else if (weight == 'bold')
			  return property + ':700' + suffix + next;
			else
			  return match;
		  });

		  // minus zero to zero
		  // repeated twice on purpose as if not it doesn't process rgba(-0,-0,-0,-0) correctly
		  var zerosRegexp = /(\s|:|,|\()\-0([^\.])/g;
		  replace(zerosRegexp, '$10$2');
		  replace(zerosRegexp, '$10$2');

		  // zero(s) + value to value
		  replace(/(\s|:|,)0+([1-9])/g, '$1$2');

		  // round pixels to 2nd decimal place
		  var precision = 'roundingPrecision' in options ? options.roundingPrecision : 2;
		  var decimalMultiplier = Math.pow(10, precision);
		  replace(new RegExp('\\.(\\d{' + (precision + 1) + ',})px', 'g'), function(match, decimalPlaces) {
			return precision === 0 ?
			  'px' :
			  '.' + Math.round(parseFloat('.' + decimalPlaces) * decimalMultiplier) / decimalMultiplier + 'px';
		  });

		  // .0 to 0
		  // repeated twice on purpose as if not it doesn't process {padding: .0 .0 .0 .0} correctly
		  var leadingDecimalRegexp = /(\D)\.0+(\D)/g;
		  replace(leadingDecimalRegexp, '$10$2');
		  replace(leadingDecimalRegexp, '$10$2');

		  // fraction zeros removal
		  replace(/\.([1-9]*)0+(\D)/g, function(match, nonZeroPart, suffix) {
			return (nonZeroPart.length > 0 ? '.' : '') + nonZeroPart + suffix;
		  });

		  // zero + unit to zero
		  var units = ['px', 'em', 'ex', 'cm', 'mm', 'in', 'pt', 'pc', '%'];
		  if (['ie7', 'ie8'].indexOf(options.compatibility) == -1)
			units.push('rem');

		  replace(new RegExp('(\\s|:|,)\\-?0(?:' + units.join('|') + ')', 'g'), '$1' + '0');
		  replace(new RegExp('(\\s|:|,)\\-?(\\d+)\\.(\\D)', 'g'), '$1$2$3');
		  replace(new RegExp('rect\\(0(?:' + units.join('|') + ')', 'g'), 'rect(0');

		  // restore % in rgb/rgba and hsl/hsla
		  replace(/(rgb|rgba|hsl|hsla)\(([^\)]+)\)/g, function(match, colorFunction, colorDef) {
			var tokens = colorDef.split(',');
			var applies = colorFunction == 'hsl' || colorFunction == 'hsla' || tokens[0].indexOf('%') > -1;
			if (!applies)
			  return match;

			if (tokens[1].indexOf('%') == -1)
			  tokens[1] += '%';
			if (tokens[2].indexOf('%') == -1)
			  tokens[2] += '%';
			return colorFunction + '(' + tokens.join(',') + ')';
		  });

		  // transparent rgba/hsla to 'transparent' unless in compatibility mode
		  if (!options.compatibility) {
			replace(/:([^;]*)(?:rgba|hsla)\(\d+,\d+%?,\d+%?,0\)/g, function (match, prefix) {
			  if (new Splitter(',').split(match).pop().indexOf('gradient(') > -1)
				return match;

			  return ':' + prefix + 'transparent';
			});
		  }

		  // none to 0
		  replace(/outline:none/g, 'outline:0');

		  // background:none to background:0 0
		  replace(/background:(?:none|transparent)([;}])/g, 'background:0 0$1');

		  // multiple zeros into one
		  replace(/box-shadow:0 0 0 0([^\.])/g, 'box-shadow:0 0$1');
		  replace(/:0 0 0 0([^\.])/g, ':0$1');
		  replace(/([: ,=\-])0\.(\d)/g, '$1.$2');

		  // restore rect(...) zeros syntax for 4 zeros
		  replace(/rect\(\s?0(\s|,)0[ ,]0[ ,]0\s?\)/g, 'rect(0$10$10$10)');

		  // remove universal selector when not needed (*#id, *.class etc)
		  replace(/\*([\.#:\[])/g, '$1');

		  // Restore spaces inside calc back
		  replace(/calc\([^\}]+\}/g, function(match) {
			return match.replace(/\+/g, ' + ');
		  });

		  // get rid of IE hacks if not in compatibility mode
		  if (!options.compatibility)
			replace(/([;\{])[\*_][\w\-]+:[^;\}]+/g, '$1');

		  if (options.noAdvanced) {
			if (options.keepBreaks)
			  replace(/\}/g, '}' + lineBreak);
		  } else {
			replace(function optimizeSelectors() {
			  data = new SelectorsOptimizer(data, context, {
				keepBreaks: options.keepBreaks,
				lineBreak: lineBreak,
				compatibility: options.compatibility,
				aggressiveMerging: !options.noAggressiveMerging
			  }).process();
			});
		  }

		  // replace ' / ' in border-*-radius with '/'
		  replace(/(border-\w+-\w+-radius:\S+)\s+\/\s+/g, '$1/');

		  // replace same H/V values in border-radius
		  replace(/(border-\w+-\w+-radius):([^;\}]+)/g, function (match, property, value) {
			var parts = value.split('/');

			if (parts.length > 1 && parts[0] == parts[1])
			  return property + ':' + parts[0];
			else
			  return match;
		  });

		  replace(function restoreUrls() {
			data = urlsProcessor.restore(data);
		  });
//		  replace(function rebaseUrls() {
//			data = options.noRebase ? data : new UrlRebase(options, context).process(data);
//		  });
		  replace(function restoreFreeText() {
			data = freeTextProcessor.restore(data);
		  });
		  replace(function restoreComments() {
			data = commentsProcessor.restore(data);
		  });
		  replace(function restoreExpressions() {
			data = expressionsProcessor.restore(data);
		  });

		  // move first charset to the beginning
		  replace(function moveCharset() {
			// get first charset in stylesheet
			var match = data.match(/@charset [^;]+;/);
			var firstCharset = match ? match[0] : null;
			if (!firstCharset)
			  return;

			// reattach first charset and remove all subsequent
			data = firstCharset +
			  (options.keepBreaks ? lineBreak : '') +
			  data.replace(new RegExp('@charset [^;]+;(' + lineBreak + ')?', 'g'), '').trim();
		  });

		  if (options.noAdvanced) {
			replace(function removeEmptySelectors() {
			  data = new EmptyRemoval(data).process();
			});
		  }

		  // trim spaces at beginning and end
		  data = data.trim();

//		  if (options.debug) {
//			var elapsed = process.hrtime(startedAt);
//			stats.timeSpent = ~~(elapsed[0] * 1e3 + elapsed[1] / 1e6);
//			stats.efficiency = 1 - data.length / stats.originalSize;
//			stats.minifiedSize = data.length;
//		  }

		  return callback ?
			callback.call(this, this.context.errors.length > 0 ? this.context.errors : null, data) :
			data;
		};

		return exports;
	}).call(this);
	//#endregion
	
	return require('./clean');
})();