var expect = require("expect.js"),
    getRewireRequires = require("../lib/bundlers/getRewireRequires.js");

describe("getRewireRequires", function () {
    it("should detect a single rewire()", function () {
        var src = "rewire('aaa/bbb/ccc.js');";

        expect(getRewireRequires(src)).to.eql(["aaa/bbb/ccc.js"]);
    });
    it("should detect multiple rewire()", function () {
        var src = "var aaa = rewire('aaa/bbb/ccc.js'); var bbb = rewire('bbb/ccc/ddd.js');";

        expect(getRewireRequires(src)).to.eql(["aaa/bbb/ccc.js", "bbb/ccc/ddd.js"]);

        src = "rewire('aaa/bbb/ccc.js'); rewire('bbb/ccc/ddd.js');";

        expect(getRewireRequires(src)).to.eql(["aaa/bbb/ccc.js", "bbb/ccc/ddd.js"]);
    });
});