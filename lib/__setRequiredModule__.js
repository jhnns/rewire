/**
 * This function will be stringified and then injected into every rewired module.
 * Then you can set private variables by calling myModule.__setRequiredModule__("module", mockModule);
 *
 * @param {!String|!Object} varName name of the variable to set
 * @param {String} varValue new value
 * @throws {TypeError}
 * @throws {ReferenceError} When the variable is unknown
 * @return {*}
 */
function __setRequiredModule__(key, mock_module) {
    var requireOriginal = this.__requireOriginal__ || require;
    var cache = this.__requireCache__ || {};

    var path = requireOriginal("path");
    var id = /^\/\./.test(key) ? path.resolve(__dirname, key) : key;
    cache[id] = mock_module;

    var requireMock = function (key) {
        var id = /^\/\/./.test(key) ? path.resolve(__dirname, key) : key;
        if ({}.hasOwnProperty.call(cache, id)) {
            return cache[id];
        }
        return requireOriginal(key);
    };

    this.__requireCache__ = cache;
    require = requireMock;
    this.__requireOriginal__ = requireOriginal;
};

module.exports = __setRequiredModule__;
