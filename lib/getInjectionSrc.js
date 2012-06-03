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
                if (level === 0) {
                    src += "var ";   // on the top level, we need a var statement to override variables
                }
                src += key + "=" + toSrc(value, 9999) + ";";
            }
        }


        return src;
    }

    return walkObj(obj, 0);
}

module.exports = getMonkeyPatchSrc;