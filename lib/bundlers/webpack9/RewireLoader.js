var __get__ = require("../../__get__.js"),
	__set__ = require("../../__set__.js"),
	getImportGlobalsSrc = require("../../getImportGlobalsSrc.js"),
	detectStrictMode = require("../../detectStrictMode.js");

module.exports = function(src) {
	// append at least a newline, the source may end with a line comment
	var prepend, append = "\n";

	// We prepend a list of all globals declared with var so they can be overridden (without changing original globals)
	prepend = getImportGlobalsSrc();

	// We append our special setter and getter.
	append += "module.exports.__set__ = " + __set__.toString() + "; ";
	append += "module.exports.__get__ = " + __get__.toString() + "; ";

	// Check if the module uses the strict mode.
	// If so we must ensure that "use strict"; stays at the beginning of the module.
	if (detectStrictMode(src) === true) {
		prepend = ' "use strict"; ' + prepend;
	}

	// Let the show begin
	return prepend + src + append;
};