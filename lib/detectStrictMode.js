/**
 * Returns true if the source code is intended to run in strict mode. Does not detect
 * "use strict" if it occurs in a nested function.
 *
 * @param {!String} src
 * @return {Boolean}
 */
function detectStrictMode(src) {
    return (/^\s*"use strict";/g).test(src);
}

module.exports = detectStrictMode;