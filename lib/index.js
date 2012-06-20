var rewireModule;

/**
 * This function is needed to determine the calling parent module.
 * Thus rewire acts exactly the same like require() in the test module.
 *
 * @param {!String} request Path to the module that shall be rewired. Use it exactly like require().
 * @param {Boolean} cache Indicates whether the rewired module should be cached by node so subsequent calls of require() will return the rewired module. Subsequent calls of rewire() will always overwrite the cache.
 * @return {*} the rewired module
 */
function rewire(request, cache) {
    delete require.cache[__filename];   // deleting self from module cache so the parent module is always up to date

    if (cache === undefined) {
        cache = true;
    }

    return rewireModule(module.parent, request, cache);
}

// Conditional require for different environments
if (process.title === "browser") {
    module.exports = require("./browserify/browserifyRewire.js");
} else {
    // Putting (require) within brackets is a hack to disable browserify require sniffing
    // @see https://github.com/substack/node-browserify/issues/132#issuecomment-5281470
    rewireModule = (require)("./rewire.js");

    rewire.reset = rewireModule.reset;
    rewire.browserify = (require)("./browserify/browserifyMiddleware.js");

    module.exports = rewire;
}
