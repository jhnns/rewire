"use strict"; // run code in ES5 strict mode

/**
 * Returns the source code that will leak private vars.
 *
 * e.g.:
 * "module.exports.__ = {myPrivateVar: myPrivateVar};"
 *
 * @param {Array<String>} leaks
 * @return {String}
 */
function getLeakingSrc(leaks) {
    var src = "module.exports.__ = {",
        varName,
        i;

    for (i = 0; i < leaks.length; i++) {
        varName = leaks[i];
        src += (varName + ":" + varName + ",");
    }
    if (i > 0) {
        src = src.slice(0, -1); // trim last comma
    }
    src += "};";

    return src;
}

module.exports = getLeakingSrc;
