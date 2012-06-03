"use strict"; // run code in ES5 strict mode

var trick = require("./trick.js");

module.exports = function (request, mocks, injections, leaks, cache) {
    delete require.cache[__filename];   // deleting self from module cache so the parent module is always up to date

    if (cache === undefined) {
        cache = true;
    }

    return trick(module.parent, request, mocks, injections, leaks, cache);
};