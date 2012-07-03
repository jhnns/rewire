var expect = require("expect.js"),
    __set__ = require("../lib/__set__.js"),
    vm = require("vm"),

    expectReferenceError = expectError(ReferenceError),
    expectTypeError = expectError(TypeError);

function expectError(ErrConstructor) {
    return function expectReferenceError(err) {
        expect(err.constructor.name === ErrConstructor.name).to.be(true);
    };
}

describe("__set__", function () {
    var moduleFake;

    beforeEach(function () {
        moduleFake = {
            myNumber: 0,    // copy by value
            myObj: {},       // copy by reference

            // these variables are used within the set method
            // because there is a eval() statement within the set method
            // these variables should not override same-named vars of the module
            key: "key",
            env: "env",
            src: "src"
        };

        vm.runInNewContext(
            "__set__ = " + __set__.toString() + "; " +
            "getNumber = function () { return myNumber; }; " +
            "getObj = function () { return myObj; }; ",
            moduleFake
        );
    });
    it("should set the new number when calling with varName, varValue", function () {
        expect(moduleFake.getNumber() === 0).to.be(true);
        moduleFake.__set__("myNumber", 2);
        expect(moduleFake.getNumber() === 2).to.be(true);
    });
    it("should set the new object when calling with varName, varValue", function () {
        var newObj = { hello: "hello" };

        expect(moduleFake.getObj()).to.eql({});
        moduleFake.__set__("myObj", newObj);
        expect(moduleFake.getObj() === newObj).to.be(true);
    });
    it("should set the new number and the new obj when calling with an env-obj", function () {
        var newObj = { hello: "hello" };

        expect(moduleFake.getNumber() === 0).to.be(true);
        expect(moduleFake.getObj()).to.eql({});
        moduleFake.__set__({
            myNumber: 2,
            myObj: newObj
        });
        expect(moduleFake.getNumber() === 2).to.be(true);
        expect(moduleFake.getObj() === newObj).to.be(true);
    });
    it("should return undefined", function () {
        expect(moduleFake.__set__("myNumber", 4) === undefined).to.be(true);
    });
    it("should throw a ReferenceError when trying to set non-existing vars", function () {
        expect(function () {
            moduleFake.__set__("notExisting", 3);
        }).to.throwException();
        expect(function () {
            moduleFake.__set__({
                notExisting: "bla",
                notExistingAsWell: "blabla"
            });
        }).to.throwException(expectReferenceError);
    });
    it("should throw a TypeError when passing misfitting params", function () {
        expect(function () {
            moduleFake.__set__();
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(undefined);
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(null);
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(true);
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(2);
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__("");
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(function () {});
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__({}, true);   // misfitting number of params
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__("someVar");  // misfitting number of params
        }).to.throwException(expectTypeError);
    });
});