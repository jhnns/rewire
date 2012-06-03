"use strict"; // run code in ES5 strict mode

var path = require("path"),
    expect = require("expect.js"),
    trick = require("../lib/index.js");

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

describe("#trick", function () {
    beforeEach(cleanRequireCache);  // ensuring a clean test environment
    it("should work like require() when omitting all other params", function () {
        expect(trick("./testModules/A/moduleA.js")).to.be(require("./testModules/A/moduleA.js"));
    });
    it("should require all mocks", function () {
        var tricked,
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

        tricked = trick("./testModules/A/moduleA.js", mocks);
        expect(tricked.fs).to.be(fsMock);
        expect(tricked.b).to.be(moduleBMock);
        expect(tricked.c).to.be(moduleCMock);
        expect(tricked.toSrc).to.be(toSrcMock);
        expect(tricked.index).to.be(indexMock);
    });
    it("should inject object modifications", function () {
        var tricked,
            injections = {
                process: {
                    argv: ["arg1", "arg2", "arg3"]
                },
                console: 123
            };

        tricked = trick("./testModules/A/moduleA.js", null, injections);
        expect(tricked.process).not.to.be(process);
        expect(process.argv).not.to.eql(injections.process.argv);
        expect(tricked.process).to.eql(injections.process);
        expect(tricked.console).to.be(123);
    });
    it("should inject custom scripts", function () {
        var tricked,
            script = "var console = 456;";

        tricked = trick("./testModules/A/moduleA.js", null, script);

        expect(tricked.console).to.be(456);
    });
    it("should leak private variables", function () {
        var tricked,
            leaks = ["myPrivateVar"];

        tricked = trick("./testModules/A/moduleA.js", null, null, leaks);
        expect(tricked.__.myPrivateVar).to.be("Hello I'm very private");
    });
    it("should leak nothing on demand", function () {
        var tricked;

        tricked = trick("./testModules/A/moduleA.js");
        expect(tricked.__).to.be(undefined);
    });
    it("should cache the tricked module", function () {
        var tricked;

        tricked = trick("./testModules/B/moduleB.js");
        tricked.requireIndex();
        expect(tricked.index.b).to.be(tricked);
        cleanRequireCache();
        tricked = trick("./testModules/B/moduleB.js", null, null, null, true);
        tricked.requireIndex();
        expect(tricked.index.b).to.be(tricked);
    });
    it("should not cache the tricked module on demand", function () {
        var tricked;

        tricked = trick("./testModules/B/moduleB.js", null, null, null, false);
        tricked.requireIndex();
        expect(tricked.index.b).not.to.be(tricked);
    });
});