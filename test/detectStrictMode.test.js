var expect = require("expect.js"),
    detectStrictMode = require("../lib/detectStrictMode.js");

describe("detectStrictMode", function () {

    it("should detect all valid uses of \"use strict\";", function () {
        expect(detectStrictMode('"use strict";')).to.be(true);
        expect(detectStrictMode("'use strict';")).to.be(true);
        expect(detectStrictMode(' "use strict";')).to.be(true);
        expect(detectStrictMode('\n"use strict";')).to.be(true);
        expect(detectStrictMode('\r\n"use strict";')).to.be(true);
        expect(detectStrictMode('"use strict"\r\n')).to.be(true);
        expect(detectStrictMode('"use strict" ; test();')).to.be(true);
    });

    it("should be allowed to place comments before \"use strict\";", function () {
        expect(detectStrictMode('// some comment\n"use strict";')).to.be(true);
        expect(detectStrictMode('/* yo! */"use strict"; /* another comment */')).to.be(true);
        expect(detectStrictMode('   // yes yo\r\n\r\n\r\n   /*oh yoh*/\r\n//oh snap!\r /* yoh! */"use strict";')).to.be(true);
    });

    it("should not detect invalid uses of \"use strict\";", function () {
        expect(detectStrictMode('" use strict ";')).to.be(false);
        expect(detectStrictMode('"use strict".replace("use", "fail");')).to.be(false);
        expect(detectStrictMode('"use strict" .replace("use", "fail");')).to.be(false);
        expect(detectStrictMode(';"use strict";')).to.be(false);
    });

    it("should not detect \"use strict\"; if it occurs in some nested function", function () {
        expect(detectStrictMode('function () {"use strict";}')).to.be(false);
    });

});
