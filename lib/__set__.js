/**
 * This function will be stringified and then injected into every rewired module.
 * Then you can set private variables by calling myModule.__set__("myPrivateVar", newValue);
 *
 * All variables within this function are namespaced in the arguments array because every
 * var declaration could possibly clash with a variable in the module scope.
 *
 * @param {!String|!Object} varName name of the variable to set
 * @param {String} varValue new value
 * @throws {TypeError}
 * @return {*}
 */
module.exports = function __set__() {
    arguments.varName = arguments[0];
    arguments.varValue = arguments[1];
    arguments.src = "";
    arguments.checkExistsSrc = function (varName) {
        return "if (typeof " + varName + " === 'undefined') { throw new ReferenceError('Cannot __set__(): " + varName + " is not declared within the module.');} ";
    };

    if (typeof arguments[0] === "object") {
        arguments.env = arguments.varName;
        if (!arguments.env || Array.isArray(arguments.env)) {
            throw new TypeError("__set__ expects an object as env");
        }
        for (arguments.key in arguments.env) {
            if (arguments.env.hasOwnProperty(arguments.key)) {
                arguments.src += arguments.checkExistsSrc(arguments.key) + arguments.key + " = arguments.env." + arguments.key + ";";
            }
        }
    } else if (typeof arguments.varName === "string") {
        if (!arguments.varName) {
            throw new TypeError("__set__ expects a non-empty string as a variable name");
        }
        arguments.src = arguments.checkExistsSrc(arguments.varName) + arguments.varName + " = arguments.varValue;";
    } else {
        throw new TypeError("__set__ expects an environment object or a non-empty string as a variable name");
    }

    eval(arguments.src);
};