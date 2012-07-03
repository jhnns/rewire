var setterSrc = require("../__set__.js").toString(),
    getterSrc = require("../__get__.js").toString(),
    fs = require("fs"),
    path = require("path"),
    getImportGlobalsSrc = require("../getImportGlobalsSrc.js"),
    getRewireRequires = require("./getRewireRequires.js"),
    detectStrictMode = require("../detectStrictMode.js"),

    injectionSrc = getInjectionSrc().replace(/\s+/g, " ");   // strip out unnecessary spaces to be unobtrusive in the debug view

/**
 * Returns a string that gets injected at the beginning of every module. Its purpose is to
 *
 * - register the setters and getters according to the module's filename
 * - override the internal require with a require proxy.
 *
 * @return {String}
 */
function getInjectionSrc() {
    return 'var rewire = require("rewire"); ' +
        // Registers the setters and getters of every module according to their filename. The setters and getters must be
        // injected as string here to gain access to the private scope of the module.
        'rewire.register(__filename, module, ' + setterSrc + ', ' + getterSrc + ');' +
        // Overrides the module internal require with a require proxy. This proxy is necessary to call rewire with the
        // module's filename at the first parameter to resolve the path. This way rewire() works exactly like require().
        'require = rewire.getProxy(require, __dirname);' +
        // Cleaning up
        'rewire = undefined;';
}

function browserifyMiddleware(b) {

    /**
     * Gets called for every module. Injects special code so rewire is able to access private variables.
     *
     * @param {String} src
     * @param {String} filename
     * @return {String}
     */
    function injectRewire(src, filename) {
        var rewireRequires;

        // Search for all rewire() statements an return the required path.
        rewireRequires = getRewireRequires(src);

        // Add all modules that are loaded by rewire() manually to browserify because browserify's
        // require-sniffing doesn't work here.
        rewireRequires.forEach(function forEachRewireRequire(requirePath) {
            // Resolve absolute paths
            if (requirePath.charAt(0) === ".") {
                requirePath = path.resolve(path.dirname(filename), requirePath);
            }
            b.require(requirePath);
        });

        // Convert back slashes to normal slashes on windows.
        if (process.platform.indexOf("win") === 0) {
            filename = filename.replace(/\\/g, "/");
        }

        // We don't want to inject this code at the beginning of a rewire/lib-module. Otherwise
        // it would cause a black hole that devours our universe.
        if (filename.indexOf("/rewire/lib") === -1) {
            src =
                // Trying to hide the injected line in the debug view with extra whitespaces.
                '                                                                                                                                                ' +
                '/* this line was injected by rewire() */ ' +   // Comment for the curious developer

                // Now all global variables are declared with a var statement so they can be changed via __set__()
                // without influencing global objects.
                'var global = window; ' +   // window is our new global object
                'eval(require("rewire").getImportGlobalsSrc()); ' +

                // The module src is wrapped inside a self-executing function.
                // This is necessary to separate the module src from the preceding eval(importGlobalsSrc),
                // because the module src can be in strict mode.
                // In strict mode eval() can only declare vars in the current scope. In this case our setters
                // and getters won't work.
                // @see https://developer.mozilla.org/en/JavaScript/Strict_mode#Making_eval_and_arguments_simpler
                "(function () {" +

                // If the module uses strict mode we must ensure that "use strict" stays at the beginning of the function.
                (detectStrictMode(src)? ' "use strict"; ': ' ') +

                injectionSrc + "\n" +
                src +

                "})();";
        }

        return src;
    }

    // Register file handler
    b.register(".js", injectRewire);

    return b;
}

module.exports = browserifyMiddleware;