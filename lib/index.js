var rewireModule = require("./rewire.js");

/**
 * Adds a special setter and getter to the module located at filename. After the module has been rewired, you can
 * call myModule.__set__(name, value) and myModule.__get__(name) to manipulate private variables.
 *
 * @param {!String} filename Path to the module that shall be rewired. Use it exactly like require().
 * @param {Object|Function} require_mocks Mock to be returned by require() within the module.
 *        If it is a function, then it will be called with the path of the required module as
 *        argument. The `this` context of the function will be the module. If the function
 *        returns undefined, then the old require function is used, else, then it is taken as
 *        the require function's return value.
 * @return {*} the rewired module
 */
function rewire(filename, requireMocks) {
    return rewireModule(module.parent, filename, requireMocks);
}

module.exports = rewire;

delete require.cache[__filename];   // deleting self from module cache so the parent module is always up to date
