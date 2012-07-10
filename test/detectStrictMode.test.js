var expect = require("expect.js"),
    detectStrictMode = require("../lib/detectStrictMode.js");

describe("detectStrictMode", function () {
    it("should detect \"use strict\"; at the beginning of a string and ignore all whitespace before", function () {
        expect(detectStrictMode('"use strict";')).to.be(true);
        expect(detectStrictMode('      "use strict";')).to.be(true);
        expect(detectStrictMode('  \n "use strict";')).to.be(true);
    });
    it("should not detect \"use strict\"; if it occurs in some nested function", function () {
        expect(detectStrictMode('function () {"use strict";}')).to.be(false);
    });
});