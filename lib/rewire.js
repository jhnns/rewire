var Module = require("module"),
    fs = require("fs"),
    moduleWrapperSrc = require("./moduleWrapperSrc.js"),
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

    // Create testModule as it would be created by require()
    targetModule = new Module(targetPath, parentModulePath);

    prelude = moduleWrapperSrc.prelude;
    appendix = moduleWrapperSrc.appendix;

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
