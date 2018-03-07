/*!
 * String.prototype.repeat polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
 */
if (!String.prototype.hasOwnProperty('repeat')) {
	String.prototype.repeat = function (count) {
		var result,
			value,
			processedCount,
			methodName = 'String.prototype.repeat'
			;

		processedCount = +count;
		if (processedCount !== count) {
			processedCount = 0;
		}

		if (processedCount < 0 || processedCount == Infinity) {
			throw new RangeError(methodName + ': argument out of range.');
		}

		value = '' + this;
		processedCount = Math.floor(processedCount);

		if (value.length === 0 || processedCount === 0) {
			return '';
		}

		if (value.length * processedCount >= 1 << 28) {
			throw new RangeError(methodName + ': Repeat count must not overflow maximum string size.');
		}

		result = '';
		for (; ;) {
			if ((processedCount & 1) === 1) {
				result += value;
			}
			processedCount >>>= 1;
			if (processedCount === 0) {
				break;
			}
			value += value;
		}

		return result;
	};
}

/*!
 * Clean-css v4.1.11
 * https://github.com/jakubpawlowicz/clean-css
 *
 * Copyright (C) 2017 JakubPawlowicz.com
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

	//#region URL: os
	modules['os'] = function () {
		var exports = {},
			isWindows = true
			;

		exports.EOL = isWindows ? '\r\n' : '\n';

		return exports;
	};
	//#endregion

	//#region URL: /optimizer/level-0/optimize
	modules['/optimizer/level-0/optimize'] = function () {
		function level0Optimize(tokens) {
		  // noop as level 0 means no optimizations!
		  return tokens;
		}

		return level0Optimize;
	};
	//#endregion

	//#region URL: /optimizer/level-1/optimize
	modules['/optimizer/level-1/optimize'] = function () {
		var shortenHex = require('/optimizer/level-1/shorten-hex');
		var shortenHsl = require('/optimizer/level-1/shorten-hsl');
		var shortenRgb = require('/optimizer/level-1/shorten-rgb');
		var sortSelectors = require('/optimizer/level-1/sort-selectors');
		var tidyRules = require('/optimizer/level-1/tidy-rules');
		var tidyBlock = require('/optimizer/level-1/tidy-block');
		var tidyAtRule = require('/optimizer/level-1/tidy-at-rule');

		var Hack = require('/optimizer/hack');
		var removeUnused = require('/optimizer/remove-unused');
		var restoreFromOptimizing = require('/optimizer/restore-from-optimizing');
		var wrapForOptimizing = require('/optimizer/wrap-for-optimizing').all;

		var OptimizationLevel = require('/options/optimization-level').OptimizationLevel;

		var Token = require('/tokenizer/token');
		var Marker = require('/tokenizer/marker');

		var formatPosition = require('/utils/format-position');
		var split = require('/utils/split');

		var IgnoreProperty = 'ignore-property';

		var CHARSET_TOKEN = '@charset';
		var CHARSET_REGEXP = new RegExp('^' + CHARSET_TOKEN, 'i');

		var DEFAULT_ROUNDING_PRECISION = require('/options/rounding-precision').DEFAULT;

		var WHOLE_PIXEL_VALUE = /(?:^|\s|\()(-?\d+)px/;
		var TIME_VALUE = /^(\-?[\d\.]+)(m?s)$/;

		var HEX_VALUE_PATTERN = /[0-9a-f]/i;
		var PROPERTY_NAME_PATTERN = /^(?:\-chrome\-|\-[\w\-]+\w|\w[\w\-]+\w|\-\-\S+)$/;
		var IMPORT_PREFIX_PATTERN = /^@import/i;
		var QUOTED_PATTERN = /^('.*'|".*")$/;
		var QUOTED_BUT_SAFE_PATTERN = /^['"][a-zA-Z][a-zA-Z\d\-_]+['"]$/;
		var URL_PREFIX_PATTERN = /^url\(/i;
		var VARIABLE_NAME_PATTERN = /^--\S+$/;

		function isNegative(value) {
		  return value && value[1][0] == '-' && parseFloat(value[1]) < 0;
		}

		function isQuoted(value) {
		  return QUOTED_PATTERN.test(value);
		}

		function isUrl(value) {
		  return URL_PREFIX_PATTERN.test(value);
		}

		function normalizeUrl(value) {
		  return value
			.replace(URL_PREFIX_PATTERN, 'url(')
			.replace(/\\?\n|\\?\r\n/g, '');
		}

		function optimizeBackground(property) {
		  var values = property.value;

		  if (values.length == 1 && values[0][1] == 'none') {
			values[0][1] = '0 0';
		  }

		  if (values.length == 1 && values[0][1] == 'transparent') {
			values[0][1] = '0 0';
		  }
		}

		function optimizeBorderRadius(property) {
		  var values = property.value;
		  var spliceAt;

		  if (values.length == 3 && values[1][1] == '/' && values[0][1] == values[2][1]) {
			spliceAt = 1;
		  } else if (values.length == 5 && values[2][1] == '/' && values[0][1] == values[3][1] && values[1][1] == values[4][1]) {
			spliceAt = 2;
		  } else if (values.length == 7 && values[3][1] == '/' && values[0][1] == values[4][1] && values[1][1] == values[5][1] && values[2][1] == values[6][1]) {
			spliceAt = 3;
		  } else if (values.length == 9 && values[4][1] == '/' && values[0][1] == values[5][1] && values[1][1] == values[6][1] && values[2][1] == values[7][1] && values[3][1] == values[8][1]) {
			spliceAt = 4;
		  }

		  if (spliceAt) {
			property.value.splice(spliceAt);
			property.dirty = true;
		  }
		}

		function optimizeColors(name, value, compatibility) {
		  if (value.indexOf('#') === -1 && value.indexOf('rgb') == -1 && value.indexOf('hsl') == -1) {
			return shortenHex(value);
		  }

		  value = value
			.replace(/rgb\((\-?\d+),(\-?\d+),(\-?\d+)\)/g, function (match, red, green, blue) {
			  return shortenRgb(red, green, blue);
			})
			.replace(/hsl\((-?\d+),(-?\d+)%?,(-?\d+)%?\)/g, function (match, hue, saturation, lightness) {
			  return shortenHsl(hue, saturation, lightness);
			})
			.replace(/(^|[^='"])#([0-9a-f]{6})/gi, function (match, prefix, color, at, inputValue) {
			  var suffix = inputValue[at + match.length];

			  if (suffix && HEX_VALUE_PATTERN.test(suffix)) {
				return match;
			  } else if (color[0] == color[1] && color[2] == color[3] && color[4] == color[5]) {
				return (prefix + '#' + color[0] + color[2] + color[4]).toLowerCase();
			  } else {
				return (prefix + '#' + color).toLowerCase();
			  }
			})
			.replace(/(^|[^='"])#([0-9a-f]{3})/gi, function (match, prefix, color) {
			  return prefix + '#' + color.toLowerCase();
			})
			.replace(/(rgb|rgba|hsl|hsla)\(([^\)]+)\)/g, function (match, colorFunction, colorDef) {
			  var tokens = colorDef.split(',');
			  var applies = (colorFunction == 'hsl' && tokens.length == 3) ||
				(colorFunction == 'hsla' && tokens.length == 4) ||
				(colorFunction == 'rgb' && tokens.length == 3 && colorDef.indexOf('%') > 0) ||
				(colorFunction == 'rgba' && tokens.length == 4 && colorDef.indexOf('%') > 0);

			  if (!applies) {
				return match;
			  }

			  if (tokens[1].indexOf('%') == -1) {
				tokens[1] += '%';
			  }

			  if (tokens[2].indexOf('%') == -1) {
				tokens[2] += '%';
			  }

			  return colorFunction + '(' + tokens.join(',') + ')';
			});

		  if (compatibility.colors.opacity && name.indexOf('background') == -1) {
			value = value.replace(/(?:rgba|hsla)\(0,0%?,0%?,0\)/g, function (match) {
			  if (split(value, ',').pop().indexOf('gradient(') > -1) {
				return match;
			  }

			  return 'transparent';
			});
		  }

		  return shortenHex(value);
		}

		function optimizeFilter(property) {
		  if (property.value.length == 1) {
			property.value[0][1] = property.value[0][1].replace(/progid:DXImageTransform\.Microsoft\.(Alpha|Chroma)(\W)/, function (match, filter, suffix) {
			  return filter.toLowerCase() + suffix;
			});
		  }

		  property.value[0][1] = property.value[0][1]
			.replace(/,(\S)/g, ', $1')
			.replace(/ ?= ?/g, '=');
		}

		function optimizeFontWeight(property, atIndex) {
		  var value = property.value[atIndex][1];

		  if (value == 'normal') {
			value = '400';
		  } else if (value == 'bold') {
			value = '700';
		  }

		  property.value[atIndex][1] = value;
		}

		function optimizeMultipleZeros(property) {
		  var values = property.value;
		  var spliceAt;

		  if (values.length == 4 && values[0][1] === '0' && values[1][1] === '0' && values[2][1] === '0' && values[3][1] === '0') {
			if (property.name.indexOf('box-shadow') > -1) {
			  spliceAt = 2;
			} else {
			  spliceAt = 1;
			}
		  }

		  if (spliceAt) {
			property.value.splice(spliceAt);
			property.dirty = true;
		  }
		}

		function optimizeOutline(property) {
		  var values = property.value;

		  if (values.length == 1 && values[0][1] == 'none') {
			values[0][1] = '0';
		  }
		}

		function optimizePixelLengths(_, value, compatibility) {
		  if (!WHOLE_PIXEL_VALUE.test(value)) {
			return value;
		  }

		  return value.replace(WHOLE_PIXEL_VALUE, function (match, val) {
			var newValue;
			var intVal = parseInt(val);

			if (intVal === 0) {
			  return match;
			}

			if (compatibility.properties.shorterLengthUnits && compatibility.units.pt && intVal * 3 % 4 === 0) {
			  newValue = intVal * 3 / 4 + 'pt';
			}

			if (compatibility.properties.shorterLengthUnits && compatibility.units.pc && intVal % 16 === 0) {
			  newValue = intVal / 16 + 'pc';
			}

			if (compatibility.properties.shorterLengthUnits && compatibility.units.in && intVal % 96 === 0) {
			  newValue = intVal / 96 + 'in';
			}

			if (newValue) {
			  newValue = match.substring(0, match.indexOf(val)) + newValue;
			}

			return newValue && newValue.length < match.length ? newValue : match;
		  });
		}

		function optimizePrecision(_, value, precisionOptions) {
		  if (!precisionOptions.enabled || value.indexOf('.') === -1) {
			return value;
		  }

		  return value
			.replace(precisionOptions.decimalPointMatcher, '$1$2$3')
			.replace(precisionOptions.zeroMatcher, function (match, integerPart, fractionPart, unit) {
			  var multiplier = precisionOptions.units[unit].multiplier;
			  var parsedInteger = parseInt(integerPart);
			  var integer = isNaN(parsedInteger) ? 0 : parsedInteger;
			  var fraction = parseFloat(fractionPart);

			  return Math.round((integer + fraction) * multiplier) / multiplier + unit;
			});
		}

		function optimizeTimeUnits(_, value) {
		  if (!TIME_VALUE.test(value))
			return value;

		  return value.replace(TIME_VALUE, function (match, val, unit) {
			var newValue;

			if (unit == 'ms') {
			  newValue = parseInt(val) / 1000 + 's';
			} else if (unit == 's') {
			  newValue = parseFloat(val) * 1000 + 'ms';
			}

			return newValue.length < match.length ? newValue : match;
		  });
		}

		function optimizeUnits(name, value, unitsRegexp) {
		  if (/^(?:\-moz\-calc|\-webkit\-calc|calc|rgb|hsl|rgba|hsla)\(/.test(value)) {
			return value;
		  }

		  if (name == 'flex' || name == '-ms-flex' || name == '-webkit-flex' || name == 'flex-basis' || name == '-webkit-flex-basis') {
			return value;
		  }

		  if (value.indexOf('%') > 0 && (name == 'height' || name == 'max-height' || name == 'width' || name == 'max-width')) {
			return value;
		  }

		  return value
			.replace(unitsRegexp, '$1' + '0' + '$2')
			.replace(unitsRegexp, '$1' + '0' + '$2');
		}

		function optimizeWhitespace(name, value) {
		  if (name.indexOf('filter') > -1 || value.indexOf(' ') == -1 || value.indexOf('expression') === 0) {
			return value;
		  }

		  if (value.indexOf(Marker.SINGLE_QUOTE) > -1 || value.indexOf(Marker.DOUBLE_QUOTE) > -1) {
			return value;
		  }

		  value = value.replace(/\s+/g, ' ');

		  if (value.indexOf('calc') > -1) {
			value = value.replace(/\) ?\/ ?/g, ')/ ');
		  }

		  return value
			.replace(/(\(;?)\s+/g, '$1')
			.replace(/\s+(;?\))/g, '$1')
			.replace(/, /g, ',');
		}

		function optimizeZeroDegUnit(_, value) {
		  if (value.indexOf('0deg') == -1) {
			return value;
		  }

		  return value.replace(/\(0deg\)/g, '(0)');
		}

		function optimizeZeroUnits(name, value) {
		  if (value.indexOf('0') == -1) {
			return value;
		  }

		  if (value.indexOf('-') > -1) {
			value = value
			  .replace(/([^\w\d\-]|^)\-0([^\.]|$)/g, '$10$2')
			  .replace(/([^\w\d\-]|^)\-0([^\.]|$)/g, '$10$2');
		  }

		  return value
			.replace(/(^|\s)0+([1-9])/g, '$1$2')
			.replace(/(^|\D)\.0+(\D|$)/g, '$10$2')
			.replace(/(^|\D)\.0+(\D|$)/g, '$10$2')
			.replace(/\.([1-9]*)0+(\D|$)/g, function (match, nonZeroPart, suffix) {
			  return (nonZeroPart.length > 0 ? '.' : '') + nonZeroPart + suffix;
			})
			.replace(/(^|\D)0\.(\d)/g, '$1.$2');
		}

		function removeQuotes(name, value) {
		  if (name == 'content' || name.indexOf('font-feature-settings') > -1 || name.indexOf('grid-') > -1) {
			return value;
		  }

		  return QUOTED_BUT_SAFE_PATTERN.test(value) ?
			value.substring(1, value.length - 1) :
			value;
		}

		function removeUrlQuotes(value) {
		  return /^url\(['"].+['"]\)$/.test(value) && !/^url\(['"].*[\*\s\(\)'"].*['"]\)$/.test(value) && !/^url\(['"]data:[^;]+;charset/.test(value) ?
			value.replace(/["']/g, '') :
			value;
		}

		function transformValue(propertyName, propertyValue, transformCallback) {
		  var transformedValue = transformCallback(propertyName, propertyValue);

		  if (transformedValue === undefined) {
			return propertyValue;
		  } else if (transformedValue === false) {
			return IgnoreProperty;
		  } else {
			return transformedValue;
		  }
		}

		//

		function optimizeBody(properties, context) {
		  var options = context.options;
		  var levelOptions = options.level[OptimizationLevel.One];
		  var property, name, type, value;
		  var valueIsUrl;
		  var propertyToken;
		  var _properties = wrapForOptimizing(properties, true);

		  propertyLoop:
		  for (var i = 0, l = _properties.length; i < l; i++) {
			property = _properties[i];
			name = property.name;

			if (!PROPERTY_NAME_PATTERN.test(name)) {
			  propertyToken = property.all[property.position];
			  context.warnings.push('Invalid property name \'' + name + '\' at ' + formatPosition(propertyToken[1][2][0]) + '. Ignoring.');
			  property.unused = true;
			}

			if (property.value.length === 0) {
			  propertyToken = property.all[property.position];
			  context.warnings.push('Empty property \'' + name + '\' at ' + formatPosition(propertyToken[1][2][0]) + '. Ignoring.');
			  property.unused = true;
			}

			if (property.hack && (
				(property.hack[0] == Hack.ASTERISK || property.hack[0] == Hack.UNDERSCORE) && !options.compatibility.properties.iePrefixHack ||
				property.hack[0] == Hack.BACKSLASH && !options.compatibility.properties.ieSuffixHack ||
				property.hack[0] == Hack.BANG && !options.compatibility.properties.ieBangHack)) {
			  property.unused = true;
			}

			if (levelOptions.removeNegativePaddings && name.indexOf('padding') === 0 && (isNegative(property.value[0]) || isNegative(property.value[1]) || isNegative(property.value[2]) || isNegative(property.value[3]))) {
			  property.unused = true;
			}

			if (!options.compatibility.properties.ieFilters && isLegacyFilter(property)) {
			  property.unused = true;
			}

			if (property.unused) {
			  continue;
			}

			if (property.block) {
			  optimizeBody(property.value[0][1], context);
			  continue;
			}

			if (VARIABLE_NAME_PATTERN.test(name)) {
			  continue;
			}

			for (var j = 0, m = property.value.length; j < m; j++) {
			  type = property.value[j][0];
			  value = property.value[j][1];
			  valueIsUrl = isUrl(value);

			  if (type == Token.PROPERTY_BLOCK) {
				property.unused = true;
				context.warnings.push('Invalid value token at ' + formatPosition(value[0][1][2][0]) + '. Ignoring.');
				break;
			  }

			  if (valueIsUrl && !context.validator.isUrl(value)) {
				property.unused = true;
				context.warnings.push('Broken URL \'' + value + '\' at ' + formatPosition(property.value[j][2][0]) + '. Ignoring.');
				break;
			  }

			  if (valueIsUrl) {
				value = levelOptions.normalizeUrls ?
				  normalizeUrl(value) :
				  value;
				value = !options.compatibility.properties.urlQuotes ?
				  removeUrlQuotes(value) :
				  value;
			  } else if (isQuoted(value)) {
				value = levelOptions.removeQuotes ?
				  removeQuotes(name, value) :
				  value;
			  } else {
				value = levelOptions.removeWhitespace ?
				  optimizeWhitespace(name, value) :
				  value;
				value = optimizePrecision(name, value, options.precision);
				value = optimizePixelLengths(name, value, options.compatibility);
				value = levelOptions.replaceTimeUnits ?
				  optimizeTimeUnits(name, value) :
				  value;
				value = levelOptions.replaceZeroUnits ?
				  optimizeZeroUnits(name, value) :
				  value;

				if (options.compatibility.properties.zeroUnits) {
				  value = optimizeZeroDegUnit(name, value);
				  value = optimizeUnits(name, value, options.unitsRegexp);
				}

				if (options.compatibility.properties.colors) {
				  value = optimizeColors(name, value, options.compatibility);
				}
			  }

			  value = transformValue(name, value, levelOptions.transform);

			  if (value === IgnoreProperty) {
				property.unused = true;
				continue propertyLoop;
			  }

			  property.value[j][1] = value;
			}

			if (levelOptions.replaceMultipleZeros) {
			  optimizeMultipleZeros(property);
			}

			if (name == 'background' && levelOptions.optimizeBackground) {
			  optimizeBackground(property);
			} else if (name.indexOf('border') === 0 && name.indexOf('radius') > 0 && levelOptions.optimizeBorderRadius) {
			  optimizeBorderRadius(property);
			} else if (name == 'filter'&& levelOptions.optimizeFilter && options.compatibility.properties.ieFilters) {
			  optimizeFilter(property);
			} else if (name == 'font-weight' && levelOptions.optimizeFontWeight) {
			  optimizeFontWeight(property, 0);
			} else if (name == 'outline' && levelOptions.optimizeOutline) {
			  optimizeOutline(property);
			}
		  }

		  restoreFromOptimizing(_properties);
		  removeUnused(_properties);
		  removeComments(properties, options);
		}

		function removeComments(tokens, options) {
		  var token;
		  var i;

		  for (i = 0; i < tokens.length; i++) {
			token = tokens[i];

			if (token[0] != Token.COMMENT) {
			  continue;
			}

			optimizeComment(token, options);

			if (token[1].length === 0) {
			  tokens.splice(i, 1);
			  i--;
			}
		  }
		}

		function optimizeComment(token, options) {
		  if (token[1][2] == Marker.EXCLAMATION && (options.level[OptimizationLevel.One].specialComments == 'all' || options.commentsKept < options.level[OptimizationLevel.One].specialComments)) {
			options.commentsKept++;
			return;
		  }

		  token[1] = [];
		}

		function cleanupCharsets(tokens) {
		  var hasCharset = false;

		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];

			if (token[0] != Token.AT_RULE)
			  continue;

			if (!CHARSET_REGEXP.test(token[1]))
			  continue;

			if (hasCharset || token[1].indexOf(CHARSET_TOKEN) == -1) {
			  tokens.splice(i, 1);
			  i--;
			  l--;
			} else {
			  hasCharset = true;
			  tokens.splice(i, 1);
			  tokens.unshift([Token.AT_RULE, token[1].replace(CHARSET_REGEXP, CHARSET_TOKEN)]);
			}
		  }
		}

		function buildUnitRegexp(options) {
		  var units = ['px', 'em', 'ex', 'cm', 'mm', 'in', 'pt', 'pc', '%'];
		  var otherUnits = ['ch', 'rem', 'vh', 'vm', 'vmax', 'vmin', 'vw'];

		  otherUnits.forEach(function (unit) {
			if (options.compatibility.units[unit]) {
			  units.push(unit);
			}
		  });

		  return new RegExp('(^|\\s|\\(|,)0(?:' + units.join('|') + ')(\\W|$)', 'g');
		}

		function buildPrecisionOptions(roundingPrecision) {
		  var precisionOptions = {
			matcher: null,
			units: {},
		  };
		  var optimizable = [];
		  var unit;
		  var value;

		  for (unit in roundingPrecision) {
			value = roundingPrecision[unit];

			if (value != DEFAULT_ROUNDING_PRECISION) {
			  precisionOptions.units[unit] = {};
			  precisionOptions.units[unit].value = value;
			  precisionOptions.units[unit].multiplier = Math.pow(10, value);

			  optimizable.push(unit);
			}
		  }

		  if (optimizable.length > 0) {
			precisionOptions.enabled = true;
			precisionOptions.decimalPointMatcher = new RegExp('(\\d)\\.($|' + optimizable.join('|') + ')($|\W)', 'g');
			precisionOptions.zeroMatcher = new RegExp('(\\d*)(\\.\\d+)(' + optimizable.join('|') + ')', 'g');
		  }

		  return precisionOptions;
		}

		function isImport(token) {
		  return IMPORT_PREFIX_PATTERN.test(token[1]);
		}

		function isLegacyFilter(property) {
		  var value;

		  if (property.name == 'filter' || property.name == '-ms-filter') {
			value = property.value[0][1];

			return value.indexOf('progid') > -1 ||
			  value.indexOf('alpha') === 0 ||
			  value.indexOf('chroma') === 0;
		  } else {
			return false;
		  }
		}

		function level1Optimize(tokens, context) {
		  var options = context.options;
		  var levelOptions = options.level[OptimizationLevel.One];
		  var ie7Hack = options.compatibility.selectors.ie7Hack;
		  var adjacentSpace = options.compatibility.selectors.adjacentSpace;
		  var spaceAfterClosingBrace = options.compatibility.properties.spaceAfterClosingBrace;
		  var format = options.format;
		  var mayHaveCharset = false;
		  var afterRules = false;

		  options.unitsRegexp = options.unitsRegexp || buildUnitRegexp(options);
		  options.precision = options.precision || buildPrecisionOptions(levelOptions.roundingPrecision);
		  options.commentsKept = options.commentsKept || 0;

		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];

			switch (token[0]) {
			  case Token.AT_RULE:
				token[1] = isImport(token) && afterRules ? '' : token[1];
				token[1] = levelOptions.tidyAtRules ? tidyAtRule(token[1]) : token[1];
				mayHaveCharset = true;
				break;
			  case Token.AT_RULE_BLOCK:
				optimizeBody(token[2], context);
				afterRules = true;
				break;
			  case Token.NESTED_BLOCK:
				token[1] = levelOptions.tidyBlockScopes ? tidyBlock(token[1], spaceAfterClosingBrace) : token[1];
				level1Optimize(token[2], context);
				afterRules = true;
				break;
			  case Token.COMMENT:
				optimizeComment(token, options);
				break;
			  case Token.RULE:
				token[1] = levelOptions.tidySelectors ? tidyRules(token[1], !ie7Hack, adjacentSpace, format, context.warnings) : token[1];
				token[1] = token[1].length > 1 ? sortSelectors(token[1], levelOptions.selectorsSortingMethod) : token[1];
				optimizeBody(token[2], context);
				afterRules = true;
				break;
			}

			if (token[0] == Token.COMMENT && token[1].length === 0 || levelOptions.removeEmpty && (token[1].length === 0 || (token[2] && token[2].length === 0))) {
			  tokens.splice(i, 1);
			  i--;
			  l--;
			}
		  }

		  if (levelOptions.cleanupCharsets && mayHaveCharset) {
			cleanupCharsets(tokens);
		  }

		  return tokens;
		}

		return level1Optimize;
	};
	//#endregion

	//#region URL: /optimizer/level-1/shorten-hex
	modules['/optimizer/level-1/shorten-hex'] = function () {
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

		  if (name.length < hex.length) {
			toName[hex] = name;
		  } else {
			toHex[name] = hex;
		  }
		}

		var toHexPattern = new RegExp('(^| |,|\\))(' + Object.keys(toHex).join('|') + ')( |,|\\)|$)', 'ig');
		var toNamePattern = new RegExp('(' + Object.keys(toName).join('|') + ')([^a-f0-9]|$)', 'ig');

		function hexConverter(match, prefix, colorValue, suffix) {
		  return prefix + toHex[colorValue.toLowerCase()] + suffix;
		}

		function nameConverter(match, colorValue, suffix) {
		  return toName[colorValue.toLowerCase()] + suffix;
		}

		function shortenHex(value) {
		  var hasHex = value.indexOf('#') > -1;
		  var shortened = value.replace(toHexPattern, hexConverter);

		  if (shortened != value) {
			shortened = shortened.replace(toHexPattern, hexConverter);
		  }

		  return hasHex ?
			shortened.replace(toNamePattern, nameConverter) :
			shortened;
		}

		return shortenHex;
	};
	//#endregion

	//#region URL: /optimizer/level-1/shorten-hsl
	modules['/optimizer/level-1/shorten-hsl'] = function () {
		// HSL to RGB converter. Both methods adapted from:
		// http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript

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

		function shortenHsl(hue, saturation, lightness) {
		  var asRgb = hslToRgb(hue, saturation, lightness);
		  var redAsHex = asRgb[0].toString(16);
		  var greenAsHex = asRgb[1].toString(16);
		  var blueAsHex = asRgb[2].toString(16);

		  return '#' +
			((redAsHex.length == 1 ? '0' : '') + redAsHex) +
			((greenAsHex.length == 1 ? '0' : '') + greenAsHex) +
			((blueAsHex.length == 1 ? '0' : '') + blueAsHex);
		}

		return shortenHsl;
	};
	//#endregion

	//#region URL: /optimizer/level-1/shorten-rgb
	modules['/optimizer/level-1/shorten-rgb'] = function () {
		function shortenRgb(red, green, blue) {
		  var normalizedRed = Math.max(0, Math.min(parseInt(red), 255));
		  var normalizedGreen = Math.max(0, Math.min(parseInt(green), 255));
		  var normalizedBlue = Math.max(0, Math.min(parseInt(blue), 255));

		  // Credit: Asen  http://jsbin.com/UPUmaGOc/2/edit?js,console
		  return '#' + ('00000' + (normalizedRed << 16 | normalizedGreen << 8 | normalizedBlue).toString(16)).slice(-6);
		}

		return shortenRgb;
	};
	//#endregion

	//#region URL: /optimizer/level-1/sort-selectors
	modules['/optimizer/level-1/sort-selectors'] = function () {
		var naturalCompare = require('/utils/natural-compare');

		function naturalSorter(scope1, scope2) {
		  return naturalCompare(scope1[1], scope2[1]);
		}

		function standardSorter(scope1, scope2) {
		  return scope1[1] > scope2[1] ? 1 : -1;
		}

		function sortSelectors(selectors, method) {
		  switch (method) {
			case 'natural':
			  return selectors.sort(naturalSorter);
			case 'standard':
			  return selectors.sort(standardSorter);
			case 'none':
			case false:
			  return selectors;
		  }
		}

		return sortSelectors;
	};
	//#endregion

	//#region URL: /optimizer/level-1/tidy-at-rule
	modules['/optimizer/level-1/tidy-at-rule'] = function () {
		function tidyAtRule(value) {
		  return value
			.replace(/\s+/g, ' ')
			.replace(/url\(\s+/g, 'url(')
			.replace(/\s+\)/g, ')')
			.trim();
		}

		return tidyAtRule;
	};
	//#endregion

	//#region URL: /optimizer/level-1/tidy-block
	modules['/optimizer/level-1/tidy-block'] = function () {
		var SUPPORTED_COMPACT_BLOCK_MATCHER = /^@media\W/;

		function tidyBlock(values, spaceAfterClosingBrace) {
		  var withoutSpaceAfterClosingBrace;
		  var i;

		  for (i = values.length - 1; i >= 0; i--) {
			withoutSpaceAfterClosingBrace = !spaceAfterClosingBrace && SUPPORTED_COMPACT_BLOCK_MATCHER.test(values[i][1]);

			values[i][1] = values[i][1]
			  .replace(/\n|\r\n/g, ' ')
			  .replace(/\s+/g, ' ')
			  .replace(/(,|:|\() /g, '$1')
			  .replace(/ \)/g, ')')
			  .replace(/'([a-zA-Z][a-zA-Z\d\-_]+)'/, '$1')
			  .replace(/"([a-zA-Z][a-zA-Z\d\-_]+)"/, '$1')
			  .replace(withoutSpaceAfterClosingBrace ? /\) /g : null, ')');
		  }

		  return values;
		}

		return tidyBlock;
	};
	//#endregion

	//#region URL: /optimizer/level-1/tidy-rules
	modules['/optimizer/level-1/tidy-rules'] = function () {
		var Spaces = require('/options/format').Spaces;
		var Marker = require('/tokenizer/marker');
		var formatPosition = require('/utils/format-position');

		var CASE_ATTRIBUTE_PATTERN = /[\s"'][iI]\s*\]/;
		var CASE_RESTORE_PATTERN = /([\d\w])([iI])\]/g;
		var DOUBLE_QUOTE_CASE_PATTERN = /="([a-zA-Z][a-zA-Z\d\-_]+)"([iI])/g;
		var DOUBLE_QUOTE_PATTERN = /="([a-zA-Z][a-zA-Z\d\-_]+)"(\s|\])/g;
		var HTML_COMMENT_PATTERN = /^(?:(?:<!--|-->)\s*)+/;
		var SINGLE_QUOTE_CASE_PATTERN = /='([a-zA-Z][a-zA-Z\d\-_]+)'([iI])/g;
		var SINGLE_QUOTE_PATTERN = /='([a-zA-Z][a-zA-Z\d\-_]+)'(\s|\])/g;
		var RELATION_PATTERN = /[>\+~]/;
		var WHITESPACE_PATTERN = /\s/;

		var ASTERISK_PLUS_HTML_HACK = '*+html ';
		var ASTERISK_FIRST_CHILD_PLUS_HTML_HACK = '*:first-child+html ';
		var LESS_THAN = '<';

		function hasInvalidCharacters(value) {
		  var isEscaped;
		  var isInvalid = false;
		  var character;
		  var isQuote = false;
		  var i, l;

		  for (i = 0, l = value.length; i < l; i++) {
			character = value[i];

			if (isEscaped) {
			  // continue as always
			} else if (character == Marker.SINGLE_QUOTE || character == Marker.DOUBLE_QUOTE) {
			  isQuote = !isQuote;
			} else if (!isQuote && (character == Marker.CLOSE_CURLY_BRACKET || character == Marker.EXCLAMATION || character == LESS_THAN || character == Marker.SEMICOLON)) {
			  isInvalid = true;
			  break;
			} else if (!isQuote && i === 0 && RELATION_PATTERN.test(character)) {
			  isInvalid = true;
			  break;
			}

			isEscaped = character == Marker.BACK_SLASH;
		  }

		  return isInvalid;
		}

		function removeWhitespace(value, format) {
		  var stripped = [];
		  var character;
		  var isNewLineNix;
		  var isNewLineWin;
		  var isEscaped;
		  var wasEscaped;
		  var isQuoted;
		  var isSingleQuoted;
		  var isDoubleQuoted;
		  var isAttribute;
		  var isRelation;
		  var isWhitespace;
		  var roundBracketLevel = 0;
		  var wasRelation = false;
		  var wasWhitespace = false;
		  var withCaseAttribute = CASE_ATTRIBUTE_PATTERN.test(value);
		  var spaceAroundRelation = format && format.spaces[Spaces.AroundSelectorRelation];
		  var i, l;

		  for (i = 0, l = value.length; i < l; i++) {
			character = value[i];

			isNewLineNix = character == Marker.NEW_LINE_NIX;
			isNewLineWin = character == Marker.NEW_LINE_NIX && value[i - 1] == Marker.NEW_LINE_WIN;
			isQuoted = isSingleQuoted || isDoubleQuoted;
			isRelation = !isAttribute && !isEscaped && roundBracketLevel === 0 && RELATION_PATTERN.test(character);
			isWhitespace = WHITESPACE_PATTERN.test(character);

			if (wasEscaped && isQuoted && isNewLineWin) {
			  // swallow escaped new windows lines in comments
			  stripped.pop();
			  stripped.pop();
			} else if (isEscaped && isQuoted && isNewLineNix) {
			  // swallow escaped new *nix lines in comments
			  stripped.pop();
			} else if (isEscaped) {
			  stripped.push(character);
			} else if (character == Marker.OPEN_SQUARE_BRACKET && !isQuoted) {
			  stripped.push(character);
			  isAttribute = true;
			} else if (character == Marker.CLOSE_SQUARE_BRACKET && !isQuoted) {
			  stripped.push(character);
			  isAttribute = false;
			} else if (character == Marker.OPEN_ROUND_BRACKET && !isQuoted) {
			  stripped.push(character);
			  roundBracketLevel++;
			} else if (character == Marker.CLOSE_ROUND_BRACKET && !isQuoted) {
			  stripped.push(character);
			  roundBracketLevel--;
			} else if (character == Marker.SINGLE_QUOTE && !isQuoted) {
			  stripped.push(character);
			  isSingleQuoted = true;
			} else if (character == Marker.DOUBLE_QUOTE && !isQuoted) {
			  stripped.push(character);
			  isDoubleQuoted = true;
			} else if (character == Marker.SINGLE_QUOTE && isQuoted) {
			  stripped.push(character);
			  isSingleQuoted = false;
			} else if (character == Marker.DOUBLE_QUOTE && isQuoted) {
			  stripped.push(character);
			  isDoubleQuoted = false;
			} else if (isWhitespace && wasRelation && !spaceAroundRelation) {
			  continue;
			} else if (!isWhitespace && wasRelation && spaceAroundRelation) {
			  stripped.push(Marker.SPACE);
			  stripped.push(character);
			} else if (isWhitespace && (isAttribute || roundBracketLevel > 0) && !isQuoted) {
			  // skip space
			} else if (isWhitespace && wasWhitespace && !isQuoted) {
			  // skip extra space
			} else if ((isNewLineWin || isNewLineNix) && (isAttribute || roundBracketLevel > 0) && isQuoted) {
			  // skip newline
			} else if (isRelation && wasWhitespace && !spaceAroundRelation) {
			  stripped.pop();
			  stripped.push(character);
			} else if (isRelation && !wasWhitespace && spaceAroundRelation) {
			  stripped.push(Marker.SPACE);
			  stripped.push(character);
			} else if (isWhitespace) {
			  stripped.push(Marker.SPACE);
			} else {
			  stripped.push(character);
			}

			wasEscaped = isEscaped;
			isEscaped = character == Marker.BACK_SLASH;
			wasRelation = isRelation;
			wasWhitespace = isWhitespace;
		  }

		  return withCaseAttribute ?
			stripped.join('').replace(CASE_RESTORE_PATTERN, '$1 $2]') :
			stripped.join('');
		}

		function removeQuotes(value) {
		  if (value.indexOf('\'') == -1 && value.indexOf('"') == -1) {
			return value;
		  }

		  return value
			.replace(SINGLE_QUOTE_CASE_PATTERN, '=$1 $2')
			.replace(SINGLE_QUOTE_PATTERN, '=$1$2')
			.replace(DOUBLE_QUOTE_CASE_PATTERN, '=$1 $2')
			.replace(DOUBLE_QUOTE_PATTERN, '=$1$2');
		}

		function tidyRules(rules, removeUnsupported, adjacentSpace, format, warnings) {
		  var list = [];
		  var repeated = [];

		  function removeHTMLComment(rule, match) {
			warnings.push('HTML comment \'' + match + '\' at ' + formatPosition(rule[2][0]) + '. Removing.');
			return '';
		  }

		  for (var i = 0, l = rules.length; i < l; i++) {
			var rule = rules[i];
			var reduced = rule[1];

			reduced = reduced.replace(HTML_COMMENT_PATTERN, removeHTMLComment.bind(null, rule));

			if (hasInvalidCharacters(reduced)) {
			  warnings.push('Invalid selector \'' + rule[1] + '\' at ' + formatPosition(rule[2][0]) + '. Ignoring.');
			  continue;
			}

			reduced = removeWhitespace(reduced, format);
			reduced = removeQuotes(reduced);

			if (adjacentSpace && reduced.indexOf('nav') > 0) {
			  reduced = reduced.replace(/\+nav(\S|$)/, '+ nav$1');
			}

			if (removeUnsupported && reduced.indexOf(ASTERISK_PLUS_HTML_HACK) > -1) {
			  continue;
			}

			if (removeUnsupported && reduced.indexOf(ASTERISK_FIRST_CHILD_PLUS_HTML_HACK) > -1) {
			  continue;
			}

			if (reduced.indexOf('*') > -1) {
			  reduced = reduced
				.replace(/\*([:#\.\[])/g, '$1')
				.replace(/^(\:first\-child)?\+html/, '*$1+html');
			}

			if (repeated.indexOf(reduced) > -1) {
			  continue;
			}

			rule[1] = reduced;
			repeated.push(reduced);
			list.push(rule);
		  }

		  if (list.length == 1 && list[0][1].length === 0) {
			warnings.push('Empty selector \'' + list[0][1] + '\' at ' + formatPosition(list[0][2][0]) + '. Ignoring.');
			list = [];
		  }

		  return list;
		}

		return tidyRules;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/every-values-pair
	modules['/optimizer/level-2/properties/every-values-pair'] = function () {
		var Marker = require('/tokenizer/marker');

		function everyValuesPair(fn, left, right) {
		  var leftSize = left.value.length;
		  var rightSize = right.value.length;
		  var total = Math.max(leftSize, rightSize);
		  var lowerBound = Math.min(leftSize, rightSize) - 1;
		  var leftValue;
		  var rightValue;
		  var position;

		  for (position = 0; position < total; position++) {
			leftValue = left.value[position] && left.value[position][1] || leftValue;
			rightValue = right.value[position] && right.value[position][1] || rightValue;

			if (leftValue == Marker.COMMA || rightValue == Marker.COMMA) {
			  continue;
			}

			if (!fn(leftValue, rightValue, position, position <= lowerBound)) {
			  return false;
			}
		  }

		  return true;
		}

		return everyValuesPair;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/find-component-in
	modules['/optimizer/level-2/properties/find-component-in'] = function () {
		var compactable = require('/optimizer/level-2/compactable');

		function findComponentIn(shorthand, longhand) {
		  var comparator = nameComparator(longhand);

		  return findInDirectComponents(shorthand, comparator) || findInSubComponents(shorthand, comparator);
		}

		function nameComparator(to) {
		  return function (property) {
			return to.name === property.name;
		  };
		}

		function findInDirectComponents(shorthand, comparator) {
		  return shorthand.components.filter(comparator)[0];
		}

		function findInSubComponents(shorthand, comparator) {
		  var shorthandComponent;
		  var longhandMatch;
		  var i, l;

		  if (!compactable[shorthand.name].shorthandComponents) {
			return;
		  }

		  for (i = 0, l = shorthand.components.length; i < l; i++) {
			shorthandComponent = shorthand.components[i];
			longhandMatch = findInDirectComponents(shorthandComponent, comparator);

			if (longhandMatch) {
			  return longhandMatch;
			}
		  }

		  return;
		}

		return findComponentIn;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/has-inherit
	modules['/optimizer/level-2/properties/has-inherit'] = function () {
		function hasInherit(property) {
		  for (var i = property.value.length - 1; i >= 0; i--) {
			if (property.value[i][1] == 'inherit')
			  return true;
		  }

		  return false;
		}

		return hasInherit;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/is-component-of
	modules['/optimizer/level-2/properties/is-component-of'] = function () {
		var compactable = require('/optimizer/level-2/compactable');

		function isComponentOf(property1, property2, shallow) {
		  return isDirectComponentOf(property1, property2) ||
			!shallow && !!compactable[property1.name].shorthandComponents && isSubComponentOf(property1, property2);
		}

		function isDirectComponentOf(property1, property2) {
		  var descriptor = compactable[property1.name];

		  return 'components' in descriptor && descriptor.components.indexOf(property2.name) > -1;
		}

		function isSubComponentOf(property1, property2) {
		  return property1
			.components
			.some(function (component) {
			  return isDirectComponentOf(component, property2);
			});
		}

		return isComponentOf;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/is-mergeable-shorthand
	modules['/optimizer/level-2/properties/is-mergeable-shorthand'] = function () {
		var Marker = require('/tokenizer/marker');

		function isMergeableShorthand(shorthand) {
		  if (shorthand.name != 'font') {
			return true;
		  }

		  return shorthand.value[0][1].indexOf(Marker.INTERNAL) == -1;
		}

		return isMergeableShorthand;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/merge-into-shorthands
	modules['/optimizer/level-2/properties/merge-into-shorthands'] = function () {
		var everyValuesPair = require('/optimizer/level-2/properties/every-values-pair');
		var hasInherit = require('/optimizer/level-2/properties/has-inherit');
		var populateComponents = require('/optimizer/level-2/properties/populate-components');

		var compactable = require('/optimizer/level-2/compactable');
		var deepClone = require('/optimizer/level-2/clone').deep;
		var restoreWithComponents = require('/optimizer/level-2/restore-with-components');

		var restoreFromOptimizing = require('/optimizer/restore-from-optimizing');
		var wrapSingle = require('/optimizer/wrap-for-optimizing').single;

		var serializeBody = require('/writer/one-time').body;
		var Token = require('/tokenizer/token');

		function mergeIntoShorthands(properties, validator) {
		  var candidates = {};
		  var descriptor;
		  var componentOf;
		  var property;
		  var i, l;
		  var j, m;

		  // there is no shorthand property made up of less than 3 longhands
		  if (properties.length < 3) {
			return;
		  }

		  for (i = 0, l = properties.length; i < l; i++) {
			property = properties[i];
			descriptor = compactable[property.name];

			if (property.unused) {
			  continue;
			}

			if (property.hack) {
			  continue;
			}

			if (property.block) {
			  continue;
			}

			invalidateOrCompact(properties, i, candidates, validator);

			if (descriptor && descriptor.componentOf) {
			  for (j = 0, m = descriptor.componentOf.length; j < m; j++) {
				componentOf = descriptor.componentOf[j];

				candidates[componentOf] = candidates[componentOf] || {};
				candidates[componentOf][property.name] = property;
			  }
			}
		  }

		  invalidateOrCompact(properties, i, candidates, validator);
		}

		function invalidateOrCompact(properties, position, candidates, validator) {
		  var invalidatedBy = properties[position];
		  var shorthandName;
		  var shorthandDescriptor;
		  var candidateComponents;

		  for (shorthandName in candidates) {
			if (undefined !== invalidatedBy && shorthandName == invalidatedBy.name) {
			  continue;
			}

			shorthandDescriptor = compactable[shorthandName];
			candidateComponents = candidates[shorthandName];
			if (invalidatedBy && invalidates(candidates, shorthandName, invalidatedBy)) {
			  delete candidates[shorthandName];
			  continue;
			}

			if (shorthandDescriptor.components.length > Object.keys(candidateComponents).length) {
			  continue;
			}

			if (mixedImportance(candidateComponents)) {
			  continue;
			}

			if (!overridable(candidateComponents, shorthandName, validator)) {
			  continue;
			}

			if (!mergeable(candidateComponents)) {
			  continue;
			}

			if (mixedInherit(candidateComponents)) {
			  replaceWithInheritBestFit(properties, candidateComponents, shorthandName, validator);
			} else {
			  replaceWithShorthand(properties, candidateComponents, shorthandName, validator);
			}
		  }
		}

		function invalidates(candidates, shorthandName, invalidatedBy) {
		  var shorthandDescriptor = compactable[shorthandName];
		  var invalidatedByDescriptor = compactable[invalidatedBy.name];
		  var componentName;

		  if ('overridesShorthands' in shorthandDescriptor && shorthandDescriptor.overridesShorthands.indexOf(invalidatedBy.name) > -1) {
			return true;
		  }

		  if (invalidatedByDescriptor && 'componentOf' in invalidatedByDescriptor) {
			for (componentName in candidates[shorthandName]) {
			  if (invalidatedByDescriptor.componentOf.indexOf(componentName) > -1) {
				return true;
			  }
			}
		  }

		  return false;
		}

		function mixedImportance(components) {
		  var important;
		  var componentName;

		  for (componentName in components) {
			if (undefined !== important && components[componentName].important != important) {
			  return true;
			}

			important = components[componentName].important;
		  }

		  return false;
		}

		function overridable(components, shorthandName, validator) {
		  var descriptor = compactable[shorthandName];
		  var newValuePlaceholder = [
			Token.PROPERTY,
			[Token.PROPERTY_NAME, shorthandName],
			[Token.PROPERTY_VALUE, descriptor.defaultValue]
		  ];
		  var newProperty = wrapSingle(newValuePlaceholder);
		  var component;
		  var mayOverride;
		  var i, l;

		  populateComponents([newProperty], validator, []);

		  for (i = 0, l = descriptor.components.length; i < l; i++) {
			component = components[descriptor.components[i]];
			mayOverride = compactable[component.name].canOverride;

			if (!everyValuesPair(mayOverride.bind(null, validator), newProperty.components[i], component)) {
			  return false;
			}
		  }

		  return true;
		}

		function mergeable(components) {
		  var lastCount = null;
		  var currentCount;
		  var componentName;
		  var component;
		  var descriptor;
		  var values;

		  for (componentName in components) {
			component = components[componentName];
			descriptor = compactable[componentName];

			if (!('restore' in descriptor)) {
			  continue;
			}

			restoreFromOptimizing([component.all[component.position]], restoreWithComponents);
			values = descriptor.restore(component, compactable);

			currentCount = values.length;

			if (lastCount !== null && currentCount !== lastCount) {
			  return false;
			}

			lastCount = currentCount;
		  }

		  return true;
		}

		function mixedInherit(components) {
		  var componentName;
		  var lastValue = null;
		  var currentValue;

		  for (componentName in components) {
			currentValue = hasInherit(components[componentName]);

			if (lastValue !== null && lastValue !== currentValue) {
			  return true;
			}

			lastValue = currentValue;
		  }

		  return false;
		}

		function replaceWithInheritBestFit(properties, candidateComponents, shorthandName, validator) {
		  var viaLonghands = buildSequenceWithInheritLonghands(candidateComponents, shorthandName, validator);
		  var viaShorthand = buildSequenceWithInheritShorthand(candidateComponents, shorthandName, validator);
		  var longhandTokensSequence = viaLonghands[0];
		  var shorthandTokensSequence = viaShorthand[0];
		  var isLonghandsShorter = serializeBody(longhandTokensSequence).length < serializeBody(shorthandTokensSequence).length;
		  var newTokensSequence = isLonghandsShorter ? longhandTokensSequence : shorthandTokensSequence;
		  var newProperty = isLonghandsShorter ? viaLonghands[1] : viaShorthand[1];
		  var newComponents = isLonghandsShorter ? viaLonghands[2] : viaShorthand[2];
		  var all = candidateComponents[Object.keys(candidateComponents)[0]].all;
		  var componentName;
		  var oldComponent;
		  var newComponent;
		  var newToken;

		  newProperty.position = all.length;
		  newProperty.shorthand = true;
		  newProperty.dirty = true;
		  newProperty.all = all;
		  newProperty.all.push(newTokensSequence[0]);

		  properties.push(newProperty);

		  for (componentName in candidateComponents) {
			oldComponent = candidateComponents[componentName];
			oldComponent.unused = true;

			if (oldComponent.name in newComponents) {
			  newComponent = newComponents[oldComponent.name];
			  newToken = findTokenIn(newTokensSequence, componentName);

			  newComponent.position = all.length;
			  newComponent.all = all;
			  newComponent.all.push(newToken);

			  properties.push(newComponent);
			}
		  }
		}

		function buildSequenceWithInheritLonghands(components, shorthandName, validator) {
		  var tokensSequence = [];
		  var inheritComponents = {};
		  var nonInheritComponents = {};
		  var descriptor = compactable[shorthandName];
		  var shorthandToken = [
			Token.PROPERTY,
			[Token.PROPERTY_NAME, shorthandName],
			[Token.PROPERTY_VALUE, descriptor.defaultValue]
		  ];
		  var newProperty = wrapSingle(shorthandToken);
		  var component;
		  var longhandToken;
		  var newComponent;
		  var nameMetadata;
		  var i, l;

		  populateComponents([newProperty], validator, []);

		  for (i = 0, l = descriptor.components.length; i < l; i++) {
			component = components[descriptor.components[i]];

			if (hasInherit(component)) {
			  longhandToken = component.all[component.position].slice(0, 2);
			  Array.prototype.push.apply(longhandToken, component.value);
			  tokensSequence.push(longhandToken);

			  newComponent = deepClone(component);
			  newComponent.value = inferComponentValue(components, newComponent.name);

			  newProperty.components[i] = newComponent;
			  inheritComponents[component.name] = deepClone(component);
			} else {
			  newComponent = deepClone(component);
			  newComponent.all = component.all;
			  newProperty.components[i] = newComponent;

			  nonInheritComponents[component.name] = component;
			}
		  }

		  nameMetadata = joinMetadata(nonInheritComponents, 1);
		  shorthandToken[1].push(nameMetadata);

		  restoreFromOptimizing([newProperty], restoreWithComponents);

		  shorthandToken = shorthandToken.slice(0, 2);
		  Array.prototype.push.apply(shorthandToken, newProperty.value);

		  tokensSequence.unshift(shorthandToken);

		  return [tokensSequence, newProperty, inheritComponents];
		}

		function inferComponentValue(components, propertyName) {
		  var descriptor = compactable[propertyName];

		  if ('oppositeTo' in descriptor) {
			return components[descriptor.oppositeTo].value;
		  } else {
			return [[Token.PROPERTY_VALUE, descriptor.defaultValue]];
		  }
		}

		function joinMetadata(components, at) {
		  var metadata = [];
		  var component;
		  var originalValue;
		  var componentMetadata;
		  var componentName;

		  for (componentName in components) {
			component = components[componentName];
			originalValue = component.all[component.position];
			componentMetadata = originalValue[at][originalValue[at].length - 1];

			Array.prototype.push.apply(metadata, componentMetadata);
		  }

		  return metadata.sort(metadataSorter);
		}

		function metadataSorter(metadata1, metadata2) {
		  var line1 = metadata1[0];
		  var line2 = metadata2[0];
		  var column1 = metadata1[1];
		  var column2 = metadata2[1];

		  if (line1 < line2) {
			return -1;
		  } else if (line1 === line2) {
			return column1 < column2 ? -1 : 1;
		  } else {
			return 1;
		  }
		}

		function buildSequenceWithInheritShorthand(components, shorthandName, validator) {
		  var tokensSequence = [];
		  var inheritComponents = {};
		  var nonInheritComponents = {};
		  var descriptor = compactable[shorthandName];
		  var shorthandToken = [
			Token.PROPERTY,
			[Token.PROPERTY_NAME, shorthandName],
			[Token.PROPERTY_VALUE, 'inherit']
		  ];
		  var newProperty = wrapSingle(shorthandToken);
		  var component;
		  var longhandToken;
		  var nameMetadata;
		  var valueMetadata;
		  var i, l;

		  populateComponents([newProperty], validator, []);

		  for (i = 0, l = descriptor.components.length; i < l; i++) {
			component = components[descriptor.components[i]];

			if (hasInherit(component)) {
			  inheritComponents[component.name] = component;
			} else {
			  longhandToken = component.all[component.position].slice(0, 2);
			  Array.prototype.push.apply(longhandToken, component.value);
			  tokensSequence.push(longhandToken);

			  nonInheritComponents[component.name] = deepClone(component);
			}
		  }

		  nameMetadata = joinMetadata(inheritComponents, 1);
		  shorthandToken[1].push(nameMetadata);

		  valueMetadata = joinMetadata(inheritComponents, 2);
		  shorthandToken[2].push(valueMetadata);

		  tokensSequence.unshift(shorthandToken);

		  return [tokensSequence, newProperty, nonInheritComponents];
		}

		function findTokenIn(tokens, componentName) {
		  var i, l;

		  for (i = 0, l = tokens.length; i < l; i++) {
			if (tokens[i][1][1] == componentName) {
			  return tokens[i];
			}
		  }
		}

		function replaceWithShorthand(properties, candidateComponents, shorthandName, validator) {
		  var descriptor = compactable[shorthandName];
		  var nameMetadata;
		  var valueMetadata;
		  var newValuePlaceholder = [
			Token.PROPERTY,
			[Token.PROPERTY_NAME, shorthandName],
			[Token.PROPERTY_VALUE, descriptor.defaultValue]
		  ];
		  var all;

		  var newProperty = wrapSingle(newValuePlaceholder);
		  newProperty.shorthand = true;
		  newProperty.dirty = true;

		  populateComponents([newProperty], validator, []);

		  for (var i = 0, l = descriptor.components.length; i < l; i++) {
			var component = candidateComponents[descriptor.components[i]];

			newProperty.components[i] = deepClone(component);
			newProperty.important = component.important;

			all = component.all;
		  }

		  for (var componentName in candidateComponents) {
			candidateComponents[componentName].unused = true;
		  }

		  nameMetadata = joinMetadata(candidateComponents, 1);
		  newValuePlaceholder[1].push(nameMetadata);

		  valueMetadata = joinMetadata(candidateComponents, 2);
		  newValuePlaceholder[2].push(valueMetadata);

		  newProperty.position = all.length;
		  newProperty.all = all;
		  newProperty.all.push(newValuePlaceholder);

		  properties.push(newProperty);
		}

		return mergeIntoShorthands;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/optimize
	modules['/optimizer/level-2/properties/optimize'] = function () {
		var mergeIntoShorthands = require('/optimizer/level-2/properties/merge-into-shorthands');
		var overrideProperties = require('/optimizer/level-2/properties/override-properties');
		var populateComponents = require('/optimizer/level-2/properties/populate-components');

		var restoreWithComponents = require('/optimizer/level-2/restore-with-components');

		var wrapForOptimizing = require('/optimizer/wrap-for-optimizing').all;
		var removeUnused = require('/optimizer/remove-unused');
		var restoreFromOptimizing = require('/optimizer/restore-from-optimizing');

		var OptimizationLevel = require('/options/optimization-level').OptimizationLevel;

		function optimizeProperties(properties, withOverriding, withMerging, context) {
		  var levelOptions = context.options.level[OptimizationLevel.Two];
		  var _properties = wrapForOptimizing(properties, false, levelOptions.skipProperties);
		  var _property;
		  var i, l;

		  populateComponents(_properties, context.validator, context.warnings);

		  for (i = 0, l = _properties.length; i < l; i++) {
			_property = _properties[i];
			if (_property.block) {
			  optimizeProperties(_property.value[0][1], withOverriding, withMerging, context);
			}
		  }

		  if (withMerging && levelOptions.mergeIntoShorthands) {
			mergeIntoShorthands(_properties, context.validator);
		  }

		  if (withOverriding && levelOptions.overrideProperties) {
			overrideProperties(_properties, withMerging, context.options.compatibility, context.validator);
		  }

		  restoreFromOptimizing(_properties, restoreWithComponents);
		  removeUnused(_properties);
		}

		return optimizeProperties;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/override-properties
	modules['/optimizer/level-2/properties/override-properties'] = function () {
		var hasInherit = require('/optimizer/level-2/properties/has-inherit');
		var everyValuesPair = require('/optimizer/level-2/properties/every-values-pair');
		var findComponentIn = require('/optimizer/level-2/properties/find-component-in');
		var isComponentOf = require('/optimizer/level-2/properties/is-component-of');
		var isMergeableShorthand = require('/optimizer/level-2/properties/is-mergeable-shorthand');
		var overridesNonComponentShorthand = require('/optimizer/level-2/properties/overrides-non-component-shorthand');
		var sameVendorPrefixesIn = require('/optimizer/level-2/properties/vendor-prefixes').same;

		var compactable = require('/optimizer/level-2/compactable');
		var deepClone = require('/optimizer/level-2/clone').deep;
		var deepClone = require('/optimizer/level-2/clone').deep;
		var restoreWithComponents = require('/optimizer/level-2/restore-with-components');
		var shallowClone = require('/optimizer/level-2/clone').shallow;

		var restoreFromOptimizing = require('/optimizer/restore-from-optimizing');

		var Token = require('/tokenizer/token');
		var Marker = require('/tokenizer/marker');

		var serializeProperty = require('/writer/one-time').property;

		function wouldBreakCompatibility(property, validator) {
		  for (var i = 0; i < property.components.length; i++) {
			var component = property.components[i];
			var descriptor = compactable[component.name];
			var canOverride = descriptor && descriptor.canOverride || canOverride.sameValue;

			var _component = shallowClone(component);
			_component.value = [[Token.PROPERTY_VALUE, descriptor.defaultValue]];

			if (!everyValuesPair(canOverride.bind(null, validator), _component, component)) {
			  return true;
			}
		  }

		  return false;
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

		  if (compactable[property.name].shorthand) {
			turnShorthandValueIntoMultiplex(property, size);
		  } else {
			turnLonghandValueIntoMultiplex(property, size);
		  }
		}

		function turnShorthandValueIntoMultiplex(property, size) {
		  var component;
		  var i, l;

		  for (i = 0, l = property.components.length; i < l; i++) {
			component = property.components[i];

			if (!component.multiplex) {
			  turnLonghandValueIntoMultiplex(component, size);
			}
		  }
		}

		function turnLonghandValueIntoMultiplex(property, size) {
		  var withRealValue = compactable[property.name].intoMultiplexMode == 'real';
		  var withValue = withRealValue ?
			property.value.slice(0) :
			compactable[property.name].defaultValue;
		  var i = multiplexSize(property);
		  var j;
		  var m = withValue.length;

		  for (; i < size; i++) {
			property.value.push([Token.PROPERTY_VALUE, Marker.COMMA]);

			if (Array.isArray(withValue)) {
			  for (j = 0; j < m; j++) {
				property.value.push(withRealValue ? withValue[j] : [Token.PROPERTY_VALUE, withValue[j]]);
			  }
			} else {
			  property.value.push(withRealValue ? withValue : [Token.PROPERTY_VALUE, withValue]);
			}
		  }
		}

		function multiplexSize(component) {
		  var size = 0;

		  for (var i = 0, l = component.value.length; i < l; i++) {
			if (component.value[i][1] == Marker.COMMA)
			  size++;
		  }

		  return size + 1;
		}

		function lengthOf(property) {
		  var fakeAsArray = [
			Token.PROPERTY,
			[Token.PROPERTY_NAME, property.name]
		  ].concat(property.value);
		  return serializeProperty([fakeAsArray], 0).length;
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

		function overridingFunction(shorthand, validator) {
		  for (var i = 0, l = shorthand.components.length; i < l; i++) {
			if (!anyValue(validator.isUrl, shorthand.components[i]) && anyValue(validator.isFunction, shorthand.components[i])) {
			  return true;
			}
		  }

		  return false;
		}

		function anyValue(fn, property) {
		  for (var i = 0, l = property.value.length; i < l; i++) {
			if (property.value[i][1] == Marker.COMMA)
			  continue;

			if (fn(property.value[i][1]))
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
		  restoreFromOptimizing([multiplexClone], restoreWithComponents);

		  var simpleClone = deepClone(simple);
		  restoreFromOptimizing([simpleClone], restoreWithComponents);

		  var lengthBefore = lengthOf(multiplexClone) + 1 + lengthOf(simpleClone);

		  if (left.multiplex) {
			component = findComponentIn(multiplexClone, simpleClone);
			overrideIntoMultiplex(component, simpleClone);
		  } else {
			component = findComponentIn(simpleClone, multiplexClone);
			turnIntoMultiplex(simpleClone, multiplexSize(multiplexClone));
			overrideByMultiplex(component, multiplexClone);
		  }

		  restoreFromOptimizing([simpleClone], restoreWithComponents);

		  var lengthAfter = lengthOf(simpleClone);

		  return lengthBefore <= lengthAfter;
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
			if (layers[i].length == 1 && layers[i][0][1] == 'none')
			  return true;
		  }

		  return false;
		}

		function intoLayers(values) {
		  var layers = [];

		  for (var i = 0, layer = [], l = values.length; i < l; i++) {
			var value = values[i];
			if (value[1] == Marker.COMMA) {
			  layers.push(layer);
			  layer = [];
			} else {
			  layer.push(value);
			}
		  }

		  layers.push(layer);
		  return layers;
		}

		function overrideProperties(properties, withMerging, compatibility, validator) {
		  var mayOverride, right, left, component;
		  var overriddenComponents;
		  var overriddenComponent;
		  var overridingComponent;
		  var overridable;
		  var i, j, k;

		  propertyLoop:
		  for (i = properties.length - 1; i >= 0; i--) {
			right = properties[i];

			if (!isCompactable(right))
			  continue;

			if (right.block)
			  continue;

			mayOverride = compactable[right.name].canOverride;

			traverseLoop:
			for (j = i - 1; j >= 0; j--) {
			  left = properties[j];

			  if (!isCompactable(left))
				continue;

			  if (left.block)
				continue;

			  if (left.unused || right.unused)
				continue;

			  if (left.hack && !right.hack && !right.important || !left.hack && !left.important && right.hack)
				continue;

			  if (left.important == right.important && left.hack[0] != right.hack[0])
				continue;

			  if (left.important == right.important && (left.hack[0] != right.hack[0] || (left.hack[1] && left.hack[1] != right.hack[1])))
				continue;

			  if (hasInherit(right))
				continue;

			  if (noneOverrideHack(left, right))
				continue;

			  if (right.shorthand && isComponentOf(right, left)) {
				// maybe `left` can be overridden by `right` which is a shorthand?
				if (!right.important && left.important)
				  continue;

				if (!sameVendorPrefixesIn([left], right.components))
				  continue;

				if (!anyValue(validator.isFunction, left) && overridingFunction(right, validator))
				  continue;

				if (!isMergeableShorthand(right)) {
				  left.unused = true;
				  continue;
				}

				component = findComponentIn(right, left);
				mayOverride = compactable[left.name].canOverride;
				if (everyValuesPair(mayOverride.bind(null, validator), left, component)) {
				  left.unused = true;
				}
			  } else if (right.shorthand && overridesNonComponentShorthand(right, left)) {
				// `right` is a shorthand while `left` can be overriden by it, think `border` and `border-top`
				if (!right.important && left.important) {
				  continue;
				}

				if (!sameVendorPrefixesIn([left], right.components)) {
				  continue;
				}

				if (!anyValue(validator.isFunction, left) && overridingFunction(right, validator)) {
				  continue;
				}

				overriddenComponents = left.shorthand ?
				  left.components:
				  [left];

				for (k = overriddenComponents.length - 1; k >= 0; k--) {
				  overriddenComponent = overriddenComponents[k];
				  overridingComponent = findComponentIn(right, overriddenComponent);
				  mayOverride = compactable[overriddenComponent.name].canOverride;

				  if (!everyValuesPair(mayOverride.bind(null, validator), left, overridingComponent)) {
					continue traverseLoop;
				  }
				}

				left.unused = true;
			  } else if (withMerging && left.shorthand && !right.shorthand && isComponentOf(left, right, true)) {
				// maybe `right` can be pulled into `left` which is a shorthand?
				if (right.important && !left.important)
				  continue;

				if (!right.important && left.important) {
				  right.unused = true;
				  continue;
				}

				// Pending more clever algorithm in #527
				if (moreSameShorthands(properties, i - 1, left.name))
				  continue;

				if (overridingFunction(left, validator))
				  continue;

				if (!isMergeableShorthand(left))
				  continue;

				component = findComponentIn(left, right);
				if (everyValuesPair(mayOverride.bind(null, validator), component, right)) {
				  var disabledBackgroundMerging =
					!compatibility.properties.backgroundClipMerging && component.name.indexOf('background-clip') > -1 ||
					!compatibility.properties.backgroundOriginMerging && component.name.indexOf('background-origin') > -1 ||
					!compatibility.properties.backgroundSizeMerging && component.name.indexOf('background-size') > -1;
				  var nonMergeableValue = compactable[right.name].nonMergeableValue === right.value[0][1];

				  if (disabledBackgroundMerging || nonMergeableValue)
					continue;

				  if (!compatibility.properties.merging && wouldBreakCompatibility(left, validator))
					continue;

				  if (component.value[0][1] != right.value[0][1] && (hasInherit(left) || hasInherit(right)))
					continue;

				  if (wouldResultInLongerValue(left, right))
					continue;

				  if (!left.multiplex && right.multiplex)
					turnIntoMultiplex(left, multiplexSize(right));

				  override(component, right);
				  left.dirty = true;
				}
			  } else if (withMerging && left.shorthand && right.shorthand && left.name == right.name) {
				// merge if all components can be merged

				if (!left.multiplex && right.multiplex)
				  continue;

				if (!right.important && left.important) {
				  right.unused = true;
				  continue propertyLoop;
				}

				if (right.important && !left.important) {
				  left.unused = true;
				  continue;
				}

				if (!isMergeableShorthand(right)) {
				  left.unused = true;
				  continue;
				}

				for (k = left.components.length - 1; k >= 0; k--) {
				  var leftComponent = left.components[k];
				  var rightComponent = right.components[k];

				  mayOverride = compactable[leftComponent.name].canOverride;
				  if (!everyValuesPair(mayOverride.bind(null, validator), leftComponent, rightComponent))
					continue propertyLoop;
				}

				overrideShorthand(left, right);
				left.dirty = true;
			  } else if (withMerging && left.shorthand && right.shorthand && isComponentOf(left, right)) {
				// border is a shorthand but any of its components is a shorthand too

				if (!left.important && right.important)
				  continue;

				component = findComponentIn(left, right);
				mayOverride = compactable[right.name].canOverride;
				if (!everyValuesPair(mayOverride.bind(null, validator), component, right))
				  continue;

				if (left.important && !right.important) {
				  right.unused = true;
				  continue;
				}

				var rightRestored = compactable[right.name].restore(right, compactable);
				if (rightRestored.length > 1)
				  continue;

				component = findComponentIn(left, right);
				override(component, right);
				right.dirty = true;
			  } else if (left.name == right.name) {
				// two non-shorthands should be merged based on understandability
				overridable = true;

				if (right.shorthand) {
				  for (k = right.components.length - 1; k >= 0 && overridable; k--) {
					overriddenComponent = left.components[k];
					overridingComponent = right.components[k];
					mayOverride = compactable[overridingComponent.name].canOverride;

					overridable = overridable && everyValuesPair(mayOverride.bind(null, validator), overriddenComponent, overridingComponent);
				  }
				} else {
				  mayOverride = compactable[right.name].canOverride;
				  overridable = everyValuesPair(mayOverride.bind(null, validator), left, right);
				}

				if (left.important && !right.important && overridable) {
				  right.unused = true;
				  continue;
				}

				if (!left.important && right.important && overridable) {
				  left.unused = true;
				  continue;
				}

				if (!overridable) {
				  continue;
				}

				left.unused = true;
			  }
			}
		  }
		}

		return overrideProperties;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/overrides-non-component-shorthand
	modules['/optimizer/level-2/properties/overrides-non-component-shorthand'] = function () {
		var compactable = require('/optimizer/level-2/compactable');

		function overridesNonComponentShorthand(property1, property2) {
		  return property1.name in compactable &&
			'overridesShorthands' in compactable[property1.name] &&
			compactable[property1.name].overridesShorthands.indexOf(property2.name) > -1;
		}

		return overridesNonComponentShorthand;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/populate-components
	modules['/optimizer/level-2/properties/populate-components'] = function () {
		var compactable = require('/optimizer/level-2/compactable');
		var InvalidPropertyError = require('/optimizer/level-2/invalid-property-error');

		function populateComponents(properties, validator, warnings) {
		  var component;
		  var j, m;

		  for (var i = properties.length - 1; i >= 0; i--) {
			var property = properties[i];
			var descriptor = compactable[property.name];

			if (descriptor && descriptor.shorthand) {
			  property.shorthand = true;
			  property.dirty = true;

			  try {
				property.components = descriptor.breakUp(property, compactable, validator);

				if (descriptor.shorthandComponents) {
				  for (j = 0, m = property.components.length; j < m; j++) {
					component = property.components[j];
					component.components = compactable[component.name].breakUp(component, compactable, validator);
				  }
				}
			  } catch (e) {
				if (e instanceof InvalidPropertyError) {
				  property.components = []; // this will set property.unused to true below
				  warnings.push(e.message);
				} else {
				  throw e;
				}
			  }

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

	//#region URL: /optimizer/level-2/properties/understandable
	modules['/optimizer/level-2/properties/understandable'] = function () {
		var sameVendorPrefixes = require('/optimizer/level-2/properties/vendor-prefixes').same;

		function understandable(validator, value1, value2, _position, isPaired) {
		  if (!sameVendorPrefixes(value1, value2)) {
			return false;
		  }

		  if (isPaired && validator.isVariable(value1) !== validator.isVariable(value2)) {
			return false;
		  }

		  return true;
		}

		return understandable;
	};
	//#endregion

	//#region URL: /optimizer/level-2/properties/vendor-prefixes
	modules['/optimizer/level-2/properties/vendor-prefixes'] = function () {
		var VENDOR_PREFIX_PATTERN = /(?:^|\W)(\-\w+\-)/g;

		function unique(value) {
		  var prefixes = [];
		  var match;

		  while ((match = VENDOR_PREFIX_PATTERN.exec(value)) !== null) {
			if (prefixes.indexOf(match[0]) == -1) {
			  prefixes.push(match[0]);
			}
		  }

		  return prefixes;
		}

		function same(value1, value2) {
		  return unique(value1).sort().join(',') == unique(value2).sort().join(',');
		}

		var exports = {
		  unique: unique,
		  same: same
		};

		return exports;
	};
	//#endregion

	//#region URL: /optimizer/level-2/break-up
	modules['/optimizer/level-2/break-up'] = function () {
		var InvalidPropertyError = require('/optimizer/level-2/invalid-property-error');

		var wrapSingle = require('/optimizer/wrap-for-optimizing').single;

		var Token = require('/tokenizer/token');
		var Marker = require('/tokenizer/marker');

		var formatPosition = require('/utils/format-position');

		function _anyIsInherit(values) {
		  var i, l;

		  for (i = 0, l = values.length; i < l; i++) {
			if (values[i][1] == 'inherit') {
			  return true;
			}
		  }

		  return false;
		}

		function _colorFilter(validator) {
		  return function (value) {
			return value[1] == 'invert' || validator.isColor(value[1]) || validator.isPrefixed(value[1]);
		  };
		}

		function _styleFilter(validator) {
		  return function (value) {
			return value[1] != 'inherit' && validator.isStyleKeyword(value[1]) && !validator.isColorFunction(value[1]);
		  };
		}

		function _wrapDefault(name, property, compactable) {
		  var descriptor = compactable[name];
		  if (descriptor.doubleValues && descriptor.defaultValue.length == 2) {
			return wrapSingle([
			  Token.PROPERTY,
			  [Token.PROPERTY_NAME, name],
			  [Token.PROPERTY_VALUE, descriptor.defaultValue[0]],
			  [Token.PROPERTY_VALUE, descriptor.defaultValue[1]]
			]);
		  } else if (descriptor.doubleValues && descriptor.defaultValue.length == 1) {
			return wrapSingle([
			  Token.PROPERTY,
			  [Token.PROPERTY_NAME, name],
			  [Token.PROPERTY_VALUE, descriptor.defaultValue[0]]
			]);
		  } else {
			return wrapSingle([
			  Token.PROPERTY,
			  [Token.PROPERTY_NAME, name],
			  [Token.PROPERTY_VALUE, descriptor.defaultValue]
			]);
		  }
		}

		function _widthFilter(validator) {
		  return function (value) {
			return value[1] != 'inherit' &&
			  (validator.isWidth(value[1]) || validator.isUnit(value[1]) && !validator.isDynamicUnit(value[1])) &&
			  !validator.isStyleKeyword(value[1]) &&
			  !validator.isColorFunction(value[1]);
		  };
		}

		function animation(property, compactable, validator) {
		  var duration = _wrapDefault(property.name + '-duration', property, compactable);
		  var timing = _wrapDefault(property.name + '-timing-function', property, compactable);
		  var delay = _wrapDefault(property.name + '-delay', property, compactable);
		  var iteration = _wrapDefault(property.name + '-iteration-count', property, compactable);
		  var direction = _wrapDefault(property.name + '-direction', property, compactable);
		  var fill = _wrapDefault(property.name + '-fill-mode', property, compactable);
		  var play = _wrapDefault(property.name + '-play-state', property, compactable);
		  var name = _wrapDefault(property.name + '-name', property, compactable);
		  var components = [duration, timing, delay, iteration, direction, fill, play, name];
		  var values = property.value;
		  var value;
		  var durationSet = false;
		  var timingSet = false;
		  var delaySet = false;
		  var iterationSet = false;
		  var directionSet = false;
		  var fillSet = false;
		  var playSet = false;
		  var nameSet = false;
		  var i;
		  var l;

		  if (property.value.length == 1 && property.value[0][1] == 'inherit') {
			duration.value = timing.value = delay.value = iteration.value = direction.value = fill.value = play.value = name.value = property.value;
			return components;
		  }

		  if (values.length > 1 && _anyIsInherit(values)) {
			throw new InvalidPropertyError('Invalid animation values at ' + formatPosition(values[0][2][0]) + '. Ignoring.');
		  }

		  for (i = 0, l = values.length; i < l; i++) {
			value = values[i];

			if (validator.isTime(value[1]) && !durationSet) {
			  duration.value = [value];
			  durationSet = true;
			} else if (validator.isTime(value[1]) && !delaySet) {
			  delay.value = [value];
			  delaySet = true;
			} else if ((validator.isGlobal(value[1]) || validator.isAnimationTimingFunction(value[1])) && !timingSet) {
			  timing.value = [value];
			  timingSet = true;
			} else if ((validator.isAnimationIterationCountKeyword(value[1]) || validator.isPositiveNumber(value[1])) && !iterationSet) {
			  iteration.value = [value];
			  iterationSet = true;
			} else if (validator.isAnimationDirectionKeyword(value[1]) && !directionSet) {
			  direction.value = [value];
			  directionSet = true;
			} else if (validator.isAnimationFillModeKeyword(value[1]) && !fillSet) {
			  fill.value = [value];
			  fillSet = true;
			} else if (validator.isAnimationPlayStateKeyword(value[1]) && !playSet) {
			  play.value = [value];
			  playSet = true;
			} else if ((validator.isAnimationNameKeyword(value[1]) || validator.isIdentifier(value[1])) && !nameSet) {
			  name.value = [value];
			  nameSet = true;
			} else {
			  throw new InvalidPropertyError('Invalid animation value at ' + formatPosition(value[2][0]) + '. Ignoring.');
			}
		  }

		  return components;
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

		  var anyValueSet = false;

		  if (property.value.length == 1 && property.value[0][1] == 'inherit') {
			// NOTE: 'inherit' is not a valid value for background-attachment
			color.value = image.value =  repeat.value = position.value = size.value = origin.value = clip.value = property.value;
			return components;
		  }

		  if (property.value.length == 1 && property.value[0][1] == '0 0') {
			return components;
		  }

		  for (var i = values.length - 1; i >= 0; i--) {
			var value = values[i];

			if (validator.isBackgroundAttachmentKeyword(value[1])) {
			  attachment.value = [value];
			  anyValueSet = true;
			} else if (validator.isBackgroundClipKeyword(value[1]) || validator.isBackgroundOriginKeyword(value[1])) {
			  if (clipSet) {
				origin.value = [value];
				originSet = true;
			  } else {
				clip.value = [value];
				clipSet = true;
			  }
			  anyValueSet = true;
			} else if (validator.isBackgroundRepeatKeyword(value[1])) {
			  if (repeatSet) {
				repeat.value.unshift(value);
			  } else {
				repeat.value = [value];
				repeatSet = true;
			  }
			  anyValueSet = true;
			} else if (validator.isBackgroundPositionKeyword(value[1]) || validator.isBackgroundSizeKeyword(value[1]) || validator.isUnit(value[1]) || validator.isDynamicUnit(value[1])) {
			  if (i > 0) {
				var previousValue = values[i - 1];

				if (previousValue[1] == Marker.FORWARD_SLASH) {
				  size.value = [value];
				} else if (i > 1 && values[i - 2][1] == Marker.FORWARD_SLASH) {
				  size.value = [previousValue, value];
				  i -= 2;
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
			  anyValueSet = true;
			} else if ((color.value[0][1] == compactable[color.name].defaultValue || color.value[0][1] == 'none') && (validator.isColor(value[1]) || validator.isPrefixed(value[1]))) {
			  color.value = [value];
			  anyValueSet = true;
			} else if (validator.isUrl(value[1]) || validator.isFunction(value[1])) {
			  image.value = [value];
			  anyValueSet = true;
			}
		  }

		  if (clipSet && !originSet)
			origin.value = clip.value.slice(0);

		  if (!anyValueSet) {
			throw new InvalidPropertyError('Invalid background value at ' + formatPosition(values[0][2][0]) + '. Ignoring.');
		  }

		  return components;
		}

		function borderRadius(property, compactable) {
		  var values = property.value;
		  var splitAt = -1;

		  for (var i = 0, l = values.length; i < l; i++) {
			if (values[i][1] == Marker.FORWARD_SLASH) {
			  splitAt = i;
			  break;
			}
		  }

		  if (splitAt === 0 || splitAt === values.length - 1) {
			throw new InvalidPropertyError('Invalid border-radius value at ' + formatPosition(values[0][2][0]) + '. Ignoring.');
		  }

		  var target = _wrapDefault(property.name, property, compactable);
		  target.value = splitAt > -1 ?
			values.slice(0, splitAt) :
			values.slice(0);
		  target.components = fourValues(target, compactable);

		  var remainder = _wrapDefault(property.name, property, compactable);
		  remainder.value = splitAt > -1 ?
			values.slice(splitAt + 1) :
			values.slice(0);
		  remainder.components = fourValues(remainder, compactable);

		  for (var j = 0; j < 4; j++) {
			target.components[j].multiplex = true;
			target.components[j].value = target.components[j].value.concat(remainder.components[j].value);
		  }

		  return target.components;
		}

		function font(property, compactable, validator) {
		  var style = _wrapDefault('font-style', property, compactable);
		  var variant = _wrapDefault('font-variant', property, compactable);
		  var weight = _wrapDefault('font-weight', property, compactable);
		  var stretch = _wrapDefault('font-stretch', property, compactable);
		  var size = _wrapDefault('font-size', property, compactable);
		  var height = _wrapDefault('line-height', property, compactable);
		  var family = _wrapDefault('font-family', property, compactable);
		  var components = [style, variant, weight, stretch, size, height, family];
		  var values = property.value;
		  var fuzzyMatched = 4; // style, variant, weight, and stretch
		  var index = 0;
		  var isStretchSet = false;
		  var isStretchValid;
		  var isStyleSet = false;
		  var isStyleValid;
		  var isVariantSet = false;
		  var isVariantValid;
		  var isWeightSet = false;
		  var isWeightValid;
		  var isSizeSet = false;
		  var appendableFamilyName = false;

		  if (!values[index]) {
			throw new InvalidPropertyError('Missing font values at ' + formatPosition(property.all[property.position][1][2][0]) + '. Ignoring.');
		  }

		  if (values.length == 1 && values[0][1] == 'inherit') {
			style.value = variant.value = weight.value = stretch.value = size.value = height.value = family.value = values;
			return components;
		  }

		  if (values.length == 1 && (validator.isFontKeyword(values[0][1]) || validator.isGlobal(values[0][1]) || validator.isPrefixed(values[0][1]))) {
			values[0][1] = Marker.INTERNAL + values[0][1];
			style.value = variant.value = weight.value = stretch.value = size.value = height.value = family.value = values;
			return components;
		  }

		  if (values.length < 2 || !_anyIsFontSize(values, validator) || !_anyIsFontFamily(values, validator)) {
			throw new InvalidPropertyError('Invalid font values at ' + formatPosition(property.all[property.position][1][2][0]) + '. Ignoring.');
		  }

		  if (values.length > 1 && _anyIsInherit(values)) {
			throw new InvalidPropertyError('Invalid font values at ' + formatPosition(values[0][2][0]) + '. Ignoring.');
		  }

		  // fuzzy match style, variant, weight, and stretch on first elements
		  while (index < fuzzyMatched) {
			isStretchValid = validator.isFontStretchKeyword(values[index][1]) || validator.isGlobal(values[index][1]);
			isStyleValid = validator.isFontStyleKeyword(values[index][1]) || validator.isGlobal(values[index][1]);
			isVariantValid = validator.isFontVariantKeyword(values[index][1]) || validator.isGlobal(values[index][1]);
			isWeightValid = validator.isFontWeightKeyword(values[index][1]) || validator.isGlobal(values[index][1]);

			if (isStyleValid && !isStyleSet) {
			  style.value = [values[index]];
			  isStyleSet = true;
			} else if (isVariantValid && !isVariantSet) {
			  variant.value = [values[index]];
			  isVariantSet = true;
			} else if (isWeightValid && !isWeightSet) {
			  weight.value = [values[index]];
			  isWeightSet = true;
			} else if (isStretchValid && !isStretchSet) {
			  stretch.value = [values[index]];
			  isStretchSet = true;
			} else if (isStyleValid && isStyleSet || isVariantValid && isVariantSet || isWeightValid && isWeightSet || isStretchValid && isStretchSet) {
			  throw new InvalidPropertyError('Invalid font style / variant / weight / stretch value at ' + formatPosition(values[0][2][0]) + '. Ignoring.');
			} else {
			  break;
			}

			index++;
		  }

		  // now comes font-size ...
		  if (validator.isFontSizeKeyword(values[index][1]) || validator.isUnit(values[index][1]) && !validator.isDynamicUnit(values[index][1])) {
			size.value = [values[index]];
			isSizeSet = true;
			index++;
		  } else {
			throw new InvalidPropertyError('Missing font size at ' + formatPosition(values[0][2][0]) + '. Ignoring.');
		  }

		  if (!values[index]) {
			throw new InvalidPropertyError('Missing font family at ' + formatPosition(values[0][2][0]) + '. Ignoring.');
		  }

		  // ... and perhaps line-height
		  if (isSizeSet && values[index] && values[index][1] == Marker.FORWARD_SLASH && values[index + 1] && (validator.isLineHeightKeyword(values[index + 1][1]) || validator.isUnit(values[index + 1][1]) || validator.isNumber(values[index + 1][1]))) {
			height.value = [values[index + 1]];
			index++;
			index++;
		  }

		  // ... and whatever comes next is font-family
		  family.value = [];

		  while (values[index]) {
			if (values[index][1] == Marker.COMMA) {
			  appendableFamilyName = false;
			} else {
			  if (appendableFamilyName) {
				family.value[family.value.length - 1][1] += Marker.SPACE + values[index][1];
			  } else {
				family.value.push(values[index]);
			  }

			  appendableFamilyName = true;
			}

			index++;
		  }

		  if (family.value.length === 0) {
			throw new InvalidPropertyError('Missing font family at ' + formatPosition(values[0][2][0]) + '. Ignoring.');
		  }

		  return components;
		}

		function _anyIsFontSize(values, validator) {
		  var value;
		  var i, l;

		  for (i = 0, l = values.length; i < l; i++) {
			value = values[i];

			if (validator.isFontSizeKeyword(value[1]) || validator.isUnit(value[1]) && !validator.isDynamicUnit(value[1]) || validator.isFunction(value[1])) {
			  return true;
			}
		  }

		  return false;
		}

		function _anyIsFontFamily(values, validator) {
		  var value;
		  var i, l;

		  for (i = 0, l = values.length; i < l; i++) {
			value = values[i];

			if (validator.isIdentifier(value[1])) {
			  return true;
			}
		  }

		  return false;
		}

		function fourValues(property, compactable) {
		  var componentNames = compactable[property.name].components;
		  var components = [];
		  var value = property.value;

		  if (value.length < 1)
			return [];

		  if (value.length < 2)
			value[1] = value[0].slice(0);
		  if (value.length < 3)
			value[2] = value[0].slice(0);
		  if (value.length < 4)
			value[3] = value[1].slice(0);

		  for (var i = componentNames.length - 1; i >= 0; i--) {
			var component = wrapSingle([
			  Token.PROPERTY,
			  [Token.PROPERTY_NAME, componentNames[i]]
			]);
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
			  if (values[i][1] == ',')
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
				components[i].value.push([Token.PROPERTY_VALUE, Marker.COMMA]);
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

		  if (property.value.length == 1 && property.value[0][1] == 'inherit') {
			type.value = position.value = image.value = [property.value[0]];
			return components;
		  }

		  var values = property.value.slice(0);
		  var total = values.length;
		  var index = 0;

		  // `image` first...
		  for (index = 0, total = values.length; index < total; index++) {
			if (validator.isUrl(values[index][1]) || values[index][1] == '0') {
			  image.value = [values[index]];
			  values.splice(index, 1);
			  break;
			}
		  }

		  // ... then `position`
		  for (index = 0, total = values.length; index < total; index++) {
			if (validator.isListStylePositionKeyword(values[index][1])) {
			  position.value = [values[index]];
			  values.splice(index, 1);
			  break;
			}
		  }

		  // ... and what's left is a `type`
		  if (values.length > 0 && (validator.isListStyleTypeKeyword(values[0][1]) || validator.isIdentifier(values[0][1]))) {
			type.value = [values[0]];
		  }

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

		  if ((property.value.length == 1 && property.value[0][1] == 'inherit') ||
			  (property.value.length == 3 && property.value[0][1] == 'inherit' && property.value[1][1] == 'inherit' && property.value[2][1] == 'inherit')) {
			color.value = style.value = width.value = [property.value[0]];
			return components;
		  }

		  var values = property.value.slice(0);
		  var match, matches;

		  // NOTE: usually users don't follow the required order of parts in this shorthand,
		  // so we'll try to parse it caring as little about order as possible

		  if (values.length > 0) {
			matches = values.filter(_widthFilter(validator));
			match = matches.length > 1 && (matches[0][1] == 'none' || matches[0][1] == 'auto') ? matches[1] : matches[0];
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
		  animation: animation,
		  background: background,
		  border: widthStyleColor,
		  borderRadius: borderRadius,
		  font: font,
		  fourValues: fourValues,
		  listStyle: listStyle,
		  multiplex: multiplex,
		  outline: widthStyleColor
		};

		return exports;
	};
	//#endregion

	//#region URL: /optimizer/level-2/can-override
	modules['/optimizer/level-2/can-override'] = function () {
		var understandable = require('/optimizer/level-2/properties/understandable');

		function animationIterationCount(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !(validator.isAnimationIterationCountKeyword(value2) || validator.isPositiveNumber(value2))) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  }

		  return validator.isAnimationIterationCountKeyword(value2) || validator.isPositiveNumber(value2);
		}

		function animationName(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !(validator.isAnimationNameKeyword(value2) || validator.isIdentifier(value2))) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  }

		  return validator.isAnimationNameKeyword(value2) || validator.isIdentifier(value2);
		}

		function animationTimingFunction(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !(validator.isAnimationTimingFunction(value2) || validator.isGlobal(value2))) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  }

		  return validator.isAnimationTimingFunction(value2) || validator.isGlobal(value2);
		}

		function areSameFunction(validator, value1, value2) {
		  if (!validator.isFunction(value1) || !validator.isFunction(value2)) {
			return false;
		  }

		  var function1Name = value1.substring(0, value1.indexOf('('));
		  var function2Name = value2.substring(0, value2.indexOf('('));

		  return function1Name === function2Name;
		}

		function backgroundPosition(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !(validator.isBackgroundPositionKeyword(value2) || validator.isGlobal(value2))) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  } else if (validator.isBackgroundPositionKeyword(value2) || validator.isGlobal(value2)) {
			return true;
		  }

		  return unit(validator, value1, value2);
		}

		function backgroundSize(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !(validator.isBackgroundSizeKeyword(value2) || validator.isGlobal(value2))) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  } else if (validator.isBackgroundSizeKeyword(value2) || validator.isGlobal(value2)) {
			return true;
		  }

		  return unit(validator, value1, value2);
		}

		function color(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !validator.isColor(value2)) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  } else if (!validator.colorOpacity && (validator.isRgbColor(value1) || validator.isHslColor(value1))) {
			return false;
		  } else if (!validator.colorOpacity && (validator.isRgbColor(value2) || validator.isHslColor(value2))) {
			return false;
		  } else if (validator.isColor(value1) && validator.isColor(value2)) {
			return true;
		  }

		  return sameFunctionOrValue(validator, value1, value2);
		}

		function components(overrideCheckers) {
		  return function (validator, value1, value2, position) {
			return overrideCheckers[position](validator, value1, value2);
		  };
		}

		function fontFamily(validator, value1, value2) {
		  return understandable(validator, value1, value2, 0, true);
		}

		function image(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !validator.isImage(value2)) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  } else if (validator.isImage(value2)) {
			return true;
		  } else if (validator.isImage(value1)) {
			return false;
		  }

		  return sameFunctionOrValue(validator, value1, value2);
		}

		function keyword(propertyName) {
		  return function(validator, value1, value2) {
			if (!understandable(validator, value1, value2, 0, true) && !validator.isKeyword(propertyName)(value2)) {
			  return false;
			} else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			  return true;
			}

			return validator.isKeyword(propertyName)(value2);
		  };
		}

		function keywordWithGlobal(propertyName) {
		  return function(validator, value1, value2) {
			if (!understandable(validator, value1, value2, 0, true) && !(validator.isKeyword(propertyName)(value2) || validator.isGlobal(value2))) {
			  return false;
			} else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			  return true;
			}

			return validator.isKeyword(propertyName)(value2) || validator.isGlobal(value2);
		  };
		}

		function sameFunctionOrValue(validator, value1, value2) {
		  return areSameFunction(validator, value1, value2) ?
			true :
			value1 === value2;
		}



		function textShadow(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !(validator.isUnit(value2) || validator.isColor(value2) || validator.isGlobal(value2))) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  }

		  return validator.isUnit(value2) || validator.isColor(value2) || validator.isGlobal(value2);
		}

		function time(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !validator.isTime(value2)) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  } else if (validator.isTime(value1) && !validator.isTime(value2)) {
			return false;
		  } else if (validator.isTime(value2)) {
			return true;
		  } else if (validator.isTime(value1)) {
			return false;
		  } else if (validator.isFunction(value1) && !validator.isPrefixed(value1) && validator.isFunction(value2) && !validator.isPrefixed(value2)) {
			return true;
		  }

		  return sameFunctionOrValue(validator, value1, value2);
		}

		function unit(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !validator.isUnit(value2)) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  } else if (validator.isUnit(value1) && !validator.isUnit(value2)) {
			return false;
		  } else if (validator.isUnit(value2)) {
			return true;
		  } else if (validator.isUnit(value1)) {
			return false;
		  } else if (validator.isFunction(value1) && !validator.isPrefixed(value1) && validator.isFunction(value2) && !validator.isPrefixed(value2)) {
			return true;
		  }

		  return sameFunctionOrValue(validator, value1, value2);
		}

		function unitOrKeywordWithGlobal(propertyName) {
		  var byKeyword = keywordWithGlobal(propertyName);

		  return function(validator, value1, value2) {
			return unit(validator, value1, value2) || byKeyword(validator, value1, value2);
		  };
		}

		function unitOrNumber(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !(validator.isUnit(value2) || validator.isNumber(value2))) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  } else if ((validator.isUnit(value1) || validator.isNumber(value1)) && !(validator.isUnit(value2) || validator.isNumber(value2))) {
			return false;
		  } else if (validator.isUnit(value2) || validator.isNumber(value2)) {
			return true;
		  } else if (validator.isUnit(value1) || validator.isNumber(value1)) {
			return false;
		  } else if (validator.isFunction(value1) && !validator.isPrefixed(value1) && validator.isFunction(value2) && !validator.isPrefixed(value2)) {
			return true;
		  }

		  return sameFunctionOrValue(validator, value1, value2);
		}

		function zIndex(validator, value1, value2) {
		  if (!understandable(validator, value1, value2, 0, true) && !validator.isZIndex(value2)) {
			return false;
		  } else if (validator.isVariable(value1) && validator.isVariable(value2)) {
			return true;
		  }

		  return validator.isZIndex(value2);
		}

		var exports = {
		  generic: {
			color: color,
			components: components,
			image: image,
			time: time,
			unit: unit,
			unitOrNumber: unitOrNumber
		  },
		  property: {
			animationDirection: keywordWithGlobal('animation-direction'),
			animationFillMode: keyword('animation-fill-mode'),
			animationIterationCount: animationIterationCount,
			animationName: animationName,
			animationPlayState: keywordWithGlobal('animation-play-state'),
			animationTimingFunction: animationTimingFunction,
			backgroundAttachment: keyword('background-attachment'),
			backgroundClip: keywordWithGlobal('background-clip'),
			backgroundOrigin: keyword('background-origin'),
			backgroundPosition: backgroundPosition,
			backgroundRepeat: keyword('background-repeat'),
			backgroundSize: backgroundSize,
			bottom: unitOrKeywordWithGlobal('bottom'),
			borderCollapse: keyword('border-collapse'),
			borderStyle: keywordWithGlobal('*-style'),
			clear: keywordWithGlobal('clear'),
			cursor: keywordWithGlobal('cursor'),
			display: keywordWithGlobal('display'),
			float: keywordWithGlobal('float'),
			left: unitOrKeywordWithGlobal('left'),
			fontFamily: fontFamily,
			fontStretch: keywordWithGlobal('font-stretch'),
			fontStyle: keywordWithGlobal('font-style'),
			fontVariant: keywordWithGlobal('font-variant'),
			fontWeight: keywordWithGlobal('font-weight'),
			listStyleType: keywordWithGlobal('list-style-type'),
			listStylePosition: keywordWithGlobal('list-style-position'),
			outlineStyle: keywordWithGlobal('*-style'),
			overflow: keywordWithGlobal('overflow'),
			position: keywordWithGlobal('position'),
			right: unitOrKeywordWithGlobal('right'),
			textAlign: keywordWithGlobal('text-align'),
			textDecoration: keywordWithGlobal('text-decoration'),
			textOverflow: keywordWithGlobal('text-overflow'),
			textShadow: textShadow,
			top: unitOrKeywordWithGlobal('top'),
			transform: sameFunctionOrValue,
			verticalAlign: unitOrKeywordWithGlobal('vertical-align'),
			visibility: keywordWithGlobal('visibility'),
			whiteSpace: keywordWithGlobal('white-space'),
			zIndex: zIndex
		  }
		};

		return exports;
	};
	//#endregion

	//#region URL: /optimizer/level-2/clone
	modules['/optimizer/level-2/clone'] = function () {
		var wrapSingle = require('/optimizer/wrap-for-optimizing').single;

		var Token = require('/tokenizer/token');

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
		  var cloned = wrapSingle([
			Token.PROPERTY,
			[Token.PROPERTY_NAME, property.name]
		  ]);
		  cloned.important = property.important;
		  cloned.hack = property.hack;
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

	//#region URL: /optimizer/level-2/compactable
	modules['/optimizer/level-2/compactable'] = function () {
		// Contains the interpretation of CSS properties, as used by the property optimizer

		var breakUp = require('/optimizer/level-2/break-up');
		var canOverride = require('/optimizer/level-2/can-override');
		var restore = require('/optimizer/level-2/restore');

		var override = require('/utils/override');

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
		// * canOverride: function
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
		  'animation': {
			canOverride: canOverride.generic.components([
			  canOverride.generic.time,
			  canOverride.property.animationTimingFunction,
			  canOverride.generic.time,
			  canOverride.property.animationIterationCount,
			  canOverride.property.animationDirection,
			  canOverride.property.animationFillMode,
			  canOverride.property.animationPlayState,
			  canOverride.property.animationName
			]),
			components: [
			  'animation-duration',
			  'animation-timing-function',
			  'animation-delay',
			  'animation-iteration-count',
			  'animation-direction',
			  'animation-fill-mode',
			  'animation-play-state',
			  'animation-name'
			],
			breakUp: breakUp.multiplex(breakUp.animation),
			defaultValue: 'none',
			restore: restore.multiplex(restore.withoutDefaults),
			shorthand: true,
			vendorPrefixes: [
			  '-moz-',
			  '-o-',
			  '-webkit-'
			]
		  },
		  'animation-delay': {
			canOverride: canOverride.generic.time,
			componentOf: [
			  'animation'
			],
			defaultValue: '0s',
			intoMultiplexMode: 'real',
			vendorPrefixes: [
			  '-moz-',
			  '-o-',
			  '-webkit-'
			]
		  },
		  'animation-direction': {
			canOverride: canOverride.property.animationDirection,
			componentOf: [
			  'animation'
			],
			defaultValue: 'normal',
			intoMultiplexMode: 'real',
			vendorPrefixes: [
			  '-moz-',
			  '-o-',
			  '-webkit-'
			]
		  },
		  'animation-duration': {
			canOverride: canOverride.generic.time,
			componentOf: [
			  'animation'
			],
			defaultValue: '0s',
			intoMultiplexMode: 'real',
			keepUnlessDefault: 'animation-delay',
			vendorPrefixes: [
			  '-moz-',
			  '-o-',
			  '-webkit-'
			]
		  },
		  'animation-fill-mode': {
			canOverride: canOverride.property.animationFillMode,
			componentOf: [
			  'animation'
			],
			defaultValue: 'none',
			intoMultiplexMode: 'real',
			vendorPrefixes: [
			  '-moz-',
			  '-o-',
			  '-webkit-'
			]
		  },
		  'animation-iteration-count': {
			canOverride: canOverride.property.animationIterationCount,
			componentOf: [
			  'animation'
			],
			defaultValue: '1',
			intoMultiplexMode: 'real',
			vendorPrefixes: [
			  '-moz-',
			  '-o-',
			  '-webkit-'
			]
		  },
		  'animation-name': {
			canOverride: canOverride.property.animationName,
			componentOf: [
			  'animation'
			],
			defaultValue: 'none',
			intoMultiplexMode: 'real',
			vendorPrefixes: [
			  '-moz-',
			  '-o-',
			  '-webkit-'
			]
		  },
		  'animation-play-state': {
			canOverride: canOverride.property.animationPlayState,
			componentOf: [
			  'animation'
			],
			defaultValue: 'running',
			intoMultiplexMode: 'real',
			vendorPrefixes: [
			  '-moz-',
			  '-o-',
			  '-webkit-'
			]
		  },
		  'animation-timing-function': {
			canOverride: canOverride.property.animationTimingFunction,
			componentOf: [
			  'animation'
			],
			defaultValue: 'ease',
			intoMultiplexMode: 'real',
			vendorPrefixes: [
			  '-moz-',
			  '-o-',
			  '-webkit-'
			]
		  },
		  'background': {
			canOverride: canOverride.generic.components([
			  canOverride.generic.image,
			  canOverride.property.backgroundPosition,
			  canOverride.property.backgroundSize,
			  canOverride.property.backgroundRepeat,
			  canOverride.property.backgroundAttachment,
			  canOverride.property.backgroundOrigin,
			  canOverride.property.backgroundClip,
			  canOverride.generic.color
			]),
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
		  'background-attachment': {
			canOverride: canOverride.property.backgroundAttachment,
			componentOf: [
			  'background'
			],
			defaultValue: 'scroll',
			intoMultiplexMode: 'real'
		  },
		  'background-clip': {
			canOverride: canOverride.property.backgroundClip,
			componentOf: [
			  'background'
			],
			defaultValue: 'border-box',
			intoMultiplexMode: 'real',
			shortestValue: 'border-box'
		  },
		  'background-color': {
			canOverride: canOverride.generic.color,
			componentOf: [
			  'background'
			],
			defaultValue: 'transparent',
			intoMultiplexMode: 'real', // otherwise real color will turn into default since color appears in last multiplex only
			multiplexLastOnly: true,
			nonMergeableValue: 'none',
			shortestValue: 'red'
		  },
		  'background-image': {
			canOverride: canOverride.generic.image,
			componentOf: [
			  'background'
			],
			defaultValue: 'none',
			intoMultiplexMode: 'default'
		  },
		  'background-origin': {
			canOverride: canOverride.property.backgroundOrigin,
			componentOf: [
			  'background'
			],
			defaultValue: 'padding-box',
			intoMultiplexMode: 'real',
			shortestValue: 'border-box'
		  },
		  'background-position': {
			canOverride: canOverride.property.backgroundPosition,
			componentOf: [
			  'background'
			],
			defaultValue: ['0', '0'],
			doubleValues: true,
			intoMultiplexMode: 'real',
			shortestValue: '0'
		  },
		  'background-repeat': {
			canOverride: canOverride.property.backgroundRepeat,
			componentOf: [
			  'background'
			],
			defaultValue: ['repeat'],
			doubleValues: true,
			intoMultiplexMode: 'real'
		  },
		  'background-size': {
			canOverride: canOverride.property.backgroundSize,
			componentOf: [
			  'background'
			],
			defaultValue: ['auto'],
			doubleValues: true,
			intoMultiplexMode: 'real',
			shortestValue: '0 0'
		  },
		  'bottom': {
			canOverride: canOverride.property.bottom,
			defaultValue: 'auto'
		  },
		  'border': {
			breakUp: breakUp.border,
			canOverride: canOverride.generic.components([
			  canOverride.generic.unit,
			  canOverride.property.borderStyle,
			  canOverride.generic.color
			]),
			components: [
			  'border-width',
			  'border-style',
			  'border-color'
			],
			defaultValue: 'none',
			overridesShorthands: [
			  'border-bottom',
			  'border-left',
			  'border-right',
			  'border-top'
			],
			restore: restore.withoutDefaults,
			shorthand: true,
			shorthandComponents: true
		  },
		  'border-bottom': {
			breakUp: breakUp.border,
			canOverride: canOverride.generic.components([
			  canOverride.generic.unit,
			  canOverride.property.borderStyle,
			  canOverride.generic.color
			]),
			components: [
			  'border-bottom-width',
			  'border-bottom-style',
			  'border-bottom-color'
			],
			defaultValue: 'none',
			restore: restore.withoutDefaults,
			shorthand: true
		  },
		  'border-bottom-color': {
			canOverride: canOverride.generic.color,
			componentOf: [
			  'border-bottom',
			  'border-color'
			],
			defaultValue: 'none'
		  },
		  'border-bottom-left-radius': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'border-radius'
			],
			defaultValue: '0',
			vendorPrefixes: [
			  '-moz-',
			  '-o-'
			]
		  },
		  'border-bottom-right-radius': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'border-radius'
			],
			defaultValue: '0',
			vendorPrefixes: [
			  '-moz-',
			  '-o-'
			]
		  },
		  'border-bottom-style': {
			canOverride: canOverride.property.borderStyle,
			componentOf: [
			  'border-bottom',
			  'border-style'
			],
			defaultValue: 'none'
		  },
		  'border-bottom-width': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'border-bottom',
			  'border-width'
			],
			defaultValue: 'medium',
			oppositeTo: 'border-top-width',
			shortestValue: '0'
		  },
		  'border-collapse': {
			canOverride: canOverride.property.borderCollapse,
			defaultValue: 'separate'
		  },
		  'border-color': {
			breakUp: breakUp.fourValues,
			canOverride: canOverride.generic.components([
			  canOverride.generic.color,
			  canOverride.generic.color,
			  canOverride.generic.color,
			  canOverride.generic.color
			]),
			componentOf: [
			  'border'
			],
			components: [
			  'border-top-color',
			  'border-right-color',
			  'border-bottom-color',
			  'border-left-color'
			],
			defaultValue: 'none',
			restore: restore.fourValues,
			shortestValue: 'red',
			shorthand: true
		  },
		  'border-left': {
			breakUp: breakUp.border,
			canOverride: canOverride.generic.components([
			  canOverride.generic.unit,
			  canOverride.property.borderStyle,
			  canOverride.generic.color
			]),
			components: [
			  'border-left-width',
			  'border-left-style',
			  'border-left-color'
			],
			defaultValue: 'none',
			restore: restore.withoutDefaults,
			shorthand: true
		  },
		  'border-left-color': {
			canOverride: canOverride.generic.color,
			componentOf: [
			  'border-color',
			  'border-left'
			],
			defaultValue: 'none'
		  },
		  'border-left-style': {
			canOverride: canOverride.property.borderStyle,
			componentOf: [
			  'border-left',
			  'border-style'
			],
			defaultValue: 'none'
		  },
		  'border-left-width': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'border-left',
			  'border-width'
			],
			defaultValue: 'medium',
			oppositeTo: 'border-right-width',
			shortestValue: '0'
		  },
		  'border-radius': {
			breakUp: breakUp.borderRadius,
			canOverride: canOverride.generic.components([
			  canOverride.generic.unit,
			  canOverride.generic.unit,
			  canOverride.generic.unit,
			  canOverride.generic.unit
			]),
			components: [
			  'border-top-left-radius',
			  'border-top-right-radius',
			  'border-bottom-right-radius',
			  'border-bottom-left-radius'
			],
			defaultValue: '0',
			restore: restore.borderRadius,
			shorthand: true,
			vendorPrefixes: [
			  '-moz-',
			  '-o-'
			]
		  },
		  'border-right': {
			breakUp: breakUp.border,
			canOverride: canOverride.generic.components([
			  canOverride.generic.unit,
			  canOverride.property.borderStyle,
			  canOverride.generic.color
			]),
			components: [
			  'border-right-width',
			  'border-right-style',
			  'border-right-color'
			],
			defaultValue: 'none',
			restore: restore.withoutDefaults,
			shorthand: true
		  },
		  'border-right-color': {
			canOverride: canOverride.generic.color,
			componentOf: [
			  'border-color',
			  'border-right'
			],
			defaultValue: 'none'
		  },
		  'border-right-style': {
			canOverride: canOverride.property.borderStyle,
			componentOf: [
			  'border-right',
			  'border-style'
			],
			defaultValue: 'none'
		  },
		  'border-right-width': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'border-right',
			  'border-width'
			],
			defaultValue: 'medium',
			oppositeTo: 'border-left-width',
			shortestValue: '0'
		  },
		  'border-style': {
			breakUp: breakUp.fourValues,
			canOverride: canOverride.generic.components([
			  canOverride.property.borderStyle,
			  canOverride.property.borderStyle,
			  canOverride.property.borderStyle,
			  canOverride.property.borderStyle
			]),
			componentOf: [
			  'border'
			],
			components: [
			  'border-top-style',
			  'border-right-style',
			  'border-bottom-style',
			  'border-left-style'
			],
			defaultValue: 'none',
			restore: restore.fourValues,
			shorthand: true
		  },
		  'border-top': {
			breakUp: breakUp.border,
			canOverride: canOverride.generic.components([
			  canOverride.generic.unit,
			  canOverride.property.borderStyle,
			  canOverride.generic.color
			]),
			components: [
			  'border-top-width',
			  'border-top-style',
			  'border-top-color'
			],
			defaultValue: 'none',
			restore: restore.withoutDefaults,
			shorthand: true
		  },
		  'border-top-color': {
			canOverride: canOverride.generic.color,
			componentOf: [
			  'border-color',
			  'border-top'
			],
			defaultValue: 'none'
		  },
		  'border-top-left-radius': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'border-radius'
			],
			defaultValue: '0',
			vendorPrefixes: [
			  '-moz-',
			  '-o-'
			]
		  },
		  'border-top-right-radius': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'border-radius'
			],
			defaultValue: '0',
			vendorPrefixes: [
			  '-moz-',
			  '-o-'
			]
		  },
		  'border-top-style': {
			canOverride: canOverride.property.borderStyle,
			componentOf: [
			  'border-style',
			  'border-top'
			],
			defaultValue: 'none'
		  },
		  'border-top-width': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'border-top',
			  'border-width'
			],
			defaultValue: 'medium',
			oppositeTo: 'border-bottom-width',
			shortestValue: '0'
		  },
		  'border-width': {
			breakUp: breakUp.fourValues,
			canOverride: canOverride.generic.components([
			  canOverride.generic.unit,
			  canOverride.generic.unit,
			  canOverride.generic.unit,
			  canOverride.generic.unit
			]),
			componentOf: [
			  'border'
			],
			components: [
			  'border-top-width',
			  'border-right-width',
			  'border-bottom-width',
			  'border-left-width'
			],
			defaultValue: 'medium',
			restore: restore.fourValues,
			shortestValue: '0',
			shorthand: true
		  },
		  'clear': {
			canOverride: canOverride.property.clear,
			defaultValue: 'none'
		  },
		  'color': {
			canOverride: canOverride.generic.color,
			defaultValue: 'transparent',
			shortestValue: 'red'
		  },
		  'cursor': {
			canOverride: canOverride.property.cursor,
			defaultValue: 'auto'
		  },
		  'display': {
			canOverride: canOverride.property.display,
		  },
		  'float': {
			canOverride: canOverride.property.float,
			defaultValue: 'none'
		  },
		  'font': {
			breakUp: breakUp.font,
			canOverride: canOverride.generic.components([
			  canOverride.property.fontStyle,
			  canOverride.property.fontVariant,
			  canOverride.property.fontWeight,
			  canOverride.property.fontStretch,
			  canOverride.generic.unit,
			  canOverride.generic.unit,
			  canOverride.property.fontFamily
			]),
			components: [
			  'font-style',
			  'font-variant',
			  'font-weight',
			  'font-stretch',
			  'font-size',
			  'line-height',
			  'font-family'
			],
			restore: restore.font,
			shorthand: true
		  },
		  'font-family': {
			canOverride: canOverride.property.fontFamily,
			defaultValue: 'user|agent|specific'
		  },
		  'font-size': {
			canOverride: canOverride.generic.unit,
			defaultValue: 'medium',
			shortestValue: '0'
		  },
		  'font-stretch': {
			canOverride: canOverride.property.fontStretch,
			defaultValue: 'normal'
		  },
		  'font-style': {
			canOverride: canOverride.property.fontStyle,
			defaultValue: 'normal'
		  },
		  'font-variant': {
			canOverride: canOverride.property.fontVariant,
			defaultValue: 'normal'
		  },
		  'font-weight': {
			canOverride: canOverride.property.fontWeight,
			defaultValue: 'normal',
			shortestValue: '400'
		  },
		  'height': {
			canOverride: canOverride.generic.unit,
			defaultValue: 'auto',
			shortestValue: '0'
		  },
		  'left': {
			canOverride: canOverride.property.left,
			defaultValue: 'auto'
		  },
		  'line-height': {
			canOverride: canOverride.generic.unitOrNumber,
			defaultValue: 'normal',
			shortestValue: '0'
		  },
		  'list-style': {
			canOverride: canOverride.generic.components([
			  canOverride.property.listStyleType,
			  canOverride.property.listStylePosition,
			  canOverride.property.listStyleImage
			]),
			components: [
			  'list-style-type',
			  'list-style-position',
			  'list-style-image'
			],
			breakUp: breakUp.listStyle,
			restore: restore.withoutDefaults,
			defaultValue: 'outside', // can't use 'disc' because that'd override default 'decimal' for <ol>
			shortestValue: 'none',
			shorthand: true
		  },
		  'list-style-image' : {
			canOverride: canOverride.generic.image,
			componentOf: [
			  'list-style'
			],
			defaultValue: 'none'
		  },
		  'list-style-position' : {
			canOverride: canOverride.property.listStylePosition,
			componentOf: [
			  'list-style'
			],
			defaultValue: 'outside',
			shortestValue: 'inside'
		  },
		  'list-style-type' : {
			canOverride: canOverride.property.listStyleType,
			componentOf: [
			  'list-style'
			],
			// NOTE: we can't tell the real default value here, it's 'disc' for <ul> and 'decimal' for <ol>
			// this is a hack, but it doesn't matter because this value will be either overridden or
			// it will disappear at the final step anyway
			defaultValue: 'decimal|disc',
			shortestValue: 'none'
		  },
		  'margin': {
			breakUp: breakUp.fourValues,
			canOverride: canOverride.generic.components([
			  canOverride.generic.unit,
			  canOverride.generic.unit,
			  canOverride.generic.unit,
			  canOverride.generic.unit
			]),
			components: [
			  'margin-top',
			  'margin-right',
			  'margin-bottom',
			  'margin-left'
			],
			defaultValue: '0',
			restore: restore.fourValues,
			shorthand: true
		  },
		  'margin-bottom': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'margin'
			],
			defaultValue: '0',
			oppositeTo: 'margin-top'
		  },
		  'margin-left': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'margin'
			],
			defaultValue: '0',
			oppositeTo: 'margin-right'
		  },
		  'margin-right': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'margin'
			],
			defaultValue: '0',
			oppositeTo: 'margin-left'
		  },
		  'margin-top': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'margin'
			],
			defaultValue: '0',
			oppositeTo: 'margin-bottom'
		  },
		  'outline': {
			canOverride: canOverride.generic.components([
			  canOverride.generic.color,
			  canOverride.property.outlineStyle,
			  canOverride.generic.unit
			]),
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
			canOverride: canOverride.generic.color,
			componentOf: [
			  'outline'
			],
			defaultValue: 'invert',
			shortestValue: 'red'
		  },
		  'outline-style': {
			canOverride: canOverride.property.outlineStyle,
			componentOf: [
			  'outline'
			],
			defaultValue: 'none'
		  },
		  'outline-width': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'outline'
			],
			defaultValue: 'medium',
			shortestValue: '0'
		  },
		  'overflow': {
			canOverride: canOverride.property.overflow,
			defaultValue: 'visible'
		  },
		  'overflow-x': {
			canOverride: canOverride.property.overflow,
			defaultValue: 'visible'
		  },
		  'overflow-y': {
			canOverride: canOverride.property.overflow,
			defaultValue: 'visible'
		  },
		  'padding': {
			breakUp: breakUp.fourValues,
			canOverride: canOverride.generic.components([
			  canOverride.generic.unit,
			  canOverride.generic.unit,
			  canOverride.generic.unit,
			  canOverride.generic.unit
			]),
			components: [
			  'padding-top',
			  'padding-right',
			  'padding-bottom',
			  'padding-left'
			],
			defaultValue: '0',
			restore: restore.fourValues,
			shorthand: true
		  },
		  'padding-bottom': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'padding'
			],
			defaultValue: '0',
			oppositeTo: 'padding-top'
		  },
		  'padding-left': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'padding'
			],
			defaultValue: '0',
			oppositeTo: 'padding-right'
		  },
		  'padding-right': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'padding'
			],
			defaultValue: '0',
			oppositeTo: 'padding-left'
		  },
		  'padding-top': {
			canOverride: canOverride.generic.unit,
			componentOf: [
			  'padding'
			],
			defaultValue: '0',
			oppositeTo: 'padding-bottom'
		  },
		  'position': {
			canOverride: canOverride.property.position,
			defaultValue: 'static'
		  },
		  'right': {
			canOverride: canOverride.property.right,
			defaultValue: 'auto'
		  },
		  'text-align': {
			canOverride: canOverride.property.textAlign,
			// NOTE: we can't tell the real default value here, as it depends on default text direction
			// this is a hack, but it doesn't matter because this value will be either overridden or
			// it will disappear anyway
			defaultValue: 'left|right'
		  },
		  'text-decoration': {
			canOverride: canOverride.property.textDecoration,
			defaultValue: 'none'
		  },
		  'text-overflow': {
			canOverride: canOverride.property.textOverflow,
			defaultValue: 'none'
		  },
		  'text-shadow': {
			canOverride: canOverride.property.textShadow,
			defaultValue: 'none'
		  },
		  'top': {
			canOverride: canOverride.property.top,
			defaultValue: 'auto'
		  },
		  'transform': {
			canOverride: canOverride.property.transform,
			vendorPrefixes: [
			  '-moz-',
			  '-ms-',
			  '-webkit-'
			]
		  },
		  'vertical-align': {
			canOverride: canOverride.property.verticalAlign,
			defaultValue: 'baseline'
		  },
		  'visibility': {
			canOverride: canOverride.property.visibility,
			defaultValue: 'visible'
		  },
		  'white-space': {
			canOverride: canOverride.property.whiteSpace,
			defaultValue: 'normal'
		  },
		  'width': {
			canOverride: canOverride.generic.unit,
			defaultValue: 'auto',
			shortestValue: '0'
		  },
		  'z-index': {
			canOverride: canOverride.property.zIndex,
			defaultValue: 'auto'
		  }
		};

		function cloneDescriptor(propertyName, prefix) {
		  var clonedDescriptor = override(compactable[propertyName], {});

		  if ('componentOf' in clonedDescriptor) {
			clonedDescriptor.componentOf = clonedDescriptor.componentOf.map(function (shorthandName) {
			  return prefix + shorthandName;
			});
		  }

		  if ('components' in clonedDescriptor) {
			clonedDescriptor.components = clonedDescriptor.components.map(function (longhandName) {
			  return prefix + longhandName;
			});
		  }

		  if ('keepUnlessDefault' in clonedDescriptor) {
			clonedDescriptor.keepUnlessDefault = prefix + clonedDescriptor.keepUnlessDefault;
		  }

		  return clonedDescriptor;
		}

		// generate vendor-prefixed properties
		var vendorPrefixedCompactable = {};

		for (var propertyName in compactable) {
		  var descriptor = compactable[propertyName];

		  if (!('vendorPrefixes' in descriptor)) {
			continue;
		  }

		  for (var i = 0; i < descriptor.vendorPrefixes.length; i++) {
			var prefix = descriptor.vendorPrefixes[i];
			var clonedDescriptor = cloneDescriptor(propertyName, prefix);
			delete clonedDescriptor.vendorPrefixes;

			vendorPrefixedCompactable[prefix + propertyName] = clonedDescriptor;
		  }

		  delete descriptor.vendorPrefixes;
		}

		return override(compactable, vendorPrefixedCompactable);
	};
	//#endregion

	//#region URL: /optimizer/level-2/extract-properties
	modules['/optimizer/level-2/extract-properties'] = function () {
		// This extractor is used in level 2 optimizations
		// IMPORTANT: Mind Token class and this code is not related!
		// Properties will be tokenized in one step, see #429

		var Token = require('/tokenizer/token');
		var serializeRules = require('/writer/one-time').rules;
		var serializeValue = require('/writer/one-time').value;

		function extractProperties(token) {
		  var properties = [];
		  var inSpecificSelector;
		  var property;
		  var name;
		  var value;
		  var i, l;

		  if (token[0] == Token.RULE) {
			inSpecificSelector = !/[\.\+>~]/.test(serializeRules(token[1]));

			for (i = 0, l = token[2].length; i < l; i++) {
			  property = token[2][i];

			  if (property[0] != Token.PROPERTY)
				continue;

			  name = property[1][1];
			  if (name.length === 0)
				continue;

			  if (name.indexOf('--') === 0)
				continue;

			  value = serializeValue(property, i);

			  properties.push([
				name,
				value,
				findNameRoot(name),
				token[2][i],
				name + ':' + value,
				token[1],
				inSpecificSelector
			  ]);
			}
		  } else if (token[0] == Token.NESTED_BLOCK) {
			for (i = 0, l = token[2].length; i < l; i++) {
			  properties = properties.concat(extractProperties(token[2][i]));
			}
		  }

		  return properties;
		}

		function findNameRoot(name) {
		  if (name == 'list-style')
			return name;
		  if (name.indexOf('-radius') > 0)
			return 'border-radius';
		  if (name == 'border-collapse' || name == 'border-spacing' || name == 'border-image')
			return name;
		  if (name.indexOf('border-') === 0 && /^border\-\w+\-\w+$/.test(name))
			return name.match(/border\-\w+/)[0];
		  if (name.indexOf('border-') === 0 && /^border\-\w+$/.test(name))
			return 'border';
		  if (name.indexOf('text-') === 0)
			return name;
		  if (name == '-chrome-')
			return name;

		  return name.replace(/^\-\w+\-/, '').match(/([a-zA-Z]+)/)[0].toLowerCase();
		}

		return extractProperties;
	};
	//#endregion

	//#region URL: /optimizer/level-2/invalid-property-error
	modules['/optimizer/level-2/invalid-property-error'] = function () {
		function InvalidPropertyError(message) {
		  this.name = 'InvalidPropertyError';
		  this.message = message;
		  this.stack = (new Error()).stack;
		}

		InvalidPropertyError.prototype = Object.create(Error.prototype);
		InvalidPropertyError.prototype.constructor = InvalidPropertyError;

		return InvalidPropertyError;
	};
	//#endregion

	//#region URL: /optimizer/level-2/is-mergeable
	modules['/optimizer/level-2/is-mergeable'] = function () {
		var Marker = require('/tokenizer/marker');
		var split = require('/utils/split');

		var DEEP_SELECTOR_PATTERN = /\/deep\//;
		var DOUBLE_COLON_PATTERN = /^::/;
		var NOT_PSEUDO = ':not';
		var PSEUDO_CLASSES_WITH_ARGUMENTS = [
		  ':dir',
		  ':lang',
		  ':not',
		  ':nth-child',
		  ':nth-last-child',
		  ':nth-last-of-type',
		  ':nth-of-type'
		];
		var RELATION_PATTERN = /[>\+~]/;
		var UNMIXABLE_PSEUDO_CLASSES = [
		  ':after',
		  ':before',
		  ':first-letter',
		  ':first-line',
		  ':lang'
		];
		var UNMIXABLE_PSEUDO_ELEMENTS = [
		  '::after',
		  '::before',
		  '::first-letter',
		  '::first-line'
		];

		var Level = {
		  DOUBLE_QUOTE: 'double-quote',
		  SINGLE_QUOTE: 'single-quote',
		  ROOT: 'root'
		};

		function isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging) {
		  var singleSelectors = split(selector, Marker.COMMA);
		  var singleSelector;
		  var i, l;

		  for (i = 0, l = singleSelectors.length; i < l; i++) {
			singleSelector = singleSelectors[i];

			if (singleSelector.length === 0 ||
				isDeepSelector(singleSelector) ||
				(singleSelector.indexOf(Marker.COLON) > -1 && !areMergeable(singleSelector, extractPseudoFrom(singleSelector), mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging))) {
			  return false;
			}
		  }

		  return true;
		}

		function isDeepSelector(selector) {
		  return DEEP_SELECTOR_PATTERN.test(selector);
		}

		function extractPseudoFrom(selector) {
		  var list = [];
		  var character;
		  var buffer = [];
		  var level = Level.ROOT;
		  var roundBracketLevel = 0;
		  var isQuoted;
		  var isEscaped;
		  var isPseudo = false;
		  var isRelation;
		  var wasColon = false;
		  var index;
		  var len;

		  for (index = 0, len = selector.length; index < len; index++) {
			character = selector[index];

			isRelation = !isEscaped && RELATION_PATTERN.test(character);
			isQuoted = level == Level.DOUBLE_QUOTE || level == Level.SINGLE_QUOTE;

			if (isEscaped) {
			  buffer.push(character);
			} else if (character == Marker.DOUBLE_QUOTE && level == Level.ROOT) {
			  buffer.push(character);
			  level = Level.DOUBLE_QUOTE;
			} else if (character == Marker.DOUBLE_QUOTE && level == Level.DOUBLE_QUOTE) {
			  buffer.push(character);
			  level = Level.ROOT;
			} else if (character == Marker.SINGLE_QUOTE && level == Level.ROOT) {
			  buffer.push(character);
			  level = Level.SINGLE_QUOTE;
			} else if (character == Marker.SINGLE_QUOTE && level == Level.SINGLE_QUOTE) {
			  buffer.push(character);
			  level = Level.ROOT;
			} else if (isQuoted) {
			  buffer.push(character);
			} else if (character == Marker.OPEN_ROUND_BRACKET) {
			  buffer.push(character);
			  roundBracketLevel++;
			} else if (character == Marker.CLOSE_ROUND_BRACKET && roundBracketLevel == 1 && isPseudo) {
			  buffer.push(character);
			  list.push(buffer.join(''));
			  roundBracketLevel--;
			  buffer = [];
			  isPseudo = false;
			} else if (character == Marker.CLOSE_ROUND_BRACKET) {
			  buffer.push(character);
			  roundBracketLevel--;
			} else if (character == Marker.COLON && roundBracketLevel === 0 && isPseudo && !wasColon) {
			  list.push(buffer.join(''));
			  buffer = [];
			  buffer.push(character);
			} else if (character == Marker.COLON && roundBracketLevel === 0 && !wasColon) {
			  buffer = [];
			  buffer.push(character);
			  isPseudo = true;
			} else if (character == Marker.SPACE && roundBracketLevel === 0 && isPseudo) {
			  list.push(buffer.join(''));
			  buffer = [];
			  isPseudo = false;
			} else if (isRelation && roundBracketLevel === 0 && isPseudo) {
			  list.push(buffer.join(''));
			  buffer = [];
			  isPseudo = false;
			} else {
			  buffer.push(character);
			}

			isEscaped = character == Marker.BACK_SLASH;
			wasColon = character == Marker.COLON;
		  }

		  if (buffer.length > 0 && isPseudo) {
			list.push(buffer.join(''));
		  }

		  return list;
		}

		function areMergeable(selector, matches, mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging) {
		  return areAllowed(matches, mergeablePseudoClasses, mergeablePseudoElements) &&
			needArguments(matches) &&
			(matches.length < 2 || !someIncorrectlyChained(selector, matches)) &&
			(matches.length < 2 || multiplePseudoMerging && allMixable(matches));
		}

		function areAllowed(matches, mergeablePseudoClasses, mergeablePseudoElements) {
		  var match;
		  var name;
		  var i, l;

		  for (i = 0, l = matches.length; i < l; i++) {
			match = matches[i];
			name = match.indexOf(Marker.OPEN_ROUND_BRACKET) > -1 ?
			  match.substring(0, match.indexOf(Marker.OPEN_ROUND_BRACKET)) :
			  match;

			if (mergeablePseudoClasses.indexOf(name) === -1 && mergeablePseudoElements.indexOf(name) === -1) {
			  return false;
			}
		  }

		  return true;
		}

		function needArguments(matches) {
		  var match;
		  var name;
		  var bracketOpensAt;
		  var hasArguments;
		  var i, l;

		  for (i = 0, l = matches.length; i < l; i++) {
			match = matches[i];

			bracketOpensAt = match.indexOf(Marker.OPEN_ROUND_BRACKET);
			hasArguments = bracketOpensAt > -1;
			name = hasArguments ?
			  match.substring(0, bracketOpensAt) :
			  match;

			if (hasArguments && PSEUDO_CLASSES_WITH_ARGUMENTS.indexOf(name) == -1) {
			  return false;
			}

			if (!hasArguments && PSEUDO_CLASSES_WITH_ARGUMENTS.indexOf(name) > -1) {
			  return false;
			}
		  }

		  return true;
		}

		function someIncorrectlyChained(selector, matches) {
		  var positionInSelector = 0;
		  var match;
		  var matchAt;
		  var nextMatch;
		  var nextMatchAt;
		  var name;
		  var nextName;
		  var areChained;
		  var i, l;

		  for (i = 0, l = matches.length; i < l; i++) {
			match = matches[i];
			nextMatch = matches[i + 1];

			if (!nextMatch) {
			  break;
			}

			matchAt = selector.indexOf(match, positionInSelector);
			nextMatchAt = selector.indexOf(match, matchAt + 1);
			positionInSelector = nextMatchAt;
			areChained = matchAt + match.length == nextMatchAt;

			if (areChained) {
			  name = match.indexOf(Marker.OPEN_ROUND_BRACKET) > -1 ?
				match.substring(0, match.indexOf(Marker.OPEN_ROUND_BRACKET)) :
				match;
			  nextName = nextMatch.indexOf(Marker.OPEN_ROUND_BRACKET) > -1 ?
				nextMatch.substring(0, nextMatch.indexOf(Marker.OPEN_ROUND_BRACKET)) :
				nextMatch;

			  if (name != NOT_PSEUDO || nextName != NOT_PSEUDO) {
				return true;
			  }
			}
		  }

		  return false;
		}

		function allMixable(matches) {
		  var unmixableMatches = 0;
		  var match;
		  var i, l;

		  for (i = 0, l = matches.length; i < l; i++) {
			match = matches[i];

			if (isPseudoElement(match)) {
			  unmixableMatches += UNMIXABLE_PSEUDO_ELEMENTS.indexOf(match) > -1 ? 1 : 0;
			} else {
			  unmixableMatches += UNMIXABLE_PSEUDO_CLASSES.indexOf(match) > -1 ? 1 : 0;
			}

			if (unmixableMatches > 1) {
			  return false;
			}
		  }

		  return true;
		}

		function isPseudoElement(pseudo) {
		  return DOUBLE_COLON_PATTERN.test(pseudo);
		}

		return isMergeable;
	};
	//#endregion

	//#region URL: /optimizer/level-2/merge-adjacent
	modules['/optimizer/level-2/merge-adjacent'] = function () {
		var isMergeable = require('/optimizer/level-2/is-mergeable');

		var optimizeProperties = require('/optimizer/level-2/properties/optimize');

		var sortSelectors = require('/optimizer/level-1/sort-selectors');
		var tidyRules = require('/optimizer/level-1/tidy-rules');

		var OptimizationLevel = require('/options/optimization-level').OptimizationLevel;

		var serializeBody = require('/writer/one-time').body;
		var serializeRules = require('/writer/one-time').rules;

		var Token = require('/tokenizer/token');

		function mergeAdjacent(tokens, context) {
		  var lastToken = [null, [], []];
		  var options = context.options;
		  var adjacentSpace = options.compatibility.selectors.adjacentSpace;
		  var selectorsSortingMethod = options.level[OptimizationLevel.One].selectorsSortingMethod;
		  var mergeablePseudoClasses = options.compatibility.selectors.mergeablePseudoClasses;
		  var mergeablePseudoElements = options.compatibility.selectors.mergeablePseudoElements;
		  var mergeLimit = options.compatibility.selectors.mergeLimit;
		  var multiplePseudoMerging = options.compatibility.selectors.multiplePseudoMerging;

		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];

			if (token[0] != Token.RULE) {
			  lastToken = [null, [], []];
			  continue;
			}

			if (lastToken[0] == Token.RULE && serializeRules(token[1]) == serializeRules(lastToken[1])) {
			  Array.prototype.push.apply(lastToken[2], token[2]);
			  optimizeProperties(lastToken[2], true, true, context);
			  token[2] = [];
			} else if (lastToken[0] == Token.RULE && serializeBody(token[2]) == serializeBody(lastToken[2]) &&
				isMergeable(serializeRules(token[1]), mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging) &&
				isMergeable(serializeRules(lastToken[1]), mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging) &&
				lastToken[1].length < mergeLimit) {
			  lastToken[1] = tidyRules(lastToken[1].concat(token[1]), false, adjacentSpace, false, context.warnings);
			  lastToken[1] = lastToken.length > 1 ? sortSelectors(lastToken[1], selectorsSortingMethod) : lastToken[1];
			  token[2] = [];
			} else {
			  lastToken = token;
			}
		  }
		}

		return mergeAdjacent;
	};
	//#endregion

	//#region URL: /optimizer/level-2/merge-media-queries
	modules['/optimizer/level-2/merge-media-queries'] = function () {
		var canReorder = require('/optimizer/level-2/reorderable').canReorder;
		var canReorderSingle = require('/optimizer/level-2/reorderable').canReorderSingle;
		var extractProperties = require('/optimizer/level-2/extract-properties');
		var rulesOverlap = require('/optimizer/level-2/rules-overlap');

		var serializeRules = require('/writer/one-time').rules;
		var OptimizationLevel = require('/options/optimization-level').OptimizationLevel;
		var Token = require('/tokenizer/token');

		function mergeMediaQueries(tokens, context) {
		  var mergeSemantically = context.options.level[OptimizationLevel.Two].mergeSemantically;
		  var specificityCache = context.cache.specificity;
		  var candidates = {};
		  var reduced = [];

		  for (var i = tokens.length - 1; i >= 0; i--) {
			var token = tokens[i];
			if (token[0] != Token.NESTED_BLOCK) {
			  continue;
			}

			var key = serializeRules(token[1]);
			var candidate = candidates[key];
			if (!candidate) {
			  candidate = [];
			  candidates[key] = candidate;
			}

			candidate.push(i);
		  }

		  for (var name in candidates) {
			var positions = candidates[name];

			positionLoop:
			for (var j = positions.length - 1; j > 0; j--) {
			  var positionOne = positions[j];
			  var tokenOne = tokens[positionOne];
			  var positionTwo = positions[j - 1];
			  var tokenTwo = tokens[positionTwo];

			  directionLoop:
			  for (var direction = 1; direction >= -1; direction -= 2) {
				var topToBottom = direction == 1;
				var from = topToBottom ? positionOne + 1 : positionTwo - 1;
				var to = topToBottom ? positionTwo : positionOne;
				var delta = topToBottom ? 1 : -1;
				var source = topToBottom ? tokenOne : tokenTwo;
				var target = topToBottom ? tokenTwo : tokenOne;
				var movedProperties = extractProperties(source);

				while (from != to) {
				  var traversedProperties = extractProperties(tokens[from]);
				  from += delta;

				  if (mergeSemantically && allSameRulePropertiesCanBeReordered(movedProperties, traversedProperties, specificityCache)) {
					continue;
				  }

				  if (!canReorder(movedProperties, traversedProperties, specificityCache))
					continue directionLoop;
				}

				target[2] = topToBottom ?
				  source[2].concat(target[2]) :
				  target[2].concat(source[2]);
				source[2] = [];

				reduced.push(target);
				continue positionLoop;
			  }
			}
		  }

		  return reduced;
		}

		function allSameRulePropertiesCanBeReordered(movedProperties, traversedProperties, specificityCache) {
		  var movedProperty;
		  var movedRule;
		  var traversedProperty;
		  var traversedRule;
		  var i, l;
		  var j, m;

		  for (i = 0, l = movedProperties.length; i < l; i++) {
			movedProperty = movedProperties[i];
			movedRule = movedProperty[5];

			for (j = 0, m = traversedProperties.length; j < m; j++) {
			  traversedProperty = traversedProperties[j];
			  traversedRule = traversedProperty[5];

			  if (rulesOverlap(movedRule, traversedRule, true) && !canReorderSingle(movedProperty, traversedProperty, specificityCache)) {
				return false;
			  }
			}
		  }

		  return true;
		}

		return mergeMediaQueries;
	};
	//#endregion

	//#region URL: /optimizer/level-2/merge-non-adjacent-by-body
	modules['/optimizer/level-2/merge-non-adjacent-by-body'] = function () {
		var isMergeable = require('/optimizer/level-2/is-mergeable');

		var sortSelectors = require('/optimizer/level-1/sort-selectors');
		var tidyRules = require('/optimizer/level-1/tidy-rules');

		var OptimizationLevel = require('/options/optimization-level').OptimizationLevel;

		var serializeBody = require('/writer/one-time').body;
		var serializeRules = require('/writer/one-time').rules;

		var Token = require('/tokenizer/token');

		function unsafeSelector(value) {
		  return /\.|\*| :/.test(value);
		}

		function isBemElement(token) {
		  var asString = serializeRules(token[1]);
		  return asString.indexOf('__') > -1 || asString.indexOf('--') > -1;
		}

		function withoutModifier(selector) {
		  return selector.replace(/--[^ ,>\+~:]+/g, '');
		}

		function removeAnyUnsafeElements(left, candidates) {
		  var leftSelector = withoutModifier(serializeRules(left[1]));

		  for (var body in candidates) {
			var right = candidates[body];
			var rightSelector = withoutModifier(serializeRules(right[1]));

			if (rightSelector.indexOf(leftSelector) > -1 || leftSelector.indexOf(rightSelector) > -1)
			  delete candidates[body];
		  }
		}

		function mergeNonAdjacentByBody(tokens, context) {
		  var options = context.options;
		  var mergeSemantically = options.level[OptimizationLevel.Two].mergeSemantically;
		  var adjacentSpace = options.compatibility.selectors.adjacentSpace;
		  var selectorsSortingMethod = options.level[OptimizationLevel.One].selectorsSortingMethod;
		  var mergeablePseudoClasses = options.compatibility.selectors.mergeablePseudoClasses;
		  var mergeablePseudoElements = options.compatibility.selectors.mergeablePseudoElements;
		  var multiplePseudoMerging = options.compatibility.selectors.multiplePseudoMerging;
		  var candidates = {};

		  for (var i = tokens.length - 1; i >= 0; i--) {
			var token = tokens[i];
			if (token[0] != Token.RULE)
			  continue;

			if (token[2].length > 0 && (!mergeSemantically && unsafeSelector(serializeRules(token[1]))))
			  candidates = {};

			if (token[2].length > 0 && mergeSemantically && isBemElement(token))
			  removeAnyUnsafeElements(token, candidates);

			var candidateBody = serializeBody(token[2]);
			var oldToken = candidates[candidateBody];
			if (oldToken &&
				isMergeable(serializeRules(token[1]), mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging) &&
				isMergeable(serializeRules(oldToken[1]), mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging)) {

			  if (token[2].length > 0) {
				token[1] = tidyRules(oldToken[1].concat(token[1]), false, adjacentSpace, false, context.warnings);
				token[1] = token[1].length > 1 ? sortSelectors(token[1], selectorsSortingMethod) : token[1];
			  } else {
				token[1] = oldToken[1].concat(token[1]);
			  }

			  oldToken[2] = [];
			  candidates[candidateBody] = null;
			}

			candidates[serializeBody(token[2])] = token;
		  }
		}

		return mergeNonAdjacentByBody;
	};
	//#endregion

	//#region URL: /optimizer/level-2/merge-non-adjacent-by-selector
	modules['/optimizer/level-2/merge-non-adjacent-by-selector'] = function () {
		var canReorder = require('/optimizer/level-2/reorderable').canReorder;
		var extractProperties = require('/optimizer/level-2/extract-properties');

		var optimizeProperties = require('/optimizer/level-2/properties/optimize');

		var serializeRules = require('/writer/one-time').rules;

		var Token = require('/tokenizer/token');

		function mergeNonAdjacentBySelector(tokens, context) {
		  var specificityCache = context.cache.specificity;
		  var allSelectors = {};
		  var repeatedSelectors = [];
		  var i;

		  for (i = tokens.length - 1; i >= 0; i--) {
			if (tokens[i][0] != Token.RULE)
			  continue;
			if (tokens[i][2].length === 0)
			  continue;

			var selector = serializeRules(tokens[i][1]);
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

				while (from != to) {
				  var traversedProperties = extractProperties(tokens[from]);
				  from += delta;

				  // traversed then moved as we move selectors towards the start
				  var reorderable = topToBottom ?
					canReorder(movedProperties, traversedProperties, specificityCache) :
					canReorder(traversedProperties, movedProperties, specificityCache);

				  if (!reorderable && !topToBottom)
					continue selectorIterator;
				  if (!reorderable && topToBottom)
					continue directionIterator;
				}

				if (topToBottom) {
				  Array.prototype.push.apply(moved[2], target[2]);
				  target[2] = moved[2];
				} else {
				  Array.prototype.push.apply(target[2], moved[2]);
				}

				optimizeProperties(target[2], true, true, context);
				moved[2] = [];
			  }
			}
		  }
		}

		return mergeNonAdjacentBySelector;
	};
	//#endregion

	//#region URL: /optimizer/level-2/optimize
	modules['/optimizer/level-2/optimize'] = function () {
		var mergeAdjacent = require('/optimizer/level-2/merge-adjacent');
		var mergeMediaQueries = require('/optimizer/level-2/merge-media-queries');
		var mergeNonAdjacentByBody = require('/optimizer/level-2/merge-non-adjacent-by-body');
		var mergeNonAdjacentBySelector = require('/optimizer/level-2/merge-non-adjacent-by-selector');
		var reduceNonAdjacent = require('/optimizer/level-2/reduce-non-adjacent');
		var removeDuplicateFontAtRules = require('/optimizer/level-2/remove-duplicate-font-at-rules');
		var removeDuplicateMediaQueries = require('/optimizer/level-2/remove-duplicate-media-queries');
		var removeDuplicates = require('/optimizer/level-2/remove-duplicates');
		var removeUnusedAtRules = require('/optimizer/level-2/remove-unused-at-rules');
		var restructure = require('/optimizer/level-2/restructure');

		var optimizeProperties = require('/optimizer/level-2/properties/optimize');

		var OptimizationLevel = require('/options/optimization-level').OptimizationLevel;

		var Token = require('/tokenizer/token');

		function removeEmpty(tokens) {
		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];
			var isEmpty = false;

			switch (token[0]) {
			  case Token.RULE:
				isEmpty = token[1].length === 0 || token[2].length === 0;
				break;
			  case Token.NESTED_BLOCK:
				removeEmpty(token[2]);
				isEmpty = token[2].length === 0;
				break;
			  case Token.AT_RULE:
				isEmpty = token[1].length === 0;
				break;
			  case Token.AT_RULE_BLOCK:
				isEmpty = token[2].length === 0;
			}

			if (isEmpty) {
			  tokens.splice(i, 1);
			  i--;
			  l--;
			}
		  }
		}

		function recursivelyOptimizeBlocks(tokens, context) {
		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];

			if (token[0] == Token.NESTED_BLOCK) {
			  var isKeyframes = /@(-moz-|-o-|-webkit-)?keyframes/.test(token[1][0][1]);
			  level2Optimize(token[2], context, !isKeyframes);
			}
		  }
		}

		function recursivelyOptimizeProperties(tokens, context) {
		  for (var i = 0, l = tokens.length; i < l; i++) {
			var token = tokens[i];

			switch (token[0]) {
			  case Token.RULE:
				optimizeProperties(token[2], true, true, context);
				break;
			  case Token.NESTED_BLOCK:
				recursivelyOptimizeProperties(token[2], context);
			}
		  }
		}

		function level2Optimize(tokens, context, withRestructuring) {
		  var levelOptions = context.options.level[OptimizationLevel.Two];
		  var reduced;
		  var i;

		  recursivelyOptimizeBlocks(tokens, context);
		  recursivelyOptimizeProperties(tokens, context);

		  if (levelOptions.removeDuplicateRules) {
			removeDuplicates(tokens, context);
		  }

		  if (levelOptions.mergeAdjacentRules) {
			mergeAdjacent(tokens, context);
		  }

		  if (levelOptions.reduceNonAdjacentRules) {
			reduceNonAdjacent(tokens, context);
		  }

		  if (levelOptions.mergeNonAdjacentRules && levelOptions.mergeNonAdjacentRules != 'body') {
			mergeNonAdjacentBySelector(tokens, context);
		  }

		  if (levelOptions.mergeNonAdjacentRules && levelOptions.mergeNonAdjacentRules != 'selector') {
			mergeNonAdjacentByBody(tokens, context);
		  }

		  if (levelOptions.restructureRules && levelOptions.mergeAdjacentRules && withRestructuring) {
			restructure(tokens, context);
			mergeAdjacent(tokens, context);
		  }

		  if (levelOptions.restructureRules && !levelOptions.mergeAdjacentRules && withRestructuring) {
			restructure(tokens, context);
		  }

		  if (levelOptions.removeDuplicateFontRules) {
			removeDuplicateFontAtRules(tokens, context);
		  }

		  if (levelOptions.removeDuplicateMediaBlocks) {
			removeDuplicateMediaQueries(tokens, context);
		  }

		  if (levelOptions.removeUnusedAtRules) {
			removeUnusedAtRules(tokens, context);
		  }

		  if (levelOptions.mergeMedia) {
			reduced = mergeMediaQueries(tokens, context);
			for (i = reduced.length - 1; i >= 0; i--) {
			  level2Optimize(reduced[i][2], context, false);
			}
		  }

		  if (levelOptions.removeEmpty) {
			removeEmpty(tokens);
		  }

		  return tokens;
		}

		return level2Optimize;
	};
	//#endregion

	//#region URL: /optimizer/level-2/reduce-non-adjacent
	modules['/optimizer/level-2/reduce-non-adjacent'] = function () {
		var isMergeable = require('/optimizer/level-2/is-mergeable');

		var optimizeProperties = require('/optimizer/level-2/properties/optimize');

		var cloneArray = require('/utils/clone-array');

		var Token = require('/tokenizer/token');

		var serializeBody = require('/writer/one-time').body;
		var serializeRules = require('/writer/one-time').rules;

		function reduceNonAdjacent(tokens, context) {
		  var options = context.options;
		  var mergeablePseudoClasses = options.compatibility.selectors.mergeablePseudoClasses;
		  var mergeablePseudoElements = options.compatibility.selectors.mergeablePseudoElements;
		  var multiplePseudoMerging = options.compatibility.selectors.multiplePseudoMerging;
		  var candidates = {};
		  var repeated = [];

		  for (var i = tokens.length - 1; i >= 0; i--) {
			var token = tokens[i];

			if (token[0] != Token.RULE) {
			  continue;
			} else if (token[2].length === 0) {
			  continue;
			}

			var selectorAsString = serializeRules(token[1]);
			var isComplexAndNotSpecial = token[1].length > 1 &&
			  isMergeable(selectorAsString, mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging);
			var wrappedSelectors = wrappedSelectorsFrom(token[1]);
			var selectors = isComplexAndNotSpecial ?
			  [selectorAsString].concat(wrappedSelectors) :
			  [selectorAsString];

			for (var j = 0, m = selectors.length; j < m; j++) {
			  var selector = selectors[j];

			  if (!candidates[selector])
				candidates[selector] = [];
			  else
				repeated.push(selector);

			  candidates[selector].push({
				where: i,
				list: wrappedSelectors,
				isPartial: isComplexAndNotSpecial && j > 0,
				isComplex: isComplexAndNotSpecial && j === 0
			  });
			}
		  }

		  reduceSimpleNonAdjacentCases(tokens, repeated, candidates, options, context);
		  reduceComplexNonAdjacentCases(tokens, candidates, options, context);
		}

		function wrappedSelectorsFrom(list) {
		  var wrapped = [];

		  for (var i = 0; i < list.length; i++) {
			wrapped.push([list[i][1]]);
		  }

		  return wrapped;
		}

		function reduceSimpleNonAdjacentCases(tokens, repeated, candidates, options, context) {
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

			reduceSelector(tokens, data, {
			  filterOut: filterOut,
			  callback: reduceBody
			}, options, context);
		  }
		}

		function reduceComplexNonAdjacentCases(tokens, candidates, options, context) {
		  var mergeablePseudoClasses = options.compatibility.selectors.mergeablePseudoClasses;
		  var mergeablePseudoElements = options.compatibility.selectors.mergeablePseudoElements;
		  var multiplePseudoMerging = options.compatibility.selectors.multiplePseudoMerging;
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

			var selectors = isMergeable(complexSelector, mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging) ?
			  into[0].list :
			  [complexSelector];

			localContext.intoPosition = intoPosition;
			localContext.reducedBodies = reducedBodies;

			for (var j = 0, m = selectors.length; j < m; j++) {
			  var selector = selectors[j];
			  var data = candidates[selector];

			  if (data.length < 2)
				continue allSelectors;

			  localContext.data = data;

			  reduceSelector(tokens, data, {
				filterOut: filterOut,
				callback: collectReducedBodies
			  }, options, context);

			  if (serializeBody(reducedBodies[reducedBodies.length - 1]) != serializeBody(reducedBodies[0]))
				continue allSelectors;
			}

			intoToken[2] = reducedBodies[0];
		  }
		}

		function reduceSelector(tokens, data, context, options, outerContext) {
		  var bodies = [];
		  var bodiesAsList = [];
		  var processedTokens = [];

		  for (var j = data.length - 1; j >= 0; j--) {
			if (context.filterOut(j, bodies))
			  continue;

			var where = data[j].where;
			var token = tokens[where];
			var clonedBody = cloneArray(token[2]);

			bodies = bodies.concat(clonedBody);
			bodiesAsList.push(clonedBody);
			processedTokens.push(where);
		  }

		  optimizeProperties(bodies, true, false, outerContext);

		  var processedCount = processedTokens.length;
		  var propertyIdx = bodies.length - 1;
		  var tokenIdx = processedCount - 1;

		  while (tokenIdx >= 0) {
			 if ((tokenIdx === 0 || (bodies[propertyIdx] && bodiesAsList[tokenIdx].indexOf(bodies[propertyIdx]) > -1)) && propertyIdx > -1) {
			  propertyIdx--;
			  continue;
			}

			var newBody = bodies.splice(propertyIdx + 1);
			context.callback(tokens[processedTokens[tokenIdx]], newBody, processedCount, tokenIdx);

			tokenIdx--;
		  }
		}

		return reduceNonAdjacent;
	};
	//#endregion

	//#region URL: /optimizer/level-2/remove-duplicate-font-at-rules
	modules['/optimizer/level-2/remove-duplicate-font-at-rules'] = function () {
		var Token = require('/tokenizer/token');

		var serializeAll = require('/writer/one-time').all;

		var FONT_FACE_SCOPE = '@font-face';

		function removeDuplicateFontAtRules(tokens) {
		  var fontAtRules = [];
		  var token;
		  var key;
		  var i, l;

		  for (i = 0, l = tokens.length; i < l; i++) {
			token = tokens[i];

			if (token[0] != Token.AT_RULE_BLOCK && token[1][0][1] != FONT_FACE_SCOPE) {
			  continue;
			}

			key = serializeAll([token]);

			if (fontAtRules.indexOf(key) > -1) {
			  token[2] = [];
			} else {
			  fontAtRules.push(key);
			}
		  }
		}

		return removeDuplicateFontAtRules;
	};
	//#endregion

	//#region URL: /optimizer/level-2/remove-duplicate-media-queries
	modules['/optimizer/level-2/remove-duplicate-media-queries'] = function () {
		var Token = require('/tokenizer/token');

		var serializeAll = require('/writer/one-time').all;
		var serializeRules = require('/writer/one-time').rules;

		function removeDuplicateMediaQueries(tokens) {
		  var candidates = {};
		  var candidate;
		  var token;
		  var key;
		  var i, l;

		  for (i = 0, l = tokens.length; i < l; i++) {
			token = tokens[i];
			if (token[0] != Token.NESTED_BLOCK) {
			  continue;
			}

			key = serializeRules(token[1]) + '%' + serializeAll(token[2]);
			candidate = candidates[key];

			if (candidate) {
			  candidate[2] = [];
			}

			candidates[key] = token;
		  }
		}

		return removeDuplicateMediaQueries;
	};
	//#endregion

	//#region URL: /optimizer/level-2/remove-duplicates
	modules['/optimizer/level-2/remove-duplicates'] = function () {
		var Token = require('/tokenizer/token');

		var serializeBody = require('/writer/one-time').body;
		var serializeRules = require('/writer/one-time').rules;

		function removeDuplicates(tokens) {
		  var matched = {};
		  var moreThanOnce = [];
		  var id, token;
		  var body, bodies;

		  for (var i = 0, l = tokens.length; i < l; i++) {
			token = tokens[i];
			if (token[0] != Token.RULE)
			  continue;

			id = serializeRules(token[1]);

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
			  body = serializeBody(token[2]);

			  if (bodies.indexOf(body) > -1)
				token[2] = [];
			  else
				bodies.push(body);
			}
		  }
		}

		return removeDuplicates;
	};
	//#endregion

	//#region URL: /optimizer/level-2/remove-unused-at-rules
	modules['/optimizer/level-2/remove-unused-at-rules'] = function () {
		var populateComponents = require('/optimizer/level-2/properties/populate-components');

		var wrapForOptimizing = require('/optimizer/wrap-for-optimizing').single;
		var restoreFromOptimizing = require('/optimizer/restore-from-optimizing');

		var Token = require('/tokenizer/token');

		var animationNameRegex = /^(\-moz\-|\-o\-|\-webkit\-)?animation-name$/;
		var animationRegex = /^(\-moz\-|\-o\-|\-webkit\-)?animation$/;
		var keyframeRegex = /^@(\-moz\-|\-o\-|\-webkit\-)?keyframes /;
		var importantRegex = /\s{0,31}!important$/;
		var optionalMatchingQuotesRegex = /^(['"]?)(.*)\1$/;

		function normalize(value) {
		  return value
			.replace(optionalMatchingQuotesRegex, '$2')
			.replace(importantRegex, '');
		}

		function removeUnusedAtRules(tokens, context) {
		  removeUnusedAtRule(tokens, matchCounterStyle, markCounterStylesAsUsed, context);
		  removeUnusedAtRule(tokens, matchFontFace, markFontFacesAsUsed, context);
		  removeUnusedAtRule(tokens, matchKeyframe, markKeyframesAsUsed, context);
		  removeUnusedAtRule(tokens, matchNamespace, markNamespacesAsUsed, context);
		}

		function removeUnusedAtRule(tokens, matchCallback, markCallback, context) {
		  var atRules = {};
		  var atRule;
		  var atRuleTokens;
		  var atRuleToken;
		  var zeroAt;
		  var i, l;

		  for (i = 0, l = tokens.length; i < l; i++) {
			matchCallback(tokens[i], atRules);
		  }

		  if (Object.keys(atRules).length === 0) {
			return;
		  }

		  markUsedAtRules(tokens, markCallback, atRules, context);

		  for (atRule in atRules) {
			atRuleTokens = atRules[atRule];

			for (i = 0, l = atRuleTokens.length; i < l; i++) {
			  atRuleToken = atRuleTokens[i];
			  zeroAt = atRuleToken[0] == Token.AT_RULE ? 1 : 2;
			  atRuleToken[zeroAt] = [];
			}
		  }
		}

		function markUsedAtRules(tokens, markCallback, atRules, context) {
		  var boundMarkCallback = markCallback(atRules);
		  var i, l;

		  for (i = 0, l = tokens.length; i < l; i++) {
			switch (tokens[i][0]) {
			  case Token.RULE:
				boundMarkCallback(tokens[i], context);
				break;
			  case Token.NESTED_BLOCK:
				markUsedAtRules(tokens[i][2], markCallback, atRules, context);
			}
		  }
		}

		function matchCounterStyle(token, atRules) {
		  var match;

		  if (token[0] == Token.AT_RULE_BLOCK && token[1][0][1].indexOf('@counter-style') === 0) {
			match = token[1][0][1].split(' ')[1];
			atRules[match] = atRules[match] || [];
			atRules[match].push(token);
		  }
		}

		function markCounterStylesAsUsed(atRules) {
		  return function (token, context) {
			var property;
			var wrappedProperty;
			var i, l;

			for (i = 0, l = token[2].length; i < l; i++) {
			  property = token[2][i];

			  if (property[1][1] == 'list-style') {
				wrappedProperty = wrapForOptimizing(property);
				populateComponents([wrappedProperty], context.validator, context.warnings);

				if (wrappedProperty.components[0].value[0][1] in atRules) {
				  delete atRules[property[2][1]];
				}

				restoreFromOptimizing([wrappedProperty]);
			  }

			  if (property[1][1] == 'list-style-type' && property[2][1] in atRules) {
				delete atRules[property[2][1]];
			  }
			}
		  };
		}

		function matchFontFace(token, atRules) {
		  var property;
		  var match;
		  var i, l;

		  if (token[0] == Token.AT_RULE_BLOCK && token[1][0][1] == '@font-face') {
			for (i = 0, l = token[2].length; i < l; i++) {
			  property = token[2][i];

			  if (property[1][1] == 'font-family') {
				match = normalize(property[2][1].toLowerCase());
				atRules[match] = atRules[match] || [];
				atRules[match].push(token);
				break;
			  }
			}
		  }
		}

		function markFontFacesAsUsed(atRules) {
		  return function (token, context) {
			var property;
			var wrappedProperty;
			var component;
			var normalizedMatch;
			var i, l;
			var j, m;

			for (i = 0, l = token[2].length; i < l; i++) {
			  property = token[2][i];

			  if (property[1][1] == 'font') {
				wrappedProperty = wrapForOptimizing(property);
				populateComponents([wrappedProperty], context.validator, context.warnings);
				component = wrappedProperty.components[6];

				for (j = 0, m = component.value.length; j < m; j++) {
				  normalizedMatch = normalize(component.value[j][1].toLowerCase());

				  if (normalizedMatch in atRules) {
					delete atRules[normalizedMatch];
				  }
				}

				restoreFromOptimizing([wrappedProperty]);
			  }

			  if (property[1][1] == 'font-family') {
				for (j = 2, m = property.length; j < m; j++) {
				  normalizedMatch = normalize(property[j][1].toLowerCase());

				  if (normalizedMatch in atRules) {
					delete atRules[normalizedMatch];
				  }
				}
			  }
			}
		  };
		}

		function matchKeyframe(token, atRules) {
		  var match;

		  if (token[0] == Token.NESTED_BLOCK && keyframeRegex.test(token[1][0][1])) {
			match = token[1][0][1].split(' ')[1];
			atRules[match] = atRules[match] || [];
			atRules[match].push(token);
		  }
		}

		function markKeyframesAsUsed(atRules) {
		  return function (token, context) {
			var property;
			var wrappedProperty;
			var component;
			var i, l;
			var j, m;

			for (i = 0, l = token[2].length; i < l; i++) {
			  property = token[2][i];

			  if (animationRegex.test(property[1][1])) {
				wrappedProperty = wrapForOptimizing(property);
				populateComponents([wrappedProperty], context.validator, context.warnings);
				component = wrappedProperty.components[7];

				for (j = 0, m = component.value.length; j < m; j++) {
				  if (component.value[j][1] in atRules) {
					delete atRules[component.value[j][1]];
				  }
				}

				restoreFromOptimizing([wrappedProperty]);
			  }

			  if (animationNameRegex.test(property[1][1])) {
				for (j = 2, m = property.length; j < m; j++) {
				  if (property[j][1] in atRules) {
					delete atRules[property[j][1]];
				  }
				}
			  }
			}
		  };
		}

		function matchNamespace(token, atRules) {
		  var match;

		  if (token[0] == Token.AT_RULE && token[1].indexOf('@namespace') === 0) {
			match = token[1].split(' ')[1];
			atRules[match] = atRules[match] || [];
			atRules[match].push(token);
		  }
		}

		function markNamespacesAsUsed(atRules) {
		  var namespaceRegex = new RegExp(Object.keys(atRules).join('\\\||') + '\\\|', 'g');

		  return function (token) {
			var match;
			var scope;
			var normalizedMatch;
			var i, l;
			var j, m;

			for (i = 0, l = token[1].length; i < l; i++) {
			  scope = token[1][i];
			  match = scope[1].match(namespaceRegex);

			  for (j = 0, m = match.length; j < m; j++) {
				normalizedMatch = match[j].substring(0, match[j].length - 1);

				if (normalizedMatch in atRules) {
				  delete atRules[normalizedMatch];
				}
			  }
			}
		  };
		}

		return removeUnusedAtRules;
	};
	//#endregion

	//#region URL: /optimizer/level-2/reorderable
	modules['/optimizer/level-2/reorderable'] = function () {
		// TODO: it'd be great to merge it with the other canReorder functionality

		var rulesOverlap = require('/optimizer/level-2/rules-overlap');
		var specificitiesOverlap = require('/optimizer/level-2/specificities-overlap');

		var FLEX_PROPERTIES = /align\-items|box\-align|box\-pack|flex|justify/;
		var BORDER_PROPERTIES = /^border\-(top|right|bottom|left|color|style|width|radius)/;

		function canReorder(left, right, cache) {
		  for (var i = right.length - 1; i >= 0; i--) {
			for (var j = left.length - 1; j >= 0; j--) {
			  if (!canReorderSingle(left[j], right[i], cache))
				return false;
			}
		  }

		  return true;
		}

		function canReorderSingle(left, right, cache) {
		  var leftName = left[0];
		  var leftValue = left[1];
		  var leftNameRoot = left[2];
		  var leftSelector = left[5];
		  var leftInSpecificSelector = left[6];
		  var rightName = right[0];
		  var rightValue = right[1];
		  var rightNameRoot = right[2];
		  var rightSelector = right[5];
		  var rightInSpecificSelector = right[6];

		  if (leftName == 'font' && rightName == 'line-height' || rightName == 'font' && leftName == 'line-height')
			return false;
		  if (FLEX_PROPERTIES.test(leftName) && FLEX_PROPERTIES.test(rightName))
			return false;
		  if (leftNameRoot == rightNameRoot && unprefixed(leftName) == unprefixed(rightName) && (vendorPrefixed(leftName) ^ vendorPrefixed(rightName)))
			return false;
		  if (leftNameRoot == 'border' && BORDER_PROPERTIES.test(rightNameRoot) && (leftName == 'border' || leftName == rightNameRoot || (leftValue != rightValue && sameBorderComponent(leftName, rightName))))
			return false;
		  if (rightNameRoot == 'border' && BORDER_PROPERTIES.test(leftNameRoot) && (rightName == 'border' || rightName == leftNameRoot || (leftValue != rightValue && sameBorderComponent(leftName, rightName))))
			return false;
		  if (leftNameRoot == 'border' && rightNameRoot == 'border' && leftName != rightName && (isSideBorder(leftName) && isStyleBorder(rightName) || isStyleBorder(leftName) && isSideBorder(rightName)))
			return false;
		  if (leftNameRoot != rightNameRoot)
			return true;
		  if (leftName == rightName && leftNameRoot == rightNameRoot && (leftValue == rightValue || withDifferentVendorPrefix(leftValue, rightValue)))
			return true;
		  if (leftName != rightName && leftNameRoot == rightNameRoot && leftName != leftNameRoot && rightName != rightNameRoot)
			return true;
		  if (leftName != rightName && leftNameRoot == rightNameRoot && leftValue == rightValue)
			return true;
		  if (rightInSpecificSelector && leftInSpecificSelector && !inheritable(leftNameRoot) && !inheritable(rightNameRoot) && !rulesOverlap(rightSelector, leftSelector, false))
			return true;
		  if (!specificitiesOverlap(leftSelector, rightSelector, cache))
			return true;

		  return false;
		}

		function vendorPrefixed(name) {
		  return /^\-(?:moz|webkit|ms|o)\-/.test(name);
		}

		function unprefixed(name) {
		  return name.replace(/^\-(?:moz|webkit|ms|o)\-/, '');
		}

		function sameBorderComponent(name1, name2) {
		  return name1.split('-').pop() == name2.split('-').pop();
		}

		function isSideBorder(name) {
		  return name == 'border-top' || name == 'border-right' || name == 'border-bottom' || name == 'border-left';
		}

		function isStyleBorder(name) {
		  return name == 'border-color' || name == 'border-style' || name == 'border-width';
		}

		function withDifferentVendorPrefix(value1, value2) {
		  return vendorPrefixed(value1) && vendorPrefixed(value2) && value1.split('-')[1] != value2.split('-')[2];
		}

		function inheritable(name) {
		  // According to http://www.w3.org/TR/CSS21/propidx.html
		  // Others will be catched by other, preceeding rules
		  return name == 'font' || name == 'line-height' || name == 'list-style';
		}

		var exports = {
		  canReorder: canReorder,
		  canReorderSingle: canReorderSingle
		};

		return exports;
	};
	//#endregion

	//#region URL: /optimizer/level-2/restore
	modules['/optimizer/level-2/restore'] = function () {
		var shallowClone = require('/optimizer/level-2/clone').shallow;

		var Token = require('/tokenizer/token');
		var Marker = require('/tokenizer/marker');

		function isInheritOnly(values) {
		  for (var i = 0, l = values.length; i < l; i++) {
			var value = values[i][1];

			if (value != 'inherit' && value != Marker.COMMA && value != Marker.FORWARD_SLASH)
			  return false;
		  }

		  return true;
		}

		function background(property, compactable, lastInMultiplex) {
		  var components = property.components;
		  var restored = [];
		  var needsOne, needsBoth;

		  function restoreValue(component) {
			Array.prototype.unshift.apply(restored, component.value);
		  }

		  function isDefaultValue(component) {
			var descriptor = compactable[component.name];

			if (descriptor.doubleValues && descriptor.defaultValue.length == 1) {
			  return component.value[0][1] == descriptor.defaultValue[0] && (component.value[1] ? component.value[1][1] == descriptor.defaultValue[0] : true);
			} else if (descriptor.doubleValues && descriptor.defaultValue.length != 1) {
			  return component.value[0][1] == descriptor.defaultValue[0] && (component.value[1] ? component.value[1][1] : component.value[0][1]) == descriptor.defaultValue[1];
			} else {
			  return component.value[0][1] == descriptor.defaultValue;
			}
		  }

		  for (var i = components.length - 1; i >= 0; i--) {
			var component = components[i];
			var isDefault = isDefaultValue(component);

			if (component.name == 'background-clip') {
			  var originComponent = components[i - 1];
			  var isOriginDefault = isDefaultValue(originComponent);

			  needsOne = component.value[0][1] == originComponent.value[0][1];

			  needsBoth = !needsOne && (
				(isOriginDefault && !isDefault) ||
				(!isOriginDefault && !isDefault) ||
				(!isOriginDefault && isDefault && component.value[0][1] != originComponent.value[0][1]));

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
				restored.unshift([Token.PROPERTY_VALUE, Marker.FORWARD_SLASH]);
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

		  if (restored.length === 0 && property.value.length == 1 && property.value[0][1] == '0')
			restored.push(property.value[0]);

		  if (restored.length === 0)
			restored.push([Token.PROPERTY_VALUE, compactable[property.name].defaultValue]);

		  if (isInheritOnly(restored))
			return [restored[0]];

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
			  // FIXME: only shorthand compactor (see breakup#borderRadius) knows that border radius
			  // longhands have two values, whereas tokenizer does not care about populating 2nd value
			  // if it's missing, hence this fallback
			  verticalComponent.value = [component.value[1] || component.value[0]];
			  vertical.components.push(verticalComponent);
			}

			var horizontalValues = fourValues(horizontal, compactable);
			var verticalValues = fourValues(vertical, compactable);

			if (horizontalValues.length == verticalValues.length &&
				horizontalValues[0][1] == verticalValues[0][1] &&
				(horizontalValues.length > 1 ? horizontalValues[1][1] == verticalValues[1][1] : true) &&
				(horizontalValues.length > 2 ? horizontalValues[2][1] == verticalValues[2][1] : true) &&
				(horizontalValues.length > 3 ? horizontalValues[3][1] == verticalValues[3][1] : true)) {
			  return horizontalValues;
			} else {
			  return horizontalValues.concat([[Token.PROPERTY_VALUE, Marker.FORWARD_SLASH]]).concat(verticalValues);
			}
		  } else {
			return fourValues(property, compactable);
		  }
		}

		function font(property, compactable) {
		  var components = property.components;
		  var restored = [];
		  var component;
		  var componentIndex = 0;
		  var fontFamilyIndex = 0;

		  if (property.value[0][1].indexOf(Marker.INTERNAL) === 0) {
			property.value[0][1] = property.value[0][1].substring(Marker.INTERNAL.length);
			return property.value;
		  }

		  // first four components are optional
		  while (componentIndex < 4) {
			component = components[componentIndex];

			if (component.value[0][1] != compactable[component.name].defaultValue) {
			  Array.prototype.push.apply(restored, component.value);
			}

			componentIndex++;
		  }

		  // then comes font-size
		  Array.prototype.push.apply(restored, components[componentIndex].value);
		  componentIndex++;

		  // then may come line-height
		  if (components[componentIndex].value[0][1] != compactable[components[componentIndex].name].defaultValue) {
			Array.prototype.push.apply(restored, [[Token.PROPERTY_VALUE, Marker.FORWARD_SLASH]]);
			Array.prototype.push.apply(restored, components[componentIndex].value);
		  }

		  componentIndex++;

		  // then comes font-family
		  while (components[componentIndex].value[fontFamilyIndex]) {
			restored.push(components[componentIndex].value[fontFamilyIndex]);

			if (components[componentIndex].value[fontFamilyIndex + 1]) {
			  restored.push([Token.PROPERTY_VALUE, Marker.COMMA]);
			}

			fontFamilyIndex++;
		  }

		  if (isInheritOnly(restored)) {
			return [restored[0]];
		  }

		  return restored;
		}

		function fourValues(property) {
		  var components = property.components;
		  var value1 = components[0].value[0];
		  var value2 = components[1].value[0];
		  var value3 = components[2].value[0];
		  var value4 = components[3].value[0];

		  if (value1[1] == value2[1] && value1[1] == value3[1] && value1[1] == value4[1]) {
			return [value1];
		  } else if (value1[1] == value3[1] && value2[1] == value4[1]) {
			return [value1, value2];
		  } else if (value2[1] == value4[1]) {
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
			  if (property.components[0].value[i][1] == Marker.COMMA)
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
				  if (componentToClone.value[k][1] == Marker.COMMA) {
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
				restored.push([Token.PROPERTY_VALUE, Marker.COMMA]);
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

			if (component.value[0][1] != descriptor.defaultValue || ('keepUnlessDefault' in descriptor) && !isDefault(components, compactable, descriptor.keepUnlessDefault)) {
			  restored.unshift(component.value[0]);
			}
		  }

		  if (restored.length === 0)
			restored.push([Token.PROPERTY_VALUE, compactable[property.name].defaultValue]);

		  if (isInheritOnly(restored))
			return [restored[0]];

		  return restored;
		}

		function isDefault(components, compactable, propertyName) {
		  var component;
		  var i, l;

		  for (i = 0, l = components.length; i < l; i++) {
			component = components[i];

			if (component.name == propertyName && component.value[0][1] == compactable[propertyName].defaultValue) {
			  return true;
			}
		  }

		  return false;
		}

		var exports = {
		  background: background,
		  borderRadius: borderRadius,
		  font: font,
		  fourValues: fourValues,
		  multiplex: multiplex,
		  withoutDefaults: withoutDefaults
		};

		return exports;
	};
	//#endregion

	//#region URL: /optimizer/level-2/restore-with-components
	modules['/optimizer/level-2/restore-with-components'] = function () {
		var compactable = require('/optimizer/level-2/compactable');

		function restoreWithComponents(property) {
		  var descriptor = compactable[property.name];

		  if (descriptor && descriptor.shorthand) {
			return descriptor.restore(property, compactable);
		  } else {
			return property.value;
		  }
		}

		return restoreWithComponents;
	};
	//#endregion

	//#region URL: /optimizer/level-2/restructure
	modules['/optimizer/level-2/restructure'] = function () {
		var canReorderSingle = require('/optimizer/level-2/reorderable').canReorderSingle;
		var extractProperties = require('/optimizer/level-2/extract-properties');
		var isMergeable = require('/optimizer/level-2/is-mergeable');
		var tidyRuleDuplicates = require('/optimizer/level-2/tidy-rule-duplicates');

		var Token = require('/tokenizer/token');

		var cloneArray = require('/utils/clone-array');

		var serializeBody = require('/writer/one-time').body;
		var serializeRules = require('/writer/one-time').rules;

		function naturalSorter(a, b) {
		  return a > b ? 1 : -1;
		}

		function cloneAndMergeSelectors(propertyA, propertyB) {
		  var cloned = cloneArray(propertyA);
		  cloned[5] = cloned[5].concat(propertyB[5]);

		  return cloned;
		}

		function restructure(tokens, context) {
		  var options = context.options;
		  var mergeablePseudoClasses = options.compatibility.selectors.mergeablePseudoClasses;
		  var mergeablePseudoElements = options.compatibility.selectors.mergeablePseudoElements;
		  var mergeLimit = options.compatibility.selectors.mergeLimit;
		  var multiplePseudoMerging = options.compatibility.selectors.multiplePseudoMerging;
		  var specificityCache = context.cache.specificity;
		  var movableTokens = {};
		  var movedProperties = [];
		  var multiPropertyMoveCache = {};
		  var movedToBeDropped = [];
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
			  id.push(serializeRules(cachedTokens[i][1]));
			}
			return id.join(ID_JOIN_CHARACTER);
		  }

		  function tokensToMerge(sourceTokens) {
			var uniqueTokensWithBody = [];
			var mergeableTokens = [];

			for (var i = sourceTokens.length - 1; i >= 0; i--) {
			  if (!isMergeable(serializeRules(sourceTokens[i][1]), mergeablePseudoClasses, mergeablePseudoElements, multiplePseudoMerging)) {
				continue;
			  }

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

			allSelectors = tidyRuleDuplicates(allSelectors);
			dropAsNewTokenAt(position, [movedProperty], allSelectors, qualifiedTokens);
		  }

		  function fitSorter(fit1, fit2) {
			return fit1[1] > fit2[1] ? 1 : (fit1[1] == fit2[1] ? 0 : -1);
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
			  allSelectorsSize += tokensVariant[i][2].length > propertiesCount ? serializeRules(tokensVariant[i][1]).length : -1;
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

				  var mergeablePropertyName = mergeableProperty[1][1];
				  var propertyName = property[0];
				  var propertyBody = property[4];
				  if (mergeablePropertyName == propertyName && serializeBody([mergeableProperty]) == propertyBody) {
					mergeableToken[2].splice(j, 1);
					break;
				  }
				}
			  }
			}

			for (i = properties.length - 1; i >= 0; i--) {
			  allProperties.unshift(properties[i][3]);
			}

			var newToken = [Token.RULE, allSelectors, allProperties];
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

			allSelectors = tidyRuleDuplicates(allSelectors);
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
			var isRule;
			var j, k, m;
			var samePropertyAt;

			if (token[0] == Token.RULE) {
			  isRule = true;
			} else if (token[0] == Token.NESTED_BLOCK) {
			  isRule = false;
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
				if (!canReorderSingle(properties[j], properties[k], specificityCache)) {
				  unmovableInCurrentToken.push(j);
				  break;
				}
			  }
			}

			for (j = properties.length - 1; j >= 0; j--) {
			  var property = properties[j];
			  var movedSameProperty = false;

			  for (k = 0; k < movedCount; k++) {
				var movedProperty = movedProperties[k];

				if (movedToBeDropped.indexOf(k) == -1 && (!canReorderSingle(property, movedProperty, specificityCache) && !boundToAnotherPropertyInCurrrentToken(property, movedProperty, token) ||
					movableTokens[movedProperty[4]] && movableTokens[movedProperty[4]].length === mergeLimit)) {
				  dropPropertiesAt(i + 1, movedProperty, token);

				  if (movedToBeDropped.indexOf(k) == -1) {
					movedToBeDropped.push(k);
					delete movableTokens[movedProperty[4]];
				  }
				}

				if (!movedSameProperty) {
				  movedSameProperty = property[0] == movedProperty[0] && property[1] == movedProperty[1];

				  if (movedSameProperty) {
					samePropertyAt = k;
				  }
				}
			  }

			  if (!isRule || unmovableInCurrentToken.indexOf(j) > -1)
				continue;

			  var key = property[4];

			  if (movedSameProperty && movedProperties[samePropertyAt][5].length + property[5].length > mergeLimit) {
				dropPropertiesAt(i + 1, movedProperties[samePropertyAt]);
				movedProperties.splice(samePropertyAt, 1);
				movableTokens[key] = [token];
				movedSameProperty = false;
			  } else {
				movableTokens[key] = movableTokens[key] || [];
				movableTokens[key].push(token);
			  }

			  if (movedSameProperty) {
				movedProperties[samePropertyAt] = cloneAndMergeSelectors(movedProperties[samePropertyAt], property);
			  } else {
				movedProperties.push(property);
			  }
			}

			movedToBeDropped = movedToBeDropped.sort(naturalSorter);
			for (j = 0, m = movedToBeDropped.length; j < m; j++) {
			  var dropAt = movedToBeDropped[j] - j;
			  movedProperties.splice(dropAt, 1);
			}
		  }

		  var position = tokens[0] && tokens[0][0] == Token.AT_RULE && tokens[0][1].indexOf('@charset') === 0 ? 1 : 0;
		  for (; position < tokens.length - 1; position++) {
			var isImportRule = tokens[position][0] === Token.AT_RULE && tokens[position][1].indexOf('@import') === 0;
			var isComment = tokens[position][0] === Token.COMMENT;
			if (!(isImportRule || isComment))
			  break;
		  }

		  for (i = 0; i < movedProperties.length; i++) {
			dropPropertiesAt(position, movedProperties[i]);
		  }
		}

		return restructure;
	};
	//#endregion

	//#region URL: /optimizer/level-2/rules-overlap
	modules['/optimizer/level-2/rules-overlap'] = function () {
		var MODIFIER_PATTERN = /\-\-.+$/;

		function rulesOverlap(rule1, rule2, bemMode) {
		  var scope1;
		  var scope2;
		  var i, l;
		  var j, m;

		  for (i = 0, l = rule1.length; i < l; i++) {
			scope1 = rule1[i][1];

			for (j = 0, m = rule2.length; j < m; j++) {
			  scope2 = rule2[j][1];

			  if (scope1 == scope2) {
				return true;
			  }

			  if (bemMode && withoutModifiers(scope1) == withoutModifiers(scope2)) {
				return true;
			  }
			}
		  }

		  return false;
		}

		function withoutModifiers(scope) {
		  return scope.replace(MODIFIER_PATTERN, '');
		}

		return rulesOverlap;
	};
	//#endregion

	//#region URL: /optimizer/level-2/specificities-overlap
	modules['/optimizer/level-2/specificities-overlap'] = function () {
		var specificity = require('/optimizer/level-2/specificity');

		function specificitiesOverlap(selector1, selector2, cache) {
		  var specificity1;
		  var specificity2;
		  var i, l;
		  var j, m;

		  for (i = 0, l = selector1.length; i < l; i++) {
			specificity1 = findSpecificity(selector1[i][1], cache);

			for (j = 0, m = selector2.length; j < m; j++) {
			  specificity2 = findSpecificity(selector2[j][1], cache);

			  if (specificity1[0] === specificity2[0] && specificity1[1] === specificity2[1] && specificity1[2] === specificity2[2]) {
				return true;
			  }
			}
		  }

		  return false;
		}

		function findSpecificity(selector, cache) {
		  var value;

		  if (!(selector in cache)) {
			cache[selector] = value = specificity(selector);
		  }

		  return value || cache[selector];
		}

		return specificitiesOverlap;
	};
	//#endregion

	//#region URL: /optimizer/level-2/specificity
	modules['/optimizer/level-2/specificity'] = function () {
		var Marker = require('/tokenizer/marker');

		var Selector = {
		  ADJACENT_SIBLING: '+',
		  DESCENDANT: '>',
		  DOT: '.',
		  HASH: '#',
		  NON_ADJACENT_SIBLING: '~',
		  PSEUDO: ':'
		};

		var LETTER_PATTERN = /[a-zA-Z]/;
		var NOT_PREFIX = ':not(';
		var SEPARATOR_PATTERN = /[\s,\(>~\+]/;

		function specificity(selector) {
		  var result = [0, 0, 0];
		  var character;
		  var isEscaped;
		  var isSingleQuoted;
		  var isDoubleQuoted;
		  var roundBracketLevel = 0;
		  var couldIntroduceNewTypeSelector;
		  var withinNotPseudoClass = false;
		  var wasPseudoClass = false;
		  var i, l;

		  for (i = 0, l = selector.length; i < l; i++) {
			character = selector[i];

			if (isEscaped) {
			  // noop
			} else if (character == Marker.SINGLE_QUOTE && !isDoubleQuoted && !isSingleQuoted) {
			  isSingleQuoted = true;
			} else if (character == Marker.SINGLE_QUOTE && !isDoubleQuoted && isSingleQuoted) {
			  isSingleQuoted = false;
			} else if (character == Marker.DOUBLE_QUOTE && !isDoubleQuoted && !isSingleQuoted) {
			  isDoubleQuoted = true;
			} else if (character == Marker.DOUBLE_QUOTE && isDoubleQuoted && !isSingleQuoted) {
			  isDoubleQuoted = false;
			} else if (isSingleQuoted || isDoubleQuoted) {
			  continue;
			} else if (roundBracketLevel > 0 && !withinNotPseudoClass) {
			  // noop
			} else if (character == Marker.OPEN_ROUND_BRACKET) {
			  roundBracketLevel++;
			} else if (character == Marker.CLOSE_ROUND_BRACKET && roundBracketLevel == 1) {
			  roundBracketLevel--;
			  withinNotPseudoClass = false;
			} else if (character == Marker.CLOSE_ROUND_BRACKET) {
			  roundBracketLevel--;
			} else if (character == Selector.HASH) {
			  result[0]++;
			} else if (character == Selector.DOT || character == Marker.OPEN_SQUARE_BRACKET) {
			  result[1]++;
			} else if (character == Selector.PSEUDO && !wasPseudoClass && !isNotPseudoClass(selector, i)) {
			  result[1]++;
			  withinNotPseudoClass = false;
			} else if (character == Selector.PSEUDO) {
			  withinNotPseudoClass = true;
			} else if ((i === 0 || couldIntroduceNewTypeSelector) && LETTER_PATTERN.test(character)) {
			  result[2]++;
			}

			isEscaped = character == Marker.BACK_SLASH;
			wasPseudoClass = character == Selector.PSEUDO;
			couldIntroduceNewTypeSelector = !isEscaped && SEPARATOR_PATTERN.test(character);
		  }

		  return result;
		}

		function isNotPseudoClass(selector, index) {
		  return selector.indexOf(NOT_PREFIX, index) === index;
		}

		return specificity;
	};
	//#endregion

	//#region URL: /optimizer/level-2/tidy-rule-duplicates
	modules['/optimizer/level-2/tidy-rule-duplicates'] = function () {
		function ruleSorter(s1, s2) {
		  return s1[1] > s2[1] ? 1 : -1;
		}

		function tidyRuleDuplicates(rules) {
		  var list = [];
		  var repeated = [];

		  for (var i = 0, l = rules.length; i < l; i++) {
			var rule = rules[i];

			if (repeated.indexOf(rule[1]) == -1) {
			  repeated.push(rule[1]);
			  list.push(rule);
			}
		  }

		  return list.sort(ruleSorter);
		}

		return tidyRuleDuplicates;
	};
	//#endregion

	//#region URL: /optimizer/hack
	modules['/optimizer/hack'] = function () {
		var Hack = {
		  ASTERISK: 'asterisk',
		  BANG: 'bang',
		  BACKSLASH: 'backslash',
		  UNDERSCORE: 'underscore'
		};

		return Hack;
	};
	//#endregion

	//#region URL: /optimizer/remove-unused
	modules['/optimizer/remove-unused'] = function () {
		function removeUnused(properties) {
		  for (var i = properties.length - 1; i >= 0; i--) {
			var property = properties[i];

			if (property.unused) {
			  property.all.splice(property.position, 1);
			}
		  }
		}

		return removeUnused;
	};
	//#endregion

	//#region URL: /optimizer/restore-from-optimizing
	modules['/optimizer/restore-from-optimizing'] = function () {
		var Hack = require('/optimizer/hack');

		var Marker = require('/tokenizer/marker');

		var ASTERISK_HACK = '*';
		var BACKSLASH_HACK = '\\';
		var IMPORTANT_TOKEN = '!important';
		var UNDERSCORE_HACK = '_';
		var BANG_HACK = '!ie';

		function restoreFromOptimizing(properties, restoreCallback) {
		  var property;
		  var restored;
		  var current;
		  var i;

		  for (i = properties.length - 1; i >= 0; i--) {
			property = properties[i];

			if (property.unused) {
			  continue;
			}

			if (!property.dirty && !property.important && !property.hack) {
			  continue;
			}

			if (restoreCallback) {
			  restored = restoreCallback(property);
			  property.value = restored;
			} else {
			  restored = property.value;
			}

			if (property.important) {
			  restoreImportant(property);
			}

			if (property.hack) {
			  restoreHack(property);
			}

			if ('all' in property) {
			  current = property.all[property.position];
			  current[1][1] = property.name;

			  current.splice(2, current.length - 1);
			  Array.prototype.push.apply(current, restored);
			}
		  }
		}

		function restoreImportant(property) {
		  property.value[property.value.length - 1][1] += IMPORTANT_TOKEN;
		}

		function restoreHack(property) {
		  if (property.hack[0] == Hack.UNDERSCORE) {
			property.name = UNDERSCORE_HACK + property.name;
		  } else if (property.hack[0] == Hack.ASTERISK) {
			property.name = ASTERISK_HACK + property.name;
		  } else if (property.hack[0] == Hack.BACKSLASH) {
			property.value[property.value.length - 1][1] += BACKSLASH_HACK + property.hack[1];
		  } else if (property.hack[0] == Hack.BANG) {
			property.value[property.value.length - 1][1] += Marker.SPACE + BANG_HACK;
		  }
		}

		return restoreFromOptimizing;
	};
	//#endregion

	//#region URL: /optimizer/validator
	modules['/optimizer/validator'] = function () {
		var functionNoVendorRegexStr = '[A-Z]+(\\-|[A-Z]|[0-9])+\\(.*?\\)';
		var functionVendorRegexStr = '\\-(\\-|[A-Z]|[0-9])+\\(.*?\\)';
		var variableRegexStr = 'var\\(\\-\\-[^\\)]+\\)';
		var functionAnyRegexStr = '(' + variableRegexStr + '|' + functionNoVendorRegexStr + '|' + functionVendorRegexStr + ')';

		var animationTimingFunctionRegex = /^(cubic\-bezier|steps)\([^\)]+\)$/;
		var calcRegex = new RegExp('^(\\-moz\\-|\\-webkit\\-)?calc\\([^\\)]+\\)$', 'i');
		var decimalRegex = /[0-9]/;
		var functionAnyRegex = new RegExp('^' + functionAnyRegexStr + '$', 'i');
		var hslColorRegex = /^hsl\(\s{0,31}[\-\.]?\d+\s{0,31},\s{0,31}\.?\d+%\s{0,31},\s{0,31}\.?\d+%\s{0,31}\)|hsla\(\s{0,31}[\-\.]?\d+\s{0,31},\s{0,31}\.?\d+%\s{0,31},\s{0,31}\.?\d+%\s{0,31},\s{0,31}\.?\d+\s{0,31}\)$/;
		var identifierRegex = /^(\-[a-z0-9_][a-z0-9\-_]*|[a-z][a-z0-9\-_]*)$/i;
		var longHexColorRegex = /^#[0-9a-f]{6}$/i;
		var namedEntityRegex = /^[a-z]+$/i;
		var prefixRegex = /^-([a-z0-9]|-)*$/i;
		var rgbColorRegex = /^rgb\(\s{0,31}[\d]{1,3}\s{0,31},\s{0,31}[\d]{1,3}\s{0,31},\s{0,31}[\d]{1,3}\s{0,31}\)|rgba\(\s{0,31}[\d]{1,3}\s{0,31},\s{0,31}[\d]{1,3}\s{0,31},\s{0,31}[\d]{1,3}\s{0,31},\s{0,31}[\.\d]+\s{0,31}\)$/;
		var shortHexColorRegex = /^#[0-9a-f]{3}$/i;
		var validTimeUnits = ['ms', 's'];
		var urlRegex = /^url\([\s\S]+\)$/i;
		var variableRegex = new RegExp('^' + variableRegexStr + '$', 'i');

		var DECIMAL_DOT = '.';
		var MINUS_SIGN = '-';
		var PLUS_SIGN = '+';

		var Keywords = {
		  '^': [
			'inherit',
			'initial',
			'unset'
		  ],
		  '*-style': [
			'auto',
			'dashed',
			'dotted',
			'double',
			'groove',
			'hidden',
			'inset',
			'none',
			'outset',
			'ridge',
			'solid'
		  ],
		  'animation-direction': [
			'alternate',
			'alternate-reverse',
			'normal',
			'reverse'
		  ],
		  'animation-fill-mode': [
			'backwards',
			'both',
			'forwards',
			'none'
		  ],
		  'animation-iteration-count': [
			'infinite'
		  ],
		  'animation-name': [
			'none'
		  ],
		  'animation-play-state': [
			'paused',
			'running'
		  ],
		  'animation-timing-function': [
			'ease',
			'ease-in',
			'ease-in-out',
			'ease-out',
			'linear',
			'step-end',
			'step-start'
		  ],
		  'background-attachment': [
			'fixed',
			'inherit',
			'local',
			'scroll'
		  ],
		  'background-clip': [
			'border-box',
			'content-box',
			'inherit',
			'padding-box',
			'text'
		  ],
		  'background-origin': [
			'border-box',
			'content-box',
			'inherit',
			'padding-box'
		  ],
		  'background-position': [
			'bottom',
			'center',
			'left',
			'right',
			'top'
		  ],
		  'background-repeat': [
			'no-repeat',
			'inherit',
			'repeat',
			'repeat-x',
			'repeat-y',
			'round',
			'space'
		  ],
		  'background-size': [
			'auto',
			'cover',
			'contain'
		  ],
		  'border-collapse': [
			'collapse',
			'inherit',
			'separate'
		  ],
		  'bottom': [
			'auto'
		  ],
		  'clear': [
			'both',
			'left',
			'none',
			'right'
		  ],
		  'color': [
			'transparent'
		  ],
		  'cursor': [
			'all-scroll',
			'auto',
			'col-resize',
			'crosshair',
			'default',
			'e-resize',
			'help',
			'move',
			'n-resize',
			'ne-resize',
			'no-drop',
			'not-allowed',
			'nw-resize',
			'pointer',
			'progress',
			'row-resize',
			's-resize',
			'se-resize',
			'sw-resize',
			'text',
			'vertical-text',
			'w-resize',
			'wait'
		  ],
		  'display': [
			'block',
			'inline',
			'inline-block',
			'inline-table',
			'list-item',
			'none',
			'table',
			'table-caption',
			'table-cell',
			'table-column',
			'table-column-group',
			'table-footer-group',
			'table-header-group',
			'table-row',
			'table-row-group'
		  ],
		  'float': [
			'left',
			'none',
			'right'
		  ],
		  'left': [
			'auto'
		  ],
		  'font': [
			'caption',
			'icon',
			'menu',
			'message-box',
			'small-caption',
			'status-bar',
			'unset'
		  ],
		  'font-size': [
			'large',
			'larger',
			'medium',
			'small',
			'smaller',
			'x-large',
			'x-small',
			'xx-large',
			'xx-small'
		  ],
		  'font-stretch': [
			'condensed',
			'expanded',
			'extra-condensed',
			'extra-expanded',
			'normal',
			'semi-condensed',
			'semi-expanded',
			'ultra-condensed',
			'ultra-expanded'
		  ],
		  'font-style': [
			'italic',
			'normal',
			'oblique'
		  ],
		  'font-variant': [
			'normal',
			'small-caps'
		  ],
		  'font-weight': [
			'100',
			'200',
			'300',
			'400',
			'500',
			'600',
			'700',
			'800',
			'900',
			'bold',
			'bolder',
			'lighter',
			'normal'
		  ],
		  'line-height': [
			'normal'
		  ],
		  'list-style-position': [
			'inside',
			'outside'
		  ],
		  'list-style-type': [
			'armenian',
			'circle',
			'decimal',
			'decimal-leading-zero',
			'disc',
			'decimal|disc', // this is the default value of list-style-type, see comment in compactable.js
			'georgian',
			'lower-alpha',
			'lower-greek',
			'lower-latin',
			'lower-roman',
			'none',
			'square',
			'upper-alpha',
			'upper-latin',
			'upper-roman'
		  ],
		  'overflow': [
			'auto',
			'hidden',
			'scroll',
			'visible'
		  ],
		  'position': [
			'absolute',
			'fixed',
			'relative',
			'static'
		  ],
		  'right': [
			'auto'
		  ],
		  'text-align': [
			'center',
			'justify',
			'left',
			'left|right', // this is the default value of list-style-type, see comment in compactable.js
			'right'
		  ],
		  'text-decoration': [
			'line-through',
			'none',
			'overline',
			'underline'
		  ],
		  'text-overflow': [
			'clip',
			'ellipsis'
		  ],
		  'top': [
			'auto'
		  ],
		  'vertical-align': [
			'baseline',
			'bottom',
			'middle',
			'sub',
			'super',
			'text-bottom',
			'text-top',
			'top'
		  ],
		  'visibility': [
			'collapse',
			'hidden',
			'visible'
		  ],
		  'white-space': [
			'normal',
			'nowrap',
			'pre'
		  ],
		  'width': [
			'inherit',
			'initial',
			'medium',
			'thick',
			'thin'
		  ]
		};

		var Units = [
		  '%',
		  'ch',
		  'cm',
		  'em',
		  'ex',
		  'in',
		  'mm',
		  'pc',
		  'pt',
		  'px',
		  'rem',
		  'vh',
		  'vm',
		  'vmax',
		  'vmin',
		  'vw'
		];

		function isAnimationTimingFunction() {
		  var isTimingFunctionKeyword = isKeyword('animation-timing-function');

		  return function (value) {
			return isTimingFunctionKeyword(value) || animationTimingFunctionRegex.test(value);
		  };
		}

		function isColor(value) {
		  return value != 'auto' &&
			(
			  isKeyword('color')(value) ||
			  isHexColor(value) ||
			  isColorFunction(value) ||
			  isNamedEntity(value)
			);
		}

		function isColorFunction(value) {
		  return isRgbColor(value) || isHslColor(value);
		}

		function isDynamicUnit(value) {
		  return calcRegex.test(value);
		}

		function isFunction(value) {
		  return functionAnyRegex.test(value);
		}

		function isHexColor(value) {
		  return shortHexColorRegex.test(value) || longHexColorRegex.test(value);
		}

		function isHslColor(value) {
		  return hslColorRegex.test(value);
		}

		function isIdentifier(value) {
		  return identifierRegex.test(value);
		}

		function isImage(value) {
		  return value == 'none' || value == 'inherit' || isUrl(value);
		}

		function isKeyword(propertyName) {
		  return function(value) {
			return Keywords[propertyName].indexOf(value) > -1;
		  };
		}

		function isNamedEntity(value) {
		  return namedEntityRegex.test(value);
		}

		function isNumber(value) {
		  return scanForNumber(value) == value.length;
		}

		function isRgbColor(value) {
		  return rgbColorRegex.test(value);
		}

		function isPrefixed(value) {
		  return prefixRegex.test(value);
		}

		function isPositiveNumber(value) {
		  return isNumber(value) &&
			parseFloat(value) >= 0;
		}

		function isVariable(value) {
		  return variableRegex.test(value);
		}

		function isTime(value) {
		  var numberUpTo = scanForNumber(value);

		  return numberUpTo == value.length && parseInt(value) === 0 ||
			numberUpTo > -1 && validTimeUnits.indexOf(value.slice(numberUpTo + 1)) > -1;
		}

		function isUnit(validUnits, value) {
		  var numberUpTo = scanForNumber(value);

		  return numberUpTo == value.length && parseInt(value) === 0 ||
			numberUpTo > -1 && validUnits.indexOf(value.slice(numberUpTo + 1)) > -1 ||
			value == 'auto' ||
			value == 'inherit';
		}

		function isUrl(value) {
		  return urlRegex.test(value);
		}

		function isZIndex(value) {
		  return value == 'auto' ||
			isNumber(value) ||
			isKeyword('^')(value);
		}

		function scanForNumber(value) {
		  var hasDot = false;
		  var hasSign = false;
		  var character;
		  var i, l;

		  for (i = 0, l = value.length; i < l; i++) {
			character = value[i];

			if (i === 0 && (character == PLUS_SIGN || character == MINUS_SIGN)) {
			  hasSign = true;
			} else if (i > 0 && hasSign && (character == PLUS_SIGN || character == MINUS_SIGN)) {
			  return i - 1;
			} else if (character == DECIMAL_DOT && !hasDot) {
			  hasDot = true;
			} else if (character == DECIMAL_DOT && hasDot) {
			  return i - 1;
			} else if (decimalRegex.test(character)) {
			  continue;
			} else {
			  return i - 1;
			}
		  }

		  return i;
		}

		function validator(compatibility) {
		  var validUnits = Units.slice(0).filter(function (value) {
			return !(value in compatibility.units) || compatibility.units[value] === true;
		  });

		  return {
			colorOpacity: compatibility.colors.opacity,
			isAnimationDirectionKeyword: isKeyword('animation-direction'),
			isAnimationFillModeKeyword: isKeyword('animation-fill-mode'),
			isAnimationIterationCountKeyword: isKeyword('animation-iteration-count'),
			isAnimationNameKeyword: isKeyword('animation-name'),
			isAnimationPlayStateKeyword: isKeyword('animation-play-state'),
			isAnimationTimingFunction: isAnimationTimingFunction(),
			isBackgroundAttachmentKeyword: isKeyword('background-attachment'),
			isBackgroundClipKeyword: isKeyword('background-clip'),
			isBackgroundOriginKeyword: isKeyword('background-origin'),
			isBackgroundPositionKeyword: isKeyword('background-position'),
			isBackgroundRepeatKeyword: isKeyword('background-repeat'),
			isBackgroundSizeKeyword: isKeyword('background-size'),
			isColor: isColor,
			isColorFunction: isColorFunction,
			isDynamicUnit: isDynamicUnit,
			isFontKeyword: isKeyword('font'),
			isFontSizeKeyword: isKeyword('font-size'),
			isFontStretchKeyword: isKeyword('font-stretch'),
			isFontStyleKeyword: isKeyword('font-style'),
			isFontVariantKeyword: isKeyword('font-variant'),
			isFontWeightKeyword: isKeyword('font-weight'),
			isFunction: isFunction,
			isGlobal: isKeyword('^'),
			isHslColor: isHslColor,
			isIdentifier: isIdentifier,
			isImage: isImage,
			isKeyword: isKeyword,
			isLineHeightKeyword: isKeyword('line-height'),
			isListStylePositionKeyword: isKeyword('list-style-position'),
			isListStyleTypeKeyword: isKeyword('list-style-type'),
			isNumber: isNumber,
			isPrefixed: isPrefixed,
			isPositiveNumber: isPositiveNumber,
			isRgbColor: isRgbColor,
			isStyleKeyword: isKeyword('*-style'),
			isTime: isTime,
			isUnit: isUnit.bind(null, validUnits),
			isUrl: isUrl,
			isVariable: isVariable,
			isWidth: isKeyword('width'),
			isZIndex: isZIndex
		  };
		}

		return validator;
	};
	//#endregion

	//#region URL: /optimizer/wrap-for-optimizing
	modules['/optimizer/wrap-for-optimizing'] = function () {
		var Hack = require('/optimizer/hack');

		var Marker = require('/tokenizer/marker');
		var Token = require('/tokenizer/token');

		var Match = {
		  ASTERISK: '*',
		  BACKSLASH: '\\',
		  BANG: '!',
		  BANG_SUFFIX_PATTERN: /!\w+$/,
		  IMPORTANT_TOKEN: '!important',
		  IMPORTANT_TOKEN_PATTERN: new RegExp('!important$', 'i'),
		  IMPORTANT_WORD: 'important',
		  IMPORTANT_WORD_PATTERN: new RegExp('important$', 'i'),
		  SUFFIX_BANG_PATTERN: /!$/,
		  UNDERSCORE: '_',
		  VARIABLE_REFERENCE_PATTERN: /var\(--.+\)$/
		};

		function wrapAll(properties, includeVariable, skipProperties) {
		  var wrapped = [];
		  var single;
		  var property;
		  var i;

		  for (i = properties.length - 1; i >= 0; i--) {
			property = properties[i];

			if (property[0] != Token.PROPERTY) {
			  continue;
			}

			if (!includeVariable && someVariableReferences(property)) {
			  continue;
			}

			if (skipProperties && skipProperties.indexOf(property[1][1]) > -1) {
			  continue;
			}

			single = wrapSingle(property);
			single.all = properties;
			single.position = i;
			wrapped.unshift(single);
		  }

		  return wrapped;
		}

		function someVariableReferences(property) {
		  var i, l;
		  var value;

		  // skipping `property` and property name tokens
		  for (i = 2, l = property.length; i < l; i++) {
			value = property[i];

			if (value[0] != Token.PROPERTY_VALUE) {
			  continue;
			}

			if (isVariableReference(value[1])) {
			  return true;
			}
		  }

		  return false;
		}

		function isVariableReference(value) {
		  return Match.VARIABLE_REFERENCE_PATTERN.test(value);
		}

		function isMultiplex(property) {
		  var value;
		  var i, l;

		  for (i = 3, l = property.length; i < l; i++) {
			value = property[i];

			if (value[0] == Token.PROPERTY_VALUE && (value[1] == Marker.COMMA || value[1] == Marker.FORWARD_SLASH)) {
			  return true;
			}
		  }

		  return false;
		}

		function hackFrom(property) {
		  var match = false;
		  var name = property[1][1];
		  var lastValue = property[property.length - 1];

		  if (name[0] == Match.UNDERSCORE) {
			match = [Hack.UNDERSCORE];
		  } else if (name[0] == Match.ASTERISK) {
			match = [Hack.ASTERISK];
		  } else if (lastValue[1][0] == Match.BANG && !lastValue[1].match(Match.IMPORTANT_WORD_PATTERN)) {
			match = [Hack.BANG];
		  } else if (lastValue[1].indexOf(Match.BANG) > 0 && !lastValue[1].match(Match.IMPORTANT_WORD_PATTERN) && Match.BANG_SUFFIX_PATTERN.test(lastValue[1])) {
			match = [Hack.BANG];
		  } else if (lastValue[1].indexOf(Match.BACKSLASH) > 0 && lastValue[1].indexOf(Match.BACKSLASH) == lastValue[1].length - Match.BACKSLASH.length - 1) {
			match = [Hack.BACKSLASH, lastValue[1].substring(lastValue[1].indexOf(Match.BACKSLASH) + 1)];
		  } else if (lastValue[1].indexOf(Match.BACKSLASH) === 0 && lastValue[1].length == 2) {
			match = [Hack.BACKSLASH, lastValue[1].substring(1)];
		  }

		  return match;
		}

		function isImportant(property) {
		  if (property.length < 3)
			return false;

		  var lastValue = property[property.length - 1];
		  if (Match.IMPORTANT_TOKEN_PATTERN.test(lastValue[1])) {
			return true;
		  } else if (Match.IMPORTANT_WORD_PATTERN.test(lastValue[1]) && Match.SUFFIX_BANG_PATTERN.test(property[property.length - 2][1])) {
			return true;
		  }

		  return false;
		}

		function stripImportant(property) {
		  var lastValue = property[property.length - 1];
		  var oneButLastValue = property[property.length - 2];

		  if (Match.IMPORTANT_TOKEN_PATTERN.test(lastValue[1])) {
			lastValue[1] = lastValue[1].replace(Match.IMPORTANT_TOKEN_PATTERN, '');
		  } else {
			lastValue[1] = lastValue[1].replace(Match.IMPORTANT_WORD_PATTERN, '');
			oneButLastValue[1] = oneButLastValue[1].replace(Match.SUFFIX_BANG_PATTERN, '');
		  }

		  if (lastValue[1].length === 0) {
			property.pop();
		  }

		  if (oneButLastValue[1].length === 0) {
			property.pop();
		  }
		}

		function stripPrefixHack(property) {
		  property[1][1] = property[1][1].substring(1);
		}

		function stripSuffixHack(property, hackFrom) {
		  var lastValue = property[property.length - 1];
		  lastValue[1] = lastValue[1]
			.substring(0, lastValue[1].indexOf(hackFrom[0] == Hack.BACKSLASH ? Match.BACKSLASH : Match.BANG))
			.trim();

		  if (lastValue[1].length === 0) {
			property.pop();
		  }
		}

		function wrapSingle(property) {
		  var importantProperty = isImportant(property);
		  if (importantProperty) {
			stripImportant(property);
		  }

		  var whichHack = hackFrom(property);
		  if (whichHack[0] == Hack.ASTERISK || whichHack[0] == Hack.UNDERSCORE) {
			stripPrefixHack(property);
		  } else if (whichHack[0] == Hack.BACKSLASH || whichHack[0] == Hack.BANG) {
			stripSuffixHack(property, whichHack);
		  }

		  return {
			block: property[2] && property[2][0] == Token.PROPERTY_BLOCK,
			components: [],
			dirty: false,
			hack: whichHack,
			important: importantProperty,
			name: property[1][1],
			multiplex: property.length > 3 ? isMultiplex(property) : false,
			position: 0,
			shorthand: false,
			unused: false,
			value: property.slice(2)
		  };
		}

		var exports = {
		  all: wrapAll,
		  single: wrapSingle
		};

		return exports;
	};
	//#endregion

	//#region URL: /options/compatibility
	modules['/options/compatibility'] = function () {
		var DEFAULTS = {
		  '*': {
			colors: {
			  opacity: true // rgba / hsla
			},
			properties: {
			  backgroundClipMerging: true, // background-clip to shorthand
			  backgroundOriginMerging: true, // background-origin to shorthand
			  backgroundSizeMerging: true, // background-size to shorthand
			  colors: true, // any kind of color transformations, like `#ff00ff` to `#f0f` or `#fff` into `red`
			  ieBangHack: false, // !ie suffix hacks on IE<8
			  ieFilters: false, // whether to preserve `filter` and `-ms-filter` properties
			  iePrefixHack: false, // underscore / asterisk prefix hacks on IE
			  ieSuffixHack: false, // \9 suffix hacks on IE6-9
			  merging: true, // merging properties into one
			  shorterLengthUnits: false, // optimize pixel units into `pt`, `pc` or `in` units
			  spaceAfterClosingBrace: true, // 'url() no-repeat' to 'url()no-repeat'
			  urlQuotes: false, // whether to wrap content of `url()` into quotes or not
			  zeroUnits: true // 0[unit] -> 0
			},
			selectors: {
			  adjacentSpace: false, // div+ nav Android stock browser hack
			  ie7Hack: false, // *+html hack
			  mergeablePseudoClasses: [
				':active',
				':after',
				':before',
				':empty',
				':checked',
				':disabled',
				':empty',
				':enabled',
				':first-child',
				':first-letter',
				':first-line',
				':first-of-type',
				':focus',
				':hover',
				':lang',
				':last-child',
				':last-of-type',
				':link',
				':not',
				':nth-child',
				':nth-last-child',
				':nth-last-of-type',
				':nth-of-type',
				':only-child',
				':only-of-type',
				':root',
				':target',
				':visited'
			  ], // selectors with these pseudo-classes can be merged as these are universally supported
			  mergeablePseudoElements: [
				'::after',
				'::before',
				'::first-letter',
				'::first-line'
			  ], // selectors with these pseudo-elements can be merged as these are universally supported
			  mergeLimit: 8191, // number of rules that can be safely merged together
			  multiplePseudoMerging: true
			},
			units: {
			  ch: true,
			  in: true,
			  pc: true,
			  pt: true,
			  rem: true,
			  vh: true,
			  vm: true, // vm is vmin on IE9+ see https://developer.mozilla.org/en-US/docs/Web/CSS/length
			  vmax: true,
			  vmin: true,
			  vw: true
			}
		  }
		};

		DEFAULTS.ie11 = DEFAULTS['*'];

		DEFAULTS.ie10 = DEFAULTS['*'];

		DEFAULTS.ie9 = merge(DEFAULTS['*'], {
		  properties: {
			ieFilters: true,
			ieSuffixHack: true
		  }
		});

		DEFAULTS.ie8 = merge(DEFAULTS.ie9, {
		  colors: {
			opacity: false
		  },
		  properties: {
			backgroundClipMerging: false,
			backgroundOriginMerging: false,
			backgroundSizeMerging: false,
			iePrefixHack: true,
			merging: false
		  },
		  selectors: {
			mergeablePseudoClasses: [
			  ':after',
			  ':before',
			  ':first-child',
			  ':first-letter',
			  ':focus',
			  ':hover',
			  ':visited'
			],
			mergeablePseudoElements: []
		  },
		  units: {
			ch: false,
			rem: false,
			vh: false,
			vm: false,
			vmax: false,
			vmin: false,
			vw: false
		  }
		});

		DEFAULTS.ie7 = merge(DEFAULTS.ie8, {
		  properties: {
			ieBangHack: true
		  },
		  selectors: {
			ie7Hack: true,
			mergeablePseudoClasses: [
			  ':first-child',
			  ':first-letter',
			  ':hover',
			  ':visited'
			]
		  },
		});

		function compatibilityFrom(source) {
		  return merge(DEFAULTS['*'], calculateSource(source));
		}

		function merge(source, target) {
		  for (var key in source) {
			var value = source[key];

			if (typeof value === 'object' && !Array.isArray(value)) {
			  target[key] = merge(value, target[key] || {});
			} else {
			  target[key] = key in target ? target[key] : value;
			}
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

		return compatibilityFrom;
	};
	//#endregion

	//#region URL: /options/format
	modules['/options/format'] = function () {
		var override = require('/utils/override');

		var Breaks = {
		  AfterAtRule: 'afterAtRule',
		  AfterBlockBegins: 'afterBlockBegins',
		  AfterBlockEnds: 'afterBlockEnds',
		  AfterComment: 'afterComment',
		  AfterProperty: 'afterProperty',
		  AfterRuleBegins: 'afterRuleBegins',
		  AfterRuleEnds: 'afterRuleEnds',
		  BeforeBlockEnds: 'beforeBlockEnds',
		  BetweenSelectors: 'betweenSelectors'
		};

		var IndentWith = {
		  Space: ' ',
		  Tab: '\t'
		};

		var Spaces = {
		  AroundSelectorRelation: 'aroundSelectorRelation',
		  BeforeBlockBegins: 'beforeBlockBegins',
		  BeforeValue: 'beforeValue'
		};

		var DEFAULTS = {
		  breaks: breaks(false),
		  indentBy: 0,
		  indentWith: IndentWith.Space,
		  spaces: spaces(false),
		  wrapAt: false
		};

		var BEAUTIFY_ALIAS = 'beautify';
		var KEEP_BREAKS_ALIAS = 'keep-breaks';

		var OPTION_SEPARATOR = ';';
		var OPTION_NAME_VALUE_SEPARATOR = ':';
		var HASH_VALUES_OPTION_SEPARATOR = ',';
		var HASH_VALUES_NAME_VALUE_SEPARATOR = '=';

		var FALSE_KEYWORD_1 = 'false';
		var FALSE_KEYWORD_2 = 'off';
		var TRUE_KEYWORD_1 = 'true';
		var TRUE_KEYWORD_2 = 'on';

		function breaks(value) {
		  var breakOptions = {};

		  breakOptions[Breaks.AfterAtRule] = value;
		  breakOptions[Breaks.AfterBlockBegins] = value;
		  breakOptions[Breaks.AfterBlockEnds] = value;
		  breakOptions[Breaks.AfterComment] = value;
		  breakOptions[Breaks.AfterProperty] = value;
		  breakOptions[Breaks.AfterRuleBegins] = value;
		  breakOptions[Breaks.AfterRuleEnds] = value;
		  breakOptions[Breaks.BeforeBlockEnds] = value;
		  breakOptions[Breaks.BetweenSelectors] = value;

		  return breakOptions;
		}

		function spaces(value) {
		  var spaceOptions = {};

		  spaceOptions[Spaces.AroundSelectorRelation] = value;
		  spaceOptions[Spaces.BeforeBlockBegins] = value;
		  spaceOptions[Spaces.BeforeValue] = value;

		  return spaceOptions;
		}

		function formatFrom(source) {
		  if (source === undefined || source === false) {
			return false;
		  }

		  if (typeof source == 'object' && 'indentBy' in source) {
			source = override(source, { indentBy: parseInt(source.indentBy) });
		  }

		  if (typeof source == 'object' && 'indentWith' in source) {
			source = override(source, { indentWith: mapIndentWith(source.indentWith) });
		  }

		  if (typeof source == 'object') {
			return override(DEFAULTS, source);
		  }

		  if (typeof source == 'object') {
			return override(DEFAULTS, source);
		  }

		  if (typeof source == 'string' && source == BEAUTIFY_ALIAS) {
			return override(DEFAULTS, {
			  breaks: breaks(true),
			  indentBy: 2,
			  spaces: spaces(true)
			});
		  }

		  if (typeof source == 'string' && source == KEEP_BREAKS_ALIAS) {
			return override(DEFAULTS, {
			  breaks: {
				afterAtRule: true,
				afterBlockBegins: true,
				afterBlockEnds: true,
				afterComment: true,
				afterRuleEnds: true,
				beforeBlockEnds: true
			  }
			});
		  }

		  if (typeof source == 'string') {
			return override(DEFAULTS, toHash(source));
		  }

		  return DEFAULTS;
		}

		function toHash(string) {
		  return string
			.split(OPTION_SEPARATOR)
			.reduce(function (accumulator, directive) {
			  var parts = directive.split(OPTION_NAME_VALUE_SEPARATOR);
			  var name = parts[0];
			  var value = parts[1];

			  if (name == 'breaks' || name == 'spaces') {
				accumulator[name] = hashValuesToHash(value);
			  } else if (name == 'indentBy' || name == 'wrapAt') {
				accumulator[name] = parseInt(value);
			  } else if (name == 'indentWith') {
				accumulator[name] = mapIndentWith(value);
			  }

			  return accumulator;
			}, {});
		}

		function hashValuesToHash(string) {
		  return string
			.split(HASH_VALUES_OPTION_SEPARATOR)
			.reduce(function (accumulator, directive) {
			  var parts = directive.split(HASH_VALUES_NAME_VALUE_SEPARATOR);
			  var name = parts[0];
			  var value = parts[1];

			  accumulator[name] = normalizeValue(value);

			  return accumulator;
			}, {});
		}


		function normalizeValue(value) {
		  switch (value) {
			case FALSE_KEYWORD_1:
			case FALSE_KEYWORD_2:
			  return false;
			case TRUE_KEYWORD_1:
			case TRUE_KEYWORD_2:
			  return true;
			default:
			  return value;
		  }
		}

		function mapIndentWith(value) {
		  switch (value) {
			case 'space':
			  return IndentWith.Space;
			case 'tab':
			  return IndentWith.Tab;
			default:
			  return value;
		  }
		}

		var exports = {
		  Breaks: Breaks,
		  Spaces: Spaces,
		  formatFrom: formatFrom
		};

		return exports;
	};
	//#endregion

	//#region URL: /options/optimization-level
	modules['/options/optimization-level'] = function () {
		var roundingPrecisionFrom = require('/options/rounding-precision').roundingPrecisionFrom;

		var override = require('/utils/override');

		var OptimizationLevel = {
		  Zero: '0',
		  One: '1',
		  Two: '2'
		};

		var DEFAULTS = {};

		DEFAULTS[OptimizationLevel.Zero] = {};
		DEFAULTS[OptimizationLevel.One] = {
		  cleanupCharsets: true,
		  normalizeUrls: true,
		  optimizeBackground: true,
		  optimizeBorderRadius: true,
		  optimizeFilter: true,
		  optimizeFontWeight: true,
		  optimizeOutline: true,
		  removeEmpty: true,
		  removeNegativePaddings: true,
		  removeQuotes: true,
		  removeWhitespace: true,
		  replaceMultipleZeros: true,
		  replaceTimeUnits: true,
		  replaceZeroUnits: true,
		  roundingPrecision: roundingPrecisionFrom(undefined),
		  selectorsSortingMethod: 'standard',
		  specialComments: 'all',
		  tidyAtRules: true,
		  tidyBlockScopes: true,
		  tidySelectors: true,
		  transform: noop
		};
		DEFAULTS[OptimizationLevel.Two] = {
		  mergeAdjacentRules: true,
		  mergeIntoShorthands: true,
		  mergeMedia: true,
		  mergeNonAdjacentRules: true,
		  mergeSemantically: false,
		  overrideProperties: true,
		  removeEmpty: true,
		  reduceNonAdjacentRules: true,
		  removeDuplicateFontRules: true,
		  removeDuplicateMediaBlocks: true,
		  removeDuplicateRules: true,
		  removeUnusedAtRules: false,
		  restructureRules: false,
		  skipProperties: []
		};

		var ALL_KEYWORD_1 = '*';
		var ALL_KEYWORD_2 = 'all';
		var FALSE_KEYWORD_1 = 'false';
		var FALSE_KEYWORD_2 = 'off';
		var TRUE_KEYWORD_1 = 'true';
		var TRUE_KEYWORD_2 = 'on';

		var LIST_VALUE_SEPARATOR = ',';
		var OPTION_SEPARATOR = ';';
		var OPTION_VALUE_SEPARATOR = ':';

		function noop() {}

		function optimizationLevelFrom(source) {
		  var level = override(DEFAULTS, {});
		  var Zero = OptimizationLevel.Zero;
		  var One = OptimizationLevel.One;
		  var Two = OptimizationLevel.Two;


		  if (undefined === source) {
			delete level[Two];
			return level;
		  }

		  if (typeof source == 'string') {
			source = parseInt(source);
		  }

		  if (typeof source == 'number' && source === parseInt(Two)) {
			return level;
		  }

		  if (typeof source == 'number' && source === parseInt(One)) {
			delete level[Two];
			return level;
		  }

		  if (typeof source == 'number' && source === parseInt(Zero)) {
			delete level[Two];
			delete level[One];
			return level;
		  }

		  if (typeof source == 'object') {
			source = covertValuesToHashes(source);
		  }

		  if (One in source && 'roundingPrecision' in source[One]) {
			source[One].roundingPrecision = roundingPrecisionFrom(source[One].roundingPrecision);
		  }

		  if (Two in source && 'skipProperties' in source[Two] && typeof(source[Two].skipProperties) == 'string') {
			source[Two].skipProperties = source[Two].skipProperties.split(LIST_VALUE_SEPARATOR);
		  }

		  if (Zero in source || One in source || Two in source) {
			level[Zero] = override(level[Zero], source[Zero]);
		  }

		  if (One in source && ALL_KEYWORD_1 in source[One]) {
			level[One] = override(level[One], defaults(One, normalizeValue(source[One][ALL_KEYWORD_1])));
			delete source[One][ALL_KEYWORD_1];
		  }

		  if (One in source && ALL_KEYWORD_2 in source[One]) {
			level[One] = override(level[One], defaults(One, normalizeValue(source[One][ALL_KEYWORD_2])));
			delete source[One][ALL_KEYWORD_2];
		  }

		  if (One in source || Two in source) {
			level[One] = override(level[One], source[One]);
		  } else {
			delete level[One];
		  }

		  if (Two in source && ALL_KEYWORD_1 in source[Two]) {
			level[Two] = override(level[Two], defaults(Two, normalizeValue(source[Two][ALL_KEYWORD_1])));
			delete source[Two][ALL_KEYWORD_1];
		  }

		  if (Two in source && ALL_KEYWORD_2 in source[Two]) {
			level[Two] = override(level[Two], defaults(Two, normalizeValue(source[Two][ALL_KEYWORD_2])));
			delete source[Two][ALL_KEYWORD_2];
		  }

		  if (Two in source) {
			level[Two] = override(level[Two], source[Two]);
		  } else {
			delete level[Two];
		  }

		  return level;
		}

		function defaults(level, value) {
		  var options = override(DEFAULTS[level], {});
		  var key;

		  for (key in options) {
			if (typeof options[key] == 'boolean') {
			  options[key] = value;
			}
		  }

		  return options;
		}

		function normalizeValue(value) {
		  switch (value) {
			case FALSE_KEYWORD_1:
			case FALSE_KEYWORD_2:
			  return false;
			case TRUE_KEYWORD_1:
			case TRUE_KEYWORD_2:
			  return true;
			default:
			  return value;
		  }
		}

		function covertValuesToHashes(source) {
		  var clonedSource = override(source, {});
		  var level;
		  var i;

		  for (i = 0; i <= 2; i++) {
			level = '' + i;

			if (level in clonedSource && (clonedSource[level] === undefined || clonedSource[level] === false)) {
			  delete clonedSource[level];
			}

			if (level in clonedSource && clonedSource[level] === true) {
			  clonedSource[level] = {};
			}

			if (level in clonedSource && typeof clonedSource[level] == 'string') {
			  clonedSource[level] = covertToHash(clonedSource[level], level);
			}
		  }

		  return clonedSource;
		}

		function covertToHash(asString, level) {
		  return asString
			.split(OPTION_SEPARATOR)
			.reduce(function (accumulator, directive) {
			  var parts = directive.split(OPTION_VALUE_SEPARATOR);
			  var name = parts[0];
			  var value = parts[1];
			  var normalizedValue = normalizeValue(value);

			  if (ALL_KEYWORD_1 == name || ALL_KEYWORD_2 == name) {
				accumulator = override(accumulator, defaults(level, normalizedValue));
			  } else {
				accumulator[name] = normalizedValue;
			  }

			  return accumulator;
			}, {});
		}

		var exports = {
		  OptimizationLevel: OptimizationLevel,
		  optimizationLevelFrom: optimizationLevelFrom,
		};

		return exports;
	};
	//#endregion

	//#region URL: /options/rounding-precision
	modules['/options/rounding-precision'] = function () {
		var override = require('/utils/override');

		var INTEGER_PATTERN = /^\d+$/;

		var ALL_UNITS = ['*', 'all'];
		var DEFAULT_PRECISION = 'off'; // all precision changes are disabled
		var DIRECTIVES_SEPARATOR = ','; // e.g. *=5,px=3
		var DIRECTIVE_VALUE_SEPARATOR = '='; // e.g. *=5

		function roundingPrecisionFrom(source) {
		  return override(defaults(DEFAULT_PRECISION), buildPrecisionFrom(source));
		}

		function defaults(value) {
		  return {
			'ch': value,
			'cm': value,
			'em': value,
			'ex': value,
			'in': value,
			'mm': value,
			'pc': value,
			'pt': value,
			'px': value,
			'q': value,
			'rem': value,
			'vh': value,
			'vmax': value,
			'vmin': value,
			'vw': value,
			'%': value
		  };
		}

		function buildPrecisionFrom(source) {
		  if (source === null || source === undefined) {
			return {};
		  }

		  if (typeof source == 'boolean') {
			return {};
		  }

		  if (typeof source == 'number' && source == -1) {
			return defaults(DEFAULT_PRECISION);
		  }

		  if (typeof source == 'number') {
			return defaults(source);
		  }

		  if (typeof source == 'string' && INTEGER_PATTERN.test(source)) {
			return defaults(parseInt(source));
		  }

		  if (typeof source == 'string' && source == DEFAULT_PRECISION) {
			return defaults(DEFAULT_PRECISION);
		  }

		  if (typeof source == 'object') {
			return source;
		  }

		  return source
			.split(DIRECTIVES_SEPARATOR)
			.reduce(function (accumulator, directive) {
			  var directiveParts = directive.split(DIRECTIVE_VALUE_SEPARATOR);
			  var name = directiveParts[0];
			  var value = parseInt(directiveParts[1]);

			  if (isNaN(value) || value == -1) {
				value = DEFAULT_PRECISION;
			  }

			  if (ALL_UNITS.indexOf(name) > -1) {
				accumulator = override(accumulator, defaults(value));
			  } else {
				accumulator[name] = value;
			  }

			  return accumulator;
			}, {});
		}

		var exports = {
		  DEFAULT: DEFAULT_PRECISION,
		  roundingPrecisionFrom: roundingPrecisionFrom
		};

		return exports;
	};
	//#endregion

	//#region URL: /reader/read-sources
	modules['/reader/read-sources'] = function () {
		/*BT-
		var fs = require('fs');
		var path = require('path');

		var applySourceMaps = require('/reader/apply-source-maps');
		var extractImportUrlAndMedia = require('/reader/extract-import-url-and-media');
		var isAllowedResource = require('/reader/is-allowed-resource');
		var loadOriginalSources = require('/reader/load-original-sources');
		var normalizePath = require('/reader/normalize-path');
		var rebase = require('/reader/rebase');
		var rebaseLocalMap = require('/reader/rebase-local-map');
		var rebaseRemoteMap = require('/reader/rebase-remote-map');
		var restoreImport = require('/reader/restore-import');
		*/

		var tokenize = require('/tokenizer/tokenize');
		/*BT-
		var Token = require('/tokenizer/token');
		var Marker = require('/tokenizer/marker');
		var hasProtocol = require('/utils/has-protocol');
		var isImport = require('/utils/is-import');
		var isRemoteResource = require('/utils/is-remote-resource');

		var UNKNOWN_URI = 'uri:unknown';
		*/

		function readSources(input, context, callback) {
		  return doReadSources(input, context, /*BT- function (tokens) {
			return applySourceMaps(tokens, context, function () {
			  return loadOriginalSources(context, function () { return callback(tokens); });
			});
		  }*/
		    callback //BT+
		  );
		}

		function doReadSources(input, context, callback) {
		  /*BT-
		  if (typeof input == 'string') {
		  */
			return fromString(input, context, callback);
		  /*BT-
		  } else if (Buffer.isBuffer(input)) {
			return fromString(input.toString(), context, callback);
		  } else if (Array.isArray(input)) {
			return fromArray(input, context, callback);
		  } else if (typeof input == 'object') {
			return fromHash(input, context, callback);
		  }
		  */
		}

		function fromString(input, context, callback) {
		  context.source = undefined;
		  context.sourcesContent[undefined] = input;
		  /*BT-
		  context.stats.originalSize += input.length;
		  */

		  return fromStyles(input, context, /*BT- { inline: context.options.inline }*/null, callback);
		}

		/*BT-
		function fromArray(input, context, callback) {
		  var inputAsImports = input.reduce(function (accumulator, uriOrHash) {
			if (typeof uriOrHash === 'string') {
			  return addStringSource(uriOrHash, accumulator);
			} else {
			  return addHashSource(uriOrHash, context, accumulator);
			}

		  }, []);

		  return fromStyles(inputAsImports.join(''), context, { inline: ['all'] }, callback);
		}

		function fromHash(input, context, callback) {
		  var inputAsImports = addHashSource(input, context, []);
		  return fromStyles(inputAsImports.join(''), context, { inline: ['all'] }, callback);
		}

		function addStringSource(input, imports) {
		  imports.push(restoreAsImport(normalizeUri(input)));
		  return imports;
		}

		function addHashSource(input, context, imports) {
		  var uri;
		  var normalizedUri;
		  var source;

		  for (uri in input) {
			source = input[uri];
			normalizedUri = normalizeUri(uri);

			imports.push(restoreAsImport(normalizedUri));

			context.sourcesContent[normalizedUri] = source.styles;

			if (source.sourceMap) {
			  trackSourceMap(source.sourceMap, normalizedUri, context);
			}
		  }

		  return imports;
		}

		function normalizeUri(uri) {
		  var currentPath = path.resolve('');
		  var absoluteUri;
		  var relativeToCurrentPath;
		  var normalizedUri;

		  if (isRemoteResource(uri)) {
			return uri;
		  }

		  absoluteUri = path.isAbsolute(uri) ?
			uri :
			path.resolve(uri);
		  relativeToCurrentPath = path.relative(currentPath, absoluteUri);
		  normalizedUri = normalizePath(relativeToCurrentPath);

		  return normalizedUri;
		}

		function trackSourceMap(sourceMap, uri, context) {
		  var parsedMap = typeof sourceMap == 'string' ?
			  JSON.parse(sourceMap) :
			  sourceMap;
		  var rebasedMap = isRemoteResource(uri) ?
			rebaseRemoteMap(parsedMap, uri) :
			rebaseLocalMap(parsedMap, uri || UNKNOWN_URI, context.options.rebaseTo);

		  context.inputSourceMapTracker.track(uri, rebasedMap);
		}

		function restoreAsImport(uri) {
		  return restoreImport('url(' + uri + ')', '') + Marker.SEMICOLON;
		}
		*/

		function fromStyles(styles, context, parentInlinerContext, callback) {
		  var tokens;
		  /*BT-
		  var rebaseConfig = {};

		  if (!context.source) {
			rebaseConfig.fromBase = path.resolve('');
			rebaseConfig.toBase = context.options.rebaseTo;
		  } else if (isRemoteResource(context.source)) {
			rebaseConfig.fromBase = context.source;
			rebaseConfig.toBase = context.source;
		  } else if (path.isAbsolute(context.source)) {
			rebaseConfig.fromBase = path.dirname(context.source);
			rebaseConfig.toBase = context.options.rebaseTo;
		  } else {
			rebaseConfig.fromBase = path.dirname(path.resolve(context.source));
			rebaseConfig.toBase = context.options.rebaseTo;
		  }
		  */

		  tokens = tokenize(styles, context);
		  /*BT-
		  tokens = rebase(tokens, context.options.rebase, context.validator, rebaseConfig);

		  return allowsAnyImports(parentInlinerContext.inline) ?
			inline(tokens, context, parentInlinerContext, callback) :
			callback(tokens);*/
		  return callback(tokens); //BT+
		}

		/*BT-
		function allowsAnyImports(inline) {
		  return !(inline.length == 1 && inline[0] == 'none');
		}

		function inline(tokens, externalContext, parentInlinerContext, callback) {
		  var inlinerContext = {
			afterContent: false,
			callback: callback,
			errors: externalContext.errors,
			externalContext: externalContext,
			fetch: externalContext.options.fetch,
			inlinedStylesheets: parentInlinerContext.inlinedStylesheets || externalContext.inlinedStylesheets,
			inline: parentInlinerContext.inline,
			inlineRequest: externalContext.options.inlineRequest,
			inlineTimeout: externalContext.options.inlineTimeout,
			isRemote: parentInlinerContext.isRemote || false,
			localOnly: externalContext.localOnly,
			outputTokens: [],
			rebaseTo: externalContext.options.rebaseTo,
			sourceTokens: tokens,
			warnings: externalContext.warnings
		  };

		  return doInlineImports(inlinerContext);
		}

		function doInlineImports(inlinerContext) {
		  var token;
		  var i, l;

		  for (i = 0, l = inlinerContext.sourceTokens.length; i < l; i++) {
			token = inlinerContext.sourceTokens[i];

			if (token[0] == Token.AT_RULE && isImport(token[1])) {
			  inlinerContext.sourceTokens.splice(0, i);
			  return inlineStylesheet(token, inlinerContext);
			} else if (token[0] == Token.AT_RULE || token[0] == Token.COMMENT) {
			  inlinerContext.outputTokens.push(token);
			} else {
			  inlinerContext.outputTokens.push(token);
			  inlinerContext.afterContent = true;
			}
		  }

		  inlinerContext.sourceTokens = [];
		  return inlinerContext.callback(inlinerContext.outputTokens);
		}

		function inlineStylesheet(token, inlinerContext) {
		  var uriAndMediaQuery = extractImportUrlAndMedia(token[1]);
		  var uri = uriAndMediaQuery[0];
		  var mediaQuery = uriAndMediaQuery[1];
		  var metadata = token[2];

		  return isRemoteResource(uri) ?
			inlineRemoteStylesheet(uri, mediaQuery, metadata, inlinerContext) :
			inlineLocalStylesheet(uri, mediaQuery, metadata, inlinerContext);
		}

		function inlineRemoteStylesheet(uri, mediaQuery, metadata, inlinerContext) {
		  var isAllowed = isAllowedResource(uri, true, inlinerContext.inline);
		  var originalUri = uri;
		  var isLoaded = uri in inlinerContext.externalContext.sourcesContent;
		  var isRuntimeResource = !hasProtocol(uri);

		  if (inlinerContext.inlinedStylesheets.indexOf(uri) > -1) {
			inlinerContext.warnings.push('Ignoring remote @import of "' + uri + '" as it has already been imported.');
			inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
			return doInlineImports(inlinerContext);
		  } else if (inlinerContext.localOnly && inlinerContext.afterContent) {
			inlinerContext.warnings.push('Ignoring remote @import of "' + uri + '" as no callback given and after other content.');
			inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
			return doInlineImports(inlinerContext);
		  } else if (isRuntimeResource) {
			inlinerContext.warnings.push('Skipping remote @import of "' + uri + '" as no protocol given.');
			inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
			inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
			return doInlineImports(inlinerContext);
		  } else if (inlinerContext.localOnly && !isLoaded) {
			inlinerContext.warnings.push('Skipping remote @import of "' + uri + '" as no callback given.');
			inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
			inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
			return doInlineImports(inlinerContext);
		  } else if (!isAllowed && inlinerContext.afterContent) {
			inlinerContext.warnings.push('Ignoring remote @import of "' + uri + '" as resource is not allowed and after other content.');
			inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
			return doInlineImports(inlinerContext);
		  } else if (!isAllowed) {
			inlinerContext.warnings.push('Skipping remote @import of "' + uri + '" as resource is not allowed.');
			inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
			inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
			return doInlineImports(inlinerContext);
		  }

		  inlinerContext.inlinedStylesheets.push(uri);

		  function whenLoaded(error, importedStyles) {
			if (error) {
			  inlinerContext.errors.push('Broken @import declaration of "' + uri + '" - ' + error);

			  return process.nextTick(function () {
				inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
				inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
				doInlineImports(inlinerContext);
			  });
			}

			inlinerContext.inline = inlinerContext.externalContext.options.inline;
			inlinerContext.isRemote = true;

			inlinerContext.externalContext.source = originalUri;
			inlinerContext.externalContext.sourcesContent[uri] = importedStyles;
			inlinerContext.externalContext.stats.originalSize += importedStyles.length;

			return fromStyles(importedStyles, inlinerContext.externalContext, inlinerContext, function (importedTokens) {
			  importedTokens = wrapInMedia(importedTokens, mediaQuery, metadata);

			  inlinerContext.outputTokens = inlinerContext.outputTokens.concat(importedTokens);
			  inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);

			  return doInlineImports(inlinerContext);
			});
		  }

		  return isLoaded ?
			whenLoaded(null, inlinerContext.externalContext.sourcesContent[uri]) :
			inlinerContext.fetch(uri, inlinerContext.inlineRequest, inlinerContext.inlineTimeout, whenLoaded);
		}

		function inlineLocalStylesheet(uri, mediaQuery, metadata, inlinerContext) {
		  var currentPath = path.resolve('');
		  var absoluteUri = path.isAbsolute(uri) ?
			path.resolve(currentPath, uri[0] == '/' ? uri.substring(1) : uri) :
			path.resolve(inlinerContext.rebaseTo, uri);
		  var relativeToCurrentPath = path.relative(currentPath, absoluteUri);
		  var importedStyles;
		  var isAllowed = isAllowedResource(uri, false, inlinerContext.inline);
		  var normalizedPath = normalizePath(relativeToCurrentPath);
		  var isLoaded = normalizedPath in inlinerContext.externalContext.sourcesContent;

		  if (inlinerContext.inlinedStylesheets.indexOf(absoluteUri) > -1) {
			inlinerContext.warnings.push('Ignoring local @import of "' + uri + '" as it has already been imported.');
		  } else if (!isLoaded && (!fs.existsSync(absoluteUri) || !fs.statSync(absoluteUri).isFile())) {
			inlinerContext.errors.push('Ignoring local @import of "' + uri + '" as resource is missing.');
		  } else if (!isAllowed && inlinerContext.afterContent) {
			inlinerContext.warnings.push('Ignoring local @import of "' + uri + '" as resource is not allowed and after other content.');
		  } else if (inlinerContext.afterContent) {
			inlinerContext.warnings.push('Ignoring local @import of "' + uri + '" as after other content.');
		  } else if (!isAllowed) {
			inlinerContext.warnings.push('Skipping local @import of "' + uri + '" as resource is not allowed.');
			inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
		  } else {
			importedStyles = isLoaded ?
			  inlinerContext.externalContext.sourcesContent[normalizedPath] :
			  fs.readFileSync(absoluteUri, 'utf-8');

			inlinerContext.inlinedStylesheets.push(absoluteUri);
			inlinerContext.inline = inlinerContext.externalContext.options.inline;

			inlinerContext.externalContext.source = normalizedPath;
			inlinerContext.externalContext.sourcesContent[normalizedPath] = importedStyles;
			inlinerContext.externalContext.stats.originalSize += importedStyles.length;

			return fromStyles(importedStyles, inlinerContext.externalContext, inlinerContext, function (importedTokens) {
			  importedTokens = wrapInMedia(importedTokens, mediaQuery, metadata);

			  inlinerContext.outputTokens = inlinerContext.outputTokens.concat(importedTokens);
			  inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);

			  return doInlineImports(inlinerContext);
			});
		  }

		  inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);

		  return doInlineImports(inlinerContext);
		}

		function wrapInMedia(tokens, mediaQuery, metadata) {
		  if (mediaQuery) {
			return [[Token.NESTED_BLOCK, [[Token.NESTED_BLOCK_SCOPE, '@media ' + mediaQuery, metadata]], tokens]];
		  } else {
			return tokens;
		  }
		}
		*/

		return readSources;
	};
	//#endregion

	//#region URL: /tokenizer/marker
	modules['/tokenizer/marker'] = function () {
		var Marker = {
		  ASTERISK: '*',
		  AT: '@',
		  BACK_SLASH: '\\',
		  CLOSE_CURLY_BRACKET: '}',
		  CLOSE_ROUND_BRACKET: ')',
		  CLOSE_SQUARE_BRACKET: ']',
		  COLON: ':',
		  COMMA: ',',
		  DOUBLE_QUOTE: '"',
		  EXCLAMATION: '!',
		  FORWARD_SLASH: '/',
		  INTERNAL: '-clean-css-',
		  NEW_LINE_NIX: '\n',
		  NEW_LINE_WIN: '\r',
		  OPEN_CURLY_BRACKET: '{',
		  OPEN_ROUND_BRACKET: '(',
		  OPEN_SQUARE_BRACKET: '[',
		  SEMICOLON: ';',
		  SINGLE_QUOTE: '\'',
		  SPACE: ' ',
		  TAB: '\t',
		  UNDERSCORE: '_'
		};

		return Marker;
	};
	//#endregion

	//#region URL: /tokenizer/token
	modules['/tokenizer/token'] = function () {
		var Token = {
		  AT_RULE: 'at-rule', // e.g. `@import`, `@charset`
		  AT_RULE_BLOCK: 'at-rule-block', // e.g. `@font-face{...}`
		  AT_RULE_BLOCK_SCOPE: 'at-rule-block-scope', // e.g. `@font-face`
		  COMMENT: 'comment', // e.g. `/* comment */`
		  NESTED_BLOCK: 'nested-block', // e.g. `@media screen{...}`, `@keyframes animation {...}`
		  NESTED_BLOCK_SCOPE: 'nested-block-scope', // e.g. `@media`, `@keyframes`
		  PROPERTY: 'property', // e.g. `color:red`
		  PROPERTY_BLOCK: 'property-block', // e.g. `--var:{color:red}`
		  PROPERTY_NAME: 'property-name', // e.g. `color`
		  PROPERTY_VALUE: 'property-value', // e.g. `red`
		  RULE: 'rule', // e.g `div > a{...}`
		  RULE_SCOPE: 'rule-scope' // e.g `div > a`
		};

		return Token;
	};
	//#endregion

	//#region URL: /tokenizer/tokenize
	modules['/tokenizer/tokenize'] = function () {
		var Marker = require('/tokenizer/marker');
		var Token = require('/tokenizer/token');

		var formatPosition = require('/utils/format-position');

		var Level = {
		  BLOCK: 'block',
		  COMMENT: 'comment',
		  DOUBLE_QUOTE: 'double-quote',
		  RULE: 'rule',
		  SINGLE_QUOTE: 'single-quote'
		};

		var AT_RULES = [
		  '@charset',
		  '@import'
		];

		var BLOCK_RULES = [
		  '@-moz-document',
		  '@document',
		  '@-moz-keyframes',
		  '@-ms-keyframes',
		  '@-o-keyframes',
		  '@-webkit-keyframes',
		  '@keyframes',
		  '@media',
		  '@supports'
		];

		var PAGE_MARGIN_BOXES = [
		  '@bottom-center',
		  '@bottom-left',
		  '@bottom-left-corner',
		  '@bottom-right',
		  '@bottom-right-corner',
		  '@left-bottom',
		  '@left-middle',
		  '@left-top',
		  '@right-bottom',
		  '@right-middle',
		  '@right-top',
		  '@top-center',
		  '@top-left',
		  '@top-left-corner',
		  '@top-right',
		  '@top-right-corner'
		];

		var EXTRA_PAGE_BOXES = [
		  '@footnote',
		  '@footnotes',
		  '@left',
		  '@page-float-bottom',
		  '@page-float-top',
		  '@right'
		];

		var REPEAT_PATTERN = /^\[\s{0,31}\d+\s{0,31}\]$/;
		var RULE_WORD_SEPARATOR_PATTERN = /[\s\(]/;
		var TAIL_BROKEN_VALUE_PATTERN = /[\s|\}]*$/;

		function tokenize(source, externalContext) {
		  var internalContext = {
			level: Level.BLOCK,
			position: {
			  source: externalContext.source || undefined,
			  line: 1,
			  column: 0,
			  index: 0
			}
		  };

		  return intoTokens(source, externalContext, internalContext, false);
		}

		function intoTokens(source, externalContext, internalContext, isNested) {
		  var allTokens = [];
		  var newTokens = allTokens;
		  var lastToken;
		  var ruleToken;
		  var ruleTokens = [];
		  var propertyToken;
		  var metadata;
		  var metadatas = [];
		  var level = internalContext.level;
		  var levels = [];
		  var buffer = [];
		  var buffers = [];
		  var serializedBuffer;
		  var roundBracketLevel = 0;
		  var isQuoted;
		  var isSpace;
		  var isNewLineNix;
		  var isNewLineWin;
		  var isCommentStart;
		  var wasCommentStart = false;
		  var isCommentEnd;
		  var wasCommentEnd = false;
		  var isCommentEndMarker;
		  var isEscaped;
		  var wasEscaped = false;
		  var seekingValue = false;
		  var seekingPropertyBlockClosing = false;
		  var position = internalContext.position;

		  for (; position.index < source.length; position.index++) {
			var character = source[position.index];

			isQuoted = level == Level.SINGLE_QUOTE || level == Level.DOUBLE_QUOTE;
			isSpace = character == Marker.SPACE || character == Marker.TAB;
			isNewLineNix = character == Marker.NEW_LINE_NIX;
			isNewLineWin = character == Marker.NEW_LINE_NIX && source[position.index - 1] == Marker.NEW_LINE_WIN;
			isCommentStart = !wasCommentEnd && level != Level.COMMENT && !isQuoted && character == Marker.ASTERISK && source[position.index - 1] == Marker.FORWARD_SLASH;
			isCommentEndMarker = !wasCommentStart && !isQuoted && character == Marker.FORWARD_SLASH && source[position.index - 1] == Marker.ASTERISK;
			isCommentEnd = level == Level.COMMENT && isCommentEndMarker;
			roundBracketLevel = Math.max(roundBracketLevel, 0);

			metadata = buffer.length === 0 ?
			  [position.line, position.column, position.source] :
			  metadata;

			if (isEscaped) {
			  // previous character was a backslash
			  buffer.push(character);
			} else if (!isCommentEnd && level == Level.COMMENT) {
			  buffer.push(character);
			} else if (isCommentStart && (level == Level.BLOCK || level == Level.RULE) && buffer.length > 1) {
			  // comment start within block preceded by some content, e.g. div/*<--
			  metadatas.push(metadata);
			  buffer.push(character);
			  buffers.push(buffer.slice(0, buffer.length - 2));

			  buffer = buffer.slice(buffer.length - 2);
			  metadata = [position.line, position.column - 1, position.source];

			  levels.push(level);
			  level = Level.COMMENT;
			} else if (isCommentStart) {
			  // comment start, e.g. /*<--
			  levels.push(level);
			  level = Level.COMMENT;
			  buffer.push(character);
			} else if (isCommentEnd) {
			  // comment end, e.g. /* comment */<--
			  serializedBuffer = buffer.join('').trim() + character;
			  lastToken = [Token.COMMENT, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]];
			  newTokens.push(lastToken);

			  level = levels.pop();
			  metadata = metadatas.pop() || null;
			  buffer = buffers.pop() || [];
			} else if (isCommentEndMarker && source[position.index + 1] != Marker.ASTERISK) {
			  externalContext.warnings.push('Unexpected \'*/\' at ' + formatPosition([position.line, position.column, position.source]) + '.');
			  buffer = [];
			} else if (character == Marker.SINGLE_QUOTE && !isQuoted) {
			  // single quotation start, e.g. a[href^='https<--
			  levels.push(level);
			  level = Level.SINGLE_QUOTE;
			  buffer.push(character);
			} else if (character == Marker.SINGLE_QUOTE && level == Level.SINGLE_QUOTE) {
			  // single quotation end, e.g. a[href^='https'<--
			  level = levels.pop();
			  buffer.push(character);
			} else if (character == Marker.DOUBLE_QUOTE && !isQuoted) {
			  // double quotation start, e.g. a[href^="<--
			  levels.push(level);
			  level = Level.DOUBLE_QUOTE;
			  buffer.push(character);
			} else if (character == Marker.DOUBLE_QUOTE && level == Level.DOUBLE_QUOTE) {
			  // double quotation end, e.g. a[href^="https"<--
			  level = levels.pop();
			  buffer.push(character);
			} else if (!isCommentStart && !isCommentEnd && character != Marker.CLOSE_ROUND_BRACKET && character != Marker.OPEN_ROUND_BRACKET && level != Level.COMMENT && !isQuoted && roundBracketLevel > 0) {
			  // character inside any function, e.g. hsla(.<--
			  buffer.push(character);
			} else if (character == Marker.OPEN_ROUND_BRACKET && !isQuoted && level != Level.COMMENT && !seekingValue) {
			  // round open bracket, e.g. @import url(<--
			  buffer.push(character);

			  roundBracketLevel++;
			} else if (character == Marker.CLOSE_ROUND_BRACKET && !isQuoted && level != Level.COMMENT && !seekingValue) {
			  // round open bracket, e.g. @import url(test.css)<--
			  buffer.push(character);

			  roundBracketLevel--;
			} else if (character == Marker.SEMICOLON && level == Level.BLOCK && buffer[0] == Marker.AT) {
			  // semicolon ending rule at block level, e.g. @import '...';<--
			  serializedBuffer = buffer.join('').trim();
			  allTokens.push([Token.AT_RULE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);

			  buffer = [];
			} else if (character == Marker.COMMA && level == Level.BLOCK && ruleToken) {
			  // comma separator at block level, e.g. a,div,<--
			  serializedBuffer = buffer.join('').trim();
			  ruleToken[1].push([tokenScopeFrom(ruleToken[0]), serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext, ruleToken[1].length)]]);

			  buffer = [];
			} else if (character == Marker.COMMA && level == Level.BLOCK && tokenTypeFrom(buffer) == Token.AT_RULE) {
			  // comma separator at block level, e.g. @import url(...) screen,<--
			  // keep iterating as end semicolon will create the token
			  buffer.push(character);
			} else if (character == Marker.COMMA && level == Level.BLOCK) {
			  // comma separator at block level, e.g. a,<--
			  ruleToken = [tokenTypeFrom(buffer), [], []];
			  serializedBuffer = buffer.join('').trim();
			  ruleToken[1].push([tokenScopeFrom(ruleToken[0]), serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext, 0)]]);

			  buffer = [];
			} else if (character == Marker.OPEN_CURLY_BRACKET && level == Level.BLOCK && ruleToken && ruleToken[0] == Token.NESTED_BLOCK) {
			  // open brace opening at-rule at block level, e.g. @media{<--
			  serializedBuffer = buffer.join('').trim();
			  ruleToken[1].push([Token.NESTED_BLOCK_SCOPE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);
			  allTokens.push(ruleToken);

			  levels.push(level);
			  position.column++;
			  position.index++;
			  buffer = [];

			  ruleToken[2] = intoTokens(source, externalContext, internalContext, true);
			  ruleToken = null;
			} else if (character == Marker.OPEN_CURLY_BRACKET && level == Level.BLOCK && tokenTypeFrom(buffer) == Token.NESTED_BLOCK) {
			  // open brace opening at-rule at block level, e.g. @media{<--
			  serializedBuffer = buffer.join('').trim();
			  ruleToken = ruleToken || [Token.NESTED_BLOCK, [], []];
			  ruleToken[1].push([Token.NESTED_BLOCK_SCOPE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);
			  allTokens.push(ruleToken);

			  levels.push(level);
			  position.column++;
			  position.index++;
			  buffer = [];

			  ruleToken[2] = intoTokens(source, externalContext, internalContext, true);
			  ruleToken = null;
			} else if (character == Marker.OPEN_CURLY_BRACKET && level == Level.BLOCK) {
			  // open brace opening rule at block level, e.g. div{<--
			  serializedBuffer = buffer.join('').trim();
			  ruleToken = ruleToken || [tokenTypeFrom(buffer), [], []];
			  ruleToken[1].push([tokenScopeFrom(ruleToken[0]), serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext, ruleToken[1].length)]]);
			  newTokens = ruleToken[2];
			  allTokens.push(ruleToken);

			  levels.push(level);
			  level = Level.RULE;
			  buffer = [];
			} else if (character == Marker.OPEN_CURLY_BRACKET && level == Level.RULE && seekingValue) {
			  // open brace opening rule at rule level, e.g. div{--variable:{<--
			  ruleTokens.push(ruleToken);
			  ruleToken = [Token.PROPERTY_BLOCK, []];
			  propertyToken.push(ruleToken);
			  newTokens = ruleToken[1];

			  levels.push(level);
			  level = Level.RULE;
			  seekingValue = false;
			} else if (character == Marker.OPEN_CURLY_BRACKET && level == Level.RULE && isPageMarginBox(buffer)) {
			  // open brace opening page-margin box at rule level, e.g. @page{@top-center{<--
			  serializedBuffer = buffer.join('').trim();
			  ruleTokens.push(ruleToken);
			  ruleToken = [Token.AT_RULE_BLOCK, [], []];
			  ruleToken[1].push([Token.AT_RULE_BLOCK_SCOPE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);
			  newTokens.push(ruleToken);
			  newTokens = ruleToken[2];

			  levels.push(level);
			  level = Level.RULE;
			  buffer = [];
			} else if (character == Marker.COLON && level == Level.RULE && !seekingValue) {
			  // colon at rule level, e.g. a{color:<--
			  serializedBuffer = buffer.join('').trim();
			  propertyToken = [Token.PROPERTY, [Token.PROPERTY_NAME, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]];
			  newTokens.push(propertyToken);

			  seekingValue = true;
			  buffer = [];
			} else if (character == Marker.SEMICOLON && level == Level.RULE && propertyToken && ruleTokens.length > 0 && buffer.length > 0 && buffer[0] == Marker.AT) {
			  // semicolon at rule level for at-rule, e.g. a{--color:{@apply(--other-color);<--
			  serializedBuffer = buffer.join('').trim();
			  ruleToken[1].push([Token.AT_RULE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);

			  buffer = [];
			} else if (character == Marker.SEMICOLON && level == Level.RULE && propertyToken && buffer.length > 0) {
			  // semicolon at rule level, e.g. a{color:red;<--
			  serializedBuffer = buffer.join('').trim();
			  propertyToken.push([Token.PROPERTY_VALUE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);

			  propertyToken = null;
			  seekingValue = false;
			  buffer = [];
			} else if (character == Marker.SEMICOLON && level == Level.RULE && propertyToken && buffer.length === 0) {
			  // semicolon after bracketed value at rule level, e.g. a{color:rgb(...);<--
			  propertyToken = null;
			  seekingValue = false;
			} else if (character == Marker.SEMICOLON && level == Level.RULE && buffer.length > 0 && buffer[0] == Marker.AT) {
			  // semicolon for at-rule at rule level, e.g. a{@apply(--variable);<--
			  serializedBuffer = buffer.join('');
			  newTokens.push([Token.AT_RULE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);

			  seekingValue = false;
			  buffer = [];
			} else if (character == Marker.SEMICOLON && level == Level.RULE && seekingPropertyBlockClosing) {
			  // close brace after a property block at rule level, e.g. a{--custom:{color:red;};<--
			  seekingPropertyBlockClosing = false;
			  buffer = [];
			} else if (character == Marker.SEMICOLON && level == Level.RULE && buffer.length === 0) {
			  // stray semicolon at rule level, e.g. a{;<--
			  // noop
			} else if (character == Marker.CLOSE_CURLY_BRACKET && level == Level.RULE && propertyToken && seekingValue && buffer.length > 0 && ruleTokens.length > 0) {
			  // close brace at rule level, e.g. a{--color:{color:red}<--
			  serializedBuffer = buffer.join('');
			  propertyToken.push([Token.PROPERTY_VALUE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);
			  propertyToken = null;
			  ruleToken = ruleTokens.pop();
			  newTokens = ruleToken[2];

			  level = levels.pop();
			  seekingValue = false;
			  buffer = [];
			} else if (character == Marker.CLOSE_CURLY_BRACKET && level == Level.RULE && propertyToken && buffer.length > 0 && buffer[0] == Marker.AT && ruleTokens.length > 0) {
			  // close brace at rule level for at-rule, e.g. a{--color:{@apply(--other-color)}<--
			  serializedBuffer = buffer.join('');
			  ruleToken[1].push([Token.AT_RULE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);
			  propertyToken = null;
			  ruleToken = ruleTokens.pop();
			  newTokens = ruleToken[2];

			  level = levels.pop();
			  seekingValue = false;
			  buffer = [];
			} else if (character == Marker.CLOSE_CURLY_BRACKET && level == Level.RULE && propertyToken && ruleTokens.length > 0) {
			  // close brace at rule level after space, e.g. a{--color:{color:red }<--
			  propertyToken = null;
			  ruleToken = ruleTokens.pop();
			  newTokens = ruleToken[2];

			  level = levels.pop();
			  seekingValue = false;
			} else if (character == Marker.CLOSE_CURLY_BRACKET && level == Level.RULE && propertyToken && buffer.length > 0) {
			  // close brace at rule level, e.g. a{color:red}<--
			  serializedBuffer = buffer.join('');
			  propertyToken.push([Token.PROPERTY_VALUE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);
			  propertyToken = null;
			  ruleToken = ruleTokens.pop();
			  newTokens = allTokens;

			  level = levels.pop();
			  seekingValue = false;
			  buffer = [];
			} else if (character == Marker.CLOSE_CURLY_BRACKET && level == Level.RULE && buffer.length > 0 && buffer[0] == Marker.AT) {
			  // close brace after at-rule at rule level, e.g. a{@apply(--variable)}<--
			  propertyToken = null;
			  ruleToken = null;
			  serializedBuffer = buffer.join('').trim();
			  newTokens.push([Token.AT_RULE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);
			  newTokens = allTokens;

			  level = levels.pop();
			  seekingValue = false;
			  buffer = [];
			} else if (character == Marker.CLOSE_CURLY_BRACKET && level == Level.RULE && levels[levels.length - 1] == Level.RULE) {
			  // close brace after a property block at rule level, e.g. a{--custom:{color:red;}<--
			  propertyToken = null;
			  ruleToken = ruleTokens.pop();
			  newTokens = ruleToken[2];

			  level = levels.pop();
			  seekingValue = false;
			  seekingPropertyBlockClosing = true;
			  buffer = [];
			} else if (character == Marker.CLOSE_CURLY_BRACKET && level == Level.RULE) {
			  // close brace after a rule, e.g. a{color:red;}<--
			  propertyToken = null;
			  ruleToken = null;
			  newTokens = allTokens;

			  level = levels.pop();
			  seekingValue = false;
			} else if (character == Marker.CLOSE_CURLY_BRACKET && level == Level.BLOCK && !isNested && position.index <= source.length - 1) {
			  // stray close brace at block level, e.g. a{color:red}color:blue}<--
			  externalContext.warnings.push('Unexpected \'}\' at ' + formatPosition([position.line, position.column, position.source]) + '.');
			  buffer.push(character);
			} else if (character == Marker.CLOSE_CURLY_BRACKET && level == Level.BLOCK) {
			  // close brace at block level, e.g. @media screen {...}<--
			  break;
			} else if (character == Marker.OPEN_ROUND_BRACKET && level == Level.RULE && seekingValue) {
			  // round open bracket, e.g. a{color:hsla(<--
			  buffer.push(character);
			  roundBracketLevel++;
			} else if (character == Marker.CLOSE_ROUND_BRACKET && level == Level.RULE && seekingValue && roundBracketLevel == 1) {
			  // round close bracket, e.g. a{color:hsla(0,0%,0%)<--
			  buffer.push(character);
			  serializedBuffer = buffer.join('').trim();
			  propertyToken.push([Token.PROPERTY_VALUE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);

			  roundBracketLevel--;
			  buffer = [];
			} else if (character == Marker.CLOSE_ROUND_BRACKET && level == Level.RULE && seekingValue) {
			  // round close bracket within other brackets, e.g. a{width:calc((10rem / 2)<--
			  buffer.push(character);
			  roundBracketLevel--;
			} else if (character == Marker.FORWARD_SLASH && source[position.index + 1] != Marker.ASTERISK && level == Level.RULE && seekingValue && buffer.length > 0) {
			  // forward slash within a property, e.g. a{background:url(image.png) 0 0/<--
			  serializedBuffer = buffer.join('').trim();
			  propertyToken.push([Token.PROPERTY_VALUE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);
			  propertyToken.push([Token.PROPERTY_VALUE, character, [[position.line, position.column, position.source]]]);

			  buffer = [];
			} else if (character == Marker.FORWARD_SLASH && source[position.index + 1] != Marker.ASTERISK && level == Level.RULE && seekingValue) {
			  // forward slash within a property after space, e.g. a{background:url(image.png) 0 0 /<--
			  propertyToken.push([Token.PROPERTY_VALUE, character, [[position.line, position.column, position.source]]]);

			  buffer = [];
			} else if (character == Marker.COMMA && level == Level.RULE && seekingValue && buffer.length > 0) {
			  // comma within a property, e.g. a{background:url(image.png),<--
			  serializedBuffer = buffer.join('').trim();
			  propertyToken.push([Token.PROPERTY_VALUE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);
			  propertyToken.push([Token.PROPERTY_VALUE, character, [[position.line, position.column, position.source]]]);

			  buffer = [];
			} else if (character == Marker.COMMA && level == Level.RULE && seekingValue) {
			  // comma within a property after space, e.g. a{background:url(image.png) ,<--
			  propertyToken.push([Token.PROPERTY_VALUE, character, [[position.line, position.column, position.source]]]);

			  buffer = [];
			} else if (character == Marker.CLOSE_SQUARE_BRACKET && propertyToken && propertyToken.length > 1 && buffer.length > 0 && isRepeatToken(buffer)) {
			  buffer.push(character);
			  serializedBuffer = buffer.join('').trim();
			  propertyToken[propertyToken.length - 1][1] += serializedBuffer;

			  buffer = [];
			} else if ((isSpace || (isNewLineNix && !isNewLineWin)) && level == Level.RULE && seekingValue && propertyToken && buffer.length > 0) {
			  // space or *nix newline within property, e.g. a{margin:0 <--
			  serializedBuffer = buffer.join('').trim();
			  propertyToken.push([Token.PROPERTY_VALUE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);

			  buffer = [];
			} else if (isNewLineWin && level == Level.RULE && seekingValue && propertyToken && buffer.length > 1) {
			  // win newline within property, e.g. a{margin:0\r\n<--
			  serializedBuffer = buffer.join('').trim();
			  propertyToken.push([Token.PROPERTY_VALUE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);

			  buffer = [];
			} else if (isNewLineWin && level == Level.RULE && seekingValue) {
			  // win newline
			  buffer = [];
			} else if (buffer.length == 1 && isNewLineWin) {
			  // ignore windows newline which is composed of two characters
			  buffer.pop();
			} else if (buffer.length > 0 || !isSpace && !isNewLineNix && !isNewLineWin) {
			  // any character
			  buffer.push(character);
			}

			wasEscaped = isEscaped;
			isEscaped = !wasEscaped && character == Marker.BACK_SLASH;
			wasCommentStart = isCommentStart;
			wasCommentEnd = isCommentEnd;

			position.line = (isNewLineWin || isNewLineNix) ? position.line + 1 : position.line;
			position.column = (isNewLineWin || isNewLineNix) ? 0 : position.column + 1;
		  }

		  if (seekingValue) {
			externalContext.warnings.push('Missing \'}\' at ' + formatPosition([position.line, position.column, position.source]) + '.');
		  }

		  if (seekingValue && buffer.length > 0) {
			serializedBuffer = buffer.join('').replace(TAIL_BROKEN_VALUE_PATTERN, '');
			propertyToken.push([Token.PROPERTY_VALUE, serializedBuffer, [originalMetadata(metadata, serializedBuffer, externalContext)]]);

			buffer = [];
		  }

		  if (buffer.length > 0) {
			externalContext.warnings.push('Invalid character(s) \'' + buffer.join('') + '\' at ' + formatPosition(metadata) + '. Ignoring.');
		  }

		  return allTokens;
		}

		function originalMetadata(metadata, value, externalContext, selectorFallbacks) {
		  var source = metadata[2];

		  return /*BT- externalContext.inputSourceMapTracker.isTracking(source) ?
			externalContext.inputSourceMapTracker.originalPositionFor(metadata, value.length, selectorFallbacks) :
			*/metadata;
		}

		function tokenTypeFrom(buffer) {
		  var isAtRule = buffer[0] == Marker.AT || buffer[0] == Marker.UNDERSCORE;
		  var ruleWord = buffer.join('').split(RULE_WORD_SEPARATOR_PATTERN)[0];

		  if (isAtRule && BLOCK_RULES.indexOf(ruleWord) > -1) {
			return Token.NESTED_BLOCK;
		  } else if (isAtRule && AT_RULES.indexOf(ruleWord) > -1) {
			return Token.AT_RULE;
		  } else if (isAtRule) {
			return Token.AT_RULE_BLOCK;
		  } else {
			return Token.RULE;
		  }
		}

		function tokenScopeFrom(tokenType) {
		  if (tokenType == Token.RULE) {
			return Token.RULE_SCOPE;
		  } else if (tokenType == Token.NESTED_BLOCK) {
			return Token.NESTED_BLOCK_SCOPE;
		  } else if (tokenType == Token.AT_RULE_BLOCK) {
			return Token.AT_RULE_BLOCK_SCOPE;
		  }
		}

		function isPageMarginBox(buffer) {
		  var serializedBuffer = buffer.join('').trim();

		  return PAGE_MARGIN_BOXES.indexOf(serializedBuffer) > -1 || EXTRA_PAGE_BOXES.indexOf(serializedBuffer) > -1;
		}

		function isRepeatToken(buffer) {
		  return REPEAT_PATTERN.test(buffer.join('') + Marker.CLOSE_SQUARE_BRACKET);
		}

		return tokenize;
	};
	//#endregion

	//#region URL: /utils/clone-array
	modules['/utils/clone-array'] = function () {
		function cloneArray(array) {
		  var cloned = array.slice(0);

		  for (var i = 0, l = cloned.length; i < l; i++) {
			if (Array.isArray(cloned[i]))
			  cloned[i] = cloneArray(cloned[i]);
		  }

		  return cloned;
		}

		return cloneArray;
	};
	//#endregion

	//#region URL: /utils/format-position
	modules['/utils/format-position'] = function () {
		function formatPosition(metadata) {
		  var line = metadata[0];
		  var column = metadata[1];
		  var source = metadata[2];

		  return source ?
			source + ':' + line + ':' + column :
			line + ':' + column;
		}

		return formatPosition;
	};
	//#endregion

	//#region URL: /utils/natural-compare
	modules['/utils/natural-compare'] = function () {
		// adapted from http://nedbatchelder.com/blog/200712.html#e20071211T054956

		var NUMBER_PATTERN = /([0-9]+)/;

		function naturalCompare(value1, value2) {
		  var keys1 = ('' + value1).split(NUMBER_PATTERN).map(tryParseInt);
		  var keys2 = ('' + value2).split(NUMBER_PATTERN).map(tryParseInt);
		  var key1;
		  var key2;
		  var compareFirst = Math.min(keys1.length, keys2.length);
		  var i, l;

		  for (i = 0, l = compareFirst; i < l; i++) {
			key1 = keys1[i];
			key2 = keys2[i];

			if (key1 != key2) {
			  return key1 > key2 ? 1 : -1;
			}
		  }

		  return keys1.length > keys2.length ? 1 : (keys1.length == keys2.length ? 0 : -1);
		}

		function tryParseInt(value) {
		  return ('' + parseInt(value)) == value ?
			parseInt(value) :
			value;
		}

		return naturalCompare;
	};
	//#endregion

	//#region URL: /utils/override
	modules['/utils/override'] = function () {
		function override(source1, source2) {
		  var target = {};
		  var key1;
		  var key2;
		  var item;

		  for (key1 in source1) {
			item = source1[key1];

			if (Array.isArray(item)) {
			  target[key1] = item.slice(0);
			} else if (typeof item == 'object' && item !== null) {
			  target[key1] = override(item, {});
			} else {
			  target[key1] = item;
			}
		  }

		  for (key2 in source2) {
			item = source2[key2];

			if (key2 in target && Array.isArray(item)) {
			  target[key2] = item.slice(0);
			} else if (key2 in target && typeof item == 'object' && item !== null) {
			  target[key2] = override(target[key2], item);
			} else {
			  target[key2] = item;
			}
		  }

		  return target;
		}

		return override;
	};
	//#endregion

	//#region URL: /utils/split
	modules['/utils/split'] = function () {
		var Marker = require('/tokenizer/marker');

		function split(value, separator) {
		  var openLevel = Marker.OPEN_ROUND_BRACKET;
		  var closeLevel = Marker.CLOSE_ROUND_BRACKET;
		  var level = 0;
		  var cursor = 0;
		  var lastStart = 0;
		  var lastValue;
		  var lastCharacter;
		  var len = value.length;
		  var parts = [];

		  if (value.indexOf(separator) == -1) {
			return [value];
		  }

		  if (value.indexOf(openLevel) == -1) {
			return value.split(separator);
		  }

		  while (cursor < len) {
			if (value[cursor] == openLevel) {
			  level++;
			} else if (value[cursor] == closeLevel) {
			  level--;
			}

			if (level === 0 && cursor > 0 && cursor + 1 < len && value[cursor] == separator) {
			  parts.push(value.substring(lastStart, cursor));
			  lastStart = cursor + 1;
			}

			cursor++;
		  }

		  if (lastStart < cursor + 1) {
			lastValue = value.substring(lastStart);
			lastCharacter = lastValue[lastValue.length - 1];
			if (lastCharacter == separator) {
			  lastValue = lastValue.substring(0, lastValue.length - 1);
			}

			parts.push(lastValue);
		  }

		  return parts;
		}

		return split;
	};
	//#endregion

	//#region URL: /writer/helpers
	modules['/writer/helpers'] = function () {
		var lineBreak = require('os').EOL;
		var emptyCharacter = '';

		var Breaks = require('/options/format').Breaks;
		var Spaces = require('/options/format').Spaces;

		var Marker = require('/tokenizer/marker');
		var Token = require('/tokenizer/token');

		function supportsAfterClosingBrace(token) {
		  return token[1][1] == 'background' || token[1][1] == 'transform' || token[1][1] == 'src';
		}

		function afterClosingBrace(token, valueIndex) {
		  return token[valueIndex][1][token[valueIndex][1].length - 1] == Marker.CLOSE_ROUND_BRACKET;
		}

		function afterComma(token, valueIndex) {
		  return token[valueIndex][1] == Marker.COMMA;
		}

		function afterSlash(token, valueIndex) {
		  return token[valueIndex][1] == Marker.FORWARD_SLASH;
		}

		function beforeComma(token, valueIndex) {
		  return token[valueIndex + 1] && token[valueIndex + 1][1] == Marker.COMMA;
		}

		function beforeSlash(token, valueIndex) {
		  return token[valueIndex + 1] && token[valueIndex + 1][1] == Marker.FORWARD_SLASH;
		}

		function inFilter(token) {
		  return token[1][1] == 'filter' || token[1][1] == '-ms-filter';
		}

		function disallowsSpace(context, token, valueIndex) {
		  return !context.spaceAfterClosingBrace && supportsAfterClosingBrace(token) && afterClosingBrace(token, valueIndex) ||
			beforeSlash(token, valueIndex) ||
			afterSlash(token, valueIndex) ||
			beforeComma(token, valueIndex) ||
			afterComma(token, valueIndex);
		}

		function rules(context, tokens) {
		  var store = context.store;

		  for (var i = 0, l = tokens.length; i < l; i++) {
			store(context, tokens[i]);

			if (i < l - 1) {
			  store(context, comma(context));
			}
		  }
		}

		function body(context, tokens) {
		  var lastPropertyAt = lastPropertyIndex(tokens);

		  for (var i = 0, l = tokens.length; i < l; i++) {
			property(context, tokens, i, lastPropertyAt);
		  }
		}

		function lastPropertyIndex(tokens) {
		  var index = tokens.length - 1;

		  for (; index >= 0; index--) {
			if (tokens[index][0] != Token.COMMENT) {
			  break;
			}
		  }

		  return index;
		}

		function property(context, tokens, position, lastPropertyAt) {
		  var store = context.store;
		  var token = tokens[position];
		  var isPropertyBlock = token[2][0] == Token.PROPERTY_BLOCK;
		  var needsSemicolon = position < lastPropertyAt || isPropertyBlock;
		  var isLast = position === lastPropertyAt;

		  switch (token[0]) {
			case Token.AT_RULE:
			  store(context, token);
			  store(context, semicolon(context, Breaks.AfterProperty, false));
			  break;
			case Token.AT_RULE_BLOCK:
			  rules(context, token[1]);
			  store(context, openBrace(context, Breaks.AfterRuleBegins, true));
			  body(context, token[2]);
			  store(context, closeBrace(context, Breaks.AfterRuleEnds, false, isLast));
			  break;
			case Token.COMMENT:
			  store(context, token);
			  break;
			case Token.PROPERTY:
			  store(context, token[1]);
			  store(context, colon(context));
			  value(context, token);
			  store(context, needsSemicolon ? semicolon(context, Breaks.AfterProperty, isLast) : emptyCharacter);
		  }
		}

		function value(context, token) {
		  var store = context.store;
		  var j, m;

		  if (token[2][0] == Token.PROPERTY_BLOCK) {
			store(context, openBrace(context, Breaks.AfterBlockBegins, false));
			body(context, token[2][1]);
			store(context, closeBrace(context, Breaks.AfterBlockEnds, false, true));
		  } else {
			for (j = 2, m = token.length; j < m; j++) {
			  store(context, token[j]);

			  if (j < m - 1 && (inFilter(token) || !disallowsSpace(context, token, j))) {
				store(context, Marker.SPACE);
			  }
			}
		  }
		}

		function allowsBreak(context, where) {
		  return context.format && context.format.breaks[where];
		}

		function allowsSpace(context, where) {
		  return context.format && context.format.spaces[where];
		}

		function openBrace(context, where, needsPrefixSpace) {
		  if (context.format) {
			context.indentBy += context.format.indentBy;
			context.indentWith = context.format.indentWith.repeat(context.indentBy);
			return (needsPrefixSpace && allowsSpace(context, Spaces.BeforeBlockBegins) ? Marker.SPACE : emptyCharacter) +
			  Marker.OPEN_CURLY_BRACKET +
			  (allowsBreak(context, where) ? lineBreak : emptyCharacter) +
			  context.indentWith;
		  } else {
			return Marker.OPEN_CURLY_BRACKET;
		  }
		}

		function closeBrace(context, where, beforeBlockEnd, isLast) {
		  if (context.format) {
			context.indentBy -= context.format.indentBy;
			context.indentWith = context.format.indentWith.repeat(context.indentBy);
			return (allowsBreak(context, Breaks.AfterProperty) || beforeBlockEnd && allowsBreak(context, Breaks.BeforeBlockEnds) ? lineBreak : emptyCharacter) +
			  context.indentWith +
			  Marker.CLOSE_CURLY_BRACKET +
			  (isLast ? emptyCharacter : (allowsBreak(context, where) ? lineBreak : emptyCharacter) + context.indentWith);
		  } else {
			return Marker.CLOSE_CURLY_BRACKET;
		  }
		}

		function colon(context) {
		  return context.format ?
			Marker.COLON + (allowsSpace(context, Spaces.BeforeValue) ? Marker.SPACE : emptyCharacter) :
			Marker.COLON;
		}

		function semicolon(context, where, isLast) {
		  return context.format ?
			Marker.SEMICOLON + (isLast || !allowsBreak(context, where) ? emptyCharacter : lineBreak + context.indentWith) :
			Marker.SEMICOLON;
		}

		function comma(context) {
		  return context.format ?
			Marker.COMMA + (allowsBreak(context, Breaks.BetweenSelectors) ? lineBreak : emptyCharacter) + context.indentWith :
			Marker.COMMA;
		}

		function all(context, tokens) {
		  var store = context.store;
		  var token;
		  var isLast;
		  var i, l;

		  for (i = 0, l = tokens.length; i < l; i++) {
			token = tokens[i];
			isLast = i == l - 1;

			switch (token[0]) {
			  case Token.AT_RULE:
				store(context, token);
				store(context, semicolon(context, Breaks.AfterAtRule, isLast));
				break;
			  case Token.AT_RULE_BLOCK:
				rules(context, token[1]);
				store(context, openBrace(context, Breaks.AfterRuleBegins, true));
				body(context, token[2]);
				store(context, closeBrace(context, Breaks.AfterRuleEnds, false, isLast));
				break;
			  case Token.NESTED_BLOCK:
				rules(context, token[1]);
				store(context, openBrace(context, Breaks.AfterBlockBegins, true));
				all(context, token[2]);
				store(context, closeBrace(context, Breaks.AfterBlockEnds, true, isLast));
				break;
			  case Token.COMMENT:
				store(context, token);
				store(context, allowsBreak(context, Breaks.AfterComment) ? lineBreak : emptyCharacter);
				break;
			  case Token.RULE:
				rules(context, token[1]);
				store(context, openBrace(context, Breaks.AfterRuleBegins, true));
				body(context, token[2]);
				store(context, closeBrace(context, Breaks.AfterRuleEnds, false, isLast));
				break;
			}
		  }
		}

		var exports = {
		  all: all,
		  body: body,
		  property: property,
		  rules: rules,
		  value: value
		};

		return exports;
	};
	//#endregion

	//#region URL: /writer/one-time
	modules['/writer/one-time'] = function () {
		var helpers = require('/writer/helpers');

		function store(serializeContext, token) {
		  serializeContext.output.push(typeof token == 'string' ? token : token[1]);
		}

		function context() {
		  var newContext = {
			output: [],
			store: store
		  };

		  return newContext;
		}

		function all(tokens) {
		  var oneTimeContext = context();
		  helpers.all(oneTimeContext, tokens);
		  return oneTimeContext.output.join('');
		}

		function body(tokens) {
		  var oneTimeContext = context();
		  helpers.body(oneTimeContext, tokens);
		  return oneTimeContext.output.join('');
		}

		function property(tokens, position) {
		  var oneTimeContext = context();
		  helpers.property(oneTimeContext, tokens, position, true);
		  return oneTimeContext.output.join('');
		}

		function rules(tokens) {
		  var oneTimeContext = context();
		  helpers.rules(oneTimeContext, tokens);
		  return oneTimeContext.output.join('');
		}

		function value(tokens) {
		  var oneTimeContext = context();
		  helpers.value(oneTimeContext, tokens);
		  return oneTimeContext.output.join('');
		}

		var exports = {
		  all: all,
		  body: body,
		  property: property,
		  rules: rules,
		  value: value
		};

		return exports;
	};
	//#endregion

	//#region URL: /writer/simple
	modules['/writer/simple'] = function () {
		var all = require('/writer/helpers').all;

		var lineBreak = require('os').EOL;

		function store(serializeContext, token) {
		  var value = typeof token == 'string' ?
			token :
			token[1];
		  var wrap = serializeContext.wrap;

		  wrap(serializeContext, value);
		  track(serializeContext, value);
		  serializeContext.output.push(value);
		}

		function wrap(serializeContext, value) {
		  if (serializeContext.column + value.length > serializeContext.format.wrapAt) {
			track(serializeContext, lineBreak);
			serializeContext.output.push(lineBreak);
		  }
		}

		function track(serializeContext, value) {
		  var parts = value.split('\n');

		  serializeContext.line += parts.length - 1;
		  serializeContext.column = parts.length > 1 ? 0 : (serializeContext.column + parts.pop().length);
		}

		function serializeStyles(tokens, context) {
		  var serializeContext = {
			column: 0,
			format: context.options.format,
			indentBy: 0,
			indentWith: '',
			line: 1,
			output: [],
			spaceAfterClosingBrace: context.options.compatibility.properties.spaceAfterClosingBrace,
			store: store,
			wrap: context.options.format.wrapAt ?
			  wrap :
			  function () { /* noop */  }
		  };

		  all(serializeContext, tokens);

		  return {
			styles: serializeContext.output.join('')
		  };
		}

		return serializeStyles;
	};
	//#endregion

	//#region URL: /clean
	modules['/clean'] = function () {
		var level0Optimize = require('/optimizer/level-0/optimize');
		var level1Optimize = require('/optimizer/level-1/optimize');
		var level2Optimize = require('/optimizer/level-2/optimize');
		var validator = require('/optimizer/validator');

		var compatibilityFrom = require('/options/compatibility');
		/*BT-
		var fetchFrom = require('/options/fetch');
		*/
		var formatFrom = require('/options/format').formatFrom;
		/*BT-
		var inlineFrom = require('/options/inline');
		var inlineRequestFrom = require('/options/inline-request');
		var inlineTimeoutFrom = require('/options/inline-timeout');
		*/
		var OptimizationLevel = require('/options/optimization-level').OptimizationLevel;
		var optimizationLevelFrom = require('/options/optimization-level').optimizationLevelFrom;
		/*BT-
		var rebaseFrom = require('/options/rebase');
		var rebaseToFrom = require('/options/rebase-to');

		var inputSourceMapTracker = require('/reader/input-source-map-tracker');
		*/
		var readSources = require('/reader/read-sources');

		var serializeStyles = require('/writer/simple');
		/*BT-
		var serializeStylesAndSourceMap = require('/writer/source-maps');
		*/

		var CleanCSS = function CleanCSS(options) {
		  options = options || {};

		  this.options = {
			compatibility: compatibilityFrom(options.compatibility),
			/*BT-
			fetch: fetchFrom(options.fetch),
			*/
			format: formatFrom(options.format),
			/*BT-
			inline: inlineFrom(options.inline),
			inlineRequest: inlineRequestFrom(options.inlineRequest),
			inlineTimeout: inlineTimeoutFrom(options.inlineTimeout),
			*/
			level: optimizationLevelFrom(options.level)/*BT-,
			rebase: rebaseFrom(options.rebase),
			rebaseTo: rebaseToFrom(options.rebaseTo),
			returnPromise: !!options.returnPromise,
			sourceMap: !!options.sourceMap,
			sourceMapInlineSources: !!options.sourceMapInlineSources
			*/
		  };
		};

		CleanCSS.prototype.minify = function (input, maybeSourceMap, maybeCallback) {
		  var options = this.options;

		  /*BT-
		  if (options.returnPromise) {
			return new Promise(function (resolve, reject) {
			  minify(input, options, maybeSourceMap, function (errors, output) {
				return errors ?
				  reject(errors) :
				  resolve(output);
			  });
			});
		  } else {
		  */
			return minify(input, options, maybeSourceMap, maybeCallback);
		  /*BT-
		  }
		  */
		};

		function minify(input, options, maybeSourceMap, maybeCallback) {
		  /*BT-
		  var sourceMap = typeof maybeSourceMap != 'function' ?
			maybeSourceMap :
			null;
		  */
		  var callback = typeof maybeCallback == 'function' ?
			maybeCallback :
			/*BT- (typeof maybeSourceMap == 'function' ? maybeSourceMap : */null/*BT- )*/;
		  var context = {
			/*BT-
			stats: {
			  efficiency: 0,
			  minifiedSize: 0,
			  originalSize: 0,
			  startedAt: Date.now(),
			  timeSpent: 0
			},
			*/
			cache: {
			  specificity: {}
			},
			errors: [],
			/*BT-
			inlinedStylesheets: [],
			inputSourceMapTracker: inputSourceMapTracker(),
			*/
			localOnly: !callback,
			options: options,
			source: null,
			sourcesContent: {},
			validator: validator(options.compatibility),
			warnings: []
		  };

		  /*BT-
		  if (sourceMap) {
			context.inputSourceMapTracker.track(undefined, sourceMap);
		  }
		  */

		  return runner(context.localOnly)(function () {
			return readSources(input, context, function (tokens) {
			  var serialize = /*BT- context.options.sourceMap ?
				serializeStylesAndSourceMap :
				*/serializeStyles;

			  var optimizedTokens = optimize(tokens, context);
			  var optimizedStyles = serialize(optimizedTokens, context);
			  var output = withMetadata(optimizedStyles, context);

			  return callback ?
				callback(context.errors.length > 0 ? context.errors : null, output) :
				output;
			});
		  });
		}

		function runner(localOnly) {
		  // to always execute code asynchronously when a callback is given
		  // more at blog.izs.me/post/59142742143/designing-apis-for-asynchrony
		  return localOnly ?
			function (callback) { return callback(); } :
			process.nextTick;
		}

		function optimize(tokens, context) {
		  var optimized;

		  optimized = level0Optimize(tokens, context);
		  optimized = OptimizationLevel.One in context.options.level ?
			level1Optimize(tokens, context) :
			tokens;
		  optimized = OptimizationLevel.Two in context.options.level ?
			level2Optimize(tokens, context, true) :
			optimized;

		  return optimized;
		}

		function withMetadata(output, context) {
		  /*BT-
		  output.stats = calculateStatsFrom(output.styles, context);
		  */
		  output.errors = context.errors;
		  /*BT-
		  output.inlinedStylesheets = context.inlinedStylesheets;
		  */
		  output.warnings = context.warnings;

		  return output;
		}

		/*BT-
		function calculateStatsFrom(styles, context) {
		  var finishedAt = Date.now();
		  var timeSpent = finishedAt - context.stats.startedAt;

		  delete context.stats.startedAt;
		  context.stats.timeSpent = timeSpent;
		  context.stats.efficiency = 1 - styles.length / context.stats.originalSize;
		  context.stats.minifiedSize = styles.length;

		  return context.stats;
		}
		*/

		return CleanCSS;
	};
	//#endregion

	return require('/clean');
})();