"use strict"; // run code in ES5 strict mode

// Add a breakpoint on line 6 and on line 11 and debug "debug.test.js" to test if the IDE stops at these points.
// Watch also the variable someVar that is injected by rewire. It will be undefined at this point because
// all injections are executed at the end of the module.
// It's already visible because of hoisting: http://net.tutsplus.com/tutorials/javascript-ajax/quick-tip-javascript-hoisting-explained/)
var someNumber = 0;

module.exports = function () {
    // In this line someVar will be defined.
    someNumber++;
    someVar;
};