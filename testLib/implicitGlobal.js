implicitGlobal = "this is an implicit global var ..." +
    "yes, it's bad coding style but there are still some libs out there";

module.exports = function () {
    return undefinedImplicitGlobal;
};
