var RewirePlugin = require("../../../lib/bundlers/webpack9/RewirePlugin");
module.exports = {
	entry: "mocha!./webpackTests.js",
	module: {
		loaders: [{
			test: /\.css$/,
			loader: "style-loader!css-loader"
		}]
	},
	plugins: [
		new RewirePlugin()
	]
};