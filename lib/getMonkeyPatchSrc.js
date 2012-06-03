"use strict"; // run code in ES5 strict mode

var toSrc = require("toSrc");

function getMonkeyPatchSrc(obj) {
    function walkObj(obj, level) {
        var key,
            value,
            src = "";

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                value = obj[key];
                if (typeof value === "object" && Array.isArray(value) === false) {
                    src += key + ".";
                    src += walkObj(value, level + 1);
                } else {
                    if (level === 0) {
                        src += "var ";   // in the top level, we need a var statement to override variables
                    }
                    src += key + "=" + toSrc(value, 9999) + ";";
                }
            }
        }


        return src;
    }

    return walkObj(obj, 0);
}

module.exports = getMonkeyPatchSrc;