var rewireModule;

/**
 * Adds a special setter and getter to the module located at filename. After the module has been rewired, you can
 * call myModule.__set__(name, value) and myModule.__get__(name) to manipulate private variables.
 *
 * @param {!String} filename Path to the module that shall be rewired. Use it exactly like require().
 * @param {Boolean} cache Indicates whether the rewired module should be cached by node so subsequent calls of require() will return the rewired module. Subsequent calls of rewire() will always overwrite the cache.
 * @return {*} the rewired module
 */
function rewire(filename, cache) {
    if (cache === undefined) {
        cache = true;
    }

    return rewireModule(module.parent, filename, cache);
}

// Conditional require for different environments
if (process.title === "browser") {
    module.exports = require("./browserify/browserifyRewire.js");
} else {
    delete require.cache[__filename];   // deleting self from module cache so the parent module is always up to date

    // Putting (require) within brackets is a hack to disable browserify's require sniffing
    // @see https://github.com/substack/node-browserify/issues/132#issuecomment-5281470
    rewireModule = (require)("./internalRewire.js");

    rewire.reset = rewireModule.reset;
    rewire.browserify = (require)("./browserify/browserifyMiddleware.js");

    module.exports = rewire;
}
