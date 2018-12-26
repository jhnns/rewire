/**
 * Declares all globals with a var and assigns the global object. Thus you're able to
 * override globals without changing the global object itself.
 *
 * Returns something like
 * "var console = global.console; var process = global.process; ..."
 *
 * @return {String}
 */
function getImportGlobalsSrc(overridable) {
    var key,
        src = "",
        ignore = [],
        globalObj = typeof global === "undefined"? window: global;

    // global itself can't be overridden because it's the only reference to our real global objects
    ignore.push("global");
    // ignore 'module', 'exports' and 'require' on the global scope, because otherwise our code would
    // shadow the module-internal variables
    // @see https://github.com/jhnns/rewire-webpack/pull/6
    ignore.push("module", "exports", "require");

    (overridable || []).forEach(function forEachKey(key) {
        if (ignore.indexOf(key) !== -1) {
            return;
        }

        // key may be an invalid variable name (e.g. 'a-b')
        try {
            // jshint -W061
            eval("var " + key + ";");
            // jshint +W061
            src += "var " + key + " = global." + key + "; ";
        } catch(e) {}
    });

    return src;
}

module.exports = getImportGlobalsSrc;
