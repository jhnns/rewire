/**
 * This function will be stringified and then injected into every rewired module.
 * Then you can leak private variables by calling myModule.__get__("myPrivateVar");
 *
 * All variables within this function are namespaced in the arguments array because every
 * var declaration could possibly clash with a variable in the module scope.
 *
 * @param {!String} name name of the variable to retrieve
 * @throws {TypeError}
 * @return {*}
 */
function __get__() {
    arguments.varName = arguments[0];
    if (typeof arguments.varName !== "string" || arguments.varName.length === 0) {
        throw new TypeError("__get__ expects a non-empty string");
    }

    return eval(arguments.varName);
}

module.exports = __get__;