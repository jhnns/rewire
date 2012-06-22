var vm = require("vm");

var mine = {};

mine.runInNewContext = vm.runInNewContext;

mine.runInNewContext("console.log('test');", {
    "console": console
});
