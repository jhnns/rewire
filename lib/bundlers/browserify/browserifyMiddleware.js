var setterSrc = require("../../__set__.js").toString(),
    getterSrc = require("../../__get__.js").toString(),
    path = require("path"),
    injectRewire = require("../injectRewire.js"),
    getRewireRequires = require("../getRewireRequires.js"),

    rewireIndex = path.resolve(__dirname, "../../index.js"),
    settersAndGettersSrc;

function browserifyMiddleware(b) {
    function doInjectRewire(src, filename) {
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

        src = injectRewire(src, filename, settersAndGettersSrc);

        return src;
    }

    function forwardBrowserifyRewire(filename) {
        if (filename === rewireIndex) {
            filename = __dirname + "/browserifyRewire.js";
        }

        return filename;
    }

    // Register file handler
    b.register(".js", doInjectRewire);
    b.register("path", forwardBrowserifyRewire);

    return b;
}

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
    'rewire.register(__filename, module, ' + setterSrc + ', ' + getterSrc + ');' +
    // Overrides the module internal require with a require proxy. This proxy is necessary to call rewire with the
    // module's filename at the first parameter to resolve the path. This way rewire() works exactly like require().
    'require = rewire.getProxy(require, __dirname);' +
    // Cleaning up
    'rewire = undefined;'
).replace(/\s+/g, " ");   // strip out unnecessary spaces to be unobtrusive in the debug view

module.exports = browserifyMiddleware;