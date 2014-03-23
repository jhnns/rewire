var expect = require("expect.js"),
    fs = require("fs"),
    path = require("path"),
    __setRequiredModule__ = require("../lib/__setRequiredModule__.js"),
    __unsetRequiredModule__ = require("../lib/__unsetRequiredModule__.js"),
    vm = require("vm");

describe("__setRequiredModule__/__unsetRequiredModule__", function () {
    var requiringModuleFilename = path.join(__dirname, "testModules", "requiringModule.js");
    var realRequiringModule = require(requiringModuleFilename);
    var requiringModule;

    var requireReal = function (key) {
        if (/mockModule/.test(key)) {
            throw new Error('no such module');
        }
        return realRequiringModule.getRequire()(key);
    };

    beforeEach(function () {
        var src = fs.readFileSync(requiringModuleFilename);
        src += "__setRequiredModule__ = " + __setRequiredModule__.toString() + ";";
        src += "__unsetRequiredModule__ = " + __unsetRequiredModule__.toString() + ";";

        requiringModule = {};
        requiringModule.require = requireReal;
        requiringModule.module = { exports: requiringModule };
        requiringModule.exports = requiringModule.module.exports;
        requiringModule.console = console;
        requiringModule.__filename = requiringModuleFilename;
        requiringModule.__dirname = path.dirname(requiringModuleFilename);
        vm.runInNewContext(src, requiringModule);
    });

    describe('__setRequiredModule__', function () {
        it("should set a mock installed module for future require() calls", function () {
            expect(requiringModule.getInstalledModule).to.throwException();

            var mockModule = {};
            requiringModule.__setRequiredModule__("mockModule", mockModule);
            expect(requiringModule.getInstalledModule()).to.be(mockModule);
        });

        it("should set a mock file module for future require() calls", function () {
            expect(requiringModule.getFileModule).to.throwException();

            var mockModule = {};
            requiringModule.__setRequiredModule__("./mockModule.js", mockModule);
            expect(requiringModule.getFileModule()).to.be(mockModule);
        });
    });

    describe('__unsetRequiredModule__', function () {
        it("should unset a mock installed module", function () {
            expect(requiringModule.getInstalledModule).to.throwException();

            var mockModule = {};
            requiringModule.__setRequiredModule__("mockModule", mockModule);
            expect(requiringModule.getInstalledModule()).to.be(mockModule);

            requiringModule.__unsetRequiredModule__("mockModule");
            expect(requiringModule.getInstalledModule).to.throwException();
        });

        it("should unset a mock file module", function () {
            expect(requiringModule.getFileModule).to.throwException();

            var mockModule = {};
            requiringModule.__setRequiredModule__("./mockModule.js", mockModule);
            expect(requiringModule.getFileModule()).to.be(mockModule);

            requiringModule.__unsetRequiredModule__("./mockModule.js");
            expect(requiringModule.getFileModule).to.throwException();
        });
    });
});

