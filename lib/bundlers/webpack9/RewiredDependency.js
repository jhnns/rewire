var ModuleDependency = require("webpack/lib/dependencies/ModuleDependency");

function RewiredDependency(request, range) {
	ModuleDependency.call(this, request);
	this.Class = RewiredDependency;
	this.range = range;
}
module.exports = RewiredDependency;

RewiredDependency.prototype = Object.create(ModuleDependency.prototype);
RewiredDependency.prototype.type = "rewire";

RewiredDependency.Template = require("webpack/lib/dependencies/ModuleDependencyTemplateAsId");
