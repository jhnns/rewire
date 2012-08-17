// Don't run code in ES5 strict mode.
// In case this module was in strict mode, all other modules called by this would also be strict.
// But when testing if the strict mode is preserved, we must ensure that this module is NOT strict.

describe("internalRewire", function () {
    before(require("./testHelpers/createFakePackageJSON.js"));
    after(require("./testHelpers/removeFakePackageJSON.js"));
    it("should pass all shared test cases", function () {
        require("./testModules/sharedTestCases.js");
    });
});