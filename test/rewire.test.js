// Don't run code in ES5 strict mode.
// In case this module was in strict mode, all other modules called by this would also be strict.
// But when testing if the strict mode is preserved, we must ensure that this module is NOT strict.

var path = require("path"),
    expect = require("expect.js"),
    rewire = require("../");

function checkForTypeError(err) {
    expect(err.constructor).to.be(TypeError);
}

describe("rewire", function () {
    it("should work like require()", function () {
        rewire("./testModules/moduleA.js").getFilename();
        require("./testModules/moduleA.js").getFilename();
        expect(rewire("./testModules/moduleA.js").getFilename()).to.eql(require("./testModules/moduleA.js").getFilename());
        expect(rewire(".testModules/someOtherModule.js").filename).to.eql(require("./testModules/someOtherModule.js").filename);
    });
    it("should return a fresh instance of the module", function () {
        var someOtherModule = require("./testModules/someOtherModule.js"),
            rewiredSomeOtherModule;

        someOtherModule.fs = "This has been modified";
        rewiredSomeOtherModule = rewire("./testModules/someOtherModule.js");
        expect(rewiredSomeOtherModule.fs).not.to.be("This has been modified");
    });
    it("should not cache the rewired module", function () {
        var rewired,
            someOtherModule = require("./testModules/someOtherModule.js");

        someOtherModule.fs = "This has been changed";

        rewired = rewire("./testModules/someOtherModule.js");
        expect(someOtherModule).not.to.be(rewired);
        expect(require("./testModules/moduleA.js").someOtherModule).not.to.be(rewired);
        expect(require("./testModules/moduleA.js").someOtherModule).to.be(someOtherModule);
        expect(require("./testModules/moduleA.js").someOtherModule.fs).to.be("This has been changed");
    });
    it("should modify the module so it provides a __set__ - function", function () {
        expect(rewire("./testModules/moduleA.js").__set__).to.be.a(Function);
        expect(rewire("./testModules/moduleB.js").__set__).to.be.a(Function);
    });
    it("should modify the module so it provides a __get__ - function", function () {
        expect(rewire("./testModules/moduleA.js").__get__).to.be.a(Function);
        expect(rewire("./testModules/moduleB.js").__get__).to.be.a(Function);
    });
    it("should not influence other modules", function () {
        var rewiredModuleA = rewire("./testModules/moduleA.js");

        expect(require("./testModules/someOtherModule.js").__set__).to.be(undefined);
        expect(require("./testModules/someOtherModule.js").__get__).to.be(undefined);
    });
    it("should not override/influence global objects by default", function () {
        // This should throw no exception
        rewire("./testModules/moduleA.js").checkSomeGlobals();
        rewire("./testModules/moduleB.js").checkSomeGlobals();
    });
    it("should provide the ability to set private vars", function () {
        var rewiredModuleA = rewire("./testModules/moduleA.js"),
            newObj = {};

        expect(rewiredModuleA.getMyNumber()).to.be(0);
        rewiredModuleA.__set__("myNumber", 2);
        expect(rewiredModuleA.getMyNumber()).to.be(2);
        rewiredModuleA.__set__("myObj", newObj);
        expect(rewiredModuleA.getMyObj()).to.be(newObj);
        rewiredModuleA.__set__("env", "ENVENV");
    });
    it("should provide the ability to get private vars", function () {
        var rewiredModuleA = rewire("./testModules/moduleA.js");

        expect(rewiredModuleA.__get__("myNumber")).to.be(rewiredModuleA.getMyNumber());
        expect(rewiredModuleA.__get__("myObj")).to.be(rewiredModuleA.getMyObj());
    });
    it("should provide the ability to inject mocks", function (done) {
        var rewiredModuleA = rewire("./testModules/moduleA.js"),
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
        var rewiredModuleA = rewire("./testModules/moduleA.js"),
            someOtherModule,
            mockedFs = {};

        rewiredModuleA.__set__("fs", mockedFs);
        someOtherModule = require("./testModules/someOtherModule.js");
        expect(someOtherModule.fs).not.to.be(mockedFs);
    });
    it("should provide the ability to mock global objects just within the module", function () {
        var rewiredModuleA = rewire("./testModules/moduleA.js"),
            rewiredModuleB = rewire("./testModules/moduleB.js"),
            consoleMock = {},
            bufferMock = {},
            documentMock = {},
            newFilename = "myFile.js";

        rewiredModuleA.__set__({
            console: consoleMock,
            __filename: newFilename
        });
        expect(rewiredModuleA.getConsole()).to.be(consoleMock);
        expect(rewiredModuleB.getConsole()).not.to.be(consoleMock);
        expect(console).not.to.be(consoleMock);
        expect(rewiredModuleA.getFilename()).to.be(newFilename);
        expect(rewiredModuleB.getFilename()).not.to.be(newFilename);
        expect(console).not.to.be(newFilename);
        if (typeof window === "undefined") {
            rewiredModuleA.__set__("Buffer", bufferMock);
            expect(rewiredModuleA.getBuffer()).to.be(bufferMock);
            expect(rewiredModuleB.getBuffer()).not.to.be(bufferMock);
            expect(Buffer).not.to.be(bufferMock);
        } else {
            rewiredModuleA.__set__("document", documentMock);
            expect(rewiredModuleA.getDocument()).to.be(documentMock);
            expect(rewiredModuleB.getDocument() === documentMock).to.be(false);
            expect(document === documentMock).to.be(false);
        }
    });
    it("should be possible to mock global objects that are added on runtime", function () {
        var rewiredModule;

        if (typeof window === "undefined") {
            global.someGlobalVar = "test";
            rewiredModule = rewire("./testModules/moduleA.js");
            rewiredModule.__set__("someGlobalVar", "other value");
            expect(global.someGlobalVar).to.be("test");
            expect(rewiredModule.__get__("someGlobalVar")).to.be("other value");
            delete global.someGlobalVar;
        } else {
            window.someGlobalVar = "test";
            rewiredModule = rewire("./testModules/moduleA.js");
            rewiredModule.__set__("someGlobalVar", "other value");
            expect(window.someGlobalVar).to.be("test");
            expect(rewiredModule.__get__("someGlobalVar")).to.be("other value");
            if (typeof navigator !== "undefined" && /MSIE [6-8]\.[0-9]/g.test(navigator.userAgent) === false) {
                delete window.someGlobalVar;
            }
        }
    });
    it("should not be a problem to have a comment on file end", function () {
        var rewired = rewire("./testModules/emptyModule.js");

        rewired.__set__("someVar", "hello");
        expect(rewired.__get__("someVar")).to.be("hello");
    });
    it("should not influence the original require if nothing has been required within the rewired module", function () {
        rewire("./testModules/emptyModule.js"); // nothing happens here because emptyModule doesn't require anything
        expect(require("./testModules/moduleA.js").__set__).to.be(undefined); // if restoring the original node require didn't worked, the module would have a setter
    });
    it("subsequent calls of rewire should always return a new instance", function () {
        expect(rewire("./testModules/moduleA.js")).not.to.be(rewire("./testModules/moduleA.js"));
    });
    it("should preserve the strict mode (not IE)", function () {
        var strictModule = rewire("./testModules/strictModule.js");

        expect(function () {
            strictModule.doSomethingUnstrict();
        }).to.throwException(checkForTypeError);
    });
    it("should not modify line numbers in stack traces", function () {
        var throwError = rewire("./testModules/throwError.js");

        try {
            throwError();
        } catch (err) {
            if (err.stack) {
                expect(err.stack.split("\n")[1]).to.match(/:2:11/);
            }
        }
    });
});