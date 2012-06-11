"use strict"; // run code in ES5 strict mode

/**
 * This function will be stringified and then injected into every rewired module.
 * Then you can set private variables by calling myModule.__set__("myPrivateVar", newValue);
 *
 * @param {!String|!Object} varName name of the variable to set
 * @param {String} varValue new value
 * @throws {TypeError}
 * @return {*}
 */
module.exports = function __set__(varName, varValue) {
    var key,
        env,
        src = "";

    function checkExistsSrc(varName) {
        return "if (typeof " + varName + " === 'undefined') { throw new ReferenceError('" + varName + " is not defined');} ";
    }

    if (typeof varName === "object") {
        env = varName;
        if (!env || Array.isArray(env)) {
            throw new TypeError("__set__ expects an object as env");
        }
        for (key in env) {
            if (env.hasOwnProperty(key)) {
                src += checkExistsSrc(key) + key + " = env." + key + ";";
            }
        }
    } else if (typeof varName === "string") {
        if (!varName) {
            throw new TypeError("__set__ expects a non-empty string as a variable name");
        }
        src = checkExistsSrc(varName) + varName + " = varValue;"
    } else {
        throw new TypeError("__set__ expects an environment object or a non-empty string as a variable name");
    }

    eval(src);
};