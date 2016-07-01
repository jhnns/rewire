"use strict";

var Module = require("module"),
    fs = require("fs"),
    coffee;

    // caching original wrapper
var moduleWrapper0 = Module.wrapper[0],
    moduleWrapper1 = Module.wrapper[1],
    originalExtensions = {},
    nodeRequire,
    currentModule;

function load(targetModule) {
    nodeRequire = targetModule.require;
    targetModule.require = requireProxy;
    currentModule = targetModule;

    registerExtensions();
    targetModule.load(targetModule.id);

    // This is only necessary if nothing has been required within the module
    reset();
}

function reset() {
    Module.wrapper[0] = moduleWrapper0;
    Module.wrapper[1] = moduleWrapper1;
    restoreExtensions();
}

function inject(prelude, appendix) {
    Module.wrapper[0] = moduleWrapper0 + prelude;
    Module.wrapper[1] = appendix + moduleWrapper1;
}

/**
 * Proxies the first require call in order to draw back all changes to the Module.wrapper.
 * Thus our changes don't influence other modules
 *
 * @param {!String} path
 */
function requireProxy(path) {
    reset();
    currentModule.require = nodeRequire;
    return nodeRequire.call(currentModule, path);  // node's require only works when "this" points to the module
}

function registerExtensions() {
    var originalCoffeeExtension = require.extensions[".coffee"];

    if (originalCoffeeExtension) {
        originalExtensions.coffee = originalCoffeeExtension;
    }
    require.extensions[".coffee"] = coffeeExtension;
}

function restoreExtensions() {
    if ("coffee" in originalExtensions) {
        require.extensions[".coffee"] = originalExtensions.coffee;
    }
}

function coffeeExtension(module, filename) {
    var content = stripBOM(fs.readFileSync(filename, "utf8"));

    content = coffee.compile(content, {
        filename: filename,
        bare: true
    });
    module._compile(content, filename);
}

/**
 * @see https://github.com/joyent/node/blob/master/lib/module.js
 */
function stripBOM(content) {
    // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
    // because the buffer-to-string conversion in `fs.readFileSync()`
    // translates it to FEFF, the UTF-16 BOM.
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    return content;
}

try {
    coffee = require("coffee-script");
} catch (err) {
    // We are not able to provide coffee-script support, but that's ok as long as the user doesn't want it.
}

exports.load = load;
exports.inject = inject;
