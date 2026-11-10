(function (undefined) {
	//#region Array methods

	/*!
	 * Array.prototype.flat
	 */
	function flatten(depth) {
		var arr = this,
			depthNum = !isNaN(depth) ? Number(depth) : 1,
			result
			;

		if (depthNum) {
			result = Array.prototype.reduce.call(arr, function (accumulator, currentValue) {
				if (Array.isArray(currentValue)) {
					accumulator.push.apply(accumulator, flatten.call(currentValue, depthNum - 1));
				} else {
					accumulator.push(currentValue);
				}

				return accumulator;
			}, []);
		}
		else {
			result = Array.prototype.slice.call(arr);
		}

		return result;
	}

	if (!Array.prototype.hasOwnProperty('flat')) {
		Array.prototype.flat = flatten;
	}

	//#endregion

	//#region Object methods

	/*!
	 * Object.assign polyfill
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	 */
	if (!Object.hasOwnProperty('assign')) {
		Object.assign = function (target) {
			var result,
				argIndex,
				argCount,
				nextSource,
				propName,
				methodName = 'Object.assign'
				;

			if (typeof target === 'undefined' || target === null) {
				throw new TypeError(methodName + ': argument is not an Object.');
			}

			result = Object(target);
			argCount = arguments.length;

			for (argIndex = 1; argIndex < argCount; argIndex++) {
				nextSource = arguments[argIndex];

				if (typeof nextSource !== 'undefined' && nextSource !== null) {
					for (propName in nextSource) {
						if (Object.prototype.hasOwnProperty.call(nextSource, propName)) {
							result[propName] = nextSource[propName];
						}
					}
				}
			}

			return result;
		};
	}

	//#endregion
}());