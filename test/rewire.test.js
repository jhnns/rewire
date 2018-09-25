// Don't run code in ES5 strict mode.
// In case this module was in strict mode, all other modules called by this would also be strict.
// But when testing if the strict mode is preserved, we must ensure that this module is NOT strict.

var expect = require("expect.js"),
    fs = require("fs"),
    path = require("path");

var rewire;

describe("rewire", function () {
    before(function () {
        var fakeNodeModules = path.resolve(__dirname, "../testLib/fake_node_modules");

        if (fs.existsSync(fakeNodeModules)) {
            fs.renameSync(fakeNodeModules, path.resolve(__dirname, "../testLib/node_modules"));
        }
    });

    require("../testLib/sharedTestCases.js")();

    it("should also work with CoffeeScript", function () {
        var coffeeModule;

        rewire = require("../");
        coffeeModule = rewire("../testLib/module.coffee");
        coffeeModule.__set__("fs", {
            readFileSync: function () {
                return "It works!";
            }
        });
        expect(coffeeModule.readFileSync()).to.be("It works!");
    });

    it("should work with file types without loaders", function () {
        var jsxModule;

        rewire = require("../");
        jsxModule = rewire("../testLib/module.jsx");
        jsxModule.__set__("testModuleB", "Different Thing");
        expect(jsxModule.testModuleB()).to.be("Different Thing");

    });

    it("should NOT work with file types which do have loaders", function () {
        var tsModule;
        require.extensions['.ts'] = require.extensions['.js'];

        rewire = require("../");
        tsModule = rewire("../testLib/module.ts");
        tsModule.__set__("testModuleB", "Different Thing");
        expect(tsModule.testModuleB()).to.be("Different Thing");
    });
});
