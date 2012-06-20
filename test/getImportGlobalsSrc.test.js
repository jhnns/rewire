var expect = require("expect.js"),
    vm = require("vm"),
    getImportGlobalsSrc = require("../lib/getImportGlobalsSrc.js");

describe("getImportGlobalsSrc", function () {
    it("should declare all globals with a var", function () {
        var context = {
                global: global
            },
            src,
            actualGlobals,
            expectedGlobals = Object.keys(global);

        src = getImportGlobalsSrc();
        vm.runInNewContext(src, context);
        actualGlobals = Object.keys(context);
        actualGlobals.sort();
        expectedGlobals.sort();
        expect(actualGlobals).to.eql(expectedGlobals);
        expect(actualGlobals.length).to.be.above(1);
    });
});