var path = require("path");

function RewiredNormalModuleFactory(factory) {
	this.factory = factory;
}

module.exports = RewiredNormalModuleFactory;

RewiredNormalModuleFactory.prototype.create = function(context, dependency, callback) {
	this.factory.create(context, dependency, function(err, module) {
		if(err) return callback(err);
		module.request += " rewired";
		module.userRequest += "(rewired)";
		module.loaders.unshift(path.join(__dirname, "RewireLoader.js"));
		return callback(null, module);
	});
};