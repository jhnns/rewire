var setterSrc = require("../__set__.js").toString(),
    getterSrc = require("../__get__.js").toString(),
    fs = require("fs"),
    path = require("path"),
    getImportGlobalsSrc = require("../getImportGlobalsSrc.js"),
    getRewireRequires = require("./getRewireRequires.js"),
    detectStrictMode = require("../detectStrictMode.js"),

    appendix = fs.readFileSync(__dirname + "/appendix.js", "utf8"),
    importGlobalsSrc = getImportGlobalsSrc(),
    injectionSrc = getInjectionSrc().replace(/\s+/g, " ");   // strip out unnecessary spaces to be unobtrusive in the debug view

function getInjectionSrc() {
    return  'require("rewire").register(__filename, ' + setterSrc + ', ' + getterSrc + ');' +
            'process = require("__browserify_process");' +
            'require = window.browserifyRequire.getProxy(require, __filename);';
}

function browserifyMiddleware(b) {
    var strictMode;

    b.register(".js", function injectRewire(src, filename) {
        var rewireRequires = getRewireRequires(src),
            strictMode = "";

        // Add all modules that are loaded by rewire() manually to browserify because browserify's
        // require-sniffing doesn't work here.
        rewireRequires.forEach(function forEachRewireRequire(requirePath) {

            if (requirePath.charAt(0) === ".") {
                requirePath = path.resolve(path.dirname(filename), requirePath);
            }
            b.require(requirePath);

        });

        if (detectStrictMode(src) === true) {
            strictMode = ' "use strict"; ';
        }

        filename = filename.replace(/\\/g, "/");
        if (filename.indexOf("/rewire/lib") === -1) {
            src =
                strictMode +
                "var global = window; " +
                importGlobalsSrc +
                injectionSrc +
                // For a better debugging experience we're adding a comment with the filename
                "\n//// " + filename + " /////////////////////////////////////////////////////////////////////////////////////////////////////////////\n\n" +
                src +
                "\n\n////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////\n";
        }

        return src;
    });
    b.append(appendix);

    return b;
}

module.exports = browserifyMiddleware;