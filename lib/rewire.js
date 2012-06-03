"use strict"; // run code in ES5 strict mode

var Module = require("module"),
    nodeWrapper0 = Module.wrapper[0], // caching original wrapper
    nodeWrapper1 = Module.wrapper[1],
    getLeakingSrc = require("./getLeakingSrc.js"),
    getInjectionSrc = require("./getInjectionSrc.js");

function restoreOriginalWrappers() {
    Module.wrapper[1] = nodeWrapper1;
}

/**
 * Does actual rewiring the module. For further documentation @see index.js
 */
module.exports = function doRewire(parentModule, filename, mocks, injections, leaks, cache) {
    var testModule,
        nodeRequire,
        wrapperExtensions = "";

    function requireMock(path) {
        restoreOriginalWrappers();  // we need to restore the wrappers now so we don't influence other modules

        if (mocks && mocks.hasOwnProperty(path)) {
            return mocks[path];
        } else {
            return nodeRequire.call(testModule, path);  // node's require only works when "this" points to the module
        }
    }

    // Checking params
    if (typeof filename !== "string") {
        throw new TypeError("Filename must be a string");
    }

    // Init vars
    filename = Module._resolveFilename(filename, parentModule);  // resolve full filename relative to the parent module
    testModule = new Module(filename, parentModule);
    nodeRequire = testModule.require;   // caching original node require

    // Prepare module for injection
    if (typeof injections === "object") {
        wrapperExtensions += getInjectionSrc(injections);
    } else if (typeof injections === "string") {
        wrapperExtensions += injections;
    }

    // Prepare module for leaking private vars
    if (Array.isArray(leaks)) {
        wrapperExtensions += getLeakingSrc(leaks);
    }
    Module.wrapper[1] = wrapperExtensions + nodeWrapper1;

    // Mocking module.require-function
    testModule.require = requireMock;
    // Loading module
    testModule.load(testModule.id);

    if (cache) {
        require.cache[filename] = testModule;
    }

    restoreOriginalWrappers();  // this is only necessary if nothing has been required within the module

    return testModule.exports;
};