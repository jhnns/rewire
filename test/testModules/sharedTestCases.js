// Don't run code in ES5 strict mode.
// In case this module was in strict mode, all other modules called by this would also be strict.
// But when testing if the strict mode is preserved, we must ensure that this module is NOT strict.

var path = require("path"),
    expect = require("expect.js"),
    rewire = require("rewire");

var testModules = {
        A: path.resolve(__dirname, "./moduleA.js"),
        B: path.resolve(__dirname, "./moduleB.js"),
        someOtherModule: path.resolve(__dirname, "./someOtherModule.js"),
        emptyModule: path.resolve(__dirname, "./emptyModule.js"),
        strictModule: path.resolve(__dirname, "./strictModule.js")
    };


function checkForTypeError(err) {
    expect(err.constructor).to.be(TypeError);
}

function cleanRequireCache() {
    var moduleName,
        modulePath;

    for (moduleName in testModules) {
        if (testModules.hasOwnProperty(moduleName)) {
            modulePath = testModules[moduleName];
            if (typeof window === "undefined") {
                delete require.cache[modulePath];
            } else {
                if (typeof window.browserifyRequire.modules[modulePath]._cached === "object") {
                    delete window.browserifyRequire.modules[modulePath]._cached;
                }
            }
        }
    }
}

describe("rewire " + (typeof window === "undefined"? "(node.js)": "(browser)"), function () {
    beforeEach(cleanRequireCache);  // ensuring a clean test environment
    it("should work like require()", function () {
        expect(rewire("./moduleA.js")).to.be(require("./moduleA.js"));
        cleanRequireCache();
        expect(rewire("../testModules/moduleA.js")).to.be(require("../testModules/moduleA.js"));
        cleanRequireCache();
        expect(rewire("./moduleA.js")).to.be(require("./moduleA.js"));
    });
    it("should modify the module so it provides a __set__ - function", function () {
        expect(rewire("./moduleA.js").__set__).to.be.a(Function);
        expect(rewire("./moduleB.js").__set__).to.be.a(Function);
    });
    it("should modify the module so it provides a __get__ - function", function () {
        expect(rewire("./moduleA.js").__get__).to.be.a(Function);
        expect(rewire("./moduleB.js").__get__).to.be.a(Function);
    });
    it("should not influence other modules", function () {
        var rewiredModuleA = rewire("./moduleA.js");

        expect(require("./someOtherModule.js").__set__).to.be(undefined);
        expect(require("./someOtherModule.js").__get__).to.be(undefined);
        expect(require("fs").__set__).to.be(undefined);
        expect(require("fs").__get__).to.be(undefined);
    });
    it("should not influence global objects by default", function () {
        // This should throw no exception
        rewire("./moduleA.js").checkSomeGlobals();
        rewire("./moduleB.js").checkSomeGlobals();
    });
    it("should provide the ability to set private vars", function () {
        var rewiredModuleA = rewire("./moduleA.js"),
            newObj = {};

        expect(rewiredModuleA.getMyNumber()).to.be(0);
        rewiredModuleA.__set__("myNumber", 2);
        expect(rewiredModuleA.getMyNumber()).to.be(2);
        rewiredModuleA.__set__("myObj", newObj);
        expect(rewiredModuleA.getMyObj()).to.be(newObj);
        rewiredModuleA.__set__("env", "ENVENV");
    });
    it("should provide the ability to get private vars", function () {
        var rewiredModuleA = rewire("./moduleA.js");

        expect(rewiredModuleA.__get__("myNumber")).to.be(rewiredModuleA.getMyNumber());
        expect(rewiredModuleA.__get__("myObj")).to.be(rewiredModuleA.getMyObj());
    });
    it("should provide the ability to inject mocks", function (done) {
        var rewiredModuleA = rewire("./moduleA.js"),
            mockedFs = {
                readFileSync: function (file) {
                    expect(file).to.be("bla.txt");
                    done();
                }
            };

        rewiredModuleA.__set__("fs", mockedFs);
        rewiredModuleA.readFileSync();
    });
    it("should not influence other modules when injecting mocks", function () {
        var rewiredModuleA = rewire("./moduleA.js"),
            someOtherModule,
            mockedFs = {};

        rewiredModuleA.__set__("fs", mockedFs);
        someOtherModule = require("./someOtherModule.js");
        expect(someOtherModule.fs).not.to.be(mockedFs);
    });
    it("should provide the ability to mock global objects just within the module", function () {
        var rewiredModuleA = rewire("./moduleA.js"),
            rewiredModuleB = rewire("./moduleB.js"),
            consoleMock = {},
            newFilename = "myFile.js";

        rewiredModuleA.__set__({
            console: consoleMock
        });
        rewiredModuleA.__set__("__filename", newFilename);
        rewiredModuleB.__set__({
            console: consoleMock
        });
        rewiredModuleB.__set__("__filename", newFilename);
        expect(rewiredModuleA.getConsole()).to.be(consoleMock);
        expect(rewiredModuleB.getConsole()).to.be(consoleMock);
        expect(console).not.to.be(consoleMock);
        expect(rewiredModuleA.getFilename()).to.be(newFilename);
        expect(rewiredModuleB.getFilename()).to.be(newFilename);
    });
    it("should cache the rewired module", function () {
        var rewired;

        rewired = rewire("./someOtherModule.js");
        expect(require("./moduleA.js").someOtherModule).to.be(rewired);
        cleanRequireCache();
        rewired = rewire("./someOtherModule.js", true);
        expect(require("./moduleA.js").someOtherModule).to.be(rewired);
    });
    it("should not cache the rewired module on demand", function () {
        var rewired;

        rewired = rewire("./someOtherModule.js", false);
        expect(require("./moduleA.js").someOtherModule).not.to.be(rewired);
    });
    it("should not influence the original node require if nothing has been required within the rewired module", function () {
        rewire("./emptyModule.js"); // nothing happens here because emptyModule doesn't require anything
        expect(require("./moduleA.js").__set__).to.be(undefined); // if restoring the original node require didn't worked, the module would have a setter
    });
    it("subsequent calls of rewire should always return a new instance", function () {
        expect(rewire("./moduleA.js")).not.to.be(rewire("./moduleA.js"));
    });
    it("should preserve the strict mode", function () {
        var strictModule = rewire("./strictModule.js");

        expect(function () {
            strictModule.doSomethingUnstrict();
        }).to.throwException(checkForTypeError);
    });
    describe("#reset", function () {
        it("should remove all rewired modules from cache", function () {
            var rewiredModuleA = rewire("./moduleA.js"),
                rewiredModuleB = rewire("./moduleB.js");

            expect(require("./moduleA.js")).to.be(rewiredModuleA);
            expect(require("./moduleB.js")).to.be(rewiredModuleB);
            rewire.reset();
            expect(require("./moduleA.js")).not.to.be(rewiredModuleA);
            expect(require("./moduleB.js")).not.to.be(rewiredModuleB);
        });
    });
});