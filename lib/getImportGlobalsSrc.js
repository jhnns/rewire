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
        src = "",
        globalObj = typeof global === "undefined"? window: global;

    ignore = ignore || [];
    // global itself can't be overridden because it's the only reference to our real global objects
    ignore.push("global");
    // ignore 'module', 'exports' and 'require' on the global scope, because otherwise our code would
    // shadow the module-internal variables
    // @see https://github.com/jhnns/rewire-webpack/pull/6
    ignore.push("module", "exports", "require");
    // strict mode doesn't allow to (re)define 'undefined', 'eval' & 'arguments'
    ignore.push("undefined", "eval", "arguments");
    // 'GLOBAL' and 'root' are deprecated in Node
    // (assigning them causes a DeprecationWarning)
    ignore.push("GLOBAL", "root");
    // 'NaN' and 'Infinity' are immutable
    // (doesn't throw an error if you set 'var NaN = ...', but doesn't work either)
    ignore.push("NaN", "Infinity");

    const globals = Object.getOwnPropertyNames(globalObj);

    for (key of globals) {
        if (ignore.indexOf(key) !== -1) {
            continue;
        }

        // key may be an invalid variable name (e.g. 'a-b')
        try {
          eval("var " + key + ";");
          src += "var " + key + " = global." + key + "; ";
        } catch(e) {}
    }

    return src;
}

module.exports = getImportGlobalsSrc;
