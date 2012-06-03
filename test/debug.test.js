"use strict"; // run code in ES5 strict mode

var rewire = require("../lib/index.js");

// add breakpoints in testModules/debuggerModule.js and debug this file with your IDE to
// check if debugging works with rewire.
var debuggerModule = rewire("./testModules/debuggerModule.js", null, {
    someVar: "Look if you can see me in your IDE when holding at the breakpoints"
});

debuggerModule();