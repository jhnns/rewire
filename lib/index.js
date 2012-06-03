"use strict"; // run code in ES5 strict mode

var rewireModule = require("./rewire.js");

/**
 * This function is needed to determine the calling parent module.
 * Thus rewire acts exactly the same like require() in the test module.
 *
 * @param {!String} request Path to the module that shall be rewired. Use it exactly like require().
 * @param {Object} mocks  An object with mocks. Keys should be the exactly same like they're required in the target module. So if you write require("../../myModules/myModuleA.js") you need to pass {"../../myModules/myModuleA.js": myModuleAMock}.
 * @param {Object} injections If you pass an object, all keys of the object will be vars within the module. You can also eval a string. Please note: All scripts are injected at the end of the module. So if there is any code in your module that is executed during require(), your injected variables will be undefined at this point. For example: passing {console: {...}} will cause all calls of console.log() to throw an exception if they're executed during require().
 * @param {Array} leaks An array with variable names that should be exported. These variables are accessible via myModule.__
 * @param {Boolean} cache Indicates whether the rewired module should be cached by node so subsequent calls of require() will return the rewired module. Subsequent calls of rewire() will always overwrite the cache.
 * @return {*} the rewired module
 */
function rewire(request, mocks, injections, leaks, cache) {
    delete require.cache[__filename];   // deleting self from module cache so the parent module is always up to date

    if (cache === undefined) {
        cache = true;
    }

    return rewireModule(module.parent, request, mocks, injections, leaks, cache);
}

module.exports = rewire;