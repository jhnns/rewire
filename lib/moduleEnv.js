"use strict";

var Module = require("module"),
    fs = require("fs"),
    babelCore = require("babel-core"),
    // Requiring the babel plugin here because otherwise it will be lazy-loaded by Babel during rewire()
    transformBlockScoping = require("babel-plugin-transform-es2015-block-scoping"),
    coffee;

var moduleWrapper0 = Module.wrapper[0],
    moduleWrapper1 = Module.wrapper[1],
    originalExtensions = {},
    matchCoffeeExt = /\.coffee$/,
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
    var originalJsExtension = require.extensions[".js"];
    var originalCoffeeExtension = require.extensions[".coffee"];

    if (originalJsExtension) {
        originalExtensions.js = originalJsExtension;
    }
    if (originalCoffeeExtension) {
        originalExtensions.coffee = originalCoffeeExtension;
    }
    require.extensions[".js"] = jsExtension;
    require.extensions[".coffee"] = coffeeExtension;
}

function restoreExtensions() {
    if ("js" in originalExtensions) {
        require.extensions[".js"] = originalExtensions.js;
    }
    if ("coffee" in originalExtensions) {
        require.extensions[".coffee"] = originalExtensions.coffee;
    }
}

function jsExtension(module, filename) {
    var _compile = module._compile;

    module._compile = function (content, filename) {
        content = babelCore.transform(content, {
            plugins: [require.resolve("babel-plugin-transform-es2015-block-scoping")],
            retainLines: true,
            filename: filename,
            babelrc: false
        }).code;
        _compile.call(module, content, filename);
    };

    restoreExtensions();
    originalExtensions.js(module, filename);
}

function coffeeExtension(module, filename) {
    var content = stripBOM(fs.readFileSync(filename, "utf8"));

    restoreExtensions();
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
