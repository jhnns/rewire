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
            setTimeout: setTimeout
        },
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        parseFloat: parseFloat,
        parseInt: parseInt,
        encodeURIComponent: function () {},
        decodeURIComponent: function () {}
    }, filename);
}

describe("browserifyRewire", function () {
    before(require("./testHelpers/createFakePackageJSON.js"));
    after(require("./testHelpers/removeFakePackageJSON.js"));
    it("should attach __set__ and __get__ to the exports-obj", function (done) {
        var pathToBrowserfiyRewire = pathUtil.resolve(__dirname, "../lib/browserify/browserifyRewire.js"),
            context,
            exportsObj = {},
            moduleObj = {exports: exportsObj},
            returnedObj,
            browserifyRewire;

        // Register with fake objects
        // Using null for objects that are not involved in this particular test
        function moduleA() {
            "use strict";

            browserifyRewire.register("/a.js", null, null, null);
            returnedObj = browserifyRewire("/a.js", "/b.js");
        }

        function moduleB() {
            "use strict";

            browserifyRewire.register("/b.js", moduleObj, setter, getter);

            return exportsObj;
        }

        function fakeResolve() {
            return "/b.js";
        }

        function fakeRequire(path, parentModulePath) {
            var module;

            if (path === "../browser/shims.js") {
                return;
            } else if (path === "../getImportGlobalsSrc.js") {
                return require("../lib/getImportGlobalsSrc.js");
            }

            module = moduleB();

            expect(path).to.be("/b.js");
            expect(parentModulePath).to.be("/a.js");
            fakeRequire.cache["/b.js"] = module;

            return module;
        }
        fakeRequire.resolve = fakeResolve;
        fakeRequire.cache =  {};

        function setter() {}
        function getter() {}

        context = {
            module: {},
            console: console,
            window: {
                browserifyRequire: fakeRequire
            },
            require: fakeRequire
        };

        fs.readFile(pathToBrowserfiyRewire, "utf8", function onBrowserifyRewireRead(err, src) {
            vm.runInNewContext(src, context, pathToBrowserfiyRewire);
            browserifyRewire = context.module.exports;

            moduleA();

            expect(returnedObj.__set__).to.be(setter);
            expect(returnedObj.__get__).to.be(getter);
            // Because browserify does not create the module-object newly when executing the module
            // again we have to copy the module object deeply and store that copy in the
            // cache. Therefore we're checking here if the returned exports-object and the
            // cached module-object are an independent copy.
            expect(returnedObj).not.to.be(exportsObj);
            expect(context.window.browserifyRequire.cache["/b.js"]).not.to.be(moduleObj);

            done();
        });
    });
    it("should run all sharedTestCases without exception", function () {
        var b = browserify({debug: true}),
            middleware = require("rewire").browserify,
            browserOutput = __dirname + "/browserify/bundle.js",
            browserBundle,
            vmBundle;

        b.use(middleware);
        b.require(__dirname + "/testModules/sharedTestCases.js");
        vmBundle = b.bundle();
        browserBundle = vmBundle;

        // Setup for mocha
        browserBundle += 'window.onload = function () {' +
            'console.log("These tests will only work in all browsers with the console being opened");' +
            'mocha.setup("bdd");' +
            'window.browserifyRequire("/test/testModules/sharedTestCases.js");' +
            'mocha.run();' +
        '};';

        vmBundle += 'window.browserifyRequire("/test/testModules/sharedTestCases.js");';

        // Output for browser-testing
        fs.writeFileSync(browserOutput, browserBundle, "utf8");

        // This should throw no exception.
        runInFakeBrowserContext(vmBundle, browserOutput);
    });
});