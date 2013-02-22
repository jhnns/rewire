/* rewire module loader */

module.exports = function rewire(module) {
	var rewiredModule = {
		id: module,
		loaded: false,
		exports: {}
	};
	__webpack_modules__[module].call(null, rewiredModule, rewiredModule.exports, __webpack_require__);
	rewiredModule.loaded = true;
	return rewiredModule.exports;
};