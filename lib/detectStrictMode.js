function detectStrictMode(src) {
    return (/^\s*"use strict";/g).test(src);
}

module.exports = detectStrictMode;