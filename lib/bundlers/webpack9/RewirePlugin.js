var path = require("path");
var ModuleAliasPlugin = require("enhanced-resolve/lib/ModuleAliasPlugin");
var RewiredNormalModuleFactory = require("./RewiredNormalModuleFactory");
var RewiredDependency = require("./RewiredDependency");

function RewirePlugin() {}
module.exports = RewirePlugin;

RewirePlugin.prototype.apply = function(compiler) {
	// wire our RewiredDependency to our RewiredNormalModuleFactory
	// by decorating the original factory
	compiler.plugin("compilation", function(compilation, params) {
		var normalModuleFactory = params.normalModuleFactory;
		var rewiredNormalModuleFactory = new RewiredNormalModuleFactory(normalModuleFactory);

		compilation.dependencyFactories.set(RewiredDependency, rewiredNormalModuleFactory);
		compilation.dependencyTemplates.set(RewiredDependency, new RewiredDependency.Template());
	});
	// accept "var rewire", elsewise it would not be parsed (as overwritten)
	compiler.parser.plugin("var rewire", function(expr) {
		return true;
	});
	// find rewire(request: String) calls and bind our RewiredDependency
	compiler.parser.plugin("call rewire", function(expr) {
		if(expr.arguments.length !== 1) return;
		var param = this.evaluateExpression(expr.arguments[0]);
		if(!param.isString()) return;
		var dep = new RewiredDependency(param.string, param.range);
		dep.loc = expr.loc;
		this.state.current.addDependency(dep);
		return true;
	});
	// alias the require("rewire") to a webpack rewire
	compiler.resolvers.normal.apply(new ModuleAliasPlugin({
		rewire: path.join(__dirname, "rewire.js")
	}));
};