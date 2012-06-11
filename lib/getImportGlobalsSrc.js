"use strict"; // run code in ES5 strict mode

/**
 * Declares all globals with a var and assigns the global object. Thus you're able to
 * override globals without changing the global object itself.
 *
 * Returns something like
 * "var console = console; var process = process; ..."
 *
 * @return {String}
 */
function getImportGlobalsSrc() {
    var key,
        value,
        src = "";

    for (key in global) {
        if (global.hasOwnProperty(key) && key !== "global") {
            value = global[key];
            src += "var " + key + " = global." + key + "; ";
        }
    }


    return src;
}

module.exports = getImportGlobalsSrc;