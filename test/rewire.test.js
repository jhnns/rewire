// Don't run code in ES5 strict mode.
// In case this module was in strict mode, all other modules called by this would also be strict.
// But when testing if the strict mode is preserved, we must ensure that this module is NOT strict.

var path = require("path"),
    expect = require("expect.js"),
    rewire = require("../lib/index.js");

var testModules = {
        A: path.resolve(__dirname, "./testModules/moduleA.js"),
        B: path.resolve(__dirname, "./testModules/moduleB.js"),
        someOtherModule: path.resolve(__dirname, "./testModules/someOtherModule.js"),
        emptyModule: path.resolve(__dirname, "./testModules/emptyModule.js"),
        strictModule: path.resolve(__dirname, "./testModules/strictModule.js")
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
            delete require.cache[modulePath];
        }
    }
}

describe("rewire", function () {
    beforeEach(cleanRequireCache);  // ensuring a clean test environment
    it("should work like require()", function () {
        expect(rewire("./testModules/moduleA.js")).to.be(require("./testModules/moduleA.js"));
        cleanRequireCache();
        expect(rewire("../test/testModules/moduleA.js")).to.be(require("../test/testModules/moduleA.js"));
        cleanRequireCache();
        expect(rewire(testModules.A)).to.be(require(testModules.A));
    });
    it("should modify the module so it provides a __set__ - function", function () {
        expect(rewire(testModules.A).__set__).to.be.a(Function);
        expect(rewire(testModules.B).__set__).to.be.a(Function);
    });
    it("should modify the module so it provides a __get__ - function", function () {
        expect(rewire(testModules.A).__get__).to.be.a(Function);
        expect(rewire(testModules.B).__get__).to.be.a(Function);
    });
    it("should not influence other modules", function () {
        var rewiredModuleA = rewire(testModules.A);

        expect(require(testModules.someOtherModule).__set__).to.be(undefined);
        expect(require(testModules.someOtherModule).__get__).to.be(undefined);
        expect(require("fs").__set__).to.be(undefined);
        expect(require("fs").__get__).to.be(undefined);
    });
    it("should not influence global objects by default", function () {
        expect(function () {
            rewire(testModules.A).checkSomeGlobals();
            rewire(testModules.B).checkSomeGlobals();
        }).to.not.throwException();
    });
    it("should provide the ability to set private vars", function () {
        var rewiredModuleA = rewire(testModules.A),
            newObj = {};

        expect(rewiredModuleA.getMyNumber()).to.be(0);
        rewiredModuleA.__set__("myNumber", 2);
        expect(rewiredModuleA.getMyNumber()).to.be(2);
        rewiredModuleA.__set__("myObj", newObj);
        expect(rewiredModuleA.getMyObj()).to.be(newObj);
        rewiredModuleA.__set__("env", "ENVENV");
    });
    it("should provide the ability to get private vars", function () {
        var rewiredModuleA = rewire(testModules.A);

        expect(rewiredModuleA.__get__("myNumber")).to.be(rewiredModuleA.getMyNumber());
        expect(rewiredModuleA.__get__("myObj")).to.be(rewiredModuleA.getMyObj());
    });
    it("should provide the ability to inject mocks", function (done) {
        var rewiredModuleA = rewire(testModules.A),
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
        var rewiredModuleA = rewire(testModules.A),
            someOtherModule,
            mockedFs = {};

        rewiredModuleA.__set__("fs", mockedFs);
        someOtherModule = require(testModules.someOtherModule);
        expect(someOtherModule.fs).not.to.be(mockedFs);
    });
    it("should provide the ability to mock global objects just within the module", function () {
        var rewiredModuleA = rewire(testModules.A),
            rewiredModuleB = rewire(testModules.B),
            consoleMock = {},
            processMock = {},
            newFilename = "myFile.js";

        rewiredModuleA.__set__({
            console: consoleMock,
            process: processMock
        });
        rewiredModuleA.__set__("__filename", newFilename);
        rewiredModuleB.__set__({
            console: consoleMock,
            process: processMock
        });
        rewiredModuleB.__set__("__filename", newFilename);
        expect(rewiredModuleA.getConsole()).to.be(consoleMock);
        expect(rewiredModuleB.getConsole()).to.be(consoleMock);
        expect(console).not.to.be(consoleMock);
        expect(rewiredModuleA.getProcess()).to.be(processMock);
        expect(rewiredModuleB.getProcess()).to.be(processMock);
        expect(process).not.to.be(processMock);
        expect(rewiredModuleA.getFilename()).to.be(newFilename);
        expect(rewiredModuleB.getFilename()).to.be(newFilename);
    });
    it("should cache the rewired module", function () {
        var rewired;

        rewired = rewire(testModules.someOtherModule);
        expect(require(testModules.A).someOtherModule).to.be(rewired);
        cleanRequireCache();
        rewired = rewire(testModules.someOtherModule, true);
        expect(require(testModules.A).someOtherModule).to.be(rewired);
    });
    it("should not cache the rewired module on demand", function () {
        var rewired;

        rewired = rewire(testModules.someOtherModule, false);
        expect(require(testModules.A).someOtherModule).not.to.be(rewired);
    });
    it("should not influence the original node require if nothing has been required within the rewired module", function () {
        rewire(testModules.emptyModule); // nothing happens here because emptyModule doesn't require anything
        expect(require(testModules.A).__set__).to.be(undefined); // if restoring the original node require didn't worked, the module would have a setter
    });
    it("subsequent calls of rewire should always return a new instance", function () {
        expect(rewire(testModules.A)).not.to.be(rewire(testModules.A));
    });
    it("should preserve the strict mode", function () {
        var strictModule = rewire(testModules.strictModule);

        expect(function () {
            strictModule.doSomethingUnstrict();
        }).to.throwException(checkForTypeError);
    });
    describe("#reset", function () {
        it("should remove all rewired modules from cache", function () {
            var rewiredModuleA = rewire(testModules.A),
                rewiredModuleB = rewire(testModules.B);

            expect(require(testModules.A)).to.be(rewiredModuleA);
            expect(require(testModules.B)).to.be(rewiredModuleB);
            rewire.reset();
            expect(require(testModules.A)).not.to.be(rewiredModuleA);
            expect(require(testModules.B)).not.to.be(rewiredModuleB);
        });
    });
});