"use strict"; // run code in ES5 strict mode

var rewire = require("./rewire.js");

module.exports = function (request, mocks, injections, leaks, cache) {
    delete require.cache[__filename];   // deleting self from module cache so the parent module is always up to date

    if (cache === undefined) {
        cache = true;
    }

    return rewire(module.parent, request, mocks, injections, leaks, cache);
};