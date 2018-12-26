var expect = require("expect.js"),
    vm = require("vm"),
    getImportGlobalsSrc = require("../lib/getImportGlobalsSrc.js");

describe("getImportGlobalsSrc", function () {
    it("should declare no globals with a var", function () {
        var context = {
                global: global
            },
            expectedGlobals,
            src,
            actualGlobals;

        // Temporarily set module-internal variables on the global scope to check if getImportGlobalsSrc()
        // ignores them properly
        global.module = module;
        global.exports = exports;
        global.require = require;

        // Also make sure it ignores invalid variable names
        global["a-b"] = true;

        src = getImportGlobalsSrc();

        delete global.module;
        delete global.exports;
        delete global.require;
        delete global["__core-js_shared__"];
        delete global["a-b"];

        expectedGlobals = ["global"];

        vm.runInNewContext(src, context);
        actualGlobals = Object.keys(context);
        actualGlobals.sort();
        expectedGlobals.sort();
        expect(actualGlobals).to.eql(expectedGlobals);
    });
    it("should declare overridable globals with a var", function () {
        var context = {
                global: global
            },
            expectedGlobals,
            overridable = ["clearTimeout", "setTimeout"],
            src,
            actualGlobals;

        // Temporarily set module-internal variables on the global scope to check if getImportGlobalsSrc()
        // ignores them properly
        global.module = module;
        global.exports = exports;
        global.require = require;

        // Also make sure it ignores invalid variable names
        global["a-b"] = true;

        src = getImportGlobalsSrc(overridable);

        delete global.module;
        delete global.exports;
        delete global.require;
        delete global["__core-js_shared__"];
        delete global["a-b"];

        expectedGlobals = ["clearTimeout", "global", "setTimeout"];

        vm.runInNewContext(src, context);
        actualGlobals = Object.keys(context);
        actualGlobals.sort();
        expectedGlobals.sort();
        expect(actualGlobals).to.eql(expectedGlobals);
    });
    it("should ignore module-internal variables variables", function () {
        var context = {
                global: global
            },
            overridable = ["module", "exports", "require"],
            src,
            actualGlobals,
            expectedGlobals = ["global"];

        src = getImportGlobalsSrc(overridable);

        vm.runInNewContext(src, context);
        actualGlobals = Object.keys(context);
        actualGlobals.sort();
        expectedGlobals.sort();
        expect(actualGlobals).to.eql(expectedGlobals);
    });
});
