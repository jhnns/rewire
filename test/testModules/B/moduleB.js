"use strict"; // run code in ES5 strict mode

var c = require("../C/moduleC.js");

exports.requireIndex = function () {    // necessary to avoid circular dependency
    exports.index = require("../index.js");
};