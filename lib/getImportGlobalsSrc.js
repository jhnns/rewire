/**
 * Declares all globals with a var and assigns the global object. Thus you're able to
 * override globals without changing the global object itself.
 *
 * Returns something like
 * "var console = console; var process = process; ..."
 *
 * @return {String}
 */
function getImportGlobalsSrc(ignore) {
    var key,
        value,
        src = "",
        globalObj = typeof global === "undefined"? window: global;

    ignore = ignore || [];

    for (key in globalObj) {
        if (globalObj.hasOwnProperty === undefined || globalObj.hasOwnProperty(key)) {  // in IE8 window.hasOwnProperty is undefined
            if (key !== "global" && ignore.indexOf(key) === -1) {
                value = globalObj[key];
                src += "var " + key + " = global." + key + "; ";
            }
        }
    }


    return src;
}

module.exports = getImportGlobalsSrc;