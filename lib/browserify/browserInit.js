/**
 * This code gets injected at the end of the browserify bundle via b.append().
 */

if (typeof window.browserifyRequire !== "undefined") {
    throw new Error("Naming collision detected: window.browserifyRequire seems to be occupied.");
}

// Saves the browserifyRequire under a new name. Necessary to call the original browserifyRequire within
// a module where the variable name "require" is overridden by the module's internal require.
window.browserifyRequire = require;

/**
 * Provides a special require-proxy. Every module calls window.browserifyRequire.getProxy(require, __filename) at the
 * beginning and overrides its own require with this proxy.
 *
 * This is necessary to call rewire() with the original __filename. Thus you can use rewire() like require().
 *
 * @param {!Function} internalRequire the module's own require
 * @param {String} filename the __filename of the module
 * @return {Function} requireProxy
 */
window.browserifyRequire.getProxy = function (internalRequire, filename) {
    var rewireModule = internalRequire("rewire"),
        key;

    function rewireProxy(path, cache) {
        return rewireModule(filename, path, cache);
    }

    for (key in rewireModule) {
        if (rewireModule.hasOwnProperty(key)) {
            rewireProxy[key] = rewireModule[key];
        }
    }

    return function requireProxy(path) {
        if (path === "rewire") {
            return rewireProxy;
        } else {
            return internalRequire(path);
        }
    };
};