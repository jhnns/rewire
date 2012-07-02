/**
 * This code gets injected at the end of the browserify bundle via b.append().
 */

if (typeof window.browserifyRequire === "undefined") {
    // Saves the browserifyRequire under a new name. Necessary to call the original browserifyRequire within
    // a module where the variable name "require" is overridden by the module's internal require.
    window.browserifyRequire = require;
} else {
    throw new Error("(rewire/browserify) Naming collision detected: window.browserifyRequire seems to be occupied.");
}

