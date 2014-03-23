
exports.getRequire = function () {
    return require;
};

exports.getInstalledModule = function () {
    return require("mockModule");
};

exports.getFileModule = function () {
    return require("./mockModule.js");
};
