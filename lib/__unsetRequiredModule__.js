/**
 * This function will be stringified and then injected into every rewired module.
 * Then you can set private variables by calling myModule.__unsetRequiredModule__("module", mockModule);
 *
 * @param {!String|!Object} varName name of the variable to set
 * @param {String} varValue new value
 * @throws {TypeError}
 * @throws {ReferenceError} When the variable is unknown
 * @return {*}
 */
function __unsetRequiredModule__(key) {
    var cache = this.__requireCache__;
    if (cache) {
        var path = require('path');
        var id = /^\/\./.test(key) ? path.resolve(__dirname, key) : key;
        delete cache[id];
    }
};

module.exports = __unsetRequiredModule__;
