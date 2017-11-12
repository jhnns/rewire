var rewireModule = require("./rewire.js");

/**
 * Adds a special setter and getter to the module located at filename. After the module has been rewired, you can
 * call myModule.__set__(name, value) and myModule.__get__(name) to manipulate private variables.
 *
 * @param {!String} filename Path to the module that shall be rewired. Use it exactly like require().
 * @param {Object} options Options.
 * @return {*} the rewired module
 */
function rewire(filename, options) {
    return rewireModule(module.parent, filename, options);
}

module.exports = rewire;

delete require.cache[__filename];   // deleting self from module cache so the parent module is always up to date
