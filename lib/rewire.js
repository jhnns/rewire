var Module = require("module"),
    fs = require("fs"),
    getImportGlobalsSrc = require("./getImportGlobalsSrc.js"),
    getDefinePropertySrc = require("./getDefinePropertySrc.js"),
    detectStrictMode = require("./detectStrictMode.js"),
    moduleEnv = require("./moduleEnv.js");

/**
 * Does actual rewiring the module. For further documentation @see index.js
 */
function internalRewire(parentModulePath, targetPath) {
    var targetModule,
        prelude,
        appendix,
        src;

    // Checking params
    if (typeof targetPath !== "string") {
        throw new TypeError("Filename must be a string");
    }

    // Resolve full filename relative to the parent module
    targetPath = Module._resolveFilename(targetPath, parentModulePath);

    // Special support for older node versions that returned an array on Module._resolveFilename
    // @see https://github.com/joyent/node/blob/865b077819a9271a29f982faaef99dc635b57fbc/lib/module.js#L319
    // TODO Remove this switch on the next major release
    /* istanbul ignore next because it will be removed soon */
    if (Array.isArray(targetPath)) {
        targetPath = targetPath[1];
    }

    // Create testModule as it would be created by require()
    targetModule = new Module(targetPath, parentModulePath);

    // We prepend a list of all globals declared with var so they can be overridden (without changing original globals)
    prelude = getImportGlobalsSrc();

    // The module src is wrapped inside a self-executing function.
    // This is necessary to separate the module src from the preceding importGlobalsSrc,
    // because the module src can be in strict mode.
    // In strict mode eval() can only declare vars in the current scope. In this case our setters
    // and getters won't work.
    // @see http://whereswalden.com/2011/01/10/new-es5-strict-mode-support-new-vars-created-by-strict-mode-eval-code-are-local-to-that-code-only/
    // It also circumvents a problem with identical global variables and function declarations
    // @see https://github.com/jhnns/rewire/issues/56
    prelude += "(function () { ";

    // We append our special setter and getter.
    appendix = "\n" + getDefinePropertySrc();
    // End of self-executing function
    appendix += "})();";

    // Check if the module uses the strict mode.
    // If so we must ensure that "use strict"; stays at the beginning of the module.
    src = fs.readFileSync(targetPath, "utf8");
    if (detectStrictMode(src) === true) {
        prelude = ' "use strict"; ' + prelude;
    }

    moduleEnv.inject(prelude, appendix);
    moduleEnv.load(targetModule);

    return targetModule.exports;
}

module.exports = internalRewire;
