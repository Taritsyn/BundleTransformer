/*!
 * Clean-css v3.2.10
 * https://github.com/jakubpawlowicz/clean-css
 *
 * Copyright (C) 2014 JakubPawlowicz.com
 * Released under the terms of MIT license
 */
var CleanCss = (function(){
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

	//#region URL: util
	modules['util'] = function () {
		var exports = {};
		
		function isObject(arg) {
			return typeof arg === 'object' && arg !== null;
		}
		exports.isObject = isObject;
		
		function objectToString(o) {
			return Object.prototype.toString.call(o);
		}
		
		function isRegExp(re) {
			return isObject(re) && objectToString(re) === '[object RegExp]';
		}
		exports.isRegExp = isRegExp;
		
		return exports;
	};
	//#endregion

	//#region URL: os
	modules['os'] = function () {
		var exports = {},
			isWindows = true;
			;
			
		exports.EOL = isWindows ? '\r\n' : '\n';
		
		return exports;
	};
	//#endregion

	//#region URL: /colors/hex-name-shortener
	modules['/colors/hex-name-shortener'] = function () {
		var HexNameShortener = {};

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
		  darkgrey: '#a9a9a9',
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
		  darkslategrey: '#2f4f4f',
		  darkturquoise: '#00ced1',
		  darkviolet: '#9400d3',
		  deeppink: '#ff1493',
		  deepskyblue: '#00bfff',
		  dimgray: '#696969',
		  dimgrey: '#696969',
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
		  grey: '#808080',
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
		  lightgrey: '#d3d3d3',
		  lightpink: '#ffb6c1',
		  lightsalmon: '#ffa07a',
		  lightseagreen: '#20b2aa',
		  lightskyblue: '#87cefa',
		  lightslategray: '#778899',
		  lightslategrey: '#778899',
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
		  rebeccapurple: '#663399',
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
		  slategrey: '#708090',
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
		  var hex = COLORS[name];
		  if (name.length < hex.length)
			toName[hex] = name;
		  else
			toHex[name] = hex;
		}

		var toHexPattern = new RegExp('(^| |,|\\))(' + Object.keys(toHex).join('|') + ')( |,|\\)|$)', 'ig');
		var toNamePattern = new RegExp('(' + Object.keys(toName).join('|') + ')([^a-f0-9]|$)', 'ig');

		function hexConverter(match, prefix, colorValue, suffix) {
		  return prefix + toHex[colorValue.toLowerCase()] + suffix;
		}

		function nameConverter(match, colorValue, suffix) {
		  return toName[colorValue.toLowerCase()] + suffix;
		}

		HexNameShortener.shorten = function (value) {
		  var hasHex = value.indexOf('#') > -1;
		  var shortened = value.replace(toHexPattern, hexConverter);

		  if (shortened != value)
			shortened = shortened.replace(toHexPattern, hexConverter);

		  return hasHex ? shortened.replace(toNamePattern, nameConverter) : shortened;
		};
		
		return HexNameShortener;
	};
	//#endregion

	//#region URL: /colors/hsl
	modules['/colors/hsl'] = function () {
		// HSL to RGB converter. Both methods adapted from:
		// http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript

		function HSLColor(hue, saturation, lightness) {
		  this.hue = hue;
		  this.saturation = saturation;
		  this.lightness = lightness;
		}

		function hslToRgb(h, s, l) {
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
		}

		function hueToRgb(p, q, t) {
		  if (t < 0) t += 1;
		  if (t > 1) t -= 1;
		  if (t < 1/6) return p + (q - p) * 6 * t;
		  if (t < 1/2) return q;
		  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		  return p;
		}

		HSLColor.prototype.toHex = function () {
		  var asRgb = hslToRgb(this.hue, this.saturation, this.lightness);
		  var redAsHex = asRgb[0].toString(16);
		  var greenAsHex = asRgb[1].toString(16);
		  var blueAsHex = asRgb[2].toString(16);

		  return '#' +
			((redAsHex.length == 1 ? '0' : '') + redAsHex) +
			((greenAsHex.length == 1 ? '0' : '') + greenAsHex) +
			((blueAsHex.length == 1 ? '0' : '') + blueAsHex);
		};
		
		return HSLColor;
	};
	//#endregion

	//#region URL: /colors/rgb
	modules['/colors/rgb'] = function () {
		function RGB(red, green, blue) {
		  this.red = red;
		  this.green = green;
		  this.blue = blue;
		}

		RGB.prototype.toHex = function () {
		  var red = Math.max(0, Math.min(~~this.red, 255));
		  var green = Math.max(0, Math.min(~~this.green, 255));
		  var blue = Math.max(0, Math.min(~~this.blue, 255));

		  // Credit: Asen  http://jsbin.com/UPUmaGOc/2/edit?js,console
		  return '#' + ('00000' + (red << 16 | green << 8 | blue).toString(16)).slice(-6);
		};
		
		return RGB;
	};
	//#endregion
	
	//#region URL: /properties/break-up
	modules['/properties/break-up'] = function () {
		var wrapSingle = require('/properties/wrap-for-optimizing').single;

		var Splitter = require('/utils/splitter');
		var MULTIPLEX_SEPARATOR = ',';

		function _colorFilter(validator) {
		  return function (value) {
			return value[0] == 'invert' || validator.isValidColor(value[0]);
		  };
		}

		function _styleFilter(validator) {
		  return function (value) {
			return value[0] != 'inherit' && validator.isValidStyle(value[0]);
		  };
		}

		function _wrapDefault(name, property, compactable) {
		  var descriptor = compactable[name];
		  if (descriptor.doubleValues && descriptor.defaultValue.length == 2)
			return wrapSingle([[name, property.important], [descriptor.defaultValue[0]], [descriptor.defaultValue[1]]]);
		  else if (descriptor.doubleValues && descriptor.defaultValue.length == 1)
			return wrapSingle([[name, property.important], [descriptor.defaultValue[0]]]);
		  else
			return wrapSingle([[name, property.important], [descriptor.defaultValue]]);
		}

		function _widthFilter(validator) {
		  return function (value) {
			return value[0] != 'inherit' && validator.isValidWidth(value[0]);
		  };
		}

		function background(property, compactable, validator) {
		  var image = _wrapDefault('background-image', property, compactable);
		  var position = _wrapDefault('background-position', property, compactable);
		  var size = _wrapDefault('background-size', property, compactable);
		  var repeat = _wrapDefault('background-repeat', property, compactable);
		  var attachment = _wrapDefault('background-attachment', property, compactable);
		  var origin = _wrapDefault('background-origin', property, compactable);
		  var clip = _wrapDefault('background-clip', property, compactable);
		  var color = _wrapDefault('background-color', property, compactable);
		  var components = [image, position, size, repeat, attachment, origin, clip, color];
		  var values = property.value;

		  var positionSet = false;
		  var clipSet = false;
		  var originSet = false;
		  var repeatSet = false;

		  if (property.value.length == 1 && property.value[0][0] == 'inherit') {
			// NOTE: 'inherit' is not a valid value for background-attachment
			color.value = image.value =  repeat.value = position.value = size.value = origin.value = clip.value = property.value;
			return components;
		  }

		  for (var i = values.length - 1; i >= 0; i--) {
			var value = values[i];

			if (validator.isValidBackgroundAttachment(value[0])) {
			  attachment.value = [value];
			} else if (validator.isValidBackgroundBox(value[0])) {
			  if (clipSet) {
				origin.value = [value];
				originSet = true;
			  } else {
				clip.value = [value];
				clipSet = true;
			  }
			} else if (validator.isValidBackgroundRepeat(value[0])) {
			  if (repeatSet) {
				repeat.value.unshift(value);
			  } else {
				repeat.value = [value];
				repeatSet = true;
			  }
			} else if (validator.isValidBackgroundPositionPart(value[0]) || validator.isValidBackgroundSizePart(value[0])) {
			  if (i > 0) {
				var previousValue = values[i - 1];

				if (previousValue[0].indexOf('/') > 0) {
				  var twoParts = new Splitter('/').split(previousValue[0]);
				  // NOTE: we do this slicing as value may contain metadata too, like for source maps
				  size.value = [[twoParts.pop()].concat(previousValue.slice(1)), value];
				  values[i - 1] = [twoParts.pop()].concat(previousValue.slice(1));
				} else if (i > 1 && values[i - 2] == '/') {
				  size.value = [previousValue, value];
				  i -= 2;
				} else if (values[i - 1] == '/') {
				  size.value = [value];
				} else {
				  if (!positionSet)
					position.value = [];

				  position.value.unshift(value);
				  positionSet = true;
				}
			  } else {
				if (!positionSet)
				  position.value = [];

				position.value.unshift(value);
				positionSet = true;
			  }
			} else if (validator.isValidBackgroundPositionAndSize(value[0])) {
			  var sizeValue = new Splitter('/').split(value[0]);
			  // NOTE: we do this slicing as value may contain metadata too, like for source maps
			  size.value = [[sizeValue.pop()].concat(value.slice(1))];
			  position.value = [[sizeValue.pop()].concat(value.slice(1))];
			} else if ((color.value == compactable[color.name].defaultValue || color.value == 'none') && validator.isValidColor(value[0])) {
			  color.value = [value];
			} else if (validator.isValidUrl(value[0]) || validator.isValidFunction(value[0])) {
			  image.value = [value];
			}
		  }

		  if (clipSet && !originSet)
			origin.value = clip.value.slice(0);

		  return components;
		}

		function borderRadius(property, compactable) {
		  var values = property.value;
		  var splitAt = -1;

		  for (var i = 0, l = values.length; i < l; i++) {
			if (values[i][0] == '/') {
			  splitAt = i;
			  break;
			}
		  }

		  if (splitAt == -1)
			return fourValues(property, compactable);

		  var target = _wrapDefault(property.name, property, compactable);
		  target.value = values.slice(0, splitAt);
		  target.components = fourValues(target, compactable);

		  var remainder = _wrapDefault(property.name, property, compactable);
		  remainder.value = values.slice(splitAt + 1);
		  remainder.components = fourValues(remainder, compactable);

		  for (var j = 0; j < 4; j++) {
			target.components[j].multiplex = true;
			target.components[j].value = target.components[j].value.concat([['/']]).concat(remainder.components[j].value);
		  }

		  return target.components;
		}

		function fourValues(property, compactable) {
		  var componentNames = compactable[property.name].components;
		  var components = [];
		  var value = property.value;

		  if (value.length < 1)
			return [];

		  if (value.length < 2)
			value[1] = value[0];
		  if (value.length < 3)
			value[2] = value[0];
		  if (value.length < 4)
			value[3] = value[1];

		  for (var i = componentNames.length - 1; i >= 0; i--) {
			var component = wrapSingle([[componentNames[i], property.important]]);
			component.value = [value[i]];
			components.unshift(component);
		  }

		  return components;
		}

		function multiplex(splitWith) {
		  return function (property, compactable, validator) {
			var splitsAt = [];
			var values = property.value;
			var i, j, l, m;

			// find split commas
			for (i = 0, l = values.length; i < l; i++) {
			  if (values[i][0] == ',')
				splitsAt.push(i);
			}

			if (splitsAt.length === 0)
			  return splitWith(property, compactable, validator);

			var splitComponents = [];

			// split over commas, and into components
			for (i = 0, l = splitsAt.length; i <= l; i++) {
			  var from = i === 0 ? 0 : splitsAt[i - 1] + 1;
			  var to = i < l ? splitsAt[i] : values.length;

			  var _property = _wrapDefault(property.name, property, compactable);
			  _property.value = values.slice(from, to);

			  splitComponents.push(splitWith(_property, compactable, validator));
			}

			var components = splitComponents[0];

			// group component values from each split
			for (i = 0, l = components.length; i < l; i++) {
			  components[i].multiplex = true;

			  for (j = 1, m = splitComponents.length; j < m; j++) {
				components[i].value.push([MULTIPLEX_SEPARATOR]);
				Array.prototype.push.apply(components[i].value, splitComponents[j][i].value);
			  }
			}

			return components;
		  };
		}

		function listStyle(property, compactable, validator) {
		  var type = _wrapDefault('list-style-type', property, compactable);
		  var position = _wrapDefault('list-style-position', property, compactable);
		  var image = _wrapDefault('list-style-image', property, compactable);
		  var components = [type, position, image];

		  if (property.value.length == 1 && property.value[0][0] == 'inherit') {
			type.value = position.value = image.value = [property.value[0]];
			return components;
		  }

		  var values = property.value.slice(0);
		  var total = values.length;
		  var index = 0;

		  // `image` first...
		  for (index = 0, total = values.length; index < total; index++) {
			if (validator.isValidUrl(values[index][0]) || values[index][0] == '0') {
			  image.value = [values[index]];
			  values.splice(index, 1);
			  break;
			}
		  }

		  // ... then `type`...
		  for (index = 0, total = values.length; index < total; index++) {
			if (validator.isValidListStyleType(values[index][0])) {
			  type.value = [values[index]];
			  values.splice(index, 1);
			  break;
			}
		  }

		  // ... and what's left is a `position`
		  if (values.length > 0 && validator.isValidListStylePosition(values[0][0]))
			position.value = [values[0]];

		  return components;
		}

		function widthStyleColor(property, compactable, validator) {
		  var descriptor = compactable[property.name];
		  var components = [
			_wrapDefault(descriptor.components[0], property, compactable),
			_wrapDefault(descriptor.components[1], property, compactable),
			_wrapDefault(descriptor.components[2], property, compactable)
		  ];
		  var color, style, width;

		  for (var i = 0; i < 3; i++) {
			var component = components[i];

			if (component.name.indexOf('color') > 0)
			  color = component;
			else if (component.name.indexOf('style') > 0)
			  style = component;
			else
			  width = component;
		  }

		  if ((property.value.length == 1 && property.value[0][0] == 'inherit') ||
			  (property.value.length == 3 && property.value[0][0] == 'inherit' && property.value[1][0] == 'inherit' && property.value[2][0] == 'inherit')) {
			color.value = style.value = width.value = [property.value[0]];
			return components;
		  }

		  var values = property.value.slice(0);
		  var match, matches;

		  // NOTE: usually users don't follow the required order of parts in this shorthand,
		  // so we'll try to parse it caring as little about order as possible

		  if (values.length > 0) {
			matches = values.filter(_widthFilter(validator));
			match = matches.length > 1 && (matches[0] == 'none' || matches[0] == 'auto') ? matches[1] : matches[0];
			if (match) {
			  width.value = [match];
			  values.splice(values.indexOf(match), 1);
			}
		  }

		  if (values.length > 0) {
			match = values.filter(_styleFilter(validator))[0];
			if (match) {
			  style.value = [match];
			  values.splice(values.indexOf(match), 1);
			}
		  }

		  if (values.length > 0) {
			match = values.filter(_colorFilter(validator))[0];
			if (match) {
			  color.value = [match];
			  values.splice(values.indexOf(match), 1);
			}
		  }

		  return components;
		}

		var exports = {
		  background: background,
		  border: widthStyleColor,
		  borderRadius: borderRadius,
		  fourValues: fourValues,
		  listStyle: listStyle,
		  multiplex: multiplex,
		  outline: widthStyleColor
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /properties/can-override
	modules['/properties/can-override'] = function () {
		// Functions that decide what value can override what.
		// The main purpose is to disallow removing CSS fallbacks.
		// A separate implementation is needed for every different kind of CSS property.
		// -----
		// The generic idea is that properties that have wider browser support are 'more understandable'
		// than others and that 'less understandable' values can't override more understandable ones.

		// Use when two tokens of the same property can always be merged
		function always() {
		  return true;
		}

		function backgroundImage(property1, property2, validator) {
		  // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
		  // Understandability: (none | url | inherit) > (same function) > (same value)

		  // (none | url)
		  var image1 = property1.value[0][0];
		  var image2 = property2.value[0][0];

		  if (image2 == 'none' || image2 == 'inherit' || validator.isValidUrl(image2))
			return true;
		  if (image1 == 'none' || image1 == 'inherit' || validator.isValidUrl(image1))
			return false;

		  // Functions with the same name can override each other; same values can override each other
		  return sameFunctionOrValue(property1, property2, validator);
		}

		function border(property1, property2, validator) {
		  return color(property1.components[2], property2.components[2], validator);
		}

		// Use for color properties (color, background-color, border-color, etc.)
		function color(property1, property2, validator) {
		  // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
		  // Understandability: (hex | named) > (rgba | hsla) > (same function name) > anything else
		  // NOTE: at this point rgb and hsl are replaced by hex values by clean-css

		  var color1 = property1.value[0][0];
		  var color2 = property2.value[0][0];

		  // (hex | named)
		  if (validator.isValidNamedColor(color2) || validator.isValidHexColor(color2))
			return true;
		  if (validator.isValidNamedColor(color1) || validator.isValidHexColor(color1))
			return false;

		  // (rgba|hsla)
		  if (validator.isValidRgbaColor(color2) || validator.isValidHslaColor(color2))
			return true;
		  if (validator.isValidRgbaColor(color1) || validator.isValidHslaColor(color1))
			return false;

		  // Functions with the same name can override each other; same values can override each other
		  return sameFunctionOrValue(property1, property2, validator);
		}

		function twoOptionalFunctions(property1, property2, validator) {
		  var value1 = property1.value[0][0];
		  var value2 = property2.value[0][0];

		  return !(validator.isValidFunction(value1) ^ validator.isValidFunction(value2));
		}

		function sameValue(property1, property2) {
		  var value1 = property1.value[0][0];
		  var value2 = property2.value[0][0];

		  return value1 === value2;
		}

		function sameFunctionOrValue(property1, property2, validator) {
		  var value1 = property1.value[0][0];
		  var value2 = property2.value[0][0];

		  // Functions with the same name can override each other
		  if (validator.areSameFunction(value1, value2))
			return true;

		  return value1 === value2;
		}

		// Use for properties containing CSS units (margin-top, padding-left, etc.)
		function unit(property1, property2, validator) {
		  // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
		  // Understandability: (unit without functions) > (same functions | standard functions) > anything else
		  // NOTE: there is no point in having different vendor-specific functions override each other or standard functions,
		  //       or having standard functions override vendor-specific functions, but standard functions can override each other
		  // NOTE: vendor-specific property values are not taken into consideration here at the moment
		  var value1 = property1.value[0][0];
		  var value2 = property2.value[0][0];

		  if (validator.isValidAndCompatibleUnitWithoutFunction(value1) && !validator.isValidAndCompatibleUnitWithoutFunction(value2))
			return false;

		  if (validator.isValidUnitWithoutFunction(value2))
			return true;
		  if (validator.isValidUnitWithoutFunction(value1))
			return false;

		  // Standard non-vendor-prefixed functions can override each other
		  if (validator.isValidFunctionWithoutVendorPrefix(value2) && validator.isValidFunctionWithoutVendorPrefix(value1)) {
			return true;
		  }

		  // Functions with the same name can override each other; same values can override each other
		  return sameFunctionOrValue(property1, property2, validator);
		}

		var exports = {
		  always: always,
		  backgroundImage: backgroundImage,
		  border: border,
		  color: color,
		  sameValue: sameValue,
		  sameFunctionOrValue: sameFunctionOrValue,
		  twoOptionalFunctions: twoOptionalFunctions,
		  unit: unit
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /properties/clone
	modules['/properties/clone'] = function () {
		var wrapSingle = require('/properties/wrap-for-optimizing').single;

		function deep(property) {
		  var cloned = shallow(property);
		  for (var i = property.components.length - 1; i >= 0; i--) {
			var component = shallow(property.components[i]);
			component.value = property.components[i].value.slice(0);
			cloned.components.unshift(component);
		  }

		  cloned.dirty = true;
		  cloned.value = property.value.slice(0);

		  return cloned;
		}

		function shallow(property) {
		  var cloned = wrapSingle([[property.name, property.important, property.hack]]);
		  cloned.unused = false;
		  return cloned;
		}

		var exports = {
		  deep: deep,
		  shallow: shallow
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /properties/compactable
	modules['/properties/compactable'] = function () {
		// Contains the interpretation of CSS properties, as used by the property optimizer

		var breakUp = require('/properties/break-up');
		var canOverride = require('/properties/can-override');
		var restore = require('/properties/restore');

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
		// * restore: function (Only specify for shorthand properties.)
		//   Puts the shorthand together from its components.
		//
		var compactable = {
		  'color': {
			canOverride: canOverride.color,
			defaultValue: 'transparent',
			shortestValue: 'red'
		  },
		  'background': {
			components: [
			  'background-image',
			  'background-position',
			  'background-size',
			  'background-repeat',
			  'background-attachment',
			  'background-origin',
			  'background-clip',
			  'background-color'
			],
			breakUp: breakUp.multiplex(breakUp.background),
			defaultValue: '0 0',
			restore: restore.multiplex(restore.background),
			shortestValue: '0',
			shorthand: true
		  },
		  'background-clip': {
			canOverride: canOverride.always,
			defaultValue: 'border-box',
			shortestValue: 'border-box'
		  },
		  'background-color': {
			canOverride: canOverride.color,
			defaultValue: 'transparent',
			multiplexLastOnly: true,
			nonMergeableValue: 'none',
			shortestValue: 'red'
		  },
		  'background-image': {
			canOverride: canOverride.backgroundImage,
			defaultValue: 'none'
		  },
		  'background-origin': {
			canOverride: canOverride.always,
			defaultValue: 'padding-box',
			shortestValue: 'border-box'
		  },
		  'background-repeat': {
			canOverride: canOverride.always,
			defaultValue: ['repeat'],
			doubleValues: true
		  },
		  'background-position': {
			canOverride: canOverride.always,
			defaultValue: ['0', '0'],
			doubleValues: true,
			shortestValue: '0'
		  },
		  'background-size': {
			canOverride: canOverride.always,
			defaultValue: ['auto'],
			doubleValues: true,
			shortestValue: '0 0'
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
			restore: restore.withoutDefaults,
			shorthand: true
		  },
		  'border-color': {
			canOverride: canOverride.color,
			defaultValue: 'none',
			shorthand: true
		  },
		  'border-style': {
			canOverride: canOverride.always,
			defaultValue: 'none',
			shorthand: true
		  },
		  'border-width': {
			canOverride: canOverride.unit,
			defaultValue: 'medium',
			shortestValue: '0',
			shorthand: true
		  },
		  'list-style': {
			components: [
			  'list-style-type',
			  'list-style-position',
			  'list-style-image'
			],
			canOverride: canOverride.always,
			breakUp: breakUp.listStyle,
			restore: restore.withoutDefaults,
			defaultValue: 'outside', // can't use 'disc' because that'd override default 'decimal' for <ol>
			shortestValue: 'none',
			shorthand: true
		  },
		  'list-style-type' : {
			canOverride: canOverride.always,
			defaultValue: '__hack',
			// NOTE: we can't tell the real default value here, it's 'disc' for <ul> and 'decimal' for <ol>
			//       -- this is a hack, but it doesn't matter because this value will be either overridden or it will disappear at the final step anyway
			shortestValue: 'none'
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
		  'outline': {
			components: [
			  'outline-color',
			  'outline-style',
			  'outline-width'
			],
			breakUp: breakUp.outline,
			restore: restore.withoutDefaults,
			defaultValue: '0',
			shorthand: true
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
		  compactable[prop] = {
			canOverride: options.canOverride,
			components: components,
			breakUp: options.breakUp || breakUp.fourValues,
			defaultValue: options.defaultValue || '0',
			restore: options.restore || restore.fourValues,
			shortestValue: options.shortestValue,
			shorthand: true
		  };
		  for (var i = 0; i < components.length; i++) {
			compactable[components[i]] = {
			  breakUp: options.breakUp || breakUp.fourValues,
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
			restore: restore.borderRadius
		  });
		});

		addFourValueShorthand('border-color', [
		  'border-top-color',
		  'border-right-color',
		  'border-bottom-color',
		  'border-left-color'
		], {
		  breakUp: breakUp.fourValues,
		  canOverride: canOverride.color,
		  defaultValue: 'none',
		  shortestValue: 'red'
		});

		addFourValueShorthand('border-style', [
		  'border-top-style',
		  'border-right-style',
		  'border-bottom-style',
		  'border-left-style'
		], {
		  breakUp: breakUp.fourValues,
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

		// Adds `componentOf` field to all longhands
		for (var property in compactable) {
		  if (compactable[property].shorthand) {
			for (var i = 0, l = compactable[property].components.length; i < l; i++) {
			  compactable[compactable[property].components[i]].componentOf = property;
			}
		  }
		}

		return compactable;
	};
	//#endregion
	
	//#region URL: /properties/every-combination
	modules['/properties/every-combination'] = function () {
		var shallowClone = require('/properties/clone').shallow;

		var MULTIPLEX_SEPARATOR = ',';

		function everyCombination(fn, left, right, validator) {
		  var _left = shallowClone(left);
		  var _right = shallowClone(right);

		  for (var i = 0, l = left.value.length; i < l; i++) {
			for (var j = 0, m = right.value.length; j < m; j++) {
			  if (left.value[i][0] == MULTIPLEX_SEPARATOR || right.value[j][0] == MULTIPLEX_SEPARATOR)
				continue;

			  _left.value = [left.value[i]];
			  _right.value = [right.value[j]];
			  if (!fn(_left, _right, validator))
				return false;
			}
		  }

		  return true;
		}

		return everyCombination;
	};
	//#endregion
	
	//#region URL: /properties/has-inherit
	modules['/properties/has-inherit'] = function () {
		function hasInherit(property) {
		  for (var i = property.value.length - 1; i >= 0; i--) {
			if (property.value[i][0] == 'inherit')
			  return true;
		  }

		  return false;
		}

		return hasInherit;
	};
	//#endregion

	//#region URL: /properties/optimizer
	modules['/properties/optimizer'] = function () {
		var compactable = require('/properties/compactable');
		var wrapForOptimizing = require('/properties/wrap-for-optimizing').all;
		var populateComponents = require('/properties/populate-components');
		var compactOverrides = require('/properties/override-compactor');
		var compactShorthands = require('/properties/shorthand-compactor');
		var removeUnused = require('/properties/remove-unused');
		var restoreShorthands = require('/properties/restore-shorthands');
		var stringifyProperty = require('/stringifier/one-time').property;

		var shorthands = {
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

		function _optimize(properties, mergeAdjacent, aggressiveMerging, validator) {
		  var overrideMapping = {};
		  var lastName = null;
		  var j;

		  function mergeablePosition(position) {
			if (mergeAdjacent === false || mergeAdjacent === true)
			  return mergeAdjacent;

			return mergeAdjacent.indexOf(position) > -1;
		  }

		  function sameValue(position) {
			var left = properties[position - 1];
			var right = properties[position];

			return stringifyProperty(left.all, left.position) == stringifyProperty(right.all, right.position);
		  }

		  propertyLoop:
		  for (var position = 0, total = properties.length; position < total; position++) {
			var property = properties[position];
			var _name = (property.name == '-ms-filter' || property.name == 'filter') ?
			  (lastName == 'background' || lastName == 'background-image' ? lastName : property.name) :
			  property.name;
			var isImportant = property.important;
			var isHack = property.hack;

			if (property.unused)
			  continue;

			if (position > 0 && _name == lastName && sameValue(position)) {
			  property.unused = true;
			  continue;
			}

			// comment is necessary - we assume that if two properties are one after another
			// then it is intentional way of redefining property which may not be widely supported
			// e.g. a{display:inline-block;display:-moz-inline-box}
			// however if `mergeablePosition` yields true then the rule does not apply
			// (e.g merging two adjacent selectors: `a{display:block}a{display:block}`)
			if (_name in overrideMapping && (aggressiveMerging && _name != lastName || mergeablePosition(position))) {
			  var toOverridePositions = overrideMapping[_name];
			  var canOverride = compactable[_name] && compactable[_name].canOverride;
			  var anyRemoved = false;

			  for (j = toOverridePositions.length - 1; j >= 0; j--) {
				var toRemove = properties[toOverridePositions[j]];
				var longhandToShorthand = toRemove.name != _name;
				var wasImportant = toRemove.important;
				var wasHack = toRemove.hack;

				if (toRemove.unused)
				  continue;

				if (longhandToShorthand && wasImportant)
				  continue;

				if (!wasImportant && (wasHack && !isHack || !wasHack && isHack))
				  continue;

				if (wasImportant && (isHack == 'star' || isHack == 'underscore'))
				  continue;

				if (!wasHack && !isHack && !longhandToShorthand && canOverride && !canOverride(toRemove, property, validator))
				  continue;

				if (wasImportant && !isImportant || wasImportant && isHack) {
				  property.unused = true;
				  continue propertyLoop;
				} else {
				  anyRemoved = true;
				  toRemove.unused = true;
				}
			  }

			  if (anyRemoved) {
				position = -1;
				overrideMapping = {};
			  }
			} else {
			  overrideMapping[_name] = overrideMapping[_name] || [];
			  overrideMapping[_name].push(position);

			  // TODO: to be removed with
			  // certain shorthand (see values of `shorthands`) should trigger removal of
			  // longhand properties (see keys of `shorthands`)
			  var _shorthands = shorthands[_name];
			  if (_shorthands) {
				for (j = _shorthands.length - 1; j >= 0; j--) {
				  var shorthand = _shorthands[j];
				  overrideMapping[shorthand] = overrideMapping[shorthand] || [];
				  overrideMapping[shorthand].push(position);
				}
			  }
			}

			lastName = _name;
		  }
		}

		function optimize(selector, properties, mergeAdjacent, withCompacting, options, validator) {
		  var _properties = wrapForOptimizing(properties);
		  populateComponents(_properties, validator);
		  _optimize(_properties, mergeAdjacent, options.aggressiveMerging, validator);

		  if (withCompacting && options.shorthandCompacting) {
			compactOverrides(_properties, options.compatibility, validator);
			compactShorthands(_properties/*, options.sourceMap*/, validator);
		  }

		  restoreShorthands(_properties);
		  removeUnused(_properties);
		}

		return optimize;
	};
	//#endregion

	//#region URL: /properties/override-compactor
	modules['/properties/override-compactor'] = function () {
		var canOverride = require('/properties/can-override');
		var compactable = require('/properties/compactable');
		var deepClone = require('/properties/clone').deep;
		var shallowClone = require('/properties/clone').shallow;
		var hasInherit = require('/properties/has-inherit');
		var restoreShorthands = require('/properties/restore-shorthands');
		var everyCombination = require('/properties/every-combination');

		var stringifyProperty = require('/stringifier/one-time').property;

		var MULTIPLEX_SEPARATOR = ',';

		// Used when searching for a component that matches property
		function nameMatchFilter(to) {
		  return function (property) {
			return to.name === property.name;
		  };
		}

		function wouldBreakCompatibility(property, validator) {
		  for (var i = 0; i < property.components.length; i++) {
			var component = property.components[i];
			var descriptor = compactable[component.name];
			var canOverride = descriptor && descriptor.canOverride || canOverride.sameValue;

			var _component = shallowClone(component);
			_component.value = [[descriptor.defaultValue]];

			if (!canOverride(_component, component, validator))
			  return true;
		  }

		  return false;
		}

		function isComponentOf(shorthand, longhand) {
		  return compactable[shorthand.name].components.indexOf(longhand.name) > -1;
		}

		function overrideIntoMultiplex(property, by) {
		  by.unused = true;

		  turnIntoMultiplex(by, multiplexSize(property));
		  property.value = by.value;
		}

		function overrideByMultiplex(property, by) {
		  by.unused = true;
		  property.multiplex = true;
		  property.value = by.value;
		}

		function overrideSimple(property, by) {
		  by.unused = true;
		  property.value = by.value;
		}

		function override(property, by) {
		  if (by.multiplex)
			overrideByMultiplex(property, by);
		  else if (property.multiplex)
			overrideIntoMultiplex(property, by);
		  else
			overrideSimple(property, by);
		}

		function overrideShorthand(property, by) {
		  by.unused = true;

		  for (var i = 0, l = property.components.length; i < l; i++) {
			override(property.components[i], by.components[i], property.multiplex);
		  }
		}

		function turnIntoMultiplex(property, size) {
		  property.multiplex = true;

		  for (var i = 0, l = property.components.length; i < l; i++) {
			var component = property.components[i];
			if (component.multiplex)
			  continue;

			var value = component.value.slice(0);

			for (var j = 1; j < size; j++) {
			  component.value.push([MULTIPLEX_SEPARATOR]);
			  Array.prototype.push.apply(component.value, value);
			}
		  }
		}

		function multiplexSize(component) {
		  var size = 0;

		  for (var i = 0, l = component.value.length; i < l; i++) {
			if (component.value[i][0] == MULTIPLEX_SEPARATOR)
			  size++;
		  }

		  return size + 1;
		}

		function lengthOf(property) {
		  var fakeAsArray = [[property.name]].concat(property.value);
		  return stringifyProperty([fakeAsArray], 0).length;
		}

		function moreSameShorthands(properties, startAt, name) {
		  // Since we run the main loop in `compactOverrides` backwards, at this point some
		  // properties may not be marked as unused.
		  // We should consider reverting the order if possible
		  var count = 0;

		  for (var i = startAt; i >= 0; i--) {
			if (properties[i].name == name && !properties[i].unused)
			  count++;
			if (count > 1)
			  break;
		  }

		  return count > 1;
		}

		function mergingIntoFunction(left, right, validator) {
		  for (var i = 0, l = left.components.length; i < l; i++) {
			if (anyValue(validator.isValidFunction, left.components[i]))
			  return true;
		  }

		  return false;
		}

		function anyValue(fn, property) {
		  for (var i = 0, l = property.value.length; i < l; i++) {
			if (property.value[i][0] == MULTIPLEX_SEPARATOR)
			  continue;

			if (fn(property.value[i][0]))
			  return true;
		  }

		  return false;
		}

		function wouldResultInLongerValue(left, right) {
		  if (!left.multiplex && !right.multiplex || left.multiplex && right.multiplex)
			return false;

		  var multiplex = left.multiplex ? left : right;
		  var simple = left.multiplex ? right : left;
		  var component;

		  var multiplexClone = deepClone(multiplex);
		  restoreShorthands([multiplexClone]);

		  var simpleClone = deepClone(simple);
		  restoreShorthands([simpleClone]);

		  var lengthBefore = lengthOf(multiplexClone) + 1 + lengthOf(simpleClone);

		  if (left.multiplex) {
			component = multiplexClone.components.filter(nameMatchFilter(simpleClone))[0];
			overrideIntoMultiplex(component, simpleClone);
		  } else {
			component = simpleClone.components.filter(nameMatchFilter(multiplexClone))[0];
			turnIntoMultiplex(simpleClone, multiplexSize(multiplexClone));
			overrideByMultiplex(component, multiplexClone);
		  }

		  restoreShorthands([simpleClone]);

		  var lengthAfter = lengthOf(simpleClone);

		  return lengthBefore < lengthAfter;
		}

		function isCompactable(property) {
		  return property.name in compactable;
		}

		function noneOverrideHack(left, right) {
		  return !left.multiplex &&
			(left.name == 'background' || left.name == 'background-image') &&
			right.multiplex &&
			(right.name == 'background' || right.name == 'background-image') &&
			anyLayerIsNone(right.value);
		}

		function anyLayerIsNone(values) {
		  var layers = intoLayers(values);

		  for (var i = 0, l = layers.length; i < l; i++) {
			if (layers[i].length == 1 && layers[i][0][0] == 'none')
			  return true;
		  }

		  return false;
		}

		function intoLayers(values) {
		  var layers = [];

		  for (var i = 0, layer = [], l = values.length; i < l; i++) {
			var value = values[i];
			if (value[0] == MULTIPLEX_SEPARATOR) {
			  layers.push(layer);
			  layer = [];
			} else {
			  layer.push(value);
			}
		  }

		  layers.push(layer);
		  return layers;
		}

		function compactOverrides(properties, compatibility, validator) {
		  var mayOverride, right, left, component;
		  var i, j, k;

		  propertyLoop:
		  for (i = properties.length - 1; i >= 0; i--) {
			right = properties[i];

			if (!isCompactable(right))
			  continue;

			mayOverride = compactable[right.name].canOverride || canOverride.sameValue;

			for (j = i - 1; j >= 0; j--) {
			  left = properties[j];

			  if (!isCompactable(left))
				continue;

			  if (left.unused || right.unused)
				continue;

			  if (left.hack && !right.hack || !left.hack && right.hack)
				continue;

			  if (hasInherit(right))
				continue;

			  if (noneOverrideHack(left, right))
				continue;

			  if (!left.shorthand && right.shorthand && isComponentOf(right, left)) {
				// maybe `left` can be overridden by `right` which is a shorthand?
				if (!right.important && left.important)
				  continue;

				component = right.components.filter(nameMatchFilter(left))[0];
				mayOverride = (compactable[left.name] && compactable[left.name].canOverride) || canOverride.sameValue;
				if (everyCombination(mayOverride, left, component, validator)) {
				  left.unused = true;
				}
			  } else if (left.shorthand && !right.shorthand && isComponentOf(left, right)) {
				// maybe `right` can be pulled into `left` which is a shorthand?
				if (right.important && !left.important)
				  continue;

				// Pending more clever algorithm in #527
				if (moreSameShorthands(properties, i - 1, left.name))
				  continue;

				if (mergingIntoFunction(left, right, validator))
				  continue;

				component = left.components.filter(nameMatchFilter(right))[0];
				if (everyCombination(mayOverride, component, right, validator)) {
				  var disabledBackgroundSizeMerging = !compatibility.properties.backgroundSizeMerging && component.name.indexOf('background-size') > -1;
				  var nonMergeableValue = compactable[right.name].nonMergeableValue === right.value[0][0];

				  if (disabledBackgroundSizeMerging || nonMergeableValue)
					continue;

				  if (!compatibility.properties.merging && wouldBreakCompatibility(left, validator))
					continue;

				  if (component.value[0][0] != right.value[0][0] && (hasInherit(left) || hasInherit(right)))
					continue;

				  if (wouldResultInLongerValue(left, right))
					continue;

				  if (!left.multiplex && right.multiplex)
					turnIntoMultiplex(left, multiplexSize(right));

				  override(component, right);
				  left.dirty = true;
				}
			  } else if (left.shorthand && right.shorthand && left.name == right.name) {
				// merge if all components can be merged

				if (!right.important && left.important) {
				  right.unused = true;
				  continue propertyLoop;
				}

				if (right.important && !left.important) {
				  left.unused = true;
				  continue;
				}

				for (k = left.components.length - 1; k >= 0; k--) {
				  var leftComponent = left.components[k];
				  var rightComponent = right.components[k];

				  mayOverride = compactable[leftComponent.name].canOverride || canOverride.sameValue;
				  if (!everyCombination(mayOverride, leftComponent, rightComponent, validator))
					continue propertyLoop;
				  if (!everyCombination(canOverride.twoOptionalFunctions, leftComponent, rightComponent, validator) && validator.isValidFunction(rightComponent))
					continue propertyLoop;
				}

				overrideShorthand(left, right);
				left.dirty = true;
			  } else if (left.shorthand && right.shorthand && isComponentOf(left, right)) {
				// border is a shorthand but any of its components is a shorthand too

				if (!left.important && right.important)
				  continue;

				component = left.components.filter(nameMatchFilter(right))[0];
				mayOverride = compactable[right.name].canOverride || canOverride.sameValue;
				if (!everyCombination(mayOverride, component, right, validator))
				  continue;

				if (left.important && !right.important) {
				  right.unused = true;
				  continue;
				}

				var rightRestored = compactable[right.name].restore(right, compactable);
				if (rightRestored.length > 1)
				  continue;

				component = left.components.filter(nameMatchFilter(right))[0];
				override(component, right);
				right.dirty = true;
			  } else if (left.name == right.name) {
				// two non-shorthands should be merged based on understandability

				if (left.important && !right.important) {
				  right.unused = true;
				  continue;
				}

				mayOverride = compactable[right.name].canOverride || canOverride.sameValue;
				if (!everyCombination(mayOverride, left, right, validator))
				  continue;

				left.unused = true;
			  }
			}
		  }
		}

		return compactOverrides;
	};
	//#endregion
	
	//#region URL: /properties/populate-components
	modules['/properties/populate-components'] = function () {
		var compactable = require('/properties/compactable');

		function populateComponents(properties, validator) {
		  for (var i = properties.length - 1; i >= 0; i--) {
			var property = properties[i];
			var descriptor = compactable[property.name];

			if (descriptor && descriptor.shorthand) {
			  property.shorthand = true;
			  property.dirty = true;
			  property.components = descriptor.breakUp(property, compactable, validator);

			  if (property.components.length > 0)
				property.multiplex = property.components[0].multiplex;
			  else
				property.unused = true;
			}
		  }
		}

		return populateComponents;
	};
	//#endregion
	
	//#region URL: /properties/remove-unused
	modules['/properties/remove-unused'] = function () {
		function removeUnused(properties) {
		  for (var i = properties.length - 1; i >= 0; i--) {
			if (properties[i].unused)
			  properties[i].all.splice(i, 1);
		  }
		}

		return removeUnused;
	};
	//#endregion
	
	//#region URL: /properties/restore
	modules['/properties/restore'] = function () {
		var shallowClone = require('/properties/clone').shallow;
		var MULTIPLEX_SEPARATOR = ',';

		function background(property, compactable, lastInMultiplex) {
		  var components = property.components;
		  var restored = [];
		  var needsOne, needsBoth;

		  function restoreValue(component) {
			Array.prototype.unshift.apply(restored, component.value);
		  }

		  function isDefaultValue(component) {
			var descriptor = compactable[component.name];
			if (descriptor.doubleValues) {
			  if (descriptor.defaultValue.length == 1)
				return component.value[0][0] == descriptor.defaultValue[0] && (component.value[1] ? component.value[1][0] == descriptor.defaultValue[0] : true);
			  else
				return component.value[0][0] == descriptor.defaultValue[0] && (component.value[1] ? component.value[1][0] : component.value[0][0]) == descriptor.defaultValue[1];
			} else {
			  return component.value[0][0] == descriptor.defaultValue;
			}
		  }

		  for (var i = components.length - 1; i >= 0; i--) {
			var component = components[i];
			var isDefault = isDefaultValue(component);

			if (component.name == 'background-clip') {
			  var originComponent = components[i - 1];
			  var isOriginDefault = isDefaultValue(originComponent);

			  needsOne = component.value[0][0] == originComponent.value[0][0];

			  needsBoth = !needsOne && (
				(isOriginDefault && !isDefault) ||
				(!isOriginDefault && !isDefault) ||
				(!isOriginDefault && isDefault && component.value[0][0] != originComponent.value[0][0]));

			  if (needsOne) {
				restoreValue(originComponent);
			  } else if (needsBoth) {
				restoreValue(component);
				restoreValue(originComponent);
			  }

			  i--;
			} else if (component.name == 'background-size') {
			  var positionComponent = components[i - 1];
			  var isPositionDefault = isDefaultValue(positionComponent);

			  needsOne = !isPositionDefault && isDefault;

			  needsBoth = !needsOne &&
				(isPositionDefault && !isDefault || !isPositionDefault && !isDefault);

			  if (needsOne) {
				restoreValue(positionComponent);
			  } else if (needsBoth) {
				restoreValue(component);
				restored.unshift(['/']);
				restoreValue(positionComponent);
			  } else if (positionComponent.value.length == 1) {
				restoreValue(positionComponent);
			  }

			  i--;
			} else {
			  if (isDefault || compactable[component.name].multiplexLastOnly && !lastInMultiplex)
				continue;

			  restoreValue(component);
			}
		  }

		  if (restored.length === 0 && property.value.length == 1 && property.value[0][0] == '0')
			restored.push(property.value[0]);

		  if (restored.length === 0)
			restored.push([compactable[property.name].defaultValue]);

		  return restored;
		}

		function borderRadius(property, compactable) {
		  if (property.multiplex) {
			var horizontal = shallowClone(property);
			var vertical = shallowClone(property);

			for (var i = 0; i < 4; i++) {
			  var component = property.components[i];

			  var horizontalComponent = shallowClone(property);
			  horizontalComponent.value = [component.value[0]];
			  horizontal.components.push(horizontalComponent);

			  var verticalComponent = shallowClone(property);
			  verticalComponent.value = [component.value[2]];
			  vertical.components.push(verticalComponent);
			}

			var horizontalValues = fourValues(horizontal, compactable);
			var verticalValues = fourValues(vertical, compactable);

			if (horizontalValues.length == verticalValues.length &&
				horizontalValues[0][0] == verticalValues[0][0] &&
				(horizontalValues.length > 1 ? horizontalValues[1][0] == verticalValues[1][0] : true) &&
				(horizontalValues.length > 2 ? horizontalValues[2][0] == verticalValues[2][0] : true) &&
				(horizontalValues.length > 3 ? horizontalValues[3][0] == verticalValues[3][0] : true)) {
			  return horizontalValues;
			} else {
			  return horizontalValues.concat([['/']]).concat(verticalValues);
			}
		  } else {
			return fourValues(property, compactable);
		  }
		}

		function fourValues(property) {
		  var components = property.components;
		  var value1 = components[0].value[0];
		  var value2 = components[1].value[0];
		  var value3 = components[2].value[0];
		  var value4 = components[3].value[0];

		  if (value1[0] == value2[0] && value1[0] == value3[0] && value1[0] == value4[0]) {
			return [value1];
		  } else if (value1[0] == value3[0] && value2[0] == value4[0]) {
			return [value1, value2];
		  } else if (value2[0] == value4[0]) {
			return [value1, value2, value3];
		  } else {
			return [value1, value2, value3, value4];
		  }
		}

		function multiplex(restoreWith) {
		  return function (property, compactable) {
			if (!property.multiplex)
			  return restoreWith(property, compactable, true);

			var multiplexSize = 0;
			var restored = [];
			var componentMultiplexSoFar = {};
			var i, l;

			// At this point we don't know what's the multiplex size, e.g. how many background layers are there
			for (i = 0, l = property.components[0].value.length; i < l; i++) {
			  if (property.components[0].value[i][0] == MULTIPLEX_SEPARATOR)
				multiplexSize++;
			}

			for (i = 0; i <= multiplexSize; i++) {
			  var _property = shallowClone(property);

			  // We split multiplex into parts and restore them one by one
			  for (var j = 0, m = property.components.length; j < m; j++) {
				var componentToClone = property.components[j];
				var _component = shallowClone(componentToClone);
				_property.components.push(_component);

				// The trick is some properties has more than one value, so we iterate over values looking for
				// a multiplex separator - a comma
				for (var k = componentMultiplexSoFar[_component.name] || 0, n = componentToClone.value.length; k < n; k++) {
				  if (componentToClone.value[k][0] == MULTIPLEX_SEPARATOR) {
					componentMultiplexSoFar[_component.name] = k + 1;
					break;
				  }

				  _component.value.push(componentToClone.value[k]);
				}
			  }

			  // No we can restore shorthand value
			  var lastInMultiplex = i == multiplexSize;
			  var _restored = restoreWith(_property, compactable, lastInMultiplex);
			  Array.prototype.push.apply(restored, _restored);

			  if (i < multiplexSize)
				restored.push([',']);
			}

			return restored;
		  };
		}

		function withoutDefaults(property, compactable) {
		  var components = property.components;
		  var restored = [];

		  for (var i = components.length - 1; i >= 0; i--) {
			var component = components[i];
			var descriptor = compactable[component.name];

			if (component.value[0][0] != descriptor.defaultValue)
			  restored.unshift(component.value[0]);
		  }

		  if (restored.length === 0)
			restored.push([compactable[property.name].defaultValue]);

		  return restored;
		}

		var exports = {
		  background: background,
		  borderRadius: borderRadius,
		  fourValues: fourValues,
		  multiplex: multiplex,
		  withoutDefaults: withoutDefaults
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /properties/restore-shorthands
	modules['/properties/restore-shorthands'] = function () {
		var compactable = require('/properties/compactable');

		function restoreShorthands(properties) {
		  for (var i = properties.length - 1; i >= 0; i--) {
			var property = properties[i];
			var descriptor = compactable[property.name];

			if (descriptor && descriptor.shorthand && property.dirty && !property.unused) {
			  var restored = descriptor.restore(property, compactable);
			  property.value = restored;

			  if (!('all' in property))
				continue;

			  var current = property.all[property.position];
			  current.splice(1, current.length - 1);

			  Array.prototype.push.apply(current, restored);
			}
		  }
		}

		return restoreShorthands;
	};
	//#endregion

	//#region URL: /properties/shorthand-compactor
	modules['/properties/shorthand-compactor'] = function () {
		var compactable = require('/properties/compactable');
		var deepClone = require('/properties/clone').deep;
		var hasInherit = require('/properties/has-inherit');
		var populateComponents = require('/properties/populate-components');
		var wrapSingle = require('/properties/wrap-for-optimizing').single;
		var everyCombination = require('/properties/every-combination');

		function mixedImportance(components) {
		  var important;

		  for (var name in components) {
			if (undefined !== important && components[name].important != important)
			  return true;

			important = components[name].important;
		  }

		  return false;
		}

//		function componentSourceMaps(components) {
//		  var sourceMapping = [];
//
//		  for (var name in components) {
//			var component = components[name];
//			var originalValue = component.all[component.position];
//			var mapping = originalValue[0][originalValue[0].length - 1];
//
//			if (Array.isArray(mapping))
//			  Array.prototype.push.apply(sourceMapping, mapping);
//		  }
//
//		  return sourceMapping;
//		}

		function replaceWithShorthand(properties, candidateComponents, name/*, sourceMaps*/, validator) {
		  var descriptor = compactable[name];
		  var newValuePlaceholder = [[name, false, false], [descriptor.defaultValue]];
		  var all;

		  var newProperty = wrapSingle(newValuePlaceholder);
		  newProperty.shorthand = true;
		  newProperty.dirty = true;

		  populateComponents([newProperty], validator);

		  for (var i = 0, l = descriptor.components.length; i < l; i++) {
			var component = candidateComponents[descriptor.components[i]];
			var canOverride = compactable[component.name].canOverride;

			if (hasInherit(component))
			  return;

			if (!everyCombination(canOverride, newProperty.components[i], component, validator))
			  return;

			newProperty.components[i] = deepClone(component);
			newProperty.important = component.important;

			all = component.all;
		  }

		  for (var componentName in candidateComponents) {
			candidateComponents[componentName].unused = true;
		  }

//		  if (sourceMaps) {
//			var sourceMapping = componentSourceMaps(candidateComponents);
//			if (sourceMapping.length > 0)
//			  newValuePlaceholder[0].push(sourceMapping);
//		  }

		  newProperty.position = all.length;
		  newProperty.all = all;
		  newProperty.all.push(newValuePlaceholder);
		  newValuePlaceholder[0][1] = newProperty.important;

		  properties.push(newProperty);
		}

		function invalidateOrCompact(properties, position, candidates/*, sourceMaps*/, validator) {
		  var property = properties[position];

		  for (var name in candidates) {
			if (undefined !== property && name == property.name)
			  continue;

			var descriptor = compactable[name];
			var candidateComponents = candidates[name];
			if (descriptor.components.length > Object.keys(candidateComponents).length) {
			  delete candidates[name];
			  continue;
			}

			if (mixedImportance(candidateComponents))
			  continue;

			replaceWithShorthand(properties, candidateComponents, name/*, sourceMaps*/, validator);
		  }
		}

		function compactShortands(properties/*, sourceMaps*/, validator) {
		  var candidates = {};

		  if (properties.length < 3)
			return;

		  for (var i = 0, l = properties.length; i < l; i++) {
			var property = properties[i];
			if (property.unused)
			  continue;

			if (property.hack)
			  continue;

			var descriptor = compactable[property.name];
			if (!descriptor || !descriptor.componentOf)
			  continue;

			if (property.shorthand) {
			  invalidateOrCompact(properties, i, candidates/*, sourceMaps*/, validator);
			} else {
			  var componentOf = descriptor.componentOf;
			  candidates[componentOf] = candidates[componentOf] || {};
			  candidates[componentOf][property.name] = property;
			}
		  }

		  invalidateOrCompact(properties, i, candidates/*, sourceMaps*/, validator);
		}

		return compactShortands;
	};
	//#endregion

	//#region URL: /properties/validator
	modules['/properties/validator'] = function () {
		// Validates various CSS property values

		var Splitter = require('/utils/splitter');

		var widthKeywords = ['thin', 'thick', 'medium', 'inherit', 'initial'];
		var allUnits = ['px', '%', 'em', 'rem', 'in', 'cm', 'mm', 'ex', 'pt', 'pc', 'vw', 'vh', 'vmin', 'vmax'];
		var cssUnitRegexStr = '(\\-?\\.?\\d+\\.?\\d*(' + allUnits.join('|') + '|)|auto|inherit)';
		var cssCalcRegexStr = '(\\-moz\\-|\\-webkit\\-)?calc\\([^\\)]+\\)';
		var cssFunctionNoVendorRegexStr = '[A-Z]+(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.|\\(|\\))*\\)';
		var cssFunctionVendorRegexStr = '\\-(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.|\\(|\\))*\\)';
		var cssVariableRegexStr = 'var\\(\\-\\-[^\\)]+\\)';
		var cssFunctionAnyRegexStr = '(' + cssVariableRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';
		var cssUnitOrCalcRegexStr = '(' + cssUnitRegexStr + '|' + cssCalcRegexStr + ')';
		var cssUnitAnyRegexStr = '(none|' + widthKeywords.join('|') + '|' + cssUnitRegexStr + '|' + cssVariableRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';

		var cssFunctionNoVendorRegex = new RegExp('^' + cssFunctionNoVendorRegexStr + '$', 'i');
		var cssFunctionVendorRegex = new RegExp('^' + cssFunctionVendorRegexStr + '$', 'i');
		var cssVariableRegex = new RegExp('^' + cssVariableRegexStr + '$', 'i');
		var cssFunctionAnyRegex = new RegExp('^' + cssFunctionAnyRegexStr + '$', 'i');
		var cssUnitRegex = new RegExp('^' + cssUnitRegexStr + '$', 'i');
		var cssUnitOrCalcRegex = new RegExp('^' + cssUnitOrCalcRegexStr + '$', 'i');
		var cssUnitAnyRegex = new RegExp('^' + cssUnitAnyRegexStr + '$', 'i');

		var backgroundRepeatKeywords = ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'inherit'];
		var backgroundAttachmentKeywords = ['inherit', 'scroll', 'fixed', 'local'];
		var backgroundPositionKeywords = ['center', 'top', 'bottom', 'left', 'right'];
		var backgroundSizeKeywords = ['contain', 'cover'];
		var backgroundBoxKeywords = ['border-box', 'content-box', 'padding-box'];
		var styleKeywords = ['auto', 'inherit', 'hidden', 'none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
		var listStyleTypeKeywords = ['armenian', 'circle', 'cjk-ideographic', 'decimal', 'decimal-leading-zero', 'disc', 'georgian', 'hebrew', 'hiragana', 'hiragana-iroha', 'inherit', 'katakana', 'katakana-iroha', 'lower-alpha', 'lower-greek', 'lower-latin', 'lower-roman', 'none', 'square', 'upper-alpha', 'upper-latin', 'upper-roman'];
		var listStylePositionKeywords = ['inside', 'outside', 'inherit'];

		function Validator(compatibility) {
		  if (compatibility.units.rem) {
			this.compatibleCssUnitRegex = cssUnitRegex;
			this.compatibleCssUnitAnyRegex = cssUnitAnyRegex;
		  } else {
			var validUnits = allUnits.slice(0).filter(function (value) {
			  return value != 'rem';
			});

			var compatibleCssUnitRegexStr = '(\\-?\\.?\\d+\\.?\\d*(' + validUnits.join('|') + ')|auto|inherit)';
			this.compatibleCssUnitRegex = new RegExp('^' + compatibleCssUnitRegexStr + '$', 'i');
			this.compatibleCssUnitAnyRegex = new RegExp('^(none|' + widthKeywords.join('|') + '|' + compatibleCssUnitRegexStr + '|' + cssVariableRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')$', 'i');
		  }
		}

		Validator.prototype.isValidHexColor = function (s) {
		  return (s.length === 4 || s.length === 7) && s[0] === '#';
		};

		Validator.prototype.isValidRgbaColor = function (s) {
		  s = s.split(' ').join('');
		  return s.length > 0 && s.indexOf('rgba(') === 0 && s.indexOf(')') === s.length - 1;
		};

		Validator.prototype.isValidHslaColor = function (s) {
		  s = s.split(' ').join('');
		  return s.length > 0 && s.indexOf('hsla(') === 0 && s.indexOf(')') === s.length - 1;
		};

		Validator.prototype.isValidNamedColor = function (s) {
		  // We don't really check if it's a valid color value, but allow any letters in it
		  return s !== 'auto' && (s === 'transparent' || s === 'inherit' || /^[a-zA-Z]+$/.test(s));
		};

		Validator.prototype.isValidVariable = function (s) {
		  return cssVariableRegex.test(s);
		};

		Validator.prototype.isValidColor = function (s) {
		  return this.isValidNamedColor(s) ||
			this.isValidHexColor(s) ||
			this.isValidRgbaColor(s) ||
			this.isValidHslaColor(s) ||
			this.isValidVariable(s) ||
			this.isValidVendorPrefixedValue(s);
		};

		Validator.prototype.isValidUrl = function (s) {
		  // NOTE: at this point all URLs are replaced with placeholders by clean-css, so we check for those placeholders
		  return s.indexOf('__ESCAPED_URL_CLEAN_CSS') === 0;
		};

		Validator.prototype.isValidUnit = function (s) {
		  return cssUnitAnyRegex.test(s);
		};

		Validator.prototype.isValidUnitWithoutFunction = function (s) {
		  return cssUnitRegex.test(s);
		};

		Validator.prototype.isValidAndCompatibleUnit = function (s) {
		  return this.compatibleCssUnitAnyRegex.test(s);
		};

		Validator.prototype.isValidAndCompatibleUnitWithoutFunction = function (s) {
		  return this.compatibleCssUnitRegex.test(s);
		};

		Validator.prototype.isValidFunctionWithoutVendorPrefix = function (s) {
		  return cssFunctionNoVendorRegex.test(s);
		};

		Validator.prototype.isValidFunctionWithVendorPrefix = function (s) {
		  return cssFunctionVendorRegex.test(s);
		};

		Validator.prototype.isValidFunction = function (s) {
		  return cssFunctionAnyRegex.test(s);
		};

		Validator.prototype.isValidBackgroundRepeat = function (s) {
		  return backgroundRepeatKeywords.indexOf(s) >= 0 || this.isValidVariable(s);
		};

		Validator.prototype.isValidBackgroundAttachment = function (s) {
		  return backgroundAttachmentKeywords.indexOf(s) >= 0 || this.isValidVariable(s);
		};

		Validator.prototype.isValidBackgroundBox = function (s) {
		  return backgroundBoxKeywords.indexOf(s) >= 0 || this.isValidVariable(s);
		};

		Validator.prototype.isValidBackgroundPositionPart = function (s) {
		  return backgroundPositionKeywords.indexOf(s) >= 0 || cssUnitOrCalcRegex.test(s) || this.isValidVariable(s);
		};

		Validator.prototype.isValidBackgroundPosition = function (s) {
		  if (s === 'inherit')
			return true;

		  var parts = s.split(' ');
		  for (var i = 0, l = parts.length; i < l; i++) {
			if (parts[i] === '')
			  continue;
			if (this.isValidBackgroundPositionPart(parts[i]) || this.isValidVariable(parts[i]))
			  continue;

			return false;
		  }

		  return true;
		};

		Validator.prototype.isValidBackgroundSizePart = function (s) {
		  return backgroundSizeKeywords.indexOf(s) >= 0 || cssUnitRegex.test(s) || this.isValidVariable(s);
		};

		Validator.prototype.isValidBackgroundPositionAndSize = function (s) {
		  if (s.indexOf('/') < 0)
			return false;

		  var twoParts = new Splitter('/').split(s);
		  return this.isValidBackgroundSizePart(twoParts.pop()) && this.isValidBackgroundPositionPart(twoParts.pop());
		};

		Validator.prototype.isValidListStyleType = function (s) {
		  return listStyleTypeKeywords.indexOf(s) >= 0 || this.isValidVariable(s);
		};

		Validator.prototype.isValidListStylePosition = function (s) {
		  return listStylePositionKeywords.indexOf(s) >= 0 || this.isValidVariable(s);
		};

		Validator.prototype.isValidStyle = function (s) {
		  return styleKeywords.indexOf(s) >= 0 || this.isValidVariable(s);
		};

		Validator.prototype.isValidWidth = function (s) {
		  return this.isValidUnit(s) || widthKeywords.indexOf(s) >= 0 || this.isValidVariable(s);
		};

		Validator.prototype.isValidVendorPrefixedValue = function (s) {
		  return /^-([A-Za-z0-9]|-)*$/gi.test(s);
		};

		Validator.prototype.areSameFunction = function (a, b) {
		  if (!this.isValidFunction(a) || !this.isValidFunction(b))
			return false;

		  var f1name = a.substring(0, a.indexOf('('));
		  var f2name = b.substring(0, b.indexOf('('));

		  return f1name === f2name;
		};
		
		return Validator;
	};
	//#endregion
	
	//#region URL: /properties/wrap-for-optimizing
	modules['/properties/wrap-for-optimizing'] = function () {
		function wrapAll(properties) {
		  var wrapped = [];

		  for (var i = properties.length - 1; i >= 0; i--) {
			if (typeof properties[i][0] == 'string')
			  continue;

			var single = wrapSingle(properties[i]);
			single.all = properties;
			single.position = i;
			wrapped.unshift(single);
		  }

		  return wrapped;
		}

		function isMultiplex(property) {
		  for (var i = 1, l = property.length; i < l; i++) {
			if (property[i][0] == ',' || property[i][0] == '/')
			  return true;
		  }

		  return false;
		}

		function wrapSingle(property) {
		  return {
			components: [],
			dirty: false,
			hack: property[0][2],
			important: property[0][1],
			name: property[0][0],
			multiplex: property.length > 2 ? isMultiplex(property) : false,
			position: 0,
			shorthand: false,
			unused: property.length < 2,
			value: property.slice(1)
		  };
		}

		var exports = {
		  all: wrapAll,
		  single: wrapSingle
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /selectors/extractor
	modules['/selectors/extractor'] = function () {
		// This extractor is used in advanced optimizations
		// IMPORTANT: Mind Token class and this code is not related!
		// Properties will be tokenized in one step, see #429

		var stringifySelectors = require('/stringifier/one-time').selectors;
		var stringifyValue = require('/stringifier/one-time').value;

		function extract(token) {
		  var properties = [];

		  if (token[0] == 'selector') {
			var inSimpleSelector = !/[\.\+#>~\s]/.test(stringifySelectors(token[1]));
			for (var i = 0, l = token[2].length; i < l; i++) {
			  var property = token[2][i];

			  if (property.indexOf('__ESCAPED') === 0)
				continue;

			  var name = token[2][i][0][0];
			  if (name.length === 0)
				continue;

			  var value = stringifyValue(token[2], i);

			  properties.push([
				name,
				value,
				findNameRoot(name),
				token[2][i],
				name + ':' + value,
				token[1],
				inSimpleSelector
			  ]);
			}
		  } else if (token[0] == 'block') {
			for (var j = 0, k = token[2].length; j < k; j++) {
			  properties = properties.concat(extract(token[2][j]));
			}
		  }

		  return properties;
		}

		function findNameRoot(name) {
		  if (name == 'list-style')
			return name;
		  if (name.indexOf('-radius') > 0)
			return 'border-radius';
		  if (name.indexOf('border-') === 0)
			return name.match(/border\-\w+/)[0];
		  if (name.indexOf('text-') === 0)
			return name;

		  return name.replace(/^\-\w+\-/, '').match(/([a-zA-Z]+)/)[0].toLowerCase();
		}

		return extract;
	};
	//#endregion
	
	//#region URL: /selectors/optimization-metadata
	modules['/selectors/optimization-metadata'] = function () {
		// TODO: we should wrap it under `wrap for optimizing`

		var BACKSLASH_HACK = '\\';
		var IMPORTANT = '!important';
		var STAR_HACK = '*';
		var UNDERSCORE_HACK = '_';

		function addOptimizationMetadata(tokens) {
		  for (var i = tokens.length - 1; i >= 0; i--) {
			var token = tokens[i];

			switch (token[0]) {
			  case 'flat-block':
			  case 'selector':
				addToProperties(token[2]);
				break;
			  case 'block':
				addOptimizationMetadata(token[2]);
				break;
			}
		  }
		}

		function addToProperties(properties) {
		  for (var i = properties.length - 1; i >= 0; i--) {
			if (typeof properties[i] != 'string')
			  addToProperty(properties[i]);
		  }
		}

		function addToProperty(property) {
		  var name = property[0][0];
		  var lastValue = property[property.length - 1];
		  var isImportant = lastValue[0].indexOf(IMPORTANT) > 0;
		  var hackType = false;

		  if (name[0] == UNDERSCORE_HACK) {
			property[0][0] = name.substring(1);
			hackType = 'underscore';
		  } else if (name[0] == STAR_HACK) {
			property[0][0] = name.substring(1);
			hackType = 'star';
		  } else if (lastValue[0].indexOf(BACKSLASH_HACK) > 0 && lastValue[0].indexOf(BACKSLASH_HACK) == lastValue[0].length - BACKSLASH_HACK.length - 1) {
			lastValue[0] = lastValue[0].substring(0, lastValue[0].length - BACKSLASH_HACK.length - 1);
			hackType = 'suffix';
		  }

		  // TODO: this should be done at tokenization step
		  // with adding importance info
		  if (isImportant)
			lastValue[0] = lastValue[0].substring(0, lastValue[0].length - IMPORTANT.length);

		  property[0].splice(1, 0, isImportant, hackType);
		}

		return addOptimizationMetadata;
	};
	//#endregion
	
	//#region URL: /selectors/optimizer
	modules['/selectors/optimizer'] = function () {
		var Tokenizer = require('/selectors/tokenizer');
		var SimpleOptimizer = require('/selectors/optimizers/simple');
		var AdvancedOptimizer = require('/selectors/optimizers/advanced');
		var addOptimizationMetadata = require('/selectors/optimization-metadata');

		function SelectorsOptimizer(options, context) {
		  this.options = options || {};
		  this.context = context || {};
		}

		SelectorsOptimizer.prototype.process = function (data, stringify, restoreCallback/*, sourceMapTracker*/) {
		  var tokens = new Tokenizer(this.context/*, this.options.sourceMap*/).toTokens(data);

		  addOptimizationMetadata(tokens);

		  new SimpleOptimizer(this.options).optimize(tokens);
		  if (this.options.advanced)
			new AdvancedOptimizer(this.options, this.context).optimize(tokens);

		  return stringify(tokens, this.options, restoreCallback/*, sourceMapTracker*/);
		};
	
		return SelectorsOptimizer;
	};
	//#endregion

	//#region URL: /selectors/optimizers/advanced
	modules['/selectors/optimizers/advanced'] = function () {
		var optimizeProperties = require('/properties/optimizer');
		var CleanUp = require('/selectors/optimizers/clean-up');

		var extractProperties = require('/selectors/extractor');
		var canReorder = require('/selectors/reorderable').canReorder;
		var canReorderSingle = require('/selectors/reorderable').canReorderSingle;
		var stringifyAll = require('/stringifier/one-time').all;
		var stringifyBody = require('/stringifier/one-time').body;
		var stringifySelectors = require('/stringifier/one-time').selectors;

		function AdvancedOptimizer(options, context) {
		  this.options = options;
		  this.validator = context.validator;
		}

		function unsafeSelector(value) {
		  return /\.|\*| :/.test(value);
		}

		function naturalSorter(a, b) {
		  return a > b;
		}

		AdvancedOptimizer.prototype.isSpecial = function (selector) {
		  return this.options.compatibility.selectors.special.test(selector);
		};

		AdvancedOptimizer.prototype.removeDuplicates = function (tokens) {
		  var matched = {};
		  var moreThanOnce = [];
		  var id, token;
		  var body, bodies;

		  for (var i = 0, l = tokens.length; i < l; i++) {
			token = tokens[i];
			if (token[0] != 'selector')
			  continue;

			id = stringifySelectors(token[1]);

			if (matched[id] && matched[id].length == 1)
			  moreThanOnce.push(id);
			else
			  matched[id] = matched[id] || [];

			matched[id].push(i);
		  }

		  for (i = 0, l = moreThanOnce.length; i < l; i++) {
			id = moreThanOnce[i];
			bodies = [];

			for (var j = matched[id].length - 1; j >= 0; j--) {
			  token = tokens[matched[id][j]];
			  body = stringifyBody(token[2]);

			  if (bodies.indexOf(body) > -1)
				token[2] = [];
			  else
				bodies.push(body);
			}
		  }
		};

		AdvancedOptimizer.prototype.mergeAdjacent = function (tokens) {
		  var lastToken = [null, [], []];
		  var adjacentSpace = this.options.compatibility.selectors.adjacentSpace;

		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];

			if (token[0] != 'selector') {
			  lastToken = [null, [], []];
			  continue;
			}

			if (lastToken[0] == 'selector' && stringifySelectors(token[1]) == stringifySelectors(lastToken[1])) {
			  var joinAt = [lastToken[2].length];
			  Array.prototype.push.apply(lastToken[2], token[2]);
			  optimizeProperties(token[1], lastToken[2], joinAt, true, this.options, this.validator);
			  token[2] = [];
			} else if (lastToken[0] == 'selector' && stringifyBody(token[2]) == stringifyBody(lastToken[2]) &&
				!this.isSpecial(stringifySelectors(token[1])) && !this.isSpecial(stringifySelectors(lastToken[1]))) {
			  lastToken[1] = CleanUp.selectors(lastToken[1].concat(token[1]), false, adjacentSpace);
			  token[2] = [];
			} else {
			  lastToken = token;
			}
		  }
		};

		AdvancedOptimizer.prototype.reduceNonAdjacent = function (tokens) {
		  var candidates = {};
		  var repeated = [];

		  for (var i = tokens.length - 1; i >= 0; i--) {
			var token = tokens[i];

			if (token[0] != 'selector')
			  continue;
			if (token[2].length === 0)
			  continue;

			var selectorAsString = stringifySelectors(token[1]);
			var isComplexAndNotSpecial = token[1].length > 1 && !this.isSpecial(selectorAsString);
			var selectors = isComplexAndNotSpecial ?
			  [selectorAsString].concat(token[1]) :
			  [selectorAsString];

			for (var j = 0, m = selectors.length; j < m; j++) {
			  var selector = selectors[j];

			  if (!candidates[selector])
				candidates[selector] = [];
			  else
				repeated.push(selector);

			  candidates[selector].push({
				where: i,
				list: token[1],
				isPartial: isComplexAndNotSpecial && j > 0,
				isComplex: isComplexAndNotSpecial && j === 0
			  });
			}
		  }

		  this.reduceSimpleNonAdjacentCases(tokens, repeated, candidates);
		  this.reduceComplexNonAdjacentCases(tokens, candidates);
		};

		AdvancedOptimizer.prototype.reduceSimpleNonAdjacentCases = function (tokens, repeated, candidates) {
		  function filterOut(idx, bodies) {
			return data[idx].isPartial && bodies.length === 0;
		  }

		  function reduceBody(token, newBody, processedCount, tokenIdx) {
			if (!data[processedCount - tokenIdx - 1].isPartial)
			  token[2] = newBody;
		  }

		  for (var i = 0, l = repeated.length; i < l; i++) {
			var selector = repeated[i];
			var data = candidates[selector];

			this.reduceSelector(tokens, selector, data, {
			  filterOut: filterOut,
			  callback: reduceBody
			});
		  }
		};

		AdvancedOptimizer.prototype.reduceComplexNonAdjacentCases = function (tokens, candidates) {
		  var localContext = {};

		  function filterOut(idx) {
			return localContext.data[idx].where < localContext.intoPosition;
		  }

		  function collectReducedBodies(token, newBody, processedCount, tokenIdx) {
			if (tokenIdx === 0)
			  localContext.reducedBodies.push(newBody);
		  }

		  allSelectors:
		  for (var complexSelector in candidates) {
			var into = candidates[complexSelector];
			if (!into[0].isComplex)
			  continue;

			var intoPosition = into[into.length - 1].where;
			var intoToken = tokens[intoPosition];
			var reducedBodies = [];

			var selectors = this.isSpecial(complexSelector) ?
			  [complexSelector] :
			  into[0].list;

			localContext.intoPosition = intoPosition;
			localContext.reducedBodies = reducedBodies;

			for (var j = 0, m = selectors.length; j < m; j++) {
			  var selector = selectors[j];
			  var data = candidates[selector];

			  if (data.length < 2)
				continue allSelectors;

			  localContext.data = data;

			  this.reduceSelector(tokens, selector, data, {
				filterOut: filterOut,
				callback: collectReducedBodies
			  });

			  if (stringifyBody(reducedBodies[reducedBodies.length - 1]) != stringifyBody(reducedBodies[0]))
				continue allSelectors;
			}

			intoToken[2] = reducedBodies[0];
		  }
		};

		AdvancedOptimizer.prototype.reduceSelector = function (tokens, selector, data, options) {
		  var bodies = [];
		  var bodiesAsList = [];
		  var joinsAt = [];
		  var processedTokens = [];

		  for (var j = data.length - 1, m = 0; j >= 0; j--) {
			if (options.filterOut(j, bodies))
			  continue;

			var where = data[j].where;
			var token = tokens[where];

			bodies = bodies.concat(token[2]);
			bodiesAsList.push(token[2]);
			processedTokens.push(where);
		  }

		  for (j = 0, m = bodiesAsList.length; j < m; j++) {
			if (bodiesAsList[j].length > 0)
			  joinsAt.push((joinsAt[j - 1] || 0) + bodiesAsList[j].length);
		  }

		  optimizeProperties(selector, bodies, joinsAt, false, this.options, this.validator);

		  var processedCount = processedTokens.length;
		  var propertyIdx = bodies.length - 1;
		  var tokenIdx = processedCount - 1;

		  while (tokenIdx >= 0) {
			 if ((tokenIdx === 0 || (bodies[propertyIdx] && bodiesAsList[tokenIdx].indexOf(bodies[propertyIdx]) > -1)) && propertyIdx > -1) {
			  propertyIdx--;
			  continue;
			}

			var newBody = bodies.splice(propertyIdx + 1);
			options.callback(tokens[processedTokens[tokenIdx]], newBody, processedCount, tokenIdx);

			tokenIdx--;
		  }
		};

		AdvancedOptimizer.prototype.mergeNonAdjacentBySelector = function (tokens) {
		  var allSelectors = {};
		  var repeatedSelectors = [];
		  var i;

		  for (i = tokens.length - 1; i >= 0; i--) {
			if (tokens[i][0] != 'selector')
			  continue;
			if (tokens[i][2].length === 0)
			  continue;

			var selector = stringifySelectors(tokens[i][1]);
			allSelectors[selector] = [i].concat(allSelectors[selector] || []);

			if (allSelectors[selector].length == 2)
			  repeatedSelectors.push(selector);
		  }

		  for (i = repeatedSelectors.length - 1; i >= 0; i--) {
			var positions = allSelectors[repeatedSelectors[i]];

			selectorIterator:
			for (var j = positions.length - 1; j > 0; j--) {
			  var positionOne = positions[j - 1];
			  var tokenOne = tokens[positionOne];
			  var positionTwo = positions[j];
			  var tokenTwo = tokens[positionTwo];

			  directionIterator:
			  for (var direction = 1; direction >= -1; direction -= 2) {
				var topToBottom = direction == 1;
				var from = topToBottom ? positionOne + 1 : positionTwo - 1;
				var to = topToBottom ? positionTwo : positionOne;
				var delta = topToBottom ? 1 : -1;
				var moved = topToBottom ? tokenOne : tokenTwo;
				var target = topToBottom ? tokenTwo : tokenOne;
				var movedProperties = extractProperties(moved);
				var joinAt;

				while (from != to) {
				  var traversedProperties = extractProperties(tokens[from]);
				  from += delta;

				  // traversed then moved as we move selectors towards the start
				  var reorderable = topToBottom ?
					canReorder(movedProperties, traversedProperties) :
					canReorder(traversedProperties, movedProperties);

				  if (!reorderable && !topToBottom)
					continue selectorIterator;
				  if (!reorderable && topToBottom)
					continue directionIterator;
				}

				if (topToBottom) {
				  joinAt = [moved[2].length];
				  Array.prototype.push.apply(moved[2], target[2]);
				  target[2] = moved[2];
				} else {
				  joinAt = [target[2].length];
				  Array.prototype.push.apply(target[2], moved[2]);
				}

				optimizeProperties(target[1], target[2], joinAt, true, this.options, this.validator);
				moved[2] = [];
			  }
			}
		  }
		};

		AdvancedOptimizer.prototype.mergeNonAdjacentByBody = function (tokens) {
		  var candidates = {};
		  var adjacentSpace = this.options.compatibility.selectors.adjacentSpace;

		  for (var i = tokens.length - 1; i >= 0; i--) {
			var token = tokens[i];
			if (token[0] != 'selector')
			  continue;

			if (token[2].length > 0 && unsafeSelector(stringifySelectors(token[1])))
			  candidates = {};

			var oldToken = candidates[stringifyBody(token[2])];
			if (oldToken && !this.isSpecial(stringifySelectors(token[1])) && !this.isSpecial(stringifySelectors(oldToken[1]))) {
			  token[1] = CleanUp.selectors(oldToken[1].concat(token[1]), false, adjacentSpace);

			  oldToken[2] = [];
			  candidates[stringifyBody(token[2])] = null;
			}

			candidates[stringifyBody(token[2])] = token;
		  }
		};

		AdvancedOptimizer.prototype.restructure = function (tokens) {
		  var movableTokens = {};
		  var movedProperties = [];
		  var multiPropertyMoveCache = {};
		  var movedToBeDropped = [];
		  var self = this;
		  var maxCombinationsLevel = 2;
		  var ID_JOIN_CHARACTER = '%';

		  function sendToMultiPropertyMoveCache(position, movedProperty, allFits) {
			for (var i = allFits.length - 1; i >= 0; i--) {
			  var fit = allFits[i][0];
			  var id = addToCache(movedProperty, fit);

			  if (multiPropertyMoveCache[id].length > 1 && processMultiPropertyMove(position, multiPropertyMoveCache[id])) {
				removeAllMatchingFromCache(id);
				break;
			  }
			}
		  }

		  function addToCache(movedProperty, fit) {
			var id = cacheId(fit);
			multiPropertyMoveCache[id] = multiPropertyMoveCache[id] || [];
			multiPropertyMoveCache[id].push([movedProperty, fit]);
			return id;
		  }

		  function removeAllMatchingFromCache(matchId) {
			var matchSelectors = matchId.split(ID_JOIN_CHARACTER);
			var forRemoval = [];
			var i;

			for (var id in multiPropertyMoveCache) {
			  var selectors = id.split(ID_JOIN_CHARACTER);
			  for (i = selectors.length - 1; i >= 0; i--) {
				if (matchSelectors.indexOf(selectors[i]) > -1) {
				  forRemoval.push(id);
				  break;
				}
			  }
			}

			for (i = forRemoval.length - 1; i >= 0; i--) {
			  delete multiPropertyMoveCache[forRemoval[i]];
			}
		  }

		  function cacheId(cachedTokens) {
			var id = [];
			for (var i = 0, l = cachedTokens.length; i < l; i++) {
			  id.push(stringifySelectors(cachedTokens[i][1]));
			}
			return id.join(ID_JOIN_CHARACTER);
		  }

		  function tokensToMerge(sourceTokens) {
			var uniqueTokensWithBody = [];
			var mergeableTokens = [];

			for (var i = sourceTokens.length - 1; i >= 0; i--) {
			  if (self.isSpecial(stringifySelectors(sourceTokens[i][1])))
				continue;

			  mergeableTokens.unshift(sourceTokens[i]);
			  if (sourceTokens[i][2].length > 0 && uniqueTokensWithBody.indexOf(sourceTokens[i]) == -1)
				uniqueTokensWithBody.push(sourceTokens[i]);
			}

			return uniqueTokensWithBody.length > 1 ?
			  mergeableTokens :
			  [];
		  }

		  function shortenIfPossible(position, movedProperty) {
			var name = movedProperty[0];
			var value = movedProperty[1];
			var key = movedProperty[4];
			var valueSize = name.length + value.length + 1;
			var allSelectors = [];
			var qualifiedTokens = [];

			var mergeableTokens = tokensToMerge(movableTokens[key]);
			if (mergeableTokens.length < 2)
			  return;

			var allFits = findAllFits(mergeableTokens, valueSize, 1);
			var bestFit = allFits[0];
			if (bestFit[1] > 0)
			  return sendToMultiPropertyMoveCache(position, movedProperty, allFits);

			for (var i = bestFit[0].length - 1; i >=0; i--) {
			  allSelectors = bestFit[0][i][1].concat(allSelectors);
			  qualifiedTokens.unshift(bestFit[0][i]);
			}

			allSelectors = CleanUp.selectorDuplicates(allSelectors);
			dropAsNewTokenAt(position, [movedProperty], allSelectors, qualifiedTokens);
		  }

		  function fitSorter(fit1, fit2) {
			return fit1[1] > fit2[1];
		  }

		  function findAllFits(mergeableTokens, propertySize, propertiesCount) {
			var combinations = allCombinations(mergeableTokens, propertySize, propertiesCount, maxCombinationsLevel - 1);
			return combinations.sort(fitSorter);
		  }

		  function allCombinations(tokensVariant, propertySize, propertiesCount, level) {
			var differenceVariants = [[tokensVariant, sizeDifference(tokensVariant, propertySize, propertiesCount)]];
			if (tokensVariant.length > 2 && level > 0) {
			  for (var i = tokensVariant.length - 1; i >= 0; i--) {
				var subVariant = Array.prototype.slice.call(tokensVariant, 0);
				subVariant.splice(i, 1);
				differenceVariants = differenceVariants.concat(allCombinations(subVariant, propertySize, propertiesCount, level - 1));
			  }
			}

			return differenceVariants;
		  }

		  function sizeDifference(tokensVariant, propertySize, propertiesCount) {
			var allSelectorsSize = 0;
			for (var i = tokensVariant.length - 1; i >= 0; i--) {
			  allSelectorsSize += tokensVariant[i][2].length > propertiesCount ? stringifySelectors(tokensVariant[i][1]).length : -1;
			}
			return allSelectorsSize - (tokensVariant.length - 1) * propertySize + 1;
		  }

		  function dropAsNewTokenAt(position, properties, allSelectors, mergeableTokens) {
			var i, j, k, m;
			var allProperties = [];

			for (i = mergeableTokens.length - 1; i >= 0; i--) {
			  var mergeableToken = mergeableTokens[i];

			  for (j = mergeableToken[2].length - 1; j >= 0; j--) {
				var mergeableProperty = mergeableToken[2][j];

				for (k = 0, m = properties.length; k < m; k++) {
				  var property = properties[k];

				  var mergeablePropertyName = mergeableProperty[0][0];
				  var propertyName = property[0];
				  var propertyBody = property[4];
				  if (mergeablePropertyName == propertyName && stringifyBody([mergeableProperty]) == propertyBody) {
					mergeableToken[2].splice(j, 1);
					break;
				  }
				}
			  }
			}

			for (i = properties.length - 1; i >= 0; i--) {
			  allProperties.push(properties[i][3]);
			}

			var newToken = ['selector', allSelectors, allProperties];
			tokens.splice(position, 0, newToken);
		  }

		  function dropPropertiesAt(position, movedProperty) {
			var key = movedProperty[4];
			var toMove = movableTokens[key];

			if (toMove && toMove.length > 1) {
			  if (!shortenMultiMovesIfPossible(position, movedProperty))
				shortenIfPossible(position, movedProperty);
			}
		  }

		  function shortenMultiMovesIfPossible(position, movedProperty) {
			var candidates = [];
			var propertiesAndMergableTokens = [];
			var key = movedProperty[4];
			var j, k;

			var mergeableTokens = tokensToMerge(movableTokens[key]);
			if (mergeableTokens.length < 2)
			  return;

			movableLoop:
			for (var value in movableTokens) {
			  var tokensList = movableTokens[value];

			  for (j = mergeableTokens.length - 1; j >= 0; j--) {
				if (tokensList.indexOf(mergeableTokens[j]) == -1)
				  continue movableLoop;
			  }

			  candidates.push(value);
			}

			if (candidates.length < 2)
			  return false;

			for (j = candidates.length - 1; j >= 0; j--) {
			  for (k = movedProperties.length - 1; k >= 0; k--) {
				if (movedProperties[k][4] == candidates[j]) {
				  propertiesAndMergableTokens.unshift([movedProperties[k], mergeableTokens]);
				  break;
				}
			  }
			}

			return processMultiPropertyMove(position, propertiesAndMergableTokens);
		  }

		  function processMultiPropertyMove(position, propertiesAndMergableTokens) {
			var valueSize = 0;
			var properties = [];
			var property;

			for (var i = propertiesAndMergableTokens.length - 1; i >= 0; i--) {
			  property = propertiesAndMergableTokens[i][0];
			  var fullValue = property[4];
			  valueSize += fullValue.length + (i > 0 ? 1 : 0);

			  properties.push(property);
			}

			var mergeableTokens = propertiesAndMergableTokens[0][1];
			var bestFit = findAllFits(mergeableTokens, valueSize, properties.length)[0];
			if (bestFit[1] > 0)
			  return false;

			var allSelectors = [];
			var qualifiedTokens = [];
			for (i = bestFit[0].length - 1; i >= 0; i--) {
			  allSelectors = bestFit[0][i][1].concat(allSelectors);
			  qualifiedTokens.unshift(bestFit[0][i]);
			}

			allSelectors = CleanUp.selectorDuplicates(allSelectors);
			dropAsNewTokenAt(position, properties, allSelectors, qualifiedTokens);

			for (i = properties.length - 1; i >= 0; i--) {
			  property = properties[i];
			  var index = movedProperties.indexOf(property);

			  delete movableTokens[property[4]];

			  if (index > -1 && movedToBeDropped.indexOf(index) == -1)
				movedToBeDropped.push(index);
			}

			return true;
		  }

		  function boundToAnotherPropertyInCurrrentToken(property, movedProperty, token) {
			var propertyName = property[0];
			var movedPropertyName = movedProperty[0];
			if (propertyName != movedPropertyName)
			  return false;

			var key = movedProperty[4];
			var toMove = movableTokens[key];
			return toMove && toMove.indexOf(token) > -1;
		  }

		  for (var i = tokens.length - 1; i >= 0; i--) {
			var token = tokens[i];
			var isSelector;
			var j, k, m;

			if (token[0] == 'selector') {
			  isSelector = true;
			} else if (token[0] == 'block') {
			  isSelector = false;
			} else {
			  continue;
			}

			// We cache movedProperties.length as it may change in the loop
			var movedCount = movedProperties.length;

			var properties = extractProperties(token);
			movedToBeDropped = [];

			var unmovableInCurrentToken = [];
			for (j = properties.length - 1; j >= 0; j--) {
			  for (k = j - 1; k >= 0; k--) {
				if (!canReorderSingle(properties[j], properties[k])) {
				  unmovableInCurrentToken.push(j);
				  break;
				}
			  }
			}

			for (j = 0, m = properties.length; j < m; j++) {
			  var property = properties[j];
			  var movedSameProperty = false;

			  for (k = 0; k < movedCount; k++) {
				var movedProperty = movedProperties[k];

				if (movedToBeDropped.indexOf(k) == -1 && !canReorderSingle(property, movedProperty) && !boundToAnotherPropertyInCurrrentToken(property, movedProperty, token)) {
				  dropPropertiesAt(i + 1, movedProperty, token);

				  if (movedToBeDropped.indexOf(k) == -1) {
					movedToBeDropped.push(k);
					delete movableTokens[movedProperty[4]];
				  }
				}

				if (!movedSameProperty)
				  movedSameProperty = property[0] == movedProperty[0] && property[1] == movedProperty[1];
			  }

			  if (!isSelector || unmovableInCurrentToken.indexOf(j) > -1)
				continue;

			  var key = property[4];
			  movableTokens[key] = movableTokens[key] || [];
			  movableTokens[key].push(token);

			  if (!movedSameProperty)
				movedProperties.push(property);
			}

			movedToBeDropped = movedToBeDropped.sort(naturalSorter);
			for (j = 0, m = movedToBeDropped.length; j < m; j++) {
			  var dropAt = movedToBeDropped[j] - j;
			  movedProperties.splice(dropAt, 1);
			}
		  }

		  var position = tokens[0] && tokens[0][0] == 'at-rule' && tokens[0][1][0].indexOf('@charset') === 0 ? 1 : 0;
		  for (; position < tokens.length - 1; position++) {
			var isImportRule = tokens[position][0] === 'at-rule' && tokens[position][1][0].indexOf('@import') === 0;
			var isEscapedCommentSpecial = tokens[position][0] === 'text' && tokens[position][1][0].indexOf('__ESCAPED_COMMENT_SPECIAL') === 0;
			if (!(isImportRule || isEscapedCommentSpecial))
			  break;
		  }

		  for (i = 0; i < movedProperties.length; i++) {
			dropPropertiesAt(position, movedProperties[i]);
		  }
		};

		AdvancedOptimizer.prototype.removeDuplicateMediaQueries = function (tokens) {
		  var candidates = {};

		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];
			if (token[0] != 'block')
			  continue;

			var key = token[1][0] + '%' + stringifyAll(token[2]);
			var candidate = candidates[key];

			if (candidate)
			  candidate[2] = [];

			candidates[key] = token;
		  }
		};

		AdvancedOptimizer.prototype.mergeMediaQueries = function (tokens) {
		  var candidates = {};
		  var reduced = [];

		  for (var i = tokens.length - 1; i >= 0; i--) {
			var token = tokens[i];
			if (token[0] != 'block')
			  continue;

			var candidate = candidates[token[1][0]];
			if (!candidate) {
			  candidate = [];
			  candidates[token[1][0]] = candidate;
			}

			candidate.push(i);
		  }

		  for (var name in candidates) {
			var positions = candidates[name];

			positionLoop:
			for (var j = positions.length - 1; j > 0; j--) {
			  var source = tokens[positions[j]];
			  var target = tokens[positions[j - 1]];
			  var movedProperties = extractProperties(source);

			  for (var k = positions[j] + 1; k < positions[j - 1]; k++) {
				var traversedProperties = extractProperties(tokens[k]);

				// moved then traversed as we move @media towards the end
				if (!canReorder(movedProperties, traversedProperties))
				  continue positionLoop;
			  }

			  target[2] = source[2].concat(target[2]);
			  source[2] = [];

			  reduced.push(target);
			}
		  }

		  return reduced;
		};

		AdvancedOptimizer.prototype.removeEmpty = function (tokens) {
		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];
			var isEmpty = false;

			switch (token[0]) {
			  case 'selector':
				isEmpty = token[1].length === 0 || token[2].length === 0;
				break;
			  case 'block':
				this.removeEmpty(token[2]);
				isEmpty = token[2].length === 0;
			}

			if (isEmpty) {
			  tokens.splice(i, 1);
			  i--;
			  l--;
			}
		  }
		};

		function recursivelyOptimizeProperties(tokens, options, validator) {
		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];

			switch (token[0]) {
			  case 'selector':
				optimizeProperties(token[1], token[2], false, true, options, validator);
				break;
			  case 'block':
				recursivelyOptimizeProperties(token[2], options, validator);
			}
		  }
		}

		AdvancedOptimizer.prototype.optimize = function (tokens) {
		  var self = this;

		  function _optimize(tokens, withRestructuring) {
			tokens.forEach(function (token) {
			  if (token[0] == 'block') {
				var isKeyframes = /@(-moz-|-o-|-webkit-)?keyframes/.test(token[1][0]);
				_optimize(token[2], !isKeyframes);
			  }
			});

			recursivelyOptimizeProperties(tokens, self.options, self.validator);

			self.removeDuplicates(tokens);
			self.mergeAdjacent(tokens);
			self.reduceNonAdjacent(tokens);

			self.mergeNonAdjacentBySelector(tokens);
			self.mergeNonAdjacentByBody(tokens);

			if (self.options.restructuring && withRestructuring) {
			  self.restructure(tokens);
			  self.mergeAdjacent(tokens);
			}

			if (self.options.mediaMerging) {
			  self.removeDuplicateMediaQueries(tokens);
			  var reduced = self.mergeMediaQueries(tokens);
			  for (var i = reduced.length - 1; i >= 0; i--) {
				_optimize(reduced[i][2]);
			  }
			}

			self.removeEmpty(tokens);
		  }

		  _optimize(tokens, true);
		};
		
		return AdvancedOptimizer;
	};
	//#endregion

	//#region URL: /selectors/optimizers/clean-up
	modules['/selectors/optimizers/clean-up'] = function () {
		function removeWhitespace(match, value) {
		  return '[' + value.replace(/ /g, '') + ']';
		}

		function selectorSorter(s1, s2) {
		  return s1[0] > s2[0] ? 1 : -1;
		}

		var CleanUp = {
		  selectors: function (selectors, removeUnsupported, adjacentSpace) {
			var list = [];
			var repeated = [];

			for (var i = 0, l = selectors.length; i < l; i++) {
			  var selector = selectors[i];
			  var reduced = selector[0]
				.replace(/\s+/g, ' ')
				.replace(/ ?, ?/g, ',')
				.replace(/\s*([>\+\~])\s*/g, '$1')
				.trim();

			  if (adjacentSpace && reduced.indexOf('nav') > 0)
				reduced = reduced.replace(/\+nav(\S|$)/, '+ nav$1');

			  if (removeUnsupported && (reduced.indexOf('*+html ') != -1 || reduced.indexOf('*:first-child+html ') != -1))
				continue;

			  if (reduced.indexOf('*') > -1) {
				reduced = reduced
				  .replace(/\*([:#\.\[])/g, '$1')
				  .replace(/^(\:first\-child)?\+html/, '*$1+html');
			  }

			  if (reduced.indexOf('[') > -1)
				reduced = reduced.replace(/\[([^\]]+)\]/g, removeWhitespace);

			  if (repeated.indexOf(reduced) == -1) {
				selector[0] = reduced;
				repeated.push(reduced);
				list.push(selector);
			  }
			}

			return list.sort(selectorSorter);
		  },

		  selectorDuplicates: function (selectors) {
			var list = [];
			var repeated = [];

			for (var i = 0, l = selectors.length; i < l; i++) {
			  var selector = selectors[i];

			  if (repeated.indexOf(selector[0]) == -1) {
				repeated.push(selector[0]);
				list.push(selector);
			  }
			}

			return list.sort(selectorSorter);
		  },

		  block: function (values) {
			values[0] = values[0]
			  .replace(/\s+/g, ' ')
			  .replace(/(,|:|\() /g, '$1')
			  .replace(/ ?\) ?/g, ')');
		  },

		  atRule: function (values) {
			values[0] = values[0]
			  .replace(/\s+/g, ' ')
			  .trim();
		  }
		};
		
		return CleanUp;
	};
	//#endregion

	//#region URL: /selectors/optimizers/simple
	modules['/selectors/optimizers/simple'] = function () {
		var CleanUp = require('/selectors/optimizers/clean-up');
		var Splitter = require('/utils/splitter');

		var RGB = require('/colors/rgb');
		var HSL = require('/colors/hsl');
		var HexNameShortener = require('/colors/hex-name-shortener');

		var DEFAULT_ROUNDING_PRECISION = 2;
		var CHARSET_TOKEN = '@charset';
		var CHARSET_REGEXP = new RegExp('^' + CHARSET_TOKEN, 'i');

		var FONT_NUMERAL_WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
		var FONT_NAME_WEIGHTS = ['normal', 'bold', 'bolder', 'lighter'];

		function SimpleOptimizer(options) {
		  this.options = options;

		  var units = ['px', 'em', 'ex', 'cm', 'mm', 'in', 'pt', 'pc', '%'];
		  if (options.compatibility.units.rem)
			units.push('rem');
		  options.unitsRegexp = new RegExp('(^|\\s|\\(|,)0(?:' + units.join('|') + ')', 'g');

		  options.precision = {};
		  options.precision.value = options.roundingPrecision === undefined ?
			DEFAULT_ROUNDING_PRECISION :
			options.roundingPrecision;
		  options.precision.multiplier = Math.pow(10, options.precision.value);
		  options.precision.regexp = new RegExp('(\\d*\\.\\d{' + (options.precision.value + 1) + ',})px', 'g');
		}

		var valueMinifiers = {
		  'background': function (value, index, total) {
			return index == 1 && total == 2 && (value == 'none' || value == 'transparent') ? '0 0' : value;
		  },
		  'font-weight': function (value) {
			if (value == 'normal')
			  return '400';
			else if (value == 'bold')
			  return '700';
			else
			  return value;
		  },
		  'outline': function (value, index, total) {
			return index == 1 && total == 2 && value == 'none' ? '0' : value;
		  }
		};

		function isNegative(property, idx) {
		  return property[idx] && property[idx][0][0] == '-' && parseFloat(property[idx][0]) < 0;
		}

		function zeroMinifier(name, value) {
		  if (value.indexOf('0') == -1)
			return value;

		  if (value.indexOf('-') > -1) {
			value = value
			  .replace(/([^\w\d\-]|^)\-0([^\.]|$)/g, '$10$2')
			  .replace(/([^\w\d\-]|^)\-0([^\.]|$)/g, '$10$2');
		  }

		  return value
			.replace(/(^|\s)0+([1-9])/g, '$1$2')
			.replace(/(^|\D)\.0+(\D|$)/g, '$10$2')
			.replace(/(^|\D)\.0+(\D|$)/g, '$10$2')
			.replace(/\.([1-9]*)0+(\D|$)/g, function(match, nonZeroPart, suffix) {
			  return (nonZeroPart.length > 0 ? '.' : '') + nonZeroPart + suffix;
			})
			.replace(/(^|\D)0\.(\d)/g, '$1.$2');
		}

		function zeroDegMinifier(_, value) {
		  if (value.indexOf('0deg') == -1)
			return value;

		  return value.replace(/\(0deg\)/g, '(0)');
		}

		function whitespaceMinifier(name, value) {
		  if (name.indexOf('filter') > -1 || value.indexOf(' ') == -1)
			return value;

		  value = value.replace(/\s+/g, ' ');

		  if (value.indexOf('calc') > -1)
			value = value.replace(/\) ?\/ ?/g, ')/ ');

		  return value
			.replace(/\( /g, '(')
			.replace(/ \)/g, ')')
			.replace(/, /g, ',');
		}

		function precisionMinifier(_, value, precisionOptions) {
		  if (precisionOptions.value === -1 || value.indexOf('.') === -1)
			return value;

		  return value
			.replace(precisionOptions.regexp, function(match, number) {
			  return Math.round(parseFloat(number) * precisionOptions.multiplier) / precisionOptions.multiplier + 'px';
			})
			.replace(/(\d)\.($|\D)/g, '$1$2');
		}

		function unitMinifier(_, value, unitsRegexp) {
		  if (/^(?:\-moz\-calc|\-webkit\-calc|calc)\(/.test(value))
			return value;

		  return value.replace(unitsRegexp, '$1' + '0');
		}

		function multipleZerosMinifier(property) {
		  if (property.length == 5 && property[1][0] === '0' && property[2][0] === '0' && property[3][0] === '0' && property[4][0] === '0') {
			if (property[0][0].indexOf('box-shadow') > -1)
			  property.splice(3);
			else
			  property.splice(2);
		  }
		}

		function colorMininifier(_, value, compatibility) {
		  if (value.indexOf('#') === -1 && value.indexOf('rgb') == -1 && value.indexOf('hsl') == -1)
			return HexNameShortener.shorten(value);

		  value = value
			.replace(/rgb\((\-?\d+),(\-?\d+),(\-?\d+)\)/g, function (match, red, green, blue) {
			  return new RGB(red, green, blue).toHex();
			})
			.replace(/hsl\((-?\d+),(-?\d+)%?,(-?\d+)%?\)/g, function (match, hue, saturation, lightness) {
			  return new HSL(hue, saturation, lightness).toHex();
			})
			.replace(/(^|[^='"])#([0-9a-f]{6})/gi, function (match, prefix, color) {
			  if (color[0] == color[1] && color[2] == color[3] && color[4] == color[5])
				return prefix + '#' + color[0] + color[2] + color[4];
			  else
				return prefix + '#' + color;
			})
			.replace(/(rgb|rgba|hsl|hsla)\(([^\)]+)\)/g, function(match, colorFunction, colorDef) {
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

		  if (compatibility.colors.opacity) {
			value = value.replace(/(?:rgba|hsla)\(0,0%?,0%?,0\)/g, function (match) {
			  if (new Splitter(',').split(value).pop().indexOf('gradient(') > -1)
				return match;

			  return 'transparent';
			});
		  }

		  return HexNameShortener.shorten(value);
		}

		function minifyBorderRadius(property) {
		  if (property.length == 4 && property[2][0] == '/' && property[1][0] == property[3][0])
			property.splice(2);
		  else if (property.length == 6 && property[3][0] == '/' && property[1][0] == property[4][0] && property[2][0] == property[5][0])
			property.splice(3);
		  else if (property.length == 8 && property[4][0] == '/' && property[1][0] == property[5][0] && property[2][0] == property[6][0] && property[3][0] == property[7][0])
			property.splice(4);
		  else if (property.length == 10 && property[5][0] == '/' && property[1][0] == property[6][0] && property[2][0] == property[7][0] && property[3][0] == property[8][0] && property[4][0] == property[9][0])
			property.splice(5);
		}

		function minifyFilter(property) {
		  if (property.length < 3) {
			property[1][0] = property[1][0].replace(/progid:DXImageTransform\.Microsoft\.(Alpha|Chroma)(\W)/, function (match, filter, suffix) {
			  return filter.toLowerCase() + suffix;
			});
		  }

		  property[1][0] = property[1][0]
			.replace(/,(\S)/g, ', $1')
			.replace(/ ?= ?/g, '=');
		}

		function minifyFont(property) {
		  var hasNumeral = FONT_NUMERAL_WEIGHTS.indexOf(property[1][0]) > -1 ||
			property[2] && FONT_NUMERAL_WEIGHTS.indexOf(property[2][0]) > -1 ||
			property[3] && FONT_NUMERAL_WEIGHTS.indexOf(property[3][0]) > -1;

		  if (hasNumeral)
			return;

		  if (property[2] == '/')
			return;

		  var normalCount = 0;
		  if (property[1][0] == 'normal')
			normalCount++;
		  if (property[2] && property[2][0] == 'normal')
			normalCount++;
		  if (property[3] && property[3][0] == 'normal')
			normalCount++;

		  if (normalCount > 1)
			return;

		  var toOptimize;
		  if (FONT_NAME_WEIGHTS.indexOf(property[1][0]) > -1)
			toOptimize = 1;
		  else if (property[2] && FONT_NAME_WEIGHTS.indexOf(property[2][0]) > -1)
			toOptimize = 2;
		  else if (property[3] && FONT_NAME_WEIGHTS.indexOf(property[3][0]) > -1)
			toOptimize = 3;

		  if (toOptimize)
			property[toOptimize][0] = valueMinifiers['font-weight'](property[toOptimize][0]);
		}

		function optimizeBody(properties, options) {
		  var property, name, value, unused;

		  for (var i = 0, l = properties.length; i < l; i++) {
			unused = false;
			property = properties[i];

			// FIXME: the check should be gone with #407
			if (typeof property == 'string' && property.indexOf('__ESCAPED_') === 0)
			  continue;

			name = property[0][0];

			var hackType = property[0][2];
			if (hackType) {
			  if ((hackType == 'star' || hackType == 'underscore') && !options.compatibility.properties.iePrefixHack || hackType == 'suffix' && !options.compatibility.properties.ieSuffixHack)
				unused = true;
			}

			if (name.indexOf('padding') === 0 && (isNegative(property, 1) || isNegative(property, 2) || isNegative(property, 3) || isNegative(property, 4)))
			  unused = true;

			if (unused) {
			  properties.splice(i, 1);
			  i--;
			  l--;
			  continue;
			}

			for (var j = 1, m = property.length; j < m; j++) {
			  value = property[j][0];

			  if (valueMinifiers[name])
				value = valueMinifiers[name](value, j, m);

			  value = whitespaceMinifier(name, value);
			  value = precisionMinifier(name, value, options.precision);
			  value = zeroMinifier(name, value);
			  if (options.compatibility.properties.zeroUnits) {
				value = zeroDegMinifier(name, value);
				value = unitMinifier(name, value, options.unitsRegexp);
			  }
			  value = colorMininifier(name, value, options.compatibility);

			  property[j][0] = value;
			}

			multipleZerosMinifier(property);

			if (name.indexOf('border') === 0 && name.indexOf('radius') > 0)
			  minifyBorderRadius(property);
			else if (name == 'filter')
			  minifyFilter(property);
			else if (name == 'font')
			  minifyFont(property);
		  }
		}

		SimpleOptimizer.prototype.optimize = function(tokens) {
		  var self = this;
		  var hasCharset = false;
		  var options = this.options;
		  var ie7Hack = options.compatibility.selectors.ie7Hack;
		  var adjacentSpace = options.compatibility.selectors.adjacentSpace;

		  function _cleanupCharsets(tokens) {
			for (var i = 0, l = tokens.length; i < l; i++) {
			  var token = tokens[i];

			  if (token[0] != 'at-rule')
				continue;

			  if (CHARSET_REGEXP.test(token[1][0])) {
				if (hasCharset || token[1][0].indexOf(CHARSET_TOKEN) == -1) {
				  tokens.splice(i, 1);
				  i--;
				  l--;
				} else {
				  hasCharset = true;
				  tokens.splice(i, 1);
				  tokens.unshift(['at-rule', [token[1][0].replace(CHARSET_REGEXP, CHARSET_TOKEN)]]);
				}
			  }
			}
		  }

		  function _optimize(tokens) {
			var mayHaveCharset = false;

			for (var i = 0, l = tokens.length; i < l; i++) {
			  var token = tokens[i];

			  switch (token[0]) {
				case 'selector':
				  token[1] = CleanUp.selectors(token[1], !ie7Hack, adjacentSpace);
				  optimizeBody(token[2], self.options);
				  break;
				case 'block':
				  CleanUp.block(token[1]);
				  _optimize(token[2]);
				  break;
				case 'flat-block':
				  CleanUp.block(token[1]);
				  optimizeBody(token[2], self.options);
				  break;
				case 'at-rule':
				  CleanUp.atRule(token[1]);
				  mayHaveCharset = true;
			  }

			  if (token[1].length === 0 || (token[2] && token[2].length === 0)) {
				tokens.splice(i, 1);
				i--;
				l--;
			  }
			}

			if (mayHaveCharset)
			  _cleanupCharsets(tokens);
		  }

		  _optimize(tokens);
		};
		
		return SimpleOptimizer;
	};
	//#endregion
	
	//#region URL: /selectors/reorderable
	modules['/selectors/reorderable'] = function () {
		// TODO: it'd be great to merge it with the other canReorder functionality

		var FLEX_PROPERTIES = /align\-items|box\-align|box\-pack|flex|justify/;

		function canReorder(left, right) {
		  for (var i = right.length - 1; i >= 0; i--) {
			for (var j = left.length - 1; j >= 0; j--) {
			  if (!canReorderSingle(left[j], right[i]))
				return false;
			}
		  }

		  return true;
		}

		function canReorderSingle(left, right) {
		  var leftName = left[0];
		  var leftValue = left[1];
		  var leftNameRoot = left[2];
		  var leftSelector = left[5];
		  var leftInSimpleSelector = left[6];
		  var rightName = right[0];
		  var rightValue = right[1];
		  var rightNameRoot = right[2];
		  var rightSelector = right[5];
		  var rightInSimpleSelector = right[6];

		  if (leftName == 'font' && rightName == 'line-height' || rightName == 'font' && leftName == 'line-height')
			return false;
		  if (FLEX_PROPERTIES.test(leftName) && FLEX_PROPERTIES.test(rightName))
			return false;
		  if (leftNameRoot == rightNameRoot && unprefixed(leftName) == unprefixed(rightName) && (vendorPrefixed(leftName) ^ vendorPrefixed(rightName)))
			return false;
		  if (leftNameRoot != rightNameRoot)
			return true;
		  if (leftName == rightName && leftNameRoot == rightNameRoot && (leftValue == rightValue || withDifferentVendorPrefix(leftValue, rightValue)))
			return true;
		  if (leftName != rightName && leftNameRoot == rightNameRoot && leftName != leftNameRoot && rightName != rightNameRoot)
			return true;
		  if (leftName != rightName && leftNameRoot == rightNameRoot && leftValue == rightValue)
			return true;
		  if (rightInSimpleSelector && leftInSimpleSelector && selectorsDoNotOverlap(rightSelector, leftSelector))
			return true;

		  return false;
		}

		function vendorPrefixed(name) {
		  return /^\-(?:moz|webkit|ms|o)\-/.test(name);
		}

		function unprefixed(name) {
		  return name.replace(/^\-(?:moz|webkit|ms|o)\-/, '');
		}

		function withDifferentVendorPrefix(value1, value2) {
		  return vendorPrefixed(value1) && vendorPrefixed(value2) && value1.split('-')[1] != value2.split('-')[2];
		}

		function selectorsDoNotOverlap(s1, s2) {
		  for (var i = 0, l = s1.length; i < l; i++) {
			for (var j = 0, m = s2.length; j < m; j++) {
			  if (s1[i][0] == s2[j][0])
				return false;
			}
		  }

		  return true;
		}

		var exports = {
		  canReorder: canReorder,
		  canReorderSingle: canReorderSingle
		};

		return exports;
	};
	//#endregion

	//#region URL: /selectors/tokenizer
	modules['/selectors/tokenizer'] = function () {
		var Chunker = require('/utils/chunker');
		var Extract = require('/utils/extractors');
//		var track = require('/utils/source-maps');

//		var path = require('path');

		var flatBlock = /(^@(font\-face|page|\-ms\-viewport|\-o\-viewport|viewport|counter\-style)|\\@.+?)/;

		function Tokenizer(minifyContext/*, sourceMaps*/) {
		  this.minifyContext = minifyContext;
//		  this.sourceMaps = sourceMaps;
		}

		Tokenizer.prototype.toTokens = function (data) {
		  data = data.replace(/\r\n/g, '\n');

		  var chunker = new Chunker(data, '}', 128);
		  if (chunker.isEmpty())
			return [];

		  var context = {
			cursor: 0,
			mode: 'top',
			chunker: chunker,
			chunk: chunker.next(),
			outer: this.minifyContext,
			track: /*this.sourceMaps ?
			  function (data, snapshotMetadata, fallbacks) { return [[track(data, context, snapshotMetadata, fallbacks)]]; } :
			  */function () { return []; },
//			sourceMaps: this.sourceMaps,
			state: [],
			line: 1,
			column: 0,
			source: undefined
		  };

//		  if (this.minifyContext.options.explicitTarget)
//			context.resolvePath = relativePathResolver(context);

		  return tokenize(context);
		};

//		function relativePathResolver(context) {
//		  var rebaseTo = path.relative(context.outer.options.root, context.outer.options.target);
//
//		  return function (relativeTo, sourcePath) {
//			return relativeTo != sourcePath ?
//			  path.normalize(path.join(path.relative(rebaseTo, path.dirname(relativeTo)), sourcePath)) :
//			  sourcePath;
//		  };
//		}

		function whatsNext(context) {
		  var mode = context.mode;
		  var chunk = context.chunk;
		  var closest;

		  if (chunk.length == context.cursor) {
			if (context.chunker.isEmpty())
			  return null;

			context.chunk = chunk = context.chunker.next();
			context.cursor = 0;
		  }

		  if (mode == 'body') {
			closest = chunk.indexOf('}', context.cursor);
			return closest > -1 ?
			  [closest, 'bodyEnd'] :
			  null;
		  }

		  var nextSpecial = chunk.indexOf('@', context.cursor);
		  var nextEscape = chunk.indexOf('__ESCAPED_', context.cursor);
		  var nextBodyStart = chunk.indexOf('{', context.cursor);
		  var nextBodyEnd = chunk.indexOf('}', context.cursor);

		  if (nextEscape > -1 && /\S/.test(chunk.substring(context.cursor, nextEscape)))
			nextEscape = -1;

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
		}

		function tokenize(context) {
		  var chunk = context.chunk;
		  var tokenized = [];
		  var newToken;
		  var value;

		  while (true) {
			var next = whatsNext(context);
			if (!next) {
			  var whatsLeft = context.chunk.substring(context.cursor);
			  if (whatsLeft.trim().length > 0) {
				if (context.mode == 'body') {
				  context.outer.warnings.push('Missing \'}\' after \'' + whatsLeft + '\'. Ignoring.');
				} else {
				  tokenized.push(['text', [whatsLeft]]);
				}
				context.cursor += whatsLeft.length;
			  }
			  break;
			}

			var nextSpecial = next[0];
			var what = next[1];
			var nextEnd;
			var oldMode;

			chunk = context.chunk;

			if (context.cursor != nextSpecial && what != 'bodyEnd') {
			  var spacing = chunk.substring(context.cursor, nextSpecial);
			  var leadingWhitespace = /^\s+/.exec(spacing);

			  if (leadingWhitespace) {
				context.cursor += leadingWhitespace[0].length;
				context.track(leadingWhitespace[0]);
			  }
			}

			if (what == 'special') {
			  var firstOpenBraceAt = chunk.indexOf('{', nextSpecial);
			  var firstSemicolonAt = chunk.indexOf(';', nextSpecial);
			  var isSingle = firstSemicolonAt > -1 && (firstOpenBraceAt == -1 || firstSemicolonAt < firstOpenBraceAt);
			  var isBroken = firstOpenBraceAt == -1 && firstSemicolonAt == -1;
			  if (isBroken) {
				context.outer.warnings.push('Broken declaration: \'' + chunk.substring(context.cursor) +  '\'.');
				context.cursor = chunk.length;
			  } else if (isSingle) {
				nextEnd = chunk.indexOf(';', nextSpecial + 1);
				value = chunk.substring(context.cursor, nextEnd + 1);

				tokenized.push([
				  'at-rule',
				  [value].concat(context.track(value, true))
				]);

				context.track(';');
				context.cursor = nextEnd + 1;
			  } else {
				nextEnd = chunk.indexOf('{', nextSpecial + 1);
				value = chunk.substring(context.cursor, nextEnd);

				var trimmedValue = value.trim();
				var isFlat = flatBlock.test(trimmedValue);
				oldMode = context.mode;
				context.cursor = nextEnd + 1;
				context.mode = isFlat ? 'body' : 'block';

				newToken = [
				  isFlat ? 'flat-block' : 'block'
				];

				newToken.push([trimmedValue].concat(context.track(value, true)));
				context.track('{');
				newToken.push(tokenize(context));

				if (typeof newToken[2] == 'string')
				  newToken[2] = Extract.properties(newToken[2], [[trimmedValue]], context);

				context.mode = oldMode;
				context.track('}');

				tokenized.push(newToken);
			  }
			} else if (what == 'escape') {
			  nextEnd = chunk.indexOf('__', nextSpecial + 1);
			  var escaped = chunk.substring(context.cursor, nextEnd + 2);
			  var isStartSourceMarker = !!context.outer.sourceTracker.nextStart(escaped);
			  var isEndSourceMarker = !!context.outer.sourceTracker.nextEnd(escaped);

			  if (isStartSourceMarker) {
				context.track(escaped);
				context.state.push({
				  source: context.source,
				  line: context.line,
				  column: context.column
				});
				context.source = context.outer.sourceTracker.nextStart(escaped).filename;
				context.line = 1;
				context.column = 0;
			  } else if (isEndSourceMarker) {
				var oldState = context.state.pop();
				context.source = oldState.source;
				context.line = oldState.line;
				context.column = oldState.column;
				context.track(escaped);
			  } else {
				if (escaped.indexOf('__ESCAPED_COMMENT_SPECIAL') === 0)
				  tokenized.push(['text', [escaped]]);

				context.track(escaped);
			  }

			  context.cursor = nextEnd + 2;
			} else if (what == 'bodyStart') {
			  var selectors = Extract.selectors(chunk.substring(context.cursor, nextSpecial), context);

			  oldMode = context.mode;
			  context.cursor = nextSpecial + 1;
			  context.mode = 'body';

			  var body = Extract.properties(tokenize(context), selectors, context);

			  context.track('{');
			  context.mode = oldMode;

			  tokenized.push([
				'selector',
				selectors,
				body
			  ]);
			} else if (what == 'bodyEnd') {
			  // extra closing brace at the top level can be safely ignored
			  if (context.mode == 'top') {
				var at = context.cursor;
				var warning = chunk[context.cursor] == '}' ?
				  'Unexpected \'}\' in \'' + chunk.substring(at - 20, at + 20) + '\'. Ignoring.' :
				  'Unexpected content: \'' + chunk.substring(at, nextSpecial + 1) + '\'. Ignoring.';

				context.outer.warnings.push(warning);
				context.cursor = nextSpecial + 1;
				continue;
			  }

			  if (context.mode == 'block')
				context.track(chunk.substring(context.cursor, nextSpecial));
			  if (context.mode != 'block')
				tokenized = chunk.substring(context.cursor, nextSpecial);

			  context.cursor = nextSpecial + 1;

			  break;
			}
		  }

		  return tokenized;
		}
		
		return Tokenizer;
	};
	//#endregion
	
	//#region URL: /stringifier/helpers
	modules['/stringifier/helpers'] = function () {
		var lineBreak = require('os').EOL;

		var STAR_HACK = '*';
		var SUFFIX_HACK = '\\9';
		var UNDERSCORE_HACK = '_';

		function hasMoreProperties(tokens, index) {
		  for (var i = index, l = tokens.length; i < l; i++) {
			if (typeof tokens[i] != 'string')
			  return true;
		  }

		  return false;
		}

		function afterClosingBrace(token, valueIndex) {
		  return token[valueIndex][0][token[valueIndex][0].length - 1] == ')' || token[valueIndex][0].indexOf('__ESCAPED_URL_CLEAN_CSS') === 0;
		}

		function afterCalc(token, valueIndex) {
		  return token[valueIndex][0].indexOf('calc(') === 0;
		}

		function afterComma(token, valueIndex) {
		  return token[valueIndex][0] == ',';
		}

		function afterSlash(token, valueIndex) {
		  return token[valueIndex][0] == '/';
		}

		function beforeComma(token, valueIndex) {
		  return token[valueIndex + 1] && token[valueIndex + 1][0] == ',';
		}

		function beforeSlash(token, valueIndex) {
		  return token[valueIndex + 1] && token[valueIndex + 1][0] == '/';
		}

		function inFilter(token) {
		  return token[0][0] == 'filter' || token[0][0] == '-ms-filter';
		}

		function inSpecialContext(token, valueIndex, context) {
		  return !context.spaceAfterClosingBrace && afterClosingBrace(token, valueIndex) && !afterCalc(token, valueIndex) ||
			beforeSlash(token, valueIndex) ||
			afterSlash(token, valueIndex) ||
			beforeComma(token, valueIndex) ||
			afterComma(token, valueIndex);
		}

		function storePrefixHack(name, context) {
		  var hackType = name[2];
		  if (hackType == 'underscore')
			context.store(UNDERSCORE_HACK, context);
		  else if (hackType == 'star')
			context.store(STAR_HACK, context);
		}

		function selectors(tokens, context) {
		  var store = context.store;

		  for (var i = 0, l = tokens.length; i < l; i++) {
			store(tokens[i], context);

			if (i < l - 1)
			  store(',', context);
		  }
		}

		function body(tokens, context) {
		  for (var i = 0, l = tokens.length; i < l; i++) {
			property(tokens, i, i == l - 1, context);
		  }
		}

		function property(tokens, position, isLast, context) {
		  var store = context.store;
		  var token = tokens[position];

		  if (typeof token == 'string') {
			store(token, context);
		  } else {
			storePrefixHack(token[0], context);
			store(token[0], context);
			store(':', context);
			value(tokens, position, isLast, context);
		  }
		}

		function value(tokens, position, isLast, context) {
		  var store = context.store;
		  var token = tokens[position];
		  var isImportant = token[0][1];
		  var hackType = token[0][2];

		  for (var j = 1, m = token.length; j < m; j++) {
			store(token[j], context);

			if (j == m - 1 && hackType == 'suffix')
			  store(SUFFIX_HACK, context);
			if (j == m - 1 && isImportant)
			  store('!important', context);

			if (j < m - 1 && (inFilter(token) || !inSpecialContext(token, j, context))) {
			  store(' ', context);
			} else if (j == m - 1 && !isLast && hasMoreProperties(tokens, position + 1)) {
			  store(';', context);
			}
		  }
		}

		function all(tokens, context) {
		  var joinCharacter = context.keepBreaks ? lineBreak : '';
		  var store = context.store;

		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];

			switch (token[0]) {
			  case 'at-rule':
			  case 'text':
				store(token[1][0], context);
				store(joinCharacter, context);
				break;
			  case 'block':
				selectors([token[1]], context);
				store('{', context);
				all(token[2], context);
				store('}', context);
				store(joinCharacter, context);
				break;
			  case 'flat-block':
				selectors([token[1]], context);
				store('{', context);
				body(token[2], context);
				store('}', context);
				store(joinCharacter, context);
				break;
			  default:
				selectors(token[1], context);
				store('{', context);
				body(token[2], context);
				store('}', context);
				store(joinCharacter, context);
			}
		  }
		}

		var exports = {
		  all: all,
		  body: body,
		  property: property,
		  selectors: selectors,
		  value: value
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /stringifier/one-time
	modules['/stringifier/one-time'] = function () {
		var helpers = require('/stringifier/helpers');

		function store(token, context) {
		  context.output.push(typeof token == 'string' ? token : token[0]);
		}

		function context() {
		  return {
			output: [],
			store: store
		  };
		}

		function all(tokens) {
		  var fakeContext = context();
		  helpers.all(tokens, fakeContext);
		  return fakeContext.output.join('');
		}

		function body(tokens) {
		  var fakeContext = context();
		  helpers.body(tokens, fakeContext);
		  return fakeContext.output.join('');
		}

		function property(tokens, position) {
		  var fakeContext = context();
		  helpers.property(tokens, position, true, fakeContext);
		  return fakeContext.output.join('');
		}

		function selectors(tokens) {
		  var fakeContext = context();
		  helpers.selectors(tokens, fakeContext);
		  return fakeContext.output.join('');
		}

		function value(tokens, position) {
		  var fakeContext = context();
		  helpers.value(tokens, position, true, fakeContext);
		  return fakeContext.output.join('');
		}

		var exports = {
		  all: all,
		  body: body,
		  property: property,
		  selectors: selectors,
		  value: value
		};

		return exports;
	};
	//#endregion
	
	//#region URL: /stringifier/simple
	modules['/stringifier/simple'] = function () {
		var all = require('/stringifier/helpers').all;

		function store(token, context) {
		  context.output.push(typeof token == 'string' ? token : token[0]);
		}

		function stringify(tokens, options, restoreCallback) {
		  var context = {
			keepBreaks: options.keepBreaks,
			output: [],
			spaceAfterClosingBrace: options.compatibility.properties.spaceAfterClosingBrace,
			store: store
		  };

		  all(tokens, context, false);

		  return {
			styles: restoreCallback(context.output.join('')).trim()
		  };
		}

		return stringify;
	};
	//#endregion

	//#region URL: /text/comments-processor
	modules['/text/comments-processor'] = function () {
		var EscapeStore = require('/text/escape-store');
		var QuoteScanner = require('/utils/quote-scanner');

		var SPECIAL_COMMENT_PREFIX = '/*!';
		var COMMENT_PREFIX = '/*';
		var COMMENT_SUFFIX = '*/';

		var lineBreak = require('os').EOL;

		function CommentsProcessor(context, keepSpecialComments, keepBreaks/*, saveWaypoints*/) {
		  this.comments = new EscapeStore('COMMENT');
		  this.specialComments = new EscapeStore('COMMENT_SPECIAL');

		  this.context = context;
		  this.restored = 0;
		  this.keepAll = keepSpecialComments == '*';
		  this.keepOne = keepSpecialComments == '1' || keepSpecialComments === 1;
		  this.keepBreaks = keepBreaks;
//		  this.saveWaypoints = saveWaypoints;
		}

		function quoteScannerFor(data) {
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
		}

		CommentsProcessor.prototype.escape = function (data) {
		  var tempData = [];
		  var nextStart = 0;
		  var nextEnd = 0;
		  var cursor = 0;
		  var indent = 0;
		  var breaksCount;
		  var lastBreakAt;
		  var newIndent;
		  var isQuotedAt = quoteScannerFor(data);
//		  var saveWaypoints = this.saveWaypoints;

		  for (; nextEnd < data.length;) {
			nextStart = data.indexOf(COMMENT_PREFIX, cursor);
			if (nextStart == -1)
			  break;

			if (isQuotedAt(nextStart)) {
			  tempData.push(data.substring(cursor, nextStart + COMMENT_PREFIX.length));
			  cursor = nextStart + COMMENT_PREFIX.length;
			  continue;
			}

			nextEnd = data.indexOf(COMMENT_SUFFIX, nextStart + COMMENT_PREFIX.length);
			if (nextEnd == -1) {
			  this.context.warnings.push('Broken comment: \'' + data.substring(nextStart) + '\'.');
			  nextEnd = data.length - 2;
			}

			tempData.push(data.substring(cursor, nextStart));

			var comment = data.substring(nextStart, nextEnd + COMMENT_SUFFIX.length);
			var isSpecialComment = comment.indexOf(SPECIAL_COMMENT_PREFIX) === 0;

//			if (saveWaypoints) {
//			  breaksCount = comment.split(lineBreak).length - 1;
//			  lastBreakAt = comment.lastIndexOf(lineBreak);
//			  newIndent = lastBreakAt > 0 ?
//				comment.substring(lastBreakAt + lineBreak.length).length :
//				indent + comment.length;
//			}

			if (/*saveWaypoints || */isSpecialComment) {
			  var metadata = /*saveWaypoints ? [breaksCount, newIndent] : */null;
			  var placeholder = isSpecialComment ?
				this.specialComments.store(comment, metadata) :
				this.comments.store(comment, metadata);
			  tempData.push(placeholder);
			}

//			if (saveWaypoints)
//			  indent = newIndent + 1;
			cursor = nextEnd + COMMENT_SUFFIX.length;
		  }

		  return tempData.length > 0 ?
			tempData.join('') + data.substring(cursor, data.length) :
			data;
		};

		function restore(context, data, from, isSpecial) {
		  var tempData = [];
		  var cursor = 0;
		  var addBreak;

		  for (; cursor < data.length;) {
			var nextMatch = from.nextMatch(data, cursor);
			if (nextMatch.start < 0)
			  break;

			tempData.push(data.substring(cursor, nextMatch.start));
			var comment = from.restore(nextMatch.match);

			if (isSpecial && (context.keepAll || (context.keepOne && context.restored === 0))) {
			  context.restored++;
			  addBreak = context.keepBreaks && data[nextMatch.end] != '\n' && data.lastIndexOf('\r\n', nextMatch.end + 1) != nextMatch.end;
			  tempData.push(comment, addBreak ? lineBreak : '');
			} else {
			  nextMatch.end += context.keepBreaks ? lineBreak.length : 0;
			}

			cursor = nextMatch.end;
		  }

		  return tempData.length > 0 ?
			tempData.join('') + data.substring(cursor, data.length) :
			data;
		}

		CommentsProcessor.prototype.restore = function (data) {
		  data = restore(this, data, this.comments, false);
		  data = restore(this, data, this.specialComments, true);
		  return data;
		};
		
		return CommentsProcessor;
	};
	//#endregion

	//#region URL: /text/escape-store
	modules['/text/escape-store'] = function () {
		var placeholderBrace = '__';

		function EscapeStore(placeholderRoot) {
		  this.placeholderRoot = 'ESCAPED_' + placeholderRoot + '_CLEAN_CSS';
		  this.placeholderToData = {};
		  this.dataToPlaceholder = {};
		  this.count = 0;
		  this.restoreMatcher = new RegExp(this.placeholderRoot + '(\\d+)');
		}

		EscapeStore.prototype._nextPlaceholder = function (metadata) {
		  return {
			index: this.count,
			value: placeholderBrace + this.placeholderRoot + this.count++ + metadata + placeholderBrace
		  };
		};

		EscapeStore.prototype.store = function (data, metadata) {
		  var encodedMetadata = metadata ?
			'(' + metadata.join(',') + ')' :
			'';
		  var placeholder = this.dataToPlaceholder[data];

		  if (!placeholder) {
			var nextPlaceholder = this._nextPlaceholder(encodedMetadata);
			placeholder = nextPlaceholder.value;
			this.placeholderToData[nextPlaceholder.index] = data;
			this.dataToPlaceholder[data] = nextPlaceholder.value;
		  }

		  if (metadata)
			placeholder = placeholder.replace(/\([^\)]+\)/, encodedMetadata);

		  return placeholder;
		};

		EscapeStore.prototype.nextMatch = function (data, cursor) {
		  var next = {};

		  next.start = data.indexOf(this.placeholderRoot, cursor) - placeholderBrace.length;
		  next.end = data.indexOf(placeholderBrace, next.start + placeholderBrace.length) + placeholderBrace.length;
		  if (next.start > -1 && next.end > -1)
			next.match = data.substring(next.start, next.end);

		  return next;
		};

		EscapeStore.prototype.restore = function (placeholder) {
		  var index = this.restoreMatcher.exec(placeholder)[1];
		  return this.placeholderToData[index];
		};
		
		return EscapeStore;
	};
	//#endregion

	//#region URL: /text/expressions-processor
	modules['/text/expressions-processor'] = function () {
		var EscapeStore = require('/text/escape-store');

		var EXPRESSION_NAME = 'expression';
		var EXPRESSION_START = '(';
		var EXPRESSION_END = ')';
		var EXPRESSION_PREFIX = EXPRESSION_NAME + EXPRESSION_START;
		var BODY_START = '{';
		var BODY_END = '}';

		var lineBreak = require('os').EOL;

		function findEnd(data, start) {
		  var end = start + EXPRESSION_NAME.length;
		  var level = 0;
		  var quoted = false;
		  var braced = false;

		  while (true) {
			var current = data[end++];

			if (quoted) {
			  quoted = current != '\'' && current != '"';
			} else {
			  quoted = current == '\'' || current == '"';

			  if (current == EXPRESSION_START)
				level++;
			  if (current == EXPRESSION_END)
				level--;
			  if (current == BODY_START)
				braced = true;
			  if (current == BODY_END && !braced && level == 1) {
				end--;
				level--;
			  }
			}

			if (level === 0 && current == EXPRESSION_END)
			  break;
			if (!current) {
			  end = data.substring(0, end).lastIndexOf(BODY_END);
			  break;
			}
		  }

		  return end;
		}

		function ExpressionsProcessor(/*saveWaypoints*/) {
		  this.expressions = new EscapeStore('EXPRESSION');
//		  this.saveWaypoints = saveWaypoints;
		}

		ExpressionsProcessor.prototype.escape = function (data) {
		  var nextStart = 0;
		  var nextEnd = 0;
		  var cursor = 0;
		  var tempData = [];
		  var indent = 0;
		  var breaksCount;
		  var lastBreakAt;
		  var newIndent;
//		  var saveWaypoints = this.saveWaypoints;

		  for (; nextEnd < data.length;) {
			nextStart = data.indexOf(EXPRESSION_PREFIX, nextEnd);
			if (nextStart == -1)
			  break;

			nextEnd = findEnd(data, nextStart);

			var expression = data.substring(nextStart, nextEnd);
//			if (saveWaypoints) {
//			  breaksCount = expression.split(lineBreak).length - 1;
//			  lastBreakAt = expression.lastIndexOf(lineBreak);
//			  newIndent = lastBreakAt > 0 ?
//				expression.substring(lastBreakAt + lineBreak.length).length :
//				indent + expression.length;
//			}

			var metadata = /*saveWaypoints ? [breaksCount, newIndent] : */null;
			var placeholder = this.expressions.store(expression, metadata);
			tempData.push(data.substring(cursor, nextStart));
			tempData.push(placeholder);

//			if (saveWaypoints)
//			  indent = newIndent + 1;
			cursor = nextEnd;
		  }

		  return tempData.length > 0 ?
			tempData.join('') + data.substring(cursor, data.length) :
			data;
		};

		ExpressionsProcessor.prototype.restore = function (data) {
		  var tempData = [];
		  var cursor = 0;

		  for (; cursor < data.length;) {
			var nextMatch = this.expressions.nextMatch(data, cursor);
			if (nextMatch.start < 0)
			  break;

			tempData.push(data.substring(cursor, nextMatch.start));
			var comment = this.expressions.restore(nextMatch.match);
			tempData.push(comment);

			cursor = nextMatch.end;
		  }

		  return tempData.length > 0 ?
			tempData.join('') + data.substring(cursor, data.length) :
			data;
		};
		
		return ExpressionsProcessor;
	};
	//#endregion

	//#region URL: /text/free-text-processor
	modules['/text/free-text-processor'] = function () {
		var EscapeStore = require('/text/escape-store');
		var QuoteScanner = require('/utils/quote-scanner');

		var lineBreak = require('os').EOL;

		function FreeTextProcessor(/*saveWaypoints*/) {
		  this.matches = new EscapeStore('FREE_TEXT');
//		  this.saveWaypoints = saveWaypoints;
		}

		// Strip content tags by replacing them by the a special
		// marker for further restoring. It's done via string scanning
		// instead of regexps to speed up the process.
		FreeTextProcessor.prototype.escape = function(data) {
		  var self = this;
		  var breaksCount;
		  var lastBreakAt;
		  var indent;
		  var metadata;
//		  var saveWaypoints = this.saveWaypoints;

		  return new QuoteScanner(data).each(function(match, store) {
//			if (saveWaypoints) {
//			  breaksCount = match.split(lineBreak).length - 1;
//			  lastBreakAt = match.lastIndexOf(lineBreak);
//			  indent = lastBreakAt > 0 ?
//				match.substring(lastBreakAt + lineBreak.length).length :
//				match.length;
//			  metadata = [breaksCount, indent];
//			}

			var placeholder = self.matches.store(match, metadata);
			store.push(placeholder);
		  });
		};

		function normalize(text, data, cursor) {
		  // FIXME: this is a hack
		  var lastSemicolon = data.lastIndexOf(';', cursor);
		  var lastOpenBrace = data.lastIndexOf('{', cursor);
		  var lastOne = 0;

		  if (lastSemicolon > -1 && lastOpenBrace > -1)
			lastOne = Math.max(lastSemicolon, lastOpenBrace);
		  else if (lastSemicolon == -1)
			lastOne = lastOpenBrace;
		  else
			lastOne = lastSemicolon;

		  var context = data.substring(lastOne + 1, cursor);

		  if (/\[[\w\d\-]+[\*\|\~\^\$]?=$/.test(context))
			text = text.replace(/\\\n|\\\r\n/g, '');

		  if (/^['"][a-zA-Z][a-zA-Z\d\-_]+['"]$/.test(text) && !/format\($/.test(context)) {
			var isFont = /^(font|font\-family):/.test(context);
			var isAttribute = /\[[\w\d\-]+[\*\|\~\^\$]?=$/.test(context);
			var isKeyframe = /@(-moz-|-o-|-webkit-)?keyframes /.test(context);
			var isAnimation = /^(-moz-|-o-|-webkit-)?animation(-name)?:/.test(context);

			if (isFont || isAttribute || isKeyframe || isAnimation)
			  text = text.substring(1, text.length - 1);
		  }

		  return text;
		}

		FreeTextProcessor.prototype.restore = function(data) {
		  var tempData = [];
		  var cursor = 0;

		  for (; cursor < data.length;) {
			var nextMatch = this.matches.nextMatch(data, cursor);
			if (nextMatch.start < 0)
			  break;

			tempData.push(data.substring(cursor, nextMatch.start));
			var text = normalize(this.matches.restore(nextMatch.match), data, nextMatch.start);
			tempData.push(text);

			cursor = nextMatch.end;
		  }

		  return tempData.length > 0 ?
			tempData.join('') + data.substring(cursor, data.length) :
			data;
		};
		
		return FreeTextProcessor;
	};
	//#endregion

	//#region URL: /text/urls-processor
	modules['/text/urls-processor'] = function () {
		var EscapeStore = require('/text/escape-store');
		var UrlScanner = require('/utils/url-scanner');

		var lineBreak = require('os').EOL;

		function UrlsProcessor(context/*, saveWaypoints*/, keepUrlQuotes) {
		  this.urls = new EscapeStore('URL');
		  this.context = context;
//		  this.saveWaypoints = saveWaypoints;
		  this.keepUrlQuotes = keepUrlQuotes;
		}

		// Strip urls by replacing them by a special
		// marker for further restoring. It's done via string scanning
		// instead of regexps to speed up the process.
		UrlsProcessor.prototype.escape = function (data) {
		  var breaksCount;
		  var lastBreakAt;
		  var indent;
//		  var saveWaypoints = this.saveWaypoints;
		  var self = this;

		  return new UrlScanner(data, this.context).reduce(function (url, tempData) {
//			if (saveWaypoints) {
//			  breaksCount = url.split(lineBreak).length - 1;
//			  lastBreakAt = url.lastIndexOf(lineBreak);
//			  indent = lastBreakAt > 0 ?
//				url.substring(lastBreakAt + lineBreak.length).length :
//				url.length;
//			}

			var placeholder = self.urls.store(url, /*saveWaypoints ? [breaksCount, indent] : */null);
			tempData.push(placeholder);
		  });
		};

		function normalize(url, keepUrlQuotes) {
		  url = url
			.replace(/^url/gi, 'url')
			.replace(/\\?\n|\\?\r\n/g, '')
			.replace(/(\s{2,}|\s)/g, ' ')
			.replace(/^url\((['"])? /, 'url($1')
			.replace(/ (['"])?\)$/, '$1)');

		  if (!keepUrlQuotes && !/url\(.*[\s\(\)].*\)/.test(url) && !/url\(['"]data:[^;]+;charset/.test(url))
			url = url.replace(/["']/g, '');

		  return url;
		}

		UrlsProcessor.prototype.restore = function (data) {
		  var tempData = [];
		  var cursor = 0;

		  for (; cursor < data.length;) {
			var nextMatch = this.urls.nextMatch(data, cursor);
			if (nextMatch.start < 0)
			  break;

			tempData.push(data.substring(cursor, nextMatch.start));
			var url = normalize(this.urls.restore(nextMatch.match), this.keepUrlQuotes);
			tempData.push(url);

			cursor = nextMatch.end;
		  }

		  return tempData.length > 0 ?
			tempData.join('') + data.substring(cursor, data.length) :
			data;
		};
		
		return UrlsProcessor;
	};
	//#endregion

	//#region URL: /utils/chunker
	modules['/utils/chunker'] = function () {
		// Divides `data` into chunks of `chunkSize` for faster processing
		function Chunker(data, breakString, chunkSize) {
		  this.chunks = [];

		  for (var cursor = 0, dataSize = data.length; cursor < dataSize;) {
			var nextCursor = cursor + chunkSize > dataSize ?
			  dataSize - 1 :
			  cursor + chunkSize;

			if (data[nextCursor] != breakString)
			  nextCursor = data.indexOf(breakString, nextCursor);
			if (nextCursor == -1)
			  nextCursor = data.length - 1;

			this.chunks.push(data.substring(cursor, nextCursor + breakString.length));
			cursor = nextCursor + breakString.length;
		  }
		}

		Chunker.prototype.isEmpty = function () {
		  return this.chunks.length === 0;
		};

		Chunker.prototype.next = function () {
		  return this.chunks.shift();
		};
		
		return Chunker;
	};
	//#endregion

	//#region URL: /utils/compatibility
	modules['/utils/compatibility'] = function () {
		var util = require('util');

		var DEFAULTS = {
		  '*': {
			colors: {
			  opacity: true // rgba / hsla
			},
			properties: {
			  backgroundSizeMerging: false, // background-size to shorthand
			  iePrefixHack: false, // underscore / asterisk prefix hacks on IE
			  ieSuffixHack: false, // \9 suffix hacks on IE
			  merging: true, // merging properties into one
			  spaceAfterClosingBrace: false, // 'url() no-repeat' to 'url()no-repeat'
			  urlQuotes: false, // whether to wrap content of `url()` into quotes or not
			  zeroUnits: true // 0[unit] -> 0
			},
			selectors: {
			  adjacentSpace: false, // div+ nav Android stock browser hack
			  ie7Hack: false, // *+html hack
			  special: /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:dir\([a-z-]*\)|:first(?![a-z-])|:fullscreen|:left|:read-only|:read-write|:right)/ // special selectors which prevent merging
			},
			units: {
			  rem: true
			}
		  },
		  'ie8': {
			colors: {
			  opacity: false
			},
			properties: {
			  backgroundSizeMerging: false,
			  iePrefixHack: true,
			  ieSuffixHack: true,
			  merging: false,
			  spaceAfterClosingBrace: true,
			  urlQuotes: false,
			  zeroUnits: true
			},
			selectors: {
			  adjacentSpace: false,
			  ie7Hack: false,
			  special: /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:root|:nth|:first\-of|:last|:only|:empty|:target|:checked|::selection|:enabled|:disabled|:not)/
			},
			units: {
			  rem: false
			}
		  },
		  'ie7': {
			colors: {
			  opacity: false
			},
			properties: {
			  backgroundSizeMerging: false,
			  iePrefixHack: true,
			  ieSuffixHack: true,
			  merging: false,
			  spaceAfterClosingBrace: true,
			  urlQuotes: false,
			  zeroUnits: true
			},
			selectors: {
			  adjacentSpace: false,
			  ie7Hack: true,
			  special: /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:focus|:before|:after|:root|:nth|:first\-of|:last|:only|:empty|:target|:checked|::selection|:enabled|:disabled|:not)/
			},
			units: {
			  rem: false
			}
		  }
		};

		function Compatibility(source) {
		  this.source = source || {};
		}

		function merge(source, target) {
		  for (var key in source) {
			var value = source[key];

			if (typeof value === 'object' && !util.isRegExp(value))
			  target[key] = merge(value, target[key] || {});
			else
			  target[key] = key in target ? target[key] : value;
		  }

		  return target;
		}

		function calculateSource(source) {
		  if (typeof source == 'object')
			return source;

		  if (!/[,\+\-]/.test(source))
			return DEFAULTS[source] || DEFAULTS['*'];

		  var parts = source.split(',');
		  var template = parts[0] in DEFAULTS ?
			DEFAULTS[parts.shift()] :
			DEFAULTS['*'];

		  source = {};

		  parts.forEach(function (part) {
			var isAdd = part[0] == '+';
			var key = part.substring(1).split('.');
			var group = key[0];
			var option = key[1];

			source[group] = source[group] || {};
			source[group][option] = isAdd;
		  });

		  return merge(template, source);
		}

		Compatibility.prototype.toOptions = function () {
		  return merge(DEFAULTS['*'], calculateSource(this.source));
		};
		
		return Compatibility;
	};
	//#endregion

	//#region URL: /utils/extractors
	modules['/utils/extractors'] = function () {
		var Splitter = require('/utils/splitter');

		var COMMA = ',';
		var FORWARD_SLASH = '/';

		function selectorName(value) {
		  return value[0];
		}

		function noop() {}

		function withoutComments(string, into, heading, context) {
		  var matcher = heading ? /^__ESCAPED_COMMENT_/ : /__ESCAPED_COMMENT_/;
		  var track = heading ? context.track : noop; // don't track when comment not in a heading as we do it later in `trackComments`

		  while (matcher.test(string)) {
			var startOfComment = string.indexOf('__');
			var endOfComment = string.indexOf('__', startOfComment + 1) + 2;
			var comment = string.substring(startOfComment, endOfComment);
			string = string.substring(0, startOfComment) + string.substring(endOfComment);

			track(comment);
			into.push(comment);
		  }

		  return string;
		}

		function withoutHeadingComments(string, into, context) {
		  return withoutComments(string, into, true, context);
		}

		function withoutInnerComments(string, into, context) {
		  return withoutComments(string, into, false, context);
		}

		function trackComments(comments, into, context) {
		  for (var i = 0, l = comments.length; i < l; i++) {
			context.track(comments[i]);
			into.push(comments[i]);
		  }
		}

		var Extractors = {
		  properties: function (string, selectors, context) {
			var list = [];
			var innerComments = [];
			var splitter = new Splitter(/[ ,\/]/);

			if (typeof string != 'string')
			  return [];

			if (string.indexOf(')') > -1)
			  string = string.replace(/\)([^\s_;:,\)])/g, /*context.sourceMaps ? ') __ESCAPED_COMMENT_CLEAN_CSS(0,-1)__ $1' : */') $1');

			if (string.indexOf('ESCAPED_URL_CLEAN_CSS') > -1)
			  string = string.replace(/(ESCAPED_URL_CLEAN_CSS[^_]+?__)/g, /*context.sourceMaps ? '$1 __ESCAPED_COMMENT_CLEAN_CSS(0,-1)__ ' : */'$1 ');

			var candidates = string.split(';');

			for (var i = 0, l = candidates.length; i < l; i++) {
			  var candidate = candidates[i];
			  var firstColonAt = candidate.indexOf(':');

			  if (firstColonAt == -1) {
				context.track(candidate);
				if (candidate.indexOf('__ESCAPED_COMMENT_') > -1)
				  list.push(candidate.trim());
				continue;
			  }

			  if (candidate.indexOf('{') > 0) {
				context.track(candidate);
				continue;
			  }

			  var body = [];
			  var name = candidate.substring(0, firstColonAt);

			  innerComments = [];

			  if (name.indexOf('__ESCAPED_COMMENT') > -1)
				name = withoutHeadingComments(name, list, context);

			  if (name.indexOf('__ESCAPED_COMMENT') > -1)
				name = withoutInnerComments(name, innerComments, context);

			  body.push([name.trim()].concat(context.track(name, true)));
			  context.track(':');

			  trackComments(innerComments, list, context);

			  var values = splitter.split(candidate.substring(firstColonAt + 1), true);

			  if (values.length == 1 && values[0] === '') {
				context.outer.warnings.push('Empty property \'' + name + '\' inside \'' + selectors.filter(selectorName).join(',') + '\' selector. Ignoring.');
				continue;
			  }

			  for (var j = 0, m = values.length; j < m; j++) {
				var value = values[j];
				var trimmed = value.trim();

				if (trimmed.length === 0)
				  continue;

				var lastCharacter = trimmed[trimmed.length - 1];
				var endsWithNonSpaceSeparator = trimmed.length > 1 && (lastCharacter == COMMA || lastCharacter == FORWARD_SLASH);

				if (endsWithNonSpaceSeparator)
				  trimmed = trimmed.substring(0, trimmed.length - 1);

				if (trimmed.indexOf('__ESCAPED_COMMENT_CLEAN_CSS(0,-') > -1) {
				  context.track(trimmed);
				  continue;
				}

				innerComments = [];

				if (trimmed.indexOf('__ESCAPED_COMMENT') > -1)
				  trimmed = withoutHeadingComments(trimmed, list, context);

				if (trimmed.indexOf('__ESCAPED_COMMENT') > -1)
				  trimmed = withoutInnerComments(trimmed, innerComments, context);

				if (trimmed.length === 0) {
				  trackComments(innerComments, list, context);
				  continue;
				}

				var pos = body.length - 1;
				if (trimmed == 'important' && body[pos][0] == '!') {
				  context.track(trimmed);
				  body[pos - 1][0] += '!important';
				  body.pop();
				  continue;
				}

				if (trimmed == '!important' || (trimmed == 'important' && body[pos][0][body[pos][0].length - 1] == '!')) {
				  context.track(trimmed);
				  body[pos][0] += trimmed;
				  continue;
				}

				body.push([trimmed].concat(context.track(value, true)));

				trackComments(innerComments, list, context);

				if (endsWithNonSpaceSeparator) {
				  body.push([lastCharacter]);
				  context.track(lastCharacter);
				}
			  }

			  if (i < l - 1)
				context.track(';');

			  list.push(body);
			}

			return list;
		  },

		  selectors: function (string, context) {
			var list = [];
			var metadata;
			var selectors = new Splitter(',').split(string);

			for (var i = 0, l = selectors.length; i < l; i++) {
			  metadata = context.track(selectors[i], true, i);
			  context.track(',');
			  list.push([selectors[i].trim()].concat(metadata));
			}

			return list;
		  }
		};
		
		return Extractors;
	};
	//#endregion

	//#region URL: /utils/quote-scanner
	modules['/utils/quote-scanner'] = function () {
		function QuoteScanner(data) {
		  this.data = data;
		}

		var findQuoteEnd = function (data, matched, cursor, oldCursor) {
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
			if (data[cursor] == matched && (data[cursor - 1] != escapeMark || data[cursor - 2] == escapeMark))
			  break;

			cursor++;
		  }

		  return cursor;
		};

		function findNext(data, mark, startAt) {
		  var escapeMark = '\\';
		  var candidate = startAt;

		  while (true) {
			candidate = data.indexOf(mark, candidate + 1);
			if (candidate == -1)
			  return -1;
			if (data[candidate - 1] != escapeMark)
			  return candidate;
		  }
		}

		QuoteScanner.prototype.each = function (callback) {
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
			var nextStartSingle = findNext(data, singleMark, nextEnd);
			var nextStartDouble = findNext(data, doubleMark, nextEnd);

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
	};
	//#endregion

	//#region URL: /utils/source-reader
	modules['/utils/source-reader'] = function () {
//		var path = require('path');
//		var UrlRewriter = require('/images/url-rewriter');

		var REMOTE_RESOURCE = /^(https?:)?\/\//;

		function SourceReader(context, data) {
		  this.outerContext = context;
		  this.data = data;
		  this.sources = {};
		}

		SourceReader.prototype.sourceAt = function (path) {
		  return this.sources[path];
		};

		SourceReader.prototype.trackSource = function (path, source) {
		  this.sources[path] = {};
		  this.sources[path][path] = source;
		};

		SourceReader.prototype.toString = function () {
		  if (typeof this.data == 'string')
			return fromString(this);
		  if (Buffer.isBuffer(this.data))
			return fromBuffer(this);
		  if (Array.isArray(this.data))
			return fromArray(this);

		  return fromHash(this);
		};

		function fromString(self) {
		  var data = self.data;
		  self.trackSource(undefined, data);
		  return data;
		}

		function fromBuffer(self) {
		  var data = self.data.toString();
		  self.trackSource(undefined, data);
		  return data;
		}

		function fromArray(self) {
		  return self.data
			.map(function (source) {
			  return self.outerContext.options.processImport === false ?
				source + '@shallow' :
				source;
			})
//			.map(function (source) {
//			  return !self.outerContext.options.relativeTo || /^https?:\/\//.test(source) ?
//				source :
//				path.relative(self.outerContext.options.relativeTo, source);
//			})
			.map(function (source) { return '@import url(' + source + ');'; })
			.join('');
		}

		function fromHash(self) {
		  var data = [];
//		  var toBase = path.resolve(self.outerContext.options.target || self.outerContext.options.root);

		  for (var source in self.data) {
			var styles = self.data[source].styles;
//			var inputSourceMap = self.data[source].sourceMap;
//			var isRemote = REMOTE_RESOURCE.test(source);
//			var absoluteSource = isRemote ? source : path.resolve(source);
//			var absoluteSourcePath = path.dirname(absoluteSource);

//			var rewriter = new UrlRewriter({
//			  absolute: self.outerContext.options.explicitRoot,
//			  relative: !self.outerContext.options.explicitRoot,
//			  imports: true,
//			  urls: self.outerContext.options.rebase,
//			  fromBase: absoluteSourcePath,
//			  toBase: isRemote ? absoluteSourcePath : toBase
//			}, self.outerContext);
//			styles = rewriter.process(styles);

			self.trackSource(source, styles);

			styles = self.outerContext.sourceTracker.store(source, styles);

//			// here we assume source map lies in the same directory as `source` does
//			if (self.outerContext.options.sourceMap && inputSourceMap)
//			  self.outerContext.inputSourceMapTracker.trackLoaded(source, source, inputSourceMap);

			data.push(styles);
		  }

		  return data.join('');
		}

		return SourceReader;
	};
	//#endregion

	//#region URL: /utils/source-tracker
	modules['/utils/source-tracker'] = function () {
		function SourceTracker() {
		  this.sources = [];
		}

		SourceTracker.prototype.store = function (filename, data) {
		  this.sources.push(filename);

		  return '__ESCAPED_SOURCE_CLEAN_CSS' + (this.sources.length - 1) + '__' +
			data +
			'__ESCAPED_SOURCE_END_CLEAN_CSS__';
		};

		SourceTracker.prototype.nextStart = function (data) {
		  var next = /__ESCAPED_SOURCE_CLEAN_CSS(\d+)__/.exec(data);

		  return next ?
			{ index: next.index, filename: this.sources[~~next[1]] } :
			null;
		};

		SourceTracker.prototype.nextEnd = function (data) {
		  return /__ESCAPED_SOURCE_END_CLEAN_CSS__/g.exec(data);
		};

		SourceTracker.prototype.removeAll = function (data) {
		  return data
			.replace(/__ESCAPED_SOURCE_CLEAN_CSS\d+__/g, '')
			.replace(/__ESCAPED_SOURCE_END_CLEAN_CSS__/g, '');
		};
		
		return SourceTracker;
	};
	//#endregion

	//#region URL: /utils/splitter
	modules['/utils/splitter'] = function () {
		function Splitter(separator) {
		  this.separator = separator;
		  this.withRegex = typeof separator != 'string';
		}

		Splitter.prototype.split = function (value, withSeparator) {
		  var hasSeparator = this.withRegex ?
			this.separator.test(value) :
			value.indexOf(this.separator);
		  if (!hasSeparator)
			return [value];

		  if (value.indexOf('(') === -1 && !withSeparator)
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
			} else if ((this.withRegex ? this.separator.test(value[cursor]) : value[cursor] == this.separator) && level === 0) {
			  tokens.push(value.substring(lastStart, cursor + (withSeparator ? 1 : 0)));
			  lastStart = cursor + 1;
			}
		  }

		  if (lastStart < cursor + 1)
			tokens.push(value.substring(lastStart));

		  return tokens;
		};
	
		return Splitter;
	};
	//#endregion

	//#region URL: /utils/url-scanner
	modules['/utils/url-scanner'] = function () {
		var URL_PREFIX = 'url(';
		var UPPERCASE_URL_PREFIX = 'URL(';
		var URL_SUFFIX = ')';

		function UrlScanner(data, context) {
		  this.data = data;
		  this.context = context;
		}

		UrlScanner.prototype.reduce = function (callback) {
		  var nextStart = 0;
		  var nextStartUpperCase = 0;
		  var nextEnd = 0;
		  var cursor = 0;
		  var tempData = [];
		  var data = this.data;
		  var hasUppercaseUrl = data.indexOf(UPPERCASE_URL_PREFIX) > -1;

		  for (; nextEnd < data.length;) {
			nextStart = data.indexOf(URL_PREFIX, nextEnd);
			nextStartUpperCase = hasUppercaseUrl ? data.indexOf(UPPERCASE_URL_PREFIX, nextEnd) : -1;
			if (nextStart == -1 && nextStartUpperCase == -1)
			  break;

			if (nextStart == -1 && nextStartUpperCase > -1)
			  nextStart = nextStartUpperCase;

			if (data[nextStart + URL_PREFIX.length] == '"')
			  nextEnd = data.indexOf('"', nextStart + URL_PREFIX.length + 1);
			else if (data[nextStart + URL_PREFIX.length] == '\'')
			  nextEnd = data.indexOf('\'', nextStart + URL_PREFIX.length + 1);
			else
			  nextEnd = data.indexOf(URL_SUFFIX, nextStart);

			// Following lines are a safety mechanism to ensure
			// incorrectly terminated urls are processed correctly.
			if (nextEnd == -1) {
			  nextEnd = data.indexOf('}', nextStart);

			  if (nextEnd == -1)
				nextEnd = data.length;
			  else
				nextEnd--;

			  this.context.warnings.push('Broken URL declaration: \'' + data.substring(nextStart, nextEnd + 1) + '\'.');
			} else {
			  if (data[nextEnd] != URL_SUFFIX)
				nextEnd = data.indexOf(URL_SUFFIX, nextEnd);
			}

			tempData.push(data.substring(cursor, nextStart));

			var url = data.substring(nextStart, nextEnd + 1);
			callback(url, tempData);

			cursor = nextEnd + 1;
		  }

		  return tempData.length > 0 ?
			tempData.join('') + data.substring(cursor, data.length) :
			data;
		};

		return UrlScanner;
	};
	//#endregion

	//#region URL: /clean
	modules['/clean'] = function () {
//		var ImportInliner = require('/imports/inliner');
//		var UrlRebase = require('/images/url-rebase');
		var SelectorsOptimizer = require('/selectors/optimizer');

		var simpleStringify = require('/stringifier/simple');
//		var sourceMapStringify = require('/stringifier/source-maps');

		var CommentsProcessor = require('/text/comments-processor');
		var ExpressionsProcessor = require('/text/expressions-processor');
		var FreeTextProcessor = require('/text/free-text-processor');
		var UrlsProcessor = require('/text/urls-processor');

		var Compatibility = require('/utils/compatibility');
//		var InputSourceMapTracker = require('/utils/input-source-map-tracker');
		var SourceTracker = require('/utils/source-tracker');
		var SourceReader = require('/utils/source-reader');
		var Validator = require('/properties/validator');

//		var fs = require('fs');
//		var path = require('path');

		var DEFAULT_TIMEOUT = 5000;

		var CleanCSS = function CleanCSS(options) {
		  options = options || {};

		  this.options = {
			advanced: undefined === options.advanced ? true : !!options.advanced,
			aggressiveMerging: undefined === options.aggressiveMerging ? true : !!options.aggressiveMerging,
//			benchmark: options.benchmark,
			compatibility: new Compatibility(options.compatibility).toOptions(),
//			debug: options.debug,
			explicitRoot: !!options.root,
			explicitTarget: !!options.target,
//			inliner: options.inliner || {},
			keepBreaks: options.keepBreaks || false,
			keepSpecialComments: 'keepSpecialComments' in options ? options.keepSpecialComments : '*',
			mediaMerging: undefined === options.mediaMerging ? true : !!options.mediaMerging,
			processImport: undefined === options.processImport ? true : !!options.processImport,
			rebase: undefined === options.rebase ? true : !!options.rebase,
			relativeTo: options.relativeTo,
			restructuring: undefined === options.restructuring ? true : !!options.restructuring,
			root: options.root/* || process.cwd()*/,
			roundingPrecision: options.roundingPrecision,
			shorthandCompacting: undefined === options.shorthandCompacting ? true : !!options.shorthandCompacting,
//			sourceMap: options.sourceMap,
//			sourceMapInlineSources: !!options.sourceMapInlineSources,
			target: options.target/* && fs.existsSync(options.target) && fs.statSync(options.target).isDirectory() ? options.target : path.dirname(options.target)*/
		  };

//		  this.options.inliner.timeout = this.options.inliner.timeout || DEFAULT_TIMEOUT;
//		  this.options.inliner.request = this.options.inliner.request || {};
		};

		CleanCSS.prototype.minify = function(data, callback) {
		  var context = {
//			stats: {},
			errors: [],
			warnings: [],
			options: this.options,
//			debug: this.options.debug,
			localOnly: !callback,
			sourceTracker: new SourceTracker(),
			validator: new Validator(this.options.compatibility)
		  };

//		  if (context.options.sourceMap)
//			context.inputSourceMapTracker = new InputSourceMapTracker(context);

		  context.sourceReader = new SourceReader(context, data);
		  data = context.sourceReader.toString();

//		  if (context.options.processImport || data.indexOf('@shallow') > 0) {
//			// inline all imports
//			var runner = callback ?
//			  process.nextTick :
//			  function (callback) { return callback(); };
//
//			return runner(function () {
//			  return new ImportInliner(context).process(data, {
//				localOnly: context.localOnly,
//				whenDone: runMinifier(callback, context)
//			  });
//			});
//		  } else {
			return runMinifier(callback, context)(data);
//		  }
		};

		function runMinifier(callback, context) {
		  function whenSourceMapReady (data) {
			data = /*context.options.debug ?
			  minifyWithDebug(context, data) :
			  */minify(context, data);
			data = withMetadata(context, data);

			return callback ?
			  callback.call(null, context.errors.length > 0 ? context.errors : null, data) :
			  data;
		  }

		  return function (data) {
//			if (context.options.sourceMap) {
//			  return context.inputSourceMapTracker.track(data, function () {
//				if (context.options.sourceMapInlineSources) {
//				  return context.inputSourceMapTracker.resolveSources(function () {
//					return whenSourceMapReady(data);
//				  });
//				} else {
//				  return whenSourceMapReady(data);
//				}
//			  });
//			} else {
			  return whenSourceMapReady(data);
//			}
		  };
		}

		function withMetadata(context, data) {
//		  data.stats = context.stats;
		  data.errors = context.errors;
		  data.warnings = context.warnings;
		  return data;
		}

//		function minifyWithDebug(context, data) {
//		  var startedAt = process.hrtime();
//		  context.stats.originalSize = context.sourceTracker.removeAll(data).length;
//
//		  data = minify(context, data);
//
//		  var elapsed = process.hrtime(startedAt);
//		  context.stats.timeSpent = ~~(elapsed[0] * 1e3 + elapsed[1] / 1e6);
//		  context.stats.efficiency = 1 - data.styles.length / context.stats.originalSize;
//		  context.stats.minifiedSize = data.styles.length;
//
//		  return data;
//		}

//		function benchmark(runner) {
//		  return function (processor, action) {
//			var name =  processor.constructor.name + '#' + action;
//			var start = process.hrtime();
//			runner(processor, action);
//			var itTook = process.hrtime(start);
//			console.log('%d ms: ' + name, 1000 * itTook[0] + itTook[1] / 1000000);
//		  };
//		}

		function minify(context, data) {
		  var options = context.options;
//		  var sourceMapTracker = context.inputSourceMapTracker;

		  var commentsProcessor = new CommentsProcessor(context, options.keepSpecialComments, options.keepBreaks/*, options.sourceMap*/);
		  var expressionsProcessor = new ExpressionsProcessor(/*options.sourceMap*/);
		  var freeTextProcessor = new FreeTextProcessor(/*options.sourceMap*/);
		  var urlsProcessor = new UrlsProcessor(context/*, options.sourceMap*/, options.compatibility.properties.urlQuotes);

//		  var urlRebase = new UrlRebase(context);
		  var selectorsOptimizer = new SelectorsOptimizer(options, context);
		  var stringify = /*options.sourceMap ? sourceMapStringify : */simpleStringify;

		  var run = function (processor, action) {
			data = typeof processor == 'function' ?
			  processor(data) :
			  processor[action](data);
		  };

//		  if (options.benchmark)
//			run = benchmark(run);

		  run(commentsProcessor, 'escape');
		  run(expressionsProcessor, 'escape');
		  run(urlsProcessor, 'escape');
		  run(freeTextProcessor, 'escape');

		  run(function() {
			return selectorsOptimizer.process(data, stringify, function (data) {
			  data = freeTextProcessor.restore(data);
			  data = urlsProcessor.restore(data);
//			  data = options.rebase ? urlRebase.process(data) : data;
			  data = expressionsProcessor.restore(data);
			  return commentsProcessor.restore(data);
			}/*, sourceMapTracker*/);
		  });

		  return data;
		}
		
		return CleanCSS;
	};
	//#endregion

	return require('/clean');
})();