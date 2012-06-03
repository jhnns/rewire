"use strict"; // run code in ES5 strict mode

var path = require("path"),

    // different ways to require a module
    fs = require("fs"),     // native module
    c = require("../C/moduleC.js"),     // relative path
    b = require(path.resolve(__dirname, "../B/moduleB.js")),    // absolute path
    toSrc = require("toSrc"),   // node_modules path
    index = require("../");     // index.js path

var myPrivateVar = "Hello I'm very private";

// expose all required modules to test for mocks
exports.fs = fs;
exports.b = b;
exports.c = c;
exports.toSrc = toSrc;
exports.index = index;
exports.process = process;
exports.console = console;