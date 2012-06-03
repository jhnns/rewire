"use strict"; // run code in ES5 strict mode

var path = require("path"),
    expect = require("expect.js"),
    rewire = require("../lib/index.js");

var testModules = [
        path.resolve(__dirname, "./testModules/index.js"),
        path.resolve(__dirname, "./testModules/A/moduleA.js"),
        path.resolve(__dirname, "./testModules/B/moduleB.js"),
        path.resolve(__dirname, "./testModules/C/moduleC.js")
    ];


function cleanRequireCache() {
    var i;

    for (i = 0; i < testModules.length; i++) {
        delete require.cache[testModules[i]];
    }
}

describe("#rewire", function () {
    beforeEach(cleanRequireCache);  // ensuring a clean test environment
    it("should work like require() when omitting all other params", function () {
        expect(rewire("./testModules/A/moduleA.js")).to.be(require("./testModules/A/moduleA.js"));
    });
    it("should require all mocks", function () {
        var rewired,
            fsMock = {},
            mocks = {},
            moduleBMock = {},
            moduleCMock = {},
            toSrcMock = {},
            indexMock = {};

        mocks["fs"] = fsMock;
        mocks[path.resolve(__dirname, "./testModules/B/moduleB.js")] = moduleBMock;
        mocks["../C/moduleC.js"] = moduleCMock;
        mocks["toSrc"] = toSrcMock;
        mocks["../"] = indexMock;

        rewired = rewire("./testModules/A/moduleA.js", mocks);
        expect(rewired.fs).to.be(fsMock);
        expect(rewired.b).to.be(moduleBMock);
        expect(rewired.c).to.be(moduleCMock);
        expect(rewired.toSrc).to.be(toSrcMock);
        expect(rewired.index).to.be(indexMock);
    });
    it("should inject object modifications", function () {
        var rewired,
            injections = {
                process: {
                    argv: ["arg1", "arg2", "arg3"]
                },
                console: 123
            };

        rewired = rewire("./testModules/A/moduleA.js", null, injections);
        rewired.exportAll();
        expect(rewired.process).not.to.be(process);
        expect(process.argv).not.to.eql(injections.process.argv);
        expect(rewired.process).to.eql(injections.process);
        expect(rewired.console).to.be(123);
    });
    it("should inject custom scripts", function () {
        var rewired,
            script = "var console = 456;";

        rewired = rewire("./testModules/A/moduleA.js", null, script);
        rewired.exportAll();
        expect(rewired.console).to.be(456);
    });
    it("should leak private variables", function () {
        var rewired,
            leaks = ["myPrivateVar"];

        rewired = rewire("./testModules/A/moduleA.js", null, null, leaks);
        expect(rewired.__.myPrivateVar).to.be("Hello I'm very private");
    });
    it("should leak private functions", function () {
        var rewired,
            leaks = ["myPrivateFunction"];

        rewired = rewire("./testModules/A/moduleA.js", null, null, leaks);
        expect(rewired.__.myPrivateFunction()).to.be("Hello I'm very private");
    });
    it("should leak nothing on demand", function () {
        var rewired;

        rewired = rewire("./testModules/A/moduleA.js");
        expect(rewired.__).to.be(undefined);
    });
    it("should cache the rewired module", function () {
        var rewired;

        rewired = rewire("./testModules/B/moduleB.js");
        rewired.requireIndex();
        expect(rewired.index.b).to.be(rewired);
        cleanRequireCache();
        rewired = rewire("./testModules/B/moduleB.js", null, null, null, true);
        rewired.requireIndex();
        expect(rewired.index.b).to.be(rewired);
    });
    it("should not cache the rewired module on demand", function () {
        var rewired;

        rewired = rewire("./testModules/B/moduleB.js", null, null, null, false);
        rewired.requireIndex();
        expect(rewired.index.b).not.to.be(rewired);
    });
    it("should not influence the original node require if nothing has been required within the rewired module", function () {
        var moduleCMock = {},
            moduleB,
            mocks = {
                "../C/moduleC.js": moduleCMock
            };

        rewire("./testModules/C/moduleC.js", mocks); // nothing happens here because moduleC doesn't require anything
        moduleB = require("./testModules/A/moduleA.js"); // if restoring the original node require didn't worked, the mock would be applied now
        expect(moduleB.c).not.to.be(moduleCMock);
    });
});