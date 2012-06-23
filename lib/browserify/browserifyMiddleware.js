var setterSrc = require("../__set__.js").toString(),
    getterSrc = require("../__get__.js").toString(),
    fs = require("fs"),
    path = require("path"),
    getImportGlobalsSrc = require("../getImportGlobalsSrc.js"),
    getRewireRequires = require("./getRewireRequires.js"),
    detectStrictMode = require("../detectStrictMode.js"),

    browserInit = fs.readFileSync(__dirname + "/browserInit.js", "utf8"),
    importGlobalsSrc = getImportGlobalsSrc(),
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
    // Registers the setters and getters of every module according to their filename. The setters and getters must be
    // injected as string here to gain access to the private scope of the module.
    return  'require("rewire").register(__filename, ' + setterSrc + ', ' + getterSrc + ');' +
    // Overrides the module internal require with a require proxy. This proxy is necessary to call rewire with the
    // module's filename at the first parameter to resolve the path. This way rewire() works exactly like require().
            'require = window.browserifyRequire.getProxy(require, __filename);';
}

function wrapCodeInDecorativeComments(filename, src) {
    var topLine = "",
        bottomLine = "",
        lineLength = 80;

    while (topLine.length <= lineLength) {

    }
}

function browserifyMiddleware(b) {
    function injectRewire(src, filename) {
        var rewireRequires,
            strictMode = "";

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

        // If the module uses strict mode we must ensure that "use strict" stays at the beginning of the module.
        if (detectStrictMode(src) === true) {
            strictMode = ' "use strict"; ';
        }

        // Convert back slashes to normal slashes.
        filename = filename.replace(/\\/g, "/");

        // We don't want to inject this code at the beginning of a rewire/lib-module. Otherwise
        // it would cause a black hole that devours our universe.
        if (filename.indexOf("/rewire/lib") === -1) {
            src =
                strictMode +    // either '' or ' "use strict"; '
                "var global = window; " +   // window is our new global object
                importGlobalsSrc +
                injectionSrc + "\n" +
                // For a better debugging experience we're adding a comment with the filename
                "//// " + filename + " /////////////////////////////////////////////////////////////////////////////////////////////////////////////\n" +
                "\n" +
                src + "\n" +
                "\n" +
                "/////" + filename.replace(/./g, "/") + "//////////////////////////////////////////////////////////////////////////////////////////////////////////////\n" +
                "//@ sourceURL=" + filename + "\n";
        }

        return src;
    }

    // Register file handler
    b.register(".js", injectRewire);
    // Append rewire initialization at the end of the bundle
    b.append(browserInit);

    return b;
}

module.exports = browserifyMiddleware;