"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    getInjectionSrc = require("../lib/getInjectionSrc.js");

describe("#getMonkeyPatchSrc", function () {
    it("should return ''", function () {
        var expectedSrc = "",
            subject = {};

        expect(getInjectionSrc(subject)).to.be(expectedSrc);
    });
    it("should return 'var process={\"argv\": [\"myArg1\", \"myArg2\"]};var console=456;'", function () {
        var expectedSrc = "var process={\"argv\": [\"myArg1\", \"myArg2\"]};var console=456;",
            subject = {
                process: {
                    argv: ["myArg1", "myArg2"]
                },
                console: 456
            };

        expect(getInjectionSrc(subject)).to.be(expectedSrc);
    });
});