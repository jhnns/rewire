"use strict"; // run code in ES5 strict mode

var setterSrc = require("../../__set__.js").toString(),
    getterSrc = require("../../__get__.js").toString(),
    injectRewire = require("../injectRewire.js"),
    getRewireRegExp = require("../getRewireRegExp.js"),

    settersAndGettersSrc;

function webpackLoader(src) {
    var filename = this.request.split("!").pop(),
        rewireRegExp = getRewireRegExp();

    if (filename.indexOf("/webpack/buildin/__webpack") === -1) {
        src = src.replace(rewireRegExp, '$1rewire("$2", require("$2"))'); // replaces rewire("some/path") into rewire("some/path", require("some/path"))
        src = injectRewire(src, filename, settersAndGettersSrc);
    }


    return src;
}

webpackLoader.loader = __filename;
webpackLoader.test = /\.js$/;

/**
 * This string gets injected at the beginning of every module. Its purpose is to
 * - register the setters and getters according to the module's filename
 * - override the internal require with a require proxy.
 *
 * @private
 * @type {String}
 */
settersAndGettersSrc = (
    'var rewire = require("rewire"); ' +
    // Registers the setters and getters of every module according to their filename. The setters and getters must be
    // injected as string here to gain access to the private scope of the module.
    'rewire.register(module, ' + setterSrc + ', ' + getterSrc + ');' +
    // Cleaning up
    'rewire = undefined;'
).replace(/\s+/g, " ");   // strip out unnecessary spaces to be unobtrusive in the debug view

module.exports = webpackLoader;