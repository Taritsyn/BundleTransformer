/*!
* ECMAScript 5 Polyfill v0.1
* http://nuget.org/packages/ES5
*
* Copyright 2011, Douglas Crockford, Damian Edwards 
*/
// Function.prototype.bind
if (!Function.prototype.hasOwnProperty('bind')) {
	Function.prototype.bind = function (object) {
		var slice = Array.prototype.slice,
			func = this,
			args = slice.call(arguments, 1);
		return function () {
			return func.apply(object,
				args.concat(slice.call(arguments, 0)));
		};
	};
}

// String.prototype.trim
if (!String.prototype.hasOwnProperty('trim')) {
	String.prototype.trim = (function (re) {
		return function () {
			return this.replace(re, "$1");
		};
	} (/^\s*(\S*(\s+\S+)*)\s*$/));
}

// Array.prototype.every
if (!Array.prototype.hasOwnProperty('every')) {
	Array.prototype.every = function (fun, thisp) {
		var arr = this,
			i,
			length = arr.length;
		for (i = 0; i < length; i += 1) {
			if (arr.hasOwnProperty(i) &&
					!fun.call(thisp,
						arr[i], i, arr)) {
				return false;
			}
		}
		return true;
	};
}

// Array.prototype.some
if (!Array.prototype.hasOwnProperty('some')) {
	Array.prototype.some = function (fun, thisp) {
		var arr = this,
			i,
			length = arr.length;
		for (i = 0; i < length; i += 1) {
			if (arr.hasOwnProperty(i) &&
					fun.call(thisp,
						arr[i], i, arr)) {
				return true;
			}
		}
		return false;
	};
}

// Array.prototype.filter
if (!Array.prototype.hasOwnProperty('filter')) {
	Array.prototype.filter = function (fun, thisp) {
		var arr = this,
			i,
			length = arr.length,
			result = [],
			value;
		for (i = 0; i < length; i += 1) {
			if (arr.hasOwnProperty(i)) {
				value = arr[i];
				if (fun.call(thisp, value, i, arr)) {
					result.push(value);
				}
			}
		}
		return result;
	};
}

// Array.prototype.forEach
if (!Array.prototype.hasOwnProperty('forEach')) {
	Array.prototype.forEach = function (fun, thisp) {
		var arr = this,
			i,
			length = arr.length;
		for (i = 0; i < length; i += 1) {
			if (arr.hasOwnProperty(i)) {
				fun.call(thisp, arr[i], i, arr);
			}
		}
	};
}

// Array.prototype.indexOf
if (!Array.prototype.hasOwnProperty('indexOf')) {
	Array.prototype.indexOf = function (searchElement, fromIndex) {
		var arr = this,
			i = fromIndex || 0,
			length = arr.length;
		while (i < length) {
			if (arr.hasOwnProperty(i) &&
					arr[i] === searchElement) {
				return i;
			}
			i += 1;
		}
		return -1;
	};
}

// Array.prototype.lastIndexOf
if (!Array.prototype.hasOwnProperty('lastIndexOf')) {
	Array.prototype.lastIndexOf = function (searchElement, fromIndex) {
		var arr = this,
			i = fromIndex;
		if (typeof i !== 'number') {
			i = arr.length - 1;
		}
		while (i >= 0) {
			if (arr.hasOwnProperty(i) &&
					arr[i] === searchElement) {
				return i;
			}
			i -= 1;
		}
		return -1;
	};
}

// Array.prototype.map
if (!Array.prototype.hasOwnProperty('map')) {
	Array.prototype.map = function (fun, thisp) {
		var arr = this,
			i,
			length = arr.length,
			result = [];
		for (i = 0; i < length; i += 1) {
			if (arr.hasOwnProperty(i)) {
				result[i] = fun.call(thisp, arr[i], i, arr);
			}
		}
		return result;
	};
}

// Array.prototype.reduce
if (!Array.prototype.hasOwnProperty('reduce')) {
	Array.prototype.reduce = function (fun, initialValue) {
		var arr = this,
			i,
			length = arr.length;
		for (i = 0; i < length; i += 1) {
			if (arr.hasOwnProperty(i)) {
				initialValue = fun.call(undefined,
					initialValue, arr[i], i, arr);
			}
		}
		return initialValue;
	};
}

// Array.prototype.reduceRight
if (!Array.prototype.hasOwnProperty('reduceRight')) {
	Array.prototype.reduceRight = function (fun, initialValue) {
		var arr = this,
			i = arr.length - 1;
		while (i >= 0) {
			if (arr.hasOwnProperty(i)) {
				initialValue = fun.call(undefined,
					initialValue, arr[i], i, arr);
			}
			i -= 1;
		}
		return initialValue;
	};
}

// Date.now()
if (!Date.hasOwnProperty('now')) {
	Date.now = function () {
		return (new Date()).getTime();
	};
}

// Date.prototype.toISOString
if (!Date.prototype.hasOwnProperty('toISOString')) {
	Date.prototype.toISOString = function () {
		function f(n) {
			return n < 10 ? '0' + n : n;
		}

		return this.getUTCFullYear() + '-' +
			f(this.getUTCMonth() + 1) + '-' +
			f(this.getUTCDate()) + 'T' +
			f(this.getUTCHours()) + ':' +
			f(this.getUTCMinutes()) + ':' +
			f(this.getUTCSeconds()) + 'Z';
	};
}

// Array.isArray
if (!Array.hasOwnProperty('isArray')) {
	Array.isArray = function (value) {
		return Object.prototype
			.toString.apply(value) === '[object Array]';
	};
}

// Object.keys
if (!Object.hasOwnProperty('keys')) {
	Object.keys = function (object) {
		var name, result = [];
		for (name in object) {
			if (Object.prototype
					.hasOwnProperty
					.call(object, name)) {
				result.push(name);
			}
		}
		return result;
	};
}

// Object.create
if (!Object.hasOwnProperty('create')) {
	Object.create = function (object) {
		function F() { }
		F.prototype = object;
		return new F();
	};
}