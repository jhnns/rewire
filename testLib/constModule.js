const someOtherModule = require("./someOtherModule");
const language = "nl";

module.exports.getLang = () => {
    return language;
}

exports.getOtherModuleName = () => {
    return someOtherModule.name;
}

exports.filename = __filename;
exports.dirname = __dirname;
