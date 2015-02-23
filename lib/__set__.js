/**
 * This function will be stringified and then injected into every rewired module.
 * Then you can set private variables by calling myModule.__set__("myPrivateVar", newValue);
 *
 * All variables within this function are namespaced in the arguments array because every
 * var declaration could possibly clash with a variable in the module scope.
 *
 * @param {String|Object} varName name of the variable to set
 * @param {String} varValue new value
 * @return {Function}
 */
function __set__() {
    arguments.varName = arguments[0];
    arguments.varValue = arguments[1];
    // Saving references to global objects and functions. Thus a test may even change these variables
    // without interfering with rewire().
    // @see https://github.com/jhnns/rewire/issues/40
    arguments.refs = arguments[2] || {
        isArray: Array.isArray,
        TypeError: TypeError,
        stringify: JSON.stringify
        // We can't save eval() because eval() is a *special* global function
        // That's why it can't be re-assigned in strict mode
        //eval: eval
    };
    arguments.src = "";
    arguments.revertArgs = [];

    if (typeof arguments[0] === "object") {
        arguments.env = arguments.varName;
        if (!arguments.env || arguments.refs.isArray(arguments.env)) {
            throw new arguments.refs.TypeError("__set__ expects an object as env");
        }
        arguments.revertArgs[0] = {};
        for (arguments.varName in arguments.env) {
            if (arguments.env.hasOwnProperty(arguments.varName)) {
                arguments.varValue = arguments.env[arguments.varName];
                arguments.src += arguments.varName + " = arguments.env[" + arguments.refs.stringify(arguments.varName) + "]; ";
                try {
                    // Allow tests to mock implicit globals
                    // @see https://github.com/jhnns/rewire/issues/35
                    arguments.revertArgs[0][arguments.varName] = eval(arguments.varName);
                } catch (err) {
                    arguments.revertArgs[0][arguments.varName] = undefined;
                }
            }
        }
    } else if (typeof arguments.varName === "string") {
        if (!arguments.varName) {
            throw new arguments.refs.TypeError("__set__ expects a non-empty string as a variable name");
        }
        arguments.src = arguments.varName + " = arguments.varValue;";
        try {
            // Allow tests to mock implicit globals
            // @see https://github.com/jhnns/rewire/issues/35
            arguments.revertArgs = [arguments.varName, eval(arguments.varName)];
        } catch (err) {
            arguments.revertArgs = [arguments.varName, undefined];
        }
    } else {
        throw new arguments.refs.TypeError("__set__ expects an environment object or a non-empty string as a variable name");
    }

    // Passing our saved references on to the revert function
    arguments.revertArgs[2] = arguments.refs;

    eval(arguments.src);

    return function (revertArgs) {
        __set__.apply(null, revertArgs);
    }.bind(null, arguments.revertArgs);
}

module.exports = __set__;
