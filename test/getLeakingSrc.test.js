"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    getLeakingWrapper = require("../lib/getLeakingSrc.js");

describe("getLeakingWrapper", function () {
    it("should return 'module.exports.__ = {};'", function () {
        expect(getLeakingWrapper([])).to.be("module.exports.__ = {};");
    });
    it("should return 'module.exports.__ = {somethingPrivate:somethingPrivate,somethingSecret:somethingSecret};'", function () {
        var leakArr = ["somethingPrivate", "somethingSecret"];

        expect(getLeakingWrapper(leakArr))
            .to.be("module.exports.__ = {somethingPrivate:somethingPrivate,somethingSecret:somethingSecret};");
    });
});