"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    getMonkeyPatchSrc = require("../lib/getMonkeyPatchSrc.js");

describe("#getMonkeyPatchSrc", function () {
    it("should return ''", function () {
        var expectedSrc = "",
            subject = {};

        expect(getMonkeyPatchSrc(subject)).to.be(expectedSrc);
    });
    it("should return 'process.argv=[\"myArg1\", \"myArg2\"];var console=456;'", function () {
        var expectedSrc = "process.argv=[\"myArg1\", \"myArg2\"];var console=456;",
            subject = {
                process: {
                    argv: ["myArg1", "myArg2"]
                },
                console: 456
            };

        expect(getMonkeyPatchSrc(subject)).to.be(expectedSrc);
    });
    it("should return 'level1.level2.level3.level4.level5=true;", function () {
        var expectedSrc = "level1.level2.level3.level4.level5=true;",
            subject = {level1: {level2: {level3: {level4: {level5: true}}}}};

        expect(getMonkeyPatchSrc(subject)).to.be(expectedSrc);
    });
});