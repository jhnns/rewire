"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    getLeakingWrapper = require("../lib/getLeakingSrc.js");

describe("#getLeakingWrapper", function () {
    it("should return 'exports.__ = {};'", function () {
        expect(getLeakingWrapper([])).to.be("exports.__ = {};");
    });
    it("should return 'exports.__ = {somethingPrivate:somethingPrivate,somethingSecret:somethingSecret};'", function () {
        var leakArr = ["somethingPrivate", "somethingSecret"];

        expect(getLeakingWrapper(leakArr))
            .to.be("exports.__ = {somethingPrivate:somethingPrivate,somethingSecret:somethingSecret};");
    });
});