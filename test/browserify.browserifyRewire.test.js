var vm = require("vm"),
    fs = require("fs"),
    pathUtil = require("path"),
    expect = require("expect.js"),
    browserify = require("browserify");

/**
 * Executes the source in a context that pretends to be a browser
 * @param {!String} src
 */
function runInFakeBrowserContext(src, filename) {
    vm.runInNewContext(src, {
        window: {
            console: console,
            describe: describe,
            it: it,
            before: before,
            after: after,
            beforeEach: beforeEach,
            afterEach: afterEach,
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            setInterval: setInterval,
            clearInterval: clearInterval,
            parseFloat: parseFloat,
            parseInt: parseInt,
            encodeURIComponent: function () {},
            decodeURIComponent: function () {},
            document: {}
        },
        console: console
    }, filename);
}

describe("browserifyRewire", function () {
    before(require("./testHelpers/createFakePackageJSON.js"));
    after(require("./testHelpers/removeFakePackageJSON.js"));
    it("should run all sharedTestCases without exception", function () {
        var b = browserify({
                //debug: true
            }),
            middleware = require("rewire").browserify,
            browserOutput = __dirname + "/browserify/bundle.js",
            browserBundle,
            vmBundle;

        b.use(middleware);
        b.addEntry(__dirname + "/testModules/sharedTestCases.js");
        vmBundle = b.bundle();
        browserBundle = vmBundle;

        // Setup for mocha
        browserBundle = "function enableTests() {" + browserBundle + "}";

        // Output for browser-testing
        fs.writeFileSync(browserOutput, browserBundle, "utf8");

        // This should throw no exception.
        runInFakeBrowserContext(vmBundle, browserOutput);
    });
});