"use strict"; // run code in ES5 strict mode

var setterSrc = require("../../__set__.js").toString(),
    getterSrc = require("../../__get__.js").toString(),
    path = require("path"),
    injectRewire = require("../injectRewire.js"),
    getRewireRegExp = require("../getRewireRegExp.js"),

    rewireLib = path.join("rewire", "lib"),
    webpackBuildin = path.join("webpack", "buildin", "__webpack"),
    settersAndGettersSrc;

/**
 * Injects special code so rewire gains access to the module's private scope.
 *
 * Furthermore it changes all calls of rewire("some/path") to rewire("some/path", require("some/path")) so webpack
 * recognizes the additional dependency. This also enables rewire to resolve the module because webpack replaces all
 * paths to numeric ids.
 *
 * @param {!String} src
 * @return {String} src
 */
function webpackLoader(src) {
    var filename = this.request.split("!").pop(),
        rewireRegExp = getRewireRegExp();

    // We don't want to inject this code at the beginning of a rewire/lib-module. Otherwise
    // it would cause a black hole that devours our universe.
    // We're also omitting webpack's buildin because it doesn't makes sense to rewire these modules. There's also
    // a bug if the special code is injecting into these modules.
    if (filename.indexOf(rewireLib) === -1 && filename.indexOf(webpackBuildin) === -1) {

        // replaces rewire("some/path") into rewire("some/path", require("some/path"))
        src = src.replace(rewireRegExp, '$1rewire("$2", require("$2"))');

        // Inject special code
        src = injectRewire(src, settersAndGettersSrc);
    }

    return src;
}

webpackLoader.loader = __filename;
webpackLoader.test = /\.js$/;

/**
 * This string gets injected at the beginning of every module. Its purpose is to
 * - register the setters and getters according to the module's filename
 *
 * @private
 * @type {String}
 */
settersAndGettersSrc = (
    'var rewire = require("rewire"); ' +

    // Registers the setters and getters of every module according to their filename. The setters and getters must be
    // injected as string here to gain access to the private scope of the module.
    'rewire.register(module, ' + setterSrc + ', ' + getterSrc + '); ' +

    // Cleaning up
    'rewire = undefined;'
).replace(/\s+/g, " ");   // strip out unnecessary spaces to be unobtrusive in the debug view

module.exports = webpackLoader;