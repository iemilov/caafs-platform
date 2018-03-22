'use strict';

function ConnectionStatus(event) {
    if (event.status == 'Disconnected') {
        return true
    }
}

const operators = {
    '>': function (a, b) { return a > b },
    '<': function (a, b) { return a < b },
    '==': function (a, b) { return a < b },
}

// monitor events otside a specific range
function range (from,to,event) {
	if (event !== null){
		if (event < from || event > to) {
			return true
		}
	}	
}

//telemetry condition
function storeDelta (currentValue, lastValue, deltaValue){
	let delta = currentValue-lastValue
	let deviation = deltaValue/100 * lastValue
	if ( delta > deviation){
		return true
	}
	else if (-delta > deviation){
		return true
	}
}

//helper function to set all key in a object to lowercase
// function ToLowerCase(object) {
// 	let newO, origKey, newKey, value
// 	if (object instanceof Array) {
// 		return object.map(function (value) {
// 			if (typeof value === "object") {
// 				value = ToLowerCase(value)	
// 			}
// 			return value
// 		})
// 	} else {
// 		newO = {}
// 		for (origKey in object) {
// 			if (object.hasOwnProperty(origKey)) {
// 				newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString()
// 				value = object[origKey]
// 				if (value instanceof Array || (value !== null && value.constructor === Object)) {
// 					value = ToLowerCase(value)
// 				}
// 				newO[newKey] = value
// 			}
// 		}
// 	}
// 	return newO
// }

function ToLowerCase(obj) {
    if (!typeof(obj) === "object" || typeof(obj) === "string" || typeof(obj) === "number" || typeof(obj) === "boolean") {
        return obj;
	}
	if(obj instanceof Array) {
		for (var i in obj) {
			obj[i] = ToLowerCase(obj[i]);
		}
	}
    var keys = Object.keys(obj);
    var n = keys.length
    var lowKey;
    while (n--) {
        var key = keys[n];
        if (key === (lowKey = key.toLowerCase()))
            continue;
        obj[lowKey] = ToLowerCase(obj[key]);
        delete obj[key];
    }
    return (obj);
}


function lookup(obj, k) {
	let key = ''
	let value = ''
	for (key in obj) {

		value = obj[key]
		if (k == key) return [k, value]
		//if (k == key) return {k, value}
		if (type(value) == "Object") {
			let y = lookup(value, k)
			if (y && y[0] == k) return y
		}
		if (type(value) == "Array") {
			for (let i = 0; i < value.length; ++i) {
				let x = lookup(value[i], k)
				if (x && x[0] == k) return x
			}
		}
	}
	return null
}

function type(object) {
	let stringConstructor = "test".constructor
	let arrayConstructor = [].constructor
	let objectConstructor = {}.constructor

	if (object === null) {
		return "null"
	} else if (object === undefined) {
		return "undefined"
	} else if (object.constructor === stringConstructor) {
		return "String"
	} else if (object.constructor === arrayConstructor) {
		return "Array"
	} else if (object.constructor === objectConstructor) {
		return "Object"
	} else {
		return "null"
	}
}

module.exports = {
    range,
    operators,
    ConnectionStatus,
	lookup,
	ToLowerCase,
	storeDelta
}