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
    expect(err.constructor === TypeError).to.be(true);
}

function cleanRequireCache() {
    var moduleName,
        modulePath;

    for (moduleName in testModules) {
        if (testModules.hasOwnProperty(moduleName)) {
            modulePath = testModules[moduleName];
            delete require.cache[modulePath];
        }
    }
}

describe("rewire " + (typeof window === "undefined"? "(node.js)": "(browser)"), function () {
    afterEach(cleanRequireCache);  // ensuring a clean test environment
    it("should work like require()", function () {
        expect(rewire("./moduleA.js") === require("./moduleA.js")).to.be(true);
        cleanRequireCache();
        expect(rewire("../testModules/moduleA.js") === require("../testModules/moduleA.js")).to.be(true);
        cleanRequireCache();
        expect(rewire("./moduleA.js") === require("./moduleA.js")).to.be(true);
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

        expect(require("./someOtherModule.js").__set__ === undefined).to.be(true);
        expect(require("./someOtherModule.js").__get__ === undefined).to.be(true);
        expect(require("fs").__set__ === undefined).to.be(true);
        expect(require("fs").__get__ === undefined).to.be(true);
    });
    it("should not override/influence global objects by default", function () {
        // This should throw no exception
        rewire("./moduleA.js").checkSomeGlobals();
        rewire("./moduleB.js").checkSomeGlobals();
    });
    it("should provide the ability to set private vars", function () {
        var rewiredModuleA = rewire("./moduleA.js"),
            newObj = {};

        expect(rewiredModuleA.getMyNumber() === 0).to.be(true);
        rewiredModuleA.__set__("myNumber", 2);
        expect(rewiredModuleA.getMyNumber() === 2).to.be(true);
        rewiredModuleA.__set__("myObj", newObj);
        expect(rewiredModuleA.getMyObj() === newObj).to.be(true);
        rewiredModuleA.__set__("env", "ENVENV");
    });
    it("should provide the ability to get private vars", function () {
        var rewiredModuleA = rewire("./moduleA.js");

        expect(rewiredModuleA.__get__("myNumber") === rewiredModuleA.getMyNumber()).to.be(true);
        expect(rewiredModuleA.__get__("myObj") === rewiredModuleA.getMyObj()).to.be(true);
    });
    it("should provide the ability to inject mocks", function (done) {
        var rewiredModuleA = rewire("./moduleA.js"),
            mockedFs = {
                readFileSync: function (file) {
                    expect(file === "bla.txt").to.be(true);
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
        expect(someOtherModule.fs === mockedFs).to.be(false);
    });
    it("should provide the ability to mock global objects just within the module", function () {
        var rewiredModuleA = rewire("./moduleA.js"),
            rewiredModuleB = rewire("./moduleB.js"),
            consoleMock = {},
            bufferMock = {},
            documentMock = {},
            newFilename = "myFile.js";

        rewiredModuleA.__set__({
            console: consoleMock,
            __filename: newFilename
        });
        expect(rewiredModuleA.getConsole() === consoleMock).to.be(true);
        expect(rewiredModuleB.getConsole() === consoleMock).to.be(false);
        expect(console === consoleMock).to.be(false);
        expect(rewiredModuleA.getFilename() === newFilename).to.be(true);
        expect(rewiredModuleB.getFilename() === newFilename).to.be(false);
        expect(console === newFilename).to.be(false);
        if (typeof window === "undefined") {
            rewiredModuleA.__set__("Buffer", bufferMock);
            expect(rewiredModuleA.getBuffer() === bufferMock).to.be(true);
            expect(rewiredModuleB.getBuffer() === bufferMock).to.be(false);
            expect(Buffer === bufferMock).to.be(false);
        } else {
            rewiredModuleA.__set__("document", documentMock);
            expect(rewiredModuleA.getDocument() === documentMock).to.be(true);
            expect(rewiredModuleB.getDocument() === documentMock === false).to.be(true);
            expect(document === documentMock === false).to.be(true);
        }
    });
    it("should be possible to mock global objects that are added on runtime", function () {
        var rewiredModule;

        if (typeof window === "undefined") {
            global.someGlobalVar = "test";
            rewiredModule = rewire("./moduleA.js");
            rewiredModule.__set__("someGlobalVar", "other value");
            expect(global.someGlobalVar === "test").to.be(true);
            expect(rewiredModule.__get__("someGlobalVar") === "other value").to.be(true);
            delete global.someGlobalVar;
        } else {
            window.someGlobalVar = "test";
            rewiredModule = rewire("./moduleA.js");
            rewiredModule.__set__("someGlobalVar", "other value");
            expect(window.someGlobalVar === "test").to.be(true);
            expect(rewiredModule.__get__("someGlobalVar") === "other value").to.be(true);
            delete window.someGlobalVar;
        }
    });
    it("should cache the rewired module", function () {
        var rewired;

        rewired = rewire("./someOtherModule.js");
        expect(require("./moduleA.js").someOtherModule === rewired).to.be(true);
        cleanRequireCache();
        rewired = rewire("./someOtherModule.js", true);
        expect(require("./moduleA.js").someOtherModule === rewired).to.be(true);
    });
    it("should not cache the rewired module on demand", function () {
        var rewired,
            someOtherModule = require("./someOtherModule.js");

        someOtherModule.fs = "This has been changed";

        rewired = rewire("./someOtherModule.js", false);
        expect(require("./moduleA.js").someOtherModule === rewired).to.be(false);
        expect(require("./moduleA.js").someOtherModule.fs === "This has been changed").to.be(true);
    });
    it("should not influence the original require if nothing has been required within the rewired module", function () {
        rewire("./emptyModule.js"); // nothing happens here because emptyModule doesn't require anything
        expect(require("./moduleA.js").__set__ === undefined).to.be(true); // if restoring the original node require didn't worked, the module would have a setter

    });
    it("subsequent calls of rewire should always return a new instance", function () {
        expect(rewire("./moduleA.js") === rewire("./moduleA.js")).to.be(false);
    });
    it("should preserve the strict mode (not IE)", function () {
        var strictModule = rewire("./strictModule.js");

        expect(function () {
            strictModule.doSomethingUnstrict();
        }).to.throwException(checkForTypeError);
    });
    it("should return a fresh instance of the module", function () {
        var someOtherModule = require("./someOtherModule.js"),
            rewiredSomeOtherModule;

        someOtherModule.fs = "This has been modified";
        rewiredSomeOtherModule = rewire("./someOtherModule.js");
        expect(rewiredSomeOtherModule.fs === "This has been modified").to.be(false);
    });
    describe("#reset", function () {
        it("should remove all rewired modules from cache", function () {
            var rewiredModuleA = rewire("./moduleA.js"),
                rewiredModuleB = rewire("./moduleB.js");

            expect(require("./moduleA.js") === rewiredModuleA).to.be(true);
            expect(require("./moduleB.js") === rewiredModuleB).to.be(true);
            rewire.reset();
            expect(require("./moduleA.js") === rewiredModuleA).to.be(false);
            expect(require("./moduleB.js") === rewiredModuleB).to.be(false);
        });
    });
});