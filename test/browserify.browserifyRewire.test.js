var vm = require("vm"),
    fs = require("fs"),
    pathUtil = require("path"),
    expect = require("expect.js"),
    browserify = require("browserify"),
    browserifyMiddleware = require("../lib/index.js").browserify;

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
            setTimeout: setTimeout
        },
        console: console
    }, filename);
}

describe("browserifyRewire", function () {
    before(require("./testHelpers/createFakePackageJSON.js"));
    after(require("./testHelpers/removeFakePackageJSON.js"));
    it("should attach __set__ and __get__ to the exports-obj", function (done) {
        var context,
            exportsObj = {},
            returnedObj,
            browserifyRewire;

        // Register with fake objects
        // Using null for objects that are not involved in this particular test
        function moduleA() {
            "use strict";

            browserifyRewire.register("/a.js", null, null);
            returnedObj = browserifyRewire("/a.js", "/b.js");
        }

        function moduleB() {
            "use strict";
            browserifyRewire.register("/b.js", setter, getter);

            return exportsObj;
        }

        function fakeResolve() {
            return "/b.js";
        }

        function fakeRequire(requirePath) {
            if (requirePath === "path") {
                return pathUtil;
            } else {
                return moduleB();
            }
        }
        fakeRequire.resolve = fakeResolve;

        function setter() {}
        function getter() {}

        context = {
            require: fakeRequire,
            module: {},
            console: console,
            window: {
                browserifyRequire: {
                     modules: {
                        "/b.js": {
                            _cached : {}
                        }
                     }
                }
            }
        };

        fs.readFile(pathUtil.resolve(__dirname, "../lib/browserify/browserifyRewire.js"), "utf8", function onBrowserifyRewireRead(err, src) {
            vm.runInNewContext(src, context);
            browserifyRewire = context.module.exports;

            moduleA();

            expect(returnedObj).not.to.be(exportsObj);
            expect(returnedObj.__set__).to.be(setter);
            expect(returnedObj.__get__).to.be(getter);
            expect(context.window.browserifyRequire.modules["/b.js"]._cached).to.be(returnedObj);

            done();
        });
    });
    it("should run all sharedTestCases without exception", function (done) {
        var b = browserify(),
            browserOutput = __dirname + "/browser/browseroutput.js",
            browserBundle,
            vmBundle;

        b.use(browserifyMiddleware);
        b.require(__dirname + "/testModules/sharedTestCases.js");
        vmBundle = b.bundle();
        browserBundle = vmBundle;

        // Setup for mocha
        browserBundle += 'window.onload = function () {' +
            'mocha.setup("bdd");' +
            'window.browserifyRequire("/test/testModules/sharedTestCases.js");' +
            'mocha.run();' +
        '};';

        vmBundle += 'window.browserifyRequire("/test/testModules/sharedTestCases.js");';

        // Output for browser-testing
        fs.mkdir(__dirname + "/browser", function onMkDir() {
            fs.writeFile(browserOutput, browserBundle, "utf8", done);

            // This should throw no exception.
            runInFakeBrowserContext(vmBundle, browserOutput);
        });
    });
});