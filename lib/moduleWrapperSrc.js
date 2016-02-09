var getImportGlobalsSrc = require("./getImportGlobalsSrc.js"),
    getDefinePropertySrc = require("./getDefinePropertySrc.js");

// We prepend a list of all globals declared with var so they can be overridden (without changing original globals)
var prelude = getImportGlobalsSrc();

// Wrap module src inside IIFE so that function declarations do not clash with global variables
// @see https://github.com/jhnns/rewire/issues/56
prelude += "(function () { ";

// We append our special setter and getter.
var appendix = "\n" + getDefinePropertySrc();

// End of IIFE
appendix += "})();";

var ModuleWrapper = {
  prelude: prelude,
  appendix: appendix
};

module.exports = ModuleWrapper;
