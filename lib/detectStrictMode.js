var multiLineComment = /^\s*\/\*.*?\*\//;
var singleLineComment = /^\s*\/\/.*?[\r\n]/;
var strictMode = /^\s*(?:"use strict"|'use strict')[ \t]*(?:[\r\n]|;)/;

/**
 * Returns true if the source code is intended to run in strict mode. Does not detect
 * "use strict" if it occurs in a nested function.
 *
 * @param {String} src
 * @return {Boolean}
 */
function detectStrictMode(src) {
    var singleLine;
    var multiLine;

    while ((singleLine = singleLineComment.test(src)) || (multiLine = multiLineComment.test(src))) {
        if (singleLine) {
            src = src.replace(singleLineComment, "");
        }
        if (multiLine) {
            src = src.replace(multiLineComment, "");
        }
    }

    return strictMode.test(src);
}

module.exports = detectStrictMode;
