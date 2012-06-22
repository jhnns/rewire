var fs = require("fs"),
    pathUtil = require("path"),
    nodeModulesDir = pathUtil.resolve(__dirname, "../../node_modules");

module.exports = function removeFakePackageJSON(done) {
    fs.unlink(nodeModulesDir + "/rewire/package.json", function onPackageJSONUnlink() {
        fs.rmdir(nodeModulesDir + "/rewire", done);
    });
};