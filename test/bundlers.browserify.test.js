var vm = require("vm"),
    fs = require("fs"),
    expect = require("expect.js"),
    browserify = require("browserify");

/**
 * Executes the source in a context that pretends to be a browser
 * @param {!String} src
 */
function runInFakeBrowserContext(src, filename) {
    var context =  {
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
        document: {},
        console: console,
        testEnv: "browserify"
    };
    context.window = context;
    vm.runInNewContext(src, context, filename);
}

describe("rewire bundled with browserify", function () {
    before(require("./testHelpers/createFakePackageJSON.js"));
    after(require("./testHelpers/removeFakePackageJSON.js"));
    it("should run all sharedTestCases without exception", function () {
        var b = browserify({
                debug: true
            }),
            middleware = require("rewire").bundlers.browserify,
            browserOutput = __dirname + "/bundlers/browserify/bundle.js",
            browserBundle,
            vmBundle;

        b.use(middleware);
        b.addEntry(__dirname + "/testModules/sharedTestCases.js");
        vmBundle = b.bundle();
        browserBundle = vmBundle;

        // Setup for mocha
        browserBundle = "function enableTests() { " + browserBundle + " }";

        // Output for browser-testing
        fs.writeFileSync(browserOutput, browserBundle, "utf8");

        // This should throw no exception.
        runInFakeBrowserContext(vmBundle, browserOutput);
    });
});