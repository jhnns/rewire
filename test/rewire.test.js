// Don't run code in ES5 strict mode.
// In case this module was in strict mode, all other modules called by this would also be strict.
// But when testing if the strict mode is preserved, we must ensure that this module is NOT strict.

var expect = require("expect.js");

var rewire;

describe("rewire", function () {
    it("should pass all shared test cases", function () {
        require("./testModules/sharedTestCases.js");
    });
    it("should also work with CoffeeScript", function () {
        var coffeeModule;

        rewire = require("../");
        coffeeModule = rewire("./testModules/module.coffee");
        coffeeModule.__set__("fs", {
            readFileSync: function () {
                return "It works!";
            }
        });
        expect(coffeeModule.readFileSync()).to.be("It works!");
    });
});