require("../browser/shims.js"); // some shims for older browsers that are necessary for rewire()

var pathUtil = require("path"),
    getImportGlobalsSrc = require("../getImportGlobalsSrc.js");

/**
 * Clones an object deeply. Used to clone the module-object that is
 * stored in the cache. Because browserify doesn't create the module-
 * object newly if the module is executed again we can't modify the
 * exports object directly. Instead of we have to make an independent copy.
 *
 * @param {!Object} obj
 * @return {Object}
 */
function clone(obj) {
    var target = {},
        value,
        key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            value = obj[key];
            if (Array.isArray(value)) {
                target[key] = value.slice(0);
            } else if (typeof value === "object" && value !== null) {
                target[key] = clone(value);
            } else {
                target[key] = value;
            }

        }
    }

    return target;
}

// Saves all setters and getters for every module according to its filename
var registry = {},
// Cache for all rewired modules so it can be reset anytime
    rewiredModules = [];

/**
 * Executes the given module and adds a special setter and getter that allow you to set and get private variables.
 * The parentModulePath is usually set by the requireProxy.
 *
 * @param {!String} parentModulePath __filename of the module, that wants to rewire() another module.
 * @param {!String} path path to the module that shall be rewired
 * @param {Boolean=true} cache indicates whether the rewired module should be cached or not
 * @return {Object}
 */
function browserifyRewire(parentModulePath, path, cache) {
    var originalModule,
        absPath,
        rewiredExports,
        rewiredModule,
        registryEntry;

    // Default cache to true
    if (cache === undefined) {
        cache = true;
    }

    // Normalize path with file extensions
    absPath = pathUtil.resolve(parentModulePath, path);

    // Retrieve original module from cache
    originalModule = require.cache[absPath];

    if (originalModule && cache) {
        // Delete the original module from the cache so the next call to browserifyRequre()
        // executes the module
        delete require.cache[absPath];
    }

    // Require module to trigger rewire.register().
    // Putting (require) in brackets hides it for browserify.
    (require)(absPath);

    // Get registry entry of the target module
    registryEntry = registry[absPath];
    originalModule = registryEntry.module;

    // Make an independent copy of the original module so we can modify the copy
    // without influencing the original module.
    rewiredModule = clone(originalModule);
    rewiredExports = rewiredModule.exports;

    // Apply setter and getters
    rewiredExports.__set__ = registryEntry.setter;
    rewiredExports.__get__ = registryEntry.getter;

    if (cache) {
        require.cache[absPath] = rewiredModule;
    }

    // Store rewired modules for rewire.reset()
    rewiredModules.push(absPath);

    return rewiredExports;
}

/**
 * Registers the setter and getter of every module according to its filename
 *
 * @param {!String} filename the absolute path to the module (module id)
 * @param {!Function} setter
 * @param {!Function} getter
 */
browserifyRewire.register = function (filename, module, setter, getter) {
    registry[filename] = {
        module: module,
        setter: setter,
        getter: getter
    };
};

/**
 * Deletes all rewired modules from the cache
 */
browserifyRewire.reset = function () {
    var cache = require.cache,
        i,
        absPath;

    for (i = 0; i < rewiredModules.length; i++) {
        absPath = rewiredModules[i];
        delete cache[absPath];
    }

    rewiredModules = [];
};

/**
 * Provides a special require-proxy. Every module calls require("rewire").getProxy(require, __filename) at the
 * beginning and overrides its own require with this proxy.
 *
 * This is necessary to call rewire() with the original __filename. Thus you can use rewire() like require().
 *
 * @param {!Function} internalRequire the module's own require
 * @param {String} dirname the __dirname of the module
 * @return {Function} requireProxy
 */
browserifyRewire.getProxy = function (internalRequire, dirname) {
    var rewire = internalRequire("rewire"),
        rewireProxyInit = false;

    function copyProperties(from, to) {
        var key;

        for (key in from) {
            if (from.hasOwnProperty(key)) {
                to[key] = from[key];
            }
        }
    }

    function rewireProxy(path, cache) {
        return rewire(dirname, path, cache);
    }

    function requireProxy(path) {
        if (path === "rewire") {
            if (rewireProxyInit === false) {
                copyProperties(rewire, rewireProxy); // lazy copy
                rewireProxyInit = true;
            }
            return rewireProxy;
        } else {
            return internalRequire(path);
        }
    }

    copyProperties(internalRequire, requireProxy);

    return requireProxy;
};

/**
 * Scans for global vars and returns an evalable string that declares all globals as a var.
 * This way a global variable can be overridden by __set__ without changing the global instance.
 * It is executed each time again to include global variables that have been added later.
 *
 * @return {String}
 */
browserifyRewire.getImportGlobalsSrc = function () {
    return getImportGlobalsSrc(['require','module','exports','__dirname','__filename','process']);
};

module.exports = browserifyRewire;