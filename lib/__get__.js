"use strict"; // run code in ES5 strict mode

/**
 * This function will be stringified and then injected into every rewired module.
 * Then you can leak private variables by calling myModule.__get__("myPrivateVar");
 *
 * @param {!String} name name of the variable to retrieve
 * @throws {TypeError}
 * @return {*}
 */
module.exports = function __get__(name) {
    if (typeof name !== "string" || name.length === 0) {
        throw new TypeError("__get__ expects a non-empty string");
    }

    return eval(name);
};