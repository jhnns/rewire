"use strict"; // run code in ES5 strict mode

var path = require("path");

function webpackPostProcessor(filename, callback) {
    // Convert back slashes to normal slashes on windows.
    if (path.sep !== "/") {
        filename = filename.split(path.sep).join("/");
    }

    if (filename.indexOf("/rewire/lib/index.js") !== -1) {
        filename = __dirname + "/webpackRewire.js";
    }

    callback(null, filename);
}

module.exports = webpackPostProcessor;