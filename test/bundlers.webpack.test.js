var vm = require("vm"),
    fs = require("fs"),
    expect = require("expect.js"),
    webpack = require("webpack"),
    configureWebpack = require("../lib/bundlers/webpack/configureWebpack.js");

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
        testEnv: "webpack"
    };
    context.window = context;
    vm.runInNewContext(src, context, filename);
}

describe("rewire bundled with webpack", function () {
    before(require("./testHelpers/createFakePackageJSON.js"));
    after(require("./testHelpers/removeFakePackageJSON.js"));
    it("should run all sharedTestCases without exception", function (done) {
        var webpackOptions,
            src,
            outputPath =  __dirname + "/bundlers/webpack/bundle.js",
            browserBundle;

        webpackOptions = {
            output: outputPath,
            includeFilenames: true,
            debug: true
        };
        configureWebpack(webpackOptions);

        webpack(__dirname + "/testModules/sharedTestCases.js", webpackOptions, function onWebpackFinished(err, stats) {
            expect(err).to.be(null);
            expect(stats.errors).to.have.length(0);
            expect(stats.warnings).to.have.length(0);

            // Read generated source
            src = fs.readFileSync(outputPath, "utf8");

            // Setup for mocha
            browserBundle = "function enableTests() { " + src + " }";

            // Output for browser-testing
            fs.writeFileSync(outputPath, browserBundle, "utf8");

            // This should throw no exception.
            runInFakeBrowserContext(src, outputPath);

            done();
        });
    });
});