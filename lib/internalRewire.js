var Module = require("module"),
    fs = require("fs"),
    __get__ = require("./__get__.js"),
    __set__ = require("./__set__.js"),
    getImportGlobalsSrc = require("./getImportGlobalsSrc.js"),
    detectStrictMode = require("./detectStrictMode.js"),

    moduleWrapper0 = Module.wrapper[0], // caching original wrapper
    moduleWrapper1 = Module.wrapper[1], // caching original wrapper
    rewiredModules = [];    // cache for all rewired modules so it can be reset anytime

function restoreOriginalWrappers() {
    Module.wrapper[0] = moduleWrapper0;
    Module.wrapper[1] = moduleWrapper1;
}

/**
 * Does actual rewiring the module. For further documentation @see index.js
 */
function internalRewire(parentModulePath, targetPath, cache) {
    var testModule,
        nodeRequire,
        prepend,
        append,
        src;

    /**
     * Proxies the first require call in order to draw back all changes.
     * Thus our changes don't influence other modules
     *
     * @param {!String} path
     */
    function requireProxy(path) {
        restoreOriginalWrappers();  // we need to restore the wrappers now so we don't influence other modules
        testModule.require = nodeRequire;   // restoring original nodeRequire
        return nodeRequire.call(testModule, path);  // node's require only works when "this" points to the module
    }

    // Checking params
    if (typeof targetPath !== "string") {
        throw new TypeError("Filename must be a string");
    }

    // Resolve full filename relative to the parent module
    targetPath = Module._resolveFilename(targetPath, parentModulePath);

    // Special support for older node versions that returned an array on Module._resolveFilename
    // @see https://github.com/joyent/node/blob/865b077819a9271a29f982faaef99dc635b57fbc/lib/module.js#L319
    if (Array.isArray(targetPath)) {
        targetPath = targetPath[1];
    }

    // Create testModule as it would be created by require()
    testModule = new Module(targetPath, parentModulePath);

    // Patching requireProxy
    nodeRequire = testModule.require;
    testModule.require = requireProxy;

    // We prepend a list of all globals declared with var so they can be overridden (without changing original globals)
    prepend = getImportGlobalsSrc();

    // We append our special setter and getter.
    append = "module.exports.__set__ = " + __set__.toString() + "; ";
    append += "module.exports.__get__ = " + __get__.toString() + "; ";

    // Check if the module uses the strict mode.
    // If so we must ensure that "use strict"; stays at the beginning of the module.
    src = fs.readFileSync(targetPath, "utf8");
    if (detectStrictMode(src) === true) {
        prepend = ' "use strict"; ' + prepend;
    }

    // Apply prepend and appends
    Module.wrapper[0] = moduleWrapper0 + prepend;
    Module.wrapper[1] = append + moduleWrapper1;

    //console.log(Module.wrapper);

    // Let the show begin
    testModule.load(testModule.id);

    // Store the rewired module in the cache when enabled
    if (cache) {
        rewiredModules.push(targetPath);  // save in private cache for .reset()
        require.cache[targetPath] = testModule;
    }

    // This is only necessary if nothing has been required within the module
    restoreOriginalWrappers();

    return testModule.exports;
}

/**
 * Deletes all rewired modules from the cache
 */
internalRewire.reset = function () {
    var i;

    for (i = 0; i < rewiredModules.length; i++) {
        delete require.cache[rewiredModules[i]];
    }

    rewiredModules = [];
};

module.exports = internalRewire;