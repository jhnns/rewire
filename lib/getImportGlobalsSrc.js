/**
 * Declares all globals with a var and assigns the global object. Thus you're able to
 * override globals without changing the global object itself.
 *
 * Returns something like
 * "var console = global.console; var process = global.process; ..."
 *
 * @return {String}
 */
function getImportGlobalsSrc(ignore) {
    var key,
        value,
        src = "",
        globalObj = typeof global === "undefined"? window: global;

    ignore = ignore || [];
    // global itself can't be overridden because it's the only reference to our real global objects
    ignore.push("global");

    for (key in globalObj) { /* jshint forin: false */
        if (ignore.indexOf(key) !== -1) {
            continue;
        }
        value = globalObj[key];
        src += "var " + key + " = global." + key + "; ";
    }

    return src;
}

module.exports = getImportGlobalsSrc;