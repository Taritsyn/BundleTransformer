/*!
 * Clean-css v2.0.2
 * https://github.com/GoalSmashers/clean-css
 *
 * Copyright (C) 2011-2013 GoalSmashers.com
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

			h = ~~h / 360;
			s = ~~s / 100;
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
			  return data.replace(/hsl\((\d+),(\d+)%?,(\d+)%?\)/g, function(match, hue, saturation, lightness) {
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
			  return data.replace(/rgb\((\d+),(\d+),(\d+)\)/g, function(match, red, green, blue) {
				var redAsHex = parseInt(red, 10).toString(16);
				var greenAsHex = parseInt(green, 10).toString(16);
				var blueAsHex = parseInt(blue, 10).toString(16);

				return '#' +
				  ((redAsHex.length == 1 ? '0' : '') + redAsHex) +
				  ((greenAsHex.length == 1 ? '0' : '') + greenAsHex) +
				  ((blueAsHex.length == 1 ? '0' : '') + blueAsHex);
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
	
	//#region URL: ./properties/shorthand-notations
	require['./properties/shorthand-notations'] = (function () {
		function ShorthandNotations(data) {
		  // shorthand notations
		  var shorthandRegex = function(repeats, hasSuffix) {
			var pattern = '(padding|margin|border\\-width|border\\-color|border\\-style|border\\-radius):';
			for (var i = 0; i < repeats; i++)
			  pattern += '([\\d\\w\\.%#\\(\\),]+)' + (i < repeats - 1 ? ' ' : '');
			return new RegExp(pattern + (hasSuffix ? '([;}])' : ''), 'g');
		  };

		  var from4Values = function() {
			return data.replace(shorthandRegex(4), function(match, property, size1, size2, size3, size4) {
			  if (size1 === size2 && size1 === size3 && size1 === size4)
				return property + ':' + size1;
			  else if (size1 === size3 && size2 === size4)
				return property + ':' + size1 + ' ' + size2;
			  else if (size2 === size4)
				return property + ':' + size1 + ' ' + size2 + ' ' + size3;
			  else
				return match;
			});
		  };

		  var from3Values = function() {
			return data.replace(shorthandRegex(3, true), function(match, property, size1, size2, size3, suffix) {
			  if (size1 === size2 && size1 === size3)
				return property + ':' + size1 + suffix;
			  else if (size1 === size3)
				return property + ':' + size1 + ' ' + size2 + suffix;
			  else
				return match;
			});
		  };

		  var from2Values = function() {
			return data.replace(shorthandRegex(2, true), function(match, property, size1, size2, suffix) {
			  if (size1 === size2)
				return property + ':' + size1 + suffix;
			  else
				return match;
			});
		  };

		  return {
			process: function() {
			  data = from4Values();
			  data = from3Values();
			  return from2Values();
			}
		  };
		};
		
		return ShorthandNotations;
	}).call(this);
	//#endregion
	
	//#region URL: ./properties/optimizer
	require['./properties/optimizer'] = (function () {
		function Optimizer() {
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
			'list-style-image': ['list'],
			'list-style-position': ['list'],
			'list-style-type': ['list'],
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

			if (tokens.length < 2)
			  return;

			for (var i = 0, l = tokens.length; i < l; i++) {
			  var token = tokens[i];
			  if (token === '')
				continue;

			  var firstColon = token.indexOf(':');
			  keyValues.push([
				token.substring(0, firstColon),
				token.substring(firstColon + 1),
				token.indexOf('!important') > -1
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
			  var isImportant = token[2];
			  var _property = (property == '-ms-filter' || property == 'filter') ?
				(lastProperty == 'background' || lastProperty == 'background-image' ? lastProperty : property) :
				property;
			  var toOverridePosition = 0;

			  // comment is necessary - we assume that if two properties are one after another
			  // then it is intentional way of redefining property which may not be widely supported
			  // e.g. a{display:inline-block;display:-moz-inline-box}
			  // however if `mergeablePosition` yields true then the rule does not apply
			  // (e.g merging two adjacent selectors: `a{display:block}a{display:block}`)
			  if (_property != lastProperty || mergeablePosition(i)) {
				while (true) {
				  toOverridePosition = properties.indexOf(_property, toOverridePosition);
				  if (toOverridePosition == -1)
					break;

				  if (merged[toOverridePosition][2] && !isImportant)
					continue tokensLoop;

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

		  return {
			process: function(body, allowAdjacent) {
			  var tokens = tokenize(body);
			  if (!tokens)
				return body;

			  var optimized = optimize(tokens, allowAdjacent);
			  return rebuild(optimized);
			}
		  };
		};

		return Optimizer;
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
	
	//#region URL: ./text/comments
	require['./text/comments'] = (function () {
		var EscapeStore = require('./text/escape-store');
		
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

			  for (; nextEnd < data.length;) {
				nextStart = data.indexOf('/*', nextEnd);
				nextEnd = data.indexOf('*/', nextStart + 2);
				if (nextStart == -1 || nextEnd == -1)
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

			  if (level === 0 || !next)
				break;
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
	
	//#region URL: ./text/free
	require['./text/free'] = (function () {
		var EscapeStore = require('./text/escape-store');
		
		function Free() {
		  var texts = new EscapeStore('FREE_TEXT');

		  var findNonEscapedEnd = function(data, matched, start) {
			var end = start;
			while (true) {
			  end = data.indexOf(matched, end);

			  if (end > -1 && data[end - 1] == '\\') {
				end += 1;
				continue;
			  } else {
				break;
			  }
			}

			return end;
		  };

		  return {
			// Strip content tags by replacing them by the a special
			// marker for further restoring. It's done via string scanning
			// instead of regexps to speed up the process.
			escape: function(data) {
			  var tempData = [];
			  var nextStart = 0;
			  var nextEnd = 0;
			  var cursor = 0;
			  var matchedParenthesis = null;
			  var singleParenthesis = '\'';
			  var doubleParenthesis = '"';
			  var dataLength = data.length;

			  for (; nextEnd < data.length;) {
				var nextStartSingle = data.indexOf(singleParenthesis, nextEnd + 1);
				var nextStartDouble = data.indexOf(doubleParenthesis, nextEnd + 1);

				if (nextStartSingle == -1)
				  nextStartSingle = dataLength;
				if (nextStartDouble == -1)
				  nextStartDouble = dataLength;

				if (nextStartSingle < nextStartDouble) {
				  nextStart = nextStartSingle;
				  matchedParenthesis = singleParenthesis;
				} else {
				  nextStart = nextStartDouble;
				  matchedParenthesis = doubleParenthesis;
				}

				if (nextStart == -1)
				  break;

				nextEnd = findNonEscapedEnd(data, matchedParenthesis, nextStart + 1);
				if (nextEnd == -1)
				  break;

				var text = data.substring(nextStart, nextEnd + 1);
				var placeholder = texts.store(text);
				tempData.push(data.substring(cursor, nextStart));
				tempData.push(placeholder);
				cursor = nextEnd + 1;
			  }

			  return tempData.length > 0 ?
				tempData.join('') + data.substring(cursor, data.length) :
				data;
			},

			restore: function(data) {
			  return data.replace(texts.placeholderRegExp, texts.restore);
			}
		  };
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
			  return data.replace(urls.placeholderRegExp, urls.restore);
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
			  while (cssData[startsAt] && cssData[startsAt] != '}' && cssData[startsAt] != '{')
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
				var fragment = chunk.substring(nextSpecial, context.cursor + '@font-face'.length + 1);
				var isSingle = fragment.indexOf('@import') === 0 || fragment.indexOf('@charset') === 0;
				if (isSingle) {
				  nextEnd = chunk.indexOf(';', nextSpecial + 1);
				  tokenized.push(chunk.substring(context.cursor, nextEnd + 1));

				  context.cursor = nextEnd + 1;
				} else {
				  nextEnd = chunk.indexOf('{', nextSpecial + 1);
				  var block = chunk.substring(context.cursor, nextEnd).trim();

				  var isFlat = fragment.indexOf('@font-face') === 0;
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
			'ie8': /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:not|:target|:visited|:empty|:first\-of|:last|:nth|:only|:root)/
		  };

		  var minificationsMade = [];

		  var propertyOptimizer = new PropertyOptimizer();

		  var cleanUpSelector = function(selectors) {
			var plain = [];
			selectors = selectors.split(',');

			for (var i = 0, l = selectors.length; i < l; i++) {
			  var sel = selectors[i];

			  if (plain.indexOf(sel) == -1)
				plain.push(sel);
			}

			return plain.sort().join(',');
		  };

		  var isSpecial = function(selector) {
			return specialSelectors[options.selectorsMergeMode || '*'].test(selector);
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
			var matched = {};
			var matchedMoreThanOnce = [];
			var partiallyReduced = [];
			var reduced = false;
			var token, selector, selectors;

			for (var i = 0, l = tokens.length; i < l; i++) {
			  token = tokens[i];
			  selector = token.selector;

			  if (typeof token == 'string' || token.block)
				continue;

			  selectors = selector.indexOf(',') > 0 ?
				[selector].concat(selector.split(',')) :
				[selector];

			  for (var j = 0, m = selectors.length; j < m; j++) {
				var sel = selectors[j];
				var alreadyMatched = matched[sel];
				if (alreadyMatched) {
				  if (alreadyMatched.length == 1)
					matchedMoreThanOnce.push(sel);
				  alreadyMatched.push(i);
				} else {
				  matched[sel] = [i];
				}
			  }
			}

			matchedMoreThanOnce.forEach(function(selector) {
			  var matchPositions = matched[selector];
			  var bodies = [];
			  var joinsAt = [];
			  var j;

			  for (j = 0, m = matchPositions.length; j < m; j++) {
				var body = tokens[matchPositions[j]].body;
				bodies.push(body);
				joinsAt.push((joinsAt[j - 1] || 0) + body.split(';').length);
			  }

			  var optimizedBody = propertyOptimizer.process(bodies.join(';'), joinsAt);
			  var optimizedTokens = optimizedBody.split(';');

			  j = optimizedTokens.length - 1;
			  var currentMatch = matchPositions.length - 1;

			  while (currentMatch >= 0) {
				if (bodies[currentMatch].indexOf(optimizedTokens[j]) > -1 && j > -1) {
				  j -= 1;
				  continue;
				}

				var tokenIndex = matchPositions[currentMatch];
				var token = tokens[tokenIndex];
				var newBody = optimizedTokens.splice(j + 1);
				var reducedBody = [];
				for (var k = 0, n = newBody.length; k < n; k++) {
				  if (newBody[k].length > 0)
					reducedBody.push(newBody[k]);
				}

				if (token.selector == selector) {
				  var joinedBody = reducedBody.join(';');
				  reduced = reduced || (token.body != joinedBody);
				  token.body = joinedBody;
				} else {
				  token._partials = token._partials || [];
				  token._partials.push(reducedBody.join(';'));

				  if (partiallyReduced.indexOf(tokenIndex) == -1)
					partiallyReduced.push(tokenIndex);
				}

				currentMatch -= 1;
			  }
			});

			// process those tokens which were partially reduced
			// i.e. at least one of token's selectors saw reduction
			// if all selectors were reduced to same value we can override it
			for (i = 0, l = partiallyReduced.length; i < l; i++) {
			  token = tokens[partiallyReduced[i]];

			  if (token.body != token._partials[0] && token._partials.length == token.selector.split(',').length) {
				var newBody = token._partials[0];
				for (var k = 1, n = token._partials.length; k < n; k++) {
				  if (token._partials[k] != newBody)
					break;
				}

				if (k == n) {
				  token.body = newBody;
				  reduced = reduced || true;
				}
			  }

			  delete token._partials;
			}

			minificationsMade.unshift(reduced);
		  };

		  var optimize = function(tokens) {
			var firstRun = true;
			var noChanges = function() {
			  return !firstRun &&
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

			  firstRun = false;
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
		var ColorShortener = require('./colors/shortener');
		var ColorHSLToHex = require('./colors/hsl-to-hex');
		var ColorRGBToHex = require('./colors/rgb-to-hex');
		var ColorLongToShortHex = require('./colors/long-to-short-hex');

		var ShorthandNotations = require('./properties/shorthand-notations');
//		var ImportInliner = require('./imports/inliner');
//		var UrlRebase = require('./images/url-rebase');
		var EmptyRemoval = require('./selectors/empty-removal');

		var CommentsProcessor = require('./text/comments');
		var ExpressionsProcessor = require('./text/expressions');
		var FreeTextProcessor = require('./text/free');
		var UrlsProcessor = require('./text/urls');

		var SelectorsOptimizer = require('./selectors/optimizer');

		var exports = function(options) {
		  var lineBreak = process.platform == 'win32' ? '\r\n' : '\n';
//		  var stats = {};
		  var context = {
			errors: [],
			warnings: []
		  };

		  options = options || {};
		  options.keepBreaks = options.keepBreaks || false;

//		  //active by default
//		  if (options.processImport === undefined)
//			options.processImport = true;

		  var minify = function(data) {
//			var startedAt;
//			if (options.debug) {
//			  startedAt = process.hrtime();
//			  stats.originalSize = data.length;
//			}

			var replace = function() {
			  if (typeof arguments[0] == 'function')
				arguments[0]();
			  else
				data = data.replace.apply(data, arguments);
			};

//			// replace function
//			if (options.benchmark) {
//			  var originalReplace = replace;
//			  replace = function(pattern, replacement) {
//				var name = typeof pattern == 'function' ?
//				  /function (\w+)\(/.exec(pattern.toString())[1] :
//				  pattern;
//
//				var start = process.hrtime();
//				originalReplace(pattern, replacement);
//
//				var itTook = process.hrtime(start);
//				console.log('%d ms: ' + name, 1000 * itTook[0] + itTook[1] / 1000000);
//			  };
//			}

			var commentsProcessor = new CommentsProcessor(
			  'keepSpecialComments' in options ? options.keepSpecialComments : '*',
			  options.keepBreaks,
			  lineBreak
			);
			var expressionsProcessor = new ExpressionsProcessor();
			var freeTextProcessor = new FreeTextProcessor();
			var urlsProcessor = new UrlsProcessor();
//			var importInliner = new ImportInliner(context);

//			if (options.processImport) {
//			  // inline all imports
//			  replace(function inlineImports() {
//				data = importInliner.process(data, {
//				  root: options.root || process.cwd(),
//				  relativeTo: options.relativeTo
//				});
//			  });
//			}

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
			replace(/(animation|animation\-name|font|font\-family):([^;}]+)/g, function(match, propertyName, fontDef) {
			  return propertyName + ':' + fontDef.replace(/['"]([\w\-]+)['"]/g, '$1');
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
			  if (suffix == ' ' && next.length > 0 && !/[.\d]/.test(next))
				return match;

			  if (weight == 'normal')
				return property + ':400' + suffix + next;
			  else if (weight == 'bold')
				return property + ':700' + suffix + next;
			  else
				return match;
			});

			// zero + unit to zero
			replace(/(\s|:|,)0(?:px|em|ex|cm|mm|in|pt|pc|%)/g, '$1' + '0');
			replace(/rect\(0(?:px|em|ex|cm|mm|in|pt|pc|%)/g, 'rect(0');

			// round pixels to 2nd decimal place
			replace(/\.(\d{3,})px/g, function(match, decimalPlaces) {
			  return '.' + Math.round(parseFloat('.' + decimalPlaces) * 100) + 'px';
			});

			// fraction zeros removal
			replace(/\.([1-9]*)0+(\D)/g, function(match, nonZeroPart, suffix) {
			  return (nonZeroPart ? '.' : '') + nonZeroPart + suffix;
			});

			// restore 0% in hsl/hsla
			replace(/(hsl|hsla)\(([^\)]+)\)/g, function(match, colorFunction, colorDef) {
			  var tokens = colorDef.split(',');
			  if (tokens[1] == '0')
				tokens[1] = '0%';
			  if (tokens[2] == '0')
				tokens[2] = '0%';
			  return colorFunction + '(' + tokens.join(',') + ')';
			});

			// none to 0
			replace(/(border|border-top|border-right|border-bottom|border-left|outline):none/g, '$1:0');

			// background:none to background:0 0
			replace(/background:(?:none|transparent)([;}])/g, 'background:0 0$1');

			// multiple zeros into one
			replace(/box-shadow:0 0 0 0([^\.])/g, 'box-shadow:0 0$1');
			replace(/:0 0 0 0([^\.])/g, ':0$1');
			replace(/([: ,=\-])0\.(\d)/g, '$1.$2');

			replace(function shorthandNotations() {
			  data = new ShorthandNotations(data).process();
			});

			// restore rect(...) zeros syntax for 4 zeros
			replace(/rect\(\s?0(\s|,)0[ ,]0[ ,]0\s?\)/g, 'rect(0$10$10$10)');

			// remove universal selector when not needed (*#id, *.class etc)
			replace(/\*([\.#:\[])/g, '$1');

			// Restore spaces inside calc back
			replace(/calc\([^\}]+\}/g, function(match) {
			  return match.replace(/\+/g, ' + ');
			});

			// remove space after (rgba|hsla) declaration - see #165
			replace(/(rgba|hsla)\(([^\)]+)\) /g, '$1($2)');

			if (!options.noAdvanced) {
			  replace(function optimizeSelectors() {
				data = new SelectorsOptimizer(data, context, {
				  keepBreaks: options.keepBreaks,
				  lineBreak: lineBreak,
				  selectorsMergeMode: options.selectorsMergeMode
				}).process();
			  });
			}

			replace(function restoreUrls() {
			  data = urlsProcessor.restore(data);
			});
//			replace(function rebaseUrls() {
//			  data = options.noRebase ? data : new UrlRebase(options, context).process(data);
//			});
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

//			if (options.debug) {
//			  var elapsed = process.hrtime(startedAt);
//			  stats.timeSpent = ~~(elapsed[0] * 1e3 + elapsed[1] / 1e6);
//			  stats.efficiency = 1 - data.length / stats.originalSize;
//			  stats.minifiedSize = data.length;
//			}

			return data;
		  };

		  return {
			errors: context.errors,
			lineBreak: lineBreak,
			options: options,
			minify: minify,
//			stats: stats,
			warnings: context.warnings
		  };
		};
		
		return exports;
	}).call(this);
	//#endregion
	
	return require('./clean');
})();